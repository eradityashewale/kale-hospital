import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext(null);

const EMPTY = {
  departments: [], doctors: [], nurses: [], receptionists: [], labTechnicians: [], pharmacists: [],
  patients: [], appointments: [], opdVisits: [], ipdAdmissions: [], bedBuildings: [], medicines: [], labTests: [],
  radiologyTests: [], bills: [], insuranceClaims: [], emergencyCases: [], attendanceRecords: [], leaveRequests: [], leaveBalances: [], notifications: [],
  backupHistory: [], rolePermissions: {}, users: [], auditLogs: [], expenses: [],
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch('/bootstrap');
      setData((prev) => ({ ...EMPTY, ...prev, ...result }));
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
    else { setData(EMPTY); setLoaded(false); }
  }, [user, refresh]);

  return (
    <DataContext.Provider value={{ ...data, loading, loaded, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
