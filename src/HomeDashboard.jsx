import React, { useEffect, useState } from "react";
import { getLocal } from "./dataStore";

export function HomeDashboard({ onNavigate, t, lang = "en" }) {
  const [patientCount, setPatientCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [activeOutbreak, setActiveOutbreak] = useState(null);
  const [disasterActive, setDisasterActive] = useState(false);

  useEffect(() => {
    const patients = getLocal("patients");
    const triages = getLocal("triage_records");
    const outbreaks = getLocal("village_outbreaks");
    const disaster = getLocal("disaster_status");

    setPatientCount(patients.length);
    setHighPriorityCount(triages.filter((t) => t.priorityLevel === "HIGH").length);

    const hotspot = outbreaks.find((o) => o.cases >= 100);
    if (hotspot) {
      setActiveOutbreak(hotspot);
    }
    if (disaster && disaster.active) {
      setDisasterActive(true);
    }
  }, []);

  const menuItems = [
    { key: "register", label: t.registerPatient || "Register Patient", icon: "🧑‍🤝‍🧑", color: "#0F6CBD", bg: "#EBF3FC" },
    { key: "members", label: t.allMembers || "All Registered Members", icon: "👥", color: "#0F6CBD", bg: "#EBF3FC" },
    { key: "triage", label: t.triageScreening || "Triage & Screening", icon: "🩺", color: "#0D9488", bg: "#E6F7F5" },
    { key: "queue", label: t.priorityQueue || "Priority Queue", icon: "📋", color: "#DC2626", bg: "#FEF2F2" },
    { key: "referral", label: t.referral || "PHC Referral", icon: "🏥", color: "#D97706", bg: "#FFFBEB" },
    { key: "polio", label: t.vaccineTracker || "Child Vaccine Tracker", icon: "👶", color: "#F59E0B", bg: "#FEF3C7" },
    { key: "venom", label: t.venomTracker || "Snakebite & ASV Stock", icon: "🐍", color: "#DC2626", bg: "#FEE2E2" },
    { key: "disaster", label: t.disasterMode || "Disaster & Flood Mode", icon: "🌊", color: "#0284C7", bg: "#E0F2FE" },
    { key: "supply", label: t.supplyIntelligence || "Supply Storage Priority", icon: "💊", color: "#0D9488", bg: "#E6F7F5" },
    { key: "weather", label: t.weatherIntelligence || "Seasonal Intelligence", icon: "🌦️", color: "#0284C7", bg: "#E0F2FE" },
    { key: "records", label: t.patientRecords || "Patient Records", icon: "📁", color: "#7E22CE", bg: "#FAF5FF" },
    { key: "outbreak", label: t.outbreakAlert || "Outbreak Monitor", icon: "🏕️", color: "#DC2626", bg: "#FEE2E2" },
    { key: "ai", label: t.ashaAICopilot || "ASHA AI Copilot", icon: "🤖", color: "#7E22CE", bg: "#F3E8FF" },
    { key: "stats", label: t.reportsStats || "Reports & Stats", icon: "📊", color: "#0F6CBD", bg: "#EBF3FC" }
  ];

  return (
    <div className="page-content">
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #0F6CBD 0%, #0A4373 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "32px" }}>👩‍⚕️</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>{t.ashaTitle}</h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "12px" }}>{t.ashaSubtitle}</p>
          </div>
        </div>

        {/* Quick Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#E0F2FE" }}>Registered Members</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{patientCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#FEE2E2" }}>High Priority Triage</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#FCA5A5" }}>{highPriorityCount}</div>
          </div>
        </div>
      </div>

      {/* Disaster Flash Notification if Active */}
      {disasterActive && (
        <div
          onClick={() => onNavigate("disaster")}
          style={{
            background: "#DC2626",
            color: "white",
            padding: "12px 14px",
            borderRadius: "14px",
            marginBottom: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>🌊</span>
            <div>
              <strong style={{ fontSize: "13px" }}>Flood Alert Active: Godavari Lowlands</strong>
              <div style={{ fontSize: "11px", opacity: 0.9 }}>Relief shelters open in Relangi & Tanuku</div>
            </div>
          </div>
          <span className="badge" style={{ background: "white", color: "#DC2626" }}>VIEW &rarr;</span>
        </div>
      )}

      {/* Outbreak Hotspot Alert Bar */}
      {activeOutbreak && (
        <div
          onClick={() => onNavigate("outbreak")}
          className="outbreak-alert-pulse"
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🚨</span>
            <div>
              <strong style={{ fontSize: "14px" }}>Outbreak Warning: {activeOutbreak.village}</strong>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                {activeOutbreak.cases} cases reported ({activeOutbreak.primaryCondition})
              </div>
            </div>
          </div>
          <span className="badge" style={{ background: "white", color: "#DC2626" }}>VIEW SOS &rarr;</span>
        </div>
      )}

      {/* Grid of ASHA Tools */}
      <div className="icon-card-grid">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className="icon-card"
            onClick={() => onNavigate(item.key)}
          >
            <div className="icon-card-bubble" style={{ background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <div className="icon-card-title">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeDashboard;
