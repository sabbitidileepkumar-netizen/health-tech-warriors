// Centralized Data Layer for CareLink (Firestore real-time + local cache + full 3-role data flow)
import { db } from './firebase.js';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { saveWithOfflineSupport, updateWithOfflineSupport } from './offlineSync.js';
import { resolveFacility } from './facilityRegistry.js';

const INITIAL_DATA = {
  users: [],
  patients: [],
  triage_records: [],
  referrals: [],
  blood_donors: [],
  medicine_reminders: [],
  village_outbreaks: [],
  child_vaccines: [],
  venom_stocks: [],
  venom_incidents: [],
  supply_inventory: [],
  schedules: [],
  campaigns: [],
  alerts: [],
  outbreak_reports: [],
  notifications: [],
  audit_logs: [],
  appointments: [],
  teleconsultations: [],
  diagnostic_requests: [],
  emergency_cases: [],
  disaster_status: { active: false, alertTitle: '', floodLevel: '', affectedZones: [], shelters: [] },
  weather_intelligence: { region: '', temp: '', humidity: '', forecast: '', floodRisk: '', seasonalAlerts: [] }
};

export function initStore() {
  for (const [key, initialValue] of Object.entries(INITIAL_DATA)) {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('carelink_' + key)) {
      localStorage.setItem('carelink_' + key, JSON.stringify(initialValue));
    }
  }
  initDemoDatabase();
}

export function resetToDefaults() {
  if (typeof localStorage !== 'undefined') {
    for (const [key, initialValue] of Object.entries(INITIAL_DATA)) {
      localStorage.setItem('carelink_' + key, JSON.stringify(initialValue));
    }
  }
}

export function getLocal(key) {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('carelink_' + key) : null;
    return raw ? JSON.parse(raw) : INITIAL_DATA[key] || [];
  } catch (_e) {
    return INITIAL_DATA[key] || [];
  }
}

export function saveLocal(key, data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('carelink_' + key, JSON.stringify(data));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('carelink_' + key + '_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('carelink_store_updated', { detail: { key, data } }));
      }
    }
  } catch (e) {
    console.error('Error saving to local storage', e);
  }
}

// Real-time subscription — get LIVE updates from Firestore with local fallback
export function subscribeToCollection(collectionName, callback) {
  try {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const existingLocal = getLocal(collectionName);

        if (items.length === 0 && existingLocal.length > 0 && snapshot.metadata.fromCache) {
          callback(existingLocal);
          return;
        }

        // Merge and deduplicate by ID
        const mergedMap = new Map();
        items.forEach((item) => mergedMap.set(item.id, item));
        // Keep pending optimistic items
        existingLocal
          .filter((it) => it._pendingSync)
          .forEach((pending) => {
            if (!mergedMap.has(pending.id)) mergedMap.set(pending.id, pending);
          });

        const merged = Array.from(mergedMap.values());
        saveLocal(collectionName, merged);
        callback(merged);
      },
      (error) => {
        console.warn(`Firestore subscription fallback for ${collectionName}:`, error.message);
        callback(getLocal(collectionName));
      }
    );
    return unsubscribe;
  } catch (_err) {
    console.warn(`Firestore unavailable for ${collectionName}, using local cache`);
    callback(getLocal(collectionName));
    return () => {};
  }
}

// === USER PROFILES & ROLES ===

export async function saveUserProfile(uid, profileData) {
  const users = getLocal('users');
  const existingIdx = users.findIndex((u) => u.uid === uid || u.id === uid);
  const updatedUser = {
    id: uid,
    uid,
    ...profileData,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...updatedUser };
  } else {
    users.unshift(updatedUser);
  }
  saveLocal('users', users);

  try {
    await setDoc(doc(db, 'users', uid), {
      ...updatedUser,
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not sync user profile to cloud:', err.message);
  }
  return updatedUser;
}

export async function getUserProfile(uid) {
  const users = getLocal('users');
  const local = users.find((u) => u.uid === uid || u.id === uid);
  if (local) return local;

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() };
      users.unshift(data);
      saveLocal('users', users);
      return data;
    }
  } catch (err) {
    console.warn('Error reading user profile from Firestore:', err.message);
  }
  return null;
}

// === SCHEDULES (HIGHER AUTHORITY -> ASHA WORKER) ===

export async function addSchedule(scheduleData) {
  const record = {
    ...scheduleData,
    status: scheduleData.status || 'PUBLISHED',
    createdAt: new Date().toISOString()
  };

  const res = await saveWithOfflineSupport('schedules', record, 'schedules');

  // Trigger notification to assigned ASHA worker
  if (scheduleData.assignedAshaId) {
    await addNotification({
      recipientId: scheduleData.assignedAshaId,
      recipientRole: 'ASHA_WORKER',
      title: 'New Schedule Assigned: ' + scheduleData.title,
      message: `Village: ${scheduleData.village} on ${scheduleData.date} (${scheduleData.time}). Priority: ${scheduleData.priority}`,
      type: 'SCHEDULE',
      linkScreen: 'schedules',
      relatedRecordId: res.id
    });
  }

  await addAuditLog(
    scheduleData.createdByName || 'Higher Authority',
    'PUBLISH_SCHEDULE',
    `Published schedule '${scheduleData.title}' for ${scheduleData.village} assigned to ${scheduleData.assignedAshaName || 'ASHA'}`
  );

  return res;
}

export async function updateScheduleStatus(scheduleId, nextStatus, extraData = {}) {
  const schedules = getLocal('schedules');
  const target = schedules.find((s) => s.id === scheduleId);
  const updatedSchedules = schedules.map((s) => {
    if (s.id === scheduleId) {
      return {
        ...s,
        status: nextStatus,
        ...extraData,
        updatedAt: new Date().toISOString(),
        ...(nextStatus === 'COMPLETED' ? { completedAt: new Date().toLocaleTimeString() } : {})
      };
    }
    return s;
  });
  saveLocal('schedules', updatedSchedules);

  try {
    const ref = doc(db, 'schedules', scheduleId);
    await updateDoc(ref, {
      status: nextStatus,
      ...extraData,
      ...(nextStatus === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {})
    });
  } catch (err) {
    console.warn('Could not update schedule status in cloud:', err.message);
  }

  if (target) {
    // Notify Higher Authority when schedule is completed or in progress
    if (nextStatus === 'COMPLETED') {
      await addNotification({
        recipientRole: 'HIGHER_AUTHORITY',
        title: 'Schedule Completed: ' + target.title,
        message: `${target.assignedAshaName || 'ASHA'} completed task in ${target.village}. Citizens covered: ${extraData.citizensCovered || 'Recorded'}.`,
        type: 'SCHEDULE_COMPLETE',
        linkScreen: 'schedules',
        relatedRecordId: scheduleId
      });

      await addAuditLog(
        target.assignedAshaName || 'ASHA Worker',
        'COMPLETE_SCHEDULE',
        `Completed schedule '${target.title}' in ${target.village}. Covered: ${extraData.citizensCovered || 'N/A'}`
      );
    }
  }

  return updatedSchedules;
}

