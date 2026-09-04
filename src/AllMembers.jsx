import React, { useState, useEffect } from "react";
import { getLocal } from "./dataStore";

export function AllMembers({ onBack, onNavigateToTriage, onNavigateToReferral, lang = "en" }) {
  const [members, setMembers] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProfile, setActiveProfile] = useState(null);

  const villages = ["All", "Relangi", "Tanuku", "Attili", "K.S. Gattu"];
  const categories = ["All", "Child", "Woman", "Adult", "Elderly"];

  useEffect(() => {
    setMembers(getLocal("patients"));
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesVillage = selectedVillage === "All" || m.village === selectedVillage;
    const matchesCat = selectedCategory === "All" || m.category === selectedCategory;
    const matchesSearch =
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone?.includes(searchQuery) ||
      m.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVillage && matchesCat && matchesSearch;
  });

  const getTriageCount = (name) => {
    const triages = getLocal("triage_records");
    return triages.filter((t) => t.patientName?.toLowerCase() === name?.toLowerCase()).length;
  };

  const getPatientHistory = (name) => {
    const triages = getLocal("triage_records");
    const meds = getLocal("medicine_reminders");
    const refs = getLocal("referrals");

    return {
      triages: triages.filter((t) => t.patientName?.toLowerCase() === name?.toLowerCase()),
      meds: meds.filter((m) => m.patientName?.toLowerCase() === name?.toLowerCase()),
      refs: refs.filter((r) => r.patientName?.toLowerCase() === name?.toLowerCase())
    };
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#EBF3FC", color: "#0F6CBD" }}>Village Registry</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F6CBD 0%, #0369A1 100%)", color: "white", padding: "18px", borderRadius: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "34px" }}>👥</span>
          <div>
            <h1 style={{ color: "white", fontSize: "19px", margin: 0 }}>
              {lang === "te" ? "నమోదైన సభ్యుల సమగ్ర జాబితా" : "All Registered Village Members"}
            </h1>
            <p style={{ color: "#E0F2FE", margin: 0, fontSize: "13px" }}>
              {lang === "te"
                ? "రిలంగి, తణుకు, అత్తిలి, కె.ఎస్. గట్టు గ్రామాల్లో నమోదైన కుటుంబాల వివరాలు"
                : "Active community registry across Relangi, Tanuku, Attili & K.S. Gattu"}
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder={lang === "te" ? "🔍 పేరు లేదా మొబైల్ నంబర్ ద్వారా వెతకండి..." : "🔍 Search member name, phone or ID..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "12px" }}
      />

      {/* Village Filter Chips */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", color: "#64748B", fontWeight: "bold" }}>
          🏡 {lang === "te" ? "గ్రామం వారీగా ఫిల్టర్ చేయండి:" : "Filter by Village:"}
        </label>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginTop: "4px" }}>
          {villages.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVillage(v)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                backgroundColor: selectedVillage === v ? "#0F6CBD" : "white",
                color: selectedVillage === v ? "white" : "#475569",
                border: "1px solid " + (selectedVillage === v ? "#0F6CBD" : "#CBD5E1")
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "12px", color: "#64748B", fontWeight: "bold" }}>
          📋 {lang === "te" ? "కేటగిరీ వారీగా ఫిల్టర్ చేయండి:" : "Filter by Category:"}
        </label>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginTop: "4px" }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                backgroundColor: selectedCategory === c ? "#0D9488" : "white",
                color: selectedCategory === c ? "white" : "#475569",
                border: "1px solid " + (selectedCategory === c ? "#0D9488" : "#CBD5E1")
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Members List */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 style={{ margin: 0 }}>
          {lang === "te" ? `మొత్తం సభ్యులు (${filteredMembers.length})` : `Registered Members (${filteredMembers.length})`}
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filteredMembers.map((m) => {
          const triagesCount = getTriageCount(m.name);
          return (
            <div key={m.id} className="care-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "16px", color: "#0F172A" }}>👤 {m.name}</strong>
                    <span className="badge" style={{ background: "#E2E8F0", color: "#1E293B", fontSize: "11px" }}>
                      {m.category}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 2px", fontSize: "12px", color: "#64748B" }}>
                    🎂 {m.age} yrs &bull; 🏡 <strong>{m.village}</strong> &bull; 📞 {m.phone}
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                      🩸 {m.bloodGroup || "O+"}
                    </span>
                    {m.organDonor && (
                      <span className="badge" style={{ background: "#F3E8FF", color: "#7E22CE" }}>
                        🫀 Organ Donor
                      </span>
                    )}
                    {triagesCount > 0 && (
                      <span className="badge badge-med">
                        🩺 {triagesCount} Triage Logs
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={() => setActiveProfile(m)}
                  className="btn-outline"
                  style={{ padding: "6px 8px", fontSize: "11px", color: "#0F6CBD", borderColor: "#0F6CBD" }}
                >
                  📁 {lang === "te" ? "రికార్డు" : "History"}
                </button>
                <button
                  onClick={() => onNavigateToTriage && onNavigateToTriage(m)}
                  className="btn-outline"
                  style={{ padding: "6px 8px", fontSize: "11px", color: "#0D9488", borderColor: "#0D9488" }}
                >
                  🩺 {lang === "te" ? "ట్రయాజ్" : "Triage"}
                </button>
                <button
                  onClick={() => onNavigateToReferral && onNavigateToReferral(m)}
                  className="btn-outline"
                  style={{ padding: "6px 8px", fontSize: "11px", color: "#D97706", borderColor: "#D97706" }}
                >
                  🏥 {lang === "te" ? "రిఫరల్" : "Refer"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Longitudinal Profile Modal */}
      {activeProfile && (
        <div className="modal-backdrop" onClick={() => setActiveProfile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", marginBottom: "12px" }}>
              <div>
                <h2 style={{ color: "#0F6CBD", margin: 0 }}>👤 {activeProfile.name}</h2>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
                  ID: {activeProfile.id} &bull; Village: {activeProfile.village} ({activeProfile.age} yrs, {activeProfile.category})
                </p>
              </div>
              <button className="btn-outline" onClick={() => setActiveProfile(null)} style={{ padding: "4px 8px" }}>✕</button>
            </div>

            {(() => {
              const hist = getPatientHistory(activeProfile.name);
              return (
                <div>
                  <div style={{ background: "#F8FAFC", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }}>
                    <div><strong>Mobile:</strong> {activeProfile.phone}</div>
                    <div><strong>Blood Group:</strong> {activeProfile.bloodGroup || "O+"}</div>
                    <div><strong>Organ Pledge:</strong> {activeProfile.organDonor ? "Yes (Eyes/Kidneys)" : "None"}</div>
                  </div>

                  <h4 style={{ marginBottom: "6px" }}>🩺 Clinical Triage Logs ({hist.triages.length})</h4>
                  {hist.triages.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#94A3B8" }}>No triage recorded yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                      {hist.triages.map((t) => (
                        <div key={t.id} style={{ background: "#FFFBEB", padding: "8px", borderRadius: "6px", fontSize: "12px", border: "1px solid #FDE68A" }}>
                          <strong>Priority: {t.priorityLevel}</strong> (Score: {t.score})
                          <p style={{ margin: "2px 0 0" }}>Symptoms: {t.symptoms?.join(", ")}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <h4 style={{ marginBottom: "6px" }}>💊 Active Medicines ({hist.meds.length})</h4>
                  {hist.meds.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#94A3B8" }}>No active medicines.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                      {hist.meds.map((m) => (
                        <div key={m.id} style={{ background: "#F0FDF4", padding: "8px", borderRadius: "6px", fontSize: "12px", border: "1px solid #BBF7D0" }}>
                          <strong>{m.medicine}</strong> &bull; {m.timing} ({m.purpose})
                        </div>
                      ))}
                    </div>
                  )}

                  <h4 style={{ marginBottom: "6px" }}>🏥 Hospital Referrals ({hist.refs.length})</h4>
                  {hist.refs.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#94A3B8" }}>No hospital referrals.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {hist.refs.map((r) => (
                        <div key={r.id} style={{ background: "#EBF3FC", padding: "8px", borderRadius: "6px", fontSize: "12px", border: "1px solid #BFDBFE" }}>
                          <strong>{r.facility}</strong> &bull; Status: {r.status}
                          <p style={{ margin: "2px 0 0" }}>Reason: {r.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <button
              onClick={() => setActiveProfile(null)}
              className="btn-primary"
              style={{ marginTop: "16px", width: "100%", padding: "10px" }}
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllMembers;
