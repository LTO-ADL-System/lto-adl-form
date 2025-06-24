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

const LicenseDetails = ({onProceed}) => {
  const [formData, setFormData] = useState({});
  const [selectedVehicleCategories, setSelectedVehicleCategories] = useState(['A']);
  const [dropdownOpen, setDropdownOpen] = useState({}); // Track which dropdowns are open

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
    setSelectedVehicleCategories(prev => {
      if (prev.includes(categoryId)) {
        // Remove if already selected
        return prev.filter(id => id !== categoryId);
      } else {
        // Add if not selected
        return [...prev, categoryId];
      }
    });
    handleInputChange('vehicleCategories', selectedVehicleCategories);
  };

  const handleMultiSelectChange = (fieldName, value, isAllOption = false) => {
    const currentValues = formData[fieldName] || [];

    if (isAllOption) {
      // If "All" is clicked and already selected, deselect it
      if (currentValues.includes(value)) {
        handleInputChange(fieldName, []);
      } else {
        // If "All" is selected, clear other selections and set only "all"
        handleInputChange(fieldName, [value]);
      }
    } else {
      // If it's "none"
      if (value === 'none') {
        // If "none" is clicked and already selected, deselect it
        if (currentValues.includes(value)) {
          handleInputChange(fieldName, []);
        } else {
          // If "none" is selected, clear all other selections
          handleInputChange(fieldName, [value]);
        }
      } else {
        // For other options, toggle the selection
        let newValues;
        if (currentValues.includes(value)) {
          newValues = currentValues.filter(v => v !== value);
        } else {
          // Remove "none" and "all" if selecting other options
          newValues = [...currentValues.filter(v => v !== 'none' && v !== 'all'), value];
        }
        handleInputChange(fieldName, newValues);
      }
    }
  };

  const toggleDropdown = (fieldName) => {
    setDropdownOpen(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const formatLicenseNumber = (value) => {
    // Remove all non-alphanumeric characters
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, '');

    // Format as A##-##-######
    let formatted = '';
    for (let i = 0; i < cleanValue.length && i < 11; i++) { // Changed from 9 to 11
      if (i === 0) {
        // First character should be a letter
        formatted += cleanValue[i].toUpperCase();
      } else if (i === 3 || i === 5) {
        // Add dashes after 3rd and 5th characters
        formatted += '-' + cleanValue[i];
      } else {
        formatted += cleanValue[i];
      }
    }

    return formatted;
  };

  const isFieldDisabled = (field) => {
    if (!field.dependsOn) return false;
    const dependentFieldValue = formData[field.dependsOn.field];
    return dependentFieldValue !== field.dependsOn.value;
  };

  const isLicenseNumberDisabled = () => {
    return formData.newApplication === true;
  };

  const shouldShowValidationMessage = (section) => {
    if (!section.validationMessage) return false;
    const condition = section.validationMessage.condition;

    if (condition.isEmpty) {
      return !formData[condition.field];
    }

    return false;
  };

  const renderMultiSelectDropdown = (field) => {
    const currentValues = formData[field.name] || [];
    const isDisabled = isFieldDisabled(field);
    const isOpen = dropdownOpen[field.name] || false;
    const hasAllOption = field.options.some(opt => opt.value === 'all');
    const hasNoneOption = field.options.some(opt => opt.value === 'none');

    return (
        <div key={field.name} className={field.gridClass || ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <div
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[40px] flex flex-wrap gap-1 cursor-pointer"
                onClick={() => !isDisabled && toggleDropdown(field.name)}
            >
              {currentValues.length === 0 && (
                  <span className="text-gray-500">{field.placeholder}</span>
              )}
              {currentValues.map(value => {
                const option = field.options.find(opt => opt.value === value);
                return (
                    <span
                        key={value}
                        className="inline-flex items-center pl-3 text-xs bg-blue-100 text-[#0433A9] rounded-full"
                    >
                  {option?.label}
                      <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMultiSelectChange(field.name, value, value === 'all');
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          disabled={isDisabled}
                      >
                    ×
                  </button>
                </span>
                );
              })}
              <div className="ml-auto flex items-center">
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {field.options.map((option) => {
                    const isSelected = currentValues.includes(option.value);
                    const shouldDisableOption = isDisabled ||
                        (hasAllOption && currentValues.includes('all') && option.value !== 'all' && !isSelected) ||
                        (hasNoneOption && currentValues.includes('none') && option.value !== 'none' && !isSelected);

                    return (
                        <div
                            key={option.value}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center text-black ${
                                shouldDisableOption ? 'opacity-50 cursor-not-allowed' : ''
                            } ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              if (!shouldDisableOption) {
                                handleMultiSelectChange(field.name, option.value, option.value === 'all');
                              }
                            }}
                        >
                          <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mr-2"
                              disabled={shouldDisableOption}
                          />
                          {option.label}
                        </div>
                    );
                  })}
                </div>
            )}
          </div>
        </div>
    );
  };

  const renderField = (field) => {
    const isDisabled = isFieldDisabled(field);

    // Check if this field should be a multiselect
    const isMultiSelect = (field.name === 'organs' && field.name !== 'all') ||
        (field.name === 'conditions' && field.name !== 'none');

    switch (field.type) {
      case 'select':
        if (isMultiSelect) {
          return renderMultiSelectDropdown(field);
        }

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
        const isLicenseField = field.name === 'driverLicenseNumber';
        const isLicenseDisabled = isLicenseField ? isLicenseNumberDisabled() : false;

        return (
            <div key={field.name} className={field.gridClass || ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                  type="text"
                  placeholder={field.placeholder}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLicenseDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  value={formData[field.name] || ''}
                  onChange={(e) => {
                    const value = isLicenseField ? formatLicenseNumber(e.target.value) : e.target.value;
                    handleInputChange(field.name, value);
                  }}
                  disabled={isLicenseDisabled}
                  maxLength={isLicenseField ? 12 : undefined} // Changed from 10 to 12 to accommodate A##-##-######
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
        <h2 className="text-xl font-semibold text-gray-600 mb-6">
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
        <h2 className="text-xl font-semibold text-gray-600 mb-6">
          {config.vehicleCategorySection.title} (Multi-select)
        </h2>
        <div className={`grid ${config.vehicleCategorySection.gridClass} gap-4`}>
          {config.vehicleCategories.map((category) => {
            const isSelected = selectedVehicleCategories.includes(category.id);
            return (
                <div
                    key={category.id}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all duration-200 ${
                        isSelected
                            ? 'bg-[#F0F4FC] border-[#0433A9] shadow-md transform scale-105'
                            : 'bg-white border-gray-200 hover:shadow-sm'
                    }`}
                    onClick={() => handleVehicleCategorySelect(category.id)}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                      <div className="absolute inset-0 border-2 border-[#0433A9] rounded-lg pointer-events-none"></div>
                  )}

                  <div className="flex flex-col items-center justify-center h-full">
                    <img
                        src={iconMap[category.icon]}
                        alt={category.alt}
                        className={`w-25 h-20 transition-all duration-200 ${
                            isSelected ? 'scale-110' : ''
                        }`}
                    />
                    <span className={`text-sm font-medium ${
                        isSelected
                            ? 'text-[#0433A9] font-semibold'
                            : 'text-gray-700'
                    }`}>
                {category.id}
              </span>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Display selected categories */}
        {selectedVehicleCategories.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <span className="text-sm font-medium text-blue-800">
          Selected Categories: {selectedVehicleCategories.join(', ')}
        </span>
            </div>
        )}
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
      {config.navigation.buttons.map((button, index) => {
        if (button.text === "Proceed") {
          return (
            <button key={index} onClick={onProceed} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md">
              Proceed 
            </button>
          );
        }

        return (
          <button key={index} className={button.className}>
            {button.text}
          </button>
        );
      })}
    </div>
  );

  return (
      <div>
        <div>
          <main>
            <div>
              {renderStepNavigation()}

              {/* Main page heading */}
              <div className="mb-6 border-b-2 pb-2 border-gray-300">
                <h1 className="text-3xl font-bold text-[#0433A9] flex items-center">
                  License Details
                </h1>
              </div>

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