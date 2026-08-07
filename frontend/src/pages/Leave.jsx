import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import Pill from '../components/Pill.jsx';
import LeaveForm from '../components/forms/LeaveForm.jsx';

const APPROVER_ROLES = ['Super Admin', 'Admin'];
const LEAVE_TYPES = ['Sick', 'Casual', 'Paid', 'Unpaid'];

function RejectForm({ close, onSubmit }) {
  const [note, setNote] = useState('');
  return (
    <form className="modal-form" onSubmit={(e) => { e.preventDefault(); onSubmit(note); }}>
      <div className="form-grid">
        <label className="form-full">
          Reason for rejection (optional)
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Reject request</button>
      </div>
    </form>
  );
}

function BalanceCell({ userId, leaveType, value, onSave }) {
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);

  return (
    <input
      type="number"
      min="0"
      value={val}
      style={{ width: '4.5rem' }}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        const num = Number(val);
        if (Number.isFinite(num) && num >= 0 && num !== value) onSave(userId, leaveType, num);
        else setVal(value);
      }}
    />
  );
}

export default function Leave() {
  const { user } = useAuth();
  const { leaveRequests, leaveBalances, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();
  const isApprover = APPROVER_ROLES.includes(user.role);
  const [tab, setTab] = useState(isApprover ? 'approvals' : 'my-requests');

  const myRequests = leaveRequests.filter((l) => l.userId === user.id);
  const myBalances = leaveBalances.filter((b) => b.userId === user.id);

  const cancelRequest = async (id) => {
    try {
      await apiFetch(`/leave/${id}`, { method: 'DELETE' });
      showToast('Leave request cancelled.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const approve = async (id) => {
    try {
      await apiFetch(`/leave/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) });
      showToast('Leave request approved.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const reject = (id) => {
    openModal('Reject leave request', (close) => (
      <RejectForm
        close={close}
        onSubmit={async (note) => {
          try {
            await apiFetch(`/leave/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Rejected', review_note: note }) });
            showToast('Leave request rejected.', 'success');
            close();
            await refresh();
          } catch (err) {
            showToast(err.message, 'error');
          }
        }}
      />
    ));
  };

  const updateBalance = async (userId, leaveType, allocated) => {
    try {
      await apiFetch(`/leave/balances/${userId}/${leaveType}`, { method: 'PATCH', body: JSON.stringify({ allocated }) });
      showToast('Leave balance updated.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const balancesByUser = useMemo(() => {
    const map = new Map();
    for (const b of leaveBalances) {
      if (!map.has(b.userId)) map.set(b.userId, { userId: b.userId, name: b.name, role: b.role });
      map.get(b.userId)[b.leaveType] = b;
    }
    return Array.from(map.values());
  }, [leaveBalances]);

  const pendingCount = myRequests.filter((l) => l.status === 'Pending').length;
  const approvedCount = myRequests.filter((l) => l.status === 'Approved').length;
  const rejectedCount = myRequests.filter((l) => l.status === 'Rejected').length;

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Leave</p>
          <h2>{isApprover ? 'Review leave requests and manage balances.' : 'Apply for leave and track approvals.'}</h2>
        </div>
        {!isApprover ? (
          <button className="primary-btn" type="button" onClick={() => openModal('Apply for leave', (close) => <LeaveForm close={close} />)}>
            Apply for leave
          </button>
        ) : null}
      </div>
      {isApprover ? (
        <article className="card">
          <div className="tabs">
            <button type="button" className={`tab-btn ${tab === 'approvals' ? 'active' : ''}`} onClick={() => setTab('approvals')}>Approvals</button>
            <button type="button" className={`tab-btn ${tab === 'balances' ? 'active' : ''}`} onClick={() => setTab('balances')}>Balances</button>
          </div>
        </article>
      ) : null}
      {!isApprover ? (
        <>
          <div className="stats-grid">
            {myBalances.map((b) => (
              <StatCard key={b.leaveType} label={`${b.leaveType} leave`} value={`${b.remaining}/${b.allocated}`} meta={`${b.used} used`} icon="🌴" />
            ))}
          </div>
          <div className="stats-grid">
            <StatCard label="Pending" value={pendingCount} meta="Awaiting review" icon="⏳" />
            <StatCard label="Approved" value={approvedCount} meta="Confirmed leave" icon="✅" />
            <StatCard label="Rejected" value={rejectedCount} meta="Not approved" icon="✕" />
          </div>
          <DataTable
            title="My leave requests"
            rows={myRequests}
            rowKey="id"
            searchKeys={['leaveType', 'status']}
            pageSize={8}
            columns={[
              { key: 'leaveType', label: 'Type' },
              { key: 'startDate', label: 'From' },
              { key: 'endDate', label: 'To' },
              { key: 'reason', label: 'Reason' },
              { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
              { key: 'appliedAt', label: 'Applied' },
            ]}
            actions={(row) => (row.status === 'Pending'
              ? <button className="subtle-btn" type="button" onClick={() => cancelRequest(row.id)}>Cancel</button>
              : null)}
          />
        </>
      ) : null}
      {tab === 'approvals' ? (
        <DataTable
          title="Leave approvals"
          rows={leaveRequests}
          rowKey="id"
          searchKeys={['requesterName', 'role', 'leaveType', 'status']}
          pageSize={8}
          columns={[
            { key: 'requesterName', label: 'Employee' },
            { key: 'role', label: 'Role' },
            { key: 'leaveType', label: 'Type' },
            { key: 'startDate', label: 'From' },
            { key: 'endDate', label: 'To' },
            { key: 'reason', label: 'Reason' },
            { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
            { key: 'reviewedBy', label: 'Reviewed by' },
          ]}
          actions={(row) => (row.status === 'Pending' ? (
            <>
              <button className="subtle-btn" type="button" onClick={() => approve(row.id)}>Approve</button>
              <button className="subtle-btn" type="button" onClick={() => reject(row.id)}>Reject</button>
            </>
          ) : null)}
        />
      ) : null}
      {tab === 'balances' && isApprover ? (
        <DataTable
          title="Leave balances"
          rows={balancesByUser}
          rowKey="userId"
          searchKeys={['name', 'role']}
          pageSize={10}
          searchPlaceholder="Search employees..."
          columns={[
            { key: 'name', label: 'Employee' },
            { key: 'role', label: 'Role' },
            ...LEAVE_TYPES.map((lt) => ({
              key: lt,
              label: lt,
              sortable: false,
              render: (row) => (
                <div className="flex-row">
                  <BalanceCell userId={row.userId} leaveType={lt} value={row[lt]?.allocated ?? 0} onSave={updateBalance} />
                  <span className="field-hint">{row[lt]?.used ?? 0} used</span>
                </div>
              ),
            })),
          ]}
        />
      ) : null}
    </>
  );
}
