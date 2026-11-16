# 61 – WORLD LEADERS

משחק אסטרטגיה פוליטי בינלאומי · React + TypeScript + CSS · ללא מנוע משחק וללא 3D.

```bash
npm install
npm run dev        # שרת פיתוח
npm run build      # בדיקת טיפוסים + בנייה לייצור
npm run build:map  # יצירה מחדש של מפת הנקודות (src/game/data/worldDots.json)
```

## מסכים
1. **פתיחה** – `screens/splash` · לוגו, מפת עולם מונפשת, "משחק חדש" / "המשך מסע".
2. **מצב עולם** – `screens/mode` · מדינה עצמאית / עולם גלובלי.
3. **בחירת מדינה** – `screens/country` · כרטיסים עם דגל ואיור, פאנל פרטים ומפה אזורית.
4. **בחירת תפקיד** – `screens/role` · אזרח / נבחר ציבור, סולם קריירה, שם והשקפה.
5. **מסך המשחק** – `screens/game` · חדר מצב, פוליטיקה ובחירות, כלכלה, זירה בינלאומית, מוסדות וחוקים, קריירה.

## ארכיטקטורה
```
src/
  game/                 ← לוגיקת משחק טהורה (ללא React)
    types.ts            ← מודל הנתונים (Country, GameSession, NationState…)
    data/countries/     ← מדינה = קובץ אחד: ממשל, מוסדות, חוקים, מפלגות, קריירה
    engines/            ← מנועי סימולציה: economy, politics, elections, diplomacy, career
      types.ts          ← ממשק GameEngine (onInit / onTurn)
      registry.ts       ← רישום וסדר הרצה של המנועים
    session.ts          ← createSession / advanceTurn (תור = חודש)
    actions.ts          ← פעולות שחקן וקידום בתפקיד
    rng.ts              ← PRNG דטרמיניסטי (seed) – בסיס לשחזור ולעולם משותף
  store/gameStore.ts    ← Zustand: ניווט, הגדרות משחק חדש, שמירה ב-localStorage
  ui/                   ← מערכת עיצוב: Button, Panel, Flag, Landmark, WorldMap, Hemicycle…
  screens/              ← המסכים
  i18n/he.ts            ← מחרוזות ממשק בעברית
  styles/               ← design tokens + בסיס
```

**הוספת מנוע** (למשל תקשורת או צבא): ממשו `GameEngine` ב-`game/engines/` ורשמו ב-`registry.ts` – לולאת התורות והשמירה לא משתנות.
**הוספת מדינה**: קובץ חדש ב-`data/countries/`, הוספה ל-`COUNTRIES`, דגל ב-`ui/Flag.tsx`, איור ב-`ui/Landmark.tsx`, ושורה ב-`scripts/build-dot-map.mjs`.

## ביצועים
- מפת העולם: כ-9,500 נקודות שחושבו מראש כ-path יחיד ב-SVG (כ-3KB אחרי gzip), ללא ספריות גיאוגרפיות בזמן ריצה.
- דגלים ואיורי ציוני הדרך: SVG בקוד, בלי בקשות רשת לתמונות. רכיב `Landmark` מקבל `photo` להחלפה בצילומים.
- מסך המשחק נטען בנפרד (code-splitting), גופנים מקומיים (Fontsource), האנימציות ב-CSS בלבד ומכבדות `prefers-reduced-motion`.

המפלגות והאירועים במשחק בדויים. מבנה המוסדות ושיטות הבחירות מבוססים על המציאות.
