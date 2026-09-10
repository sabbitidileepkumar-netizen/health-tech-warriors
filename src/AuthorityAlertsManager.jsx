import React, { useState, useEffect } from "react";
import { subscribeToCollection, addAlert, toggleAlertActive } from "./dataStore";
import { VILLAGES, DEFAULT_VILLAGE } from "./villageConfig";

export function AuthorityAlertsManager({ lang = "en" }) {
  const [alerts, setAlerts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("FLOOD");
  const [severity, setSeverity] = useState("HIGH");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("VILLAGE");
  const [selectedVillages, setSelectedVillages] = useState([DEFAULT_VILLAGE]);
  const [audience, setAudience] = useState("BOTH");

  const villages = VILLAGES;

  useEffect(() => {
    const unsub = subscribeToCollection("alerts", (list) => {
      setAlerts(list);
    });
    return () => unsub();
  }, []);

  const toggleVillage = (v) => {
    setSelectedVillages((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    await addAlert({
      title,
      type,
      severity,
      message,
      targetType,
      targetVillages: targetType === "ALL" ? villages : selectedVillages,
      audience
    });

    setShowCreate(false);
    setTitle("");
    setMessage("");
  };

  const handleToggle = async (id, currentActive) => {
    await toggleAlertActive(id, !currentActive);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px" }}>🚨 Public Health & Disaster Alerts</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
            Targeted emergency broadcasts to citizens and frontline health workers
          </p>
        </div>
        <button
          className="btn-danger"
          onClick={() => setShowCreate(true)}
          style={{ width: "auto", padding: "8px 16px", fontSize: "13px" }}
        >
          📢 Broadcast Alert
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {alerts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "30px" }}>No alerts issued.</p>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className="care-card"
              style={{
                borderLeft: alt.severity === "CRITICAL" ? "4px solid #DC2626" : "4px solid #EA580C",
                opacity: alt.active ? 1 : 0.6
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "18px" }}>
                      {alt.type === "FLOOD" ? "🌊" : alt.type === "HEATWAVE" ? "☀️" : alt.type === "DISEASE" ? "🏕️" : "⚠️"}
                    </span>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>{alt.title}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                    Type: <strong>{alt.type}</strong> &bull; Audience: <strong>{alt.audience}</strong> &bull; Target:{" "}
                    <strong>{alt.targetVillages?.join(", ") || "All"}</strong>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(alt.id, alt.active)}
                  style={{
                    background: alt.active ? "#DCFCE7" : "#F1F5F9",
                    color: alt.active ? "#166534" : "#64748B",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {alt.active ? "🟢 ACTIVE" : "⚪ INACTIVE"}
                </button>
              </div>

              <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
                {alt.message}
              </p>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: "#DC2626" }}>📢 Broadcast Public Alert</h3>
              <button className="btn-outline" onClick={() => setShowCreate(false)} style={{ padding: "4px 8px" }}>✕</button>
            </div>

            <form onSubmit={handleBroadcast}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Alert Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Godavari Basin Flash Flood Advisory"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Category
                  </label>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%" }}>
                    <option value="FLOOD">🌊 Flood Alert</option>
                    <option value="CYCLONE">🌀 Cyclone Alert</option>
                    <option value="HEATWAVE">☀️ Heatwave Alert</option>
                    <option value="DISEASE">🏕️ Disease Outbreak</option>
                    <option value="SEASONAL">🌦️ Seasonal Health Alert</option>
                    <option value="ANNOUNCEMENT">📢 General Health Advisory</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Severity Level
                  </label>
                  <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: "100%" }}>
                    <option value="CRITICAL">🚨 Critical Danger</option>
                    <option value="HIGH">🔴 High Alert</option>
                    <option value="MEDIUM">🟡 Moderate Advisory</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Target Audience
                  </label>
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: "100%" }}>
                    <option value="BOTH">👥 Both Citizens & ASHA</option>
                    <option value="CITIZEN">👤 Citizens Only</option>
                    <option value="ASHA_WORKER">👩‍⚕️ ASHA Workers Only</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Geographic Scope
                  </label>
                  <select value={targetType} onChange={(e) => setTargetType(e.target.value)} style={{ width: "100%" }}>
                    <option value="VILLAGE">Specific Village(s)</option>
                    <option value="ALL">Entire District (All Villages)</option>
                  </select>
                </div>
              </div>

              {targetType === "VILLAGE" && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Select Villages
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {villages.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleVillage(v)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          border: selectedVillages.includes(v) ? "1.5px solid #DC2626" : "1px solid #CBD5E1",
                          background: selectedVillages.includes(v) ? "#FEE2E2" : "white",
                          color: selectedVillages.includes(v) ? "#DC2626" : "#475569",
                          fontWeight: selectedVillages.includes(v) ? "700" : "500",
                          cursor: "pointer"
                        }}
                      >
                        {selectedVillages.includes(v) ? "✓ " : "+ "}
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Alert Message *
                </label>
                <textarea
                  rows="3"
                  placeholder="Clear instructions for citizens / health workers..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
                />
              </div>

              <button
                type="submit"
                className="btn-danger"
                style={{ width: "100%", padding: "10px", fontSize: "14px", fontWeight: "700" }}
              >
                📢 Broadcast Alert Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityAlertsManager;
