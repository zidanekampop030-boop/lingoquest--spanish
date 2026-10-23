import React, { useState } from 'react';
import { TargetLanguage, AppSettings, UserProfile } from '../types';
import { AVAILABLE_LANGUAGES, APP_ASSETS } from '../data/curriculum';
import { soundEffects, speakText } from '../utils/audio';

interface SettingsScreenProps {
  settings: AppSettings;
  activeLanguage: TargetLanguage;
  user: UserProfile;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSelectLanguage: (lang: TargetLanguage) => void;
  onBack: () => void;
  onLogout: () => void;
  onResetProgress: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  activeLanguage,
  user,
  onUpdateSettings,
  onSelectLanguage,
  onBack,
  onLogout,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'learning' | 'audio' | 'account'>('learning');

  const handleToggleSound = () => {
    const nextVal = !settings.soundEffects;
    soundEffects.enabled = nextVal;
    if (nextVal) soundEffects.playChipTap();
    onUpdateSettings({ soundEffects: nextVal });
  };

  const handleLanguagePick = (lang: TargetLanguage) => {
    soundEffects.playChipTap();
    onSelectLanguage(lang);
    speakText(lang.nativeName, lang.speechCode);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface pb-12">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl pt-safe border-b border-surface-container">
        <div className="h-14 px-4 flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => {
              soundEffects.playChipTap();
              onBack();
            }}
            className="w-10 h-10 flex items-center justify-center text-on-surface rounded-xl hover:bg-surface-container active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Paramètres</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-4 gap-5">
        {/* Section 1: Langue d'apprentissage */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-primary uppercase font-extrabold tracking-wider">
              Langue à apprendre
            </span>
            <span className="text-xs font-bold text-on-surface-variant">
              Actuelle: {activeLanguage.flag} {activeLanguage.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isSelected = activeLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguagePick(lang)}
                  className={`p-3 rounded-2xl flex items-center gap-2.5 border-2 transition-all active:scale-95 text-left ${
                    isSelected
                      ? 'bg-primary-fixed/30 border-primary-container shadow-sm'
                      : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low'
                  }`}
                >
                  <span className="text-2xl leading-none">{lang.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface truncate">{lang.name}</span>
                    <span className="text-[10px] text-on-surface-variant truncate">{lang.nativeName}</span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[18px] ml-auto">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Préférences Audio & Objectif */}
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-surface-container flex flex-col gap-4">
          <span className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider">
            Audio & Rythme
          </span>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">volume_up</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-on-surface">Effets sonores</span>
                <span className="text-xs text-on-surface-variant">Chimes de victoire & feedback tactile</span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                settings.soundEffects ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform ${
                  settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Speech speed */}
          <div className="flex items-center justify-between py-1 border-t border-surface-container pt-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">speed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-on-surface">Vitesse de prononciation</span>
                <span className="text-xs text-on-surface-variant">Vitesse de lecture par défaut</span>
              </div>
            </div>
            <div className="flex bg-surface-container rounded-xl p-0.5">
              <button
                onClick={() => {
                  soundEffects.playChipTap();
                  onUpdateSettings({ speechSpeed: 'normal' });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  settings.speechSpeed === 'normal'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant'
                }`}
              >
                1.0x
              </button>
              <button
                onClick={() => {
                  soundEffects.playChipTap();
                  onUpdateSettings({ speechSpeed: 'slow' });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  settings.speechSpeed === 'slow'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant'
                }`}
              >
                0.7x 🐢
              </button>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="flex flex-col gap-2 border-t border-surface-container pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">target</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-on-surface">Objectif quotidien</span>
                  <span className="text-xs text-on-surface-variant">Temps recommandé d'étude par jour</span>
                </div>
              </div>
              <span className="font-extrabold text-sm text-secondary">{settings.dailyGoalMinutes} min</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[5, 10, 15, 20].map((min) => (
                <button
                  key={min}
                  onClick={() => {
                    soundEffects.playChipTap();
                    onUpdateSettings({ dailyGoalMinutes: min });
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    settings.dailyGoalMinutes === min
                      ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary-container'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2.5: Apparence & Mode Sombre */}
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-surface-container flex flex-col gap-3">
          <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
            Apparence
          </span>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">
                  {settings.darkMode ? 'dark_mode' : 'light_mode'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-on-surface">Mode Sombre</span>
                <span className="text-xs text-on-surface-variant">Thème sombre pour soulager les yeux la nuit</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundEffects.playChipTap();
                onUpdateSettings({ darkMode: !settings.darkMode });
              }}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                settings.darkMode ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform ${
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 3: Compte & Profil */}
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-surface-container flex flex-col gap-3">
          <span className="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
            Compte & Synchronisation
          </span>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-container"
                src={user.avatarUrl || APP_ASSETS.userAvatar}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-on-surface">{user.name}</span>
                <span className="text-xs text-on-surface-variant truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundEffects.playChipTap();
                onLogout();
              }}
              className="px-3 py-1.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface hover:bg-error-container hover:text-error transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Section 4: Zone Danger / Réinitialisation */}
        <div className="p-4 rounded-3xl bg-error-container/30 border border-error-container flex flex-col gap-2">
          <span className="text-xs font-bold text-on-error-container uppercase tracking-wider">
            Gestion des données
          </span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Vous pouvez remettre votre série, vos XP et vos quiz à zéro si vous souhaitez recommencer le cursus.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="mt-1 py-2.5 px-3 rounded-xl bg-surface-container-lowest text-error font-bold text-xs border border-error/20 hover:bg-error hover:text-white transition-colors self-start"
            >
              Réinitialiser la progression
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => {
                  soundEffects.playError();
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="py-2 px-3 rounded-xl bg-error text-white font-bold text-xs shadow-sm"
              >
                Confirmer l'effacement
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-3 rounded-xl bg-surface-container text-xs font-bold text-on-surface"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
