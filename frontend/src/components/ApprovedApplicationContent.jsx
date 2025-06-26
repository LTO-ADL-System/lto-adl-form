import React, { useState } from 'react';
import { IoIosEye } from "react-icons/io";
import { AppointmentModal } from './AppointmentModal'; // Adjust the import path as needed

const ApprovedApplicationContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSetAppointment = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col flex-1">
            <h3 className="text-3xl font-semibold text-[#0433A9] mb-3">
                Your application was approved!
            </h3>
            <div className="space-y-4 pt-4 mt-auto">
                <button
                    onClick={handleSetAppointment}
                    className="bg-[#0433A9] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    Set Appointment
                    <IoIosEye className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Appointment Modal */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default ApprovedApplicationContent;