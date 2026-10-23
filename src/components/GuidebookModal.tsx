import React from 'react';
import { speakSpanish, soundEffects } from '../utils/audio';

interface GuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidebookModal: React.FC<GuidebookModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-0 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-lg rounded-t-3xl p-6 flex flex-col gap-5 shadow-2xl border-t-4 border-primary max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">menu_book</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">Unit 3 Cheatsheet</h3>
          </div>
          <button
            onClick={() => {
              soundEffects.playChipTap();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3.5 pr-0.5">
          <div className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-1.5 border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-primary font-bold">Key Phrases</span>
              <button
                onClick={() => speakSpanish('¿Nos trae la cuenta, por favor?')}
                className="flex items-center gap-1 text-xs font-bold text-tertiary hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                Listen
              </button>
            </div>
            <p className="font-body-md text-body-md text-on-surface font-semibold mt-1">
              «¿Nos trae la cuenta, por favor?»
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Could you bring us the bill, please?
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-1.5 border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary font-bold">Essential Restaurant Vocabulary</span>
            </div>
            <ul className="text-sm space-y-1.5 mt-1 text-on-surface">
              <li className="flex justify-between items-center">
                <span className="font-semibold">La cuenta</span>
                <span className="text-on-surface-variant text-xs">The bill / check</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-semibold">El camarero / la camarera</span>
                <span className="text-on-surface-variant text-xs">The waiter / waitress</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-semibold">Una mesa para dos</span>
                <span className="text-on-surface-variant text-xs">A table for two</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-semibold">La carta / el menú</span>
                <span className="text-on-surface-variant text-xs">The menu</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-1.5 border border-surface-container">
            <span className="font-label-md text-label-md text-secondary font-bold">Cultural Tip</span>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed mt-1">
              In Spain, tips (propinas) are usually rounded to the nearest euro rather than standard 15–20% expectations. For great service in a sit-down tavern, leaving 1€ to 3€ in coins on the table is customary!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playChipTap();
            onClose();
          }}
          className="w-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg py-3.5 rounded-2xl border-b-4 border-on-primary-container active:translate-y-1 transition-all mt-1"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
