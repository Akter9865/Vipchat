import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Kanban,
  FileText,
  Tags,
  Zap,
  FolderOpen,
  UserCheck,
  BarChart3,
  Settings,
  ShieldAlert,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSettings } from '../../context/SettingsContext.js';
import { useSocket } from '../../context/SocketContext.js';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, isAdminLoading, logoutAdmin } = useAuth();
  const { settings } = useSettings();
  const { socket } = useSocket();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');

  // Enforce Admin Auth
  useEffect(() => {
    if (!isAdminLoading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, isAdminLoading, navigate]);

  // Fetch notifications
  useEffect(() => {
    if (adminUser) {
      fetchNotifications();
    }
  }, [adminUser]);

  // Real-time notification listener
  useEffect(() => {
    if (!socket) return;

    socket.on('conversation:updated', (data: any) => {
      setUnreadCount((prev) => prev + 1);
      fetchNotifications();
    });

    return () => {
      socket.off('conversation:updated');
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/audit-logs/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center text-amber-400">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) return null;

  const isSuperAdmin = adminUser.role === 'SUPER_ADMIN';
  const isAdmin = adminUser.role === 'ADMIN' || isSuperAdmin;

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Live Conversations', path: '/admin/conversations', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: 'Contacts CRM', path: '/admin/contacts', icon: Users },
    { label: 'Leads Pipeline', path: '/admin/leads', icon: Kanban },
    { label: 'Message Templates', path: '/admin/templates', icon: FileText },
    { label: 'Tags Manager', path: '/admin/tags', icon: Tags },
    { label: 'Automations', path: '/admin/automations', icon: Zap },
    { label: 'Media Library', path: '/admin/media', icon: FolderOpen },
    ...(isAdmin ? [{ label: 'Users & Agents', path: '/admin/users', icon: UserCheck }] : []),
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    ...(isSuperAdmin ? [{ label: 'Appearance & Settings', path: '/admin/settings', icon: Settings }] : []),
    ...(isSuperAdmin ? [{ label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#0e0e11] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#14141a] border-r border-[#242430] flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#242430] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-lg shadow-gold-glow">
                👑
              </div>
              <div>
                <h1 className="text-sm font-bold gold-gradient-text tracking-wide truncate max-w-[130px]">
                  {settings.brandName || 'VIP Chat CRM'}
                </h1>
                <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold block">
                  {adminUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a24]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Customer Chat Preview Link */}
        <div className="p-3 border-t border-[#242430] space-y-2">
          {/* Direct link to public chat */}
          <a
            href="/chat"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-900/30 transition"
          >
            <span>Live Customer View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* User Profile Info */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1a1a24]">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={adminUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={adminUser.fullName}
                className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
              />
              <div className="truncate">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {adminUser.fullName}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">{adminUser.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-[#14141a] border-b border-[#242430] px-4 flex items-center justify-between gap-4 z-30">
          {/* Mobile menu toggle & Global search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    navigate(`/admin/contacts?search=${encodeURIComponent(globalSearch.trim())}`);
                  }
                }}
                placeholder="Global search contacts, phone, messages..."
                className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500/70 outline-none transition"
              />
            </div>
          </div>

          {/* Right actions: Online indicator, Notifications */}
          <div className="flex items-center gap-3">
            {/* Agent Live Status */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Desk Online</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 bg-[#1e1e26] border border-[#2a2a38] rounded-2xl shadow-2xl p-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/50 mb-2">
                    <span className="text-xs font-bold text-white">Live Alerts</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{notifications.length} alerts</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-4">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2 rounded-xl bg-[#14141a] border border-[#2a2a38] text-xs space-y-0.5"
                        >
                          <span className="font-bold text-amber-300 block">{n.title}</span>
                          <span className="text-slate-300 block">{n.message}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#0e0e11] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
