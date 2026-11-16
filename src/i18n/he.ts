import type { Ideology, InstitutionKind, NationStats, StartPath, WorldMode } from '../game/types';

/** Hebrew UI strings. Swap this module (or add en.ts) to localize. */
export const he = {
  appName: 'WORLD LEADERS',
  tagline: 'הכוח להנהיג. האחריות לבחור.',
  months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  steps: { mode: 'מצב עולם', country: 'מדינה', role: 'תפקיד' } as const,

  modes: {
    solo: {
      title: 'מדינה עצמאית',
      subtitle: 'Nation Mode',
      description: 'משחק ממוקד במדינה אחת. הפוליטיקה הפנימית, הכלכלה והבחירות – בקצב שלך.',
      features: ['קמפיין אישי ללא הפרעות', 'עומק מלא בפוליטיקה הפנימית', 'שמירה מקומית ומשחק לא מקוון'],
    },
    global: {
      title: 'עולם גלובלי',
      subtitle: 'World Mode',
      description: 'כל המדינות פועלות בעולם משותף. יחסים בינלאומיים, בריתות ומשברים משפיעים על כולם.',
      features: ['5 מדינות בסימולציה אחת', 'דיפלומטיה ויחסים בינלאומיים', 'מוכן לעולם מרובה-שחקנים'],
    },
  } satisfies Record<WorldMode, unknown>,

  paths: {
    citizen: {
      title: 'אזרח',
      subtitle: 'מתחילים מהשטח',
      description: 'בונים בסיס תמיכה מאפס – התנדבות, מחאה, תקשורת. דרך ארוכה יותר, אמינות גבוהה יותר.',
      perks: ['מוניטין גבוה', 'חופש פעולה מלא', 'השפעה ותקציב נמוכים'],
    },
    politician: {
      title: 'נבחר ציבור',
      subtitle: 'תפקיד פוליטי התחלתי',
      description: 'נכנסים לזירה עם מושב ראשון במוסד נבחר, תקציב ומעט השפעה. כל הצבעה נבחנת.',
      perks: ['השפעה ותקציב התחלתיים', 'גישה לפעולות מוסדיות', 'עין ציבורית ביקורתית'],
    },
  } satisfies Record<StartPath, unknown>,

  ideologies: {
    progressive: 'פרוגרסיבי',
    liberal: 'ליברלי',
    centrist: 'מרכז',
    conservative: 'שמרני',
  } satisfies Record<Ideology, string>,

  stats: {
    approval: 'תמיכה בממשלה',
    stability: 'יציבות פוליטית',
    gdpGrowth: 'צמיחה',
    unemployment: 'אבטלה',
    inflation: 'אינפלציה',
    debtToGdp: 'חוב/תוצר',
    influence: 'השפעה עולמית',
  } satisfies Record<keyof NationStats, string>,

  player: {
    influence: 'השפעה',
    reputation: 'מוניטין',
    popularity: 'פופולריות',
    funds: 'תקציב',
    actionPoints: 'פעולות',
  },

  institutionKinds: {
    'head-of-state': 'ראש המדינה',
    executive: 'רשות מבצעת',
    legislature: 'בית מחוקקים',
    'upper-house': 'בית עליון',
    judiciary: 'רשות שופטת',
    'central-bank': 'בנק מרכזי',
    local: 'שלטון מקומי',
  } satisfies Record<InstitutionKind, string>,

  difficulty: ['', 'נגיש', 'מאתגר', 'מומחה'],
};

export const formatDate = (d: { year: number; month: number }) => `${he.months[d.month]} ${d.year}`;

export const formatPopulation = (millions: number) =>
  millions >= 100 ? `${Math.round(millions)} מיליון` : `${millions.toLocaleString('he-IL', { maximumFractionDigits: 1 })} מיליון`;

export const formatGdp = (bn: number) =>
  bn >= 1000 ? `$${(bn / 1000).toLocaleString('he-IL', { maximumFractionDigits: 1 })} טריליון` : `$${bn} מיליארד`;
