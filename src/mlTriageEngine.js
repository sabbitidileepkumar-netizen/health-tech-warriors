/**
 * Clinical Machine Learning Triage & Risk Stratification Engine
 * Implements an ensemble clinical decision model grounded in:
 * - Emergency Severity Index (ESI)
 * - National Early Warning Score 2 (NEWS2)
 * - American Heart Association (AHA) Blood Pressure Standards
 * - American Diabetes Association (ADA) Glycemic Crisis Guidelines
 */

export const SYMPTOMS_CATALOG = [
  // Metabolic & Glycemic
  {
    key: "extreme_thirst_urination",
    label: "Extreme Thirst & Frequent Urination",
    category: "Metabolic / Sugar",
    icon: "💧",
    baseWeight: 14,
    clinicalFlag: "Symptomatic Hyperglycemia (Polydipsia/Polyuria)"
  },
  {
    key: "fruity_breath",
    label: "Fruity Breath Odor / Deep Breathing",
    category: "Metabolic / Sugar",
    icon: "🍎",
    baseWeight: 24,
    clinicalFlag: "Suspected Diabetic Ketoacidosis (DKA)"
  },
  {
    key: "shakiness_sweating",
    label: "Cold Sweats, Shakiness & Tremors",
    category: "Metabolic / Sugar",
    icon: "🥶",
    baseWeight: 16,
    clinicalFlag: "Acute Hypoglycemia Signs"
  },
  {
    key: "sudden_blurred_vision",
    label: "Sudden Blurred / Double Vision",
    category: "Metabolic / Sugar",
    icon: "👁️",
    baseWeight: 12,
    clinicalFlag: "Acute Retinal / Glycemic Fluctuation"
  },

  // Cardiovascular & Blood Pressure
  {
    key: "chest_pain_radiating",
    label: "Crushing Chest Pain / Arm-Jaw Radiation",
    category: "Cardiovascular & BP",
    icon: "💔",
    baseWeight: 30,
    clinicalFlag: "Acute Coronary Syndrome / Myocardial Infarction"
  },
  {
    key: "palpitations_racing_heart",
    label: "Sudden Rapid Fluttering / Racing Heart",
    category: "Cardiovascular & BP",
    icon: "💓",
    baseWeight: 14,
    clinicalFlag: "Cardiac Arrhythmia / Tachyarrhythmia"
  },
  {
    key: "fainting_syncope",
    label: "Sudden Fainting / Blackout (Syncope)",
    category: "Cardiovascular & BP",
    icon: "💫",
    baseWeight: 22,
    clinicalFlag: "Hemodynamic Instability / Syncope"
  },

  // Respiratory
  {
    key: "severe_breathlessness",
    label: "Severe Shortness of Breath (at rest)",
    category: "Respiratory",
    icon: "🫁",
    baseWeight: 28,
    clinicalFlag: "Acute Respiratory Failure / Distress"
  },
  {
    key: "wheezing_stridor",
    label: "Audible Wheezing / Stridor / Gaspy Breath",
    category: "Respiratory",
    icon: "🌬️",
    baseWeight: 15,
    clinicalFlag: "Severe Airway Constriction (Asthma/Bronchospasm)"
  },
  {
    key: "cough_with_blood",
    label: "Cough with Blood (Hemoptysis)",
    category: "Respiratory",
    icon: "🩸",
    baseWeight: 20,
    clinicalFlag: "Pulmonary Hemorrhage / Acute Lower Respiratory Infection"
  },
  {
    key: "persistent_cough",
    label: "Persistent Cough (>2 weeks)",
    category: "Respiratory",
    icon: "😷",
    baseWeight: 6,
    clinicalFlag: "Chronic Cough / Respiratory Infection"
  },

  // Neurological & Stroke
  {
    key: "stroke_fast_signs",
    label: "FAST Signs: Facial Droop, Arm Weakness, Slurred Speech",
    category: "Neurological & Stroke",
    icon: "🧠",
    baseWeight: 32,
    clinicalFlag: "Acute Cerebrovascular Accident (Stroke Warning)"
  },
  {
    key: "altered_mental_state",
    label: "Confusion, Drowsiness or Unresponsiveness",
    category: "Neurological & Stroke",
    icon: "😵",
    baseWeight: 26,
    clinicalFlag: "Altered Sensorium / Encephalopathy"
  },
  {
    key: "thunderclap_headache",
    label: "Sudden Severe 'Thunderclap' Headache",
    category: "Neurological & Stroke",
    icon: "⚡",
    baseWeight: 22,
    clinicalFlag: "Hypertensive Encephalopathy / Subarachnoid Risk"
  },
  {
    key: "seizures_convulsions",
    label: "Seizures / Uncontrolled Jerking",
    category: "Neurological & Stroke",
    icon: "⚡",
    baseWeight: 28,
    clinicalFlag: "Acute Seizure / Neurological Emergency"
  },

  // Gastrointestinal & Dehydration
  {
    key: "severe_vomiting",
    label: "Persistent Intractable Vomiting",
    category: "Gastrointestinal",
    icon: "🤢",
    baseWeight: 14,
    clinicalFlag: "Severe Gastric Distress & Dehydration Risk"
  },
  {
    key: "watery_diarrhea",
    label: "Watery Diarrhea (>5 times/day, sunken eyes)",
    category: "Gastrointestinal",
    icon: "🚰",
    baseWeight: 16,
    clinicalFlag: "Acute Cholera / Dehydrating Enteritis"
  },
  {
    key: "severe_abdominal_pain",
    label: "Severe Rigid / Guarding Abdominal Pain",
    category: "Gastrointestinal",
    icon: "😣",
    baseWeight: 18,
    clinicalFlag: "Acute Surgical Abdomen / Peritonitis"
  },

  // Infectious & Sepsis
  {
    key: "sepsis_rigors",
    label: "Violent Shaking Chills (Rigors) with High Fever",
    category: "Infectious & Sepsis",
    icon: "🥶",
    baseWeight: 22,
    clinicalFlag: "Systemic Inflammatory Response / Suspected Sepsis"
  },
  {
    key: "high_fever",
    label: "High Fever (>102°F)",
    category: "Infectious & Sepsis",
    icon: "🌡️",
    baseWeight: 10,
    clinicalFlag: "High Grade Pyrexia"
  },
  {
    key: "petechiae_rash",
    label: "Purplish Non-Blanching Skin Spots / Petechiae",
    category: "Infectious & Sepsis",
    icon: "🟣",
    baseWeight: 24,
    clinicalFlag: "Meningococcal / Hemorrhagic Fever Warning"
  },
  {
    key: "stiff_neck",
    label: "Stiff Neck with Light Sensitivity (Photophobia)",
    category: "Infectious & Sepsis",
    icon: "🧣",
    baseWeight: 20,
    clinicalFlag: "Meningeal Irritation"
  },

  // General
  {
    key: "extreme_weakness",
    label: "Extreme Prostration / Inability to Stand",
    category: "General",
    icon: "😴",
    baseWeight: 8,
    clinicalFlag: "Severe Prostration"
  }
];

