import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { ALL_ROLES } from '../nav.js';

const MODULES = ['Dashboard', 'Patients', 'Appointments', 'OPD', 'IPD', 'Billing', 'Pharmacy', 'Laboratory', 'Radiology', 'Staff', 'Reports', 'Settings'];
const PERMS = ['view', 'create', 'edit', 'delete'];

export default function Roles() {
  const { rolePermissions, refresh } = useData();
  const showToast = useToast();

  const toggle = async (role, mod, key, checked) => {
    try {
      await apiFetch('/roles', { method: 'PATCH', body: JSON.stringify({ role, module: mod, key, value: checked }) });
      showToast(`${role} · ${mod} · ${key} ${checked ? 'granted' : 'revoked'}.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
      await refresh();
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Roles & permissions</p>
          <h2>Fine-grained, per-module access control for every role.</h2>
        </div>
      </div>
      {ALL_ROLES.map((role) => (
        <article className="card" key={role}>
          <div className="card-head"><h3>{role}</h3></div>
          <div className="table-scroll">
            <table className="perm-table">
              <thead><tr><th>Module</th><th>View</th><th>Create</th><th>Edit</th><th>Delete</th></tr></thead>
              <tbody>
                {MODULES.map((mod) => (
                  <tr key={mod}>
                    <td>{mod}</td>
                    {PERMS.map((perm) => (
                      <td key={perm}>
                        <input
                          type="checkbox"
                          disabled={role === 'Super Admin'}
                          checked={!!rolePermissions[role]?.[mod]?.[perm]}
                          onChange={(e) => toggle(role, mod, perm, e.target.checked)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </>
  );
}
