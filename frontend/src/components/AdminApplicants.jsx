import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AdminNavBar from "./AdminNavBar";
import AdminApplicantTable from "./AdminApplicantTable";
import ApplicationViewModal from "./ApplicationViewModal";
import adminService from "../services/adminService";

// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default function AdminApplicants() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [globalActionsOpen, setGlobalActionsOpen] = useState(false);
    const [filterByOpen, setFilterByOpen] = useState(false);
    const [sortByOpen, setSortByOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        type: '',
        status: ''
    });
    const [selectedSort, setSelectedSort] = useState('date_desc'); // Default to newest first
    const [pagination, setPagination] = useState({
        skip: 0,
        limit: 20,
        total: 0
    });
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Refs for dropdown click outside detection
    const filterDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);
    const globalActionsRef = useRef(null);

    // Debounce search to reduce API calls
    const debouncedSearch = useDebounce(search, 500); // 500ms delay

    // Memoize status and type mapping functions
    const getDisplayStatus = useMemo(() => (apiStatus) => {
        const statusMap = {
            'ASID_PEN': 'Unchecked',
            'ASID_SFA': 'Verifying', 
            'ASID_APR': 'Approval',
            'ASID_REJ': 'Rejected',
            'ASID_RSB': 'Resubmission'
        };
        return statusMap[apiStatus] || 'Unchecked';
    }, []);

    const getDisplayType = useMemo(() => (apiType) => {
        const typeMap = {
            'ATID_NEW': 'New',
            'ATID_REN': 'Renewal',
            'ATID_DUP': 'Duplicate'
        };
        return typeMap[apiType] || 'New';
    }, []);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use filtered applications API if filters or sorting are applied
            const hasFiltersOrSort = selectedFilters.type || selectedFilters.status || selectedSort !== 'date_desc' || debouncedSearch;
            
            let response;
            if (hasFiltersOrSort) {
                response = await adminService.getFilteredApplications({
                    typeFilter: selectedFilters.type || undefined,
                    statusFilter: selectedFilters.status || undefined,
                    sortBy: selectedSort,
                    searchQuery: debouncedSearch || undefined,
                    skip: pagination.skip,
                    limit: pagination.limit
                });
            } else {
                response = await adminService.getAllApplications(
                    pagination.skip, 
                    pagination.limit, 
                    debouncedSearch
                );
            }
            
            if (response.success && response.data) {
                // Handle different possible response structures
                let applicationsArray = [];
                
                if (Array.isArray(response.data.applications)) {
                    applicationsArray = response.data.applications;
                } else if (Array.isArray(response.data)) {
                    applicationsArray = response.data;
                } else {
                    applicationsArray = [];
                }
                
                // Transform API data to match component expectations
                const transformedApplicants = applicationsArray.map(app => {
                    // Try different ways to get the applicant name based on schema structure
                    let applicantName = 'N/A';
                    if (app.applicant) {
                        // Based on ApplicantResponse schema: first_name, middle_name, family_name
                        const firstName = app.applicant.first_name || '';
                        const middleName = app.applicant.middle_name || '';
                        const familyName = app.applicant.family_name || '';
                        applicantName = `${firstName} ${middleName} ${familyName}`.trim().replace(/\s+/g, ' ') || 'N/A';
                    }
                    
                    return {
                        id: app.application_id || app.id,
                        type: getDisplayType(app.application_type_id || app.application_type),
                        name: applicantName,
                        status: getDisplayStatus(app.application_status_id || app.status),
                        date: app.submission_date ? new Date(app.submission_date).toLocaleDateString('en-CA') : 'N/A',
                        originalData: app // Keep original data for actions
                    };
                });
                
                setApplicants(transformedApplicants);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || applicationsArray.length
                }));

                // If no real data, add minimal test data for debugging (only in development)
                if (transformedApplicants.length === 0 && process.env.NODE_ENV === 'development') {
                    const testApplicants = [
                        {
                            id: 'test-1',
                            type: 'New',
                            name: 'Test Applicant',
                            status: 'Unchecked',
                            date: new Date().toLocaleDateString('en-CA'),
                            originalData: {
                                application_id: 'test-1',
                                application_type_id: 'ATID_NEW',
                                applicant_name: 'Test Applicant',
                                application_status_id: 'ASID_PEN',
                                submission_date: new Date().toISOString(),
                                applicant_email: 'test@example.com'
                            }
                        }
                    ];
                    setApplicants(testApplicants);
                }
            } else {
                setApplicants([]);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pagination.skip, pagination.limit, debouncedSearch, selectedFilters.type, selectedFilters.status, selectedSort, getDisplayType, getDisplayStatus]);

    // Optimized useEffect with debounced search
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Clear selections when applicants change
    useEffect(() => {
        const currentIds = new Set(applicants.map(app => app.id));
        setSelectedApplications(prev => {
            const filtered = new Set([...prev].filter(id => currentIds.has(id)));
            return filtered;
        });
    }, [applicants]);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setFilterByOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setSortByOpen(false);
            }
            if (globalActionsRef.current && !globalActionsRef.current.contains(event.target)) {
                setGlobalActionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle search input with immediate state update (debouncing happens automatically)
    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        // Reset pagination when searching
        setPagination(prev => ({ ...prev, skip: 0 }));
    }, []);

    // Handle filter changes
    const handleFilterChange = useCallback((filterType, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        // Reset pagination when filtering
        setPagination(prev => ({ ...prev, skip: 0 }));
        // Close the dropdown
        setFilterByOpen(false);
    }, []);

    // Handle sort change
    const handleSortChange = useCallback((sortValue) => {
        setSelectedSort(sortValue);
        // Reset pagination when sorting
        setPagination(prev => ({ ...prev, skip: 0 }));
        // Close the dropdown
        setSortByOpen(false);
    }, []);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSelectedFilters({ type: '', status: '' });
        setSelectedSort('date_desc');
        setPagination(prev => ({ ...prev, skip: 0 }));
    }, []);

    // Handle view application
    const handleViewApplication = useCallback((applicant) => {
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
    }, []);

    // Close modal
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedApplicant(null);
    }, []);

    // Handle individual application selection
    const handleApplicationSelect = useCallback((applicationId, isSelected) => {
        setSelectedApplications(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(applicationId);
            } else {
                newSet.delete(applicationId);
            }
            return newSet;
        });
    }, []);

    // Handle select all applications
    const handleSelectAll = useCallback((isSelected) => {
        if (isSelected) {
            const allIds = new Set(applicants.map(app => app.id));
            setSelectedApplications(allIds);
        } else {
            setSelectedApplications(new Set());
        }
    }, [applicants]);

    // Check if all applications are selected
    const allSelected = useMemo(() => {
        return applicants.length > 0 && applicants.every(app => selectedApplications.has(app.id));
    }, [applicants, selectedApplications]);

    // Bulk action handlers
    const handleBulkApprove = useCallback(async () => {
        if (selectedApplications.size === 0) {
            alert('Please select applications to approve');
            return;
        }

        const count = selectedApplications.size;
        const confirmed = window.confirm(
            `Are you sure you want to approve ${count} application${count !== 1 ? 's' : ''}? This action cannot be undone.`
        );
        
        if (!confirmed) return;

        try {
            setBulkActionLoading(true);
            const applicationIds = Array.from(selectedApplications);
            
            // Fix: Use the correct endpoint format
            const response = await adminService.bulkApproveApplications(applicationIds);
            
            if (response.success) {
                alert(`✅ Successfully approved ${applicationIds.length} applications`);
                setSelectedApplications(new Set());
                setGlobalActionsOpen(false);
                fetchApplications(); // Refresh the list
            } else {
                throw new Error(response.message || 'Bulk approve failed');
            }
        } catch (error) {
            console.error('Bulk approve error:', error);
            alert('❌ Error approving applications: ' + error.message);
        } finally {
            setBulkActionLoading(false);
        }
    }, [selectedApplications, fetchApplications]);

    const handleBulkReject = useCallback(async () => {
        if (selectedApplications.size === 0) {
            alert('Please select applications to reject');
            return;
        }

        const count = selectedApplications.size;
        const reason = prompt(`Please enter rejection reason for ${count} application${count !== 1 ? 's' : ''}:`);
        if (!reason || reason.trim() === '') {
            alert('Rejection reason is required');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to reject ${count} application${count !== 1 ? 's' : ''} with reason: "${reason}"? This action cannot be undone.`
        );
        
        if (!confirmed) return;

        try {
            setBulkActionLoading(true);
            const applicationIds = Array.from(selectedApplications);
            
            // Fix: Use the correct endpoint format
            const response = await adminService.bulkRejectApplications(applicationIds, reason.trim());
            
            if (response.success) {
                alert(`✅ Successfully rejected ${applicationIds.length} applications`);
                setSelectedApplications(new Set());
                setGlobalActionsOpen(false);
                fetchApplications(); // Refresh the list
            } else {
                throw new Error(response.message || 'Bulk reject failed');
            }
        } catch (error) {
            console.error('Bulk reject error:', error);
            alert('❌ Error rejecting applications: ' + error.message);
        } finally {
            setBulkActionLoading(false);
        }
    }, [selectedApplications, fetchApplications]);

    return (
        <div className="h-screen flex flex-col">
            {/* Navbar spacer */}
            <div className="h-16 flex-shrink-0"></div>
            {/* Main content area */}
            <div className="flex-1 flex items-stretch p-2 p-4 lg:p-12 bg-gray-100 min-h-0">
                <main className="w-full max-w-full mx-auto flex flex-col">
                    {/* Card container */}
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 overflow-visible w-full lg:w-[90%] flex-1 mx-auto flex flex-col min-h-0">
                        {/* Header */}
                        <div className="flex items-center gap-3 self-stretch mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <path d="M9.625 5.5C8.86561 5.5 8.25 6.11561 8.25 6.875V39.875C8.25 40.6344 8.86561 41.25 9.625 41.25H34.375C35.1344 41.25 35.75 40.6344 35.75 39.875V6.875C35.75 6.11561 35.1344 5.5 34.375 5.5H33C32.2406 5.5 31.625 4.88439 31.625 4.125C31.625 3.36561 32.2406 2.75 33 2.75H34.375C36.6532 2.75 38.5 4.59683 38.5 6.875V39.875C38.5 42.1532 36.6532 44 34.375 44H9.625C7.34682 44 5.5 42.1532 5.5 39.875V6.875C5.5 4.59683 7.34682 2.75 9.625 2.75H11C11.7594 2.75 12.375 3.36561 12.375 4.125C12.375 4.88439 11.7594 5.5 11 5.5H9.625Z" fill="#03267F"/>
                                <path d="M27.5 1.375C27.5 0.615609 26.8844 0 26.125 0H17.875C17.1156 0 16.5 0.615609 16.5 1.375C16.5 2.13439 15.8844 2.75 15.125 2.75C14.3656 2.75 13.75 3.36561 13.75 4.125V5.5C13.75 6.25939 14.3656 6.875 15.125 6.875H28.875C29.6344 6.875 30.25 6.25939 30.25 5.5V4.125C30.25 3.36561 29.6344 2.75 28.875 2.75C28.1156 2.75 27.5 2.13439 27.5 1.375Z" fill="#03267F"/>
                            </svg>
                            <span
                                style={{
                                    color: "#03267F",
                                    fontFamily: "Typold, sans-serif",
                                    fontSize: "36px",
                                    fontStyle: "normal",
                                    fontWeight: 700,
                                    lineHeight: "normal",
                                    width: "1032px",
                                    height: "100%",
                                    leadingTrim: "both",
                                    textEdge: "cap",
                                }}
                            >
                                Applicants
                            </span>
                        </div>
                        <div style={{
                            width: "1088px",
                            height: "2px",
                            background: "#BDBDBF",
                            marginBottom: "24px"
                        }} />
                        
                        {/* Controls - Improved Layout */}
                        <div className="flex justify-between items-center mb-6 w-full" style={{ alignSelf: "stretch" }}>
                            {/* Left controls */}
                            <div className="flex items-center gap-4">
                                {/* Search bar */}
                                <div
                                    className="flex items-center"
                                    style={{
                                        width: "400px",
                                        height: "40px",
                                        padding: "8px 16px",
                                        gap: "12px",
                                        borderRadius: "12px",
                                        border: "2px solid #BDBDBF",
                                        background: "#FFF"
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M11.7422 10.3439C12.5329 9.2673 13 7.9382 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C7.93858 13 9.26801 12.5327 10.3448 11.7415L10.3439 11.7422C10.3734 11.7822 10.4062 11.8204 10.4424 11.8566L14.2929 15.7071C14.6834 16.0976 15.3166 16.0976 15.7071 15.7071C16.0976 15.3166 16.0976 14.6834 15.7071 14.2929L11.8566 10.4424C11.8204 10.4062 11.7822 10.3734 11.7422 10.3439ZM12 6.5C12 9.53757 9.53757 12 6.5 12C3.46243 12 1 9.53757 1 6.5C1 3.46243 3.46243 1 6.5 1C9.53757 1 12 3.46243 12 6.5Z" fill="#BDBDBF"/>
                                    </svg>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => handleSearchChange(e.target.value)}
                                        placeholder="Search applicants..."
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            background: "transparent",
                                            color: "#585859",
                                            fontFamily: "Typold, sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 300,
                                            lineHeight: "normal",
                                            flex: 1,
                                            width: "100%"
                                        }}
                                    />
                                </div>
                                
                                {/* Global Actions Button - Fixed positioning */}
                                <div className="relative" ref={globalActionsRef}>
                                <button
                                        className="flex items-center bg-white hover:bg-gray-50 transition-colors duration-200"
                                    style={{
                                        height: "40px",
                                            padding: "8px 16px",
                                        borderRadius: "8px",
                                            border: "2px solid #BDBDBF",
                                        color: "#585859",
                                        fontFamily: "Typold, sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        lineHeight: "normal",
                                            gap: "8px",
                                            cursor: "pointer",
                                            minWidth: "140px"
                                    }}
                                        onClick={() => {
                                            setGlobalActionsOpen(open => !open);
                                            setFilterByOpen(false);
                                            setSortByOpen(false);
                                        }}
                                >
                                    Global Actions
                                        {selectedApplications.size > 0 && (
                                            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {selectedApplications.size}
                                            </span>
                                        )}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 13a.5.5 0 0 1-.5-.5V3.707L5.354 5.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 3.707V12.5A.5.5 0 0 1 8 13z"/>
                                        </svg>
                                    </button>
                                    
                                    {/* Global Actions Dropdown - Improved positioning */}
                                    {globalActionsOpen && (
                                        <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[250px]" style={{ color: "#585859" }}>
                                            <div className="p-3">
                                                {selectedApplications.size === 0 ? (
                                                    <div className="px-3 py-3 text-sm text-gray-500 text-center">
                                                        Select applications to perform bulk actions
                                                    </div>
                                    ) : (
                                                    <>
                                                        <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100 mb-2">
                                                            {selectedApplications.size} application{selectedApplications.size !== 1 ? 's' : ''} selected
                                                        </div>
                                                        <button
                                                            onClick={handleBulkApprove}
                                                            disabled={bulkActionLoading}
                                                            className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                                            </svg>
                                                            {bulkActionLoading ? 'Approving...' : 'Bulk Approve'}
                                                        </button>
                                                        <button
                                                            onClick={handleBulkReject}
                                                            disabled={bulkActionLoading}
                                                            className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                                            {bulkActionLoading ? 'Rejecting...' : 'Bulk Reject'}
                                </button>
                                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedApplications(new Set());
                                                                    setGlobalActionsOpen(false);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                                                            >
                                                                Clear Selection
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Right controls */}
                            <div className="flex items-center gap-4">
                                {/* Filter By Button with Dropdown */}
                                <div className="relative" ref={filterDropdownRef}>
                                <button
                                        className="flex items-center bg-white hover:bg-gray-50 transition-colors duration-200"
                                    style={{
                                        height: "40px",
                                            padding: "8px 16px",
                                        borderRadius: "8px",
                                            border: "2px solid #BDBDBF",
                                        color: "#585859",
                                        fontFamily: "Typold, sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        lineHeight: "normal",
                                            gap: "8px",
                                            cursor: "pointer",
                                            minWidth: "110px"
                                        }}
                                        onClick={() => {
                                            setFilterByOpen(!filterByOpen);
                                            setSortByOpen(false);
                                            setGlobalActionsOpen(false);
                                    }}
                                >
                                    Filter By
                                        {(selectedFilters.type || selectedFilters.status) && (
                                            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {(selectedFilters.type ? 1 : 0) + (selectedFilters.status ? 1 : 0)}
                                            </span>
                                        )}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                                    </svg>
                                </button>
                                    
                                    {/* Filter Dropdown */}
                                    {filterByOpen && (
                                        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[220px]" style={{ color: "#585859" }}>
                                            <div className="p-4">
                                                {/* Type Filter */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="typeFilter"
                                                                value=""
                                                                checked={selectedFilters.type === ''}
                                                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            All Types
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="typeFilter"
                                                                value="new"
                                                                checked={selectedFilters.type === 'new'}
                                                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            New
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="typeFilter"
                                                                value="renewal"
                                                                checked={selectedFilters.type === 'renewal'}
                                                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            Renewal
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="typeFilter"
                                                                value="duplicate"
                                                                checked={selectedFilters.type === 'duplicate'}
                                                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            Duplicate
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                {/* Status Filter */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="statusFilter"
                                                                value=""
                                                                checked={selectedFilters.status === ''}
                                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            All Statuses
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="statusFilter"
                                                                value="verifying"
                                                                checked={selectedFilters.status === 'verifying'}
                                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            Verifying
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="statusFilter"
                                                                value="resubmission"
                                                                checked={selectedFilters.status === 'resubmission'}
                                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            Resubmission
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="statusFilter"
                                                                value="rejected"
                                                                checked={selectedFilters.status === 'rejected'}
                                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            Rejected
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="statusFilter"
                                                                value="approved"
                                                                checked={selectedFilters.status === 'approved'}
                                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                                className="mr-2"
                                                            />
                                                            Approved
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                {/* Clear Filters */}
                                                <div className="mt-4 pt-3 border-t border-gray-100">
                                                    <button
                                                        onClick={handleClearFilters}
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                                    >
                                                        Clear All Filters
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Sort By Button with Dropdown */}
                                <div className="relative" ref={sortDropdownRef}>
                                <button
                                        className="flex items-center bg-white hover:bg-gray-50 transition-colors duration-200"
                                    style={{
                                        height: "40px",
                                            padding: "8px 16px",
                                        borderRadius: "8px",
                                            border: "2px solid #BDBDBF",
                                        color: "#585859",
                                        fontFamily: "Typold, sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        lineHeight: "normal",
                                            gap: "8px",
                                            cursor: "pointer",
                                            minWidth: "100px"
                                        }}
                                        onClick={() => {
                                            setSortByOpen(!sortByOpen);
                                            setFilterByOpen(false);
                                            setGlobalActionsOpen(false);
                                    }}
                                >
                                    Sort By
                                        {selectedSort !== 'date_desc' && (
                                            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                1
                                            </span>
                                        )}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                                    </svg>
                                </button>
                                    
                                    {/* Sort Dropdown */}
                                    {sortByOpen && (
                                        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[280px]" style={{ color: "#585859" }}>
                                            <div className="p-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="sortBy"
                                                            value="date_desc"
                                                            checked={selectedSort === 'date_desc'}
                                                            onChange={(e) => handleSortChange(e.target.value)}
                                                            className="mr-2"
                                                        />
                                                        Date (Newest First)
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="sortBy"
                                                            value="date_asc"
                                                            checked={selectedSort === 'date_asc'}
                                                            onChange={(e) => handleSortChange(e.target.value)}
                                                            className="mr-2"
                                                        />
                                                        Date (Oldest First)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Table Header and Applicants */}
                        <div
                            className="w-full"
                            style={{
                                overflowX: "auto",
                                alignItems: "center",
                            }}
                        >
                            {/* --- INTEGRATED TABLE --- */}
                            <AdminApplicantTable
                                applicants={applicants}
                                selectedApplicants={Array.from(selectedApplications)}
                                onSelect={handleApplicationSelect}
                                onView={handleViewApplication}
                                onSelectAll={handleSelectAll}
                            />

                            {/* Loading state */}
                            {loading && applicants.length === 0 && (
                                <div className="flex items-center justify-center p-8 w-full">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#03267F]"></div>
                                        <div className="text-[#03267F] text-lg">Loading applications...</div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Refreshing indicator */}
                            {loading && applicants.length > 0 && (
                                <div className="flex items-center justify-center p-2 w-full bg-blue-50 border border-blue-200 rounded">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#03267F]"></div>
                                        <div className="text-[#03267F] text-sm">Updating...</div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Error state */}
                            {error && (
                                <div className="flex items-center justify-center p-8 w-full">
                                    <div className="text-red-600 text-center">
                                        <p>Error loading applications: {error}</p>
                                        <button 
                                            onClick={fetchApplications}
                                            className="mt-2 px-4 py-2 bg-[#03267F] text-white rounded hover:bg-blue-700"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* No data state */}
                            {!loading && !error && applicants.length === 0 && (
                                <div className="flex items-center justify-center p-8 w-full">
                                    <div className="text-gray-500 text-center">
                                        <p>No applications found</p>
                                        {search && <p className="text-sm">Try adjusting your search terms</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {/* Fixed AdminNavBar */}
            <AdminNavBar />
            
            {/* Application View Modal */}
            <ApplicationViewModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                applicant={selectedApplicant}
                onApplicationUpdated={fetchApplications}
            />
        </div>
    );
}