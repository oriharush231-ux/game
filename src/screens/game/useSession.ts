import { useGame } from '../../store/gameStore';
import type { GameSession, NationState } from '../../game/types';

/** The active session. GameScreen is only mounted when a session exists (see App). */
export function useSession(): GameSession {
  return useGame((s) => s.session)!;
}

export function usePlayerNation(): NationState {
  const s = useSession();
  return s.nations[s.player.countryId]!;
}

/** Change of a stat since last turn. */
export function lastDelta(nation: NationState, key: keyof NationState['stats']): number {
  const h = nation.history[key] ?? [];
  if (h.length < 2) return 0;
  return Math.round((h[h.length - 1] - h[h.length - 2]) * 10) / 10;
}
