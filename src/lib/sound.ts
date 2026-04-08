import { useStore } from '@/store/useStore';

let ctx: AudioContext | null = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function beep(freq: number, duration = 0.15, type: OscillatorType = 'sine', gain = 0.15) {
  if (!useStore.getState().soundOn) return;
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g).connect(ac.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    osc.stop(ac.currentTime + duration);
  } catch {}
}

export const sfx = {
  tap: () => beep(600, 0.06, 'triangle'),
  correct: () => {
    beep(660, 0.12, 'sine');
    setTimeout(() => beep(880, 0.18, 'sine'), 120);
  },
  wrong: () => beep(180, 0.25, 'sawtooth', 0.08),
  fanfare: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle'), i * 150));
  },
};

export const haptic = (ms = 10) => {
  if (navigator.vibrate) navigator.vibrate(ms);
};
