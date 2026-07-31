export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

const TOKEN_KEY = 'hms-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach the Kale Hospital API. Is the backend server running?');
  }

  if (res.status === 401) {
    setToken(null);
    if (onUnauthorized) onUnauthorized();
    throw new Error('Your session expired. Please sign in again.');
  }

  let body = null;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    const detail = body?.detail;
    const message = Array.isArray(detail) ? detail.map((d) => d.msg).join('; ') : (detail || 'Request failed.');
    throw new Error(message);
  }
  return body;
}
