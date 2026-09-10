import React, { useEffect, useMemo, useState } from "react";
import { subscribeToCollection } from "./dataStore";

const isHighRisk = (record) => ["HIGH", "CRITICAL"].includes(String(record.priorityLevel || "").toUpperCase());
const isOpen = (status) => !["COMPLETED", "CANCELLED", "RESULT_READY"].includes(String(status || "").toUpperCase());

export function HighRiskFollowUp({ onBack, ashaProfile }) {
  const [triage, setTriage] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const village = ashaProfile?.village || "";

  useEffect(() => {
    const stops = [
      subscribeToCollection("triage_records", setTriage),
      subscribeToCollection("referrals", setReferrals),
      subscribeToCollection("appointments", setAppointments)
    ];
    return () => stops.forEach((stop) => stop());
  }, []);

  const patients = useMemo(() => {
    const byPatient = new Map();
    triage.filter(isHighRisk).filter((item) => !village || item.village === village).forEach((item) => {
      const key = item.patientId || item.patientName;
      if (!key) return;
      const current = byPatient.get(key);
      if (!current || new Date(item.timestamp || 0) > new Date(current.timestamp || 0)) byPatient.set(key, item);
    });
    return [...byPatient.values()].map((item) => {
      const key = item.patientId || item.patientName;
      const patientReferrals = referrals.filter((referral) => (referral.patientId || referral.patientName) === key && isOpen(referral.status));
      const patientAppointments = appointments.filter((appointment) => (appointment.patientId || appointment.patientName) === key && isOpen(appointment.status));
      return { ...item, openReferral: patientReferrals[0], nextAppointment: patientAppointments[0] };
    });
  }, [appointments, referrals, triage, village]);

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>← Back</button>
        <span className="badge" style={{ background: "#FEE2E2", color: "#B91C1C" }}>Follow-up watchlist</span>
      </div>
      <div style={{ background: "linear-gradient(135deg, #B91C1C, #DC2626)", color: "white", borderRadius: "16px", padding: "18px", marginBottom: "14px" }}>
        <h1 style={{ margin: 0, color: "white", fontSize: "20px" }}>High-risk patient follow-up</h1>
        <p style={{ margin: "5px 0 0", color: "#FEE2E2", fontSize: "13px" }}>Prioritise patients with high or critical triage results and unresolved care.</p>
      </div>
      {patients.length === 0 ? <p style={{ color: "#64748B", textAlign: "center", padding: "30px" }}>No high-risk patients in this ASHA area right now.</p> : (
        <div style={{ display: "grid", gap: "10px" }}>
          {patients.map((patient) => (
            <div className="care-card" key={patient.id} style={{ margin: 0, borderLeft: `5px solid ${patient.priorityLevel === "CRITICAL" ? "#B91C1C" : "#D97706"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <div><strong>👤 {patient.patientName}</strong><p style={{ margin: "4px 0", fontSize: "12px" }}>Priority: {patient.priorityLevel} · {patient.village}</p></div>
                <span className="badge" style={{ background: "#FEE2E2", color: "#B91C1C" }}>{patient.priorityLevel}</span>
              </div>
              <p style={{ margin: "5px 0", fontSize: "12px", color: "#475569" }}>Symptoms: {(patient.symptoms || []).join(", ") || "Clinical follow-up needed"}</p>
              {patient.openReferral && <p style={{ margin: "5px 0", fontSize: "12px", color: "#B45309" }}>🏥 Open referral: {patient.openReferral.facility} ({patient.openReferral.status})</p>}
              {patient.nextAppointment && <p style={{ margin: "5px 0", fontSize: "12px", color: "#075985" }}>📅 Appointment: {patient.nextAppointment.appointmentDate} · Token {patient.nextAppointment.queueToken || "pending"}</p>}
              {patient.patientPhone && <a className="btn-secondary" href={`tel:${patient.patientPhone}`} style={{ display: "inline-flex", marginTop: "6px", textDecoration: "none", fontSize: "12px" }}>📞 Call patient</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
