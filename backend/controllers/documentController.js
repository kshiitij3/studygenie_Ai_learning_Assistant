import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import { Readable } from 'node:stream';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

const isRemoteHttpUrl = (value) => /^https?:\/\//i.test(value || '');

const buildCloudinaryPreviewUrl = (fileUrl) => {
  try {
    const url = new URL(fileUrl);

    if (!url.pathname.includes('/upload/')) {
      return null;
    }

    url.pathname = url.pathname.replace('/upload/', '/upload/pg_1,f_jpg/');
    url.pathname = url.pathname.replace(/\.pdf$/i, '.jpg');

    return url.toString();
  } catch {
    return null;
  }
};

const streamRemoteResponse = (remoteResponse, res, next, filename, fallbackContentType = 'application/octet-stream') => {
  if (!remoteResponse.ok || !remoteResponse.body) {
    return false;
  }

  const contentType = remoteResponse.headers.get('content-type') || fallbackContentType;
  const canPreview = contentType.includes('pdf') || contentType.startsWith('image/');

  if (!canPreview) {
    return false;
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${encodeURIComponent(filename)}"`
  );
  res.setHeader('Cache-Control', 'private, no-store');

  const stream = Readable.fromWeb(remoteResponse.body);
  stream.on('error', next);
  stream.pipe(res);
  return true;
};

const uploadPdfToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_DOCUMENT_FOLDER || 'ai-learning-assistant/documents',
        resource_type: 'image',
        filename_override: file.originalname,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

// @desc Upload PDF document
// @route POST/api/documents/upload
// @access Private
export const uploadDocument = async (req, res, next) => {
  let uploadedFile;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF file',
        statusCode: 400
      });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a document title',
        statusCode: 400
      });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary is not configured',
        statusCode: 500
      });
    }

    uploadedFile = await uploadPdfToCloudinary(req.file);

    // Create document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filepath: uploadedFile.secure_url,
      cloudinaryPublicId: uploadedFile.public_id,
      cloudinaryResourceType: uploadedFile.resource_type,
      fileSize: req.file.size,
      status: 'processing'
    });

    // Process PDF in background (in production, use a queue like Bull)
    processPDF(document._id, req.file.buffer).catch(err => {
      console.error('PDF processing error: ', err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully, Processing in progress...'
    });
  } catch (error) {
    if (uploadedFile?.public_id) {
      await cloudinary.uploader.destroy(uploadedFile.public_id, {
        resource_type: uploadedFile.resource_type || 'image'
      }).catch(() => {});
    }

    next(error);
  }
};

// Helper function to process PDF
const processPDF = async (documentId, pdfBuffer) => {
  try {
    const { text } = await extractTextFromPDF(pdfBuffer);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: 'ready'
    });

    console.log(`Document ${documentId} processed successfully`);

  } catch(error) {
      console.error(`Error processing document ${documentId}:`, error);

      await Document.findByIdAndUpdate(documentId, {
        status: 'failed'
      });
  }
}

// @desc Get all user documents
// @route GET/api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents  =await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id)}
      },
      {
        $lookup: {
            from: 'flashcards',
            localField: '_id',
            foreignField: 'documentId',
            as: 'flashcardSets'
         }
      },
      {
        $lookup: {
            from: 'quizzes',
            localField: '_id',
            foreignField: 'documentId',
            as: 'quizzes'
         }
      },
      {
        $addFields: {
          flashcardCount: { $size: '$flashcardSets'},
          quizCount: {$size: '$quizzes'}
        }
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0
        }
      },
      {
        $sort: { uploadDate: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (error) {
  
    next(error);
  }
};

// @desc single document with chunks
// @route GET/api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id

    });

    if(!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404
      });
    }

    // Get counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id});
    const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id});

    // Update last accessed
    document.lateAccessed = Date.now();
    await document.save();

    // Combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData
    });

  } catch (error) {
    next(error);
  }
};

// @desc Delete document
// @route DELETE/api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
  try {
     const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
     });

    if(!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404
      });
    }

    if (document.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
        resource_type: document.cloudinaryResourceType || 'image'
      }).catch(() => {});
    } else if (document.filepath && !document.filepath.startsWith('http')) {
      await fs.unlink(document.filepath).catch(() => {});
    }

    // Delete document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
  
    next(error);
  }
};

// @desc Get document PDF file
// @route GET/api/documents/:id/file
// @access Private
export const getDocumentFile = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404
      });
    }

    if (!document.filepath) {
      return res.status(404).json({
        success: false,
        error: 'Document file not available',
        statusCode: 404
      });
    }

    if (isRemoteHttpUrl(document.filepath)) {
      const filename = document.fileName || `${document.title}.pdf`;
      let remoteResponse = null;

      try {
        remoteResponse = await fetch(document.filepath);
      } catch {
        remoteResponse = null;
      }

      if (remoteResponse && streamRemoteResponse(remoteResponse, res, next, filename, 'application/pdf')) {
        return;
      }

      const previewUrl = buildCloudinaryPreviewUrl(document.filepath);

      if (previewUrl) {
        let previewResponse = null;

        try {
          previewResponse = await fetch(previewUrl);
        } catch {
          previewResponse = null;
        }

        if (previewResponse && streamRemoteResponse(previewResponse, res, next, filename, 'image/jpeg')) {
          return;
        }
      }

      return res.status(502).json({
        success: false,
        error: 'Unable to fetch document preview',
        statusCode: 502
      });
    }

    return res.sendFile(document.filepath, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
