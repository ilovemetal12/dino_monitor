const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json();
  }
  return res;
}

export const api = {
  // Auth
  verifyPin: (pin) => request('/auth/verify', { method: 'POST', body: JSON.stringify({ pin }) }),
  changePin: (current, newPin) => request('/auth/change', { method: 'PUT', body: JSON.stringify({ current, newPin }) }),

  // Readings
  getReadings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/readings?${query}`);
  },
  createReading: (data) => request('/readings', { method: 'POST', body: JSON.stringify(data) }),
  deleteReading: (id) => request(`/readings/${id}`, { method: 'DELETE' }),
  getTodayCount: () => request('/readings/today/count'),

  // Stats
  getSummary: () => request('/stats/summary'),

  // Week
  getCurrentWeek: () => request('/week/current'),

  // Settings
  getSettings: () => request('/settings'),
  updateSetting: (key, value) => request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),

  // Reports
  getReportUrl: (from, to) => `${BASE}/reports/pdf?from=${from}&to=${to}`
};
