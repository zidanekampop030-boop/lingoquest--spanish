import React, { useState } from 'react';
import { UserProgress, TargetLanguage } from '../types';
import { APP_ASSETS, AVAILABLE_LANGUAGES } from '../data/curriculum';
import { soundEffects, speakText } from '../utils/audio';
import { GuidebookModal } from './GuidebookModal';
import { VocabChestModal } from './VocabChestModal';
import { LightningSprintModal } from './LightningSprintModal';

interface LearnScreenProps {
  progress: UserProgress;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onStartQuiz: (nodeId?: number) => void;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  progress,
  isDarkMode,
  onToggleDarkMode,
  onStartQuiz,
  onUpdateProgress,
  onOpenProfile,
  onOpenSettings,
}) => {
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [showVocabChest, setShowVocabChest] = useState(false);
  const [showSprint, setShowSprint] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [highFiveCelebrated, setHighFiveCelebrated] = useState(progress.sofiaCelebrated);

  const currentLang: TargetLanguage =
    AVAILABLE_LANGUAGES.find((l) => l.code === progress.activeLanguage) || AVAILABLE_LANGUAGES[0];

  const handleHighFive = () => {
    soundEffects.playReward();
    setHighFiveCelebrated(true);
    onUpdateProgress((prev) => ({
      ...prev,
      sofiaCelebrated: true,
      totalXp: prev.totalXp + 5,
    }));
  };

  const handleChestReward = (gems: number) => {
    onUpdateProgress((prev) => ({
      ...prev,
      gems: prev.gems + gems,
      unlockedWordChest: true,
    }));
  };

  const handleSprintComplete = (xp: number) => {
    onUpdateProgress((prev) => ({
      ...prev,
      totalXp: prev.totalXp + xp,
    }));
  };

  const handleSelectLanguage = (lang: TargetLanguage) => {
    soundEffects.playChipTap();
    onUpdateProgress((p) => ({
      ...p,
      activeLanguage: lang.code,
      languageFlag: lang.flag,
    }));
    setShowLanguagePicker(false);
    speakText(lang.nativeName, lang.speechCode);
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Header Bar */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Logo & Language Switcher */}
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              alt="LingoQuest App Logo"
              className="h-8 w-auto object-contain shrink-0"
              src={APP_ASSETS.logo}
            />
            <div className="relative">
              <button
                onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                className="flex items-center gap-1 bg-surface-container px-2.5 py-1.5 rounded-xl min-h-10 hover:bg-surface-container-high transition-colors active:scale-95"
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="font-label-md text-label-md text-on-surface uppercase">{currentLang.code}</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </button>

              {/* Language Selection Dropdown */}
              {showLanguagePicker && (
                <div className="absolute left-0 mt-1.5 w-48 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-1.5 z-50 animate-fadeIn">
                  <div className="text-[10px] font-extrabold uppercase text-on-surface-variant px-2 py-1">
                    Choisir la langue
                  </div>
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl text-xs font-bold transition-colors ${
                        lang.code === currentLang.code
                          ? 'bg-primary-fixed/30 text-primary'
                          : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {lang.code === currentLang.code && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats & Settings */}
          <div className="flex items-center gap-2">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] min-h-9">
              <span className="material-symbols-outlined text-secondary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="font-label-md text-label-md text-secondary">{progress.streakDays}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] min-h-9">
              <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                diamond
              </span>
              <span className="font-label-md text-label-md text-tertiary">{progress.gems}</span>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => {
                soundEffects.playChipTap();
                onToggleDarkMode();
              }}
              className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
              title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Settings Quick Access Button */}
            <button
              onClick={() => {
                soundEffects.playChipTap();
                onOpenSettings();
              }}
              className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
              title="Paramètres"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col relative w-full pt-3 px-4 max-w-md mx-auto gap-5 select-none">
        {/* Unit Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-primary shadow-sm text-on-primary p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-primary-fixed font-label-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>{currentLang.sectionName}</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-primary mt-1">
                {currentLang.unitName}
              </h2>
              <p className="font-body-sm text-body-sm text-surface-container-high opacity-90">
                {currentLang.unitDescription}
              </p>
            </div>
            <button
              onClick={() => {
                soundEffects.playChipTap();
                setShowGuidebook(true);
              }}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 active:scale-95 transition-all text-on-primary shrink-0"
              title="Guide de l'unité"
            >
              <span className="material-symbols-outlined text-[24px]">auto_stories</span>
            </button>
          </div>

          {/* Progress Meter */}
          <div className="flex items-center gap-3 mt-1 pt-2 border-t border-on-primary/15">
            <div className="flex-1 bg-surface-container-lowest/25 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-primary-fixed h-full rounded-full transition-all duration-700 shadow-sm relative"
                style={{ width: '75%' }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-surface-container-lowest/40 rounded-full" />
              </div>
            </div>
            <span className="font-label-md text-label-md text-primary-fixed-dim whitespace-nowrap">6 / 8 Leçons</span>
          </div>
        </div>

        {/* Gamified Learning Path Map */}
        <div className="relative flex flex-col items-center justify-center py-2 my-1">
          {/* SVG Winding Path Background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            fill="none"
            preserveAspectRatio="none"
            stroke="currentColor"
            viewBox="0 0 340 540"
          >
            <path
              className="text-surface-container-highest"
              d="M 170 30 C 250 80, 270 120, 210 180 C 150 240, 80 270, 130 350 C 170 410, 230 430, 170 510"
              stroke="#dbe3f4"
              strokeDasharray="1 18"
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>

          {/* Node 1: Completed */}
          <div
            onClick={() => {
              soundEffects.playChipTap();
              onStartQuiz(1);
            }}
            className="relative z-10 self-center translate-x-12 mb-6 flex flex-col items-center group cursor-pointer"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shadow-md active:translate-y-1 transition-transform border-b-4 border-on-primary-container">
                <span className="material-symbols-outlined text-on-primary text-[32px]">check</span>
              </div>
              <div className="absolute -top-2.5 -right-2 bg-secondary-container text-on-secondary px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1.5 bg-surface-container-lowest px-2 py-0.5 rounded-lg shadow-sm">
              Introduction
            </span>
          </div>

          {/* Node 2: Completed */}
          <div
            onClick={() => {
              soundEffects.playChipTap();
              onStartQuiz(2);
            }}
            className="relative z-10 self-center -translate-x-14 mb-6 flex flex-col items-center cursor-pointer"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shadow-md active:translate-y-1 transition-transform border-b-4 border-on-primary-container">
                <span className="material-symbols-outlined text-on-primary text-[32px]">restaurant</span>
              </div>
              <div className="absolute -top-2.5 -right-2 bg-secondary-container text-on-secondary px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1.5 bg-surface-container-lowest px-2 py-0.5 rounded-lg shadow-sm">
              Boissons & Café
            </span>
          </div>

          {/* Node 3: Current Active Node */}
          <div className="relative z-20 self-center translate-x-2 my-4 flex flex-col items-center">
            <div className="animate-bounce mb-2 bg-surface-container-lowest px-3 py-1 rounded-xl shadow-md border-b-2 border-secondary-container flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
              <span className="font-label-md text-label-md text-secondary font-extrabold uppercase tracking-wide">
                START +20 XP
              </span>
            </div>

            <button
              onClick={() => {
                soundEffects.playChipTap();
                onStartQuiz(3);
              }}
              className="relative w-20 h-20 rounded-full bg-primary-container p-1 shadow-lg active:translate-y-1 transition-transform group border-b-[6px] border-on-primary-container flex items-center justify-center"
            >
              <span className="w-full h-full rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-inner">
                <span className="material-symbols-outlined text-[40px] text-primary group-hover:scale-110 transition-transform">
                  restaurant_menu
                </span>
              </span>
              <span
                className="absolute -inset-1 rounded-full border-2 border-dashed border-secondary-container/60 animate-spin"
                style={{ animationDuration: '9s' }}
              />
            </button>
            <span className="font-headline-sm text-headline-sm text-on-surface mt-2 font-extrabold">
              L'Addition s'il vous plaît
            </span>
          </div>

          {/* Node 3.5: Side Bonus Chest */}
          <div
            onClick={() => {
              soundEffects.playChipTap();
              setShowVocabChest(true);
            }}
            className="relative z-10 self-center translate-x-24 -mt-4 mb-6 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center shadow-md active:translate-y-1 transition-transform border-b-4 border-secondary group-hover:rotate-3">
              <span
                className="material-symbols-outlined text-secondary text-[30px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock_open
              </span>
            </div>
            <div className="mt-1 bg-secondary text-on-secondary px-2 py-0.5 rounded-full text-[11px] font-label-sm font-extrabold shadow-sm flex items-center gap-0.5">
              <span>Coffre Bonus</span>
            </div>
          </div>

          {/* Node 4: Locked Lesson */}
          <div className="relative z-10 self-center -translate-x-10 my-4 flex flex-col items-center opacity-70">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center shadow-sm border-b-4 border-outline-variant">
              <span className="material-symbols-outlined text-outline text-[28px]">lock</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1.5">Régimes & Préférences</span>
          </div>

          {/* Node 5: Milestone */}
          <div className="relative z-10 self-center translate-x-4 mt-2 flex flex-col items-center opacity-55">
            <div className="w-18 h-18 rounded-2xl bg-surface-container-highest p-3 flex items-center justify-center shadow-sm border-b-4 border-outline-variant">
              <span className="material-symbols-outlined text-outline text-[36px]">military_tech</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1.5 font-bold">
              Bilan de l'Unité
            </span>
          </div>
        </div>

        {/* Lightning Practice Quick Action */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 border-b-4 border-surface-container-highest hover:border-tertiary-container transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[28px]">bolt</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">Sprint Éclair</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Révisez 10 mots en chrono</span>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playChipTap();
              setShowSprint(true);
            }}
            className="bg-tertiary hover:bg-on-tertiary-container text-on-tertiary font-label-md text-label-md px-3.5 py-2 rounded-xl border-b-4 border-on-tertiary-fixed-variant active:translate-y-1 active:border-b-0 transition-all flex items-center gap-1 shrink-0"
          >
            <span>+10 XP</span>
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
          </button>
        </div>

        {/* Daily Quest Widget */}
        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2 shadow-sm border-b-2 border-surface-container-high">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary-container text-[22px]">target</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Quête du Jour</span>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-full font-bold">
              Reset dans 7h
            </span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 mt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-on-surface font-semibold">
                Finir 2 quiz sans aucune erreur
              </span>
              <div className="flex items-center gap-1 text-tertiary font-label-md text-label-md">
                <span className="material-symbols-outlined text-[18px]">diamond</span>
                <span>+15</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 bg-surface-container-high h-3 rounded-full overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full transition-all duration-500"
                  style={{ width: `${(progress.dailyQuestProgress / progress.dailyQuestTotal) * 100}%` }}
                />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                {progress.dailyQuestProgress} / {progress.dailyQuestTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Social Mini Ticker */}
        <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm flex items-center justify-between gap-2 border border-surface-container">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 shrink-0">
              <img
                alt="Sofia"
                className="w-10 h-10 rounded-full object-cover shadow-inner"
                src={APP_ASSETS.sofiaAvatar}
              />
              <span className="absolute -bottom-1 -right-1 text-xs">{currentLang.flag}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-body-sm text-body-sm text-on-surface truncate">
                <span className="font-bold">Sofia</span> a atteint <span className="font-bold text-secondary">10 jours de série !</span>
              </p>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Il y a 25 minutes</span>
            </div>
          </div>
          <button
            onClick={handleHighFive}
            disabled={highFiveCelebrated}
            className={`font-label-sm text-label-sm px-3 py-1.5 rounded-xl border-b-2 active:translate-y-0.5 transition-all flex items-center gap-1 shrink-0 ${
              highFiveCelebrated
                ? 'bg-secondary-container text-on-secondary border-secondary'
                : 'bg-surface-container-high hover:bg-secondary-fixed text-on-surface border-outline-variant'
            }`}
          >
            <span>🙌</span>
            <span>{highFiveCelebrated ? 'Fêté !' : 'High Five'}</span>
          </button>
        </div>
      </main>

      {/* Guidebook Modal */}
      <GuidebookModal isOpen={showGuidebook} onClose={() => setShowGuidebook(false)} />

      {/* Vocab Chest Modal */}
      <VocabChestModal
        isOpen={showVocabChest}
        onClose={() => setShowVocabChest(false)}
        onRewardClaimed={handleChestReward}
      />

      {/* Lightning Sprint Modal */}
      <LightningSprintModal
        isOpen={showSprint}
        onClose={() => setShowSprint(false)}
        onComplete={handleSprintComplete}
      />
    </div>
  );
};
