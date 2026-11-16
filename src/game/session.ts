import { COUNTRIES, COUNTRY_ORDER, getCountry } from './data/countries';
import { enginesFor } from './engines/registry';
import type { TurnContext } from './engines/types';
import { pushHistory } from './engines/util';
import { createRng } from './rng';
import type { CountryId, GameSession, NationState, NewGameSetup, NewsItem, PlayerCharacter, StartPath } from './types';

const MAX_NEWS = 40;

/** Starting personal stats for each entry path. */
export const STARTING_STATS: Record<StartPath, Pick<PlayerCharacter, 'influence' | 'reputation' | 'popularity' | 'funds'>> = {
  citizen: { influence: 6, reputation: 55, popularity: 22, funds: 15 },
  politician: { influence: 18, reputation: 40, popularity: 30, funds: 60 },
};

function createNation(id: CountryId): NationState {
  const c = COUNTRIES[id];
  const nation: NationState = {
    id,
    stats: { ...c.baseStats },
    history: {},
    monthsToElection: c.monthsToElection,
    parties: c.parties.map((p) => ({ ...p })),
  };
  return pushHistory(nation);
}

function makeContext(session: GameSession, salt: number, sink: NewsItem[]): TurnContext {
  const rng = createRng(session.seed ^ Math.imul(session.turn + 1, 2654435761) ^ salt);
  return {
    rng,
    publish: (item) =>
      sink.push({ ...item, id: `${session.turn}-${sink.length}-${Math.floor(rng.next() * 1e6)}`, turn: session.turn }),
  };
}

export function createSession(setup: NewGameSetup, seed = Date.now() % 2147483647): GameSession {
  const country = getCountry(setup.countryId);
  const startRank = setup.path === 'politician' ? country.politicianStartRankId : country.career[0].id;
  const ids = setup.mode === 'global' ? COUNTRY_ORDER : [setup.countryId];
  const now = new Date();

  let session: GameSession = {
    version: 1,
    id: `wl-${seed.toString(36)}`,
    seed,
    createdAt: Date.now(),
    mode: setup.mode,
    turn: 1,
    date: { year: now.getFullYear(), month: now.getMonth() },
    player: {
      name: setup.name.trim() || 'מנהיג אנונימי',
      countryId: setup.countryId,
      path: setup.path,
      ideology: setup.ideology,
      rankId: startRank,
      ...STARTING_STATS[setup.path],
      actionPoints: 3,
      maxActionPoints: 3,
    },
    nations: Object.fromEntries(ids.map((id) => [id, createNation(id)])),
    relations: {},
    news: [],
  };

  const news: NewsItem[] = [];
  for (const engine of enginesFor(session.mode)) {
    if (engine.onInit) session = engine.onInit(session, makeContext(session, engine.order, news));
  }

  const rank = country.career.find((r) => r.id === startRank)!;
  news.push(
    {
      id: 'welcome',
      turn: 1,
      countryId: setup.countryId,
      category: 'career',
      tone: 'breaking',
      headline: setup.path === 'politician' ? `${session.player.name} נכנס לתפקיד ${rank.title}` : `${session.player.name} מצטרף לזירה הציבורית`,
      body: setup.path === 'politician' ? `הדרך ל${country.career.at(-1)!.title} מתחילה עכשיו.` : 'מהשטח אל מוקדי הכוח – כל קריירה גדולה מתחילה בצעד אחד.',
    },
    {
      id: 'world',
      turn: 1,
      category: setup.mode === 'global' ? 'diplomacy' : 'politics',
      tone: 'neutral',
      headline: setup.mode === 'global' ? 'העולם הגלובלי פעיל: 5 מדינות, זירה אחת' : `${country.name}: מצב מדינה עצמאית`,
    },
  );
  return { ...session, news: news.reverse() };
}

/** Advance one month: run every engine in order, record history, collect news. */
export function advanceTurn(session: GameSession): GameSession {
  const news: NewsItem[] = [];
  let next = session;
  for (const engine of enginesFor(session.mode)) {
    next = engine.onTurn(next, makeContext(next, engine.order * 7919, news));
  }

  const nations: GameSession['nations'] = {};
  for (const [id, n] of Object.entries(next.nations) as [CountryId, NationState][]) nations[id] = pushHistory(n);

  const month = (next.date.month + 1) % 12;
  const year = next.date.year + (month === 0 ? 1 : 0);

  return {
    ...next,
    nations,
    turn: next.turn + 1,
    date: { year, month },
    news: [...news.reverse(), ...next.news].slice(0, MAX_NEWS),
  };
}
