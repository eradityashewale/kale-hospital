import { statusIcon, statusPillClass } from '../utils.js';

export default function Pill({ status }) {
  const cls = statusPillClass(status);
  return (
    <span className={`pill ${cls}`}>
      {cls ? <span aria-hidden="true">{statusIcon(status)}</span> : null}
      {status}
    </span>
  );
}
