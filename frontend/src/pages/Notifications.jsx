import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import NotificationForm from '../components/forms/NotificationForm.jsx';

export default function Notifications() {
  const { notifications } = useData();
  const { openModal } = useModal();

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Notification center</p>
          <h2>SMS, email, and WhatsApp — every alert in one timeline.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Send notification', (close) => <NotificationForm close={close} />)}>Send notification</button>
      </div>
      <DataTable
        title="Notification log"
        rows={notifications}
        rowKey="id"
        searchKeys={['message', 'recipient', 'type']}
        pageSize={8}
        columns={[
          { key: 'type', label: 'Channel' },
          { key: 'message', label: 'Message' },
          { key: 'recipient', label: 'Recipient' },
          { key: 'time', label: 'When' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
      />
    </>
  );
}
