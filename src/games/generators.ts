// Question generators with 8 difficulty levels (1=toddler, 8=Hilel exam target).
// Each generator receives both `level` (current difficulty) and `age` (kid's age).
// Content is age-gated: a 4-year-old never sees level-8 content even if they hit a streak.
// Level 7-8 content is seeded from real מכון נועם simulations (.claude/exam-analysis.md).

export type ReadDir = 'rtl' | 'ltr';
export type MCQ = {
  prompt: string;
  options: string[];
  correct: number;
  hintContext: string;
  dir: ReadDir;
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Cap level by age — a 4yo can max-out at level 3, etc. This protects from over-difficulty.
const ageCap = (age: number): number => {
  if (age <= 3) return 2;
  if (age === 4) return 3;
  if (age === 5) return 4;
  if (age === 6) return 6;
  if (age === 7) return 7;
  return 8;
};
const cappedLevel = (level: number, age: number) => Math.min(level, ageCap(age));

const buildOptions = (correct: string, candidates: string[], pad: () => string) => {
  const seen = new Set<string>([correct]);
  const distractors: string[] = [];
  for (const c of candidates) {
    if (distractors.length >= 3) break;
    if (!seen.has(c)) { seen.add(c); distractors.push(c); }
  }
  let safety = 0;
  while (distractors.length < 3 && safety++ < 50) {
    const v = pad();
    if (!seen.has(v)) { seen.add(v); distractors.push(v); }
  }
  const options = shuffle([correct, ...distractors]);
  return { options, correctIdx: options.indexOf(correct) };
};

// =============================================================
// PATTERN — visual sequence (ages 2-8)
// =============================================================
const SHAPES = ['🔴', '🟦', '🟢', '🟡', '🔺', '⬛', '⭐', '❤️', '💜', '🟧'];

export function genPattern(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  const poolSize = L <= 1 ? 2 : L <= 3 ? 2 : L <= 5 ? 3 : 4;
  const reps = L <= 2 ? 2 : 3;
  const pool = shuffle(SHAPES).slice(0, poolSize);
  const seq: string[] = [];
  for (let i = 0; i < reps; i++) seq.push(...pool);
  const answer = seq.pop()!;
  const visible = [...seq, '❓'];
  const { options, correctIdx } = buildOptions(
    answer,
    SHAPES.filter((s) => s !== answer),
    () => pick(SHAPES.filter((s) => s !== answer))
  );
  return {
    prompt: visible.join(' '),
    options,
    correct: correctIdx,
    hintContext: `הרצף חוזר על עצמו: ${pool.join('-')}`,
    dir: 'rtl',
  };
}

// =============================================================
// ODD ONE OUT — leveled by category complexity
// Level 1-2: visual emojis. Level 3-4: simple words. Level 5-6: fine distinctions. Level 7-8: cultural/specific.
// =============================================================
type OddGroup = { items: string[]; odd: string; cat: string; minLevel: number };
const ODD_GROUPS: OddGroup[] = [
  // L1-2: visual
  { items: ['🍎', '🍌', '🍇'], odd: '🚗', cat: 'פירות', minLevel: 1 },
  { items: ['🐶', '🐱', '🐮'], odd: '🚲', cat: 'בעלי חיים', minLevel: 1 },
  { items: ['🔴', '🔵', '🟢'], odd: '⬛', cat: 'צבעי הקשת', minLevel: 1 },
  // L3-4: simple words
  { items: ['כלב', 'חתול', 'סוס', 'פרה'], odd: 'אוטובוס', cat: 'בעלי חיים', minLevel: 3 },
  { items: ['תפוח', 'בננה', 'ענבים', 'תות'], odd: 'כיסא', cat: 'פירות', minLevel: 3 },
  { items: ['אדום', 'כחול', 'ירוק', 'צהוב'], odd: 'מרובע', cat: 'צבעים', minLevel: 3 },
  { items: ['עיפרון', 'עט', 'מחק', 'מחברת'], odd: 'תפוז', cat: 'כלי כתיבה', minLevel: 3 },
  { items: ['יד', 'רגל', 'ראש', 'אוזן'], odd: 'שולחן', cat: 'איברי גוף', minLevel: 3 },
  // L5-6: fine distinctions
  { items: ['אופניים', 'מכונית', 'אוטובוס', 'משאית'], odd: 'עץ', cat: 'כלי תחבורה', minLevel: 5 },
  { items: ['רופא', 'מורה', 'נהג', 'טבח'], odd: 'מקרר', cat: 'מקצועות', minLevel: 5 },
  { items: ['חורף', 'אביב', 'קיץ', 'סתיו'], odd: 'יום שני', cat: 'עונות השנה', minLevel: 5 },
  // L7-8: real exam-style — culture/geography (from sim 1, sim 2)
  { items: ['חיפה', 'ירושלים', 'באר שבע'], odd: 'שדה בוקר', cat: 'ערים בישראל', minLevel: 7 },
  { items: ['אבוקדו'], odd: 'תפוח-אדמה', cat: 'פרי (השאר ירק)', minLevel: 7 },
  { items: ['יתוש', 'חרגול', 'נמלה'], odd: 'סוס יאור', cat: 'חרקים', minLevel: 7 },
  { items: ['יוון', 'ישראל', 'ירדן'], odd: 'איטליה', cat: 'מדינות במזרח התיכון', minLevel: 7 },
];

export function genOdd(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  const eligible = ODD_GROUPS.filter((g) => g.minLevel <= L);
  const g = pick(eligible);
  const items = g.items.length >= 3 ? g.items.slice(0, 3) : g.items;
  // For L7+ entries that have only 1 item in items[], pad with cat-like distractors? simpler: ensure groups have 3
  const allOptions = shuffle([...items, g.odd]);
  return {
    prompt: items.length === 1
      ? `איזה מהבאים שייך לקבוצה: ${items[0]}? (החריג מקבוצה אחרת)`
      : 'איזה מהבאים יוצא דופן?',
    options: allOptions,
    correct: allOptions.indexOf(g.odd),
    hintContext: `שלוש מהמילים הן ${g.cat}`,
    dir: 'rtl',
  };
}

// =============================================================
// SEQUENCE — number sequence
// L1: count 1,2,? L2: 1,2,3,? L3: +1,+2 L4: +2,+5 L5: +3 L6-7: +5,+10 L8: complex
// =============================================================
export function genSequence(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  let start: number, step: number;
  if (L === 1) { start = 1; step = 1; }
  else if (L === 2) { start = rand(1, 3); step = 1; }
  else if (L === 3) { start = rand(1, 5); step = pick([1, 2]); }
  else if (L === 4) { start = rand(1, 8); step = pick([2, 3]); }
  else if (L === 5) { start = rand(2, 10); step = pick([2, 5]); }
  else if (L === 6) { start = rand(2, 15); step = pick([3, 5]); }
  else if (L === 7) { start = rand(3, 20); step = pick([3, 4, 7]); }
  else { start = rand(5, 30); step = pick([4, 6, 8, 10]); }

  const seq = [start, start + step, start + 2 * step, start + 3 * step];
  const answer = start + 4 * step;
  const { options, correctIdx } = buildOptions(
    String(answer),
    [answer + step, Math.max(0, answer - step), answer + 1, answer + 2 * step].map(String),
    () => String(Math.max(0, answer + rand(-step * 2, step * 2)))
  );
  return {
    prompt: `${seq.join(' , ')} , ?`,
    options,
    correct: correctIdx,
    hintContext: `בכל פעם מוסיפים ${step}`,
    dir: 'ltr',
  };
}

// =============================================================
// ANALOGIES — leveled
// =============================================================
type Analogy = { a: string; b: string; c: string; d: string; distractors: string[]; minLevel: number };
const ANALOGIES: Analogy[] = [
  { a: 'חתול', b: 'חתלתול', c: 'כלב', d: 'גור', distractors: ['עכבר', 'פיל', 'דג'], minLevel: 3 },
  { a: 'יום', b: 'לילה', c: 'שמש', d: 'ירח', distractors: ['כוכב', 'ענן', 'שמיים'], minLevel: 3 },
  { a: 'ציפור', b: 'עפה', c: 'דג', d: 'שוחה', distractors: ['רץ', 'קופץ', 'הולך'], minLevel: 3 },
  { a: 'חם', b: 'קר', c: 'גדול', d: 'קטן', distractors: ['ארוך', 'עגול', 'כבד'], minLevel: 3 },
  { a: 'רופא', b: 'בית חולים', c: 'מורה', d: 'בית ספר', distractors: ['פארק', 'חוף', 'מסעדה'], minLevel: 4 },
  { a: 'אוזן', b: 'שמיעה', c: 'עין', d: 'ראייה', distractors: ['ריח', 'טעם', 'מגע'], minLevel: 5 },
  { a: 'גוזל', b: 'ציפור', c: 'גור', d: 'כלב', distractors: ['חתול', 'אריה', 'דב'], minLevel: 5 },
  // From sim — synonyms/groups
  { a: 'נגר', b: 'עץ', c: 'צורף', d: 'זהב', distractors: ['נייר', 'בד', 'אבן'], minLevel: 7 },
  { a: 'טונה', b: 'דג', c: 'נרקיס', d: 'פרח', distractors: ['חיה', 'יסוד', 'אבן'], minLevel: 7 },
];

export function genAnalogy(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  const eligible = ANALOGIES.filter((q) => q.minLevel <= L);
  const q = pick(eligible);
  const options = shuffle([q.d, ...q.distractors]);
  return {
    prompt: `${q.a} : ${q.b} :: ${q.c} : ?`,
    options,
    correct: options.indexOf(q.d),
    hintContext: `מה היחס בין ${q.a} ל-${q.b}?`,
    dir: 'rtl',
  };
}

// =============================================================
// MEMORY — sequence length scales with age
// =============================================================
export function genMemory(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  const len = Math.min(2 + Math.floor(L / 2), 7);
  const seq = shuffle(SHAPES).slice(0, len);
  const idx = rand(0, len - 1);
  const answer = seq[idx];
  const { options, correctIdx } = buildOptions(
    answer,
    SHAPES.filter((s) => s !== answer),
    () => pick(SHAPES.filter((s) => s !== answer))
  );
  return {
    prompt: `זכור: ${seq.join(' ')}  •  מה היה במקום ה-${idx + 1}?`,
    options,
    correct: correctIdx,
    hintContext: `ספור מימין לשמאל`,
    dir: 'rtl',
  };
}

// =============================================================
// MATH — leveled arithmetic + word problems (ages 2-8)
// L1: 1+1, count L2: +up to 5 L3: +/- up to 10 L4: +/- up to 20 L5: ×basic L6: 2-step L7: 3-step L8: real exam
// =============================================================
export function genMath(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  // Word problems start at L4
  if (L >= 4 && Math.random() < (L >= 6 ? 0.7 : 0.4)) return genWordProblem(L);

  // Pure arithmetic
  let op: string, a: number, b: number, ans: number;
  if (L === 1) { op = '+'; a = rand(1, 2); b = 1; }
  else if (L === 2) { op = '+'; a = rand(1, 4); b = rand(1, 3); }
  else if (L === 3) { op = pick(['+', '-']); a = rand(1, 9); b = rand(1, 6); }
  else if (L === 4) { op = pick(['+', '-']); a = rand(5, 20); b = rand(2, 10); }
  else if (L === 5) { op = pick(['+', '-', '×']); a = rand(2, 12); b = rand(2, 5); }
  else if (L === 6) { op = pick(['+', '-', '×']); a = rand(10, 30); b = rand(3, 9); }
  else if (L === 7) { op = pick(['+', '-', '×']); a = rand(15, 50); b = rand(5, 12); }
  else { op = pick(['+', '-', '×']); a = rand(20, 80); b = rand(5, 20); }

  if (op === '-' && b > a) [a, b] = [b, a];
  ans = op === '+' ? a + b : op === '-' ? a - b : a * b;

  const { options, correctIdx } = buildOptions(
    String(ans),
    [ans + 1, Math.max(0, ans - 1), ans + 2, ans + (op === '×' ? 2 : rand(2, 5))].map(String),
    () => String(Math.max(0, ans + rand(-3, 3) || 1))
  );
  return {
    prompt: `${a} ${op} ${b} = ?`,
    options,
    correct: correctIdx,
    hintContext: `חשב צעד אחר צעד`,
    dir: 'ltr',
  };
}

// Word problems — leveled. L4-5 = single step, L6 = 2-step, L7-8 = 3-step (real exam style)
function genWordProblem(L: number): MCQ {
  const easy: Array<() => MCQ> = [
    // L4: simple counting
    () => {
      const a = rand(1, 5), b = rand(1, 5);
      const ans = a + b;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [ans + 1, ans + 2, a, b].filter((n) => n > 0 && n !== ans).map(String),
        () => String(ans + rand(1, 4))
      );
      return {
        prompt: `יש לי ${a} תפוחים וקיבלתי עוד ${b}. כמה תפוחים יש לי עכשיו?`,
        options, correct: correctIdx,
        hintContext: `ספור את כל התפוחים`, dir: 'rtl',
      };
    },
    // L4: simple sharing
    () => {
      const each = rand(2, 5);
      const kids = pick([2, 3, 4]);
      const total = each * kids;
      const { options, correctIdx } = buildOptions(
        String(each),
        [each + 1, each + 2, total - kids, kids].filter((n) => n > 0 && n !== each).map(String),
        () => String(each + rand(1, 4))
      );
      return {
        prompt: `${kids} ילדים חולקים ${total} סוכריות בשווה. כמה כל ילד מקבל?`,
        options, correct: correctIdx,
        hintContext: `חלק שווה בשווה`, dir: 'rtl',
      };
    },
  ];

  const medium: Array<() => MCQ> = [
    // L6: 2-step money
    () => {
      const wallet = rand(20, 60);
      const qty = rand(2, 3);
      const itemPrice = rand(3, Math.floor((wallet - 1) / qty));
      const ans = wallet - itemPrice * qty;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [ans + itemPrice, wallet - itemPrice, ans + qty, ans + 5].filter((n) => n >= 0 && n !== ans).map(String),
        () => String(Math.max(0, ans + rand(1, 10)))
      );
      return {
        prompt: `יש לי ${wallet} ₪. אני קונה ${qty} משחקים בעלות של ${itemPrice} ₪ כל אחד. כמה כסף יישאר לי?`,
        options, correct: correctIdx,
        hintContext: `קודם חשב כמה עולים ${qty} משחקים, ואז חסר`, dir: 'rtl',
      };
    },
    // L6: change over time
    () => {
      const start = rand(5, 20);
      const added = rand(3, 10);
      const removed = rand(2, Math.min(start + added - 1, 8));
      const ans = start + added - removed;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [start + added, ans + removed, ans + 2, ans + 1].filter((n) => n >= 0 && n !== ans).map(String),
        () => String(Math.max(0, ans + rand(1, 5)))
      );
      return {
        prompt: `בכיתה היו ${start} ילדים. הגיעו עוד ${added}, ואז ${removed} הלכו הביתה. כמה נשארו?`,
        options, correct: correctIdx,
        hintContext: `קודם הוסף, ואחר כך חסר`, dir: 'rtl',
      };
    },
    // L6: time/duration
    () => {
      const min = pick([10, 15, 20, 30, 45]);
      const total = min + rand(5, 30);
      const { options, correctIdx } = buildOptions(
        String(total),
        [total + 5, total - 5, total + 10, min].filter((n) => n > 0 && n !== total).map(String),
        () => String(total + rand(1, 10))
      );
      return {
        prompt: `דנה התאמנה ${min} דקות בבוקר ועוד ${total - min} דקות בערב. כמה דקות בסך הכל?`,
        options, correct: correctIdx,
        hintContext: `חבר את שתי האימונים`, dir: 'rtl',
      };
    },
  ];

  const hard: Array<() => MCQ> = [
    // L7-8: 3-step shopping (from sim 1 q6)
    () => {
      const sweets = rand(2, 4);
      const sweetPrice = rand(2, 5);
      const drink = rand(3, 8);
      const sandwich = rand(10, 20);
      const ans = sweets * sweetPrice + drink + sandwich;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [ans + 5, ans - 5, ans + 10, ans - 2].filter((n) => n > 0 && n !== ans).map(String),
        () => String(ans + rand(1, 10))
      );
      return {
        prompt: `שרון קנתה בדרך לבית הספר ${sweets} סוכריות, וכל סוכריה עלתה ${sweetPrice} שקלים. בבית הספר היא קנתה פחית מיץ ב-${drink} שקלים, ובדרך חזרה כריך ב-${sandwich} שקלים. כמה כסף הוציאה שרון?`,
        options, correct: correctIdx,
        hintContext: `חשב את עלות הסוכריות, ואז הוסף את המיץ והכריך`, dir: 'rtl',
      };
    },
    // L7-8: ages — from sim 1 q10
    () => {
      const childAge = rand(5, 8);
      const momPlus = rand(20, 30);
      const dadMinus = rand(2, 5);
      const dadAge = childAge + momPlus - dadMinus;
      const { options, correctIdx } = buildOptions(
        String(dadAge),
        [dadAge + 1, dadAge - 1, childAge + momPlus, dadAge + dadMinus].filter((n) => n > 0 && n !== dadAge).map(String),
        () => String(dadAge + rand(1, 5))
      );
      const name = pick(['רועי', 'נועה', 'יואב', 'מיכל']);
      return {
        prompt: `${name} בן ${childAge}. אמא של ${name} גדולה מ${name} ב-${momPlus} שנים. אבא של ${name} קטן מאמא של ${name} ב-${dadMinus} שנים. בן כמה אבא של ${name}?`,
        options, correct: correctIdx,
        hintContext: `קודם חשב בן כמה אמא, ואז חסר את ההפרש לאבא`, dir: 'rtl',
      };
    },
    // L7-8: division with remainder context (sim 5 q2)
    () => {
      const perBottle = rand(20, 50);
      const bottles = rand(2, 5);
      const picked = perBottle * bottles + rand(1, perBottle - 1);
      const { options, correctIdx } = buildOptions(
        String(bottles),
        [bottles + 1, bottles - 1, bottles + 2, picked - perBottle].filter((n) => n > 0 && n !== bottles).map(String),
        () => String(bottles + rand(1, 3))
      );
      return {
        prompt: `להכנת בקבוק קטשופ מלא דרושות ${perBottle} עגבניות. עומרי קטף ${picked} עגבניות. כמה בקבוקי קטשופ מלאים עומרי יכול להכין?`,
        options, correct: correctIdx,
        hintContext: `חלק את מספר העגבניות במספר שדרוש לבקבוק אחד`, dir: 'rtl',
      };
    },
    // L7-8: total fruits (sim 1 q5)
    () => {
      const orangeTrees = rand(2, 4);
      const lemonTrees = rand(3, 6);
      const orangesPerTree = rand(5, 10);
      const lemonsPerTree = rand(4, 8);
      const ans = orangeTrees * orangesPerTree + lemonTrees * lemonsPerTree;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [ans + 5, ans - 5, ans + 10, ans - 10].filter((n) => n > 0 && n !== ans).map(String),
        () => String(ans + rand(1, 10))
      );
      const name = pick(['אביתר', 'יואב', 'מיה', 'תמר']);
      return {
        prompt: `בגינה של ${name} יש ${orangeTrees} עצי תפוז ו-${lemonTrees} עצי לימון. על כל עץ תפוז יש ${orangesPerTree} תפוזים, ועל כל עץ לימון יש ${lemonsPerTree} לימונים. כמה פירות יש בגינה?`,
        options, correct: correctIdx,
        hintContext: `כפול × עצי תפוז ב-תפוזים, כפול × עצי לימון ב-לימונים, ואז חבר`, dir: 'rtl',
      };
    },
  ];

  if (L <= 5) return pick(easy)();
  if (L <= 6) return pick(medium)();
  return pick(hard)();
}

