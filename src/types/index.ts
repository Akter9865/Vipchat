export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';

export type LeadStatus =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'CONFIRMED'
  | 'HIGH_VALUE'
  | 'FOLLOW_UP'
  | 'CONVERTED'
  | 'NOT_INTERESTED'
  | 'CLOSED';

export type ConversationStatus = 'ACTIVE' | 'UNREAD' | 'WAITING' | 'CLOSED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';

export type MessageSenderType = 'CUSTOMER' | 'AGENT' | 'SYSTEM' | 'AUTOMATION';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'VOICE_NOTE'
  | 'DOCUMENT'
  | 'SYSTEM_EVENT';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  colorHex: string;
  isActive: boolean;
  usageCount?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastActiveAt?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress?: string;
  avatarUrl?: string;
  leadStatus: LeadStatus;
  leadScore: number;
  source: string;
  marketingConsent: boolean;
  customFields?: Record<string, any>;
  assignedAgentId?: string | null;
  assignedAgent?: { id: string; fullName: string; email?: string; avatarUrl?: string } | null;
  tags?: Tag[];
  isOnline: boolean;
  lastActiveAt: string;
  createdAt: string;
  conversationCount?: number;
  conversations?: Conversation[];
  internalNotes?: InternalNote[];
  sessions?: any[];
}

export interface MessageAttachment {
  id: string;
  messageId?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderUserId?: string | null;
  senderName: string;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    messageType: string;
  } | null;
  attachments?: MessageAttachment[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contact?: Contact | null;
  assignedAgentId?: string | null;
  assignedAgent?: { id: string; fullName: string; avatarUrl?: string } | null;
  status: ConversationStatus;
  priority: PriorityLevel;
  isStarred: boolean;
  unreadCustomerCount: number;
  unreadAgentCount: number;
  lastMessageSnippet?: string;
  lastMessageAt: string;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface InternalNote {
  id: string;
  conversationId?: string;
  contactId: string;
  authorId: string;
  author?: { id: string; fullName: string; avatarUrl?: string } | null;
  content: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  shortcutKey?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  conditions: Array<{ field: string; operator: string; value: any }>;
  actions: Array<{ actionType: string; payload: any }>;
  delaySeconds: number;
  isActive: boolean;
  executionCount?: number;
  createdAt: string;
}

export interface AppearanceSettings {
  themePreset: string; // 'whatsapp_green' | 'whatsapp_dark' | 'vip_gold' | 'royal_blue' | 'emerald_pro' | 'custom'
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerColor: string;
  chatBackgroundUrl?: string;
  chatWallpaperType: string; // 'doodle_light' | 'doodle_dark' | 'custom_image' | 'solid'
  chatHeaderTitle: string;
  supportName: string;
  supportAvatarUrl: string;
  onlineText: string;
  offlineText: string;
  replyTimeText: string;
  welcomeMessage: string;
  welcomeMessageMediaUrl?: string;
  welcomeMessageMediaType?: string;
  welcomeMessageDelaySeconds: number;
  welcomeMessageOnlyOnce: boolean;
  sendWelcomeToReturning: boolean;
  loginTitle: string;
  loginSubtitle: string;
  loginButtonText: string;
  footerText: string;
  termsUrl: string;
  privacyUrl: string;
  enableVoiceRecording: boolean;
  enableAttachments: boolean;
}
