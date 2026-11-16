import { COUNTRIES } from '../data/countries';
import type { GameEngine } from './types';
import { mapNations } from './util';

/**
 * Elections engine (v0): runs the electoral calendar and a simple incumbency check.
 * Will grow into: polling, campaigns, district/list results per electoral system.
 */
export const electionsEngine: GameEngine = {
  id: 'elections',
  label: 'בחירות',
  order: 30,
  onTurn(session, { publish }) {
    return mapNations(session, (nation, id) => {
      const country = COUNTRIES[id];
      const months = nation.monthsToElection - 1;
      if (months === 3 && id === session.player.countryId) {
        publish({ countryId: id, category: 'elections', tone: 'breaking', headline: `שלושה חודשים ל${country.elections.name}`, body: 'המפלגות נכנסות לישורת האחרונה של הקמפיין.' });
      }
      if (months > 0) return { ...nation, monthsToElection: months };

      const incumbentWins = nation.stats.approval >= 40;
      publish({
        countryId: id,
        category: 'elections',
        tone: 'breaking',
        headline: incumbentWins ? `${country.name}: הממשלה המכהנת שומרת על השלטון` : `${country.name}: מהפך בקלפי – השלטון מתחלף`,
      });
      const parties = incumbentWins ? nation.parties : nation.parties.map((p) => ({ ...p, inGovernment: !p.inGovernment }));
      return {
        ...nation,
        parties,
        monthsToElection: country.elections.cycleYears * 12,
        stats: { ...nation.stats, approval: incumbentWins ? nation.stats.approval : 52 },
      };
    });
  },
};
