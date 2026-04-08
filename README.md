# מחוננים — Mehunanim 🦉

פלטפורמת הכנה אינטראקטיבית בעברית למבחני מחוננים לילדים בגילאי 5-8, עם משחקים, מסקוט (בוקי הינשוף), ותובנות AI מבוססות Gemini.

## Features

- 5 מיני-משחקים: דפוסים, יוצא דופן, רצפי מספרים, אנלוגיות, זיכרון
- בחירת גיל (5/6/7/8) והתאמת קושי אוטומטית
- מעקב כוכבים והתקדמות (localStorage)
- אזור הורה עם PIN ותובנות AI
- רמזים חכמים מבוקי (Gemini) בלחיצה
- RTL, PWA, מותאם מובייל/iPad
- UI עם Framer Motion, TailwindCSS, גרדיאנטים ידידותיים לילדים

## Tech Stack

Vite · React 18 · TypeScript · TailwindCSS · Framer Motion · Zustand · React Router · Gemini 1.5 Flash (דרך Vercel Edge Function)

## Local Dev

```bash
npm install
cp .env.example .env.local     # הדבק GEMINI_API_KEY
npm run dev -- --host          # פתוח ל-LAN לצפייה ב-iPad/טלפון
```

פתח http://localhost:5173

> הערה: `npm run dev` מריץ רק את ה-frontend. רמזי AI יעבדו כשתעלה ל-Vercel (או ב-`vercel dev` אם מותקן Vercel CLI). אחרת, הפלטפורמה נופלת חזרה לרמזים סטטיים.

## Deploy to Vercel

```bash
npm i -g vercel
vercel link
vercel env add GEMINI_API_KEY production   # הדבק את המפתח ידנית
vercel --prod
```

## Security

- מפתח Gemini אף פעם לא ב-bundle — רק ב-`/api/gemini` edge function
- `.env*` ב-gitignore
- CSP headers ב-`vercel.json`
- Parent gate חוסם כניסת ילדים לדשבורד הורים

## License

MIT
