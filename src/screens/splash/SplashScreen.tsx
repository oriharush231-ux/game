import { COUNTRIES, COUNTRY_ORDER, getRank } from '../../game/data/countries';
import { formatDate, he } from '../../i18n/he';
import { useGame } from '../../store/gameStore';
import { Emblem } from '../../ui/Brand';
import { Button } from '../../ui/Button';
import { Flag } from '../../ui/Flag';
import { WorldMap } from '../../ui/WorldMap';
import './SplashScreen.css';

export function SplashScreen() {
  const navigate = useGame((s) => s.navigate);
  const session = useGame((s) => s.session);
  const continueGame = useGame((s) => s.continueGame);

  return (
    <main className="screen splash">
      <div className="splash__map" aria-hidden>
        <WorldMap nations={COUNTRY_ORDER} showCapitals />
      </div>
      <div className="splash__vignette" aria-hidden />
      <div className="splash__beam" aria-hidden />

      <div className="splash__content">
        <div className="splash__emblem reveal" style={{ '--i': 0 } as React.CSSProperties}>
          <Emblem size={128} spin />
        </div>

        <h1 className="splash__title reveal" style={{ '--i': 1 } as React.CSSProperties}>
          <span className="visually-hidden">61 – </span>
          <span className="splash__title-main latin gold-text">WORLD LEADERS</span>
        </h1>

        <div className="splash__rule reveal" style={{ '--i': 2 } as React.CSSProperties} aria-hidden>
          <span />
          <i />
          <span />
        </div>

        <p className="splash__tagline reveal" style={{ '--i': 3 } as React.CSSProperties}>
          {he.tagline}
        </p>
        <p className="splash__sub reveal" style={{ '--i': 4 } as React.CSSProperties}>
          משחק אסטרטגיה פוליטי בינלאומי · נהלו מדינה, נצחו בבחירות, עצבו את העולם
        </p>

        <div className="splash__actions reveal" style={{ '--i': 5 } as React.CSSProperties}>
          <Button size="lg" icon="play" onClick={() => navigate('mode')}>
            משחק חדש
          </Button>
          {session && (
            <button className="splash__continue" onClick={continueGame}>
              <Flag country={session.player.countryId} size={30} />
              <span className="splash__continue-text">
                <strong>המשך מסע</strong>
                <span>
                  {getRank(session.player.countryId, session.player.rankId).title} · {formatDate(session.date)}
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      <footer className="splash__footer reveal" style={{ '--i': 7 } as React.CSSProperties}>
        <div className="splash__nations">
          {COUNTRY_ORDER.map((id) => (
            <span key={id} className="splash__nation" title={COUNTRIES[id].name}>
              <Flag country={id} size={26} />
              <span>{COUNTRIES[id].name}</span>
            </span>
          ))}
        </div>
        <span className="splash__version latin">PROTOTYPE · v0.1</span>
      </footer>
    </main>
  );
}
