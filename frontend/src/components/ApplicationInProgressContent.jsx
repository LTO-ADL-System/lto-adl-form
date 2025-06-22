import React from 'react';

const ApplicationInProgressContent = () => (
    <div className="bg-gray-50 rounded-lg p-6">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                    👤
                </div>
                <span className="text-sm text-gray-600">Personal</span>
                <div className="w-full h-1 bg-green-500 mt-1"></div>
            </div>
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">
                    🏷️
                </div>
                <span className="text-sm text-gray-600">License Details</span>
                <div className="w-full h-1 bg-blue-500 mt-1"></div>
            </div>
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 mb-2">
                    📄
                </div>
                <span className="text-sm text-gray-500">Documents</span>
                <div className="w-full h-1 bg-gray-300 mt-1"></div>
            </div>
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 mb-2">
                    ✅
                </div>
                <span className="text-sm text-gray-500">Finalize</span>
                <div className="w-full h-1 bg-gray-300 mt-1"></div>
            </div>
        </div>

        <div className="text-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                Continue
                <span>✏️</span>
            </button>
        </div>
    </div>
);

export default ApplicationInProgressContent;