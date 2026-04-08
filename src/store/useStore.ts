import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Age = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Locale = 'he' | 'en';
export type Theme = 'light' | 'dark';
export type FontSize = 'normal' | 'large' | 'xlarge';

export type Attempt = { ts: number; correct: number; total: number; level: number };
export type ChatMsg = { role: 'user' | 'model'; text: string; ts: number };

export type A11ySettings = {
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  underlineLinks: boolean;
};

const DEFAULT_A11Y: A11ySettings = {
  fontSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  dyslexiaFont: false,
  underlineLinks: false,
};

const applyA11y = (a: A11ySettings) => {
  const html = document.documentElement;
  html.classList.toggle('a11y-large', a.fontSize === 'large');
  html.classList.toggle('a11y-xlarge', a.fontSize === 'xlarge');
  html.classList.toggle('a11y-contrast', a.highContrast);
  html.classList.toggle('a11y-dyslexia', a.dyslexiaFont);
  html.classList.toggle('a11y-underline', a.underlineLinks);
  html.classList.toggle('a11y-reduce-motion', a.reduceMotion);
};

const COLLECTIBLE_LIST = ['🎩', '🏅', '👑', '🪄', '🌟', '🦄', '🚀', '🎨', '💎', '🏆'];

// ----------- Profile (per-child) -----------
export type Profile = {
  id: string;
  name: string;
  age: Age;
  city: string;
  avatar: string;
  worldId: string;
  createdAt: number;
  stars: number;
  levels: Record<string, number>;
  attempts: Record<string, Attempt[]>;
  collectibles: string[];
  streak: number;
  chatHistory: ChatMsg[];
  tutorialSeen?: boolean;
};

const newId = () => Math.random().toString(36).slice(2, 10);

const createProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: newId(),
  name: '',
  age: 6,
  city: '',
  avatar: '🦊',
  worldId: 'owl',
  createdAt: Date.now(),
  stars: 0,
  levels: {},
  attempts: {},
  collectibles: [],
  streak: 0,
  chatHistory: [],
  tutorialSeen: false,
  ...overrides,
});

// ----------- State -----------
type State = {
  // Multi-profile
  profiles: Profile[];
  activeProfileId: string;

  // Mirrored from active profile (read-only convenience for components)
  name: string;
  age: Age;
  city: string;
  avatar: string;
  worldId: string;
  stars: number;
  levels: Record<string, number>;
  attempts: Record<string, Attempt[]>;
  collectibles: string[];
  streak: number;
  chatHistory: ChatMsg[];

  // Global (shared across profiles)
  locale: Locale;
  theme: Theme;
  soundOn: boolean;
  ttsOn: boolean;
  a11y: A11ySettings;

  // Cloud sync
  cloudUid: string | null;
  cloudEmail: string | null;
  lastSyncAt: number;
  setCloudUser: (uid: string | null, email: string | null) => void;
  applyCloudData: (profiles: Profile[], activeProfileId: string, syncedAt: number) => void;

  // Profile actions
  addProfile: (overrides?: Partial<Profile>) => string;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  updateActive: (patch: Partial<Profile>) => void;

  // Existing API (operates on active profile)
  setProfile: (p: Partial<Pick<Profile, 'name' | 'age' | 'city' | 'avatar'>>) => void;
  setLocale: (l: Locale) => void;
  setTheme: (t: Theme) => void;
  setWorld: (id: string) => void;
  setA11y: (patch: Partial<A11ySettings>) => void;
  toggleSound: () => void;
  toggleTts: () => void;
  addStar: (n?: number) => void;
  recordAttempt: (gameId: string, correct: number, total: number) => { leveledUp: boolean; newCollectible?: string };
  bumpStreak: (correct: boolean) => void;
  pushChat: (m: ChatMsg) => void;
  clearChat: () => void;
  reset: () => void;
};

const startLevel = (age: Age): number => {
  // Age-research-based starting level (1-8 max designed)
  if (age <= 3) return 1;
  if (age === 4) return 2;
  if (age === 5) return 3;
  if (age === 6) return 4;
  if (age === 7) return 5;
  return 6; // age 8
};

// Build mirror fields from active profile
const mirror = (profiles: Profile[], activeId: string): Pick<State,
  'name' | 'age' | 'city' | 'avatar' | 'worldId' | 'stars' | 'levels' | 'attempts' | 'collectibles' | 'streak' | 'chatHistory'
> => {
  const p = profiles.find((x) => x.id === activeId) ?? profiles[0];
  return {
    name: p.name,
    age: p.age,
    city: p.city,
    avatar: p.avatar,
    worldId: p.worldId,
    stars: p.stars,
    levels: p.levels,
    attempts: p.attempts,
    collectibles: p.collectibles,
    streak: p.streak,
    chatHistory: p.chatHistory,
  };
};

// Apply patch to active profile and return new profiles array + mirrors
const applyToActive = (state: State, patch: (p: Profile) => Profile): Partial<State> => {
  const profiles = state.profiles.map((p) => (p.id === state.activeProfileId ? patch(p) : p));
  return { profiles, ...mirror(profiles, state.activeProfileId) };
};

