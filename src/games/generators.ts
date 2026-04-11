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
// Parents can bypass this by setting levelOverride in the profile.
const ageCap = (age: number): number => {
  if (age <= 3) return 2;
  if (age === 4) return 3;
  if (age === 5) return 4;
  if (age === 6) return 6;
  if (age === 7) return 7;
  return 8;
};
// If `bypassAgeCap` is true (parent override active), level is used as-is.
const cappedLevel = (level: number, age: number, bypassAgeCap = false) =>
  bypassAgeCap ? level : Math.min(level, ageCap(age));

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

export function genPattern(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
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
    dir: 'ltr',
  };
}

// =============================================================
// ODD ONE OUT — leveled by category complexity
// Level 1-2: visual emojis. Level 3-4: simple words. Level 5-6: fine distinctions. Level 7-8: cultural/specific.
// =============================================================
type OddGroup = { items: string[]; odd: string; cat: string; minLevel: number };
const ODD_GROUPS: OddGroup[] = [
  // L1-2: visual
  { items: ['🍎', '🍌', '🍇'], odd: '🚗', cat: 'פֵּרוֹת', minLevel: 1 },
  { items: ['🐶', '🐱', '🐮'], odd: '🚲', cat: 'בַּעֲלֵי חַיִּים', minLevel: 1 },
  { items: ['🔴', '🔵', '🟢'], odd: '⬛', cat: 'צִבְעֵי הַקֶּשֶׁת', minLevel: 1 },
  // L3-4: simple words
  { items: ['כֶּלֶב', 'חָתוּל', 'סוּס', 'פָּרָה'], odd: 'אוֹטוֹבּוּס', cat: 'בַּעֲלֵי חַיִּים', minLevel: 3 },
  { items: ['תַּפּוּחַ', 'בָּנָנָה', 'עֲנָבִים', 'תּוּת'], odd: 'כִּסֵּא', cat: 'פֵּרוֹת', minLevel: 3 },
  { items: ['אָדֹם', 'כָּחֹל', 'יָרֹק', 'צָהֹב'], odd: 'מְרֻבָּע', cat: 'צְבָעִים', minLevel: 3 },
  { items: ['עִפָּרוֹן', 'עֵט', 'מַחַק', 'מַחְבֶּרֶת'], odd: 'תַּפּוּז', cat: 'כְּלֵי כְּתִיבָה', minLevel: 3 },
  { items: ['יָד', 'רֶגֶל', 'רֹאשׁ', 'אֹזֶן'], odd: 'שֻׁלְחָן', cat: 'אֵיבְרֵי גּוּף', minLevel: 3 },
  // L5-6: fine distinctions
  { items: ['אוֹפַנַּיִם', 'מְכוֹנִית', 'אוֹטוֹבּוּס', 'מַשָּׂאִית'], odd: 'עֵץ', cat: 'כְּלֵי תַּחְבּוּרָה', minLevel: 5 },
  { items: ['רוֹפֵא', 'מוֹרֶה', 'נֶהָג', 'טַבָּח'], odd: 'מְקָרֵר', cat: 'מִקְצוֹעוֹת', minLevel: 5 },
  { items: ['חֹרֶף', 'אָבִיב', 'קַיִץ', 'סְתָו'], odd: 'יוֹם שֵׁנִי', cat: 'עוֹנוֹת הַשָּׁנָה', minLevel: 5 },
  // L7-8: real exam-style
  { items: ['חֵיפָה', 'יְרוּשָׁלַיִם', 'בְּאֵר שֶׁבַע'], odd: 'שְׂדֵה בּוֹקֵר', cat: 'עָרִים בְּיִשְׂרָאֵל', minLevel: 7 },
  { items: ['אֲבוֹקָדוֹ'], odd: 'תַּפּוּחַ-אֲדָמָה', cat: 'פְּרִי (הַשְּׁאָר יָרָק)', minLevel: 7 },
  { items: ['יַתּוּשׁ', 'חַרְגּוֹל', 'נְמָלָה'], odd: 'סוּס יְאוֹר', cat: 'חֲרָקִים', minLevel: 7 },
  { items: ['יָוָן', 'יִשְׂרָאֵל', 'יַרְדֵּן'], odd: 'אִיטַלְיָה', cat: 'מְדִינוֹת בַּמִּזְרָח הַתִּיכוֹן', minLevel: 7 },
];

export function genOdd(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const eligible = ODD_GROUPS.filter((g) => g.minLevel <= L);
  const g = pick(eligible);
  const items = g.items.length >= 3 ? g.items.slice(0, 3) : g.items;
  // For L7+ entries that have only 1 item in items[], pad with cat-like distractors? simpler: ensure groups have 3
  const allOptions = shuffle([...items, g.odd]);
  return {
    prompt: items.length === 1
      ? `אֵיזֶה מֵהַבָּאִים שַׁיָּךְ לַקְּבוּצָה: ${items[0]}?`
      : 'אֵיזֶה מֵהַבָּאִים יוֹצֵא דֹּפֶן?',
    options: allOptions,
    correct: allOptions.indexOf(g.odd),
    hintContext: `שָׁלוֹשׁ מֵהַמִּלִּים הֵן ${g.cat}`,
    dir: 'rtl',
  };
}

// =============================================================
// SEQUENCE — number sequence
// L1: count 1,2,? L2: 1,2,3,? L3: +1,+2 L4: +2,+5 L5: +3 L6-7: +5,+10 L8: complex
// =============================================================
export function genSequence(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
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
    hintContext: `בְּכָל פַּעַם מוֹסִיפִים ${step}`,
    dir: 'ltr',
  };
}

