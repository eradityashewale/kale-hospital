import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import DataTable from '../components/DataTable.jsx';
import UserForm from '../components/forms/UserForm.jsx';

export default function Users() {
  const { user: me } = useAuth();
  const { users, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();

  const deactivate = async (id) => {
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      showToast('Account deactivated.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Super Admin · Access</p>
          <h2>Provision accounts and assign roles across the platform.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Add user', (close) => <UserForm close={close} />)}>Add user</button>
      </div>
      <DataTable
        title="User accounts"
        rows={users}
        rowKey="id"
        searchKeys={['name', 'email', 'role']}
        pageSize={8}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'phone', label: 'Phone' },
        ]}
        actions={(row) => (row.id !== me.id
          ? <button className="subtle-btn" type="button" onClick={() => deactivate(row.id)}>Deactivate</button>
          : <span className="field-hint">You</span>)}
      />
    </>
  );
}
