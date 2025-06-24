// frontend/src/pages/PersonalDetails.jsx

import React, { useState, useEffect } from "react";
import person from "../assets/person.svg";
import license from "../assets/license-details.svg";
import document from "../assets/documents.svg";
import finalize from "../assets/finalize.svg";
import personalDetailsConfig from "../config/personal_details.json";

const PersonalDetails = ({onProceed, onBack }) => {
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

    const steps = [
        { name: "Personal", icon: person },
        { name: "License Details", icon: license },
        { name: "Documents", icon: document },
        { name: "Finalize", icon: finalize },
    ];

    const PSGC_API_BASE = 'https://psgc.gitlab.io/api';

    // PSGC API calls
    // Helper function to format region names
    const formatRegionName = (regionName) => {
        // Mapping of region names to their numbers
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
        
        // Fallback for any regions not in the mapping
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
                municipality: [], // clear dependent dropdowns
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
                barangay: [] // clear dependent dropdown
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

        // handle cascading dropdowns for locations
        if (fieldName === 'region') {
            handleRegionChange(value);
        } else if (fieldName === 'province') {
            handleProvinceChange(value);
        } else if (fieldName === 'municipality') {
            handleMunicipalityChange(value);
        }
    };

    const handleRegionChange = (selectedRegionCode) => {
        // clear dependent field values
        setFormData(prev => ({
            ...prev,
            province: '',
            municipality: '',
            barangay: ''
        }));

        // clear dependent options
        setDynamicOptions(prev => ({
            ...prev,
            province: [],
            municipality: [],
            barangay: []
        }));

        // fetch provinces for selected region
        if (selectedRegionCode) {
            fetchProvinces(selectedRegionCode);
        }
    };

    const handleProvinceChange = (selectedProvinceCode) => {
        // clear dependent field values
        setFormData(prev => ({
            ...prev,
            municipality: '',
            barangay: ''
        }));

        // clear dependent options
        setDynamicOptions(prev => ({
            ...prev,
            municipality: [],
            barangay: []
        }));

        // fetch municipalities for selected province
        if (selectedProvinceCode) {
            fetchMunicipalities(selectedProvinceCode);
        }
    };

    const handleMunicipalityChange = (selectedMunicipalityCode) => {
        // clear dependent field values
        setFormData(prev => ({
            ...prev,
            barangay: ''
        }));

        // clear dependent options
        setDynamicOptions(prev => ({
            ...prev,
            barangay: []
        }));

        // fetch barangays for selected municipality
        if (selectedMunicipalityCode) {
            fetchBarangays(selectedMunicipalityCode);
        }
    };

    // get options for a field (either static or dynamic)
    const getFieldOptions = (field) => {
        // Check if this is a location field that should use PSGC API data
        const locationFields = ['region', 'province', 'municipality', 'barangay'];
        
        if (locationFields.includes(field.name)) {
            return dynamicOptions[field.name] || [];
        }
        
        // For non-location dependent fields, use dynamic options if available
        if (field.dependsOn) {
            return dynamicOptions[field.name] || [];
        }
        
        // Regular field, use static options
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

        // handle conditional fields (like emergency contact address fields)
        const isConditionallyDisabled = conditionalField && formData[conditionalField];

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
                            className={`${baseClasses} text-gray-500 ${isConditionallyDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required}
                            disabled={isConditionallyDisabled}
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
                            className={`${baseClasses} ${isConditionallyDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, parseFloat(e.target.value) || '')}
                            required={required}
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
                            placeholder={placeholder}
                            className={`${baseClasses} ${isConditionallyDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            required={required}
                            rows={rows || 3}
                            disabled={isConditionallyDisabled}
                        />
                    </div>
                );

            case 'select':
                { const options = getFieldOptions(field);
                const fieldLoading = isFieldLoading(field.name);
                const fieldError = getFieldError(field.name);
                
                // Check if field should be disabled
                const locationFields = ['region', 'province', 'municipality', 'barangay'];
                let isDisabled = isConditionallyDisabled || fieldLoading;
                
                if (locationFields.includes(field.name)) {
                    // For location fields, check dependencies
                    if (field.name === 'province' && !formData.region) isDisabled = true;
                    if (field.name === 'municipality' && !formData.province) isDisabled = true;
                    if (field.name === 'barangay' && !formData.municipality) isDisabled = true;
                } else if (field.dependsOn && !formData[field.dependsOn]) {
                    isDisabled = true;
                }

                // Determine placeholder text
                let placeholderText = placeholder;
                if (isConditionallyDisabled) {
                    placeholderText = 'Same as applicant address';
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
                ); }

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
                            <div className="flex items-center justify-between mt-auto pt-6">
                                {/* Left - Back button */}
                                <div>
                                    <button
                                        className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                        onClick={onBack}
                                    >
                                        Back
                                    </button>
                                </div>

                                {/* Right - Save & Proceed buttons */}
                                <div className="flex gap-4">
                                    <button
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={onProceed}
                                    >
                                        Save & Exit
                                    </button>
                                    <button
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={onProceed}
                                    >
                                        Proceed
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PersonalDetails;