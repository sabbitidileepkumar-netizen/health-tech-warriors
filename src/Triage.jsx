import React, { useState, useEffect } from "react";
import { subscribeToCollection, addTriageRecord, getLocal } from "./dataStore";
import {
  SYMPTOMS_CATALOG,
  runClinicalMLTriage,
  evaluateBloodPressure,
  evaluateBloodSugar,
  evaluateOxygen,
  evaluatePulse,
  evaluateTemperature
} from "./mlTriageEngine";

const CATEGORIES = [
  "All",
  "Metabolic / Sugar",
  "Cardiovascular & BP",
  "Respiratory",
  "Neurological & Stroke",
  "Infectious & Sepsis",
  "Gastrointestinal"
];

function Triage({ onBack, onNavigateToReferral, defaultPatient, _t }) {
  const [patients, setPatients] = useState(() => getLocal("patients"));
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (defaultPatient && defaultPatient.id) return defaultPatient.id;
    const local = getLocal("patients");
    return local.length > 0 ? local[0].id : "";
  });

  // Vitals State
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [sugarState, setSugarState] = useState("random");
  const [spo2, setSpo2] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");

  // Symptoms & Category State
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  // ML Analysis State
  const [mlResult, setMlResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(null);

  useEffect(() => {
    const unsub = subscribeToCollection("patients", (list) => {
      setPatients(list);
      if (list.length > 0 && !selectedPatientId) {
        setSelectedPatientId(defaultPatient?.id || list[0].id);
      }
    });
    return () => unsub();
  }, [defaultPatient, selectedPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const toggleSymptom = (key) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Real-time Vitals Feedback
  const liveBpEval = evaluateBloodPressure(systolicBP, diastolicBP);
  const liveSugarEval = evaluateBloodSugar(bloodSugar, sugarState);
  const liveO2Eval = evaluateOxygen(spo2);
  const livePulseEval = evaluatePulse(pulse);
  const liveTempEval = evaluateTemperature(temp);

  // Filtered Symptoms
  const displayedSymptoms =
    activeCategory === "All"
      ? SYMPTOMS_CATALOG
      : SYMPTOMS_CATALOG.filter((s) => s.category === activeCategory);

  const handleRunAssessment = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsAnalyzing(true);
    setSavedSuccess(null);

    // Simulate clinical neural processing delay (300ms) for high-feedback UX
    setTimeout(async () => {
      const vitals = {
        systolicBP: systolicBP ? Number(systolicBP) : null,
        diastolicBP: diastolicBP ? Number(diastolicBP) : null,
        bloodSugar: bloodSugar ? Number(bloodSugar) : null,
        sugarState,
        spo2: spo2 ? Number(spo2) : null,
        pulse: pulse ? Number(pulse) : null,
        temp: temp ? Number(temp) : null
      };

      const assessment = runClinicalMLTriage({
        vitals,
        selectedSymptoms,
        patient: {
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          knownConditions: selectedPatient.conditions || []
        }
      });

      setMlResult(assessment);
      setIsAnalyzing(false);

      // Save to data store with full clinical structure
      try {
        const savedResult = await addTriageRecord({
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          village: selectedPatient.village,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          symptoms: selectedSymptoms,
          vitals,
          score: assessment.riskScore,
          priorityLevel: assessment.priorityLevel,
          mlAssessment: {
            deteriorationProbability: assessment.deteriorationProbability,
            confidence: assessment.confidence,
            conditions: assessment.conditions,
            topFactors: assessment.topFactors,
            redFlags: assessment.redFlags,
            clinicalDirectives: assessment.clinicalDirectives
          }
        });

        setSavedSuccess(savedResult._pendingSync ? "offline" : "online");
      } catch (err) {
        console.error("Error saving triage record:", err);
        setSavedSuccess("error");
      }
    }, 350);
  };

  const handleReferralClick = () => {
    if (!onNavigateToReferral || !selectedPatient) return;

    const primaryReason =
      mlResult?.conditions?.slice(0, 2).join(" & ") ||
      "Emergency Clinical Triage Escalation";

    onNavigateToReferral({
      ...selectedPatient,
      reason: `[ML Triage ${mlResult?.priorityLevel || "HIGH"}] ${primaryReason}. Vitals: BP ${systolicBP || "—"}/${diastolicBP || "—"}, Sugar: ${bloodSugar ? bloodSugar + " mg/dL" : "—"}, SpO2: ${spo2 ? spo2 + "%" : "—"}`,
      needAmbulance: mlResult?.priorityLevel === "CRITICAL"
    });
  };

  return (
    <div className="page-content" style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Top Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button className="btn-outline" onClick={onBack}>⬅️ Back</button>
        <span className="badge" style={{ background: "#E0F2FE", color: "#0369A1", fontWeight: "700" }}>
          🤖 ML Clinical Decision Support
        </span>
      </div>

      <div className="care-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
          <div>
            <h2 style={{ color: "#0F766E", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🩺</span> ML Patient Triage & Vitals Assessment
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748B" }}>
              Automated multi-vector risk stratification for Blood Sugar, Blood Pressure, and Clinical Symptoms
            </p>
          </div>
          <span className="badge" style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: "11px" }}>
            ✓ ESI & NEWS2 Protocol
          </span>
        </div>

        <form onSubmit={handleRunAssessment}>
          {/* Patient Selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px" }}>
              👤 Select Patient
            </label>
            {patients.length === 0 ? (
              <p style={{ color: "#DC2626", fontSize: "13px" }}>No registered patients found. Please register a patient first.</p>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setMlResult(null);
                }}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid var(--border)" }}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age} yrs, {p.village}) &bull; Blood: {p.bloodGroup || "O+"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedPatient && (
            <div
              style={{
                background: "#F8FAFC",
                padding: "10px 14px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid #E2E8F0",
                fontSize: "13px",
                display: "flex",
                gap: "16px",
                flexWrap: "wrap"
              }}
            >
              <span><strong>Category:</strong> {selectedPatient.category || "Adult"}</span>
              <span><strong>Age/Gender:</strong> {selectedPatient.age} yrs / {selectedPatient.gender || "—"}</span>
              <span><strong>Village:</strong> {selectedPatient.village}</span>
              <span><strong>Blood:</strong> {selectedPatient.bloodGroup || "O+"}</span>
              <span><strong>Phone:</strong> {selectedPatient.phone || "—"}</span>
            </div>
          )}

          {/* Vitals Section */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <label style={{ fontWeight: "700", color: "#1E293B", fontSize: "14px" }}>
                📊 Enter Vital Signs & Clinical Biomarkers
              </label>
              <span style={{ fontSize: "11px", color: "#64748B" }}>* Real-time physiological staging</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {/* Blood Pressure Card */}
              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>❤️ Blood Pressure (BP)</span>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>mmHg</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="number"
                    placeholder="Systolic (e.g. 120)"
                    value={systolicBP}
                    onChange={(e) => setSystolicBP(e.target.value)}
                    style={{ flex: 1, padding: "8px", fontSize: "13px", borderRadius: "6px" }}
                  />
                  <span style={{ alignSelf: "center", fontWeight: "bold", color: "#94A3B8" }}>/</span>
                  <input
                    type="number"
                    placeholder="Diastolic (e.g. 80)"
                    value={diastolicBP}
                    onChange={(e) => setDiastolicBP(e.target.value)}
                    style={{ flex: 1, padding: "8px", fontSize: "13px", borderRadius: "6px" }}
                  />
                </div>
                {liveBpEval && (
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: liveBpEval.bg,
                      color: liveBpEval.color
                    }}
                  >
                    {liveBpEval.stage}
                  </div>
                )}
              </div>

              {/* Blood Sugar Card */}
              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>🩸 Blood Sugar / Glucose</span>
                  <select
                    value={sugarState}
                    onChange={(e) => setSugarState(e.target.value)}
                    style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", width: "auto" }}
                  >
                    <option value="random">Random</option>
                    <option value="fasting">Fasting</option>
                    <option value="postprandial">Post-Meal</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="number"
                    placeholder="Sugar (e.g. 110 mg/dL)"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    style={{ flex: 1, padding: "8px", fontSize: "13px", borderRadius: "6px" }}
                  />
                </div>
                {liveSugarEval && (
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: liveSugarEval.bg,
                      color: liveSugarEval.color
                    }}
                  >
                    {liveSugarEval.status}
                  </div>
                )}
              </div>

              {/* Oxygen Saturation Card */}
              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>🫁 Oxygen SpO2</span>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>%</span>
                </div>
                <input
                  type="number"
                  placeholder="SpO2 (e.g. 98%)"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px" }}
                />
                {liveO2Eval && (
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: liveO2Eval.bg,
                      color: liveO2Eval.color
                    }}
                  >
                    {liveO2Eval.status}
                  </div>
                )}
              </div>

              {/* Pulse / Heart Rate Card */}
              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>💓 Pulse / Heart Rate</span>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>BPM</span>
                </div>
                <input
                  type="number"
                  placeholder="Pulse (e.g. 74 bpm)"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px" }}
                />
                {livePulseEval && (
                  <div style={{ marginTop: "6px", fontSize: "11px", fontWeight: "600", color: livePulseEval.color }}>
                    {livePulseEval.alert}
                  </div>
                )}
              </div>

              {/* Temperature Card */}
              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>🌡️ Body Temp</span>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>°F</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Temp (e.g. 98.6°F)"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  style={{ width: "100%", padding: "8px", fontSize: "13px", borderRadius: "6px" }}
                />
                {liveTempEval && (
                  <div style={{ marginTop: "6px", fontSize: "11px", fontWeight: "600", color: liveTempEval.color }}>
                    {liveTempEval.alert}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Symptoms Selection Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
              <label style={{ fontWeight: "700", color: "#1E293B", fontSize: "14px" }}>
                🩺 Clinical Symptoms & Red Flags ({selectedSymptoms.length} selected)
              </label>
              {selectedSymptoms.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSymptoms([])}
                  style={{ background: "none", border: "none", color: "#DC2626", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "12px" }}>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    border: activeCategory === cat ? "1.5px solid #0F766E" : "1px solid #CBD5E1",
                    backgroundColor: activeCategory === cat ? "#0F766E" : "#FFFFFF",
                    color: activeCategory === cat ? "#FFFFFF" : "#475569",
                    cursor: "pointer",
                    fontWeight: activeCategory === cat ? "600" : "400"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Symptoms Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "8px" }}>
              {displayedSymptoms.map((s) => {
                const isSelected = selectedSymptoms.includes(s.key);
                return (
                  <div
                    key={s.key}
                    onClick={() => toggleSymptom(s.key)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #0F766E" : "1.5px solid #E2E8F0",
                      backgroundColor: isSelected ? "#F0FDFA" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 2px 4px rgba(15, 118, 110, 0.15)" : "none"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by div click
                      style={{ marginTop: "3px", cursor: "pointer" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: isSelected ? "700" : "500", color: "#1E293B" }}>
                        {s.icon} {s.label}
                      </div>
                      <div style={{ fontSize: "11px", color: isSelected ? "#0F766E" : "#94A3B8", marginTop: "2px" }}>
                        {s.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAnalyzing || !selectedPatient}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "14px",
              background: isAnalyzing ? "#94A3B8" : "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "10px",
              boxShadow: "0 4px 6px -1px rgba(15, 118, 110, 0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px"
            }}
          >
            {isAnalyzing ? "🧠 Running Clinical ML Inference..." : "⚡ Run ML Clinical Triage & Save Record"}
          </button>
        </form>

        {/* ML Assessment Result Card */}
        {mlResult && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: mlResult.bg,
              border: `2px solid ${mlResult.color}`,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
            }}
          >
            {/* Priority Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "32px" }}>{mlResult.icon}</span>
                <div>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", color: mlResult.color }}>
                    ML Predicted Priority
                  </div>
                  <h2 style={{ margin: "2px 0", color: mlResult.color, fontSize: "24px" }}>
                    {mlResult.priorityLevel} PRIORITY
                  </h2>
                </div>
              </div>

              <div style={{ textAlign: "right", background: "rgba(255, 255, 255, 0.7)", padding: "8px 14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#475569", fontWeight: "600" }}>Deterioration Risk</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: mlResult.color }}>
                  {mlResult.deteriorationProbability}%
                </div>
                <div style={{ fontSize: "10px", color: "#64748B" }}>Risk Score: {mlResult.riskScore}/100</div>
              </div>
            </div>

            {/* Protocol Action */}
            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                background: "white",
                borderRadius: "10px",
                borderLeft: `5px solid ${mlResult.color}`,
                fontSize: "14px",
                fontWeight: "600",
                color: "#1E293B"
              }}
            >
              📋 {mlResult.action}
            </div>

            {/* Identified Clinical Conditions */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                🔍 Detected Clinical Conditions & Patterns:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {mlResult.conditions.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      background: "white",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1E293B"
                    }}
                  >
                    • {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Feature Importance Attribution (Explainable AI) */}
            {mlResult.topFactors && mlResult.topFactors.length > 0 && (
              <div style={{ marginTop: "16px", background: "rgba(255, 255, 255, 0.6)", padding: "12px", borderRadius: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                  💡 Top Risk Drivers (ML Feature Attribution):
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {mlResult.topFactors.map((factor, i) => (
                    <div key={i} style={{ fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span style={{ fontWeight: "600", color: "#1E293B" }}>{factor.name}</span>
                        <span style={{ fontWeight: "700", color: factor.severity === "CRITICAL" ? "#DC2626" : "#D97706" }}>
                          {factor.percentage}% Impact
                        </span>
                      </div>
                      <div style={{ height: "6px", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${factor.percentage}%`,
                            background: factor.severity === "CRITICAL" ? "#DC2626" : "#0D9488",
                            borderRadius: "3px"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Directives */}
            {mlResult.clinicalDirectives && mlResult.clinicalDirectives.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  ⚡ Immediate Field Directives:
                </div>
                <ul style={{ margin: "0 0 0 16px", padding: 0, fontSize: "12px", color: "#334155" }}>
                  {mlResult.clinicalDirectives.map((d, i) => (
                    <li key={i} style={{ marginBottom: "3px" }}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sync Notifications */}
            {savedSuccess === "online" && (
              <div style={{ marginTop: "14px", fontSize: "12px", color: "#166534", fontWeight: "bold" }}>
                ✓ Record saved to Priority Queue & Cloud Sync
              </div>
            )}
            {savedSuccess === "offline" && (
              <div style={{ marginTop: "14px", fontSize: "12px", color: "#92400E", fontWeight: "bold" }}>
                📴 Saved locally on device — will sync when network is restored
              </div>
            )}
            {savedSuccess === "error" && (
              <div style={{ marginTop: "14px", fontSize: "12px", color: "#991B1B", fontWeight: "bold" }}>
                ❌ Could not save record. Please retry.
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              {(mlResult.priorityLevel === "CRITICAL" || mlResult.priorityLevel === "HIGH") && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleReferralClick}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  🏥 Create Hospital Referral with Triage Data &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Triage;
