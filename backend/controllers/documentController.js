import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';
//@desc Upload PDF Document
//@route POST/api/document/upload
//@access private
export const uploadDocument = async(req, res, next)=>{
  try{
        if(!req.file){
          return res.status(400).json({
             success:false,
             error:'please upload a PDF file',
             statusCode:400,
          });
        }
        const {title}= req.body;
      if(!title){
        //delete uploaded file if no title provided
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success:false,
          error:'please provide document title',
          statusCode:400
        });
      }
//construct the url for the upload file
     const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
     const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;
       
     const document = await Document.create({
      userId: req.user._id,
      title,
      fileName:req.file.originalname,
      filepath:fileUrl,//store the Url insted of the local path
      fileSize: req.file.size,
      status:"processing"
     });
     //process PDF in background(in production use queue like Bull)
     processPDF(document._id,req.file.path).catch(err=>{
      console.error('pdf processing error:',err);

     });
     res.status(201).json({
      success:true,
        data:document,
        message:'Document uploaded successfully.processing in process...'
     })
  }
  catch(error){
    if(req.file){
      await fs.unlink(req.file.path).catch(()=>{});
    }
    next(error);
  }
};
//  Helper function to process PDF
const processPDF = async(documentId ,filePath)=>{
    try{
      const {text}= await extractTextFromPDF(filePath);
        //create Chunk
        const chunks = chunkText(text,500,50);
        //update document
        await Document.findByIdAndUpdate(documentId,{
          extractedText : text,
          chunks: chunks,
          status:'ready'

        });
        console.log(`Document ${documentId}processed successfully`);
    }
    catch(error){
      console.error(`Error processing document ${documentId}:`,error);
      await Document.findByIdAndUpdate(documentId,{
        status:'error'
      });
    }
};



//@desc get all user documents
//@route Get /api/documents
//@access private
export const getDocuments =async(req, res, next)=>{
    try{
      const documents  = await Document.aggregate([
       {
         $match :{userId: new mongoose.Types.ObjectId(req.user._id)}
        }
      ,{
        $lookup:{
          from:'flashcards',
          localField:'_id',
          foreignField:'documentId',
          as:'flashcardSets'
        }
      },{
        $lookup:{
          from:'quizzes',
          localField:'_id',
          foreignField:'documentId',
          as:'quizzes'
        }
      },{
        $addFields:{
          flashcardCount:{$size: '$flashcardSets'},
          quizCount:{$size:'$quizzes'}
        }
      },{
        $project:{
          extractedText: 0,
          chunks: 0,
          flashcardSets:0,
          quizzes :0
        }
      },{
        $sort:{uploadDate:-1}
      }
        ]);
      res.status(201).json({
        success:true,
        count:documents.length,
        data:documents  

      })
  }
  catch(error){
    next(error);
  }
};
//@desc Get single document with chunck
//@route Get /api/documents/:id
//@access private
 export const getDocument=async(req, res, next)=>{
     try{
       const  document  = await Document.findOne({
           _id: req.params.id,
           userId:req.user._id
       });
       if(!document){
        return res.status(404).json({
          success: false,
          error: "Document Not found",
          statusCode:404
        });

       }
       //get the count flashcards and quizzess
       const flashcardCount = await Flashcard.countDocuments({documentId:document._id, userId:req.user._id});
        const quizCount = await Quiz.countDocuments({documentId:document._id, userId:req.user._id});

        //update last access
        document.lastAccessed = Date.now();
         await document.save();

         //combine document data with counts
         const documentData =   document.toObject();
         documentData.flashcardCount = flashcardCount;
         documentData.quizCount = quizCount;
         
         res.status(200).json({
          success: true,
          data: documentData,

         });
  }catch(error){
    next(error);
  }
 };
 //@desc delete Document
 //@route delete /api/documents/:id
 //@access privete
 export const deleteDocument=async(req, res, next)=>{
     try{
      const  document  = await Document.findOne({
           _id: req.params.id,
           userId:req.user._id
       });
       if(!document){
        return res.status(404).json({
          success: false,
          error: "Document Not found",
          statusCode:404
        });

       }
       //delete the file feom filesystem
       await  fs.unlink(document.filepath).catch(()=>{});

       //delete document
       document.deleteOne();
        res.status(200).json({
          success: true,
          message:"Document delete successfully",
        });
        
  }
  catch(error){
    next(error);
  }
 };
 