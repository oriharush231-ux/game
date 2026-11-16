import type { CountryId, GameSession, NationState, NationStats } from '../types';

export const HISTORY_LENGTH = 24;

export function mapNations(
  session: GameSession,
  fn: (nation: NationState, id: CountryId) => NationState,
): GameSession {
  const nations: GameSession['nations'] = {};
  for (const [id, nation] of Object.entries(session.nations) as [CountryId, NationState][]) {
    nations[id] = fn(nation, id);
  }
  return { ...session, nations };
}

export function pushHistory(nation: NationState): NationState {
  const history = { ...nation.history };
  for (const key of Object.keys(nation.stats) as (keyof NationStats)[]) {
    const prev = history[key] ?? [];
    history[key] = [...prev, nation.stats[key]].slice(-HISTORY_LENGTH);
  }
  return { ...nation, history };
}

export const relationKey = (a: CountryId, b: CountryId) => (a < b ? `${a}:${b}` : `${b}:${a}`);
