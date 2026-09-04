// Centralized Data Layer for CareLink (Local-first + Firebase sync)
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const INITIAL_DATA = {
  patients: [
    {
      id: 'p1',
      name: 'Dileep Varma',
      age: 48,
      village: 'Relangi',
      category: 'Adult',
      phone: '+91 98480 22310',
      bloodGroup: 'B+',
      organDonor: true,
      organsPledged: ['Eyes / Cornea', 'Kidneys'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'p2',
      name: 'Lakshmi Prasanna',
      age: 25,
      village: 'Attili',
      category: 'Woman',
      phone: '+91 94401 55678',
      bloodGroup: 'O+',
      organDonor: false,
      organsPledged: [],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'p3',
      name: 'Sai Kiran',
      age: 3,
      village: 'Tanuku',
      category: 'Child',
      phone: '+91 98492 11432',
      bloodGroup: 'A+',
      organDonor: false,
      organsPledged: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'p4',
      name: 'Venkat Rao',
      age: 68,
      village: 'K.S. Gattu',
      category: 'Elderly',
      phone: '+91 99890 33211',
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
      patientName: 'Lakshmi Prasanna',
      village: 'Attili',
      symptoms: ['diarrhea', 'vomiting', 'weakness'],
      score: 10,
      priorityLevel: 'HIGH',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'tr2',
      patientId: 'p1',
      patientName: 'Dileep Varma',
      village: 'Relangi',
      symptoms: ['fever', 'cough'],
      score: 5,
      priorityLevel: 'MEDIUM',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'tr3',
      patientId: 'p4',
      patientName: 'Venkat Rao',
      village: 'K.S. Gattu',
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
      patientName: 'Lakshmi Prasanna',
      facility: 'Bhimavaram Community Health Centre',
      reason: 'Severe Dehydration & Electrolyte Imbalance',
      ambulanceDispatched: true,
      status: 'Under Treatment',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'ref2',
      patientId: 'p1',
      patientName: 'Dileep Varma',
      facility: 'Tanuku Government Area Hospital',
      reason: 'Persistent High Fever with Cough',
      ambulanceDispatched: false,
      status: 'Referred',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ],
  blood_donors: [
    { id: 'b1', name: 'Suresh Varma', bloodGroup: 'O+', village: 'Relangi', phone: '+91 98481 12345', distanceKm: 1.8, status: 'Available' },
    { id: 'b2', name: 'Prashanthi K', bloodGroup: 'B+', village: 'Tanuku', phone: '+91 99882 23456', distanceKm: 3.5, status: 'Available' },
    { id: 'b3', name: 'Ravi Kumar', bloodGroup: 'A+', village: 'Attili', phone: '+91 94411 34567', distanceKm: 4.2, status: 'Available' },
    { id: 'b4', name: 'Nageswara Rao', bloodGroup: 'AB+', village: 'K.S. Gattu', phone: '+91 91540 45678', distanceKm: 6.1, status: 'Available' },
    { id: 'b5', name: 'Dr. V. Subrahmanyam', bloodGroup: 'O-', village: 'Tanuku Area Hospital', phone: '+91 98660 56789', distanceKm: 2.5, status: 'Available' },
    { id: 'b6', name: 'Kalyan Chakravarthy', bloodGroup: 'B-', village: 'Bhimavaram CHC', phone: '+91 97000 67890', distanceKm: 8.5, status: 'Available' }
  ],
  medicine_reminders: [
    {
      id: 'm1',
      patientName: 'Dileep Varma',
      phone: '+91 98480 22310',
      medicine: 'Paracetamol 500mg',
      timing: 'Morning (8:00 AM) & Night (9:00 PM)',
      purpose: 'Fever management',
      active: true
    },
    {
      id: 'm2',
      patientName: 'Venkat Rao',
      phone: '+91 99890 33211',
      medicine: 'Amlodipine 5mg',
      timing: 'Morning (9:00 AM)',
      purpose: 'Blood Pressure Control',
      active: true
    },
    {
      id: 'm3',
      patientName: 'Lakshmi Prasanna',
      phone: '+91 94401 55678',
      medicine: 'ORS & Zinc Sachet',
      timing: 'Every 4 Hours',
      purpose: 'Hydration & Gut Recovery',
      active: true
    }
  ],
  village_outbreaks: [
    {
      village: 'Relangi',
      cases: 124,
      primaryCondition: 'Acute Diarrhea & Dehydration',
      riskLevel: 'EPIDEMIC ALERT (>100 CASES)',
      campDispatched: false,
      lastUpdated: '5 mins ago',
      hotspot: true
    },
    {
      village: 'Tanuku',
      cases: 42,
      primaryCondition: 'Viral Fever & Body Pain',
      riskLevel: 'Moderate Watch',
      campDispatched: false,
      lastUpdated: '1 hour ago',
      hotspot: false
    },
    {
      village: 'Attili',
      cases: 19,
      primaryCondition: 'Upper Respiratory Infection',
      riskLevel: 'Normal Range',
      campDispatched: false,
      lastUpdated: '2 hours ago',
      hotspot: false
    },
    {
      village: 'K.S. Gattu',
      cases: 31,
      primaryCondition: 'Gastroenteritis & Weakness',
      riskLevel: 'Watch List',
      campDispatched: false,
      lastUpdated: '4 hours ago',
      hotspot: false
    }
  ],
  child_vaccines: [
    {
      childId: 'p3',
      childName: 'Sai Kiran',
      parentName: 'Suresh Varma',
      phone: '+91 98492 11432',
      village: 'Tanuku',
      dob: '2023-04-10',
      doses: [
        { id: 'v1', name: 'BCG + OPV-0 (Birth Polio) + Hep-B', duePeriod: 'At Birth', status: 'Completed', dateGiven: '2023-04-10' },
        { id: 'v2', name: 'OPV-1 + Pentavalent-1 + Rota-1 + fIPV-1', duePeriod: '6 Weeks', status: 'Completed', dateGiven: '2023-05-22' },
        { id: 'v3', name: 'OPV-2 + Pentavalent-2 + Rota-2', duePeriod: '10 Weeks', status: 'Completed', dateGiven: '2023-06-20' },
        { id: 'v4', name: 'OPV-3 + Pentavalent-3 + Rota-3 + fIPV-2', duePeriod: '14 Weeks', status: 'Completed', dateGiven: '2023-07-25' },
        { id: 'v5', name: 'MR-1 (Measles Rubella) + Vitamin A', duePeriod: '9-12 Months', status: 'Completed', dateGiven: '2024-01-18' },
        { id: 'v6', name: 'DPT Booster-1 + OPV Booster', duePeriod: '16-24 Months', status: 'Completed', dateGiven: '2024-11-05' },
        { id: 'v7', name: 'Pulse Polio Special Campaign 2026', duePeriod: 'Target Campaign', status: 'Due Today', dateGiven: null },
        { id: 'v8', name: 'DPT Booster-2', duePeriod: '5-6 Years', status: 'Upcoming', dateGiven: null }
      ]
    },
    {
      childId: 'c2',
      childName: 'Bhavya Sri',
      parentName: 'Ravi Kumar',
      phone: '+91 94411 34567',
      village: 'Attili',
      dob: '2025-11-15',
      doses: [
        { id: 'vb1', name: 'BCG + OPV-0 + Hep-B', duePeriod: 'At Birth', status: 'Completed', dateGiven: '2025-11-15' },
        { id: 'vb2', name: 'OPV-1 + Pentavalent-1 + Rota-1', duePeriod: '6 Weeks', status: 'Completed', dateGiven: '2025-12-28' },
        { id: 'vb3', name: 'OPV-2 + Pentavalent-2 + Rota-2', duePeriod: '10 Weeks', status: 'Completed', dateGiven: '2026-01-26' },
        { id: 'vb4', name: 'OPV-3 + Pentavalent-3 + Rota-3', duePeriod: '14 Weeks', status: 'Due Today', dateGiven: null },
        { id: 'vb5', name: 'MR-1 + Vitamin A', duePeriod: '9-12 Months', status: 'Upcoming', dateGiven: null }
      ]
    }
  ],
  venom_stocks: [
    {
      facility: 'Tanuku Government Area Hospital (AH Tanuku)',
      asvVials: 42,
      arsVials: 28,
      icuEquipped: true,
      phone: '08819-224108',
      distanceKm: 3.5,
      status: 'Abundant Stock'
    },
    {
      facility: 'Bhimavaram Community Health Centre (CHC)',
      asvVials: 35,
      arsVials: 20,
      icuEquipped: true,
      phone: '08816-222450',
      distanceKm: 9.0,
      status: 'Adequate Stock'
    },
    {
      facility: 'Attili 24x7 Primary Health Centre (PHC)',
      asvVials: 14,
      arsVials: 8,
      icuEquipped: false,
      phone: '08819-256102',
      distanceKm: 4.8,
      status: 'Buffer Available'
    },
    {
      facility: 'K.S. Gattu 24x7 Sub-Centre (First-Aid Unit)',
      asvVials: 4,
      arsVials: 2,
      icuEquipped: false,
      phone: '08819-257004',
      distanceKm: 6.2,
      status: 'Emergency Only'
    }
  ],
  venom_incidents: [
    {
      id: 'vi1',
      victimName: 'Subba Rao',
      village: 'Relangi',
      type: 'Russell Viper Snakebite (Paddy field)',
      timeAgo: '1 hour ago',
      facility: 'Tanuku Government Area Hospital',
      status: 'Anti-Venom Administered (Under Observation)',
      urgency: 'HIGH'
    },
    {
      id: 'vi2',
      victimName: 'K. Durga',
      village: 'Attili',
      type: 'Scorpion Sting',
      timeAgo: '4 hours ago',
      facility: 'Attili PHC',
      status: 'Local Anesthesia & Observation',
      urgency: 'MEDIUM'
    }
  ],
  supply_inventory: [
    { id: 's1', name: 'Polyvalent Anti-Snake Venom (ASV)', category: 'Emergency', priority: 'P1 - Critical', currentStock: 42, minBuffer: 20, unit: 'Vials', status: 'Healthy' },
    { id: 's2', name: 'Anti-Rabies Vaccine (ARV Serum)', category: 'Emergency', priority: 'P1 - Critical', currentStock: 28, minBuffer: 15, unit: 'Vials', status: 'Healthy' },
    { id: 's3', name: 'ORS (Oral Rehydration Salts WHO)', category: 'Dehydration', priority: 'P1 - Critical', currentStock: 850, minBuffer: 500, unit: 'Sachets', status: 'Adequate' },
    { id: 's4', name: 'Oxytocin Injection (Labour emergency)', category: 'Maternal', priority: 'P1 - Critical', currentStock: 25, minBuffer: 20, unit: 'Ampoules', status: 'Adequate' },
    { id: 's5', name: 'Adrenaline / Epinephrine 1:1000', category: 'Emergency', priority: 'P1 - Critical', currentStock: 18, minBuffer: 10, unit: 'Ampoules', status: 'Healthy' },
    { id: 's6', name: 'Paracetamol 500mg Tablets', category: 'General Fever', priority: 'P2 - Acute', currentStock: 2200, minBuffer: 1000, unit: 'Tablets', status: 'Healthy' },
    { id: 's7', name: 'Zinc Sulfate 20mg Tablets', category: 'Pediatric Diarrhea', priority: 'P2 - Acute', currentStock: 600, minBuffer: 400, unit: 'Tablets', status: 'Adequate' },
    { id: 's8', name: 'Amoxicillin 250mg Capsules', category: 'Antibiotic', priority: 'P2 - Acute', currentStock: 350, minBuffer: 400, unit: 'Capsules', status: 'Low Stock' },
    { id: 's9', name: 'Rapid Malaria / Dengue Test Kits', category: 'Diagnostic', priority: 'P2 - Acute', currentStock: 120, minBuffer: 100, unit: 'Kits', status: 'Adequate' },
    { id: 's10', name: 'Halazone / Chlorine Water Purifier', category: 'Water Safety', priority: 'P2 - Acute', currentStock: 2500, minBuffer: 1500, unit: 'Tablets', status: 'Healthy' },
    { id: 's11', name: 'Amlodipine 5mg (BP Maintenance)', category: 'NCD Care', priority: 'P3 - Chronic', currentStock: 950, minBuffer: 600, unit: 'Tablets', status: 'Adequate' },
    { id: 's12', name: 'Metformin 500mg (Diabetes)', category: 'NCD Care', priority: 'P3 - Chronic', currentStock: 1100, minBuffer: 700, unit: 'Tablets', status: 'Adequate' },
    { id: 's13', name: 'Iron & Folic Acid (IFA Red)', category: 'Maternal Nutrition', priority: 'P3 - Chronic', currentStock: 2400, minBuffer: 1200, unit: 'Tablets', status: 'Healthy' },
    { id: 's14', name: 'Sterile Cotton & Rolled Bandages', category: 'Wound Dressing', priority: 'P3 - Chronic', currentStock: 45, minBuffer: 80, unit: 'Rolls', status: 'Low Stock' }
  ],
  disaster_status: {
    active: false,
    alertTitle: 'Godavari River Level Flash Alert (Tier-2 Watch)',
    floodLevel: 'Warning Level 1 (48.4 ft at Dowleswaram Barrage)',
    affectedZones: ['Relangi Lowlands', 'Tanuku Canal Banks', 'Attili Ward 4'],
    shelters: [
      { name: 'Relangi Zilla Parishad High School Shelter', capacity: 400, occupied: 65, medicalLead: 'Attili PHC Mobile Unit', foodPacks: 500, waterPurity: 'Safe' },
      { name: 'Tanuku Town Municipal Community Hall', capacity: 600, occupied: 120, medicalLead: 'AH Tanuku Emergency MMU', foodPacks: 800, waterPurity: 'Safe' },
      { name: 'K.S. Gattu Cyclone & Flood Shelter', capacity: 300, occupied: 30, medicalLead: 'K.S. Gattu Sub-Centre Team', foodPacks: 350, waterPurity: 'Safe' }
    ]
  },
  weather_intelligence: {
    region: 'Tanuku - Relangi - Attili Rural Belt (West Godavari)',
    temp: '32°C',
    humidity: '84%',
    forecast: 'Heavy monsoon showers anticipated over next 48 hours',
    floodRisk: 'Elevated in Low-lying Paddy Fields',
    seasonalAlerts: [
      {
        season: 'Monsoon (Active)',
        threat: 'Acute Gastroenteritis & Water Contamination',
        level: 'CRITICAL',
        action: 'Chlorinate open wells in Relangi & Attili; distribute ORS sachets door-to-door.'
      },
      {
        season: 'Monsoon (Active)',
        threat: 'Paddy Field Snakebites during Weeding & Waterlogging',
        level: 'HIGH',
        action: 'Alert farm workers to wear gumboots; confirm 42 ASV vials at Tanuku Area Hospital.'
      },
      {
        season: 'Post-Monsoon (Upcoming)',
        threat: 'Dengue & Chikungunya Mosquito Breeding',
        level: 'MODERATE',
        action: 'Eliminate water stagnancy in coconut plantations and residential drums.'
      }
    ]
  }
};

export function initStore() {
  const version = typeof localStorage !== 'undefined' ? localStorage.getItem('carelink_geo_version') : null;
  if (version !== 'v2_godavari') {
    for (const [key, initialValue] of Object.entries(INITIAL_DATA)) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('carelink_' + key, JSON.stringify(initialValue));
      }
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('carelink_geo_version', 'v2_godavari');
    }
    return;
  }

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
    localStorage.setItem('carelink_geo_version', 'v2_godavari');
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

export function updateChildDoseStatus(childId, doseId, nextStatus) {
  const list = getLocal('child_vaccines');
  const updated = list.map(child => {
    if (child.childId === childId) {
      return {
        ...child,
        doses: child.doses.map(d => d.id === doseId ? { ...d, status: nextStatus, dateGiven: nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null } : d)
      };
    }
    return child;
  });
  saveLocal('child_vaccines', updated);
  return updated;
}

export function reportVenomIncident(incident) {
  const list = getLocal('venom_incidents');
  const newInc = {
    id: 'vi_' + Date.now(),
    ...incident,
    timeAgo: 'Just now'
  };
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
