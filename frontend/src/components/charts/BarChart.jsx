import { seriesColor } from '../../utils.js';

export default function BarChart({ values, labels, colors, height = 200, formatValue = (v) => v }) {
  const width = 600;
  const padding = { top: 26, right: 12, bottom: 6, left: 12 };
  const max = Math.max(...values) || 1;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const n = values.length;
  const slot = innerW / n;
  const barW = Math.min(24, slot * 0.5);
  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => padding.top + innerH * (1 - f));

  const colorFor = (i) => {
    if (Array.isArray(colors)) return colors[i % colors.length];
    if (colors) return colors;
    return seriesColor(i);
  };

  return (
    <div className="chart-svg-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {gridLines.map((y, i) => (
          <line key={i} className="grid-line" x1={padding.left} y1={y.toFixed(1)} x2={width - padding.right} y2={y.toFixed(1)} />
        ))}
        {values.map((v, i) => {
          const barH = Math.max((v / max) * innerH, 2);
          const x = padding.left + slot * i + (slot - barW) / 2;
          const y = padding.top + innerH - barH;
          return (
            <g key={i}>
              <rect x={x.toFixed(1)} y={y.toFixed(1)} width={barW.toFixed(1)} height={barH.toFixed(1)} rx="4" fill={colorFor(i)}>
                <title>{labels[i]}: {formatValue(v)}</title>
              </rect>
              <text className="data-label" x={(x + barW / 2).toFixed(1)} y={(y - 7).toFixed(1)} textAnchor="middle">{formatValue(v)}</text>
            </g>
          );
        })}
      </svg>
      <div className="chart-x-labels">{labels.map((l, i) => <span key={i}>{l}</span>)}</div>
    </div>
  );
}
