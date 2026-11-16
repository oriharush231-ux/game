import type { GameSession, NewsItem } from '../types';
import type { Rng } from '../rng';

export type EngineId = 'economy' | 'politics' | 'elections' | 'diplomacy' | 'career';

export interface TurnContext {
  rng: Rng;
  /** Publish a news item to the in-game feed. */
  publish: (item: Omit<NewsItem, 'id' | 'turn'>) => void;
}

/**
 * A simulation engine. Engines are pure: they receive the session and return
 * a new one. They run in `order` every turn (1 turn = 1 month).
 *
 * To add a system (media, military, EU, …) implement this interface and
 * register it in `registry.ts` – the UI and turn loop need no changes.
 */
export interface GameEngine {
  id: EngineId;
  label: string;
  order: number;
  /** Only run in these world modes (default: both). */
  modes?: GameSession['mode'][];
  onInit?(session: GameSession, ctx: TurnContext): GameSession;
  onTurn(session: GameSession, ctx: TurnContext): GameSession;
}
