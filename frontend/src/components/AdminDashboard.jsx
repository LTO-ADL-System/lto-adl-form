import React from "react";
import AdminNavBar from "./AdminNavBar";
import DashboardFrame from "./DashboardFrame";

export default function AdminDashboard() {
    return (
        <div className="h-screen flex flex-col">
            {/* Navbar spacer */}
            <div className="h-16 flex-shrink-0"></div>
            {/* Main content area */}
            <div className="flex-1 flex items-stretch p-2 p-4 lg:p-12 bg-gray-100 min-h-0">
                <main className="w-full max-w-full mx-auto flex flex-col">
                    {/* Card container */}
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 overflow-visible w-full lg:w-[90%] flex-1 mx-auto flex flex-col min-h-0">
                        {/* Dashboard content (includes header) */}
                        <DashboardFrame />
                    </div>
                </main>
            </div>
            {/* Fixed AdminNavBar */}
            <AdminNavBar />
        </div>
    );
}