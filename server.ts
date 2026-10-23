import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type MessageMediaType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'sticker'
  | 'call_invite';

interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  text: string;
  langTag?: string;
  timestamp: string;
  likes: number;
  isBot?: boolean;
  type?: MessageMediaType;
  mediaUrl?: string;
  mediaDuration?: string;
  stickerUrl?: string;
  stickerLabel?: string;
  fileName?: string;
}

interface ChatChannel {
  id: string;
  name: string;
  topic: string;
  icon: string;
  flag: string;
  onlineCount: number;
}

interface FriendContact {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'in_call';
  learningLanguage: string;
  flag: string;
  streak: number;
  phone?: string;
  email?: string;
}

// In-memory chat store
const CHANNELS: ChatChannel[] = [
  {
    id: 'general',
    name: 'Salon Général',
    topic: 'Discussions multilingues, entraide et célébration des séries',
    icon: 'forum',
    flag: '🌍',
    onlineCount: 42,
  },
  {
    id: 'espanol',
    name: 'Club Espagnol',
    topic: '¡Hablemos en español! Tapas, grammaire et expressions',
    icon: 'translate',
    flag: '🇪🇸',
    onlineCount: 28,
  },
  {
    id: 'francais',
    name: 'Club Français',
    topic: 'Pratique quotidienne, prononciation et tournures de phrases',
    icon: 'school',
    flag: '🇫🇷',
    onlineCount: 19,
  },
  {
    id: 'anglais',
    name: 'English Club',
    topic: 'Conversational practice, idioms & British/US vocabulary',
    icon: 'chat',
    flag: '🇬🇧',
    onlineCount: 35,
  },
  {
    id: 'questions',
    name: 'Aide & Grammaire',
    topic: 'Posez toutes vos questions sur les leçons et règles',
    icon: 'help_outline',
    flag: '💡',
    onlineCount: 14,
  },
];

let contacts: FriendContact[] = [
  {
    id: 'contact-1',
    name: 'Sofia B.',
    username: '@sofia_b',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlvb3V_A2WB6e6fBKohmbvX7-v5yXGMhxrpinjeTqGvRxyhe8F76rD9p4nBzepx5F0qOv4WnmbRqz4qRREp0lAJtDdZ2LcyJNB_Bg54db4RlbGvxzK5q1eZaNGDWz_E7fVlOT9ie1IZBxjoDLZhXC3Ow39e20Mt70hXAR9J0Pcw0shbftocRj7pT6bPfz1Tk-bn2Fcwj7Qvxc6i_1UcqHUk3HmZP8QA5LuFT_KQu9ClBk1VnBl13CI',
    status: 'online',
    learningLanguage: 'Espagnol',
    flag: '🇪🇸',
    streak: 15,
    email: 'sofia.b@example.com',
  },
  {
    id: 'contact-2',
    name: 'Mateo R.',
    username: '@mateo_madrid',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'online',
    learningLanguage: 'Espagnol',
    flag: '🇪🇸',
    streak: 8,
    email: 'mateo.madrid@example.com',
  },
  {
    id: 'contact-3',
    name: 'Elena V.',
    username: '@elena_v',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    status: 'online',
    learningLanguage: 'Français',
    flag: '🇫🇷',
    streak: 21,
    email: 'elena.v@example.com',
  },
  {
    id: 'contact-4',
    name: 'Lucas P.',
    username: '@lucas_p',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    status: 'offline',
    learningLanguage: 'Anglais',
    flag: '🇬🇧',
    streak: 5,
    email: 'lucas.p@example.com',
  },
  {
    id: 'contact-5',
    name: 'Kenji Sato',
    username: '@kenji_tokyo',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    status: 'online',
    learningLanguage: 'Japonais',
    flag: '🇯🇵',
    streak: 12,
    email: 'kenji.s@example.com',
  },
];

