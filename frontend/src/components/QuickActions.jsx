export default function QuickActions({ actions }) {
  return (
    <div className="quick-actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className="quick-action-btn" onClick={a.onClick}>
          <span className="qa-icon" aria-hidden="true">{a.icon}</span>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