// =============================================================
// READING comprehension — gated to age 6+
// =============================================================
type Passage = { text: string; q: string; options: string[]; correct: number; hint: string; minLevel: number };
const PASSAGES: Passage[] = [
  {
    text: 'דנה הלכה לפארק עם הכלב שלה רקס. בפארק הם פגשו את שירה ואת הכלב שלה לולה. הילדות שיחקו יחד עד שהשמש התחילה לרדת.',
    q: 'מי הם רקס ולולה?',
    options: ['ילדות', 'כלבים', 'הורים', 'חתולים'],
    correct: 1,
    hint: 'קרא שוב את המשפט הראשון',
    minLevel: 4,
  },
  {
    text: 'יואב אוהב לקרוא ספרים על חלל. בכל ערב הוא קורא פרק לפני השינה. אמא שלו קנתה לו ספר חדש על הירח.',
    q: 'על מה הספר החדש של יואב?',
    options: ['חיות', 'הירח', 'ספורט', 'אוכל'],
    correct: 1,
    hint: 'מה אמא קנתה לו?',
    minLevel: 4,
  },
  {
    text: 'בכל יום ראשון מיכל הולכת לחוג ציור. בחוג היא לומדת לצייר עם פסטל. בסוף השנה תהיה תערוכה של כל הציורים שלה ושל הילדים האחרים.',
    q: 'מה מיכל לומדת בחוג?',
    options: ['לצייר עם פסטל', 'לפסל', 'לרקוד', 'לשיר'],
    correct: 0,
    hint: 'הסתכל במשפט השני',
    minLevel: 5,
  },
  {
    text: 'הציפורים נודדות לאזורים חמים בחורף. הן יוצאות לדרך ארוכה ומסוכנת. רובן חוזרות באביב כדי לבנות קנים ולהטיל ביצים.',
    q: 'מתי הציפורים נודדות?',
    options: ['בקיץ', 'באביב', 'בחורף', 'בסתיו'],
    correct: 2,
    hint: 'בא בתחילת הפסקה',
    minLevel: 6,
  },
];

