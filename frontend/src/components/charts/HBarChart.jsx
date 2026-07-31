import { seriesColor } from '../../utils.js';

export default function HBarChart({ items }) {
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <>
      {items.map((item, i) => (
        <div className="hbar-row" key={item.label}>
          <span className="hbar-label" title={item.label}>{item.label}</span>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${Math.max(4, (item.value / max) * 100)}%`, background: seriesColor(i) }} />
          </div>
          <span className="hbar-value">{item.value}</span>
        </div>
      ))}
    </>
  );
}
