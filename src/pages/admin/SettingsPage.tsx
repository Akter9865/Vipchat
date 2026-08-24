import React, { useState, useRef } from 'react';
import {
  Settings,
  Image as ImageIcon,
  Sparkles,
  Check,
  Save,
  Upload,
  ShieldCheck,
  Palette,
  Phone,
  Video,
  CheckCircle2,
  Lock,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.js';

interface ThemePresetOption {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  headerColor: string;
  secondaryColor: string;
  accentColor: string;
  wallpaper: 'doodle_light' | 'doodle_dark' | 'solid';
}

const themePresets: ThemePresetOption[] = [
  {
    id: 'whatsapp_green',
    name: 'Classic WhatsApp',
    description: 'Signature WhatsApp teal header with light doodle wallpaper & emerald accents',
    primaryColor: '#00a884',
    headerColor: '#008069',
    secondaryColor: '#ffffff',
    accentColor: '#00a884',
    wallpaper: 'doodle_light',
  },
  {
    id: 'whatsapp_dark',
    name: 'WhatsApp Dark Mode',
    description: 'Authentic WhatsApp Dark theme with #005c4b headers & dark pattern background',
    primaryColor: '#00a884',
    headerColor: '#1f2c34',
    secondaryColor: '#111b21',
    accentColor: '#00a884',
    wallpaper: 'doodle_dark',
  },
  {
    id: 'vip_gold',
    name: 'VIP Luxury Gold',
    description: 'Obsidian luxury black with radiant gold gradients & metallic borders',
    primaryColor: '#dfb75c',
    headerColor: '#16161c',
    secondaryColor: '#0e0e11',
    accentColor: '#dfb75c',
    wallpaper: 'doodle_dark',
  },
  {
    id: 'royal_blue',
    name: 'Royal Sapphire',
    description: 'Premium corporate sapphire blue with modern dark indigo tones',
    primaryColor: '#2563eb',
    headerColor: '#1e293b',
    secondaryColor: '#0f172a',
    accentColor: '#3b82f6',
    wallpaper: 'doodle_dark',
  },
  {
    id: 'emerald_pro',
    name: 'Emerald Pro Desk',
    description: 'Deep forest emerald tones for high-conversion sales and fast support',
    primaryColor: '#059669',
    headerColor: '#064e3b',
    secondaryColor: '#022c22',
    accentColor: '#10b981',
    wallpaper: 'doodle_dark',
  },
  {
    id: 'sunset_violet',
    name: 'Sunset VIP Violet',
    description: 'Vibrant neon purple and violet concierge styling',
    primaryColor: '#7c3aed',
    headerColor: '#1e1633',
    secondaryColor: '#130e20',
    accentColor: '#8b5cf6',
    wallpaper: 'doodle_dark',
  },
];

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'profile' | 'welcome' | 'onboarding'>('themes');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const welcomeMediaInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: ThemePresetOption) => {
    setFormData((prev) => ({
      ...prev,
      themePreset: preset.id,
      primaryColor: preset.primaryColor,
      headerColor: preset.headerColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      chatWallpaperType: preset.wallpaper,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (res.ok && data.file?.fileUrl) {
        handleChange(targetField, data.file.fileUrl);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateSettings(formData);
    setIsSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Appearance, Theme Studio & Brand Customizer
          </h1>
          <p className="text-xs text-slate-400">
            Control customer profile picture (DP), live WhatsApp theme presets, custom colors, and rich welcome messages
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
            <Check className="w-4 h-4" /> Live Changes Saved!
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-[#14141a] border border-[#242430] rounded-2xl p-1.5 overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'themes' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" /> Theme Presets & Colors
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Support DP & Identity
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('welcome')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'welcome' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Auto-Welcome Media & Text
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'onboarding' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" /> Login Screen & Legal
        </button>
      </div>

      {/* Main Grid: Settings Controls on Left, Live Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 8 cols */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* TAB 1: THEMES & COLORS */}
          {activeTab === 'themes' && (
            <div className="space-y-5 animate-fade-in">
              {/* Preset Cards */}
              <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" /> WhatsApp & Luxury Theme Presets
                  </h3>
                  <span className="text-[11px] text-amber-400 font-semibold">One-Click Switch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themePresets.map((preset) => {
                    const isSelected = formData.themePreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                            : 'bg-[#181822] border-[#2a2a38] hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white">{preset.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span
                                style={{ backgroundColor: preset.headerColor }}
                                className="w-3.5 h-3.5 rounded-full border border-white/20"
                                title="Header Color"
                              />
                              <span
                                style={{ backgroundColor: preset.primaryColor }}
                                className="w-3.5 h-3.5 rounded-full border border-white/20"
                                title="Primary Accent"
                              />
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{preset.description}</p>
                        </div>

                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-amber-400">
                            <Check className="w-3.5 h-3.5" /> Selected Theme
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-sm font-bold text-white">Custom Color Overrides</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Header Bar</label>
                    <div className="flex items-center gap-2 bg-[#0e0e11] border border-[#2a2a38] rounded-xl p-2">
                      <input
                        type="color"
                        value={formData.headerColor || '#008069'}
                        onChange={(e) => handleChange('headerColor', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[11px] text-slate-200 uppercase">{formData.headerColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Primary Color</label>
                    <div className="flex items-center gap-2 bg-[#0e0e11] border border-[#2a2a38] rounded-xl p-2">
                      <input
                        type="color"
                        value={formData.primaryColor || '#00a884'}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[11px] text-slate-200 uppercase">{formData.primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Accent Badges</label>
                    <div className="flex items-center gap-2 bg-[#0e0e11] border border-[#2a2a38] rounded-xl p-2">
                      <input
                        type="color"
                        value={formData.accentColor || '#00a884'}
                        onChange={(e) => handleChange('accentColor', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[11px] text-slate-200 uppercase">{formData.accentColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Chat Wallpaper</label>
                    <select
                      value={formData.chatWallpaperType || 'doodle_light'}
                      onChange={(e) => handleChange('chatWallpaperType', e.target.value)}
                      className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-2 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="doodle_light">WhatsApp Light Doodle</option>
                      <option value="doodle_dark">WhatsApp Dark Doodle</option>
                      <option value="solid">Clean Dark Solid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUPPORT DP & IDENTITY */}
          {activeTab === 'profile' && (
            <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg space-y-5 animate-fade-in text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Support Display Picture (DP) & Public Identity
              </h3>

              {/* Support DP Uploader */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#0e0e11] border border-[#2a2a38]">
                <div className="relative shrink-0">
                  <img
                    src={formData.supportAvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                    alt="Support DP"
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0e0e11]" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-white block">Support Agent Profile DP</span>
                  <p className="text-[11px] text-slate-400">
                    Upload an authentic avatar photo shown at the top of customer chats.
                  </p>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'supportAvatarUrl')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-900/40 transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload New DP
                  </button>
                </div>
              </div>

              {/* Name & Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Support Display Name</label>
                  <input
                    type="text"
                    value={formData.supportName}
                    onChange={(e) => handleChange('supportName', e.target.value)}
                    placeholder="e.g. Chat Support"
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Brand Name / Service Name</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => handleChange('brandName', e.target.value)}
                    placeholder="e.g. VIP Chat Concierge"
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Online Status Text</label>
                  <input
                    type="text"
                    value={formData.onlineText}
                    onChange={(e) => handleChange('onlineText', e.target.value)}
                    placeholder="Online"
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reply Guarantee Text</label>
                  <input
                    type="text"
                    value={formData.replyTimeText}
                    onChange={(e) => handleChange('replyTimeText', e.target.value)}
                    placeholder="Typically replies within 5 minutes"
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTO-WELCOME MEDIA & TEXT */}
          {activeTab === 'welcome' && (
            <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg space-y-4 animate-fade-in text-xs">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Automated Welcome Concierge Message & Media
              </h3>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Welcome Text Message
                </label>
                <textarea
                  rows={6}
                  value={formData.welcomeMessage}
                  onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl p-3 text-white font-mono text-xs outline-none focus:border-amber-500/70"
                />
              </div>

              {/* Welcome Media Attachment */}
              <div className="p-4 rounded-2xl bg-[#0e0e11] border border-[#2a2a38] space-y-3">
                <span className="text-xs font-bold text-white block">Optional Welcome Media / Video / Image</span>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={welcomeMediaInputRef}
                    accept="image/*,video/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, 'welcomeMessageMediaUrl')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => welcomeMediaInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-[#1e1e28] hover:bg-slate-700 text-slate-200 font-semibold transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload Welcome Media
                  </button>
                  {formData.welcomeMessageMediaUrl && (
                    <span className="text-[11px] text-emerald-400 font-semibold truncate max-w-xs">
                      Media Attached: {formData.welcomeMessageMediaUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Delay Before Send (Seconds)</label>
                  <input
                    type="number"
                    value={formData.welcomeMessageDelaySeconds}
                    onChange={(e) => handleChange('welcomeMessageDelaySeconds', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="welcomeReturning"
                    checked={formData.sendWelcomeToReturning}
                    onChange={(e) => handleChange('sendWelcomeToReturning', e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500"
                  />
                  <label htmlFor="welcomeReturning" className="text-slate-300 font-medium cursor-pointer">
                    Send to returning visitors
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGIN SCREEN & LEGAL */}
          {activeTab === 'onboarding' && (
            <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg space-y-4 animate-fade-in text-xs">
              <h3 className="text-sm font-bold text-white">Login Onboarding Card & Legal URLs</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Card Title</label>
                  <input
                    type="text"
                    value={formData.loginTitle}
                    onChange={(e) => handleChange('loginTitle', e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Card Subtitle</label>
                  <input
                    type="text"
                    value={formData.loginSubtitle}
                    onChange={(e) => handleChange('loginSubtitle', e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Submit Button Text</label>
                  <input
                    type="text"
                    value={formData.loginButtonText}
                    onChange={(e) => handleChange('loginButtonText', e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Terms of Service URL</label>
                  <input
                    type="text"
                    value={formData.termsUrl}
                    onChange={(e) => handleChange('termsUrl', e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Privacy Policy URL</label>
                  <input
                    type="text"
                    value={formData.privacyUrl}
                    onChange={(e) => handleChange('privacyUrl', e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="gold-gradient-btn px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-gold-glow cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Applying Changes...' : 'Save Appearance Settings'}
            </button>
          </div>
        </form>

        {/* Right Panel: Live Mobile Preview: 5 cols */}
        <div className="lg:col-span-5 bg-[#14141a] border border-[#242430] rounded-3xl p-4 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242430]">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Realtime Customer Preview
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Live Preview</span>
          </div>

          {/* Smartphone Mockup */}
          <div className="rounded-2xl border-4 border-[#242430] bg-[#0b141a] overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Header */}
            <div
              style={{ backgroundColor: formData.headerColor || '#008069' }}
              className="px-3 py-2.5 flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={formData.supportAvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                  alt="DP"
                  className="w-8 h-8 rounded-full object-cover border border-white/40"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white leading-none">
                      {formData.supportName || 'Chat Support'}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-cyan-300" />
                  </div>
                  <span className="text-[10px] text-emerald-200 leading-none">
                    {formData.onlineText || 'Online'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/90">
                <Phone className="w-4 h-4" />
                <Video className="w-4 h-4" />
              </div>
            </div>

            {/* Chat Body */}
            <div
              className={`flex-1 p-3 overflow-y-auto space-y-2.5 ${
                formData.chatWallpaperType === 'doodle_light' ? 'chat-wallpaper' : 'dark-chat-wallpaper'
              }`}
            >
              {/* Floating Subcard */}
              <div className="bg-white dark:bg-[#1f2c34] rounded-2xl p-3 shadow text-center max-w-[240px] mx-auto border border-emerald-500/20">
                <img
                  src={formData.supportAvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                  alt="DP"
                  className="w-12 h-12 rounded-full object-cover mx-auto ring-2 ring-emerald-500 mb-1"
                />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {formData.supportName}
                </h4>
                <p className="text-[10px] text-slate-400 mb-2">{formData.replyTimeText}</p>
                <div className="grid grid-cols-3 gap-1">
                  <span className="py-1 rounded bg-emerald-50 dark:bg-emerald-950/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Audio</span>
                  <span className="py-1 rounded bg-emerald-50 dark:bg-emerald-950/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Video</span>
                  <span className="py-1 rounded bg-emerald-50 dark:bg-emerald-950/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
                </div>
              </div>

              {/* Bot Message */}
              <div className="max-w-[240px] bg-[#1a232a] text-slate-100 text-[10px] p-2.5 rounded-xl border border-amber-500/20 leading-relaxed shadow">
                <span className="text-amber-400 font-bold block mb-0.5">👑 VIP Concierge</span>
                <p className="whitespace-pre-wrap">{formData.welcomeMessage}</p>
              </div>
            </div>

            {/* Mock Composer */}
            <div className="p-2 bg-[#16161c] border-t border-[#2a2a38] flex items-center gap-2">
              <input
                type="text"
                disabled
                placeholder="Type a message"
                className="flex-1 bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-2.5 py-1 text-[10px] text-slate-400 outline-none"
              />
              <div
                style={{ backgroundColor: formData.primaryColor || '#00a884' }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow"
              >
                ➤
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
