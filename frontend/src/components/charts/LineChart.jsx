export default function LineChart({ values, labels, color = 'var(--series-1)', height = 200, formatValue = (v) => v }) {
  const width = 600;
  const padding = { top: 20, right: 12, bottom: 6, left: 12 };
  const max = Math.max(...values);
  const min = Math.min(0, Math.min(...values));
  const range = max - min || 1;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0;
  const points = values.map((v, i) => [
    padding.left + stepX * i,
    padding.top + innerH - ((v - min) / range) * innerH,
  ]);
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${(padding.top + innerH).toFixed(1)} L${points[0][0].toFixed(1)},${(padding.top + innerH).toFixed(1)} Z`;
  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => padding.top + innerH * (1 - f));
  const lastPoint = points[points.length - 1];

  return (
    <div className="chart-svg-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {gridLines.map((y, i) => (
          <line key={i} className="grid-line" x1={padding.left} y1={y.toFixed(1)} x2={width - padding.right} y2={y.toFixed(1)} />
        ))}
        <path d={areaPath} fill={color} opacity="0.12" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="5" fill={color} stroke="var(--surface)" strokeWidth="2">
            <title>{labels[i]}: {formatValue(values[i])}</title>
          </circle>
        ))}
        <text className="data-label" x={lastPoint[0].toFixed(1)} y={(lastPoint[1] - 12).toFixed(1)} textAnchor="end">
          {formatValue(values[values.length - 1])}
        </text>
      </svg>
      <div className="chart-x-labels">{labels.map((l, i) => <span key={i}>{l}</span>)}</div>
    </div>
  );
}
