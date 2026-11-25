export interface PlaylistItem {
  title: string;
  artist: string;
  url: string;
  note: string;
}

export interface SiteConfigData {
  id: string;
  partnerName: string;
  heroTitle: string;
  heroSubtitle: string;
  relationshipDate: string;
  playlist: PlaylistItem[];
}

export interface WheelItemData {
  id: string;
  label: string;
  color: string;
  category: string;
  isActive: boolean;
}

export interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  rewardMessage: string | null;
  order: number;
}

export interface CouponData {
  id: string;
  title: string;
  description: string;
  emoji: string;
  isUsed: boolean;
  usedAt: string | null;
}

export interface SpecialNoteData {
  id: string;
  type: "JAR" | "COOKIE" | "CAPSULE";
  title: string | null;
  content: string;
  unlockDate: string | null;
  isOpened: boolean;
  createdAt: string;
}

export interface MemoryData {
  id: string;
  title: string;
  story: string;
  mediaUrl: string;
  mediaType: string;
  location: string | null;
  date: string;
}

export interface ActivityLogData {
  id: string;
  actionType: string;
  title: string;
  detail: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}
