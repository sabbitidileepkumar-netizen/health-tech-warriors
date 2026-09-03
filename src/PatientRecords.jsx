import React, { useEffect, useState } from "react";
import { getLocal } from "./dataStore";

function PatientRecords({ onBack }) {
  const [patients, setPatients] = useState([]);
  const [triageRecords, setTriageRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    setPatients(getLocal("patients"));
    setTriageRecords(getLocal("triage_records"));
    setReminders(getLocal("medicine_reminders"));
  }, []);

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.village?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const getPatientHistory = (name) =>
    triageRecords.filter((t) => t.patientName?.toLowerCase() === name.toLowerCase());

  const getPatientMeds = (name) =>
    reminders.filter((m) => m.patientName?.toLowerCase() === name.toLowerCase());

  if (selectedPatient) {
    const history = getPatientHistory(selectedPatient.name);
    const meds = getPatientMeds(selectedPatient.name);

    return (
      <div className="page-content">
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <button className="btn-outline" onClick={() => setSelectedPatient(null)}>⬅️ Back to List</button>
          {/* Tier 2: Print/Export Button */}
          <button className="btn-primary" onClick={() => window.print()} style={{ width: "auto", padding: "8px 14px", fontSize: "13px" }}>
            🖨️ Print / Export Record
          </button>
        </div>

        <div className="care-card" style={{ border: "2px solid #0F6CBD" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1.5px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
            <div>
              <h2 style={{ color: "#0F6CBD", margin: 0 }}>👤 {selectedPatient.name}</h2>
              <p style={{ margin: "2px 0", color: "#64748B", fontSize: "13px" }}>
                Patient ID: {selectedPatient.id} &bull; Registered: {new Date(selectedPatient.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "14px" }}>
              🩸 {selectedPatient.bloodGroup || "O+"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", marginBottom: "14px" }}>
            <div><strong>Age:</strong> {selectedPatient.age} yrs</div>
            <div><strong>Category:</strong> {selectedPatient.category}</div>
            <div><strong>Village:</strong> {selectedPatient.village}</div>
            <div><strong>Mobile:</strong> {selectedPatient.phone || "—"}</div>
          </div>

          {selectedPatient.organDonor && (
            <div style={{ background: "#FAF5FF", border: "1px solid #E9D5FF", padding: "8px 12px", borderRadius: "8px", marginBottom: "14px", fontSize: "12px", color: "#6B21A8" }}>
              🫀 <strong>Pledged Organ Donor</strong>: {selectedPatient.organsPledged?.join(", ") || "All Organs"}
            </div>
          )}

          <h3 style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginBottom: "8px" }}>
            🩺 Clinical Triage History ({history.length})
          </h3>
          {history.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>No clinical triage logged yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              {history.map((h) => (
                <div key={h.id} style={{ padding: "10px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong style={{ fontSize: "13px" }}>Priority: {h.priorityLevel}</strong>
                    <span style={{ fontSize: "11px", color: "#64748B" }}>Score: {h.score}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569" }}>
                    Symptoms: {h.symptoms?.join(", ") || "None"}
                  </p>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginBottom: "8px" }}>
            💊 Active Medication Schedules ({meds.length})
          </h3>
          {meds.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>No active medication reminders.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {meds.map((m) => (
                <div key={m.id} style={{ padding: "8px 10px", background: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0", fontSize: "12px" }}>
                  <strong>{m.medicine}</strong> &bull; {m.timing}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FAF5FF", color: "#7E22CE" }}>Health Directory</span>
      </div>

      <div className="care-card">
        <h2 style={{ color: "#7E22CE", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📁</span> Patient Records Registry
        </h2>

        <input
          type="text"
          placeholder="🔍 Search by name, village, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "14px" }}
        />

        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#64748B" }}>No matching patients found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid var(--border)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease"
                }}
              >
                <div>
                  <strong style={{ fontSize: "15px", color: "#0F172A" }}>👤 {p.name}</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
                    {p.age} yrs &bull; 📍 {p.village} &bull; 📞 {p.phone || "—"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                    {p.bloodGroup || "O+"}
                  </span>
                  <span style={{ color: "#0F6CBD", fontSize: "16px" }}>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientRecords;
