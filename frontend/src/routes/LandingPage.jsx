//frontend/src/routes/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import MadaltoText from '../assets/madali_to.svg';
import BgImage from '../assets/bglanding.svg';

const LandingPage = () => {
    return (
        <div
            className="min-h-screen bg-[#F8F8F8] bg-no-repeat bg-center bottom-0 overflow-y-auto"
            style={{
                backgroundImage: `url(${BgImage})`,
                backgroundSize: '90%',
                backgroundPosition: 'center bottom 64px'
            }}
        >
            <main className="pt-20 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                {/*title pinakataas*/}
                                <div>
                                    <span className="flex items-start justify-start gap-3">
                                        <img src={MadaltoText} alt="Madalto" className="h-36" />
                                    </span>
                                </div>
                                <p className="text-xl font-light italic text-[#03267F] w-full pl-2">
                                    Your driver's license application—streamlined, simplified, and stress-free.
                                </p>
                            </div>

                            <div className="space-y-4 pl-2 mt-26">
                                <Link
                                    to="/register"
                                    className="cssbuttons-io-button inline-flex items-center gap-2 w-auto"
                                >
                                    Start Application
                                    <div className="icon">
                                        <svg
                                            height="24"
                                            width="24"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M0 0h24v24H0z" fill="none"></path>
                                            <path
                                                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                                fill="currentColor"
                                            ></path>
                                        </svg>
                                    </div>
                                </Link>


                                <p className="text-lg text-[#03267F] font-semibold pl-1">
                                    Madali lang. Click mo na.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;