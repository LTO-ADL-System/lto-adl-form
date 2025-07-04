import React, { useState } from "react";
import AdminNavBar from "./AdminNavBar";
import AdminApplicantTable from "./AdminApplicantTable";

// Dropdown menu item component
function DropdownItem({ children, selected, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                width: "100%",
                height: 40,
                padding: "8px 12px",
                alignItems: "center",
                gap: 10,
                borderRadius: 8,
                fontFamily: "Typold, sans-serif",
                fontSize: 16,
                fontWeight: 500,
                lineHeight: "normal",
                textAlign: "center",
                background: selected
                    ? "#CACACC"
                    : hovered
                        ? "#E3E3E6"
                        : "#FCFCFF",
                color: "#585859",
                cursor: "pointer",
                userSelect: "none",
            }}
        >
            {children}
        </div>
    );
}

// Dropdown wrapper
function Dropdown({ open, children, style }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: "absolute",
                top: "110%",
                left: 0,
                zIndex: 20,
                minWidth: 160,
                background: "#FFF",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                border: "1px solid #BDBDBF",
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// FilterButton with dropdown support
function FilterButton({ selected, onClick, children, icon, dropdown, dropdownOpen }) {
    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                type="button"
                onClick={onClick}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 40,
                    padding: "8px 12px",
                    gap: 10,
                    borderRadius: 8,
                    border: selected
                        ? "2px solid #0433A9"
                        : "2px solid #03267F",
                    background: selected ? "#0433A9" : "#FFF",
                    color: selected ? "#FBFBFE" : "#03267F",
                    fontFamily: "Typold, sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: "normal",
                    boxShadow: selected
                        ? "0px 0px 8px 0px rgba(12, 28, 71, 0.25)"
                        : "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                }}
            >
                {children}
                <span style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
                    {icon}
                </span>
            </button>
            <Dropdown open={dropdownOpen}>{dropdown}</Dropdown>
        </div>
    );
}

