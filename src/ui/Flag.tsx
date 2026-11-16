import { useId } from 'react';
import type { CountryId } from '../game/types';
import './Flag.css';

/** Hand-built SVG flags – crisp at any size, zero network requests. */
export function Flag({ country, size = 40, className = '', rounded = true }: { country: CountryId; size?: number; className?: string; rounded?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const height = Math.round(size * (2 / 3));
  return (
    <span className={`flag ${rounded ? 'flag--rounded' : ''} ${className}`} style={{ width: size, height }}>
      <svg viewBox="0 0 60 40" width={size} height={height} preserveAspectRatio="xMidYMid slice" role="img" aria-label={country}>
        {FLAGS[country](uid)}
      </svg>
    </span>
  );
}

const FLAGS: Record<CountryId, (uid: string) => React.ReactNode> = {
  il: () => (
    <>
      <rect width="60" height="40" fill="#fff" />
      <rect y="4" width="60" height="6" fill="#0038b8" />
      <rect y="30" width="60" height="6" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="1.5">
        <path d="M30 13 L36.06 23.5 L23.94 23.5 Z" />
        <path d="M30 27 L23.94 16.5 L36.06 16.5 Z" />
      </g>
    </>
  ),
  us: () => {
    const stripes = Array.from({ length: 13 }, (_, i) => (
      <rect key={i} y={(i * 40) / 13} width="60" height={40 / 13} fill={i % 2 ? '#fff' : '#b31942'} />
    ));
    const stars = [];
    for (let r = 0; r < 9; r++) {
      const cols = r % 2 ? 5 : 6;
      for (let c = 0; c < cols; c++) {
        stars.push(<circle key={`${r}-${c}`} cx={2 + c * 4 + (r % 2 ? 2 : 0)} cy={1.9 + r * 2.15} r="0.7" fill="#fff" />);
      }
    }
    return (
      <>
        {stripes}
        <rect width="24" height={(40 / 13) * 7} fill="#0a3161" />
        {stars}
      </>
    );
  },
  gb: (uid) => (
    <>
      <defs>
        <clipPath id={`gbt-${uid}`}>
          <path d="M30,20 h30 v20 z v20 h-30 z h-30 v-20 z v-20 h30 z" />
        </clipPath>
      </defs>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" clipPath={`url(#gbt-${uid})`} stroke="#c8102e" strokeWidth="4" />
      <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="12" />
      <path d="M30,0 v40 M0,20 h60" stroke="#c8102e" strokeWidth="7" />
    </>
  ),
  fr: () => (
    <>
      <rect width="20" height="40" fill="#002395" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#ed2939" />
    </>
  ),
  de: () => (
    <>
      <rect width="60" height="13.34" fill="#000" />
      <rect y="13.33" width="60" height="13.34" fill="#dd0000" />
      <rect y="26.66" width="60" height="13.34" fill="#ffce00" />
    </>
  ),
};
