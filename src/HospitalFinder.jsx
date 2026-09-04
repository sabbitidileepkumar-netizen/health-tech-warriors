import React, { useState } from "react";

export function HospitalFinder({ onBack, lang = "en" }) {
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const conditions = [
    "All",
    "Snakebite & Trauma",
    "Fever & Infection",
    "Heart & Chest Pain",
    "Pregnancy & Delivery",
    "Child Specialist"
  ];

  const hospitals = [
    {
      id: "h1",
      name: "Tanuku Government Area Hospital (AH Tanuku)",
      type: "Sub-District Hospital / Area Hospital",
      distanceKm: 3.5,
      specialties: ["Snakebite & Trauma", "Heart & Chest Pain", "Child Specialist", "Pregnancy & Delivery"],
      beds: 150,
      icuBeds: 20,
      asvVials: 42,
      oxygenAvailable: true,
      phone: "08819-224108",
      address: "Hospital Road, Tanuku, West Godavari"
    },
    {
      id: "h2",
      name: "Bhimavaram Community Health Centre (CHC)",
      type: "Community Health Centre / 24x7 Emergency Hub",
      distanceKm: 9.0,
      specialties: ["Snakebite & Trauma", "Heart & Chest Pain", "Pregnancy & Delivery"],
      beds: 80,
      icuBeds: 10,
      asvVials: 35,
      oxygenAvailable: true,
      phone: "08816-222450",
      address: "Bhimavaram Rural, West Godavari"
    },
    {
      id: "h3",
      name: "Attili 24x7 Primary Health Centre (PHC)",
      type: "Government 24x7 PHC",
      distanceKm: 4.8,
      specialties: ["Fever & Infection", "Pregnancy & Delivery", "Snakebite & Trauma"],
      beds: 16,
      asvVials: 14,
      oxygenAvailable: true,
      phone: "08819-256102",
      address: "Main Road, Attili"
    },
    {
      id: "h4",
      name: "K.S. Gattu Health & Wellness Sub-Centre",
      type: "Ayushman Arogya Mandir (Sub-Centre)",
      distanceKm: 6.2,
      specialties: ["Fever & Infection", "Snakebite & Trauma"],
      beds: 6,
      asvVials: 4,
      oxygenAvailable: true,
      phone: "08819-257004",
      address: "Gram Panchayat Building, K.S. Gattu"
    }
  ];

  const filteredHospitals = hospitals.filter((h) => {
    const matchesCondition =
      selectedCondition === "All" || h.specialties.includes(selectedCondition);
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCondition && matchesSearch;
  });

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>Directory & Beds</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F6CBD 0%, #0369A1 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "34px" }}>🏥</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {lang === "te" ? "ప్రభుత్వ ఆసుపత్రులు & బెడ్ల వివరాలు" : "Find Hospital & Emergency Beds"}
            </h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "13px" }}>
              {lang === "te"
                ? "తణుకు, భీమవరం, అత్తిలి, కె.ఎస్. గట్టు ప్రభుత్వ ఆసుపత్రుల లైవ్ స్టేటస్"
                : "Verified government facilities across Tanuku, Bhimavaram, Attili & K.S. Gattu"}
            </p>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder={lang === "te" ? "🔍 ఆసుపత్రి లేదా ఊరి పేరు వెతకండి..." : "🔍 Search hospital name or area..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "12px" }}
      />

      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "12px", color: "#64748B", fontWeight: "bold" }}>Filter by Medical Need:</label>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginTop: "4px" }}>
          {conditions.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCondition(c)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                fontWeight: "600",
                backgroundColor: selectedCondition === c ? "#0F6CBD" : "white",
                color: selectedCondition === c ? "white" : "#475569",
                border: "1px solid " + (selectedCondition === c ? "#0F6CBD" : "#CBD5E1")
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredHospitals.map((h) => (
          <div key={h.id} className="care-card" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong style={{ fontSize: "15px", color: "#0F172A" }}>{h.name}</strong>
                <p style={{ margin: "2px 0", fontSize: "12px", color: "#0F6CBD", fontWeight: "600" }}>{h.type}</p>
                <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748B" }}>📍 {h.address} ({h.distanceKm} km away)</p>
              </div>
              <a
                href={"tel:" + h.phone}
                style={{
                  background: "#0D9488",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                📞 Call
              </a>
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
              <span className="badge badge-low">🛏️ {h.beds} Beds</span>
              {h.icuBeds && <span className="badge badge-med">🚨 {h.icuBeds} ICU Beds</span>}
              {h.asvVials && <span className="badge badge-high" style={{ background: "#FEE2E2", color: "#991B1B" }}>🐍 {h.asvVials} Anti-Venom Vials</span>}
              {h.oxygenAvailable && <span className="badge" style={{ background: "#E0F2FE", color: "#0369A1" }}>💨 Oxygen Supported</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HospitalFinder;
