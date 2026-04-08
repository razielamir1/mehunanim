export type GameMeta = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  category: 'visual' | 'verbal' | 'quantitative' | 'logic' | 'memory' | 'reading';
};

export const GAMES: GameMeta[] = [
  { id: 'pattern', title: 'מצא את הדפוס', subtitle: 'המשך את הרצף', emoji: '🔷', gradient: 'from-indigo-400 to-purple-500', category: 'visual' },
  { id: 'odd', title: 'מי לא שייך?', subtitle: 'מצא את החריג', emoji: '🎯', gradient: 'from-pink-400 to-rose-500', category: 'logic' },
  { id: 'sequence', title: 'רצף מספרים', subtitle: 'מה המספר הבא?', emoji: '🔢', gradient: 'from-emerald-400 to-teal-500', category: 'quantitative' },
  { id: 'analogy', title: 'אנלוגיות', subtitle: 'מילים שמתחברות', emoji: '💭', gradient: 'from-amber-400 to-orange-500', category: 'verbal' },
  { id: 'memory', title: 'זיכרון קסום', subtitle: 'זכור את הסדר', emoji: '✨', gradient: 'from-sky-400 to-blue-500', category: 'memory' },
  { id: 'math', title: 'חישוב מהיר', subtitle: 'חיבור, חיסור ובעיות', emoji: '🧮', gradient: 'from-fuchsia-400 to-pink-500', category: 'quantitative' },
  { id: 'reading', title: 'הבנת הנקרא', subtitle: 'קרא וענה', emoji: '📖', gradient: 'from-cyan-400 to-sky-500', category: 'reading' },
];
