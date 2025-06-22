import React, { useState } from 'react';
import NoApplicationContent from '../components/NoApplicationContent';
import ApplicationInProgressContent from '../components/ApplicationInProgressContent';
import PendingApprovalContent from '../components/PendingApprovalContent';
import ApprovedApplicationContent from '../components/ApprovedApplicationContent';
import trash from '../assets/trash2-fill.svg';

const Home = () => {
    const [applicationStatus, setApplicationStatus] = useState('none'); // 'none', 'inprogress', 'pending', 'approved'

    return (
        <div className="h-screen flex flex-col">
            {/* spacer for fixed navbar */}
            <div className="h-16 flex-shrink-0"></div>
            {/* main content area */}
            <div className="flex-1 flex items-stretch p-2 p-4 lg:p-12 bg-gray-100">
                <main className="w-full max-w-full mx-auto flex flex-col">
                    {/* card container  */}
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 overflow-hidden w-full lg:w-[90%] flex-1 mx-auto flex flex-col border-2 lg:border-4 min-h-0">
                        {/* header */}
                        <div className="flex mb-4 lg:mb-6 flex-shrink-0">
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#0433A9]">Welcome Back!</h1>
                        </div>

                        {/* Ddsktop Layout */}
                        <div className="hidden lg:grid lg:grid-cols-[1fr_420px] gap-7 flex-1 min-h-0">
                            {/* left column - main content */}
                            <div className="flex flex-col min-h-0 gap-7">
                                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl shadow-md border border-gray-200 py-6 lg:py-8 px-6 lg:px-12">
                                    <DashboardContent status={applicationStatus} />
                                </div>

                                {/* quick links */}
                                <div className="flex-1 bg-white rounded-3xl shadow-md border border-gray-200 py-6 lg:py-8 px-6 lg:px-12 flex flex-col">
                                    <QuickLinks />
                                </div>
                            </div>

                            {/* right column - recent activity */}
                            <div className="bg-white rounded-3xl shadow-md border border-gray-200 border-l-26 border-l-[#0433A9] py-8 px-8 flex flex-col min-h-0">
                                <RecentActivity status={applicationStatus} />
                            </div>
                        </div>

                        {/* mobile layout - stacked cards for small screen */}
                        <div className="flex flex-col gap-4 lg:hidden flex-1 min-h-0">
                            {/* main content card */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 flex-1 flex flex-col min-h-0">
                                <DashboardContent status={applicationStatus} />
                            </div>

                            {/* recent activity card  */}
                            <div className="bg-white rounded-3xl shadow-md border border-gray-200 border-l-4 border-l-[#0433A9] py-6 px-6 flex flex-col flex-shrink-0">
                                <RecentActivity status={applicationStatus} />
                            </div>

                            {/* quick links card */}
                            <div className="bg-white rounded-3xl shadow-md border border-gray-200 py-6 px-6 flex-shrink-0">
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
    <>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0433A9] mb-3">Quick Links</h3>
        <hr className="border-gray-300 mb-4" />
        <div className="space-y-3 lg:space-y-4 py-2 lg:py-4">
            <a href="https://lto.gov.ph/" className="text-[#0433A9] hover:text-blue-600 underline block text-sm lg:text-base">LTO Official Website</a>
            <a href="https://lto.gov.ph/drivers-license/" className="text-[#0433A9] hover:text-blue-800 underline block text-sm lg:text-base">Driver's License Requirements</a>
        </div>
    </>
);


// Recent Activity Component
const RecentActivity = ({ status }) => (
    <>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 lg:mb-6 text-[#0433A9] flex-shrink-0">Recent Activity</h3>

        {status === 'none' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
                <img src={trash} alt="trash" className="w-12 h-12 lg:w-16 lg:h-16 mb-4 opacity-50"/>
                <p className="text-[#E3E3E6] font-semibold text-sm lg:text-base">No Recent <br/>Activities</p>
            </div>
        ) : (
            <div className="space-y-3 lg:space-y-4 flex-1 min-h-0">
                {/* Application Form */}
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${status === 'inprogress' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                    <div>
                        <p className="font-medium text-sm lg:text-base">Application Form</p>
                        <p className="text-xs lg:text-sm text-blue-200">
                            {status === 'inprogress' ? 'Editing' : 'Submitted on: 00/00/00'}
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
                        <div>
                            <p className="font-medium text-sm lg:text-base">Verification</p>
                            <p className="text-xs lg:text-sm text-blue-200">Received On: 00/00/00</p>
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
                            <div>
                                <p className="font-medium text-sm lg:text-base">Approval</p>
                                <p className="text-xs lg:text-sm text-blue-200">Approved On: 00/00/00</p>
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
                            <div>
                                <p className="font-medium text-sm lg:text-base">Approval</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
    </>
);

export default Home;