import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Radio,
  Send,
  FolderOpen,
  HelpCircle,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('LAST_7_DAYS');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/analytics?range=${dateRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Fetch analytics error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading analytics & KPIs...</p>
      </div>
    );
  }

  const { kpi, charts } = data;

  // Leads Trend Line Chart
  const lineChartData = {
    labels: charts.dailyLeads.map((d: any) => d.date.slice(5)),
    datasets: [
      {
        label: 'New Leads',
        data: charts.dailyLeads.map((d: any) => d.count),
        borderColor: '#dfb75c',
        backgroundColor: 'rgba(223, 183, 92, 0.15)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Conversations',
        data: charts.dailyConvos.map((d: any) => d.count),
        borderColor: '#00a884',
        backgroundColor: 'rgba(0, 168, 132, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Status Donut Chart
  const donutData = {
    labels: charts.statusDistribution.map((s: any) => s.status.replace('_', ' ')),
    datasets: [
      {
        data: charts.statusDistribution.map((s: any) => s.count),
        backgroundColor: [
          '#dfb75c', '#3b82f6', '#10b981', '#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'
        ],
        borderWidth: 0,
      },
    ],
  };

  const statCards = [
    { label: 'Total Contacts', value: kpi.totalContacts, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'New Today', value: kpi.newToday, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Chats', value: kpi.activeConvos, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Unread Chats', value: kpi.unreadConvos, icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Qualified Leads', value: kpi.qualifiedLeads, icon: UserCheck, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Confirmed Leads', value: kpi.confirmedLeads, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Conversion Rate', value: `${kpi.conversionRate}%`, icon: ArrowUpRight, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Online Visitors', value: kpi.onlineVisitors, icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Messages Today', value: kpi.messagesToday, icon: Send, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Media Uploads', value: kpi.mediaUploads, icon: FolderOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Live Analytics & KPI Overview
          </h1>
          <p className="text-xs text-slate-400">
            Realtime customer interaction, lead conversion, and team performance
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#16161c] border border-[#2a2a38] rounded-xl p-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400 ml-2" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-slate-200 py-1 px-2 outline-none font-medium cursor-pointer"
          >
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-[#14141a] border border-[#242430] rounded-2xl p-4 shadow-lg hover:border-amber-500/30 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leads & Convos Timeline Chart */}
        <div className="lg:col-span-2 bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Customer Inquiries & Leads Volume</h3>
            <span className="text-[11px] text-amber-400 font-semibold">Daily Trend</span>
          </div>
          <div className="h-64 sm:h-72">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 11 } } },
                },
                scales: {
                  x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                  y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>

        {/* Lead Status Distribution Donut */}
        <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-200">Lead Pipeline Distribution</h3>
            <span className="text-[11px] text-emerald-400 font-semibold">Live Stages</span>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <Doughnut
              data={donutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 10 } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 mb-4">Agent Concierge Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-[#242430] text-slate-500 font-semibold">
                <th className="pb-3">Agent Name</th>
                <th className="pb-3">Assigned Contacts</th>
                <th className="pb-3">Closed Chats</th>
                <th className="pb-3">Avg Response Time</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e28]">
              {charts.agentPerformance.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-[#1a1a24] transition">
                  <td className="py-3 font-semibold text-slate-200">{agent.name}</td>
                  <td className="py-3">{agent.assignedContacts} contacts</td>
                  <td className="py-3">{agent.closedConversations} resolved</td>
                  <td className="py-3 text-amber-400 font-semibold">{agent.avgResponseMinutes} mins</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
