// frontend/src/pages/InitialApplication.jsx

import React from 'react';
import men_app from '../assets/men-application.svg';
import pencil from '../assets/pencil-fill.svg';

const InitialApplication = ({ onStartApplication }) => {

    return (
        <div>
            {/* ROW 1: Two Column Layout - Welcome/General Requirements + Illustration */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-6">
                <div className="flex-1">
                    {/* Welcome Text */}
                    <div className="mb-4">
                        <p className="text-gray-600 mb-3 text-xs lg:text-sm">
                            Welcome! Start your driver's license application by completing your personal information.
                            This process includes four easy steps.
                        </p>
                        <p className="text-gray-600 text-xs lg:text-sm">
                            Make sure to prepare the following requirements. But you can always save your application
                            and resume anytime!
                        </p>
                    </div>

                    {/* Gen Requirements */}
                    <div>
                        <h2 className="text-base lg:text-lg font-semibold text-[#0433A9] mb-1">General Requirements</h2>
                        <ul>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Valid ID</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">TIN/SSS number (optional)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Vehicle type/class applying for</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Your Personal Information</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Medical certificate</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column - Illustration */}
                <div className="w-72 flex-shrink-0 flex items-start justify-center">
                    <div className="w-full max-w-sm">
                        <div className="relative">
                            <img src={men_app} alt="men-app logo" className="w-65" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: Specific Requirements Section */}
            <div className="flex-shrink-0 mt-3">
                <h2 className="text-base lg:text-lg font-semibold text-[#0433A9] mb-1">Specific Requirements</h2>
                <div className="grid grid-cols-3 gap-4 lg:gap-8">
                    {/* New */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-xs lg:text-sm">New</h3>
                        <ul>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">PDC Certificate</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Valid Student-Driver's Permit</span>
                            </li>
                        </ul>
                    </div>

                    {/* Renewal */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-xs lg:text-sm">Renewal</h3>
                        <ul>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Expired Driver's License</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Plane Ticket (for advance renewal)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Duplicate */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-xs lg:text-sm">Duplicate</h3>
                        <ul>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Affidavit of Loss or Mutilation</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Complaint Copy (if stolen)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-gray-600 text-xs lg:text-sm">Mutilated ID (if applicable)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ROW 3: Start Application Button */}
            {/*TODO: ADD EVENT HANDLER WHEN BUTTON IS CLICKED IT WILL NAVIGATE TO FORMS*/}
            <button
                className="bg-[#0433A9] hover:bg-[#032788] text-white font-semibold py-2.5 px-6 lg:py-3 lg:px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 text-xs lg:text-sm mx-auto flex-shrink-0"
                onClick={onStartApplication}>
                Start an Application
                <img src={pencil} alt="pencil logo" className="w-4" />
            </button>
        </div>
    );
};

export default InitialApplication;