import { useState, useEffect, useCallback } from 'react';
import documentService from '../services/documentService.js';

// Hook for managing documents for an application
export const useDocuments = (applicationId, autoFetch = true) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  // Fetch documents for application
  const fetchDocuments = useCallback(async () => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await documentService.getApplicationDocuments(applicationId);
      setDocuments(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Upload document
  const uploadDocument = async (documentType, file) => {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    setError(null);
    
    try {
      // Validate file before upload
      documentService.validateFile(file);

      // Set upload progress
      setUploadProgress(prev => ({
        ...prev,
        [documentType]: { status: 'uploading', progress: 0 }
      }));

      const response = await documentService.uploadDocument(applicationId, documentType, file);
      
      // Update progress to complete
      setUploadProgress(prev => ({
        ...prev,
        [documentType]: { status: 'completed', progress: 100 }
      }));

      // Refresh documents list
      await fetchDocuments();

      return response;
    } catch (err) {
      // Update progress to error
      setUploadProgress(prev => ({
        ...prev,
        [documentType]: { status: 'error', progress: 0 }
      }));
      
      setError(err.message);
      throw err;
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await documentService.deleteDocument(documentId);
      
      // Remove document from local state
      setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear upload progress for a document type
  const clearUploadProgress = (documentType) => {
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[documentType];
      return updated;
    });
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && applicationId) {
      fetchDocuments();
    }
  }, [autoFetch, applicationId, fetchDocuments]);

  return {
    documents,
    loading,
    error,
    uploadProgress,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    clearUploadProgress,
    clearError
  };
};

// Hook for document validation and utilities
export const useDocumentValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});

  // Validate file
  const validateFile = (file) => {
    try {
      documentService.validateFile(file);
      return { isValid: true, error: null };
    } catch (err) {
      return { isValid: false, error: err.message };
    }
  };

  // Validate multiple files
  const validateFiles = (files) => {
    const errors = {};
    let hasErrors = false;

    Object.entries(files).forEach(([documentType, file]) => {
      if (file) {
        const validation = validateFile(file);
        if (!validation.isValid) {
          errors[documentType] = validation.error;
          hasErrors = true;
        }
      }
    });

    setValidationErrors(errors);
    return { isValid: !hasErrors, errors };
  };

  // Clear validation errors
  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  // Get file size in human readable format
  const getFileSize = (bytes) => {
    return documentService.getFileSize(bytes);
  };

  // Check if file is an image
  const isImageFile = (file) => {
    return documentService.isImageFile(file);
  };

  // Check if file is a PDF
  const isPDFFile = (file) => {
    return documentService.isPDFFile(file);
  };

  // Get document type display name
  const getDocumentTypeDisplayName = (documentType) => {
    return documentService.getDocumentTypeDisplayName(documentType);
  };

  // Get verification status display name
  const getVerificationStatusDisplayName = (status) => {
    return documentService.getVerificationStatusDisplayName(status);
  };

  // Get verification status color
  const getVerificationStatusColor = (status) => {
    return documentService.getVerificationStatusColor(status);
  };

  // Check if document is verified
  const isDocumentVerified = (status) => {
    return documentService.isDocumentVerified(status);
  };

  // Check if document is rejected
  const isDocumentRejected = (status) => {
    return documentService.isDocumentRejected(status);
  };

  return {
    validationErrors,
    validateFile,
    validateFiles,
    clearValidationErrors,
    getFileSize,
    isImageFile,
    isPDFFile,
    getDocumentTypeDisplayName,
    getVerificationStatusDisplayName,
    getVerificationStatusColor,
    isDocumentVerified,
    isDocumentRejected
  };
};

// Hook for managing document requirements
export const useDocumentRequirements = (applicationType) => {
  const [requiredDocuments, setRequiredDocuments] = useState([]);

  // Get required document types for application
  const getRequiredDocuments = useCallback(() => {
    if (!applicationType) return [];
    
    const required = documentService.getRequiredDocumentTypes(applicationType);
    setRequiredDocuments(required);
    return required;
  }, [applicationType]);

  // Check if all documents are uploaded
  const areAllDocumentsUploaded = (uploadedDocuments) => {
    return documentService.areAllDocumentsUploaded(requiredDocuments, uploadedDocuments);
  };

  // Get missing documents
  const getMissingDocuments = (uploadedDocuments) => {
    return documentService.getMissingDocuments(requiredDocuments, uploadedDocuments);
  };

  // Get upload completion percentage
  const getUploadCompletion = (uploadedDocuments) => {
    if (requiredDocuments.length === 0) return 0;
    
    const uploadedCount = uploadedDocuments.filter(doc => 
      requiredDocuments.includes(doc.document_type)
    ).length;
    
    return Math.round((uploadedCount / requiredDocuments.length) * 100);
  };

  // Auto-update when application type changes
  useEffect(() => {
    getRequiredDocuments();
  }, [getRequiredDocuments]);

  return {
    requiredDocuments,
    getRequiredDocuments,
    areAllDocumentsUploaded,
    getMissingDocuments,
    getUploadCompletion
  };
};

// Hook for file preview functionality
export const useFilePreview = () => {
  const [previewUrls, setPreviewUrls] = useState({});

  // Create preview URL for file
  const createPreview = (file, documentType) => {
    const url = documentService.createPreviewURL(file);
    if (url) {
      setPreviewUrls(prev => ({
        ...prev,
        [documentType]: url
      }));
    }
    return url;
  };

  // Remove preview URL
  const removePreview = (documentType) => {
    const url = previewUrls[documentType];
    if (url) {
      documentService.cleanupPreviewURL(url);
      setPreviewUrls(prev => {
        const updated = { ...prev };
        delete updated[documentType];
        return updated;
      });
    }
  };

  // Cleanup all preview URLs
  const cleanupAllPreviews = () => {
    Object.values(previewUrls).forEach(url => {
      documentService.cleanupPreviewURL(url);
    });
    setPreviewUrls({});
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAllPreviews();
    };
  }, []);

  return {
    previewUrls,
    createPreview,
    removePreview,
    cleanupAllPreviews
  };
};

// Hook for drag and drop file handling
export const useFileDrop = (onFilesDrop, acceptedTypes = []) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    
    // Filter files by accepted types if specified
    const filteredFiles = acceptedTypes.length > 0 
      ? files.filter(file => acceptedTypes.includes(file.type))
      : files;

    if (filteredFiles.length > 0 && onFilesDrop) {
      onFilesDrop(filteredFiles);
    }
  };

  const dropHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };

  return {
    isDragOver,
    dropHandlers
  };
}; 