import React, { useState } from "react";
import { addOutbreakReport } from "./dataStore";
import { VILLAGES, DEFAULT_VILLAGE } from "./villageConfig";

export function AshaOutbreakReportModal({ onClose, ashaProfile, lang = "en" }) {
  const [village, setVillage] = useState(ashaProfile?.village || DEFAULT_VILLAGE);
  const [condition, setCondition] = useState("Acute Gastroenteritis / Diarrhea");
  const [affectedCount, setAffectedCount] = useState(15);
  const [severity, setSeverity] = useState("SEVERE");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const villages = VILLAGES;
  const conditions = [
    "Acute Gastroenteritis / Watery Diarrhea",
    "Viral Fever with Dengue Warning Signs",
    "Jaundice / Hepatitis Water Contamination",
    "Acute Lower Respiratory Infection (Children)",
    "Measles / Skin Rash Outbreak",
    "Other Suspected Infectious Disease"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!village || !condition) return;

    await addOutbreakReport({
      village,
      condition,
      affectedCount: Number(affectedCount) || 1,
      severity,
      description: description || `Outbreak of ${condition} observed in ${village} households.`,
      reportedByAshaId: ashaProfile?.workerId || ashaProfile?.id || "ASHA-001",
      reportedByAshaName: ashaProfile?.name || "Rani Devi",
      date: new Date().toISOString().split("T")[0]
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>🚨</span>
            <h3 style={{ margin: 0, color: "#DC2626" }}>Report Village Disease Outbreak</h3>
          </div>
          <button className="btn-outline" onClick={onClose} style={{ padding: "4px 8px" }}>✕</button>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px", background: "#DCFCE7", borderRadius: "12px", border: "1.5px solid #86EFAC" }}>
            <span style={{ fontSize: "40px" }}>✅</span>
            <h3 style={{ color: "#166534", margin: "10px 0 4px 0" }}>Report Transmitted to DM&HO!</h3>
            <p style={{ fontSize: "12px", color: "#14532D", margin: 0 }}>
              Higher Authority has been alerted. Mobile Medical Units & supplies are being reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Affected Village *
              </label>
              <select value={village} onChange={(e) => setVillage(e.target.value)} style={{ width: "100%" }}>
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Suspected Disease / Condition *
              </label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ width: "100%" }}>
                {conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Estimated Affected People *
                </label>
                <input
                  type="number"
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Severity Level
                </label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: "100%" }}>
                  <option value="CRITICAL">🚨 Critical / Epidemic</option>
                  <option value="SEVERE">🔴 Severe</option>
                  <option value="MODERATE">🟡 Moderate</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Field Observations / Local Contamination Cause
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Drinking water pipeline leak observed near community borewell..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" className="btn-outline" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn-danger" style={{ flex: 2, padding: "10px" }}>
                🚨 Submit Emergency Outbreak Alert
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AshaOutbreakReportModal;
