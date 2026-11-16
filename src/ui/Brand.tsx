import { useId } from 'react';
import './Brand.css';

/** The "61" seal – the game's mark. */
export function Emblem({ size = 120, spin = false }: { size?: number; spin?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const g = `em-g-${uid}`;
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <svg className="emblem" width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c9" />
          <stop offset="0.4" stopColor="#e2bd65" />
          <stop offset="0.75" stopColor="#a87e28" />
          <stop offset="1" stopColor="#f0d58e" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="57" fill="#081226" stroke={`url(#${g})`} strokeWidth="1.5" />
      <g className={spin ? 'emblem__ring' : undefined}>
        {ticks.map((i) => (
          <line
            key={i}
            x1="60"
            y1={i % 5 === 0 ? 7 : 8.5}
            x2="60"
            y2="11"
            stroke={`url(#${g})`}
            strokeWidth={i % 5 === 0 ? 1.2 : 0.6}
            transform={`rotate(${i * 6} 60 60)`}
          />
        ))}
      </g>
      <circle cx="60" cy="60" r="45" fill="none" stroke={`url(#${g})`} strokeWidth="0.8" opacity="0.7" />
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M60 17.5 l1.3 2.7 3 .4 -2.2 2 .5 3 -2.6 -1.4 -2.6 1.4 .5 -3 -2.2 -2 3 -.4z" fill={`url(#${g})`} transform={`rotate(${a + 36} 60 60) translate(0 0)`} />
      ))}
      <text x="60" y="74" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="40" fill={`url(#${g})`} letterSpacing="1">
        61
      </text>
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`wordmark ${compact ? 'wordmark--compact' : ''}`}>
      <Emblem size={compact ? 34 : 44} />
      <div className="wordmark__text latin">
        <span className="wordmark__61 gold-text">61</span>
        <span className="wordmark__name">WORLD LEADERS</span>
      </div>
    </div>
  );
}
