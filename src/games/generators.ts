// Level-based question generators (level 1-10+).
// Higher level = harder. Level loosely maps to age - 1 at start.
export type ReadDir = 'rtl' | 'ltr';
export type MCQ = { prompt: string; options: string[]; correct: number; hintContext: string; dir: ReadDir };

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ---------------- Pattern ----------------
const SHAPES = ['🔴', '🟦', '🟢', '🟡', '🔺', '⬛', '⭐', '❤️', '💜', '🟧'];
export function genPattern(level: number): MCQ {
  const poolSize = Math.min(2 + Math.floor(level / 2), 5);
  const reps = level <= 2 ? 2 : 3;
  const pool = shuffle(SHAPES).slice(0, poolSize);
  const seq: string[] = [];
  for (let i = 0; i < reps; i++) seq.push(...pool);
  const answer = pool[0];
  const distractors = shuffle(SHAPES.filter((s) => !pool.includes(s))).slice(0, Math.min(3, level + 1));
  const options = shuffle([answer, ...distractors]);
  return { prompt: seq.join(' '), options, correct: options.indexOf(answer), hintContext: `הרצף חוזר על עצמו: ${pool.join('-')}`, dir: 'rtl' };
}

// ---------------- Odd one out ----------------
const GROUPS = [
  { items: ['כלב', 'חתול', 'סוס', 'פרה'], odd: 'אוטובוס', cat: 'בעלי חיים' },
  { items: ['תפוח', 'בננה', 'ענבים', 'תות'], odd: 'כיסא', cat: 'פירות' },
  { items: ['אדום', 'כחול', 'ירוק', 'צהוב'], odd: 'מרובע', cat: 'צבעים' },
  { items: ['עיפרון', 'עט', 'מחק', 'מחברת'], odd: 'תפוז', cat: 'כלי כתיבה' },
  { items: ['יד', 'רגל', 'ראש', 'אוזן'], odd: 'שולחן', cat: 'איברי גוף' },
  { items: ['אופניים', 'מכונית', 'אוטובוס', 'משאית'], odd: 'עץ', cat: 'כלי תחבורה' },
  { items: ['שמש', 'ירח', 'כוכב', 'ענן'], odd: 'ספר', cat: 'בשמיים' },
  { items: ['רופא', 'מורה', 'נהג', 'טבח'], odd: 'מקרר', cat: 'מקצועות' },
  { items: ['חורף', 'אביב', 'קיץ', 'סתיו'], odd: 'יום שני', cat: 'עונות' },
];
export function genOdd(_level: number): MCQ {
  const g = pick(GROUPS);
  const options = shuffle([...g.items.slice(0, 3), g.odd]);
  return { prompt: 'איזו מילה לא שייכת לקבוצה?', options, correct: options.indexOf(g.odd), hintContext: `שלוש מהמילים הן ${g.cat}`, dir: 'rtl' };
}

// ---------------- Number sequence ----------------
export function genSequence(level: number): MCQ {
  const start = rand(1, level <= 3 ? 5 : 20);
  const stepOptions = level <= 2 ? [1, 2] : level <= 4 ? [2, 3, 5] : [3, 4, 5, 7, 10];
  const step = pick(stepOptions);
  const seq = [start, start + step, start + 2 * step, start + 3 * step];
  const answer = start + 4 * step;
  const opts = shuffle([answer, answer + 1, answer - step, answer + step * 2]).map(String);
  return { prompt: `${seq.join(' , ')} , ?`, options: opts, correct: opts.indexOf(String(answer)), hintContext: `בכל פעם מוסיפים ${step}`, dir: 'ltr' };
}

// ---------------- Analogies ----------------
const ANALOGIES = [
  { a: 'חתול', b: 'חתלתול', c: 'כלב', d: 'גור', distractors: ['עכבר', 'פיל', 'דג'] },
  { a: 'יום', b: 'לילה', c: 'שמש', d: 'ירח', distractors: ['כוכב', 'ענן', 'שמיים'] },
  { a: 'ציפור', b: 'עפה', c: 'דג', d: 'שוחה', distractors: ['רץ', 'קופץ', 'הולך'] },
  { a: 'חם', b: 'קר', c: 'גדול', d: 'קטן', distractors: ['ארוך', 'עגול', 'כבד'] },
  { a: 'רופא', b: 'בית חולים', c: 'מורה', d: 'בית ספר', distractors: ['פארק', 'חוף', 'מסעדה'] },
  { a: 'אוזן', b: 'שמיעה', c: 'עין', d: 'ראייה', distractors: ['ריח', 'טעם', 'מגע'] },
  { a: 'גוזל', b: 'ציפור', c: 'גור', d: 'כלב', distractors: ['חתול', 'אריה', 'דב'] },
];
export function genAnalogy(_level: number): MCQ {
  const q = pick(ANALOGIES);
  const options = shuffle([q.d, ...q.distractors]);
  return { prompt: `${q.a} : ${q.b} :: ${q.c} : ?`, options, correct: options.indexOf(q.d), hintContext: `מה היחס בין ${q.a} ל-${q.b}?`, dir: 'rtl' };
}

// ---------------- Memory ----------------
export function genMemory(level: number): MCQ {
  const len = Math.min(3 + Math.floor(level / 2), 7);
  const seq: string[] = [];
  for (let i = 0; i < len; i++) seq.push(pick(SHAPES));
  const idx = rand(0, len - 1);
  const answer = seq[idx];
  const options = shuffle([answer, ...shuffle(SHAPES.filter((s) => s !== answer)).slice(0, 3)]);
  return { prompt: `זכור: ${seq.join(' ')}  •  מה היה במקום ה-${idx + 1}?`, options, correct: options.indexOf(answer), hintContext: `ספור מימין לשמאל`, dir: 'rtl' };
}

