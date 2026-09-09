import React, { useEffect, useState } from "react";
import { getLocal } from "./dataStore";
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  User,
  MapPin,
  Hospital,
  ClipboardList,
  Activity,
  Heart,
  Droplet,
  Wind
} from "lucide-react";

const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const getPriorityStyle = (level) => {
  switch (level) {
    case "CRITICAL":
      return {
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
        icon: <AlertTriangle size={16} color="#DC2626" />
      };
    case "HIGH":
      return {
        color: "#EA580C",
        bg: "#FFF7ED",
        border: "#FED7AA",
        icon: <AlertCircle size={16} color="#EA580C" />
      };
    case "MEDIUM":
      return {
        color: "#D97706",
        bg: "#FFFBEB",
        border: "#FDE68A",
        icon: <AlertCircle size={16} color="#D97706" />
      };
    default:
      return {
        color: "#16A34A",
        bg: "#F0FDF4",
        border: "#BBF7D0",
        icon: <CheckCircle2 size={16} color="#16A34A" />
      };
  }
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
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <button
          className="btn-outline"
          onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <span
          className="badge"
          style={{
            background: "#FEE2E2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <AlertTriangle size={14} color="#DC2626" />
          Live Clinical Stratification Queue
        </span>
      </div>

      <div className="care-card" style={{ padding: "22px", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h2 style={{ color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", fontWeight: "800" }}>
              <ClipboardList size={22} color="#0F6CBD" /> Triage Priority &amp; Surveillance Queue
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748B" }}>
              Prioritized roster based on ML risk stratification and vital sign telemetry
            </p>
          </div>
          <span className="badge badge-med" style={{ padding: "4px 10px" }}>
            {filtered.length} Patients Active
          </span>
        </div>

        {/* Search bar with vector icon */}
        <div style={{ position: "relative", marginBottom: "14px" }}>
          <Search
            size={18}
            color="#94A3B8"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none"
            }}
          />
          <input
            type="text"
            placeholder="Search patient name, village, or clinical condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: "42px",
              paddingRight: "14px",
              borderRadius: "10px",
              fontSize: "14px"
            }}
          />
        </div>

        {/* Priority Filter Chips */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((lvl) => {
            const isSelected = filterLevel === lvl;
            const count = lvl === "ALL" ? records.length : records.filter((r) => r.priorityLevel === lvl).length;
            return (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  backgroundColor: isSelected ? "#0F6CBD" : "#F1F5F9",
                  color: isSelected ? "white" : "#475569",
                  border: isSelected ? "1.5px solid #0F6CBD" : "1px solid #CBD5E1",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {lvl} ({count})
              </button>
            );
          })}
        </div>

        {/* Clinical Biomarker Quick Filters */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B" }}>Biomarker Focus:</span>
          {[
            { id: "ALL", label: "All Vitals", icon: null },
            { id: "SUGAR", label: "High Glucose (≥200 mg/dL)", icon: <Droplet size={13} color="#7C3AED" /> },
            { id: "BP", label: "High BP (≥140 mmHg)", icon: <Heart size={13} color="#DC2626" /> },
            { id: "O2", label: "Low SpO2 (≤93%)", icon: <Wind size={13} color="#0284C7" /> }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setConditionFilter(c.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: conditionFilter === c.id ? "#0F766E" : "#F8FAFC",
                color: conditionFilter === c.id ? "white" : "#475569",
                border: conditionFilter === c.id ? "1px solid #0F766E" : "1px solid #CBD5E1",
                cursor: "pointer"
              }}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748B", background: "#F8FAFC", borderRadius: "14px" }}>
            <Activity size={36} color="#94A3B8" style={{ margin: "0 auto 8px auto", display: "block" }} />
            No patient records match your active search or filter criteria.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((r) => {
              const style = getPriorityStyle(r.priorityLevel);
              const hasVitals = r.vitals && (r.vitals.systolicBP || r.vitals.bloodSugar || r.vitals.spo2);
              const isUrgent = r.priorityLevel === "CRITICAL" || r.priorityLevel === "HIGH";

              return (
                <div
                  key={r.id || `${r.patientId}-${r.timestamp}`}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    border: "1.5px solid #E2E8F0",
                    borderLeft: `6px solid ${style.color}`,
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <User size={15} color="#0F6CBD" />
                          <strong style={{ fontSize: "16px", color: "#0F172A" }}>
                            {r.patientName}
                          </strong>
                        </span>

                        <span style={{ fontSize: "12px", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={13} color="#94A3B8" /> {r.village || "Local Beat"}
                        </span>

                        {r.age && (
                          <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                            &bull; Age {r.age} yrs{r.gender ? ` (${r.gender})` : ""}
                          </span>
                        )}
                      </div>

                      {/* Vitals Telemetry Chips */}
                      {hasVitals && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {r.vitals.systolicBP && (
                            <span
                              style={{
                                padding: "3px 8px",
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
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: r.vitals.bloodSugar >= 200 || r.vitals.bloodSugar <= 70 ? "#FEF3C7" : "#F1F5F9",
                                color: r.vitals.bloodSugar >= 200 || r.vitals.bloodSugar <= 70 ? "#D97706" : "#334155",
                                border: "1px solid #CBD5E1"
                              }}
                            >
                              Glucose: {r.vitals.bloodSugar} mg/dL ({r.vitals.sugarState || "random"})
                            </span>
                          )}

                          {r.vitals.spo2 && (
                            <span
                              style={{
                                padding: "3px 8px",
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
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                background: "#F1F5F9",
                                color: "#334155",
                                border: "1px solid #CBD5E1"
                              }}
                            >
                              HR: {r.vitals.pulse} bpm
                            </span>
                          )}
                        </div>
                      )}

                      {/* ML Detected Conditions */}
                      {r.mlAssessment?.conditions && r.mlAssessment.conditions.length > 0 && (
                        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {r.mlAssessment.conditions.slice(0, 3).map((c, i) => (
                            <span
                              key={i}
                              style={{
                                background: "#EFF6FF",
                                color: "#1D4ED8",
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                border: "1px solid #BFDBFE"
                              }}
                            >
                              &bull; {c}
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
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "800",
                        backgroundColor: style.bg,
                        color: style.color,
                        border: `1.5px solid ${style.border}`,
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
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "800",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                        }}
                      >
                        <Hospital size={14} /> Transfer / Refer to Hospital &rarr;
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
