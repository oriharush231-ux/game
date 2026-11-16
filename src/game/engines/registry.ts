import type { GameSession } from '../types';
import { careerEngine } from './career';
import { diplomacyEngine } from './diplomacy';
import { economyEngine } from './economy';
import { electionsEngine } from './elections';
import { politicsEngine } from './politics';
import type { GameEngine } from './types';

export const ENGINES: GameEngine[] = [economyEngine, politicsEngine, electionsEngine, diplomacyEngine, careerEngine].sort(
  (a, b) => a.order - b.order,
);

export const enginesFor = (mode: GameSession['mode']) => ENGINES.filter((e) => !e.modes || e.modes.includes(mode));