const initialProfile = createProfile({ avatar: '🦊', age: 6 });

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      profiles: [initialProfile],
      activeProfileId: initialProfile.id,
      ...mirror([initialProfile], initialProfile.id),
      locale: 'he',
      theme: 'light',
      soundOn: true,
      ttsOn: false,
      a11y: DEFAULT_A11Y,
      cloudUid: null,
      cloudEmail: null,
      lastSyncAt: 0,

      setCloudUser: (cloudUid, cloudEmail) => set({ cloudUid, cloudEmail }),
      applyCloudData: (profiles, activeProfileId, syncedAt) => {
        if (!profiles || profiles.length === 0) return;
        set({ profiles, activeProfileId, lastSyncAt: syncedAt, ...mirror(profiles, activeProfileId) });
      },

      // ---- profile management ----
      addProfile: (overrides) => {
        const p = createProfile(overrides);
        const profiles = [...get().profiles, p];
        set({ profiles, activeProfileId: p.id, ...mirror(profiles, p.id) });
        return p.id;
      },
      switchProfile: (id) => {
        const profiles = get().profiles;
        if (!profiles.find((p) => p.id === id)) return;
        set({ activeProfileId: id, ...mirror(profiles, id) });
      },
      deleteProfile: (id) => {
        const s = get();
        if (s.profiles.length <= 1) return; // never delete last profile
        const profiles = s.profiles.filter((p) => p.id !== id);
        const activeId = s.activeProfileId === id ? profiles[0].id : s.activeProfileId;
        set({ profiles, activeProfileId: activeId, ...mirror(profiles, activeId) });
      },
      updateActive: (patch) => set((s) => applyToActive(s, (p) => ({ ...p, ...patch }))),

      // ---- existing API ----
      setProfile: (p) => set((s) => applyToActive(s, (prof) => ({ ...prof, ...p }))),
      setLocale: (locale) => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
        set({ locale });
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      setWorld: (worldId) => set((s) => applyToActive(s, (p) => ({ ...p, worldId }))),
      setA11y: (patch) =>
        set((s) => {
          const next = { ...s.a11y, ...patch };
          applyA11y(next);
          return { a11y: next };
        }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleTts: () => set((s) => ({ ttsOn: !s.ttsOn })),
      addStar: (n = 1) =>
        set((s) => applyToActive(s, (p) => ({ ...p, stars: p.stars + n }))),
      bumpStreak: (correct) =>
        set((s) => applyToActive(s, (p) => ({ ...p, streak: correct ? p.streak + 1 : 0 }))),
      recordAttempt: (gameId, correct, total) => {
        const s = get();
        const active = s.profiles.find((p) => p.id === s.activeProfileId)!;
        const curLevel = active.levels[gameId] ?? startLevel(active.age);
        const attempt: Attempt = { ts: Date.now(), correct, total, level: curLevel };
        const list = [...(active.attempts[gameId] ?? []), attempt].slice(-50);
        const pct = correct / total;
        const leveledUp = pct >= 0.8;
        const newLevel = leveledUp ? Math.min(curLevel + 1, 10) : curLevel;
        let newCollectible: string | undefined;
        const newCollectibles = [...active.collectibles];
        const earned = Math.floor(active.stars / 10);
        if (earned > active.collectibles.length && earned <= COLLECTIBLE_LIST.length) {
          newCollectible = COLLECTIBLE_LIST[earned - 1];
          newCollectibles.push(newCollectible);
        }
        set(applyToActive(s, (p) => ({
          ...p,
          attempts: { ...p.attempts, [gameId]: list },
          levels: { ...p.levels, [gameId]: newLevel },
          collectibles: newCollectibles,
        })));
        return { leveledUp: leveledUp && newLevel > curLevel, newCollectible };
      },
      pushChat: (m) =>
        set((s) => applyToActive(s, (p) => ({ ...p, chatHistory: [...p.chatHistory, m].slice(-50) }))),
      clearChat: () =>
        set((s) => applyToActive(s, (p) => ({ ...p, chatHistory: [] }))),
      reset: () =>
        set((s) => applyToActive(s, (p) => ({
          ...p,
          stars: 0, levels: {}, attempts: {}, collectibles: [], streak: 0, chatHistory: [],
        }))),
    }),
    {
      name: 'mehunanim-v3',
      version: 3,
      // Migrate from v2 (single-profile) → v3 (multi-profile)
      migrate: (persistedState: any, version) => {
        if (!persistedState) return persistedState;
        if (version < 3) {
          // v2 had top-level name/age/.../stars/levels/etc.
          const p = createProfile({
            name: persistedState.name || '',
            age: persistedState.age || 6,
            city: persistedState.city || '',
            avatar: persistedState.avatar || '🦊',
            worldId: persistedState.worldId || 'owl',
            stars: persistedState.stars || 0,
            levels: persistedState.levels || {},
            attempts: persistedState.attempts || {},
            collectibles: persistedState.collectibles || [],
            streak: persistedState.streak || 0,
            chatHistory: persistedState.chatHistory || [],
          });
          return {
            ...persistedState,
            profiles: [p],
            activeProfileId: p.id,
            ...mirror([p], p.id),
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (s) => {
        if (s) {
          // Re-mirror from active profile (in case profiles array was modified)
          if (s.profiles && s.profiles.length > 0) {
            const m = mirror(s.profiles, s.activeProfileId);
            Object.assign(s, m);
          }
          document.documentElement.lang = s.locale;
          document.documentElement.dir = s.locale === 'he' ? 'rtl' : 'ltr';
          document.documentElement.classList.toggle('dark', s.theme === 'dark');
          applyA11y(s.a11y || DEFAULT_A11Y);
        }
      },
    }
  )
);

export const getCurrentLevel = (gameId: string): number => {
  const s = useStore.getState();
  return s.levels[gameId] ?? startLevel(s.age);
};

export { startLevel };
