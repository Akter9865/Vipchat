import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.js';

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#0e0e11] text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-[#16161c] border border-[#2a2a38] rounded-2xl p-6 sm:p-10 shadow-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Live Chat
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
            <p className="text-xs text-slate-400">Last Updated: August 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and initiating live chat with {settings.brandName || 'VIP Chat Live'}, you agree to comply with these terms of service and ensure courteous communication with our customer concierge team.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-2">2. Acceptable Use Policy</h2>
            <p>
              Users are prohibited from transmitting abusive, harassing, illegal, or malicious file attachments through the live chat system. Accounts violating these rules will be blocked immediately.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-2">3. Service Availability</h2>
            <p>
              While we aim to maintain 99.9% uptime and reply within 5 minutes, response times may vary during peak inquiry volumes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
