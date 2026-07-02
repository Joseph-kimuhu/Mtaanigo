import { useState } from 'react';
import { Link } from 'react-router-dom';

import OverviewTab from './admin/OverviewTab';
import UsersTab from './admin/UsersTab';
import ProvidersTab from './admin/ProvidersTab';
import CompaniesTab from './admin/CompaniesTab';
import BookingsTab from './admin/BookingsTab';
import { ServicesTab, CategoriesTab } from './admin/ServicesTab';
import EarningsTab from './admin/EarningsTab';
import CommissionsTab from './admin/CommissionsTab';
import ReviewsTab from './admin/ReviewsTab';
import DisputesTab from './admin/DisputesTab';
import CouponsTab from './admin/CouponsTab';
import AnnouncementsTab from './admin/AnnouncementsTab';
import ReportsTab from './admin/ReportsTab';
import PaymentsTab from './admin/PaymentsTab';
import WithdrawRequestsTab from './admin/WithdrawRequestsTab';
import VerificationCenterTab from './admin/VerificationCenterTab';
import RolesTab from './admin/RolesTab';
import SystemSettingsTab from './admin/SystemSettingsTab';
import AuditLogsTab from './admin/AuditLogsTab';
import FraudDetectionTab from './admin/FraudDetectionTab';

