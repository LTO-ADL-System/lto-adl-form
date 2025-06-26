// context/ApplicationFormContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the entire application
const initialState = {
    personalDetails: {},
    licenseDetails: {},
    documents: {},
    currentStep: 1,
    isFormValid: {
        personalDetails: false,
        licenseDetails: false,
        documents: false
    }
};

// Action types
const actionTypes = {
    UPDATE_PERSONAL_DETAILS: 'UPDATE_PERSONAL_DETAILS',
    UPDATE_LICENSE_DETAILS: 'UPDATE_LICENSE_DETAILS',
    UPDATE_DOCUMENTS: 'UPDATE_DOCUMENTS',
    SET_CURRENT_STEP: 'SET_CURRENT_STEP',
    SET_FORM_VALIDITY: 'SET_FORM_VALIDITY',
    RESET_FORM: 'RESET_FORM',
    SAVE_AND_EXIT: 'SAVE_AND_EXIT',
    SUBMIT_APPLICATION: 'SUBMIT_APPLICATION'
};

// Reducer function
const applicationFormReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_PERSONAL_DETAILS:
            return {
                ...state,
                personalDetails: {
                    ...state.personalDetails,
                    ...action.payload
                }
            };

        case actionTypes.UPDATE_LICENSE_DETAILS:
            return {
                ...state,
                licenseDetails: {
                    ...state.licenseDetails,
                    ...action.payload
                }
            };

        case actionTypes.UPDATE_DOCUMENTS:
            return {
                ...state,
                documents: {
                    ...state.documents,
                    ...action.payload
                }
            };

        case actionTypes.SET_CURRENT_STEP:
            return {
                ...state,
                currentStep: action.payload
            };

        case actionTypes.SET_FORM_VALIDITY:
            return {
                ...state,
                isFormValid: {
                    ...state.isFormValid,
                    [action.payload.step]: action.payload.isValid
                }
            };

        case actionTypes.RESET_FORM:
            return initialState;

        case actionTypes.SAVE_AND_EXIT:
            // In a real app, this would trigger an API call to save draft
            console.log('Saving application as draft...', state);
            return state;

        case actionTypes.SUBMIT_APPLICATION:
            // In a real app, this would trigger an API call to submit
            console.log('Submitting application...', state);
            return state;

        default:
            return state;
    }
};

// Create context
const ApplicationFormContext = createContext();

// Context provider component
export const ApplicationFormProvider = ({ children }) => {
    const [state, dispatch] = useReducer(applicationFormReducer, initialState);

    // Action creators
    const actions = {
        updatePersonalDetails: (data) => {
            dispatch({
                type: actionTypes.UPDATE_PERSONAL_DETAILS,
                payload: data
            });
        },

        updateLicenseDetails: (data) => {
            dispatch({
                type: actionTypes.UPDATE_LICENSE_DETAILS,
                payload: data
            });
        },

        updateDocuments: (data) => {
            dispatch({
                type: actionTypes.UPDATE_DOCUMENTS,
                payload: data
            });
        },

        setCurrentStep: (step) => {
            dispatch({
                type: actionTypes.SET_CURRENT_STEP,
                payload: step
            });
        },

        setFormValidity: (step, isValid) => {
            dispatch({
                type: actionTypes.SET_FORM_VALIDITY,
                payload: { step, isValid }
            });
        },

        resetForm: () => {
            dispatch({
                type: actionTypes.RESET_FORM
            });
        },

        saveAndExit: () => {
            dispatch({
                type: actionTypes.SAVE_AND_EXIT
            });
        },

        submitApplication: () => {
            dispatch({
                type: actionTypes.SUBMIT_APPLICATION
            });
        },

        // Utility functions
        validatePersonalDetails: (data) => {
            // Basic validation logic - you can expand this
            const requiredFields = [
                'family_name', 'first_name', 'sex', 'birthdate', 'civil_status',
                'height', 'weight', 'contact_num', 'nationality', 'educational_attainment',
                'birthplace', 'tin', 'region', 'province', 'municipality', 'zip_code',
                'barangay', 'street_address', 'house_address'
            ];

            const isValid = requiredFields.every(field => {
                const value = data[field];
                return value !== undefined && value !== null && value !== '';
            });

            actions.setFormValidity('personalDetails', isValid);
            return isValid;
        },

        // Get all form data for review
        getAllFormData: () => {
            return {
                personalDetails: state.personalDetails,
                licenseDetails: state.licenseDetails,
                documents: state.documents
            };
        },

        // Check if entire form is valid for submission
        isFormReadyForSubmission: () => {
            return Object.values(state.isFormValid).every(isValid => isValid);
        }
    };

    const contextValue = {
        ...state,
        ...actions
    };

    return (
        <ApplicationFormContext.Provider value={contextValue}>
            {children}
        </ApplicationFormContext.Provider>
    );
};

// Custom hook to use the context
export const useApplicationForm = () => {
    const context = useContext(ApplicationFormContext);
    if (!context) {
        throw new Error('useApplicationForm must be used within an ApplicationFormProvider');
    }
    return context;
};

// Export action types for use in components if needed
export { actionTypes };