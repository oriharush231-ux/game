import { getCountry, getNextRank, getRank } from './data/countries';
import { clamp, createRng, round1 } from './rng';
import type { GameSession, PlayerCharacter } from './types';
import type { IconName } from '../ui/Icon';

type StatEffect = Partial<Pick<PlayerCharacter, 'influence' | 'reputation' | 'popularity' | 'funds'>>;

export interface PlayerAction {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  cost: number; // action points
  fundsCost?: number;
  minTier: number;
  maxTier?: number;
  effects: StatEffect;
  /** Chance the action backfires (effects inverted & halved). */
  risk?: number;
}

export const PLAYER_ACTIONS: PlayerAction[] = [
  { id: 'volunteer', title: 'התנדבות בקמפיין', description: 'דפיקות על דלתות ובניית רשת קשרים.', icon: 'handshake', cost: 1, minTier: 0, maxTier: 1, effects: { influence: 3, reputation: 2 } },
  { id: 'petition', title: 'ארגון עצומה ציבורית', description: 'גיוס חתימות על נושא בוער.', icon: 'scroll', cost: 1, minTier: 0, maxTier: 1, effects: { popularity: 4, influence: 2 } },
  { id: 'op-ed', title: 'מאמר דעה בעיתון', description: 'הצגת חזון מול קהל רחב. עלול לעורר ביקורת.', icon: 'pen', cost: 1, minTier: 0, effects: { reputation: 4, influence: 2 }, risk: 0.15 },
  { id: 'rally', title: 'ארגון עצרת', description: 'אלפים ברחובות – כוח גדול, סיכון גדול.', icon: 'megaphone', cost: 2, fundsCost: 10, minTier: 0, effects: { popularity: 8, influence: 4 }, risk: 0.2 },
  { id: 'town-hall', title: 'כנס תושבים', description: 'מפגש פתוח עם הבוחרים.', icon: 'users', cost: 1, minTier: 1, effects: { popularity: 5, reputation: 1 } },
  { id: 'local-initiative', title: 'יוזמה תקציבית מקומית', description: 'פרויקט שהתושבים יזכרו.', icon: 'building', cost: 2, fundsCost: 15, minTier: 1, maxTier: 2, effects: { influence: 6, popularity: 3 } },
  { id: 'bill', title: 'הגשת הצעת חוק', description: 'חקיקה שמסמנת אותך על המפה.', icon: 'gavel', cost: 2, minTier: 2, effects: { influence: 6, reputation: 3 }, risk: 0.1 },
  { id: 'prime-time', title: 'ראיון בפריים טיים', description: 'חשיפה ארצית מול מיליוני צופים.', icon: 'broadcast', cost: 1, minTier: 2, effects: { popularity: 6 }, risk: 0.18 },
  { id: 'fundraise', title: 'ערב גיוס תרומות', description: 'תקציב לקמפיין הבא.', icon: 'coins', cost: 1, minTier: 0, effects: { funds: 30, reputation: -1 } },
];

export function availableActions(session: GameSession) {
  const tier = getRank(session.player.countryId, session.player.rankId).tier;
  return PLAYER_ACTIONS.filter((a) => tier >= a.minTier && (a.maxTier === undefined || tier <= a.maxTier));
}

export function canPerform(session: GameSession, action: PlayerAction) {
  return session.player.actionPoints >= action.cost && session.player.funds >= (action.fundsCost ?? 0);
}

function rngFor(session: GameSession, salt: string) {
  let h = session.seed ^ session.turn;
  for (const ch of salt + session.player.actionPoints + session.news.length) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return createRng(h);
}

export function performAction(session: GameSession, actionId: string): GameSession {
  const action = PLAYER_ACTIONS.find((a) => a.id === actionId);
  if (!action || !canPerform(session, action)) return session;
  const rng = rngFor(session, actionId);
  const backfire = rng.chance(action.risk ?? 0);
  const mult = backfire ? -0.5 : rng.range(0.8, 1.25);

  const p = session.player;
  const apply = (key: keyof StatEffect) => (action.effects[key] ?? 0) * mult;
  const player: PlayerCharacter = {
    ...p,
    actionPoints: p.actionPoints - action.cost,
    funds: Math.max(0, Math.round(p.funds - (action.fundsCost ?? 0) + apply('funds'))),
    influence: round1(clamp(p.influence + apply('influence'))),
    reputation: round1(clamp(p.reputation + apply('reputation'))),
    popularity: round1(clamp(p.popularity + apply('popularity'))),
  };

  return {
    ...session,
    player,
    news: [
      {
        id: `act-${session.turn}-${session.news.length}-${actionId}`,
        turn: session.turn,
        countryId: p.countryId,
        category: 'career' as const,
        tone: backfire ? ('negative' as const) : ('positive' as const),
        headline: backfire ? `${action.title}: המהלך של ${p.name} נתקל בביקורת` : `${action.title}: ${p.name} מגביר את הנוכחות הציבורית`,
      },
      ...session.news,
    ].slice(0, 40),
  };
}

/** Chance of winning the next position (0–1), or null if not yet eligible. */
export function promotionOdds(session: GameSession): number | null {
  const next = getNextRank(session.player.countryId, session.player.rankId);
  if (!next || session.player.influence < next.influenceRequired) return null;
  const p = session.player;
  return clamp((p.popularity * 0.5 + p.reputation * 0.3 + (p.influence - next.influenceRequired) * 1.5 + 10) / 100, 0.1, 0.92);
}

export function attemptPromotion(session: GameSession): { session: GameSession; success: boolean } {
  const odds = promotionOdds(session);
  const next = getNextRank(session.player.countryId, session.player.rankId);
  if (odds === null || !next || session.player.actionPoints < 3) return { session, success: false };
  const success = rngFor(session, 'promotion').chance(odds);
  const p = session.player;
  const country = getCountry(p.countryId);
  const player: PlayerCharacter = success
    ? { ...p, rankId: next.id, actionPoints: 0, reputation: clamp(p.reputation + 5), maxActionPoints: Math.min(5, 3 + Math.floor(next.tier / 2)) }
    : { ...p, actionPoints: 0, popularity: round1(clamp(p.popularity - 6)), influence: round1(clamp(p.influence - 4)) };
  return {
    success,
    session: {
      ...session,
      player,
      news: [
        {
          id: `promo-${session.turn}-${session.news.length}`,
          turn: session.turn,
          countryId: p.countryId,
          category: 'career' as const,
          tone: success ? ('breaking' as const) : ('negative' as const),
          headline: success ? `${country.name}: ${p.name} נבחר לתפקיד ${next.title}` : `${p.name} הפסיד במרוץ לתפקיד ${next.title}`,
        },
        ...session.news,
      ].slice(0, 40),
    },
  };
}
