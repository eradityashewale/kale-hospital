import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import VendorForm from '../components/forms/VendorForm.jsx';

export default function Vendors() {
  const { vendors, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();

  const deactivate = async (id) => {
    try {
      await apiFetch(`/vendors/${id}`, { method: 'DELETE' });
      showToast('Vendor deactivated.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Procurement</p>
          <h2>Vendors and suppliers for pharmacy and equipment purchases.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Add vendor', (close) => <VendorForm close={close} />)}>Add vendor</button>
      </div>
      <DataTable
        title="Vendors"
        rows={vendors}
        rowKey="id"
        searchKeys={['name', 'category', 'contactPerson']}
        pageSize={8}
        columns={[
          { key: 'name', label: 'Vendor' },
          { key: 'category', label: 'Category' },
          { key: 'contactPerson', label: 'Contact person' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => (row.status === 'Active'
          ? <button className="subtle-btn" type="button" onClick={() => deactivate(row.id)}>Deactivate</button>
          : null)}
      />
    </>
  );
}
