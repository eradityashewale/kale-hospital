import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { formatCurrency, formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import MedicineForm from '../components/forms/MedicineForm.jsx';

function isExpiringSoon(dateStr) {
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 45;
}

function medicineStatus(med) {
  if (med.stock <= 10) return 'Low';
  if (isExpiringSoon(med.expiry)) return 'Expiring Soon';
  return 'Healthy';
}

export default function Pharmacy() {
  const { medicines, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();
  const lowStock = medicines.filter((m) => medicineStatus(m) !== 'Healthy');

  const issueMedicine = async (id) => {
    try {
      const med = await apiFetch(`/pharmacy/${id}/issue`, { method: 'POST' });
      showToast(`1 unit of ${med.name} issued. Remaining stock: ${med.stock}.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      {lowStock.length ? (
        <div className="hero-card" style={{ background: 'linear-gradient(135deg, rgba(208,59,59,0.92), rgba(236,131,90,0.85))' }}>
          <div><p className="eyebrow">Pharmacy alerts</p><h2>{lowStock.length} item{lowStock.length === 1 ? '' : 's'} need attention — low stock or nearing expiry.</h2></div>
        </div>
      ) : null}
      <div className="hero-card">
        <div>
          <p className="eyebrow">Pharmacy</p>
          <h2>Medicine inventory, purchases, and issuance.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Add medicine', (close) => <MedicineForm close={close} />)}>Add medicine</button>
      </div>
      <DataTable
        title="Medicine inventory"
        rows={medicines}
        rowKey="id"
        searchKeys={['name', 'category', 'supplier']}
        pageSize={8}
        columns={[
          { key: 'name', label: 'Medicine' },
          { key: 'category', label: 'Category' },
          { key: 'stock', label: 'Stock', render: (r) => `${r.stock} ${r.unit}` },
          { key: 'expiry', label: 'Expiry', render: (r) => formatDate(r.expiry) },
          { key: 'supplier', label: 'Supplier' },
          { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
          { key: 'status', label: 'Status', render: (r) => <Pill status={medicineStatus(r)} /> },
        ]}
        actions={(row) => <button className="subtle-btn" type="button" onClick={() => issueMedicine(row.id)}>Issue</button>}
      />
    </>
  );
}
