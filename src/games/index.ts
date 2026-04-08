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
  minAge: number;
};

export const GAMES: GameMeta[] = [
  { id: 'pattern', title: 'מצא את הדפוס', titleEn: 'Find the Pattern', subtitle: 'המשך את הרצף', subtitleEn: 'Continue the sequence', emoji: '🔷', gradient: 'from-indigo-400 to-purple-500', category: 'visual', minAge: 2 },
  { id: 'memory', title: 'זיכרון קסום', titleEn: 'Magic Memory', subtitle: 'זכור את הסדר', subtitleEn: 'Remember the order', emoji: '✨', gradient: 'from-sky-400 to-blue-500', category: 'memory', minAge: 2 },
  { id: 'odd', title: 'מי לא שייך?', titleEn: "Which Doesn't Belong?", subtitle: 'מצא את החריג', subtitleEn: 'Find the odd one out', emoji: '🎯', gradient: 'from-pink-400 to-rose-500', category: 'logic', minAge: 3 },
  { id: 'analogy', title: 'אנלוגיות', titleEn: 'Analogies', subtitle: 'מילים שמתחברות', subtitleEn: 'Words that connect', emoji: '💭', gradient: 'from-amber-400 to-orange-500', category: 'verbal', minAge: 5 },
  { id: 'synonym', title: 'מילים נרדפות', titleEn: 'Synonyms', subtitle: 'מילים בעלות משמעות דומה', subtitleEn: 'Similar meaning words', emoji: '📝', gradient: 'from-violet-400 to-purple-500', category: 'verbal', minAge: 5 },
  { id: 'idiom', title: 'ביטויים', titleEn: 'Idioms', subtitle: 'מה זה אומר?', subtitleEn: 'What does it mean?', emoji: '💬', gradient: 'from-rose-400 to-pink-500', category: 'verbal', minAge: 6 },
  { id: 'sequence', title: 'רצף מספרים', titleEn: 'Number Sequence', subtitle: 'מה המספר הבא?', subtitleEn: "What's the next number?", emoji: '🔢', gradient: 'from-emerald-400 to-teal-500', category: 'quantitative', minAge: 4 },
  { id: 'math', title: 'חישוב מהיר', titleEn: 'Quick Math', subtitle: 'חיבור, חיסור ובעיות', subtitleEn: 'Add, subtract, and word problems', emoji: '🧮', gradient: 'from-fuchsia-400 to-pink-500', category: 'quantitative', minAge: 4 },
  { id: 'reading', title: 'הבנת הנקרא', titleEn: 'Reading', subtitle: 'קרא וענה', subtitleEn: 'Read and answer', emoji: '📖', gradient: 'from-cyan-400 to-sky-500', category: 'reading', minAge: 6 },
];

export const gamesForAge = (age: number) => GAMES.filter((g) => g.minAge <= age);

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
