import React, { useState, useEffect, useCallback } from "react";
import clockHistory from "../assets/clock-history.svg";
import mail from "../assets/mail.svg";
import clipboardcheck from "../assets/clipboardcheck.svg";
import adminService from "../services/adminService";

export default function DashboardFrame() {
    const [dashboardStats, setDashboardStats] = useState({
        total_applications: 0,
        pending_applications: 0,
        approved_applications: 0,
        rejected_applications: 0,
        total_applicants: 0,
        applications_today: 0,
        applications_this_month: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getDashboardStats();
            if (response.success && response.data) {
                setDashboardStats(response.data);
            } else {
                throw new Error('Failed to fetch dashboard statistics');
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err.message);
            // Set default stats on error to prevent blank screen
            setDashboardStats({
                total_applications: 0,
                pending_applications: 0,
                approved_applications: 0,
                rejected_applications: 0,
                total_applicants: 0,
                applications_today: 0,
                applications_this_month: 0
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    // Show loading state
    if (loading) {
        return (
            <div className="flex flex-col w-full max-w-full">
                <div className="flex items-center gap-[10px] self-stretch mb-[32px] overflow-x-auto">
                    <span
                        style={{
                            width: "100%",
                            maxWidth: "100%",
                            color: "#0433A9",
                            fontFamily: "Typold, sans-serif",
                            fontSize: "64px",
                            fontStyle: "normal",
                            fontWeight: 800,
                            lineHeight: "normal",
                            wordBreak: "break-word",
                        }}
                    >
                        Loading Dashboard...
                    </span>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col w-full max-w-full">
                <div className="flex items-center gap-[10px] self-stretch mb-[32px] overflow-x-auto">
                    <span
                        style={{
                            width: "100%",
                            maxWidth: "100%",
                            color: "#0433A9",
                            fontFamily: "Typold, sans-serif",
                            fontSize: "64px",
                            fontStyle: "normal",
                            fontWeight: 800,
                            lineHeight: "normal",
                            wordBreak: "break-word",
                        }}
                    >
                        Welcome Back, Admin!
                    </span>
                </div>
                <div className="text-red-600 text-center p-4">
                    Error loading dashboard data: {error}
                </div>
            </div>
        );
    }
  return (
    <div className="flex flex-col w-full max-w-full">
      {/* Header */}
      <div className="flex items-center gap-[10px] self-stretch mb-[32px] overflow-x-auto">
        <span
          style={{
            width: "100%",
            maxWidth: "100%",
            color: "#0433A9",
            fontFamily: "Typold, sans-serif",
            fontSize: "64px",
            fontStyle: "normal",
            fontWeight: 800,
            lineHeight: "normal",
            wordBreak: "break-word",
          }}
        >
          Welcome Back, Admin!
        </span>
      </div>

      <div className="flex flex-col gap-8 w-full">
        {/* Card 1 - Total Applications */}
        <div className="flex flex-wrap items-center gap-6 rounded-3xl bg-white shadow-md border border-gray-200 px-4 py-4 w-full overflow-x-auto">
          <img src={mail} alt="Mail" className="w-[48px] h-[48px] min-w-[48px]" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: "1 0 0",
              alignSelf: "stretch",
              color: "#0433A9",
              fontFamily: "Typold, sans-serif",
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              wordBreak: "break-word",
            }}
          >
            {dashboardStats.total_applicants} Total Applicants
          </div>
        </div>
        {/* Card 2 - Pending Applications */}
        <div className="flex flex-wrap items-center gap-6 rounded-3xl bg-white shadow-md border border-gray-200 px-4 py-4 w-full overflow-x-auto">
          <img src={clockHistory} alt="Pending" className="w-[48px] h-[48px] min-w-[48px]" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: "1 0 0",
              alignSelf: "stretch",
              color: "#0433A9",
              fontFamily: "Typold, sans-serif",
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              wordBreak: "break-word",
            }}
          >
            {dashboardStats.pending_applications} Pending Applications
          </div>
        </div>
        {/* Card 3 - Approved Applications */}
        <div className="flex flex-wrap items-center gap-6 rounded-3xl bg-white shadow-md border border-gray-200 px-4 py-4 w-full overflow-x-auto">
          <img src={clipboardcheck} alt="Processed" className="w-[48px] h-[48px] min-w-[48px]" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: "1 0 0",
              alignSelf: "stretch",
              color: "#0433A9",
              fontFamily: "Typold, sans-serif",
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              wordBreak: "break-word",
            }}
          >
            {dashboardStats.approved_applications} Approved Applications
          </div>
        </div>
      </div>
    </div>
  );
}