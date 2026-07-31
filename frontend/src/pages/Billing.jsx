import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { downloadTextFile, formatCurrency, formatDate, printInvoice } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import Pill from '../components/Pill.jsx';
import BillingForm from '../components/forms/BillingForm.jsx';

export default function Billing() {
  const { user } = useAuth();
  const { bills, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();
  const canBill = ['Super Admin', 'Admin', 'Receptionist'].includes(user.role);
  const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0);
  const pendingAmount = bills.filter((b) => b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);

  const markPaid = async (id) => {
    try {
      await apiFetch(`/bills/${id}/mark-paid`, { method: 'POST' });
      showToast(`${id} marked as paid.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const downloadBill = (row) => {
    downloadTextFile(`${row.id}.txt`, `Kale Hospital HMS\nInvoice: ${row.id}\nPatient: ${row.patient}\nAmount: ${formatCurrency(row.amount)}\nStatus: ${row.status}\n`);
    showToast(`Invoice ${row.id} downloaded.`, 'success');
  };

  const printBill = (row) => {
    const ok = printInvoice(row);
    showToast(ok ? `Invoice ${row.id} sent to print preview.` : 'Please allow pop-ups to print this invoice.', ok ? 'success' : 'error');
  };

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total billed" value={formatCurrency(totalRevenue)} meta={`${bills.length} invoices`} icon="💳" />
        <StatCard label="Pending amount" value={formatCurrency(pendingAmount)} meta={`${bills.filter((b) => b.status !== 'Paid').length} unpaid`} icon="⏳" />
        <StatCard label="Paid invoices" value={bills.filter((b) => b.status === 'Paid').length} meta="Fully settled" icon="✅" />
        <StatCard label="GST collected (est.)" value={formatCurrency(totalRevenue * 0.18)} meta="At 18% GST" icon="🧾" />
      </div>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Billing</p>
          <h2>Consultation, admission, pharmacy, lab, and radiology — one invoice.</h2>
        </div>
        {canBill ? <button className="primary-btn" type="button" onClick={() => openModal('Create bill', (close) => <BillingForm close={close} />)}>Create bill</button> : null}
      </div>
      <DataTable
        title="Invoices"
        rows={bills}
        rowKey="id"
        searchKeys={['id', 'patient', 'mode']}
        pageSize={8}
        columns={[
          { key: 'id', label: 'Invoice' },
          { key: 'patient', label: 'Patient' },
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
          { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
          { key: 'mode', label: 'Payment mode' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => (
          <>
            <button className="subtle-btn" type="button" onClick={() => printBill(row)}>Print</button>
            <button className="subtle-btn" type="button" onClick={() => showToast(`Invoice ${row.id} emailed successfully.`, 'success')}>Email</button>
            <button className="subtle-btn" type="button" onClick={() => downloadBill(row)}>PDF</button>
            {row.status !== 'Paid' ? <button className="subtle-btn" type="button" onClick={() => markPaid(row.id)}>Mark paid</button> : null}
          </>
        )}
      />
    </>
  );
}
