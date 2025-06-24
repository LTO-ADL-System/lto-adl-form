import React from 'react';
import { IoIosEye } from "react-icons/io";

const PendingApprovalContent = () => (
    <div className="flex flex-col flex-1">
        <h3 className="text-3xl font-semibold text-[#0433A9] mb-3">
            Your application is pending for approval.
        </h3>
        <div className="space-y-4 pt-4 mt-auto">
            <button className="bg-[#0433A9] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                Review Application
                <IoIosEye className="h-6 w-6 text-white" />
            </button>
        </div>
    </div>
);

export default PendingApprovalContent;