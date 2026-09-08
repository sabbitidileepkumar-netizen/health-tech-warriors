import React, { useState, useEffect } from "react";
import { subscribeToCollection, addTriageRecord, getLocal } from "./dataStore";

const symptomsList = [
  { key: "breathing", label: "Breathing Difficulty", icon: "🫁", weight: 8 },
  { key: "chestPain", label: "Chest Pain / Pressure", icon: "💔", weight: 8 },
  { key: "diarrhea", label: "Diarrhea (Severe / Dehydrated)", icon: "🚰", weight: 4 },
  { key: "vomiting", label: "Frequent Vomiting", icon: "🤢", weight: 4 },
  { key: "fever", label: "High Fever (>101°F)", icon: "🌡️", weight: 3 },
  { key: "cough", label: "Persistent Cough", icon: "😷", weight: 2 },
  { key: "weakness", label: "Extreme Weakness / Fatigue", icon: "😴", weight: 2 },
  { key: "headache", label: "Severe Headache", icon: "🤕", weight: 1 }
];

function Triage({ onBack, onNavigateToReferral, t }) {
  const [patients, setPatients] = useState(() => getLocal("patients"));
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [result, setResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(null);

  useEffect(() => {
    const unsub = subscribeToCollection("patients", (list) => {
      setPatients(list);
      if (list.length > 0 && !selectedPatientId) {
        setSelectedPatientId(list[0].id);
      }
    });
    return () => unsub();
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const toggleSymptom = (key) => {
    setSelectedSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateScore = () => {
    return symptomsList.reduce((sum, s) => sum + (selectedSymptoms[s.key] ? s.weight : 0), 0);
  };

  const getPriority = (score) => {
    if (score >= 8) {
      return {
        level: "HIGH",
        color: "#DC2626",
        bg: "#FEE2E2",
        icon: "🔴",
        action: "Urgent PHC / District Hospital Referral Required!"
      };
    }
    if (score >= 4) {
      return {
        level: "MEDIUM",
        color: "#D97706",
        bg: "#FEF3C7",
        icon: "🟡",
        action: "Schedule PHC Doctor Consultation within 24 Hours."
      };
    }
    return {
      level: "LOW",
      color: "#16A34A",
      bg: "#DCFCE7",
      icon: "🟢",
      action: "Home Care & ASHA follow-up monitoring in 48 hours."
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const score = calculateScore();
    const priority = getPriority(score);
    setResult(priority);

    const activeSymptoms = Object.keys(selectedSymptoms).filter((k) => selectedSymptoms[k]);

    try {
      const savedResult = await addTriageRecord({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        village: selectedPatient.village,
        symptoms: activeSymptoms,
        score,
        priorityLevel: priority.level
      });

      setSavedSuccess(savedResult._pendingSync ? "offline" : "online");
    } catch (err) {
      console.error(err);
      setSavedSuccess("error");
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#E6F7F5", color: "#0D9488" }}>Clinical Screening</span>
      </div>

      <div className="care-card">
        <h2 style={{ color: "#0D9488", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🩺</span> Patient Triage & Screening
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label>👤 Select Registered Patient</label>
            {patients.length === 0 ? (
              <p style={{ color: "#DC2626" }}>No registered patients found. Please register a patient first.</p>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age} yrs, {p.village}) - Blood: {p.bloodGroup || "O+"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedPatient && (
            <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: "10px", marginBottom: "16px", border: "1px solid var(--border)", fontSize: "13px" }}>
              <span style={{ fontWeight: "bold" }}>Details: </span>
              {selectedPatient.category} &bull; 🎂 {selectedPatient.age} yrs &bull; 🏡 {selectedPatient.village} &bull; 🩸 {selectedPatient.bloodGroup || "O+"}
            </div>
          )}

          <label style={{ marginBottom: "8px" }}>Select Observed Symptoms:</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "18px" }}>
            {symptomsList.map((s) => {
              const isChecked = !!selectedSymptoms[s.key];
              return (
                <label
                  key={s.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "10px",
                    border: isChecked ? "2px solid #0D9488" : "1.5px solid var(--border)",
                    backgroundColor: isChecked ? "#E6F7F5" : "white",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSymptom(s.key)}
                    style={{ width: "auto" }}
                  />
                  <span>{s.icon} {s.label}</span>
                </label>
              );
            })}
          </div>

          <button type="submit" className="btn-primary" style={{ background: "#0D9488" }}>
            ⚖️ Calculate Priority Score & Save
          </button>
        </form>

        {result && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "14px",
              backgroundColor: result.bg,
              border: `2px solid ${result.color}`,
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "24px" }}>{result.icon}</div>
            <h3 style={{ color: result.color, margin: "6px 0" }}>
              PRIORITY LEVEL: {result.level}
            </h3>
            <p style={{ color: "#1E293B", fontSize: "13px", fontWeight: "600", margin: "4px 0" }}>
              {result.action}
            </p>

            {savedSuccess === "online" && (
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#166534", fontWeight: "bold" }}>
                ✓ Record saved to Priority Queue and Village Surveillance
              </div>
            )}
            {savedSuccess === "offline" && (
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#92400E", fontWeight: "bold" }}>
                📴 Saved on device — will sync when internet is back
              </div>
            )}
            {savedSuccess === "error" && (
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#991B1B", fontWeight: "bold" }}>
                ❌ Could not save record. Please try again.
              </div>
            )}

            {result.level === "HIGH" && (
              <button
                className="btn-danger"
                onClick={() => onNavigateToReferral && onNavigateToReferral(selectedPatient)}
                style={{ marginTop: "12px", width: "100%", padding: "10px" }}
              >
                🏥 Immediately Create Hospital Referral
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Triage;
