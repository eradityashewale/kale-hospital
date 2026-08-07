import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';

export default function Backup() {
  const { backupHistory, refresh } = useData();
  const showToast = useToast();

  const runBackup = async () => {
    try {
      await apiFetch('/backup/run', { method: 'POST' });
      showToast('Backup completed successfully.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const restore = async (id) => {
    if (!window.confirm(`Restore from backup ${id}? This will replace all current data with the data from this backup.`)) return;
    try {
      await apiFetch(`/backup/${id}/restore`, { method: 'POST' });
      showToast(`Restored from ${id}. Reloading...`, 'success');
      window.location.reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Super Admin · Data protection</p>
          <h2>Run an on-demand backup of every table, or restore a previous one.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={runBackup}>Run backup now</button>
      </div>
      <article className="card">
        <div className="card-head"><h3>Backup details</h3></div>
        <div className="list-stack">
          <div className="item"><span>Backup type</span><span>Full table export (JSON), on-demand</span></div>
          <div className="item"><span>Storage</span><span>Server-local disk (backend/backups/)</span></div>
        </div>
      </article>
      <DataTable
        title="Backup history"
        rows={backupHistory}
        rowKey="id"
        pageSize={8}
        columns={[
          { key: 'id', label: 'Backup ID' }, { key: 'date', label: 'Date & time' }, { key: 'size', label: 'Size' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => <button className="subtle-btn" type="button" onClick={() => restore(row.id)}>Restore</button>}
      />
    </>
  );
}
