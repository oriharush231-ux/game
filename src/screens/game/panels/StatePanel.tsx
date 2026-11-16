import { getCountry } from '../../../game/data/countries';
import type { InstitutionKind, Law } from '../../../game/types';
import { he } from '../../../i18n/he';
import { Icon, type IconName } from '../../../ui/Icon';
import { Chip, Panel } from '../../../ui/Panel';
import { useSession } from '../useSession';

const KIND_ICON: Record<InstitutionKind, IconName> = {
  'head-of-state': 'crown',
  executive: 'briefcase',
  legislature: 'landmark',
  'upper-house': 'landmark',
  judiciary: 'scale',
  'central-bank': 'banknote',
  local: 'building',
};

const LAW_LABEL: Record<Law['category'], string> = {
  constitutional: 'חוקתי',
  economy: 'כלכלה',
  society: 'חברה',
  security: 'ביטחון',
  elections: 'בחירות',
};

export function StatePanel() {
  const session = useSession();
  const country = getCountry(session.player.countryId);

  return (
    <div className="dash">
      <section className="institutions">
        {country.institutions.map((inst, i) => (
          <article key={inst.id} className="institution reveal" style={{ '--i': i } as React.CSSProperties}>
            <span className="institution__icon">
              <Icon name={KIND_ICON[inst.kind]} size={20} />
            </span>
            <span className="institution__kind">{he.institutionKinds[inst.kind]}</span>
            <h3>{inst.name}</h3>
            <span className="institution__native latin">{inst.nativeName}</span>
            <p>{inst.description}</p>
            {inst.seats && <Chip tone="gold">{inst.seats} מושבים</Chip>}
          </article>
        ))}
      </section>

      <Panel title="חוקים ועקרונות יסוד" icon="scroll">
        <ul className="laws">
          {country.laws.map((law) => (
            <li key={law.id} className="law">
              <Icon name="gavel" size={16} />
              <div>
                <strong>{law.name}</strong>
                <p>{law.description}</p>
              </div>
              <Chip>{LAW_LABEL[law.category]}</Chip>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