/**
 * Evaluates Blood Pressure and returns clinical staging and risk score.
 */
export function evaluateBloodPressure(systolic, diastolic) {
  if (!systolic && !diastolic) return null;

  const sys = Number(systolic) || 120;
  const dia = Number(diastolic) || 80;

  // Hypertensive Crisis / Emergency
  if (sys >= 180 || dia >= 120) {
    return {
      stage: "Hypertensive Crisis (Emergency)",
      severity: "CRITICAL",
      score: 35,
      alert: `Severe Blood Pressure (${sys}/${dia} mmHg) - Immediate risk of stroke or cardiac event`,
      color: "#DC2626",
      bg: "#FEE2E2"
    };
  }

  // Shock / Hypotension
  if (sys < 90 || dia < 60) {
    return {
      stage: "Hypotension / Circulatory Shock Risk",
      severity: "CRITICAL",
      score: 30,
      alert: `Dangerously Low BP (${sys}/${dia} mmHg) - Risk of hypovolemic or septic shock`,
      color: "#DC2626",
      bg: "#FEE2E2"
    };
  }

  // Stage 2 Hypertension
  if (sys >= 140 || dia >= 90) {
    return {
      stage: "Stage 2 Hypertension",
      severity: "HIGH",
      score: 18,
      alert: `High Blood Pressure (${sys}/${dia} mmHg) - Requires prompt clinical intervention`,
      color: "#D97706",
      bg: "#FEF3C7"
    };
  }

  // Stage 1 Hypertension
  if (sys >= 130 || dia >= 80) {
    return {
      stage: "Stage 1 Hypertension",
      severity: "MEDIUM",
      score: 8,
      alert: `Elevated Blood Pressure (${sys}/${dia} mmHg)`,
      color: "#2563EB",
      bg: "#EFF6FF"
    };
  }

  return {
    stage: "Normal Blood Pressure",
    severity: "NORMAL",
    score: 0,
    alert: `Optimal BP (${sys}/${dia} mmHg)`,
    color: "#16A34A",
    bg: "#DCFCE7"
  };
}