// =============================================================
// ANALOGIES — leveled
// =============================================================
type Analogy = { a: string; b: string; c: string; d: string; distractors: string[]; minLevel: number };
const ANALOGIES: Analogy[] = [
  { a: 'חָתוּל', b: 'חֲתַלְתּוּל', c: 'כֶּלֶב', d: 'גּוּר', distractors: ['עַכְבָּר', 'פִּיל', 'דָּג'], minLevel: 3 },
  { a: 'יוֹם', b: 'לַיְלָה', c: 'שֶׁמֶשׁ', d: 'יָרֵחַ', distractors: ['כּוֹכָב', 'עָנָן', 'שָׁמַיִם'], minLevel: 3 },
  { a: 'צִפּוֹר', b: 'עָפָה', c: 'דָּג', d: 'שׂוֹחֶה', distractors: ['רָץ', 'קוֹפֵץ', 'הוֹלֵךְ'], minLevel: 3 },
  { a: 'חַם', b: 'קַר', c: 'גָּדוֹל', d: 'קָטָן', distractors: ['אָרֹךְ', 'עָגֹל', 'כָּבֵד'], minLevel: 3 },
  { a: 'רוֹפֵא', b: 'בֵּית חוֹלִים', c: 'מוֹרֶה', d: 'בֵּית סֵפֶר', distractors: ['פַּארְק', 'חוֹף', 'מִסְעָדָה'], minLevel: 4 },
  { a: 'אֹזֶן', b: 'שְׁמִיעָה', c: 'עַיִן', d: 'רְאִיָּה', distractors: ['רֵיחַ', 'טַעַם', 'מַגָּע'], minLevel: 5 },
  { a: 'גּוֹזָל', b: 'צִפּוֹר', c: 'גּוּר', d: 'כֶּלֶב', distractors: ['חָתוּל', 'אַרְיֵה', 'דֹּב'], minLevel: 5 },
  { a: 'נַגָּר', b: 'עֵץ', c: 'צוֹרֵף', d: 'זָהָב', distractors: ['נְיָר', 'בַּד', 'אֶבֶן'], minLevel: 7 },
  { a: 'טוּנָה', b: 'דָּג', c: 'נַרְקִיס', d: 'פֶּרַח', distractors: ['חַיָּה', 'יְסוֹד', 'אֶבֶן'], minLevel: 7 },
  // From "גאוני" PDF — analogies (יחסי מילים)
  { a: 'דְּבוֹרָה', b: 'כַּוֶּרֶת', c: 'חֲזִיר', d: 'דִּיר', distractors: ['דְּבַשׁ', 'נְמָלָה', 'יָפֶה'], minLevel: 5 },
  { a: 'שׁוֹקֵעַ', b: 'צָף', c: 'לוֹחֵשׁ', d: 'צוֹעֵק', distractors: ['בָּהִיר', 'שַׁחַק', 'תַּחְתִּית'], minLevel: 6 },
  { a: 'עָמִית', b: 'רֵעַ', c: 'מַתָּנָה', d: 'דּוֹרוֹן', distractors: ['מִלָּה', 'אִישׁ', 'שָׁחֹר'], minLevel: 6 },
  { a: 'יוֹנָה', b: 'הוֹמָה', c: 'זְאֵב', d: 'מְיַלֵּל', distractors: ['זְבוּב', 'חֲמוֹר', 'גָּמָל'], minLevel: 6 },
  { a: 'חֻלְצָה', b: 'בַּד', c: 'מַרְאָה', d: 'זְכוּכִית', distractors: ['מַדָּף', 'טוּשׁ', 'עִפָּרוֹן'], minLevel: 6 },
  // From מבחן 2025 — verbal relationship "action : doer"
  { a: 'לָעוּף', b: 'נַחֲלִיאֵלִי', c: 'לִשְׁאֹג', d: 'אַרְיֵה', distractors: ['לָצוּד', 'לָרוּץ', 'לֶאֱכֹל'], minLevel: 6 },
  // category : type
  { a: 'אֲפֻדָּה', b: 'בֶּגֶד', c: 'מַבְרֵג', d: 'כְּלִי עֲבוֹדָה', distractors: ['גּוּפִיָּה', 'מִשְׁפָּחָה', 'צֶמֶר'], minLevel: 7 },
];

export function genAnalogy(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const eligible = ANALOGIES.filter((q) => q.minLevel <= L);
  const q = pick(eligible);
  const options = shuffle([q.d, ...q.distractors]);
  return {
    prompt: `${q.a} : ${q.b} :: ${q.c} : ?`,
    options,
    correct: options.indexOf(q.d),
    hintContext: `מָה הַיַּחַס בֵּין ${q.a} לְ-${q.b}?`,
    dir: 'rtl',
  };
}

// =============================================================
// MEMORY — sequence length scales with age
// =============================================================
export function genMemory(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
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
    prompt: `זְכֹר: ${seq.join(' ')}  •  מָה הָיָה בַּמָּקוֹם הַ-${idx + 1}?`,
    options,
    correct: correctIdx,
    hintContext: `סְפֹר מִשְּׂמֹאל לְיָמִין`,
    dir: 'ltr',
  };
}

