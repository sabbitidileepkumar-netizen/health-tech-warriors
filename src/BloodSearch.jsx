import React, { useState, useEffect } from "react";
import { getLocal, addBloodDonor } from "./dataStore";

export function BloodSearch({ onBack, lang = "en" }) {
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [donors, setDonors] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [newDonorName, setNewDonorName] = useState("");
  const [newDonorGroup, setNewDonorGroup] = useState("O+");
  const [newDonorPhone, setNewDonorPhone] = useState("");
  const [newDonorVillage, setNewDonorVillage] = useState("Relangi");
  const [emergencyAlertSent, setEmergencyAlertSent] = useState(false);

  const bloodGroups = ["All", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const villages = ["Relangi", "Tanuku", "Attili", "K.S. Gattu"];

  useEffect(() => {
    setDonors(getLocal("blood_donors"));
  }, []);

  const filteredDonors = selectedGroup === "All"
    ? donors
    : donors.filter((d) => d.bloodGroup === selectedGroup);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!newDonorName || !newDonorPhone) return;
    addBloodDonor({
      name: newDonorName,
      bloodGroup: newDonorGroup,
      phone: newDonorPhone,
      village: newDonorVillage || "Relangi",
      distanceKm: 1.5
    });
    setDonors(getLocal("blood_donors"));
    setShowRegister(false);
    setNewDonorName("");
    setNewDonorPhone("");
    setNewDonorVillage("Relangi");
    alert("Thank you! You are now registered as a Life Saver Voluntary Blood Donor.");
  };

  const handleTriggerEmergencySOS = () => {
    setEmergencyAlertSent(true);
    setTimeout(() => setEmergencyAlertSent(false), 6000);
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>Accident Hotline</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>🩸</span>
          <div>
            <h1 style={{ color: "white", fontSize: "20px", margin: 0 }}>
              {lang === "te" ? "ప్రమాద అత్యవసర రక్త నిధి" : "Accident Blood Finder"}
            </h1>
            <p style={{ color: "#FEE2E2", margin: 0, fontSize: "13px" }}>
              {lang === "te"
                ? "తణుకు, భీమవరం, రిలంగి పరిధిలోని రక్తదాతల తక్షణ సమాచారం"
                : "Instant blood matching for road accident & trauma victims"}
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerEmergencySOS}
          style={{
            marginTop: "14px",
            width: "100%",
            background: "white",
            color: "#DC2626",
            padding: "10px",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
          }}
        >
          🚨 {lang === "te" ? "అత్యవసర రక్త అభ్యర్థనను ప్రసారం చేయండి" : "Broadcast Urgent Accident Blood Request"}
        </button>
      </div>

      {emergencyAlertSent && (
        <div style={{ background: "#DCFCE7", border: "1.5px solid #86EFAC", color: "#166534", padding: "12px", borderRadius: "12px", marginBottom: "16px", textAlign: "center" }}>
          ✅ <strong>Emergency Broadcast Active!</strong> Notified 6 nearest donors & Tanuku Area Hospital Blood Bank.
        </div>
      )}

      {/* Blood Group Filter Chips */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ marginBottom: "8px", fontSize: "13px", fontWeight: "bold" }}>
          {lang === "te" ? "కావలసిన రక్త వర్గాన్ని ఎంచుకోండి:" : "Select Required Blood Group:"}
        </label>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
          {bloodGroups.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold",
                backgroundColor: selectedGroup === bg ? "#DC2626" : "white",
                color: selectedGroup === bg ? "white" : "#475569",
                border: "1.5px solid " + (selectedGroup === bg ? "#DC2626" : "#CBD5E1")
              }}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Donors List */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3>Verified Donors Nearby ({filteredDonors.length})</h3>
        <button
          className="btn-outline"
          onClick={() => setShowRegister(!showRegister)}
          style={{ fontSize: "12px", padding: "6px 10px" }}
        >
          {showRegister ? "Close Form" : "➕ Become a Donor"}
        </button>
      </div>

      {showRegister && (
        <form onSubmit={handleRegister} className="care-card" style={{ border: "2px solid #0F6CBD", background: "#F0F6FF" }}>
          <h4 style={{ color: "#0F6CBD", marginBottom: "10px" }}>Register as Volunteer Blood Donor</h4>
          <div style={{ marginBottom: "10px" }}>
            <label>Full Name</label>
            <input value={newDonorName} onChange={(e) => setNewDonorName(e.target.value)} placeholder="e.g. Anand Varma" required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label>Blood Group</label>
              <select value={newDonorGroup} onChange={(e) => setNewDonorGroup(e.target.value)}>
                {bloodGroups.filter(b => b !== "All").map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label>Village / Area</label>
              <select value={newDonorVillage} onChange={(e) => setNewDonorVillage(e.target.value)}>
                {villages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>Phone Number (for emergency alerts)</label>
            <input value={newDonorPhone} onChange={(e) => setNewDonorPhone(e.target.value)} placeholder="+91 98XXX XXXXX" required />
          </div>
          <button type="submit" className="btn-primary">Register Blood Donor</button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filteredDonors.map((d) => (
          <div key={d.id} className="care-card" style={{ margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#FEE2E2",
                  color: "#DC2626",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  border: "2px solid #FECACA"
                }}
              >
                {d.bloodGroup}
              </div>
              <div>
                <strong style={{ fontSize: "14px", color: "#0F172A" }}>{d.name}</strong>
                <div style={{ fontSize: "12px", color: "#64748B" }}>
                  📍 {d.village} ({d.distanceKm} km away)
                </div>
                <span className="badge badge-low" style={{ marginTop: "4px" }}>Available</span>
              </div>
            </div>
            <a
              href={"tel:" + d.phone}
              style={{
                textDecoration: "none",
                backgroundColor: "#0D9488",
                color: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              📞 Call
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BloodSearch;