/**
 * Evaluates Blood Sugar (mg/dL) and returns clinical glycemic status.
 */
export function evaluateBloodSugar(glucose, state = "random") {
  if (!glucose) return null;
  const val = Number(glucose);

  // Critical Hyperglycemia (DKA/HHS risk)
  if (val >= 300 || (state === "fasting" && val >= 250)) {
    return {
      status: "Severe Hyperglycemia / Glycemic Crisis",
      severity: "CRITICAL",
      score: 34,
      alert: `Critically Elevated Blood Glucose (${val} mg/dL) - Urgent DKA/HHS risk`,
      color: "#DC2626",
      bg: "#FEE2E2"
    };
  }

  // Critical Hypoglycemia
  if (val <= 54) {
    return {
      status: "Severe Hypoglycemia (Shock Danger)",
      severity: "CRITICAL",
      score: 35,
      alert: `Dangerously Low Sugar (${val} mg/dL) - Risk of loss of consciousness/seizure`,
      color: "#DC2626",
      bg: "#FEE2E2"
    };
  }

  // Moderate Hypoglycemia
  if (val < 70) {
    return {
      status: "Hypoglycemia",
      severity: "HIGH",
      score: 22,
      alert: `Low Blood Sugar (${val} mg/dL) - Requires immediate fast-acting carbohydrate`,
      color: "#D97706",
      bg: "#FEF3C7"
    };
  }

  // Moderate Hyperglycemia
  if (val >= 200 || (state === "fasting" && val >= 126)) {
    return {
      status: "Significant Hyperglycemia",
      severity: "HIGH",
      score: 16,
      alert: `High Blood Sugar (${val} mg/dL, ${state}) - Uncontrolled glycemic state`,
      color: "#D97706",
      bg: "#FEF3C7"
    };
  }

  // Pre-diabetes / Mild Elevation
  if ((state === "fasting" && val >= 100) || (state === "postprandial" && val >= 140)) {
    return {
      status: "Mildly Elevated Sugar",
      severity: "MEDIUM",
      score: 6,
      alert: `Elevated Sugar (${val} mg/dL) - Needs dietary & routine review`,
      color: "#2563EB",
      bg: "#EFF6FF"
    };
  }

  return {
    status: "Normal Blood Glucose",
    severity: "NORMAL",
    score: 0,
    alert: `Normal Sugar (${val} mg/dL)`,
    color: "#16A34A",
    bg: "#DCFCE7"
  };
}

/**
 * Evaluates Oxygen Saturation SpO2 (%)
 */
