import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, ChatChannel, TargetLanguage, FriendContact } from '../types';
import { APP_ASSETS } from '../data/curriculum';
import { soundEffects, speakText } from '../utils/audio';
import { VideoCallModal } from './VideoCallModal';
import { InviteFriendsModal } from './InviteFriendsModal';
import { StickerAndEmojiPicker } from './StickerAndEmojiPicker';

interface ChatScreenProps {
  user: UserProfile;
  activeLanguage: TargetLanguage;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ user, activeLanguage }) => {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Modals & Panels state
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [callContact, setCallContact] = useState<FriendContact | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Hidden File Inputs
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch channels on mount
  useEffect(() => {
    fetch('/api/chat/channels')
      .then((res) => res.json())
      .then((data: ChatChannel[]) => {
        setChannels(data);
        if (data.length > 0 && !activeChannelId) {
          setActiveChannelId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch messages for active channel
  const fetchMessages = () => {
    if (!activeChannelId) return;
    fetch(`/api/chat/messages?channelId=${activeChannelId}`)
      .then((res) => res.json())
      .then((data: ChatMessage[]) => {
        setMessages(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMessages();

    // Poll every 3 seconds for live server updates
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChannelId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Send standard text message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    soundEffects.playChipTap();
    setIsSending(true);

    const payload = {
      channelId: activeChannelId,
      senderName: user.name || 'Alex M.',
      senderUsername: user.username || '@alex_lingo',
      senderAvatar: user.avatarUrl || APP_ASSETS.userAvatar,
      text: inputText.trim(),
      langTag: activeLanguage.code,
      type: 'text',
    };

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newMsg: ChatMessage = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
        soundEffects.playCorrect();
      }
    } catch {} finally {
      setIsSending(false);
    }
  };

  // Start Voice Recording
  const startVoiceRecording = () => {
    soundEffects.playRecordStart();
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Cancel Voice Recording
  const cancelVoiceRecording = () => {
    soundEffects.playChipRemove();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  // Finish & Send Voice Note
  const sendVoiceRecording = async () => {
    soundEffects.playRecordStop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
    setIsRecordingVoice(false);
    setRecordingSeconds(0);

    const payload = {
      channelId: activeChannelId,
      senderName: user.name || 'Alex M.',
      senderUsername: user.username || '@alex_lingo',
      senderAvatar: user.avatarUrl || APP_ASSETS.userAvatar,
      text: `🎙️ Note vocale (${durationStr})`,
      langTag: activeLanguage.code,
      type: 'voice',
      mediaDuration: durationStr,
    };

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newMsg: ChatMessage = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        soundEffects.playCorrect();
      }
    } catch {}
  };

  // Play voice note
  const handlePlayVoice = (msg: ChatMessage) => {
    soundEffects.playChipTap();
    if (playingVoiceId === msg.id) {
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(msg.id);
    let lang = 'es-ES';
    if (msg.langTag === 'FR') lang = 'fr-FR';
    else if (msg.langTag === 'EN') lang = 'en-US';
    else if (msg.langTag === 'DE') lang = 'de-DE';
    else if (msg.langTag === 'IT') lang = 'it-IT';
    else if (msg.langTag === 'JA') lang = 'ja-JP';

    speakText(
      `Audio message de ${msg.senderName}: ¡Excelente pronunciación en español!`,
      lang
    );
    setTimeout(() => {
      setPlayingVoiceId(null);
    }, 3500);
  };

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playChipTap();
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const payload = {
        channelId: activeChannelId,
        senderName: user.name || 'Alex M.',
        senderUsername: user.username || '@alex_lingo',
        senderAvatar: user.avatarUrl || APP_ASSETS.userAvatar,
        text: `📸 Photo partagée : ${file.name}`,
        type: 'image',
        mediaUrl: base64Data,
        langTag: activeLanguage.code,
      };

      try {
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const newMsg: ChatMessage = await res.json();
          setMessages((prev) => [...prev, newMsg]);
          soundEffects.playCorrect();
          showToast('Photo partagée avec succès !');
        }
      } catch {}
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setIsAttachmentMenuOpen(false);
  };

  // Handle Video Upload
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playChipTap();
    const videoUrl = URL.createObjectURL(file);
    const payload = {
      channelId: activeChannelId,
      senderName: user.name || 'Alex M.',
      senderUsername: user.username || '@alex_lingo',
      senderAvatar: user.avatarUrl || APP_ASSETS.userAvatar,
      text: `🎥 Vidéo partagée : ${file.name}`,
      type: 'video',
      mediaUrl: videoUrl,
      langTag: activeLanguage.code,
    };

    fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((newMsg: ChatMessage) => {
        setMessages((prev) => [...prev, newMsg]);
        soundEffects.playCorrect();
        showToast('Vidéo partagée avec succès !');
      })
      .catch(() => {});

    e.target.value = '';
    setIsAttachmentMenuOpen(false);
  };

  // Handle Audio File Upload
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playChipTap();
    const audioUrl = URL.createObjectURL(file);
    const payload = {
      channelId: activeChannelId,
      senderName: user.name || 'Alex M.',
      senderUsername: user.username || '@alex_lingo',
      senderAvatar: user.avatarUrl || APP_ASSETS.userAvatar,
      text: `🎵 Fichier audio partagé : ${file.name}`,
      type: 'audio',
      mediaUrl: audioUrl,
      langTag: activeLanguage.code,
    };

    fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((newMsg: ChatMessage) => {
        setMessages((prev) => [...prev, newMsg]);
        soundEffects.playCorrect();
        showToast('Audio partagé avec succès !');
      })
      .catch(() => {});

    e.target.value = '';
    setIsAttachmentMenuOpen(false);
  };

  // Send Sticker
  const handleSendSticker = async (sticker: { url: string; label: string }) => {
    setIsStickerPickerOpen(false);
    const payload = {
      channelId: activeChannelId,
      senderName: user.name || 'Alex M.',
      senderUsername: user.username || '@alex_lingo',
      senderAvatar: user.avatarUrl || APP_ASSETS.userAvatar,
      text: sticker.label,
      type: 'sticker',
      stickerUrl: sticker.url,
      stickerLabel: sticker.label,
      langTag: activeLanguage.code,
    };

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newMsg: ChatMessage = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        soundEffects.playCorrect();
      }
    } catch {}
  };

  // Like message
  const handleLikeMessage = async (messageId: string) => {
    soundEffects.playReward();
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, likes: m.likes + 1 } : m))
    );

    try {
      await fetch('/api/chat/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
    } catch {}
  };

  // TTS speak
  const handleSpeak = (msg: ChatMessage) => {
    setSpeakingMessageId(msg.id);
    let lang = 'es-ES';
    if (msg.langTag === 'FR') lang = 'fr-FR';
    else if (msg.langTag === 'EN') lang = 'en-US';
    else if (msg.langTag === 'DE') lang = 'de-DE';
    else if (msg.langTag === 'IT') lang = 'it-IT';
    else if (msg.langTag === 'JA') lang = 'ja-JP';

    speakText(msg.text, lang);
    setTimeout(() => setSpeakingMessageId(null), 2000);
  };

  // Start Video Call
  const handleStartVideoCall = (targetContact?: FriendContact) => {
    setCallContact(targetContact || null);
    setIsVideoCallOpen(true);
    setIsAttachmentMenuOpen(false);
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  return (
    <div className="flex flex-col w-full h-[calc(100vh-80px)] sm:h-[800px] bg-surface relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl border border-sky-400 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-sky-400 text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={handleVideoFileChange}
      />
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        className="hidden"
        onChange={handleAudioFileChange}
      />

      {/* Top Header */}
      <header className="sticky top-0 w-full z-30 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
        <div className="h-16 px-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{activeChannel?.flag || '💬'}</span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-headline-sm text-headline-sm text-on-surface font-extrabold truncate">
                  {activeChannel?.name || 'Salons de Chat'}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-xs text-on-surface-variant truncate">
                {activeChannel?.onlineCount || 24} apprenants connectés
              </span>
            </div>
          </div>

          {/* Quick Header Actions: Invite Friends & Video Call */}
          <div className="flex items-center gap-1.5">
            {/* Invite Button */}
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-sm"
              title="Inviter des amis"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span className="hidden sm:inline">Inviter</span>
            </button>

            {/* Video Call Button */}
            <button
              onClick={() => handleStartVideoCall()}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm shadow-sky-500/20"
              title="Lancer un appel vidéo"
            >
              <span className="material-symbols-outlined text-base">videocam</span>
              <span className="hidden sm:inline">Appel Vidéo</span>
            </button>
          </div>
        </div>

        {/* Channel Selector Pills Carousel */}
        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar max-w-md mx-auto">
          {channels.map((chan) => {
            const isSelected = chan.id === activeChannelId;
            return (
              <button
                key={chan.id}
                onClick={() => {
                  soundEffects.playChipTap();
                  setActiveChannelId(chan.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-label-md text-xs whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-primary-container text-on-primary font-extrabold shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>{chan.flag}</span>
                <span>{chan.name}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 max-w-md mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center my-auto py-12 gap-2 text-on-surface-variant">
            <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">Connexion au serveur de chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-12 gap-2 text-on-surface-variant text-center">
            <span className="text-4xl">👋</span>
            <span className="font-bold text-sm text-on-surface">Aucun message pour le moment</span>
            <p className="text-xs max-w-xs">
              Invitez vos amis, envoyez une note vocale ou partagez une photo pour démarrer la discussion !
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUsername === (user.username || '@alex_lingo');
            const isSpeaking = speakingMessageId === msg.id;
            const isVoicePlaying = playingVoiceId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[92%] animate-fadeIn ${
                  isMe ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {/* Avatar */}
                <img
                  alt={msg.senderName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-surface-container flex-shrink-0 mt-0.5"
                  src={msg.senderAvatar}
                />

                {/* Message Bubble Container */}
                <div
                  className={`flex flex-col rounded-2xl p-3 shadow-xs border transition-colors ${
                    isMe
                      ? 'bg-primary-container text-on-primary border-primary rounded-tr-xs'
                      : msg.isBot
                      ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary-container rounded-tl-xs'
                      : 'bg-surface-container-lowest text-on-surface border-surface-container rounded-tl-xs'
                  }`}
                >
                  {/* Sender Header */}
                  <div
                    className={`flex items-center justify-between gap-3 text-[11px] mb-1.5 font-bold ${
                      isMe ? 'text-white/80' : 'text-on-surface-variant'
                    }`}
                  >
                    <span className="truncate">{msg.senderName}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {msg.langTag && (
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[9px] uppercase font-extrabold ${
                            isMe ? 'bg-white/20 text-white' : 'bg-surface-container text-primary'
                          }`}
                        >
                          {msg.langTag}
                        </span>
                      )}
                      <span className="text-[10px] opacity-75">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Message Content by Type */}

                  {/* 1. Voice Note Message */}
                  {msg.type === 'voice' && (
                    <div className="my-1 flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-2xl p-2.5">
                      <button
                        onClick={() => handlePlayVoice(msg)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isVoicePlaying
                            ? 'bg-emerald-500 text-white scale-105 shadow-md'
                            : isMe
                            ? 'bg-white text-sky-600'
                            : 'bg-sky-500 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {isVoicePlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      {/* Equalizer bars */}
                      <div className="flex-1 flex items-center gap-1">
                        {[4, 10, 16, 22, 12, 18, 8, 14, 20, 10, 15, 6].map((h, idx) => (
                          <span
                            key={idx}
                            style={{ height: `${h}px` }}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              isVoicePlaying
                                ? 'bg-emerald-400 animate-pulse'
                                : isMe
                                ? 'bg-white/70'
                                : 'bg-sky-400'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-xs font-mono font-bold shrink-0">
                        {msg.mediaDuration || '0:07'}
                      </span>
                    </div>
                  )}

                  {/* 2. Image Message */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="my-1 rounded-xl overflow-hidden border border-black/10 group relative cursor-pointer">
                      <img
                        src={msg.mediaUrl}
                        alt="Photo partagée"
                        onClick={() => setLightboxImage(msg.mediaUrl || null)}
                        className="w-full max-h-56 object-cover rounded-xl transition group-hover:scale-102"
                      />
                      <button
                        onClick={() => setLightboxImage(msg.mediaUrl || null)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white text-xs backdrop-blur-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <span className="material-symbols-outlined text-xs">zoom_in</span>
                        Agrandir
                      </button>
                    </div>
                  )}

                  {/* 3. Video Message */}
                  {msg.type === 'video' && msg.mediaUrl && (
                    <div className="my-1 rounded-xl overflow-hidden border border-black/10">
                      <video
                        src={msg.mediaUrl}
                        controls
                        playsInline
                        className="w-full max-h-56 rounded-xl bg-black"
                      />
                    </div>
                  )}

                  {/* 4. Audio Message */}
                  {msg.type === 'audio' && msg.mediaUrl && (
                    <div className="my-1 p-2 bg-black/10 dark:bg-white/10 rounded-xl">
                      <audio src={msg.mediaUrl} controls className="w-full h-8" />
                    </div>
                  )}

                  {/* 5. Sticker Message */}
                  {msg.type === 'sticker' && msg.stickerUrl && (
                    <div className="my-2 flex flex-col items-center gap-1.5 p-2 bg-white/10 dark:bg-black/20 rounded-2xl">
                      <img
                        src={msg.stickerUrl}
                        alt={msg.stickerLabel || 'Sticker'}
                        className="w-24 h-24 object-cover rounded-2xl shadow-sm hover:scale-110 transition-transform"
                      />
                      {msg.stickerLabel && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
                          {msg.stickerLabel}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 6. Video Call Invite Card */}
                  {msg.type === 'call_invite' && (
                    <div className="my-1.5 p-3 rounded-2xl bg-gradient-to-r from-sky-500/20 to-sky-600/20 border border-sky-400/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow">
                          <span className="material-symbols-outlined text-lg">videocam</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">Appel vidéo en direct</p>
                          <p className="text-[10px] text-on-surface-variant">Pratique orale collaborative</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartVideoCall()}
                        className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shrink-0 shadow-sm flex items-center gap-1 transition"
                      >
                        Rejoindre
                      </button>
                    </div>
                  )}

                  {/* Text caption or message */}
                  {msg.text && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {/* Actions (TTS & Heart Like) */}
                  <div className="flex items-center justify-end gap-2 mt-2 pt-1.5 border-t border-black/5 dark:border-white/10">
                    {msg.text && (
                      <button
                        onClick={() => handleSpeak(msg)}
                        className={`p-1 rounded-lg transition-transform active:scale-95 flex items-center gap-1 text-[11px] ${
                          isSpeaking ? 'scale-110 font-bold' : 'opacity-80 hover:opacity-100'
                        }`}
                        title="Écouter la prononciation"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isSpeaking ? 'volume_up' : 'volume_down'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => handleLikeMessage(msg.id)}
                      className="flex items-center gap-1 text-[11px] font-bold opacity-80 hover:opacity-100 active:scale-95 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined text-[15px] text-error"
                        style={{ fontVariationSettings: msg.likes > 0 ? "'FILL' 1" : undefined }}
                      >
                        favorite
                      </span>
                      <span>{msg.likes > 0 ? msg.likes : ''}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Phrases */}
      <div className="px-4 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar max-w-md mx-auto w-full">
        {[
          '¡Hola a todos! 👋',
          'Qui est chaud pour un appel vidéo ? 📹',
          'Une question sur les verbes ? 💡',
          '¿Cómo se dice en español? 🇪🇸',
          'Félicitations pour votre série ! 🔥',
        ].map((phrase, i) => (
          <button
            key={i}
            onClick={() => {
              soundEffects.playChipTap();
              setInputText(phrase);
            }}
            className="px-2.5 py-1 rounded-full bg-surface-container text-[11px] font-semibold text-on-surface-variant hover:text-on-surface whitespace-nowrap shrink-0 transition-colors"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Attachment Popover Menu */}
      {isAttachmentMenuOpen && (
        <div className="absolute bottom-20 left-4 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-40 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-2 gap-1.5">
            {/* Photo */}
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-sky-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-1">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </div>
              <span className="text-xs font-bold">Photo</span>
            </button>

            {/* Video */}
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-sky-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
                <span className="material-symbols-outlined text-xl">videocam</span>
              </div>
              <span className="text-xs font-bold">Vidéo</span>
            </button>

            {/* Audio */}
            <button
              onClick={() => audioInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-sky-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="material-symbols-outlined text-xl">audio_file</span>
              </div>
              <span className="text-xs font-bold">Audio</span>
            </button>

            {/* Video Call */}
            <button
              onClick={() => handleStartVideoCall()}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-sky-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1">
                <span className="material-symbols-outlined text-xl">video_call</span>
              </div>
              <span className="text-xs font-bold">Appel Vidéo</span>
            </button>
          </div>
        </div>
      )}

      {/* Emoji & Sticker Picker Popup */}
      {isStickerPickerOpen && (
        <StickerAndEmojiPicker
          onSelectEmoji={(emoji) => setInputText((prev) => prev + emoji)}
          onSelectSticker={handleSendSticker}
          onClose={() => setIsStickerPickerOpen(false)}
        />
      )}

      {/* Input Bar or Live Voice Recording Bar */}
      <div className="p-3 bg-surface-container-lowest border-t border-surface-container max-w-md mx-auto w-full pb-safe">
        {isRecordingVoice ? (
          /* Live Voice Recording UI */
          <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-2.5 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-red-700 dark:text-red-300">
                Enregistrement vocal : 0:{recordingSeconds < 10 ? '0' : ''}
                {recordingSeconds}
              </span>
            </div>

            {/* Visual audio bars */}
            <div className="flex items-center gap-1">
              {[8, 14, 20, 12, 18, 10, 16].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Cancel Button */}
              <button
                onClick={cancelVoiceRecording}
                className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-red-200 transition"
                title="Supprimer"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>

              {/* Send Voice Button */}
              <button
                onClick={sendVoiceRecording}
                className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow transition active:scale-95"
                title="Envoyer la note vocale"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Input Bar */
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Attachment Button (+) */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playChipTap();
                setIsAttachmentMenuOpen(!isAttachmentMenuOpen);
              }}
              className="w-10 h-10 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition border border-surface-container"
              title="Partager un média"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isAttachmentMenuOpen ? 'close' : 'add'}
              </span>
            </button>

            {/* Emoji & Sticker Button */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playChipTap();
                setIsStickerPickerOpen(!isStickerPickerOpen);
              }}
              className="w-10 h-10 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition border border-surface-container text-lg"
              title="Émojis et Autocollants"
            >
              😊
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Écrire dans ${activeChannel?.name || 'le chat'}...`}
              className="flex-1 px-3.5 py-2.5 bg-surface-container-low rounded-2xl text-sm border border-surface-container focus:outline-none focus:border-primary text-on-surface"
            />

            {/* Mic / Voice Note Button if input is empty, else Send button */}
            {inputText.trim() ? (
              <button
                type="submit"
                disabled={isSending}
                className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center transition-all shadow-sm active:scale-95 border-b-2 border-on-primary-container"
              >
                <span className="material-symbols-outlined text-[19px]">send</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 hover:bg-sky-100 flex items-center justify-center transition-all border border-sky-300 dark:border-sky-800 active:scale-95 shadow-sm"
                title="Enregistrer un vocal"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            )}
          </form>
        )}
      </div>

      {/* Video Call Full-screen/Floating Modal */}
      {isVideoCallOpen && (
        <VideoCallModal
          user={user}
          contact={callContact}
          channelName={activeChannel?.name || 'Général'}
          onClose={() => {
            setIsVideoCallOpen(false);
            setCallContact(null);
          }}
        />
      )}

      {/* Invite Friends Modal */}
      {isInviteModalOpen && (
        <InviteFriendsModal
          channelId={activeChannelId}
          channelName={activeChannel?.name || 'Général'}
          onClose={() => setIsInviteModalOpen(false)}
          onStartVideoCallWithContact={(c) => {
            setIsInviteModalOpen(false);
            handleStartVideoCall(c);
          }}
          onInviteSent={(msg) => showToast(msg)}
        />
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Aperçu photo"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
