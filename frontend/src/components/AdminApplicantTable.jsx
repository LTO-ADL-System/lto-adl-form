import React, { useState } from "react";

const STATUS_STYLES = {
    Unchecked:   { bg: "#E3E3E6", text: "#585859" },
    Verifying:   { bg: "#FFBF00", text: "#6F5300" },
    Approval:    { bg: "#3F35FF", text: "#FFFFFF" },
    Rejected:    { bg: "#FB4548", text: "#5E1517" },
    Resubmission:{ bg: "#FB7945", text: "#5D2911" },
};

function StatusBadge({ status }) {
    const { bg, text } = STATUS_STYLES[status] || STATUS_STYLES.Unchecked;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 25,
                minWidth: 80,
                padding: "4px 16px",
                borderRadius: 20,
                background: bg,
                color: text,
                fontFamily: "Typold, sans-serif",
                fontSize: 14,
                fontWeight: 500,
                textAlign: "center",
                whiteSpace: "nowrap",
            }}
        >
            {status}
        </span>
    );
}

function CheckboxCell({ checked, onChange }) {
    return (
        <td style={{ textAlign: "center", width: 48 }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                style={{
                    width: 20,
                    height: 20,
                    accentColor: "#0433A9",
                    borderRadius: 8,
                    border: "2px solid #BDBDBF",
                    cursor: "pointer",
                }}
            />
        </td>
    );
}

export default function AdminApplicantTable({ applicants }) {
    const [checkedRows, setCheckedRows] = useState({});

    // Check if all are checked
    const allChecked = applicants.length > 0 && applicants.every(a => checkedRows[a.id]);

    // Toggle all checkboxes
    const handleCheckAll = () => {
        if (allChecked) {
            // Uncheck all
            const cleared = {};
            setCheckedRows(cleared);
        } else {
            // Check all
            const all = {};
            applicants.forEach(a => { all[a.id] = true; });
            setCheckedRows(all);
        }
    };

    const handleRowCheck = (id) => {
        setCheckedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
            <table
                style={{
                    width: "1088px",
                    minWidth: "1088px",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    background: "#FBFBFE",
                    fontFamily: "Typold, sans-serif",
                }}
            >
                <thead>
                    <tr style={{
                        background: "#FBFBFE",
                        borderTop: "2px solid #BDBDBF",
                        borderBottom: "2px solid #BDBDBF",
                        height: 40,
                    }}>
                        <th style={{ width: 48, textAlign: "center", padding: 0 }}>
                            {/* Button to check/uncheck all */}
                            <button
                                onClick={handleCheckAll}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 8,
                                    border: "2px solid #BDBDBF",
                                    background: allChecked ? "#0433A9" : "#FFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                                aria-label={allChecked ? "Uncheck all" : "Check all"}
                            >
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    readOnly
                                    style={{
                                        width: 20,
                                        height: 20,
                                        accentColor: "#0433A9",
                                        borderRadius: 8,
                                        border: "none",
                                        pointerEvents: "none",
                                        background: "transparent",
                                    }}
                                    tabIndex={-1}
                                />
                            </button>
                        </th>
                        <th style={{ width: 120, color: "#03267F", fontWeight: 500, fontSize: 16, textAlign: "left" }}>Type</th>
                        <th style={{ width: 240, color: "#03267F", fontWeight: 500, fontSize: 16, textAlign: "left" }}>Name</th>
                        <th style={{ width: 160, color: "#03267F", fontWeight: 500, fontSize: 16, textAlign: "center" }}>Status</th>
                        <th style={{ width: 160, color: "#03267F", fontWeight: 500, fontSize: 16, textAlign: "center" }}>Date Submitted</th>
                        <th style={{ width: 100, color: "#03267F", fontWeight: 500, fontSize: 16, textAlign: "center" }}>View</th>
                    </tr>
                </thead>
                <tbody>
                    {applicants.map((applicant) => (
                        <tr
                            key={applicant.id}
                            style={{
                                background: checkedRows[applicant.id] ? "#F0F4FC" : "#FFF",
                                borderBottom: "1px solid #E3E3E6",
                                height: 40,
                                transition: "background 0.2s",
                            }}
                        >
                            <CheckboxCell
                                checked={!!checkedRows[applicant.id]}
                                onChange={() => handleRowCheck(applicant.id)}
                            />
                            <td style={{
                                color: "#03267F",
                                fontSize: 16,
                                fontWeight: 400,
                                padding: "0 8px",
                                whiteSpace: "nowrap",
                            }}>
                                {["New", "Renewal", "Duplicate"].includes(applicant.type) ? applicant.type : "New"}
                            </td>
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
                            <td style={{ textAlign: "center" }}>
                                <StatusBadge status={applicant.status} />
                            </td>
                            <td style={{
                                color: "#03267F",
                                fontSize: 16,
                                fontWeight: 400,
                                textAlign: "center",
                                padding: "0 8px",
                                whiteSpace: "nowrap",
                            }}>
                                {applicant.date}
                            </td>
                            <td style={{ textAlign: "center" }}>
                                <button
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
                                        height: "32px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}