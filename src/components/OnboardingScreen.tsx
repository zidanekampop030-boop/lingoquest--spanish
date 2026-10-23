import React, { useState } from 'react';
import { TargetLanguage } from '../types';
import { APP_ASSETS, AVAILABLE_LANGUAGES } from '../data/curriculum';
import { soundEffects, speakText } from '../utils/audio';

interface OnboardingScreenProps {
  onComplete: (selectedLang: TargetLanguage, dailyGoal: number) => void;
  onOpenLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onOpenLogin }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguage>(AVAILABLE_LANGUAGES[0]);
  const [selectedGoal, setSelectedGoal] = useState<number>(10);

  const handleNext = () => {
    soundEffects.playChipTap();
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      onComplete(selectedLanguage, selectedGoal);
    }
  };

  const handleSelectLang = (lang: TargetLanguage) => {
    soundEffects.playChipTap();
    setSelectedLanguage(lang);
    speakText(lang.nativeName, lang.speechCode);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Top Header / Progress bar */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl pt-safe border-b border-surface-container">
        <div className="h-14 px-4 flex items-center justify-between max-w-md mx-auto">
          {step > 1 ? (
            <button
              onClick={() => {
                soundEffects.playChipTap();
                setStep((s) => s - 1);
              }}
              className="w-10 h-10 flex items-center justify-center text-on-surface rounded-xl hover:bg-surface-container active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <img alt="Logo" className="h-7 w-auto object-contain" src={APP_ASSETS.logo} />
          )}

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dot === step
                    ? 'w-6 bg-primary-container'
                    : dot < step
                    ? 'w-2 bg-primary'
                    : 'w-2 bg-surface-container-high'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              soundEffects.playChipTap();
              onOpenLogin();
            }}
            className="text-xs font-extrabold text-primary px-3 py-1.5 rounded-xl hover:bg-surface-container-high transition-colors"
          >
            Connexion
          </button>
        </div>
      </header>

      {/* Main Slide Content */}
      <main className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-5 py-6">
        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-fadeIn my-auto">
            <div className="relative w-36 h-36 mb-6">
              <div className="w-full h-full rounded-full bg-primary-fixed/30 flex items-center justify-center shadow-inner">
                <img
                  className="w-28 h-28 object-contain rounded-full shadow-sm"
                  alt="Lapin mascotte Pip"
                  src={APP_ASSETS.rabbitMascot || APP_ASSETS.owlMascot}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -top-1 -right-1 text-2xl animate-bounce">✨</span>
            </div>

            <span className="text-primary font-label-sm uppercase tracking-widest font-extrabold mb-1">
              Bienvenue sur LingoQuest
            </span>
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-extrabold leading-tight">
              Apprenez une langue en 5 minutes par jour !
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-xs leading-relaxed">
              Des défis interactifs, un apprentissage ludique et des leçons audio conçus par des linguistes.
            </p>

            <div className="grid grid-cols-3 gap-2 w-full mt-6">
              <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container flex flex-col items-center">
                <span className="material-symbols-outlined text-secondary text-[24px]">local_fire_department</span>
                <span className="text-[11px] font-bold text-on-surface mt-1">Séries de jours</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-[24px]">bolt</span>
                <span className="text-[11px] font-bold text-on-surface mt-1">Gains d'XP</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container flex flex-col items-center">
                <span className="material-symbols-outlined text-tertiary text-[24px]">emoji_events</span>
                <span className="text-[11px] font-bold text-on-surface mt-1">Ligues mondiales</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col animate-fadeIn">
            <div className="text-center mb-5">
              <span className="text-primary font-label-sm uppercase tracking-widest font-extrabold">
                Étape 2 sur 3
              </span>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-extrabold mt-1">
                Quelle langue souhaitez-vous apprendre ?
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Vous pourrez en ajouter d'autres à tout moment.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLang(lang)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-primary-fixed/20 border-primary-container shadow-md'
                        : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{lang.flag}</span>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-base text-on-surface">{lang.name}</span>
                        <span className="text-xs text-on-surface-variant">{lang.level}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                        {lang.nativeName}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col animate-fadeIn my-auto text-center">
            <span className="text-primary font-label-sm uppercase tracking-widest font-extrabold">
              Étape finale
            </span>
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-extrabold mt-1">
              Fixez votre objectif quotidien
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 mb-6">
              La régularité est le secret pour maîtriser une nouvelle langue !
            </p>

            <div className="flex flex-col gap-3">
              {[
                { min: 5, label: 'Occasionnel', desc: '5 min / jour' },
                { min: 10, label: 'Régulier (Recommandé)', desc: '10 min / jour' },
                { min: 15, label: 'Sérieux', desc: '15 min / jour' },
                { min: 20, label: 'Intense', desc: '20 min / jour' },
              ].map((goal) => {
                const isSelected = selectedGoal === goal.min;
                return (
                  <button
                    key={goal.min}
                    onClick={() => {
                      soundEffects.playChipTap();
                      setSelectedGoal(goal.min);
                    }}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-secondary-fixed border-secondary-container shadow-md'
                        : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm text-on-surface">{goal.label}</span>
                      <span className="text-xs text-on-surface-variant">{goal.desc}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-secondary font-bold text-sm">
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      <span>+{goal.min * 5} XP</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Action Tray */}
        <div className="flex flex-col gap-3 pt-6 pb-safe">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-primary-container text-on-primary font-headline-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all border-b-4 border-on-primary-container flex items-center justify-center gap-2"
          >
            <span>{step === 3 ? "C'est parti !" : 'Continuer'}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>

          {step === 1 && (
            <button
              onClick={onOpenLogin}
              className="w-full py-3 text-center text-xs font-bold text-on-surface-variant hover:text-on-surface"
            >
              J'AI DÉJÀ UN COMPTE
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
