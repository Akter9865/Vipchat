import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Sparkles, MessageSquare, CheckCircle2, Lock, ArrowRight, Phone, User, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSettings } from '../../context/SettingsContext.js';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, isCustomerLoading, loginCustomer } = useAuth();
  const { settings } = useSettings();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If customer already has an active persistent session, automatically direct to /chat
  useEffect(() => {
    if (!isCustomerLoading && customer) {
      navigate('/chat');
    }
  }, [customer, isCustomerLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }

    setIsSubmitting(true);
    const fullMobile = mobileNumber.startsWith('+') ? mobileNumber.trim() : `${countryCode}${mobileNumber.trim()}`;

    const result = await loginCustomer(fullName.trim(), fullMobile, emailAddress.trim() || undefined);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/chat');
    } else {
      setErrorMsg(result.error || 'Failed to start live chat. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e11] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center text-xs sm:text-sm font-medium text-amber-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>24×7 Instant VIP Support • High-Priority Concierge Desk</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-[#16161c] border border-[#2a2a38] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Glowing Ambient Accents */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Brand Logo & Header */}
            <div className="text-center mb-6 relative">
              {/* Luxury Logo Badge */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#23232e] to-[#121216] border border-amber-500/40 shadow-gold-glow mb-4">
                <span className="text-2xl font-black gold-gradient-text tracking-wider">
                  👑
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gold-gradient-text font-serif">
                {settings.brandName || 'VIP CHAT'}
              </h1>
              <p className="text-amber-400/80 text-xs font-semibold tracking-widest uppercase mt-1">
                {settings.supportName || 'Chat Support'}
              </p>
              <p className="text-slate-400 text-xs mt-2">
                {settings.loginSubtitle || 'Enter your details to start live support'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <span className="font-bold">⚠️</span> {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition outline-none"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  Mobile Number <span className="text-amber-400">*</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-[#2a2a38] focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/80 transition bg-[#0e0e11]">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#1c1c24] text-amber-400 text-xs font-semibold px-2.5 py-2.5 border-r border-[#2a2a38] outline-none cursor-pointer"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+61">+61 (AU)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Enter 10-digit mobile"
                    maxLength={14}
                    className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Email Address (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address <span className="text-slate-500 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition outline-none"
                />
              </div>

              {/* Marketing & Terms Consent */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/50"
                />
                <label htmlFor="consent" className="text-[11px] text-slate-400 leading-tight">
                  I agree to the{' '}
                  <Link to="/terms" className="text-amber-400 hover:underline">
                    Terms
                  </Link>{' '}
                  &{' '}
                  <Link to="/privacy" className="text-amber-400 hover:underline">
                    Privacy Policy
                  </Link>
                  . Instant live session will be opened.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gold-gradient-btn py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Connecting to VIP Concierge...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {settings.loginButtonText || 'Start Live Chat'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Security Guarantee Badges */}
            <div className="mt-6 pt-4 border-t border-[#2a2a38]/80 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Zero OTP / Instant Access</span>
              </div>
            </div>
          </div>

          {/* Admin Portal Link */}
          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="text-xs text-slate-500 hover:text-amber-400 transition inline-flex items-center gap-1"
            >
              <span>Agent & Admin Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-[#1c1c24]">
        {settings.footerText || 'Protected by 256-Bit SSL Encryption • All Rights Reserved'}
      </footer>
    </div>
  );
};
