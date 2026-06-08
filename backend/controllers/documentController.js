import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads/documents');

const resolveDocumentFilePath = (document) => {
  const storedPath = document?.filepath;

  if (!storedPath) {
    return null;
  }

  if (path.isAbsolute(storedPath)) {
    return storedPath;
  }

  if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
    try {
      const url = new URL(storedPath);
      const localHost = `http://localhost:${process.env.PORT || 8000}`;
      const altLocalHost = `https://localhost:${process.env.PORT || 8000}`;

      if (storedPath.startsWith(localHost) || storedPath.startsWith(altLocalHost)) {
        const filename = decodeURIComponent(path.basename(url.pathname));
        return path.join(uploadDir, filename);
      }
    } catch {
      return null;
    }
    return null;
  }

  const filename = decodeURIComponent(path.basename(storedPath));
  return path.join(uploadDir, filename);
};

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

      if (!isCloudinaryConfigured) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(500).json({
          success: false,
          error: 'Cloudinary is not configured',
          statusCode: 500
        });
      }

      let cloudinaryResult;
      try {
        cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'raw',
          folder: 'studygenie/documents',
          public_id: `studygenie-doc-${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
        });
      } catch (cloudError) {
        await fs.unlink(req.file.path).catch(() => {});
        console.error('Cloudinary upload failed:', cloudError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload document to Cloudinary',
          statusCode: 500
        });
      }

      let document;
      try {
        document = await Document.create({
          userId: req.user._id,
          title,
          fileName: req.file.originalname,
          filepath: cloudinaryResult.secure_url,
          cloudinaryPublicId: cloudinaryResult.public_id,
          fileSize: req.file.size,
          status: 'processing'
        });
      } catch (dbError) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: 'raw' }).catch(() => {});
        await fs.unlink(req.file.path).catch(() => {});
        return next(dbError);
      }

      // process PDF in background (extract text, create chunks)
      processPDF(document._id, req.file.path).catch(err => {
        console.error('pdf processing error:', err);
      });

      res.status(201).json({
        success:true,
        data:document,
        message:'Document uploaded to Cloudinary successfully. Processing in progress...'
      });
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
        console.log(`Document ${documentId} processed successfully`);
    }
    catch(error){
      console.error(`Error processing document ${documentId}:`,error);
      await Document.findByIdAndUpdate(documentId,{
        status:'error'
      }).catch(err => console.error('Failed to update document status:', err));
    } finally {
      await fs.unlink(filePath).catch(() => {});
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
 //@desc View PDF file
 //@route Get /api/documents/:id/file
 //@access private
 export const getDocumentFile = async(req, res, next)=>{
     try{
       const document = await Document.findOne({
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

       const filePath = resolveDocumentFilePath(document);

       if (!filePath) {
         if (document.filepath && (document.filepath.startsWith('http://') || document.filepath.startsWith('https://'))) {
           return res.redirect(document.filepath);
         }

         return res.status(404).json({
           success: false,
           error: "PDF file not found",
           statusCode:404
         });
       }

       await fs.access(filePath);
       res.setHeader('Content-Type', 'application/pdf');
       res.setHeader('Content-Disposition', `inline; filename="${document.fileName.replace(/"/g, '')}"`);
       return res.sendFile(filePath);
     }catch(error){
       if(error.code === 'ENOENT'){
        return res.status(404).json({
          success:false,
          error:'PDF file not found on server',
          statusCode:404
        });
       }
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

       if (document.cloudinaryPublicId) {
         try {
           await cloudinary.uploader.destroy(document.cloudinaryPublicId, { resource_type: 'raw' });
         } catch (cloudError) {
           console.error('Cloudinary deletion failed:', cloudError);
         }
       }

       // Resolve local file path from stored URL for legacy/local files
       const filePath = resolveDocumentFilePath(document);
       if (filePath) {
         await fs.unlink(filePath).catch(()=>{});
       }

       await document.deleteOne();
        res.status(200).json({
          success: true,
          message:"Document deleted successfully",
        });
        
  }
  catch(error){
    next(error);
  }
 };
 
