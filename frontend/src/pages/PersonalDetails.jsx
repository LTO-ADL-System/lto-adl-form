// frontend/src/pages/PersonalDetails.jsx

import React, { useState, useEffect } from "react";
import person from "../assets/person.svg";
import document from "../assets/documents.svg";
import finalize from "../assets/finalize.svg";
import car from "../assets/car.png";
import personalDetailsConfig from "../config/personal_details.json";
import useSessionState from "../hooks/useSessionState";

const PersonalDetails = ({ onProceed, onBack }) => {
    const {
        applicationData,
        isLoading,
        saveStatus,
        savePersonalDetails,
        updateCurrentStep,
        getLastSavedTime
    } = useSessionState();

    const [formData, setFormData] = useState({});
    const [dynamicOptions, setDynamicOptions] = useState({
        region: [],
        province: [],
        municipality: [],
        barangay: []
    });
    const [loading, setLoading] = useState({
        regions: false,
        provinces: false,
        municipalities: false,
        barangays: false
    });
    const [errors, setErrors] = useState({
        regions: null,
        provinces: null,
        municipalities: null,
        barangays: null
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // icon mapping for dynamic imports
    const iconMap = {
        person,
        document,
        finalize,
        car
    };

    const config = {
        steps: [
            { name: "Personal", icon: "person", index: 0 },
            { name: "License Details", icon: "car", index: 1 },
            { name: "Documents", icon: "document", index: 2 },
            { name: "Finalize", icon: "finalize", index: 3 },
        ]
    };

    const PSGC_API_BASE = 'https://psgc.gitlab.io/api';

    // Load saved data from session when component mounts
    useEffect(() => {
        if (!isLoading && applicationData.personalDetails) {
            setFormData(applicationData.personalDetails);

            // If there's saved region data, load the dependent dropdowns
            if (applicationData.personalDetails.region) {
                fetchProvinces(applicationData.personalDetails.region);
            }
            if (applicationData.personalDetails.province) {
                fetchMunicipalities(applicationData.personalDetails.province);
            }
            if (applicationData.personalDetails.municipality) {
                fetchBarangays(applicationData.personalDetails.municipality);
            }
        }
    }, [isLoading, applicationData.personalDetails]);

    // Update current step when component mounts
    useEffect(() => {
        updateCurrentStep(1);
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
    }, [formData]);

    // Handle save functionality
    const handleSave = () => {
        const success = savePersonalDetails(formData, 1);
        if (success) {
            setHasUnsavedChanges(false);
        }
    };

    // Handle save and exit
    const handleSaveAndExit = () => {
        const success = savePersonalDetails(formData, 1);
        if (success) {
            alert('Data saved successfully! You can return to complete your application later.');
        }
    };

    // Handle proceed with validation
    const handleProceed = () => {
        // Validate required fields
        const requiredFields = [];

        personalDetailsConfig.sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.required && !isFieldDisabled(field)) {
                    if (!formData[field.name] ||
                        (Array.isArray(formData[field.name]) && formData[field.name].length === 0) ||
                        formData[field.name] === '') {
                        requiredFields.push(field.label);
                    }
                }
            });
        });

        if (requiredFields.length > 0) {
            alert(`Please fill in the following required fields:\n${requiredFields.join('\n')}`);
            return;
        }

        // Save data before proceeding
        const success = savePersonalDetails(formData, 1);
        if (success && onProceed) {
            onProceed();
        }
    };

    // Helper function to check if field is disabled based on conditional logic
    const isFieldDisabled = (field) => {
        return field.conditionalField && formData[field.conditionalField];
    };

    // Helper function to format region names
    const formatRegionName = (regionName) => {
        const regionNumbers = {
            'ILOCOS REGION': 'I',
            'CAGAYAN VALLEY': 'II',
            'CENTRAL LUZON': 'III',
            'CALABARZON': 'IV-A',
            'MIMAROPA': 'IV-B',
            'BICOL REGION': 'V',
            'WESTERN VISAYAS': 'VI',
            'CENTRAL VISAYAS': 'VII',
            'EASTERN VISAYAS': 'VIII',
            'ZAMBOANGA PENINSULA': 'IX',
            'NORTHERN MINDANAO': 'X',
            'DAVAO REGION': 'XI',
            'SOCCSKSARGEN': 'XII',
            'CARAGA': 'XIII',
            'AUTONOMOUS REGION IN MUSLIM MINDANAO': 'ARMM',
            'CORDILLERA ADMINISTRATIVE REGION': 'CAR',
            'NATIONAL CAPITAL REGION': 'NCR',
            'BANGSAMORO AUTONOMOUS REGION IN MUSLIM MINDANAO': 'BARMM'
        };

        const regionNumber = regionNumbers[regionName.toUpperCase()];
        if (regionNumber) {
            return `${regionNumber} - ${regionName}`;
        }
        return regionName;
    };

    const fetchRegions = async () => {
        setLoading(prev => ({ ...prev, regions: true }));
        setErrors(prev => ({ ...prev, regions: null }));

        try {
            const response = await fetch(`${PSGC_API_BASE}/regions`);
            if (!response.ok) {
                throw new Error(`Failed to fetch regions: ${response.status}`);
            }
            const data = await response.json();

            const regionOptions = data.map(region => ({
                value: region.code,
                label: formatRegionName(region.name)
            }));

            setDynamicOptions(prev => ({
                ...prev,
                region: regionOptions
            }));
        } catch (error) {
            console.error('Error fetching regions:', error);
            setErrors(prev => ({
                ...prev,
                regions: 'Failed to load regions. Please try again.'
            }));
        } finally {
            setLoading(prev => ({ ...prev, regions: false }));
        }
    };

    const fetchProvinces = async (regionCode) => {
        setLoading(prev => ({ ...prev, provinces: true }));
        setErrors(prev => ({ ...prev, provinces: null }));

        try {
            const response = await fetch(`${PSGC_API_BASE}/regions/${regionCode}/provinces`);
            if (!response.ok) {
                throw new Error(`Failed to fetch provinces: ${response.status}`);
            }
            const data = await response.json();

            const provinceOptions = data.map(province => ({
                value: province.code,
                label: province.name
            }));

            setDynamicOptions(prev => ({
                ...prev,
                province: provinceOptions,
                municipality: [],
                barangay: []
            }));
        } catch (error) {
            console.error('Error fetching provinces:', error);
            setErrors(prev => ({
                ...prev,
                provinces: 'Failed to load provinces. Please try again.'
            }));
        } finally {
            setLoading(prev => ({ ...prev, provinces: false }));
        }
    };

    const fetchMunicipalities = async (provinceCode) => {
        setLoading(prev => ({ ...prev, municipalities: true }));
        setErrors(prev => ({ ...prev, municipalities: null }));

        try {
            const response = await fetch(`${PSGC_API_BASE}/provinces/${provinceCode}/cities-municipalities`);
            if (!response.ok) {
                throw new Error(`Failed to fetch municipalities: ${response.status}`);
            }
            const data = await response.json();

            const municipalityOptions = data.map(municipality => ({
                value: municipality.code,
                label: municipality.name
            }));

            setDynamicOptions(prev => ({
                ...prev,
                municipality: municipalityOptions,
                barangay: []
            }));
        } catch (error) {
            console.error('Error fetching municipalities:', error);
            setErrors(prev => ({
                ...prev,
                municipalities: 'Failed to load municipalities. Please try again.'
            }));
        } finally {
            setLoading(prev => ({ ...prev, municipalities: false }));
        }
    };

    const fetchBarangays = async (municipalityCode) => {
        setLoading(prev => ({ ...prev, barangays: true }));
        setErrors(prev => ({ ...prev, barangays: null }));

        try {
            const response = await fetch(`${PSGC_API_BASE}/cities-municipalities/${municipalityCode}/barangays`);
            if (!response.ok) {
                throw new Error(`Failed to fetch barangays: ${response.status}`);
            }
            const data = await response.json();

            const barangayOptions = data.map(barangay => ({
                value: barangay.code,
                label: barangay.name
            }));

            setDynamicOptions(prev => ({
                ...prev,
                barangay: barangayOptions
            }));
        } catch (error) {
            console.error('Error fetching barangays:', error);
            setErrors(prev => ({
                ...prev,
                barangays: 'Failed to load barangays. Please try again.'
            }));
        } finally {
            setLoading(prev => ({ ...prev, barangays: false }));
        }
    };

    // Load regions on component mount
    useEffect(() => {
        fetchRegions();
    }, []);

    // format TIN (XXX-XXX-XXX-XXX)
    const formatTIN = (value) => {
        const digitsOnly = value.replace(/\D/g, '');
        const limitedDigits = digitsOnly.slice(0, 12);

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

        if (fieldName === 'tin' || fieldName.toLowerCase().includes('tin')) {
            processedValue = formatTIN(value);
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: processedValue
        }));

        if (fieldName === 'region') {
            handleRegionChange(value);
        } else if (fieldName === 'province') {
            handleProvinceChange(value);
        } else if (fieldName === 'municipality') {
            handleMunicipalityChange(value);
        }

        if (fieldName.endsWith('_deceased') && value === true) {
            const prefix = fieldName.replace('_deceased', '');
            const fieldsToUpdateKeys = Object.keys(formData).filter(key =>
                key.startsWith(prefix) && key !== fieldName
            );

            const updatedFormData = { ...formData, [fieldName]: value };
            fieldsToUpdateKeys.forEach(key => {
                updatedFormData[key] = '';
            });

            setFormData(updatedFormData);
        }
    };

    const handleRegionChange = (selectedRegionCode) => {
        setFormData(prev => ({
            ...prev,
            province: '',
            municipality: '',
            barangay: ''
        }));

        setDynamicOptions(prev => ({
            ...prev,
            province: [],
            municipality: [],
            barangay: []
        }));

        if (selectedRegionCode) {
            fetchProvinces(selectedRegionCode);
        }
    };

    const handleProvinceChange = (selectedProvinceCode) => {
        setFormData(prev => ({
            ...prev,
            municipality: '',
            barangay: ''
        }));

        setDynamicOptions(prev => ({
            ...prev,
            municipality: [],
            barangay: []
        }));

        if (selectedProvinceCode) {
            fetchMunicipalities(selectedProvinceCode);
        }
    };

    const handleMunicipalityChange = (selectedMunicipalityCode) => {
        setFormData(prev => ({
            ...prev,
            barangay: ''
        }));

        setDynamicOptions(prev => ({
            ...prev,
            barangay: []
        }));

        if (selectedMunicipalityCode) {
            fetchBarangays(selectedMunicipalityCode);
        }
    };

    const getFieldOptions = (field) => {
        const locationFields = ['region', 'province', 'municipality', 'barangay'];

        if (locationFields.includes(field.name)) {
            return dynamicOptions[field.name] || [];
        }

        if (field.dependsOn) {
            return dynamicOptions[field.name] || [];
        }

        return field.options || [];
    };

    const isFieldLoading = (fieldName) => {
        const loadingMap = {
            region: loading.regions,
            province: loading.provinces,
            municipality: loading.municipalities,
            barangay: loading.barangays
        };
        return loadingMap[fieldName] || false;
    };

    const getFieldError = (fieldName) => {
        const errorMap = {
            region: errors.regions,
            province: errors.provinces,
            municipality: errors.municipalities,
            barangay: errors.barangays
        };
        return errorMap[fieldName];
    };

    const renderField = (field) => {
        const { name, label, type, placeholder, required, conditionalField, step, rows } = field;

        const isConditionallyDisabled = conditionalField && formData[conditionalField];
        const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

        const labelElement = (
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
        );

        const getPlaceholderText = () => {
            if (isConditionallyDisabled) {
                if (conditionalField && conditionalField.endsWith('_deceased')) {
                    return 'Person is deceased';
                }
                return 'Same as applicant address';
            }
            return placeholder;
        };

        switch (type) {
            case 'text':
            case 'tel':
            case 'date':
                return (
                    <div key={name} className={field.gridClass || ''}>
                        {labelElement}
                        <input
                            type={type}
                            name={name}
                            placeholder={getPlaceholderText()}
                            className={`${baseClasses} text-gray-500 ${isConditionallyDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required && !isConditionallyDisabled}
                            disabled={isConditionallyDisabled}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div key={name} className={field.gridClass || ''}>
                        {labelElement}
                        <input
                            type="number"
                            name={name}
                            placeholder={getPlaceholderText()}
                            className={`${baseClasses} ${isConditionallyDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, parseFloat(e.target.value) || '')}
                            required={required && !isConditionallyDisabled}
                            step={step || "1"}
                            disabled={isConditionallyDisabled}
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div key={name} className="md:col-span-3">
                        {labelElement}
                        <textarea
                            name={name}
                            placeholder={getPlaceholderText()}
                            className={`${baseClasses} ${isConditionallyDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required && !isConditionallyDisabled}
                            rows={rows || 3}
                            disabled={isConditionallyDisabled}
                        />
                    </div>
                );

            case 'select':
            {
                const options = getFieldOptions(field);
                const fieldLoading = isFieldLoading(field.name);
                const fieldError = getFieldError(field.name);

                const locationFields = ['region', 'province', 'municipality', 'barangay'];
                let isDisabled = isConditionallyDisabled || fieldLoading;

                if (locationFields.includes(field.name)) {
                    if (field.name === 'province' && !formData.region) isDisabled = true;
                    if (field.name === 'municipality' && !formData.province) isDisabled = true;
                    if (field.name === 'barangay' && !formData.municipality) isDisabled = true;
                } else if (field.dependsOn && !formData[field.dependsOn]) {
                    isDisabled = true;
                }

                let placeholderText = placeholder;
                if (isConditionallyDisabled) {
                    if (conditionalField && conditionalField.endsWith('_deceased')) {
                        placeholderText = 'Person is deceased';
                    } else {
                        placeholderText = 'Same as applicant address';
                    }
                } else if (fieldLoading) {
                    placeholderText = 'Loading...';
                } else if (fieldError) {
                    placeholderText = 'Error loading data';
                } else if (field.dependsOn && !formData[field.dependsOn]) {
                    placeholderText = `Select ${field.dependsOn} first`;
                } else if (locationFields.includes(field.name)) {
                    const dependencyMap = {
                        province: 'region',
                        municipality: 'province',
                        barangay: 'municipality'
                    };
                    const dependency = dependencyMap[field.name];
                    if (dependency && !formData[dependency]) {
                        placeholderText = `Select ${dependency} first`;
                    }
                }

                return (
                    <div key={name} className={field.gridClass || ''}>
                        {labelElement}
                        <select
                            name={name}
                            className={`${baseClasses} ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''} text-gray-500`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required && !isConditionallyDisabled}
                            disabled={isDisabled}
                        >
                            <option value="" disabled>
                                {placeholderText}
                            </option>
                            {options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {fieldError && (
                            <p className="text-red-500 text-sm mt-1">{fieldError}</p>
                        )}
                    </div>
                );
            }

            case 'checkbox':
                return (
                    <div key={name} className={field.gridClass || ''}>
                        <div className="flex items-center">
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
        const deceasedField = section.fields.find(f => f.name.endsWith('_deceased'));
        const otherFields = section.fields.filter(f => f !== deceasedField);

        const fieldGroups = groupFieldsByGrid(otherFields);
        const gridRows = Object.keys(fieldGroups).sort((a, b) => parseInt(a) - parseInt(b));

        return (
            <div key={section.title} className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-600">
                        {section.title}
                    </h2>

                    {deceasedField && (
                        <div className="ml-4">
                            {renderField(deceasedField)}
                        </div>
                    )}
                </div>

                {gridRows.map(gridRow => (
                    <div key={gridRow} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {fieldGroups[gridRow].map(field => renderField(field))}
                    </div>
                ))}
            </div>
        );
    };

    const renderStepNavigation = () => (
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
                {config.steps.map((step) => (
                    <div key={step.name} className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                            step.index === 0 ? 'bg-blue-600' :
                                step.index < 0 ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                            <img src={iconMap[step.icon]} alt="" width={30} height={30} />
                        </div>
                        <span className={`font-medium text-sm ${
                            step.index === 0 ? 'text-blue-600' :
                                step.index < 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                            {step.name}
                        </span>
                        <div className={`w-25 h-1 mt-2 ${
                            step.index === 0 ? 'bg-blue-600' :
                                step.index < 0 ? 'bg-green-600' : 'bg-gray-300'
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

    // Show loading state while session is initializing
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
                                Personal Details
                            </h1>
                        </div>

                        {/* Save status indicator */}
                        {renderSaveStatus()}

                        <div className="flex-1 flex flex-col">
                            {personalDetailsConfig.sections.map(renderSection)}
                            {renderNavigationButtons()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PersonalDetails;