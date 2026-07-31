import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import BranchForm from '../components/forms/BranchForm.jsx';

export default function Branches() {
  const { branches } = useData();
  const { openModal } = useModal();

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Super Admin · Multi-branch</p>
          <h2>Manage every hospital branch from one console.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Add branch', (close) => <BranchForm close={close} />)}>Add branch</button>
      </div>
      <DataTable
        title="Branches"
        rows={branches}
        rowKey="id"
        searchKeys={['name', 'location']}
        pageSize={8}
        columns={[
          { key: 'name', label: 'Branch' },
          { key: 'location', label: 'Location' },
          { key: 'beds', label: 'Beds' },
          { key: 'staff', label: 'Staff' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
      />
    </>
  );
}
