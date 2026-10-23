import React, { useState } from 'react';
import { soundEffects, speakSpanish } from '../utils/audio';

interface ReviewMistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewMistakeModal: React.FC<ReviewMistakeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!isOpen) return null;

  const options = [
    { text: 'The bill / check', correct: true },
    { text: 'The napkin', correct: false },
    { text: 'The dessert menu', correct: false },
  ];

  const handleSelect = (text: string) => {
    soundEffects.playChipTap();
    setSelectedOption(text);
  };

  const handleCheck = () => {
    const chosen = options.find((o) => o.text === selectedOption);
    if (chosen?.correct) {
      soundEffects.playCorrect();
      setIsCorrect(true);
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setIsSubmitted(false);
        setSelectedOption(null);
      }, 1400);
    } else {
      soundEffects.playError();
      setIsCorrect(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4 shadow-2xl border border-surface-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">replay</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Target Review (+5 XP)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center text-center py-2">
          <button
            onClick={() => speakSpanish('la cuenta')}
            className="w-14 h-14 rounded-2xl bg-surface-container-low text-tertiary flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-transform mb-2"
          >
            <span className="material-symbols-outlined text-[32px]">volume_up</span>
          </button>
          <span className="text-xs uppercase font-extrabold tracking-wider text-on-surface-variant">Spanish Phrase</span>
          <h2 className="text-2xl font-extrabold text-on-surface mt-1">«la cuenta»</h2>
          <p className="text-xs text-on-surface-variant mt-1">What does this phrase mean in a restaurant?</p>
        </div>

        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt.text)}
              className={`w-full py-3 px-4 rounded-xl text-left font-body-md transition-all border ${
                selectedOption === opt.text
                  ? 'bg-surface-container-high border-primary text-primary font-bold'
                  : 'bg-surface-container-low border-transparent text-on-surface hover:bg-surface-container'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        {isSubmitted && (
          <div className={`p-3 rounded-xl text-center text-xs font-bold ${isCorrect ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
            {isCorrect ? '✨ Perfect! +5 XP Added to your progress' : 'Try again! Look closely at the noun.'}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={!selectedOption}
          className={`w-full py-3.5 rounded-2xl font-headline-sm uppercase tracking-wide border-b-4 shadow-md transition-all ${
            selectedOption
              ? 'bg-primary-container text-on-primary border-on-primary-container active:translate-y-1'
              : 'bg-surface-container text-on-surface-variant/40 border-outline-variant cursor-not-allowed'
          }`}
        >
          Check Meaning
        </button>
      </div>
    </div>
  );
};
