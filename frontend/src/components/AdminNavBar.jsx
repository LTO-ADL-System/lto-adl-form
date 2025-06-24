import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Madalto from "../assets/madalto.svg";
import houseFill from "../assets/house-fill.svg";
import applicantsIcon from "../assets/applicants.svg";
import bellFill from "../assets/bell-fill.svg";
import gearFill from "../assets/gear-fill.svg";
import authService from "../services/authService";

const AdminNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens and user data
    authService.logout();

    // Use navigate with replace to update path
    navigate("/", { replace: true });

    // Force full reload so that App re-runs its auth check and shows landing page
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#03267F] shadow-lg flex items-center justify-between py-4.5 px-28 mx-0 fixed top-0 left-0 w-full z-50">
      <div className="flex items-center gap-16">
        {/* Logo */}
        <Link to="/dashboard">
          <span className="flex items-center justify-center gap-3">
            <img src={Madalto} alt="Madalto" />
          </span>
        </Link>

        {/* Navigation */}
        <Link
          to="/dashboard"
          className="group flex items-center gap-2 py-1 px-3 text-md font-semibold transition duration-300 relative"
        >
          <img src={houseFill} alt="Dashboard" className="w-5 h-5" />
          Dashboard
          {/* active tab indicator */}
          {isActive("/dashboard") && (
            <div className="absolute bottom-[-18px] left-0 right-0 h-1 bg-white rounded-t-full"></div>
          )}
        </Link>
        <Link
          to="/applicants"
          className="group flex items-center gap-2 py-1 px-3 text-md font-semibold transition duration-300 relative"
        >
          <img src={applicantsIcon} alt="Applicants" className="w-5 h-5" />
          Applicants
          {/* active tab indicator */}
          {isActive("/applicants") && (
            <div className="absolute bottom-[-18px] left-0 right-0 h-1 bg-white rounded-t-full"></div>
          )}
        </Link>
      </div>

      {/* Right side: Notifications and Settings */}
      <div className="flex items-center gap-5">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 py-1 px-3 text-md font-light transition duration-300 relative text-white hover:text-gray-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavBar;