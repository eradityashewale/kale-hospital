import { useDrawer } from '../context/DrawerContext.jsx';
import { useData } from '../context/DataContext.jsx';
import PatientDrawer from '../components/PatientDrawer.jsx';

export function usePatientDrawer() {
  const { openDrawer } = useDrawer();
  const { patients } = useData();
  return (patientId, initialTab = 'overview') => {
    const patient = patients.find((p) => p.id === patientId);
    openDrawer(patient?.name || 'Patient profile', (close) => (
      <PatientDrawer patientId={patientId} close={close} initialTab={initialTab} />
    ));
  };
}
