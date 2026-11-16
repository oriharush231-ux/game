import { COUNTRIES } from '../data/countries';
import { clamp, round1 } from '../rng';
import type { GameEngine } from './types';
import { mapNations } from './util';

const HEADLINES = {
  positive: ['הממשלה מציגה תוכנית דיור לאומית', 'הסכם קואליציוני חדש מייצב את הממשלה', 'סקר: עלייה באמון הציבור במוסדות'],
  negative: ['משבר קואליציוני: סיעה מאיימת לפרוש', 'הפגנות ענק מול בניין הפרלמנט', 'סערה סביב מינוי בכיר'],
};

/**
 * Politics engine (v0): approval follows the economy, stability follows approval.
 * Will grow into: parliament votes, coalitions, legislation, scandals, media.
 */
export const politicsEngine: GameEngine = {
  id: 'politics',
  label: 'פוליטיקה',
  order: 20,
  onTurn(session, { rng, publish }) {
    return mapNations(session, (nation, id) => {
      const base = COUNTRIES[id].baseStats;
      const s = nation.stats;
      const econ = (s.gdpGrowth - base.gdpGrowth) * 1.2 - (s.unemployment - base.unemployment) * 1.5 - Math.max(0, s.inflation - 3) * 0.6;
      const approval = round1(clamp(s.approval + (base.approval - s.approval) * 0.08 + econ * 0.4 + rng.range(-1.6, 1.6), 5, 95));
      const stability = round1(clamp(s.stability + (approval - s.approval) * 0.35 + (base.stability - s.stability) * 0.06 + rng.range(-0.8, 0.8), 5, 98));

      if (id === session.player.countryId && rng.chance(0.25)) {
        const tone = approval >= s.approval ? 'positive' : 'negative';
        publish({ countryId: id, category: 'politics', tone, headline: rng.pick(HEADLINES[tone]) });
      }
      return { ...nation, stats: { ...s, approval, stability } };
    });
  },
};
