// Standards-shaped export for SIH demonstration. It produces a FHIR R4 Bundle
// locally and does not claim a live ABDM/ABHA connection.
const resource = (resourceType, body) => ({ resourceType, ...body });
const entry = (item) => ({ resource: item });

export function buildPatientBundle({ patient, triage = [], referrals = [], appointments = [], diagnostics = [], medicines = [] }) {
  const patientRef = `Patient/${patient.id || patient.uid || "local"}`;
  const bundle = [entry(resource("Patient", {
    id: patient.id || patient.uid || "local",
    name: [{ text: patient.name || "Unknown" }],
    telecom: patient.phone ? [{ system: "phone", value: patient.phone }] : [],
    address: patient.village ? [{ text: patient.village }] : []
  }))];
  triage.forEach((item) => bundle.push(entry(resource("Observation", {
    status: "final", subject: { reference: patientRef }, effectiveDateTime: item.timestamp,
    code: { text: "Community triage assessment" }, valueString: `${item.priorityLevel || "ROUTINE"}: ${(item.symptoms || []).join(", ")}`
  }))));
  referrals.forEach((item) => bundle.push(entry(resource("ServiceRequest", {
    status: item.status === "Completed" ? "completed" : "active", subject: { reference: patientRef },
    code: { text: item.reason || "Hospital referral" }, performer: item.facility ? [{ display: item.facility }] : []
  }))));
  appointments.forEach((item) => bundle.push(entry(resource("Appointment", {
    status: item.status === "CANCELLED" ? "cancelled" : "booked", participant: [{ actor: { reference: patientRef }, status: "accepted" }],
    start: item.appointmentDate ? `${item.appointmentDate}T${item.appointmentTime || "00:00"}:00` : undefined,
    description: `${item.facility || "Facility"}${item.queueToken ? ` · Token ${item.queueToken}` : ""}`
  }))));
  diagnostics.forEach((item) => bundle.push(entry(resource("ServiceRequest", {
    status: item.status === "RESULT_READY" ? "completed" : "active", subject: { reference: patientRef }, code: { text: item.testType },
    occurrenceDateTime: item.preferredDate, performer: item.facility ? [{ display: item.facility }] : []
  }))));
  medicines.forEach((item) => bundle.push(entry(resource("MedicationRequest", {
    status: item.active === false ? "stopped" : "active", intent: "order", subject: { reference: patientRef },
    medicationCodeableConcept: { text: item.medicine }, dosageInstruction: [{ text: item.timing }]
  }))));
  return { resourceType: "Bundle", type: "collection", timestamp: new Date().toISOString(), entry: bundle };
}

export function downloadJson(filename, value) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/fhir+json" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}
