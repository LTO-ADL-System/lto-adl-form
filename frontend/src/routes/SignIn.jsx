// frontend/src/routes/SignIn.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MadaltoText from "../assets/madali_to.svg";
import AuthBg from "../assets/auth_bg.svg";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

const SignIn = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // PROTOTYPE: Use the onLogin function passed from App.jsx
            const result = await onLogin(formData.email, formData.password);

            if (result.success) {
                // Navigate to home page after successful sign in
                navigate('/home');
            } else {
                setError(result.message || 'Sign in failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
            <main className="w-full max-w-6xl mx-auto">
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

                        {/* Right Content - Sign In Form */}
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
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03267F] focus:border-transparent pr-12"
                                                placeholder="Enter your password"
                                                required
                                                disabled={isLoading}
                                            />
                                            <p onClick={handleShowPassword} className="pr-1 cursor-pointer text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-[#03267F] text-xl">
                                                {showPassword ? <IoIosEye /> : <IoIosEyeOff />}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between text-sm pt-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                checked={formData.rememberMe}
                                                onChange={handleInputChange}
                                                className="mr-2 h-4 w-4 accent-[#03267F] custom-checkbox rounded"
                                                disabled={isLoading}
                                            />
                                            <span className="text-[#03267F]/80">Remember Me</span>
                                        </label>
                                        <Link to="/forgot-password" className="text-[#03267F] hover:underline">
                                            Forgot Password
                                        </Link>
                                    </div>

                                    {/* Sign In Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#03267F] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#022156] transition duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </div>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </button>

                                    {/* Register Link */}
                                    <div className="text-center text-sm pt-4">
                                        <span className="text-gray-600">Don't have an account? </span>
                                        <Link to="/register" className="text-[#03267F] hover:underline font-medium">
                                            Register here
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

export default SignIn;