export function genReading(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  const eligible = PASSAGES.filter((p) => p.minLevel <= L);
  const p = pick(eligible.length ? eligible : PASSAGES);
  return {
    prompt: `${p.text}\n\n${p.q}`,
    options: [...p.options],
    correct: p.correct,
    hintContext: p.hint,
    dir: 'rtl',
  };
}

// =============================================================
// SYNONYMS — new game (verbal, age 5+)
// =============================================================
type SynonymPair = { word: string; syn: string; distractors: string[]; minLevel: number };
const SYNONYMS: SynonymPair[] = [
  { word: 'גדול', syn: 'ענק', distractors: ['קטן', 'נמוך', 'דק'], minLevel: 3 },
  { word: 'שמח', syn: 'מאושר', distractors: ['עצוב', 'כועס', 'עייף'], minLevel: 3 },
  { word: 'יפה', syn: 'מקסים', distractors: ['מכוער', 'גדול', 'חכם'], minLevel: 4 },
  { word: 'מהיר', syn: 'זריז', distractors: ['איטי', 'כבד', 'גדול'], minLevel: 5 },
  { word: 'חכם', syn: 'נבון', distractors: ['טיפש', 'גבוה', 'חזק'], minLevel: 5 },
  { word: 'קשה', syn: 'מסובך', distractors: ['קל', 'פשוט', 'נעים'], minLevel: 6 },
  // From sim
  { word: 'שיבה', syn: 'זקנה', distractors: ['ילדות', 'נעורים', 'בגרות'], minLevel: 7 },
  { word: 'סלידה', syn: 'רתיעה', distractors: ['חיבה', 'אהבה', 'משיכה'], minLevel: 7 },
  { word: 'משויף', syn: 'חלק', distractors: ['מחוספס', 'מעוקם', 'משופע'], minLevel: 8 },
  { word: 'כריה', syn: 'חפירה', distractors: ['קריאה', 'משיכה', 'קליעה'], minLevel: 8 },
];

