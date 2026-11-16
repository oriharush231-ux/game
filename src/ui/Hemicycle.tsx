import { memo, useMemo } from 'react';
import type { PartyDefinition } from '../game/types';

/**
 * Parliament seat chart. Seats are laid out on concentric arcs and coloured
 * by party (government parties on the right in RTL reading order).
 */
export const Hemicycle = memo(function Hemicycle({ parties, majority }: { parties: PartyDefinition[]; majority: number }) {
  const { seats, r } = useMemo(() => layout(parties), [parties]);
  const gov = parties.filter((p) => p.inGovernment).reduce((s, p) => s + p.seats, 0);
  return (
    <svg viewBox="-110 -108 220 118" width="100%" style={{ display: 'block', maxHeight: 220 }} aria-label={`קואליציה ${gov} מושבים`}>
      {seats.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={r} fill={s.color} opacity={s.gov ? 1 : 0.55} />
      ))}
      <text x="0" y="-12" textAnchor="middle" fontSize="22" fontWeight="700" fill="#f6e3a8" fontFamily="Cinzel, Georgia, serif">
        {gov}
      </text>
      <text x="0" y="2" textAnchor="middle" fontSize="7.5" fill="#8392b0" letterSpacing="0.5">
        {`קואליציה · רוב ${majority}`}
      </text>
    </svg>
  );
});

function layout(parties: PartyDefinition[]) {
  const total = parties.reduce((s, p) => s + p.seats, 0);
  const rows = Math.max(4, Math.min(14, Math.round(Math.sqrt(total / 3.2))));
  const inner = 38;
  const outer = 102;
  const radii = Array.from({ length: rows }, (_, i) => inner + ((outer - inner) * i) / (rows - 1));
  const sumR = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((rad) => Math.floor((total * rad) / sumR));
  let rest = total - counts.reduce((a, b) => a + b, 0);
  for (let i = counts.length - 1; rest > 0; i = (i - 1 + counts.length) % counts.length, rest--) counts[i]++;

  const pts: { x: number; y: number; a: number }[] = [];
  radii.forEach((rad, ri) => {
    const n = counts[ri];
    for (let k = 0; k < n; k++) {
      const a = Math.PI - (n === 1 ? Math.PI / 2 : (k / (n - 1)) * Math.PI);
      pts.push({ x: Math.cos(a) * rad, y: -Math.sin(a) * rad, a });
    }
  });
  // Fill by angle: government parties first from the right side
  pts.sort((p, q) => p.a - q.a);
  const ordered = [...parties].sort((a, b) => Number(b.inGovernment) - Number(a.inGovernment));
  const seats: { x: number; y: number; color: string; gov: boolean }[] = [];
  let idx = 0;
  for (const p of ordered) for (let s = 0; s < p.seats && idx < pts.length; s++, idx++) seats.push({ ...pts[idx], color: p.color, gov: p.inGovernment });
  const r = Math.min(3.6, ((outer - inner) / rows) * 0.42);
  return { seats, r };
}
