import React, { useState, useEffect } from 'react';
import { soundEffects, speakSpanish } from '../utils/audio';

interface LightningSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

interface MatchCard {
  id: string;
  word: string;
  pairId: string;
  lang: 'es' | 'en';
  matched: boolean;
}

const RAW_PAIRS = [
  { es: 'agua', en: 'water' },
  { es: 'la cuenta', en: 'the bill' },
  { es: 'por favor', en: 'please' },
  { es: 'gracias', en: 'thank you' },
  { es: 'delicioso', en: 'delicious' },
  { es: 'el camarero', en: 'the waiter' },
];

export const LightningSprintModal: React.FC<LightningSprintModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MatchCard | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Build shuffled cards
    const initialCards: MatchCard[] = [];
    RAW_PAIRS.forEach((p, idx) => {
      initialCards.push({
        id: `es-${idx}`,
        word: p.es,
        pairId: `pair-${idx}`,
        lang: 'es',
        matched: false,
      });
      initialCards.push({
        id: `en-${idx}`,
        word: p.en,
        pairId: `pair-${idx}`,
        lang: 'en',
        matched: false,
      });
    });

    setCards(initialCards.sort(() => Math.random() - 0.5));
    setTimeLeft(45);
    setScore(0);
    setIsFinished(false);
    setSelectedCard(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          soundEffects.playVictoryFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isFinished]);

  if (!isOpen) return null;

  const handleCardClick = (card: MatchCard) => {
    if (card.matched || isFinished) return;
    soundEffects.playChipTap();

    if (card.lang === 'es') {
      speakSpanish(card.word);
    }

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    // Check match
    if (selectedCard.pairId === card.pairId && selectedCard.lang !== card.lang) {
      soundEffects.playCorrect();
      setCards((prev) =>
        prev.map((c) =>
          c.pairId === card.pairId ? { ...c, matched: true } : c
        )
      );
      setScore((s) => s + 1);
      setSelectedCard(null);

      // Check if all matched
      const remaining = cards.filter((c) => !c.matched && c.pairId !== card.pairId);
      if (remaining.length === 0) {
        setIsFinished(true);
        soundEffects.playVictoryFanfare();
      }
    } else {
      soundEffects.playError();
      setSelectedCard(null);
    }
  };

  const handleFinish = () => {
    onComplete(10);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 shadow-2xl border border-tertiary-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[26px]">bolt</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">Lightning Sprint</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-tertiary font-bold text-sm">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>{timeLeft}s</span>
          </div>
        </div>

        {!isFinished ? (
          <>
            <div className="flex justify-between items-center text-xs text-on-surface-variant px-1">
              <span>Match Spanish & English pairs:</span>
              <span className="font-bold text-primary">{score} / {RAW_PAIRS.length} pairs</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-85 overflow-y-auto p-1">
              {cards.map((card) => {
                const isSelected = selectedCard?.id === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={card.matched}
                    className={`py-3 px-3 rounded-2xl font-headline-sm text-sm text-center transition-all ${
                      card.matched
                        ? 'opacity-20 bg-surface-container cursor-default scale-95'
                        : isSelected
                        ? 'bg-tertiary text-on-tertiary shadow-md scale-102 border-2 border-tertiary-container'
                        : 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container hover:bg-surface-container active:scale-95'
                    }`}
                  >
                    {card.word}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4 gap-3">
            <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-4xl shadow-md animate-bounce">
              ⚡
            </div>
            <h3 className="font-headline-xl text-headline-xl text-primary font-extrabold">Sprint Complete!</h3>
            <p className="text-sm text-on-surface-variant">
              You matched {score} pairs in rapid time!
            </p>
            <div className="bg-primary-fixed/30 text-primary font-bold px-4 py-2 rounded-xl text-lg">
              +10 XP Earned!
            </div>
            <button
              onClick={handleFinish}
              className="w-full mt-2 py-3.5 rounded-2xl bg-primary-container text-on-primary font-headline-sm uppercase tracking-wider border-b-4 border-on-primary-container shadow-md active:translate-y-1 transition-all"
            >
              Collect +10 XP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
