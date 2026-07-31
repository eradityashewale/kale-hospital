import { useMemo, useState } from 'react';
import { apiFetch } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function _today() {
  return new Date().toISOString().slice(0, 10);
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser doesn't support location services."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject(new Error('Location permission denied. Allow location access to check in.'));
        else if (err.code === err.TIMEOUT) reject(new Error("Couldn't get your location in time. Try again."));
        else reject(new Error("Couldn't get your location. Try again."));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

export default function AttendanceControl() {
  const { user } = useAuth();
  const data = useData();
  const showToast = useToast();
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');

  const myRecord = useMemo(
    () => data.attendanceRecords.find((r) => r.staff === user?.name && r.date === _today()),
    [data.attendanceRecords, user]
  );

  const checkedIn = myRecord?.checkIn && myRecord.checkIn !== '—';
  const checkedOut = myRecord?.checkOut && myRecord.checkOut !== '—';

  const checkIn = async () => {
    setBusy(true);
    setBusyLabel('Locating…');
    try {
      const coords = await getLocation();
      setBusyLabel('Checking in…');
      const record = await apiFetch('/staff/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ lat: coords.latitude, lon: coords.longitude, accuracy: coords.accuracy }),
      });
      await data.refresh();
      showToast(`Checked in for ${record.shift} shift at ${record.checkIn}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
      setBusyLabel('');
    }
  };

  const checkOut = async () => {
    setBusy(true);
    setBusyLabel('Checking out…');
    try {
      const record = await apiFetch('/staff/attendance/check-out', { method: 'POST' });
      await data.refresh();
      showToast(`Checked out at ${record.checkOut}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
      setBusyLabel('');
    }
  };

  if (!user) return null;

  if (checkedIn && checkedOut) {
    return <span className="pill good attendance-chip">✓ Checked out · {myRecord.checkOut}</span>;
  }

  if (checkedIn) {
    return (
      <button type="button" className="attendance-btn out" disabled={busy} onClick={checkOut}>
        {busy ? busyLabel : <>Check Out <small>since {myRecord.checkIn} · {myRecord.shift}</small></>}
      </button>
    );
  }

  return (
    <button type="button" className="attendance-btn in" disabled={busy} onClick={checkIn}>
      {busy ? busyLabel : 'Check In'}
    </button>
  );
}
