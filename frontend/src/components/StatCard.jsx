import Sparkline from './charts/Sparkline.jsx';

export default function StatCard({ label, value, meta, icon, trend, onClick }) {
  const clickable = Boolean(onClick);

  const handleKeyDown = (e) => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={`stats-card${clickable ? ' clickable' : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {icon ? <span className="stat-icon" aria-hidden="true">{icon}</span> : null}
      <p className="eyebrow">{label}</p>
      <div className="value">{value}</div>
      <div className="flex-row">
        <div className="meta">{meta || ''}</div>
        {trend ? <Sparkline values={trend} /> : null}
      </div>
      {clickable ? <span className="stat-card-arrow" aria-hidden="true">›</span> : null}
    </article>
  );
}
