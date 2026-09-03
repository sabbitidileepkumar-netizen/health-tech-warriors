import React, { useState, useEffect } from "react";
import { getLocal, addMedicineReminder } from "./dataStore";

export function MedicineReminders({ onBack, lang = "en" }) {
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [medicine, setMedicine] = useState("");
  const [timing, setTiming] = useState("Morning (8:00 AM) & Night (8:00 PM)");
  const [purpose, setPurpose] = useState("");
  const [smsNotification, setSmsNotification] = useState(null);

  useEffect(() => {
    setReminders(getLocal("medicine_reminders"));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!patientName || !medicine || !phone) return;
    addMedicineReminder({
      patientName,
      phone,
      medicine,
      timing,
      purpose: purpose || "General Prescription"
    });
    setReminders(getLocal("medicine_reminders"));
    setShowAdd(false);
    setPatientName("");
    setPhone("");
    setMedicine("");
    setPurpose("");
  };

  const triggerSmsSim = (item) => {
    setSmsNotification({
      phone: item.phone,
      msg: `CareLink Health Alert: Namaste ${item.patientName}, it's time for your ${item.medicine}. Take with warm water.`
    });
    setTimeout(() => {
      setSmsNotification(null);
    }, 7000);
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>SMS & Call Reminders</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F6CBD 0%, #0D9488 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>💊</span>
          <div>
            <h1 style={{ color: "white", fontSize: "20px", margin: 0 }}>Medication Reminders</h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "13px" }}>
              Automated phone SMS reminders so rural patients never miss their dose
            </p>
          </div>
        </div>
      </div>

      {smsNotification && (
        <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", padding: "12px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534", fontWeight: "bold" }}>
            <span>📲</span> Simulated SMS Dispatched to {smsNotification.phone}!
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#1E293B", fontStyle: "italic", background: "white", padding: "6px 8px", borderRadius: "6px" }}>
            "{smsNotification.msg}"
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3>Active Prescriptions ({reminders.length})</h3>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ width: "auto", padding: "8px 14px", fontSize: "13px" }}>
          {showAdd ? "Close" : "➕ Schedule Reminder"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="care-card" style={{ border: "2px solid #0F6CBD" }}>
          <h4 style={{ color: "#0F6CBD", marginBottom: "12px" }}>New Medication Schedule</h4>
          <div style={{ marginBottom: "10px" }}>
            <label>Patient Name</label>
            <input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. Ramesh Patil" required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Patient Phone Number (For SMS)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXX XXXXX" required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Medicine Name & Strength</label>
            <input value={medicine} onChange={(e) => setMedicine(e.target.value)} placeholder="e.g. Metformin 500mg" required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Dosage Timing</label>
            <select value={timing} onChange={(e) => setTiming(e.target.value)}>
              <option value="Morning (8:00 AM) & Night (8:00 PM)">Morning (8:00 AM) & Night (8:00 PM)</option>
              <option value="Morning after breakfast (9:00 AM)">Morning after breakfast (9:00 AM)</option>
              <option value="Afternoon with lunch (1:30 PM)">Afternoon with lunch (1:30 PM)</option>
              <option value="Night before sleep (9:30 PM)">Night before sleep (9:30 PM)</option>
              <option value="Every 4 Hours (High Fever / ORS)">Every 4 Hours (High Fever / ORS)</option>
            </select>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label>Reason / Treatment</label>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Diabetes / BP / Infection" />
          </div>
          <button type="submit" className="btn-primary">Save & Activate Schedule</button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {reminders.map((r) => (
          <div key={r.id} className="care-card" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong style={{ fontSize: "15px", color: "#0F172A" }}>{r.medicine}</strong>
                <p style={{ margin: "2px 0", fontSize: "13px", color: "#475569" }}>
                  👤 {r.patientName} &bull; 📞 {r.phone}
                </p>
                <div style={{ fontSize: "12px", color: "#0F6CBD", fontWeight: "600", marginTop: "4px" }}>
                  ⏰ {r.timing}
                </div>
              </div>
              <button
                onClick={() => triggerSmsSim(r)}
                style={{
                  background: "#EBF3FC",
                  color: "#0F6CBD",
                  border: "1px solid #BFDBFE",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              >
                📲 Send SMS Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
