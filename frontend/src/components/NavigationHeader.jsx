import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Madalto from '../assets/madalto.svg'

const NavigationHeader = ({ onLogout, currentUser }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = async (e) => {
        e.preventDefault();

        await onLogout();
        navigate('/');
    };

    return (
        <nav className="bg-[#03267F] shadow-lg flex items-center justify-between py-4.5 px-28 mx-0 fixed top-0 left-0 w-full">
            <div className="flex items-center gap-16">
                <Link to="/">
                    <span className="flex items-center justify-center gap-3">
                        <img src={Madalto} alt="Madalto" />
                    </span>
                </Link>

                {/*Link to Home*/}
                <Link
                    to="/"
                    className="group flex items-center gap-2 py-1 px-3 text-md font-semibold transition duration-300 relative"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 transition-colors duration-300"
                        viewBox="0 0 25 24"
                    >
                        <path d="M13.5607 2.25007C12.9749 1.66428 12.0251 1.66428 11.4393 2.25007L1.46967 12.2197C1.17678 12.5126 1.17678 12.9875 1.46967 13.2804C1.76256 13.5733 2.23744 13.5733 2.53033 13.2804L12.5 3.31073L22.4697 13.2804C22.7626 13.5733 23.2374 13.5733 23.5303 13.2804C23.8232 12.9875 23.8232 12.5126 23.5303 12.2197L20 8.68941V3.75007C20 3.33586 19.6642 3.00007 19.25 3.00007H17.75C17.3358 3.00007 17 3.33586 17 3.75007V5.68941L13.5607 2.25007Z" fill="white"/>
                        <path d="M12.5 4.93941L21.5 13.9394V20.2501C21.5 21.4927 20.4926 22.5001 19.25 22.5001H5.75C4.50736 22.5001 3.5 21.4927 3.5 20.2501V13.9394L12.5 4.93941Z" fill="white"/>
                    </svg>
                    Home
                    {/*active tab indicator */}
                    {isActive('/home') && (
                        <div className="absolute bottom-[-18px] left-0 right-0 h-1 bg-white rounded-t-full"></div>
                    )}
                </Link>

                {/*Link to Application*/}
                <Link
                    to="/application"
                    className="group flex items-center gap-2 py-1 px-3 text-md font-semibold rounded-2xl transition duration-300 relative"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4.5 h-4.5 transition-colors duration-300"
                        viewBox="0 0 24 24"
                    >
                        <path d="M14.25 0C14.6642 0 15 0.335786 15 0.75C15 1.16421 15.3358 1.5 15.75 1.5C16.1642 1.5 16.5 1.83579 16.5 2.25V3C16.5 3.41421 16.1642 3.75 15.75 3.75H8.25C7.83579 3.75 7.5 3.41421 7.5 3V2.25C7.5 1.83579 7.83579 1.5 8.25 1.5C8.66421 1.5 9 1.16421 9 0.75C9 0.335786 9.33579 0 9.75 0H14.25Z" fill="white"/>
                        <path d="M5.25 1.5H6.12803C6.04512 1.73458 6 1.98702 6 2.25V3C6 4.24264 7.00736 5.25 8.25 5.25H15.75C16.9926 5.25 18 4.24264 18 3V2.25C18 1.98702 17.9549 1.73458 17.872 1.5H18.75C19.9926 1.5 21 2.50736 21 3.75V21.75C21 22.9926 19.9926 24 18.75 24H5.25C4.00736 24 3 22.9926 3 21.75V3.75C3 2.50736 4.00736 1.5 5.25 1.5Z" fill="white"/>
                    </svg>
                    Application
                    {/*active tab indicator */}
                    {isActive('/application') && (
                        <div className="absolute bottom-[-18px] left-0 right-0 h-1 bg-white rounded-t-full"></div>
                    )}
                </Link>
            </div>

            {/*right div*/}
            <div className="flex items-center gap-5">
                {/*Logout Button*/}
                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-3 text-md rounded-2xl !py-0 transition duration-300 relative text-white !focus:outline-none !hover:outline-none !border-none"                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4.5 h-4.5 transition-colors duration-300"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default NavigationHeader;