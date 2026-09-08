import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  subscribeToChildVaccines,
  addChildVaccineRecord,
  updateChildDoseStatusFirestore
} from "./dataStore";

function ChildVaccineTracker({ onBack }) {
  const [patients, setPatients] = useState([]);
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubP = subscribeToCollection("patients", (list) => {
      const children = list.filter((p) => p.category === "Child");
      setPatients(children);
      if (children.length > 0 && !selectedPatientId) {
        setSelectedPatientId(children[0].id);
      }
    });
    const unsubV = subscribeToChildVaccines((list) => setVaccineRecords(list));
    return () => {
      unsubP();
      unsubV();
    };
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const existingRecord = vaccineRecords.find((v) => v.patientId === selectedPatientId);

  const calculateProgress = (doses = []) => {
    if (doses.length === 0) return 0;
    const completed = doses.filter((d) => d.status === "Completed").length;
    return Math.round((completed / doses.length) * 100);
  };

  const handleCreateRecord = async () => {
    if (!selectedPatient) return;
    setCreating(true);
    try {
      await addChildVaccineRecord({
        patientId: selectedPatient.id,
        childName: selectedPatient.name,
        village: selectedPatient.village,
        phone: selectedPatient.phone,
        parentName: selectedPatient.name
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleDose = async (dose) => {
    if (!existingRecord) return;
    const nextStatus = dose.status === "Completed" ? "Upcoming" : "Completed";
    try {
      await updateChildDoseStatusFirestore(existingRecord.id, dose.id, existingRecord.doses, nextStatus);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEF3C7", color: "#B45309" }}>Child Vaccine Tracker</span>
      </div>

      <div className="care-card">
        <h2 style={{ color: "#D97706", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>👶</span> Vaccine Tracking (ASHA Update)
        </h2>

        <div style={{ marginBottom: "14px" }}>
          <label>👤 Select Registered Child</label>
          {patients.length === 0 ? (
            <p style={{ color: "#DC2626" }}>
              No registered children found. Register a patient with category "Child" first.
            </p>
          ) : (
            <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age} yrs, {p.village})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedPatient && !existingRecord && (
          <div style={{ textAlign: "center", padding: "20px", background: "#FFFBEB", borderRadius: "12px", border: "1px solid #FDE68A" }}>
            <p style={{ fontSize: "13px", color: "#92400E", marginBottom: "10px" }}>
              No vaccine record yet for {selectedPatient.name}.
            </p>
            <button className="btn-primary" style={{ background: "#D97706" }} onClick={handleCreateRecord} disabled={creating}>
              {creating ? "Creating..." : "➕ Start Vaccine Record (UIP Schedule)"}
            </button>
          </div>
        )}

        {existingRecord && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <strong>{existingRecord.childName}</strong>
              <span style={{ fontWeight: "bold", color: "#D97706" }}>
                {calculateProgress(existingRecord.doses)}% Complete
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {existingRecord.doses.map((dose) => {
                const isDone = dose.status === "Completed";
                return (
                  <div
                    key={dose.id}
                    className="care-card"
                    style={{ margin: 0, borderLeft: isDone ? "6px solid #16A34A" : "6px solid #CBD5E1" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "14px" }}>{dose.name}</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#0F6CBD" }}>
                          ⏰ {dose.duePeriod}
                        </p>
                        {dose.dateGiven && (
                          <p style={{ margin: 0, fontSize: "11px", color: "#166534" }}>
                            ✓ Given: {dose.dateGiven}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleDose(dose)}
                        className="btn-outline"
                        style={{
                          padding: "6px 10px",
                          fontSize: "12px",
                          color: isDone ? "#DC2626" : "#16A34A",
                          borderColor: isDone ? "#DC2626" : "#16A34A"
                        }}
                      >
                        {isDone ? "Mark Pending" : "✓ Mark Given"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChildVaccineTracker;
