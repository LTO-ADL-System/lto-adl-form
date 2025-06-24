import apiService from './api.js';

class DocumentService {
  // Upload document file
  async uploadDocument(applicationId, documentType, file) {
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('document_type', documentType);
    formData.append('file', file);

    const response = await apiService.uploadFile('/documents/upload', formData);
    return response;
  }

  // Get all documents for an application
  async getApplicationDocuments(applicationId) {
    const response = await apiService.get(`/documents/application/${applicationId}`);
    return response;
  }

  // Get specific document details
  async getDocumentById(documentId) {
    const response = await apiService.get(`/documents/${documentId}`);
    return response;
  }

  // Delete a document
  async deleteDocument(documentId) {
    const response = await apiService.delete(`/documents/${documentId}`);
    return response;
  }

  // Validate file before upload
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpg',
      'image/jpeg'
    ];

    if (!file) {
      throw new Error('No file selected');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, PNG, and JPG files are allowed');
    }

    return true;
  }

  // Get file size in human readable format
  getFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension from filename
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  // Check if file is an image
  isImageFile(file) {
    const imageTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    return imageTypes.includes(file.type);
  }

  // Check if file is a PDF
  isPDFFile(file) {
    return file.type === 'application/pdf';
  }

  // Get document type display names
  getDocumentTypeDisplayName(documentType) {
    const types = {
      'DTID_BIRTH_CERT': 'Birth Certificate',
      'DTID_VALID_ID': 'Valid ID',
      'DTID_MEDICAL_CERT': 'Medical Certificate',
      'DTID_STUDENT_PERMIT': 'Student Driver\'s Permit',
      'DTID_PDC_CERT': 'PDC Certificate'
    };
    return types[documentType] || documentType;
  }

  // Get required document types for application
  getRequiredDocumentTypes(applicationType) {
    const baseRequirements = [
      'DTID_BIRTH_CERT',
      'DTID_VALID_ID',
      'DTID_MEDICAL_CERT'
    ];

    if (applicationType === 'ATID_A') {
      baseRequirements.push('DTID_STUDENT_PERMIT');
    }

    // Add PDC certificate for certain vehicle categories
    baseRequirements.push('DTID_PDC_CERT');

    return baseRequirements;
  }

  // Get verification status display name
  getVerificationStatusDisplayName(status) {
    const statuses = {
      'Pending': 'Pending Verification',
      'Verified': 'Verified',
      'Rejected': 'Rejected',
      'Under Review': 'Under Review'
    };
    return statuses[status] || status;
  }

  // Get verification status color for UI
  getVerificationStatusColor(status) {
    const colors = {
      'Pending': 'orange',
      'Verified': 'green',
      'Rejected': 'red',
      'Under Review': 'blue'
    };
    return colors[status] || 'gray';
  }

  // Check if document is verified
  isDocumentVerified(status) {
    return status === 'Verified';
  }

  // Check if document is rejected
  isDocumentRejected(status) {
    return status === 'Rejected';
  }

  // Check if all documents are uploaded
  areAllDocumentsUploaded(requiredDocs, uploadedDocs) {
    return requiredDocs.every(reqDoc => 
      uploadedDocs.some(uploadedDoc => 
        uploadedDoc.document_type === reqDoc
      )
    );
  }

  // Get missing documents
  getMissingDocuments(requiredDocs, uploadedDocs) {
    return requiredDocs.filter(reqDoc => 
      !uploadedDocs.some(uploadedDoc => 
        uploadedDoc.document_type === reqDoc
      )
    );
  }

  // Create preview URL for image files
  createPreviewURL(file) {
    if (this.isImageFile(file)) {
      return URL.createObjectURL(file);
    }
    return null;
  }

  // Cleanup preview URL
  cleanupPreviewURL(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

export default new DocumentService(); 