export function genSynonym(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  const eligible = SYNONYMS.filter((s) => s.minLevel <= L);
  const q = pick(eligible);
  const options = shuffle([q.syn, ...q.distractors]);
  return {
    prompt: `איזו מילה יש לה משמעות דומה ל-"${q.word}"?`,
    options,
    correct: options.indexOf(q.syn),
    hintContext: `חפש את המילה שמבטאת את אותו רעיון`,
    dir: 'rtl',
  };
}

// =============================================================
// IDIOMS — Hebrew expressions (age 6+, real exam content)
// =============================================================
type Idiom = { phrase: string; meaning: string; distractors: string[]; minLevel: number };
const IDIOMS: Idiom[] = [
  { phrase: 'הבל הבלים', meaning: 'שטויות, דברים בטלים', distractors: ['רוחות קרות', 'סיפורים היסטוריים', 'בני אדם'], minLevel: 6 },
  { phrase: 'אליה וקוץ בה', meaning: 'דבר טוב שיש בו גם פגם', distractors: ['חדירת קוץ לרגל', 'תקיפת אדם עם קוץ', 'כתר עשוי קוצים'], minLevel: 7 },
  { phrase: 'אין כוחו אלא בפיו', meaning: 'מדבר הרבה אבל לא עושה', distractors: ['אדם חזק פיזית', 'ילד שצועק', 'אכלן גדול'], minLevel: 7 },
  { phrase: 'אין הביישן למד ואין הקפדן מלמד', meaning: 'בישנות מפריעה ללמידה וקפדנות מפריעה להוראה', distractors: ['אסור ללמד ביישנים', 'קפדנים לא צריכים ללמד', 'ביישנים לא יודעים כלום'], minLevel: 8 },
];

export function genIdiom(level: number, age: number): MCQ {
  const L = cappedLevel(level, age);
  const eligible = IDIOMS.filter((i) => i.minLevel <= L);
  if (!eligible.length) return genSynonym(level, age); // fallback for too-young
  const q = pick(eligible);
  const options = shuffle([q.meaning, ...q.distractors]);
  return {
    prompt: `מה משמעות הביטוי "${q.phrase}"?`,
    options,
    correct: options.indexOf(q.meaning),
    hintContext: `חפש את הפירוש הסביר ביותר`,
    dir: 'rtl',
  };
}

// =============================================================
// MAIN dispatcher
// =============================================================
export function generate(gameId: string, level: number, age: number = 6): MCQ {
  switch (gameId) {
    case 'pattern': return genPattern(level, age);
    case 'odd': return genOdd(level, age);
    case 'sequence': return genSequence(level, age);
    case 'analogy': return genAnalogy(level, age);
    case 'memory': return genMemory(level, age);
    case 'math': return genMath(level, age);
    case 'reading': return genReading(level, age);
    case 'synonym': return genSynonym(level, age);
    case 'idiom': return genIdiom(level, age);
    default: return genPattern(level, age);
  }
}
