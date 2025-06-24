import { useState, useEffect, useCallback } from 'react';
import applicationService from '../services/applicationService.js';

// Hook for managing user applications
export const useApplications = (autoFetch = true) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 20,
    pages: 0
  });

  // Fetch user applications
  const fetchApplications = useCallback(async (skip = 0, limit = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await applicationService.getUserApplications(skip, limit);
      setApplications(response.data);
      setPagination({
        total: response.total,
        page: Math.floor(skip / limit) + 1,
        size: limit,
        pages: response.pages
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit complete application
  const submitApplication = async (applicationData) => {
    setLoading(true);
    setError(null);

    try {
      const formattedData = applicationService.formatApplicationData(applicationData);
      const response = await applicationService.submitCompleteApplication(formattedData);
      
      // Refresh applications list after successful submission
      if (response.success) {
        await fetchApplications();
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load more applications (pagination)
  const loadMore = async () => {
    const skip = applications.length;
    const limit = pagination.size;

    setLoading(true);
    try {
      const response = await applicationService.getUserApplications(skip, limit);
      setApplications(prev => [...prev, ...response.data]);
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1
      }));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh applications
  const refresh = () => {
    return fetchApplications(0, pagination.size);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchApplications();
    }
  }, [autoFetch, fetchApplications]);

  return {
    applications,
    loading,
    error,
    pagination,
    fetchApplications,
    submitApplication,
    loadMore,
    refresh,
    clearError
  };
};

// Hook for managing a single application
export const useApplication = (applicationId) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch application by ID
  const fetchApplication = useCallback(async () => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await applicationService.getApplicationById(applicationId);
      setApplication(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Get application history
  const getHistory = async () => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await applicationService.getApplicationHistory(applicationId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get required documents
  const getRequiredDocuments = async () => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await applicationService.getRequiredDocuments(applicationId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount or when applicationId changes
  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, fetchApplication]);

  return {
    application,
    loading,
    error,
    fetchApplication,
    getHistory,
    getRequiredDocuments,
    clearError
  };
};

// Hook for application status utilities
export const useApplicationStatus = () => {
  // Get display name for application type
  const getTypeDisplayName = (typeId) => {
    return applicationService.getApplicationTypeDisplayName(typeId);
  };

  // Get display name for application status
  const getStatusDisplayName = (statusId) => {
    return applicationService.getApplicationStatusDisplayName(statusId);
  };

  // Get display name for vehicle category
  const getCategoryDisplayName = (categoryId) => {
    return applicationService.getVehicleCategoryDisplayName(categoryId);
  };

  // Check if application can be edited
  const canEdit = (statusId) => {
    return applicationService.canEditApplication(statusId);
  };

  // Check if application is approved
  const isApproved = (statusId) => {
    return applicationService.isApplicationApproved(statusId);
  };

  // Check if application is rejected
  const isRejected = (statusId) => {
    return applicationService.isApplicationRejected(statusId);
  };

  // Check if documents are complete
  const areDocumentsComplete = (requiredDocs) => {
    return applicationService.areDocumentsComplete(requiredDocs);
  };

  // Get status color for UI
  const getStatusColor = (statusId) => {
    const colors = {
      'ASID_PEN': 'orange',
      'ASID_SFA': 'blue',
      'ASID_APR': 'green',
      'ASID_REJ': 'red',
      'ASID_RSB': 'yellow'
    };
    return colors[statusId] || 'gray';
  };

  // Get type color for UI
  const getTypeColor = (typeId) => {
    const colors = {
      'ATID_NEW': 'green',
      'ATID_REN': 'blue',
      'ATID_DUP': 'purple'
    };
    return colors[typeId] || 'gray';
  };

  return {
    getTypeDisplayName,
    getStatusDisplayName,
    getCategoryDisplayName,
    canEdit,
    isApproved,
    isRejected,
    areDocumentsComplete,
    getStatusColor,
    getTypeColor
  };
};

// Hook for application form validation
export const useApplicationValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});

  // Validate personal info
  const validatePersonalInfo = (personalInfo) => {
    const errors = {};

    if (!personalInfo.familyName?.trim()) {
      errors.familyName = 'Family name is required';
    }

    if (!personalInfo.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!personalInfo.address?.trim()) {
      errors.address = 'Address is required';
    }

    if (!personalInfo.contactNum?.trim()) {
      errors.contactNum = 'Contact number is required';
    } else if (!/^\+?63\d{10}$/.test(personalInfo.contactNum.replace(/\s/g, ''))) {
      errors.contactNum = 'Invalid Philippine phone number format';
    }

    if (!personalInfo.birthdate) {
      errors.birthdate = 'Birthdate is required';
    } else {
      const birthDate = new Date(personalInfo.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16) {
        errors.birthdate = 'Must be at least 16 years old';
      } else if (age > 100) {
        errors.birthdate = 'Invalid age';
      }
    }

    if (!personalInfo.birthplace?.trim()) {
      errors.birthplace = 'Birthplace is required';
    }

    if (!personalInfo.height || personalInfo.height < 100 || personalInfo.height > 250) {
      errors.height = 'Height must be between 100-250 cm';
    }

    if (!personalInfo.weight || personalInfo.weight < 30 || personalInfo.weight > 300) {
      errors.weight = 'Weight must be between 30-300 kg';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate application data
  const validateApplication = (applicationData) => {
    const errors = {};

    if (!applicationData.applicationType) {
      errors.applicationType = 'Application type is required';
    }

    if (!applicationData.vehicleCategories || applicationData.vehicleCategories.length === 0) {
      errors.vehicleCategories = 'At least one vehicle category is required';
    }

    if (!applicationData.personalInfo) {
      errors.personalInfo = 'Personal information is required';
    } else {
      const personalInfoValid = validatePersonalInfo(applicationData.personalInfo);
      if (!personalInfoValid) {
        errors.personalInfo = 'Please complete all required personal information';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear validation errors
  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  return {
    validationErrors,
    validatePersonalInfo,
    validateApplication,
    clearValidationErrors
  };
}; 