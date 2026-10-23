/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenTab, AppScreen, UserProgress, QuizResultSummary, TargetLanguage, AppSettings, UserProfile } from './types';
import { LearnScreen } from './components/LearnScreen';
import { QuizScreen } from './components/QuizScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { LeaguesScreen } from './components/LeaguesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AuthScreen } from './components/AuthScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ChatScreen } from './components/ChatScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { AVAILABLE_LANGUAGES, APP_ASSETS } from './data/curriculum';
import { soundEffects } from './utils/audio';

export default function App() {
  // User Authentication Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('lingoquest_user');
      if (saved) {
        const profile = JSON.parse(saved) as UserProfile;
        if (profile.id === 'alex-01' || profile.id === 'guest') {
          return { ...profile, isLoggedIn: false };
        }
        return profile;
      }
    } catch {}
    return {
      id: '',
      email: '',
      name: '',
      username: '',
      avatarUrl: APP_ASSETS.userAvatar,
      isLoggedIn: false,
      joinedDate: '',
    };
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() =>
    userProfile.isLoggedIn ? 'learn' : 'onboarding',
  );
  const [activeTab, setActiveTab] = useState<ScreenTab>('learn');

  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('lingoquest_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      soundEffects: true,
      speechSpeed: 'normal',
      dailyGoalMinutes: 10,
      uiLanguage: 'fr',
      vibrationHaptic: true,
      darkMode: false,
      notifications: true,
      listeningExercises: true,
    };
  });

  // Progress State
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('lingoquest_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      hearts: 5,
      maxHearts: 5,
      gems: 850,
      streakDays: 15,
      totalXp: 1420,
      comboCount: 4,
      activeLanguage: 'ES',
      languageFlag: '🇪🇸',
      dailyQuestProgress: 1,
      dailyQuestTotal: 2,
      dailyQuestClaimed: false,
      sofiaCelebrated: false,
      unlockedWordChest: false,
      hasCompletedOnboarding: true,
    };
  });

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('lingoquest_user', JSON.stringify(userProfile));
      localStorage.setItem('lingoquest_settings', JSON.stringify(settings));
      localStorage.setItem('lingoquest_progress', JSON.stringify(progress));
    } catch {}
  }, [userProfile, settings, progress]);

  // Sync Dark Mode class with root document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleToggleDarkMode = () => {
    soundEffects.playChipTap();
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // Current Target Language
  const activeLanguageConfig =
    AVAILABLE_LANGUAGES.find((l) => l.code === progress.activeLanguage) || AVAILABLE_LANGUAGES[0];

  const [quizSummary, setQuizSummary] = useState<QuizResultSummary>({
    totalXpGained: 35,
    accuracy: 92,
    timeSpentSeconds: 105,
    phrasesMasteredCount: 8,
    totalPhrasesCount: 9,
    mistakePhrase: 'la cuenta',
    mistakeMeaning: 'the bill / check',
    bonusGems: 10,
    languageCode: 'ES',
  });

  // Switch tabs from bottom navigation
  const handleSelectTab = (tab: ScreenTab) => {
    setActiveTab(tab);
    if (tab === 'quizzes') {
      setCurrentScreen('active_quiz');
    } else {
      setCurrentScreen(tab);
    }
  };

  // Launch Active Quiz
  const handleStartQuiz = (_nodeId?: number) => {
    setCurrentScreen('active_quiz');
  };

  // Complete Quiz & transition to Celebration Screen
  const handleCompleteQuiz = (stats: { xp: number; accuracy: number; timeSec: number }) => {
    setQuizSummary((prev) => ({
      ...prev,
      totalXpGained: stats.xp,
      accuracy: stats.accuracy,
      timeSpentSeconds: stats.timeSec,
      languageCode: progress.activeLanguage,
    }));
    setCurrentScreen('completion');
  };

  // Claim Rewards & return to Learn Path
  const handleClaimAndContinue = () => {
    setProgress((prev) => ({
      ...prev,
      totalXp: prev.totalXp + quizSummary.totalXpGained,
      gems: prev.gems + quizSummary.bonusGems,
      dailyQuestProgress: Math.min(prev.dailyQuestTotal, prev.dailyQuestProgress + 1),
    }));
    setCurrentScreen('learn');
    setActiveTab('learn');
  };

  // Heart modification
  const handleUpdateHearts = (delta: number) => {
    setProgress((prev) => ({
      ...prev,
      hearts: Math.max(0, Math.min(prev.maxHearts, prev.hearts + delta)),
    }));
  };

  // Heart refill
  const handleRefillHearts = () => {
    if (progress.gems < 50) return;
    setProgress((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
      gems: prev.gems - 50,
    }));
  };

  const handleUpdateXp = (bonusXp: number) => {
    setProgress((prev) => ({
      ...prev,
      totalXp: prev.totalXp + bonusXp,
    }));
  };

  // Switch Target Language
  const handleSelectLanguage = (lang: TargetLanguage) => {
    setProgress((prev) => ({
      ...prev,
      activeLanguage: lang.code,
      languageFlag: lang.flag,
    }));
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Complete Onboarding
  const handleCompleteOnboarding = (selectedLang: TargetLanguage, dailyGoal: number) => {
    setProgress((prev) => ({
      ...prev,
      activeLanguage: selectedLang.code,
      languageFlag: selectedLang.flag,
      hasCompletedOnboarding: true,
    }));
    setSettings((prev) => ({ ...prev, dailyGoalMinutes: dailyGoal }));
    setCurrentScreen('auth');
  };

  // Auth Success
  const handleAuthSuccess = (user: UserProfile) => {
    setUserProfile(user);
    setCurrentScreen('learn');
    setActiveTab('learn');
  };

  // Logout
  const handleLogout = () => {
    setUserProfile((prev) => ({ ...prev, isLoggedIn: false }));
    setCurrentScreen('auth');
  };

  // Reset Progress
  const handleResetProgress = () => {
    setProgress({
      hearts: 5,
      maxHearts: 5,
      gems: 200,
      streakDays: 1,
      totalXp: 0,
      comboCount: 1,
      activeLanguage: 'ES',
      languageFlag: '🇪🇸',
      dailyQuestProgress: 0,
      dailyQuestTotal: 2,
      dailyQuestClaimed: false,
      sofiaCelebrated: false,
      unlockedWordChest: false,
      hasCompletedOnboarding: true,
    });
    setCurrentScreen('learn');
    setActiveTab('learn');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start sm:py-6 selection:bg-primary-container selection:text-white">
      {/* Top Quick Screen Switcher for direct testing & review */}
      {userProfile.isLoggedIn && (
        <div className="w-full max-w-md px-3 py-2 flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md sm:rounded-2xl border border-slate-800 mb-2 overflow-x-auto gap-2">
          <span className="font-bold text-slate-400 flex items-center gap-1.5 shrink-0 pr-1">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            Écrans :
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'onboarding', label: 'Présentation' },
              { id: 'auth', label: 'Login / Inscription' },
              { id: 'settings', label: 'Paramètres' },
              { id: 'learn', label: '1. Parcours' },
              { id: 'active_quiz', label: '2. Quiz' },
              { id: 'completion', label: '3. Victoire' },
              { id: 'leagues', label: 'Ligues' },
              { id: 'chat', label: 'Chat Serveur' },
              { id: 'profile', label: 'Profil' },
            ].map((screen) => (
              <button
                key={screen.id}
                onClick={() => {
                  soundEffects.playChipTap();
                  setCurrentScreen(screen.id as AppScreen);
                  if (['learn', 'quizzes', 'leagues', 'chat', 'profile'].includes(screen.id)) {
                    setActiveTab(screen.id as ScreenTab);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 ${
                  currentScreen === screen.id
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {screen.label}
              </button>
            ))}
          </div>

          {/* Quick Dark Mode Button in Top Switcher */}
          <button
            onClick={handleToggleDarkMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold transition-all shrink-0 ml-1 border border-slate-700"
            title={settings.darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {settings.darkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="text-[11px] hidden sm:inline">
              {settings.darkMode ? 'Clair' : 'Sombre'}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Frame Container */}
      <div className={`w-full sm:max-w-md min-h-screen sm:min-h-220 bg-surface sm:rounded-[36px] shadow-2xl relative overflow-hidden flex flex-col sm:border sm:border-slate-800 ${settings.darkMode ? 'dark text-slate-100' : ''}`}>
        {/* Render Current Screen */}
        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onComplete={handleCompleteOnboarding}
            onOpenLogin={() => setCurrentScreen('auth')}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            onSuccess={handleAuthSuccess}
            onBack={
              userProfile.isLoggedIn
                ? () => {
                    setCurrentScreen('learn');
                    setActiveTab('learn');
                  }
                : undefined
            }
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            activeLanguage={activeLanguageConfig}
            user={userProfile}
            onUpdateSettings={handleUpdateSettings}
            onSelectLanguage={handleSelectLanguage}
            onBack={() => {
              setCurrentScreen('learn');
              setActiveTab('learn');
            }}
            onLogout={handleLogout}
            onResetProgress={handleResetProgress}
          />
        )}

        {currentScreen === 'learn' && (
          <LearnScreen
            progress={progress}
            isDarkMode={settings.darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onStartQuiz={handleStartQuiz}
            onUpdateProgress={setProgress}
            onOpenProfile={() => {
              setActiveTab('profile');
              setCurrentScreen('profile');
            }}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        )}

        {currentScreen === 'active_quiz' && (
          <QuizScreen
            progress={progress}
            onBack={() => {
              setCurrentScreen('learn');
              setActiveTab('learn');
            }}
            onCompleteQuiz={handleCompleteQuiz}
            onUpdateHearts={handleUpdateHearts}
          />
        )}

        {currentScreen === 'completion' && (
          <CompletionScreen
            progress={progress}
            summary={quizSummary}
            onClaimAndContinue={handleClaimAndContinue}
            onBack={() => {
              setCurrentScreen('learn');
              setActiveTab('learn');
            }}
            onUpdateXp={handleUpdateXp}
          />
        )}

        {currentScreen === 'leagues' && (
          <LeaguesScreen
            progress={progress}
            onStartQuiz={() => setCurrentScreen('active_quiz')}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            user={userProfile}
            activeLanguage={activeLanguageConfig}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            progress={progress}
            user={userProfile}
            onRefillHearts={handleRefillHearts}
            onOpenSettings={() => setCurrentScreen('settings')}
            onOpenLogin={() => setCurrentScreen('auth')}
          />
        )}

        {/* Global Bottom Navigation Bar (Visible on primary tabs) */}
        {['learn', 'leagues', 'chat', 'profile'].includes(currentScreen) && (
          <BottomNavBar activeTab={activeTab} onSelectTab={handleSelectTab} />
        )}
      </div>
    </div>
  );
}
