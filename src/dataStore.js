// Centralized Data Layer for CareLink (Firestore real-time + local cache)
import { db } from './firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

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
  // Kept for compatibility; Firestore is now the real source of truth
  for (const [key, initialValue] of Object.entries(INITIAL_DATA)) {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('carelink_' + key)) {
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

// NEW: Real-time subscription — call this to get LIVE updates from Firestore
// Usage: const unsubscribe = subscribeToCollection('patients', (data) => setPatients(data));
// Call unsubscribe() when component unmounts (in useEffect cleanup)
export function subscribeToCollection(collectionName, callback) {
  try {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      saveLocal(collectionName, items); // keep local cache for offline fallback
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

export async function addPatient(patient) {
  const docRef = await addDoc(collection(db, 'patients'), {
    ...patient,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...patient };
}

export async function addTriageRecord(record) {
  const docRef = await addDoc(collection(db, 'triage_records'), {
    ...record,
    timestamp: new Date().toISOString(),
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...record };
}

export async function addReferral(refData) {
  const docRef = await addDoc(collection(db, 'referrals'), {
    ...refData,
    status: 'Referred',
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...refData };
}