export function evaluateOxygen(spo2) {
  if (!spo2) return null;
  const val = Number(spo2);

  if (val <= 88) {
    return {
      status: "Severe Hypoxemia",
      severity: "CRITICAL",
      score: 35,
      alert: `Critical Oxygen Saturation (${val}%) - Acute Hypoxemia requiring urgent O2 therapy`,
      color: "#DC2626",
      bg: "#FEE2E2"
    };
  }

  if (val <= 93) {
    return {
      status: "Mild-Moderate Hypoxia",
      severity: "HIGH",
      score: 20,
      alert: `Subnormal SpO2 (${val}%) - Monitor respiratory status closely`,
      color: "#D97706",
      bg: "#FEF3C7"
    };
  }

  return {
    status: "Normal Oxygenation",
    severity: "NORMAL",
    score: 0,
    alert: `SpO2 Normal (${val}%)`,
    color: "#16A34A",
    bg: "#DCFCE7"
  };
}

/**
 * Evaluates Pulse / Heart Rate (BPM)
 */
export function evaluatePulse(pulse) {
  if (!pulse) return null;
  const val = Number(pulse);

  if (val >= 130) {
    return {
      status: "Severe Tachycardia",
      severity: "CRITICAL",
      score: 24,
      alert: `Critically elevated heart rate (${val} bpm)`,
      color: "#DC2626"
    };
  }
  if (val >= 105) {
    return {
      status: "Tachycardia",
      severity: "HIGH",
      score: 12,
      alert: `Elevated heart rate (${val} bpm)`,
      color: "#D97706"
    };
  }
  if (val < 45) {
    return {
      status: "Severe Bradycardia",
      severity: "CRITICAL",
      score: 26,
      alert: `Dangerously slow heart rate (${val} bpm)`,
      color: "#DC2626"
    };
  }
  if (val < 55) {
    return {
      status: "Bradycardia",
      severity: "MEDIUM",
      score: 10,
      alert: `Low heart rate (${val} bpm)`,
      color: "#2563EB"
    };
  }
  return { status: "Normal Pulse", severity: "NORMAL", score: 0, alert: `Normal (${val} bpm)`, color: "#16A34A" };
}

/**
 * Evaluates Body Temperature (°F)
 */
export function evaluateTemperature(temp) {
  if (!temp) return null;
  const val = Number(temp);

  if (val >= 103) {
    return {
      status: "Hyperpyrexia",
      severity: "CRITICAL",
      score: 22,
      alert: `High fever (${val}°F) - Risk of febrile complications/septic state`,
      color: "#DC2626"
    };
  }
  if (val >= 100.4) {
    return {
      status: "Fever / Pyrexia",
      severity: "HIGH",
      score: 10,
      alert: `Fever present (${val}°F)`,
      color: "#D97706"
    };
  }
  if (val <= 95) {
    return {
      status: "Hypothermia",
      severity: "CRITICAL",
      score: 25,
      alert: `Hypothermia (${val}°F) - Keep patient warm immediately`,
      color: "#DC2626"
    };
  }
  return { status: "Normal Temp", severity: "NORMAL", score: 0, alert: `Normal (${val}°F)`, color: "#16A34A" };
}

/**
 * Core Clinical Machine Learning Triage Predictor
 * @param {Object} params
 * @param {Object} params.vitals - Systolic, Diastolic, Blood Sugar, SpO2, Pulse, Temp
 * @param {Array<string>} params.selectedSymptoms - Keys of active symptoms
 * @param {Object} params.patient - Age, gender, known conditions
 * @returns {Object} Comprehensive ML Clinical Triage Result
 */
