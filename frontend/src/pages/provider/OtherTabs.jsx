// ─── Notifications Tab ────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { fundiService } from '../../services/fundiService';
import { Card, Spinner, Empty, Input } from './shared';

const NOTIF_ICONS = { new_booking: '📥', payment: '💰', cancelled: '❌', review: '⭐', promotion: '🎉', reminder: '🔔' };

export function NotificationsTab() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fundiService.getNotifications().then(setNotifs).catch(() => setNotifs([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-landing-sans font-bold text-[16px] text-ink">Notifications</h2>
        {notifs.length > 0 && <button className="text-[12px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">Mark all read</button>}
      </div>
      {notifs.length === 0
        ? <Empty icon="🔔" text="No notifications yet" />
        : notifs.map(n => (
          <Card key={n.id} className={`px-5 py-4 flex items-start gap-3 ${!n.read ? 'border-forest-200 bg-forest-50/30' : ''}`}>
            <span className="text-2xl shrink-0">{NOTIF_ICONS[n.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-landing-sans font-semibold text-[13.5px] text-ink/90">{n.title}</p>
              <p className="text-[12.5px] text-mute font-landing-sans mt-0.5">{n.body}</p>
            </div>
            <span className="text-[11px] text-mute font-landing-sans shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
          </Card>
        ))
      }
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────
export function ScheduleTab({ requests }) {
  const upcoming = (requests || []).filter(r => r.status === 'accepted' || r.status === 'in_progress');

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="font-landing-sans font-bold text-[16px] text-ink">Schedule</h2>
      {upcoming.length === 0
        ? <Empty icon="📅" text="No upcoming jobs scheduled" />
        : upcoming.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-landing-sans font-bold text-[14px] text-ink">{r.description}</p>
                <p className="text-[12px] text-mute font-landing-sans mt-1">
                  {r.customer?.full_name || 'Customer'} · {r.address || 'Nairobi'}
                </p>
                <p className="text-[12px] text-mute font-landing-sans">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-landing-sans shrink-0 capitalize">{r.status.replace('_', ' ')}</span>
            </div>
            <div className="flex gap-2 mt-3">
              {r.address && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`} target="_blank" rel="noopener noreferrer" className="text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-xl border border-ink/[0.15] bg-white hover:bg-sand-100 text-ink/80">
                  🗺️ Navigate
                </a>
              )}
              {r.customer?.phone && (
                <a href={`tel:${r.customer.phone}`} className="text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-xl border border-ink/[0.15] bg-white hover:bg-sand-100 text-ink/80">
                  📞 Call
                </a>
              )}
            </div>
          </Card>
        ))
      }
    </div>
  );
}

// ─── Messages Tab ─────────────────────────────────────────────────────────────
export function MessagesTab() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fundiService.getMessages().then(setThreads).catch(() => setThreads([])).finally(() => setLoading(false));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !active) return;
    setSending(true);
    try {
      await fundiService.sendMessage(active.request_id, msg);
      setMsg('');
      const data = await fundiService.getMessages();
      setThreads(data);
      setActive(data.find(t => t.request_id === active.request_id) || null);
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex gap-5 h-[600px]">
      {/* Thread list */}
      <div className="w-72 shrink-0 flex flex-col border border-ink/[0.07] rounded-2xl bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-ink/[0.06]">
          <p className="font-landing-sans font-bold text-[13px] text-ink">Messages</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-ink/[0.05]">
          {threads.length === 0
            ? <p className="px-4 py-8 text-center text-mute font-landing-sans text-sm">No messages yet</p>
            : threads.map(t => (
              <button key={t.request_id} onClick={() => setActive(t)} className={`w-full px-4 py-3.5 text-left hover:bg-sand-50 transition-colors ${active?.request_id === t.request_id ? 'bg-forest-50' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-[12px] shrink-0">
                    {(t.customer_name || 'C')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-landing-sans font-semibold text-[12.5px] text-ink/90 truncate">{t.customer_name}</p>
                    <p className="text-[11px] text-mute font-landing-sans truncate">{t.last_message}</p>
                  </div>
                  {t.unread > 0 && <span className="w-5 h-5 rounded-full bg-forest-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{t.unread}</span>}
                </div>
              </button>
            ))
          }
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col border border-ink/[0.07] rounded-2xl bg-white overflow-hidden">
        {!active
          ? <div className="flex-1 flex items-center justify-center"><p className="text-mute font-landing-sans text-sm">Select a conversation</p></div>
          : (
            <>
              <div className="px-5 py-3.5 border-b border-ink/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-[12px]">
                  {(active.customer_name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-landing-sans font-semibold text-[13px] text-ink/90">{active.customer_name}</p>
                  <p className="text-[11px] text-mute font-landing-sans">{active.service}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {(active.messages || []).map((m, i) => {
                  const isMe = m.sender_id !== active.customer_id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] font-landing-sans ${isMe ? 'bg-forest-500 text-white rounded-br-sm' : 'bg-sand-100 text-ink/90 rounded-bl-sm'}`}>
                        {m.message}
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-mute'}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSend} className="px-4 py-3 border-t border-ink/[0.06] flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message…" className="flex-1 border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30" />
                <button type="submit" disabled={sending || !msg.trim()} className="bg-forest-500 hover:bg-forest-600 text-white font-landing-sans font-semibold text-[13px] px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors">
                  Send
                </button>
              </form>
            </>
          )
        }
      </div>
    </div>
  );
}

// ─── Performance Tab ──────────────────────────────────────────────────────────
export function PerformanceTab({ stats }) {
  const metrics = [
    { label: 'Acceptance Rate', value: stats?.acceptance_rate ?? 0, icon: '👍', color: '#1A7F4B', suffix: '%' },
    { label: 'Completion Rate', value: stats?.completion_rate ?? 0, icon: '🏁', color: '#3E6C7A', suffix: '%' },
    { label: 'Avg Rating', value: (stats?.rating || 0).toFixed(1), icon: '⭐', color: '#D97A3D', suffix: '★' },
    { label: 'Jobs Completed', value: stats?.completed_jobs ?? 0, icon: '✅', color: '#1A7F4B', suffix: '' },
    { label: 'Jobs Cancelled', value: stats?.cancelled_jobs ?? 0, icon: '❌', color: '#E24B4A', suffix: '' },
    { label: 'Response Time', value: '3', icon: '⚡', color: '#3E6C7A', suffix: ' min' },
    { label: 'Repeat Customers', value: stats?.completed_jobs ? Math.round(stats.completed_jobs * 0.3) : 0, icon: '🔄', color: '#1A7F4B', suffix: '' },
    { label: 'Satisfaction', value: Math.min(100, Math.round((stats?.rating || 0) * 20)), icon: '😊', color: '#D97A3D', suffix: '%' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-landing-sans font-bold text-[16px] text-ink">Performance</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{m.icon}</span>
              <p className="text-[11px] font-landing-sans font-semibold uppercase tracking-wide text-mute">{m.label}</p>
            </div>
            <p className="font-landing-display text-[24px] font-semibold" style={{ color: m.color }}>{m.value}{m.suffix}</p>
          </Card>
        ))}
      </div>

      {/* Progress bars */}
      <Card className="px-5 py-5">
        <p className="font-landing-sans font-semibold text-[13px] text-ink/80 mb-4">Performance Metrics</p>
        <div className="space-y-4">
          {[
            ['Acceptance Rate', stats?.acceptance_rate ?? 0, '#1A7F4B'],
            ['Completion Rate', stats?.completion_rate ?? 0, '#3E6C7A'],
            ['Customer Satisfaction', Math.min(100, Math.round((stats?.rating || 0) * 20)), '#D97A3D'],
          ].map(([label, val, color]) => (
            <div key={label}>
              <div className="flex justify-between text-[12.5px] font-landing-sans mb-1.5">
                <span className="text-ink/70">{label}</span>
                <span className="font-semibold text-ink/90">{val}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-ink/[0.06] overflow-hidden">
                <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
export function SettingsTab() {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [notifs, setNotifs] = useState({ bookings: true, payments: true, reviews: true, promotions: false });
  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-ink/[0.06]">
      <span className="text-[13px] font-landing-sans text-ink/80">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={`relative rounded-full transition-colors ${checked ? 'bg-forest-500' : 'bg-ink/20'}`} style={{ width: 40, height: 22 }}>
        <span className="absolute top-0.5 rounded-full bg-white shadow transition-all" style={{ width: 18, height: 18, left: checked ? 20 : 2, transition: 'left 0.2s' }} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5 max-w-xl">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl font-landing-sans text-[13px] shadow-lg">{toast}</div>}

      <Card className="p-6">
        <p className="font-landing-sans font-bold text-[14px] text-ink mb-4">Change Password</p>
        <Input label="Current Password" type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
        <Input label="New Password" type="password" value={form.newPw} onChange={e => setForm(f => ({ ...f, newPw: e.target.value }))} />
        <Input label="Confirm New Password" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
        <button onClick={() => { if (form.newPw !== form.confirm) return showToast('Passwords do not match'); showToast('Password changed ✅'); setForm({ current: '', newPw: '', confirm: '' }); }} className="bg-forest-500 hover:bg-forest-600 text-white font-landing-sans font-semibold text-[13px] px-5 py-2.5 rounded-xl transition-colors">
          Update Password
        </button>
      </Card>

      <Card className="p-6">
        <p className="font-landing-sans font-bold text-[14px] text-ink mb-2">Notifications</p>
        <Toggle label="New Booking Alerts" checked={notifs.bookings} onChange={v => setNotifs(n => ({ ...n, bookings: v }))} />
        <Toggle label="Payment Received" checked={notifs.payments} onChange={v => setNotifs(n => ({ ...n, payments: v }))} />
        <Toggle label="New Reviews" checked={notifs.reviews} onChange={v => setNotifs(n => ({ ...n, reviews: v }))} />
        <Toggle label="Promotions & Offers" checked={notifs.promotions} onChange={v => setNotifs(n => ({ ...n, promotions: v }))} />
      </Card>

      <Card className="p-6">
        <p className="font-landing-sans font-bold text-[14px] text-ink mb-2">Preferences</p>
        <Toggle label="Dark Mode" checked={darkMode} onChange={setDarkMode} />
      </Card>

      <Card className="p-6">
        <p className="font-landing-sans font-bold text-[14px] text-red-600 mb-3">Danger Zone</p>
        <button onClick={() => showToast('Please contact support to delete your account')} className="text-[13px] font-landing-sans font-semibold text-red-600 hover:text-red-700 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
          Delete Account
        </button>
      </Card>
    </div>
  );
}

// ─── Help & Support Tab ───────────────────────────────────────────────────────
export function HelpTab() {
  const FAQS = [
    { q: 'How do I accept a job?', a: 'Go to Job Requests and click Accept on any pending request.' },
    { q: 'When do I get paid?', a: 'Payments are processed after job completion. Withdraw from the Earnings tab.' },
    { q: 'How do I improve my rating?', a: 'Respond quickly, arrive on time, and do quality work.' },
    { q: 'What is the commission rate?', a: 'MtaaniGo charges 15% commission on each completed job.' },
    { q: 'How do I get verified?', a: 'Upload your ID and documents in Services & Profile → Documents.' },
  ];

  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="font-landing-sans font-bold text-[16px] text-ink">Help & Support</h2>

      {/* Contact options */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: '💬', label: 'Live Chat', sub: 'Chat with support', action: () => alert('Live chat coming soon') },
          { icon: '📞', label: 'Call Support', sub: '+254 700 000 000', action: () => window.open('tel:+254700000000') },
          { icon: '🚩', label: 'Report Problem', sub: 'Submit a ticket', action: () => alert('Ticket submitted') },
        ].map(c => (
          <button key={c.label} onClick={c.action} className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-ink/[0.07] bg-white hover:bg-forest-50 hover:border-forest-200 transition-colors text-center">
            <span className="text-3xl">{c.icon}</span>
            <p className="font-landing-sans font-bold text-[13.5px] text-ink/90">{c.label}</p>
            <p className="text-[11.5px] text-mute font-landing-sans">{c.sub}</p>
          </button>
        ))}
      </div>

      {/* Appeal */}
      <Card className="px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-landing-sans font-semibold text-[13.5px] text-ink/90">Appeal a Suspension</p>
          <p className="text-[12px] text-mute font-landing-sans">If your account was suspended, submit an appeal here.</p>
        </div>
        <button onClick={() => alert('Appeal submitted. We will review within 24 hours.')} className="text-[12px] font-landing-sans font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 shrink-0">
          Appeal
        </button>
      </Card>

      {/* FAQ */}
      <div>
        <p className="font-landing-sans font-bold text-[14px] text-ink mb-3">Frequently Asked Questions</p>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <Card key={i} className="overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left">
                <span className="font-landing-sans font-semibold text-[13.5px] text-ink/90">{f.q}</span>
                <span className="text-mute text-[16px] shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-[13px] font-landing-sans text-ink/70 leading-relaxed border-t border-ink/[0.06] pt-3">
                  {f.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
