// frontend/src/routes/Application.jsx
import React, {useState} from 'react';
import { Clipboard } from 'lucide-react';
import InitialApplication from "../pages/InitialApplication.jsx";
import ApplicationType from '../pages/ApplicationType.jsx';
import PersonalDetails from '../pages/PersonalDetails.jsx';
import LicenseDetails from '../pages/LicenseDetails.jsx';
import ApplicationDocuments from '../pages/ApplicantDocuments.jsx';
import FinalizeDetails from '../pages/FinalizeDetails.jsx';

const Application = () => {
    const [currentComponent, setCurrentComponent] = useState('one');
    
    const onStartApplication = (componentName) => {
        setCurrentComponent(componentName);
    };
    
    const switchToTwo = () => {
        setCurrentComponent('two');
    }
    
    // Define the step flow
    const steps = {
        'one': { 
            component: <InitialApplication onStartApplication={switchToTwo} />,
            showHeader: true
        },
        'two': { 
            component: <ApplicationType onBack={() => setCurrentComponent('one')} onProceed={() => setCurrentComponent('three')} />,
            showHeader: true
        },
        'three': { 
            component: <PersonalDetails onProceed={() => setCurrentComponent('four')} onBack={() => setCurrentComponent('two')} />,
            showHeader: false
        },
        'four': { 
            component: <LicenseDetails onProceed={() => setCurrentComponent('five')} onBack={() => setCurrentComponent('three')} />,
            showHeader: false
        },
        'five': { 
            component: <ApplicationDocuments onProceed={() => setCurrentComponent('six')} onBack={() => setCurrentComponent('four')} />,
            showHeader: false
        },
        'six': {
            component: <FinalizeDetails onBack={() => setCurrentComponent('five')} />,
            showHeader: false
        }
    };

    // Get current step or fallback to initial
    const currentStep = steps[currentComponent] || steps['one'];
    
    return (
        <div className="h-screen flex flex-col">
            <div className="h-16 flex-shrink-0"></div>
            {/* main content area */}
            <div className="flex-1 overflow-auto p-2 p-4 lg:p-12 bg-gray-100">
                <main className="w-full max-w-full mx-auto flex flex-col min-h-full">
                    {/* card container */}
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 w-full lg:w-[90%] mx-auto flex flex-col border-2 lg:border-4 flex-1 min-h-fit">
                        {!currentStep.showHeader ? (
                            // Render form components without header wrapper
                            currentStep.component
                        ) : (
                            // Components with header wrapper
                            <>
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4 lg:mb-6 pb-4 border-b-2 border-gray-200 flex-shrink-0">
                                    <Clipboard className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-[#0433A9]" />
                                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#0433A9]">Application Overview</h1>
                                </div>
                                {/* Content area */}
                                <div className="flex-1">
                                    {currentStep.component}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Application;