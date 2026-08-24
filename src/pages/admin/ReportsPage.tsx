import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics?range=LAST_30_DAYS')
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        Generating reports & conversion metrics...
      </div>
    );
  }

  const { kpi, charts } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Performance Reports & CRM Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Monthly summaries, agent throughput, lead scoring distribution, and conversion funnels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('/api/contacts/export/xlsx', '_blank')}
            className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" /> Download Complete Report
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Overall Conversion Rate</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            {kpi.conversionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Converted & Confirmed Leads</p>
        </div>

        <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Average Response Time</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            1.8 min
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 24×7 desk agents</p>
        </div>

        <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Total Leads Handled</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">
            {kpi.totalContacts}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From live chat submissions</p>
        </div>

        <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Live Support Resolution</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-2">
            94.6%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Positive customer resolution</p>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4">Pipeline Status Volume Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {charts.statusDistribution.map((item: any) => (
            <div key={item.status} className="p-3 rounded-xl bg-[#111116] border border-[#242430]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">
                {item.status.replace('_', ' ')}
              </span>
              <span className="text-xl font-extrabold text-white mt-1 block">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
