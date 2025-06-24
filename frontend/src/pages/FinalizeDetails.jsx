// frontend/src/pages/FinalizeDetails.jsx

import React, { useState, useEffect } from "react";
import person from "../assets/person.svg";
import license from "../assets/license-details.svg";
import document from "../assets/documents.svg";
import finalize from "../assets/finalize.svg";
import personalDetailsConfig from "../config/personal_details.json";
// import licenseDetailsConfig from "../config/license_details.json";
// import applicantDocumentsConfig from "../config/applicant_documents.json";

const FinalizeDetails = ({ onProceed, onBack, onEdit }) => {
    const [allFormData, setAllFormData] = useState({
        personalDetails: {},
        licenseDetails: {},
        applicantDocuments: {}
    });

    const steps = [
        { name: "Personal", icon: person },
        { name: "License Details", icon: license },
        { name: "Documents", icon: document },
        { name: "Finalize", icon: finalize },
    ];

    // Load saved data from localStorage on component mount
    useEffect(() => {
        const loadSavedData = () => {
            try {
                const personalData = localStorage.getItem('personalDetails');
                const licenseData = localStorage.getItem('licenseDetails');
                const documentsData = localStorage.getItem('applicantDocuments');

                setAllFormData({
                    personalDetails: personalData ? JSON.parse(personalData) : {},
                    licenseDetails: licenseData ? JSON.parse(licenseData) : {},
                    applicantDocuments: documentsData ? JSON.parse(documentsData) : {}
                });
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        };

        loadSavedData();
    }, []);

    // Helper function to format field values for display
    const formatFieldValue = (field, value, stepData) => {
        if (!value && value !== 0 && value !== false) return 'Not provided';

        switch (field.type) {
            case 'checkbox':
                return value ? 'Yes' : 'No';
            case 'date':
                if (value) {
                    return new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
                return 'Not provided';
            case 'select':
                // For location fields, try to get the label from options
                if (field.options && field.options.length > 0) {
                    const option = field.options.find(opt => opt.value === value);
                    return option ? option.label : value;
                }
                return value;
            case 'number':
                if (field.name.includes('height')) return `${value} cm`;
                if (field.name.includes('weight')) return `${value} kg`;
                return value;
            case 'tel':
                return value;
            default:
                return value;
        }
    };

    // Helper function to check if a field should be displayed
    const shouldDisplayField = (field, stepData) => {
        // Don't display fields that are conditionally disabled and empty
        if (field.conditionalField && stepData[field.conditionalField]) {
            return false;
        }

        // Don't display empty optional fields for certain types
        const value = stepData[field.name];
        if (!field.required && (!value && value !== 0 && value !== false)) {
            return false;
        }

        return true;
    };

    // Render a single field
    const renderField = (field, stepData, stepName) => {
        if (!shouldDisplayField(field, stepData)) return null;

        const value = stepData[field.name];
        const formattedValue = formatFieldValue(field, value, stepData);

        return (
            <div key={field.name} className="mb-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {formattedValue}
                        </dd>
                    </div>
                </div>
            </div>
        );
    };

    // Render a section
    const renderSection = (section, stepData, stepName) => {
        const hasVisibleFields = section.fields.some(field => shouldDisplayField(field, stepData));

        if (!hasVisibleFields) return null;

        return (
            <div key={section.title} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    {section.title}
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.fields.map(field => renderField(field, stepData, stepName))}
                </dl>
            </div>
        );
    };

    // Render a complete step
    const renderStep = (stepName, stepConfig, stepData) => {
        const hasData = Object.keys(stepData).length > 0;

        if (!hasData) {
            return (
                <div key={stepName} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-yellow-800 mb-2">
                                {stepName}
                            </h2>
                            <p className="text-yellow-700">No data provided for this step.</p>
                        </div>
                        <button
                            onClick={() => onEdit(stepName.toLowerCase().replace(' ', '_'))}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                        >
                            Add Information
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div key={stepName} className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {stepName}
                    </h2>
                    <button
                        onClick={() => onEdit(stepName.toLowerCase().replace(' ', '_'))}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Edit
                    </button>
                </div>

                {stepConfig.sections.map(section =>
                    renderSection(section, stepData, stepName)
                )}
            </div>
        );
    };

    // Calculate completion status
    const getCompletionStatus = () => {
        const steps = [
            { name: 'Personal Details', data: allFormData.personalDetails },
            { name: 'License Details', data: allFormData.licenseDetails },
            { name: 'Applicant Documents', data: allFormData.applicantDocuments }
        ];

        const completedSteps = steps.filter(step => Object.keys(step.data).length > 0).length;
        const totalSteps = steps.length;

        return { completed: completedSteps, total: totalSteps };
    };

    const { completed, total } = getCompletionStatus();
    const isReadyToSubmit = completed === total;

    return (
        <div>
            <main>
                <div>
                    {/* Step Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
                            {steps.map((step, index) => (
                                <div key={step.name} className="flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                                        index === 3 ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}>
                                        <img src={step.icon} alt="" width={30} height={30} />
                                    </div>
                                    <span className={`font-medium text-sm ${
                                        index === 3 ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                        {step.name}
                                    </span>
                                    <div className={`w-25 h-1 mt-2 ${
                                        index === 3 ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}></div>
                                    <span className="text-gray-400 text-xs mt-1">Step {index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completion Status */}
                    <div className="mb-8">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Application Progress
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {completed} of {total} steps completed
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-4">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${(completed / total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {Math.round((completed / total) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review Sections */}
                    <div className="space-y-6">
                        {renderStep("Personal Details", personalDetailsConfig, allFormData.personalDetails)}
                        {/* Uncomment these when you have the config files */}
                        {/* {renderStep("License Details", licenseDetailsConfig, allFormData.licenseDetails)} */}
                        {/* {renderStep("Applicant Documents", applicantDocumentsConfig, allFormData.applicantDocuments)} */}
                    </div>

                    {/* Submission Warning/Confirmation */}
                    {!isReadyToSubmit && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Application Incomplete
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>Please complete all required steps before submitting your application.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isReadyToSubmit && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">
                                        Ready to Submit
                                    </h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>Your application is complete and ready for submission.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        {/* Left - Back button */}
                        <div>
                            <button
                                className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={onBack}
                            >
                                Back
                            </button>
                        </div>

                        {/* Right - Submit button */}
                        <div className="flex gap-4">
                            <button
                                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                onClick={() => {
                                    // Save current state and exit
                                    console.log('Saving and exiting...', allFormData);
                                }}
                            >
                                Save & Exit
                            </button>
                            <button
                                className={`px-8 py-2 rounded-md transition-colors ${
                                    isReadyToSubmit
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                                onClick={() => {
                                    if (isReadyToSubmit) {
                                        onProceed(allFormData);
                                    }
                                }}
                                disabled={!isReadyToSubmit}
                            >
                                {isReadyToSubmit ? 'Submit Application' : 'Complete All Steps'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FinalizeDetails;