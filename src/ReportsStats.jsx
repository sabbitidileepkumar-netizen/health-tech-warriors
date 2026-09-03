import React, { useEffect, useState } from "react";
import { getLocal } from "./dataStore";

function ReportsStats({ onBack }) {
  const [patients, setPatients] = useState([]);
  const [triageRecords, setTriageRecords] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [timeFilter, setTimeFilter] = useState("ALL");

  useEffect(() => {
    setPatients(getLocal("patients"));
    setTriageRecords(getLocal("triage_records"));
    setReferrals(getLocal("referrals"));
  }, []);

  // Time-based filtering simulation
  const now = Date.now();
  const filterByTime = (itemDate) => {
    if (timeFilter === "ALL") return true;
    if (!itemDate) return true;
    const diffHours = (now - new Date(itemDate).getTime()) / (1000 * 3600);
    if (timeFilter === "TODAY") return diffHours <= 24;
    if (timeFilter === "WEEK") return diffHours <= 168;
    if (timeFilter === "MONTH") return diffHours <= 720;
    return true;
  };

  const filteredPatients = patients.filter((p) => filterByTime(p.createdAt));
  const filteredTriage = triageRecords.filter((t) => filterByTime(t.timestamp));
  const filteredReferrals = referrals.filter((r) => filterByTime(r.createdAt));

  const highPriority = filteredTriage.filter((t) => t.priorityLevel === "HIGH").length;
  const mediumPriority = filteredTriage.filter((t) => t.priorityLevel === "MEDIUM").length;
  const lowPriority = filteredTriage.filter((t) => t.priorityLevel === "LOW").length;

  // Village-wise distribution
  const villageCounts = {};
  patients.forEach((p) => {
    const v = p.village || "Unknown";
    villageCounts[v] = (villageCounts[v] || 0) + 1;
  });

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeFilter,
      totalPatients: filteredPatients.length,
      highPriorityCases: highPriority,
      referrals: filteredReferrals.length,
      villageBreakdown: villageCounts
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carelink-report-${timeFilter.toLowerCase()}.json`;
    a.click();
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <button className="btn-primary" onClick={exportReport} style={{ width: "auto", padding: "6px 12px", fontSize: "12px" }}>
          📥 Export JSON
        </button>
      </div>

      <div className="care-card">
        <h2 style={{ color: "#0F6CBD", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📊</span> Health Analytics & Reports
        </h2>

        {/* Time Period Filter Chips */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {[
            { key: "TODAY", label: "Today" },
            { key: "WEEK", label: "This Week" },
            { key: "MONTH", label: "This Month" },
            { key: "ALL", label: "All Time" }
          ].map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeFilter(tf.key)}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: timeFilter === tf.key ? "#0F6CBD" : "#F1F5F9",
                color: timeFilter === tf.key ? "white" : "#475569"
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Stat Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          <div style={{ background: "#EBF3FC", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px" }}>🧑‍🤝‍🧑</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#0F6CBD" }}>{filteredPatients.length}</div>
            <div style={{ fontSize: "11px", color: "#475569" }}>Total Registered</div>
          </div>

          <div style={{ background: "#FEE2E2", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px" }}>🔴</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#DC2626" }}>{highPriority}</div>
            <div style={{ fontSize: "11px", color: "#991B1B" }}>High Priority Cases</div>
          </div>

          <div style={{ background: "#FEF3C7", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px" }}>🟡</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#D97706" }}>{mediumPriority}</div>
            <div style={{ fontSize: "11px", color: "#92400E" }}>Medium Priority</div>
          </div>

          <div style={{ background: "#E6F7F5", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px" }}>🏥</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#0D9488" }}>{filteredReferrals.length}</div>
            <div style={{ fontSize: "11px", color: "#115E59" }}>Facility Referrals</div>
          </div>
        </div>

        {/* Village-wise Patient Count */}
        <h3 style={{ marginBottom: "10px" }}>Village-Wise Patient Distribution</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(villageCounts).map(([vil, count]) => {
            const pct = Math.min(100, Math.round((count / (patients.length || 1)) * 100));
            return (
              <div key={vil} style={{ background: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <strong>🏡 {vil}</strong>
                  <span style={{ color: "#0F6CBD", fontWeight: "bold" }}>{count} patients ({pct}%)</span>
                </div>
                <div style={{ height: "6px", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#0F6CBD", borderRadius: "3px" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ReportsStats;
