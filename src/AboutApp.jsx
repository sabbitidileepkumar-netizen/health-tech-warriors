import React from "react";

export function AboutApp({ onBack }) {
  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>SIH 2026</span>
      </div>

      <div className="care-card">
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0F6CBD, #0D9488)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "32px",
              marginBottom: "10px"
            }}
          >
            🩺
          </div>
          <h1 style={{ color: "#0F6CBD", margin: 0 }}>CareLink</h1>
          <p style={{ fontWeight: "600", color: "#64748B", fontSize: "13px" }}>
            Accessible Public Healthcare Platform for Rural India
          </p>
        </div>

        <div style={{ background: "#F1F5F9", padding: "12px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
          <p style={{ margin: "2px 0" }}><strong>Hackathon:</strong> Smart India Hackathon 2026</p>
          <p style={{ margin: "2px 0" }}><strong>Problem ID:</strong> SIH26133</p>
          <p style={{ margin: "2px 0" }}><strong>Ministry:</strong> Government of Maharashtra</p>
          <p style={{ margin: "2px 0" }}><strong>Theme:</strong> MedTech / HealthTech Accessibility in Rural & Underserved Areas</p>
        </div>

        <h3 style={{ marginBottom: "8px", color: "#0F172A" }}>Core Features Built:</h3>
        <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#475569", lineHeight: "1.7" }}>
          <li><strong>Universal Icon-First Design:</strong> Built for low-literacy rural populations with voice prompt assistance.</li>
          <li><strong>Trilingual Engine:</strong> Full support for English, मराठी (Marathi), and తెలుగు (Telugu).</li>
          <li><strong>Emergency Accident Blood Matcher:</strong> Immediate search for nearby compatible blood units and verified volunteer donors during trauma.</li>
          <li><strong>Medication Adherence Reminders:</strong> Automated daily SMS/phone alerts for elderly and chronic patients.</li>
          <li><strong>Organ Donor Registry:</strong> Pledge portal for citizen consent cards in collaboration with NOTTO.</li>
          <li><strong>Mass Outbreak & Health Camp SOS:</strong> Real-time surveillance triggers an urgent alert when cases in a village exceed 100+, dispatching mobile medical teams.</li>
          <li><strong>ASHA Worker Workflow:</strong> Registered patient triage, color-coded priority queue, 4-stage PHC referral pipeline, and printable health records.</li>
          <li><strong>Offline-First Resilience:</strong> Works without continuous internet connectivity during field rounds in remote tribal/rural villages.</li>
        </ul>

        <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
          CareLink &bull; Built with ❤️ for SIH 2026 by Health Tech Warriors
        </div>
      </div>
    </div>
  );
}
