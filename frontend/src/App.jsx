import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth, RoleGate } from './components/RequireAuth.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Patients from './pages/Patients.jsx';
import Registration from './pages/Registration.jsx';
import Appointments from './pages/Appointments.jsx';
import Opd from './pages/Opd.jsx';
import Ipd from './pages/Ipd.jsx';
import Emergency from './pages/Emergency.jsx';
import Vitals from './pages/Vitals.jsx';
import Prescriptions from './pages/Prescriptions.jsx';
import Beds from './pages/Beds.jsx';
import Pharmacy from './pages/Pharmacy.jsx';
import Laboratory from './pages/Laboratory.jsx';
import Radiology from './pages/Radiology.jsx';
import Billing from './pages/Billing.jsx';
import Insurance from './pages/Insurance.jsx';
import Departments from './pages/Departments.jsx';
import Staff from './pages/Staff.jsx';
import Branches from './pages/Branches.jsx';
import Users from './pages/Users.jsx';
import Roles from './pages/Roles.jsx';
import HospitalSettings from './pages/HospitalSettings.jsx';
import OpdIpdSettings from './pages/OpdIpdSettings.jsx';
import Reports from './pages/Reports.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Backup from './pages/Backup.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route element={<RoleGate />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/opd" element={<Opd />} />
            <Route path="/ipd" element={<Ipd />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/vitals" element={<Vitals />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/beds" element={<Beds />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="/radiology" element={<Radiology />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/hospital-settings" element={<HospitalSettings />} />
            <Route path="/opd-ipd-settings" element={<OpdIpdSettings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
