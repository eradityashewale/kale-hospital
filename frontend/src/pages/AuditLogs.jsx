import { useData } from '../context/DataContext.jsx';
import DataTable from '../components/DataTable.jsx';

export default function AuditLogs() {
  const { auditLogs } = useData();

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Super Admin · Compliance</p>
          <h2>Complete, immutable audit trail of every action taken.</h2>
        </div>
      </div>
      <DataTable
        title="Audit logs"
        rows={auditLogs}
        rowKey="id"
        searchKeys={['user', 'action', 'module']}
        pageSize={10}
        columns={[
          { key: 'timestamp', label: 'Timestamp' },
          { key: 'user', label: 'User' },
          { key: 'action', label: 'Action' },
          { key: 'module', label: 'Module' },
          { key: 'ip', label: 'IP address' },
        ]}
      />
    </>
  );
}
