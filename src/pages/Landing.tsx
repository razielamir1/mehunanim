import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Mascot from '@/components/WorldMascot';
import { useStore, Age, Gender } from '@/store/useStore';
import { sfx, haptic } from '@/lib/sound';
import { useT } from '@/i18n';

const AVATARS = ['🦊', '🐼', '🐨', '🦁', '🐯', '🐵', '🦄', '🐸'];

export default function Landing() {
  const nav = useNavigate();
  const t = useT();
  const setProfile = useStore((s) => s.setProfile);
  const existing = useStore((s) => s.name);
  const exAge = useStore((s) => s.age);
  const exCity = useStore((s) => s.city);
  const exAvatar = useStore((s) => s.avatar);
  const profiles = useStore((s) => s.profiles);
  const activeId = useStore((s) => s.activeProfileId);
  const exProfile = profiles.find((p) => p.id === activeId);
  const [name, setName] = useState(existing);
  const [age, setAge] = useState<Age>(exAge);
  const [gender, setGender] = useState<Gender>(exProfile?.gender ?? 'neutral');
  const [city, setCity] = useState(exCity);
  const [avatar, setAvatar] = useState(exAvatar);

  const locale = useStore((s) => s.locale);
  const start = () => {
    sfx.tap(); haptic();
    const fallbackName = locale === 'en' ? 'Friend' : 'חבר';
    setProfile({ name: name.trim() || fallbackName, age, gender, city: city.trim(), avatar });
    nav('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center gap-6 py-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="animate-float">
        <Mascot pose="happy" size={140} />
      </motion.div>
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-4xl sm:text-5xl font-black bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
      >
        {t('appName')}
      </motion.h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md">{t('tagline')}</p>

      <div className="card w-full max-w-md space-y-5">
        <div>
          <label className="block text-start font-bold mb-2">{t('avatar')}</label>
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => { sfx.tap(); setAvatar(a); }}
                className={`min-h-[64px] rounded-2xl text-3xl transition ${
                  avatar === a ? 'bg-gradient-to-l from-indigo-500 to-pink-500 scale-110 shadow-lg' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700'
                }`}
              >{a}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-start font-bold mb-2">{t('name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('namePh')}
            dir="auto"
            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-lg text-start focus:border-brand-500 focus:outline-none" maxLength={20} />
        </div>
        <div>
          <label className="block text-start font-bold mb-2">{t('city')}</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('cityPh')}
            dir="auto"
            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-lg text-start focus:border-brand-500 focus:outline-none" maxLength={30} />
        </div>
        <div>
          <label className="block text-start font-bold mb-2">מִי אֲנִי?</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: 'male', label: '🚹 בֵּן' },
              { v: 'female', label: '🚺 בַּת' },
              { v: 'neutral', label: 'מַעֲדִיף לֹא' },
            ] as { v: Gender; label: string }[]).map((g) => (
              <button
                key={g.v}
                onClick={() => { sfx.tap(); setGender(g.v); }}
                className={`min-h-[64px] rounded-2xl font-black transition px-2 text-sm ${
                  gender === g.v
                    ? 'bg-gradient-to-l from-indigo-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700'
                }`}
              >{g.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-start font-bold mb-2">{t('age')}</label>
          <div className="grid grid-cols-7 gap-1.5">
            {[2, 3, 4, 5, 6, 7, 8].map((a) => (
              <button
                key={a}
                onClick={() => { sfx.tap(); setAge(a as Age); }}
                className={`min-h-[64px] rounded-xl font-black text-xl transition ${
                  age === a ? 'bg-gradient-to-l from-indigo-500 to-pink-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700'
                }`}
              >{a}</button>
            ))}
          </div>
        </div>
        <button onClick={start} className="btn-primary w-full text-xl">{t('start')}</button>
      </div>

      {/* Footer — about the creator */}
      <footer className="mt-16 mb-8 w-full max-w-md text-center space-y-3 opacity-70 hover:opacity-100 transition-opacity">
        <div className="h-px bg-gradient-to-l from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
        <div className="space-y-1.5">
          <p className="font-black text-base text-slate-700 dark:text-slate-200">
            {locale === 'en' ? 'Raziel Amir' : 'רזיאל אמיר'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {locale === 'en' ? 'AI Architect | GenAI Solutions Developer' : 'אַרְכִּיטֶקְט AI | מְפַתֵּחַ פִּתְרוֹנוֹת GenAI'}
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto" dir="auto">
          {locale === 'en'
            ? "Mehunanim was built from scratch using AI — from 0 to production in days, not months. I design and build smart digital products for businesses and individuals: AI automations, intelligent agents, and GenAI systems that work for you 24/7."
            : 'מְחוּנָנִים נִבְנָה מֵאֶפֶס בְּאֶמְצָעוּת בִּינָה מְלָאכוּתִית — מ-0 לְפְרוֹדַקְשֶׁן תּוֹךְ יָמִים, לֹא חֳדָשִׁים. אֲנִי מְתַכְנֵן וּבוֹנֶה מוּצָרִים דִּיגִיטָלִיִּים חֲכָמִים לַעֲסָקִים וְלִפְרָטִיִּים: אוֹטוֹמַצְיוֹת AI, סוֹכְנִים חֲכָמִים, וּמַעֲרָכוֹת GenAI שֶׁעוֹבְדוֹת בִּשְׁבִילְכֶם 24/7.'}
        </p>
        <a
          href="mailto:razielamir@gmail.com"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          📩 razielamir@gmail.com
        </a>
        <p className="text-xs text-slate-400 dark:text-slate-500" dir="auto">
          {locale === 'en'
            ? 'Got an idea? Feedback? Want your own AI product? Talk to me — I build the next thing, maybe it\'s yours.'
            : 'יֵשׁ לָכֶם רַעְיוֹן? פִּידְבֶּק? רוֹצִים מוּצָר AI מִשֶּׁלָּכֶם? דַּבְּרוּ אִתִּי — אֲנִי בּוֹנֶה אֶת הַדָּבָר הַבָּא, אוּלַי הוּא שֶׁלָּכֶם.'}
        </p>
      </footer>
    </div>
  );
}
