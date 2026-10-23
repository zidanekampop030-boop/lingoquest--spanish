import React, { useState } from 'react';
import { soundEffects, speakSpanish } from '../utils/audio';

interface VocabChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (gems: number) => void;
}

export const VocabChestModal: React.FC<VocabChestModalProps> = ({ isOpen, onClose, onRewardClaimed }) => {
  const [opened, setOpened] = useState(false);

  if (!isOpen) return null;

  const handleOpen = () => {
    soundEffects.playReward();
    setOpened(true);
  };

  const handleClaim = () => {
    onRewardClaimed(25);
    onClose();
    setOpened(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl border-2 border-secondary-fixed-dim"
        onClick={(e) => e.stopPropagation()}
      >
        {!opened ? (
          <>
            <div className="w-24 h-24 rounded-3xl bg-secondary-fixed flex items-center justify-center shadow-lg border-b-6 border-secondary animate-bounce">
              <span className="material-symbols-outlined text-secondary text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
            </div>
            <div>
              <span className="text-secondary uppercase tracking-widest text-xs font-extrabold">Mystery Bonus Chest</span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1">Tapas Secret Vault</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Unlock 5 authentic Spanish culinary terms + bonus gems!
              </p>
            </div>
            <button
              onClick={handleOpen}
              className="w-full py-3.5 rounded-2xl bg-secondary-container text-on-secondary font-headline-sm uppercase tracking-wide border-b-4 border-secondary shadow-md active:translate-y-1 transition-all"
            >
              Open Chest
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-secondary-container text-on-secondary flex items-center justify-center shadow-xl border-b-6 border-secondary">
                <span className="material-symbols-outlined text-[54px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock_open
                </span>
              </div>
              <span className="absolute -top-2 -right-2 text-2xl animate-spin">✨</span>
            </div>

            <div>
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-extrabold uppercase">
                Unlocked +25 💎 Gems!
              </span>
              <h3 className="font-headline-lg text-headline-lg text-primary mt-2">¡Nuevas Palabras!</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Added 5 new phrases to your Spanish vocabulary stash:
              </p>
            </div>

            <div className="w-full bg-surface-container-low rounded-2xl p-3 flex flex-col gap-2 text-left">
              {[
                { es: 'Las patatas bravas', en: 'Fried potatoes in spicy paprika sauce' },
                { es: 'El jamón ibérico', en: 'Cured Iberian ham' },
                { es: 'Una ración', en: 'A sharing plate portion' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-surface-container last:border-0">
                  <div>
                    <span className="font-bold text-sm text-on-surface block">{item.es}</span>
                    <span className="text-xs text-on-surface-variant">{item.en}</span>
                  </div>
                  <button
                    onClick={() => speakSpanish(item.es)}
                    className="p-1.5 text-tertiary hover:bg-surface-container rounded-lg"
                  >
                    <span className="material-symbols-outlined text-[18px]">volume_up</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-2xl bg-primary-container text-on-primary font-headline-sm uppercase tracking-wide border-b-4 border-on-primary-container shadow-md active:translate-y-1 transition-all"
            >
              Collect Rewards
            </button>
          </>
        )}
      </div>
    </div>
  );
};
