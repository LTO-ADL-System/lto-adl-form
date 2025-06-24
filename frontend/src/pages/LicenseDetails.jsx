// frontend/src/pages/LicenseDetails.jsx

import React, { useState } from "react";
import config from "../config/license_details.json";

// Import all icons - you can optimize this by creating an icon mapping
import person from "../assets/person.svg";
import document from "../assets/documents.svg";
import finalize from "../assets/finalize.svg";
import car from "../assets/car.png";
import A from "../assets/license_details/A.svg";
import A1 from "../assets/license_details/A1.svg";
import B from "../assets/license_details/B.svg";
import B1 from "../assets/license_details/B1.svg";
import B2 from "../assets/license_details/B2.svg";
import C from "../assets/license_details/C.svg";
import D from "../assets/license_details/D.svg";
import BE from "../assets/license_details/BE.svg";
import CE from "../assets/license_details/CE.svg";

const LicenseDetails = () => {
  const [formData, setFormData] = useState({});
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState('A');

  // Icon mapping for dynamic imports
  const iconMap = {
    person,
    document,
    finalize,
    car,
    A,
    A1,
    B,
    B1,
    B2,
    C,
    D,
    BE,
    CE
  };

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

  const isFieldDisabled = (field) => {
    if (!field.dependsOn) return false;
    const dependentFieldValue = formData[field.dependsOn.field];
    return dependentFieldValue !== field.dependsOn.value;
  };

  const shouldShowValidationMessage = (section) => {
    if (!section.validationMessage) return false;
    const condition = section.validationMessage.condition;

    if (condition.isEmpty) {
      return !formData[condition.field];
    }

    return false;
  };

  const renderField = (field) => {
    const isDisabled = isFieldDisabled(field);

    switch (field.type) {
      case 'select':
        return (
            <div key={field.name} className={field.gridClass || ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  disabled={isDisabled}
              >
                <option value="" disabled>{field.placeholder}</option>
                {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
              </select>
            </div>
        );

      case 'text':
        return (
            <div key={field.name} className={field.gridClass || ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
              />
            </div>
        );

      case 'checkbox':
        return (
            <div key={field.name} className={field.gridClass || ''}>
              <div className="flex items-center">
                <input
                    type="checkbox"
                    id={field.name}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData[field.name] || false}
                    onChange={(e) => handleInputChange(field.name, e.target.checked)}
                />
                <label htmlFor={field.name} className="ml-2 block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
              </div>
            </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (section) => (
      <div key={section.id} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {section.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {section.fields.map(renderField)}
        </div>
        {shouldShowValidationMessage(section) && (
            <div className={section.validationMessage.className}>
              {section.validationMessage.message}
            </div>
        )}
      </div>
  );

  const renderVehicleCategorySection = () => (
      <div className="mb-8">
        <div>
          <h1 className="text-xl font-bold font">License Details</h1>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {config.vehicleCategorySection.title}
        </h2>
        <div className={`grid ${config.vehicleCategorySection.gridClass}`}>
          {config.vehicleCategories.map((category) => (
              <div
                  key={category.id}
                  className={`flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors ${
                      selectedVehicleCategory === category.id
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-200'
                  }`}
                  onClick={() => handleVehicleCategorySelect(category.id)}
              >
                <img
                    src={iconMap[category.icon]}
                    alt={category.alt}
                    className="mb-2 w-12 h-12"
                />
                <span className="text-sm font-medium">{category.id}</span>
              </div>
          ))}
        </div>
      </div>
  );

  const renderStepNavigation = () => (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
          {config.steps.map((step) => (
              <div key={step.name} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                  <img src={iconMap[step.icon]} alt="" width={30} height={30} />
                </div>
                <span className="text-blue-600 font-medium text-sm">
              {step.name}
            </span>
                <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                <span className="text-gray-400 text-xs mt-1">Step {step.index + 1}</span>
              </div>
          ))}
        </div>
      </div>
  );

  const renderNavigationButtons = () => (
      <div className="flex justify-between items-center mt-auto pt-6">
        {config.navigation.buttons.map((button, index) => (
            <button key={index} className={button.className}>
              {button.text}
            </button>
        ))}
      </div>
  );

  return (
      <div>
        <div>
          <main>
            <div>
              {renderStepNavigation()}

              <div className="flex-1 flex flex-col">
                {config.formSections.map(renderSection)}
                {renderVehicleCategorySection()}
                {renderNavigationButtons()}
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default LicenseDetails;