import React, { useState } from "react";

export function GuidanceContent({ onBack, lang = "en" }) {
  const [tab, setTab] = useState("maternal");

  const polioBroadcast = {
    title: "📢 Pulse Polio National Immunization Day (NID)",
    date: "Sunday, 15th October 2026",
    time: "8:00 AM to 5:00 PM",
    venue: "All Village Anganwadis & Primary Health Centres",
    instructions: "Every child aged 0 to 5 years must receive 2 drops of oral polio vaccine, even if already immunized before.",
    ashaDuty: "Follow-up house-to-house 'B-team' visits will run Monday & Tuesday for missed children."
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEF3C7", color: "#D97706" }}>Maternal & Child Health</span>
      </div>

      {/* Official Polio Broadcast Banner */}
      <div style={{ background: "linear-gradient(135deg, #0D9488 0%, #115E59 100%)", color: "white", padding: "16px", borderRadius: "16px", marginBottom: "16px", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "28px" }}>💉</span>
          <div>
            <h3 style={{ color: "white", margin: 0 }}>{polioBroadcast.title}</h3>
            <p style={{ color: "#CCFBF1", margin: 0, fontSize: "12px" }}>Official Directorate of Health Services Broadcast</p>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", padding: "10px", borderRadius: "10px", fontSize: "13px" }}>
          <p style={{ color: "white", margin: "2px 0" }}>📅 <strong>Date:</strong> {polioBroadcast.date} ({polioBroadcast.time})</p>
          <p style={{ color: "white", margin: "2px 0" }}>📍 <strong>Booth:</strong> {polioBroadcast.venue}</p>
          <p style={{ color: "#E6FFFA", margin: "4px 0 0", fontSize: "12px" }}>ℹ️ {polioBroadcast.instructions}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => setTab("maternal")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: tab === "maternal" ? "#0F6CBD" : "#F1F5F9",
            color: tab === "maternal" ? "white" : "#475569"
          }}
        >
          🤰 Maternal Care
        </button>
        <button
          onClick={() => setTab("child")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: tab === "child" ? "#0F6CBD" : "#F1F5F9",
            color: tab === "child" ? "white" : "#475569"
          }}
        >
          👶 Child Care & Vaccines
        </button>
      </div>

      {tab === "maternal" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="care-card">
            <h4 style={{ color: "#0F6CBD", marginBottom: "8px" }}>1. Antenatal Care (ANC) Visits</h4>
            <p>Every pregnant woman should have at least 4 check-ups at the PHC:</p>
            <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#475569", marginTop: "6px" }}>
              <li><strong>1st Visit:</strong> Within 12 weeks (Registration & Blood test)</li>
              <li><strong>2nd Visit:</strong> 14–26 weeks (TT/Td injection & Ultrasound)</li>
              <li><strong>3rd Visit:</strong> 28–34 weeks (Blood pressure & growth check)</li>
              <li><strong>4th Visit:</strong> 36 weeks to term (Delivery planning)</li>
            </ul>
          </div>

          <div className="care-card" style={{ borderLeft: "4px solid #DC2626" }}>
            <h4 style={{ color: "#DC2626", marginBottom: "6px" }}>⚠️ High-Risk Danger Signs</h4>
            <p style={{ fontSize: "13px" }}>If any of these occur, call <strong>102/108</strong> immediately:</p>
            <p style={{ fontSize: "13px", color: "#DC2626", fontWeight: "600", marginTop: "4px" }}>
              Severe headache with blurred vision &bull; Swelling of hands/face &bull; Bleeding &bull; High fever &bull; Reduced baby movement.
            </p>
          </div>

          <div className="care-card">
            <h4 style={{ color: "#0D9488", marginBottom: "6px" }}>💰 Government Benefits (Janani Suraksha)</h4>
            <p style={{ fontSize: "13px" }}>
              Eligible rural mothers receive direct benefit transfer (₹1,400) for institutional delivery at government PHCs/Civil Hospitals.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="care-card">
            <h4 style={{ color: "#0F6CBD", marginBottom: "8px" }}>📅 Universal Immunization Timetable</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <div style={{ padding: "8px", background: "#F8FAFC", borderRadius: "8px" }}>
                <strong>At Birth:</strong> BCG, Hepatitis B (Birth dose), Oral Polio (OPV-0)
              </div>
              <div style={{ padding: "8px", background: "#F8FAFC", borderRadius: "8px" }}>
                <strong>6 Weeks:</strong> Pentavalent-1, Rotavirus-1, OPV-1, fIPV-1
              </div>
              <div style={{ padding: "8px", background: "#F8FAFC", borderRadius: "8px" }}>
                <strong>10 Weeks:</strong> Pentavalent-2, Rotavirus-2, OPV-2
              </div>
              <div style={{ padding: "8px", background: "#F8FAFC", borderRadius: "8px" }}>
                <strong>14 Weeks:</strong> Pentavalent-3, Rotavirus-3, OPV-3, fIPV-2
              </div>
              <div style={{ padding: "8px", background: "#F8FAFC", borderRadius: "8px" }}>
                <strong>9-12 Months:</strong> Measles-Rubella (MR-1), Vitamin A-1, PCV Booster
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
