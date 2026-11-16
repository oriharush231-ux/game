import { COUNTRIES } from '../data/countries';
import { clamp, round1 } from '../rng';
import type { CountryId, NationState } from '../types';
import type { GameEngine } from './types';
import { mapNations } from './util';

/**
 * Economy engine (v0): mean-reverting random walk around each nation's baseline.
 * Placeholder for the full model (budget, taxes, sectors, trade).
 */
export const economyEngine: GameEngine = {
  id: 'economy',
  label: 'כלכלה',
  order: 10,
  onTurn(session, { rng, publish }) {
    return mapNations(session, (nation: NationState, id: CountryId) => {
      const base = COUNTRIES[id].baseStats;
      const s = nation.stats;
      const shock = rng.chance(0.06) ? rng.range(-0.9, 0.7) : 0;
      const gdpGrowth = round1(s.gdpGrowth + (base.gdpGrowth - s.gdpGrowth) * 0.15 + rng.range(-0.25, 0.25) + shock);
      const unemployment = round1(clamp(s.unemployment + (base.unemployment - s.unemployment) * 0.12 - (gdpGrowth - base.gdpGrowth) * 0.08 + rng.range(-0.12, 0.12), 1, 30));
      const inflation = round1(clamp(s.inflation + (base.inflation - s.inflation) * 0.15 + rng.range(-0.2, 0.2), -2, 25));

      if (id === session.player.countryId && Math.abs(shock) > 0.4) {
        publish({
          countryId: id,
          category: 'economy',
          tone: shock > 0 ? 'positive' : 'negative',
          headline: shock > 0 ? 'זינוק לא צפוי בנתוני הצמיחה' : 'נתוני צמיחה מאכזבים מטלטלים את השווקים',
          body: `צמיחה שנתית מעודכנת: ${gdpGrowth}%`,
        });
      }

      return { ...nation, stats: { ...s, gdpGrowth, unemployment, inflation } };
    });
  },
};
