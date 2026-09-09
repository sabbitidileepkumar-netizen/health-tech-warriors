// Centralized Data Layer for CareLink (Firestore real-time + local cache)
import { db } from './firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { saveWithOfflineSupport } from './offlineSync';

const INITIAL_DATA = {
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
  disaster_status: { active: false, alertTitle: '', floodLevel: '', affectedZones: [], shelters: [] },
  weather_intelligence: { region: '', temp: '', humidity: '', forecast: '', floodRisk: '', seasonalAlerts: [] }
};

export function initStore() {
  for (const [key, initialValue] of Object.entries(INITIAL_DATA)) {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('carelink_' + key)) {
      localStorage.setItem('carelink_' + key, JSON.stringify(initialValue));
    }
  }
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
  } catch (e) {
    return INITIAL_DATA[key] || [];
  }
}

export function saveLocal(key, data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('carelink_' + key, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error saving to local storage', e);
  }
}

// Real-time subscription — call this to get LIVE updates from Firestore
export function subscribeToCollection(collectionName, callback) {
  try {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const existingLocal = getLocal(collectionName);

      // Safety net: if Firestore comes back empty while offline/from cache,
      // but we already have good local data, keep the local data instead
      // of wiping it out.
      if (items.length === 0 && existingLocal.length > 0 && snapshot.metadata.fromCache) {
        callback(existingLocal);
        return;
      }

      saveLocal(collectionName, items);
      callback(items);
    }, (error) => {
      console.warn('Firestore sync error, using local cache:', error.message);
      callback(getLocal(collectionName));
    });
    return unsubscribe;
  } catch (err) {
    console.warn('Firestore unavailable, using local cache');
    callback(getLocal(collectionName));
    return () => {};
  }
}

// FIXED: now routes through the offline-support queue, same as addTriageRecord.
// This writes the new patient into localStorage (carelink_patients) immediately,
// so they show up in Triage's dropdown right away — online or offline — and
// queues the real Firestore write for whenever the device reconnects.
export async function addPatient(patient) {
  return await saveWithOfflineSupport('patients', patient, 'patients');
}

export async function addTriageRecord(record) {
  const result = await saveWithOfflineSupport(
    'triage_records',
    { ...record, timestamp: new Date().toISOString() },
    'triage_records'
  );

  if (record.village) {
    incrementVillageCase(record.village, record.symptoms);
  }

  return result;
}

export async function addReferral(refData) {
  const docRef = await addDoc(collection(db, 'referrals'), {
    ...refData,
    status: 'Referred',
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...refData };
}

export function updateReferralStatus(id, nextStatus) {
  const list = getLocal('referrals');
  const updated = list.map(item => item.id === id ? { ...item, status: nextStatus } : item);
  saveLocal('referrals', updated);
  return updated;
}

export function addMedicineReminder(rem) {
  const list = getLocal('medicine_reminders');
  const newRem = { id: 'm_' + Date.now(), ...rem, active: true };
  list.unshift(newRem);
  saveLocal('medicine_reminders', list);
  return newRem;
}

export function addBloodDonor(donor) {
  const list = getLocal('blood_donors');
  const newDonor = { id: 'b_' + Date.now(), ...donor, status: 'Available' };
  list.unshift(newDonor);
  saveLocal('blood_donors', list);
  return newDonor;
}

// === CHILD VACCINE TRACKING (Firestore — shared live between ASHA & Citizen portals) ===

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
  const docRef = await addDoc(collection(db, "child_vaccines"), {
    ...child,
    doses: generateDefaultDoses(),
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...child };
}

export async function updateChildDoseStatusFirestore(childDocId, doseId, currentDoses, nextStatus) {
  const updatedDoses = currentDoses.map((d) =>
    d.id === doseId
      ? { ...d, status: nextStatus, dateGiven: nextStatus === "Completed" ? new Date().toISOString().split("T")[0] : null }
      : d
  );
  const ref = doc(db, "child_vaccines", childDocId);
  await updateDoc(ref, { doses: updatedDoses });
  return updatedDoses;
}

// === END CHILD VACCINE TRACKING ===

export function reportVenomIncident(incident) {
  const list = getLocal('venom_incidents');
  const newInc = { id: 'vi_' + Date.now(), ...incident, timeAgo: 'Just now' };
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

export function updateSupplyStock(id, newStock) {
  const list = getLocal('supply_inventory');
  const updated = list.map(item => {
    if (item.id === id) {
      const status = newStock <= 0 ? 'Stockout' : newStock < item.minBuffer ? 'Low Stock' : 'Healthy';
      return { ...item, currentStock: newStock, status };
    }
    return item;
  });
  saveLocal('supply_inventory', updated);
  return updated;
}

export function incrementVillageCase(villageName, symptoms = []) {
  const list = getLocal('village_outbreaks');
  const existing = list.find(v => v.village.toLowerCase() === villageName.toLowerCase());
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
  const item = list.find(v => v.village.toLowerCase() === villageName.toLowerCase());
  if (item) {
    item.campDispatched = true;
    item.dispatchTime = new Date().toLocaleTimeString();
    saveLocal('village_outbreaks', list);
  }
  return list;
}
