import { availableActions, canPerform, promotionOdds } from '../../game/actions';
import { COUNTRIES, getNextRank, getRank } from '../../game/data/countries';
import type { GameSession, NationState, NationStats, NewsItem } from '../../game/types';
import { he } from '../../i18n/he';
import { useGame } from '../../store/gameStore';
import { Button } from '../../ui/Button';
import { Flag } from '../../ui/Flag';
import { Icon, type IconName } from '../../ui/Icon';
import { Chip, Panel, Sparkline } from '../../ui/Panel';
import { lastDelta } from './useSession';

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '');
}

/* ---------------- KPI card ---------------- */
const LOWER_IS_BETTER: (keyof NationStats)[] = ['unemployment', 'inflation', 'debtToGdp'];
const PERCENT: (keyof NationStats)[] = ['gdpGrowth', 'unemployment', 'inflation', 'debtToGdp', 'approval', 'stability'];

export function Kpi({ nation, stat, icon }: { nation: NationState; stat: keyof NationStats; icon: IconName }) {
  const value = nation.stats[stat];
  const delta = lastDelta(nation, stat);
  const good = LOWER_IS_BETTER.includes(stat) ? delta < 0 : delta > 0;
  const tone = delta === 0 ? 'gold' : good ? 'green' : 'red';
  return (
    <div className="kpi">
      <div className="kpi__top">
        <span className="kpi__label">
          <Icon name={icon} size={14} />
          {he.stats[stat]}
        </span>
        {delta !== 0 && (
          <span className={`kpi__delta ${good ? 'is-good' : 'is-bad'} num`}>
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        )}
      </div>
      <div className="kpi__value num">
        {stat === 'gdpGrowth' && value > 0 ? '+' : ''}
        {Number.isInteger(value) ? value : value.toFixed(1)}
        {PERCENT.includes(stat) && <small>%</small>}
      </div>
      <Sparkline values={nation.history[stat] ?? [value]} tone={tone} height={30} />
    </div>
  );
}

