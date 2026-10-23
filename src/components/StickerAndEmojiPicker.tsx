import React, { useState } from 'react';
import { ChatSticker } from '../types';
import { soundEffects } from '../utils/audio';

interface StickerAndEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker: (sticker: { url: string; label: string }) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Populaires & Réactions',
    emojis: ['❤️', '🔥', '👏', '🎉', '🚀', '⭐', '💡', '💯', '😂', '🥳', '😎', '🤩', '🤔', '🙌', '👍'],
  },
  {
    name: 'Drapeaux du Monde',
    emojis: ['🇪🇸', '🇫🇷', '🇬🇧', '🇺🇸', '🇮🇹', '🇩🇪', '🇯🇵', '🇲🇽', '🇧🇷', '🇨🇦', '🇨🇭', '🇦🇺'],
  },
  {
    name: 'Étude & Apprentissage',
    emojis: ['📚', '📖', '✏️', '📝', '🎓', '🏆', '🥇', '🧠', '💬', '🗣️', '🎧', '🎯', '⏱️', '✨'],
  },
  {
    name: 'Voyage & Gastronomie',
    emojis: ['🥘', '☕', '🥐', '🌮', '🍕', '🍣', '🍷', '✈️', '🏖️', '🎒', '🗺️', '🗽', '🗼'],
  },
];

const LINGO_STICKERS = [
  {
    id: 'stk-1',
    label: 'Pip le Lapin ! 🐰',
    url: '/assets/images/rabbit_mascot.jpg',
    badge: 'Mascotte',
  },
  {
    id: 'stk-2',
    label: 'Lapin Champion 🏆',
    url: '/assets/images/rabbit_celebration.jpg',
    badge: 'Victoire',
  },
  {
    id: 'stk-3',
    label: 'Super Cerveau 🧠',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUl1zlTvOaIT4aXDEud91s-7zpZsAOo7fV5kDCrhk0JyKFY8V6ZgQ3L40bx9lHiq7C7Ig661IHA-llCUglnUFADFQhM7YzWVIAg0QKzTSlH3vl1C2B6mvTD42k9GZjNplGE55DAcIocEF6alyswU09XAy7I8v5vLn6Y6iqzl0n-7S-19fx4GfSYwPN_RMTc35tUpHMwP0mYnl_NG2SYBE_ZvNtbRmfuJ35vCnG3lpzJXip6X8Pthby',
    badge: 'Génie',
  },
  {
    id: 'stk-4',
    label: '¡Vamos Adelante! 🚀',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    badge: 'Motivation',
  },
  {
    id: 'stk-5',
    label: 'Pause Café & Tapas ☕',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=80',
    badge: 'Détente',
  },
  {
    id: 'stk-6',
    label: 'Trophée Champion 🏆',
    url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=200&auto=format&fit=crop&q=80',
    badge: 'Ligue Or',
  },
];

export const StickerAndEmojiPicker: React.FC<StickerAndEmojiPickerProps> = ({
  onSelectEmoji,
  onSelectSticker,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers'>('emojis');

  return (
    <div className="absolute bottom-16 right-2 sm:right-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-40 animate-in fade-in slide-in-from-bottom-3">
      {/* Top Tabs */}
      <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('emojis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'emojis'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            😀 Émojis
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'stickers'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🎨 Stickers Lingo
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 max-h-72 overflow-y-auto">
        {activeTab === 'emojis' ? (
          <div className="space-y-3">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {cat.name}
                </h5>
                <div className="grid grid-cols-7 gap-1">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        soundEffects.playChipTap();
                        onSelectEmoji(emoji);
                      }}
                      className="text-xl sm:text-2xl p-1.5 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Autocollants Mascottes & Encouragements
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {LINGO_STICKERS.map((stk) => (
                <button
                  key={stk.id}
                  onClick={() => {
                    soundEffects.playReward();
                    onSelectSticker({ url: stk.url, label: stk.label });
                  }}
                  className="group relative flex flex-col items-center p-2 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800/80 transition"
                >
                  <img
                    src={stk.url}
                    alt={stk.label}
                    className="w-14 h-14 object-cover rounded-xl shadow-sm group-hover:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center mt-1.5 line-clamp-1">
                    {stk.label}
                  </span>
                  <span className="text-[9px] text-sky-600 dark:text-sky-400 font-semibold">
                    {stk.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
