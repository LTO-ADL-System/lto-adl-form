import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MadaltoText from '../assets/madali_to.svg';
import AuthBg from '../assets/auth_bg.svg';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

const Register = ({ onRegister }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // ADD THIS LINE - New state for real-time password matching
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    // ADD THIS LINE - New state for real-time password length validation
    const [passwordLengthValid, setPasswordLengthValid] = useState(true);
    const navigate = useNavigate();

    // REPLACE YOUR EXISTING handleInputChange WITH THIS
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        setFormData(newFormData);

        // Check password match in real-time
        if (name === 'password' || name === 'confirmPassword') {
            const password = name === 'password' ? value : formData.password;
            const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
            setPasswordsMatch(password === confirmPassword || confirmPassword === '');
        }

        // Check password length in real-time
        if (name === 'password') {
            setPasswordLengthValid(value.length >= 6 || value.length === 0);
        }

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Client-side validation first
            if (formData.password.trim() !== formData.confirmPassword.trim()) {
                setError('Passwords do not match');
                setIsLoading(false);
                return;
            }

            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                setIsLoading(false);
                return;
            }

            // PROTOTYPE: Use the onRegister function passed from App.jsx
            const result = await onRegister(
                formData.email,
                formData.password,
                formData.confirmPassword
            );

            if (result.success) {
                // Navigate to confimation page after successful registration
                navigate('/confirmation');
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
            <main className="w-full max-w-[90%] mx-auto">
                {/* card container */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full h-[70vh]">
                    <div className="grid lg:grid-cols-2 h-full">
                        {/* Left Content - Illustration */}
                        <div className="bg-white p-4 md:p-8 flex flex-col justify-center items-center space-y-4 md:space-y-6">
                            {/* MadaLTO Title */}
                            <div className="text-center">
                                <img src={MadaltoText} alt="Madalto" className="h-26 mx-auto" />
                            </div>

                            {/* Illustration */}
                            <div className="flex justify-center items-center">
                                <div className="w-48 h-48 md:w-72 md:h-72">
                                    <img src={AuthBg} alt="MadaLTO Illustration" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Registration Form */}
                        <div className="bg-white p-4 md:p-8 flex flex-col justify-center">
                            <div className="max-w-sm mx-auto w-full">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-[#03267F] mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03267F] focus:border-transparent"
                                            placeholder="Enter your email"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-[#03267F] mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03267F] focus:border-transparent pr-12 ${
                                                    !passwordLengthValid && formData.password !== ''
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-200'
                                                }`}
                                                placeholder="Enter your password"
                                                required
                                                disabled={isLoading}
                                            />
                                            <p onClick={handleShowPassword} className="pr-1 cursor-pointer text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-[#03267F] text-xl">
                                                {showPassword ? <IoIosEye /> : <IoIosEyeOff />}
                                            </p>
                                        </div>
                                        {/* ADD THIS - Real-time password length indicator */}
                                        {formData.password !== '' && (
                                            <div className="mt-1 text-sm">
                                                {passwordLengthValid ? (
                                                    <span className="flex items-center">
                                                    {/*removed lines for valid indicator*/}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                        </svg>
                                                        Password must be at least 6 characters
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#03267F] mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03267F] focus:border-transparent pr-12 ${
                                                    !passwordsMatch && formData.confirmPassword !== ''
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-200'
                                                }`}
                                                placeholder="Confirm your password"
                                                required
                                                disabled={isLoading}
                                            />
                                            <p onClick={handleShowConfirmPassword} className="pr-1 cursor-pointer text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-[#03267F] text-xl">
                                                {showConfirmPassword ? <IoIosEye /> : <IoIosEyeOff />}
                                            </p>
                                        </div>
                                        {/* ADD THIS - Real-time password match indicator */}
                                        {formData.confirmPassword !== '' && (
                                            <div className="mt-1 text-sm">
                                                {passwordsMatch ? (
                                                    <span className="text-green-600 flex items-center">
                                                        {/*removed lines for valid indicator*/}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                        </svg>
                                                        Passwords do not match
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Register Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !passwordsMatch || !passwordLengthValid}
                                        className="w-full bg-[#03267F] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#022156] transition duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Registering...
                                            </div>
                                        ) : (
                                            'Register'
                                        )}
                                    </button>

                                    {/* Sign In Link */}
                                    <div className="text-center text-sm pt-4">
                                        <span className="text-gray-600">Already have an account? </span>
                                        <Link to="/signin" className="text-[#03267F] hover:underline font-medium">
                                            Sign In
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register;