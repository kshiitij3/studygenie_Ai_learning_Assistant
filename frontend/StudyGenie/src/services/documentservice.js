import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const parseBlobError = async (payload) => {
  if (payload instanceof Blob && payload.type.includes('application/json')) {
    try {
      const text = await payload.text();
      return JSON.parse(text);
    } catch {
      return { message: 'Failed to fetch document file' };
    }
  }

  return payload;
};

const getDocuments = async () => {
   try {
     const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
     return response.data?.data;
   } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch documents' };
   }
};

const uploadDocument = async (formData) => {
   try {
     const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
     return response.data;
   } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || 'Failed to upload document';
    throw { message };
   }
};

const deleteDocument = async (id) => {
   try {
     const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
     return response.data;
   } catch (error) {
    throw error.response?.data || { message: 'Failed to delete documents' };
   }
};

const getDocumentById = async (id) => {
   try {
     const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
     return response.data;
   } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch document details' };
   }
};

const getDocumentFile = async (id) => {
   try {
     const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_FILE(id), {
      responseType: 'blob',
    });

     return response.data;
   } catch (error) {
    const errorData = error.response?.data ? await parseBlobError(error.response.data) : null;
    throw errorData || { message: 'Failed to fetch document file' };
   }
};

const documentService = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentById,
  getDocumentFile,
};

export default documentService;
