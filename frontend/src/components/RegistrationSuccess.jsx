// frontend/src/components/RegistrationSuccess.jsx

import React, { useEffect, useState } from 'react';
import BlueMadalto from '../assets/bluemadalto.svg';

const RegistrationSuccess = ({ onContinue }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // trigger animation after component mounts
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        setIsVisible(false);
        // wait for animation to complete before calling onContinue
        setTimeout(() => {
            onContinue();
        }, 300);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30 ">

        <main className="w-full max-w-6xl mx-auto">
                <div className={`bg-white rounded-2xl shadow-lg overflow-hidden w-[90%] h-[75vh] mx-auto transform transition-all duration-300 ease-out pointer-events-auto border border-gray-200 ${
                    isVisible
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                }`}>
                    <div className="p-8 flex flex-col justify-center items-center h-full">
                {/* logo section */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2 ">
                        <img src={BlueMadalto} alt={"MadaLTO"} className={"w-156"}/>
                    </div>
                </div>

                {/* success message */}
                <h2 className="text-3xl font-semibold py-4 text-[#03267F] text-center mb-6">
                    Thank you for Registering with us!
                </h2>

                {/* description */}
                <div className="text-center text-[#03267F] space-y-3 mb-8">
                    <p>
                        Welcome to <span className="font-bold text-[#03267F]">MadaLTO</span> – the official online portal for digitized ADL
                        <br/> (Application for Driver's License) forms under the Land Transportation Office.

                    </p>

                    <p>
                        No more tedious writing on long forms, no more back-and-forth.
                    </p>
                    <p>
                        Just fill-out, submit, and you're on your way.
                    </p>
                </div>

                {/* continue button */}
                        <div className="flex items-center justify-center mb-6 my-6">
                <button
                    onClick={handleContinue}
                    className="w-[20vh] bg-[#03267F] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#022156] transition duration-200"
                >
                    Continue
                </button>
                        </div>
                    </div>
                </div>
            </main>
            </div>
    );
};

export default RegistrationSuccess;