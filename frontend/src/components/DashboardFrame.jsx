import React from "react";
import clockHistory from "../assets/clock-history.svg";
import mail from "../assets/mail.svg";
import clipboardcheck from "../assets/clipboardcheck.svg";

export default function DashboardFrame() {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg px-4 sm:px-8 lg:px-24 py-6 lg:py-12 overflow-hidden w-full lg:w-[90%] h-full lg:h-[90%] mx-auto flex flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center gap-[10px] self-stretch mb-[32px]">
        <span
          style={{
            width: "100%",
            height: "45px",
            color: "#0433A9",
            fontFamily: "Typold, sans-serif",
            fontSize: "64px",
            fontStyle: "normal",
            fontWeight: 800,
            lineHeight: "normal",
          }}
        >
          Welcome Back, Admin!
        </span>
      </div>

      <div className="flex flex-col items-center gap-8 w-full">
        <div className="flex flex-col gap-8 w-full">
          {/* Card 1 */}
          <div className="flex items-center gap-9 rounded-3xl bg-white shadow-md border border-gray-200 px-[57px] py-[37px]">
            <img src={mail} alt="Mail" className="w-[79px] h-[79px]" />
            <div
              style={{
                display: "flex",
                padding: "37px, 57px",
                flexDirection: "column",
                justifyContent: "center",
                flex: "1 0 0",
                alignSelf: "stretch",
                color: "#0433A9",
                fontFamily: "Typold, sans-serif",
                fontSize: "32px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              50 new Applicants
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex items-center gap-9 rounded-3xl bg-white shadow-md border border-gray-200 px-[57px] py-[37px]">
            <img src={clockHistory} alt="Pending" className="w-[79px] h-[79px]" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: "1 0 0",
                alignSelf: "stretch",
                color: "#0433A9",
                fontFamily: "Typold, sans-serif",
                fontSize: "32px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              67 Pending Cases
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex items-center gap-9 rounded-3xl bg-white shadow-md border border-gray-200 px-[57px] py-[37px]">
            <img src={clipboardcheck} alt="Processed" className="w-[79px] h-[79px]" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: "1 0 0",
                alignSelf: "stretch",
                color: "#0433A9",
                fontFamily: "Typold, sans-serif",
                fontSize: "32px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              100 Processed Applications
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}