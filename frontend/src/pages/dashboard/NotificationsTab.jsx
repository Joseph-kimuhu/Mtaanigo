import { useState } from 'react';
import { notificationService } from '../../services/notificationService';

const iconMap = {
  booking_confirmed: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  provider_arrived: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>,
  payment_success: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-1M21 12H13a2 2 0 100 4h8" /></svg>,
  promotion: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" /></svg>,
  message: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 01-9 8.4A8.5 8.5 0 014 13a8.4 8.4 0 018.4-8.4 8.5 8.5 0 018.6 6.9z" /></svg>,
  system: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 17v.01M12 13a2 2 0 10-2-2" /></svg>,
};

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState(() => notificationService.getAll());
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (id) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getAll());
  };

  const handleMarkAll = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getAll());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-landing-display text-[26px] font-medium text-ink">Notifications</h1>
          <p className="text-mute text-[14px] font-landing-sans mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="text-[13px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">Mark all read</button>
        )}
      </div>

      <div className="flex gap-1 bg-white rounded-2xl border border-ink/[0.06] p-1 mb-6 overflow-x-auto">
        {['all', 'unread'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-[13.5px] font-landing-sans font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-forest-50 text-forest-700 shadow-sm' : 'text-mute hover:text-ink'}`}>
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((n) => (
          <button key={n.id} onClick={() => handleClick(n.id)} className={`text-left rounded-2xl border border-ink/[0.06] bg-white p-5 hover:shadow-sm transition-all ${
            !n.read ? 'border-forest-200 bg-forest-50/30' : ''
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-forest-100 text-forest-700' : 'bg-sand-100 text-mute'}`}>
                {iconMap[n.type] || iconMap.system}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-landing-sans font-semibold text-ink">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-forest-500 shrink-0" />}
                </div>
                <p className="text-[13px] text-mute font-landing-sans leading-relaxed mt-1">{n.message}</p>
                <p className="text-[11px] text-mute/70 font-landing-sans mt-2">{n.created_at ? new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
