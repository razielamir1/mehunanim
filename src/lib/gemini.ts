// Client → our /api/gemini proxy. API key never reaches the browser.
export type Mode = 'hint' | 'explain' | 'insight' | 'analyze' | 'chat';

export async function askGemini(mode: Mode, payload: unknown): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, payload }),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    return j.text || fallback(mode);
  } catch {
    return fallback(mode);
  } finally {
    clearTimeout(timer);
  }
}

function fallback(mode: Mode): string {
  switch (mode) {
    case 'hint': return 'נסו להסתכל על הדפוס — מה חוזר על עצמו?';
    case 'explain': return 'התשובה הנכונה היא זו שממשיכה את הכלל שהתחלנו ללמוד. נסה דוגמה דומה.';
    case 'insight': return 'התקדמות יפה! המשיכו להתאמן מעט בכל יום.';
    case 'analyze': return 'אין מספיק נתונים עדיין — שחקו עוד כמה סבבים ונחזור עם ניתוח מפורט.';
    case 'chat': return 'אני זמינה כשהשרת יעלה. בינתיים, המשיכו להתאמן ב-5 משחקים בקצב של 10 דקות ביום.';
  }
}
