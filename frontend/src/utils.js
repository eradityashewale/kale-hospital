export function formatCurrency(value) {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function calcAge(dob) {
  if (!dob) return '—';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '—';
  const diff = Date.now() - birth.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

export function initialsOf(name) {
  return String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function statusPillClass(status) {
  const s = String(status).toLowerCase();
  if (['paid', 'completed', 'available', 'approved', 'confirmed', 'reviewed', 'present', 'healthy', 'active', 'good', 'discharged', 'stable'].includes(s)) return 'good';
  if (['pending', 'partial', 'booked', 'reserved', 'on leave', 'sample collected', 'in surgery', 'cleaning'].includes(s)) return 'warning';
  if (['low', 'walk-in', 'new', 'serious', 'expiring soon'].includes(s)) return 'serious';
  if (['critical', 'rejected', 'cancelled', 'failed', 'occupied', 'absent', 'emergency', 'urgent'].includes(s)) return 'critical';
  return '';
}

export function statusIcon(status) {
  const cls = statusPillClass(status);
  return { good: '●', warning: '◐', serious: '▲', critical: '✕' }[cls] || '•';
}

export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function seriesColor(i) {
  return `var(--series-${(i % 8) + 1})`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function kvGrid(items) {
  return `<div class="kv-grid">${items.map(([label, value]) => (
    `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '—')}</strong></div>`
  )).join('')}</div>`;
}

function docTable(headers, rows, emptyText) {
  if (!rows.length) return `<div class="empty">${escapeHtml(emptyText)}</div>`;
  return `<table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>` +
    `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function openPrintWindow(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=920,height=1040');
  if (!win) return false;
  win.document.open();
  win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #1a1a1a; padding: 32px; max-width: 860px; margin: 0 auto; }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a1a1a; padding-bottom: 14px; margin-bottom: 20px; }
    .doc-header h1 { margin: 0; font-size: 22px; }
    .doc-header p { margin: 2px 0 0; font-size: 12px; color: #555; }
    .doc-header .meta { text-align: right; font-size: 12px; color: #555; }
    h2 { font-size: 15px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ccc; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e2e2; font-size: 12.5px; vertical-align: top; }
    th { background: #f2f2f2; font-weight: 600; }
    .kv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 24px; }
    .kv-grid div span { display: block; font-size: 10.5px; color: #666; text-transform: uppercase; letter-spacing: .02em; }
    .kv-grid div strong { font-size: 13px; }
    .empty { font-size: 12.5px; color: #888; font-style: italic; padding: 6px 0; }
    .totals { margin-top: 10px; font-size: 13px; display: flex; justify-content: flex-end; gap: 24px; }
    .totals strong { font-size: 15px; }
    .footer-note { margin-top: 32px; font-size: 11px; color: #777; border-top: 1px solid #ccc; padding-top: 10px; }
    @media print { body { padding: 0; } @page { margin: 16mm; } }
  </style></head><body>${bodyHtml}<div class="footer-note">Generated on ${escapeHtml(new Date().toLocaleString('en-IN'))} · Kale Hospital HMS · Computer-generated document</div></body></html>`);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 250);
  return true;
}

