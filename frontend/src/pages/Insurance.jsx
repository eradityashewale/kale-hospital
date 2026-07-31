import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { formatCurrency } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import Pill from '../components/Pill.jsx';

export default function Insurance() {
  const { user } = useAuth();
  const { insuranceClaims, refresh } = useData();
  const showToast = useToast();
  const canManage = ['Super Admin', 'Admin'].includes(user.role);

  const updateStatus = async (id, status) => {
    try {
      const claim = await apiFetch(`/insurance-claims/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast(`Claim for ${claim.patient} ${status.toLowerCase()}.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total claims" value={insuranceClaims.length} meta="All time" icon="🛡" />
        <StatCard label="Approved amount" value={formatCurrency(insuranceClaims.reduce((s, c) => s + c.approved, 0))} meta="Settled by insurers" icon="✅" />
        <StatCard label="Pending amount" value={formatCurrency(insuranceClaims.reduce((s, c) => s + c.pending, 0))} meta="Awaiting approval" icon="⏳" />
        <StatCard label="Rejected claims" value={insuranceClaims.filter((c) => c.status === 'Rejected').length} meta="Needs review" icon="⚠" />
      </div>
      <DataTable
        title="Insurance claims"
        rows={insuranceClaims}
        rowKey="id"
        searchKeys={['patient', 'company', 'policyNo']}
        pageSize={8}
        columns={[
          { key: 'patient', label: 'Patient' },
          { key: 'company', label: 'Insurance company' },
          { key: 'policyNo', label: 'Policy no.' },
          { key: 'claimed', label: 'Claimed', render: (r) => formatCurrency(r.claimed) },
          { key: 'approved', label: 'Approved', render: (r) => formatCurrency(r.approved) },
          { key: 'pending', label: 'Pending', render: (r) => formatCurrency(r.pending) },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={canManage ? (row) => (row.status === 'Pending' ? (
          <>
            <button className="subtle-btn" type="button" onClick={() => updateStatus(row.id, 'Approved')}>Approve</button>
            <button className="subtle-btn" type="button" onClick={() => updateStatus(row.id, 'Rejected')}>Reject</button>
          </>
        ) : null) : null}
      />
    </>
  );
}
