import React, { useEffect, useState } from "react";
import { getLocal } from "./dataStore";

export function HomeDashboard({ onNavigate, t, lang = "en" }) {
  const [patientCount, setPatientCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [activeOutbreak, setActiveOutbreak] = useState(null);

  useEffect(() => {
    const patients = getLocal("patients");
    const triages = getLocal("triage_records");
    const outbreaks = getLocal("village_outbreaks");

    setPatientCount(patients.length);
    setHighPriorityCount(triages.filter((t) => t.priorityLevel === "HIGH").length);

    const hotspot = outbreaks.find((o) => o.cases >= 100);
    if (hotspot) {
      setActiveOutbreak(hotspot);
    }
  }, []);

  const menuItems = [
    { key: "register", label: t.registerPatient || "Register Patient", icon: "🧑‍🤝‍🧑", color: "#0F6CBD", bg: "#EBF3FC" },
    { key: "triage", label: t.triageScreening || "Triage & Screening", icon: "🩺", color: "#0D9488", bg: "#E6F7F5" },
    { key: "queue", label: t.priorityQueue || "Priority Queue", icon: "📋", color: "#DC2626", bg: "#FEF2F2" },
    { key: "referral", label: t.referral || "PHC Referral", icon: "🏥", color: "#D97706", bg: "#FFFBEB" },
    { key: "records", label: t.patientRecords || "Patient Records", icon: "📁", color: "#7E22CE", bg: "#FAF5FF" },
    { key: "outbreak", label: t.outbreakAlert || "Outbreak Monitor", icon: "🏕️", color: "#DC2626", bg: "#FEE2E2" },
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
            <div style={{ fontSize: "11px", color: "#E0F2FE" }}>Registered Patients</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{patientCount}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 12px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#FEE2E2" }}>High Priority Triage</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#FCA5A5" }}>{highPriorityCount}</div>
          </div>
        </div>
      </div>

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
