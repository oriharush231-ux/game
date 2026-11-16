import { useEffect, useRef, useState } from 'react';
import { getCountry, getRank } from '../../game/data/countries';
import { formatDate, he } from '../../i18n/he';
import { useGame } from '../../store/gameStore';
import { Wordmark } from '../../ui/Brand';
import { Button } from '../../ui/Button';
import { Flag } from '../../ui/Flag';
import { Icon, type IconName } from '../../ui/Icon';
import { useSession } from './useSession';
import { initials } from './widgets';
import { OverviewPanel } from './panels/OverviewPanel';
import { PoliticsPanel } from './panels/PoliticsPanel';
import { EconomyPanel } from './panels/EconomyPanel';
import { WorldPanel } from './panels/WorldPanel';
import { StatePanel } from './panels/StatePanel';
import { CareerPanel } from './panels/CareerPanel';
import './GameScreen.css';

export type TabId = 'overview' | 'politics' | 'economy' | 'world' | 'state' | 'career';

const TABS: { id: TabId; label: string; short: string; icon: IconName }[] = [
  { id: 'overview', label: 'חדר המצב', short: 'סקירה', icon: 'dashboard' },
  { id: 'politics', label: 'פוליטיקה ובחירות', short: 'פוליטיקה', icon: 'vote' },
  { id: 'economy', label: 'כלכלה', short: 'כלכלה', icon: 'chart' },
  { id: 'world', label: 'זירה בינלאומית', short: 'עולם', icon: 'globe' },
  { id: 'state', label: 'מוסדות וחוקים', short: 'מוסדות', icon: 'landmark' },
  { id: 'career', label: 'קריירה ופעולות', short: 'קריירה', icon: 'crown' },
];

const PANELS: Record<TabId, React.ComponentType<{ onNavigate: (t: TabId) => void }>> = {
  overview: OverviewPanel,
  politics: PoliticsPanel,
  economy: EconomyPanel,
  world: WorldPanel,
  state: StatePanel,
  career: CareerPanel,
};

