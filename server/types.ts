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

export interface CustomerAuthPayload {
  contactId: string;
  sessionToken: string;
  fullName: string;
  mobileNumber: string;
  emailAddress?: string;
}

export interface AdminAuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface SystemAppearanceSettings {
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
