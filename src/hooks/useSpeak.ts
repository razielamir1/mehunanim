import { useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';

// Web Speech API wrapper. Locale-aware (he-IL / en-US), cleans up on unmount.
export function useSpeak() {
  const locale = useStore((s) => s.locale);
  const ttsOn = useStore((s) => s.ttsOn);

  const speak = useCallback(
    (text: string, opts?: { force?: boolean; rate?: number }) => {
      if (!opts?.force && !ttsOn) return;
      try {
        if (!('speechSynthesis' in window)) return;
        const cleaned = text.replace(/[\n•❓]/g, ' ').trim();
        if (!cleaned) return;
        const u = new SpeechSynthesisUtterance(cleaned);
        u.lang = locale === 'he' ? 'he-IL' : 'en-US';
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
