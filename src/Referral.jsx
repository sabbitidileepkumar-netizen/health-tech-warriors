import React, { useEffect, useState } from "react";
import { getLocal, addReferral, updateReferralStatus } from "./dataStore";

const statusSteps = ["Referred", "Reached", "Under Treatment", "Completed"];
const facilities = [
  "Nearby PHC (Wardha Rural)",
  "Community Health Centre (Bhamragad)",
  "District Civil Hospital (Chandrapur)",
  "Sevagram Medical Emergency Hub"
];

function Referral({ onBack, defaultPatient }) {
  const [patients, setPatients] = useState([]);
  const [patientName, setPatientName] = useState(defaultPatient ? defaultPatient.name : "");
  const [facility, setFacility] = useState(facilities[0]);
  const [reason, setReason] = useState("");
  const [needAmbulance, setNeedAmbulance] = useState(false);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    setPatients(getLocal("patients"));
    setReferrals(getLocal("referrals"));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!patientName) return;

    await addReferral({
      patientName,
      facility,
      reason: reason || "High Priority Medical Escalation",
      ambulanceDispatched: needAmbulance
    });

    setReferrals(getLocal("referrals"));
    setPatientName("");
    setReason("");
    setNeedAmbulance(false);
  };

  const advanceStatus = (refItem) => {
    const currentIndex = statusSteps.indexOf(refItem.status);
    if (currentIndex < statusSteps.length - 1) {
      const nextStatus = statusSteps[currentIndex + 1];
      const updated = updateReferralStatus(refItem.id, nextStatus);
      setReferrals([...updated]);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FFFBEB", color: "#D97706" }}>Facility Pipeline</span>
      </div>

      <div className="care-card">
        <h2 style={{ color: "#D97706", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🏥</span> Create Hospital Referral
        </h2>

        <form onSubmit={handleCreate} style={{ marginBottom: "10px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label>👤 Select Patient</label>
            {patients.length > 0 ? (
              <select
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              >
                <option value="">-- Choose Registered Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.village}, {p.age} yrs)
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            )}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>🏥 Target Medical Facility</label>
            <select value={facility} onChange={(e) => setFacility(e.target.value)}>
              {facilities.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>📝 Reason / Symptoms Summary</label>
            <input
              type="text"
              placeholder="e.g. Severe Dehydration / Chest Pain / Pregnancy Complication"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px", padding: "10px", background: "#FEF2F2", borderRadius: "10px", border: "1px solid #FECACA" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, color: "#DC2626", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={needAmbulance}
                onChange={(e) => setNeedAmbulance(e.target.checked)}
                style={{ width: "auto" }}
              />
              <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                🚑 Request 108 Emergency Ambulance for Transport
              </span>
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ background: "#D97706" }}>
            ➕ Dispatch & Register Referral
          </button>
        </form>
      </div>

      <h3 style={{ margin: "16px 0 10px" }}>Active Facility Referrals ({referrals.length})</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {referrals.map((r) => (
          <div key={r.id} className="care-card" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong style={{ fontSize: "15px", color: "#0F172A" }}>👤 {r.patientName}</strong>
                <p style={{ margin: "2px 0", fontSize: "13px", color: "#0F6CBD", fontWeight: "600" }}>
                  &rarr; {r.facility}
                </p>
                {r.reason && (
                  <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>
                    Reason: {r.reason}
                  </p>
                )}
                {r.ambulanceDispatched && (
                  <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626", marginTop: "4px" }}>
                    🚑 Ambulance Dispatched
                  </span>
                )}
              </div>

              <span className={`badge ${r.status === "Completed" ? "badge-low" : "badge-med"}`}>
                {r.status}
              </span>
            </div>

            {/* 4-Stage Timeline Tracker */}
            <div style={{ display: "flex", gap: "4px", marginTop: "12px", flexWrap: "wrap" }}>
              {statusSteps.map((step, idx) => {
                const currentIdx = statusSteps.indexOf(r.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;
                return (
                  <span
                    key={step}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: isCurrent ? "#0F6CBD" : isPassed ? "#E2E8F0" : "#F8FAFC",
                      color: isCurrent ? "white" : isPassed ? "#1E293B" : "#94A3B8",
                      border: "1px solid " + (isCurrent ? "#0F6CBD" : "#E2E8F0")
                    }}
                  >
                    {idx + 1}. {step}
                  </span>
                );
              })}
            </div>

            {r.status !== "Completed" && (
              <button
                onClick={() => advanceStatus(r)}
                className="btn-outline"
                style={{ marginTop: "10px", width: "100%", padding: "8px", fontSize: "12px", color: "#0F6CBD", borderColor: "#0F6CBD" }}
              >
                ➡️ Advance Referral to Next Stage
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Referral;
