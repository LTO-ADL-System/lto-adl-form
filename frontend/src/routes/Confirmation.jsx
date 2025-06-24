// frontend/src/routes/Confirmation.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationSuccess from '../components/RegistrationSuccess.jsx';
import envelope from '../assets/envelope-fill.svg';

const Confirmation = ({ onConfirmation, userEmail, isLoading: appLoading }) => {
    const [code, setCode] = useState(['', '', '', '']);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (index, value) => {
        // only allow single digit
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // clear error when user starts typing
        if (error) setError('');

        // auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }

        // check if all fields are filled and validate
        const fullCode = newCode.join('');
        if (fullCode.length === 4) {
            handleOTPVerification(fullCode);
        }
    };

    const handleOTPVerification = async (otpCode) => {
        setIsLoading(true);
        setError('');

        try {
            const result = await onConfirmation(otpCode);
            
            if (result.success) {
                setVerificationResult(result);
                setShowSuccess(true);
            } else {
                setError(result.message || 'Invalid confirmation code. Please try again.');
                // clear the code after a short delay
                setTimeout(() => {
                    setCode(['', '', '', '']);
                    const firstInput = document.getElementById('code-0');
                    if (firstInput) firstInput.focus();
                }, 1000);
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError('Verification failed. Please try again.');
            // clear the code after a short delay
            setTimeout(() => {
                setCode(['', '', '', '']);
                const firstInput = document.getElementById('code-0');
                if (firstInput) firstInput.focus();
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (index, e) => {
        // handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleResendCode = () => {
        // TODO: Implement resend OTP functionality
        console.log('Resending code...');
        setError('');
        alert('Resend functionality will be implemented soon. Please check your email for the existing OTP.');
    };

    const handleSuccessContinue = () => {
        setShowSuccess(false);
        
        // Navigate based on the action (signup or login)
        if (verificationResult?.action === 'signup') {
            // For signup, redirect to landing page as per requirements
            navigate('/');
        } else {
            // For login, redirect to home page
            navigate('/home');
        }
    };

    // Redirect to signin if no user email (meaning no pending auth)
    if (!userEmail) {
        navigate('/signin');
        return null;
    }

    return (
        <>
            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
                <main className="w-full max-w-6xl mx-auto">
                    {/* card container */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full h-[70vh]">
                        {/*content*/}
                        <div className="flex flex-col items-center justify-center h-full gap-y-4 px-4">
                        <div className="flex justify-center mb-6">
                                <div className="rounded-lg flex items-center justify-center">
                                    <img src={envelope} alt="Envelope logo" className="h-32 w-32"/>
                                </div>
                            </div>

                            {/* title */}
                            <h1 className="text-2xl font-bold text-[#03267F] text-center mb-4">
                                Enter Confirmation Code
                            </h1>

                            {/* description */}
                            <p className="text-[#03267F] text-center mb-8">
                                Enter the confirmation code we have sent to<br />
                                <span className="text-[#03267F] font-medium">{userEmail}</span>
                            </p>

                            {/* error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 text-center">
                                    {error}
                                </div>
                            )}

                            {/* loading Message */}
                            {isLoading && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-sm mb-6 text-center">
                                    Verifying code...
                                </div>
                            )}

                            {/* code input fields */}
                            <div className="flex justify-center space-x-4 mb-8">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        disabled={isLoading || appLoading}
                                        className={`w-14 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03267F] ${
                                            digit
                                                ? 'border-[#03267F] bg-blue-50'
                                                : error
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                        } ${isLoading || appLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        //we can add a placeholder here
                                        placeholder=" "
                                    />
                                ))}
                            </div>

                            {/* resend code */}
                            <div className="text-center">
                                <span className="text-gray-600 text-sm">Didn't receive a code? </span>
                                <button
                                    onClick={handleResendCode}
                                    disabled={isLoading || appLoading}
                                    className="text-[#03267F] text-sm font-medium hover:underline disabled:opacity-50"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* success modal */}
            {showSuccess && (
                <ConfirmationSuccess onContinue={handleSuccessContinue} />
            )}
        </>
    );
};

export default Confirmation;