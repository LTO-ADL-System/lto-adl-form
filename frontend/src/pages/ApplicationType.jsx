// frontend/src/pages/ApplicationType.jsx

import React, { useState } from 'react';

const ApplicationType = ({ onBack, onProceed }) => {
    const [selectedType, setSelectedType] = useState('');

    const handleOptionSelect = (type) => {
        setSelectedType(type);
    };

    const handleCancel = () => {
        if (onBack) {
            onBack();
        }
    };

    const handleProceed = () => {
        if (selectedType && onProceed) {
            onProceed(selectedType);
        }
    };

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-6">
                <div className="flex-1">
                    {/* Welcome Text */}
                    <div className="mb-4">
                        <h1 className="text-lg lg:text-xl font-semibold text-gray-800 mb-3">
                            What type of license application are you making today?
                        </h1>
                    </div>

                    {/* Application Type Options - Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedType === 'new'
                                    ? 'border-[#0433A9] bg-blue-50'
                                    : 'border-gray-200 hover:border-[#0433A9] hover:bg-blue-50'
                            }`}
                            onClick={() => handleOptionSelect('new')}
                        >
                            <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">New</h3>
                            <p className="text-gray-600 text-xs lg:text-sm">
                                First time getting a driver's license?
                                Start here to apply for a
                                non-professional license.
                            </p>
                        </div>

                        <div
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedType === 'renewal'
                                    ? 'border-[#0433A9] bg-blue-50'
                                    : 'border-gray-200 hover:border-[#0433A9] hover:bg-blue-50'
                            }`}
                            onClick={() => handleOptionSelect('renewal')}
                        >
                            <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Renewal</h3>
                            <p className="text-gray-600 text-xs lg:text-sm">
                                Expiring or expired license? Apply for renewal based on your license type and status. Don't worry—we'll guide you through it.
                            </p>
                        </div>

                        <div
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedType === 'duplicate'
                                    ? 'border-[#0433A9] bg-blue-50'
                                    : 'border-gray-200 hover:border-[#0433A9] hover:bg-blue-50'
                            }`}
                            onClick={() => handleOptionSelect('duplicate')}
                        >
                            <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Duplicate</h3>
                            <p className="text-gray-600 text-xs lg:text-sm">
                                Lost, damaged, or stolen? Request a duplicate of your valid license. No need to reapply—just confirm your details.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 items-center mt-6">
                <button
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 lg:py-3 lg:px-8 rounded-lg transition-colors duration-200 text-xs lg:text-sm"
                >
                    Cancel
                </button>
                <button
                    onClick={handleProceed}
                    disabled={!selectedType}
                    className={`font-semibold py-2.5 px-6 lg:py-3 lg:px-8 rounded-lg transition-colors duration-200 text-xs lg:text-sm ${
                        selectedType
                            ? 'bg-[#0433A9] hover:bg-[#032788] text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Proceed
                </button>
            </div>
        </div>
    );
};

export default ApplicationType;