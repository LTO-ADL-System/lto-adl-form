// frontend/src/pages/FinalizeDetails.jsx

import React, { useEffect, useState } from "react";
import useSessionState from "../hooks/useSessionState";
import { AppointmentModal } from "../components/AppointmentModal";

// Import all icons
import person from "../assets/person.svg";
import license from "../assets/license-details.svg";
import document from "../assets/documents.svg";
import finalize from "../assets/finalize.svg";
import car from "../assets/car.png";
import BlueDocu from "../assets/blue-docu.svg";
import A from "../assets/license_details/A.svg";
import A1 from "../assets/license_details/A1.svg";
import B from "../assets/license_details/B.svg";
import B1 from "../assets/license_details/B1.svg";
import B2 from "../assets/license_details/B2.svg";
import C from "../assets/license_details/C.svg";
import D from "../assets/license_details/D.svg";
import BE from "../assets/license_details/BE.svg";
import CE from "../assets/license_details/CE.svg";

const FinalizeDetails = ({ onBack, onNavigateToStep }) => {
    const {
        applicationData,
        isLoading,
        saveStatus,
        submitApplication,
        getLastSavedTime,
        isApplicationComplete,
        APPLICATION_STATUS
    } = useSessionState();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    // Icon mapping for dynamic imports
    const iconMap = {
        person,
        license,
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

    // Steps configuration - matching your existing pattern
    const steps = [
        { name: "Personal", icon: "person", index: 0 },
        { name: "License Details", icon: "license", index: 1 },
        { name: "Documents", icon: "document", index: 2 },
        { name: "Finalize", icon: "finalize", index: 3 }
    ];

    // Check if application is ready for submission
    const canSubmit = isApplicationComplete();

    const handleSaveAndExit = () => {
        // The session state is automatically maintained, so we just need to navigate away
        // You can add any additional cleanup or navigation logic here
        if (window.confirm("Your progress has been saved. Do you want to exit the application?")) {
            // This could navigate to dashboard or home page
            window.location.href = "/dashboard"; // Adjust based on your routing
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit) {
            alert("Please complete all required sections before submitting.");
            return;
        }
        setShowConfirmDialog(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        setShowConfirmDialog(false);

        try {
            const success = await submitApplication();
            if (success) {
                setSubmitSuccess(true);
                // Don't auto-redirect, let user choose to schedule appointment or go to dashboard
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert("An error occurred during submission. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepNavigation = () => (
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
                {steps.map((step, index) => (
                    <div key={step.name} className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                            index === 3 ? 'bg-blue-600' : 'bg-green-500'
                        }`}>
                            <img src={iconMap[step.icon]} alt="" width={30} height={30} />
                        </div>
                        <span className={`font-medium text-sm ${
                            index === 3 ? 'text-blue-600' : 'text-green-500'
                        }`}>
                            {step.name}
                        </span>
                        <div className={`w-25 h-1 mt-2 ${
                            index === 3 ? 'bg-blue-600' : 'bg-green-500'
                        }`}></div>
                        <span className="text-gray-400 text-xs mt-1">Step {step.index + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReadOnlyField = (label, value, isRequired = false, gridClass = "") => (
        <div className={`mb-4 ${gridClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 min-h-[40px] flex items-center">
                {value || <span className="text-gray-400 italic">Not provided</span>}
            </div>
        </div>
    );

    const renderCheckboxField = (label, checked, gridClass = "") => (
        <div className={`mb-4 ${gridClass}`}>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-not-allowed"
                    checked={checked || false}
                    readOnly
                    disabled
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            </div>
        </div>
    );

    const renderMultiSelectField = (label, values, isRequired = false, gridClass = "") => {
        const displayValue = Array.isArray(values) ? values.join(', ') : values;
        return renderReadOnlyField(label, displayValue, isRequired, gridClass);
    };

    const renderPersonalDetails = () => {
        const personalData = applicationData.personalDetails || {};
        return (
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#0433A9] mb-6 flex items-center">
                    <img src={iconMap.person} alt="Personal Icon" className="w-6 h-6 mr-2" />
                    Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderReadOnlyField("Last Name", personalData.family_name || personalData.lastName, true)}
                    {renderReadOnlyField("First Name", personalData.first_name || personalData.firstName, true)}
                    {renderReadOnlyField("Middle Name", personalData.middle_name || personalData.middleName)}
                    {renderReadOnlyField("Name Extension", personalData.name_extension || personalData.nameExtension)}
                    {renderReadOnlyField("Sex", personalData.sex, true)}
                    {renderReadOnlyField("Birthdate", personalData.birthdate, true)}
                    {renderReadOnlyField("Civil Status", personalData.civil_status || personalData.civilStatus, true)}
                    {renderReadOnlyField("Height (cm)", personalData.height)}
                    {renderReadOnlyField("Weight (kg)", personalData.weight)}
                    {renderReadOnlyField("Contact Number", personalData.contact_num || personalData.contactNumber, true)}
                    {renderReadOnlyField("Nationality", personalData.nationality, true)}
                    {renderReadOnlyField("Highest Educational Attainment", personalData.educational_attainment || personalData.education, true)}
                    {renderReadOnlyField("Birthplace", personalData.birthplace, true)}
                    {renderReadOnlyField("TIN", personalData.tin)}
                    {renderReadOnlyField("Father's Name", 
                        personalData.father_family_name ? 
                        `${personalData.father_first_name || ''} ${personalData.father_middle_name || ''} ${personalData.father_family_name}`.trim() : 
                        null
                    )}
                    {renderReadOnlyField("Mother's Name", 
                        personalData.mother_family_name ? 
                        `${personalData.mother_first_name || ''} ${personalData.mother_middle_name || ''} ${personalData.mother_family_name}`.trim() : 
                        null
                    )}
                    {renderReadOnlyField("Spouse's Name", 
                        personalData.spouse_family_name ? 
                        `${personalData.spouse_first_name || ''} ${personalData.spouse_middle_name || ''} ${personalData.spouse_family_name}`.trim() : 
                        null
                    )}
                </div>
            </div>
        );
    };

    const renderAddressDetails = () => {
        const personalData = applicationData.personalDetails || {};
        return (
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderReadOnlyField("House No./Unit No./Lot/Bldg.", personalData.house_address)}
                    {renderReadOnlyField("Street/Subdivision/Purok", personalData.street_address)}
                    {renderReadOnlyField("Barangay", personalData.barangay)}
                    {renderReadOnlyField("City/Municipality", personalData.municipality)}
                    {renderReadOnlyField("Province", personalData.province)}
                    {renderReadOnlyField("Region", personalData.region)}
                    {renderReadOnlyField("Zip Code", personalData.zip_code)}
                </div>
            </div>
        );
    };

    const renderEmploymentDetails = () => {
        const personalData = applicationData.personalDetails || {};
        return (
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderReadOnlyField("Employer's Business Name", personalData.employerBusinessName)}
                    {renderReadOnlyField("Employer's Telephone Number", personalData.employerTelephone)}
                    <div className="md:col-span-2">
                        {renderReadOnlyField("Employer's Contact Address", personalData.employerAddress)}
                    </div>
                </div>
            </div>
        );
    };

    const renderEmergencyContact = () => {
        const personalData = applicationData.personalDetails || {};
        return (
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderReadOnlyField("Emergency Contact's Name", personalData.emergencyContactName)}
                    {renderReadOnlyField("Emergency Contact's Telephone Number", personalData.emergencyContactNumber)}
                    <div className="md:col-span-3">
                        {renderCheckboxField("Same with Applicant Address", personalData.sameAsApplicantAddress)}
                    </div>
                    {!personalData.sameAsApplicantAddress && (
                        <>
                            {renderReadOnlyField("House No./Unit No./Lot/Bldg.", personalData.emergencyHouseNumber)}
                            {renderReadOnlyField("Street/Subdivision/Purok", personalData.emergencyStreet)}
                            {renderReadOnlyField("Barangay", personalData.emergencyBarangay)}
                            {renderReadOnlyField("City/Municipality", personalData.emergencyCity)}
                            {renderReadOnlyField("Province", personalData.emergencyProvince)}
                            {renderReadOnlyField("Region", personalData.emergencyRegion)}
                            {renderReadOnlyField("Zip Code", personalData.emergencyZipCode)}
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderLicenseDetails = () => {
        const licenseData = applicationData.licenseDetails || {};
        return (
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#0433A9] mb-6 flex items-center">
                    <img src={iconMap.car} alt="License Icon" className="w-6 h-6 mr-2" />
                    License Details
                </h2>

                {/* Application Type */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Application Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderCheckboxField("New Application", licenseData.newApplication)}
                        {renderCheckboxField("Renewal of Expiring or Expired License", licenseData.renewalOfExpiring)}
                        {renderCheckboxField("Duplicate License", licenseData.duplicateLicense)}
                    </div>
                </div>

                {/* Driver License Number */}
                {!licenseData.newApplication && (
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {renderReadOnlyField("Driver License Number", licenseData.driverLicenseNumber)}
                        </div>
                    </div>
                )}

                {/* Medical Information */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderReadOnlyField("Organ Donor", licenseData.organDonor === 'yes' ? 'Yes' : 'No')}
                        {renderMultiSelectField("Organs to Donate", 
                            Array.isArray(licenseData.organs) ? licenseData.organs.join(', ') : licenseData.organs, 
                            false, "md:col-span-1"
                        )}
                        {renderMultiSelectField("Driving Conditions", 
                            Array.isArray(licenseData.conditions) ? licenseData.conditions.join(', ') : licenseData.conditions, 
                            false, "md:col-span-1"
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {renderReadOnlyField("Blood Type", licenseData.blood_type || licenseData.bloodType)}
                        {renderReadOnlyField("Driving Skill Acquisition", licenseData.drivingSkill)}
                    </div>
                </div>

                {/* Vehicle Categories */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Selected Vehicle Categories</h3>
                    {licenseData.newApplication === true && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                <strong>New Applicant:</strong> Only vehicle categories A, A1, and B are available for new applications.
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {licenseData.vehicleCategories && licenseData.vehicleCategories.length > 0 ? (
                            licenseData.vehicleCategories.map((category) => (
                                <div
                                    key={category}
                                    className="flex flex-col items-center p-3 border-2 border-[#0433A9] rounded-lg bg-[#F0F4FC] shadow-sm"
                                >
                                    <img
                                        src={iconMap[category]}
                                        alt={category}
                                        className="w-16 h-12 mb-2"
                                    />
                                    <span className="text-sm font-semibold text-[#0433A9]">
                                        {category}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-4 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                                No vehicle categories selected
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderDocuments = () => {
        const documentsData = applicationData.documents || {};
        return (
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#0433A9] mb-6 flex items-center">
                    <img src={BlueDocu} alt="Document Icon" className="w-6 h-6 mr-2" />
                    Documents Uploaded
                </h2>
                <div className="space-y-4">
                    {documentsData.uploadedFiles && Object.keys(documentsData.uploadedFiles).length > 0 ? (
                        Object.entries(documentsData.uploadedFiles).map(([fieldName, file]) => (
                            <div key={fieldName} className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <p className="text-xs text-gray-600 capitalize">
                                            {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Uploaded
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No documents uploaded</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderApplicationSummary = () => {
        const personalData = applicationData.personalDetails || {};
        const licenseData = applicationData.licenseDetails || {};

        return (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Application Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="font-semibold text-blue-700 block mb-1">Applicant Name:</span>
                        <p className="text-blue-600 font-medium">
                            {personalData.first_name || personalData.firstName} {personalData.middle_name || personalData.middleName} {personalData.family_name || personalData.lastName} {personalData.name_extension || personalData.nameExtension}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="font-semibold text-blue-700 block mb-1">Application Type:</span>
                        <p className="text-blue-600 font-medium">
                            {licenseData.newApplication ? 'New Application' :
                                licenseData.additionalLicense ? 'Additional License' :
                                    licenseData.renewalOfExpiring ? 'License Renewal' : 'Other'}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="font-semibold text-blue-700 block mb-1">Vehicle Categories:</span>
                        <p className="text-blue-600 font-medium">
                            {licenseData.vehicleCategories && licenseData.vehicleCategories.length > 0
                                ? licenseData.vehicleCategories.join(', ')
                                : 'None selected'}
                        </p>
                    </div>
                </div>

                {/* Application Status */}
                <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <span className="font-semibold text-blue-700 block mb-1">Application Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            applicationData.status === APPLICATION_STATUS.COMPLETED ? 'bg-green-100 text-green-800' :
                                applicationData.status === APPLICATION_STATUS.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                            {applicationData.status === APPLICATION_STATUS.COMPLETED ? 'Ready to Submit' :
                                applicationData.status === APPLICATION_STATUS.IN_PROGRESS ? 'In Progress' :
                                    'Draft'}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="font-semibold text-blue-700 block mb-1">Last Saved:</span>
                        <p className="text-blue-600 text-sm">{getLastSavedTime() || 'Never'}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderNavigationButtons = () => (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {/* Left - Back button */}
            <div>
                {onBack && (
                    <button
                        className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                        onClick={onBack}
                        disabled={isSubmitting}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                )}
            </div>

            {/* Right - Save & Exit and Submit buttons */}
            <div className="flex gap-4">
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSaveAndExit}
                    disabled={isSubmitting}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save & Exit
                </button>
                <button
                    className={`px-6 py-2 text-white rounded-md transition-colors flex items-center ${
                        canSubmit
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-400 cursor-not-allowed'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canSubmit}
                    title={!canSubmit ? "Please complete all required sections before submitting" : ""}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit Application
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    const renderConfirmDialog = () => (
        showConfirmDialog && (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Submission</h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to submit your application? Once submitted, you won't be able to make changes.
                    </p>
                    <div className="flex gap-4 justify-end">
                        <button
                            className="px-4 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            onClick={() => setShowConfirmDialog(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            onClick={confirmSubmit}
                        >
                            Confirm Submit
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    const renderSuccessMessage = () => (
        submitSuccess && (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-center">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted Successfully!</h3>
                        <p className="text-gray-600 mb-4">
                            Your driver's license application has been submitted successfully. You can now schedule an appointment after your application is approved.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setShowAppointmentModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Schedule Appointment
                            </button>
                            <button 
                                onClick={() => window.location.href = "/home"}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    if (!applicationData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading application data...</p>
                </div>
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
                        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h1 className="text-3xl font-bold text-[#0433A9] flex items-center mb-2">
                                <img src={iconMap.finalize} alt="Finalize Icon" className="w-8 h-8 mr-3 text-blue-800" />
                                Review Application
                            </h1>
                            <p className="text-gray-600">
                                Please review all information before submitting your application. All fields are read-only.
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col">
                            {/* Application Summary */}
                            {renderApplicationSummary()}

                            {/* Render all sections */}
                            {renderPersonalDetails()}
                            {renderAddressDetails()}
                            {renderEmploymentDetails()}
                            {renderEmergencyContact()}
                            {renderLicenseDetails()}
                            {renderDocuments()}

                            {renderNavigationButtons()}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            {renderConfirmDialog()}
            {renderSuccessMessage()}
            
            {/* Appointment Modal */}
            <AppointmentModal
                isOpen={showAppointmentModal}
                onClose={() => setShowAppointmentModal(false)}
            />
        </div>
    );
};

export default FinalizeDetails;