// =============================================================
// MATH — leveled arithmetic + word problems (ages 2-8)
// L1: 1+1, count L2: +up to 5 L3: +/- up to 10 L4: +/- up to 20 L5: ×basic L6: 2-step L7: 3-step L8: real exam
// =============================================================
export function genMath(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
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
    hintContext: `חַשֵּׁב צַעַד אַחַר צַעַד`,
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
        prompt: `יֵשׁ לִי ${a} תַּפּוּחִים וְקִבַּלְתִּי עוֹד ${b}. כַּמָּה תַּפּוּחִים יֵשׁ לִי עַכְשָׁיו?`,
        options, correct: correctIdx,
        hintContext: `סְפֹר אֶת כָּל הַתַּפּוּחִים`, dir: 'rtl',
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
        prompt: `${kids} יְלָדִים חוֹלְקִים ${total} סֻכָּרִיּוֹת בְּשָׁוֶה. כַּמָּה כָּל יֶלֶד מְקַבֵּל?`,
        options, correct: correctIdx,
        hintContext: `חַלֵּק שָׁוֶה בְּשָׁוֶה`, dir: 'rtl',
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
        prompt: `יֵשׁ לִי ${wallet} ₪. אֲנִי קוֹנֶה ${qty} מִשְׂחָקִים בְּעָלוּת שֶׁל ${itemPrice} ₪ כָּל אֶחָד. כַּמָּה כֶּסֶף יִישָּׁאֵר לִי?`,
        options, correct: correctIdx,
        hintContext: `קֹדֶם חַשֵּׁב כַּמָּה עוֹלִים ${qty} מִשְׂחָקִים, וְאָז חַסֵּר`, dir: 'rtl',
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
        prompt: `בַּכִּתָּה הָיוּ ${start} יְלָדִים. הִגִּיעוּ עוֹד ${added}, וְאָז ${removed} הָלְכוּ הַבַּיְתָה. כַּמָּה נִשְׁאֲרוּ?`,
        options, correct: correctIdx,
        hintContext: `קֹדֶם הוֹסֵף, וְאַחַר כָּךְ חַסֵּר`, dir: 'rtl',
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

  // Additional templates inspired by real exam content
  const extra: Array<() => MCQ> = [
    // Time / duration ending — like "lesson started 16:50, lasted 45 min"
    () => {
      const startH = rand(2, 5);
      const startM = pick([0, 15, 30, 45]);
      const dur = pick([30, 45, 60, 75, 90]);
      const totalM = startH * 60 + startM + dur;
      const endH = Math.floor(totalM / 60) % 12 || 12;
      const endM = totalM % 60;
      const fmt = (h: number, m: number) => `${h}:${m.toString().padStart(2, '0')}`;
      const ans = fmt(endH, endM);
      const distractors = [
        fmt(endH, (endM + 5) % 60),
        fmt(endH - 1, endM),
        fmt(endH, Math.max(0, endM - 10)),
      ];
      const { options, correctIdx } = buildOptions(ans, distractors, () => fmt(endH + rand(0, 1), rand(0, 59)));
      return {
        prompt: `שִׁעוּר הִתְחִיל בְּשָׁעָה ${fmt(startH, startM)} וְנִמְשַׁךְ ${dur} דַּקּוֹת. בְּאֵיזוֹ שָׁעָה הִסְתַּיֵּם הַשִּׁעוּר?`,
        options, correct: correctIdx,
        hintContext: `הוֹסֵף אֶת מִשְׁךְ הַשִּׁעוּר לִשְׁעַת הַהַתְחָלָה`, dir: 'rtl',
      };
    },
    // "Twice as many" — doubling pattern
    () => {
      const day1 = rand(2, 8);
      const day2 = day1 * 2;
      const total = day1 + day2;
      const { options, correctIdx } = buildOptions(
        String(total),
        [String(day1 * 2), String(day1 + 1), String(day2 + 1), String(day1 * 3)].filter((v) => v !== String(total)),
        () => String(total + rand(1, 5))
      );
      const name = pick(['הַרְאֵל', 'דָּנָה', 'יוֹאָב', 'מַאיָה']);
      return {
        prompt: `${name} הָלַךְ לְחוּג כַּדּוּרְסַל בְּיוֹם שְׁלִישִׁי וּבְיוֹם חֲמִישִׁי. בְּיוֹם שְׁלִישִׁי קָלַע ${day1} סַלִּים, וּבְיוֹם חֲמִישִׁי קָלַע פִּי שְׁנַיִם יוֹתֵר סַלִּים מֵאֲשֶׁר בְּיוֹם שְׁלִישִׁי. כַּמָּה סַלִּים קָלַע בְּסַךְ הַכֹּל הַשָּׁבוּעַ?`,
        options, correct: correctIdx,
        hintContext: `פִּי שְׁנַיִם = כְּפוֹל שְׁתַּיִם`, dir: 'rtl',
      };
    },
    // "One less" / "more than"
    () => {
      const a = rand(3, 8);
      const b = rand(1, 5);
      const c = a - 1;
      const ans = a + b + c;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [String(ans - 1), String(ans + 1), String(a + b), String(ans - 2)].filter((v) => v !== String(ans) && Number(v) > 0),
        () => String(ans + rand(1, 5))
      );
      return {
        prompt: `אִמָּא הֵכִינָה פִּיצָה. עִדּוֹ אָכַל ${a} מְשֻׁלָּשִׁים, יוֹנָתָן אָכַל ${b} מְשֻׁלָּשִׁים, וְנֹעַם אָכַל מְשֻׁלָּשׁ אֶחָד פָּחוֹת מֵעִדּוֹ. כַּמָּה מְשֻׁלְּשֵׁי פִּיצָה אָכְלוּ הַחֲבֵרִים יַחְדָּיו?`,
        options, correct: correctIdx,
        hintContext: `קֹדֶם חַשֵּׁב כַּמָּה אָכַל נֹעַם, וְאָז חַבֵּר הַכֹּל`, dir: 'rtl',
      };
    },
    // Hourly wage
    () => {
      const rate = pick([5, 6, 7, 8, 10]);
      const hours = rand(2, 9);
      const ans = rate * hours;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [String(rate + hours), String(ans + rate), String(ans - rate), String(rate * (hours + 1))].filter((v) => v !== String(ans)),
        () => String(ans + rand(1, 10))
      );
      return {
        prompt: `מִיכָאֵלָה עוֹבֶדֶת כְּמֶלְצָרִית בְּבֵית קָפֶה, וּמַרְוִיחָה ${rate} שְׁקָלִים לִשְׁעַת עֲבוֹדָה. מָה יִהְיֶה שְׂכָרָהּ לְאַחַר ${hours} שְׁעוֹת עֲבוֹדָה?`,
        options, correct: correctIdx,
        hintContext: `כְּפוֹל שְׂכָר שָׁעָה בְּמִסְפַּר הַשָּׁעוֹת`, dir: 'rtl',
      };
    },
    // Lose then gain — collectible cards (from machon-noam 2025)
    () => {
      const start = rand(15, 30);
      const lost = rand(8, start - 5);
      const gained = rand(3, 12);
      const ans = start - lost + gained;
      const { options, correctIdx } = buildOptions(
        String(ans),
        [String(start - lost), String(start + gained), String(ans - 1), String(ans + 3)].filter((v) => v !== String(ans) && Number(v) > 0),
        () => String(Math.max(1, ans + rand(1, 5)))
      );
      const name = pick(['רֹון', 'תָּמָר', 'יוֹאָב', 'מַאיָה']);
      return {
        prompt: `לְפְנֵי הַהַפְסָקָה הָיוּ לְ${name} ${start} גּוֹגוֹאִים. בַּהַפְסָקָה הָרִאשׁוֹנָה הִפְסִיד ${lost} גּוֹגוֹאִים, אַךְ בַּהַפְסָקָה הַשְּׁנִיָּה הִרְוִיחַ ${gained} גּוֹגוֹאִים. כַּמָּה גּוֹגוֹאִים נִשְׁאֲרוּ לְ${name} בְּסוֹף הַהַפְסָקָה הַשְּׁנִיָּה?`,
        options, correct: correctIdx,
        hintContext: `קֹדֶם חַסֵּר מָה שֶׁהִפְסִיד, וְאָז הוֹסֵף מָה שֶׁהִרְוִיחַ`, dir: 'rtl',
      };
    },
    // Rate per time (from machon-noam 2025)
    () => {
      const perUnit = pick([2, 3, 4, 5]);
      const baseSec = 5;
      const targetSec = 10;
      const ans = perUnit * baseSec * (targetSec / baseSec);
      const { options, correctIdx } = buildOptions(
        String(ans),
        [String(perUnit * baseSec), String(ans + perUnit), String(ans - 2), String(perUnit + targetSec)].filter((v) => v !== String(ans) && Number(v) > 0),
        () => String(ans + rand(1, 5))
      );
      return {
        prompt: `רוֹנִי קוֹפֶצֶת בְּדַלְגִּית. בְּ-${baseSec} שְׁנִיּוֹת רוֹנִי קוֹפֶצֶת ${perUnit * baseSec} פְּעָמִים. כַּמָּה פְּעָמִים תִּקְפֹּץ רוֹנִי בְּ-${targetSec} שְׁנִיּוֹת?`,
        options, correct: correctIdx,
        hintContext: `אִם זֶה קוֹרֶה כְּפוֹל זְמַן, הַקְּפִיצוֹת גַּם כְּפוּלוֹת`, dir: 'rtl',
      };
    },
    // Change from a bill
    () => {
      const bill = pick([10, 20, 50]);
      const change = rand(1, bill - 2);
      const price = bill - change;
      const { options, correctIdx } = buildOptions(
        String(price),
        [String(change), String(bill), String(price + 1), String(price - 1)].filter((v) => v !== String(price) && Number(v) > 0),
        () => String(price + rand(1, 5))
      );
      return {
        prompt: `יָעֵל קָנְתָה אַרְטִיק בַּמַּכֹּלֶת. הִיא נָתְנָה לַמּוֹכֵר שְׁטָר שֶׁל ${bill} שְׁקָלִים, וְקִבְּלָה עֹדֶף שֶׁל ${change} שְׁקָלִים. מָה הָיָה מְחִירוֹ שֶׁל הָאַרְטִיק?`,
        options, correct: correctIdx,
        hintContext: `מָה שֶׁשִּׁלַּמְתִּי פָּחוֹת הָעֹדֶף שֶׁקִּבַּלְתִּי`, dir: 'rtl',
      };
    },
  ];

  if (L <= 4) return pick(easy)();
  if (L === 5) return pick([...easy, ...extra])();
  if (L === 6) return pick([...medium, ...extra])();
  return pick([...hard, ...extra])();
}

