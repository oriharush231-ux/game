import { getCountry } from '../../../game/data/countries';
import { formatGdp, formatPopulation } from '../../../i18n/he';
import { Panel } from '../../../ui/Panel';
import { usePlayerNation, useSession } from '../useSession';
import { ComingSoon, Kpi } from '../widgets';

export function EconomyPanel() {
  const session = useSession();
  const nation = usePlayerNation();
  const country = getCountry(session.player.countryId);
  const bank = country.institutions.find((i) => i.kind === 'central-bank');

  return (
    <div className="dash">
      <section className="kpi-grid kpi-grid--4">
        <Kpi nation={nation} stat="gdpGrowth" icon="trend-up" />
        <Kpi nation={nation} stat="unemployment" icon="briefcase" />
        <Kpi nation={nation} stat="inflation" icon="banknote" />
        <Kpi nation={nation} stat="debtToGdp" icon="scale" />
      </section>

      <div className="dash__cols">
        <Panel title="פרופיל כלכלי" icon="chart">
          <dl className="mini-facts mini-facts--grid">
            <div>
              <dt>תוצר מקומי גולמי</dt>
              <dd>{formatGdp(country.gdpUsdBn)}</dd>
            </div>
            <div>
              <dt>אוכלוסייה</dt>
              <dd>{formatPopulation(country.population)}</dd>
            </div>
            <div>
              <dt>תוצר לנפש</dt>
              <dd className="num">${Math.round((country.gdpUsdBn * 1000) / country.population).toLocaleString('en-US')}</dd>
            </div>
            <div>
              <dt>מטבע</dt>
              <dd>{country.currency}</dd>
            </div>
          </dl>
        </Panel>
        {bank && (
          <Panel title={bank.name} icon="landmark">
            <p className="muted">{bank.description}</p>
            <p className="latin" style={{ marginTop: 10, fontSize: 12, letterSpacing: '0.08em', color: 'var(--text-faint)' }}>
              {bank.nativeName}
            </p>
          </Panel>
        )}
      </div>

      <div className="soon-grid">
        <ComingSoon title="תקציב המדינה" icon="coins">
          הכנסות, הוצאות, מיסים וגירעון – עם השפעה ישירה על דעת הקהל.
        </ComingSoon>
        <ComingSoon title="ענפי משק וסחר" icon="building">
          תעשייה, טכנולוגיה, אנרגיה וסחר חוץ בין המדינות בעולם הגלובלי.
        </ComingSoon>
      </div>
    </div>
  );
}
