//frontend/src/routes/Register.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MadaltoText from '../assets/madali_to.svg';
import AuthBg from '../assets/auth_bg.svg';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";


const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle registration logic here
        console.log('Registration data:', formData);
    };

    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    return (
        <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">

            <main className="w-full max-w-6xl mx-auto">

                {/* card container */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full h-[70vh]">
                    <div className="grid lg:grid-cols-2 h-full">
                        {/* Left Content - Illustration */}
                        <div className="bg-white p-4 md:p-8 flex flex-col justify-center items-center space-y-4 md:space-y-6">                            {/* MadaLTO Title */}
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
                                            />
                                            <p onClick={handleShowPassword} className="pr-1 cursor-pointer text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2  hover:text-[#03267F] text-xl">
                                                {showPassword ? <IoIosEye /> : <IoIosEyeOff />}</p>
                                        </div>
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
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03267F] focus:border-transparent pr-12"
                                                placeholder="Confirm your password"
                                                required
                                            />
                                            <p onClick={handleShowConfirmPassword} className=" pr-1 cursor-pointer text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2  hover:text-[#03267F] text-xl">
                                                {showConfirmPassword ? <IoIosEye /> : <IoIosEyeOff />}</p>
                                        </div>
                                    </div>



                                    {/* Register Button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-[#03267F] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#022156] transition duration-200 mt-6"
                                    >
                                        Register
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