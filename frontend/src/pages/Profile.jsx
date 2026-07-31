import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { downloadTextFile, initialsOf, validateForm } from '../utils.js';
import QuickActions from '../components/QuickActions.jsx';
import FormField from '../components/FormField.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';

function EditProfileForm({ close }) {
  const { user, updateUser } = useAuth();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      const updated = await apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify({ name: data.get('name'), phone: data.get('phone') }) });
      updateUser(updated);
      showToast('Profile updated.', 'success');
      close();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Full name" name="name" defaultValue={user.name} required full />
        <FormField label="Phone" name="phone" defaultValue={user.phone || ''} />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Save changes</button>
      </div>
    </form>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const data = useData();
  const { openModal } = useModal();
  const showToast = useToast();

  const myAttendance = [...data.attendanceRecords]
    .filter((r) => r.staff === user.name)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="grid-2">
        <article className="card">
          <div className="profile-header">
            <div className="profile-avatar">{initialsOf(user.name)}</div>
            <div><h3>{user.name}</h3><p className="field-hint">{user.role}</p></div>
          </div>
          <div className="kv-grid" style={{ marginTop: 16 }}>
            <div className="kv-item"><span>Email</span><strong>{user.email}</strong></div>
            <div className="kv-item"><span>Phone</span><strong>{user.phone || '—'}</strong></div>
            <div className="kv-item"><span>Role</span><strong>{user.role}</strong></div>
            <div className="kv-item"><span>Department / Ward</span><strong>{user.department || user.ward || '—'}</strong></div>
          </div>
        </article>
        <article className="card">
          <div className="card-head"><h3>Quick actions</h3></div>
          <QuickActions actions={[
            { icon: '✏️', label: 'Edit profile', onClick: () => openModal('Edit profile', (close) => <EditProfileForm close={close} />) },
            { icon: '🔑', label: 'Change password', onClick: () => openModal('Change password', (close) => <ChangePasswordModal close={close} />) },
            { icon: '📤', label: 'Export profile', onClick: () => { downloadTextFile('profile.json', JSON.stringify(user, null, 2)); showToast('Profile exported.', 'success'); } },
            { icon: '↪️', label: 'Sign out', onClick: logout },
          ]}
          />
        </article>
      </div>
      <DataTable
        title="My attendance"
        rows={myAttendance}
        rowKey="id"
        searchKeys={['date', 'shift', 'status']}
        pageSize={8}
        searchPlaceholder="Search by date, shift, status..."
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'shift', label: 'Shift' },
          { key: 'checkIn', label: 'Check-in' },
          { key: 'checkOut', label: 'Check-out' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
      />
    </>
  );
}
