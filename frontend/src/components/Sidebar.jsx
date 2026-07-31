import { NavLink } from 'react-router-dom';
import { allowedNav } from '../nav.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = allowedNav(user?.role);
  let lastGroup = null;

  return (
    <>
      <div className="sidebar-scrim" style={{ display: open ? 'block' : 'none' }} onClick={onClose} />
      <aside className="sidebar" style={open ? { transform: 'translateX(0)' } : undefined}>
        <div className="brand-block sidebar-brand">
          <div className="brand-badge">✚</div>
          <div>
            <p className="eyebrow">Hospital Management System</p>
            <h2>Kale Surgical Hospital</h2>
          </div>
          <button className="icon-btn sidebar-close" type="button" onClick={onClose}>✕</button>
        </div>
        <nav className="nav-list">
          {items.map((item) => {
            const groupHeader = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={item.id} style={{ display: 'contents' }}>
                {groupHeader ? <p className="nav-group-label">{item.group}</p> : null}
                <NavLink
                  to={`/${item.id}`}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="mini-card">
            <p>Live queue</p>
            <strong>14 patients waiting</strong>
          </div>
        </div>
      </aside>
    </>
  );
}