// === HEALTH CAMPAIGNS (HIGHER AUTHORITY) ===

export async function addCampaign(campaignData) {
  const record = {
    ...campaignData,
    status: campaignData.status || 'ACTIVE',
    createdAt: new Date().toISOString()
  };
  const res = await saveWithOfflineSupport('campaigns', record, 'campaigns');

  await addNotification({
    recipientRole: 'BOTH',
    title: 'New District Campaign: ' + campaignData.title,
    message: `Targeting: ${campaignData.targetVillages?.join(', ') || 'All Villages'}. Date: ${campaignData.date}.`,
    type: 'CAMPAIGN',
    linkScreen: 'campaigns',
    relatedRecordId: res.id
  });

  await addAuditLog(
    'Higher Authority',
    'CREATE_CAMPAIGN',
    `Launched district campaign '${campaignData.title}'`
  );

  return res;
}

// === PUBLIC & DISASTER ALERTS (HIGHER AUTHORITY -> CITIZEN & ASHA) ===

export async function addAlert(alertData) {
  const record = {
    ...alertData,
    active: true,
    createdAt: new Date().toISOString()
  };
  const res = await saveWithOfflineSupport('alerts', record, 'alerts');

  // Push targeted notification
  await addNotification({
    recipientRole: alertData.audience || 'BOTH',
    title: `🚨 ${alertData.severity || 'HIGH'} ALERT: ${alertData.title}`,
    message: alertData.message,
    type: 'ALERT',
    linkScreen: 'alerts',
    relatedRecordId: res.id
  });

  await addAuditLog(
    'Higher Authority',
    'BROADCAST_ALERT',
    `Broadcasted ${alertData.type} alert: '${alertData.title}' to ${alertData.targetVillages?.join(', ') || 'All'}`
  );

  return res;
}

export async function toggleAlertActive(alertId, active) {
  const alerts = getLocal('alerts');
  const updated = alerts.map((a) => (a.id === alertId ? { ...a, active } : a));
  saveLocal('alerts', updated);

  try {
    const ref = doc(db, 'alerts', alertId);
    await updateDoc(ref, { active });
  } catch (err) {
    console.warn('Error updating alert status:', err.message);
  }
  return updated;
}

// === VILLAGE OUTBREAK REPORTING (ASHA -> HIGHER AUTHORITY) ===

export async function addOutbreakReport(reportData) {
  const record = {
    ...reportData,
    status: 'REPORTED',
    createdAt: new Date().toISOString()
  };
  const res = await saveWithOfflineSupport('outbreak_reports', record, 'outbreak_reports');

  // Also increment village outbreak tracker
  incrementVillageCase(reportData.village, [reportData.condition || 'Reported Outbreak']);

  // Notify Higher Authority
  await addNotification({
    recipientRole: 'HIGHER_AUTHORITY',
    title: `🚨 Outbreak Warning: ${reportData.village}`,
    message: `${reportData.affectedCount} cases of ${reportData.condition} reported by ${reportData.reportedByAshaName || 'ASHA Worker'}.`,
    type: 'OUTBREAK',
    linkScreen: 'outbreaks',
    relatedRecordId: res.id
  });

  await addAuditLog(
    reportData.reportedByAshaName || 'ASHA Worker',
    'SUBMIT_OUTBREAK_REPORT',
    `Reported outbreak in ${reportData.village}: ${reportData.affectedCount} cases of ${reportData.condition}`
  );

  return res;
}

export async function updateOutbreakStatus(reportId, status, extraData = {}) {
  const list = getLocal('outbreak_reports');
  const updated = list.map((r) => (r.id === reportId ? { ...r, status, ...extraData } : r));
  saveLocal('outbreak_reports', updated);

  try {
    const ref = doc(db, 'outbreak_reports', reportId);
    await updateDoc(ref, { status, ...extraData });
  } catch (err) {
    console.warn('Error updating outbreak status:', err.message);
  }

  await addAuditLog('Higher Authority', 'UPDATE_OUTBREAK_STATUS', `Outbreak report ${reportId} marked as ${status}`);
  return updated;
}

// === NOTIFICATIONS ===

export async function addNotification(notifData) {
  const newNotif = {
    id: 'n_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    isRead: false,
    createdAt: new Date().toISOString(),
    ...notifData
  };
  const list = getLocal('notifications');
  list.unshift(newNotif);
  saveLocal('notifications', list);

  try {
    await addDoc(collection(db, 'notifications'), {
      ...newNotif,
      createdAt: serverTimestamp()
    });
  } catch (_e) {
    // cached locally
  }
  return newNotif;
}

export async function markNotificationRead(notifId) {
  const list = getLocal('notifications');
  const updated = list.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
  saveLocal('notifications', updated);

  try {
    const ref = doc(db, 'notifications', notifId);
    await updateDoc(ref, { isRead: true });
  } catch (_e) {}
  return updated;
}

// === AUDIT LOGGING ===

