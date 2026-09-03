// Centralized Data Layer for CareLink (Local-first + Firebase sync)
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const INITIAL_DATA = {
  patients: [
    {
      id: 'p1',
      name: 'Ramesh Patil',
      age: 48,
      village: 'Ramnagar',
      category: 'Adult',
      phone: '+91 98231 44510',
      bloodGroup: 'B+',
      organDonor: true,
      organsPledged: ['Eyes / Cornea', 'Kidneys'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'p2',
      name: 'Sunita Gaikwad',
      age: 26,
      village: 'Bhamragad',
      category: 'Woman',
      phone: '+91 97654 11209',
      bloodGroup: 'O+',
      organDonor: false,
      organsPledged: [],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'p3',
      name: 'Aarav Deshmukh',
      age: 4,
      village: 'Bhamragad',
      category: 'Child',
      phone: '+91 94221 88301',
      bloodGroup: 'A+',
      organDonor: false,
      organsPledged: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'p4',
      name: 'Dnyaneshwar Shinde',
      age: 67,
      village: 'Korpana',
      category: 'Elderly',
      phone: '+91 98900 12345',
      bloodGroup: 'AB+',
      organDonor: true,
      organsPledged: ['All Organs'],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ],
  triage_records: [
    {
      id: 'tr1',
      patientId: 'p2',
      patientName: 'Sunita Gaikwad',
      village: 'Bhamragad',
      symptoms: ['diarrhea', 'vomiting', 'weakness'],
      score: 10,
      priorityLevel: 'HIGH',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'tr2',
      patientId: 'p1',
      patientName: 'Ramesh Patil',
      village: 'Ramnagar',
      symptoms: ['fever', 'cough'],
      score: 5,
      priorityLevel: 'MEDIUM',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'tr3',
      patientId: 'p4',
      patientName: 'Dnyaneshwar Shinde',
      village: 'Korpana',
      symptoms: ['headache'],
      score: 1,
      priorityLevel: 'LOW',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  referrals: [
    {
      id: 'ref1',
      patientId: 'p2',
      patientName: 'Sunita Gaikwad',
      facility: 'District Hospital Chandrapur',
      reason: 'Severe Dehydration & Electrolyte Imbalance',
      ambulanceDispatched: true,
      status: 'Under Treatment',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'ref2',
      patientId: 'p1',
      patientName: 'Ramesh Patil',
      facility: 'Nearby PHC Wardha',
      reason: 'Persistent High Fever with Cough',
      ambulanceDispatched: false,
      status: 'Referred',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ],
  blood_donors: [
    { id: 'b1', name: 'Vikram Jadhav', bloodGroup: 'O+', village: 'Ramnagar', phone: '+91 98223 99881', distanceKm: 2.1, status: 'Available' },
    { id: 'b2', name: 'Pooja Kale', bloodGroup: 'B+', village: 'Bhamragad', phone: '+91 99770 12389', distanceKm: 4.5, status: 'Available' },
    { id: 'b3', name: 'Santosh Wagh', bloodGroup: 'A+', village: 'Wardha PHC', phone: '+91 94211 45098', distanceKm: 6.0, status: 'Available' },
    { id: 'b4', name: 'Anil Rathod', bloodGroup: 'AB+', village: 'Korpana', phone: '+91 91588 77621', distanceKm: 8.2, status: 'Available' },
    { id: 'b5', name: 'Dr. Neha Kadam', bloodGroup: 'O-', village: 'District Hospital', phone: '+91 98600 33412', distanceKm: 12.0, status: 'Available' },
    { id: 'b6', name: 'Ganesh More', bloodGroup: 'B-', village: 'Chandrapur Sub-Centre', phone: '+91 97300 88219', distanceKm: 14.5, status: 'Available' }
  ],
  medicine_reminders: [
    {
      id: 'm1',
      patientName: 'Ramesh Patil',
      phone: '+91 98231 44510',
      medicine: 'Paracetamol 500mg',
      timing: 'Morning (8:00 AM) & Night (9:00 PM)',
      purpose: 'Fever management',
      active: true
    },
    {
      id: 'm2',
      patientName: 'Dnyaneshwar Shinde',
      phone: '+91 98900 12345',
      medicine: 'Amlodipine 5mg',
      timing: 'Morning (9:00 AM)',
      purpose: 'Blood Pressure Control',
      active: true
    },
    {
      id: 'm3',
      patientName: 'Sunita Gaikwad',
      phone: '+91 97654 11209',
      medicine: 'ORS & Zinc Sachet',
      timing: 'Every 4 Hours',
      purpose: 'Hydration & Gut Recovery',
      active: true
    }
  ],
  village_outbreaks: [
    {
      village: 'Bhamragad',
      cases: 138,
      primaryCondition: 'Acute Diarrhea & Vomiting',
      riskLevel: 'EPIDEMIC ALERT (>100 CASES)',
      campDispatched: false,
      lastUpdated: '10 mins ago',
      hotspot: true
    },
    {
      village: 'Korpana',
      cases: 42,
      primaryCondition: 'Viral Fever & Body Pain',
      riskLevel: 'Moderate Watch',
      campDispatched: false,
      lastUpdated: '1 hour ago',
      hotspot: false
    },
    {
      village: 'Ramnagar',
      cases: 18,
      primaryCondition: 'Upper Respiratory Infection',
      riskLevel: 'Normal Range',
      campDispatched: false,
      lastUpdated: '3 hours ago',
      hotspot: false
    }
  ]
};

// Initialize localStorage if empty
export function initStore() {
  for (const [key, initialValue] of Object.entries(INITIAL_DATA)) {
    if (!localStorage.getItem('carelink_' + key)) {
      localStorage.setItem('carelink_' + key, JSON.stringify(initialValue));
    }
  }
}

export function getLocal(key) {
  try {
    const raw = localStorage.getItem('carelink_' + key);
    return raw ? JSON.parse(raw) : INITIAL_DATA[key] || [];
  } catch (e) {
    return INITIAL_DATA[key] || [];
  }
}

export function saveLocal(key, data) {
  try {
    localStorage.setItem('carelink_' + key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to local storage', e);
  }
}

// Add Item locally + attempt Firebase sync
export async function addPatient(patient) {
  const list = getLocal('patients');
  const newPatient = {
    id: 'p_' + Date.now(),
    ...patient,
    createdAt: new Date().toISOString()
  };
  list.unshift(newPatient);
  saveLocal('patients', list);

  try {
    if (db) {
      await addDoc(collection(db, 'patients'), {
        ...patient,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Firebase offline, saved locally:', err.message);
  }
  return newPatient;
}

export async function addTriageRecord(record) {
  const list = getLocal('triage_records');
  const newRecord = {
    id: 'tr_' + Date.now(),
    ...record,
    timestamp: new Date().toISOString()
  };
  list.unshift(newRecord);
  saveLocal('triage_records', list);

  if (record.village) {
    incrementVillageCase(record.village, record.symptoms);
  }

  try {
    if (db) {
      await addDoc(collection(db, 'triage_records'), {
        ...record,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Firebase offline, saved triage locally');
  }
  return newRecord;
}

export async function addReferral(refData) {
  const list = getLocal('referrals');
  const newRef = {
    id: 'ref_' + Date.now(),
    ...refData,
    status: 'Referred',
    createdAt: new Date().toISOString()
  };
  list.unshift(newRef);
  saveLocal('referrals', list);

  try {
    if (db) {
      await addDoc(collection(db, 'referrals'), {
        ...refData,
        status: 'Referred',
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Firebase offline, saved referral locally');
  }
  return newRef;
}

export function updateReferralStatus(id, nextStatus) {
  const list = getLocal('referrals');
  const updated = list.map(item => item.id === id ? { ...item, status: nextStatus } : item);
  saveLocal('referrals', updated);
  return updated;
}

export function addMedicineReminder(rem) {
  const list = getLocal('medicine_reminders');
  const newRem = {
    id: 'm_' + Date.now(),
    ...rem,
    active: true
  };
  list.unshift(newRem);
  saveLocal('medicine_reminders', list);
  return newRem;
}

export function addBloodDonor(donor) {
  const list = getLocal('blood_donors');
  const newDonor = {
    id: 'b_' + Date.now(),
    ...donor,
    status: 'Available'
  };
  list.unshift(newDonor);
  saveLocal('blood_donors', list);
  return newDonor;
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
