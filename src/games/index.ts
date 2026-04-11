import { useStore } from '@/store/useStore';

export type GameMeta = {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  emoji: string;
  gradient: string;
  category: 'visual' | 'verbal' | 'quantitative' | 'logic' | 'memory' | 'reading';
  minLevel: number;  // global avg level needed to unlock
};

export const GAMES: GameMeta[] = [
  // Always unlocked
  { id: 'pattern', title: 'מצא את הדפוס', titleEn: 'Find the Pattern', subtitle: 'המשך את הרצף', subtitleEn: 'Continue the sequence', emoji: '🔷', gradient: 'from-indigo-400 to-purple-500', category: 'visual', minLevel: 1 },
  { id: 'memory', title: 'זיכרון קסום', titleEn: 'Magic Memory', subtitle: 'זכור את הסדר', subtitleEn: 'Remember the order', emoji: '✨', gradient: 'from-sky-400 to-blue-500', category: 'memory', minLevel: 1 },
  { id: 'odd', title: 'מי לא שייך?', titleEn: "Which Doesn't Belong?", subtitle: 'מצא את החריג', subtitleEn: 'Find the odd one out', emoji: '🎯', gradient: 'from-pink-400 to-rose-500', category: 'logic', minLevel: 1 },
  { id: 'sequence', title: 'רצף מספרים', titleEn: 'Number Sequence', subtitle: 'מה המספר הבא?', subtitleEn: "What's the next number?", emoji: '🔢', gradient: 'from-emerald-400 to-teal-500', category: 'quantitative', minLevel: 1 },
  { id: 'math', title: 'חישוב מהיר', titleEn: 'Quick Math', subtitle: 'חיבור, חיסור ובעיות', subtitleEn: 'Add, subtract, and word problems', emoji: '🧮', gradient: 'from-fuchsia-400 to-pink-500', category: 'quantitative', minLevel: 1 },
  // Unlock progressively
  { id: 'analogy', title: 'אנלוגיות', titleEn: 'Analogies', subtitle: 'מילים שמתחברות', subtitleEn: 'Words that connect', emoji: '💭', gradient: 'from-amber-400 to-orange-500', category: 'verbal', minLevel: 3 },
  { id: 'synonym', title: 'מילים נרדפות', titleEn: 'Synonyms', subtitle: 'מילים בעלות משמעות דומה', subtitleEn: 'Similar meaning words', emoji: '📝', gradient: 'from-violet-400 to-purple-500', category: 'verbal', minLevel: 3 },
  { id: 'reading', title: 'הבנת הנקרא', titleEn: 'Reading', subtitle: 'קרא וענה', subtitleEn: 'Read and answer', emoji: '📖', gradient: 'from-cyan-400 to-sky-500', category: 'reading', minLevel: 4 },
  { id: 'idiom', title: 'ביטויים', titleEn: 'Idioms', subtitle: 'מה זה אומר?', subtitleEn: 'What does it mean?', emoji: '💬', gradient: 'from-rose-400 to-pink-500', category: 'verbal', minLevel: 5 },
  { id: 'cloze', title: 'הַשְׁלָמַת מִשְׁפָּטִים', titleEn: 'Sentence Completion', subtitle: 'מָה חָסֵר?', subtitleEn: 'What\'s missing?', emoji: '📝', gradient: 'from-teal-400 to-emerald-500', category: 'verbal', minLevel: 5 },
  { id: 'missing', title: 'הַמִּסְפָּר הֶחָסֵר', titleEn: 'Missing Number', subtitle: 'הַשְׁלֵם אֶת הַתַּרְגִּיל', subtitleEn: 'Complete the equation', emoji: '🔢', gradient: 'from-yellow-400 to-amber-500', category: 'quantitative', minLevel: 3 },
  { id: 'pictureeq', title: 'חִידוֹת בְּצִיּוּרִים', titleEn: 'Picture Riddles', subtitle: 'כָּל צִיּוּר = מִסְפָּר', subtitleEn: 'Each picture = a number', emoji: '🌸', gradient: 'from-lime-400 to-green-500', category: 'quantitative', minLevel: 4 },
  { id: 'trivia', title: 'יֶדַע כְּלָלִי', titleEn: 'General Knowledge', subtitle: 'פִּתְגָמִים, גֵּאוֹגְרָפְיָה וְהִיסְטוֹרְיָה', subtitleEn: 'Proverbs, geography & history', emoji: '🧠', gradient: 'from-orange-400 to-red-500', category: 'verbal', minLevel: 2 },
  { id: 'inequality', title: 'אִי-שִׁוְיוֹן', titleEn: 'Inequalities', subtitle: 'גָּדוֹל, קָטָן אוֹ שָׁוֶה?', subtitleEn: 'Greater, less, or equal?', emoji: '⚖️', gradient: 'from-cyan-400 to-blue-500', category: 'quantitative', minLevel: 4 },
];

// Compute the user's effective global level (used to gate unlocks)
export function effectiveGlobalLevel(age: number, levels: Record<string, number>, levelOverride?: number | null): number {
  if (levelOverride != null) return levelOverride;
  const lvls = Object.values(levels);
  if (lvls.length === 0) {
    // No history yet — use age default
    if (age <= 3) return 1;
    if (age === 4) return 2;
    if (age === 5) return 3;
    if (age === 6) return 4;
    if (age === 7) return 5;
    return 6;
  }
  return Math.round(lvls.reduce((a, b) => a + b, 0) / lvls.length);
}

export function isUnlocked(g: GameMeta, age: number, levels: Record<string, number>, levelOverride?: number | null): boolean {
  return effectiveGlobalLevel(age, levels, levelOverride) >= g.minLevel;
}

// Returns ALL games annotated with `unlocked` boolean, sorted: unlocked first
export function gamesWithLockState(age: number, levels: Record<string, number>, levelOverride?: number | null) {
  return GAMES.map((g) => ({
    ...g,
    unlocked: isUnlocked(g, age, levels, levelOverride),
  })).sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || a.minLevel - b.minLevel);
}

// Backwards-compat — kept so existing imports don't break
export const gamesForAge = (age: number) => GAMES.filter((g) => g.minLevel <= effectiveGlobalLevel(age, {}));

// Hook to get a localized game (title/subtitle by current locale)
export function useLocalizedGame(g: GameMeta) {
  const locale = useStore((s) => s.locale);
  return {
    ...g,
    title: locale === 'en' ? g.titleEn : g.title,
    subtitle: locale === 'en' ? g.subtitleEn : g.subtitle,
  };
}

export function localizeGame(g: GameMeta, locale: 'he' | 'en'): GameMeta {
  return { ...g, title: locale === 'en' ? g.titleEn : g.title, subtitle: locale === 'en' ? g.subtitleEn : g.subtitle };
}
