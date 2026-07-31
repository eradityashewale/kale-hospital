import { useEffect, useRef, useState } from 'react';

// target: e.g. 25, 50, 10000. suffix: e.g. '+', ','
export function useCountUp(target, { start = false, duration = 1400 } = {}) {
  const [value, setValue] = useState(0);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!start || ranRef.current) return;
    ranRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const startTime = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target, duration]);

  return value;
}
