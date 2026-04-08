export type GameMeta = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  category: 'visual' | 'verbal' | 'quantitative' | 'logic' | 'memory' | 'reading';
  minAge: number; // never shown below this age
};

export const GAMES: GameMeta[] = [
  // Visual / pattern
  { id: 'pattern', title: 'מצא את הדפוס', subtitle: 'המשך את הרצף', emoji: '🔷', gradient: 'from-indigo-400 to-purple-500', category: 'visual', minAge: 2 },
  { id: 'memory', title: 'זיכרון קסום', subtitle: 'זכור את הסדר', emoji: '✨', gradient: 'from-sky-400 to-blue-500', category: 'memory', minAge: 2 },
  { id: 'odd', title: 'מי לא שייך?', subtitle: 'מצא את החריג', emoji: '🎯', gradient: 'from-pink-400 to-rose-500', category: 'logic', minAge: 3 },
  // Verbal
  { id: 'analogy', title: 'אנלוגיות', subtitle: 'מילים שמתחברות', emoji: '💭', gradient: 'from-amber-400 to-orange-500', category: 'verbal', minAge: 5 },
  { id: 'synonym', title: 'מילים נרדפות', subtitle: 'מילים בעלות משמעות דומה', emoji: '📝', gradient: 'from-violet-400 to-purple-500', category: 'verbal', minAge: 5 },
  { id: 'idiom', title: 'ביטויים', subtitle: 'מה זה אומר?', emoji: '💬', gradient: 'from-rose-400 to-pink-500', category: 'verbal', minAge: 6 },
  // Quantitative
  { id: 'sequence', title: 'רצף מספרים', subtitle: 'מה המספר הבא?', emoji: '🔢', gradient: 'from-emerald-400 to-teal-500', category: 'quantitative', minAge: 4 },
  { id: 'math', title: 'חישוב מהיר', subtitle: 'חיבור, חיסור ובעיות', emoji: '🧮', gradient: 'from-fuchsia-400 to-pink-500', category: 'quantitative', minAge: 4 },
  // Reading
  { id: 'reading', title: 'הבנת הנקרא', subtitle: 'קרא וענה', emoji: '📖', gradient: 'from-cyan-400 to-sky-500', category: 'reading', minAge: 6 },
];

export const gamesForAge = (age: number) => GAMES.filter((g) => g.minAge <= age);