export function printPatientRecord(patient) {
  const bills = patient.bills || [];
  const totalBilled = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const totalPaid = bills.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const body = `
    <div class="doc-header">
      <div><h1>Kale Hospital</h1><p>Complete patient medical &amp; billing record</p></div>
      <div class="meta"><div>Patient ID: <strong>${escapeHtml(patient.id)}</strong></div><div>Printed: ${escapeHtml(new Date().toLocaleDateString('en-IN'))}</div></div>
    </div>

    <h2>Patient details</h2>
    ${kvGrid([
      ['Name', patient.name], ['Gender', patient.gender], ['Date of birth', formatDate(patient.dob)],
      ['Blood group', patient.bloodGroup], ['Mobile', patient.mobile], ['Alternate mobile', patient.altMobile],
      ['Email', patient.email], ['Aadhaar', patient.aadhaar], ['Address', patient.address],
      ['Emergency contact', patient.emergencyContact], ['Department', patient.department], ['Attending doctor', patient.doctor],
      ['Current status', patient.status], ['Insurance provider', patient.insurance?.provider],
      ['Policy no.', patient.insurance?.policyNo], ['Coverage', patient.insurance?.coverage],
    ])}

    <h2>Medical history</h2>
    ${kvGrid([
      ['Existing conditions', (patient.diseases || []).join(', ') || 'None reported'],
      ['Known allergies', (patient.allergies || []).join(', ') || 'None reported'],
    ])}

    <h2>Visit history (OPD / registration)</h2>
    ${docTable(['Date', 'Type', 'Doctor', 'Diagnosis'], (patient.visits || []).map((v) => [formatDate(v.date), v.type, v.doctor, v.diagnosis]), 'No visits recorded.')}

    <h2>Prescriptions</h2>
    ${docTable(['Date', 'Doctor', 'Medicines', 'Follow-up'], (patient.prescriptions || []).map((rx) => [formatDate(rx.date), rx.doctor, rx.medicines, formatDate(rx.followUp)]), 'No prescriptions on file.')}

    <h2>IPD admissions (admission to discharge)</h2>
    ${docTable(
      ['Admitted', 'Ward / Room / Bed', 'Doctor', 'Treatment', 'Status', 'Discharged', 'Discharge summary'],
      (patient.admissions || []).map((a) => [formatDate(a.date), `${a.ward} / ${a.room} / ${a.bed}`, a.doctor, a.treatment || '—', a.status, formatDate(a.dischargeDate), a.dischargeSummary || '—']),
      'No admission history.',
    )}

    <h2>Laboratory reports</h2>
    ${docTable(['Date', 'Test', 'Status'], (patient.labReports || []).map((l) => [formatDate(l.date), l.test, l.status]), 'No lab reports.')}

    <h2>Radiology reports</h2>
    ${docTable(['Date', 'Type', 'Status'], (patient.radiologyReports || []).map((r) => [formatDate(r.date), r.type, r.status]), 'No radiology reports.')}

    <h2>Billing statement</h2>
    ${docTable(['Invoice', 'Date', 'Amount', 'Mode', 'Status'], bills.map((b) => [b.id, formatDate(b.date), formatCurrency(b.amount), b.mode || '—', b.status]), 'No bills raised.')}
    ${bills.length ? `<div class="totals"><div>Total billed: <strong>${formatCurrency(totalBilled)}</strong></div><div>Paid: <strong>${formatCurrency(totalPaid)}</strong></div><div>Pending: <strong>${formatCurrency(totalBilled - totalPaid)}</strong></div></div>` : ''}
  `;
  return openPrintWindow(`Patient Record - ${patient.name}`, body);
}

export function printInvoice(bill) {
  const body = `
    <div class="doc-header">
      <div><h1>Kale Hospital</h1><p>Invoice / payment receipt</p></div>
      <div class="meta"><div>Invoice: <strong>${escapeHtml(bill.id)}</strong></div><div>Date: ${escapeHtml(formatDate(bill.date))}</div></div>
    </div>
    <h2>Billed to</h2>
    ${kvGrid([['Patient', bill.patient], ['Payment mode', bill.mode], ['Status', bill.status]])}
    <h2>Charges</h2>
    <table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>
      <tr><td>Hospital services (consultation / admission / pharmacy / lab / radiology)</td><td>${escapeHtml(formatCurrency(bill.amount))}</td></tr>
    </tbody></table>
    <div class="totals"><div>Total: <strong>${formatCurrency(bill.amount)}</strong></div></div>
  `;
  return openPrintWindow(`Invoice ${bill.id}`, body);
}

export function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach((el) => {
    if (!String(el.value || '').trim()) {
      el.classList.add('invalid');
      valid = false;
    } else {
      el.classList.remove('invalid');
    }
  });
  return valid;
}
