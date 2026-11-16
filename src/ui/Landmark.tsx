import { memo, useId, type ReactNode } from 'react';
import type { CountryId } from '../game/types';
import { createRng } from '../game/rng';
import './Landmark.css';

/**
 * Vector "night-gold" illustrations of each nation's seat of power.
 * Pure SVG (~2KB each) – sharp on any screen, no image downloads.
 * To use photography later, pass `photo` and the illustration becomes the fallback.
 */
export const Landmark = memo(function Landmark({ country, className = '', photo, fit = 'cover' }: { country: CountryId; className?: string; photo?: string; fit?: 'cover' | 'contain' }) {
  const uid = useId().replace(/:/g, '');
  const gold = `lm-gold-${uid}`;
  const sky = `lm-sky-${uid}`;
  const halo = `lm-halo-${uid}`;
  const scene = SCENES[country];

  if (photo) {
    return (
      <div className={`landmark ${className}`}>
        <img src={photo} alt="" loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <div className={`landmark ${className}`}>
      <svg viewBox={`${(scene.focusX ?? 200) - 200} 0 400 240`} preserveAspectRatio={fit === 'cover' ? 'xMidYMax slice' : 'xMidYMax meet'} aria-hidden>
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#060d1d" />
            <stop offset="0.65" stopColor={scene.tint} />
            <stop offset="1" stopColor="#1b2c55" />
          </linearGradient>
          <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1c9" />
            <stop offset="0.45" stopColor="#e2bd65" />
            <stop offset="1" stopColor="#9c7424" />
          </linearGradient>
          <radialGradient id={halo} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f6e3a8" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#e2bd65" stopOpacity="0.08" />
            <stop offset="1" stopColor="#e2bd65" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="-100" width="600" height="240" fill={`url(#${sky})`} />
        <Stars seed={country.charCodeAt(0) * 31 + country.charCodeAt(1)} />
        <circle cx={scene.haloX} cy="110" r="120" fill={`url(#${halo})`} />
        <g className="landmark__far">{scene.far ?? <Skyline seed={country.charCodeAt(1)} />}</g>
        <g className="landmark__main" fill={`url(#${gold})`} stroke={`url(#${gold})`} strokeWidth="0">
          {scene.main}
        </g>
        <rect x="-100" y="200" width="600" height="40" fill="#050b18" />
        <rect x="-100" y="200" width="600" height="0.8" fill="#e2bd65" opacity="0.55" />
      </svg>
    </div>
  );
});

const D = '#0a1530'; // detail cut-out colour

function Stars({ seed }: { seed: number }) {
  const rng = createRng(seed);
  const stars = Array.from({ length: 34 }, () => ({ x: rng.range(0, 400), y: rng.range(0, 120), r: rng.range(0.3, 1.1), o: rng.range(0.25, 0.9) }));
  return (
    <g className="landmark__stars">
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
      ))}
    </g>
  );
}

