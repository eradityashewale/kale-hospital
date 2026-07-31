import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigation } from '../nav.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { initialsOf, formatCurrency } from '../utils.js';
import ChangePasswordModal from './ChangePasswordModal.jsx';
import AttendanceControl from './AttendanceControl.jsx';

export default function Topbar({ onOpenSidebar }) {
  const { user, logout } = useAuth();
  const data = useData();
  const { theme, toggleTheme } = useTheme();
  const { openModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setNotifOpen(false);
        setUserOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const activePageId = location.pathname.replace('/', '') || 'dashboard';
  const navItem = navigation.find((n) => n.id === activePageId);

  const searchGroups = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const groups = [
      { label: 'Patients', items: data.patients.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.mobile.includes(q)).slice(0, 4), render: (p) => `${p.name} · ${p.id}`, path: '/patients' },
      { label: 'Doctors', items: data.doctors.filter((d) => d.name.toLowerCase().includes(q) || d.department.toLowerCase().includes(q)).slice(0, 3), render: (d) => `${d.name} · ${d.department}`, path: '/staff' },
      { label: 'Bills', items: data.bills.filter((b) => b.id.toLowerCase().includes(q) || b.patient.toLowerCase().includes(q)).slice(0, 3), render: (b) => `${b.id} · ${b.patient} · ${formatCurrency(b.amount)}`, path: '/billing' },
      { label: 'Appointments', items: data.appointments.filter((a) => a.patient.toLowerCase().includes(q) || a.token.toLowerCase().includes(q)).slice(0, 3), render: (a) => `${a.token} · ${a.patient} · ${a.time}`, path: '/appointments' },
      { label: 'Medicines', items: data.medicines.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 3), render: (m) => `${m.name} · ${m.stock} ${m.unit}`, path: '/pharmacy' },
      { label: 'Staff', items: [...data.doctors, ...data.nurses, ...data.receptionists].filter((s) => s.name.toLowerCase().includes(q)).slice(0, 3), render: (s) => s.name, path: '/staff' },
    ].filter((g) => g.items.length);
    return groups;
  }, [query, data]);

  const unreadCount = data.notifications.filter((n) => !n.read).length;

  const goto = (path) => {
    setQuery('');
    setNotifOpen(false);
    setUserOpen(false);
    navigate(path);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn sidebar-toggle" type="button" onClick={onOpenSidebar}>☰</button>
        <div>
          <p className="breadcrumbs">{navItem?.group || 'Overview'} / {navItem?.label || 'Dashboard'}</p>
          <h3>{navItem?.label || 'Dashboard'}</h3>
        </div>
      </div>
      <div className="topbar-actions" ref={wrapRef}>
        <label className="search-box">
          <span>⌕</span>
          <input
            placeholder="Search patients, doctors, bills, staff..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {query.trim() ? (
          <div className="search-results">
            {searchGroups.length ? searchGroups.map((group) => (
              <div key={group.label}>
                <p className="result-group">{group.label}</p>
                {group.items.map((item, i) => (
                  <div className="result-row" key={i} onClick={() => goto(group.path)}>
                    <span>{group.render(item)}</span><span>›</span>
                  </div>
                ))}
              </div>
            )) : <div className="result-empty">No matches found.</div>}
          </div>
        ) : null}

        <AttendanceControl />

        <div className="popover-wrap">
          <button className="icon-btn" type="button" onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}>
            🔔
            <span className={`badge-dot ${unreadCount > 0 ? 'show' : ''}`} />
          </button>
          {notifOpen ? (
            <div className="popover">
              <div className="popover-title"><span>Notifications</span></div>
              {data.notifications.slice(0, 6).map((n) => (
                <div className="popover-item" key={n.id} style={{ fontWeight: n.read ? 400 : 700 }}>
                  <span>{n.type} · {n.recipient}</span>
                  <small>{n.message}</small>
                  <small>{n.time}</small>
                </div>
              )) }
              {!data.notifications.length ? <div className="popover-empty">No notifications yet.</div> : null}
            </div>
          ) : null}
        </div>

        <button className="icon-btn" type="button" onClick={toggleTheme}>{theme === 'dark' ? '☀' : '☾'}</button>

        <div className="popover-wrap">
          <button className="icon-btn user-chip" type="button" onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}>
            {initialsOf(user?.name)}
          </button>
          {userOpen ? (
            <div className="popover">
              <div className="popover-title"><span>{user?.name}</span></div>
              <div className="popover-item"><small>{user?.role}</small><small>{user?.email}</small></div>
              <button className="ghost-btn" type="button" style={{ width: '100%' }} onClick={() => goto('/profile')}>View profile</button>
              <button className="ghost-btn" type="button" style={{ width: '100%' }} onClick={() => { setUserOpen(false); openModal('Change password', (close) => <ChangePasswordModal close={close} />); }}>Change password</button>
              <button className="danger-btn" type="button" style={{ width: '100%' }} onClick={logout}>Sign out</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
