import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../services/customerService';

const categories = [
  { name: 'Cleaning', icon: 'M5 3v18M19 3v18M5 7h14M5 14h14' },
  { name: 'Plumbing', icon: 'M3 12h18M3 12a4 4 0 014-4h10a4 4 0 014 4M5 16h.01M19 16h.01' },
  { name: 'Electrical', icon: 'M13 2L3 14h7l-1 8 11-12h-7l1-8z' },
  { name: 'Carpentry', icon: 'M14 4l6 6-9 9H5v-6l9-9z' },
  { name: 'Car repair', icon: 'M3 12h18M3 12a4 4 0 014-4h10a4 4 0 014 4M5 16h.01M19 16h.01' },
  { name: 'Beauty', icon: 'M3 21l4-4M10 14l-7 7M14.5 6.5a4 4 0 11-5.66-5.66L17 9l4 4-6.5-6.5z' },
  { name: 'Painting', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { name: 'More', icon: 'M5 12h14M12 5l7 7-7 7', dots: true },
];

const professionals = [
  { name: 'John Kamau', role: 'Electrician', rating: 4.8, reviews: 230, distance: '2.3 km' },
  { name: 'Peter Mwangi', role: 'Plumber', rating: 4.9, reviews: 310, distance: '1.7 km' },
  { name: 'Mary Wanjiku', role: 'Cleaner', rating: 4.7, reviews: 150, distance: '1.5 km' },
  { name: 'David Mutua', role: 'Carpenter', rating: 4.8, reviews: 185, distance: '3.1 km' },
];

function formatCurrencyKES(amount) {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `KSh ${Math.round(amount || 0).toLocaleString('en-KE')}`;
  }
}