// =============================================================
// READING comprehension — gated to age 6+
// =============================================================
type Passage = { text: string; q: string; options: string[]; correct: number; hint: string; minLevel: number };
const PASSAGES: Passage[] = [
  {
    text: 'דָּנָה הָלְכָה לַפַּארְק עִם הַכֶּלֶב שֶׁלָּהּ רֶקְס. בַּפַּארְק הֵם פָּגְשׁוּ אֶת שִׁירָה וְאֶת הַכֶּלֶב שֶׁלָּהּ לוּלָה. הַיְלָדוֹת שִׂחֲקוּ יַחַד עַד שֶׁהַשֶּׁמֶשׁ הִתְחִילָה לָרֶדֶת.',
    q: 'מִי הֵם רֶקְס וְלוּלָה?',
    options: ['יְלָדוֹת', 'כְּלָבִים', 'הוֹרִים', 'חֲתוּלִים'],
    correct: 1,
    hint: 'קְרָא שׁוּב אֶת הַמִּשְׁפָּט הָרִאשׁוֹן',
    minLevel: 4,
  },
  {
    text: 'יוֹאָב אוֹהֵב לִקְרֹא סְפָרִים עַל חָלָל. בְּכָל עֶרֶב הוּא קוֹרֵא פֶּרֶק לִפְנֵי הַשֵּׁנָה. אִמָּא שֶׁלּוֹ קָנְתָה לוֹ סֵפֶר חָדָשׁ עַל הַיָּרֵחַ.',
    q: 'עַל מָה הַסֵּפֶר הֶחָדָשׁ שֶׁל יוֹאָב?',
    options: ['חַיּוֹת', 'הַיָּרֵחַ', 'סְפּוֹרְט', 'אֹכֶל'],
    correct: 1,
    hint: 'מָה אִמָּא קָנְתָה לוֹ?',
    minLevel: 4,
  },
  {
    text: 'בְּכָל יוֹם רִאשׁוֹן מִיכַל הוֹלֶכֶת לְחוּג צִיּוּר. בַּחוּג הִיא לוֹמֶדֶת לְצַיֵּר עִם פַּסְטֶל. בְּסוֹף הַשָּׁנָה תִּהְיֶה תַּעֲרוּכָה שֶׁל כָּל הַצִּיּוּרִים שֶׁלָּהּ וְשֶׁל הַיְלָדִים הָאֲחֵרִים.',
    q: 'מָה מִיכַל לוֹמֶדֶת בַּחוּג?',
    options: ['לְצַיֵּר עִם פַּסְטֶל', 'לְפַסֵּל', 'לִרְקֹד', 'לָשִׁיר'],
    correct: 0,
    hint: 'הִסְתַּכֵּל בַּמִּשְׁפָּט הַשֵּׁנִי',
    minLevel: 5,
  },
  {
    text: 'הַצִּפֳּרִים נוֹדְדוֹת לָאֲזוֹרִים חַמִּים בַּחֹרֶף. הֵן יוֹצְאוֹת לְדֶרֶךְ אֲרֻכָּה וּמְסֻכֶּנֶת. רֻבָּן חוֹזְרוֹת בָּאָבִיב כְּדֵי לִבְנוֹת קִנִּים וּלְהָטִיל בֵּיצִים.',
    q: 'מָתַי הַצִּפֳּרִים נוֹדְדוֹת?',
    options: ['בַּקַּיִץ', 'בָּאָבִיב', 'בַּחֹרֶף', 'בַּסְּתָו'],
    correct: 2,
    hint: 'בָּא בִּתְחִלַּת הַפִּסְקָה',
    minLevel: 6,
  },
  // Inspired by official 2025 Ministry passage about carnivorous plants
  {
    text: 'יֵשׁ צְמָחִים שֶׁאוֹכְלִים חֲרָקִים. אֶחָד מֵהֶם הוּא הַטְּלָלִית. עַל הֶעָלִים שֶׁלָּהּ יֵשׁ טִיפּוֹת דְּבִיקוֹת שֶׁמַּבְרִיקוֹת בַּשֶּׁמֶשׁ. כְּשֶׁחֲרָק נוֹחֵת עַל הֶעָלֶה, הַטִּיפּוֹת לוֹכְדוֹת אוֹתוֹ.',
    q: 'מַדּוּעַ נִקְרָאִים צְמָחִים מֵהַסּוּג הַזֶּה "טוֹרְפִים"?',
    options: ['כִּי יֵשׁ לָהֶם שִׁנַּיִם חַדּוֹת', 'כִּי הֵם אוֹכְלִים חֲרָקִים', 'כִּי הֵם גְּדוֹלִים מְאֹד', 'כִּי הֵם מַזִּיקִים לִבְנֵי אָדָם'],
    correct: 1,
    hint: 'הַמִּלָּה "טוֹרֵף" קְשׁוּרָה לְמַשֶּׁהוּ שֶׁאוֹכֵל בַּעֲלֵי חַיִּים',
    minLevel: 7,
  },
  {
    text: 'יוֹנָתָן לֹא אוֹהֵב לִישֹׁן. "שֵׁנָה זֶה בִּזְבּוּז זְמַן!" הוּא אוֹמֵר. אַבָּא וְאִמָּא חִיְּכוּ. בַּלַּיְלָה יוֹנָתָן הִסְתַּכֵּל מִן הַחַלּוֹן וְרָאָה יַנְשׁוּף עָף וְכוֹכָבִים נוֹצְצִים. כְּשֶׁהַשֶּׁמֶשׁ עָלְתָה הוּא חִיֵּךְ וְנִרְדַּם.',
    q: 'מָה יוֹנָתָן חָשַׁב בְּסוֹף הַסִּפּוּר?',
    options: ['שֶׁשֵּׁנָה זֶה בִּזְבּוּז זְמַן', 'שֶׁהַלַּיְלָה קָסוּם', 'שֶׁהַיּוֹם יוֹתֵר טוֹב', 'שֶׁהוּא רוֹצֶה לִישֹׁן הַרְבֵּה'],
    correct: 1,
    hint: 'מָה הוּא חָשַׁב בַּמִּשְׁפָּט הָאַחֲרוֹן?',
    minLevel: 7,
  },
];

