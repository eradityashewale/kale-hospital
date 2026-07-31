import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import StatCard from '../components/StatCard.jsx';
import BedBuildingForm from '../components/forms/BedBuildingForm.jsx';
import BedFloorForm from '../components/forms/BedFloorForm.jsx';
import BedForm from '../components/forms/BedForm.jsx';

function bedCellClass(status) {
  return { Available: 'available', Occupied: 'occupied', Reserved: 'reserved', Cleaning: 'cleaning' }[status] || 'available';
}

export default function Beds() {
  const { user } = useAuth();
  const { bedBuildings, refresh } = useData();
  const showToast = useToast();
  const { openModal } = useModal();
  const canManage = ['Super Admin', 'Admin', 'Nurse'].includes(user.role);

  const all = [];
  bedBuildings.forEach((b) => b.floors.forEach((f) => f.beds.forEach((bed) => all.push(bed))));
  const counts = ['Available', 'Occupied', 'Reserved', 'Cleaning'].map((s) => ({ status: s, count: all.filter((b) => b.status === s).length }));

  const cycleBed = async (bedId) => {
    try {
      const result = await apiFetch(`/beds/${bedId}/cycle`, { method: 'POST' });
      showToast(`${result.id} marked as ${result.status}.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteBed = async (bed) => {
    if (!window.confirm(`Remove bed ${bed.id}?`)) return;
    try {
      await apiFetch(`/beds/${bed.id}`, { method: 'DELETE' });
      showToast(`${bed.id} removed.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteFloor = async (floor) => {
    if (!window.confirm(`Remove floor "${floor.floor}" and all its beds?`)) return;
    try {
      await apiFetch(`/beds/floors/${floor.id}`, { method: 'DELETE' });
      showToast(`${floor.floor} removed.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteBuilding = async (building) => {
    if (!window.confirm(`Remove building "${building.building}" and everything in it?`)) return;
    try {
      await apiFetch(`/beds/buildings/${building.id}`, { method: 'DELETE' });
      showToast(`${building.building} removed.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="stats-grid">
        {counts.map((c) => <StatCard key={c.status} label={c.status} value={c.count} meta={`of ${all.length} beds`} icon="🛏" />)}
      </div>
      <article className="card">
        <div className="card-head">
          <h3>Bed occupancy map</h3>
          <div className="flex-row" style={{ gap: 10 }}>
            <span className="field-hint">{canManage ? 'Click a bed to cycle its status' : ''}</span>
            {canManage ? (
              <button className="primary-btn" type="button" onClick={() => openModal('Add building', (close) => <BedBuildingForm close={close} />)}>
                + Add building
              </button>
            ) : null}
          </div>
        </div>
        <div className="bed-legend">
          <span><span className="bed-dot" style={{ background: 'var(--status-good)' }} />Available</span>
          <span><span className="bed-dot" style={{ background: 'var(--status-critical)' }} />Occupied</span>
          <span><span className="bed-dot" style={{ background: 'var(--status-warning)' }} />Reserved</span>
          <span><span className="bed-dot" style={{ background: 'var(--muted)' }} />Cleaning</span>
        </div>
        {bedBuildings.map((b) => (
          <div className="bed-section" key={b.id}>
            <div className="bed-section-head">
              <h4>{b.building}</h4>
              {canManage ? (
                <div className="bed-section-actions">
                  <button className="icon-btn" type="button" title="Rename building" onClick={() => openModal('Edit building', (close) => <BedBuildingForm close={close} building={b} />)}>✏️</button>
                  <button className="icon-btn" type="button" title="Delete building" onClick={() => deleteBuilding(b)}>🗑️</button>
                  <button className="subtle-btn" type="button" onClick={() => openModal('Add floor', (close) => <BedFloorForm close={close} buildingId={b.id} />)}>+ Add floor</button>
                </div>
              ) : null}
            </div>
            {b.floors.map((f) => (
              <div key={f.id}>
                <div className="bed-floor-head">
                  <p className="field-hint">{f.floor} · {f.type}</p>
                  {canManage ? (
                    <div className="bed-section-actions">
                      <button className="icon-btn" type="button" title="Edit floor" onClick={() => openModal('Edit floor', (close) => <BedFloorForm close={close} floor={f} />)}>✏️</button>
                      <button className="icon-btn" type="button" title="Delete floor" onClick={() => deleteFloor(f)}>🗑️</button>
                      <button className="subtle-btn" type="button" onClick={() => openModal('Add bed', (close) => <BedForm close={close} floorId={f.id} />)}>+ Add bed</button>
                    </div>
                  ) : null}
                </div>
                <div className="bed-grid">
                  {f.beds.map((bed) => (
                    <div className="bed-cell-wrap" key={bed.id}>
                      <button
                        type="button"
                        className={`bed-cell ${bedCellClass(bed.status)}`}
                        disabled={!canManage}
                        onClick={canManage ? () => cycleBed(bed.id) : undefined}
                      >
                        <span>{bed.id}</span><span>{bed.status}</span>
                      </button>
                      {canManage ? (
                        <button type="button" className="bed-cell-delete" title="Remove bed" onClick={() => deleteBed(bed)}>×</button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </article>
    </>
  );
}
