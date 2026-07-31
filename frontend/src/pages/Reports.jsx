import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { downloadTextFile, formatCurrency, formatDate, todayISO } from '../utils.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import LineChart from '../components/charts/LineChart.jsx';
import HBarChart from '../components/charts/HBarChart.jsx';

const revenueTrend = [64, 82, 76, 91, 97, 118, 132];
const revenueTrendLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug (proj.)'];

export default function Reports() {
  const data = useData();
  const showToast = useToast();
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const reportCategories = [
    { title: 'Daily census', period: 'Today', value: `${data.patients.length} visits` },
    { title: 'Revenue', period: 'Monthly', value: formatCurrency(revenueTrend.reduce((a, b) => a + b, 0) * 1000) },
    { title: 'Bed occupancy', period: 'Current', value: '84%' },
    { title: 'Doctor productivity', period: 'This week', value: `${data.doctors.length} active doctors` },
  ];

  const dayWiseSummary = useMemo(() => {
    const days = new Set();
    data.opdVisits.forEach((v) => v.date && days.add(v.date));
    data.ipdAdmissions.forEach((a) => a.admissionDate && days.add(a.admissionDate));
    return [...days]
      .sort((a, b) => b.localeCompare(a))
      .map((date) => {
        const opdCount = data.opdVisits.filter((v) => v.date === date).length;
        const ipdCount = data.ipdAdmissions.filter((a) => a.admissionDate === date).length;
        return { date, opdCount, ipdCount, total: opdCount + ipdCount };
      });
  }, [data.opdVisits, data.ipdAdmissions]);

  const opdOnSelectedDay = useMemo(
    () => data.opdVisits.filter((v) => v.date === selectedDate),
    [data.opdVisits, selectedDate],
  );
  const ipdOnSelectedDay = useMemo(
    () => data.ipdAdmissions.filter((a) => a.admissionDate === selectedDate),
    [data.ipdAdmissions, selectedDate],
  );

  const exportReport = (format) => {
    const rows = ['Report,Value', ...reportCategories.map((r) => `${r.title} (${r.period}),${r.value}`)];
    if (format === 'CSV') downloadTextFile('Kale Hospital-report.csv', rows.join('\n'));
    else if (format === 'Excel') downloadTextFile('Kale Hospital-report.xls', rows.join('\n'));
    else downloadTextFile('Kale Hospital-report.txt', `Kale Hospital HMS Report\n\n${rows.join('\n')}`);
    showToast(`Report exported as ${format}.`, 'success');
  };

  const exportDayReport = () => {
    if (!opdOnSelectedDay.length && !ipdOnSelectedDay.length) {
      showToast(`No patients recorded on ${formatDate(selectedDate)}.`, 'error');
      return;
    }
    const rows = ['Type,Patient,Department/Ward,Doctor,Details,Date'];
    opdOnSelectedDay.forEach((v) => rows.push(`OPD,${v.patient},${v.department},${v.doctor},${v.diagnosis || '—'},${v.date}`));
    ipdOnSelectedDay.forEach((a) => rows.push(`IPD,${a.patient},${a.ward},${a.doctor},${a.status},${a.admissionDate}`));
    downloadTextFile(`Kale Hospital-day-report-${selectedDate}.csv`, rows.join('\n'));
    showToast(`Day-wise report for ${formatDate(selectedDate)} exported.`, 'success');
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Reports & analytics</p>
          <h2>Daily, monthly, and department-level insight, exportable in one click.</h2>
        </div>
        <div className="hero-actions">
          <button className="ghost-btn" type="button" onClick={() => exportReport('PDF')}>Export PDF</button>
          <button className="ghost-btn" type="button" onClick={() => exportReport('Excel')}>Export Excel</button>
          <button className="ghost-btn" type="button" onClick={() => exportReport('CSV')}>Export CSV</button>
        </div>
      </div>
      <div className="stats-grid">
        {reportCategories.map((entry) => <StatCard key={entry.title} label={entry.title} value={entry.value} meta={entry.period} icon="📊" />)}
      </div>
      <div className="grid-2">
        <article className="chart-card viz-root">
          <div className="card-head"><h3>Revenue report</h3></div>
          <LineChart values={revenueTrend} labels={revenueTrendLabels} color="var(--series-1)" formatValue={(v) => `₹${v}K`} />
        </article>
        <article className="chart-card viz-root">
          <div className="card-head"><h3>Department-wise patients</h3></div>
          <HBarChart items={data.departments.map((d) => ({ label: d.name, value: d.opdToday + d.ipdToday }))} />
        </article>
      </div>
      <DataTable
        title="Day-wise report (OPD vs IPD)"
        rows={dayWiseSummary}
        rowKey="date"
        searchKeys={['date']}
        pageSize={8}
        onRowClick={(date) => setSelectedDate(date)}
        columns={[
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
          { key: 'opdCount', label: 'OPD patients' },
          { key: 'ipdCount', label: 'IPD admissions' },
          { key: 'total', label: 'Total patients' },
        ]}
      />
      <div className="grid-2">
        <DataTable
          title={`OPD patients — ${formatDate(selectedDate)}`}
          rows={opdOnSelectedDay}
          rowKey="id"
          pageSize={6}
          searchKeys={['patient', 'doctor', 'department']}
          toolbarExtra={
            <div className="attendance-filters">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <button className="ghost-btn" type="button" onClick={exportDayReport}>Export day report</button>
            </div>
          }
          columns={[
            { key: 'patient', label: 'Patient' }, { key: 'department', label: 'Department' },
            { key: 'doctor', label: 'Doctor' }, { key: 'diagnosis', label: 'Diagnosis' },
          ]}
        />
        <DataTable
          title={`IPD patients — ${formatDate(selectedDate)}`}
          rows={ipdOnSelectedDay}
          rowKey="id"
          pageSize={6}
          searchKeys={['patient', 'ward', 'doctor']}
          columns={[
            { key: 'patient', label: 'Patient' }, { key: 'ward', label: 'Ward' },
            { key: 'doctor', label: 'Doctor' }, { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
          ]}
        />
      </div>
      <div className="grid-2">
        <DataTable
          title="Doctor-wise report"
          rows={data.doctors.map((d) => ({ ...d, patients: data.opdVisits.filter((v) => v.doctor === d.name).length + 5 }))}
          rowKey="id"
          pageSize={6}
          columns={[
            { key: 'name', label: 'Doctor' }, { key: 'department', label: 'Department' },
            { key: 'patients', label: 'Patients seen' }, { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
          ]}
        />
        <DataTable
          title="Insurance report"
          rows={data.insuranceClaims}
          rowKey="id"
          pageSize={6}
          columns={[
            { key: 'patient', label: 'Patient' }, { key: 'company', label: 'Company' },
            { key: 'claimed', label: 'Claimed', render: (r) => formatCurrency(r.claimed) }, { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
          ]}
        />
      </div>
    </>
  );
}
