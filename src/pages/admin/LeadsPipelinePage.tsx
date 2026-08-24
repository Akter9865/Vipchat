import React, { useState, useEffect } from 'react';
import { Kanban, ArrowRight, UserCheck, Star, Clock } from 'lucide-react';
import { Contact, LeadStatus } from '../../types/index.js';

const columns: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'NEW_LEAD', label: 'New Lead', color: 'border-blue-500/40 text-blue-400' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-cyan-500/40 text-cyan-400' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'CONFIRMED', label: 'Confirmed', color: 'border-purple-500/40 text-purple-400' },
  { id: 'HIGH_VALUE', label: 'High Value VIP', color: 'border-amber-500/40 text-amber-400' },
  { id: 'FOLLOW_UP', label: 'Follow Up', color: 'border-orange-500/40 text-orange-400' },
  { id: 'CONVERTED', label: 'Converted', color: 'border-green-500/40 text-green-400' },
  { id: 'CLOSED', label: 'Closed', color: 'border-slate-500/40 text-slate-400' },
];

export const LeadsPipelinePage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/contacts?limit=200');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
      }
    } catch (e) {}
    finally {
      setIsLoading(false);
    }
  };

  const handleMoveStatus = async (contactId: string, newStatus: LeadStatus) => {
    try {
      await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadStatus: newStatus }),
      });
      fetchContacts();
    } catch (e) {}
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
          Lead Conversion Pipeline
        </h1>
        <p className="text-xs text-slate-400">
          Visual Kanban funnel for active CRM prospects & VIP progression
        </p>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {columns.map((col) => {
          const colContacts = contacts.filter((c) => c.leadStatus === col.id);

          return (
            <div
              key={col.id}
              className="w-72 bg-[#14141a] border border-[#242430] rounded-2xl flex flex-col shrink-0 max-h-[calc(100vh-180px)] shadow-xl"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[#242430] flex items-center justify-between">
                <span className={`text-xs font-bold ${col.color}`}>
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e1e28] text-slate-300">
                  {colContacts.length}
                </span>
              </div>

              {/* Cards Stream */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
                {colContacts.length === 0 ? (
                  <p className="text-center text-[11px] text-slate-600 py-6">No leads</p>
                ) : (
                  colContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-[#1a1a24] border border-[#2a2a38] rounded-xl p-3 shadow hover:border-amber-500/40 transition group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {contact.fullName}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                          ★ {contact.leadScore}
                        </span>
                      </div>

                      <p className="text-[11px] text-amber-300/90 font-medium mb-2">
                        {contact.mobileNumber}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-[#242430]">
                        <span>{contact.assignedAgent?.fullName || 'Unassigned'}</span>

                        {/* Quick Status Shift Selector */}
                        <select
                          value={contact.leadStatus}
                          onChange={(e) => handleMoveStatus(contact.id, e.target.value as LeadStatus)}
                          className="bg-[#121217] border border-[#2a2a38] text-slate-300 text-[10px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.id}>
                              Move to: {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