// ---------------- Math sprint (arithmetic + word problems) ----------------
export function genMath(level: number): MCQ {
  // For higher levels, prefer multi-step word problems
  if (level >= 6 && Math.random() < 0.7) return genWordProblem(level);
  if (level >= 4 && Math.random() < 0.5) return genWordProblem(level);

  // Pure arithmetic
  const op = level <= 2 ? '+' : level <= 4 ? pick(['+', '-']) : pick(['+', '-', '×']);
  let a: number, b: number, ans: number;
  if (level <= 2) { a = rand(1, 5); b = rand(1, 5); }
  else if (level <= 4) { a = rand(2, 12); b = rand(1, 9); }
  else if (level <= 6) { a = rand(10, 30); b = rand(2, 15); }
  else { a = rand(15, 60); b = rand(5, 25); }

  if (op === '-' && b > a) [a, b] = [b, a];
  ans = op === '+' ? a + b : op === '-' ? a - b : a * b;

  const opts = shuffle([ans, ans + 1, ans - 1, ans + (op === '×' ? 2 : rand(2, 5))]).map(String);
  return { prompt: `${a} ${op} ${b} = ?`, options: opts, correct: opts.indexOf(String(ans)), hintContext: `חשב צעד אחר צעד`, dir: 'ltr' };
}

function genWordProblem(level: number): MCQ {
  const templates: Array<() => MCQ> = [
    // money - multi-step (target: end of grade 2)
    () => {
      const wallet = rand(20, 100);
      const itemPrice = rand(5, Math.floor(wallet / 2));
      const qty = rand(2, 3);
      const ans = wallet - itemPrice * qty;
      const opts = shuffle([ans, ans + itemPrice, ans - 1, wallet - itemPrice]).map(String);
      return {
        prompt: `יש לי ${wallet} ₪. אני קונה ${qty} משחקים בעלות של ${itemPrice} ₪ כל אחד. כמה כסף יישאר לי?`,
        options: opts, correct: opts.indexOf(String(ans)),
        hintContext: `קודם חשב כמה עולים ${qty} משחקים, ואז חסר מהסכום שיש לי`,
        dir: 'rtl',
      };
    },
    // sharing
    () => {
      const total = rand(2, 8) * rand(2, 5);
      const kids = pick([2, 3, 4, 5]).valueOf();
      const each = Math.floor(total / kids);
      const opts = shuffle([each, each + 1, each - 1, total - kids]).map(String);
      return {
        prompt: `ל-${kids} ילדים יש לחלק ${total} סוכריות בשווה. כמה סוכריות יקבל כל ילד?`,
        options: opts, correct: opts.indexOf(String(each)),
        hintContext: `חלק את הסוכריות שווה בשווה`,
        dir: 'rtl',
      };
    },
    // change over time
    () => {
      const start = rand(5, 20);
      const added = rand(3, 15);
      const removed = rand(2, Math.min(start + added - 1, 10));
      const ans = start + added - removed;
      const opts = shuffle([ans, ans + 1, ans - 1, start + added]).map(String);
      return {
        prompt: `בכיתה היו ${start} ילדים. הגיעו עוד ${added} ילדים, ואז ${removed} ילדים הלכו הביתה. כמה ילדים נשארו?`,
        options: opts, correct: opts.indexOf(String(ans)),
        hintContext: `קודם הוסף, ואחר כך חסר`,
        dir: 'rtl',
      };
    },
    // simple counting (low level)
    () => {
      const a = rand(1, 5), b = rand(1, 5);
      const ans = a + b;
      const opts = shuffle([ans, ans + 1, ans - 1, a]).map(String);
      return {
        prompt: `יש לי ${a} תפוחים וקיבלתי עוד ${b}. כמה תפוחים יש לי עכשיו?`,
        options: opts, correct: opts.indexOf(String(ans)),
        hintContext: `ספור את כל התפוחים`,
        dir: 'rtl',
      };
    },
  ];
  const idx = level <= 3 ? 3 : level <= 5 ? rand(2, 3) : rand(0, 2);
  return templates[idx]();
}

// ---------------- Reading comprehension (high level) ----------------
const PASSAGES = [
  {
    text: 'דנה הלכה לפארק עם הכלב שלה רקס. בפארק הם פגשו את שירה ואת הכלב שלה לולה. הילדות שיחקו יחד עד שהשמש התחילה לרדת.',
    q: 'מי הם רקס ולולה?',
    options: ['ילדות', 'כלבים', 'הורים', 'חתולים'],
    correct: 1,
    hint: 'קרא שוב את המשפט הראשון',
  },
  {
    text: 'יואב אוהב לקרוא ספרים על חלל. בכל ערב הוא קורא פרק לפני השינה. אמא שלו קנתה לו ספר חדש על הירח.',
    q: 'על מה הספר החדש של יואב?',
    options: ['חיות', 'הירח', 'ספורט', 'אוכל'],
    correct: 1,
    hint: 'מה אמא קנתה לו?',
  },
];
export function genReading(_level: number): MCQ {
  const p = pick(PASSAGES);
  const options = [...p.options];
  return { prompt: `${p.text}\n\n${p.q}`, options, correct: p.correct, hintContext: p.hint, dir: 'rtl' };
}

export function generate(gameId: string, level: number): MCQ {
  switch (gameId) {
    case 'pattern': return genPattern(level);
    case 'odd': return genOdd(level);
    case 'sequence': return genSequence(level);
    case 'analogy': return genAnalogy(level);
    case 'memory': return genMemory(level);
    case 'math': return genMath(level);
    case 'reading': return genReading(level);
    default: return genPattern(level);
  }
}
