import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Check, Star, ArrowRight } from 'lucide-react';
import { useStore, Age, Gender } from '@/store/useStore';
import { sfx, haptic } from '@/lib/sound';
import { useT } from '@/i18n';

const AVATARS = ['🦊', '🐼', '🐨', '🦁', '🐯', '🐵', '🦄', '🐸', '🐰', '🐻', '🐱', '🐶'];

export default function Profiles() {
  const t = useT();
  const nav = useNavigate();
  const profiles = useStore((s) => s.profiles);
  const activeId = useStore((s) => s.activeProfileId);
  const switchProfile = useStore((s) => s.switchProfile);
  const addProfile = useStore((s) => s.addProfile);
  const deleteProfile = useStore((s) => s.deleteProfile);

  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState<Age>(6);
  const [gender, setGender] = useState<Gender>('neutral');
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const choose = (id: string) => {
    sfx.tap(); haptic();
    switchProfile(id);
    nav('/dashboard');
  };

  const create = () => {
    if (!name.trim()) return;
    sfx.correct(); haptic();
    addProfile({ name: name.trim(), age, gender, city: city.trim(), avatar });
    nav('/dashboard');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{t('myKidsTitle')}</h1>
        <Link to="/dashboard" className="btn-ghost !min-h-[48px] !px-4 !py-2 text-sm" aria-label={t('back')}>
          <ArrowRight className="w-4 h-4" /> {t('back')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card relative !p-5"
          >
            {p.id === activeId && (
              <div className="absolute top-3 end-3 bg-emerald-500 text-white rounded-full p-1.5">
                <Check className="w-4 h-4" />
              </div>
            )}
            <button
              onClick={() => choose(p.id)}
              className="w-full text-start min-h-[120px]"
              aria-label={t('selectProfileAria', { name: p.name || t('noName') })}
            >
              <div className="text-6xl mb-2">{p.avatar}</div>
              <div className="font-black text-xl">{p.name || t('noName')}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t('ageLabel')} {p.age}
                {p.city && ` • ${p.city}`}
              </div>
              <div className="flex items-center gap-1 mt-2 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-sm">{p.stars}</span>
              </div>
            </button>
            {profiles.length > 1 && (
              <button
                onClick={() => setConfirmDelete(p.id)}
                aria-label={t('deleteProfileAria', { name: p.name })}
                className="absolute bottom-3 end-3 text-slate-400 hover:text-rose-500 p-2 min-w-[44px] min-h-[44px]"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ))}

        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="card !p-5 min-h-[180px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-700/20 active:scale-95 transition"
          >
            <Plus className="w-12 h-12" />
            <div className="font-black">{t('addKid')}</div>
          </button>
        )}
      </div>

      {showNew && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
          <h2 className="text-2xl font-black">{t('newProfile')}</h2>
          <div>
            <label className="block text-start font-bold mb-2">{t('avatar')}</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => { sfx.tap(); setAvatar(a); }}
                  className={`min-h-[64px] rounded-2xl text-3xl transition ${
                    avatar === a
                      ? 'bg-gradient-to-l from-indigo-500 to-pink-500 scale-110 shadow-lg'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700'
                  }`}
                >{a}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-start font-bold mb-2">{t('childName')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('childNamePh')}
              dir="auto"
              maxLength={20}
              className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-lg text-start focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-start font-bold mb-2">{t('fromWhere')}</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('cityPh')}
              dir="auto"
              maxLength={30}
              className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-lg text-start focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-start font-bold mb-2">מִי אֲנִי?</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: 'male', label: '🚹 בֵּן' },
                { v: 'female', label: '🚺 בַּת' },
                { v: 'neutral', label: 'מַעֲדִיף לֹא לְהַגִּיד' },
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
            <label className="block text-start font-bold mb-2">{t('howOld')}</label>
            <div className="grid grid-cols-7 gap-1.5">
              {[2, 3, 4, 5, 6, 7, 8].map((a) => (
                <button
                  key={a}
                  onClick={() => { sfx.tap(); setAge(a as Age); }}
                  className={`min-h-[64px] rounded-xl font-black text-xl transition ${
                    age === a
                      ? 'bg-gradient-to-l from-indigo-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700'
                  }`}
                >{a}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowNew(false)} className="btn-ghost flex-1">{t('cancel')}</button>
            <button onClick={create} disabled={!name.trim()} className="btn-primary flex-1 disabled:opacity-50">{t('create')}</button>
          </div>
        </motion.div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-sm w-full text-center"
          >
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-xl font-black mb-2">{t('deleteProfile')}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{t('deleteWarning')}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost flex-1">{t('cancel')}</button>
              <button
                onClick={() => { deleteProfile(confirmDelete); setConfirmDelete(null); }}
                className="btn flex-1 bg-rose-500 text-white"
              >{t('delete')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
