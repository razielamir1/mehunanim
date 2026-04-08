import { useStore } from '@/store/useStore';

const dict = {
  he: {
    // App
    appName: 'מחוננים',
    tagline: 'הכנה חכמה וכיפית למבחני המחוננים — עם בוקי הינשוף 🦉',

    // Landing
    name: 'איך קוראים לך?',
    namePh: 'השם שלי...',
    age: 'בן/בת כמה אני?',
    city: 'מאיפה אני?',
    cityPh: 'עיר בישראל',
    avatar: 'בחר אווטאר',
    start: 'בואו נתחיל! 🚀',

    // Nav
    hello: 'שלום',
    home: 'בית',
    progress: 'התקדמות',
    parent: 'הורה',
    settings: 'הגדרות',
    coach: 'יועץ',
    profile: 'פרופיל',
    skipToContent: 'דלג לתוכן הראשי',

    // Dashboard
    pickGame: 'בחר משחק ובוא נתחיל!',
    pickSub: 'כל משחק מאמן יכולת אחרת',
    mockExamCta: 'מבחן סימולציה',
    mockExamSub: '10 שאלות כמו במבחן האמיתי 🎓',

    // Play
    back: 'חזרה',
    backHome: 'חזרה לבית',
    again: 'סיבוב נוסף',
    hintBtn: 'רמז',
    explainBtn: 'הסבר',
    speakBtn: 'הקרא בקול',
    level: 'רמה',
    levelUp: 'עלית רמה!',
    streakHot: 'שילוב חם!',
    great: 'כל הכבוד',
    amazing: 'מדהים!',
    tryAgain: 'ננסה שוב?',
    readDirRtl: 'קרא מימין לשמאל ←',
    readDirLtr: '→ קרא משמאל לימין',
    rtlAria: 'כיוון קריאה: מימין לשמאל',
    ltrAria: 'כיוון קריאה: משמאל לימין',
    questionOf: 'שאלה {n} מתוך {total}',

    // Results
    starsEarned: 'קיבלת {n} כוכבים!',
    newCollectible: 'פריט חדש באוסף!',

    // Parent
    parentTitle: 'אזור הורים',
    parentQuiz: 'כמה זה 7 × 8?',
    enter: 'כניסה',
    parentGreeting: 'שלום, הורה של {name}',
    statsTitle: 'התקדמות לפי משחק',
    aiInsights: 'תובנות AI מבוקי',
    aiAnalyze: 'ניתוח AI מתקדם',
    analyzing: 'מנתח...',
    preparingInsights: 'מכין תובנות...',
    reset: 'אפס התקדמות',
    resetConfirm: 'לאפס את כל ההתקדמות?',
    resetWarning: 'כל הכוכבים, הרמות, וההישגים יימחקו ללא יכולת שחזור.',
    cancel: 'ביטול',

    // Settings
    soundOnLabel: 'צלילים',
    soundOnState: 'פועלים',
    soundOffState: 'כבויים',
    ttsLabel: 'קריינות',
    ttsOnState: 'פועלת',
    ttsOffState: 'כבויה',
    theme: 'מצב תצוגה',
    themeLight: 'בהיר',
    themeDark: 'כהה',
    language: 'שפה',
    pickWorld: 'בחר עולם',
    accessibility: 'נגישות',
    myKids: 'הילדים שלי',

    // Coach
    coachTitle: 'ד"ר מורן — יועצת מומחית',
    coachSub: '50+ שנות ניסיון בהכנה למבחני מחוננים',
    coachPh: 'שאל אותי כל דבר על ההכנה...',
    send: 'שלח',
    clearChat: 'נקה שיחה',
    coachWelcome: 'שלום! אני ד"ר מורן. אני כאן לעזור עם כל שאלה על ההכנה של ילדכם למבחן המחוננים. במה אוכל לעזור?',

    // Progress
    rank: 'דירוג',
    starsLabel: 'כוכבים',
    avgLevel: 'רמה ממוצעת',
    collectiblesLabel: 'אוסף',
    myCollection: 'האוסף שלי',
    games: 'משחקים',
    attempts: '{n} ניסיונות',
    weakArea: 'תחום לחיזוק',
    strongArea: 'תחום חזק',
    playNow: 'שחק עכשיו',
    myProgress: 'ההתקדמות שלי',

    // Worlds
    pickWorldHeader: 'בחר עולם',
    pickWorldSub: 'כל עולם משנה את העיצוב, הדמות והרקע',

    // Accessibility
    a11yTitle: 'נגישות',
    a11ySub: 'התאם את האתר ליכולות שלך',
    fontSize: 'גודל טקסט',
    fontNormal: 'רגיל',
    fontLarge: 'גדול',
    fontXLarge: 'ענק',
    highContrast: 'ניגודיות גבוהה',
    highContrastDesc: 'רקע שחור וטקסט לבן בולט',
    reduceMotion: 'הפחתת אנימציות',
    reduceMotionDesc: 'מבטל תנועות וקונפטי',
    dyslexiaFont: 'גופן ידידותי לדיסלקציה',
    dyslexiaFontDesc: 'מרווחים גדולים יותר וגופן קריא',
    underlineLinks: 'קו תחתון לקישורים',
    underlineLinksDesc: 'הדגשת קישורים בכל האתר',
    a11yReset: 'איפוס נגישות',
    a11yStatement: 'הצהרת נגישות',
    a11yStatementBody: 'האתר תוכנן לפי תקן WCAG 2.1 AA: ניווט מקלדת מלא, ניגודיות גבוהה, גדלי טקסט מתכווננים, תגיות ARIA, ושמירה על העדפת המערכת.',

    // Profiles
    myKidsTitle: 'הילדים שלי 👨‍👩‍👧‍👦',
    addKid: 'הוסף ילד',
    newProfile: 'פרופיל חדש',
    deleteProfile: 'למחוק את הפרופיל?',
    deleteWarning: 'כל ההתקדמות תימחק ולא ניתן יהיה לשחזר.',
    delete: 'מחק',
    create: 'צור פרופיל',
    childName: 'איך קוראים לו/לה?',
    childNamePh: 'השם של הילד',
    fromWhere: 'מאיפה?',
    howOld: 'בן/בת כמה?',
    noName: 'ללא שם',
    ageLabel: 'גיל',
    selectProfileAria: 'בחר את הפרופיל של {name}',
    deleteProfileAria: 'מחק פרופיל {name}',
    switchProfile: 'החלף פרופיל',

    // Mock Exam
    mockExamTitle: 'מבחן סימולציה',
    mockExamIntro: 'סימולציה של מבחן המחוננים האמיתי לכיתה ב\'.',
    mockExamFormat: '10 שאלות • 25 דקות • ללא רמזים, ללא הסברים תוך כדי',
    mockExamFooter: 'בסיום תקבל ציון, ניתוח פרטני, והסברים מהיועצת.',
    mockExamStart: 'התחל מבחן',
    mockExamLater: 'לא עכשיו',
    mockExamAgeGate: 'המבחן הזה מותאם לילדים בגילאי 7-8 לקראת מבחן המחוננים בסוף כיתה ב\'.',
    mockExamAgeNow: 'הילד שלך כעת בן {age}. כדאי לתרגל קודם במשחקים הרגילים.',
    mockExamDone: 'סיימת! 🎓',
    mockExamReady: '🌟 מצוין! מוכן למבחן',
    mockExamGood: '👍 התקדמות יפה',
    mockExamPractice: '💪 כדאי להמשיך לתרגל',
    mockExamReview: 'פירוט תשובות',
    mockExamQ: 'שאלה {n}',
    mockExamCorrect: 'תשובה נכונה',
    mockExamExit: 'צא',
    mockExamFinish: 'סיים מבחן',
    mockExamNext: 'הבא ←',
    partVerbal: '📝 חלק מילולי',
    partMath: '🧮 חלק חשבון',
    partShapes: '🔷 חלק צורות',

    // Fallbacks for AI when offline
    fallbackHint: 'נסו להסתכל על הדפוס — מה חוזר על עצמו?',
    fallbackExplain: 'התשובה הנכונה היא זו שממשיכה את הכלל שהתחלנו ללמוד.',
    fallbackInsight: 'התקדמות יפה! המשיכו להתאמן מעט בכל יום.',
    fallbackAnalyze: 'אין מספיק נתונים עדיין — שחקו עוד כמה סבבים ונחזור עם ניתוח מפורט.',
    fallbackChat: 'אני זמינה כשהשרת יעלה. בינתיים, המשיכו להתאמן ב-5 משחקים בקצב של 10 דקות ביום.',
  },
  en: {
    // App
    appName: 'Gifted',
    tagline: 'Smart, fun prep for the gifted exam — with Buki the Owl 🦉',

    // Landing
    name: "What's your name?",
    namePh: 'My name...',
    age: 'How old am I?',
    city: 'Where am I from?',
    cityPh: 'City',
    avatar: 'Pick an avatar',
    start: "Let's go! 🚀",

    // Nav
    hello: 'Hello',
    home: 'Home',
    progress: 'Progress',
    parent: 'Parent',
    settings: 'Settings',
    coach: 'Coach',
    profile: 'Profile',
    skipToContent: 'Skip to main content',

    // Dashboard
    pickGame: 'Pick a game and start!',
    pickSub: 'Each game trains a different skill',
    mockExamCta: 'Mock Exam',
    mockExamSub: '10 real-style questions 🎓',

    // Play
    back: 'Back',
    backHome: 'Back home',
    again: 'Play again',
    hintBtn: 'Hint',
    explainBtn: 'Explain',
    speakBtn: 'Read aloud',
    level: 'Level',
    levelUp: 'Level up!',
    streakHot: 'Hot streak!',
    great: 'Well done',
    amazing: 'Amazing!',
    tryAgain: "Let's try again?",
    readDirRtl: '← Read right to left',
    readDirLtr: 'Read left to right →',
    rtlAria: 'Reading direction: right to left',
    ltrAria: 'Reading direction: left to right',
    questionOf: 'Question {n} of {total}',

    // Results
    starsEarned: 'You earned {n} stars!',
    newCollectible: 'New collectible!',

    // Parent
    parentTitle: 'Parent area',
    parentQuiz: 'What is 7 × 8?',
    enter: 'Enter',
    parentGreeting: "Hi, {name}'s parent",
    statsTitle: 'Progress per game',
    aiInsights: 'AI insights from Buki',
    aiAnalyze: 'Advanced AI analysis',
    analyzing: 'Analyzing...',
    preparingInsights: 'Preparing insights...',
    reset: 'Reset progress',
    resetConfirm: 'Reset all progress?',
    resetWarning: 'All stars, levels, and achievements will be permanently erased.',
    cancel: 'Cancel',

    // Settings
    soundOnLabel: 'Sound',
    soundOnState: 'On',
    soundOffState: 'Off',
    ttsLabel: 'Read aloud',
    ttsOnState: 'On',
    ttsOffState: 'Off',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    pickWorld: 'Pick a world',
    accessibility: 'Accessibility',
    myKids: 'My kids',

    // Coach
    coachTitle: 'Dr. Moran — Expert advisor',
    coachSub: '50+ years preparing kids for gifted exams',
    coachPh: 'Ask me anything about preparation...',
    send: 'Send',
    clearChat: 'Clear chat',
    coachWelcome: "Hi! I'm Dr. Moran. I'm here to help with any question about preparing your child for the gifted exam. How can I help?",

    // Progress
    rank: 'Rank',
    starsLabel: 'Stars',
    avgLevel: 'Avg level',
    collectiblesLabel: 'Collection',
    myCollection: 'My collection',
    games: 'Games',
    attempts: '{n} attempts',
    weakArea: 'Area to strengthen',
    strongArea: 'Strong area',
    playNow: 'Play now',
    myProgress: 'My progress',

    // Worlds
    pickWorldHeader: 'Pick a world',
    pickWorldSub: 'Each world changes the design, character, and background',

    // Accessibility
    a11yTitle: 'Accessibility',
    a11ySub: 'Adapt the site to your needs',
    fontSize: 'Text size',
    fontNormal: 'Normal',
    fontLarge: 'Large',
    fontXLarge: 'Huge',
    highContrast: 'High contrast',
    highContrastDesc: 'Black background with bright white text',
    reduceMotion: 'Reduce motion',
    reduceMotionDesc: 'Disables animations and confetti',
    dyslexiaFont: 'Dyslexia-friendly font',
    dyslexiaFontDesc: 'Wider spacing and readable typeface',
    underlineLinks: 'Underline links',
    underlineLinksDesc: 'Highlight all links throughout the site',
    a11yReset: 'Reset accessibility',
    a11yStatement: 'Accessibility statement',
    a11yStatementBody: 'The site is built to WCAG 2.1 AA: full keyboard navigation, high contrast, adjustable text sizes, ARIA labels, and respects system reduced-motion preference.',

    // Profiles
    myKidsTitle: 'My kids 👨‍👩‍👧‍👦',
    addKid: 'Add child',
    newProfile: 'New profile',
    deleteProfile: 'Delete this profile?',
    deleteWarning: 'All progress will be permanently erased.',
    delete: 'Delete',
    create: 'Create profile',
    childName: "What's their name?",
    childNamePh: "Child's name",
    fromWhere: 'From where?',
    howOld: 'How old?',
    noName: 'No name',
    ageLabel: 'Age',
    selectProfileAria: "Select {name}'s profile",
    deleteProfileAria: "Delete profile {name}",
    switchProfile: 'Switch profile',

    // Mock Exam
    mockExamTitle: 'Mock Exam',
    mockExamIntro: "Simulation of the real Israeli gifted exam (end of grade 2).",
    mockExamFormat: '10 questions • 25 minutes • No hints, no explanations during',
    mockExamFooter: 'At the end you get a score, detailed review, and explanations from the advisor.',
    mockExamStart: 'Start exam',
    mockExamLater: 'Not now',
    mockExamAgeGate: 'This exam is designed for ages 7-8, in preparation for the end-of-grade-2 gifted exam.',
    mockExamAgeNow: "Your child is currently {age}. It's better to practice the regular games first.",
    mockExamDone: "You're done! 🎓",
    mockExamReady: '🌟 Excellent! Ready for the exam',
    mockExamGood: '👍 Good progress',
    mockExamPractice: '💪 Keep practicing',
    mockExamReview: 'Review',
    mockExamQ: 'Question {n}',
    mockExamCorrect: 'Correct answer',
    mockExamExit: 'Exit',
    mockExamFinish: 'Finish exam',
    mockExamNext: 'Next →',
    partVerbal: '📝 Verbal',
    partMath: '🧮 Math',
    partShapes: '🔷 Shapes',

    // Fallbacks
    fallbackHint: 'Try to spot the pattern — what repeats?',
    fallbackExplain: 'The correct answer is the one that follows the rule.',
    fallbackInsight: 'Nice progress! Keep practicing a little every day.',
    fallbackAnalyze: 'Not enough data yet — play a few more rounds and we will return with a detailed analysis.',
    fallbackChat: "I'll be back when the server is up. Meanwhile, keep practicing — 5 games at 10 min/day.",
  },
} as const;

type Key = keyof typeof dict.he;

export function useT() {
  const locale = useStore((s) => s.locale);
  return (k: Key, params?: Record<string, string | number>) => {
    let v: string = (dict[locale][k] as string) ?? (dict.he[k] as string) ?? k;
    if (params) {
      for (const [pk, pv] of Object.entries(params)) {
        v = v.replace(new RegExp(`\\{${pk}\\}`, 'g'), String(pv));
      }
    }
    return v;
  };
}
