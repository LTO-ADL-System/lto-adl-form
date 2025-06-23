// frontend/src/pages/LicenseDetails.jsx

import React, { useState } from "react";
import person from "../assets/person.svg";
// import license from "../assets/license-details.svg";
import document from "../assets/documents.svg";
import finalize from "../assets/finalize.svg";
import car from "../assets/car.png";
import A from "../assets/license_details/A.svg";
import A1 from "../assets/license_details/A1.svg";
import BE from "../assets/license_details/BE.svg";
import B1 from "../assets/license_details/B1.svg";
import B2 from "../assets/license_details/B2.svg";
import C from "../assets/license_details/C.svg";
import CE from "../assets/license_details/CE.svg";
import D from "../assets/license_details/D.svg";

const LicenseDetails = () => {
  const [formData, setFormData] = useState({});
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState('A');

  const steps = [
    { name: "Personal", icon: person },
    { name: "License Details", icon: car },
    { name: "Documents", icon: document },
    { name: "Finalize", icon: finalize },
  ];

  const vehicleCategories = [
    { id: 'A', icon: A, alt: 'Motorcycle' },
    { id: 'A1', icon: A1, alt: 'Tricycle' },
    { id: 'B1', icon: B1, alt: 'Truck small' },
    { id: 'B2', icon: B2, alt: 'Truck medium' },
    { id: 'D', icon: B2, alt: 'Bus large' },
    { id: 'BE', icon: BE, alt: 'Car with trailer' },
    { id: 'C', icon: C, alt: 'Truck with trailer' },
    { id: 'CE', icon: CE, alt: 'Truck with trailer' },
    { id: 'CE2', icon: D, alt: 'Truck with trailer' },
  ];

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleVehicleCategorySelect = (categoryId) => {
    setSelectedVehicleCategory(categoryId);
    handleInputChange('vehicleCategory', categoryId);
  };

  const renderOrganDonationSection = () => (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Organ Donation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organ Donor
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                value={formData.organDonor || ''}
                onChange={(e) => handleInputChange('organDonor', e.target.value)}
            >
              <option value="" disabled>Yes or No</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organs
            </label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                value={formData.organs || ''}
                onChange={(e) => handleInputChange('organs', e.target.value)}
                disabled={formData.organDonor !== 'yes'}
            >
              <option value="" disabled>Select Organs</option>
              <option value="all">All Organs</option>
              <option value="heart">Heart</option>
              <option value="kidney">Kidney</option>
              <option value="liver">Liver</option>
              <option value="lungs">Lungs</option>
            </select>
          </div>
        </div>
      </div>
  );

  const renderDrivingConditionsSection = () => (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Driving Conditions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conditions
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                value={formData.conditions || ''}
                onChange={(e) => handleInputChange('conditions', e.target.value)}
            >
              <option value="" disabled>Select Conditions</option>
              <option value="none">None</option>
              <option value="corrective-lenses">Corrective Lenses</option>
              <option value="hearing-aid">Hearing Aid</option>
              <option value="prosthetic-device">Prosthetic Device</option>
            </select>
          </div>
        </div>
      </div>
  );

  const renderDrivingSkillSection = () => (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Driving Skill Acquisition
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driving Skill
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                value={formData.drivingSkill || ''}
                onChange={(e) => handleInputChange('drivingSkill', e.target.value)}
            >
              <option value="" disabled>Driving Skill Acquisition</option>
              <option value="new">New Driver</option>
              <option value="renewal">License Renewal</option>
              <option value="additional">Additional Category</option>
              <option value="conversion">License Conversion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver's License Number
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
                type="text"
                placeholder="A00-25-000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.driverLicenseNumber || ''}
                onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center">
              <input
                  type="checkbox"
                  id="newApplication"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={formData.newApplication || false}
                  onChange={(e) => handleInputChange('newApplication', e.target.checked)}
              />
              <label htmlFor="newApplication" className="ml-2 block text-sm font-medium text-gray-700">
                New Application
              </label>
            </div>
          </div>
        </div>
        {!formData.drivingSkill && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
              Select Acquisition of Skill to Proceed
            </div>
        )}
      </div>
  );

  const renderVehicleCategorySection = () => (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Driver's License Vehicle Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {vehicleCategories.map((category) => (
              <div
                  key={category.id}
                  className={`flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors ${
                      selectedVehicleCategory === category.id
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-200'
                  }`}
                  onClick={() => handleVehicleCategorySelect(category.id)}
              >
                <img src={category.icon} alt={category.alt} className="mb-2 w-12 h-12" />
                <span className="text-sm font-medium">{category.id}</span>
              </div>
          ))}
        </div>
      </div>
  );

  return (
      <div>
        <div>
          <main>
            <div>
              {/* Step Navigation */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
                  {steps.map((step, index) => (
                      <div key={step.name} className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                          <img src={step.icon} alt="" width={30} height={30} />
                        </div>
                        <span className="text-blue-600 font-medium text-sm">
                      {step.name}
                    </span>
                        <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                        <span className="text-gray-400 text-xs mt-1">Step {index + 1}</span>
                      </div>
                  ))}
                </div>
              </div>

              {/* form content area */}
              <div className="flex-1 flex flex-col">
                {renderOrganDonationSection()}
                {renderDrivingConditionsSection()}
                {renderDrivingSkillSection()}
                {renderVehicleCategorySection()}

                {/* navigation buttons */}
                <div className="flex justify-between items-center mt-auto pt-6">
                  <button className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                    Save & Exit
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default LicenseDetails;