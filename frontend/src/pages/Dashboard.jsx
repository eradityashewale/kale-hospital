import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { usePatientDrawer } from '../hooks/usePatientDrawer.jsx';
import StatCard from '../components/StatCard.jsx';
import QuickActions from '../components/QuickActions.jsx';
import MiniCalendar from '../components/MiniCalendar.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import LineChart from '../components/charts/LineChart.jsx';
import BarChart from '../components/charts/BarChart.jsx';
import HBarChart from '../components/charts/HBarChart.jsx';
import { formatCurrency, formatDate, todayISO, seriesColor } from '../utils.js';
import AppointmentForm from '../components/forms/AppointmentForm.jsx';
import AdmissionForm from '../components/forms/AdmissionForm.jsx';
import BillingForm from '../components/forms/BillingForm.jsx';
import PrescriptionForm from '../components/forms/PrescriptionForm.jsx';
import VitalsForm from '../components/forms/VitalsForm.jsx';
import ReferralForm from '../components/forms/ReferralForm.jsx';

const revenueTrend = [64, 82, 76, 91, 97, 118, 132];
const revenueTrendLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug (proj.)'];
const patientGrowth = [210, 238, 255, 271, 298, 322];
const patientGrowthLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const monthlyAdmissions = [38, 44, 41, 52, 49, 58];
const appointmentStats = [
  { label: 'Confirmed', value: 62 }, { label: 'Pending', value: 21 },
  { label: 'Completed', value: 84 }, { label: 'Cancelled', value: 9 },
];