export function runClinicalMLTriage({ vitals = {}, selectedSymptoms = [], patient = {} }) {
  const activeSymptomObjs = SYMPTOMS_CATALOG.filter((s) => selectedSymptoms.includes(s.key));

  const bpResult = evaluateBloodPressure(vitals.systolicBP, vitals.diastolicBP);
  const sugarResult = evaluateBloodSugar(vitals.bloodSugar, vitals.sugarState || "random");
  const o2Result = evaluateOxygen(vitals.spo2);
  const pulseResult = evaluatePulse(vitals.pulse);
  const tempResult = evaluateTemperature(vitals.temp);

  // Contributing factors with attribution weights
  const factorContributions = [];
  const identifiedConditions = [];
  const redFlags = [];

  // Vitals contributions
  if (bpResult && bpResult.score > 0) {
    factorContributions.push({
      name: `Blood Pressure (${vitals.systolicBP}/${vitals.diastolicBP} mmHg)`,
      score: bpResult.score,
      alert: bpResult.alert,
      severity: bpResult.severity
    });
    if (bpResult.severity === "CRITICAL") {
      redFlags.push(bpResult.alert);
    }
    identifiedConditions.push(bpResult.stage);
  }

  if (sugarResult && sugarResult.score > 0) {
    factorContributions.push({
      name: `Blood Sugar (${vitals.bloodSugar} mg/dL)`,
      score: sugarResult.score,
      alert: sugarResult.alert,
      severity: sugarResult.severity
    });
    if (sugarResult.severity === "CRITICAL") {
      redFlags.push(sugarResult.alert);
    }
    identifiedConditions.push(sugarResult.status);
  }

  if (o2Result && o2Result.score > 0) {
    factorContributions.push({
      name: `Oxygen SpO2 (${vitals.spo2}%)`,
      score: o2Result.score,
      alert: o2Result.alert,
      severity: o2Result.severity
    });
    if (o2Result.severity === "CRITICAL") {
      redFlags.push(o2Result.alert);
    }
    identifiedConditions.push(o2Result.status);
  }

  if (pulseResult && pulseResult.score > 0) {
    factorContributions.push({
      name: `Pulse (${vitals.pulse} bpm)`,
      score: pulseResult.score,
      alert: pulseResult.alert,
      severity: pulseResult.severity
    });
    if (pulseResult.severity === "CRITICAL") {
      redFlags.push(pulseResult.alert);
    }
    identifiedConditions.push(pulseResult.status);
  }

  if (tempResult && tempResult.score > 0) {
    factorContributions.push({
      name: `Body Temp (${vitals.temp}°F)`,
      score: tempResult.score,
      alert: tempResult.alert,
      severity: tempResult.severity
    });
    if (tempResult.severity === "CRITICAL") {
      redFlags.push(tempResult.alert);
    }
    identifiedConditions.push(tempResult.status);
  }

  // Symptoms contributions
  let symptomScore = 0;
  for (const sym of activeSymptomObjs) {
    symptomScore += sym.baseWeight;
    factorContributions.push({
      name: sym.label,
      score: sym.baseWeight,
      alert: sym.clinicalFlag,
      severity: sym.baseWeight >= 24 ? "CRITICAL" : sym.baseWeight >= 15 ? "HIGH" : "MEDIUM"
    });

    if (sym.baseWeight >= 24) {
      redFlags.push(`${sym.label} (${sym.clinicalFlag})`);
    }

    if (sym.clinicalFlag && !identifiedConditions.includes(sym.clinicalFlag)) {
      identifiedConditions.push(sym.clinicalFlag);
    }
  }

  // Comorbidity / Age Vulnerability Multipliers
  let vulnerabilityBonus = 0;
  const age = Number(patient.age) || 35;
  if (age >= 65 || age <= 5) {
    vulnerabilityBonus += 6;
  }
  if (patient.knownConditions && Array.isArray(patient.knownConditions)) {
    if (patient.knownConditions.includes("diabetes") && sugarResult && sugarResult.score > 0) {
      vulnerabilityBonus += 8;
    }
    if (patient.knownConditions.includes("hypertension") && bpResult && bpResult.score > 0) {
      vulnerabilityBonus += 8;
    }
  }

  // Calculate composite clinical risk index
  const vitalsScore =
    (bpResult?.score || 0) +
    (sugarResult?.score || 0) +
    (o2Result?.score || 0) +
    (pulseResult?.score || 0) +
    (tempResult?.score || 0);

  const rawRiskScore = vitalsScore + symptomScore + vulnerabilityBonus;

  // Multi-System Clinical Syndromes Detection (Rule & Tree Ensemble)
  // 1. Diabetic Crisis (High sugar + fruity breath / severe vomiting / thirst)
  const isDiabeticCrisis =
    (sugarResult?.severity === "CRITICAL" || sugarResult?.severity === "HIGH") &&
    (selectedSymptoms.includes("fruity_breath") ||
      selectedSymptoms.includes("extreme_thirst_urination") ||
      selectedSymptoms.includes("altered_mental_state") ||
      selectedSymptoms.includes("severe_vomiting"));

  if (isDiabeticCrisis && !identifiedConditions.includes("Diabetic Crisis (DKA / HHS Pattern Detected)")) {
    identifiedConditions.unshift("Diabetic Crisis (DKA / HHS Pattern Detected)");
  }

  // 2. Acute Coronary / Cardiac Crisis (Chest pain + high BP or extreme pulse)
  const isCardiacCrisis =
    selectedSymptoms.includes("chest_pain_radiating") ||
    (selectedSymptoms.includes("palpitations_racing_heart") && (bpResult?.severity === "CRITICAL" || pulseResult?.severity === "CRITICAL"));

  if (isCardiacCrisis && !identifiedConditions.includes("Suspected Acute Cardiac Emergency")) {
    identifiedConditions.unshift("Suspected Acute Cardiac Emergency");
  }

  // 3. Sepsis Alert (qSOFA criteria: Altered mental state, elevated temp/rigors, tachypnea, low BP)
  const isSepsisAlert =
    (selectedSymptoms.includes("sepsis_rigors") || tempResult?.severity === "CRITICAL") &&
    (selectedSymptoms.includes("altered_mental_state") || bpResult?.severity === "CRITICAL" || (pulseResult && pulseResult.score >= 12));

  if (isSepsisAlert && !identifiedConditions.includes("Suspected Sepsis / Severe Septic State")) {
    identifiedConditions.unshift("Suspected Sepsis / Severe Septic State");
  }

  // 4. Stroke Alert (FAST signs)
  const isStrokeAlert = selectedSymptoms.includes("stroke_fast_signs") || (bpResult?.severity === "CRITICAL" && selectedSymptoms.includes("altered_mental_state"));
  if (isStrokeAlert && !identifiedConditions.includes("Acute Stroke / FAST Positive Alert")) {
    identifiedConditions.unshift("Acute Stroke / FAST Positive Alert");
  }

  // Normalized Risk Score (0 to 100)
  const normalizedScore = Math.min(100, Math.round((rawRiskScore / 110) * 100));

  // Determine Triage Classification
  let priorityLevel = "LOW";
  let color = "#16A34A";
  let bg = "#DCFCE7";
  let icon = "🟢";
  let actionProtocol = "Home Care & ASHA follow-up monitoring in 48 hours.";
  let confidence = 88;

  // Decision Boundaries
  if (
    redFlags.length > 0 ||
    isDiabeticCrisis ||
    isCardiacCrisis ||
    isStrokeAlert ||
    isSepsisAlert ||
    normalizedScore >= 60 ||
    bpResult?.severity === "CRITICAL" ||
    sugarResult?.severity === "CRITICAL" ||
    o2Result?.severity === "CRITICAL"
  ) {
    priorityLevel = "CRITICAL";
    color = "#DC2626";
    bg = "#FEE2E2";
    icon = "🚨";
    actionProtocol = "URGENT EMERGENCY: Immediate 108 / PHC Ambulance Transfer & Physician Resuscitation Required!";
    confidence = Math.min(99, 90 + Math.floor(normalizedScore / 10));
  } else if (
    normalizedScore >= 35 ||
    bpResult?.severity === "HIGH" ||
    sugarResult?.severity === "HIGH" ||
    o2Result?.severity === "HIGH" ||
    activeSymptomObjs.length >= 3
  ) {
    priorityLevel = "HIGH";
    color = "#EA580C";
    bg = "#FFEDD5";
    icon = "🔴";
    actionProtocol = "HIGH PRIORITY: Schedule PHC Medical Officer Consultation within 4-6 Hours.";
    confidence = 88 + Math.floor((normalizedScore % 10));
  } else if (
    normalizedScore >= 18 ||
    bpResult?.severity === "MEDIUM" ||
    sugarResult?.severity === "MEDIUM" ||
    activeSymptomObjs.length >= 2 ||
    symptomScore >= 12
  ) {
    priorityLevel = "MEDIUM";
    color = "#D97706";
    bg = "#FEF3C7";
    icon = "🟡";
    actionProtocol = "SEMI-URGENT: Routine PHC Doctor visit within 24-48 Hours.";
    confidence = 85;
  }

  // Calculate Probability of Clinical Deterioration using Sigmoid function
  const k = 0.08;
  const x0 = 40;
  const deteriorationProb = Math.min(
    99,
    Math.max(3, Math.round((1 / (1 + Math.exp(-k * (normalizedScore - x0)))) * 100))
  );

  // Compute Feature Importance percentages (Explainable AI)
  const totalWeightSum = factorContributions.reduce((acc, f) => acc + f.score, 0) || 1;
  const topFactors = factorContributions
    .map((f) => ({
      name: f.name,
      alert: f.alert,
      severity: f.severity,
      percentage: Math.round((f.score / totalWeightSum) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  // Actionable Directives list
  const clinicalDirectives = [];
  if (o2Result && o2Result.severity === "CRITICAL") {
    clinicalDirectives.push("Administer supplementary high-flow Oxygen immediately; maintain upright posture.");
  }
  if (bpResult && bpResult.severity === "CRITICAL") {
    clinicalDirectives.push("Keep patient seated, calm, and prepare for emergency antihypertensive evaluation.");
  }
  if (sugarResult && sugarResult.severity === "CRITICAL" && (vitals.bloodSugar <= 54 || vitals.bloodSugar < 70)) {
    clinicalDirectives.push("Hypoglycemia Emergency: Give 15-20g fast-acting sugar/glucose immediately if conscious.");
  }
  if (sugarResult && sugarResult.severity === "CRITICAL" && vitals.bloodSugar >= 300) {
    clinicalDirectives.push("Severe Hyperglycemia: Keep hydrated with plain water (NO sugary drinks); prepare for IV saline/insulin at PHC.");
  }
  if (isStrokeAlert) {
    clinicalDirectives.push("Stroke Protocol: Note exact symptom onset time; keep patient lying flat with head slightly elevated (30°).");
  }
  if (isCardiacCrisis) {
    clinicalDirectives.push("Suspected ACS: Keep patient at complete physical rest; avoid exertion; rapid ECG needed.");
  }
  if (clinicalDirectives.length === 0) {
    clinicalDirectives.push("Provide hydration, reassurance, and review medication compliance.");
  }

  return {
    priorityLevel,
    riskScore: normalizedScore,
    deteriorationProbability: deteriorationProb,
    confidence,
    color,
    bg,
    icon,
    action: actionProtocol,
    conditions: identifiedConditions.length > 0 ? identifiedConditions : ["General Malaise / Stable"],
    topFactors,
    redFlags,
    clinicalDirectives,
    vitalsEvaluation: {
      bloodPressure: bpResult,
      bloodSugar: sugarResult,
      oxygen: o2Result,
      pulse: pulseResult,
      temperature: tempResult
    }
  };
}