export default function AdminApplicants() {
    // Example data
    const [applicants] = useState([
        { id: 1, type: "New", name: "Juan Dela Cruz", status: "Verifying", date: "2024-06-24" },
        { id: 2, type: "Renewal", name: "Maria Santos", status: "Approval", date: "2024-06-23" },
        { id: 3, type: "Duplicate", name: "Pedro Reyes", status: "Rejected", date: "2024-06-22" },
    ]);
    const [allSelected, setAllSelected] = useState(false);

    // For search bar: separate input and applied search value
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    // Dropdown open states
    const [globalActionsOpen, setGlobalActionsOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

    // Selections
    const [selectedGlobalAction, setSelectedGlobalAction] = useState(null);
    const [selectedType, setSelectedType] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedSort, setSelectedSort] = useState("Date Desc");

    // SVGs
    const caretDown = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.8711 16.7099L3.67679 8.48776C2.82815 7.51788 3.51691 6 4.80565 6H19.1943C20.4831 6 21.1719 7.51788 20.3232 8.48775L13.1289 16.7099C12.5312 17.3929 11.4688 17.3929 10.8711 16.7099Z" fill="#03267F" />
        </svg>
    );
    const caretUp = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.8711 7.29013L3.67679 15.5122C2.82815 16.4821 3.51691 18 4.80565 18H19.1943C20.4831 18 21.1719 16.4821 20.3232 15.5122L13.1289 7.29013C12.5312 6.60714 11.4688 6.60714 10.8711 7.29013Z" fill="#03267F" />
        </svg>
    );
    const filterIcon = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 15.75C9 15.3358 9.33579 15 9.75 15H14.25C14.6642 15 15 15.3358 15 15.75C15 16.1642 14.6642 16.5 14.25 16.5H9.75C9.33579 16.5 9 16.1642 9 15.75Z" fill="#03267F" />
            <path d="M6 11.25C6 10.8358 6.33579 10.5 6.75 10.5H17.25C17.6642 10.5 18 10.8358 18 11.25C18 11.6642 17.6642 12 17.25 12H6.75C6.33579 12 6 11.6642 6 11.25Z" fill="#03267F" />
            <path d="M3 6.75C3 6.33579 3.33579 6 3.75 6H20.25C20.6642 6 21 6.33579 21 6.75C21 7.16421 20.6642 7.5 20.25 7.5H3.75C3.33579 7.5 3 7.16421 3 6.75Z" fill="#03267F" />
        </svg>
    );
    const sortIcon = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5.25 3.75C5.25 3.33579 4.91421 3 4.5 3C4.08579 3 3.75 3.33579 3.75 3.75L3.75 16.9393L2.03033 15.2197C1.73744 14.9268 1.26256 14.9268 0.96967 15.2197C0.676777 15.5126 0.676777 15.9874 0.96967 16.2803L3.9684 19.2791L3.97955 19.29C4.04913 19.3571 4.12848 19.4082 4.21291 19.4431C4.30134 19.4798 4.39831 19.5 4.5 19.5C4.60169 19.5 4.69866 19.4798 4.78709 19.4431C4.87555 19.4065 4.95842 19.3522 5.03033 19.2803L8.03033 16.2803C8.32322 15.9874 8.32322 15.5126 8.03033 15.2197C7.73744 14.9268 7.26256 14.9268 6.96967 15.2197L5.25 16.9393L5.25 3.75Z" fill="#03267F" />
            <path d="M10.5 5.25C10.5 4.83579 10.8358 4.5 11.25 4.5H21.75C22.1642 4.5 22.5 4.83579 22.5 5.25C22.5 5.66421 22.1642 6 21.75 6H11.25C10.8358 6 10.5 5.66421 10.5 5.25Z" fill="#03267F" />
            <path d="M11.25 9C10.8358 9 10.5 9.33579 10.5 9.75C10.5 10.1642 10.8358 10.5 11.25 10.5H18.75C19.1642 10.5 19.5 10.1642 19.5 9.75C19.5 9.33579 19.1642 9 18.75 9H11.25Z" fill="#03267F" />
            <path d="M11.25 13.5C10.8358 13.5 10.5 13.8358 10.5 14.25C10.5 14.6642 10.8358 15 11.25 15H15.75C16.1642 15 16.5 14.6642 16.5 14.25C16.5 13.8358 16.1642 13.5 15.75 13.5H11.25Z" fill="#03267F" />
            <path d="M11.25 18C10.8358 18 10.5 18.3358 10.5 18.75C10.5 19.1642 10.8358 19.5 11.25 19.5H12.75C13.1642 19.5 13.5 19.1642 13.5 18.75C13.5 18.3358 13.1642 18 12.75 18H11.25Z" fill="#03267F" />
        </svg>
    );

    // Dropdowns
    const globalActionsDropdown = (
        <div>
            <DropdownItem
                selected={selectedGlobalAction === "Verify"}
                onClick={() => { setSelectedGlobalAction("Verify"); setGlobalActionsOpen(false); }}
            >Verify</DropdownItem>
            <DropdownItem
                selected={selectedGlobalAction === "Approve"}
                onClick={() => { setSelectedGlobalAction("Approve"); setGlobalActionsOpen(false); }}
            >Approve</DropdownItem>
            <DropdownItem
                selected={selectedGlobalAction === "Reject"}
                onClick={() => { setSelectedGlobalAction("Reject"); setGlobalActionsOpen(false); }}
            >Reject</DropdownItem>
        </div>
    );

    const filterDropdown = (
        <div>
            <div style={{ padding: "4px 12px", fontWeight: 600, color: "#03267F" }}>Type</div>
            {["All", "New", "Renewal", "Duplicate"].map(type => (
                <DropdownItem
                    key={type}
                    selected={selectedType === type}
                    onClick={() => { setSelectedType(type); setFilterOpen(false); }}
                >{type}</DropdownItem>
            ))}
            <div style={{ padding: "4px 12px", fontWeight: 600, color: "#03267F" }}>Status</div>
            {["All", "Verifying", "Resubmission", "Rejected", "Approved"].map(status => (
                <DropdownItem
                    key={status}
                    selected={selectedStatus === status}
                    onClick={() => { setSelectedStatus(status); setFilterOpen(false); }}
                >{status}</DropdownItem>
            ))}
        </div>
    );

    const sortDropdown = (
        <div>
            <DropdownItem
                selected={selectedSort === "Date Asc"}
                onClick={() => { setSelectedSort("Date Asc"); setSortOpen(false); }}
            >Date Ascending</DropdownItem>
            <DropdownItem
                selected={selectedSort === "Date Desc"}
                onClick={() => { setSelectedSort("Date Desc"); setSortOpen(false); }}
            >Date Descending</DropdownItem>
        </div>
    );

    // Close dropdowns on outside click
    React.useEffect(() => {
        function handleClick(e) {
            setGlobalActionsOpen(false);
            setFilterOpen(false);
            setSortOpen(false);
        }
        if (globalActionsOpen || filterOpen || sortOpen) {
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }
    }, [globalActionsOpen, filterOpen, sortOpen]);

    // Filter applicants based on the applied search (case-insensitive, matches name)
    const filteredApplicants = applicants.filter(applicant =>
        applicant.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="h-screen flex flex-col">
            <div className="h-16 flex-shrink-0"></div>
            <div className="flex-1 flex items-stretch p-2 p-4 lg:p-12 bg-gray-100 min-h-0">
                <main className="w-full max-w-full mx-auto flex flex-col">
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 overflow-visible w-full lg:w-[90%] flex-1 mx-auto flex flex-col min-h-0">
                        {/* Header */}
                        <div className="flex items-center gap-3 self-stretch mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <path d="M9.625 5.5C8.86561 5.5 8.25 6.11561 8.25 6.875V39.875C8.25 40.6344 8.86561 41.25 9.625 41.25H34.375C35.1344 41.25 35.75 40.6344 35.75 39.875V6.875C35.75 6.11561 35.1344 5.5 34.375 5.5H33C32.2406 5.5 31.625 4.88439 31.625 4.125C31.625 3.36561 32.2406 2.75 33 2.75H34.375C36.6532 2.75 38.5 4.59683 38.5 6.875V39.875C38.5 42.1532 36.6532 44 34.375 44H9.625C7.34682 44 5.5 42.1532 5.5 39.875V6.875C5.5 4.59683 7.34682 2.75 9.625 2.75H11C11.7594 2.75 12.375 3.36561 12.375 4.125C12.375 4.88439 11.7594 5.5 11 5.5H9.625Z" fill="#03267F"/>
                                <path d="M27.5 1.375C27.5 0.615609 26.8844 0 26.125 0H17.875C17.1156 0 16.5 0.615609 16.5 1.375C16.5 2.13439 15.8844 2.75 15.125 2.75C14.3656 2.75 13.75 3.36561 13.75 4.125V5.5C13.75 6.25939 14.3656 6.875 15.125 6.875H28.875C29.6344 6.875 30.25 6.25939 30.25 5.5V4.125C30.25 3.36561 29.6344 2.75 28.875 2.75C28.1156 2.75 27.5 2.13439 27.5 1.375Z" fill="#03267F"/>
                            </svg>
                            <span
                                style={{
                                    color: "#03267F",
                                    fontFamily: "Typold, sans-serif",
                                    fontSize: "36px",
                                    fontStyle: "normal",
                                    fontWeight: 700,
                                    lineHeight: "normal",
                                    leadingTrim: "both",
                                    textEdge: "cap",
                                }}
                            >
                                Applicants
                            </span>
                        </div>
                        <div style={{
                            width: "1088px",
                            height: "2px",
                            background: "#BDBDBF",
                            marginBottom: "24px"
                        }} />
                        {/* Controls */}
                        <div className="flex justify-between items-center mb-6 w-full" style={{ alignSelf: "stretch" }}>
                            {/* Left controls */}
                            <div className="flex items-center gap-4">
                                {/* Search bar */}
                                <div
                                    className="flex items-center"
                                    style={{
                                        width: "468px",
                                        height: "40px",
                                        padding: "8px 16px",
                                        gap: "23px",
                                        borderRadius: "12px",
                                        border: "2px solid #BDBDBF",
                                        background: "#FFF"
                                    }}
                                >
                                    <button
                                        style={{
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            margin: 0,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                        onClick={() => setSearch(searchInput)}
                                        aria-label="Search"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M11.7422 10.3439C12.5329 9.2673 13 7.9382 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C7.93858 13 9.26801 12.5327 10.3448 11.7415L10.3439 11.7422C10.3734 11.7822 10.4062 11.8204 10.4424 11.8566L14.2929 15.7071C14.6834 16.0976 15.3166 16.0976 15.7071 15.7071C16.0976 15.3166 16.0976 14.6834 15.7071 14.2929L11.8566 10.4424C11.8204 10.4062 11.7822 10.3734 11.7422 10.3439ZM12 6.5C12 9.53757 9.53757 12 6.5 12C3.46243 12 1 9.53757 1 6.5C1 3.46243 3.46243 1 6.5 1C9.53757 1 12 3.46243 12 6.5Z" fill="#BDBDBF"/>
                                        </svg>
                                    </button>
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={e => setSearchInput(e.target.value)}
                                        placeholder="Search applicants"
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            background: "transparent",
                                            color: "#BDBDBF",
                                            fontFamily: "Typold, sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 300,
                                            lineHeight: "normal",
                                            flex: 1,
                                            marginLeft: "10px"
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") setSearch(searchInput);
                                        }}
                                    />
                                </div>
                                {/* Global Actions Button with dropdown */}
                                <FilterButton
                                    selected={globalActionsOpen}
                                    onClick={e => { e.stopPropagation(); setGlobalActionsOpen(open => !open); }}
                                    icon={globalActionsOpen ? caretUp : caretDown}
                                    dropdown={globalActionsDropdown}
                                    dropdownOpen={globalActionsOpen}
                                >
                                    Global Actions
                                </FilterButton>
                            </div>
                            {/* Right controls */}
                            <div className="flex items-center gap-4">
                                {/* Filter By Button with dropdown */}
                                <FilterButton
                                    selected={filterOpen}
                                    onClick={e => { e.stopPropagation(); setFilterOpen(open => !open); }}
                                    icon={filterIcon}
                                    dropdown={filterDropdown}
                                    dropdownOpen={filterOpen}
                                >
                                    Filter By
                                </FilterButton>
                                {/* Sort By Button with dropdown */}
                                <FilterButton
                                    selected={sortOpen}
                                    onClick={e => { e.stopPropagation(); setSortOpen(open => !open); }}
                                    icon={sortIcon}
                                    dropdown={sortDropdown}
                                    dropdownOpen={sortOpen}
                                >
                                    Sort By
                                </FilterButton>
                            </div>
                        </div>
                        {/* Table Header and Applicants */}
                        <div
                            className="flex flex-col items-center"
                            style={{
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            <AdminApplicantTable
                                applicants={filteredApplicants}
                                allSelected={allSelected}
                                onSelectAll={() => setAllSelected((s) => !s)}
                            />
                        </div>
                    </div>
                </main>
            </div>
            <AdminNavBar />
        </div>
    );
}