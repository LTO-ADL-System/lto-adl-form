import React, { useState } from "react";
import person from "../assets/person.png";
import car from "../assets/car.png";
import document from "../assets/document.png";
import check from "../assets/check.png";
import { Calendar } from "lucide-react";
import { AppointmentModal } from "./AppointmentModal";

const Applicant = () => {
  const [selectedType, setSelectedType] = useState("renewal");
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    { name: "Personal", icon: person },
    {
      name: "License Details",
      icon: "https://placehold.co/40x40/CCCCCC/FFFFFF?text=L",
    },
    {
      name: "Documents",
      icon: "https://placehold.co/40x40/CCCCCC/FFFFFF?text=D",
    },
    {
      name: "Finalize",
      icon: "https://placehold.co/40x40/CCCCCC/FFFFFF?text=F",
    },
  ];

  return (
    <div className=" flex flex-col font-sans bg-gray-100">
      {/* This div is just for spacing, as in your original code */}
      <div className="h-16 flex-shrink-0"></div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <main className="w-full max-w-5xl mx-auto flex flex-col">
          {/* The main card container */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 flex flex-col w-full h-full">
            {/* Step Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
                {/* Step 1 - Personal */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={person} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    Personal
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 1</span>
                </div>

                {/* Step 2 - License Details */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={car} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    License Details
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 2</span>
                </div>

                {/* Step 3 - Documents */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={document} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    Documents
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 3</span>
                </div>
                {/* Step 4 - Finalize */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={check} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    Finalize
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 4</span>
                </div>
              </div>
            </div>

            {/* Form Content Area */}
            <div className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Personal Information
              </h2>
              {/* Form fields would go here */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    placeholder="Middle Name"
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 2nd part */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sex
                  </label>
                  <input
                    type="text"
                    placeholder="Sex"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Calendar */}
                {/* here */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <Calendar size={20} />
                    Schedule Appointment
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Civil Status
                  </label>
                  <input
                    type="text"
                    placeholder="Civil Status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="text"
                    placeholder="cm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <input
                    type="text"
                    placeholder="kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+63xxxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 3rd part */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    placeholder="Filipino"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Educational Attainment
                  </label>
                  <input
                    type="text"
                    placeholder="Highest Eduactional Attainment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birthplace
                  </label>
                  <input
                    type="text"
                    placeholder="Birthplace"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TIN
                  </label>
                  <input
                    type="text"
                    placeholder="123-456-789-000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Fathers Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Mother's Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spouse Name
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-black text-2xl">Address Details</p>

              {/* Address details part 1  */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House No./Unit No./Lot/Bldg.
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Blk, Lot, Phase/House No./Unit No., Floor No. Bldg. Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street/Subdivision/Purok
                  </label>
                  <input
                    type="text"
                    placeholder="Street Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay
                  </label>
                  <input
                    type="email"
                    placeholder="Barangay Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City / Municipality
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City / Municipality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proivince
                  </label>
                  <input
                    type="text"
                    placeholder="Province"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="Region"
                    placeholder="Barangay Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="Zip Code"
                    placeholder="Barangay Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-black text-2xl">Employment Details</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer's Business Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Blk, Lot, Phase/House No./Unit No., Floor No. Bldg. Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employers Telephone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Street Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employers Contact Address
                  </label>
                  <input
                    type="text"
                    placeholder="Barangay Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-black text-2xl">Emergency Contact</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer's Business Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Blk, Lot, Phase/House No./Unit No., Floor No. Bldg. Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employers Telephone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Street Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="employerBusinessCheckbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="employerBusinessCheckbox"
                    className="ml-2 block text-sm font-medium text-gray-700"
                  >
                    Same with Applicants Address
                  </label>
                </div>
              </div>

              {/* Same as Addrss Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House No./Unit No./Lot/Bldg.
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Blk, Lot, Phase/House No./Unit No., Floor No. Bldg. Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street/Subdivision/Purok
                  </label>
                  <input
                    type="text"
                    placeholder="Street Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay
                  </label>
                  <input
                    type="email"
                    placeholder="Barangay Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City / Municipality
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City / Municipality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proivince
                  </label>
                  <input
                    type="text"
                    placeholder="Province"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="Region"
                    placeholder="Barangay Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="Zip Code"
                    placeholder="Barangay Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-auto pt-6">
                <button
                  className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled
                >
                  Previous
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Applicant;
