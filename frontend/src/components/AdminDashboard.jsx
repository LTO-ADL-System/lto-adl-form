import React from "react";
import AdminNavBar from "./AdminNavBar";
import DashboardFrame from "./DashboardFrame";

export default function AdminDashboard() {
    return (
        <div
            style={{
                display: "flex",
                width: "100%",
                height: "100%",
                flexDirection: "column",
                alignItems: "center",
                gap: "57px",
                margin: "0 auto", // Center the dashboard on the page
                background: "var(--background, #F8F8F8)", // Set background color
            }}
        >
            <AdminNavBar />
            <DashboardFrame />
        </div>
    );
}