import React, { useState } from "react";

export function EmergencyModal({ onClose, lang = "en", userLocation }) {
  const [called, setCalled] = useState(null);

  const emergencyContacts = [
    { name: "National Ambulance Service", number: "108", desc: "For accidents, trauma & critical emergencies", icon: "🚑", color: "#DC2626" },
    { name: "Police Emergency", number: "100", desc: "Crime, accidents & law enforcement", icon: "🚓", color: "#1D4ED8" },
    { name: "Fire Emergency", number: "101", desc: "Fire outbreaks & rescue operations", icon: "🔥", color: "#EA580C" },
    { name: "Janani Shishu Ambulance", number: "102", desc: "For pregnant mothers & sick newborns", icon: "🤰", color: "#D97706" },
    { name: "Andhra Pradesh Health Helpline", number: "104", desc: "24x7 Doctor consultation & health queries", icon: "📞", color: "#0F6CBD" },
    { name: "Women's Helpline", number: "181", desc: "24x7 support for women in distress", icon: "🆘", color: "#BE185D" },
    { name: "Child Helpline", number: "1098", desc: "For child safety & welfare emergencies", icon: "🧒", color: "#7E22CE" },
    { name: "Nearest PHC Emergency Desk", number: "08819-255789", desc: "Tanuku Government Area Hospital", icon: "🏥", color: "#0D9488" }
  ];

  const handleCall = (contact) => {
    setCalled(contact);
  };

  const locationLabel =
    userLocation && userLocation.village && userLocation.coords
      ? `${userLocation.village} (${userLocation.coords})`
      : "Location Unavailable";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🚨</span>
            <div>
              <h2 style={{ color: "#DC2626", margin: 0 }}>Emergency SOS Assistance</h2>
              <p style={{ margin: 0, fontSize: "12px" }}>Instant Help for Rural Emergencies</p>
            </div>
          </div>
          <button className="btn-outline" onClick={onClose} style={{ padding: "4px 10px" }}>✕</button>
        </div>

        {called ? (
          <div style={{ textAlign: "center", padding: "20px 10px", background: "#FEF2F2", borderRadius: "14px", border: "1.5px solid #FECACA" }}>
            <span style={{ fontSize: "40px" }}>📞</span>
            <h3 style={{ color: "#DC2626", marginTop: "10px" }}>Calling {called.number}...</h3>
            <p style={{ fontWeight: 600, color: "#1E293B" }}>{called.name}</p>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "6px" }}>
              📍 Location transmitted: <strong>{locationLabel}</strong>
            </p>
            <div style={{ marginTop: "16px", display: "flex", gap: "8px", justifyContent: "center" }}>
              <a href={`tel:${called.number}`} className="btn-danger" style={{ textDecoration: "none" }}>
                Direct Phone Call
              </a>
              <button className="btn-outline" onClick={() => setCalled(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "#FEF3C7", padding: "10px 12px", borderRadius: "10px", fontSize: "13px", color: "#92400E" }}>
              ⚠️ In critical accidents, keep the patient still and request nearest ambulance immediately.
            </div>

            <div style={{ fontSize: "12px", color: "#64748B", padding: "0 2px" }}>
              📍 Your location: <strong>{locationLabel}</strong>
            </div>

            {emergencyContacts.map((c) => (
              <div
                key={c.number}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "12px",
                  background: "#FAFAFA"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "28px" }}>{c.icon}</div>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>{c.name}</strong>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>{c.desc}</div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: c.color }}>Dial: {c.number}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCall(c)}
                  style={{
                    backgroundColor: c.color,
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "13px"
                  }}
                >
                  Call Now
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "18px", textAlign: "center" }}>
          <button className="btn-outline" onClick={onClose} style={{ width: "100%" }}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
