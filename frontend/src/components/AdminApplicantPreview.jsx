import React, { useState, memo } from "react";

/**
 * Props:
 * - applicant: {
 *     id: string|number,
 *     type: "New" | "Renewal" | "Duplicate",
 *     name: string,
 *     status: string, // One of: "Unchecked", "Verifying", "Approval", "Rejected", "Resubmission"
 *     date: string,
 *   }
 * - isSelected: boolean - Whether this application is selected for bulk actions
 * - onSelect: function(isSelected: boolean) - Called when checkbox is clicked
 * - onView: function - Called when View button is clicked
 */

// Status color mapping
const STATUS_STYLES = {
    Unchecked:   { bg: "#E3E3E6", text: "#585859" },
    Verifying:   { bg: "#FFBF00", text: "#6F5300" },
    Approval:    { bg: "#3F35FF", text: "#FFFFFF" },
    Rejected:    { bg: "#FB4548", text: "#5E1517" },
    Resubmission:{ bg: "#FB7945", text: "#5D2911" },
};

const ApplicAdminApplicantPreview = memo(({ applicant, isSelected = false, onSelect, onView }) => {
    const status = applicant.status || "Unchecked";
    const { bg, text } = STATUS_STYLES[status] || STATUS_STYLES.Unchecked;

    // Checkbox state
    const [hovered, setHovered] = useState(false);

    // Row state
    const [rowClicked, setRowClicked] = useState(false);
    const [rowHovered, setRowHovered] = useState(false);

    // Checkbox style logic
    let checkboxBorder = "#BDBDBF";
    let checkboxBg = "#FFF";
    if (isSelected) {
        checkboxBorder = "#717173";
        checkboxBg = "#717173";
    } else if (hovered) {
        checkboxBorder = "#979799";
        checkboxBg = "#979799";
    }

    // Row style logic
    let rowBorder = "2px solid transparent";
    let rowBg = "#FBFBFE";
    if (rowClicked) {
        rowBorder = "2px solid #0433A9";
        rowBg = "#F0F4FC";
    } else if (rowHovered) {
        rowBg = "#F0F4FC";
    }

    // Application type display (only allow "New", "Renewal", "Duplicate")
    const typeDisplay = ["New", "Renewal", "Duplicate"].includes(applicant.type)
        ? applicant.type
        : "New";

    return (
        <div
            className="grid rounded-lg shadow border border-gray-200"
            style={{
                width: "1088px",
                height: "40px",
                padding: "4px 12px",
                rowGap: "72px",
                flexShrink: 0,
                gridTemplateRows: "1fr",
                gridTemplateColumns: "auto auto 1fr 1fr auto auto",
                alignItems: "center",
                background: rowBg,
                border: rowBorder,
                transition: "background 0.2s, border 0.2s",
                cursor: "pointer",
            }}
            tabIndex={0}
            onClick={() => setRowClicked((clicked) => !clicked)}
            onMouseEnter={() => setRowHovered(true)}
            onMouseLeave={() => setRowHovered(false)}
        >
            {/* Status badge (ellipse and label are synonymous) */}
            <div
                className="flex flex-col justify-center items-center"
                style={{
                    height: 25,
                    padding: "8px 12px",
                    borderRadius: 20,
                    background: bg,
                    color: text,
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                    letterSpacing: "0.32px",
                    textAlign: "center",
                    leadingTrim: "both",
                    textEdge: "cap",
                    minWidth: 80,
                }}
            >
                {status}
            </div>
            {/* Checkbox */}
            <div
                className="flex items-center justify-center"
                style={{
                    width: 24,
                    height: 24,
                    aspectRatio: "1/1",
                    borderRadius: 8,
                    border: `2px solid ${checkboxBorder}`,
                    background: checkboxBg,
                    cursor: "pointer",
                    transition: "border 0.2s, background 0.2s",
                }}
                tabIndex={0}
                onClick={e => {
                    e.stopPropagation();
                    if (onSelect) {
                        onSelect(!isSelected);
                    }
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15.9206 4.96209C16.2819 4.59597 16.8677 4.59597 17.229 4.96209C17.5859 5.32371 17.5903 5.90727 17.2422 6.27434L9.85031 15.0122C9.8432 15.0212 9.8356 15.0298 9.82756 15.0379C9.46625 15.404 8.88046 15.404 8.51915 15.0379L4.02098 10.4799C3.65967 10.1137 3.65967 9.52015 4.02098 9.15403C4.38229 8.78791 4.96808 8.78791 5.32939 9.15403L9.14548 13.0209L15.8961 4.99013C15.9037 4.98029 15.9119 4.97093 15.9206 4.96209Z" fill="#FFF"/>
                    </svg>
                )}
            </div>
            {/* Application type */}
            <div
                className="flex items-center"
                style={{
                    height: 27,
                    flex: "1 0 0",
                    overflow: "hidden",
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                    letterSpacing: "0.32px",
                    WebkitBoxOrient: "vertical",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    textOverflow: "ellipsis",
                    leadingTrim: "both",
                    textEdge: "cap",
                    alignSelf: "stretch",
                    padding: "8px 16px",
                }}
            >
                {typeDisplay}
            </div>
            {/* Name */}
            <div
                className="flex items-center"
                style={{
                    height: 27,
                    flex: "1 0 0",
                    overflow: "hidden",
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                    letterSpacing: "0.32px",
                    WebkitBoxOrient: "vertical",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    textOverflow: "ellipsis",
                    leadingTrim: "both",
                    textEdge: "cap",
                    alignSelf: "stretch",
                    padding: "8px 16px",
                }}
            >
                {applicant.name}
            </div>
            {/* Date */}
            <div
                className="flex items-center"
                style={{
                    height: 27,
                    color: "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                    letterSpacing: "0.32px",
                    padding: "8px 16px",
                }}
            >
                {applicant.date}
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2">
                {/* View button */}
                <div
                    className="flex items-center justify-center"
                    style={{
                        height: 24,
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "#0433A9",
                        color: "#FBFBFE",
                        fontFamily: "Typold, sans-serif",
                        fontSize: 16,
                        fontStyle: "normal",
                        fontWeight: 500,
                        lineHeight: "normal",
                        letterSpacing: "0.32px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView && onView();
                        }}
                        style={{
                            background: "#0433A9",
                            border: "none",
                            color: "#FBFBFE",
                            font: "inherit",
                            cursor: "pointer",
                            padding: 0,
                            borderRadius: 8,
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        View
                    </button>
                </div>
                

            </div>
        </div>
    );
});

ApplicAdminApplicantPreview.displayName = 'ApplicAdminApplicantPreview';

export default ApplicAdminApplicantPreview;