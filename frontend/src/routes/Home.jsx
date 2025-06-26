import React, { useState, useEffect } from 'react';
import NoApplicationContent from '../components/NoApplicationContent.jsx';
import ApplicationInProgressContent from '../components/ApplicationInProgressContent.jsx';
import PendingApprovalContent from '../components/PendingApprovalContent.jsx';
import ApprovedApplicationContent from '../components/ApprovedApplicationContent.jsx';
import AppointmentsList from '../components/AppointmentsList.jsx';
import { useApplications } from '../hooks/useApplications.js';
import trash from '../assets/trash2-fill.svg';

const Home = () => {
    const [applicationStatus, setApplicationStatus] = useState('none'); // 'none', 'inprogress', 'pending', 'approved'
    const { applications, loading, fetchApplications } = useApplications(false); // Don't auto-fetch

    // Fetch applications on component mount
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Determine status based on user's applications
    useEffect(() => {
        if (loading) return;

        if (!applications || applications.length === 0) {
            setApplicationStatus('none');
            return;
        }

        // Get the most recent application
        const latestApplication = applications[0]; // Assuming applications are sorted by date desc
        
        // Map backend status to frontend dashboard status
        const statusMapping = {
            'ASID_PEN': 'pending',     // Pending
            'ASID_SFA': 'pending',     // Subject for Approval  
            'ASID_RSB': 'inprogress',  // Resubmission Required
            'ASID_APR': 'approved',    // Approved
            'ASID_REJ': 'none'         // Rejected - allow new application
        };

        const mappedStatus = statusMapping[latestApplication.application_status_id] || 'none';
        setApplicationStatus(mappedStatus);
    }, [applications, loading]);

    return (
        <div className="h-screen flex flex-col">
            <div className="h-16 flex-shrink-0"></div>
            {/* main content area */}
            <div className="flex-1 flex items-stretch p-2 p-4 lg:p-12 bg-gray-100 min-h-0">
                <main className="w-full max-w-full mx-auto flex flex-col">
                    {/* card container */}
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 overflow-hidden w-full lg:w-[90%] h-full lg:h-[90%] flex-1 mx-auto flex flex-col border-2 lg:border-4 min-h-0">
                        {/* Header */}
                        <div className="flex mb-4 lg:mb-6 flex-shrink-0">
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#0433A9]">Welcome Back!</h1>
                        </div>

                        {/* desktop Layout */}
                        <div className="hidden lg:grid lg:grid-cols-[1fr_420px] gap-6 flex-1 min-h-0">
                            {/* Left Column - Main Content */}
                            <div className="flex flex-col gap-6 min-h-0 h-full">
                                {/* Dynamic Content Based on Status */}
                                <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-6 lg:p-8 flex flex-col min-h-0 h-1/2">
                                    <DashboardContent status={applicationStatus} />
                                </div>

                                {/* Quick Links */}
                                <div className="h-1/2 flex flex-col min-h-0">
                                    <QuickLinks />
                                </div>
                            </div>

                            {/* Right Column - Appointments & Recent Activity */}
                            <div className="bg-white rounded-3xl shadow-md border border-gray-200 border-l-26 border-l-[#0433A9] py-8 px-8 flex flex-col min-h-0">
                                <div className="flex-1 min-h-0 space-y-6">
                                    {/*/!* Appointments Section *!/*/}
                                    {/*<div className="flex-1 min-h-0">*/}
                                    {/*    <AppointmentsList />*/}
                                    {/*</div>*/}
                                    
                                    {/* Recent Activity Section */}
                                    <div className="border-t pt-6">
                                        <RecentActivity status={applicationStatus} applications={applications} loading={loading} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Layout - Stacked cards for small screens */}
                        <div className="flex flex-col gap-4 lg:hidden flex-1 min-h-0">
                            {/* Main Content Card */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 flex flex-col min-h-0" style={{ minHeight: '200px' }}>
                                <DashboardContent status={applicationStatus} />
                            </div>

                            {/* Appointments Card */}
                            <div className="bg-white rounded-3xl shadow-md border border-gray-200 py-6 px-6 flex flex-col flex-shrink-0" style={{ minHeight: '200px' }}>
                                <AppointmentsList />
                            </div>

                            {/* Recent Activity Card */}
                            <div className="bg-white rounded-3xl shadow-md border border-gray-200 border-l-4 border-l-[#0433A9] py-6 px-6 flex flex-col flex-shrink-0" style={{ minHeight: '200px' }}>
                                <RecentActivity status={applicationStatus} applications={applications} loading={loading} />
                            </div>

                            {/* Quick Links Card */}
                            <div className="bg-white rounded-3xl shadow-md border border-gray-200 py-6 px-6 flex-shrink-0" style={{ minHeight: '150px' }}>
                                <QuickLinks />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const DashboardContent = ({ status }) => {
    switch (status) {
        case 'none':
            return <NoApplicationContent />;
        case 'inprogress':
            return <ApplicationInProgressContent />;
        case 'pending':
            return <PendingApprovalContent />;
        case 'approved':
            return <ApprovedApplicationContent />;
        default:
            return <NoApplicationContent />;
    }
};

// Quick Links Component
const QuickLinks = () => (
    <div className="bg-white rounded-3xl shadow-md border border-gray-200 py-6 lg:py-8 px-6 lg:px-12 flex-1 flex flex-col min-h-0 h-full">
        <div className="flex-shrink-0">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0433A9] mb-3">Quick Links</h3>
            <hr className="border-gray-300 mb-4" />
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-3 lg:space-y-4 min-h-0">
            <a href="https://lto.gov.ph/" className="text-[#0433A9] hover:text-blue-600 underline block text-sm lg:text-base">LTO Official Website</a>
            <a href="https://lto.gov.ph/drivers-license/" className="text-[#0433A9] hover:text-blue-800 underline block text-sm lg:text-base">Driver's License Requirements</a>
        </div>
    </div>
);

// Recent Activity Component  
const RecentActivity = ({ status, applications, loading }) => (
    <>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 lg:mb-6 text-[#0433A9] flex-shrink-0">Recent Activity</h3>

        {status === 'none' || loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
                <img src={trash} alt="trash" className="w-12 h-12 lg:w-16 lg:h-16 mb-4 opacity-50"/>
                <p className="text-[#E3E3E6] font-semibold text-sm lg:text-base">
                    {loading ? 'Loading...' : 'No Recent Activities'}
                </p>
            </div>
        ) : (
            <div className="space-y-3 lg:space-y-4 flex-1 min-h-0">
                {applications && applications.length > 0 && (() => {
                    const latestApplication = applications[0];
                    const submissionDate = latestApplication.submission_date ? 
                        new Date(latestApplication.submission_date).toLocaleDateString() : 'N/A';
                    
                    return (
                        <>
                            {/* Application Form */}
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${status === 'inprogress' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                                <div className="text-[#03267F]">
                                    <p className="font-medium text-sm lg:text-base">Application Form</p>
                                    <p className="text-xs lg:text-sm">
                                        {status === 'inprogress' ? 'Resubmission Required' : `Submitted on: ${submissionDate}`}
                                    </p>
                                </div>
                            </div>

                            {/* verification */}
                            {(status === 'pending' || status === 'approved') && (
                                <div className="flex items-center gap-3">
                                    <div className="w-px h-4 lg:h-6 bg-green-400 ml-1"></div>
                                    <div></div>
                                </div>
                            )}

                            {(status === 'pending' || status === 'approved') && (
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-400"></div>
                                    <div className="text-[#03267F]">
                                        <p className="font-medium text-sm lg:text-base">Verification</p>
                                        <p className="text-xs lg:text-sm">Under Review</p>
                                    </div>
                                </div>
                            )}

                            {/* approval */}
                            {status === 'approved' && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-px h-4 lg:h-6 bg-green-400 ml-1"></div>
                                        <div></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-400"></div>
                                        <div className="text-[#03267F]">
                                            <p className="font-medium text-sm lg:text-base">Approval</p>
                                            <p className="text-xs lg:text-sm">Application Approved!</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {status === 'pending' && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-px h-4 lg:h-6 bg-blue-400 ml-1"></div>
                                        <div></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-blue-400"></div>
                                        <div className="text-[#03267F]">
                                            <p className="font-medium text-sm lg:text-base">Approval</p>
                                            <p className="text-xs lg:text-sm">Pending Review</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    );
                })()}
            </div>
        )}
    </>
);

export default Home;