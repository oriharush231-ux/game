import type { CountryDefinition, CountryId } from '../../types';
import { israel } from './israel';
import { usa } from './usa';
import { uk } from './uk';
import { france } from './france';
import { germany } from './germany';

/** Launch roster ("FIVE"). Add new nations here – every screen and engine picks them up automatically. */
export const COUNTRIES: Record<CountryId, CountryDefinition> = {
  il: israel,
  us: usa,
  gb: uk,
  fr: france,
  de: germany,
};

export const COUNTRY_ORDER: CountryId[] = ['il', 'us', 'gb', 'fr', 'de'];

export const getCountry = (id: CountryId): CountryDefinition => COUNTRIES[id];

export const getRank = (countryId: CountryId, rankId: string) =>
  COUNTRIES[countryId].career.find((r) => r.id === rankId) ?? COUNTRIES[countryId].career[0];

export const getNextRank = (countryId: CountryId, rankId: string) => {
  const career = COUNTRIES[countryId].career;
  const i = career.findIndex((r) => r.id === rankId);
  return i >= 0 && i < career.length - 1 ? career[i + 1] : undefined;
};
