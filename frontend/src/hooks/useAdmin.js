import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService.js';
import { useRequireAdmin } from './useAuth.js';

// Hook for admin dashboard
export const useAdminDashboard = () => {
  useRequireAdmin(); // Ensure admin access

  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getDashboardStats();
      setDashboardStats(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get formatted dashboard cards
  const getDashboardCards = useCallback(() => {
    if (!dashboardStats) return [];
    return adminService.formatDashboardCards(dashboardStats);
  }, [dashboardStats]);

  // Calculate approval rate
  const getApprovalRate = useCallback(() => {
    if (!dashboardStats) return '0.0';
    return adminService.calculateApprovalRate(dashboardStats);
  }, [dashboardStats]);

  // Calculate rejection rate
  const getRejectionRate = useCallback(() => {
    if (!dashboardStats) return '0.0';
    return adminService.calculateRejectionRate(dashboardStats);
  }, [dashboardStats]);

  // Calculate pending rate
  const getPendingRate = useCallback(() => {
    if (!dashboardStats) return '0.0';
    return adminService.calculatePendingRate(dashboardStats);
  }, [dashboardStats]);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    dashboardStats,
    loading,
    error,
    fetchDashboardStats,
    getDashboardCards,
    getApprovalRate,
    getRejectionRate,
    getPendingRate,
    clearError
  };
};

// Hook for admin application management
export const useAdminApplications = () => {
  useRequireAdmin(); // Ensure admin access

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 20,
    pages: 0
  });
  const [filters, setFilters] = useState({
    typeFilter: '',
    statusFilter: '',
    sortBy: 'date_desc',
    searchQuery: ''
  });

  // Fetch all applications
  const fetchApplications = useCallback(async (skip = 0, limit = 20, searchQuery = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getAllApplications(skip, limit, searchQuery);
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

  // Fetch filtered applications
  const fetchFilteredApplications = useCallback(async (filterOptions = filters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getFilteredApplications({
        ...filterOptions,
        skip: 0,
        limit: pagination.size
      });
      setApplications(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        page: 1,
        pages: response.pages
      }));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.size]);

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    return fetchFilteredApplications(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const defaultFilters = {
      typeFilter: '',
      statusFilter: '',
      sortBy: 'date_desc',
      searchQuery: ''
    };
    setFilters(defaultFilters);
    return fetchFilteredApplications(defaultFilters);
  };

  // Load more applications (pagination)
  const loadMore = async () => {
    const skip = applications.length;
    const limit = pagination.size;

    setLoading(true);
    try {
      const response = Object.keys(filters).some(key => filters[key])
        ? await adminService.getFilteredApplications({ ...filters, skip, limit })
        : await adminService.getAllApplications(skip, limit, filters.searchQuery);
        
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
    return Object.keys(filters).some(key => filters[key])
      ? fetchFilteredApplications()
      : fetchApplications(0, pagination.size, filters.searchQuery);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    applications,
    loading,
    error,
    pagination,
    filters,
    fetchApplications,
    fetchFilteredApplications,
    applyFilters,
    clearFilters,
    loadMore,
    refresh,
    clearError
  };
};

// Hook for admin application actions
export const useAdminApplicationActions = () => {
  useRequireAdmin(); // Ensure admin access

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Approve single application
  const approveApplication = async (applicationId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.approveApplication(applicationId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject single application
  const rejectApplication = async (applicationId, rejectionReason, additionalNotes = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.rejectApplication(applicationId, rejectionReason, additionalNotes);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk approve applications
  const bulkApprove = async (applicationIds) => {
    setLoading(true);
    setError(null);

    try {
      // Validate selection
      adminService.validateBulkSelection(applicationIds);
      
      const response = await adminService.bulkApproveApplications(applicationIds);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk reject applications
  const bulkReject = async (applicationIds, rejectionReason, additionalNotes = '') => {
    setLoading(true);
    setError(null);

    try {
      // Validate selection
      adminService.validateBulkSelection(applicationIds);
      
      const response = await adminService.bulkRejectApplications(applicationIds, rejectionReason, additionalNotes);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify document
  const verifyDocument = async (documentId, verificationStatus, notes = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.verifyDocument(documentId, verificationStatus, notes);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get common rejection reasons
  const getRejectionReasons = () => {
    return adminService.getCommonRejectionReasons();
  };

  // Format bulk results
  const formatBulkResults = (results) => {
    return adminService.formatBulkResults(results);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    approveApplication,
    rejectApplication,
    bulkApprove,
    bulkReject,
    verifyDocument,
    getRejectionReasons,
    formatBulkResults,
    clearError
  };
};

// Hook for admin filter options
export const useAdminFilters = () => {
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getFilterOptions();
      const formattedOptions = adminService.formatFilterOptions(response.data);
      setFilterOptions(formattedOptions);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    filterOptions,
    loading,
    error,
    fetchFilterOptions,
    clearError
  };
};

// Hook for admin utilities
export const useAdminUtils = () => {
  // Get application status color
  const getApplicationStatusColor = (status) => {
    return adminService.getApplicationStatusColor(status);
  };

  // Get application type color
  const getApplicationTypeColor = (type) => {
    return adminService.getApplicationTypeColor(type);
  };

  // Format applications for export
  const formatForExport = (applications) => {
    return adminService.formatApplicationsForExport(applications);
  };

  // Generate export filename
  const generateExportFilename = (filters = {}) => {
    return adminService.generateExportFilename(filters);
  };

  // Format search suggestions
  const formatSearchSuggestions = (query, applications) => {
    return adminService.formatSearchSuggestions(query, applications);
  };

  // Check admin permissions
  const hasAdminPermissions = () => {
    return adminService.hasAdminPermissions();
  };

  return {
    getApplicationStatusColor,
    getApplicationTypeColor,
    formatForExport,
    generateExportFilename,
    formatSearchSuggestions,
    hasAdminPermissions
  };
};

// Hook for system health monitoring
export const useSystemHealth = () => {
  useRequireAdmin(); // Ensure admin access

  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get system health metrics
  const getSystemHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getSystemHealth();
      setSystemHealth(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    systemHealth,
    loading,
    error,
    getSystemHealth,
    clearError
  };
};

// Hook for bulk operations management
export const useBulkOperations = () => {
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Toggle application selection
  const toggleApplication = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  // Toggle select all
  const toggleSelectAll = (applications) => {
    if (selectAll) {
      setSelectedApplications([]);
      setSelectAll(false);
    } else {
      setSelectedApplications(applications.map(app => app.application_id));
      setSelectAll(true);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedApplications([]);
    setSelectAll(false);
  };

  // Check if application is selected
  const isSelected = (applicationId) => {
    return selectedApplications.includes(applicationId);
  };

  // Get selection count
  const getSelectionCount = () => {
    return selectedApplications.length;
  };

  // Validate selection
  const validateSelection = () => {
    try {
      adminService.validateBulkSelection(selectedApplications);
      return { isValid: true, error: null };
    } catch (err) {
      return { isValid: false, error: err.message };
    }
  };

  return {
    selectedApplications,
    selectAll,
    toggleApplication,
    toggleSelectAll,
    clearSelection,
    isSelected,
    getSelectionCount,
    validateSelection
  };
}; 