import { useEffect } from 'react';
import { COUNTRIES, COUNTRY_ORDER } from '../../game/data/countries';
import type { CountryId } from '../../game/types';
import { formatGdp, formatPopulation, he } from '../../i18n/he';
import { useGame } from '../../store/gameStore';
import { Button } from '../../ui/Button';
import { Flag } from '../../ui/Flag';
import { Icon, type IconName } from '../../ui/Icon';
import { Landmark } from '../../ui/Landmark';
import { Chip } from '../../ui/Panel';
import { SetupHeader } from '../../ui/SetupHeader';
import { WorldMap } from '../../ui/WorldMap';
import '../setup.css';
import './CountrySelectScreen.css';

export function CountrySelectScreen() {
  const selected = useGame((s) => s.setup.countryId);
  const mode = useGame((s) => s.setup.mode);
  const setCountry = useGame((s) => s.setCountry);
  const navigate = useGame((s) => s.navigate);

  // Pre-select the first nation so the detail panel is never empty.
  useEffect(() => {
    if (!selected) setCountry('il');
  }, [selected, setCountry]);

  const country = COUNTRIES[selected ?? 'il'];

  return (
    <main className="screen setup">
      <SetupHeader current="country" onBack={() => navigate('mode')} />

      <div className="setup__body">
        <header className="setup__intro reveal">
          <span className="eyebrow">שלב 2 · מדינה</span>
          <h2 className="setup__title">בחרו את המדינה שתנהיגו</h2>
          <p className="setup__lead">לכל מדינה שיטת ממשל, מוסדות וחוקים משלה. {mode === 'global' ? 'בעולם הגלובלי – כל חמש המדינות פעילות סביבכם.' : 'במצב עצמאי – המדינה שלכם במרכז.'}</p>
        </header>

        <div className="nation-rail" role="radiogroup" aria-label="מדינה">
          {COUNTRY_ORDER.map((id, i) => (
            <NationCard key={id} id={id} index={i} selected={selected === id} onSelect={setCountry} onConfirm={() => navigate('role')} />
          ))}
        </div>

        <section className="nation-detail reveal" style={{ '--i': 6 } as React.CSSProperties} key={country.id} aria-live="polite">
          <div className="nation-detail__info">
            <div className="nation-detail__head">
              <Flag country={country.id} size={56} />
              <div>
                <span className="nation-detail__native">{country.nativeName}</span>
                <h3 className="nation-detail__name">{country.name}</h3>
              </div>
            </div>
            <p className="nation-detail__tagline">{country.tagline}</p>
            <p className="nation-detail__desc">{country.description}</p>

            <dl className="facts">
              <Fact icon="landmark" label="שיטת ממשל" value={country.government.label} />
              <Fact icon="building" label="בירה" value={country.capital} />
              <Fact icon="users" label="אוכלוסייה" value={formatPopulation(country.population)} />
              <Fact icon="chart" label='תמ"ג' value={formatGdp(country.gdpUsdBn)} />
              <Fact icon="crown" label="ראש הממשל" value={country.government.headOfGovernment} />
              <Fact icon="vote" label="בית מחוקקים" value={`${country.government.legislature} · ${country.elections.legislatureSeats} מושבים`} />
            </dl>

            <div className="nation-detail__chips">
              <Chip tone="gold" icon="vote">
                {country.elections.description}
              </Chip>
              <Chip icon="clock">בחירות כל {country.elections.cycleYears} שנים</Chip>
              {country.elections.threshold && <Chip icon="scale">אחוז חסימה {country.elections.threshold}%</Chip>}
            </div>
          </div>

          <div className="nation-detail__map">
            <WorldMap nations={COUNTRY_ORDER} selected={country.id} focus={country.id} onSelect={setCountry} />
            <div className="nation-detail__map-label">
              <span className="eyebrow">{country.englishName}</span>
              <span>{country.capital}</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="setup__footer">
        <Button size="lg" iconEnd="arrow-forward" disabled={!selected} onClick={() => navigate('role')}>
          הנהיגו את {country.name}
        </Button>
      </footer>
    </main>
  );
}

function NationCard({ id, index, selected, onSelect, onConfirm }: { id: CountryId; index: number; selected: boolean; onSelect: (id: CountryId) => void; onConfirm: () => void }) {
  const c = COUNTRIES[id];
  return (
    <button
      role="radio"
      aria-checked={selected}
      className={`nation-card select-card reveal ${selected ? 'is-selected' : ''}`}
      style={{ '--i': index + 1 } as React.CSSProperties}
      onClick={() => onSelect(id)}
      onDoubleClick={onConfirm}
    >
      <Landmark country={id} className="nation-card__art" />
      <div className="nation-card__shade" />
      <span className="select-check nation-card__check" aria-hidden>
        <Icon name="check" size={14} strokeWidth={2.6} />
      </span>
      <div className="nation-card__body">
        <Flag country={id} size={38} />
        <h3 className="nation-card__name">{c.name}</h3>
        <span className="nation-card__gov">{c.government.label}</span>
        <span className="nation-card__difficulty" title={`רמת קושי: ${he.difficulty[c.difficulty]}`}>
          {[1, 2, 3].map((d) => (
            <i key={d} className={d <= c.difficulty ? 'on' : ''} />
          ))}
          <span>{he.difficulty[c.difficulty]}</span>
        </span>
      </div>
    </button>
  );
}

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="fact">
      <dt>
        <Icon name={icon} size={14} />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
