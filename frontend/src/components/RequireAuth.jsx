import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { allowedNav } from '../nav.js';

export function RequireAuth() {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RoleGate() {
  const { user } = useAuth();
  const location = useLocation();
  const pageId = location.pathname.replace('/', '') || 'dashboard';
  const allowed = allowedNav(user?.role).some((item) => item.id === pageId);
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
