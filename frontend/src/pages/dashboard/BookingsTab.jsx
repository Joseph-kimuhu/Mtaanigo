import { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { requestService } from '../../services/requestService';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Upcoming' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'in_progress', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }) {
  const color = status === 'completed' ? 'bg-forest-50 text-forest-700' :
    status === 'cancelled' ? 'bg-red-50 text-red-600' :
    status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
    status === 'arrived' ? 'bg-emerald-50 text-emerald-700' :
    status === 'on_the_way' ? 'bg-amber-50 text-amber-700' :
    status === 'accepted' ? 'bg-forest-50 text-forest-700' :
    'bg-ink/5 text-ink/70';
  const label = status === 'in_progress' ? 'Ongoing' :
    status === 'on_the_way' ? 'On the way' :
    status === 'arrived' ? 'Arrived' :
    status === 'accepted' ? 'Accepted' :
    status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`text-[12px] font-landing-sans font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}

export default function BookingsTab({ onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const filtered = activeTab === 'all' ? requests : requests.filter((r) => r.status === activeTab);

  const loadDetail = async (req) => {
    setLoadingDetail(true);
    setSelectedBooking(req);
    try {
      const data = await requestService.getRequest(req.id);
      setBookingDetail(data);
    } catch {
      setBookingDetail(req);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await requestService.acceptRequest(id);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'in_progress' } : r));
      setBookingDetail((prev) => prev && prev.id === id ? { ...prev, status: 'in_progress' } : prev);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(true);
    try {
      await requestService.declineRequest(id);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
      setBookingDetail((prev) => prev && prev.id === id ? { ...prev, status: 'cancelled' } : prev);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (id) => {
    setActionLoading(true);
    try {
      await requestService.completeRequest(id);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'completed' } : r));
      setBookingDetail((prev) => prev && prev.id === id ? { ...prev, status: 'completed' } : prev);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) return;
    setRescheduleLoading(true);
    try {
      const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();
      await requestService.updateRequest(selectedBooking.id, { scheduled_at: scheduledAt });
      setRequests((prev) => prev.map((r) => r.id === selectedBooking.id ? { ...r, scheduled_at: scheduledAt } : r));
      setBookingDetail((prev) => prev && prev.id === selectedBooking.id ? { ...prev, scheduled_at: scheduledAt } : prev);
      setShowReschedule(false);
    } catch (e) {
      console.error(e);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'Not set';
    const d = new Date(iso);
    return d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-landing-display text-[26px] font-medium text-ink">My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-ink/[0.06] p-1 mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-[13.5px] font-landing-sans font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-forest-50 text-forest-700 shadow-sm' : 'text-mute hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-mute text-sm">Loading bookings…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
          <p className="text-mute font-landing-sans text-sm mb-3">No bookings found.</p>
          <button onClick={() => onNavigate('explore')} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-landing-sans font-semibold px-5 py-2.5 transition-colors">Browse services</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-ink/[0.06] bg-white p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-[11px] font-bold text-forest-700">
                    {r.provider?.full_name ? r.provider.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'PR'}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-landing-sans font-semibold text-ink">{r.category?.name || 'Service'}</p>
                    <p className="text-[12px] text-mute font-landing-sans">{r.provider?.full_name || '—'}</p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-mute font-landing-sans mb-4">
                {r.scheduled_at && (
                  <span className="flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
                    {formatDate(r.scheduled_at)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>
                  {r.address || 'No address'}
                </span>
                {r.final_price ? (
                  <span className="font-semibold text-ink">{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(r.final_price)}</span>
                ) : r.price_offered ? (
                  <span className="font-semibold text-ink">{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(r.price_offered)} offered</span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {(r.status === 'pending' || r.status === 'accepted') && (
                  <button
                    onClick={() => loadDetail(r)}
                    className="text-[13px] font-landing-sans font-semibold px-4 py-2 rounded-full border border-ink/15 text-ink/80 hover:bg-sand-100 transition-colors"
                  >
                    View details
                  </button>
                )}
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => handleAccept(r.id)} disabled={actionLoading} className="text-[13px] font-landing-sans font-semibold px-4 py-2 rounded-full bg-forest-500 text-white hover:bg-forest-600 transition-colors disabled:opacity-50">Accept</button>
                    <button onClick={() => handleDecline(r.id)} disabled={actionLoading} className="text-[13px] font-landing-sans font-semibold px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">Decline</button>
                  </>
                )}
                {r.status === 'in_progress' && (
                  <button onClick={() => handleComplete(r.id)} disabled={actionLoading} className="text-[13px] font-landing-sans font-semibold px-4 py-2 rounded-full bg-forest-500 text-white hover:bg-forest-600 transition-colors disabled:opacity-50">Mark complete</button>
                )}
                {(r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress') && (
                  <button onClick={() => { setSelectedBooking(r); setShowReschedule(true); }} className="text-[13px] font-landing-sans font-semibold px-4 py-2 rounded-full border border-ink/15 text-ink/80 hover:bg-sand-100 transition-colors">Reschedule</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => { setSelectedBooking(null); setBookingDetail(null); setShowReschedule(false); }}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-landing-display text-[20px] font-medium text-ink">Booking details</h3>
              <button onClick={() => { setSelectedBooking(null); setBookingDetail(null); setShowReschedule(false); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
            </div>

            {loadingDetail ? (
              <p className="text-mute text-sm text-center py-8">Loading…</p>
            ) : bookingDetail ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-[11px] font-bold text-forest-700">
                    {bookingDetail.provider?.full_name ? bookingDetail.provider.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'PR'}
                  </div>
                  <div>
                    <p className="text-[14px] font-landing-sans font-semibold text-ink">{bookingDetail.provider?.full_name || 'Professional'}</p>
                    <p className="text-[12px] text-mute font-landing-sans">{bookingDetail.category?.name || 'Service'}</p>
                  </div>
                </div>
                <StatusBadge status={bookingDetail.status} />
                <div className="text-[13px] text-mute font-landing-sans space-y-1.5">
                  {bookingDetail.scheduled_at && <p><span className="text-ink/70">Scheduled:</span> {formatDate(bookingDetail.scheduled_at)}</p>}
                  {bookingDetail.started_at && <p><span className="text-ink/70">Started:</span> {formatDate(bookingDetail.started_at)}</p>}
                  {bookingDetail.completed_at && <p><span className="text-ink/70">Completed:</span> {formatDate(bookingDetail.completed_at)}</p>}
                  <p><span className="text-ink/70">Address:</span> {bookingDetail.address || '—'}</p>
                  {bookingDetail.description && <p><span className="text-ink/70">Description:</span> {bookingDetail.description}</p>}
                  {bookingDetail.final_price && <p><span className="text-ink/70">Final price:</span> {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(bookingDetail.final_price)}</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  {bookingDetail.status === 'pending' && <>
                    <button onClick={() => handleAccept(bookingDetail.id)} disabled={actionLoading} className="flex-1 rounded-full bg-forest-500 text-white py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors disabled:opacity-50">Accept</button>
                    <button onClick={() => handleDecline(bookingDetail.id)} disabled={actionLoading} className="flex-1 rounded-full border border-red-200 text-red-600 py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">Decline</button>
                  </>}
                  {bookingDetail.status === 'in_progress' && (
                    <button onClick={() => handleComplete(bookingDetail.id)} disabled={actionLoading} className="flex-1 rounded-full bg-forest-500 text-white py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors disabled:opacity-50">Mark complete</button>
                  )}
                  <button onClick={() => { setShowReschedule(true); }} className="rounded-full border border-ink/15 text-ink/80 py-2.5 px-4 text-[13px] font-landing-sans font-semibold hover:bg-sand-100 transition-colors">Reschedule</button>
                </div>
              </div>
            ) : null}

            {/* Reschedule form */}
            {showReschedule && (
              <form onSubmit={handleReschedule} className="mt-4 pt-4 border-t border-ink/[0.06] space-y-3">
                <p className="text-[14px] font-landing-sans font-semibold text-ink">Reschedule booking</p>
                <div>
                  <label className="block text-[13px] text-mute font-landing-sans mb-1">Date</label>
                  <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} required className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] text-mute font-landing-sans mb-1">Time</label>
                  <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} required className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={rescheduleLoading} className="flex-1 rounded-full bg-forest-500 text-white py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors disabled:opacity-50">
                    {rescheduleLoading ? 'Saving…' : 'Update schedule'}
                  </button>
                  <button type="button" onClick={() => setShowReschedule(false)} className="rounded-full border border-ink/15 text-ink/80 py-2.5 px-4 text-[13px] font-landing-sans font-semibold hover:bg-sand-100 transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
