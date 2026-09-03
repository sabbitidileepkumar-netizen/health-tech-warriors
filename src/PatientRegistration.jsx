import React, { useState } from "react";
import { addPatient } from "./dataStore";

function PatientRegistration({ onBack, t }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [village, setVillage] = useState("Ramnagar");
  const [category, setCategory] = useState("Adult");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [organDonor, setOrganDonor] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const villages = ["Ramnagar", "Bhamragad", "Korpana", "Wardha Rural", "Chandrapur"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await addPatient({
        name,
        age: Number(age),
        village,
        category,
        phone: phone || "Not Provided",
        bloodGroup,
        organDonor,
        organsPledged: organDonor ? ["Cornea / Eyes", "Kidneys"] : []
      });

      setMessage("✅ Patient successfully registered & synced!");
      setName("");
      setAge("");
      setPhone("");
      setOrganDonor(false);
    } catch (err) {
      setMessage("❌ Error saving patient. Please check details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        {onBack && <button className="btn-outline" onClick={onBack}>⬅️ Back</button>}
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>ASHA Intake</span>
      </div>

      <div className="care-card">
        <h2 style={{ color: "#0F6CBD", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🧑‍🤝‍🧑</span> New Patient Registration
        </h2>

        {message && (
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "14px",
              background: message.includes("✅") ? "#DCFCE7" : "#FEE2E2",
              color: message.includes("✅") ? "#166534" : "#991B1B",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label>👤 Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label>🎂 Age</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div>
              <label>📋 Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Child">👶 Child</option>
                <option value="Woman">👩 Woman</option>
                <option value="Adult">🧑 Adult</option>
                <option value="Elderly">👴 Elderly</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label>🏡 Village</label>
              <select value={village} onChange={(e) => setVillage(e.target.value)}>
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label>🩸 Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {bloodGroups.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label>📱 Phone Number (For Medication Reminders)</label>
            <input
              type="tel"
              placeholder="+91 98XXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "18px", padding: "10px", background: "#FAF5FF", borderRadius: "10px", border: "1px solid #E9D5FF" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", margin: 0 }}>
              <input
                type="checkbox"
                checked={organDonor}
                onChange={(e) => setOrganDonor(e.target.checked)}
                style={{ width: "auto" }}
              />
              <span style={{ fontSize: "13px", color: "#6B21A8", fontWeight: "600" }}>
                🫀 Patient wishes to pledge as an Organ Donor
              </span>
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving Patient..." : "✅ Register Patient in Health Registry"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientRegistration;
