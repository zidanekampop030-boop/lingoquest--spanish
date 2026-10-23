import React, { useState, useEffect } from 'react';
import { UserProgress, QuizQuestion } from '../types';
import { APP_ASSETS, ALL_QUIZZES, AVAILABLE_LANGUAGES } from '../data/curriculum';
import { soundEffects, speakText } from '../utils/audio';

interface QuizScreenProps {
  progress: UserProgress;
  onBack: () => void;
  onCompleteQuiz: (stats: { xp: number; accuracy: number; timeSec: number }) => void;
  onUpdateHearts: (delta: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  progress,
  onBack,
  onCompleteQuiz,
  onUpdateHearts,
}) => {
  // Get questions matching the user's selected language
  const languageConfig = AVAILABLE_LANGUAGES.find((l) => l.code === progress.activeLanguage) || AVAILABLE_LANGUAGES[0];
  const languageQuestions = ALL_QUIZZES.filter((q) => q.languageCode === progress.activeLanguage);
  // Fallback to all questions if specific language has few
  const questionsList: QuizQuestion[] = languageQuestions.length > 0 ? languageQuestions : ALL_QUIZZES;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const question = questionsList[currentQuestionIndex] || questionsList[0];

  // Placed chips for sentence assembly
  const [placedChips, setPlacedChips] = useState<string[]>(question.initialPlacedTokens || []);
  // Multiple choice selection
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Hint highlight chip
  const [hintWord, setHintWord] = useState<string | null>(null);
  // Feedback sheet state
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  // Audio bounce states
  const [audioPulsing, setAudioPulsing] = useState(false);
  const [slowAudioPulsing, setSlowAudioPulsing] = useState(false);
  // Timing & score
  const [startTime] = useState<number>(Date.now());
  const [mistakesCount, setMistakesCount] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Reset when question index changes
  useEffect(() => {
    setPlacedChips(question.initialPlacedTokens || []);
    setSelectedOption(null);
    setFeedbackStatus('idle');
    setHintWord(null);
  }, [currentQuestionIndex, question]);

  const targetCount = question.englishTargetTokens?.length || 4;

  const isChipUsed = (word: string) => {
    return placedChips.some((c) => c.trim().toLowerCase() === word.trim().toLowerCase());
  };

  const handleBankChipClick = (word: string) => {
    if (isChipUsed(word)) return;
    soundEffects.playChipTap();
    setPlacedChips((prev) => [...prev, word]);
  };

  const handleTrayChipClick = (index: number) => {
    soundEffects.playChipRemove();
    setPlacedChips((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePlayAudio = (slow = false) => {
    if (slow) {
      setSlowAudioPulsing(true);
      setTimeout(() => setSlowAudioPulsing(false), 300);
      speakText(question.targetSentence, languageConfig.speechCode, true);
    } else {
      setAudioPulsing(true);
      setTimeout(() => setAudioPulsing(false), 300);
      speakText(question.targetSentence, languageConfig.speechCode, false);
    }
  };

  const handleRequestHint = () => {
    if (progress.hearts <= 1) {
      alert("Il vous faut au moins 2 cœurs pour utiliser un indice !");
      return;
    }
    soundEffects.playChipTap();
    onUpdateHearts(-1);

    if (question.type === 'sentence_assembly') {
      const nextExpected = question.englishTargetTokens[placedChips.length];
      if (nextExpected) {
        setHintWord(nextExpected.toLowerCase());
        setTimeout(() => setHintWord(null), 2500);
      }
    } else if (question.options) {
      const correctOpt = question.options.find((o) => o.correct);
      if (correctOpt) {
        setHintWord(correctOpt.text);
        setTimeout(() => setHintWord(null), 2500);
      }
    }
  };

  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (question.type === 'sentence_assembly') {
      const userSentence = placedChips.join(' ').toLowerCase().replace(/[.,?!]/g, '').trim();
      const correctSentence = question.englishTargetSentence.toLowerCase().replace(/[.,?!]/g, '').trim();
      isCorrect = userSentence === correctSentence;
    } else if (question.options) {
      const chosen = question.options.find((o) => o.text === selectedOption);
      isCorrect = chosen ? chosen.correct : false;
    }

    if (isCorrect) {
      soundEffects.playCorrect();
      setCorrectAnswersCount((c) => c + 1);
      setFeedbackStatus('correct');
    } else {
      soundEffects.playError();
      setMistakesCount((m) => m + 1);
      onUpdateHearts(-1);
      setFeedbackStatus('incorrect');
    }
  };

  const handleContinue = () => {
    if (feedbackStatus === 'correct') {
      if (currentQuestionIndex < questionsList.length - 1 && currentQuestionIndex < 7) {
        // Next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setFeedbackStatus('idle');
      } else {
        // Complete quiz session
        const durationSec = Math.round((Date.now() - startTime) / 1000);
        const accuracy = Math.max(70, Math.round(100 - (mistakesCount / (correctAnswersCount + mistakesCount || 1)) * 30));
        onCompleteQuiz({
          xp: 35,
          accuracy: accuracy,
          timeSec: durationSec,
        });
      }
    } else {
      // Retry same question
      setFeedbackStatus('idle');
    }
  };

  const isCheckDisabled =
    question.type === 'sentence_assembly' ? placedChips.length === 0 : !selectedOption;

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
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
            <img alt="LingoQuest Logo" className="h-7 w-auto object-contain" src={APP_ASSETS.logo} />
            <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight line-clamp-1">
              Session de Quiz ({languageConfig.flag})
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

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative w-full pt-1 pb-safe bg-surface">
        <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28">
          {/* Progress HUD Track */}
          <div className="w-full pt-2 pb-3 flex flex-col gap-1">
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <div className="flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span>Combo x{progress.comboCount}</span>
              </div>
              <span className="text-on-surface-variant font-bold">
                Question {currentQuestionIndex + 1} sur {Math.min(8, questionsList.length)}
              </span>
            </div>
            <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden p-0.5 relative shadow-inner">
              <div
                className="h-full bg-primary-container rounded-full relative transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestionIndex + 1) / Math.min(8, questionsList.length)) * 100}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* Streak Multiplier Micro Banner */}
          <div className="w-full mt-1 mb-3 bg-secondary-fixed text-on-secondary-fixed rounded-2xl px-4 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              <span className="font-headline-sm text-headline-sm text-on-secondary-fixed tracking-tight">
                4 d'affilée !
              </span>
            </div>
            <span className="bg-secondary-container text-on-secondary font-label-sm text-label-sm px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-extrabold">
              1.5x XP Boost
            </span>
          </div>

          {/* Exercise Header Prompt */}
          <div className="mt-1 mb-3 flex items-center justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-extrabold">
                {question.category}
              </span>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface mt-0.5 font-extrabold">
                {question.promptTitle}
              </h2>
            </div>
            <img
              className="w-14 h-14 rounded-2xl object-cover bg-surface-container shadow-sm shrink-0"
              alt="Lapin mascotte Pip"
              src={APP_ASSETS.rabbitMascot || APP_ASSETS.owlMascot}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Speaker & Sentence Prompt Card */}
          <div className="w-full bg-surface-container-low rounded-2xl p-4 shadow-sm mb-4 border border-surface-container">
            <div className="flex items-start gap-3">
              <button
                onClick={() => handlePlayAudio(false)}
                className={`w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0 shadow-md active:translate-y-0.5 transition-all ${
                  audioPulsing ? 'scale-90 bg-tertiary' : ''
                }`}
                title="Écouter la prononciation"
              >
                <span className="material-symbols-outlined text-[28px]">volume_up</span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface leading-snug">
                  "{question.targetSentence}"
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handlePlayAudio(true)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-highest text-tertiary font-label-sm text-label-sm hover:bg-surface-container-high active:scale-95 transition-all ${
                      slowAudioPulsing ? 'scale-90' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">speed</span>
                    <span>Audio lent</span>
                    <span className="text-[12px]">🐢</span>
                  </button>
                  <span className="text-on-surface-variant font-label-sm text-label-sm opacity-60">
                    • {question.cefrLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FORMAT 1: Sentence Assembly with Chips */}
          {question.type === 'sentence_assembly' && (
            <>
              {/* Target Sentence Building Deck */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm mb-4 min-h-28.75 flex flex-col justify-between border border-surface-container">
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-2 flex items-center justify-between">
                  <span>Touchez les mots pour former la phrase :</span>
                  <span className="text-primary font-bold" id="slot-counter">
                    {placedChips.length} / {targetCount} mots placés
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 min-h-11 py-1">
                  {placedChips.map((word, idx) => (
                    <button
                      key={`${word}-${idx}`}
                      onClick={() => handleTrayChipClick(idx)}
                      className="word-placed-chip inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-surface-container-high text-on-surface font-headline-sm text-headline-sm shadow-sm active:scale-95 transition-all hover:bg-surface-container-highest"
                    >
                      <span>{word}</span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">close</span>
                    </button>
                  ))}

                  {placedChips.length < targetCount && (
                    <div className="h-10 px-4 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm opacity-70">
                      [ mot suivant ]
                    </div>
                  )}
                  {placedChips.length + 1 < targetCount && (
                    <div className="h-10 px-3 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm opacity-40">
                      ...
                    </div>
                  )}
                </div>
              </div>

              {/* Word Bank Matrix */}
              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-md text-label-md text-on-surface">Banque de mots</span>
                  <button
                    onClick={handleRequestHint}
                    className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                    <span>
                      Indice (-1 <span className="text-error font-bold">♥</span>)
                    </span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5 justify-center">
                  {(question.wordBankTokens || []).map((word, index) => {
                    const used = isChipUsed(word);
                    const isHinted = hintWord && word.toLowerCase().includes(hintWord);

                    return (
                      <button
                        key={`${word}-${index}`}
                        disabled={used}
                        onClick={() => handleBankChipClick(word)}
                        className={`word-bank-chip px-4 py-2.5 rounded-xl font-headline-sm text-headline-sm transition-all ${
                          used
                            ? 'opacity-30 cursor-not-allowed bg-surface-container text-on-surface-variant shadow-none'
                            : isHinted
                            ? 'bg-secondary-fixed text-on-secondary-fixed ring-2 ring-secondary-container shadow-md scale-105'
                            : 'bg-surface-container-lowest text-on-surface shadow-md active:translate-y-1 active:shadow-sm border border-surface-container/60 hover:bg-surface-container-low'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* FORMAT 2: Multiple Choice & Fill-in-the-Blank */}
          {(question.type === 'multiple_choice' || question.type === 'fill_blank') && (
            <div className="w-full flex flex-col gap-2.5 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-md text-label-md text-on-surface">Choisissez la bonne réponse :</span>
                <button
                  onClick={handleRequestHint}
                  className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  <span>Indice (-1 ♥)</span>
                </button>
              </div>

              {question.options?.map((opt, i) => {
                const isSelected = selectedOption === opt.text;
                const isHinted = hintWord === opt.text;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      soundEffects.playChipTap();
                      setSelectedOption(opt.text);
                    }}
                    className={`w-full p-4 rounded-2xl text-left font-headline-sm text-sm border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-fixed/30 border-primary text-primary font-bold shadow-sm'
                        : isHinted
                        ? 'bg-secondary-fixed border-secondary-container text-on-secondary-fixed'
                        : 'bg-surface-container-lowest border-surface-container text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <span className="w-6 h-6 rounded-full border border-outline flex items-center justify-center">
                      {isSelected && <span className="w-3 h-3 rounded-full bg-primary" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mascot Cheering Quote Box */}
          <div className="w-full bg-surface-container-high/60 rounded-2xl p-3 flex items-center gap-3 mb-4 border border-surface-container">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div className="text-on-surface-variant font-body-sm text-body-sm leading-tight">
              <span className="font-bold text-on-surface">Pip dit :</span> {question.mascotTip}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Check Answer Tray */}
        <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-xl border-t border-surface-container p-4 pb-safe z-30">
          <div className="max-w-md mx-auto flex flex-col gap-1.5">
            <button
              onClick={handleCheckAnswer}
              disabled={isCheckDisabled}
              className={`w-full py-4 rounded-2xl font-headline-sm text-headline-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                !isCheckDisabled
                  ? 'bg-primary-container text-on-primary active:scale-[0.98]'
                  : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed shadow-none'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
              <span>Vérifier la réponse</span>
            </button>
            <div className="flex items-center justify-center gap-2 pt-0.5 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
              <span>Série de maîtrise +15 XP au prochain palier</span>
            </div>
          </div>
        </div>

        {/* Feedback Bottom Sheet */}
        {feedbackStatus !== 'idle' && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center animate-fadeIn">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl p-6 shadow-2xl z-50 transform transition-transform border-t-4 border-primary">
              {feedbackStatus === 'correct' ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[26px]">done</span>
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-headline-sm text-primary">Brillant ! C'est exact !</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">+25 XP et série maintenue 🎉</p>
                      </div>
                    </div>
                    <span className="text-secondary font-headline-sm text-headline-sm">🎉</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-3 mb-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Solution</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{question.solutionEnglish}</p>
                    {question.explanation && (
                      <p className="text-xs text-on-surface-variant mt-1 italic">{question.explanation}</p>
                    )}
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full py-4 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider shadow-md active:scale-95 transition-all"
                  >
                    Continuer
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-error text-on-error flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[26px]">close</span>
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-headline-sm text-error">Pas tout à fait</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">-1 cœur perdu (♥)</p>
                      </div>
                    </div>
                    <span className="text-error font-headline-sm text-headline-sm">💡</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-3 mb-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Bonne solution</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{question.solutionEnglish}</p>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full py-4 rounded-xl bg-error text-on-error font-headline-sm text-headline-sm uppercase tracking-wider shadow-md active:scale-95 transition-all"
                  >
                    Réessayer
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
