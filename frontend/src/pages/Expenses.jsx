import { useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { formatCurrency, formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import ExpenseForm from '../components/forms/ExpenseForm.jsx';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function Expenses() {
  const { expenses, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();

  const thisMonthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonth())).reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const allTimeTotal = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const deleteExpense = async (row) => {
    if (!window.confirm(`Delete this ${row.category} expense of ${formatCurrency(row.amount)}?`)) return;
    try {
      await apiFetch(`/expenses/${row.id}`, { method: 'DELETE' });
      showToast('Expense deleted.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Expenses</p>
          <h2>Track pantry, equipment, and other operational spending.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Log expense', (close) => <ExpenseForm close={close} />)}>
          Log expense
        </button>
      </div>
      <div className="stats-grid">
        <StatCard label="This month" value={formatCurrency(thisMonthTotal)} meta="Total spent" icon="📅" />
        <StatCard label="All time" value={formatCurrency(allTimeTotal)} meta="Total spent" icon="💰" />
        <StatCard label="Entries" value={expenses.length} meta="Logged expenses" icon="🧾" />
      </div>
      <DataTable
        title="Expenses"
        rows={expenses}
        rowKey="id"
        searchKeys={['category', 'description', 'recordedBy']}
        pageSize={10}
        columns={[
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
          { key: 'recordedBy', label: 'Logged by' },
        ]}
        actions={(row) => <button className="subtle-btn" type="button" onClick={() => deleteExpense(row)}>Delete</button>}
      />
    </>
  );
}
