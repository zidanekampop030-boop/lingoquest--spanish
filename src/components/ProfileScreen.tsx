import React, { useState } from 'react';
import { UserProgress, UserProfile } from '../types';
import { APP_ASSETS, SAVED_VOCABULARY, AVAILABLE_LANGUAGES } from '../data/curriculum';
import { soundEffects, speakText } from '../utils/audio';

interface ProfileScreenProps {
  progress: UserProgress;
  user: UserProfile;
  onRefillHearts: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  progress,
  user,
  onRefillHearts,
  onOpenSettings,
  onOpenLogin,
}) => {
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const activeLangConfig =
    AVAILABLE_LANGUAGES.find((l) => l.code === progress.activeLanguage) || AVAILABLE_LANGUAGES[0];

  const handleSpeak = (word: string) => {
    setPlayingWord(word);
    speakText(word, activeLangConfig.speechCode);
    setTimeout(() => setPlayingWord(null), 1200);
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <img alt="LingoQuest Logo" className="h-7 w-auto object-contain" src={APP_ASSETS.logo} />
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Profil</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playChipTap();
                onOpenSettings();
              }}
              className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              title="Paramètres"
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-3 px-4 max-w-md mx-auto gap-5">
        {/* User Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-container shadow-md"
                src={user.avatarUrl || APP_ASSETS.userAvatar}
              />
              <span className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-white">
                LVL 14
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <h2 className="text-lg font-extrabold text-on-surface truncate">{user.name}</h2>
              <span className="text-xs text-on-surface-variant font-medium truncate">
                {user.username} • {user.joinedDate}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="bg-primary-fixed/40 text-primary text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <span>{activeLangConfig.flag}</span> {activeLangConfig.name}
                </span>
                <span className="bg-surface-container text-on-surface-variant text-[11px] font-bold px-2 py-0.5 rounded-lg">
                  {activeLangConfig.sectionName.split('•')[0]}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playChipTap();
              onOpenLogin();
            }}
            className="p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-bold transition-all flex flex-col items-center flex-shrink-0"
            title="Gérer le compte"
          >
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            <span className="text-[10px] mt-0.5">Compte</span>
          </button>
        </div>

        {/* Hearts & Status Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error-container/40 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-on-surface">Cœurs : {progress.hearts} / {progress.maxHearts}</span>
              <span className="text-xs text-on-surface-variant">Requis pour jouer et débloquer les indices</span>
            </div>
          </div>
          {progress.hearts < progress.maxHearts && (
            <button
              onClick={() => {
                soundEffects.playReward();
                onRefillHearts();
              }}
              className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary text-xs font-extrabold shadow-sm active:scale-95 transition-all"
            >
              Recharger (-50 💎)
            </button>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="flex flex-col gap-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Statistiques</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Série</span>
              </div>
              <span className="text-2xl font-extrabold text-on-surface mt-1">{progress.streakDays} Jours</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Total XP</span>
              </div>
              <span className="text-2xl font-extrabold text-on-surface mt-1">{progress.totalXp} XP</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-tertiary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  diamond
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Ligue Actuelle</span>
              </div>
              <span className="text-2xl font-extrabold text-on-surface mt-1">Obsidienne</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-secondary-container">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Podiums</span>
              </div>
              <span className="text-2xl font-extrabold text-on-surface mt-1">4 Fois</span>
            </div>
          </div>
        </div>

        {/* Mastered Vocabulary Notebook */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Carnet de Vocabulaire</h3>
            <span className="text-xs font-bold text-primary">{SAVED_VOCABULARY.length} termes</span>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container divide-y divide-surface-container overflow-hidden">
            {SAVED_VOCABULARY.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-on-surface">{item.es}</span>
                    <span className="text-xs text-on-surface-variant font-medium">({item.en})</span>
                  </div>
                  <span className="text-xs text-on-surface-variant/80 italic mt-0.5">"{item.example}"</span>
                </div>
                <button
                  onClick={() => handleSpeak(item.es)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-tertiary hover:bg-surface-container transition-transform active:scale-95 ${
                    playingWord === item.es ? 'scale-90 bg-tertiary text-on-tertiary' : 'bg-surface-container-low'
                  }`}
                  title="Prononcer"
                >
                  <span className="material-symbols-outlined text-[18px]">volume_up</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
