import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.js';

export const PrivacyPage: React.FC = () => {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: August 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-2">1. Information We Collect</h2>
            <p>
              When using {settings.brandName || 'VIP Chat Live'}, we collect minimal customer information strictly to establish your persistent live concierge session:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>Full Name</li>
              <li>Mobile Phone Number</li>
              <li>Email Address (optional)</li>
              <li>Live chat message history & uploaded attachments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-2">2. How We Protect Your Data</h2>
            <p>
              All customer communications are encrypted using 256-bit SSL protocols during transmission. Sessions are maintained via secure, HttpOnly, SameSite cookies. We never sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-2">3. Self-Hosted Infrastructure</h2>
            <p>
              Our CRM runs entirely on private, dedicated VPS servers. Customer records and media are managed with zero dependence on commercial ad trackers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-2">4. Data Deletion & Privacy Rights</h2>
            <p>
              Customers have the right to request complete deletion of their contact record and conversation transcript at any time by contacting our support desk or selecting &quot;End Session&quot; in the menu.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
