import { memo, useMemo } from 'react';
import dots from '../game/data/worldDots.json';
import { COUNTRIES } from '../game/data/countries';
import type { CountryId } from '../game/types';
import './WorldMap.css';

type DotMap = {
  step: number;
  latTop: number;
  cols: number;
  rows: number;
  land: string;
  nations: Record<CountryId, { d: string; fine: boolean }>;
};
const MAP = dots as DotMap;

/** lon/lat → map grid units (same space as the pre-computed dot paths). */
export function project(lon: number, lat: number): [number, number] {
  return [(lon + 180) / MAP.step - 0.5, (MAP.latTop - lat) / MAP.step - 0.5];
}

export interface MapLink {
  from: CountryId;
  to: CountryId;
  /** −100..100 relation score – tints the arc. */
  value: number;
}

interface Props {
  /** Nations drawn in gold. */
  nations?: CountryId[];
  selected?: CountryId | null;
  /** Zoom to the selected nation's region. */
  focus?: CountryId | null;
  links?: MapLink[];
  showCapitals?: boolean;
  className?: string;
  onSelect?: (id: CountryId) => void;
}

/**
 * Dot-matrix world map. ~10k land dots rendered as a single SVG path,
 * so it costs roughly one DOM node and paints instantly on mobile.
 */
export const WorldMap = memo(function WorldMap({ nations = [], selected, focus, links = [], showCapitals = true, className = '', onSelect }: Props) {
  const viewBox = useMemo(() => {
    if (!focus) return `0 0 ${MAP.cols} ${MAP.rows}`;
    const [w, s, e, n] = COUNTRIES[focus].focus;
    const [x0, y0] = project(w, n);
    const [x1, y1] = project(e, s);
    return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
  }, [focus]);

  const zoomed = Boolean(focus);

  return (
    <div className={`worldmap ${zoomed ? 'worldmap--focus' : ''} ${className}`}>
      <svg viewBox={viewBox} preserveAspectRatio={zoomed ? 'xMidYMid meet' : 'xMidYMid slice'} role="img" aria-label="מפת העולם">
        <defs>
          <radialGradient id="wm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f6e3a8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f6e3a8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wm-arc" x1="0" x2="1">
            <stop offset="0" stopColor="#e2bd65" stopOpacity="0.15" />
            <stop offset="0.5" stopColor="#f6e3a8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#e2bd65" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Graticule */}
        <g className="worldmap__grid">
          {[60, 30, 0, -30].map((lat) => {
            const y = project(0, lat)[1];
            return <line key={lat} x1={0} x2={MAP.cols} y1={y} y2={y} />;
          })}
        </g>

        <path className="worldmap__land" d={MAP.land} strokeWidth={zoomed ? 0.34 : 0.5} />

        {nations.map((id) => {
          const n = MAP.nations[id];
          const isSel = id === selected;
          const w = n.fine ? (zoomed ? 0.22 : 0.34) : zoomed ? 0.44 : 0.66;
          return (
            <path
              key={id}
              className={`worldmap__nation ${isSel ? 'is-selected' : ''} ${onSelect ? 'is-interactive' : ''}`}
              d={n.d}
              strokeWidth={isSel ? w * 1.12 : w}
              onClick={onSelect ? () => onSelect(id) : undefined}
            />
          );
        })}

        {links.map((l) => {
          const [x1, y1] = project(...COUNTRIES[l.from].capitalCoords);
          const [x2, y2] = project(...COUNTRIES[l.to].capitalCoords);
          const dist = Math.hypot(x2 - x1, y2 - y1);
          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2 - dist * 0.35;
          const tone = l.value >= 60 ? 'strong' : l.value >= 35 ? 'mid' : 'weak';
          return <path key={`${l.from}-${l.to}`} className={`worldmap__arc worldmap__arc--${tone}`} d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} />;
        })}

        {showCapitals &&
          nations.map((id) => {
            const [x, y] = project(...COUNTRIES[id].capitalCoords);
            const isSel = id === selected;
            const r = zoomed ? 0.45 : 0.75;
            return (
              <g key={id} className={`worldmap__capital ${isSel ? 'is-selected' : ''}`} transform={`translate(${x} ${y})`}>
                {isSel && <circle r={r * 5} fill="url(#wm-glow)" />}
                {isSel && <circle className="worldmap__pulse" r={r * 1.6} />}
                <circle className="worldmap__dot" r={isSel ? r : r * 0.7} />
              </g>
            );
          })}
      </svg>
    </div>
  );
});
