import { useEffect, useState } from 'react';
import { COUNTRIES, getRank } from '../../game/data/countries';
import { STARTING_STATS } from '../../game/session';
import type { Ideology, StartPath } from '../../game/types';
import { he } from '../../i18n/he';
import { useGame } from '../../store/gameStore';
import { Button } from '../../ui/Button';
import { Flag } from '../../ui/Flag';
import { Icon } from '../../ui/Icon';
import { Meter } from '../../ui/Panel';
import { SetupHeader } from '../../ui/SetupHeader';
import '../setup.css';
import './RoleSelectScreen.css';

const IDEOLOGIES: Ideology[] = ['progressive', 'liberal', 'centrist', 'conservative'];

export function RoleSelectScreen() {
  const setup = useGame((s) => s.setup);
  const setPath = useGame((s) => s.setPath);
  const setIdentity = useGame((s) => s.setIdentity);
  const startGame = useGame((s) => s.startGame);
  const navigate = useGame((s) => s.navigate);

  const [name, setName] = useState(setup.name ?? '');
  const [ideology, setIdeology] = useState<Ideology>(setup.ideology ?? 'centrist');

  useEffect(() => {
    if (!setup.countryId) navigate('country');
  }, [setup.countryId, navigate]);
  if (!setup.countryId) return null;

  const country = COUNTRIES[setup.countryId];
  const path = setup.path;
  const startRankId = path === 'politician' ? country.politicianStartRankId : path === 'citizen' ? country.career[0].id : null;
  const startTier = startRankId ? getRank(country.id, startRankId).tier : -1;

  const begin = () => {
    setIdentity(name, ideology);
    startGame();
  };

  return (
    <main className="screen setup">
      <SetupHeader current="role" onBack={() => navigate('country')} />

      <div className="setup__body">
        <header className="setup__intro reveal">
          <span className="eyebrow role-eyebrow">
            <Flag country={country.id} size={22} /> שלב 3 · {country.name}
          </span>
          <h2 className="setup__title">מאיפה מתחיל המסע שלכם?</h2>
          <p className="setup__lead">התחילו כאזרחים מהשורה או בתפקיד פוליטי ראשון. משם – הדרך פתוחה עד {country.career.at(-1)!.title}.</p>
        </header>

        <div className="path-grid" role="radiogroup" aria-label="נקודת פתיחה">
          {(['citizen', 'politician'] as StartPath[]).map((p, i) => {
            const copy = he.paths[p];
            const rank = getRank(country.id, p === 'politician' ? country.politicianStartRankId : country.career[0].id);
            const stats = STARTING_STATS[p];
            const selected = path === p;
            return (
              <button
                key={p}
                role="radio"
                aria-checked={selected}
                className={`path-card select-card reveal ${selected ? 'is-selected' : ''}`}
                style={{ '--i': i + 1 } as React.CSSProperties}
                onClick={() => setPath(p)}
              >
                <div className="path-card__head">
                  <span className={`path-card__icon path-card__icon--${p}`}>
                    <Icon name={p === 'citizen' ? 'user' : 'landmark'} size={26} strokeWidth={1.4} />
                  </span>
                  <div className="path-card__titles">
                    <span className="path-card__sub">{copy.subtitle}</span>
                    <h3 className="path-card__title">{copy.title}</h3>
                  </div>
                  <span className="select-check" aria-hidden>
                    <Icon name="check" size={15} strokeWidth={2.6} />
                  </span>
                </div>

                <div className="path-card__rank">
                  <span className="muted">תפקיד פתיחה</span>
                  <strong>{rank.title}</strong>
                  <span className="path-card__native latin">{rank.nativeTitle}</span>
                </div>

                <p className="path-card__desc">{copy.description}</p>

                <div className="path-card__stats">
                  <Meter label={he.player.influence} value={stats.influence} tone="gold" />
                  <Meter label={he.player.reputation} value={stats.reputation} tone="blue" />
                  <Meter label={he.player.popularity} value={stats.popularity} tone="green" />
                </div>

                <ul className="path-card__perks">
                  {copy.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Career ladder */}
        <section className="ladder reveal" style={{ '--i': 3 } as React.CSSProperties} aria-label="סולם הקריירה">
          <div className="ladder__head">
            <h3>
              <Icon name="crown" size={16} /> סולם הקריירה ב{country.name}
            </h3>
            <span className="muted">{country.government.label}</span>
          </div>
          <ol className="ladder__steps">
            {country.career.map((r) => (
              <li key={r.id} className={`ladder__step ${r.tier === startTier ? 'is-start' : ''} ${r.tier < startTier ? 'is-past' : ''}`}>
                <span className="ladder__node">{r.tier === startTier ? <Icon name="flag" size={13} /> : r.tier}</span>
                <span className="ladder__title">{r.title}</span>
                <span className="ladder__native latin">{r.nativeTitle}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Identity */}
        <section className="identity reveal" style={{ '--i': 4 } as React.CSSProperties}>
          <label className="field">
            <span className="field__label">שם הדמות</span>
            <input className="field__input" value={name} maxLength={28} placeholder="לדוגמה: נועה לוי" onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="field">
            <span className="field__label">השקפה פוליטית</span>
            <div className="segmented" role="radiogroup" aria-label="השקפה פוליטית">
              {IDEOLOGIES.map((id) => (
                <button key={id} role="radio" aria-checked={ideology === id} className={ideology === id ? 'is-active' : ''} onClick={() => setIdeology(id)}>
                  {he.ideologies[id]}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="setup__footer">
        <Button size="lg" icon="crown" disabled={!path} onClick={begin}>
          {path ? 'כניסה לזירה' : 'בחרו נקודת פתיחה'}
        </Button>
      </footer>
    </main>
  );
}
