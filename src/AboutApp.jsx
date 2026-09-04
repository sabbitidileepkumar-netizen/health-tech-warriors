import React from "react";

export function AboutApp({ onBack, lang = "en" }) {
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
            Accessible Public Healthcare Platform for Rural & Underserved India
          </p>
        </div>

        <div style={{ background: "#F1F5F9", padding: "12px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
          <p style={{ margin: "2px 0" }}><strong>Hackathon:</strong> Smart India Hackathon 2026</p>
          <p style={{ margin: "2px 0" }}><strong>Problem ID:</strong> SIH26133</p>
          <p style={{ margin: "2px 0" }}><strong>Focus Region:</strong> West Godavari (Relangi &bull; Tanuku &bull; Attili &bull; K.S. Gattu)</p>
          <p style={{ margin: "2px 0" }}><strong>Theme:</strong> MedTech / Rural Frontline Health Lifeline</p>
        </div>

        <h3 style={{ marginBottom: "8px", color: "#0F172A" }}>Core System Pillars Built:</h3>
        <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#475569", lineHeight: "1.7" }}>
          <li><strong>🌐 Multilingual & Voice-First:</strong> Designed for low-literacy rural users with Telugu, English, Hindi, and Marathi voice assistance.</li>
          <li><strong>📴 Offline-First Resilience:</strong> Functions seamlessly in zero-connectivity field rounds with background cloud sync.</li>
          <li><strong>🧑‍⚕️ ASHA Worker Gatekeeper:</strong> Secure clinical authentication gate with quick-access beats for frontline workers.</li>
          <li><strong>👥 All Members Directory:</strong> Filterable village demographic and longitudinal health registry.</li>
          <li><strong>📋 Longitudinal Health Records:</strong> Clinical history, active prescriptions, triage timeline, and printable case sheets.</li>
          <li><strong>🚨 Clinical Triage & Weighted Priority:</strong> 8-vital indicator algorithm calculating High, Medium, and Low urgency queues.</li>
          <li><strong>👶 Child Polio & Immunization Tracker:</strong> National UIP schedule with Pulse Polio campaign alerts & parent SMS reminders.</li>
          <li><strong>🐍 Venomous & Wild Animal Attack Lifeline:</strong> Step-by-step Golden Hour first aid and live Anti-Snake Venom (ASV) stocks across Tanuku and Bhimavaram.</li>
          <li><strong>🌊 Disaster & Flood Rapid Response Mode:</strong> Real-time Godavari river flood monitoring, shelter capacity, and chlorine distribution.</li>
          <li><strong>💊 Storage & Supply Priority Intelligence:</strong> Priority 1 (Critical ASV/ORS) to Priority 3 (Chronic) stock health tracking.</li>
          <li><strong>🌦️ Seasonal Weather Health Intelligence:</strong> Disease outbreak forecasting adapted to monsoon, summer, and winter risks.</li>
          <li><strong>🤖 Conversational AI Health Assistant:</strong> Multilingual audio-enabled AI copilot for immediate medical advice.</li>
          <li><strong>🩸 Accident Blood Matcher & 108 Dispatch:</strong> Radius-based verified blood donor matching and instant emergency call.</li>
        </ul>

        <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
          CareLink &bull; Built with ❤️ for SIH 2026 by Health Tech Warriors
        </div>
      </div>
    </div>
  );
}

export default AboutApp;
