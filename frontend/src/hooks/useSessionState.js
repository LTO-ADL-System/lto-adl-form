// hooks/useSessionState.js

import { useState, useEffect, useCallback } from 'react';
import applicationService from '../services/applicationService.js';

// Session storage keys
const STORAGE_KEYS = {
    PERSONAL_DETAILS: 'application_personal_details',
    LICENSE_DETAILS: 'application_license_details',
    DOCUMENTS: 'application_documents',
    APPLICATION_STATUS: 'application_status',
    USER_SESSION: 'user_session'
};

// Application status constants
const APPLICATION_STATUS = {
    DRAFT: 'draft',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SUBMITTED: 'submitted'
};

const useSessionState = () => {
    const [applicationData, setApplicationData] = useState({
        personalDetails: {},
        licenseDetails: {},
        documents: {},
        status: APPLICATION_STATUS.DRAFT,
        lastSaved: null,
        currentStep: 1
    });

    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

    // Initialize session data from sessionStorage on mount
    useEffect(() => {
        const initializeSession = () => {
            try {
                const personalDetails = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.PERSONAL_DETAILS) || '{}');
                const licenseDetails = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.LICENSE_DETAILS) || '{}');
                const documents = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '{}');
                const appStatus = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.APPLICATION_STATUS) || '{}');

                setApplicationData({
                    personalDetails,
                    licenseDetails,
                    documents,
                    status: appStatus.status || APPLICATION_STATUS.DRAFT,
                    lastSaved: appStatus.lastSaved || null,
                    currentStep: appStatus.currentStep || 1
                });
            } catch (error) {
                console.error('Error loading session data:', error);
                // Reset to default state if there's an error
                setApplicationData({
                    personalDetails: {},
                    licenseDetails: {},
                    documents: {},
                    status: APPLICATION_STATUS.DRAFT,
                    lastSaved: null,
                    currentStep: 1
                });
            } finally {
                setIsLoading(false);
            }
        };

        initializeSession();
    }, []);

    // Save data to sessionStorage
    const saveToSession = useCallback((stepData, stepType, currentStep = null) => {
        try {
            setSaveStatus('saving');

            // Update sessionStorage
            sessionStorage.setItem(STORAGE_KEYS[stepType], JSON.stringify(stepData));

            // Update application status
            const statusData = {
                status: APPLICATION_STATUS.IN_PROGRESS,
                lastSaved: new Date().toISOString(),
                currentStep: currentStep || applicationData.currentStep
            };

            sessionStorage.setItem(STORAGE_KEYS.APPLICATION_STATUS, JSON.stringify(statusData));

            // Update local state
            setApplicationData(prev => ({
                ...prev,
                [stepType.toLowerCase().replace('_', '')]: stepData,
                status: statusData.status,
                lastSaved: statusData.lastSaved,
                currentStep: statusData.currentStep
            }));

            setSaveStatus('saved');

            // Reset save status after 2 seconds
            setTimeout(() => setSaveStatus('idle'), 2000);

            return true;
        } catch (error) {
            console.error('Error saving to session:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 2000);
            return false;
        }
    }, [applicationData.currentStep]);

    // Save personal details
    const savePersonalDetails = useCallback((data, currentStep = 1) => {
        return saveToSession(data, 'PERSONAL_DETAILS', currentStep);
    }, [saveToSession]);

    // Save license details
    const saveLicenseDetails = useCallback((data, currentStep = 2) => {
        return saveToSession(data, 'LICENSE_DETAILS', currentStep);
    }, [saveToSession]);

    // Save documents
    const saveDocuments = useCallback((data, currentStep = 3) => {
        return saveToSession(data, 'DOCUMENTS', currentStep);
    }, [saveToSession]);

    // Update current step
    const updateCurrentStep = useCallback((step) => {
        const statusData = {
            status: applicationData.status,
            lastSaved: applicationData.lastSaved,
            currentStep: step
        };

        sessionStorage.setItem(STORAGE_KEYS.APPLICATION_STATUS, JSON.stringify(statusData));

        setApplicationData(prev => ({
            ...prev,
            currentStep: step
        }));
    }, [applicationData.status, applicationData.lastSaved]);

    // Clear session data
    const clearSession = useCallback(() => {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                if (key !== STORAGE_KEYS.USER_SESSION) {
                    sessionStorage.removeItem(key);
                }
            });

            setApplicationData({
                personalDetails: {},
                licenseDetails: {},
                documents: {},
                status: APPLICATION_STATUS.DRAFT,
                lastSaved: null,
                currentStep: 1
            });

            return true;
        } catch (error) {
            console.error('Error clearing session:', error);
            return false;
        }
    }, []);

    // Helper function to map frontend vehicle categories to backend format
    const mapVehicleCategoriesToBackend = (categories) => {
        // Frontend to LTO backend mapping
        const categoryMapping = {
            'A': 'VCID_L4',    // Motorcycle
            'A1': 'VCID_L1',   // Tricycle
            'B': 'VCID_L6',    // Car/Light Vehicle
            'B1': 'VCID_N2',   // Light Truck
            'B2': 'VCID_N3',   // Medium Truck/Bus
            'C': 'VCID_O1',    // Heavy Truck
            'D': 'VCID_M3',    // Heavy Bus
            'BE': 'VCID_O2',   // Car with Trailer
            'CE': 'VCID_O4'    // Truck with Trailer
        };
        
        return categories.map(category => {
            if (category.startsWith('VCID_')) {
                return category; // Already in correct format
            }
            
            const mappedCategory = categoryMapping[category];
            if (!mappedCategory) {
                console.warn(`Unknown vehicle category: ${category}`);
                return category; // Return as-is if no mapping found
            }
            
            return mappedCategory;
        });
    };

    // Submit application (final step)
    const submitApplication = useCallback(async () => {
        try {
            setSaveStatus('saving');

            // -------------------------------------------------------------
            // 1) Build form data from the session state
            // -------------------------------------------------------------

            const { personalDetails, licenseDetails, documents } = applicationData;

            // Debug: log session data structure
            console.log('=== SESSION DATA STRUCTURE ===');
            console.log('Personal Details Keys:', personalDetails ? Object.keys(personalDetails) : 'null');
            console.log('Personal Details:', personalDetails);
            console.log('License Details Keys:', licenseDetails ? Object.keys(licenseDetails) : 'null');
            console.log('License Details:', licenseDetails);
            console.log('Documents:', documents);
            
            // Log specific fields to check if they're captured
            console.log('=== SPECIFIC FIELD CHECK ===');
            console.log('Father name:', personalDetails?.father_family_name);
            console.log('Mother name:', personalDetails?.mother_family_name);
            console.log('Spouse name:', personalDetails?.spouse_family_name);
            console.log('TIN:', personalDetails?.tin);
            console.log('Emergency contact:', personalDetails?.emergencyContactName);
            console.log('Employer:', personalDetails?.employerBusinessName);
            console.log('Organ donor:', licenseDetails?.organDonor);
            console.log('Organs:', licenseDetails?.organs);
            console.log('Driving skill:', licenseDetails?.drivingSkill);
            console.log('Conditions:', licenseDetails?.conditions);

            // Helper: determine application type based on license details flags
            const determineApplicationType = () => {
                if (licenseDetails?.newApplication) return 'ATID_A';
                if (licenseDetails?.renewalOfExpiring || licenseDetails?.renewalOfExpired) return 'ATID_B';
                if (licenseDetails?.duplicateLicense) return 'ATID_D';
                // Fallback – treat as new application
                return 'ATID_A';
            };

            const applicationType = determineApplicationType();

            // Vehicle categories and clutch types - MAP TO BACKEND FORMAT
            const frontendVehicleCategories = licenseDetails?.vehicleCategories || [];
            const vehicleCategories = mapVehicleCategoriesToBackend(frontendVehicleCategories);
            
            // If the user hasn't provided clutch type preferences, default to "Manual" for every category
            const clutchTypes = licenseDetails?.clutchTypes && licenseDetails.clutchTypes.length === vehicleCategories.length
                ? licenseDetails.clutchTypes
                : vehicleCategories.map(() => 'Manual');

            // Combine address fields into a single string
            const buildAddressString = () => {
                const parts = [
                    personalDetails?.house_address,
                    personalDetails?.street_address,
                    personalDetails?.barangay,
                    personalDetails?.municipality,
                    personalDetails?.province,
                    personalDetails?.region,
                    personalDetails?.zip_code
                ].filter(Boolean);
                return parts.join(', ');
            };

            // Personal info mapping according to applicationService expectations
            const personalInfo = {
                familyName: personalDetails?.family_name || personalDetails?.lastName || '',
                firstName: personalDetails?.first_name || personalDetails?.firstName || '',
                middleName: personalDetails?.middle_name || personalDetails?.middleName || '',
                address: buildAddressString(),
                contactNum: (() => {
                    let raw = personalDetails?.contact_num || personalDetails?.contactNumber || '';
                    if (!raw) return '';
                    raw = raw.replace(/\s+/g, ''); // remove spaces
                    if (raw.startsWith('0')) {
                        // Convert 09xxxxxxxxx to +639xxxxxxxxx
                        return '+63' + raw.slice(1);
                    } else if (raw.startsWith('9') && raw.length === 10) {
                        return '+63' + raw;
                    }
                    return raw;
                })(),
                nationality: personalDetails?.nationality || 'Filipino',
                birthdate: personalDetails?.birthdate || '',
                birthplace: personalDetails?.birthplace || '',
                height: personalDetails?.height ? parseFloat(personalDetails.height) : null,
                weight: personalDetails?.weight ? parseFloat(personalDetails.weight) : null,
                eyeColor: personalDetails?.eye_color || personalDetails?.eyeColor || 'Brown',
                civilStatus: personalDetails?.civil_status || personalDetails?.civilStatus || '',
                educationalAttainment: (() => {
                    const edu = personalDetails?.educational_attainment || personalDetails?.education || '';
                    if (edu === 'Post Graduate') return 'Postgraduate';
                    // normalize common variants
                    if (edu === 'Highschool') return 'High School';
                    return edu;
                })(),
                bloodType: (() => {
                    // Check both personal details and license details for blood type
                    const bloodType = personalDetails?.blood_type || personalDetails?.bloodType || 
                                     licenseDetails?.blood_type || licenseDetails?.bloodType;
                    
                    if (!bloodType) return 'O+'; // Default
                    
                    // Convert frontend values to backend enum values
                    const bloodTypeMap = {
                        'Apos': 'A+',
                        'Aneg': 'A-',
                        'Bpos': 'B+',
                        'Bneg': 'B-',
                        'ABpos': 'AB+',
                        'ABneg': 'AB-',
                        'Opos': 'O+',
                        'Oneg': 'O-'
                    };
                    
                    return bloodTypeMap[bloodType] || bloodType || 'O+';
                })(),
                sex: personalDetails?.sex || '',
                tin: personalDetails?.tin || null,
                isOrganDonor: (() => {
                    // Check organ donation from license details
                    const organDonor = licenseDetails?.organDonor || personalDetails?.organDonor;
                    return organDonor === 'yes' || organDonor === true;
                })()
            };

            // License details mapping
            const licenseDetailsPayload = {
                existingLicenseNumber: licenseDetails?.driverLicenseNumber || licenseDetails?.existingLicenseNumber || null,
                licenseExpiryDate: licenseDetails?.licenseExpiryDate || null,
                licenseRestrictions: licenseDetails?.licenseRestrictions || null
            };

            // Documents mapping
            const documentsArray = [];
            if (documents && documents.uploadedFiles) {
                Object.entries(documents.uploadedFiles).forEach(([fieldName, file]) => {
                    documentsArray.push({
                        document_type_id: fieldName,
                        document_name: file.name,
                        // The backend expects a file path; if file upload handling is separate,
                        // this can be null or handled accordingly on the backend.
                        file_path: null,
                        notes: null
                    });
                });
            }

            // -------------------------------------------------------------
            // Validate required fields (basic front-end guard)
            // -------------------------------------------------------------
            const requiredPersonalFields = [
                'familyName', 'firstName', 'birthdate', 'birthplace',
                'height', 'weight', 'contactNum', 'civilStatus',
                'educationalAttainment', 'sex'
            ];

            const missingFields = requiredPersonalFields.filter(k => {
                const val = personalInfo[k];
                if (val === undefined || val === null || val === '' || (typeof val === 'number' && val <= 0)) {
                    return true;
                }
                return false;
            });

            if (missingFields.length > 0) {
                alert(`Please complete the following required information before submitting: ${missingFields.join(', ')}`);
                setSaveStatus('idle');
                return false;
            }

            if (vehicleCategories.length === 0) {
                alert('Please select at least one vehicle category before submitting.');
                setSaveStatus('idle');
                return false;
            }

            if (documentsArray.length === 0) {
                console.log('No documents uploaded - proceeding anyway');
            }

            // Build emergency contacts from personal details
            const emergencyContacts = [];
            if (personalDetails?.emergencyContactName && personalDetails?.emergencyContactNumber) {
                emergencyContacts.push({
                    ec_name: personalDetails.emergencyContactName,
                    ec_contact_no: personalDetails.emergencyContactNumber,
                    ec_address: personalDetails.sameAsApplicantAddress 
                        ? buildAddressString()
                        : [
                            personalDetails?.emergencyHouseNumber,
                            personalDetails?.emergencyStreet,
                            personalDetails?.emergencyBarangay,
                            personalDetails?.emergencyCity,
                            personalDetails?.emergencyProvince,
                            personalDetails?.emergencyRegion,
                            personalDetails?.emergencyZipCode
                        ].filter(Boolean).join(', ')
                });
            }

            // Build employment info from personal details
            const employmentInfo = [];
            if (personalDetails?.employerBusinessName) {
                employmentInfo.push({
                    employer_business_name: personalDetails.employerBusinessName,
                    employer_telephone: personalDetails.employerTelephone || '',
                    employer_address: personalDetails.employerAddress || ''
                });
            }

            // Build family info from personal details
            const familyInfo = [];
            
            // Father's information
            if (personalDetails?.father_family_name && !personalDetails?.father_deceased) {
                familyInfo.push({
                    relation_type: 'Father',
                    family_name: personalDetails.father_family_name,
                    first_name: personalDetails.father_first_name || '',
                    middle_name: personalDetails.father_middle_name || ''
                });
            }

            // Mother's information
            if (personalDetails?.mother_family_name && !personalDetails?.mother_deceased) {
                familyInfo.push({
                    relation_type: 'Mother',
                    family_name: personalDetails.mother_family_name,
                    first_name: personalDetails.mother_first_name || '',
                    middle_name: personalDetails.mother_middle_name || ''
                });
            }

            // Spouse's information
            if (personalDetails?.spouse_family_name && !personalDetails?.spouse_deceased) {
                familyInfo.push({
                    relation_type: 'Spouse',
                    family_name: personalDetails.spouse_family_name,
                    first_name: personalDetails.spouse_first_name || '',
                    middle_name: personalDetails.spouse_middle_name || ''
                });
            }

            // Assemble the temporary form data structure expected by applicationService.formatApplicationData
            const formData = {
                applicationType,
                vehicleCategories,
                clutchTypes,
                additionalRequirements: licenseDetails?.additionalRequirements || '',
                personalInfo,
                licenseDetails: licenseDetailsPayload,
                documents: documentsArray,
                emergencyContacts,
                employmentInfo,
                familyInfo,
                // Additional data for driving skills and organ donation
                additionalData: {
                    drivingSkill: licenseDetails?.drivingSkill || null,
                    organs: licenseDetails?.organs || null,
                    conditions: licenseDetails?.conditions || null,
                    driverLicenseNumber: licenseDetails?.driverLicenseNumber || null
                }
            };

            // Format according to backend schema
            const formattedPayload = applicationService.formatApplicationData(formData);

            // Debug: log the formatted payload
            console.log('=== FORMATTED PAYLOAD FOR BACKEND ===');
            console.log('Application Type:', formattedPayload.application_type_id);
            console.log('Frontend Vehicle Categories:', frontendVehicleCategories);
            console.log('Mapped Vehicle Categories:', formattedPayload.vehicle_categories);
            console.log('Clutch Types:', formattedPayload.clutch_types);
            console.log('Personal Info:', formattedPayload.personal_info);
            console.log('License Details:', formattedPayload.license_details);
            console.log('Documents:', formattedPayload.documents);
            console.log('Full Payload:', JSON.stringify(formattedPayload, null, 2));

            // -------------------------------------------------------------
            // 2) Submit to backend
            // -------------------------------------------------------------
            const response = await applicationService.submitCompleteApplication(formattedPayload);

            // -------------------------------------------------------------
            // 3) Handle response
            // -------------------------------------------------------------
            if (response?.success) {
            const statusData = {
                status: APPLICATION_STATUS.SUBMITTED,
                lastSaved: new Date().toISOString(),
                currentStep: 4,
                submittedAt: new Date().toISOString()
            };

            sessionStorage.setItem(STORAGE_KEYS.APPLICATION_STATUS, JSON.stringify(statusData));

            setApplicationData(prev => ({
                ...prev,
                status: statusData.status,
                lastSaved: statusData.lastSaved,
                currentStep: statusData.currentStep,
                submittedAt: statusData.submittedAt
            }));

            setSaveStatus('saved');
            return true;
            }

            // If response.success is false, treat as error
            throw new Error(response?.message || 'Submission failed');

        } catch (error) {
            console.error('Error submitting application:', error);
            setSaveStatus('error');
            return false;
        }
    }, [applicationData]);

    // Get formatted last saved time
    const getLastSavedTime = useCallback(() => {
        if (!applicationData.lastSaved) return null;

        const lastSaved = new Date(applicationData.lastSaved);
        const now = new Date();
        const diffInMinutes = Math.floor((now - lastSaved) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        return lastSaved.toLocaleDateString();
    }, [applicationData.lastSaved]);

    // Check if application is complete
    const isApplicationComplete = useCallback(() => {
        const hasPersonalDetails = Object.keys(applicationData.personalDetails).length > 0;
        const hasLicenseDetails = Object.keys(applicationData.licenseDetails).length > 0;
        const hasDocuments = Object.keys(applicationData.documents).length > 0;

        return hasPersonalDetails && hasLicenseDetails && hasDocuments;
    }, [applicationData]);

    // Auto-save functionality (optional)
    const enableAutoSave = useCallback((stepData, stepType, interval = 30000) => {
        const autoSaveInterval = setInterval(() => {
            if (Object.keys(stepData).length > 0) {
                saveToSession(stepData, stepType);
            }
        }, interval);

        return () => clearInterval(autoSaveInterval);
    }, [saveToSession]);

    return {
        // Data
        applicationData,
        isLoading,
        saveStatus,

        // Actions
        savePersonalDetails,
        saveLicenseDetails,
        saveDocuments,
        updateCurrentStep,
        clearSession,
        submitApplication,

        // Utilities
        getLastSavedTime,
        isApplicationComplete,
        enableAutoSave,

        // Constants
        APPLICATION_STATUS,
        STORAGE_KEYS
    };
};

export default useSessionState;