import React from "react";
import clockHistory from "../assets/clock-history.svg";
import mail from "../assets/mail.svg";
import clipboardcheck from "../assets/clipboardcheck.svg";

export default function DashboardFrame() {
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
        {/* Card 1 */}
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
            50 new Applicants
          </div>
        </div>
        {/* Card 2 */}
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
            67 Pending Cases
          </div>
        </div>
        {/* Card 3 */}
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
            100 Processed Applications
          </div>
        </div>
      </div>
    </div>
  );
}