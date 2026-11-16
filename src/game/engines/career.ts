import { clamp, round1 } from '../rng';
import type { GameEngine } from './types';

/**
 * Career engine (v0): refreshes the player's action points and applies
 * monthly drift to personal stats. Promotions are earned through actions.
 */
export const careerEngine: GameEngine = {
  id: 'career',
  label: 'קריירה',
  order: 50,
  onTurn(session) {
    const p = session.player;
    return {
      ...session,
      player: {
        ...p,
        actionPoints: p.maxActionPoints,
        popularity: round1(clamp(p.popularity + (50 - p.popularity) * 0.02)),
        funds: Math.round(p.funds + 4 + p.influence * 0.2),
      },
    };
  },
};
