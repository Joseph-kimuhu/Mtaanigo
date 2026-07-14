import React, { useEffect, useState, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { fmtKES, StatusDot, StatCard, statusColor, Skeleton } from './shared';

// ─── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right hidden sm:block">
      <p className="font-landing-display text-[18px] font-semibold text-ink leading-none">
        {time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-[11.5px] text-mute font-landing-sans mt-0.5">
        {time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}

// ─── Animated bar chart ───────────────────────────────────────────────────────
const BAR_DATA = [
  { month: 'Jan', v: 42 }, { month: 'Feb', v: 58 }, { month: 'Mar', v: 51 },
  { month: 'Apr', v: 73 }, { month: 'May', v: 65 }, { month: 'Jun', v: 89 },
  { month: 'Jul', v: 78 }, { month: 'Aug', v: 95 },
];
const MAX_V = Math.max(...BAR_DATA.map(d => d.v));

function RevenueBarChart() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-landing-sans font-semibold text-ink/80">Monthly Revenue</p>
        <span className="text-[11px] font-landing-sans text-forest-600 font-semibold bg-forest-50 px-2 py-0.5 rounded-md">↑ 18% vs last year</span>
      </div>
      <div className="flex items-end gap-2 h-28">
        {BAR_DATA.map((d, i) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative flex items-end" style={{ height: '88px' }}>
              <div
                className="w-full rounded-t-md transition-all duration-700"
                style={{
                  height: visible ? `${(d.v / MAX_V) * 88}px` : '0px',
                  background: i === BAR_DATA.length - 1
                    ? 'linear-gradient(180deg,#1A7F4B,#0F5536)'
                    : i % 2 === 0 ? '#CFEBD9' : '#EAF6EE',
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </div>
            <span className="text-[10px] text-mute font-landing-sans">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Animated line chart ──────────────────────────────────────────────────────
const LINE_PTS = [110, 100, 95, 75, 80, 55, 60, 30, 38];
const LINE_PATH = LINE_PTS.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 70},${y}`).join(' ');
const FILL_PATH = LINE_PATH + ` L${(LINE_PTS.length - 1) * 70},140 L0,140 Z`;

function BookingsLineChart() {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);
  return (
    <div className="lg:col-span-2 rounded-2xl border border-ink/[0.06] bg-white px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-landing-sans font-semibold text-ink/80">Daily Bookings</p>
        <div className="flex items-center gap-1.5 text-[11px] font-landing-sans text-mute">
          <StatusDot color="#1A7F4B" pulse />
          <span>Live</span>
        </div>
      </div>
      <svg viewBox="0 0 560 140" className="w-full h-36 overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A7F4B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1A7F4B" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[35, 70, 105].map(y => (
          <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="#16241D" strokeOpacity="0.05" strokeDasharray="4 4" />
        ))}
        <path d={FILL_PATH} fill="url(#lineGrad)" />
        <path
          d={LINE_PATH}
          fill="none"
          stroke="#1A7F4B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={drawn ? 'line-draw' : ''}
          style={{ strokeDasharray: 1000, strokeDashoffset: drawn ? 0 : 1000, transition: 'stroke-dashoffset 1.2s ease' }}
        />
        {LINE_PTS.map((y, i) => (
          <circle key={i} cx={i * 70} cy={y} r="3.5" fill="white" stroke="#1A7F4B" strokeWidth="2"
            style={{ opacity: drawn ? 1 : 0, transition: `opacity .3s ease ${i * 120 + 800}ms` }} />
        ))}
      </svg>
<div className="flex justify-between mt-2 text-[10.5px] font-landing-sans text-mute px-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue'].map((d, i) => <span key={i}>{d}</span>)}
        </div>
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ metrics }) {
  const total = metrics ? (metrics.completed_jobs || 0) + (metrics.today_bookings || 0) + (metrics.pending_disputes || 0) : 0;
  const completed = total ? Math.round(((metrics?.completed_jobs || 0) / total) * 289) : 173;
  const pending   = total ? Math.round(((metrics?.today_bookings || 0) / total) * 289) : 72;
  const disputed  = total ? Math.round(((metrics?.pending_disputes || 0) / total) * 289) : 29;

  return (
    <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5">
      <p className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-4">Booking Status</p>
      <div className="flex items-center justify-center mb-4">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="46" fill="none" stroke="#EAF6EE" strokeWidth="16" />
          <circle cx="60" cy="60" r="46" fill="none" stroke="#1A7F4B" strokeWidth="16"
            strokeDasharray={`${completed} 289`} strokeDashoffset="0" strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 1s ease .3s' }} />
          <circle cx="60" cy="60" r="46" fill="none" stroke="#D97A3D" strokeWidth="16"
            strokeDasharray={`${pending} 289`} strokeDashoffset={-completed} strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 1s ease .5s' }} />
          <circle cx="60" cy="60" r="46" fill="none" stroke="#E24B4A" strokeWidth="16"
            strokeDasharray={`${disputed} 289`} strokeDashoffset={-(completed + pending)} strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 1s ease .7s' }} />
          <text x="60" y="56" textAnchor="middle" className="font-landing-display" fontSize="14" fontWeight="700" fill="#16241D">{total || '—'}</text>
          <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#5B6760">total</text>
        </svg>
      </div>
      <div className="space-y-2 text-[12.5px]">
        {[
          ['Completed', '#1A7F4B', metrics?.completed_jobs || 0],
          ['Pending',   '#D97A3D', metrics?.today_bookings || 0],
          ['Disputed',  '#E24B4A', metrics?.pending_disputes || 0],
        ].map(([l, c, n]) => (
          <div key={l} className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-landing-sans text-ink/70"><StatusDot color={c} />{l}</span>
            <span className="font-semibold text-ink/80 font-landing-sans">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity feed from real audit logs ───────────────────────────────────────
const ACTION_META = {
  create_company:    { icon: '🏢', color: '#1A7F4B' },
  approve_company:   { icon: '✅', color: '#1A7F4B' },
  suspend_company:   { icon: '🚫', color: '#E24B4A' },
  create_coupon:     { icon: '🎟️', color: '#D97A3D' },
  verify_provider:   { icon: '👷', color: '#1A7F4B' },
  suspend_provider:  { icon: '🚫', color: '#E24B4A' },
  delete_provider:   { icon: '🗑️', color: '#E24B4A' },
  suspend_user:      { icon: '🔒', color: '#E24B4A' },
  reactivate_user:   { icon: '🔓', color: '#1A7F4B' },
  delete_user:       { icon: '🗑️', color: '#E24B4A' },
  cancel_booking:    { icon: '❌', color: '#E24B4A' },
  refund_payment:    { icon: '💰', color: '#D97A3D' },
  update_dispute:    { icon: '⚖️', color: '#D97A3D' },
  refund_dispute:    { icon: '💸', color: '#1A7F4B' },
  create_announcement: { icon: '📢', color: '#1A7F4B' },
  hide_rating:       { icon: '🙈', color: '#D97A3D' },
  delete_rating:     { icon: '🗑️', color: '#E24B4A' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

function ActivityFeed({ logs, loading }) {
  return (
    <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-landing-sans font-semibold text-ink/80">Recent Activity</p>
        <span className="flex items-center gap-1.5 text-[11px] font-landing-sans text-mute">
          <StatusDot color="#1A7F4B" pulse />Live
        </span>
      </div>
      <div className="space-y-3.5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton w="w-8" h="h-8" className="rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton h="h-3" w="w-3/4" />
                  <Skeleton h="h-2.5" w="w-1/3" />
                </div>
              </div>
            ))
          : logs.slice(0, 7).map((log, i) => {
              const meta = ACTION_META[log.action] || { icon: '📋', color: '#6b6b64' };
              return (
                <div key={log.id || i} className="flex items-start gap-3 slide-in-right" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[15px]"
                    style={{ backgroundColor: meta.color + '18' }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-landing-sans text-ink/80 leading-snug">
                      <span className="font-semibold">{log.admin_name || 'Admin'}</span>
                      {' '}{log.action?.replace(/_/g, ' ')}
                      {log.entity_type ? ` (${log.entity_type} #${log.entity_id || ''})` : ''}
                    </p>
                    <p className="text-[11px] text-mute font-landing-sans mt-0.5">{log.created_at ? timeAgo(log.created_at) : '—'}</p>
                  </div>
                </div>
              );
            })
        }
        {!loading && logs.length === 0 && (
          <p className="text-center text-mute text-[12.5px] font-landing-sans py-4">No activity yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Top services from real data ──────────────────────────────────────────────
function TopServices({ requests, loading }) {
  const counts = {};
  requests.forEach(r => {
    const name = r.category?.name;
    if (name) counts[name] = (counts[name] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = sorted[0]?.[1] || 1;

  return (
    <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5">
      <p className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-4">Top Services</p>
      {loading ? (
        <div className="space-y-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between"><Skeleton h="h-3" w="w-24" /><Skeleton h="h-3" w="w-12" /></div>
              <Skeleton h="h-1.5" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-mute text-[12.5px] font-landing-sans text-center py-4">No bookings yet.</p>
      ) : (
        <div className="space-y-3.5">
          {sorted.map(([name, count], i) => (
            <div key={name} className="fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between text-[12.5px] font-landing-sans mb-1.5">
                <span className="font-medium text-ink/80">{name}</span>
                <span className="text-mute">{count} booking{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-1.5 rounded-full bg-forest-50 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-forest-500 transition-all duration-700"
                  style={{ width: `${(count / maxCount) * 100}%`, transitionDelay: `${i * 100 + 400}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quick stats row ──────────────────────────────────────────────────────────
const STAT_ICONS = ['👥', '👷', '🏢', '📅', '✅', '⚖️', '💰', '💵'];
const STAT_TRENDS = [12, 8, 5, -3, 22, -1, 18, 15];

// ─── Main component ───────────────────────────────────────────────────────────
export default function OverviewTab() {
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const applyMetrics = (m) => {
    setMetrics(m);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      adminService.getMetrics(),
      adminService.listRequests(),
      adminService.listAuditLogs(),
    ])
      .then(([m, r, l]) => {
        setMetrics(m);
        setRequests(r);
        setLogs(l);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = '/api/admin/metrics/stream';
    const es = new EventSource(url);
    sseRef.current = es;

    es.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (parsed?.data) applyMetrics(parsed.data);
      } catch (e) {
        console.warn('SSE parse error', e);
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  const refresh = () => {
    fetchAll();
  };

  const cards = [
    { label: 'Total Users',       value: metrics?.total_users,       icon: STAT_ICONS[0], trend: STAT_TRENDS[0] },
    { label: 'Service Providers', value: metrics?.total_providers,    icon: STAT_ICONS[1], trend: STAT_TRENDS[1] },
    { label: 'Companies',         value: metrics?.total_companies,    icon: STAT_ICONS[2], trend: STAT_TRENDS[2] },
    { label: "Today's Bookings",  value: metrics?.today_bookings,     icon: STAT_ICONS[3], trend: STAT_TRENDS[3] },
    { label: 'Completed Jobs',    value: metrics?.completed_jobs,     icon: STAT_ICONS[4], trend: STAT_TRENDS[4] },
    { label: 'Pending Disputes',  value: metrics?.pending_disputes,   icon: STAT_ICONS[5], trend: STAT_TRENDS[5] },
    { label: 'Platform Revenue',  value: fmtKES(metrics?.platform_revenue), icon: STAT_ICONS[6], trend: STAT_TRENDS[6] },
    { label: 'Commission Earned', value: fmtKES(metrics?.commission_earned), icon: STAT_ICONS[7], trend: STAT_TRENDS[7], accent: true },
  ];

  return (
    <div className="space-y-6">

      {/* Header row with clock + refresh */}
      <div className="flex items-start justify-between gap-4 fade-up">
        <div>
          <p className="text-[12px] text-mute font-landing-sans">
            {lastUpdated ? `Last updated ${timeAgo(lastUpdated)}` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LiveClock />
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-[12px] font-landing-sans font-semibold text-ink/50 hover:text-forest-600 transition-colors disabled:opacity-40 bg-white border border-ink/[0.08] px-3 py-1.5 rounded-xl"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loading ? 'animate-spin' : ''}>
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={c.label} className="fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <StatCard
              label={c.label}
              value={loading ? null : (c.value ?? 0)}
              icon={c.icon}
              trend={c.trend}
              accent={c.accent}
              loading={loading}
            />
          </div>
        ))}
      </div>

      {/* Line chart + donut */}
      <div className="grid lg:grid-cols-3 gap-5 fade-up delay-2">
        <BookingsLineChart />
        <DonutChart metrics={metrics} />
      </div>

      {/* Revenue bars + Top services + Dark card */}
      <div className="grid lg:grid-cols-3 gap-5 fade-up delay-3">
        <RevenueBarChart />
        <TopServices requests={requests} loading={loading} />
        <div className="rounded-2xl bg-forest-900 text-white px-5 py-5 flex flex-col justify-between">
          <div>
            <p className="text-[11.5px] font-landing-sans font-semibold text-white/50 uppercase tracking-wide mb-1">Avg. Booking Value</p>
            <p className="font-landing-display text-[32px] font-semibold mb-1">KSh 1,920</p>
            <div className="flex items-center gap-1.5 text-[12px] font-landing-sans text-forest-300 font-semibold mb-3">
              <span>↑ 10.3%</span><span className="text-white/30">vs last month</span>
            </div>
            <p className="text-[12px] text-white/50 font-landing-sans leading-relaxed">
              Across all categories this month, up from KSh 1,740 in April.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-1 rounded-full bg-forest-400 w-[72%]" />
            </div>
            <span className="text-[11px] text-white/40 font-landing-sans">72% of target</span>
          </div>
        </div>
      </div>

      {/* Activity feed + Recent bookings */}
      <div className="grid lg:grid-cols-3 gap-5 fade-up delay-4">
        <ActivityFeed logs={logs} loading={loading} />

        <div className="lg:col-span-2 rounded-2xl border border-ink/[0.06] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/[0.06] flex items-center justify-between">
            <p className="text-[13px] font-landing-sans font-semibold text-ink/80">Recent Bookings</p>
            <span className="text-[11.5px] font-landing-sans text-mute">{requests.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left border-b border-ink/[0.06] bg-sand-50/60">
                  {['Customer', 'Service', 'Provider', 'Date', 'Status', 'Amount'].map(h => (
                    <th key={h} className="font-landing-sans font-semibold text-ink/40 text-[11px] uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.04]">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {[32, 20, 24, 16, 16, 14].map((w, j) => (
                          <td key={j} className="px-5 py-3.5">
                            <div className="skeleton h-3 rounded" style={{ width: `${w * 3}px` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : requests.slice(0, 8).map((r, i) => (
                      <tr key={r.id} className="hover:bg-sand-50/60 transition-colors fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-[10px] font-bold shrink-0">
                              {(r.customer?.full_name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="font-landing-sans text-ink/90">{r.customer?.full_name || `User #${r.customer_id}`}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-landing-sans text-ink/70">{r.category?.name || '—'}</td>
                        <td className="px-5 py-3.5 font-landing-sans text-ink/70">{r.provider?.full_name || '—'}</td>
                        <td className="px-5 py-3.5 text-mute font-landing-sans whitespace-nowrap">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 font-landing-sans font-semibold text-[12px]" style={{ color: statusColor(r.status) }}>
                            <StatusDot color={statusColor(r.status)} />{r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-landing-sans font-semibold text-ink/90">
                          {fmtKES(r.final_price || r.price_offered)}
                        </td>
                      </tr>
                    ))
                }
                {!loading && requests.length === 0 && (
                  <tr><td colSpan="6" className="px-5 py-10 text-center text-mute font-landing-sans text-sm">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


