export type ViewId = 'feed' | 'profile' | 'swipe' | 'chat' | 'challenges' | 'codes';

export interface TelegramUser {
  id: string;
  first_name: string;
  username?: string;
}

export type Tag =
  | 'Флирт'
  | 'Романтика'
  | 'Страсть'
  | 'Юмор'
  | 'Тайные желания';

export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  tags: Tag[];
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  tags: Tag[];
  timestamp: string;
  liked?: boolean;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessagePreview?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  selfDestructAt: string;
}

export interface Challenge {
  id: string;
  type: string;
  status: 'pending' | 'in_progress' | 'done';
  reward: string;
  progress?: number;
}