export function genReading(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
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
  { word: 'גָּדוֹל', syn: 'עֲנָק', distractors: ['קָטָן', 'נָמוּךְ', 'דַּק'], minLevel: 3 },
  { word: 'שָׂמֵחַ', syn: 'מְאֻשָּׁר', distractors: ['עָצוּב', 'כּוֹעֵס', 'עָיֵף'], minLevel: 3 },
  { word: 'יָפֶה', syn: 'מַקְסִים', distractors: ['מְכֹעָר', 'גָּדוֹל', 'חָכָם'], minLevel: 4 },
  { word: 'מָהִיר', syn: 'זָרִיז', distractors: ['אִטִּי', 'כָּבֵד', 'גָּדוֹל'], minLevel: 5 },
  { word: 'חָכָם', syn: 'נָבוֹן', distractors: ['טִפֵּשׁ', 'גָּבוֹהַּ', 'חָזָק'], minLevel: 5 },
  { word: 'קָשֶׁה', syn: 'מְסֻבָּךְ', distractors: ['קַל', 'פָּשׁוּט', 'נָעִים'], minLevel: 6 },
  { word: 'שֵׂיבָה', syn: 'זִקְנָה', distractors: ['יַלְדוּת', 'נְעוּרִים', 'בַּגְרוּת'], minLevel: 7 },
  { word: 'סְלִידָה', syn: 'רְתִיעָה', distractors: ['חִבָּה', 'אַהֲבָה', 'מְשִׁיכָה'], minLevel: 7 },
  { word: 'מְשֻׁיָּף', syn: 'חָלָק', distractors: ['מְחֻסְפָּס', 'מְעֻקָּם', 'מְשֻׁפָּע'], minLevel: 8 },
  { word: 'כְּרִיָּה', syn: 'חֲפִירָה', distractors: ['קְרִיאָה', 'מְשִׁיכָה', 'קְלִיעָה'], minLevel: 8 },
];

export function genSynonym(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const eligible = SYNONYMS.filter((s) => s.minLevel <= L);
  const q = pick(eligible);
  const options = shuffle([q.syn, ...q.distractors]);
  return {
    prompt: `אֵיזוֹ מִלָּה יֵשׁ לָהּ מַשְׁמָעוּת דּוֹמָה לְ-"${q.word}"?`,
    options,
    correct: options.indexOf(q.syn),
    hintContext: `חַפֵּשׂ אֶת הַמִּלָּה שֶׁמְּבַטֵּאת אֶת אוֹתוֹ רַעְיוֹן`,
    dir: 'rtl',
  };
}

// =============================================================
// IDIOMS — Hebrew expressions (age 6+, real exam content)
// =============================================================
type Idiom = { phrase: string; meaning: string; distractors: string[]; minLevel: number };
const IDIOMS: Idiom[] = [
  { phrase: 'הֶבֶל הֲבָלִים', meaning: 'שְׁטוּיוֹת, דְּבָרִים בְּטֵלִים', distractors: ['רוּחוֹת קָרוֹת', 'סִפּוּרִים הִיסְטוֹרִיִּים', 'בְּנֵי אָדָם'], minLevel: 6 },
  { phrase: 'אַלְיָה וְקוֹץ בָּהּ', meaning: 'דָּבָר טוֹב שֶׁיֵּשׁ בּוֹ גַּם פְּגָם', distractors: ['חֲדִירַת קוֹץ לָרֶגֶל', 'תְּקִיפַת אָדָם עִם קוֹץ', 'כֶּתֶר עָשׂוּי קוֹצִים'], minLevel: 7 },
  { phrase: 'אֵין כֹּחוֹ אֶלָּא בְּפִיו', meaning: 'מְדַבֵּר הַרְבֵּה אֲבָל לֹא עוֹשֶׂה', distractors: ['אָדָם חָזָק פִיזִית', 'יֶלֶד שֶׁצּוֹעֵק', 'אַכְלָן גָּדוֹל'], minLevel: 7 },
  { phrase: 'אֵין הַבַּיְשָׁן לָמֵד וְאֵין הַקַּפְדָן מְלַמֵּד', meaning: 'בַּיְשָׁנוּת מַפְרִיעָה לִלְמִידָה וְקַפְדָנוּת מַפְרִיעָה לְהוֹרָאָה', distractors: ['אָסוּר לְלַמֵּד בַּיְשָׁנִים', 'קַפְדָנִים לֹא צְרִיכִים לְלַמֵּד', 'בַּיְשָׁנִים לֹא יוֹדְעִים כְּלוּם'], minLevel: 8 },
];

