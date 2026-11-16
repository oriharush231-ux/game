import { COUNTRIES } from '../data/countries';
import { clamp, round1 } from '../rng';
import type { CountryId } from '../types';
import type { GameEngine } from './types';
import { relationKey } from './util';

/** Baseline bilateral relations for the launch roster. */
export const BASE_RELATIONS: Record<string, number> = {
  [relationKey('il', 'us')]: 78,
  [relationKey('il', 'gb')]: 42,
  [relationKey('il', 'fr')]: 28,
  [relationKey('il', 'de')]: 55,
  [relationKey('us', 'gb')]: 82,
  [relationKey('us', 'fr')]: 58,
  [relationKey('us', 'de')]: 64,
  [relationKey('gb', 'fr')]: 52,
  [relationKey('gb', 'de')]: 60,
  [relationKey('fr', 'de')]: 76,
};

/**
 * Diplomacy engine (v0, global world only): relations drift around their baseline
 * with occasional incidents. Will grow into treaties, summits, sanctions, alliances.
 */
export const diplomacyEngine: GameEngine = {
  id: 'diplomacy',
  label: 'דיפלומטיה',
  order: 40,
  modes: ['global'],
  onInit(session) {
    return { ...session, relations: { ...BASE_RELATIONS } };
  },
  onTurn(session, { rng, publish }) {
    const relations: Record<string, number> = {};
    for (const [key, value] of Object.entries(session.relations)) {
      const base = BASE_RELATIONS[key] ?? 0;
      let next = value + (base - value) * 0.1 + rng.range(-1.5, 1.5);
      if (rng.chance(0.03)) {
        const delta = rng.range(-12, 10);
        next += delta;
        const [a, b] = key.split(':') as CountryId[];
        publish({
          category: 'diplomacy',
          tone: delta > 0 ? 'positive' : 'negative',
          headline: delta > 0 ? `פסגה מוצלחת בין ${COUNTRIES[a].name} ל${COUNTRIES[b].name}` : `מתיחות דיפלומטית בין ${COUNTRIES[a].name} ל${COUNTRIES[b].name}`,
        });
      }
      relations[key] = round1(clamp(next, -100, 100));
    }
    return { ...session, relations };
  },
};
