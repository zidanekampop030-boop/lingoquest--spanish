import React from 'react';
import { ScreenTab } from '../types';
import { soundEffects } from '../utils/audio';

interface BottomNavBarProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { key: 'learn' as ScreenTab, label: 'Parcours', icon: 'menu_book' },
    { key: 'quizzes' as ScreenTab, label: 'Quiz', icon: 'bolt' },
    { key: 'leagues' as ScreenTab, label: 'Ligues', icon: 'emoji_events' },
    { key: 'chat' as ScreenTab, label: 'Chat', icon: 'forum' },
    { key: 'profile' as ScreenTab, label: 'Profil', icon: 'military_tech' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 w-full z-40 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-surface-container/60">
      <div className="flex justify-around items-center h-20 px-4 max-w-md mx-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                soundEffects.playChipTap();
                onSelectTab(t.key);
              }}
              className={`flex flex-col items-center justify-center gap-1 min-w-14 min-h-11 px-2 py-1 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? 'bg-surface-container-high text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {t.icon}
              </span>
              <span className="font-label-sm text-label-sm">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