export function genIdiom(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const eligible = IDIOMS.filter((i) => i.minLevel <= L);
  if (!eligible.length) return genSynonym(level, age, bypass); // fallback for too-young
  const q = pick(eligible);
  const options = shuffle([q.meaning, ...q.distractors]);
  return {
    prompt: `מָה מַשְׁמָעוּת הַבִּטּוּי "${q.phrase}"?`,
    options,
    correct: options.indexOf(q.meaning),
    hintContext: `חַפֵּשׂ אֶת הַפֵּרוּשׁ הַסָּבִיר בְּיוֹתֵר`,
    dir: 'rtl',
  };
}

// =============================================================
// MISSING NUMBER — fill the blank in equation (math, age 6+)
// From official 2025 Ministry of Education exam — pure equation completion
// =============================================================
export function genMissingNumber(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const op = L <= 4 ? pick(['+', '-']) : pick(['+', '-', '×']);
  let a: number, b: number, ans: number;
  if (L <= 3) { a = rand(2, 9); b = rand(1, 5); }
  else if (L <= 5) { a = rand(10, 30); b = rand(2, 12); }
  else if (L <= 7) { a = rand(20, 60); b = rand(5, 20); }
  else { a = rand(40, 100); b = rand(10, 40); }

  if (op === '-' && b > a) [a, b] = [b, a];
  ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
  // Build "a OP ___ = ans" — solving for b
  const { options, correctIdx } = buildOptions(
    String(b),
    [String(b + 1), String(Math.max(1, b - 1)), String(b + 2), String(Math.max(1, b - 2))].filter((v) => v !== String(b)),
    () => String(Math.max(1, b + rand(-3, 3) || 1))
  );
  return {
    prompt: `${a} ${op} ___ = ${ans}\n\nאֵיזֶה מִסְפָּר חָסֵר?`,
    options,
    correct: correctIdx,
    hintContext: `הָפֵךְ אֶת הַתַּרְגִּיל: ${ans} ${op === '+' ? '−' : op === '−' ? '+' : '÷'} ${a}`,
    dir: 'rtl',
  };
}

// =============================================================
// PICTURE EQUATIONS — math riddles where pictures = numbers (level 4+)
// From official 2025 exam — "✿ + ✿ = 6, ✿ + ✿ + ⭐ = 14"
// =============================================================
export function genPictureEq(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const symbols = ['🌸', '⭐', '💎', '🔑', '🏠', '🚗', '🍎', '🎈'];
  const [s1, s2] = shuffle(symbols).slice(0, 2);
  // s1 has value v1, s2 has value v2 — solve for v2
  const v1 = L <= 4 ? rand(2, 5) : rand(3, 9);
  const v2 = L <= 4 ? rand(1, 6) : rand(2, 12);
  const eq1 = v1 + v1; // s1+s1 = 2v1
  const eq2 = v1 + v2; // s1+s2 = v1+v2
  const { options, correctIdx } = buildOptions(
    String(v2),
    [String(v2 + 1), String(Math.max(1, v2 - 1)), String(v2 + 2), String(v1)].filter((v) => v !== String(v2)),
    () => String(Math.max(1, v2 + rand(1, 5)))
  );
  return {
    prompt: `${s1} + ${s1} = ${eq1}\n${s1} + ${s2} = ${eq2}\n\nאֵיזֶה מִסְפָּר מַתְאִים לְ-${s2}?`,
    options,
    correct: correctIdx,
    hintContext: `קֹדֶם מָצָא אֶת הָעֵרֶךְ שֶׁל ${s1}, וְאָז חַסֵּר`,
    dir: 'rtl',
  };
}

