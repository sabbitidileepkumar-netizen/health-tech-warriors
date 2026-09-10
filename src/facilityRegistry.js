// Offline routing registry. Replace these demo entries with verified district master data before deployment.
export const FACILITIES = [
  { id: 'tanuku-ah', name: 'Tanuku Government Area Hospital', villages: ['Relangi', 'Tanuku', 'K.S. Gattu'], emergencyDesk: '108' },
  { id: 'attili-phc', name: 'Attili PHC', villages: ['Attili', 'Velpuru', 'Manchili'], emergencyDesk: '108' },
  { id: 'bhimavaram-chc', name: 'Bhimavaram Community Health Centre', villages: ['Bhimavaram', 'Akividu'], emergencyDesk: '108' }
];

export function resolveFacility({ facility, village } = {}) {
  const requested = String(facility || '').toLowerCase();
  return FACILITIES.find((item) => item.name.toLowerCase() === requested || requested.includes(item.id.replace('-', ' ')))
    || FACILITIES.find((item) => item.villages.some((place) => place.toLowerCase() === String(village || '').toLowerCase()))
    || FACILITIES[0];
}
