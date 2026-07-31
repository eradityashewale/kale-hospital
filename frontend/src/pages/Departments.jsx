import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import DataTable from '../components/DataTable.jsx';
import DepartmentForm from '../components/forms/DepartmentForm.jsx';

export default function Departments() {
  const { departments } = useData();
  const { openModal } = useModal();

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Departments, department heads, and daily patient load.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Add department', (close) => <DepartmentForm close={close} />)}>Add department</button>
      </div>
      <DataTable
        title="Departments"
        rows={departments}
        rowKey="id"
        searchKeys={['name', 'head']}
        pageSize={8}
        columns={[
          { key: 'name', label: 'Department' },
          { key: 'head', label: 'Head of department' },
          { key: 'doctors', label: 'Doctors' },
          { key: 'opdToday', label: 'OPD today' },
          { key: 'ipdToday', label: 'IPD today' },
        ]}
      />
    </>
  );
}
