import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Age = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Locale = 'he' | 'en';
export type Theme = 'light' | 'dark';

export type Attempt = { ts: number; correct: number; total: number; level: number };
export type ChatMsg = { role: 'user' | 'model'; text: string; ts: number };

const COLLECTIBLE_LIST = ['🎩', '🏅', '👑', '🪄', '🌟', '🦄', '🚀', '🎨', '💎', '🏆'];

type State = {
  // profile
  name: string;
  age: Age;
  city: string;
  avatar: string; // emoji
  locale: Locale;
  theme: Theme;
  soundOn: boolean;
  ttsOn: boolean;
  // progression
  stars: number;
  levels: Record<string, number>; // gameId -> current level
  attempts: Record<string, Attempt[]>; // gameId -> list
  collectibles: string[];
  streak: number;
  // chat history with coach
  chatHistory: ChatMsg[];

  // actions
  setProfile: (p: Partial<Pick<State, 'name' | 'age' | 'city' | 'avatar'>>) => void;
  setLocale: (l: Locale) => void;
  setTheme: (t: Theme) => void;
  toggleSound: () => void;
  toggleTts: () => void;
  addStar: (n?: number) => void;
  recordAttempt: (gameId: string, correct: number, total: number) => { leveledUp: boolean; newCollectible?: string };
  bumpStreak: (correct: boolean) => void;
  pushChat: (m: ChatMsg) => void;
  clearChat: () => void;
  reset: () => void;
};

const startLevel = (age: Age): number => Math.max(1, Math.min(8, age - 1));

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      name: '',
      age: 6,
      city: '',
      avatar: '🦊',
      locale: 'he',
      theme: 'light',
      soundOn: true,
      ttsOn: false,
      stars: 0,
      levels: {},
      attempts: {},
      collectibles: [],
      streak: 0,
      chatHistory: [],

      setProfile: (p) => set((s) => ({ ...s, ...p })),
      setLocale: (locale) => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
        set({ locale });
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleTts: () => set((s) => ({ ttsOn: !s.ttsOn })),
      addStar: (n = 1) => set((s) => ({ stars: s.stars + n })),
      bumpStreak: (correct) => set((s) => ({ streak: correct ? s.streak + 1 : 0 })),
      recordAttempt: (gameId, correct, total) => {
        const s = get();
        const curLevel = s.levels[gameId] ?? startLevel(s.age);
        const attempt: Attempt = { ts: Date.now(), correct, total, level: curLevel };
        const list = [...(s.attempts[gameId] ?? []), attempt];
        const pct = correct / total;
        const leveledUp = pct >= 0.8;
        const newLevel = leveledUp ? curLevel + 1 : curLevel;
        let newCollectible: string | undefined;
        const newCollectibles = [...s.collectibles];
        const totalStars = s.stars + correct;
        const earned = Math.floor(totalStars / 10);
        if (earned > s.collectibles.length && earned <= COLLECTIBLE_LIST.length) {
          newCollectible = COLLECTIBLE_LIST[earned - 1];
          newCollectibles.push(newCollectible);
        }
        set({
          attempts: { ...s.attempts, [gameId]: list },
          levels: { ...s.levels, [gameId]: newLevel },
          collectibles: newCollectibles,
        });
        return { leveledUp, newCollectible };
      },
      pushChat: (m) => set((s) => ({ chatHistory: [...s.chatHistory, m].slice(-50) })),
      clearChat: () => set({ chatHistory: [] }),
      reset: () => set({ stars: 0, levels: {}, attempts: {}, collectibles: [], streak: 0, chatHistory: [] }),
    }),
    {
      name: 'mehunanim-v2',
      onRehydrateStorage: () => (s) => {
        if (s) {
          document.documentElement.lang = s.locale;
          document.documentElement.dir = s.locale === 'he' ? 'rtl' : 'ltr';
          document.documentElement.classList.toggle('dark', s.theme === 'dark');
        }
      },
    }
  )
);

export const getCurrentLevel = (gameId: string): number => {
  const s = useStore.getState();
  return s.levels[gameId] ?? startLevel(s.age);
};
