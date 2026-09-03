import React, { useEffect, useState } from "react";
import { getLocal } from "./dataStore";

const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const priorityStyle = {
  HIGH: { color: "#DC2626", bg: "#FEE2E2", badge: "badge-high", icon: "🔴" },
  MEDIUM: { color: "#D97706", bg: "#FEF3C7", badge: "badge-med", icon: "🟡" },
  LOW: { color: "#16A34A", bg: "#DCFCE7", badge: "badge-low", icon: "🟢" }
};

function PriorityQueue({ onBack, onRefer }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");

  useEffect(() => {
    const list = getLocal("triage_records");
    list.sort((a, b) => (priorityOrder[a.priorityLevel] ?? 2) - (priorityOrder[b.priorityLevel] ?? 2));
    setRecords(list);
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.village?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === "ALL" || r.priorityLevel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626" }}>Live Queue</span>
      </div>

      <div className="care-card">
        <h2 style={{ color: "#DC2626", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📋</span> Triage Priority Queue
        </h2>

        {/* Tier 2: Search bar on Priority Queue */}
        <input
          type="text"
          placeholder="🔍 Search patient name or village..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "12px" }}
        />

        {/* Filter Chips */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: filterLevel === lvl ? "#0F6CBD" : "#F1F5F9",
                color: filterLevel === lvl ? "white" : "#475569"
              }}
            >
              {lvl}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#64748B" }}>
            No patients match your filter.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((r) => {
              const style = priorityStyle[r.priorityLevel] || priorityStyle.LOW;
              return (
                <div
                  key={r.id}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    borderLeft: `6px solid ${style.color}`,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderLeftWidth: "6px",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <strong style={{ fontSize: "15px", color: "#0F172A" }}>👤 {r.patientName}</strong>
                      <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "8px" }}>
                        📍 {r.village || "Local"}
                      </span>
                      <div style={{ margin: "4px 0", fontSize: "13px", color: "#475569" }}>
                        Symptoms: {r.symptoms && r.symptoms.length > 0 ? r.symptoms.join(", ") : "None reported"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                        Score: {r.score ?? "—"} &bull; Logged: {r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                      </div>
                    </div>

                    <span className={`badge ${style.badge}`}>
                      {style.icon} {r.priorityLevel}
                    </span>
                  </div>

                  {r.priorityLevel === "HIGH" && (
                    <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => onRefer && onRefer({ name: r.patientName, village: r.village })}
                        style={{
                          background: "#DC2626",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px"
                        }}
                      >
                        🏥 Transfer / Refer to PHC &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PriorityQueue;
