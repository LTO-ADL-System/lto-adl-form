import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const ApplicationViewModal = ({ isOpen, onClose, applicant, onApplicationUpdated }) => {
    const [applicationDetails, setApplicationDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && applicant?.id) {
            fetchApplicationDetails();
        } else if (!isOpen) {
            // Reset state when modal closes
            setApplicationDetails(null);
            setError(null);
        }
        // eslint-disable-next-line
    }, [isOpen, applicant?.id]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await adminService.getApplicationDetails(applicant.id);
            
            if (response.success && response.data) {
                setApplicationDetails(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch application details');
            }
        } catch (err) {
            console.error('Error fetching application details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !applicant) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#03267F]">
                        Application Details - {applicant.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center p-8">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#03267F]"></div>
                            <div className="text-[#03267F] text-lg">Loading application details...</div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
                        <p>Error loading application details: {error}</p>
                        <button 
                            onClick={fetchApplicationDetails}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Application Info */}
                {!loading && !error && applicationDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-[#03267F] mb-3">Basic Information</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-gray-700">Application ID:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.application_id || applicant.id || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Type:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.application_type?.type_category || applicant.type}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Status:</span>
                                    <span className="ml-2">
                                        <span 
                                            className="px-2 py-1 rounded-full text-sm"
                                            style={{
                                                backgroundColor: getStatusColor(applicant.status),
                                                color: getStatusTextColor(applicant.status)
                                            }}
                                        >
                                            {applicationDetails.status?.status_description || applicant.status}
                                        </span>
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Submission Date:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>
                                        {applicationDetails.submission_date ? 
                                            new Date(applicationDetails.submission_date).toLocaleDateString() : 
                                            applicant.date
                                        }
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Last Updated:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>
                                        {applicationDetails.last_updated_date ? 
                                            new Date(applicationDetails.last_updated_date).toLocaleDateString() : 
                                            'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Applicant Details */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-[#03267F] mb-3">Applicant Details</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-gray-700">Name:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>
                                        {applicationDetails.applicant ? 
                                            `${applicationDetails.applicant.first_name || ''} ${applicationDetails.applicant.middle_name || ''} ${applicationDetails.applicant.family_name || ''}`.trim() :
                                            applicant.name
                                        }
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Email:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Contact Number:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.contact_num || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Birth Date:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>
                                        {applicationDetails.applicant?.birthdate ? 
                                            new Date(applicationDetails.applicant.birthdate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Address:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.address || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Nationality:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.nationality || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-[#03267F] mb-3">Personal Details</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-gray-700">Height:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.height ? `${applicationDetails.applicant.height} cm` : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Weight:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.weight ? `${applicationDetails.applicant.weight} kg` : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Eye Color:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.eye_color || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Civil Status:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.civil_status || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Blood Type:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.blood_type || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-[#03267F] mb-3">Additional Information</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-gray-700">Educational Attainment:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.educational_attainment || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Birth Place:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.birthplace || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">TIN:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.tin || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Organ Donor:</span>
                                    <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.applicant?.is_organ_donor ? 'Yes' : 'No'}</span>
                                </div>
                                {applicationDetails.additional_requirements && (
                                    <div>
                                        <span className="font-medium text-gray-700">Additional Requirements:</span>
                                        <span className="ml-2" style={{ color: "#47456E" }}>{applicationDetails.additional_requirements}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Close
                    </button>
                    {!loading && !error && applicationDetails && (applicant.status === "Unchecked" || applicant.status === "Verifying" || applicant.status === "Resubmission") && (
                        <>
                            <button
                                onClick={async () => {
                                    try {
                                        await adminService.approveApplication(applicationDetails.application_id);
                                        alert('Application approved successfully');
                                        if (onApplicationUpdated) onApplicationUpdated();
                                        onClose();
                                    } catch (err) {
                                        alert('Error approving application: ' + err.message);
                                    }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={async () => {
                                    const reason = prompt('Please enter rejection reason:');
                                    if (!reason) return;
                                    
                                    try {
                                        await adminService.rejectApplication(applicationDetails.application_id, reason);
                                        alert('Application rejected successfully');
                                        if (onApplicationUpdated) onApplicationUpdated();
                                        onClose();
                                    } catch (err) {
                                        alert('Error rejecting application: ' + err.message);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper functions for status colors
const getStatusColor = (status) => {
    const colors = {
        'Unchecked': '#E3E3E6',
        'Verifying': '#FFBF00',
        'Approval': '#3F35FF',
        'Rejected': '#FB4548',
        'Resubmission': '#FB7945'
    };
    return colors[status] || '#E3E3E6';
};

const getStatusTextColor = (status) => {
    const colors = {
        'Unchecked': '#585859',
        'Verifying': '#6F5300',
        'Approval': '#FFFFFF',
        'Rejected': '#5E1517',
        'Resubmission': '#5D2911'
    };
    return colors[status] || '#585859';
};

export default ApplicationViewModal;