export async function addAuditLog(actor, action, details) {
  const newLog = {
    id: 'log_' + Date.now(),
    actor,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  const logs = getLocal('audit_logs');
  logs.unshift(newLog);
  if (logs.length > 200) logs.pop();
  saveLocal('audit_logs', logs);

  try {
    await addDoc(collection(db, 'audit_logs'), {
      ...newLog,
      createdAt: serverTimestamp()
    });
  } catch (_e) {}
  return newLog;
}

// === PATIENTS & CITIZENS ===

export async function addPatient(patient) {
  const res = await saveWithOfflineSupport('patients', patient, 'patients');
  await addAuditLog(
    patient.registeredBy || 'ASHA Worker',
    'REGISTER_PATIENT',
    `Registered citizen ${patient.name} (${patient.age}y, ${patient.village})`
  );
  return res;
}

// === TRIAGE RECORDS ===

export async function addTriageRecord(record) {
  const result = await saveWithOfflineSupport(
    'triage_records',
    { ...record, timestamp: new Date().toISOString() },
    'triage_records'
  );

  if (record.village) {
    incrementVillageCase(record.village, record.symptoms);
  }

  // If Critical, notify Authority and dispatch emergency alert
  if (record.priorityLevel === 'CRITICAL') {
    await addNotification({
      recipientRole: 'HIGHER_AUTHORITY',
      title: `🚨 CRITICAL Triage Alert: ${record.patientName}`,
      message: `Severe vitals/symptoms in ${record.village}. Deterioration risk: ${record.deteriorationProbability || 95}%. Immediate care required.`,
      type: 'CRITICAL_TRIAGE',
      linkScreen: 'queue',
      relatedRecordId: result.id
    });
  }

  // Notify the citizen that their triage record has been updated by ASHA
  if (record.patientName) {
    await addNotification({
      recipientRole: 'CITIZEN',
      recipientName: record.patientName,
      title: 'Clinical Assessment Recorded',
      message: `Your health triage assessment was completed by ASHA. Priority: ${record.priorityLevel}. Review directives in your portal.`,
      type: 'TRIAGE_UPDATE',
      linkScreen: 'records',
      relatedRecordId: result.id
    });
  }

  await addAuditLog(
    record.ashaName || 'ASHA Worker',
    'CLINICAL_TRIAGE',
    `Triaged ${record.patientName} (${record.village}) -> Priority: ${record.priorityLevel}`
  );

  return result;
}

// === REFERRALS ===

export async function addReferral(refData) {
  const routed = resolveFacility(refData);
  const record = {
    ...refData,
    facilityId: refData.facilityId || routed.id,
    facility: refData.facility || routed.name,
    status: refData.status || 'Referred',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const res = await saveWithOfflineSupport('referrals', record, 'referrals');

  // Notify citizen about referral
  await addNotification({
    recipientRole: 'CITIZEN',
    recipientName: refData.patientName,
    title: 'Hospital Referral Generated',
    message: `You have been referred to ${refData.facility || refData.referredTo} for '${refData.reason || refData.chiefComplaint}'. Ambulance: ${refData.ambulanceDispatched ? 'Dispatched' : 'Not required'}.`,
    type: 'REFERRAL',
    linkScreen: 'referrals',
    relatedRecordId: res.id
  });

  await addAuditLog(
    refData.ashaName || 'ASHA Worker',
    'CREATE_REFERRAL',
    `Referred ${refData.patientName} to ${refData.facility || refData.referredTo}`
  );

  if (refData.ambulanceDispatched) {
    await createEmergencyCase({ ...record, referralId: res.id, source: 'ASHA_REFERRAL', reason: refData.reason || refData.chiefComplaint || 'Urgent referral' });
  }

  return res;
}

export function updateReferralStatus(id, nextStatus) {
  const list = getLocal('referrals');
  let target = null;
  const updated = list.map((item) => {
    if (item.id === id) {
      target = { ...item, status: nextStatus, updatedAt: new Date().toISOString() };
      return target;
    }
    return item;
  });
  saveLocal('referrals', updated);

  try {
    const ref = doc(db, 'referrals', id);
    updateDoc(ref, { status: nextStatus, updatedAt: new Date().toISOString() });
  } catch (_e) {}

  if (target) {
    addNotification({
      recipientRole: 'CITIZEN',
      recipientName: target.patientName,
      title: 'Referral Status Updated',
      message: `Your referral to ${target.facility} status is now: ${nextStatus}.`,
      type: 'REFERRAL_UPDATE',
      linkScreen: 'referrals',
      relatedRecordId: id
    });
    addAuditLog('Medical Desk / ASHA', 'UPDATE_REFERRAL_STATUS', `Referral for ${target.patientName} changed to ${nextStatus}`);
  }

  return updated;
}

// === CARE COORDINATION ===
// These collections are deliberately separate from referrals so a routine
// appointment, diagnostic test, and remote consultation can have their own
// lifecycle while still being linked by patientId/patientName.

export async function createAppointment(appointmentData) {
  const routed = resolveFacility(appointmentData);
  const record = {
    ...appointmentData,
    facilityId: appointmentData.facilityId || routed.id,
    facility: appointmentData.facility || routed.name,
    status: appointmentData.status || 'REQUESTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const result = await saveWithOfflineSupport('appointments', record, 'appointments');

  await addNotification({
    recipientRole: 'ASHA_WORKER',
    recipientId: appointmentData.assignedAshaId,
    title: 'New appointment request',
    message: `${appointmentData.patientName} requested ${appointmentData.appointmentType || 'a consultation'} at ${appointmentData.facility} on ${appointmentData.appointmentDate}.`,
    type: 'APPOINTMENT',
    linkScreen: 'care',
    relatedRecordId: result.id
  });
  await addAuditLog(appointmentData.patientName || 'Citizen', 'CREATE_APPOINTMENT', `Requested an appointment at ${appointmentData.facility}`);
  return result;
}

export async function updateAppointmentStatus(id, status) {
  await updateWithOfflineSupport('appointments', id, { status }, 'appointments');
  return status;
}

// A confirmed visit receives a simple, date-and-facility-specific token. This
// gives ASHA workers a usable queue for the demo and remains safe offline.
export async function confirmAppointment(id) {
  const appointments = getLocal('appointments');
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return null;
  const sameQueue = appointments.filter((item) =>
    item.id !== id &&
    item.facility === appointment.facility &&
    item.appointmentDate === appointment.appointmentDate &&
    item.status !== 'CANCELLED'
  );
  const queueToken = appointment.queueToken || sameQueue.reduce((highest, item) => Math.max(highest, Number(item.queueToken) || 0), 0) + 1;
  await updateWithOfflineSupport('appointments', id, { status: 'CONFIRMED', queueToken }, 'appointments');
  await addNotification({
    recipientId: appointment.patientId,
    recipientRole: 'CITIZEN',
    recipientName: appointment.patientName,
    title: 'Appointment confirmed',
    message: `Your appointment at ${appointment.facility} is confirmed. Queue token: ${queueToken}.`,
    type: 'APPOINTMENT_CONFIRMED',
    linkScreen: 'care',
    relatedRecordId: id
  });
  return queueToken;
}

export async function createTeleconsultation(consultationData) {
  const routed = resolveFacility(consultationData);
  const record = {
    ...consultationData,
    facilityId: consultationData.facilityId || routed.id,
    facility: consultationData.facility || routed.name,
    status: consultationData.status || 'REQUESTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const result = await saveWithOfflineSupport('teleconsultations', record, 'teleconsultations');

  await addNotification({
    recipientRole: 'ASHA_WORKER',
    recipientId: consultationData.assignedAshaId,
    title: 'New teleconsultation request',
    message: `${consultationData.patientName} requested a ${consultationData.mode?.toLowerCase() || 'remote'} consultation on ${consultationData.scheduledDate}.`,
    type: 'TELECONSULTATION',
    linkScreen: 'care',
    relatedRecordId: result.id
  });
  await addAuditLog(consultationData.patientName || 'Citizen', 'CREATE_TELECONSULTATION', `Requested ${consultationData.mode || 'remote'} consultation`);
  return result;
}

export async function updateTeleconsultationStatus(id, status) {
  await updateWithOfflineSupport('teleconsultations', id, { status }, 'teleconsultations');
  return status;
}

export async function createDiagnosticRequest(requestData) {
  const routed = resolveFacility(requestData);
  const record = {
    ...requestData,
    facilityId: requestData.facilityId || routed.id,
    facility: requestData.facility || routed.name,
    status: requestData.status || 'REQUESTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const result = await saveWithOfflineSupport('diagnostic_requests', record, 'diagnostic_requests');

  await addNotification({
    recipientRole: 'ASHA_WORKER',
    recipientId: requestData.assignedAshaId,
    title: 'New diagnostic request',
    message: `${requestData.patientName} requested ${requestData.testType} at ${requestData.facility}.`,
    type: 'DIAGNOSTIC_REQUEST',
    linkScreen: 'care',
    relatedRecordId: result.id
  });
  await addAuditLog(requestData.patientName || 'Citizen', 'CREATE_DIAGNOSTIC_REQUEST', `Requested ${requestData.testType}`);
  return result;
}

export async function updateDiagnosticRequestStatus(id, status) {
  await updateWithOfflineSupport('diagnostic_requests', id, { status }, 'diagnostic_requests');
  return status;
}

// Records a routed alert for the hospital desk. Official ambulance dispatch still
// happens through the 108 phone service; this is the product's coordination trail.
export async function createEmergencyCase(caseData) {
  const facility = resolveFacility(caseData);
  const record = {
    ...caseData,
    targetFacilityId: caseData.targetFacilityId || caseData.facilityId || facility.id,
    targetFacility: caseData.targetFacility || caseData.facility || facility.name,
    status: caseData.status || 'NEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const result = await saveWithOfflineSupport('emergency_cases', record, 'emergency_cases');
  await addNotification({ recipientRole: 'ASHA_WORKER', title: 'Emergency care-desk alert', message: `${record.patientName || 'A citizen'} has an emergency routed to ${record.targetFacility}.`, type: 'EMERGENCY', linkScreen: 'care', relatedRecordId: result.id });
  await addAuditLog(record.patientName || 'Citizen', 'CREATE_EMERGENCY_ALERT', `Emergency routed to ${record.targetFacility}`);
  return result;
}

export async function updateEmergencyCaseStatus(id, status) {
  const item = getLocal('emergency_cases').find((x) => x.id === id);
  await updateWithOfflineSupport('emergency_cases', id, { status }, 'emergency_cases');
  if (item) await addNotification({ recipientId: item.patientId, recipientRole: 'CITIZEN', recipientName: item.patientName, title: 'Emergency case update', message: `${item.targetFacility || 'The care desk'} marked your emergency case as ${status}. For immediate danger, call 108.`, type: 'EMERGENCY_UPDATE', linkScreen: 'home', relatedRecordId: id });
  return status;
}

// === CHILD VACCINE TRACKING ===

export function generateDefaultDoses() {
  return [
    { id: "d1", name: "BCG + OPV-0 + Hep B-0", duePeriod: "At Birth", status: "Upcoming", dateGiven: null },
    { id: "d2", name: "OPV-1 + Penta-1 + Rota-1", duePeriod: "6 Weeks", status: "Upcoming", dateGiven: null },
    { id: "d3", name: "OPV-2 + Penta-2 + Rota-2", duePeriod: "10 Weeks", status: "Upcoming", dateGiven: null },
    { id: "d4", name: "OPV-3 + Penta-3 + Rota-3", duePeriod: "14 Weeks", status: "Upcoming", dateGiven: null },
    { id: "d5", name: "Measles-Rubella (MR-1)", duePeriod: "9 Months", status: "Upcoming", dateGiven: null },
    { id: "d6", name: "DPT Booster + OPV Booster + MR-2", duePeriod: "16-24 Months", status: "Upcoming", dateGiven: null }
  ];
}

export function subscribeToChildVaccines(callback) {
  return subscribeToCollection("child_vaccines", callback);
}

export async function addChildVaccineRecord(child) {
  const doses = child.doses || generateDefaultDoses();
  const record = {
    ...child,
    doses,
    createdAt: new Date().toISOString()
  };

  const res = await saveWithOfflineSupport('child_vaccines', record, 'child_vaccines');
  return res;
}

export async function updateChildDoseStatusFirestore(childDocId, doseId, currentDoses, nextStatus) {
  const updatedDoses = currentDoses.map((d) =>
    d.id === doseId
      ? {
          ...d,
          status: nextStatus,
          dateGiven: nextStatus === "Completed" ? new Date().toISOString().split("T")[0] : null
        }
      : d
  );

  const list = getLocal('child_vaccines');
  let targetChild = null;
  const updatedList = list.map((c) => {
    if (c.id === childDocId) {
      targetChild = { ...c, doses: updatedDoses };
      return targetChild;
    }
    return c;
  });
  saveLocal('child_vaccines', updatedList);

  try {
    const ref = doc(db, "child_vaccines", childDocId);
    await updateDoc(ref, { doses: updatedDoses });
  } catch (err) {
    console.warn("Could not update dose in Firestore:", err.message);
  }

  if (targetChild && nextStatus === 'Completed') {
    const doseObj = updatedDoses.find((d) => d.id === doseId);
    await addNotification({
      recipientRole: 'CITIZEN',
      recipientName: targetChild.parentName || targetChild.childName,
      title: 'Vaccination Recorded',
      message: `Dose '${doseObj?.name}' successfully recorded for ${targetChild.childName}. Status: Completed.`,
      type: 'VACCINE_COMPLETED',
      linkScreen: 'polio',
      relatedRecordId: childDocId
    });

    await addAuditLog(
      'ASHA Worker',
      'ADMINISTER_VACCINE',
      `Marked dose '${doseObj?.name}' as Completed for ${targetChild.childName}`
    );
  }

  return updatedDoses;
}

// === MEDICINE REMINDERS & BLOOD DONORS ===

export function addMedicineReminder(rem) {
  const list = getLocal('medicine_reminders');
  const newRem = { id: 'm_' + Date.now(), ...rem, active: true, createdAt: new Date().toISOString() };
  list.unshift(newRem);
  saveLocal('medicine_reminders', list);
  return newRem;
}

export function addBloodDonor(donor) {
  const list = getLocal('blood_donors');
  const newDonor = { id: 'b_' + Date.now(), ...donor, status: 'Available', createdAt: new Date().toISOString() };
  list.unshift(newDonor);
  saveLocal('blood_donors', list);
  return newDonor;
}

export function reportVenomIncident(incident) {
  const list = getLocal('venom_incidents');
  const newInc = { id: 'vi_' + Date.now(), ...incident, timeAgo: 'Just now', createdAt: new Date().toISOString() };
  list.unshift(newInc);
  saveLocal('venom_incidents', list);
  return newInc;
}

export function toggleDisasterActive() {
  const current = getLocal('disaster_status');
  const updated = { ...current, active: !current.active };
  saveLocal('disaster_status', updated);
  return updated;
}

export function subscribeToSupplyInventory(callback) {
  callback(getLocal('supply_inventory'));
  const handler = () => {
    callback(getLocal('supply_inventory'));
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('carelink_supply_inventory_updated', handler);
  }
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('carelink_supply_inventory_updated', handler);
    }
  };
}

export function updateSupplyStock(id, newStock, actorName = 'Higher Authority') {
  const list = getLocal('supply_inventory');
  const target = list.find((item) => item.id === id);
  const updated = list.map((item) => {
    if (item.id === id) {
      const numStock = Math.max(0, Number(newStock));
      const status = numStock <= 0 ? 'Stockout' : numStock < item.minBuffer ? 'Low Stock' : 'Healthy';
      return {
        ...item,
        currentStock: numStock,
        status,
        lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    }
    return item;
  });
  saveLocal('supply_inventory', updated);

  if (target) {
    addAuditLog(
      actorName,
      'UPDATE_STOCK_QUANTITY',
      `Adjusted stock for ${target.name} at ${target.facility}: ${target.currentStock} -> ${newStock} (${target.unit})`
    ).catch(() => {});
  }

  return updated;
}

export async function addMedicineStock(medicineData) {
  const list = getLocal('supply_inventory');
  const currentStock = Number(medicineData.currentStock) || 0;
  const minBuffer = Number(medicineData.minBuffer) || 10;
  const status = currentStock <= 0 ? 'Stockout' : currentStock < minBuffer ? 'Low Stock' : 'Healthy';

  const newItem = {
    id: 'med_' + Date.now(),
    name: medicineData.name,
    category: medicineData.category || 'Lifeline Essential',
    priority: medicineData.priority || 'P1 - Critical',
    currentStock,
    minBuffer,
    incoming: Number(medicineData.incoming) || 0,
    unit: medicineData.unit || 'Doses',
    facility: medicineData.facility || 'Tanuku Government Area Hospital (AH Tanuku)',
    storageTemp: medicineData.storageTemp || 'Cold Chain (2-8°C)',
    batchNumber: medicineData.batchNumber || ('BATCH-' + Math.floor(1000 + Math.random() * 9000)),
    expiryDate: medicineData.expiryDate || '2027-12-31',
    status,
    notes: medicineData.notes || '',
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: new Date().toISOString()
  };

  list.unshift(newItem);
  saveLocal('supply_inventory', list);

  await addAuditLog(
    medicineData.createdByName || 'Higher Authority',
    'ADD_MEDICINE_STOCK',
    `Added new medicine to inventory: ${newItem.name} (${newItem.currentStock} ${newItem.unit}) at ${newItem.facility}`
  );

  return newItem;
}

export async function updateMedicineStockDetails(id, updates) {
  const list = getLocal('supply_inventory');
  const updated = list.map((item) => {
    if (item.id === id) {
      const currentStock = updates.currentStock !== undefined ? Math.max(0, Number(updates.currentStock)) : item.currentStock;
      const minBuffer = updates.minBuffer !== undefined ? Math.max(0, Number(updates.minBuffer)) : item.minBuffer;
      const status = currentStock <= 0 ? 'Stockout' : currentStock < minBuffer ? 'Low Stock' : 'Healthy';
      return {
        ...item,
        ...updates,
        currentStock,
        minBuffer,
        status,
        lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    }
    return item;
  });
  saveLocal('supply_inventory', updated);

  await addAuditLog(
    updates.updatedByName || 'Higher Authority',
    'EDIT_MEDICINE_DETAILS',
    `Updated medicine details for ID: ${id} (${updates.name || 'records'})`
  );

  return updated;
}

export async function deleteMedicineStock(id) {
  const list = getLocal('supply_inventory');
  const target = list.find((item) => item.id === id);
  const updated = list.filter((item) => item.id !== id);
  saveLocal('supply_inventory', updated);

  await addAuditLog(
    'Higher Authority',
    'DELETE_MEDICINE_STOCK',
    `Removed medicine stock: ${target?.name || id} from ${target?.facility || 'inventory'}`
  );

  return updated;
}

export async function addPolioScheduleCampaign(polioData) {
  // 1. Create schedule for ASHA workers in schedules collection
  const scheduleRecord = {
    title: polioData.title || 'Pulse Polio Immunization Drive',
    date: polioData.date,
    time: polioData.time || '08:00 AM - 04:00 PM',
    village: polioData.village,
    targetVillages: polioData.targetVillages || [polioData.village],
    assignedAshaId: polioData.assignedAshaId || 'ASHA-001',
    assignedAshaName: polioData.assignedAshaName || 'Rani Devi',
    task: 'Pulse Polio (bOPV) Drop Administration (Ages 0-5)',
    instructions: polioData.instructions || 'Maintain cold-chain (2-8°C) with vaccine carrier and ice packs. Check Vaccine Vial Monitor (VVM) indicator. Administer 2 oral drops to every child 0-5 yrs. Mark left pinky fingernail with indelible ink.',
    priority: 'Critical',
    isPolioDrive: true,
    boothVenue: polioData.boothVenue || 'Anganwadi Centre & Village Sub-Centre',
    targetChildren: Number(polioData.targetChildren) || 300,
    allocatedDoses: Number(polioData.allocatedDoses) || 350,
    dosesAdministered: 0,
    status: 'PUBLISHED',
    createdBy: polioData.createdBy || 'dr.k.v.rao@carelink.in',
    createdByName: polioData.createdByName || 'Dr. K.V. Rao (DM&HO)'
  };

  const scheduleRes = await addSchedule(scheduleRecord);

  // 2. Also register in campaigns collection
  const campaignRecord = {
    id: 'camp_polio_' + Date.now(),
    title: polioData.title || 'Pulse Polio Immunization Drive',
    target: 'Children 0-5 Years',
    targetVillages: polioData.targetVillages || [polioData.village],
    date: polioData.date,
    boothVenue: polioData.boothVenue || 'Anganwadi Centre & Village Sub-Centre',
    assignedAshaIds: [polioData.assignedAshaId || 'ASHA-001'],
    status: 'ACTIVE',
    isPolioDrive: true,
    metrics: {
      targetedChildren: Number(polioData.targetChildren) || 300,
      vaccinatedChildren: 0,
      allocatedDoses: Number(polioData.allocatedDoses) || 350
    },
    scheduleId: scheduleRes.id,
    createdAt: new Date().toISOString()
  };

  const campaigns = getLocal('campaigns');
  campaigns.unshift(campaignRecord);
  saveLocal('campaigns', campaigns);

  // 3. Broadcast Alert for citizens in target village
  await addAlert({
    title: `📢 Pulse Polio Drive: ${polioData.date}`,
    type: 'DISEASE',
    severity: 'HIGH',
    message: `Mandatory Pulse Polio drops scheduled on ${polioData.date} at ${polioData.boothVenue} (${polioData.village}). Protect every infant and child under 5!`,
    targetType: 'VILLAGE',
    targetVillages: [polioData.village],
    audience: 'BOTH',
    active: true
  });

  return { schedule: scheduleRes, campaign: campaignRecord };
}

export function incrementVillageCase(villageName, symptoms = []) {
  const list = getLocal('village_outbreaks');
  const existing = list.find((v) => v.village.toLowerCase() === villageName.toLowerCase());
  if (existing) {
    existing.cases += 1;
    if (existing.cases >= 100) {
      existing.hotspot = true;
      existing.riskLevel = 'EPIDEMIC ALERT (>100 CASES)';
    }
    existing.lastUpdated = 'Just now';
  } else {
    list.push({
      village: villageName,
      cases: 1,
      primaryCondition: symptoms[0] || 'Reported Illness',
      riskLevel: 'Normal Range',
      campDispatched: false,
      lastUpdated: 'Just now',
      hotspot: false
    });
  }
  saveLocal('village_outbreaks', list);
}

export function triggerHealthCampDispatch(villageName) {
  const list = getLocal('village_outbreaks');
  const item = list.find((v) => v.village.toLowerCase() === villageName.toLowerCase());
  if (item) {
    item.campDispatched = true;
    item.dispatchTime = new Date().toLocaleTimeString();
    saveLocal('village_outbreaks', list);
  }
  return list;
}

// === DEMO DATABASE SEEDING ===

export function initDemoDatabase() {
  if (typeof localStorage === 'undefined') return;

  // 1. Seed demo patients if none exist
  const existingPatients = getLocal('patients');
  if (existingPatients.length === 0) {
    const demoPatients = [
      {
        id: 'P101',
        name: 'Ravi Kumar',
        age: 28,
        gender: 'Male',
        village: 'Relangi',
        category: 'Adult',
        phone: '9848022338',
        bloodGroup: 'O+',
        organDonor: true,
        assignedAshaId: 'ASHA-001',
        assignedAshaName: 'Rani Devi',
        createdAt: '2026-09-01T10:00:00.000Z',
        isDemo: true
      },
      {
        id: 'P102',
        name: 'Lakshmi Devi',
        age: 24,
        gender: 'Female',
        village: 'Relangi',
        category: 'Woman',
        phone: '9848033449',
        bloodGroup: 'B+',
        organDonor: false,
        assignedAshaId: 'ASHA-001',
        assignedAshaName: 'Rani Devi',
        createdAt: '2026-09-02T11:30:00.000Z',
        isDemo: true
      },
      {
        id: 'P103',
        name: 'Venkatesh Rao',
        age: 64,
        gender: 'Male',
        village: 'Tanuku',
        category: 'Elderly',
        phone: '9848044550',
        bloodGroup: 'A+',
        organDonor: true,
        assignedAshaId: 'ASHA-002',
        assignedAshaName: 'Sita Kumari',
        createdAt: '2026-09-03T09:15:00.000Z',
        isDemo: true
      },
      {
        id: 'P104',
        name: 'Ananya (Baby of Lakshmi)',
        age: 1,
        gender: 'Female',
        village: 'Relangi',
        category: 'Child',
        phone: '9848033449',
        bloodGroup: 'O+',
        organDonor: false,
        assignedAshaId: 'ASHA-001',
        assignedAshaName: 'Rani Devi',
        createdAt: '2026-09-04T14:20:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('patients', demoPatients);
  }

  // 2. Seed demo child vaccines
  const existingChildVaccines = getLocal('child_vaccines');
  if (existingChildVaccines.length === 0) {
    const demoVaccines = [
      {
        id: 'cv_101',
        patientId: 'P104',
        childName: 'Ananya (Baby of Lakshmi)',
        parentName: 'Ravi Kumar & Lakshmi Devi',
        village: 'Relangi',
        phone: '9848022338',
        assignedAshaId: 'ASHA-001',
        doses: [
          { id: 'd1', name: 'BCG + OPV-0 + Hep B-0', duePeriod: 'At Birth', status: 'Completed', dateGiven: '2026-08-10' },
          { id: 'd2', name: 'OPV-1 + Penta-1 + Rota-1', duePeriod: '6 Weeks', status: 'Completed', dateGiven: '2026-09-05' },
          { id: 'd3', name: 'OPV-2 + Penta-2 + Rota-2', duePeriod: '10 Weeks', status: 'Upcoming', dateGiven: null },
          { id: 'd4', name: 'OPV-3 + Penta-3 + Rota-3', duePeriod: '14 Weeks', status: 'Upcoming', dateGiven: null },
          { id: 'd5', name: 'Measles-Rubella (MR-1)', duePeriod: '9 Months', status: 'Upcoming', dateGiven: null },
          { id: 'd6', name: 'DPT Booster + OPV Booster + MR-2', duePeriod: '16-24 Months', status: 'Upcoming', dateGiven: null }
        ],
        createdAt: '2026-09-04T14:30:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('child_vaccines', demoVaccines);
  }

  // 3. Seed demo triage records
  const existingTriage = getLocal('triage_records');
  if (existingTriage.length === 0) {
    const demoTriage = [
      {
        id: 'tr_101',
        patientId: 'P101',
        patientName: 'Ravi Kumar',
        village: 'Relangi',
        ashaName: 'Rani Devi (ASHA)',
        priorityLevel: 'MEDIUM',
        riskScore: 28,
        deteriorationProbability: 32,
        vitals: { systolicBP: 130, diastolicBP: 85, bloodSugar: 120, spo2: 98, pulse: 76, temp: 98.6 },
        symptoms: ['Mild fever', 'Body ache'],
        mlAssessment: {
          conditions: ['Viral Syndrome / Mild Malaise'],
          topFactors: [{ name: 'Mild Temperature Elevation', percentage: 40 }]
        },
        timestamp: '2026-09-08T09:00:00.000Z',
        isDemo: true
      },
      {
        id: 'tr_102',
        patientId: 'P103',
        patientName: 'Venkatesh Rao',
        village: 'Tanuku',
        ashaName: 'Sita Kumari (ASHA)',
        priorityLevel: 'HIGH',
        riskScore: 68,
        deteriorationProbability: 74,
        vitals: { systolicBP: 165, diastolicBP: 102, bloodSugar: 240, spo2: 94, pulse: 98, temp: 99.2 },
        symptoms: ['chest_pain_radiating', 'extreme_thirst_urination'],
        mlAssessment: {
          conditions: ['Stage 2 Hypertension with Anginal Risk', 'Symptomatic Hyperglycemia'],
          topFactors: [{ name: 'Severe Systolic BP (165)', percentage: 55 }]
        },
        timestamp: '2026-09-09T08:30:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('triage_records', demoTriage);
  }

  // 4. Seed demo referrals
  const existingReferrals = getLocal('referrals');
  if (existingReferrals.length === 0) {
    const demoReferrals = [
      {
        id: 'ref_101',
        patientId: 'P103',
        patientName: 'Venkatesh Rao',
        village: 'Tanuku',
        facility: 'Tanuku Government Area Hospital (AH Tanuku)',
        reason: 'Hypertensive Crisis & Chest Discomfort',
        ambulanceDispatched: true,
        status: 'Under Treatment',
        ashaName: 'Sita Kumari',
        createdAt: '2026-09-09T09:15:00.000Z',
        updatedAt: '2026-09-09T10:00:00.000Z',
        isDemo: true
      },
      {
        id: 'ref_102',
        patientId: 'P101',
        patientName: 'Ravi Kumar',
        village: 'Relangi',
        facility: 'Attili 24x7 Primary Health Centre (PHC)',
        reason: 'Seasonal Follow-up Consultation',
        ambulanceDispatched: false,
        status: 'Completed',
        ashaName: 'Rani Devi',
        createdAt: '2026-09-05T11:00:00.000Z',
        updatedAt: '2026-09-06T14:00:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('referrals', demoReferrals);
  }

  // 5. Seed demo schedules (HIGHER AUTHORITY -> ASHA)
  const existingSchedules = getLocal('schedules');
  if (existingSchedules.length === 0) {
    const demoSchedules = [
      {
        id: 'sch_201',
        title: 'Relangi Pulse Polio & UIP Child Vaccination Camp',
        date: '2026-09-20',
        time: '09:00 AM - 02:00 PM',
        village: 'Relangi',
        assignedAshaId: 'ASHA-001',
        assignedAshaName: 'Rani Devi',
        task: 'Child Vaccination & Vitamin A Drop Distribution',
        instructions: 'Visit Ward 1 and 2. Cover all children aged 0-5. Report completed count.',
        priority: 'High',
        status: 'PUBLISHED',
        createdBy: 'dr.k.v.rao@carelink.in',
        createdByName: 'Dr. K.V. Rao (DM&HO)',
        createdAt: '2026-09-09T14:00:00.000Z',
        isDemo: true
      },
      {
        id: 'sch_202',
        title: 'Tanuku Ward 4 Antenatal & Maternal Nutrition Drive',
        date: '2026-09-22',
        time: '10:00 AM - 01:00 PM',
        village: 'Tanuku',
        assignedAshaId: 'ASHA-002',
        assignedAshaName: 'Sita Kumari',
        task: 'Antenatal Checkups & Iron Folic Acid Distribution',
        instructions: 'Screen registered pregnant mothers for anemia, measure BP and fundal height.',
        priority: 'Medium',
        status: 'PUBLISHED',
        createdBy: 'dr.k.v.rao@carelink.in',
        createdByName: 'Dr. K.V. Rao (DM&HO)',
        createdAt: '2026-09-09T15:30:00.000Z',
        isDemo: true
      },
      {
        id: 'sch_203',
        title: 'Attili Sub-Centre Non-Communicable Disease (NCD) Screening',
        date: '2026-09-18',
        time: '08:30 AM - 03:00 PM',
        village: 'Attili',
        assignedAshaId: 'ASHA-003',
        assignedAshaName: 'Padma Lakshmi',
        task: 'BP & Blood Sugar Mass Screening for Adults 30+',
        instructions: 'Document all hypertensive or hyperglycemic individuals and generate PHC referrals.',
        priority: 'High',
        status: 'COMPLETED',
        completedAt: '02:45 PM',
        citizensCovered: 52,
        notes: 'Screened 52 adults. 4 referred for hypertension to Attili PHC.',
        createdBy: 'dr.k.v.rao@carelink.in',
        createdByName: 'Dr. K.V. Rao (DM&HO)',
        createdAt: '2026-09-08T08:00:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('schedules', demoSchedules);
  }

  // 6. Seed demo health campaigns
  const existingCampaigns = getLocal('campaigns');
  if (existingCampaigns.length === 0) {
    const demoCampaigns = [
      {
        id: 'camp_301',
        title: 'Pulse Polio National Immunization Drive (NID)',
        target: 'Children 0-5 Years',
        targetVillages: ['Relangi', 'Tanuku', 'Attili', 'K.S. Gattu'],
        date: '2026-09-25',
        assignedAshaIds: ['ASHA-001', 'ASHA-002', 'ASHA-003'],
        status: 'ACTIVE',
        metrics: { targetedChildren: 350, vaccinatedChildren: 215, highRiskAreasCovered: 4 },
        createdAt: '2026-09-07T10:00:00.000Z',
        isDemo: true
      },
      {
        id: 'camp_302',
        title: 'Monsoon Dengue & Anti-Larval Source Reduction Campaign',
        target: 'All Households in Godavari Lowlands',
        targetVillages: ['Relangi', 'Tanuku'],
        date: '2026-09-28',
        assignedAshaIds: ['ASHA-001', 'ASHA-002'],
        status: 'ACTIVE',
        metrics: { targetedHouseholds: 500, inspectedHouseholds: 320, chlorinePacksDistributed: 410 },
        createdAt: '2026-09-08T11:00:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('campaigns', demoCampaigns);
  }

  // 7. Seed demo alerts
  const existingAlerts = getLocal('alerts');
  if (existingAlerts.length === 0) {
    const demoAlerts = [
      {
        id: 'alt_401',
        title: 'Godavari Basin Flood Preparedness Alert',
        type: 'FLOOD',
        severity: 'HIGH',
        message: 'Precipitation forecast exceeds 45mm today. Relief shelters activated in Relangi & Tanuku. Boil drinking water before consumption.',
        targetType: 'VILLAGE',
        targetVillages: ['Relangi', 'Tanuku'],
        audience: 'BOTH',
        active: true,
        createdAt: '2026-09-09T06:00:00.000Z',
        isDemo: true
      },
      {
        id: 'alt_402',
        title: 'Gastroenteritis & Clean Water Health Advisory',
        type: 'DISEASE',
        severity: 'MEDIUM',
        message: 'Chlorine water purification tablets available free at Anganwadi centers. Report any diarrhea symptoms immediately to your local ASHA worker.',
        targetType: 'ALL',
        targetVillages: ['Relangi', 'Tanuku', 'Attili', 'K.S. Gattu'],
        audience: 'CITIZEN',
        active: true,
        createdAt: '2026-09-08T12:00:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('alerts', demoAlerts);
  }

  // 8. Seed demo outbreak reports
  const existingOutbreaks = getLocal('outbreak_reports');
  if (existingOutbreaks.length === 0) {
    const demoOutbreaks = [
      {
        id: 'out_501',
        village: 'Relangi',
        condition: 'Acute Gastroenteritis & Dehydration',
        affectedCount: 112,
        severity: 'CRITICAL',
        status: 'ACTION_TAKEN',
        description: 'Cluster of watery diarrhea cases detected around East Godavari feeder canal after localized rainfall.',
        reportedByAshaId: 'ASHA-001',
        reportedByAshaName: 'Rani Devi',
        actionNotes: 'Mobile Medical Unit (MMU) dispatched with 400 ORS packets and 1000 Halazone purification tablets.',
        date: '2026-09-08',
        createdAt: '2026-09-08T16:00:00.000Z',
        isDemo: true
      },
      {
        id: 'out_502',
        village: 'K.S. Gattu',
        condition: 'Viral Fever with Thrombocytopenia Risk',
        affectedCount: 28,
        severity: 'MODERATE',
        status: 'VERIFIED',
        description: 'Multiple children and elderly reporting persistent fever with joint pain.',
        reportedByAshaId: 'ASHA-004',
        reportedByAshaName: 'K. Mary',
        actionNotes: 'Blood smear tests scheduled at Attili PHC.',
        date: '2026-09-09',
        createdAt: '2026-09-09T07:30:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('outbreak_reports', demoOutbreaks);
  }

  // 9. Seed central & village supplies inventory
  const existingSupplies = getLocal('supply_inventory');
  if (existingSupplies.length === 0) {
    const demoSupplies = [
      {
        id: 'sup_1',
        name: 'Polyvalent Anti-Snake Venom (ASV)',
        category: 'Priority 1 - Critical Lifeline',
        priority: 'P1 - Critical',
        currentStock: 14,
        minBuffer: 10,
        incoming: 20,
        unit: 'Vials',
        facility: 'Tanuku Government Area Hospital (AH Tanuku)',
        status: 'Healthy',
        lastUpdated: '09 Sep 2026',
        isDemo: true
      },
      {
        id: 'sup_2',
        name: 'Oral Rehydration Salts (ORS Sachets)',
        category: 'Priority 1 - Critical Lifeline',
        priority: 'P1 - Critical',
        currentStock: 85,
        minBuffer: 150,
        incoming: 300,
        unit: 'Packs (1L)',
        facility: 'Relangi Sub-Centre & Anganwadi',
        status: 'Low Stock',
        lastUpdated: '09 Sep 2026',
        isDemo: true
      },
      {
        id: 'sup_3',
        name: 'Bivalent Oral Polio Vaccine (bOPV)',
        category: 'Priority 1 - Critical Lifeline',
        priority: 'P1 - Critical',
        currentStock: 160,
        minBuffer: 100,
        incoming: 0,
        unit: 'Doses (Cold Chain 2-8°C)',
        facility: 'Attili 24x7 PHC Vaccine Cold Chain',
        status: 'Healthy',
        lastUpdated: '08 Sep 2026',
        isDemo: true
      },
      {
        id: 'sup_4',
        name: 'Halazone Water Purification Tablets',
        category: 'Priority 1 - Critical Lifeline',
        priority: 'P1 - Critical',
        currentStock: 40,
        minBuffer: 200,
        incoming: 500,
        unit: 'Strip Packs (10 tabs)',
        facility: 'Relangi Disaster Relief Post',
        status: 'Stockout',
        lastUpdated: '09 Sep 2026',
        isDemo: true
      },
      {
        id: 'sup_5',
        name: 'Paracetamol Suspension (120mg/5ml)',
        category: 'Priority 2 - Acute Care',
        priority: 'P2 - Acute',
        currentStock: 45,
        minBuffer: 30,
        incoming: 50,
        unit: 'Bottles (60ml)',
        facility: 'Tanuku Area Hospital',
        status: 'Healthy',
        lastUpdated: '08 Sep 2026',
        isDemo: true
      },
      {
        id: 'sup_6',
        name: 'Metformin Hydrochloride 500mg',
        category: 'Priority 3 - Chronic Maintenance',
        priority: 'P3 - Chronic',
        currentStock: 250,
        minBuffer: 100,
        incoming: 200,
        unit: 'Tablets',
        facility: 'Attili PHC Pharmacy',
        status: 'Healthy',
        lastUpdated: '07 Sep 2026',
        isDemo: true
      }
    ];
    saveLocal('supply_inventory', demoSupplies);
  }

  // 10. Seed demo notifications
  const existingNotifs = getLocal('notifications');
  if (existingNotifs.length === 0) {
    const demoNotifs = [
      {
        id: 'notif_1',
        recipientRole: 'ASHA_WORKER',
        title: 'New Schedule: Relangi Child Vaccination Camp',
        message: 'Dr. K.V. Rao scheduled a vaccination camp in Relangi on 20 September. Acknowledge and prepare your beat list.',
        type: 'SCHEDULE',
        linkScreen: 'schedules',
        isRead: false,
        createdAt: '2026-09-09T14:05:00.000Z',
        isDemo: true
      },
      {
        id: 'notif_2',
        recipientRole: 'HIGHER_AUTHORITY',
        title: 'Outbreak Incident Reported in Relangi',
        message: 'ASHA Rani Devi submitted an alert for 112 gastroenteritis cases in Relangi.',
        type: 'OUTBREAK',
        linkScreen: 'outbreaks',
        isRead: false,
        createdAt: '2026-09-08T16:05:00.000Z',
        isDemo: true
      },
      {
        id: 'notif_3',
        recipientRole: 'CITIZEN',
        recipientName: 'Ravi Kumar',
        title: 'Vaccine Dose Recorded for Ananya',
        message: 'Dose OPV-1 + Penta-1 recorded as Completed by ASHA Rani Devi.',
        type: 'VACCINE',
        linkScreen: 'polio',
        isRead: false,
        createdAt: '2026-09-05T12:00:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('notifications', demoNotifs);
  }

  // 11. Seed demo audit logs
  const existingAudit = getLocal('audit_logs');
  if (existingAudit.length === 0) {
    const demoAudit = [
      {
        id: 'log_1',
        actor: 'Dr. K.V. Rao (DM&HO)',
        action: 'PUBLISH_SCHEDULE',
        details: "Published schedule 'Relangi Pulse Polio & UIP Child Vaccination Camp' assigned to Rani Devi",
        timestamp: '2026-09-09T14:00:00.000Z',
        isDemo: true
      },
      {
        id: 'log_2',
        actor: 'ASHA Rani Devi',
        action: 'SUBMIT_OUTBREAK_REPORT',
        details: 'Reported 112 gastroenteritis cases in Relangi following rain surge',
        timestamp: '2026-09-08T16:00:00.000Z',
        isDemo: true
      },
      {
        id: 'log_3',
        actor: 'Dr. K.V. Rao (DM&HO)',
        action: 'DISPATCH_MOBILE_CAMP',
        details: 'Dispatched 2 Mobile Medical Units (MMUs) and water purification supply to Relangi',
        timestamp: '2026-09-08T16:30:00.000Z',
        isDemo: true
      }
    ];
    saveLocal('audit_logs', demoAudit);
  }

  // 12. Seed demo user profiles
  const existingUsers = getLocal('users');
  if (existingUsers.length === 0) {
    const demoUsers = [
      {
        uid: 'user_citizen_ravi',
        id: 'user_citizen_ravi',
        email: 'ravi.kumar@carelink.in',
        role: 'CITIZEN',
        name: 'Ravi Kumar',
        village: 'Relangi',
        phone: '9848022338',
        age: 28,
        bloodGroup: 'O+',
        assignedAshaId: 'ASHA-001',
        assignedAshaName: 'Rani Devi',
        assignedAshaPhone: '9848011223',
        isDemo: true
      },
      {
        uid: 'user_asha_rani',
        id: 'user_asha_rani',
        email: 'asha.rani@carelink.in',
        role: 'ASHA_WORKER',
        name: 'Rani Devi',
        workerId: 'ASHA-001',
        village: 'Relangi',
        beats: ['Ward 1', 'Ward 2', 'Main Canal Area'],
        phone: '9848011223',
        status: 'Active',
        assignedCitizensCount: 142,
        isDemo: true
      },
      {
        uid: 'user_authority_rao',
        id: 'user_authority_rao',
        email: 'dr.k.v.rao@carelink.in',
        role: 'HIGHER_AUTHORITY',
        name: 'Dr. K. V. Rao',
        designation: 'District Medical & Health Officer (DM&HO)',
        jurisdiction: 'West Godavari District',
        phone: '08816-224466',
        isDemo: true
      }
    ];
    saveLocal('users', demoUsers);
  }
}
