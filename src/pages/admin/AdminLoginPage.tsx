import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSettings } from '../../context/SettingsContext.js';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminUser, isAdminLoading, loginAdmin } = useAuth();
  const { settings } = useSettings();

  const [email, setEmail] = useState('admin@vipchat.live');
  const [password, setPassword] = useState('VipAdmin@2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isAdminLoading && adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, isAdminLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await loginAdmin(email.trim(), password, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e11] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Banner */}
      <div className="py-2.5 px-4 text-center text-xs font-semibold text-amber-400/90 border-b border-[#1c1c24] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Live Chat CRM • Agent & Executive Operations Portal</span>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          <div className="bg-[#16161c] border border-[#2a2a38] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-2xl shadow-gold-glow mx-auto mb-3">
                👑
              </div>
              <h1 className="text-2xl font-bold text-white">Admin & Agent Portal</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access the CRM console
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vipchat.live"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] focus:border-amber-500/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] focus:border-amber-500/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500"
                  />
                  <span>Keep me logged in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gold-gradient-btn py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Credentials Info */}
            <div className="mt-6 pt-4 border-t border-[#242430] text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-amber-400">Pre-seeded Credentials:</p>
              <p>• Super Admin: <code className="text-slate-200">admin@vipchat.live</code> / <code className="text-slate-200">VipAdmin@2026!</code></p>
              <p>• Agent 1: <code className="text-slate-200">sophia.agent@vipchat.live</code> / <code className="text-slate-200">Agent@2026!</code></p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-amber-400 transition">
              ← Return to Customer Chat
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-slate-600 border-t border-[#1c1c24]">
        {settings.brandName || 'VIP Chat'} Live CRM • Enterprise Security
      </footer>
    </div>
  );
};
