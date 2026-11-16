import { getCountry } from '../../../game/data/countries';
import { he } from '../../../i18n/he';
import { Hemicycle } from '../../../ui/Hemicycle';
import { Chip, Meter, Panel } from '../../../ui/Panel';
import { usePlayerNation, useSession } from '../useSession';
import { ComingSoon, ElectionCountdown } from '../widgets';

export function PoliticsPanel() {
  const session = useSession();
  const nation = usePlayerNation();
  const country = getCountry(session.player.countryId);
  const parties = [...nation.parties].sort((a, b) => b.seats - a.seats);
  const gov = nation.parties.filter((p) => p.inGovernment).reduce((s, p) => s + p.seats, 0);
  const hasMajority = gov >= country.elections.majority;

  return (
    <div className="dash">
      <div className="dash__cols dash__cols--wide">
        <Panel title={`${country.government.legislature} · ${country.elections.legislatureSeats} מושבים`} icon="landmark">
          <div className="parliament">
            <div className="parliament__chart">
              <Hemicycle parties={nation.parties} majority={country.elections.majority} />
              <div className="parliament__status">
                <Chip tone={hasMajority ? 'success' : 'danger'} icon={hasMajority ? 'check' : 'scale'}>
                  {hasMajority ? 'לקואליציה יש רוב' : 'ממשלת מיעוט'}
                </Chip>
              </div>
            </div>
            <ul className="parties">
              {parties.map((p) => (
                <li key={p.id} className="party">
                  <span className="party__swatch" style={{ background: p.color }} />
                  <div className="party__name">
                    <strong>{p.name}</strong>
                    <span>{he.ideologies[p.ideology]}</span>
                  </div>
                  {p.inGovernment && <Chip tone="gold">קואליציה</Chip>}
                  <span className="party__seats num">{p.seats}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <div className="dash__col">
          <Panel title="לוח בחירות" icon="vote">
            <ElectionCountdown nation={nation} />
            <dl className="mini-facts">
              <div>
                <dt>שיטה</dt>
                <dd>{country.elections.description}</dd>
              </div>
              <div>
                <dt>רוב נדרש</dt>
                <dd className="num">{country.elections.majority}</dd>
              </div>
              {country.elections.threshold && (
                <div>
                  <dt>אחוז חסימה</dt>
                  <dd className="num">{country.elections.threshold}%</dd>
                </div>
              )}
              <div>
                <dt>מחזור</dt>
                <dd>{country.elections.cycleYears} שנים</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="דעת קהל" icon="users">
            <Meter label="תמיכה בממשלה" value={nation.stats.approval} tone="gold" suffix="%" />
            <Meter label="יציבות פוליטית" value={nation.stats.stability} tone="blue" suffix="%" />
            <Meter label="הפופולריות שלך" value={session.player.popularity} tone="green" suffix="%" />
          </Panel>
        </div>
      </div>

      <div className="soon-grid">
        <ComingSoon title="מנוע החקיקה" icon="gavel">
          הצבעות במליאה, ועדות, הצעות חוק ומשמעת קואליציונית.
        </ComingSoon>
        <ComingSoon title="מנוע הבחירות המלא" icon="vote">
          סקרים, קמפיינים, מחוזות ורשימות לפי שיטת הבחירות של כל מדינה.
        </ComingSoon>
      </div>
    </div>
  );
}
