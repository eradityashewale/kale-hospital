import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch, getToken, setToken, setUnauthorizedHandler } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getToken()) {
        try {
          const me = await apiFetch('/auth/me');
          if (!cancelled) setUser(me);
        } catch {
          setToken(null);
        }
      }
      if (!cancelled) setInitializing(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* best effort */ }
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((next) => setUser(next), []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