function Skyline({ seed }: { seed: number }) {
  const rng = createRng(seed * 977);
  const blocks: ReactNode[] = [];
  let x = -104;
  while (x < 504) {
    const w = rng.range(14, 34);
    const h = rng.range(16, 58);
    blocks.push(<rect key={x} x={x} y={200 - h} width={w + 0.5} height={h} />);
    x += w;
  }
  return <g fill="#132449">{blocks}</g>;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const SCENES: Record<CountryId, { tint: string; haloX: number; focusX?: number; main: ReactNode; far?: ReactNode }> = {
  /* ---------------- Israel – the Knesset & the Menorah, Jerusalem hills ---------------- */
  il: {
    tint: '#14306b',
    haloX: 214,
    focusX: 214,
    far: (
      <>
        <path d="M-100 166 Q-40 150 0 170 Q60 140 120 158 T240 150 T400 160 T520 158 V200 H-100Z" fill="#11224a" />
        <path d="M-100 182 Q-40 176 0 184 Q90 166 170 178 T400 176 T520 180 V200 H-100Z" fill="#0d1b3a" />
        {/* Old City wall */}
        <path
          d="M0 186 V176 h6 v-4 h5 v4 h6 v-4 h5 v4 h6 v-4 h5 v4 h6 v-4 h5 v4 h6 V160 h4 v-6 h12 v6 h4 v16 h6 v-4 h5 v4 h6 v-4 h5 v4 h6 V200 H0Z"
          fill="#16295a"
        />
      </>
    ),
    main: (
      <>
        {/* The Knesset – set back, behind the Menorah */}
        <g opacity="0.5">
          <rect x="84" y="190" width="260" height="10" />
          <rect x="96" y="140" width="236" height="50" />
          <rect x="90" y="133" width="248" height="9" />
          {range(16).map((i) => (
            <rect key={i} x={102 + i * 14.4} y="147" width="7" height="40" fill={D} opacity="0.9" />
          ))}
        </g>
        {/* The Knesset Menorah */}
        <g fill="none" strokeWidth="5.5" strokeLinecap="round">
          {[16, 32, 48].map((r) => (
            <path key={r} d={`M${214 - r} 64 A ${r} ${r * 1.05} 0 0 0 ${214 + r} 64`} />
          ))}
          <path d="M214 60 V186" />
        </g>
        {[-48, -32, -16, 0, 16, 32, 48].map((dx) => (
          <path key={dx} d={`M${214 + dx - 5} 58 h10 l-2 6 h-6 Z`} />
        ))}
        <path d="M200 186 L205 176 H223 L228 186 Z" />
        <rect x="192" y="186" width="44" height="7" />
        <rect x="186" y="193" width="56" height="7" />
      </>
    ),
  },

  /* ---------------- United States – the Capitol ---------------- */
  us: {
    tint: '#1a2f66',
    haloX: 200,
    main: (
      <>
        <rect x="52" y="160" width="296" height="40" />
        <rect x="48" y="154" width="304" height="7" />
        {range(18).map((i) => (
          <rect key={i} x={60 + i * 16} y="168" width="6" height="12" fill={D} opacity="0.85" />
        ))}
        <rect x="138" y="138" width="124" height="62" />
        <path d="M144 138 L200 118 L256 138 Z" />
        {range(9).map((i) => (
          <rect key={i} x={150 + i * 12.2} y="145" width="4.5" height="48" fill={D} opacity="0.85" />
        ))}
        <rect x="160" y="106" width="80" height="14" />
        <rect x="166" y="80" width="68" height="28" />
        {range(8).map((i) => (
          <rect key={i} x={170 + i * 8.2} y="84" width="3" height="20" fill={D} opacity="0.85" />
        ))}
        <rect x="163" y="77" width="74" height="5" />
        <path d="M168 78 Q168 34 200 30 Q232 34 232 78 Z" />
        {[-18, -8, 0, 8, 18].map((dx) => (
          <path key={dx} d={`M${200 + dx * 0.9} 33 Q${200 + dx * 1.6} 50 ${200 + dx * 1.75} 77`} fill="none" stroke={D} strokeWidth="1.1" opacity="0.6" />
        ))}
        <rect x="193" y="18" width="14" height="14" />
        <path d="M193 19 Q200 10 207 19 Z" />
        <rect x="199" y="2" width="2" height="12" />
      </>
    ),
  },

  /* ---------------- United Kingdom – Westminster & Elizabeth Tower ---------------- */
  gb: {
    tint: '#172c5e',
    haloX: 270,
    focusX: 222,
    main: (
      <>
        {/* Palace */}
        <rect x="20" y="160" width="232" height="40" />
        {range(16).map((i) => (
          <path key={i} d={`M${24 + i * 14} 160 l3 -9 l3 9 Z`} />
        ))}
        {range(15).map((i) => (
          <rect key={i} x={28 + i * 14.6} y="168" width="4" height="22" fill={D} opacity="0.8" />
        ))}
        {/* Victoria tower */}
        <rect x="40" y="104" width="34" height="96" />
        <path d="M40 104 l3 -12 l3 12 Z M71 104 l3 -12 l-6 0 Z" />
        <rect x="38" y="100" width="38" height="5" />
        {range(3).map((i) => (
          <rect key={i} x={46 + i * 9} y="112" width="4" height="70" fill={D} opacity="0.8" />
        ))}
        {/* Central spire */}
        <path d="M148 160 V128 h8 V112 l4 -14 l4 14 v16 h8 v32 Z" />
        {/* Elizabeth Tower */}
        <rect x="254" y="92" width="32" height="108" />
        {range(3).map((i) => (
          <rect key={i} x={259 + i * 9} y="100" width="4" height="92" fill={D} opacity="0.75" />
        ))}
        <rect x="249" y="56" width="42" height="38" />
        <circle cx="270" cy="75" r="14" fill="#fff6dc" />
        <circle cx="270" cy="75" r="14" fill="none" stroke="#b48a2e" strokeWidth="2" />
        <path d="M270 75 V65 M270 75 L277 79" stroke={D} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <rect x="252" y="40" width="36" height="17" />
        {range(3).map((i) => (
          <path key={i} d={`M${257 + i * 11} 56 v-9 q3 -4 6 0 v9 Z`} fill={D} opacity="0.85" />
        ))}
        <path d="M249 41 L270 8 L291 41 Z" />
        <rect x="269" y="0" width="2" height="10" />
        <path d="M249 56 l2 -8 l2 8 Z M287 56 l2 -8 l2 8 Z" />
      </>
    ),
  },

  /* ---------------- France – Eiffel Tower ---------------- */
  fr: {
    tint: '#1b2a63',
    haloX: 200,
    main: (
      <>
        <path
          fillRule="evenodd"
          d="M118 200 C148 156 172 104 186 44 L193 16 L198 16 L200 2 L202 16 L207 16 L214 44 C228 104 252 156 282 200 L254 200 Q200 136 146 200 Z
             M176 148 L190 104 L210 104 L224 148 Z"
        />
        <rect x="150" y="146" width="100" height="8" />
        <rect x="146" y="143" width="108" height="4" />
        <rect x="180" y="100" width="40" height="6" />
        <rect x="190" y="44" width="20" height="4" />
        <g stroke={D} strokeWidth="0.9" opacity="0.55" fill="none">
          <path d="M160 176 L176 154 M172 176 L160 156 M228 176 L240 156 M240 176 L224 154" />
          <path d="M186 140 L196 112 M214 140 L204 112 M190 92 L198 56 M210 92 L202 56" />
          <path d="M186 96 L202 70 M214 96 L198 70" />
        </g>
        {/* Haussmann roofline */}
        <path d="M0 200 V180 l10 -8 h40 l10 8 V200 Z M330 200 V178 l12 -8 h44 l14 8 V200 Z" opacity="0.55" />
      </>
    ),
  },

  /* ---------------- Germany – Brandenburg Gate ---------------- */
  de: {
    tint: '#182b5f',
    haloX: 200,
    main: (
      <>
        <rect x="80" y="192" width="240" height="8" />
        {/* Guard houses */}
        <rect x="46" y="150" width="44" height="42" />
        <path d="M42 150 L68 138 L94 150 Z" />
        <rect x="310" y="150" width="44" height="42" />
        <path d="M306 150 L332 138 L358 150 Z" />
        {/* Columns */}
        {[96, 132, 168, 222, 258, 294].map((x) => (
          <g key={x}>
            <rect x={x} y="124" width="11" height="68" />
            <rect x={x - 2} y="188" width="15" height="4" />
            {[3, 6].map((o) => (
              <rect key={o} x={x + o} y="128" width="0.9" height="60" fill={D} opacity="0.5" />
            ))}
          </g>
        ))}
        <rect x="90" y="108" width="220" height="16" />
        {range(14).map((i) => (
          <rect key={i} x={96 + i * 15.4} y="112" width="5" height="9" fill={D} opacity="0.55" />
        ))}
        <rect x="86" y="103" width="228" height="6" />
        <rect x="128" y="84" width="144" height="20" />
        <rect x="150" y="72" width="100" height="13" />
        {/* Quadriga */}
        <path d="M168 72 q2 -10 8 -12 q4 -1 5 3 l3 -6 q5 -3 7 2 l3 -5 q5 -3 7 2 l3 -5 q5 -3 7 3 v18 Z" />
        <rect x="197" y="38" width="4" height="22" />
        <circle cx="199" cy="34" r="5" fill="none" stroke="#e2bd65" strokeWidth="1.6" />
        <path d="M193 52 L205 52 L206 60 L192 60 Z" />
      </>
    ),
  },
};
