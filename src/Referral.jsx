import React, { useEffect, useState } from "react";
import { getLocal, addReferral, updateReferralStatus } from "./dataStore";
import {
  ArrowLeft,
  Hospital,
  User,
  FileText,
  Ambulance,
  Send,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

const statusSteps = ["Referred", "Reached", "Under Treatment", "Completed"];
const facilities = [
  "Tanuku Government Area Hospital (AH Tanuku)",
  "Bhimavaram Community Health Centre (CHC)",
  "Attili 24x7 Primary Health Centre (PHC)",
  "K.S. Gattu 24x7 Sub-Centre"
];

function Referral({ onBack, defaultPatient, lang = "en" }) {
  const [patients, setPatients] = useState(() => getLocal("patients"));
  const [patientName, setPatientName] = useState(defaultPatient ? defaultPatient.name : "");
  const [facility, setFacility] = useState(facilities[0]);
  const [reason, setReason] = useState(defaultPatient?.reason || "");
  const [needAmbulance, setNeedAmbulance] = useState(defaultPatient?.needAmbulance || false);
  const [referrals, setReferrals] = useState(() => getLocal("referrals"));

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
    <div className="page-content" style={{ maxWidth: "840px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button
          className="btn-outline"
          onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <span
          className="badge"
          style={{
            background: "#FFFBEB",
            color: "#D97706",
            border: "1px solid #FDE68A",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "700"
          }}
        >
          <Hospital size={14} color="#D97706" />
          Facility Escalation Pipeline
        </span>
      </div>

      <div className="care-card" style={{ padding: "22px", borderRadius: "16px" }}>
        <h2 style={{ color: "#D97706", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", fontWeight: "800" }}>
          <Hospital size={22} color="#D97706" />
          {lang === "te" ? "ఆసుపత్రి రిఫరల్ నమోదు" : "Create Hospital Referral Record"}
        </h2>

        <form onSubmit={handleCreate} style={{ marginBottom: "10px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={14} color="#64748B" />
              {lang === "te" ? "రోగిని ఎంచుకోండి:" : "Select Patient:"}
            </label>
            {patients.length > 0 ? (
              <select
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                style={{ borderRadius: "10px" }}
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
                style={{ borderRadius: "10px" }}
              />
            )}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Hospital size={14} color="#64748B" />
              {lang === "te" ? "తరలించాల్సిన ఆసుపత్రి:" : "Target Medical Facility:"}
            </label>
            <input
              type="text"
              list="facility-options"
              placeholder="Type or choose a facility"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            />
            <datalist id="facility-options">
              {facilities.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={14} color="#64748B" />
              {lang === "te" ? "లక్షణాలు / రిఫరల్ కారణం:" : "Clinical Reason / Symptoms Summary:"}
            </label>
            <input
              type="text"
              placeholder="e.g. Severe Dehydration / Chest Pain / Diabetic Crisis"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </div>

          <div style={{ marginBottom: "16px", padding: "12px 14px", background: "#FEF2F2", borderRadius: "12px", border: "1.5px solid #FECACA" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, color: "#DC2626", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={needAmbulance}
                onChange={(e) => setNeedAmbulance(e.target.checked)}
                style={{ width: "auto" }}
              />
              <span style={{ fontWeight: "800", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Ambulance size={18} color="#DC2626" />
                {lang === "te" ? "108 ఎమర్జెన్సీ అంబులెన్స్ రిక్వెస్ట్ చేయండి" : "Request 108 Emergency Ambulance for Transport"}
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
              borderRadius: "10px",
              padding: "12px 18px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)"
            }}
          >
            <Send size={16} />
            {lang === "te" ? "రిఫరల్ నమోదు చేసి పంపండి" : "Dispatch & Register Referral"}
          </button>
        </form>
      </div>

      <h3 style={{ margin: "20px 0 12px", fontSize: "16px", fontWeight: "800", color: "#1E293B" }}>
        Active Facility Referrals ({referrals.length})
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {referrals.map((r) => (
          <div key={r.id} className="care-card" style={{ margin: 0, borderRadius: "14px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <strong style={{ fontSize: "16px", color: "#0F172A", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <User size={15} color="#0F6CBD" />
                  {r.patientName}
                </strong>
                <p style={{ margin: "3px 0", fontSize: "13px", color: "#0F6CBD", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <ChevronRight size={14} /> {r.facility}
                </p>
                {r.reason && (
                  <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>
                    Reason: {r.reason}
                  </p>
                )}
                {r.ambulanceDispatched && (
                  <span
                    className="badge"
                    style={{
                      background: "#FEE2E2",
                      color: "#DC2626",
                      marginTop: "6px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "700"
                    }}
                  >
                    <Ambulance size={12} /> 108 Ambulance Dispatched
                  </span>
                )}
              </div>

              <span className={"badge " + (r.status === "Completed" ? "badge-low" : "badge-med")}>
                {r.status}
              </span>
            </div>

            {/* 4-Stage Timeline Tracker */}
            <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
              {statusSteps.map((step, idx) => {
                const currentIdx = statusSteps.indexOf(r.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;
                return (
                  <span
                    key={step}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: isCurrent ? "800" : "600",
                      background: isCurrent ? "#D97706" : isPassed ? "#16A34A" : "#F1F5F9",
                      color: isCurrent || isPassed ? "white" : "#64748B",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    {isPassed && <CheckCircle2 size={12} />}
                    {step}
                  </span>
                );
              })}
            </div>

            {r.status !== "Completed" && (
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => advanceStatus(r)}
                  className="btn-outline"
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    borderColor: "#D97706",
                    color: "#D97706",
                    padding: "6px 12px"
                  }}
                >
                  Advance to Next Stage &rarr;
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Referral;
