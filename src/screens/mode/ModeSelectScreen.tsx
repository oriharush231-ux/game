import { COUNTRY_ORDER } from '../../game/data/countries';
import type { WorldMode } from '../../game/types';
import { he } from '../../i18n/he';
import { useGame } from '../../store/gameStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { SetupHeader } from '../../ui/SetupHeader';
import { WorldMap, type MapLink } from '../../ui/WorldMap';
import '../setup.css';
import './ModeSelectScreen.css';

const GLOBAL_LINKS: MapLink[] = [
  { from: 'us', to: 'gb', value: 80 },
  { from: 'gb', to: 'fr', value: 50 },
  { from: 'fr', to: 'de', value: 76 },
  { from: 'de', to: 'il', value: 55 },
  { from: 'us', to: 'il', value: 78 },
];

export function ModeSelectScreen() {
  const mode = useGame((s) => s.setup.mode);
  const setMode = useGame((s) => s.setMode);
  const navigate = useGame((s) => s.navigate);

  const pick = (m: WorldMode) => setMode(m);

  return (
    <main className="screen setup">
      <SetupHeader current="mode" onBack={() => navigate('splash')} />

      <div className="setup__body">
        <header className="setup__intro reveal">
          <span className="eyebrow">שלב 1 · מצב עולם</span>
          <h2 className="setup__title">איך העולם שלך יתנהל?</h2>
          <p className="setup__lead">כל מדינה יכולה לפעול כמשחק עצמאי – או כחלק מעולם גלובלי משותף שבו כל החלטה מהדהדת מעבר לגבולות.</p>
        </header>

        <div className="mode-grid" role="radiogroup" aria-label="מצב עולם">
          {(['solo', 'global'] as const).map((m, i) => {
            const copy = he.modes[m];
            const selected = mode === m;
            return (
              <button
                key={m}
                role="radio"
                aria-checked={selected}
                className={`mode-card reveal ${selected ? 'is-selected' : ''}`}
                style={{ '--i': i + 1 } as React.CSSProperties}
                onClick={() => pick(m)}
                onDoubleClick={() => {
                  pick(m);
                  navigate('country');
                }}
              >
                <div className={`mode-card__visual mode-card__visual--${m}`} aria-hidden>
                  {m === 'global' ? (
                    <WorldMap nations={COUNTRY_ORDER} links={GLOBAL_LINKS} selected={null} />
                  ) : (
                    <div className="solo-visual">
                      <span className="solo-visual__ring" />
                      <span className="solo-visual__ring" />
                      <span className="solo-visual__ring" />
                      <span className="solo-visual__core latin">1</span>
                    </div>
                  )}
                </div>
                <div className="mode-card__body">
                  <div className="mode-card__head">
                    <div>
                      <span className="mode-card__sub latin">{copy.subtitle}</span>
                      <h3 className="mode-card__title">{copy.title}</h3>
                    </div>
                    <span className="select-check" aria-hidden>
                      <Icon name="check" size={15} strokeWidth={2.6} />
                    </span>
                  </div>
                  <p className="mode-card__desc">{copy.description}</p>
                  <ul className="feature-list">
                    {copy.features.map((f) => (
                      <li key={f}>
                        <Icon name="sparkles" size={14} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        <p className="setup__note reveal" style={{ '--i': 3 } as React.CSSProperties}>
          <Icon name="globe" size={15} />
          שני המצבים חולקים את אותם מנועים – מדינה עצמאית תוכל בעתיד להצטרף לעולם הגלובלי.
        </p>
      </div>

      <footer className="setup__footer">
        <Button size="lg" iconEnd="arrow-forward" disabled={!mode} onClick={() => navigate('country')}>
          המשך לבחירת מדינה
        </Button>
      </footer>
    </main>
  );
}
