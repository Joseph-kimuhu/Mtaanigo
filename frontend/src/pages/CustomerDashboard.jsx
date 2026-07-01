import { useState } from 'react';
import HomeTab from './dashboard/HomeTab';
import ExploreTab from './dashboard/ExploreTab';
import BookingsTab from './dashboard/BookingsTab';
import MessagesTab from './dashboard/MessagesTab';
import WalletTab from './dashboard/WalletTab';
import FavoritesTab from './dashboard/FavoritesTab';
import ReviewsTab from './dashboard/ReviewsTab';
import NotificationsTab from './dashboard/NotificationsTab';
import ProfileTab from './dashboard/ProfileTab';
import HelpTab from './dashboard/HelpTab';
import SettingsTab from './dashboard/SettingsTab';
import LogoutModal from './dashboard/LogoutModal';

export default function CustomerDashboard() {
  const [activeNav, setActiveNav] = useState('home');
  const [showLogout, setShowLogout] = useState(false);

  return (
    <div className="flex min-h-screen bg-sand-50 text-ink font-sans antialiased">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-ink/[0.06] bg-white px-5 py-6">
        <a
          href="/"
          className="flex items-center gap-2 font-landing-display text-[19px] font-semibold tracking-tight px-2 mb-8 text-ink"
        >
          <span className="w-7 h-7 rounded-lg bg-forest-500 text-white flex items-center justify-center text-[12px] font-landing-sans font-bold">
            M
          </span>
          Mtaani<span className="text-forest-500">Go</span>
        </a>

        <nav className="flex flex-col gap-0.5 text-[14px] font-landing-sans">
          <button onClick={() => setActiveNav('home')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'home' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" /></svg>
            Home
          </button>
          <button onClick={() => setActiveNav('explore')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'explore' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            Explore services
          </button>
          <button onClick={() => setActiveNav('bookings')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'bookings' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
            My bookings
          </button>
          <button onClick={() => setActiveNav('messages')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'messages' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 01-9 8.4A8.5 8.5 0 014 13a8.4 8.4 0 018.4-8.4 8.5 8.5 0 018.6 6.9z" /></svg>
            Messages
            <span className="ml-auto w-5 h-5 rounded-full bg-clay-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
          </button>
          <button onClick={() => setActiveNav('wallet')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'wallet' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-1M21 12H13a2 2 0 100 4h8" /></svg>
            Wallet
          </button>
          <button onClick={() => setActiveNav('favorites')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'favorites' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" /></svg>
            Favorites
          </button>
          <button onClick={() => setActiveNav('reviews')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'reviews' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17.3L6.2 21l1.6-6.9-5.3-4.6 7-.6L12 2.5l2.5 6.4 7 .6-5.3 4.6L17.8 21z" /></svg>
            Reviews
          </button>
          <button onClick={() => setActiveNav('notifications')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'notifications' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>
            Notifications
            <span className="ml-auto w-5 h-5 rounded-full bg-forest-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
          </button>

          <div className="h-px bg-ink/[0.06] my-3" />

          <button onClick={() => setActiveNav('profile')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'profile' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" /></svg>
            Profile
          </button>
          <button onClick={() => setActiveNav('help')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'help' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 17v.01M12 13a2 2 0 10-2-2" /></svg>
            Help & support
          </button>
          <button onClick={() => setActiveNav('settings')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeNav === 'settings' ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.2a1.7 1.7 0 00-1.6 1z" /></svg>
            Settings
          </button>
          <button onClick={() => setShowLogout(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-clay-600 hover:bg-clay-500/5 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-6 md:px-10 py-7 max-w-[1100px]">
        {activeNav === 'home' && <HomeTab onNavigate={setActiveNav} />}
        {activeNav === 'explore' && <ExploreTab />}
        {activeNav === 'bookings' && <BookingsTab onNavigate={setActiveNav} />}
        {activeNav === 'messages' && <MessagesTab onNavigate={setActiveNav} />}
        {activeNav === 'wallet' && <WalletTab />}
        {activeNav === 'favorites' && <FavoritesTab onNavigate={setActiveNav} />}
        {activeNav === 'reviews' && <ReviewsTab />}
        {activeNav === 'notifications' && <NotificationsTab />}
        {activeNav === 'profile' && <ProfileTab />}
        {activeNav === 'help' && <HelpTab />}
        {activeNav === 'settings' && <SettingsTab />}
      </main>

      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} />}
    </div>
  );
}
