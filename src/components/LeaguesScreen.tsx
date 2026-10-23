import React from 'react';
import { UserProgress } from '../types';
import { LEADERBOARD_USERS, APP_ASSETS } from '../data/curriculum';
import { soundEffects } from '../utils/audio';

interface LeaguesScreenProps {
  progress: UserProgress;
  onStartQuiz: () => void;
}

export const LeaguesScreen: React.FC<LeaguesScreenProps> = ({ progress, onStartQuiz }) => {
  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Header Bar */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <img alt="LingoQuest Logo" className="h-7 w-auto object-contain" src={APP_ASSETS.logo} />
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
              Obsidian League
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-secondary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="font-label-md text-label-md text-secondary">{progress.streakDays}</span>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                diamond
              </span>
              <span className="font-label-md text-label-md text-tertiary">{progress.gems}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-3 px-4 max-w-md mx-auto gap-4">
        {/* League Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-inverse-surface to-slate-900 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-center gap-1 text-primary-fixed text-xs uppercase font-extrabold tracking-wider">
              <span className="material-symbols-outlined text-[16px]">emoji_events</span>
              <span>Tier 7 • Top Division</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Obsidian League</h2>
            <p className="text-xs text-slate-300">Top 3 advance to Diamond League!</p>
            <div className="inline-flex items-center gap-1.5 mt-2 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold w-fit">
              <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">timer</span>
              <span>Ends in 2d 14h 32m</span>
            </div>
          </div>
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl shadow-inner border border-white/20">
            💎
          </div>
        </div>

        {/* Promotion Zone Notification */}
        <div className="bg-primary-fixed/30 border border-primary-fixed-dim/60 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">north</span>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              You are currently in the Promotion Zone!
            </span>
          </div>
          <span className="font-bold text-xs bg-primary text-on-primary px-2 py-0.5 rounded-full">
            #3
          </span>
        </div>

        {/* Leaderboard Roster */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container divide-y divide-surface-container overflow-hidden">
          {LEADERBOARD_USERS.map((user) => {
            const isTopThree = user.rank <= 3;
            const isCurrentUser = user.isUser;

            return (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-3.5 transition-colors ${
                  isCurrentUser
                    ? 'bg-primary-fixed/20 font-bold'
                    : 'hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 text-center text-sm font-extrabold ${
                      user.rank === 1
                        ? 'text-secondary-container'
                        : user.rank === 2
                        ? 'text-slate-400'
                        : user.rank === 3
                        ? 'text-secondary'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {user.rank}
                  </span>

                  <img
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-container"
                    src={user.avatar}
                  />

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-on-surface truncate">
                      {isCurrentUser ? `${user.name}` : user.name}
                    </span>
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-secondary">
                        local_fire_department
                      </span>
                      <span>{user.streak} days</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-primary">
                    {isCurrentUser ? progress.totalXp : user.xp} XP
                  </span>
                  {isTopThree && (
                    <span className="material-symbols-outlined text-secondary-container text-[18px]">
                      military_tech
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to earn more XP */}
        <button
          onClick={() => {
            soundEffects.playChipTap();
            onStartQuiz();
          }}
          className="w-full py-4 rounded-2xl bg-primary-container text-on-primary font-headline-sm uppercase tracking-wide border-b-4 border-on-primary-container shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-2"
        >
          <span className="material-symbols-outlined text-[22px]">play_arrow</span>
          <span>Start Practice (+20 XP)</span>
        </button>
      </main>
    </div>
  );
};
