/**
 * Core domain model for 61 – WORLD LEADERS.
 * Everything here is plain data (serializable), so sessions can be saved,
 * synced to a server for the shared global world, or replayed later.
 */

export type CountryId = 'il' | 'us' | 'gb' | 'fr' | 'de';

/** solo = the nation runs as a standalone game; global = shared world with all nations. */
export type WorldMode = 'solo' | 'global';

/** How the player enters politics. */
export type StartPath = 'citizen' | 'politician';

export type Ideology = 'progressive' | 'liberal' | 'centrist' | 'conservative';

export type GovernmentType =
  | 'parliamentary-republic'
  | 'presidential-federal-republic'
  | 'parliamentary-monarchy'
  | 'semi-presidential-republic'
  | 'federal-parliamentary-republic';

export type InstitutionKind =
  | 'head-of-state'
  | 'executive'
  | 'legislature'
  | 'upper-house'
  | 'judiciary'
  | 'central-bank'
  | 'local';

export interface Institution {
  id: string;
  kind: InstitutionKind;
  name: string;
  nativeName: string;
  seats?: number;
  description: string;
}

export interface Law {
  id: string;
  name: string;
  category: 'constitutional' | 'economy' | 'society' | 'security' | 'elections';
  description: string;
}

export interface CareerRank {
  id: string;
  tier: number; // 0 = citizen … 5 = head of government/state
  title: string;
  nativeTitle: string;
  description: string;
  /** Influence required to become eligible for this rank. */
  influenceRequired: number;
}

export interface ElectionSystem {
  name: string;
  description: string;
  cycleYears: number;
  legislatureSeats: number;
  majority: number;
  threshold?: number; // percent
}

/** Fictional parties – the game never depicts real-world parties or politicians. */
export interface PartyDefinition {
  id: string;
  name: string;
  ideology: Ideology;
  color: string;
  seats: number;
  inGovernment: boolean;
}

export interface NationStats {
  approval: number; // 0-100 public approval of government
  stability: number; // 0-100
  gdpGrowth: number; // %
  unemployment: number; // %
  inflation: number; // %
  debtToGdp: number; // %
  influence: number; // 0-100 global influence
}

export interface CountryDefinition {
  id: CountryId;
  isoNumeric: string;
  name: string;
  nativeName: string;
  englishName: string;
  capital: string;
  capitalCoords: [lon: number, lat: number];
  /** Map viewport for the regional focus view: [west, south, east, north]. */
  focus: [number, number, number, number];
  tagline: string;
  description: string;
  difficulty: 1 | 2 | 3;
  government: {
    type: GovernmentType;
    label: string;
    headOfState: string;
    headOfGovernment: string;
    legislature: string;
  };
  population: number; // millions
  gdpUsdBn: number;
  currency: string;
  palette: { primary: string; secondary: string; glow: string };
  institutions: Institution[];
  laws: Law[];
  elections: ElectionSystem;
  parties: PartyDefinition[];
  career: CareerRank[];
  /** The rank a player starts at when choosing the political path. */
  politicianStartRankId: string;
  baseStats: NationStats;
  /** Months until the next general election at game start. */
  monthsToElection: number;
}

/* ------------------------------------------------------------------ */
/* Runtime state                                                       */
/* ------------------------------------------------------------------ */

export interface PlayerCharacter {
  name: string;
  countryId: CountryId;
  path: StartPath;
  ideology: Ideology;
  rankId: string;
  influence: number; // personal political influence 0-100
  reputation: number; // 0-100
  popularity: number; // 0-100
  funds: number; // campaign funds (thousands, local currency-agnostic)
  actionPoints: number;
  maxActionPoints: number;
}

export interface NationState {
  id: CountryId;
  stats: NationStats;
  history: Partial<Record<keyof NationStats, number[]>>;
  monthsToElection: number;
  parties: PartyDefinition[];
}

export type NewsTone = 'positive' | 'negative' | 'neutral' | 'breaking';

export interface NewsItem {
  id: string;
  turn: number;
  countryId?: CountryId;
  category: 'politics' | 'economy' | 'elections' | 'diplomacy' | 'career';
  tone: NewsTone;
  headline: string;
  body?: string;
}

export interface GameDate {
  year: number;
  month: number; // 0-11
}

export interface GameSession {
  version: 1;
  id: string;
  seed: number;
  createdAt: number;
  mode: WorldMode;
  turn: number;
  date: GameDate;
  player: PlayerCharacter;
  /** In solo mode only the player's nation is simulated. */
  nations: Partial<Record<CountryId, NationState>>;
  /** Pairwise relations −100..100, key is sorted "aa:bb". */
  relations: Record<string, number>;
  news: NewsItem[];
}

export interface NewGameSetup {
  mode: WorldMode;
  countryId: CountryId;
  path: StartPath;
  name: string;
  ideology: Ideology;
}
