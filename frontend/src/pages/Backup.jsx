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
    try {
      await apiFetch(`/backup/${id}/restore`, { method: 'POST' });
      showToast(`Restore initiated from ${id}. This may take a few minutes.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Super Admin · Data protection</p>
          <h2>Automatic daily backups keep every record safe.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={runBackup}>Run backup now</button>
      </div>
      <article className="card">
        <div className="card-head"><h3>Backup schedule</h3></div>
        <div className="list-stack">
          <div className="item"><span>Daily automatic backup</span><span className="pill good">Enabled · 03:00 daily</span></div>
          <div className="item"><span>Retention policy</span><span>30 days</span></div>
          <div className="item"><span>Storage target</span><span>AWS S3 (ap-south-1)</span></div>
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
