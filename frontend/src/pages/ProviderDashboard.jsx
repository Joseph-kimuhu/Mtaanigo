import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fundiService } from '../services/fundiService';

import OverviewTab       from './provider/OverviewTab';
import RequestsTab       from './provider/RequestsTab';
import JobsTab           from './provider/JobsTab';
import EarningsTab       from './provider/EarningsTab';
import ServicesProfileTab from './provider/ServicesProfileTab';
import ReviewsTab        from './provider/ReviewsTab';
import { NotificationsTab, ScheduleTab, MessagesTab, PerformanceTab, SettingsTab, HelpTab } from './provider/OtherTabs';
import { OnlineDot } from './provider/shared';

// ─── Sidebar config ───────────────────────────────────────────────────────────
const SIDEBAR = [
  {
    group: 'Work',
    items: [
      { key: 'overview',   label: 'Overview',         icon: '🏠' },
      { key: 'requests',   label: 'Job Requests',      icon: '📥' },
      { key: 'jobs',       label: 'My Jobs',           icon: '🗂️' },
      { key: 'schedule',   label: 'Schedule',          icon: '📅' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { key: 'earnings',     label: 'Earnings',          icon: '💰' },
      { key: 'withdrawals',  label: 'Withdrawals',        icon: '💸' },
    ],
  },
  {
    group: 'Communication',
    items: [
      { key: 'messages',      label: 'Messages',          icon: '💬' },
      { key: 'notifications', label: 'Notifications',     icon: '🔔' },
    ],
  },
  {
    group: 'Profile',
    items: [
      { key: 'services',     label: 'Services & Profile', icon: '🛠️' },
      { key: 'reviews',      label: 'Reviews',            icon: '⭐' },
      { key: 'performance',  label: 'Performance',        icon: '📊' },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'settings',  label: 'Settings',          icon: '⚙️' },
      { key: 'help',      label: 'Help & Support',    icon: '🆘' },
    ],
  },
];

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        fundiService.getStats().catch(() => null),
        fundiService.getRequests().catch(() => []),
      ]);
      setStats(s);
      setRequests(r);
      setPendingCount(r.filter(req => req.status === 'pending').length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNav = (key) => {
    if (!key) return;
    setActiveNav(key);
    setSidebarOpen(false);
  };

  const handleToggleOnline = async () => {
    try {
      await fundiService.setAvailability(!(stats?.is_available));
      await loadData();
    } catch { /* ignore */ }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'FK';

  const PAGE_TITLES = {
    overview: 'Dashboard', requests: 'Job Requests', jobs: 'My Jobs', schedule: 'Schedule',
    earnings: 'Earnings', withdrawals: 'Withdrawals', messages: 'Messages', notifications: 'Notifications',
    services: 'Services & Profile', reviews: 'Reviews', performance: 'Performance',
    settings: 'Settings', help: 'Help & Support',
  };

  function renderTab() {
    switch (activeNav) {
      case 'overview':      return <OverviewTab onNav={handleNav} stats={stats} requests={requests} loading={loading} />;
      case 'requests':      return <RequestsTab requests={requests} onRefresh={loadData} />;
      case 'jobs':          return <JobsTab requests={requests} onRefresh={loadData} />;
      case 'schedule':      return <ScheduleTab requests={requests} />;
      case 'earnings':      return <EarningsTab stats={stats} requests={requests} />;
      case 'withdrawals':   return <EarningsTab stats={stats} requests={requests} />;
      case 'messages':      return <MessagesTab />;
      case 'notifications': return <NotificationsTab />;
      case 'services':      return <ServicesProfileTab />;
      case 'reviews':       return <ReviewsTab />;
      case 'performance':   return <PerformanceTab stats={stats} />;
      case 'settings':      return <SettingsTab />;
      case 'help':          return <HelpTab />;
      default:              return <OverviewTab onNav={handleNav} stats={stats} requests={requests} loading={loading} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F7F6F2] text-ink font-sans antialiased">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[240px] shrink-0 flex flex-col border-r border-ink/[0.06] bg-white overflow-y-auto transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-ink/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-forest-500 text-white flex items-center justify-center text-[13px] font-landing-sans font-bold shrink-0">M</div>
          <Link to="/" className="font-landing-display text-[17px] font-semibold tracking-tight text-ink">
            Mtaani<span className="text-forest-500">Go</span>
          </Link>
          <span className="ml-auto text-[10px] font-landing-sans font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Fundi</span>
        </div>

        {/* Online toggle */}
        <div className="px-4 py-3 border-b border-ink/[0.06]">
          <button onClick={handleToggleOnline} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${stats?.is_available ? 'bg-forest-50 text-forest-700' : 'bg-ink/[0.04] text-ink/60'}`}>
            <OnlineDot online={stats?.is_available} />
            <span className="font-landing-sans font-semibold text-[12.5px]">{stats?.is_available ? 'Online — Receiving Jobs' : 'Offline'}</span>
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {SIDEBAR.map(group => (
            <div key={group.group}>
              <p className="text-[10.5px] font-landing-sans font-semibold text-mute uppercase tracking-wider px-3 mb-1.5">{group.group}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-landing-sans transition-colors text-left ${activeNav === item.key ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/60 hover:bg-sand-100 hover:text-ink/80'}`}
                  >
                    <span className="text-[15px] shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {item.key === 'requests' && pendingCount > 0 && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{pendingCount}</span>
                    )}
                    {item.key === 'notifications' && unreadNotifs > 0 && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{unreadNotifs}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user area */}
        <div className="px-4 py-4 border-t border-ink/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-[12px] shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="font-landing-sans font-semibold text-[12.5px] text-ink/90 truncate">{user?.full_name || 'Fundi'}</p>
              <p className="font-landing-sans text-[11px] text-mute truncate">{user?.email || ''}</p>
            </div>
            <button onClick={logout} className="text-mute hover:text-red-500 transition-colors" title="Logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-6 md:px-8 py-4 bg-[#F7F6F2] border-b border-ink/[0.06]">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink/60 hover:text-ink transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-landing-display text-[20px] font-semibold text-ink leading-tight">{PAGE_TITLES[activeNav] || 'Dashboard'}</h1>
            {stats && (
              <p className="text-mute text-[12px] font-landing-sans hidden sm:block">
                ⭐ {(stats.rating || 0).toFixed(1)} · {stats.completed_jobs || 0} jobs · {stats.acceptance_rate || 0}% acceptance
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Refresh */}
            <button onClick={loadData} disabled={loading} className="w-9 h-9 rounded-xl bg-white border border-ink/[0.08] flex items-center justify-center text-ink/60 hover:text-ink transition-colors disabled:opacity-40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loading ? 'animate-spin' : ''}>
                <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>

            {/* Notifications */}
            <button onClick={() => handleNav('notifications')} className="relative w-9 h-9 rounded-xl bg-white border border-ink/[0.08] flex items-center justify-center text-ink/60 hover:text-ink transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-forest-100 border border-forest-200 flex items-center justify-center text-forest-700 font-bold text-[13px]">{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 md:px-8 py-7 max-w-[1400px] w-full">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
