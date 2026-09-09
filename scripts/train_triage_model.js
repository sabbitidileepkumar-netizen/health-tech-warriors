import { runClinicalMLTriage } from '../src/mlTriageEngine.js';

console.log('================================================================');
console.log('  RUNNING CLINICAL ML TRIAGE ENGINE BENCHMARKS & VERIFICATION   ');
console.log('================================================================\n');

const testCases = [
  {
    name: "Scenario 1: Diabetic Crisis / DKA Pattern",
    patient: { age: 48, gender: "Female", knownConditions: ["diabetes"] },
    vitals: {
      systolicBP: 135,
      diastolicBP: 85,
      bloodSugar: 360,
      sugarState: "random",
      spo2: 96,
      pulse: 104,
      temp: 99.1
    },
    symptoms: ["fruity_breath", "extreme_thirst_urination", "severe_vomiting"],
    expectedPriority: "CRITICAL",
    expectedCondition: "Diabetic Crisis (DKA / HHS Pattern Detected)"
  },
  {
    name: "Scenario 2: Hypertensive Crisis / Stroke Risk",
    patient: { age: 62, gender: "Male", knownConditions: ["hypertension"] },
    vitals: {
      systolicBP: 195,
      diastolicBP: 122,
      bloodSugar: 130,
      sugarState: "random",
      spo2: 95,
      pulse: 92,
      temp: 98.6
    },
    symptoms: ["thunderclap_headache", "sudden_blurred_vision"],
    expectedPriority: "CRITICAL",
    expectedCondition: "Hypertensive Crisis (Emergency)"
  },
  {
    name: "Scenario 3: Severe Acute Hypoxemia & Respiratory Failure",
    patient: { age: 55, gender: "Male", knownConditions: ["asthma"] },
    vitals: {
      systolicBP: 130,
      diastolicBP: 82,
      bloodSugar: 110,
      sugarState: "random",
      spo2: 85,
      pulse: 118,
      temp: 98.4
    },
    symptoms: ["severe_breathlessness", "wheezing_stridor"],
    expectedPriority: "CRITICAL",
    expectedCondition: "Severe Hypoxemia"
  },
  {
    name: "Scenario 4: Severe Sepsis / Febrile Crisis",
    patient: { age: 70, gender: "Female", knownConditions: [] },
    vitals: {
      systolicBP: 85,
      diastolicBP: 55,
      bloodSugar: 115,
      sugarState: "random",
      spo2: 91,
      pulse: 126,
      temp: 103.8
    },
    symptoms: ["sepsis_rigors", "altered_mental_state"],
    expectedPriority: "CRITICAL",
    expectedCondition: "Suspected Sepsis / Severe Septic State"
  },
  {
    name: "Scenario 5: Acute Hypoglycemia Shock Danger",
    patient: { age: 40, gender: "Male", knownConditions: ["diabetes"] },
    vitals: {
      systolicBP: 115,
      diastolicBP: 75,
      bloodSugar: 48,
      sugarState: "fasting",
      spo2: 98,
      pulse: 110,
      temp: 97.8
    },
    symptoms: ["shakiness_sweating"],
    expectedPriority: "CRITICAL",
    expectedCondition: "Severe Hypoglycemia (Shock Danger)"
  },
  {
    name: "Scenario 6: Stage 2 Hypertension (Urgent PHC Review)",
    patient: { age: 50, gender: "Female", knownConditions: [] },
    vitals: {
      systolicBP: 155,
      diastolicBP: 96,
      bloodSugar: 120,
      sugarState: "random",
      spo2: 98,
      pulse: 78,
      temp: 98.6
    },
    symptoms: [],
    expectedPriority: "HIGH",
    expectedCondition: "Stage 2 Hypertension"
  },
  {
    name: "Scenario 7: Routine Checkup / Minor Cough (Stable Low Risk)",
    patient: { age: 28, gender: "Male", knownConditions: [] },
    vitals: {
      systolicBP: 118,
      diastolicBP: 76,
      bloodSugar: 92,
      sugarState: "fasting",
      spo2: 99,
      pulse: 72,
      temp: 98.4
    },
    symptoms: ["persistent_cough"],
    expectedPriority: "LOW",
    expectedCondition: null
  }
];

let passed = 0;
let total = testCases.length;

testCases.forEach((tc, idx) => {
  console.log(`[Test ${idx + 1}] ${tc.name}`);
  const res = runClinicalMLTriage({
    vitals: tc.vitals,
    selectedSymptoms: tc.symptoms,
    patient: tc.patient
  });

  const priorityOk = res.priorityLevel === tc.expectedPriority;
  const conditionOk = !tc.expectedCondition || res.conditions.some(c => c.toLowerCase().includes(tc.expectedCondition.toLowerCase()));

  console.log(`  -> Priority: ${res.priorityLevel} (Expected: ${tc.expectedPriority}) [${priorityOk ? 'PASS' : 'FAIL'}]`);
  console.log(`  -> Risk Score: ${res.riskScore}/100 | Deterioration Probability: ${res.deteriorationProbability}%`);
  console.log(`  -> Top Conditions: ${res.conditions.slice(0, 2).join('; ')}`);
  console.log(`  -> Top Factors: ${res.topFactors.map(f => `${f.name} (${f.percentage}%)`).join(', ')}`);
  console.log(`  -> Action: ${res.action.slice(0, 60)}...`);

  if (priorityOk && conditionOk) {
    passed++;
    console.log('  STATUS: PASSED\n');
  } else {
    console.error('  STATUS: FAILED\n');
  }
});

console.log(`----------------------------------------------------------------`);
console.log(`BENCHMARK SUMMARY: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}% Accuracy)`);
console.log(`================================================================`);

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
