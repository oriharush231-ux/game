import { COUNTRIES, COUNTRY_ORDER, getCountry } from '../../../game/data/countries';
import { relationKey } from '../../../game/engines/util';
import type { CountryId, GameSession } from '../../../game/types';
import { Flag } from '../../../ui/Flag';
import { Icon } from '../../../ui/Icon';
import { Panel } from '../../../ui/Panel';
import { WorldMap, type MapLink } from '../../../ui/WorldMap';
import { useSession } from '../useSession';
import { ComingSoon } from '../widgets';

export function relationLinks(session: GameSession): MapLink[] {
  return Object.entries(session.relations).map(([key, value]) => {
    const [from, to] = key.split(':') as CountryId[];
    return { from, to, value };
  });
}

function relationLabel(v: number) {
  if (v >= 75) return 'ברית אסטרטגית';
  if (v >= 55) return 'יחסים חמים';
  if (v >= 35) return 'יחסים תקינים';
  if (v >= 10) return 'יחסים צוננים';
  return 'מתיחות';
}

export function WorldPanel() {
  const session = useSession();
  const me = session.player.countryId;
  const country = getCountry(me);

  if (session.mode === 'solo') {
    return (
      <div className="dash">
        <Panel padded={false} className="map-panel map-panel--tall">
          <div className="map-panel__map">
            <WorldMap nations={[me]} selected={me} focus={me} />
          </div>
          <div className="locked">
            <Icon name="lock" size={22} />
            <strong>הזירה הבינלאומית זמינה בעולם הגלובלי</strong>
            <p>במצב מדינה עצמאית {country.name} פועלת לבדה. התחילו משחק חדש במצב "עולם גלובלי" כדי לנהל יחסים עם ארבע המדינות האחרות.</p>
          </div>
        </Panel>
      </div>
    );
  }

  const others = COUNTRY_ORDER.filter((id) => id !== me);
  const links = relationLinks(session);

  return (
    <div className="dash">
      <Panel padded={false} className="map-panel map-panel--tall">
        <div className="map-panel__map">
          <WorldMap nations={COUNTRY_ORDER} selected={me} links={links} />
        </div>
        <div className="map-legend">
          <span>
            <i className="lg lg--strong" /> ברית
          </span>
          <span>
            <i className="lg lg--mid" /> תקין
          </span>
          <span>
            <i className="lg lg--weak" /> מתיחות
          </span>
        </div>
      </Panel>

      <Panel title={`היחסים של ${country.name}`} icon="handshake">
        <ul className="relations">
          {others.map((id) => {
            const v = session.relations[relationKey(me, id)] ?? 0;
            const tone = v >= 55 ? 'good' : v >= 25 ? 'mid' : 'bad';
            return (
              <li key={id} className="relation">
                <Flag country={id} size={36} />
                <div className="relation__name">
                  <strong>{COUNTRIES[id].name}</strong>
                  <span>{relationLabel(v)}</span>
                </div>
                <div className="relation__bar">
                  <div className={`relation__fill relation__fill--${tone}`} style={{ width: `${Math.max(3, (v + 100) / 2)}%` }} />
                </div>
                <span className="relation__value num">{Math.round(v)}</span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="soon-grid">
        <ComingSoon title="מנוע הדיפלומטיה" icon="handshake">
          פסגות, אמנות, סנקציות, בריתות והצבעות בארגונים בינלאומיים.
        </ComingSoon>
        <ComingSoon title="עולם מרובה שחקנים" icon="users">
          שחקנים אמיתיים מנהיגים מדינות שונות באותו עולם משותף.
        </ComingSoon>
      </div>
    </div>
  );
}
