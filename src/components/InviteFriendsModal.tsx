import React, { useState, useEffect } from 'react';
import { FriendContact } from '../types';
import { soundEffects } from '../utils/audio';

interface InviteFriendsModalProps {
  channelId: string;
  channelName: string;
  onClose: () => void;
  onStartVideoCallWithContact: (contact: FriendContact) => void;
  onInviteSent: (inviteMessage: string) => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  channelId,
  channelName,
  onClose,
  onStartVideoCallWithContact,
  onInviteSent,
}) => {
  const [contacts, setContacts] = useState<FriendContact[]>([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newLanguage, setNewLanguage] = useState('Espagnol');

  const shareLink = `https://lingoquest.app/join/${channelId}?room=${encodeURIComponent(channelName)}`;

  useEffect(() => {
    fetch('/api/chat/contacts')
      .then((res) => res.json())
      .then((data: FriendContact[]) => setContacts(data))
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    soundEffects.playReward();
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInviteContact = async (contact: FriendContact) => {
    soundEffects.playCorrect();
    setInvitedMap((prev) => ({ ...prev, [contact.id]: true }));

    try {
      const res = await fetch('/api/chat/contacts/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          channelId,
          roomName: channelName,
        }),
      });
      if (res.ok) {
        onInviteSent(`Invitation envoyée à ${contact.name} !`);
      }
    } catch {}
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) return;

    soundEffects.playChipTap();
    try {
      const res = await fetch('/api/chat/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          username: newUsername.trim(),
          learningLanguage: newLanguage,
          flag:
            newLanguage === 'Espagnol'
              ? '🇪🇸'
              : newLanguage === 'Français'
              ? '🇫🇷'
              : newLanguage === 'Anglais'
              ? '🇬🇧'
              : newLanguage === 'Italien'
              ? '🇮🇹'
              : '🇯🇵',
        }),
      });

      if (res.ok) {
        const added: FriendContact = await res.json();
        setContacts((prev) => [added, ...prev]);
        setNewName('');
        setNewUsername('');
        setIsAddingContact(false);
        soundEffects.playCorrect();
      }
    } catch {}
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.learningLanguage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-sky-500 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Inviter des amis</h3>
              <p className="text-xs text-sky-100">
                Salon actuel : <span className="font-bold">{channelName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Share Link Box */}
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-4">
            <label className="text-xs font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wider block mb-2">
              Lien direct de discussion
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-sky-500 hover:bg-sky-600 text-white active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-sky-200/60 dark:border-sky-800/40">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">
                Partager via :
              </span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Rejoins-moi sur LingoQuest pour pratiquer ensemble dans le salon ${channelName} ! ${shareLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareLink
                )}&text=${encodeURIComponent(`Rejoins notre salon d'apprentissage LingoQuest !`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 transition"
              >
                Telegram
              </a>
              <a
                href={`mailto:?subject=Rejoins-moi sur LingoQuest&body=Rejoins-moi pour discuter et faire des exercices en langues : ${shareLink}`}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 transition"
              >
                Email
              </a>
            </div>
          </div>

          {/* Contacts Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Vos contacts & partenaires ({filteredContacts.length})
              </h4>
              <button
                onClick={() => setIsAddingContact(!isAddingContact)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {isAddingContact ? 'remove' : 'add'}
                </span>
                {isAddingContact ? 'Annuler' : 'Ajouter un ami'}
              </button>
            </div>

            {/* Add Contact Form */}
            {isAddingContact && (
              <form
                onSubmit={handleCreateContact}
                className="mb-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Prénom & Nom"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="@nom_utilisateur"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-slate-800 dark:text-white"
                  >
                    <option value="Espagnol">🇪🇸 Espagnol</option>
                    <option value="Français">🇫🇷 Français</option>
                    <option value="Anglais">🇬🇧 Anglais</option>
                    <option value="Italien">🇮🇹 Italien</option>
                    <option value="Japonais">🇯🇵 Japonais</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            )}

            {/* Search Input */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">
                search
              </span>
              <input
                type="text"
                placeholder="Rechercher un contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* List of Contacts */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={contact.avatarUrl}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                          contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      ></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">
                          {contact.name}
                        </span>
                        <span className="text-xs">{contact.flag}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {contact.username} • Série {contact.streak}j 🔥
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Video Call Contact Button */}
                    <button
                      onClick={() => {
                        onClose();
                        onStartVideoCallWithContact(contact);
                      }}
                      className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950 hover:bg-sky-200 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-300 transition"
                      title="Lancer un appel vidéo"
                    >
                      <span className="material-symbols-outlined text-base">videocam</span>
                    </button>

                    {/* Invite Button */}
                    <button
                      onClick={() => handleInviteContact(contact)}
                      disabled={invitedMap[contact.id]}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        invitedMap[contact.id]
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-sky-500 hover:bg-sky-600 text-white active:scale-95 shadow-sm'
                      }`}
                    >
                      {invitedMap[contact.id] ? (
                        <>
                          <span className="material-symbols-outlined text-xs">done</span>
                          Invité
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xs">send</span>
                          Inviter
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
