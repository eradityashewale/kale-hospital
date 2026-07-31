import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import StatCard from '../components/StatCard.jsx';
import StaffForm from '../components/forms/StaffForm.jsx';

const TABS = [
  ['doctors', 'Doctors'], ['nurses', 'Nurses'], ['receptionists', 'Receptionists'],
  ['labTechs', 'Lab Technicians'], ['pharmacists', 'Pharmacists'], ['attendance', 'Attendance'],
];

function columnsFor(tab) {
  if (tab === 'doctors') return [
    { key: 'name', label: 'Name' }, { key: 'department', label: 'Department' }, { key: 'specialization', label: 'Specialization' },
    { key: 'experience', label: 'Experience' }, { key: 'shift', label: 'Shift' }, { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
  ];
  if (tab === 'nurses') return [
    { key: 'name', label: 'Name' }, { key: 'ward', label: 'Ward' }, { key: 'shift', label: 'Shift' }, { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
  ];
  if (tab === 'receptionists') return [
    { key: 'name', label: 'Name' }, { key: 'desk', label: 'Desk' }, { key: 'shift', label: 'Shift' }, { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
  ];
  return [
    { key: 'name', label: 'Name' }, { key: 'dept', label: 'Department' }, { key: 'shift', label: 'Shift' }, { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
  ];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildRoster(data) {
  const roster = [
    ...data.doctors.map((d) => ({ name: d.name, role: 'Doctor', shift: d.shift })),
    ...data.nurses.map((n) => ({ name: n.name, role: 'Nurse', shift: n.shift })),
    ...data.receptionists.map((r) => ({ name: r.name, role: 'Receptionist', shift: r.shift })),
    ...data.labTechnicians.map((t) => ({ name: t.name, role: 'Lab Technician', shift: t.shift })),
    ...data.pharmacists.map((p) => ({ name: p.name, role: 'Pharmacist', shift: p.shift })),
  ];
  // Admins and Super Admins aren't in any of the role tables above, but a Super Admin
  // viewer gets the full login roster from bootstrap - fold in whoever's missing so
  // Admin/Super Admin accounts show up too instead of only appearing once they've checked in.
  const known = new Set(roster.map((p) => p.name));
  for (const u of data.users || []) {
    if (!known.has(u.name)) {
      roster.push({ name: u.name, role: u.role, shift: '' });
      known.add(u.name);
    }
  }
  return roster;
}

function AttendanceView({ data }) {
  const [date, setDate] = useState(todayIso());
  const [role, setRole] = useState('All');
  const [shift, setShift] = useState('All');

  const roster = useMemo(() => buildRoster(data), [data]);
  const rosterNames = useMemo(() => new Set(roster.map((p) => p.name)), [roster]);

  const recordsForDate = useMemo(
    () => data.attendanceRecords.filter((r) => r.date === date),
    [data.attendanceRecords, date]
  );

  // Every roster member shows up for the selected date, even if they never checked in -
  // that's the whole point of an "all employees, every role" attendance view.
  const rows = useMemo(() => {
    const merged = roster.map((person) => {
      const rec = recordsForDate.find((r) => r.staff === person.name);
      if (rec) return { ...rec, shift: rec.shift || person.shift || 'General' };
      return {
        id: `absent-${person.name}-${date}`,
        staff: person.name,
        role: person.role,
        shift: person.shift || 'General',
        date,
        checkIn: '—',
        checkOut: '—',
        status: date === todayIso() ? 'Not Checked In' : 'Absent',
      };
    });
    const extra = recordsForDate.filter((r) => !rosterNames.has(r.staff));
    return [...merged, ...extra];
  }, [roster, recordsForDate, rosterNames, date]);

  const roleOptions = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.role))).sort()], [rows]);
  const shiftOptions = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.shift).filter(Boolean))).sort()], [rows]);

  const filteredRows = rows.filter((r) => (role === 'All' || r.role === role) && (shift === 'All' || r.shift === shift));

  const presentCount = filteredRows.filter((r) => r.checkIn && r.checkIn !== '—').length;
  const checkedOutCount = filteredRows.filter((r) => r.checkOut && r.checkOut !== '—').length;
  const onLeaveCount = filteredRows.filter((r) => r.status === 'On Leave').length;
  const notMarkedCount = filteredRows.filter((r) => (!r.checkIn || r.checkIn === '—') && r.status !== 'On Leave').length;

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Present" value={presentCount} meta={`of ${filteredRows.length} staff`} icon="✅" />
        <StatCard label="Checked out" value={checkedOutCount} meta="Completed shift" icon="🚪" />
        <StatCard label={date === todayIso() ? 'Not checked in' : 'Absent'} value={notMarkedCount} meta={date === todayIso() ? 'So far today' : 'That day'} icon="⏳" />
        <StatCard label="On leave" value={onLeaveCount} meta="Marked leave" icon="🌴" />
      </div>
      <DataTable
        title="Attendance"
        rows={filteredRows}
        rowKey="id"
        searchKeys={['staff', 'role', 'shift']}
        pageSize={8}
        toolbarExtra={
          <div className="attendance-filters">
            <input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {roleOptions.map((r) => <option key={r} value={r}>{r === 'All' ? 'All roles' : r}</option>)}
            </select>
            <select value={shift} onChange={(e) => setShift(e.target.value)}>
              {shiftOptions.map((s) => <option key={s} value={s}>{s === 'All' ? 'All shifts' : s}</option>)}
            </select>
          </div>
        }
        columns={[
          { key: 'staff', label: 'Staff' },
          { key: 'role', label: 'Role' },
          { key: 'shift', label: 'Shift' },
          { key: 'checkIn', label: 'Check-in' },
          { key: 'checkOut', label: 'Check-out' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
      />
    </>
  );
}

export default function Staff() {
  const data = useData();
  const { openModal } = useModal();
  const [tab, setTab] = useState('doctors');
  const staffMap = { doctors: data.doctors, nurses: data.nurses, receptionists: data.receptionists, labTechs: data.labTechnicians, pharmacists: data.pharmacists };
  const tabLabel = TABS.find((t) => t[0] === tab)[1];

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Staff management</p>
          <h2>Doctors, nurses, receptionists, technicians, and attendance.</h2>
        </div>
        {tab !== 'attendance' ? (
          <button className="primary-btn" type="button" onClick={() => openModal(`Add ${tabLabel.replace(/s$/, '')}`, (close) => <StaffForm close={close} role={tab} />)}>
            Add {tabLabel.replace(/s$/, '')}
          </button>
        ) : null}
      </div>
      <article className="card">
        <div className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </article>
      {tab === 'attendance' ? (
        <AttendanceView data={data} />
      ) : (
        <DataTable
          title={tabLabel}
          rows={staffMap[tab]}
          rowKey="id"
          searchKeys={['name']}
          pageSize={8}
          columns={columnsFor(tab)}
        />
      )}
    </>
  );
}
