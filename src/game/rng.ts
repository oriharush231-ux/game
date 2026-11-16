/** Small deterministic PRNG (mulberry32) – identical seeds replay identical worlds. */
export interface Rng {
  next(): number;
  range(min: number, max: number): number;
  chance(p: number): boolean;
  pick<T>(items: readonly T[]): T;
  /** Current internal state – store it to resume the sequence later. */
  state(): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    chance: (p) => next() < p,
    pick: (items) => items[Math.floor(next() * items.length)],
    state: () => s,
  };
}

export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
export const round1 = (v: number) => Math.round(v * 10) / 10;
