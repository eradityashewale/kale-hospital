export const ALL_ROLES = ['Super Admin', 'Admin', 'Doctor', 'Receptionist', 'Nurse'];

export const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂', group: 'Overview', roles: ALL_ROLES },
  { id: 'patients', label: 'Patients', icon: '🧑', group: 'Patient Care', roles: ALL_ROLES },
  { id: 'registration', label: 'Patient Registration', icon: '📝', group: 'Patient Care', roles: ['Super Admin', 'Admin', 'Receptionist'] },
  { id: 'appointments', label: 'Appointments', icon: '🗓', group: 'Patient Care', roles: ['Super Admin', 'Admin', 'Doctor', 'Receptionist'] },
  { id: 'opd', label: 'OPD', icon: '🩺', group: 'Patient Care', roles: ['Super Admin', 'Admin', 'Doctor', 'Receptionist'] },
  { id: 'ipd', label: 'IPD', icon: '🛏', group: 'Patient Care', roles: ['Super Admin', 'Admin', 'Doctor', 'Nurse'] },
  { id: 'emergency', label: 'Emergency', icon: '🚨', group: 'Patient Care', roles: ['Super Admin', 'Admin', 'Doctor', 'Nurse', 'Receptionist'] },
  { id: 'vitals', label: 'Vitals & Monitoring', icon: '💓', group: 'Clinical', roles: ['Nurse'] },
  { id: 'prescriptions', label: 'Prescriptions', icon: '💊', group: 'Clinical', roles: ['Doctor'] },
  { id: 'beds', label: 'Bed Management', icon: '🛌', group: 'Operations', roles: ['Super Admin', 'Admin', 'Nurse'] },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💉', group: 'Operations', roles: ['Super Admin', 'Admin'] },
  { id: 'laboratory', label: 'Laboratory', icon: '🧪', group: 'Operations', roles: ['Super Admin', 'Admin', 'Doctor'] },
  { id: 'radiology', label: 'Radiology', icon: '🩻', group: 'Operations', roles: ['Super Admin', 'Admin', 'Doctor'] },
  { id: 'billing', label: 'Billing', icon: '💳', group: 'Operations', roles: ['Super Admin', 'Admin', 'Receptionist'] },
  { id: 'insurance', label: 'Insurance', icon: '🛡', group: 'Operations', roles: ['Super Admin', 'Admin', 'Receptionist'] },
  { id: 'departments', label: 'Departments', icon: '🏬', group: 'Administration', roles: ['Super Admin', 'Admin'] },
  { id: 'staff', label: 'Staff Management', icon: '👥', group: 'Administration', roles: ['Super Admin', 'Admin'] },
  { id: 'branches', label: 'Branch Management', icon: '🏥', group: 'Administration', roles: ['Super Admin'] },
  { id: 'users', label: 'User Management', icon: '🔑', group: 'Administration', roles: ['Super Admin'] },
  { id: 'roles', label: 'Roles & Permissions', icon: '🔐', group: 'Administration', roles: ['Super Admin'] },
  { id: 'hospital-settings', label: 'Hospital Settings', icon: '⚙', group: 'Administration', roles: ['Super Admin'] },
  { id: 'opd-ipd-settings', label: 'OPD/IPD Settings', icon: '🧾', group: 'Administration', roles: ['Super Admin'] },
  { id: 'reports', label: 'Reports', icon: '📊', group: 'Insights', roles: ALL_ROLES },
  { id: 'audit-logs', label: 'Audit Logs', icon: '🕵', group: 'Insights', roles: ['Super Admin'] },
  { id: 'backup', label: 'Backup & Restore', icon: '💾', group: 'Insights', roles: ['Super Admin'] },
  { id: 'notifications', label: 'Notification Center', icon: '🔔', group: 'Insights', roles: ['Super Admin', 'Admin'] },
  { id: 'profile', label: 'Profile', icon: '🧾', group: 'Account', roles: ALL_ROLES },
];

export function allowedNav(role) {
  if (!role) return [];
  return navigation.filter((item) => item.roles.includes(role));
}
