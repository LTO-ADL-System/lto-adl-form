import apiService from './api.js';

class AdminService {
  // Get dashboard statistics
  async getDashboardStats() {
    const response = await apiService.get('/admin/dashboard');
    return response;
  }

  // Get all applications for admin review
  async getAllApplications(skip = 0, limit = 20, searchQuery = '') {
    let endpoint = `/admin/applications?skip=${skip}&limit=${limit}`;
    if (searchQuery) {
      endpoint += `&search_query=${encodeURIComponent(searchQuery)}`;
    }
    const response = await apiService.get(endpoint);
    return response;
  }

  // Get individual application details for admin
  async getApplicationDetails(applicationId) {
    const response = await apiService.get(`/admin/applications/${applicationId}`);
    return response;
  }

  // Get applications with advanced filtering
  async getFilteredApplications(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.typeFilter) params.append('type_filter', filters.typeFilter);
    if (filters.statusFilter) params.append('status_filter', filters.statusFilter);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.searchQuery) params.append('search_query', filters.searchQuery);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiService.get(`/admin/applications/filtered?${params.toString()}`);
    return response;
  }

  // Get filter options for UI
  async getFilterOptions() {
    const response = await apiService.get('/admin/applications/filter-options');
    return response;
  }

  // Approve single application
  async approveApplication(applicationId) {
    const response = await apiService.post(`/admin/applications/${applicationId}/approve`, {
      application_id: applicationId
    });
    return response;
  }

  // Reject single application
  async rejectApplication(applicationId, rejectionReason, additionalNotes = '') {
    const response = await apiService.post(`/admin/applications/${applicationId}/reject`, {
      rejection_reason: rejectionReason,
      additional_notes: additionalNotes
    });
    return response;
  }

  // Bulk approve applications
  async bulkApproveApplications(applicationIds) {
    // Send application_ids as query parameters since FastAPI expects List[str] as a direct parameter
    const params = new URLSearchParams();
    applicationIds.forEach(id => params.append('application_ids', id));
    
    const response = await apiService.post(`/admin/applications/bulk-approve?${params.toString()}`, {});
    return response;
  }

  // Bulk reject applications  
  async bulkRejectApplications(applicationIds, rejectionReason, additionalNotes = '') {
    // Send application_ids as query parameters and rejection data as JSON body
    const params = new URLSearchParams();
    applicationIds.forEach(id => params.append('application_ids', id));
    
    const response = await apiService.post(`/admin/applications/bulk-reject?${params.toString()}`, {
      rejection_reason: rejectionReason,
      additional_requirements: additionalNotes || null
    });
    return response;
  }

  // Verify document
  async verifyDocument(documentId, verificationStatus, notes = '') {
    const response = await apiService.post(`/admin/documents/${documentId}/verify`, {
      is_verified: verificationStatus,
      notes: notes
    });
    return response;
  }

  // Get system health metrics
  async getSystemHealth() {
    const response = await apiService.get('/admin/system/health');
    return response;
  }

  // Helper methods for dashboard statistics
  calculateApprovalRate(stats) {
    const total = stats.total_applications;
    const approved = stats.approved_applications;
    return total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';
  }

  calculateRejectionRate(stats) {
    const total = stats.total_applications;
    const rejected = stats.rejected_applications;
    return total > 0 ? ((rejected / total) * 100).toFixed(1) : '0.0';
  }

  calculatePendingRate(stats) {
    const total = stats.total_applications;
    const pending = stats.pending_applications;
    return total > 0 ? ((pending / total) * 100).toFixed(1) : '0.0';
  }

  // Format dashboard cards data
  formatDashboardCards(stats) {
    return [
      {
        title: 'Total Applications',
        value: stats.total_applications || 0,
        icon: 'clipboard',
        color: 'blue',
        trend: null
      },
      {
        title: 'Pending Applications',
        value: stats.pending_applications || 0,
        icon: 'clock',
        color: 'orange',
        percentage: this.calculatePendingRate(stats)
      },
      {
        title: 'Approved Applications',
        value: stats.approved_applications || 0,
        icon: 'check',
        color: 'green',
        percentage: this.calculateApprovalRate(stats)
      },
      {
        title: 'Rejected Applications',
        value: stats.rejected_applications || 0,
        icon: 'x',
        color: 'red',
        percentage: this.calculateRejectionRate(stats)
      },
      {
        title: 'Total Appointments',
        value: stats.total_appointments || 0,
        icon: 'calendar',
        color: 'purple',
        trend: null
      },
      {
        title: 'Pending Documents',
        value: stats.pending_documents || 0,
        icon: 'file',
        color: 'yellow',
        trend: null
      }
    ];
  }

  // Get status color for application status
  getApplicationStatusColor(status) {
    const colors = {
      'ASID_PEN': 'orange',
      'ASID_SFA': 'blue',
      'ASID_APR': 'green',
      'ASID_REJ': 'red',
      'ASID_RSB': 'yellow'
    };
    return colors[status] || 'gray';
  }

  // Get type color for application type
  getApplicationTypeColor(type) {
    const colors = {
      'ATID_A': 'green',
      'ATID_B': 'blue',
      'ATID_D': 'purple'
    };
    return colors[type] || 'gray';
  }

  // Format filter options for UI dropdowns
  formatFilterOptions(filterOptions) {
    return {
      typeFilters: filterOptions.type_filters || [],
      statusFilters: filterOptions.status_filters || [],
      sortOptions: filterOptions.sort_options || []
    };
  }

  // Validate bulk operation selection
  validateBulkSelection(selectedApplications) {
    if (!selectedApplications || selectedApplications.length === 0) {
      throw new Error('Please select at least one application');
    }

    if (selectedApplications.length > 50) {
      throw new Error('Cannot process more than 50 applications at once');
    }

    return true;
  }

  // Format bulk operation results for display
  formatBulkResults(results) {
    return {
      total: results.total_requested,
      successful: results.successful,
      failed: results.failed,
      successRate: results.total_requested > 0 
        ? ((results.successful / results.total_requested) * 100).toFixed(1)
        : '0.0',
      details: results.results || []
    };
  }

  // Get common rejection reasons
  getCommonRejectionReasons() {
    return [
      'Incomplete documents',
      'Invalid or expired documents',
      'Poor document quality',
      'Missing required information',
      'Failed medical examination',
      'Invalid application type',
      'Duplicate application',
      'Age requirement not met',
      'Failed written examination',
      'Failed practical examination',
      'Other'
    ];
  }

  // Export applications data (for CSV/Excel)
  formatApplicationsForExport(applications) {
    return applications.map(app => ({
      'Application ID': app.application_id,
      'Type': app.application_type_id,
      'Status': app.application_status_id,
      'Applicant Name': app.applicant_name || 'N/A',
      'Email': app.applicant_email || 'N/A',
      'Contact': app.contact_num || 'N/A',
      'Submission Date': new Date(app.submission_date).toLocaleDateString(),
      'Vehicle Categories': app.vehicle_categories?.join(', ') || 'N/A'
    }));
  }

  // Generate export filename
  generateExportFilename(filters = {}) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filterSuffix = [];
    
    if (filters.typeFilter) filterSuffix.push(filters.typeFilter);
    if (filters.statusFilter) filterSuffix.push(filters.statusFilter);
    
    const suffix = filterSuffix.length > 0 ? `_${filterSuffix.join('_')}` : '';
    return `applications_export_${timestamp}${suffix}.csv`;
  }

  // Check if user has admin permissions
  hasAdminPermissions() {
    return apiService.isAdmin();
  }

  // Format search suggestions
  formatSearchSuggestions(query, applications) {
    if (!query || query.length < 2) return [];

    const suggestions = [];
    const lowercaseQuery = query.toLowerCase();

    applications.forEach(app => {
      if (app.application_id?.toLowerCase().includes(lowercaseQuery)) {
        suggestions.push({
          type: 'Application ID',
          value: app.application_id,
          label: `Application: ${app.application_id}`
        });
      }
      
      if (app.applicant_name?.toLowerCase().includes(lowercaseQuery)) {
        suggestions.push({
          type: 'Applicant Name',
          value: app.applicant_name,
          label: `Applicant: ${app.applicant_name}`
        });
      }
    });

    // Remove duplicates and limit to 5 suggestions
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.value === suggestion.value)
    );

    return uniqueSuggestions.slice(0, 5);
  }
}

export default new AdminService(); 