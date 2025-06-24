import React from 'react';
import { Link } from 'react-router-dom';
import BlueMadalto from '../assets/bluemadalto.svg';

const OnboardingNavBar = () => {
    return (
        <nav className="bg-white shadow-lg flex items-center justify-between py-3 px-28 mx-0 fixed top-0 left-0 w-full">
            <div className="flex items-center">
                <Link to="/">
                    <span className="flex items-center justify-center gap-3">
                        <img src={BlueMadalto} alt="Madalto" className="h-8" />
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link
                    to="/register"
                    className="bg-[#03267F] border-2 border-[#03267F] hover:bg-[#03267F]/90 text-white px-6 py-2 rounded-3xl transition duration-300 font-medium"
                >
                    Register
                </Link>

                <Link
                    to="/signin"
                    className="box-border text-[#03267F] border-2 border-[#03267F] hover:bg-[#03267F]/20 px-6 py-2 rounded-3xl transition duration-300 font-medium"
                >
                    Sign In
                </Link>


            </div>
        </nav>
    );
};

export default OnboardingNavBar;