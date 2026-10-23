import React, { useState, useEffect } from 'react';
import { UserProgress, QuizResultSummary } from '../types';
import { APP_ASSETS } from '../data/curriculum';
import { ConfettiCanvas } from './ConfettiCanvas';
import { ReviewMistakeModal } from './ReviewMistakeModal';
import { soundEffects } from '../utils/audio';

interface CompletionScreenProps {
  progress: UserProgress;
  summary: QuizResultSummary;
  onClaimAndContinue: () => void;
  onBack: () => void;
  onUpdateXp: (xp: number) => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  progress,
  summary,
  onClaimAndContinue,
  onBack,
  onUpdateXp,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [mistakeReviewed, setMistakeReviewed] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    soundEffects.playVictoryFanfare();
  }, []);

  const handleShare = () => {
    soundEffects.playReward();
    setCopiedShare(true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText("🏆 I just cleared Stage 4 on LingoQuest with 92% accuracy and kept my 15-day streak alive! 🔥").catch(() => {});
    }
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleReviewSuccess = () => {
    setMistakeReviewed(true);
    onUpdateXp(5);
  };

  const formattedTime = `${Math.floor(summary.timeSpentSeconds / 60)}m ${summary.timeSpentSeconds % 60}s`;

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface relative">
      {/* Confetti Particle System */}
      <ConfettiCanvas />

      {/* Top Header Bar */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playChipTap();
                onBack();
              }}
              className="w-11 h-11 flex items-center justify-center text-on-surface rounded-xl hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <img alt="LingoQuest App Logo" className="h-7 w-auto object-contain" src={APP_ASSETS.logo} />
            <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight line-clamp-1">
              Active Quiz Session
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2.5 py-1 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-error text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <span className="font-label-md text-label-md text-error">{progress.hearts}</span>
            </div>
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container"
              src={APP_ASSETS.userAvatar}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-2 pb-safe bg-surface z-20">
        <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-20 gap-5">
          {/* Mascot Victory Hero Card */}
          <div className="relative flex flex-col items-center justify-center text-center mt-2 pt-2">
            {/* Glow Aura Behind Mascot */}
            <div className="absolute -top-4 w-48 h-48 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />

            {/* Mascot Celebration Presentation */}
            <div className="relative w-40 h-40 mb-2 flex items-center justify-center">
              {/* Floating Stars / Sparkle SVG Accents */}
              <svg
                className="absolute -top-2 -left-3 w-7 h-7 text-secondary-container animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
              </svg>
              <svg
                className="absolute -top-1 -right-2 w-6 h-6 text-tertiary-container animate-bounce"
                fill="currentColor"
                style={{ animationDuration: '2.5s' }}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
              </svg>
              <svg
                className="absolute bottom-2 -right-4 w-5 h-5 text-secondary-fixed-dim"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
              </svg>

              {/* Rabbit Mascot Character */}
              <div className="w-36 h-36 rounded-full bg-surface-container-lowest p-1 shadow-md flex items-center justify-center">
                <img
                  className="w-full h-full object-contain rounded-full"
                  alt="Lapin champion en fête"
                  src={APP_ASSETS.celebrationRabbit || APP_ASSETS.celebrationBird}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Celebratory Headline */}
            <div className="flex flex-col items-center gap-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider shadow-sm font-extrabold">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
                Stage 4 Cleared!
              </span>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight mt-1 font-extrabold">
                ¡Fantástico!
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Lesson Completed with flying colors! 🎉
              </p>
            </div>
          </div>

          {/* Triple Metric Pill Stats */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {/* Total XP Card */}
            <div className="flex flex-col items-center justify-center py-3.5 px-1 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1 text-primary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Total XP</span>
              <span className="font-stat-counter text-stat-counter text-primary mt-0.5 font-extrabold">
                +{summary.totalXpGained} XP
              </span>
            </div>

            {/* Accuracy Card */}
            <div className="flex flex-col items-center justify-center py-3.5 px-1 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1 text-primary-container">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  track_changes
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Accuracy</span>
              <span className="font-stat-counter text-stat-counter text-primary mt-0.5 font-extrabold">
                {summary.accuracy}%
              </span>
            </div>

            {/* Speed / Time Card */}
            <div className="flex flex-col items-center justify-center py-3.5 px-1 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1 text-tertiary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  timer
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Speed</span>
              <span className="font-stat-counter text-stat-counter text-tertiary mt-0.5 font-extrabold">
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Streak Flame Progression Widget */}
          <div className="flex flex-col w-full p-4 rounded-2xl bg-surface-container-lowest shadow-sm gap-3 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary-container">
                  <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                    {progress.streakDays}-Day Streak!
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    You're unstoppable this week
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-secondary font-bold">
                +1 Day
              </span>
            </div>

            {/* 7-Day Visual Tracker Row */}
            <div className="grid grid-cols-7 gap-1 w-full pt-1">
              {['M', 'T', 'W', 'T', 'F'].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{day}</span>
                  <div className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary-container shadow-xs">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      local_fire_department
                    </span>
                  </div>
                </div>
              ))}

              {/* Saturday (Today - Active Glowing) */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-label-sm text-label-sm text-secondary font-bold">S</span>
                <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary flex items-center justify-center shadow-md scale-105 transition-transform animate-pulse">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                </div>
              </div>

              {/* Sunday (Upcoming Locked) */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-label-sm text-label-sm text-outline">S</span>
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Breakdown Card */}
          <div className="flex flex-col w-full p-4 rounded-2xl bg-surface-container-lowest shadow-sm gap-3 border border-surface-container">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Lesson Insights</h3>
              <span className="font-label-md text-label-md text-primary font-bold">Mastery High</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Perfect Recall Item */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">Perfect Recall</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {summary.phrasesMasteredCount} phrases mastered without hints
                    </span>
                  </div>
                </div>
                <span className="font-label-lg text-label-lg text-primary font-bold">
                  {summary.phrasesMasteredCount}/{summary.totalPhrasesCount}
                </span>
              </div>

              {/* Needs Review Item */}
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-error-container/40 border border-error-container">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">priority_high</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-error-container font-bold">
                        Needs Quick Review
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        "{summary.mistakePhrase || 'la cuenta'}" ({summary.mistakeMeaning || 'the bill / check'})
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundEffects.playChipTap();
                    setShowReviewModal(true);
                  }}
                  disabled={mistakeReviewed}
                  className={`self-end px-3 py-1 rounded-lg font-label-sm text-label-sm flex items-center gap-1 shadow-sm active:scale-95 transition-all ${
                    mistakeReviewed
                      ? 'bg-surface-container text-primary font-bold'
                      : 'bg-surface-container-lowest text-error font-bold'
                  }`}
                  id="review-chip"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {mistakeReviewed ? 'check_circle' : 'replay'}
                  </span>
                  <span>{mistakeReviewed ? 'Reviewed (+5 XP)!' : 'Review Mistake (+5 XP)'}</span>
                </button>
              </div>

              {/* Gems & Bonus Reward Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      diamond
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">Bonus Gems Found</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      For scoring above 90% accuracy
                    </span>
                  </div>
                </div>
                <span className="font-stat-counter text-stat-counter text-tertiary font-extrabold">
                  +{summary.bonusGems} 💎
                </span>
              </div>
            </div>
          </div>

          {/* Action Section Deck */}
          <div className="flex flex-col w-full gap-3 pt-1 pb-4">
            {/* Huge Bright 3D Tactile Primary Button */}
            <button
              onClick={() => {
                soundEffects.playCorrect();
                onClaimAndContinue();
              }}
              className="w-full relative py-4 px-4 rounded-2xl bg-primary-container text-on-primary font-headline-md text-headline-md shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2 border-b-4 border-on-primary-container"
              id="claim-button"
            >
              <span>CLAIM REWARDS & CONTINUE</span>
              <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
            </button>

            {/* Secondary Share Button */}
            <button
              onClick={handleShare}
              className="w-full py-3.5 px-4 rounded-2xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-surface-container"
              id="share-button"
            >
              <span
                className="material-symbols-outlined text-[20px] text-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                celebration
              </span>
              <span>{copiedShare ? 'Copied Achievement Link!' : 'Share Achievement'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Review Mistake Interactive Modal */}
      <ReviewMistakeModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};
