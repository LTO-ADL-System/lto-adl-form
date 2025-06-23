import React, { useState, useEffect } from "react";
import person from "../assets/person.png";
import personalDetailsConfig from "../config/personal_details.json";

const PersonalDetails = () => {
    const [formData, setFormData] = useState({});
    const [dynamicOptions, setDynamicOptions] = useState({
        province: [],
        municipality: []
    });

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

    // get the regionProvinceMapping from the config
    const getRegionProvinceMapping = () => {
        const addressSection = personalDetailsConfig.sections.find(
            section => section.title === "Address Details"
        );
        return addressSection?.regionProvinceMapping || {};
    };

    // get the provinceMunicipalityMapping from the config
    const getProvinceMunicipalityMapping = () => {
        const addressSection = personalDetailsConfig.sections.find(
            section => section.title === "Address Details"
        );
        return addressSection?.provinceMunicipalityMapping || {};
    };

// format TIN (XXX-XXX-XXX-XXX)
    const formatTIN = (value) => {
        // remove all non-digit characters
        const digitsOnly = value.replace(/\D/g, '');

        // limit to 12 digits max
        const limitedDigits = digitsOnly.slice(0, 12);

        // apply formatting with dashes
        if (limitedDigits.length <= 3) {
            return limitedDigits;
        } else if (limitedDigits.length <= 6) {
            return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
        } else if (limitedDigits.length <= 9) {
            return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
        } else {
            return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 9)}-${limitedDigits.slice(9)}`;
        }
    };

    const handleInputChange = (fieldName, value) => {
        let processedValue = value;

        // apply TIN formatting if the field is TIN-related
        if (fieldName === 'tin' || fieldName.toLowerCase().includes('tin')) {
            processedValue = formatTIN(value);
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: processedValue
        }));

        // handle cascading dropdowns
        if (fieldName === 'region') {
            handleRegionChange(value);
        } else if (fieldName === 'province') {
            handleProvinceChange(value);
        }
    };

    const handleRegionChange = (selectedRegion) => {
        const regionProvinceMapping = getRegionProvinceMapping();

        // update province options based on selected region
        if (selectedRegion && regionProvinceMapping[selectedRegion]) {
            setDynamicOptions(prev => ({
                ...prev,
                province: regionProvinceMapping[selectedRegion],
                municipality: [] // clear municipality when region changes
            }));
        } else {
            setDynamicOptions(prev => ({
                ...prev,
                province: [],
                municipality: []
            }));
        }

        // clear dependent field values
        setFormData(prev => ({
            ...prev,
            province: '',
            municipality: ''
        }));
    };

    const handleProvinceChange = (selectedProvince) => {
        const provinceMunicipalityMapping = getProvinceMunicipalityMapping();

        // update municipality options based on selected province
        if (selectedProvince && provinceMunicipalityMapping[selectedProvince]) {
            setDynamicOptions(prev => ({
                ...prev,
                municipality: provinceMunicipalityMapping[selectedProvince]
            }));
        } else {
            setDynamicOptions(prev => ({
                ...prev,
                municipality: []
            }));
        }

        // clear municipality value
        setFormData(prev => ({
            ...prev,
            municipality: ''
        }));
    };

    // get options for a field (either static or dynamic)
    const getFieldOptions = (field) => {
        if (field.dependsOn) {
            // This is a dependent field, use dynamic options
            return dynamicOptions[field.name] || [];
        }
        // Regular field, use static options
        return field.options || [];
    };

    const renderField = (field) => {
        const { name, label, type, placeholder, required, conditionalField, step, rows } = field;

        // handle conditional fields (like emergency contact address fields)
        if (conditionalField && formData[conditionalField]) {
            return null; // Hide field if checkbox is checked
        }

        const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

        const labelElement = (
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
        );

        switch (type) {
            case 'text':
            case 'tel':
            case 'date':
                return (
                    <div key={name}>
                        {labelElement}
                        <input
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            className={`${baseClasses} text-gray-500`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div key={name}>
                        {labelElement}
                        <input
                            type="number"
                            name={name}
                            placeholder={placeholder}
                            className={baseClasses}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, parseFloat(e.target.value) || '')}
                            required={required}
                            step={step || "1"}
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div key={name} className="md:col-span-3">
                        {labelElement}
                        <textarea
                            name={name}
                            placeholder={placeholder}
                            className={baseClasses}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required}
                            rows={rows || 3}
                        />
                    </div>
                );

            case 'select':
                const options = getFieldOptions(field);
                const isDisabled = field.dependsOn && !formData[field.dependsOn];

                return (
                    <div key={name}>
                        {labelElement}
                        <select
                            name={name}
                            className={`${baseClasses} ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''} text-gray-500`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required}
                            disabled={isDisabled}
                        >
                            <option value="" disabled>
                                {isDisabled ? `Select ${field.dependsOn} first` : placeholder}
                            </option>
                            {options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={name} className="flex items-center">
                        <input
                            type="checkbox"
                            id={name}
                            name={name}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={formData[name] || false}
                            onChange={(e) => handleInputChange(name, e.target.checked)}
                        />
                        <label
                            htmlFor={name}
                            className="ml-2 block text-sm font-medium text-gray-700"
                        >
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    </div>
                );

            default:
                return null;
        }
    };

    const groupFieldsByGrid = (fields) => {
        const groups = {};
        fields.forEach(field => {
            const gridCol = field.gridColumn || 1;
            if (!groups[gridCol]) {
                groups[gridCol] = [];
            }
            groups[gridCol].push(field);
        });
        return groups;
    };

    const renderSection = (section) => {
        const fieldGroups = groupFieldsByGrid(section.fields);
        const gridRows = Object.keys(fieldGroups).sort((a, b) => parseInt(a) - parseInt(b));

        return (
            <div key={section.title} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {section.title}
                </h2>

                {gridRows.map(gridRow => (
                    <div key={gridRow} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {fieldGroups[gridRow].map(field => renderField(field))}
                    </div>
                ))}
            </div>
        );
    };

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
                                            {typeof step.icon === 'string' ? (
                                                <img src={step.icon} alt="" width={30} height={30} />
                                            ) : (
                                                <img src={step.icon} alt="" width={30} height={30} />
                                            )}
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

                        {/* Form Content Area */}
                        <div className="flex-1 flex flex-col">
                            {personalDetailsConfig.sections.map(section => renderSection(section))}


                            {/* Navigation buttons */}
                            <div className="flex justify-between items-center mt-auto pt-6">
                                <button
                                    className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    disabled
                                >
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

export default PersonalDetails;