// frontend/src/pages/LicenseDetails.jsx

import React, {useEffect, useState} from "react";
import config from "../config/license_details.json";
import useSessionState from "../hooks/useSessionState";

// import all icons
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

const LicenseDetails = ({onProceed, onBack}) => {
  const {
    applicationData,
    isLoading,
    saveStatus,
    saveLicenseDetails,
    updateCurrentStep,
    getLastSavedTime
  } = useSessionState();

  const [formData, setFormData] = useState({});
  const [selectedVehicleCategories, setSelectedVehicleCategories] = useState(['']);
  const [dropdownOpen, setDropdownOpen] = useState({}); // Track which dropdowns are open
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // icon mapping for dynamic imports
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

  // Load saved data on component mount
  useEffect(() => {
    if (!isLoading && applicationData.licenseDetails) {
      const savedData = applicationData.licenseDetails;
      setFormData(savedData);

      // Set vehicle categories if they exist
      if (savedData.vehicleCategories && Array.isArray(savedData.vehicleCategories)) {
        setSelectedVehicleCategories(savedData.vehicleCategories);
      }
    }
  }, [isLoading, applicationData.licenseDetails]);

  // Update current step when component mounts
  useEffect(() => {
    updateCurrentStep(2);
  }, [updateCurrentStep]);

  // Auto-save when form data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      setHasUnsavedChanges(true);

      // Debounced auto-save
      const timeoutId = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, selectedVehicleCategories]);

  // Handle save functionality
  const handleSave = () => {
    const dataToSave = {
      ...formData,
      vehicleCategories: selectedVehicleCategories.filter(cat => cat !== '')
    };

    const success = saveLicenseDetails(dataToSave, 2);
    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  // Handle save and exit
  const handleSaveAndExit = () => {
    const dataToSave = {
      ...formData,
      vehicleCategories: selectedVehicleCategories.filter(cat => cat !== '')
    };

    const success = saveLicenseDetails(dataToSave, 2);
    if (success) {
      // You can redirect to a dashboard or exit page here
      alert('Data saved successfully! You can return to complete your application later.');
      // window.location.href = '/dashboard'; // Uncomment if you have a dashboard
    }
  };

  // Handle proceed with validation
  const handleProceed = () => {
    // Validate required fields
    const requiredFields = [];

    config.formSections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required && !isFieldDisabled(field)) {
          if (!formData[field.name] ||
              (Array.isArray(formData[field.name]) && formData[field.name].length === 0)) {
            requiredFields.push(field.label);
          }
        }
      });
    });

    // Check if at least one vehicle category is selected
    const validCategories = selectedVehicleCategories.filter(cat => cat !== '');
    if (validCategories.length === 0) {
      requiredFields.push('Vehicle Categories');
    }

    if (requiredFields.length > 0) {
      alert(`Please fill in the following required fields:\n${requiredFields.join('\n')}`);
      return;
    }

    // Save data before proceeding
    const dataToSave = {
      ...formData,
      vehicleCategories: validCategories
    };

    const success = saveLicenseDetails(dataToSave, 2);
    if (success && onProceed) {
      onProceed();
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleVehicleCategorySelect = (categoryId) => {
    // don't allow selection if category is disabled
    if (isVehicleCategoryDisabled(categoryId)) {
      return;
    }

    setSelectedVehicleCategories(prev => {
      let newCategories;
      if (prev.includes(categoryId)) {
        // remove if already selected
        newCategories = prev.filter(id => id !== categoryId);
      } else {
        // add if not selected
        newCategories = [...prev, categoryId];
      }

      // update form data
      handleInputChange('vehicleCategories', newCategories);
      return newCategories;
    });
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

    // Format as A##-##-###### (1 letter + 2 digits + 2 digits + 6 digits = 11 total characters)
    // With dashes: A##-##-###### = 13 characters including dashes
    let formatted = '';
    
    if (cleanValue.length > 0) {
      // First character: letter
      formatted += cleanValue[0].toUpperCase();
      
      // Next 2 characters: first set of digits
      if (cleanValue.length > 1) {
        if (cleanValue.length === 2) {
          formatted += cleanValue[1];
        } else {
          formatted += cleanValue.slice(1, 3);
          formatted += '-';
          
          // Next 2 characters: second set of digits
          if (cleanValue.length > 3) {
            if (cleanValue.length === 4) {
              formatted += cleanValue[3];
            } else {
              formatted += cleanValue.slice(3, 5);
              formatted += '-';
              
              // Last 6 characters: final set of digits
              if (cleanValue.length > 5) {
                formatted += cleanValue.slice(5, 11); // Take up to 6 digits
              }
            }
          }
        }
      }
    }

    return formatted;
  };

  const isVehicleCategoryDisabled = (categoryId) => {
    // If newApplication is checked, only allow A, A1, and B categories
    if (formData.newApplication === true) {
      return !['A', 'A1', 'B'].includes(categoryId);
    }
    return false;
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
      { const isLicenseField = field.name === 'driverLicenseNumber';
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
                  maxLength={isLicenseField ? 13 : undefined} // A##-##-###### = 13 characters including dashes
              />
            </div>
        ); }

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

        {/* Show notification when new application is selected */}
        {formData.newApplication === true && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>New Applicant:</strong> Only vehicle categories A, A1, and B are available for new applications.
              </p>
            </div>
        )}

        <div className={`grid ${config.vehicleCategorySection.gridClass} gap-4`}>
          {config.vehicleCategories.map((category) => {
            const isSelected = selectedVehicleCategories.includes(category.id);
            const isDisabled = isVehicleCategoryDisabled(category.id);

            return (
                <div
                    key={category.id}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg transition-all duration-200 ${
                        isDisabled
                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                            : `cursor-pointer hover:border-blue-500 ${
                                isSelected
                                    ? 'bg-[#F0F4FC] border-[#0433A9] shadow-md transform scale-105'
                                    : 'bg-white border-gray-200 hover:shadow-sm'
                            }`
                    }`}
                    onClick={() => !isDisabled && handleVehicleCategorySelect(category.id)}
                >
                  {/* Selection indicator */}
                  {isSelected && !isDisabled && (
                      <div className="absolute inset-0 border-2 border-[#0433A9] rounded-lg pointer-events-none"></div>
                  )}

                  {/* Disabled overlay */}
                  {isDisabled && (
                      <div className="absolute inset-0 bg-gray-200 bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-medium">Not Available</span>
                      </div>
                  )}

                  <div className="flex flex-col items-center justify-center h-full">
                    <img
                        src={iconMap[category.icon]}
                        alt={category.alt}
                        className={`w-25 h-20 transition-all duration-200 ${
                            isSelected && !isDisabled ? 'scale-110' : ''
                        } ${isDisabled ? 'grayscale' : ''}`}
                    />
                    <span className={`text-sm font-medium ${
                        isDisabled
                            ? 'text-gray-400'
                            : isSelected
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
          Selected Categories: {selectedVehicleCategories.filter(cat => cat !== '').join(', ')}
        </span>
            </div>
        )}
      </div>
  );

  useEffect(() => {
    if (formData.newApplication === true) {
      // Filter out any selected categories that are not allowed for new applications
      const allowedCategories = ['A', 'A1', 'B'];
      const filteredCategories = selectedVehicleCategories.filter(categoryId =>
          allowedCategories.includes(categoryId)
      );

      if (filteredCategories.length !== selectedVehicleCategories.length) {
        setSelectedVehicleCategories(filteredCategories);
        handleInputChange('vehicleCategories', filteredCategories);
      }
    }
  }, [formData.newApplication]);

  const renderStepNavigation = () => (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
          {config.steps.map((step) => (
              <div key={step.name} className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                    step.index === 1 ? 'bg-blue-600' :
                        step.index < 1 ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  <img src={iconMap[step.icon]} alt="" width={30} height={30} />
                </div>
                <span className={`font-medium text-sm ${
                    step.index === 1 ? 'text-blue-600' :
                        step.index < 1 ? 'text-green-600' : 'text-gray-400'
                }`}>
              {step.name}
            </span>
                <div className={`w-25 h-1 mt-2 ${
                    step.index === 1 ? 'bg-blue-600' :
                        step.index < 1 ? 'bg-green-600' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-400 text-xs mt-1">Step {step.index + 1}</span>
              </div>
          ))}
        </div>
      </div>
  );

  // Save status indicator
  const renderSaveStatus = () => {
    const lastSavedTime = getLastSavedTime();

    return (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {saveStatus === 'saving' && (
                <div className="flex items-center text-blue-600">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Saving...</span>
                </div>
            )}
            {saveStatus === 'saved' && (
                <div className="flex items-center text-green-600">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Saved</span>
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Save failed</span>
                </div>
            )}
            {hasUnsavedChanges && saveStatus === 'idle' && (
                <div className="flex items-center text-yellow-600">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Unsaved changes</span>
                </div>
            )}
          </div>
          {lastSavedTime && (
              <span className="text-sm text-gray-500">
            Last saved: {lastSavedTime}
          </span>
          )}
        </div>
    );
  };

  const renderNavigationButtons = () => (
      <div className="flex items-center justify-between mt-auto pt-6">
        {/* Left - Back button */}
        <div>
          {onBack && (
              <button
                  className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={onBack}
              >
                Back
              </button>
          )}
        </div>

        {/* Right - Save & Proceed buttons */}
        <div className="flex gap-4">
          <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleSaveAndExit}
              disabled={saveStatus === 'saving'}
          >
            Save & Exit
          </button>
          <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleProceed}
              disabled={saveStatus === 'saving'}
          >
            Proceed
          </button>
        </div>
      </div>
  );

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
    );
  }

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

              {/* Save status indicator */}
              {renderSaveStatus()}

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