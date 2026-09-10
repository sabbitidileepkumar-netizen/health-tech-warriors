import React, { useState, useEffect } from "react";
import { subscribeToCollection, addCampaign } from "./dataStore";
import { VILLAGES, DEFAULT_VILLAGE } from "./villageConfig";

export function AuthorityCampaignManager({ _lang = "en" }) {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("Children aged 0-5 years");
  const [selectedVillages, setSelectedVillages] = useState([DEFAULT_VILLAGE]);
  const [date, setDate] = useState("");
  const [targetedCount, setTargetedCount] = useState(300);

  const villages = VILLAGES;

  useEffect(() => {
    const unsub = subscribeToCollection("campaigns", (list) => {
      setCampaigns(list);
    });
    return () => unsub();
  }, []);

  const toggleVillage = (v) => {
    setSelectedVillages((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !date) return;

    await addCampaign({
      title,
      target,
      targetVillages: selectedVillages,
      date,
      assignedAshaIds: ["ASHA-001", "ASHA-002"],
      status: "ACTIVE",
      metrics: {
        targetedChildren: Number(targetedCount) || 300,
        vaccinatedChildren: 0,
        highRiskAreasCovered: selectedVillages.length
      }
    });

    setShowCreate(false);
    setTitle("");
    setDate("");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0F6CBD", fontSize: "18px" }}>📢 District Public Health Campaigns</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
            Mass immunization, maternal drives, and epidemic prevention programs
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreate(true)}
          style={{ width: "auto", padding: "8px 16px", fontSize: "13px" }}
        >
          ➕ Launch Campaign
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {campaigns.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94A3B8", padding: "30px" }}>No active campaigns.</p>
        ) : (
          campaigns.map((camp) => {
            const targeted = camp.metrics?.targetedChildren || camp.metrics?.targetedHouseholds || 100;
            const completed = camp.metrics?.vaccinatedChildren || camp.metrics?.inspectedHouseholds || 0;
            const pct = Math.min(100, Math.round((completed / targeted) * 100));

            return (
              <div key={camp.id} className="care-card" style={{ borderLeft: "4px solid #0D9488" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <strong style={{ fontSize: "15px", color: "#0F172A" }}>{camp.title}</strong>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                      🎯 <strong>Target:</strong> {camp.target} &bull; 📅 {camp.date}
                    </div>
                  </div>
                  <span className="badge" style={{ background: "#DCFCE7", color: "#166534" }}>
                    {camp.status}
                  </span>
                </div>

                <div style={{ margin: "8px 0", fontSize: "12px", color: "#475569" }}>
                  📍 <strong>Participating Villages:</strong> {camp.targetVillages?.join(", ") || "All"}
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span>Coverage Progress ({completed} / {targeted})</span>
                    <strong>{pct}%</strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "#E2E8F0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#0D9488", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: "#0F6CBD" }}>➕ Launch Health Campaign</h3>
              <button className="btn-outline" onClick={() => setShowCreate(false)} style={{ padding: "4px 8px" }}>✕</button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Dengue Elimination Drive"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Target Demographic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Children 0-5 years / All Households"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Campaign Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Targeted Population Count
                  </label>
                  <input
                    type="number"
                    value={targetedCount}
                    onChange={(e) => setTargetedCount(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Select Participating Villages
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {villages.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleVillage(v)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        border: selectedVillages.includes(v) ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
                        background: selectedVillages.includes(v) ? "#EBF3FC" : "white",
                        color: selectedVillages.includes(v) ? "#0F6CBD" : "#475569",
                        fontWeight: selectedVillages.includes(v) ? "700" : "500",
                        cursor: "pointer"
                      }}
                    >
                      {selectedVillages.includes(v) ? "✓ " : "+ "}
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "10px", fontSize: "14px", fontWeight: "700" }}
              >
                🚀 Launch Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityCampaignManager;
