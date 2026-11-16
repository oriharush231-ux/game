import { COUNTRY_ORDER, getCountry } from '../../../game/data/countries';
import { Button } from '../../../ui/Button';
import { Landmark } from '../../../ui/Landmark';
import { Meter, Panel } from '../../../ui/Panel';
import { WorldMap } from '../../../ui/WorldMap';
import type { TabId } from '../GameScreen';
import { usePlayerNation, useSession } from '../useSession';
import { ActionList, ElectionCountdown, Kpi, NewsFeed, PlayerCard, PromotionCard } from '../widgets';
import { relationLinks } from './WorldPanel';

export function OverviewPanel({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const session = useSession();
  const nation = usePlayerNation();
  const country = getCountry(session.player.countryId);
  const gov = nation.parties.filter((p) => p.inGovernment).reduce((s, p) => s + p.seats, 0);

  return (
    <div className="dash">
      {/* Hero */}
      <section className="hero">
        <Landmark country={country.id} className="hero__art" fit="contain" />
        <div className="hero__shade" />
        <div className="hero__content">
          <PlayerCard session={session} />
          <div className="hero__side">
            <ElectionCountdown nation={nation} />
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpi-grid">
        <Kpi nation={nation} stat="approval" icon="users" />
        <Kpi nation={nation} stat="stability" icon="shield" />
        <Kpi nation={nation} stat="gdpGrowth" icon="trend-up" />
        <Kpi nation={nation} stat="unemployment" icon="briefcase" />
        <Kpi nation={nation} stat="inflation" icon="banknote" />
        <Kpi nation={nation} stat="influence" icon="globe" />
      </section>

      <div className="dash__cols">
        <div className="dash__col">
          <Panel title="פעולות זמינות החודש" icon="bolt" action={<Button variant="ghost" size="sm" onClick={() => onNavigate('career')}>הכל</Button>}>
            <PromotionCard session={session} />
            <ActionList session={session} limit={4} />
          </Panel>

          <Panel title={session.mode === 'global' ? 'מפת העולם' : `${country.name} במפה`} icon="globe" padded={false} className="map-panel">
            <div className="map-panel__map">
              <WorldMap
                nations={session.mode === 'global' ? COUNTRY_ORDER : [country.id]}
                selected={country.id}
                focus={session.mode === 'global' ? null : country.id}
                links={session.mode === 'global' ? relationLinks(session).filter((l) => l.from === country.id || l.to === country.id) : []}
              />
            </div>
          </Panel>
        </div>

        <div className="dash__col">
          <Panel title="מבזקי חדשות" icon="news">
            <NewsFeed items={session.news} limit={7} />
          </Panel>

          <Panel title={`${country.government.legislature} · מצב הקואליציה`} icon="landmark" action={<Button variant="ghost" size="sm" onClick={() => onNavigate('politics')}>פירוט</Button>}>
            <Meter label={`קואליציה (${gov} מתוך ${country.elections.legislatureSeats})`} value={(gov / country.elections.legislatureSeats) * 100} tone={gov >= country.elections.majority ? 'green' : 'red'} suffix="%" />
            <Meter label="תמיכה בממשלה" value={nation.stats.approval} tone="gold" suffix="%" />
            <Meter label="יציבות פוליטית" value={nation.stats.stability} tone="blue" suffix="%" />
          </Panel>
        </div>
      </div>
    </div>
  );
}
