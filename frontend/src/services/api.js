const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchStatistics() {
  const res = await fetch(`${API_BASE}/statistics`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchParcels(filters = {}) {
  const params = new URLSearchParams();
  if (filters.state && filters.state !== 'All') params.append('state', filters.state);
  if (filters.district && filters.district !== 'All') params.append('district', filters.district);
  if (filters.trajectory && filters.trajectory !== 'All') params.append('trajectory', filters.trajectory);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.minScore) params.append('min_score', filters.minScore);

  const res = await fetch(`${API_BASE}/parcels?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch parcels');
  return res.json();
}

export async function fetchParcelById(parcelId) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}`);
  if (!res.ok) throw new Error('Failed to fetch parcel detail');
  return res.json();
}

export async function fetchPriorityAlerts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.state && filters.state !== 'All') params.append('state', filters.state);
  if (filters.district && filters.district !== 'All') params.append('district', filters.district);
  if (filters.trajectory && filters.trajectory !== 'All') params.append('trajectory', filters.trajectory);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);

  const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function recordParcelAction(parcelId, action, notes, officialId = 'Govt Officer S. Verma') {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, notes, official_id: officialId }),
  });
  if (!res.ok) throw new Error('Failed to record official action');
  return res.json();
}

export async function triggerPostNoticeRecheck(parcelId, year2027Area = 1150.0) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/recheck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year_2027_area: year2027Area }),
  });
  if (!res.ok) throw new Error('Failed to trigger post-notice recheck');
  return res.json();
}

export async function fetchParcelImagery(parcelId, year = 2026) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/imagery?year=${year}`);
  if (!res.ok) throw new Error('Failed to fetch imagery details');
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchParcelEvidence(parcelId) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/evidence`);
  if (!res.ok) throw new Error('Failed to fetch evidence');
  return res.json();
}

export async function fetchParcelChangeAnalysis(parcelId) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/change-analysis`);
  if (!res.ok) throw new Error('Failed to fetch change analysis');
  return res.json();
}

export async function submitVerification(parcelId, outcome, notes, officer) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}/verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outcome, notes, officer }),
  });
  if (!res.ok) throw new Error('Failed to submit verification');
  return res.json();
}
