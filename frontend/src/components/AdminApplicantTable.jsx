import React from "react";

/**
 * Props:
 * - applicants: array of applicant objects
 * - selectedApplicants: Set or array of selected applicant IDs
 * - onSelect: function(applicantId: string|number, isSelected: boolean)
 * - onView: function(applicant)
 * - onSelectAll: function(isSelected: boolean)
 */

function AdminApplicantTable({
    applicants = [],
    selectedApplicants = [],
    onSelect,
    onView,
    onSelectAll,
}) {
    // Support both Set and array for selectedApplicants
    const isSelected = (id) =>
        Array.isArray(selectedApplicants)
            ? selectedApplicants.includes(id)
            : selectedApplicants.has(id);

    const allSelected =
        applicants.length > 0 &&
        applicants.every((app) => isSelected(app.id));

    return (
        <table
            style={{
                width: "100%",
                minWidth: "1088px",
                borderCollapse: "separate",
                borderSpacing: 0,
                background: "#FBFBFE",
                fontFamily: "Typold, sans-serif",
                borderRadius: 8,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
        >
            <thead>
                <tr>
                     <th style={{ width: 32, textAlign: "center", color: "#03267F" }}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => onSelectAll(e.target.checked)}
                            aria-label="Select all"
                        />
                    </th>
 <th                style={{ width: 48, textAlign: "center", color: "#03267F" }}></th>
                    <th style={{ width: 120, color: "#03267F" }}>Type</th>
                    <th style={{ width: 240, color: "#03267F" }}>Name</th>
                    <th style={{ width: 160, color: "#03267F" }}>Status</th>
                    <th style={{ width: 160, color: "#03267F" }}>Date</th>
                    <th style={{ width: 100, color: "#03267F" }}>View</th>
                </tr>
            </thead>
            <tbody>
                {applicants.map((applicant) => {
                    const typeDisplay = ["New", "Renewal", "Duplicate"].includes(applicant.type)
                        ? applicant.type
                        : "New";
                    const status = applicant.status || "Unchecked";
                    // Status badge colors
                    const STATUS_STYLES = {
                        Unchecked:   { bg: "#E3E3E6", text: "#585859" },
                        Verifying:   { bg: "#FFBF00", text: "#6F5300" },
                        Approval:    { bg: "#3F35FF", text: "#FFFFFF" },
                        Rejected:    { bg: "#FB4548", text: "#5E1517" },
                        Resubmission:{ bg: "#FB7945", text: "#5D2911" },
                    };
                    const { bg, text } = STATUS_STYLES[status] || STATUS_STYLES.Unchecked;

                    return (
                        <tr key={applicant.id} style={{ background: "#FBFBFE" }}>
                            {/* Select checkbox */}
                            <td style={{ textAlign: "center" }}>
                                <input
                                    type="checkbox"
                                    checked={isSelected(applicant.id)}
                                    onChange={(e) => onSelect(applicant.id, e.target.checked)}
                                    aria-label={`Select ${applicant.name}`}
                                />
                            </td>
                            {/* (Optional) Icon or avatar cell */}
                            <td style={{ textAlign: "center" }}>
                                {/* Placeholder for avatar/icon if needed */}
                            </td>
                            {/* Type */}
                            <td style={{
                                color: "#03267F",
                                fontSize: 16,
                                fontWeight: 400,
                                padding: "0 8px",
                                whiteSpace: "nowrap",
                                width: 120,
                            }}>
                                {typeDisplay}
                            </td>
                            {/* Name */}
                            <td style={{
                                color: "#03267F",
                                fontSize: 16,
                                fontWeight: 400,
                                padding: "0 8px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 240,
                            }}>
                                {applicant.name}
                            </td>
                            {/* Status badge */}
                            <td style={{ textAlign: "center", width: 160 }}>
                                <span
                                    style={{
                                        display: "inline-block",
                                        minWidth: 80,
                                        padding: "8px 12px",
                                        borderRadius: 20,
                                        background: bg,
                                        color: text,
                                        fontFamily: "Typold, sans-serif",
                                        fontSize: 16,
                                        fontWeight: 400,
                                        textAlign: "center",
                                    }}
                                >
                                    {status}
                                </span>
                            </td>
                            {/* Date */}
                            <td style={{
                                color: "#03267F",
                                fontSize: 16,
                                fontWeight: 400,
                                textAlign: "center",
                                padding: "0 8px",
                                whiteSpace: "nowrap",
                                width: 160,
                            }}>
                                {applicant.date}
                            </td>
                            {/* View button */}
                            <td style={{ textAlign: "center", width: 100 }}>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        onView && onView(applicant);
                                    }}
                                    style={{
                                        background: "#0433A9",
                                        border: "none",
                                        color: "#FBFBFE",
                                        fontFamily: "Typold, sans-serif",
                                        fontSize: 16,
                                        fontWeight: 500,
                                        letterSpacing: "0.32px",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                        height: "24px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default AdminApplicantTable;