import { getCountry, getRank } from '../../../game/data/countries';
import { he } from '../../../i18n/he';
import { Icon } from '../../../ui/Icon';
import { Meter, Panel } from '../../../ui/Panel';
import { useSession } from '../useSession';
import { ActionList, PlayerCard, PromotionCard } from '../widgets';

export function CareerPanel() {
  const session = useSession();
  const p = session.player;
  const country = getCountry(p.countryId);
  const tier = getRank(p.countryId, p.rankId).tier;

  return (
    <div className="dash">
      <div className="dash__cols">
        <div className="dash__col">
          <Panel>
            <PlayerCard session={session} />
          </Panel>
          <Panel title="מדדים אישיים" icon="user">
            <Meter label={he.player.influence} value={p.influence} tone="gold" />
            <Meter label={he.player.reputation} value={p.reputation} tone="blue" />
            <Meter label={he.player.popularity} value={p.popularity} tone="green" />
          </Panel>
          <Panel title="מסלול הקריירה" icon="crown">
            <ol className="career">
              {country.career.map((r) => (
                <li key={r.id} className={`career__step ${r.tier < tier ? 'is-done' : ''} ${r.tier === tier ? 'is-current' : ''}`}>
                  <span className="career__node">{r.tier < tier ? <Icon name="check" size={13} strokeWidth={2.4} /> : r.tier}</span>
                  <div>
                    <strong>{r.title}</strong>
                    <span>
                      {r.description} {r.tier > tier && <em className="num">· השפעה {r.influenceRequired}</em>}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <div className="dash__col">
          <Panel title="פעולות" icon="bolt">
            <PromotionCard session={session} />
            <ActionList session={session} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
