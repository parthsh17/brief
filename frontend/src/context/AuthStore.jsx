import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AuthStoreContext } from './AuthStoreContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { const current = data?.user || data?.data; if (current) setUser({ uid: current._id || current.id, displayName: current.display_name, email: current.email, photoURL: current.photo_url }); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);
  const login = () => { window.location.href = `${API_BASE}/api/auth/google`; };
  const logout = async () => { await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' }); setUser(null); };
  return _jsx(AuthStoreContext.Provider, { value: { user, isLoading, login, logout }, children });
}
