import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Mascot from '@/components/WorldMascot';
import { useStore, Age } from '@/store/useStore';
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
  const [name, setName] = useState(existing);
  const [age, setAge] = useState<Age>(exAge);
  const [city, setCity] = useState(exCity);
  const [avatar, setAvatar] = useState(exAvatar);

  const locale = useStore((s) => s.locale);
  const start = () => {
    sfx.tap(); haptic();
    const fallbackName = locale === 'en' ? 'Friend' : 'חבר';
    setProfile({ name: name.trim() || fallbackName, age, city: city.trim(), avatar });
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
    </div>
  );
}