export default function GameScreen() {
  const session = useSession();
  const endTurn = useGame((s) => s.endTurn);
  const abandon = useGame((s) => s.abandonGame);
  const navigate = useGame((s) => s.navigate);
  const [tab, setTab] = useState<TabId>('overview');
  const [transition, setTransition] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const country = getCountry(session.player.countryId);
  const rank = getRank(country.id, session.player.rankId);
  const Panel = PANELS[tab];
  const p = session.player;

  const goTab = (t: TabId) => {
    setTab(t);
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  const onEndTurn = () => {
    if (transition) return;
    const nextMonth = (session.date.month + 1) % 12;
    const nextYear = session.date.year + (nextMonth === 0 ? 1 : 0);
    setTransition(formatDate({ year: nextYear, month: nextMonth }));
    window.setTimeout(endTurn, 380);
    window.setTimeout(() => setTransition(null), 1250);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

  return (
    <div className="screen game" style={{ '--nation': country.palette.glow } as React.CSSProperties}>
      {/* ---------------- Top bar ---------------- */}
      <header className="topbar">
        <div className="topbar__brand">
          <Wordmark compact />
        </div>

        <div className="topbar__nation">
          <Flag country={country.id} size={34} />
          <div className="topbar__nation-text">
            <strong>{country.name}</strong>
            <span>
              {session.mode === 'global' ? 'עולם גלובלי' : 'מדינה עצמאית'} · תור <span className="num">{session.turn}</span>
            </span>
          </div>
        </div>

        <div className="topbar__date">
          <Icon name="clock" size={15} />
          {formatDate(session.date)}
        </div>

        <div className="topbar__resources" aria-label="משאבים אישיים">
          <Resource icon="bolt" label={he.player.influence} value={Math.round(p.influence)} />
          <Resource icon="badge" label={he.player.reputation} value={Math.round(p.reputation)} />
          <Resource icon="users" label={he.player.popularity} value={Math.round(p.popularity)} />
          <Resource icon="coins" label={he.player.funds} value={p.funds} prefix="₪" suffix="K" />
        </div>

        <div className="topbar__actions">
          <div className="ap" title="נקודות פעולה לתור הנוכחי" aria-label={`${p.actionPoints} מתוך ${p.maxActionPoints} נקודות פעולה`}>
            {Array.from({ length: p.maxActionPoints }, (_, i) => (
              <i key={i} className={i < p.actionPoints ? 'on' : ''} />
            ))}
          </div>
          <Button className="topbar__endturn" size="sm" iconEnd="chevron-forward" onClick={onEndTurn}>
            סיום תור
          </Button>
          <button className="icon-btn" aria-label="תפריט" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            <span className="avatar avatar--sm">{initials(p.name)}</span>
          </button>
        </div>

        {menuOpen && (
          <>
            <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
            <div className="menu" role="menu">
              <div className="menu__who">
                <span className="avatar">{initials(p.name)}</span>
                <div>
                  <strong>{p.name}</strong>
                  <span>{rank.title}</span>
                </div>
              </div>
              <button role="menuitem" onClick={() => navigate('splash')}>
                <Icon name="arrow-back" size={16} /> לתפריט הראשי
              </button>
              <button
                role="menuitem"
                className="danger"
                onClick={() => {
                  if (window.confirm('לסיים את המשחק הנוכחי? ההתקדמות תימחק.')) abandon();
                }}
              >
                <Icon name="logout" size={16} /> סיום משחק
              </button>
            </div>
          </>
        )}
      </header>

      <div className="game__frame">
        {/* ---------------- Side navigation (desktop) ---------------- */}
        <nav className="sidenav" aria-label="ניווט ראשי">
          {TABS.map((t) => (
            <button key={t.id} className={`sidenav__item ${tab === t.id ? 'is-active' : ''}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => goTab(t.id)}>
              <Icon name={t.icon} size={19} />
              <span>{t.label}</span>
              {t.id === 'world' && session.mode === 'solo' && <Icon name="lock" size={13} className="sidenav__lock" />}
            </button>
          ))}
          <div className="sidenav__foot">
            <div className="sidenav__rank">
              <span className="eyebrow">תפקיד נוכחי</span>
              <strong>{rank.title}</strong>
              <span className="latin">{rank.nativeTitle}</span>
            </div>
          </div>
        </nav>

        {/* ---------------- Content ---------------- */}
        <main className="game__main" ref={mainRef}>
          <div className="game__heading">
            <h1>{TABS.find((t) => t.id === tab)!.label}</h1>
            <span className="game__heading-sub">
              {country.nativeName} · {country.government.label}
            </span>
          </div>
          <div key={tab} className="game__panel">
            <Panel onNavigate={goTab} />
          </div>
        </main>
      </div>

      {/* ---------------- Mobile: end turn + bottom nav ---------------- */}
      <button className="fab-endturn" onClick={onEndTurn}>
        <span className="fab-endturn__ap">
          {p.actionPoints}/{p.maxActionPoints}
        </span>
        סיום תור
        <Icon name="chevron-forward" size={18} />
      </button>

      <nav className="bottomnav" aria-label="ניווט ראשי">
        {TABS.map((t) => (
          <button key={t.id} className={`bottomnav__item ${tab === t.id ? 'is-active' : ''}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => goTab(t.id)}>
            <Icon name={t.icon} size={20} />
            <span>{t.short}</span>
          </button>
        ))}
      </nav>

      {transition && (
        <div className="turn-overlay" aria-live="assertive">
          <span className="eyebrow">חודש חדש</span>
          <strong>{transition}</strong>
        </div>
      )}
    </div>
  );
}

function Resource({ icon, label, value, prefix = '', suffix = '' }: { icon: IconName; label: string; value: number; prefix?: string; suffix?: string }) {
  return (
    <div className="resource" title={label}>
      <Icon name={icon} size={15} />
      <div>
        <span className="resource__label">{label}</span>
        <span className="resource__value num">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
    </div>
  );
}
