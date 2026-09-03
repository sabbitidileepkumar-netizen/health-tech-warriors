import React, { useState } from "react";

export function HospitalFinder({ onBack, lang = "en" }) {
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const conditions = [
    "All",
    "Accident & Trauma",
    "Fever & Infection",
    "Heart & Chest Pain",
    "Pregnancy & Delivery",
    "Child Specialist"
  ];

  const hospitals = [
    {
      id: "h1",
      name: "Wardha Primary Health Centre (PHC)",
      type: "Government PHC",
      distanceKm: 3.2,
      specialties: ["Fever & Infection", "Pregnancy & Delivery", "General"],
      beds: 12,
      oxygenAvailable: true,
      phone: "07152-245120",
      address: "Main Road, Wardha Rural"
    },
    {
      id: "h2",
      name: "Chandrapur District Civil Hospital",
      type: "District Multi-Specialty Hospital",
      distanceKm: 18.5,
      specialties: ["Accident & Trauma", "Heart & Chest Pain", "Child Specialist", "Pregnancy & Delivery"],
      beds: 180,
      icuBeds: 24,
      oxygenAvailable: true,
      phone: "07172-251001",
      address: "Civil Lines, Chandrapur"
    },
    {
      id: "h3",
      name: "Bhamragad Community Health Centre (CHC)",
      type: "Community Health Centre",
      distanceKm: 8.0,
      specialties: ["Fever & Infection", "General", "Pregnancy & Delivery"],
      beds: 30,
      oxygenAvailable: true,
      phone: "07134-220045",
      address: "Tehsil Road, Bhamragad"
    },
    {
      id: "h4",
      name: "Sevagram Medical Emergency Hub",
      type: "Tertiary Care Medical College",
      distanceKm: 12.0,
      specialties: ["Accident & Trauma", "Heart & Chest Pain", "Child Specialist"],
      beds: 350,
      icuBeds: 40,
      oxygenAvailable: true,
      phone: "07152-284341",
      address: "Sevagram, Wardha"
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
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>Find Hospital by Condition</h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "13px" }}>
              Verified government facilities, bed counts & emergency numbers
            </p>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="🔍 Search hospital name or area..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "12px" }}
      />

      <div style={{ marginBottom: "16px" }}>
        <label>Filter by Medical Need:</label>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
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
                href={`tel:${h.phone}`}
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

            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              <span className="badge badge-low">🛏️ {h.beds} Beds</span>
              {h.icuBeds && <span className="badge badge-med">🚨 {h.icuBeds} ICU Beds</span>}
              {h.oxygenAvailable && <span className="badge" style={{ background: "#E0F2FE", color: "#0369A1" }}>💨 Oxygen Supported</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