/* ---------------- Player card ---------------- */
export function PlayerCard({ session }: { session: GameSession }) {
  const p = session.player;
  const rank = getRank(p.countryId, p.rankId);
  const next = getNextRank(p.countryId, p.rankId);
  const progress = next ? Math.min(100, (p.influence / next.influenceRequired) * 100) : 100;
  return (
    <div className="player-card">
      <div className="player-card__avatar">
        <span className="avatar avatar--lg">{initials(p.name)}</span>
        <Flag country={p.countryId} size={24} className="player-card__flag" />
      </div>
      <div className="player-card__info">
        <span className="eyebrow">{p.path === 'citizen' ? 'מסלול אזרחי' : 'נבחר ציבור'}</span>
        <h2 className="player-card__name">{p.name}</h2>
        <div className="player-card__rank">
          <strong>{rank.title}</strong>
          <Chip>{he.ideologies[p.ideology]}</Chip>
        </div>
        {next && (
          <div className="player-card__progress">
            <div className="player-card__progress-row">
              <span>הבא: {next.title}</span>
              <span className="num">
                {Math.round(p.influence)}/{next.influenceRequired}
              </span>
            </div>
            <div className="progress">
              <div className="progress__fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Actions ---------------- */
export function ActionList({ session, limit }: { session: GameSession; limit?: number }) {
  const doAction = useGame((s) => s.doAction);
  const actions = availableActions(session).slice(0, limit);
  return (
    <div className="actions">
      {actions.map((a) => {
        const ok = canPerform(session, a);
        return (
          <button key={a.id} className="action" disabled={!ok} onClick={() => doAction(a.id)}>
            <span className="action__icon">
              <Icon name={a.icon} size={18} />
            </span>
            <span className="action__text">
              <strong>{a.title}</strong>
              <span>{a.description}</span>
            </span>
            <span className="action__cost">
              <span className="ap ap--inline">
                {Array.from({ length: a.cost }, (_, i) => (
                  <i key={i} className="on" />
                ))}
              </span>
              {a.fundsCost ? <span className="num">₪{a.fundsCost}K</span> : null}
              {a.risk ? <span className="action__risk">סיכון</span> : null}
            </span>
          </button>
        );
      })}
      {session.player.actionPoints === 0 && <p className="actions__empty">נגמרו נקודות הפעולה לחודש זה – סיימו את התור כדי להמשיך.</p>}
    </div>
  );
}

export function PromotionCard({ session }: { session: GameSession }) {
  const runForOffice = useGame((s) => s.runForOffice);
  const next = getNextRank(session.player.countryId, session.player.rankId);
  const odds = promotionOdds(session);
  if (!next) {
    return (
      <div className="promo promo--top">
        <Icon name="crown" size={22} />
        <div>
          <strong>הגעתם לפסגה</strong>
          <span>אתם עומדים בראש המדינה. מנועי הממשל המלאים יגיעו בשלב הבא.</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`promo ${odds !== null ? 'promo--ready' : ''}`}>
      <Icon name={odds !== null ? 'sparkles' : 'lock'} size={20} />
      <div className="promo__text">
        <strong>{odds !== null ? `ניתן להתמודד על: ${next.title}` : `${next.title} – נדרשת השפעה ${next.influenceRequired}`}</strong>
        <span>{odds !== null ? `סיכויי הצלחה: ${Math.round(odds * 100)}% · מחייב את כל נקודות הפעולה` : next.description}</span>
      </div>
      {odds !== null && (
        <Button size="sm" icon="vote" disabled={session.player.actionPoints < 3} onClick={runForOffice}>
          התמודדות
        </Button>
      )}
    </div>
  );
}

/* ---------------- News ---------------- */
const NEWS_ICON: Record<NewsItem['category'], IconName> = {
  politics: 'landmark',
  economy: 'chart',
  elections: 'vote',
  diplomacy: 'globe',
  career: 'user',
};

export function NewsFeed({ items, limit = 8 }: { items: NewsItem[]; limit?: number }) {
  return (
    <ul className="news">
      {items.slice(0, limit).map((n) => (
        <li key={n.id} className={`news__item news__item--${n.tone}`}>
          <span className="news__icon">
            {n.countryId ? <Flag country={n.countryId} size={22} /> : <Icon name={NEWS_ICON[n.category]} size={15} />}
          </span>
          <div className="news__text">
            <strong>{n.headline}</strong>
            {n.body && <span>{n.body}</span>}
          </div>
          <span className="news__turn num">T{n.turn}</span>
        </li>
      ))}
      {items.length === 0 && <li className="muted">אין חדשות עדיין.</li>}
    </ul>
  );
}

/* ---------------- Election countdown ---------------- */
export function ElectionCountdown({ nation }: { nation: NationState }) {
  const c = COUNTRIES[nation.id];
  const total = c.elections.cycleYears * 12;
  const pct = Math.max(0, Math.min(100, 100 - (nation.monthsToElection / total) * 100));
  const years = Math.floor(nation.monthsToElection / 12);
  const months = nation.monthsToElection % 12;
  return (
    <div className="countdown">
      <div className="countdown__ring" style={{ '--pct': pct } as React.CSSProperties}>
        <div>
          <strong className="num">{nation.monthsToElection}</strong>
          <span>חודשים</span>
        </div>
      </div>
      <div className="countdown__text">
        <strong>{c.elections.name}</strong>
        <span>
          {years > 0 ? `${years} שנים ` : ''}
          {months > 0 ? `${years > 0 ? 'ו-' : ''}${months} חודשים` : ''}
        </span>
        <span className="muted">{c.elections.description}</span>
      </div>
    </div>
  );
}

export function ComingSoon({ title, children, icon = 'sparkles' }: { title: string; children: React.ReactNode; icon?: IconName }) {
  return (
    <Panel className="soon">
      <div className="soon__inner">
        <span className="soon__icon">
          <Icon name={icon} size={22} />
        </span>
        <div>
          <strong>{title}</strong>
          <p>{children}</p>
        </div>
        <Chip tone="gold">בפיתוח</Chip>
      </div>
    </Panel>
  );
}
