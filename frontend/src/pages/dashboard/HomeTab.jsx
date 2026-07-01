import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';

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
  { id: 1, name: 'John Kamau', role: 'Electrician', rating: 4.8, reviews: 230, distance: '2.3 km' },
  { id: 2, name: 'Peter Mwangi', role: 'Plumber', rating: 4.9, reviews: 310, distance: '1.7 km' },
  { id: 3, name: 'Mary Wanjiku', role: 'Cleaner', rating: 4.7, reviews: 150, distance: '1.5 km' },
  { id: 4, name: 'David Mutua', role: 'Carpenter', rating: 4.8, reviews: 185, distance: '3.1 km' },
];

export default function HomeTab({ onNavigate }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerService.getMyRequests();
        setRequests(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcomingBooking = requests.find((r) => ['pending', 'accepted', 'in_progress'].includes(r.status));
  const recentRequests = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

  const getInitials = (name) => {
    if (!name) return 'OK';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-landing-display text-[26px] font-medium flex items-center gap-2 text-ink">
            Hello, {user?.full_name?.split(' ')[0] || 'Brian'}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97A3D" strokeWidth="2"><path d="M12 2v4M5 5l2.5 2.5M2 12h4M5 19l2.5-2.5M19 5l-2.5 2.5M22 12h-4M19 19l-2.5-2.5M12 22v-4" /><circle cx="12" cy="12" r="3.5" /></svg>
          </h1>
          <p className="text-mute text-[14.5px] mt-1 font-landing-sans">
            What service do you need today?
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-1.5 text-[13.5px] text-mute font-landing-sans">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>
            Nairobi, Kenya
          </span>
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16241D" strokeWidth="2" className="opacity-70"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-clay-500 border-2 border-sand-50" />
          </div>
          <div className="w-9 h-9 rounded-full bg-forest-100 border border-forest-200 flex items-center justify-center text-[11px] font-bold text-forest-700">
            {getInitials(user?.full_name)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-ink/[0.07] px-5 py-3.5 shadow-sm mb-9">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6760" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        <input
          type="text"
          placeholder="Search for a service or professional…"
          className="w-full bg-transparent text-[14.5px] font-landing-sans placeholder:text-mute focus:outline-none text-ink"
          onFocus={() => onNavigate('explore')}
        />
      </div>

      {/* Categories */}
      <div className="mb-9">
        <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button key={cat.name} onClick={() => onNavigate('explore')} className="group flex flex-col items-center text-center gap-2 rounded-2xl border border-ink/[0.06] bg-white py-5 px-2 hover:border-forest-200 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
              <span className="w-11 h-11 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center group-hover:bg-forest-500 group-hover:text-white transition-colors">
                {cat.dots ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="5" r="1.6" /><circle cx="12" cy="5" r="1.6" /><circle cx="19" cy="5" r="1.6" /><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /><circle cx="5" cy="19" r="1.6" /><circle cx="12" cy="19" r="1.6" /><circle cx="19" cy="19" r="1.6" /></svg>
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
      <div className="relative overflow-hidden rounded-2xl bg-forest-900 text-white px-7 py-6 mb-9 flex items-center justify-between">
        <div className="relative z-10">
          <p className="font-landing-display text-[19px] font-medium mb-1">Need it urgently?</p>
          <p className="text-[13.5px] text-white/70 font-landing-sans mb-4 max-w-xs">Find available pros near you, ready to help right now.</p>
          <button onClick={() => onNavigate('explore')} className="rounded-full bg-forest-500 hover:bg-forest-400 transition-colors text-white text-[13.5px] font-landing-sans font-semibold px-5 py-2.5">Book now</button>
        </div>
        <svg width="92" height="92" viewBox="0 0 24 24" fill="none" stroke="#3F8C66" strokeWidth="1.4" className="absolute right-6 top-1/2 -translate-y-1/2 opacity-70 hidden sm:block"><circle cx="12" cy="6" r="3" /><path d="M5 21v-2a7 7 0 0114 0v2" /><path d="M9 21l3-5 3 5" /></svg>
      </div>

      {/* Top rated professionals */}
      <div className="mb-9">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80">Top rated professionals</h2>
          <button onClick={() => onNavigate('explore')} className="text-[13px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">View all</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {professionals.map((pro) => (
            <div key={pro.id} className="rounded-2xl border border-ink/[0.06] bg-white p-4 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 rounded-full bg-forest-100 mb-3" />
              <p className="text-[13.5px] font-landing-sans font-semibold text-ink">{pro.name}</p>
              <p className="text-[12px] text-mute font-landing-sans mb-2">{pro.role}</p>
              <div className="flex items-center justify-between text-[11.5px] text-mute font-landing-sans">
                <span className="flex items-center gap-1 text-amber-600 font-medium">★ {pro.rating}</span>
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>
                  {pro.distance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming booking */}
      <div>
        <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Upcoming booking</h2>
        {loading ? (
          <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4 text-mute text-sm">Loading…</div>
        ) : upcomingBooking ? (
          <div className="flex items-center justify-between rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-forest-100 flex items-center justify-center text-[11px] font-bold text-forest-700">
                {getInitials(upcomingBooking.provider?.full_name || 'Fundi')}
              </div>
              <div>
                <p className="text-[13.5px] font-landing-sans font-semibold text-ink">
                  {upcomingBooking.scheduled_at ? new Date(upcomingBooking.scheduled_at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today, 2:00 PM'}
                </p>
                <p className="text-[12.5px] text-mute font-landing-sans">{upcomingBooking.category?.name || 'Service'} with {upcomingBooking.provider?.full_name || 'your professional'}</p>
              </div>
            </div>
            <button onClick={() => onNavigate('bookings')} className="rounded-full border border-ink/15 hover:bg-sand-100 transition-colors text-[13px] font-landing-sans font-semibold px-4 py-2 text-ink/80">View booking</button>
          </div>
        ) : (
          <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-8 text-center">
            <p className="text-mute font-landing-sans text-sm mb-3">No upcoming bookings.</p>
            <button onClick={() => onNavigate('explore')} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-landing-sans font-semibold px-5 py-2.5 transition-colors">Browse services</button>
          </div>
        )}
      </div>

      {/* Recent activity */}
      {recentRequests.length > 0 && (
        <div className="mt-9">
          <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Recent activity</h2>
          <div className="flex flex-col gap-3">
            {recentRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-ink/[0.06] bg-white px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-[11px] font-bold text-forest-700">
                    {getInitials(r.provider?.full_name || 'Fundi')}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-landing-sans font-semibold text-ink">{r.category?.name || 'Service'}</p>
                    <p className="text-[12px] text-mute font-landing-sans">{r.provider?.full_name || 'Professional'}</p>
                  </div>
                </div>
                <span className={`text-[12px] font-landing-sans font-semibold px-2.5 py-1 rounded-full ${
                  r.status === 'completed' ? 'bg-forest-50 text-forest-700' :
                  r.status === 'pending' ? 'bg-clay-500/10 text-clay-600' :
                  r.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                  'bg-ink/5 text-ink/70'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
