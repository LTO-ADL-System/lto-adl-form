import React from "react";
import Madalto from "../assets/madalto.svg";
import houseFill from "../assets/house-fill.svg";
import applicantsIcon from "../assets/applicants.svg";
import bellFill from "../assets/bell-fill.svg";
import gearFill from "../assets/gear-fill.svg";

export default function AdminNavBar() {
  return (
    <header
      style={{
        display: "flex",
        width: "100%",
        maxwidth: "1512px",
        height: "80px",
        padding: "0px 120px",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        background: "#03267F",
        boxShadow: "0px 0px 8px 0px rgba(12, 28, 71, 0.25)",
        margin: "0 auto",
      }}
    >
      {/* Left: Logo and Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
        {/* Logo */}
        <div style={{ width: 172, height: 32, display: "flex", alignItems: "center" }}>
          <img src={Madalto} alt="MadaLTO" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        {/* Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Dashboard */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "transparent",
              border: "none",
              color: "#FBFBFE",
              fontFamily: "Typold, sans-serif",
              fontSize: 20,
              fontWeight: 500,
              cursor: "pointer",
              padding: "20px 0",
            }}
          >
            <img src={houseFill} alt="Dashboard" style={{ width: 24, height: 24 }} />
            <span>Dashboard</span>
          </button>
          {/* Applicants */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "transparent",
              border: "none",
              color: "#FBFBFE",
              fontFamily: "Typold, sans-serif",
              fontSize: 20,
              fontWeight: 500,
              cursor: "pointer",
              padding: "20px 0",
            }}
          >
            <img src={applicantsIcon} alt="Applicants" style={{ width: 24, height: 24, objectFit: "contain" }} />
            <span>Applicants</span>
          </button>
        </nav>
      </div>
      {/* Right: Notifications and Settings */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <button
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <img src={bellFill} alt="Notifications" style={{ width: 24, height: 24 }} />
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "transparent",
            border: "none",
            color: "#FBFBFE",
            fontFamily: "Typold, sans-serif",
            fontSize: 20,
            fontWeight: 500,
            cursor: "pointer",
            padding: "20px 0",
          }}
        >
          <img src={gearFill} alt="Settings" style={{ width: 24, height: 24 }} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}