import React, { useState } from 'react';
import { UserProfile } from '../types';
import { APP_ASSETS } from '../data/curriculum';
import { soundEffects } from '../utils/audio';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onBack, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    soundEffects.playReward();

    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: `user-${Date.now()}`,
        email: email,
        name: mode === 'signup' ? (name || 'Nouvel Apprenant') : (email.split('@')[0]),
        username: `@${email.split('@')[0]}`,
        avatarUrl: APP_ASSETS.userAvatar,
        isLoggedIn: true,
        joinedDate: 'Octobre 2026',
      };
      onSuccess(user);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl pt-safe border-b border-surface-container">
        <div className="h-14 px-4 flex items-center justify-between max-w-md mx-auto">
          {onBack ? (
            <button
              onClick={() => {
                soundEffects.playChipTap();
                onBack();
              }}
              className="w-10 h-10 flex items-center justify-center text-on-surface rounded-xl hover:bg-surface-container active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <div className="w-10" />
          )}
          <img alt="LingoQuest Logo" className="h-7 w-auto object-contain" src={APP_ASSETS.logo} />
          <div className="w-10" />
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-5 py-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed/40 flex items-center justify-center mb-3 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[32px]">
              {mode === 'login' ? 'lock' : 'person_add'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
            {mode === 'login' ? 'Bon retour parmi nous !' : 'Créez votre profil'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {mode === 'login'
              ? 'Connectez-vous pour synchroniser votre série et votre XP.'
              : 'Sauvegardez vos progrès et rejoignez les ligues compétitives.'}
          </p>
        </div>

        {/* Tab Toggle: Connexion vs Inscription */}
        <div className="flex p-1 bg-surface-container rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              soundEffects.playChipTap();
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              soundEffects.playChipTap();
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface-variant">Nom ou pseudo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Sophie M."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm border border-surface-container focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-on-surface-variant">Adresse e-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm border border-surface-container focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-on-surface-variant">Mot de passe</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-surface-container-low rounded-xl text-sm border border-surface-container focus:outline-none focus:border-primary text-on-surface"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-4 rounded-2xl bg-primary-container text-on-primary font-headline-sm uppercase tracking-wide border-b-4 border-on-primary-container shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Se connecter' : 'Valider & Commencer'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

      </main>
    </div>
  );
};
