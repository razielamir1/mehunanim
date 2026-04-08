import { useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';

// Web Speech API wrapper.
// - Locale-aware: picks an actual Hebrew voice if available, never silently falls back to English.
// - Cancels on locale change and on unmount.
// - `force` bypass for explicit user-pressed speak buttons; otherwise respects ttsOn.

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (cachedVoices && cachedVoices.length) return cachedVoices;
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    return cachedVoices;
  } catch {
    return [];
  }
}

// Some browsers populate voices async — listen once and refresh cache.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  // Trigger initial load
  loadVoices();
}

function pickVoiceFor(lang: 'he-IL' | 'en-US'): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;
  if (lang.startsWith('he')) {
    // Prefer he-IL, then any he-*
    return (
      voices.find((v) => v.lang === 'he-IL') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('he')) ||
      null
    );
  }
  return (
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    null
  );
}

export function useSpeak() {
  const locale = useStore((s) => s.locale);
  const ttsOn = useStore((s) => s.ttsOn);

  // Cancel any pending speech whenever locale changes
  useEffect(() => {
    try { window.speechSynthesis.cancel(); } catch {}
  }, [locale]);

  const speak = useCallback(
    (text: string, opts?: { force?: boolean; rate?: number }) => {
      // Strict: if user disabled TTS and didn't explicitly press a button, do NOTHING
      if (!opts?.force && !ttsOn) return;
      try {
        if (!('speechSynthesis' in window)) return;
        const cleaned = text.replace(/[\n•❓]/g, ' ').trim();
        if (!cleaned) return;
        const targetLang: 'he-IL' | 'en-US' = locale === 'he' ? 'he-IL' : 'en-US';
        const voice = pickVoiceFor(targetLang);

        // If Hebrew was requested but no Hebrew voice exists on this device,
        // do NOT silently switch to English — bail quietly.
        if (locale === 'he' && !voice) return;

        const u = new SpeechSynthesisUtterance(cleaned);
        u.lang = targetLang;
        if (voice) u.voice = voice;
        u.rate = opts?.rate ?? 0.9;
        u.pitch = 1.05;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {}
    },
    [locale, ttsOn]
  );

  const stop = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch {}
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, ttsOn };
}