function StatusDot({ color }) {
  return <span className="status-dot" style={{ backgroundColor: color }} />;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await customerService.getMyRequests();
        setRequests(data);
      } catch (e) {
        console.error('Failed to load requests', e);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, []);

  const upcomingBooking = requests.find((r) => r.status === 'accepted' || r.status === 'pending');

  const getInitials = (name) => {
    if (!name) return 'OK';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

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
          <button
            onClick={() => setActiveNav('home')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'home'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11l9-7 9 7M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
            </svg>
            Home
          </button>
          <button
            onClick={() => setActiveNav('explore')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'explore'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            Explore services
          </button>
          <button
            onClick={() => setActiveNav('bookings')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'bookings'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            My bookings
          </button>
          <button
            onClick={() => setActiveNav('messages')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'messages'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.4 8.4 0 01-9 8.4A8.5 8.5 0 014 13a8.4 8.4 0 018.4-8.4 8.5 8.5 0 018.6 6.9z" />
            </svg>
            Messages
            <span className="ml-auto w-5 h-5 rounded-full bg-clay-500 text-white text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>
          <button
            onClick={() => setActiveNav('wallet')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'wallet'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-1M21 12H13a2 2 0 100 4h8" />
            </svg>
            Wallet
          </button>
          <button
            onClick={() => setActiveNav('favorites')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'favorites'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" />
            </svg>
            Favorites
          </button>
          <button
            onClick={() => setActiveNav('reviews')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'reviews'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 17.3L6.2 21l1.6-6.9-5.3-4.6 7-.6L12 2.5l2.5 6.4 7 .6-5.3 4.6L17.8 21z" />
            </svg>
            Reviews
          </button>
          <button
            onClick={() => setActiveNav('notifications')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'notifications'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 01-3.4 0" />
            </svg>
            Notifications
            <span className="ml-auto w-5 h-5 rounded-full bg-forest-500 text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
          </button>

          <div className="h-px bg-ink/[0.06] my-3" />

          <button
            onClick={() => setActiveNav('profile')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'profile'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
            </svg>
            Profile
          </button>
          <button
            onClick={() => setActiveNav('help')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'help'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 17v.01M12 13a2 2 0 10-2-2" />
            </svg>
            Help & support
          </button>
          <button
            onClick={() => setActiveNav('settings')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeNav === 'settings'
                ? 'bg-forest-50 text-forest-700 font-semibold'
                : 'text-ink/65 hover:bg-sand-100'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.2a1.7 1.7 0 00-1.6 1z" />
            </svg>
            Settings
          </button>
          <button
            onClick={() => setActiveNav('logout')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-clay-600 hover:bg-clay-500/5 transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-6 md:px-10 py-7 max-w-[1100px]">
        {/* Header row */}
        <div className="flex items-start justify-between mb-7 fade-up delay-1">
          <div>
            <h1 className="font-landing-display text-[26px] font-medium flex items-center gap-2 text-ink">
              Hello, {user?.full_name?.split(' ')[0] || 'Brian'}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D97A3D"
                strokeWidth="2"
              >
                <path d="M12 2v4M5 5l2.5 2.5M2 12h4M5 19l2.5-2.5M19 5l-2.5 2.5M22 12h-4M19 19l-2.5-2.5M12 22v-4" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            </h1>
            <p className="text-mute text-[14.5px] mt-1 font-landing-sans">
              What service do you need today?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-[13.5px] text-mute font-landing-sans">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" />
                <circle cx="12" cy="9" r="2.4" />
              </svg>
              Nairobi, Kenya
            </span>
            <div className="relative">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16241D"
                strokeWidth="2"
                className="opacity-70"
              >
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 01-3.4 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-clay-500 border-2 border-sand-50" />
            </div>
            <div className="w-9 h-9 rounded-full bg-forest-100 border border-forest-200 flex items-center justify-center text-[11px] font-bold text-forest-700">
              {getInitials(user?.full_name)}
            </div>
          </div>
        </div>

        {/* Dynamic main content based on activeNav */}
        {activeNav === 'home' && (
          <>
            {/* Search */}
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-ink/[0.07] px-5 py-3.5 shadow-sm mb-9 fade-up delay-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6760" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input type="text" placeholder="Search for a service or professional…" className="w-full bg-transparent text-[14.5px] font-landing-sans placeholder:text-mute focus:outline-none text-ink" />
            </div>

            {/* Categories */}
            <div className="mb-9 fade-up delay-3">
              <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Categories</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {categories.map((cat) => (
                  <button key={cat.name} onClick={() => setActiveNav('explore')} className="group flex flex-col items-center text-center gap-2 rounded-2xl border border-ink/[0.06] bg-white py-5 px-2 hover:border-forest-200 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
                    <span className="w-11 h-11 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center group-hover:bg-forest-500 group-hover:text-white transition-colors">
                      {cat.dots ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="5" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="19" cy="5" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="19" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={cat.icon} /></svg>
                      )}
                    </span>
                    <span className="text-[12.5px] font-landing-sans font-medium text-ink/80">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Urgent banner */}
            <div className="relative overflow-hidden rounded-2xl bg-forest-900 text-white px-7 py-6 mb-9 flex items-center justify-between fade-up delay-3">
              <div className="relative z-10">
                <p className="font-landing-display text-[19px] font-medium mb-1">Need it urgently?</p>
                <p className="text-[13.5px] text-white/70 font-landing-sans mb-4 max-w-xs">Find available pros near you, ready to help right now.</p>
                <button className="rounded-full bg-forest-500 hover:bg-forest-400 transition-colors text-white text-[13.5px] font-landing-sans font-semibold px-5 py-2.5">Book now</button>
              </div>
              <svg width="92" height="92" viewBox="0 0 24 24" fill="none" stroke="#3F8C66" strokeWidth="1.4" className="absolute right-6 top-1/2 -translate-y-1/2 opacity-70 hidden sm:block"><circle cx="12" cy="6" r="3"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M9 21l3-5 3 5"/></svg>
            </div>

            {/* Top rated professionals */}
            <div className="mb-9 fade-up delay-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80">Top rated professionals</h2>
                <button onClick={() => setActiveNav('browse')} className="text-[13px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">View all</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {professionals.map((pro) => (
                  <div key={pro.name} className="rounded-2xl border border-ink/[0.06] bg-white p-4 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
                    <div className="w-12 h-12 rounded-full bg-forest-100 mb-3" />
                    <p className="text-[13.5px] font-landing-sans font-semibold text-ink">{pro.name}</p>
                    <p className="text-[12px] text-mute font-landing-sans mb-2">{pro.role}</p>
                    <div className="flex items-center justify-between text-[11.5px] text-mute font-landing-sans">
                      <span className="flex items-center gap-1 text-amber-600 font-medium">★ {pro.rating}</span>
                      <span className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/></svg>
                        {pro.distance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming booking */}
            <div className="fade-up delay-5">
              <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Upcoming booking</h2>
              {loadingRequests ? (
                <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4 text-mute text-sm">Loading…</div>
              ) : upcomingBooking ? (
                <div className="flex items-center justify-between rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-forest-100 flex items-center justify-center text-[11px] font-bold text-forest-700">{getInitials(upcomingBooking.provider?.full_name || 'Fundi')}</div>
                    <div>
                      <p className="text-[13.5px] font-landing-sans font-semibold text-ink">
                        {upcomingBooking.scheduled_at ? new Date(upcomingBooking.scheduled_at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today, 2:00 PM'}
                      </p>
                      <p className="text-[12.5px] text-mute font-landing-sans">{upcomingBooking.category?.name || 'Service'} with {upcomingBooking.provider?.full_name || 'your professional'}</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-ink/15 hover:bg-sand-100 transition-colors text-[13px] font-landing-sans font-semibold px-4 py-2 text-ink/80">View booking</button>
                </div>
              ) : (
                <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-8 text-center">
                  <p className="text-mute font-landing-sans text-sm">No upcoming bookings.</p>
                  <button onClick={() => setActiveNav('explore')} className="mt-3 rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-landing-sans font-semibold px-5 py-2.5 transition-colors">Browse services</button>
                </div>
              )}
            </div>
          </>
        )}

        {activeNav === 'explore' && (
          <div className="fade-up delay-2">
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-ink/[0.07] px-5 py-3.5 shadow-sm mb-9">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6760" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input type="text" placeholder="Search for a service or professional…" className="w-full bg-transparent text-[14.5px] font-landing-sans placeholder:text-mute focus:outline-none text-ink" />
            </div>
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">All Categories</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <div key={cat.name} className="group flex flex-col items-center text-center gap-2 rounded-2xl border border-ink/[0.06] bg-white py-5 px-2 hover:border-forest-200 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
                  <span className="w-11 h-11 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center group-hover:bg-forest-500 group-hover:text-white transition-colors">
                    {cat.dots ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="5" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="19" cy="5" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="19" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={cat.icon} /></svg>
                    )}
                  </span>
                  <span className="text-[12.5px] font-landing-sans font-medium text-ink/80">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeNav === 'bookings' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">My Bookings</h2>
            {loadingRequests ? (
              <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-8 text-center text-mute text-sm">Loading bookings…</div>
            ) : requests.length === 0 ? (
              <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-8 text-center">
                <p className="text-mute font-landing-sans text-sm mb-3">No bookings yet.</p>
                <button onClick={() => setActiveNav('explore')} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-landing-sans font-semibold px-5 py-2.5 transition-colors">Browse services</button>
              </div>
            ) : (
              <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead><tr className="text-left text-mute border-b border-ink/[0.06]">
                    <th className="font-landing-sans font-medium px-5 py-3">Service</th>
                    <th className="font-landing-sans font-medium px-5 py-3">Provider</th>
                    <th className="font-landing-sans font-medium px-5 py-3">Date</th>
                    <th className="font-landing-sans font-medium px-5 py-3">Status</th>
                    <th className="font-landing-sans font-medium px-5 py-3 text-right">Amount</th>
                  </tr></thead>
                  <tbody className="divide-y divide-ink/[0.06]">
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.category?.name || 'Service'}</td>
                        <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.provider?.full_name || '—'}</td>
                        <td className="px-5 py-3.5 text-mute font-landing-sans">{r.created_at ? new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 font-landing-sans font-semibold text-xs ${r.status === 'completed' ? 'text-forest-600' : r.status === 'pending' ? 'text-clay-600' : r.status === 'cancelled' ? 'text-red-600' : 'text-ink/70'}`}>
                            <StatusDot color={r.status === 'completed' ? 'var(--green)' : r.status === 'pending' ? 'var(--ochre)' : r.status === 'cancelled' ? 'var(--red)' : '#6b6b64'} />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-landing-sans font-medium text-ink/90">{r.final_price ? formatCurrencyKES(r.final_price) : r.price_offered ? formatCurrencyKES(r.price_offered) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeNav === 'wallet' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Wallet</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Wallet section</p>
              <p className="text-ink/60 font-landing-sans text-xs">Payment history and wallet balance will appear here.</p>
            </div>
          </div>
        )}

        {activeNav === 'messages' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Messages</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Messages</p>
              <p className="text-ink/60 font-landing-sans text-xs">Chat with your service providers here.</p>
            </div>
          </div>
        )}

        {activeNav === 'favorites' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Favorites</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Favorites</p>
              <p className="text-ink/60 font-landing-sans text-xs">Your saved professionals will appear here.</p>
            </div>
          </div>
        )}

        {activeNav === 'reviews' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Reviews</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Reviews</p>
              <p className="text-ink/60 font-landing-sans text-xs">Rate and review your service experiences.</p>
            </div>
          </div>
        )}

        {activeNav === 'notifications' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Notifications</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Notifications</p>
              <p className="text-ink/60 font-landing-sans text-xs">Stay updated with your bookings and messages.</p>
            </div>
          </div>
        )}

        {activeNav === 'profile' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Profile</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Profile</p>
              <p className="text-ink/60 font-landing-sans text-xs">Manage your personal information here.</p>
            </div>
          </div>
        )}

        {activeNav === 'help' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Help & Support</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Help & Support</p>
              <p className="text-ink/60 font-landing-sans text-xs">Get help with your account or bookings.</p>
            </div>
          </div>
        )}

        {activeNav === 'settings' && (
          <div className="fade-up delay-2">
            <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Settings</h2>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
              <p className="text-mute font-landing-sans text-sm mb-2">Settings</p>
              <p className="text-ink/60 font-landing-sans text-xs">Manage your account preferences.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
