import React, { useState } from "react";
import { addPatient } from "./dataStore";

function PatientRegistration({ onBack, t, lang = "en" }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [village, setVillage] = useState("Relangi");
  const [category, setCategory] = useState("Adult");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [organDonor, setOrganDonor] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const villages = ["Relangi", "Tanuku", "Attili", "K.S. Gattu"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const getCategory = (ageValue) => {
    const a = Number(ageValue);
    if (!ageValue || isNaN(a)) return "Adult";
    if (a <= 12) return "Child";
    if (a <= 59) return "Adult";
    return "Elderly";
  };

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
          <span>🧑‍🤝‍🧑</span> {lang === "te" ? "కొత్త రోగి నమోదు" : "New Patient Registration"}
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
            <label>👤 {lang === "te" ? "రోగి పూర్తి పేరు" : "Full Name"}</label>
            <input
              type="text"
              placeholder="e.g. Dileep Varma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label>🎂 {lang === "te" ? "వయస్సు" : "Age"}</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={age}
                onChange={(e) => {
                  const val = e.target.value;
                  setAge(val);
                  setCategory(getCategory(val));
                }}
                required
              />
            </div>
            <div>
              <label>📋 {lang === "te" ? "కేటగిరీ" : "Category"}</label>
              <input
                type="text"
                value={
                  category === "Child" ? "👶 Child" :
                  category === "Elderly" ? "👴 Elderly" :
                  "🧑 Adult"
                }
                readOnly
                style={{ background: "#F3F4F6", cursor: "not-allowed" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label>🏡 {lang === "te" ? "గ్రామం" : "Village"}</label>
              <input
                type="text"
                list="village-options"
                placeholder="Type village name"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
              <datalist id="village-options">
                {villages.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
            <div>
              <label>🩸 {lang === "te" ? "రక్త వర్గం" : "Blood Group"}</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {bloodGroups.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label>📱 {lang === "te" ? "మొబైల్ నంబర్ (SMS రిమైండర్ల కొరకు)" : "Phone Number (For SMS Alerts)"}</label>
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
                🫀 {lang === "te" ? "రోగి అవయవ దాతగా నమోదు కావడానికి అంగీకారం" : "Patient pledges as an Organ Donor (NOTTO)"}
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
