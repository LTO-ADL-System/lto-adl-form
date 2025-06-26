import React from "react";

export default function FilterButton({ selected, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group"
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                padding: "8px 12px",
                gap: 10,
                borderRadius: 8,
                border: selected ? "2px solid #0433A9" : "2px solid #03267F",
                background: selected ? "#0433A9" : "#FFF",
                color: selected ? "#FBFBFE" : "#03267F",
                fontFamily: "Typold, sans-serif",
                fontSize: 16,
                fontWeight: 500,
                lineHeight: "normal",
                boxShadow: selected ? "0px 0px 8px 0px rgba(12, 28, 71, 0.25)" : "none",
                cursor: "pointer",
                transition: "all 0.15s",
            }}
            onMouseOver={e => {
                if (!selected) e.currentTarget.style.borderColor = "#03267F";
            }}
            onMouseOut={e => {
                if (!selected) e.currentTarget.style.borderColor = "#03267F";
            }}
        >
            <span style={{ marginRight: 8 }}>{children}</span>
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                    width: 24,
                    height: 24,
                    aspectRatio: "1/1",
                }}
            >
                <path
                    d="M9 15.75C9 15.3358 9.33579 15 9.75 15H14.25C14.6642 15 15 15.3358 15 15.75C15 16.1642 14.6642 16.5 14.25 16.5H9.75C9.33579 16.5 9 16.1642 9 15.75Z"
                    fill={selected ? "#FBFBFE" : "#03267F"}
                />
                <path
                    d="M6 11.25C6 10.8358 6.33579 10.5 6.75 10.5H17.25C17.6642 10.5 18 10.8358 18 11.25C18 11.6642 17.6642 12 17.25 12H6.75C6.33579 12 6 11.6642 6 11.25Z"
                    fill={selected ? "#FBFBFE" : "#03267F"}
                />
                <path
                    d="M3 6.75C3 6.33579 3.33579 6 3.75 6H20.25C20.6642 6 21 6.33579 21 6.75C21 7.16421 20.6642 7.5 20.25 7.5H3.75C3.33579 7.5 3 7.16421 3 6.75Z"
                    fill={selected ? "#FBFBFE" : "#03267F"}
                />
            </svg>
        </button>
    );
}