// =============================================================
// SENTENCE COMPLETION — fill in the blanks (verbal, age 6+)
// =============================================================
type ClozeQ = {
  prompt: string;
  options: string[];
  correct: number;
  hint: string;
  minLevel: number;
};
const CLOZES: ClozeQ[] = [
  {
    prompt: 'דָּנִי מְאֹד ____. מָחָר חָל יוֹם הֻלַּדְתּוֹ, וְהוּא יְקַבֵּל הָמוֹן ____ מֵחֲבֵרָיו לַכִּתָּה.',
    options: ['חוֹלֶה, תְּרוּפָה', 'שָׂמֵחַ, שִׂמְחָה', 'נִרְגָּשׁ, מַתָּנוֹת', 'כּוֹעֵס, סְלִיחוֹת'],
    correct: 2,
    hint: 'מָה מְקַבְּלִים בְּיוֹם הֻלֶּדֶת?',
    minLevel: 5,
  },
  {
    prompt: 'בְּכָל עֶרֶב אֲנִי מְחַכֶּה בְּכִלְיוֹן ____ לְאַבָּא שֶׁלִּי, שֶׁיַּחֲזֹר מֵהָעֲבוֹדָה.',
    options: ['שְׂפָתַיִם', 'יָדַיִם', 'עֵינַיִם', 'נֶפֶשׁ'],
    correct: 2,
    hint: 'הַבִּטּוּי "מְחַכֶּה בְּכִלְיוֹן ____"',
    minLevel: 6,
  },
  {
    prompt: 'דָּוִיד אוֹהֵב כַּדּוּרֶגֶל, וּמֹשֶׁה אוֹהֵב כַּדּוּרְסַל. עַל ____ וְעַל ____ אֵין לְהִתְוַכֵּחַ.',
    options: ['אַהֲבָה, תַּחְבִּיבִים', 'טַעַם, רֵיחַ', 'כֵּיף, סְפּוֹרְט', 'מִשְׂחָק, חוּג'],
    correct: 1,
    hint: 'הַבִּטּוּי הָעַתִּיק עַל הַעְדָּפוֹת אִישִׁיּוֹת',
    minLevel: 7,
  },
  {
    prompt: 'מִבְנֵה גּוּפוֹ שֶׁל הַגָּמָל מַתְאִים לְחַיִּים ____. נְקֵבַת הַגָּמָל נִקְרֵאת ____.',
    options: ['בַּמִּדְבָּר, נָאקָה', 'יָפִים, אָתוֹן', 'בַּמִּדְבָּר, נְמָלָה', 'יְבֵשִׁים, שֶׁמֶשׁ'],
    correct: 0,
    hint: 'אֵיפֹה גָּמָל גָּר וּמַה שֵּׁם הַנְּקֵבָה',
    minLevel: 6,
  },
  {
    prompt: 'טִיַּלְתִּי בַּשָּׂדֶה, קָטַפְתִּי פְּרָחִים, ____ זֵר. אֶתֵּן אֶת הַזֵּר לְאִמָּא.',
    options: ['וְעָרַכְתִּי', 'וְשָׁזַרְתִּי', 'שָׁמַעְתִּי', 'צְהֻבִּים'],
    correct: 1,
    hint: 'מָה עוֹשִׂים מִפְּרָחִים כְּדֵי לִבְנוֹת זֵר?',
    minLevel: 7,
  },
  // From מבחן 2025 — beds context
  {
    prompt: '____ אֶת מִטָּתִי לִפְנֵי שֶׁהָלַכְתִּי לְבֵית הַסֵּפֶר.',
    options: ['הִלְבַּשְׁתִּי', 'יָשַׁנְתִּי', 'קַמְתִּי', 'הִצַּעְתִּי'],
    correct: 3,
    hint: 'מָה עוֹשִׂים לְמִטָּה אַחֲרֵי שֶׁקָּמִים?',
    minLevel: 6,
  },
  // sharing food context
  {
    prompt: 'לִיהִי ____ לַחְלֹק עִם חֲבֶרְתָּהּ אֶת הַכָּרִיךְ שֶׁהֵבִיאָה מִבֵּיתָהּ, מִשּׁוּם שֶׁהָיְתָה רְעֵבָה מְאֹד.',
    options: ['סֵרְבָה', 'הִסְכִּימָה', 'קֵרְבָה', 'רָצְתָה'],
    correct: 0,
    hint: 'אִם הִיא רְעֵבָה, הִיא לֹא תִּרְצֶה לַחְלֹק',
    minLevel: 7,
  },
];

export function genCloze(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const eligible = CLOZES.filter((c) => c.minLevel <= L);
  if (!eligible.length) return genSynonym(level, age, bypass);
  const c = pick(eligible);
  const options = [...c.options];
  return {
    prompt: c.prompt,
    options,
    correct: c.correct,
    hintContext: c.hint,
    dir: 'rtl',
  };
}

