// hooks/useSessionState.js

import { useState, useEffect, useCallback } from 'react';

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

    // Submit application (final step)
    const submitApplication = useCallback(async () => {
        try {
            setSaveStatus('saving');

            // Here you would typically send data to your backend API
            // For now, we'll just update the status
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

            // In a real app, you might want to clear the session after successful submission
            // setTimeout(() => clearSession(), 3000);

            return true;
        } catch (error) {
            console.error('Error submitting application:', error);
            setSaveStatus('error');
            return false;
        }
    }, []);

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