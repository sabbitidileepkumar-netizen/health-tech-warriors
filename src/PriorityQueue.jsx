import React, { useEffect, useState } from "react";
import { getLocal } from "./dataStore";

const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const priorityStyle = {
  CRITICAL: { color: "#DC2626", bg: "#FEE2E2", badge: "badge-high", icon: "🚨" },
  HIGH: { color: "#EA580C", bg: "#FFEDD5", badge: "badge-high", icon: "🔴" },
  MEDIUM: { color: "#D97706", bg: "#FEF3C7", badge: "badge-med", icon: "🟡" },
  LOW: { color: "#16A34A", bg: "#DCFCE7", badge: "badge-low", icon: "🟢" }
};

function PriorityQueue({ onBack, onRefer }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [conditionFilter, setConditionFilter] = useState("ALL");

  useEffect(() => {
    const list = getLocal("triage_records");
    list.sort((a, b) => (priorityOrder[a.priorityLevel] ?? 3) - (priorityOrder[b.priorityLevel] ?? 3));
    setRecords(list);
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.village?.toLowerCase().includes(search.toLowerCase()) ||
      (r.mlAssessment?.conditions && r.mlAssessment.conditions.some((c) => c.toLowerCase().includes(search.toLowerCase())));

    const matchesLevel = filterLevel === "ALL" || r.priorityLevel === filterLevel;

    let matchesCondition = true;
    if (conditionFilter === "SUGAR") {
      matchesCondition =
        (r.vitals?.bloodSugar && r.vitals.bloodSugar >= 200) ||
        r.mlAssessment?.conditions?.some((c) => c.toLowerCase().includes("sugar") || c.toLowerCase().includes("diabetic"));
    } else if (conditionFilter === "BP") {
      matchesCondition =
        (r.vitals?.systolicBP && r.vitals.systolicBP >= 140) ||
        r.mlAssessment?.conditions?.some((c) => c.toLowerCase().includes("hypertens") || c.toLowerCase().includes("blood pressure"));
    } else if (conditionFilter === "O2") {
      matchesCondition =
        (r.vitals?.spo2 && r.vitals.spo2 <= 93) ||
        r.mlAssessment?.conditions?.some((c) => c.toLowerCase().includes("hypox") || c.toLowerCase().includes("oxygen"));
    }

    return matchesSearch && matchesLevel && matchesCondition;
  });

  return (
    <div className="page-content" style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#FEE2E2", color: "#DC2626", fontWeight: "700" }}>
          🚨 Live Clinical Queue
        </span>
      </div>

      <div className="care-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h2 style={{ color: "#DC2626", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📋</span> Triage Priority & Surveillance Queue
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748B" }}>
              Prioritized list based on ML risk stratification and vital sign telemetry
            </p>
          </div>
          <span className="badge badge-med">
            {filtered.length} Patients Active
          </span>
        </div>

        {/* Search bar */}
        <input
          type="text"
          placeholder="🔍 Search patient name, village, or clinical condition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "12px", width: "100%", padding: "10px", borderRadius: "8px" }}
        />

        {/* Priority Filter Chips */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((lvl) => {
            const isSelected = filterLevel === lvl;
            const count = lvl === "ALL" ? records.length : records.filter((r) => r.priorityLevel === lvl).length;
            return (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor: isSelected ? "#0F6CBD" : "#F1F5F9",
                  color: isSelected ? "white" : "#475569",
                  border: isSelected ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
                  cursor: "pointer"
                }}
              >
                {lvl} ({count})
              </button>
            );
          })}
        </div>

        {/* Clinical Biomarker Quick Filters */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B" }}>Biomarker:</span>
          {[
            { id: "ALL", label: "All Vitals" },
            { id: "SUGAR", label: "🩸 High Sugar (≥200 mg/dL)" },
            { id: "BP", label: "❤️ High BP (≥140 mmHg)" },
            { id: "O2", label: "🫁 Low SpO2 (≤93%)" }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setConditionFilter(c.id)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                backgroundColor: conditionFilter === c.id ? "#0F766E" : "#F8FAFC",
                color: conditionFilter === c.id ? "white" : "#475569",
                border: "1px solid #CBD5E1",
                cursor: "pointer"
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748B", background: "#F8FAFC", borderRadius: "12px" }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🩺</span>
            No patients match your search or filter criteria.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((r) => {
              const style = priorityStyle[r.priorityLevel] || priorityStyle.LOW;
              const hasVitals = r.vitals && (r.vitals.systolicBP || r.vitals.bloodSugar || r.vitals.spo2);
              const isUrgent = r.priorityLevel === "CRITICAL" || r.priorityLevel === "HIGH";

              return (
                <div
                  key={r.id || `${r.patientId}-${r.timestamp}`}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    borderLeft: `6px solid ${style.color}`,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderLeftWidth: "6px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "16px", color: "#0F172A" }}>
                          👤 {r.patientName}
                        </strong>
                        <span style={{ fontSize: "12px", color: "#64748B" }}>
                          📍 {r.village || "Local"}
                        </span>
                        {r.age && (
                          <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                            ({r.age} yrs{r.gender ? `, ${r.gender}` : ""})
                          </span>
                        )}
                      </div>

                      {/* Vitals Telemetry Row */}
                      {hasVitals && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {r.vitals.systolicBP && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: r.vitals.systolicBP >= 140 ? "#FEE2E2" : "#F1F5F9",
                                color: r.vitals.systolicBP >= 140 ? "#DC2626" : "#334155",
                                border: "1px solid #CBD5E1"
                              }}
                            >
                              BP: {r.vitals.systolicBP}/{r.vitals.diastolicBP || "—"} mmHg
                            </span>
                          )}

                          {r.vitals.bloodSugar && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: r.vitals.bloodSugar >= 200 || r.vitals.bloodSugar <= 70 ? "#FEF3C7" : "#F1F5F9",
                                color: r.vitals.bloodSugar >= 200 || r.vitals.bloodSugar <= 70 ? "#D97706" : "#334155",
                                border: "1px solid #CBD5E1"
                              }}
                            >
                              Sugar: {r.vitals.bloodSugar} mg/dL ({r.vitals.sugarState || "random"})
                            </span>
                          )}

                          {r.vitals.spo2 && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: r.vitals.spo2 <= 93 ? "#FEE2E2" : "#F1F5F9",
                                color: r.vitals.spo2 <= 93 ? "#DC2626" : "#334155",
                                border: "1px solid #CBD5E1"
                              }}
                            >
                              SpO2: {r.vitals.spo2}%
                            </span>
                          )}

                          {r.vitals.pulse && (
                            <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", background: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1" }}>
                              HR: {r.vitals.pulse} bpm
                            </span>
                          )}
                        </div>
                      )}

                      {/* ML Detected Conditions */}
                      {r.mlAssessment?.conditions && r.mlAssessment.conditions.length > 0 && (
                        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {r.mlAssessment.conditions.slice(0, 3).map((c, i) => (
                            <span
                              key={i}
                              style={{
                                background: "#EFF6FF",
                                color: "#1D4ED8",
                                fontSize: "11px",
                                fontWeight: "600",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid #BFDBFE"
                              }}
                            >
                              🩺 {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Symptoms & Timestamp */}
                      <div style={{ margin: "6px 0 2px 0", fontSize: "12px", color: "#475569" }}>
                        <strong>Symptoms:</strong>{" "}
                        {r.symptoms && r.symptoms.length > 0
                          ? r.symptoms.join(", ")
                          : "None reported"}
                      </div>

                      <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                        Risk Score: {r.score ?? "—"}/100
                        {r.mlAssessment?.deteriorationProbability && ` • Decomp Risk: ${r.mlAssessment.deteriorationProbability}%`}
                        {" • "}
                        {r.timestamp
                          ? new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Recently logged"}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "800",
                        backgroundColor: style.bg,
                        color: style.color,
                        border: `1.5px solid ${style.color}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {style.icon} {r.priorityLevel}
                    </span>
                  </div>

                  {isUrgent && (
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() =>
                          onRefer &&
                          onRefer({
                            name: r.patientName,
                            village: r.village,
                            reason: `[Triage ${r.priorityLevel}] Vitals: BP ${r.vitals?.systolicBP || "—"}/${r.vitals?.diastolicBP || "—"}, Sugar: ${r.vitals?.bloodSugar || "—"} mg/dL. Signs: ${r.symptoms ? r.symptoms.join(", ") : "—"}`,
                            needAmbulance: r.priorityLevel === "CRITICAL"
                          })
                        }
                        style={{
                          background: style.color,
                          color: "white",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "700",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
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
