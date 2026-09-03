import React, { useState } from "react";

export function OrganDonation({ onBack, lang = "en" }) {
  const [pledged, setPledged] = useState(false);
  const [donorData, setDonorData] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [phone, setPhone] = useState("");
  const [kinPhone, setKinPhone] = useState("");
  const [selectedOrgans, setSelectedOrgans] = useState(["Eyes / Cornea", "Kidneys"]);

  const organOptions = [
    { name: "Eyes / Cornea", icon: "👁️" },
    { name: "Kidneys", icon: "🫘" },
    { name: "Liver", icon: "🫁" },
    { name: "Heart", icon: "❤️" },
    { name: "Lungs", icon: "🌬️" },
    { name: "Pancreas", icon: "🧬" }
  ];

  const toggleOrgan = (organ) => {
    setSelectedOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  };

  const handlePledge = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    const donorCard = {
      id: "OD-" + Math.floor(100000 + Math.random() * 900000),
      name,
      age,
      bloodGroup,
      phone,
      kinPhone,
      organs: selectedOrgans,
      date: new Date().toLocaleDateString()
    };
    setDonorData(donorCard);
    setPledged(true);
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#F3E8FF", color: "#7E22CE" }}>NOTTO & Govt Initiative</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #7E22CE 0%, #4C1D95 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>🫀</span>
          <div>
            <h1 style={{ color: "white", fontSize: "20px", margin: 0 }}>Organ Donation Registry</h1>
            <p style={{ color: "#E9D5FF", margin: 0, fontSize: "13px" }}>
              Leave a legacy of life. 1 donor can save up to 8 lives.
            </p>
          </div>
        </div>
      </div>

      {pledged && donorData ? (
        <div className="care-card" style={{ border: "2px solid #7E22CE", background: "#FAF5FF", textAlign: "center", padding: "20px" }}>
          <span style={{ fontSize: "44px" }}>🎖️</span>
          <h2 style={{ color: "#6B21A8", marginTop: "8px" }}>Official Donor Pledge Card</h2>
          <div style={{ background: "white", border: "1.5px dashed #A855F7", borderRadius: "14px", padding: "16px", margin: "16px 0", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px", marginBottom: "8px" }}>
              <strong style={{ color: "#6B21A8" }}>CareLink Donor ID:</strong>
              <span style={{ fontWeight: "bold" }}>{donorData.id}</span>
            </div>
            <p><strong>Donor Name:</strong> {donorData.name} ({donorData.age} yrs)</p>
            <p><strong>Blood Group:</strong> {donorData.bloodGroup}</p>
            <p><strong>Emergency Contact (Kin):</strong> {donorData.kinPhone || "On File"}</p>
            <p><strong>Pledged Organs:</strong> {donorData.organs.join(", ")}</p>
            <p style={{ fontSize: "11px", color: "#64748B", marginTop: "8px" }}>
              Issued in collaboration with Maharashtra State Organ & Tissue Transplant Organization.
            </p>
          </div>
          <button className="btn-primary" onClick={() => window.print()} style={{ background: "#7E22CE", width: "100%", marginBottom: "8px" }}>
            🖨️ Print / Save Donor Card
          </button>
          <button className="btn-outline" onClick={() => setPledged(false)} style={{ width: "100%" }}>
            Register Another Donor
          </button>
        </div>
      ) : (
        <form onSubmit={handlePledge} className="care-card">
          <h3 style={{ marginBottom: "14px" }}>Pledge to Donate Life</h3>
          <div style={{ marginBottom: "10px" }}>
            <label>Full Legal Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dnyaneshwar Shinde" required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label>Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 35" required />
            </div>
            <div>
              <label>Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label>Your Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXX" required />
            </div>
            <div>
              <label>Next of Kin Phone</label>
              <input value={kinPhone} onChange={(e) => setKinPhone(e.target.value)} placeholder="Family contact" required />
            </div>
          </div>

          <label style={{ marginBottom: "8px" }}>Select Organs You Wish to Pledge:</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {organOptions.map((org) => (
              <label
                key={org.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: selectedOrgans.includes(org.name) ? "1.5px solid #7E22CE" : "1px solid #CBD5E1",
                  background: selectedOrgans.includes(org.name) ? "#FAF5FF" : "white",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedOrgans.includes(org.name)}
                  onChange={() => toggleOrgan(org.name)}
                  style={{ width: "auto" }}
                />
                <span>{org.icon} {org.name}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn-primary" style={{ background: "#7E22CE" }}>
            ✍️ Sign Organ Pledge & Generate Card
          </button>
        </form>
      )}
    </div>
  );
}
