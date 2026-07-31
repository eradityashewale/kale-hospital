import { useState } from 'react';

/**
 * Renders a real photo if one exists at /images/<name> (drop your file into
 * frontend/public/images/ with this exact filename), otherwise falls back to
 * a placeholder graphic so the layout never looks broken.
 */
export default function PhotoSlot({ name, icon = '🏥', label, className = '', ratio = '4 / 3' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`photo-slot placeholder ${className}`} style={{ aspectRatio: ratio }}>
        <span className="photo-slot-icon" aria-hidden="true">{icon}</span>
        {label ? <span className="photo-slot-label">{label}</span> : null}
      </div>
    );
  }

  return (
    <div className={`photo-slot ${className}`} style={{ aspectRatio: ratio }}>
      <img src={`/images/${name}`} alt={label || ''} onError={() => setFailed(true)} />
    </div>
  );
}
