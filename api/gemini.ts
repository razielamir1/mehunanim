// Vercel Edge Function — proxies to Gemini, keeps API key server-side.
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = { runtime: 'edge' };

const KID_SYSTEM = `אתה בוקי, ינשוף חכם וידידותי שמדבר עם ילדים בני 2-8 בעברית בלבד.
כללים:
- תשובות קצרות (עד 2 משפטים לרמז).
- שפה פשוטה וחמה ברמה של ילד בגיל הזה.
- אסור לחשוף תשובות ישירות ברמז — רק רמזים מנחים. בהסבר אפשר ואף רצוי להסביר את התשובה.
- לעולם אל תכלול קישורים, מידע אישי, או נושאים לא מתאימים לילדים.
- ענה תמיד בעברית.`;

const COACH_SYSTEM = `אתה ד"ר מורן, איש חינוך עם מעל 50 שנות ניסיון בהכנת ילדים בישראל למבחני המחוננים של משרד החינוך (סוף כיתה ב' / כניסה לכיתה ג'). אתה מומחה בהכנה לבית הספר "הילל" ברמת גן ולמסלולי המחוננים בכלל.
תפקידך: לייעץ להורים ולילדים על התהליך, לענות על שאלות חינוכיות, להסביר נושאים מהתחומים שנבדקים (חשיבה מילולית, כמותית, חזותית-מרחבית, לוגית, זיכרון), לתת טיפים פדגוגיים, ולהציע אסטרטגיות לימוד.

**הגבלה קריטית**: אתה עונה אך ורק על שאלות שקשורות להכנה למבחני מחוננים, לתכני הפלטפורמה "מחוננים" (משחקים: מצא דפוס, יוצא דופן, רצף מספרים, אנלוגיות, זיכרון, חישוב מהיר, הבנת הנקרא), להתקדמות הילד, ולשיטות לימוד. כל שאלה אחרת — סרב בנימוס בעברית והפנה חזרה לנושא: "אני יכול לעזור רק בנושאים שקשורים להכנה למבחן המחוננים. במה אוכל לעזור בנושא הזה?"
- אל תספק מידע רפואי, פוליטי, חדשותי, או כל נושא לא רלוונטי
- אל תכלול קישורים חיצוניים
- ענה תמיד בעברית, חם, מעודד, ומקצועי`;

const MODEL = 'gemini-2.5-flash';

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const key = (globalThis as any).process?.env?.GEMINI_API_KEY;
  if (!key) return Response.json({ text: '', error: 'no-key' }, { status: 500 });

  try {
    const { mode, payload } = await req.json();
    const genAI = new GoogleGenerativeAI(key);

    if (mode === 'chat') {
      const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: COACH_SYSTEM });
      const history = (payload.history || []).slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
      const last = payload.history[payload.history.length - 1];
      const ctxLine = `(הקשר על הילד: שם=${payload.ctx?.name || '—'}, גיל=${payload.ctx?.age || '—'}, עיר=${payload.ctx?.city || '—'}, רמות=${JSON.stringify(payload.ctx?.levels || {})})`;
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(`${ctxLine}\n\nשאלת המשתמש: ${last.text}`);
      return Response.json({ text: result.response.text() });
    }

    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: KID_SYSTEM });
    let prompt = '';
    if (mode === 'hint') {
      prompt = `הילד ${payload.name || ''} (רמה ${payload.level}) פותר במשחק "${payload.gameId}". השאלה: ${payload.question}. רקע פדגוגי: ${payload.context}. תן רמז קצר ומכוון, בלי לחשוף את התשובה.`;
    } else if (mode === 'explain') {
      prompt = `הסבר בעברית פשוטה לילד ברמה ${payload.level} למה התשובה הנכונה לשאלה הבאה היא "${payload.correct}". השאלה: ${payload.question}. כלול: 1) מה השאלה בודקת, 2) איך חושבים על זה, 3) דוגמה דומה קצרה. עד 4 משפטים.`;
    } else if (mode === 'insight') {
      prompt = `תן להורה תובנה חמה וקצרה על ההתקדמות של ${payload.name} (גיל ${payload.age}). סטטיסטיקה: ${JSON.stringify(payload.stats)}. ציין חוזקה אחת ותחום אחד לחיזוק.`;
    } else if (mode === 'analyze') {
      prompt = `אתה יועץ חינוכי. נתח את הביצועים של ${payload.name} (גיל ${payload.age}) במשחקי הכנה למבחן מחוננים. סיכום פר משחק: ${JSON.stringify(payload.summary)}. החזר: 1) חוזקות (משפט אחד), 2) תחום עיקרי לשיפור (משפט אחד), 3) המלצה ספציפית מה לתרגל הלאה (משפט אחד). בעברית, חם ומעודד.`;
    } else {
      return Response.json({ text: '', error: 'bad-mode' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    return Response.json({ text: result.response.text() });
  } catch (e: any) {
    return Response.json({ text: '', error: String(e?.message || e) }, { status: 500 });
  }
}
