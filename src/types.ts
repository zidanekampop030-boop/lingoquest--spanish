export type ScreenTab = 'learn' | 'quizzes' | 'leagues' | 'chat' | 'profile';

export type AppScreen =
  | ScreenTab
  | 'onboarding'
  | 'auth'
  | 'settings'
  | 'active_quiz'
  | 'completion';

export type MessageMediaType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'sticker'
  | 'call_invite';

export interface ChatMessage {
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

export interface ChatSticker {
  id: string;
  name: string;
  emoji: string;
  url: string;
  category: string;
}

export interface FriendContact {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'in_call';
  learningLanguage: string;
  flag: string;
  streak: number;
}

export interface ChatChannel {
  id: string;
  name: string;
  topic: string;
  icon: string;
  flag: string;
  onlineCount: number;
}

export type QuestionType =
  | 'sentence_assembly'
  | 'multiple_choice'
  | 'audio_comprehension'
  | 'fill_blank';

export interface TargetLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  level: string;
  speechCode: string;
  sectionName: string;
  unitName: string;
  unitDescription: string;
}

export interface QuizQuestion {
  id: string;
  languageCode: string;
  unitId: number;
  type: QuestionType;
  category: string;
  promptTitle: string;
  targetSentence: string; // The foreign phrase (e.g. Spanish, French, etc.)
  targetTokens?: string[]; // Tokenized foreign words if needed
  englishTargetSentence: string;
  englishTargetTokens: string[];
  initialPlacedTokens: string[];
  wordBankTokens: string[];
  cefrLevel: string;
  mascotTip: string;
  solutionEnglish: string;
  explanation: string;
  // For multiple-choice or fill-in-blank:
  options?: { text: string; correct: boolean }[];
  missingWordHint?: string;
}

export interface LearningNode {
  id: number;
  title: string;
  icon: string;
  status: 'completed' | 'active' | 'locked';
  stars?: number;
  xpReward: number;
  xOffsetClass: string;
  isChest?: boolean;
}

export interface UserProgress {
  hearts: number;
  maxHearts: number;
  gems: number;
  streakDays: number;
  totalXp: number;
  comboCount: number;
  activeLanguage: string;
  languageFlag: string;
  dailyQuestProgress: number;
  dailyQuestTotal: number;
  dailyQuestClaimed: boolean;
  sofiaCelebrated: boolean;
  unlockedWordChest: boolean;
  hasCompletedOnboarding: boolean;
}

export interface AppSettings {
  soundEffects: boolean;
  speechSpeed: 'normal' | 'slow';
  dailyGoalMinutes: number;
  uiLanguage: 'fr' | 'en' | 'es';
  vibrationHaptic: boolean;
  darkMode: boolean;
  notifications: boolean;
  listeningExercises: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  isLoggedIn: boolean;
  joinedDate: string;
}

export interface QuizResultSummary {
  totalXpGained: number;
  accuracy: number;
  timeSpentSeconds: number;
  phrasesMasteredCount: number;
  totalPhrasesCount: number;
  mistakePhrase?: string;
  mistakeMeaning?: string;
  bonusGems: number;
  languageCode: string;
}
