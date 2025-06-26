// frontend/src/components/NoApplicationContent.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import pencil from '../assets/pencil-fill.svg';

const NoApplicationContent = () => (
    <div className="flex flex-col h-full min-h-0">
        <div className="flex-shrink-0">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0433A9] mb-3">
                You have no outgoing <br />application.
            </h3>
        </div>

        {/*<div className="flex-1 flex flex-col justify-end min-h-0">*/}
        <div className="mt-2 lg:mt-0 lg:py-0 ">
            <Link to="/application">
                <button className="bg-[#0433A9] text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                    Start Application
                    <img src={pencil} alt="pencil" className="w-3 sm:w-3.5 lg:w-4" />
                </button>
            </Link>
        </div>
        {/*</div>*/}
    </div>
);

export default NoApplicationContent;