function flattenBeds(bedBuildings) {
  const all = [];
  bedBuildings.forEach((b) => b.floors.forEach((f) => f.beds.forEach((bed) => all.push({ ...bed, type: f.type }))));
  return all;
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'Doctor') return <DoctorDashboard />;
  if (user.role === 'Receptionist') return <ReceptionistDashboard />;
  if (user.role === 'Nurse') return <NurseDashboard />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const data = useData();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const today = todayISO();
  const beds = flattenBeds(data.bedBuildings);
  const icuBeds = beds.filter((b) => b.type === 'Intensive Care');

  const k = {
    todaysPatients: data.patients.filter((p) => p.visits.some((v) => v.date === today)).length || 12,
    todaysAppointments: data.appointments.filter((a) => a.date === today).length,
    opdPatients: data.patients.filter((p) => p.status === 'OPD').length,
    ipdPatients: data.patients.filter((p) => p.status === 'IPD' || p.status === 'Critical').length,
    doctorsAvailable: data.doctors.filter((d) => d.status === 'Available').length,
    bedAvailability: `${beds.filter((b) => b.status === 'Available').length}/${beds.length}`,
    icuBeds: `${icuBeds.filter((b) => b.status === 'Available').length}/${icuBeds.length}`,
    emergencyPatients: data.emergencyCases.length,
    pendingBills: data.bills.filter((b) => b.status !== 'Paid').length,
    revenueToday: data.bills.filter((b) => b.date === today).reduce((sum, b) => sum + b.amount, 0) || 42500,
    monthlyRevenue: revenueTrend.slice(0, 6).reduce((a, b) => a + b, 0) * 1000,
    recentAdmissions: data.ipdAdmissions.filter((a) => a.status === 'Admitted').slice(0, 5),
    recentDischarges: data.ipdAdmissions.filter((a) => a.status === 'Discharged').slice(0, 5),
  };

  return (
    <>
      <section className="hero-card">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Everything you need to run a high-performing hospital.</h2>
          <div className="badge-row"><span>Live vitals</span><span>Role-based access</span><span>Secure sessions</span></div>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" type="button" onClick={() => navigate('/registration')}>Register patient</button>
          <button className="ghost-btn" type="button" onClick={() => openModal('Book appointment', (close) => <AppointmentForm close={close} />)}>Book appointment</button>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard label="Today's Patients" value={k.todaysPatients} meta="Across all departments" icon="🧑" trend={patientGrowth.slice(-6)} onClick={() => navigate('/patients')} />
        <StatCard label="Today's Appointments" value={k.todaysAppointments} meta="Next queue 09:30" icon="🗓" onClick={() => navigate('/appointments')} />
        <StatCard label="OPD Patients" value={k.opdPatients} meta="Walk-ins active" icon="🩺" onClick={() => navigate('/opd')} />
        <StatCard label="IPD Patients" value={k.ipdPatients} meta="Currently admitted" icon="🛏" onClick={() => navigate('/ipd')} />
        <StatCard label="Doctors Available" value={k.doctorsAvailable} meta={`of ${data.doctors.length} total`} icon="👨‍⚕️" onClick={() => navigate('/staff')} />
        <StatCard label="Bed Availability" value={k.bedAvailability} meta="General + specialty" icon="🛌" onClick={() => navigate('/beds')} />
        <StatCard label="ICU Beds" value={k.icuBeds} meta="Available / total" icon="❤️" onClick={() => navigate('/beds')} />
        <StatCard label="Emergency Patients" value={k.emergencyPatients} meta="In triage now" icon="🚨" onClick={() => navigate('/emergency')} />
        <StatCard label="Pending Bills" value={k.pendingBills} meta="Awaiting settlement" icon="🧾" onClick={() => navigate('/billing')} />
        <StatCard label="Revenue Today" value={formatCurrency(k.revenueToday)} meta="Above target" icon="💰" trend={revenueTrend.slice(-6)} onClick={() => navigate('/billing')} />
        <StatCard label="Monthly Revenue" value={formatCurrency(k.monthlyRevenue)} meta="Month to date" icon="📈" onClick={() => navigate('/billing')} />
        <StatCard label="Recent Admissions" value={k.recentAdmissions.length} meta="Last 24 hours" icon="🏥" onClick={() => navigate('/ipd')} />
      </div>

      <div className="grid-2">
        <article className="chart-card viz-root">
          <div className="card-head"><h3>Revenue trend</h3><span className="pill good">+14.8% vs last month</span></div>
          <LineChart values={revenueTrend} labels={revenueTrendLabels} color="var(--series-1)" formatValue={(v) => `₹${v}K`} />
        </article>
        <article className="card">
          <div className="card-head"><h3>Recent activity</h3></div>
          <div className="list-stack">
            {['Ward 4 bed transfer completed', 'Dr. Rao uploaded 3 radiology reports', 'Emergency alert acknowledged by triage', 'Pharmacy stock reconciled for the day'].map((item) => (
              <div className="item" key={item}><span>{item}</span><span className="pill">Live</span></div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid-3">
        <article className="chart-card viz-root">
          <div className="card-head"><h3>Patient growth</h3></div>
          <LineChart values={patientGrowth} labels={patientGrowthLabels} color="var(--series-3)" />
        </article>
        <article className="chart-card viz-root">
          <div className="card-head"><h3>Department-wise patients</h3></div>
          <HBarChart items={data.departments.map((d) => ({ label: d.name, value: d.opdToday + d.ipdToday }))} />
        </article>
        <article className="chart-card viz-root">
          <div className="card-head"><h3>Appointment statistics</h3></div>
          <BarChart values={appointmentStats.map((a) => a.value)} labels={appointmentStats.map((a) => a.label)} colors={appointmentStats.map((_, i) => seriesColor(i))} />
        </article>
      </div>

      <div className="grid-2">
        <article className="chart-card viz-root">
          <div className="card-head"><h3>Monthly admissions</h3></div>
          <BarChart values={monthlyAdmissions} labels={patientGrowthLabels} colors="var(--series-2)" />
        </article>
        <article className="card">
          <div className="card-head"><h3>Quick actions</h3></div>
          <QuickActions actions={[
            { icon: '📝', label: 'Register patient', onClick: () => navigate('/registration') },
            { icon: '🗓', label: 'Book appointment', onClick: () => openModal('Book appointment', (close) => <AppointmentForm close={close} />) },
            { icon: '🛏', label: 'New admission', onClick: () => openModal('New IPD admission', (close) => <AdmissionForm close={close} />) },
            { icon: '💳', label: 'Create bill', onClick: () => openModal('Create bill', (close) => <BillingForm close={close} />) },
          ]}
          />
        </article>
      </div>

      <div className="grid-2">
        <DataTable
          title="Recent admissions"
          rows={k.recentAdmissions}
          rowKey="id"
          pageSize={5}
          columns={[
            { key: 'patient', label: 'Patient' },
            { key: 'ward', label: 'Ward' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'admissionDate', label: 'Date', render: (r) => formatDate(r.admissionDate) },
          ]}
        />
        <DataTable
          title="Recent discharges"
          rows={k.recentDischarges}
          rowKey="id"
          pageSize={5}
          columns={[
            { key: 'patient', label: 'Patient' },
            { key: 'ward', label: 'Ward' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'dischargeDate', label: 'Discharged', render: (r) => formatDate(r.dischargeDate) },
          ]}
        />
      </div>
    </>
  );
}

function DoctorDashboard() {
  const { user } = useAuth();
  const data = useData();
  const { openModal } = useModal();
  const openPatientDrawer = usePatientDrawer();
  const navigate = useNavigate();
  const today = todayISO();
  const myAppointments = data.appointments.filter((a) => a.date === today);
  const myOpd = data.opdVisits;
  const myIpd = data.ipdAdmissions.filter((a) => a.status === 'Admitted');

  return (
    <>
      <section className="hero-card">
        <div>
          <p className="eyebrow">Doctor overview</p>
          <h2>Good day, {user.name}. Here is your clinical queue.</h2>
          <div className="badge-row"><span>{user.department || 'General'} department</span><span>Shift active</span></div>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" type="button" onClick={() => openModal('Write prescription', (close) => <PrescriptionForm close={close} />)}>Write prescription</button>
        </div>
      </section>
      <div className="stats-grid">
        <StatCard label="Today's Appointments" value={myAppointments.length} meta="Scheduled today" icon="🗓" onClick={() => navigate('/appointments')} />
        <StatCard label="OPD Patients" value={myOpd.length} meta="Consultations today" icon="🩺" onClick={() => navigate('/opd')} />
        <StatCard label="IPD Patients" value={myIpd.length} meta="Under your care" icon="🛏" onClick={() => navigate('/ipd')} />
        <StatCard label="Emergency Cases" value={data.emergencyCases.length} meta="Active in ER" icon="🚨" onClick={() => navigate('/emergency')} />
      </div>
      <div className="grid-2">
        <DataTable
          title="Today's appointments"
          rows={myAppointments}
          rowKey="patientId"
          onRowClick={(id) => openPatientDrawer(id)}
          pageSize={6}
          columns={[
            { key: 'patient', label: 'Patient' },
            { key: 'time', label: 'Time' },
            { key: 'department', label: 'Department' },
            { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
          ]}
        />
        <article className="card">
          <div className="card-head"><h3>Quick actions</h3></div>
          <QuickActions actions={[
            { icon: '💊', label: 'Write prescription', onClick: () => openModal('Write prescription', (close) => <PrescriptionForm close={close} />) },
            { icon: '🛏', label: 'Admit patient', onClick: () => openModal('New IPD admission', (close) => <AdmissionForm close={close} />) },
            { icon: '↪️', label: 'Refer patient', onClick: () => openModal('Refer patient', (close) => <ReferralForm close={close} />) },
            { icon: '📄', label: 'Discharge summary', onClick: () => navigate('/ipd') },
          ]}
          />
        </article>
      </div>
      <div className="grid-2">
        <article className="card">
          <div className="card-head"><h3>Mini calendar</h3></div>
          <MiniCalendar eventDates={data.appointments.map((a) => a.date)} />
        </article>
        <article className="card">
          <div className="card-head"><h3>Emergency cases</h3></div>
          <div className="list-stack">
            {data.emergencyCases.length ? data.emergencyCases.map((c) => (
              <div className="item" key={c.id}><span>{c.patient} — {c.triage}</span><Pill status={c.condition} /></div>
            )) : <div className="empty-state">No active emergency cases.</div>}
          </div>
        </article>
      </div>
    </>
  );
}

function ReceptionistDashboard() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const today = todayISO();
  const todaysAppointments = data.appointments.filter((a) => a.date === today);
  const pendingBillsList = data.bills.filter((b) => b.status !== 'Paid');

  return (
    <>
      <section className="hero-card">
        <div>
          <p className="eyebrow">Front desk overview</p>
          <h2>Welcome back, {user.name}. Queue is moving smoothly.</h2>
          <div className="badge-row"><span>{todaysAppointments.length} appointments today</span><span>Token board live</span></div>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" type="button" onClick={() => navigate('/registration')}>Register patient</button>
          <button className="ghost-btn" type="button" onClick={() => openModal('Book appointment', (close) => <AppointmentForm close={close} />)}>Book appointment</button>
        </div>
      </section>
      <div className="stats-grid">
        <StatCard label="Today's Registrations" value={data.patients.length} meta="Total patients on file" icon="📝" onClick={() => navigate('/patients')} />
        <StatCard label="Today's Appointments" value={todaysAppointments.length} meta="Confirmed + pending" icon="🗓" onClick={() => navigate('/appointments')} />
        <StatCard label="Walk-in Tokens" value={todaysAppointments.length + 2} meta="Issued today" icon="🎫" onClick={() => navigate('/appointments')} />
        <StatCard label="Pending Bills" value={pendingBillsList.length} meta="Need settlement" icon="💳" onClick={() => navigate('/billing')} />
      </div>
      <div className="grid-2">
        <DataTable
          title="Today's token queue"
          rows={todaysAppointments}
          rowKey="id"
          pageSize={6}
          columns={[
            { key: 'token', label: 'Token' },
            { key: 'patient', label: 'Patient' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'time', label: 'Time' },
            { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
          ]}
        />
        <article className="card">
          <div className="card-head"><h3>Quick actions</h3></div>
          <QuickActions actions={[
            { icon: '📝', label: 'Register patient', onClick: () => navigate('/registration') },
            { icon: '🗓', label: 'Book appointment', onClick: () => openModal('Book appointment', (close) => <AppointmentForm close={close} />) },
            { icon: '🩺', label: 'OPD registration', onClick: () => navigate('/opd') },
            { icon: '💳', label: 'Create bill', onClick: () => openModal('Create bill', (close) => <BillingForm close={close} />) },
          ]}
          />
        </article>
      </div>
    </>
  );
}

function NurseDashboard() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const openPatientDrawer = usePatientDrawer();
  const ward = user.ward || 'Ward 4';
  const assigned = data.patients.filter((p) => p.status === 'IPD' || p.status === 'Critical');

  return (
    <>
      <section className="hero-card">
        <div>
          <p className="eyebrow">Nursing overview — {ward}</p>
          <h2>Hello {user.name}, here is your patient monitoring board.</h2>
          <div className="badge-row"><span>{assigned.length} assigned patients</span><span>Shift active</span></div>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" type="button" onClick={() => assigned[0] && openModal(`Update vitals — ${assigned[0].name}`, (close) => <VitalsForm close={close} patient={assigned[0]} />)}>Update vitals</button>
        </div>
      </section>
      <div className="stats-grid">
        <StatCard label="Assigned Patients" value={assigned.length} meta={ward} icon="🛏" onClick={() => navigate('/patients')} />
        <StatCard label="Vitals Due" value={3} meta="Next round 12:00" icon="💓" onClick={() => navigate('/vitals')} />
        <StatCard label="Medicine Rounds" value={5} meta="Scheduled today" icon="💊" onClick={() => navigate('/vitals')} />
        <StatCard label="Emergency Alerts" value={data.emergencyCases.length} meta="Active now" icon="🚨" onClick={() => navigate('/emergency')} />
      </div>
      <DataTable
        title="Assigned patients"
        rows={assigned}
        rowKey="id"
        onRowClick={(id) => openPatientDrawer(id)}
        pageSize={6}
        columns={[
          { key: 'name', label: 'Patient' },
          { key: 'ward', label: 'Ward' },
          { key: 'bed', label: 'Bed' },
          { key: 'doctor', label: 'Doctor' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => <button type="button" className="subtle-btn" onClick={() => openModal(`Update vitals — ${row.name}`, (close) => <VitalsForm close={close} patient={row} />)}>Update vitals</button>}
      />
    </>
  );
}
