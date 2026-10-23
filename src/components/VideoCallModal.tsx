import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, FriendContact } from '../types';
import { soundEffects } from '../utils/audio';

interface VideoCallModalProps {
  user: UserProfile;
  contact?: FriendContact | null;
  channelName: string;
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  user,
  contact,
  channelName,
  onClose,
}) => {
  const [isCalling, setIsCalling] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera and ringing effect
  useEffect(() => {
    soundEffects.playRinging();

    // Answer call after 2.2 seconds
    const answerTimer = setTimeout(() => {
      setIsCalling(false);
      soundEffects.playCallConnected();
    }, 2200);

    // Request camera
    const initCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraFacing },
            audio: true,
          });
          cameraStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } else {
          setHasCameraPermission(false);
        }
      } catch {
        setHasCameraPermission(false);
      }
    };

    initCamera();

    return () => {
      clearTimeout(answerTimer);
      // Stop all tracks on unmount
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Call duration counter once answered
  useEffect(() => {
    if (isCalling) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCalling]);

  // Toggle Mute
  const toggleMute = () => {
    soundEffects.playChipTap();
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Video
  const toggleVideo = () => {
    soundEffects.playChipTap();
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  // Switch camera facing mode
  const switchCamera = async () => {
    soundEffects.playChipTap();
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: !isMuted,
      });
      cameraStreamRef.current = newStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
    } catch {}
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    soundEffects.playChipTap();
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (localVideoRef.current && cameraStreamRef.current) {
        localVideoRef.current.srcObject = cameraStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          screenStreamRef.current = displayStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = displayStream;
          }
          setIsScreenSharing(true);
          displayStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            if (localVideoRef.current && cameraStreamRef.current) {
              localVideoRef.current.srcObject = cameraStreamRef.current;
            }
          };
        }
      } catch {
        setIsScreenSharing(false);
      }
    }
  };

  // Send Floating Reaction
  const sendReaction = (emoji: string) => {
    soundEffects.playReward();
    const newId = Date.now() + Math.random();
    const leftPercent = 20 + Math.random() * 60;
    setReactions((prev) => [...prev, { id: newId, emoji, left: leftPercent }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newId));
    }, 2500);
  };

  const handleEndCall = () => {
    soundEffects.playCallEnded();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const companionName = contact ? contact.name : 'Sofia B. (Partenaire d\'étude)';
  const companionAvatar = contact
    ? contact.avatarUrl
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlvb3V_A2WB6e6fBKohmbvX7-v5yXGMhxrpinjeTqGvRxyhe8F76rD9p4nBzepx5F0qOv4WnmbRqz4qRREp0lAJtDdZ2LcyJNB_Bg54db4RlbGvxzK5q1eZaNGDWz_E7fVlOT9ie1IZBxjoDLZhXC3Ow39e20Mt70hXAR9J0Pcw0shbftocRj7pT6bPfz1Tk-bn2Fcwj7Qvxc6i_1UcqHUk3HmZP8QA5LuFT_KQu9ClBk1VnBl13CI';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Floating Reaction Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {reactions.map((r) => (
          <span
            key={r.id}
            style={{ left: `${r.left}%` }}
            className="absolute bottom-24 text-4xl sm:text-5xl animate-bounce transition-all duration-1000 transform -translate-y-96 opacity-90 drop-shadow-lg"
          >
            {r.emoji}
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-4xl h-[92vh] max-h-200 bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-linear-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-xl">videocam</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  {contact ? `Appel avec ${contact.name}` : `Salon Vidéo • ${channelName}`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isCalling ? 'Appel en cours...' : 'HD Direct'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {isCalling ? 'Connexion au serveur...' : `⏱️ ${formatDuration(callDuration)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
              title="Participants"
            >
              <span className="material-symbols-outlined text-lg">group</span>
            </button>
            <button
              onClick={handleEndCall}
              className="p-2.5 rounded-full bg-red-600/80 hover:bg-red-700 text-white transition"
              title="Fermer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Video Stage Grid */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Main Remote Video / Companion Feed */}
          <div className="relative w-full h-full flex items-center justify-center">
            {isCalling ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full border-4 border-sky-400/40 p-1 animate-pulse">
                    <img
                      src={companionAvatar}
                      alt={companionName}
                      className="w-full h-full object-cover rounded-full shadow-lg"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-sky-500 text-white rounded-full flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-base animate-spin">
                      sync
                    </span>
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{companionName}</h4>
                  <p className="text-sky-300 text-sm animate-pulse">
                    Sonnerie en cours sur le serveur LingoQuest...
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                {/* Simulated High-Res Study Video Stream or Live Avatar */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80"
                  alt="Companion video"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>

                {/* Companion info badge */}
                <div className="absolute bottom-24 left-6 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-white text-sm font-semibold">{companionName}</span>
                  <span className="text-xs bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-400/30">
                    🎙️ Parlant
                  </span>
                </div>

                {/* Animated Waveform speaking effect */}
                <div className="absolute top-20 right-6 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-xs text-sky-300 mr-1">Audio :</span>
                  <span className="w-1 h-3 bg-sky-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 h-4 bg-sky-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Local User Self-Preview PiP (Picture in Picture) */}
          <div className="absolute bottom-24 right-4 sm:right-6 w-36 h-48 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border-2 border-sky-400/60 shadow-2xl bg-slate-800 z-30 transition-transform hover:scale-105">
            {isVideoOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-2 text-center">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-slate-600 mb-2 object-cover"
                />
                <span className="text-xs text-slate-300 font-medium">Caméra coupée</span>
              </div>
            ) : hasCameraPermission === false ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-sky-900 to-slate-900 p-2 text-center">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-sky-400 mb-2 object-cover"
                />
                <span className="text-[11px] text-sky-200 font-semibold">{user.name} (Vous)</span>
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Micro actif
                </span>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            )}

            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-sm flex items-center gap-1">
              {isMuted && <span className="text-red-400 material-symbols-outlined text-[12px]">mic_off</span>}
              <span>Vous</span>
            </div>
          </div>

          {/* Participants Side Panel */}
          {showParticipants && (
            <div className="absolute top-16 right-4 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400 text-base">group</span>
                  Membres en appel (3)
                </h5>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full border border-sky-400 object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{user.name} (Vous)</p>
                      <p className="text-[10px] text-emerald-400">Organisateur</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-300">
                    {isMuted ? '🔇' : '🎙️'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={companionAvatar}
                      alt=""
                      className="w-8 h-8 rounded-full border border-slate-600 object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{companionName}</p>
                      <p className="text-[10px] text-slate-400">Pratique orale</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-300">🎙️</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/assets/images/rabbit_mascot.jpg"
                      alt="Pip le Lapin"
                      className="w-8 h-8 rounded-full border border-sky-400 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Pip le Lapin Tuteur</p>
                      <p className="text-[10px] text-sky-400">Mascotte & Assistant IA</p>
                    </div>
                  </div>
                  <span className="text-xs text-sky-300">🤖</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Quick Reaction Bar */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700 shadow-lg">
          {['❤️', '👏', '🎉', '🚀', '🌟', '💡'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-xl sm:text-2xl hover:scale-125 active:scale-95 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-30 bg-slate-900/95 border-t border-slate-800 px-4 py-3 flex items-center justify-center gap-3 sm:gap-5">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              isMuted
                ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-400'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            <span className="material-symbols-outlined text-xl">
              {isMuted ? 'mic_off' : 'mic'}
            </span>
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              isVideoOff
                ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-400'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isVideoOff ? 'Activer la caméra' : 'Couper la caméra'}
          >
            <span className="material-symbols-outlined text-xl">
              {isVideoOff ? 'videocam_off' : 'videocam'}
            </span>
          </button>

          {/* Flip Camera Button */}
          <button
            onClick={switchCamera}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all"
            title="Inverser caméra"
          >
            <span className="material-symbols-outlined text-xl">flip_camera_ios</span>
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
              isScreenSharing
                ? 'bg-sky-500 text-white ring-2 ring-sky-300'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Partager l'écran"
          >
            <span className="material-symbols-outlined text-xl">screen_share</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="flex items-center justify-center w-14 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/30 px-4 gap-1.5"
            title="Raccrocher"
          >
            <span className="material-symbols-outlined text-2xl">call_end</span>
          </button>
        </div>
      </div>
    </div>
  );
};