// =============================================================
// TRIVIA — "ידע כללי" (General Knowledge) from gulot.co.il exam bank
// =============================================================
type TriviaQ = { prompt: string; options: string[]; correct: number; hint: string; minLevel: number };
const TRIVIA_BANK: TriviaQ[] = [
  // Proverbs/Idioms understanding (ידע כללי)
  {
    prompt: 'מַה מַשְׁמָעוּת הַפִּתְגָּם: "בְּזֵעַת אַפֶּיךָ תֹּאכַל לֶחֶם"?',
    options: ['יֵשׁ לִזְרוֹק לֶחֶם שֶׁנָּפַל', 'כְּדָאי לִשְׁטֹף יָדַיִם לִפְנֵי אֲרוּחָה', 'צָרִיךְ לַעֲבֹד קָשֶׁה כְּדֵי לְהַצְלִיחַ', 'לֹא כָּל לֶחֶם הוּא טָעִים'],
    correct: 2, hint: 'פִּתְגָּם עַל עֲבוֹדָה קָשָׁה', minLevel: 5,
  },
  {
    prompt: 'מַה מַשְׁמָעוּת הַפִּתְגָּם: "אַל תַּלְבִּין פְּנֵי חֲבֵרְךָ בָּרַבִּים"?',
    options: ['אַל תַּעֲלִיב אָדָם לְיַד אֲנָשִׁים', 'חֲבֵרִים אוֹהֲבִים אֶת הַצֶּבַע הַלָּבָן', 'מִי שֶׁמַּעֲלִיב — פָּנָיו יַלְבִּינוּ', 'מִי שֶׁלֹּא מַעֲלִיב יִהְיוּ לוֹ חֲבֵרִים רַבִּים'],
    correct: 0, hint: 'מָה אוֹמְרִים עַל הַעֲלָבָה בִּפְנֵי אֲחֵרִים?', minLevel: 5,
  },
  {
    prompt: 'מַה מַשְׁמָעוּת הַפִּתְגָּם: "אֵיזֶהוּ גִּבּוֹר? הַכּוֹבֵשׁ אֶת יִצְרוֹ"?',
    options: ['לֹא כָּל גִּבּוֹר מַצְלִיחַ לִכְבֹּשׁ', 'אִישׁ מֻצְלָח מְיַצֵּר הַמְצָאוֹת', 'גִּבּוֹר אֲמִתִּי מַצְלִיחַ לְהִתְאַפֵּק', 'יְצִירוֹת גְּדוֹלוֹת נוֹצְרוּ עַל יְדֵי גִּבּוֹרִים'],
    correct: 2, hint: 'מָה זֶה "לִכְבֹּשׁ אֶת יִצְרוֹ"?', minLevel: 6,
  },
  // Geography
  {
    prompt: 'לְיַד אֵיזֶה יָם נִמְצֵאת הָעִיר תֵּל אָבִיב?',
    options: ['יָם סוּף', 'הַיָּם הַתִּיכוֹן', 'יָם הַמֶּלַח', 'הָאוֹקְיָנוּס הַשָּׁקֵט'],
    correct: 1, hint: 'תֵּל אָבִיב עַל חוֹף הַיָּם הַמַּעֲרָבִי שֶׁל יִשְׂרָאֵל', minLevel: 4,
  },
  {
    prompt: 'אֵיזוֹ עִיר יוֹצֵאת דֹּפֶן? (בֶּרְלִין, יְרוּשָׁלַיִם, לוֹנְדוֹן, תֵּל אָבִיב)',
    options: ['בֶּרְלִין', 'יְרוּשָׁלַיִם', 'לוֹנְדוֹן', 'תֵּל אָבִיב'],
    correct: 1, hint: 'שָׁלוֹשׁ עָרִים הֵן בִּירוֹת שֶׁל מְדִינוֹת בְּאֵירוֹפָּה', minLevel: 6,
  },
  // History / inventions
  {
    prompt: 'מִי הָיָה נָשִׂיא הַמְּדִינָה הָרִאשׁוֹן שֶׁל יִשְׂרָאֵל?',
    options: ['חַיִּים נָבוֹן', 'חַיִּים וַייצְמַן', 'בִּנְיָמִין נְתַנְיָהוּ', 'אָרִיק אַיינְשְׁטַיין'],
    correct: 1, hint: 'מָדְעָן מִגְדוֹלֵי הַמַּדָּע שֶׁל הַמֵּאָה הָ-20', minLevel: 6,
  },
  {
    prompt: 'מִי הִמְצִיא אֶת מַכְשִׁיר הַטֶּלֶפוֹן?',
    options: ['אָלֶכְּסַנְדֵּר מוֹקְדוֹן', 'אָלֶכְּסַנְדֵּר גְּרָהָם בֵּל', 'מָקְס אַייפוֹן', 'חַיִּים נַחְמָן בִּיאָלִיק'],
    correct: 1, hint: 'הַשֵּׁם שֶׁלּוֹ מַזְכִּיר צִלְצוּל', minLevel: 5,
  },
  // Nature / animals
  {
    prompt: 'אֵיזוֹ חַיָּה יוֹצֵאת דֹּפֶן? (כֶּלֶב, חָתוּל, נְמָלָה, אַרְנָב)',
    options: ['כֶּלֶב', 'חָתוּל', 'נְמָלָה', 'אַרְנָב'],
    correct: 2, hint: 'שָׁלוֹשׁ חַיּוֹת הֵן יוֹנְקִים', minLevel: 4,
  },
  // Simple for younger kids
  {
    prompt: 'כַּמָּה יָמִים יֵשׁ בְּשָׁבוּעַ?',
    options: ['5', '6', '7', '8'],
    correct: 2, hint: 'סְפֹר מִיּוֹם רִאשׁוֹן עַד שַׁבָּת', minLevel: 2,
  },
  {
    prompt: 'כַּמָּה עוֹנוֹת יֵשׁ בְּשָׁנָה?',
    options: ['2', '3', '4', '5'],
    correct: 2, hint: 'חֹרֶף, אָבִיב, קַיִץ וְ...?', minLevel: 3,
  },
  {
    prompt: 'אֵיזֶה צֶבַע מְקַבְּלִים כְּשֶׁמְּעָרְבְּבִים אָדֹם וְצָהֹב?',
    options: ['יָרֹק', 'כָּתֹם', 'סָגֹל', 'חוּם'],
    correct: 1, hint: 'חִשְׁבוּ עַל צֶבַע שֶׁל תַּפּוּז', minLevel: 2,
  },
  // From noam2025 — type relationships (gulot-style)
  {
    prompt: 'הַיּוֹם יוֹם שֵׁנִי. בְּעוֹד כַּמָּה יָמִים יִהְיֶה יוֹם חֲמִישִׁי?',
    options: ['הַיּוֹם', 'שְׁלוֹשָׁה יָמִים', 'יוֹמַיִם', 'יוֹם אֶחָד'],
    correct: 1, hint: 'סְפֹר: שְׁלִישִׁי, רְבִיעִי, חֲמִישִׁי', minLevel: 3,
  },
];

export function genTrivia(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const eligible = TRIVIA_BANK.filter((q) => q.minLevel <= L);
  if (!eligible.length) return genOdd(level, age, bypass);
  const q = pick(eligible);
  return {
    prompt: q.prompt,
    options: [...q.options],
    correct: q.correct,
    hintContext: q.hint,
    dir: 'rtl',
  };
}

// =============================================================
// INEQUALITY — "8 × 5 > 8 × ___" — from machon-noam 2025
// =============================================================
export function genInequality(level: number, age: number, bypass = false): MCQ {
  const L = cappedLevel(level, age, bypass);
  const a = L <= 4 ? rand(2, 5) : rand(3, 10);
  const b = L <= 4 ? rand(2, 5) : rand(2, 12);
  const isGreater = Math.random() > 0.5;
  const op = isGreater ? '>' : '<';
  const answer = isGreater ? rand(1, b - 1) : rand(b + 1, b + 5);
  const { options, correctIdx } = buildOptions(
    String(answer),
    [String(b), String(answer + 1), String(Math.max(1, answer - 1)), String(answer + 2)].filter(v => v !== String(answer)),
    () => String(Math.max(1, answer + rand(-2, 2) || 1))
  );
  return {
    prompt: `${a} × ${b}  ${op}  ${a} × ___`,
    options,
    correct: correctIdx,
    hintContext: `${a} × ${b} = ${a*b}, אֵיזֶה מִסְפָּר יְשַׁנֶּה אֶת הַתְּשׁוּבָה?`,
    dir: 'ltr',
  };
}

// =============================================================
// MAIN dispatcher
// =============================================================
export function generate(gameId: string, level: number, age: number = 6, bypass = false): MCQ {
  switch (gameId) {
    case 'pattern': return genPattern(level, age, bypass);
    case 'odd': return genOdd(level, age, bypass);
    case 'sequence': return genSequence(level, age, bypass);
    case 'analogy': return genAnalogy(level, age, bypass);
    case 'memory': return genMemory(level, age, bypass);
    case 'math': return genMath(level, age, bypass);
    case 'reading': return genReading(level, age, bypass);
    case 'synonym': return genSynonym(level, age, bypass);
    case 'idiom': return genIdiom(level, age, bypass);
    case 'cloze': return genCloze(level, age, bypass);
    case 'missing': return genMissingNumber(level, age, bypass);
    case 'pictureeq': return genPictureEq(level, age, bypass);
    case 'trivia': return genTrivia(level, age, bypass);
    case 'inequality': return genInequality(level, age, bypass);
    default: return genPattern(level, age, bypass);
  }
}
