const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (res.status === 401) {
    onUnauthorized();
    throw new Error('Session expired, please log in again');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return data;
    }),

  getGoals: (includeArchived = false) =>
    fetch(`${BASE}/goals?includeArchived=${includeArchived}`, { headers: authHeaders() }).then(handle),
  createGoal: (goal) =>
    fetch(`${BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(goal),
    }).then(handle),
  updateGoal: (id, updates) =>
    fetch(`${BASE}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
    }).then(handle),
  deleteGoal: (id) => fetch(`${BASE}/goals/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),

  getEntries: (goalId, from, to) => {
    const params = new URLSearchParams({ goalId });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return fetch(`${BASE}/entries?${params}`, { headers: authHeaders() }).then(handle);
  },
  saveEntry: (entry) =>
    fetch(`${BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(entry),
    }).then(handle),
  deleteEntry: (id) => fetch(`${BASE}/entries/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
};