// ─── Sidebar config ────────────────────────────────────────────────────────────
const SIDEBAR = [
  {
    group: 'Overview',
    items: [
      { key: 'overview', label: 'Dashboard', icon: 'M3 12l9-7 9 7M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9' },
    ],
  },
  {
    group: 'People',
    items: [
      { key: 'users', label: 'Users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
      { key: 'providers', label: 'Service Providers', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
      { key: 'companies', label: 'Companies', icon: 'M3 21V8l9-5 9 5v13M9 21v-6h6v6' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { key: 'bookings', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { key: 'services', label: 'Services', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { key: 'categories', label: 'Categories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
      { key: 'disputes', label: 'Disputes', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { key: 'earnings', label: 'Earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { key: 'payments', label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { key: 'commissions', label: 'Commissions', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
      { key: 'withdrawals', label: 'Withdraw Requests', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    ],
  },
  {
    group: 'Engagement',
    items: [
      { key: 'reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
      { key: 'coupons', label: 'Coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
      { key: 'announcements', label: 'Announcements', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],
  },
  {
    group: 'Analytics',
    items: [
      { key: 'reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ],
  },
  {
    group: 'Admin',
    items: [
      { key: 'verification', label: 'Verification Center', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { key: 'fraud', label: 'Fraud Detection', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
      { key: 'roles', label: 'Roles & Permissions', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
      { key: 'settings', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      { key: 'audit', label: 'Audit Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    ],
  },
];

const TITLE_MAP = {
  overview: 'Dashboard', users: 'Users', providers: 'Service Providers', companies: 'Companies',
  bookings: 'Bookings', services: 'Services', categories: 'Categories', earnings: 'Earnings',
  payments: 'Payments', commissions: 'Commissions', withdrawals: 'Withdraw Requests',
  reviews: 'Reviews', coupons: 'Coupons', announcements: 'Announcements', reports: 'Reports',
  verification: 'Verification Center', fraud: 'Fraud Detection', roles: 'Roles & Permissions',
  settings: 'System Settings', audit: 'Audit Logs', disputes: 'Disputes',
};

const SUBTITLE_MAP = {
  overview: 'Platform management at a glance.',
  users: 'Manage all customer accounts.',
  providers: 'Approve, verify and manage service providers.',
  companies: 'Manage companies and their workers.',
  bookings: 'View and manage all service bookings.',
  services: 'Manage available services on the platform.',
  categories: 'Organise services into categories.',
  earnings: 'Track platform revenue and payouts.',
  payments: 'View all transactions and refunds.',
  commissions: 'Set commission rates per service category.',
  withdrawals: 'Approve or reject provider payout requests.',
  reviews: 'Moderate customer reviews and ratings.',
  coupons: 'Create and manage promotional coupons.',
  announcements: 'Send messages to users and providers.',
  reports: 'Generate and export platform reports.',
  verification: 'Review identity documents and certificates.',
  fraud: 'Detect and investigate suspicious activity.',
  roles: 'Manage admin roles and permissions.',
  settings: 'Configure platform settings.',
  audit: 'Track all admin actions for accountability.',
  disputes: 'Investigate and resolve booking disputes.',
};

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={() => onClick(item.key)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-landing-sans transition-colors text-left ${
        active ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/60 hover:bg-sand-100 hover:text-ink/80'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        {item.icon.split(' ').length > 1
          ? item.icon.split(' M').map((d, i) => <path key={i} d={i === 0 ? d : `M${d}`} />)
          : <path d={item.icon} />
        }
      </svg>
      <span className="truncate">{item.label}</span>
    </button>
  );
}

function renderTab(key) {
  switch (key) {
    case 'users': return <UsersTab />;
    case 'providers': return <ProvidersTab />;
    case 'companies': return <CompaniesTab />;
    case 'bookings': return <BookingsTab />;
    case 'services': return <ServicesTab />;
    case 'categories': return <CategoriesTab />;
    case 'earnings': return <EarningsTab />;
    case 'payments': return <PaymentsTab />;
    case 'commissions': return <CommissionsTab />;
    case 'withdrawals': return <WithdrawRequestsTab />;
    case 'reviews': return <ReviewsTab />;
    case 'coupons': return <CouponsTab />;
    case 'announcements': return <AnnouncementsTab />;
    case 'reports': return <ReportsTab />;
    case 'verification': return <VerificationCenterTab />;
    case 'fraud': return <FraudDetectionTab />;
    case 'roles': return <RolesTab />;
    case 'settings': return <SystemSettingsTab />;
    case 'audit': return <AuditLogsTab />;
    case 'disputes': return <DisputesTab />;
    default: return null;
  }
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overviewKey, setOverviewKey] = useState(0);

  const title = TITLE_MAP[activeNav] || 'Dashboard';
  const subtitle = SUBTITLE_MAP[activeNav] || '';

  const handleNav = (key) => {
    setActiveNav(key);
    if (key === 'overview') setOverviewKey(k => k + 1);
    setSidebarOpen(false);
  };

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
          <span className="ml-auto text-[10px] font-landing-sans font-semibold px-1.5 py-0.5 rounded bg-forest-50 text-forest-700">Admin</span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {SIDEBAR.map(group => (
            <div key={group.group}>
              <p className="text-[10.5px] font-landing-sans font-semibold text-mute uppercase tracking-wider px-3 mb-1.5">{group.group}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.key} item={item} active={activeNav === item.key} onClick={handleNav} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user area */}
        <div className="px-4 py-4 border-t border-ink/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-[12px] shrink-0">A</div>
            <div className="flex-1 min-w-0">
              <p className="font-landing-sans font-semibold text-[12.5px] text-ink/90 truncate">Super Admin</p>
              <p className="font-landing-sans text-[11px] text-mute truncate">admin@mtaanigo.com</p>
            </div>
            <Link to="/admin-login" className="text-mute hover:text-red-500 transition-colors" title="Logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-6 md:px-8 py-4 bg-[#F7F6F2] border-b border-ink/[0.06]">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink/60 hover:text-ink transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-landing-display text-[20px] font-semibold text-ink leading-tight">{title}</h1>
            <p className="text-mute text-[12.5px] font-landing-sans hidden sm:block">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-xl bg-white border border-ink/[0.08] flex items-center justify-center text-ink/60 hover:text-ink transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-forest-100 border border-forest-200 flex items-center justify-center text-forest-700 font-bold text-[13px]">A</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 md:px-8 py-7 max-w-[1400px] w-full">
          {activeNav === 'overview'
            ? <OverviewTab key={overviewKey} />
            : renderTab(activeNav)
          }
        </main>
      </div>
    </div>
  );
}