let messages: ChatMessage[] = [
  {
    id: 'msg-1',
    channelId: 'general',
    senderName: 'Sofia B.',
    senderUsername: '@sofia_b',
    senderAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlvb3V_A2WB6e6fBKohmbvX7-v5yXGMhxrpinjeTqGvRxyhe8F76rD9p4nBzepx5F0qOv4WnmbRqz4qRREp0lAJtDdZ2LcyJNB_Bg54db4RlbGvxzK5q1eZaNGDWz_E7fVlOT9ie1IZBxjoDLZhXC3Ow39e20Mt70hXAR9J0Pcw0shbftocRj7pT6bPfz1Tk-bn2Fcwj7Qvxc6i_1UcqHUk3HmZP8QA5LuFT_KQu9ClBk1VnBl13CI',
    text: '¡Hola a todos! Regardez ce que j\'ai dégusté à Barcelone après ma leçon sur la nourriture ! 🥘',
    type: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&auto=format&fit=crop&q=80',
    langTag: 'ES',
    timestamp: 'Il y a 10 min',
    likes: 8,
  },
  {
    id: 'msg-2',
    channelId: 'general',
    senderName: 'Pip le Lapin',
    senderUsername: '@pip_rabbit',
    senderAvatar: '/assets/images/rabbit_mascot.jpg',
    text: '¡Qué rico! «La paella de mariscos». Astuce : partagez un audio ou un vocal pour pratiquer votre accent !',
    type: 'sticker',
    stickerUrl: '/assets/images/rabbit_mascot.jpg',
    stickerLabel: 'Pip le Lapin Applaudit ! 🐰',
    langTag: 'BOT',
    timestamp: 'Il y a 8 min',
    likes: 6,
    isBot: true,
  },
  {
    id: 'msg-3',
    channelId: 'espanol',
    senderName: 'Mateo R.',
    senderUsername: '@mateo_madrid',
    senderAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    text: 'Voici ma prononciation pour «¿Me puede traer la cuenta, por favor?» écoutez !',
    type: 'voice',
    mediaDuration: '0:07',
    langTag: 'ES',
    timestamp: 'Il y a 15 min',
    likes: 4,
  },
  {
    id: 'msg-4',
    channelId: 'francais',
    senderName: 'Elena V.',
    senderUsername: '@elena_v',
    senderAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    text: 'Petite vidéo souvenir en marchant près de la Tour Eiffel pour pratiquer le vocabulaire parisien 🗼',
    type: 'video',
    mediaUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    langTag: 'FR',
    timestamp: 'Il y a 22 min',
    likes: 9,
  },
  {
    id: 'msg-5',
    channelId: 'anglais',
    senderName: 'Carlos D.',
    senderUsername: '@carlos_d',
    senderAvatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    text: 'Hey everyone! Qui est chaud pour un appel vidéo de 10 minutes pour pratiquer les questions-réponses ?',
    type: 'call_invite',
    langTag: 'EN',
    timestamp: 'Il y a 30 min',
    likes: 5,
  },
];

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Generous limit to allow image and audio data transfer
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get('/api/chat/channels', (_req, res) => {
    res.json(CHANNELS);
  });

  app.get('/api/chat/messages', (req, res) => {
    const channelId = (req.query.channelId as string) || 'general';
    const channelMessages = messages.filter((m) => m.channelId === channelId);
    res.json(channelMessages);
  });

  app.get('/api/chat/contacts', (_req, res) => {
    res.json(contacts);
  });

  app.post('/api/chat/contacts/add', (req, res) => {
    const { name, username, email, learningLanguage, flag } = req.body;
    if (!name || !username) {
      return res.status(400).json({ error: 'Nom et nom d\'utilisateur requis.' });
    }

    const newContact: FriendContact = {
      id: `contact-${Date.now()}`,
      name,
      username: username.startsWith('@') ? username : `@${username}`,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
      status: 'online',
      learningLanguage: learningLanguage || 'Espagnol',
      flag: flag || '🇪🇸',
      streak: 1,
      email: email || '',
    };

    contacts.push(newContact);
    res.status(201).json(newContact);
  });

  app.post('/api/chat/contacts/invite', (req, res) => {
    const { contactId, channelId, roomName } = req.body;
    const contact = contacts.find((c) => c.id === contactId);

    const inviteLink = `https://lingoquest.app/join/${channelId || 'general'}?ref=invite_${Date.now()}`;

    // Add a system notice in chat
    const systemNotice: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      channelId: channelId || 'general',
      senderName: 'LingoQuest Invite',
      senderUsername: '@system',
      senderAvatar: '/assets/images/rabbit_mascot.jpg',
      text: contact
        ? `💌 Invitation envoyée à ${contact.name} (${contact.username}) pour rejoindre ${roomName || 'le salon'} !`
        : `💌 Invitation générée pour le salon : ${inviteLink}`,
      type: 'call_invite',
      langTag: 'INVITE',
      timestamp: 'À l\'instant',
      likes: 0,
    };
    messages.push(systemNotice);

    res.json({
      success: true,
      inviteLink,
      message: `Invitation envoyée avec succès à ${contact?.name || 'vos contacts'} !`,
    });
  });

  app.post('/api/chat/messages', (req, res) => {
    const {
      channelId,
      senderName,
      senderUsername,
      senderAvatar,
      text,
      langTag,
      type,
      mediaUrl,
      mediaDuration,
      stickerUrl,
      stickerLabel,
      fileName,
    } = req.body;

    if (!text && !mediaUrl && !stickerUrl && type !== 'voice') {
      return res.status(400).json({ error: 'Le contenu du message est requis.' });
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: channelId || 'general',
      senderName: senderName || 'Alex M.',
      senderUsername: senderUsername || '@alex_lingo',
      senderAvatar:
        senderAvatar ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Ax3xcwycAIbjSZJqhR05eDvjilbuCFyL0qJTkM9lTvyx7o0H3Icv9aSr8fhIfkTyjFENmi0n4wnYwFGCLgPqLuvwRx8axyh8xH10iuN8rEG_s2yhneYDvISpOvBfsOXndDyTcVeiUdI8HTonMxAGMz_dwCkXLLZ90lkad8pSflAgsoAFmvqC5DN27uUIrYlcO5aVZLwL-T0xkDzcHsAQoogYt-37f2Tij_bYix7T29jZl6-V5f9o',
      text: text ? text.trim() : '',
      langTag: langTag || 'FR',
      timestamp: 'À l\'instant',
      likes: 0,
      type: type || 'text',
      mediaUrl,
      mediaDuration,
      stickerUrl,
      stickerLabel,
      fileName,
    };

    messages.push(newMessage);

    // Bot tutor dynamic encouragement
    const lower = (text || '').toLowerCase();
    const isQuestionOrGreeting =
      lower.includes('bonjour') ||
      lower.includes('hola') ||
      lower.includes('hello') ||
      lower.includes('aide') ||
      lower.includes('?');

    if (type === 'voice') {
      setTimeout(() => {
        const botVoiceReply: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          channelId: newMessage.channelId,
          senderName: 'Pip le Lapin Tuteur',
          senderUsername: '@pip_rabbit',
          senderAvatar: '/assets/images/rabbit_mascot.jpg',
          text: `🎙️ Superbe enregistrement vocal ${newMessage.senderName} ! L'intonation et le rythme sont très naturels. Continuez comme ça ! ⭐`,
          langTag: 'BOT',
          timestamp: 'À l\'instant',
          likes: 2,
          isBot: true,
        };
        messages.push(botVoiceReply);
      }, 1400);
    } else if (type === 'image') {
      setTimeout(() => {
        const botImgReply: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          channelId: newMessage.channelId,
          senderName: 'Pip le Lapin Tuteur',
          senderUsername: '@pip_rabbit',
          senderAvatar: '/assets/images/rabbit_mascot.jpg',
          text: `📸 Magnifique photo partagée ! Qui peut me décrire ce qu'on y voit dans la langue que vous apprenez ?`,
          langTag: 'BOT',
          timestamp: 'À l\'instant',
          likes: 2,
          isBot: true,
        };
        messages.push(botImgReply);
      }, 1500);
    } else if (isQuestionOrGreeting) {
      setTimeout(() => {
        const botReply: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          channelId: newMessage.channelId,
          senderName: 'Pip le Lapin Tuteur',
          senderUsername: '@pip_rabbit',
          senderAvatar: '/assets/images/rabbit_mascot.jpg',
          text: `Bien reçu ${newMessage.senderName} ! N'hésite pas à lancer un appel vidéo pour pratiquer avec vos amis ou écouter la prononciation audio. ¡Sigue así! 🚀`,
          langTag: 'BOT',
          timestamp: 'À l\'instant',
          likes: 1,
          isBot: true,
        };
        messages.push(botReply);
      }, 1200);
    }

    res.status(201).json(newMessage);
  });

  app.post('/api/chat/like', (req, res) => {
    const { messageId } = req.body;
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      msg.likes = (msg.likes || 0) + 1;
      return res.json({ success: true, likes: msg.likes });
    }
    res.status(404).json({ error: 'Message introuvable' });
  });

  // Vite middleware in dev or static serve in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LingoQuest Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
