import { VILLAGES } from './villageConfig.js';
// Presentation routing registry. Verify current facility capability/contact details with AP Health before deployment.
export const FACILITIES = [
  { id: 'bhimavaram-care-desk', name: 'Bhimavaram Government Care Desk', villages: VILLAGES, emergencyDesk: '108' },
  { id: 'chinamiram-phc', name: 'Chinamiram PHC Care Desk', villages: ['Chinamiram', 'Rayalam', 'Annavaram', 'Narasimhapuram', 'Kovvada'], emergencyDesk: '108' },
  { id: 'bhimavaram-referral', name: 'Bhimavaram Referral Care Desk', villages: ['Taderu', 'Yenamadurru', 'Komarada', 'Anakoderu', 'Losarigutlapadu', 'Dirusumarru', 'Bethapudi', 'Thundurru', 'Vempa', 'Gunupudi'], emergencyDesk: '108' }
];

export function resolveFacility({ facility, village } = {}) {
  const requested = String(facility || '').toLowerCase();
  return FACILITIES.find((item) => item.name.toLowerCase() === requested || requested.includes(item.id.replace('-', ' ')))
    || FACILITIES.find((item) => item.villages.some((place) => place.toLowerCase() === String(village || '').toLowerCase()))
    || FACILITIES[0];
}
