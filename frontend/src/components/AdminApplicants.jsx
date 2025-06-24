import React from "react";
import AdminNavBar from "./AdminNavBar";

export default function AdminApplicants() {
    return (
        <div
            style={{
                display: "flex",
                width: "1512px",
                height: "982px",
                flexDirection: "column",
                alignItems: "center",
                gap: "57px",
                margin: "0 auto",
                background: "var(--background, #F8F8F8)",
                paddingBottom: "57px",
            }}
        >
            <AdminNavBar />
            <div
                className="bg-white rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 overflow-hidden w-full lg:w-[90%] h-full lg:h-[90%] mx-auto flex flex-col min-h-0"
            >
                {/* Header */}
                <div className="flex items-center gap-[10px] self-stretch mb-[32px]">
                    <span
                        style={{
                            width: "100%",
                            color: "#0433A9",
                            fontFamily: "Typold, sans-serif",
                            fontSize: "64px",
                            fontStyle: "normal",
                            fontWeight: 800,
                            lineHeight: "normal",
                        }}
                    >
                        Applicants
                    </span>
                </div>

                {/* Applicants Table Placeholder */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    <div className="w-full max-w-4xl">
                        <div className="text-center text-gray-400 text-xl font-semibold py-12">
                            {/* Replace this with your applicants table or list */}
                            No applicants to display yet.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}