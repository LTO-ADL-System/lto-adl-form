import React from "react";

export default function AdminApplicantPreviewHeader({ allSelected, onSelectAll }) {
    return (
        <div
            className="grid"
            style={{
                width: "1088px",
                height: "40px",
                padding: "4px 12px",
                rowGap: "72px",
                gridTemplateRows: "repeat(1, minmax(0, 1fr))",
                gridTemplateColumns: "auto 1fr 1fr auto auto auto",
                alignItems: "center",
                borderTop: "2px solid #BDBDBF",
                borderBottom: "2px solid #BDBDBF",
                background: "#FBFBFE",
            }}
        >
            {/* Select All Checkbox */}
            <div
                className="flex items-center justify-center"
                style={{
                    height: 24,
                    padding: "8px 12px",
                    borderRadius: 8,
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "normal",
                    textAlign: "center",
                    gap: 10,
                    alignSelf: "stretch",
                    width: 24,
                    flexShrink: 0,
                    cursor: "pointer",
                }}
                onClick={onSelectAll}
                tabIndex={0}
            >
                {allSelected ? (
                    // Checked SVG
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M13.4545 7.4545C13.8939 7.01517 14.6062 7.01517 15.0455 7.4545C15.4795 7.88846 15.4848 8.58872 15.0615 9.02921L9.07316 16.5146C9.06452 16.5254 9.05528 16.5357 9.0455 16.5455C8.60616 16.9848 7.89385 16.9848 7.45451 16.5455L3.48484 12.5758C3.0455 12.1365 3.0455 11.4242 3.48484 10.9848C3.92418 10.5455 4.63649 10.5455 5.07583 10.9848L8.21611 14.1251L13.4247 7.48816C13.4339 7.47635 13.4439 7.46511 13.4545 7.4545Z" fill="#03267F"/>
                        <path d="M12.0739 15.1649L13.4545 16.5455C13.8939 16.9848 14.6062 16.9848 15.0455 16.5455C15.0553 16.5357 15.0645 16.5254 15.0732 16.5146L21.0615 9.02921C21.4848 8.58872 21.4795 7.88846 21.0455 7.4545C20.6062 7.01517 19.8939 7.01517 19.4545 7.4545C19.4439 7.46511 19.4339 7.47635 19.4247 7.48816L14.2161 14.1251L13.4881 13.3971L12.0739 15.1649Z" fill="#03267F"/>
                    </svg>
                ) : (
                    // Unchecked SVG (empty box)
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="2" width="20" height="20" rx="8" fill="none" stroke="#BDBDBF" strokeWidth="2"/>
                    </svg>
                )}
            </div>
            {/* Type */}
            <div
                className="flex items-center"
                style={{
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: "0.32px",
                    padding: "8px 16px",
                }}
            >
                Type
            </div>
            {/* Name */}
            <div
                className="flex items-center"
                style={{
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: "0.32px",
                    padding: "8px 16px",
                }}
            >
                Name
            </div>
            {/* Status */}
            <div
                className="flex items-center justify-center"
                style={{
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: "0.32px",
                }}
            >
                Status
            </div>
            {/* Date Submitted */}
            <div
                className="flex items-center justify-center"
                style={{
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: "0.32px",
                }}
            >
                Date Submitted
            </div>
            {/* View */}
            <div
                className="flex items-center justify-center"
                style={{
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: "0.32px",
                }}
            >
                View
            </div>
        </div>
    );
}