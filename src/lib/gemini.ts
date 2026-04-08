// Client → our /api/gemini proxy. API key never reaches the browser.
import { useStore } from '@/store/useStore';

export type Mode = 'hint' | 'explain' | 'insight' | 'analyze' | 'chat';

export async function askGemini(mode: Mode, payload: unknown): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  const locale = useStore.getState().locale;
  try {
    const r = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, payload, locale }),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    return j.text || fallback(mode, locale);
  } catch {
    return fallback(mode, locale);
  } finally {
    clearTimeout(timer);
  }
}

const FALLBACKS = {
  he: {
    hint: 'נסו להסתכל על הדפוס — מה חוזר על עצמו?',
    explain: 'התשובה הנכונה היא זו שממשיכה את הכלל שהתחלנו ללמוד. נסה דוגמה דומה.',
    insight: 'התקדמות יפה! המשיכו להתאמן מעט בכל יום.',
    analyze: 'אין מספיק נתונים עדיין — שחקו עוד כמה סבבים ונחזור עם ניתוח מפורט.',
    chat: 'אני זמינה כשהשרת יעלה. בינתיים, המשיכו להתאמן ב-5 משחקים בקצב של 10 דקות ביום.',
  },
  en: {
    hint: "Try to spot the pattern — what's repeating?",
    explain: 'The correct answer follows the rule we just learned. Try a similar example.',
    insight: 'Nice progress! Keep practicing a little every day.',
    analyze: 'Not enough data yet — play a few more rounds and come back for detailed analysis.',
    chat: "I'll be back when the server is up. Meanwhile, keep practicing 5 games at 10 min/day.",
  },
} as const;

function fallback(mode: Mode, locale: 'he' | 'en'): string {
  return FALLBACKS[locale][mode];
}
