import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppearanceSettings } from '../types/index.js';

const defaultSettings: AppearanceSettings = {
  themePreset: 'whatsapp_green',
  brandName: 'VIP Chat Live',
  brandTagline: '24×7 Instant VIP Support & Concierge',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#00a884',
  secondaryColor: '#111b21',
  accentColor: '#00a884',
  headerColor: '#008069',
  chatWallpaperType: 'doodle_light',
  chatHeaderTitle: 'Chat Support',
  supportName: 'Chat Support',
  supportAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  onlineText: 'Online',
  offlineText: 'Replies typically in 5 mins',
  replyTimeText: 'Typically replies within 5 minutes',
  welcomeMessage: 'WELCOME TO VIP CHAT CONCIERGE 👑\n★ ( PREMIUM 24×7 LIVE ASSISTANCE ) ★\n───────────────────\n★ FASTEST SUPPORT & INQUIRY HANDLING\n☆ 24×7 INSTANT RESPONSES\n☆ 100% SECURE & PRIVACY COMPLIANT\n───────────────────\nHow can our VIP team assist you today?',
  welcomeMessageMediaUrl: '',
  welcomeMessageMediaType: 'IMAGE',
  welcomeMessageDelaySeconds: 1,
  welcomeMessageOnlyOnce: false,
  sendWelcomeToReturning: false,
  loginTitle: 'VIP CHAT',
  loginSubtitle: 'Enter your details to start live support',
  loginButtonText: 'Start Live Chat',
  footerText: 'Protected by 256-Bit SSL Encryption • All Rights Reserved',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  enableVoiceRecording: true,
  enableAttachments: true,
};

interface SettingsContextType {
  settings: AppearanceSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  updateSettings: async () => false,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/appearance');
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    try {
      const res = await fetch('/api/settings/appearance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Update settings failed:', e);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
