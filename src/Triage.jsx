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
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Ambulance,
  User,
  Sparkles,
  Check,
  Hospital,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { TriageHeroIllustration } from "./components/MedicalIcons";
import { AnatomicalBodyMap } from "./components/AnatomicalBodyMap";
import {
  BloodPressureGauge,
  BloodSugarGauge,
  OxygenSpo2Gauge,
  PulseHeartRateGauge,
  TemperatureGauge
} from "./components/VitalsVisualGauge";
import { SymptomIcon } from "./components/SymptomIcon";

const getPriorityVisuals = (level) => {
  switch (level) {
    case "CRITICAL":
      return {
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
        badge: "badge-high",
        icon: <AlertTriangle size={24} color="#DC2626" />,
        esiLevel: "ESI Level 1 - Immediate Resuscitation"
      };
    case "HIGH":
      return {
        color: "#EA580C",
        bg: "#FFF7ED",
        border: "#FED7AA",
        badge: "badge-high",
        icon: <AlertCircle size={24} color="#EA580C" />,
        esiLevel: "ESI Level 2 - Emergent Staging"
      };
    case "MEDIUM":
      return {
        color: "#D97706",
        bg: "#FFFBEB",
        border: "#FDE68A",
        badge: "badge-med",
        icon: <AlertCircle size={24} color="#D97706" />,
        esiLevel: "ESI Level 3 - Urgent Staging"
      };
    default:
      return {
        color: "#16A34A",
        bg: "#F0FDF4",
        border: "#BBF7D0",
        badge: "badge-low",
        icon: <CheckCircle2 size={24} color="#16A34A" />,
        esiLevel: "ESI Level 4/5 - Non-Urgent Care"
      };
  }
};

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

  // Real-time Vitals Clinical Feedback
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

  const priorityVisuals = mlResult ? getPriorityVisuals(mlResult.priorityLevel) : null;

  return (
    <div className="page-content" style={{ maxWidth: "880px", margin: "0 auto", padding: "16px" }}>
      {/* Top Clinical Navigation Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <button
          className="btn-outline"
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "600"
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className="badge"
            style={{
              background: "#E0F2FE",
              color: "#0369A1",
              border: "1px solid #BAE6FD",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <ShieldCheck size={14} color="#0369A1" />
            ESI &amp; NEWS2 Validated
          </span>
          <span
            className="badge"
            style={{
              background: "#F0FDF4",
              color: "#166534",
              border: "1px solid #BBF7D0",
              fontWeight: "700"
            }}
          >
            Clinical Telemetry Active
          </span>
        </div>
      </div>

      {/* Internal Picture / Illustration: Triage Hero Banner */}
      <TriageHeroIllustration />

      {/* Main Triage Assessment Workspace Card */}
      <div className="care-card" style={{ padding: "24px", borderRadius: "18px" }}>
        <form onSubmit={handleRunAssessment}>
          {/* Patient Selector Card */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "22px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: "#0F6CBD",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <User size={16} />
              </div>
              <label style={{ fontWeight: "700", fontSize: "14px", color: "#1E293B", margin: 0 }}>
                Select Registered Citizen / Patient
              </label>
            </div>

            {patients.length === 0 ? (
              <div style={{ color: "#DC2626", fontSize: "13px", padding: "8px 0" }}>
                No registered patients found. Please register a patient first before screening.
              </div>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setMlResult(null);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #CBD5E1",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: "#FFFFFF"
                }}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} &bull; Age {p.age} &bull; {p.village} &bull; Blood: {p.bloodGroup || "O+"}
                  </option>
                ))}
              </select>
            )}

            {selectedPatient && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px dashed #CBD5E1",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  fontSize: "12px"
                }}
              >
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    color: "#334155"
                  }}
                >
                  <strong>Cohort:</strong> {selectedPatient.category || "Adult"}
                </span>
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    color: "#334155"
                  }}
                >
                  <strong>Demographics:</strong> {selectedPatient.age} yrs / {selectedPatient.gender || "—"}
                </span>
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    color: "#334155"
                  }}
                >
                  <strong>Location:</strong> {selectedPatient.village}
                </span>
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    color: "#334155"
                  }}
                >
                  <strong>Blood Group:</strong> {selectedPatient.bloodGroup || "O+"}
                </span>
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    color: "#334155"
                  }}
                >
                  <strong>Contact:</strong> {selectedPatient.phone || "—"}
                </span>
              </div>
            )}
          </div>

          {/* Physiological Vitals Gauges Section */}
          <div style={{ marginBottom: "26px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "#CCFBF1",
                    color: "#0F766E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Activity size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: "15px", color: "#0F172A", fontWeight: "700" }}>
                  Real-time Vital Signs &amp; Physiological Telemetry
                </h3>
              </div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                Live AHA &amp; NEWS2 physiological risk scoring
              </span>
            </div>

            {/* Vitals Visual Gauges Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "12px"
              }}
            >
              <BloodPressureGauge
                systolic={systolicBP}
                diastolic={diastolicBP}
                onChangeSys={setSystolicBP}
                onChangeDia={setDiastolicBP}
                liveEval={liveBpEval}
              />

              <BloodSugarGauge
                bloodSugar={bloodSugar}
                sugarState={sugarState}
                onChangeSugar={setBloodSugar}
                onChangeState={setSugarState}
                liveEval={liveSugarEval}
              />

              <OxygenSpo2Gauge
                spo2={spo2}
                onChangeSpo2={setSpo2}
                liveEval={liveO2Eval}
              />

              <PulseHeartRateGauge
                pulse={pulse}
                onChangePulse={setPulse}
                liveEval={livePulseEval}
              />

              <TemperatureGauge
                temp={temp}
                onChangeTemp={setTemp}
                liveEval={liveTempEval}
              />
            </div>
          </div>

          {/* Anatomical Body Explorer & Symptoms Selection */}
          <div style={{ marginBottom: "26px" }}>
            <AnatomicalBodyMap
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              symptoms={SYMPTOMS_CATALOG}
              selectedSymptoms={selectedSymptoms}
            />

            {/* Symptom Checklist Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                Showing {displayedSymptoms.length} signs in{" "}
                <span style={{ color: "#0F766E" }}>{activeCategory}</span>
                {selectedSymptoms.length > 0 && ` (${selectedSymptoms.length} active)`}
              </div>

              {selectedSymptoms.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSymptoms([])}
                  style={{
                    background: "#FEE2E2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "700"
                  }}
                >
                  Clear All ({selectedSymptoms.length})
                </button>
              )}
            </div>

            {/* Professional Medical Symptom Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "10px"
              }}
            >
              {displayedSymptoms.map((s) => {
                const isSelected = selectedSymptoms.includes(s.key);
                const isRedFlag = s.severity === "CRITICAL_RED_FLAG";

                return (
                  <div
                    key={s.key}
                    onClick={() => toggleSymptom(s.key)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: isSelected
                        ? "2px solid #0F766E"
                        : isRedFlag
                        ? "1.5px solid #FCA5A5"
                        : "1.5px solid #E2E8F0",
                      backgroundColor: isSelected
                        ? "#F0FDFA"
                        : isRedFlag
                        ? "#FFF8F8"
                        : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected
                        ? "0 4px 12px rgba(15, 118, 110, 0.15)"
                        : "0 1px 2px rgba(0,0,0,0.02)",
                      position: "relative"
                    }}
                  >
                    {/* Clinical Vector Icon Bubble */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: isSelected
                          ? "#0F766E"
                          : isRedFlag
                          ? "#FEE2E2"
                          : "#F1F5F9",
                        color: isSelected ? "#FFFFFF" : isRedFlag ? "#DC2626" : "#0F766E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <SymptomIcon
                        type={s.iconType}
                        size={18}
                        color={isSelected ? "#FFFFFF" : isRedFlag ? "#DC2626" : "#0F766E"}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "4px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: isRedFlag ? "#FEE2E2" : "#E2E8F0",
                            color: isRedFlag ? "#DC2626" : "#475569"
                          }}
                        >
                          {isRedFlag ? "Critical Red Flag" : s.organSystem}
                        </span>

                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "5px",
                            border: isSelected ? "2px solid #0F766E" : "1.5px solid #94A3B8",
                            background: isSelected ? "#0F766E" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white"
                          }}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? "700" : "600",
                          color: "#0F172A",
                          lineHeight: 1.3
                        }}
                      >
                        {s.label}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: isSelected ? "#0F766E" : "#64748B",
                          marginTop: "4px",
                          lineHeight: 1.2
                        }}
                      >
                        {s.clinicalFlag}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Action Submit Button */}
          <button
            type="submit"
            disabled={isAnalyzing || !selectedPatient}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "16px",
              background: isAnalyzing
                ? "#94A3B8"
                : "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0F6CBD 100%)",
              fontSize: "15px",
              fontWeight: "800",
              borderRadius: "12px",
              boxShadow: "0 6px 16px -2px rgba(15, 118, 110, 0.35)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              cursor: isAnalyzing ? "wait" : "pointer"
            }}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="spin-animation" />
                Executing Clinical Neural Stratification...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Execute ML Clinical Triage &amp; Commit Record
              </>
            )}
          </button>
        </form>

        {/* Clinical Decision Support (CDSS) Result Card */}
        {mlResult && priorityVisuals && (
          <div
            style={{
              marginTop: "28px",
              padding: "24px",
              borderRadius: "18px",
              backgroundColor: priorityVisuals.bg,
              border: `2px solid ${priorityVisuals.border}`,
              boxShadow: "0 12px 28px -4px rgba(0, 0, 0, 0.08)",
              position: "relative"
            }}
          >
            {/* Priority Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                borderBottom: `1px solid ${priorityVisuals.border}`,
                paddingBottom: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: `1.5px solid ${priorityVisuals.border}`
                  }}
                >
                  {priorityVisuals.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "800",
                      color: priorityVisuals.color
                    }}
                  >
                    CDSS Decision &bull; {priorityVisuals.esiLevel}
                  </div>
                  <h2
                    style={{
                      margin: "2px 0",
                      color: priorityVisuals.color,
                      fontSize: "24px",
                      fontWeight: "800"
                    }}
                  >
                    {mlResult.priorityLevel} PRIORITY STRATUM
                  </h2>
                </div>
              </div>

              {/* Deterioration & Risk Gauge */}
              <div
                style={{
                  textAlign: "right",
                  background: "white",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>
                  Clinical Deterioration Risk
                </div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: priorityVisuals.color }}>
                  {mlResult.deteriorationProbability}%
                </div>
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                  NEWS2 Risk Index: <strong>{mlResult.riskScore}/100</strong>
                </div>
              </div>
            </div>

            {/* Protocol Directive Action Banner */}
            <div
              style={{
                marginTop: "16px",
                padding: "14px 16px",
                background: "white",
                borderRadius: "12px",
                borderLeft: `5px solid ${priorityVisuals.color}`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <FileSpreadsheet size={20} color={priorityVisuals.color} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B" }}>
                {mlResult.action}
              </div>
            </div>

            {/* Clinical Conditions Identified */}
            <div style={{ marginTop: "18px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Identified Clinical Conditions &amp; Syndromes:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {mlResult.conditions.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      background: "white",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#1E293B",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                    }}
                  >
                    &bull; {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Explainable AI: Feature Importance Attribution */}
            {mlResult.topFactors && mlResult.topFactors.length > 0 && (
              <div
                style={{
                  marginTop: "18px",
                  background: "white",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0"
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#334155",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Activity size={14} color="#0F766E" />
                  Primary Risk Drivers (Explainable ML Attribution):
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {mlResult.topFactors.map((factor, i) => (
                    <div key={i} style={{ fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                        <span style={{ fontWeight: "600", color: "#1E293B" }}>{factor.name}</span>
                        <span
                          style={{
                            fontWeight: "800",
                            color: factor.severity === "CRITICAL" ? "#DC2626" : "#D97706"
                          }}
                        >
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

            {/* Immediate Directives Checklist */}
            {mlResult.clinicalDirectives && mlResult.clinicalDirectives.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#334155",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  Immediate Field Directives:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {mlResult.clinicalDirectives.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#334155",
                        background: "rgba(255,255,255,0.7)",
                        padding: "6px 10px",
                        borderRadius: "6px"
                      }}
                    >
                      <CheckCircle2 size={16} color="#0F766E" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cloud & Local Device Sync Status */}
            {savedSuccess === "online" && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  fontSize: "12px",
                  color: "#065F46",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <CheckCircle2 size={16} color="#065F46" />
                Telemetry persisted to Local Priority Queue &amp; Cloud Medical Records
              </div>
            )}
            {savedSuccess === "offline" && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  fontSize: "12px",
                  color: "#92400E",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Clock size={16} color="#92400E" />
                Saved offline on device cache &bull; Queued for instant sync upon reconnection
              </div>
            )}
            {savedSuccess === "error" && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  fontSize: "12px",
                  color: "#991B1B",
                  fontWeight: "700"
                }}
              >
                Could not commit record to local store. Please retry assessment.
              </div>
            )}

            {/* Emergency Escalation & Referral Actions */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {(mlResult.priorityLevel === "CRITICAL" || mlResult.priorityLevel === "HIGH") && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleReferralClick}
                  style={{
                    flex: 1,
                    minWidth: "220px",
                    padding: "14px 18px",
                    fontWeight: "800",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
                  }}
                >
                  <Hospital size={18} />
                  Dispatch Hospital Referral with Triage Dossier
                </button>
              )}

              {mlResult.priorityLevel === "CRITICAL" && (
                <button
                  type="button"
                  onClick={handleReferralClick}
                  style={{
                    padding: "14px 18px",
                    background: "#7F1D1D",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "800",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer"
                  }}
                >
                  <Ambulance size={18} />
                  Request 108 Emergency SOS
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
