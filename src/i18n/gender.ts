// Gendered translations for kid-facing strings.
// Hebrew has different verb conjugations / pronouns for masculine, feminine, and plural (used as neutral).
// Each key has 3 forms: male / female / neutral (gender-neutral, often plural).
import { useStore, Gender } from '@/store/useStore';

type GTable = Record<string, { male: string; female: string; neutral: string }>;

const HE: GTable = {
  // Celebrations
  great: {
    male: 'כָּל הַכָּבוֹד! חָכָם!',
    female: 'כָּל הַכָּבוֹד! חֲכָמָה!',
    neutral: 'כָּל הַכָּבוֹד!',
  },
  amazing: {
    male: 'אַתָּה מַדְהִים!',
    female: 'אַתְּ מַדְהִימָה!',
    neutral: 'מַדְהִים!',
  },
  tryAgain: {
    male: 'נְנַסֶּה שׁוּב, אַתָּה תַּצְלִיחַ!',
    female: 'נְנַסֶּה שׁוּב, אַתְּ תַּצְלִיחִי!',
    neutral: 'נְנַסֶּה שׁוּב!',
  },
  // Dashboard
  pickGame: {
    male: 'בְּחַר מִשְׂחָק וּבוֹא נַתְחִיל!',
    female: 'בַּחֲרִי מִשְׂחָק וּבוֹאִי נַתְחִיל!',
    neutral: 'בָּחָרוּ מִשְׂחָק וּבוֹאוּ נַתְחִיל!',
  },
  // Walkthrough
  walkthroughCta: {
    male: 'הֵבַנְתִּי, אֲנִי רוֹצֶה לְנַסּוֹת לְבַד!',
    female: 'הֵבַנְתִּי, אֲנִי רוֹצָה לְנַסּוֹת לְבַד!',
    neutral: 'הֵבַנְתִּי, רוֹצִים לְנַסּוֹת לְבַד!',
  },
  // Hints
  speakBtn: {
    male: 'הַקְרֵא בְּקוֹל',
    female: 'הַקְרִיאִי בְּקוֹל',
    neutral: 'הַקְרָאָה בְּקוֹל',
  },
  // Streak
  streakHot: {
    male: 'שִׁילּוּב חַם! אַתָּה בּוֹעֵר!',
    female: 'שִׁילּוּב חַם! אַתְּ בּוֹעֶרֶת!',
    neutral: 'שִׁילּוּב חַם!',
  },
  // Hello
  helloKid: {
    male: 'שָׁלוֹם, חָכָם!',
    female: 'שָׁלוֹם, חֲכָמָה!',
    neutral: 'שָׁלוֹם!',
  },
  // Level up
  levelUpExclam: {
    male: 'אַתָּה עוֹלֶה רָמָה!',
    female: 'אַתְּ עוֹלָה רָמָה!',
    neutral: 'עוֹלִים רָמָה!',
  },
};

const EN: GTable = {
  // English doesn't conjugate by gender — same form for all
  great: { male: 'Well done!', female: 'Well done!', neutral: 'Well done!' },
  amazing: { male: 'Amazing!', female: 'Amazing!', neutral: 'Amazing!' },
  tryAgain: { male: "Let's try again!", female: "Let's try again!", neutral: "Let's try again!" },
  pickGame: { male: 'Pick a game!', female: 'Pick a game!', neutral: 'Pick a game!' },
  walkthroughCta: { male: "Got it, let me try!", female: "Got it, let me try!", neutral: "Got it, let me try!" },
  speakBtn: { male: 'Read aloud', female: 'Read aloud', neutral: 'Read aloud' },
  streakHot: { male: 'Hot streak!', female: 'Hot streak!', neutral: 'Hot streak!' },
  helloKid: { male: 'Hello!', female: 'Hello!', neutral: 'Hello!' },
  levelUpExclam: { male: 'Level up!', female: 'Level up!', neutral: 'Level up!' },
};

export type GenderKey = keyof typeof HE;

export function getGT(key: GenderKey, gender: Gender, locale: 'he' | 'en'): string {
  const table = locale === 'en' ? EN : HE;
  return table[key]?.[gender] ?? table[key]?.neutral ?? key;
}

// Hook for components — auto-derives gender from active profile
export function useGT() {
  const profiles = useStore((s) => s.profiles);
  const activeId = useStore((s) => s.activeProfileId);
  const locale = useStore((s) => s.locale);
  const active = profiles.find((p) => p.id === activeId);
  const gender: Gender = active?.gender ?? 'neutral';
  return (key: GenderKey) => getGT(key, gender, locale);
}
