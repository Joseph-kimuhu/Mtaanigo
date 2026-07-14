import { useEffect, useState } from 'react';
import { fundiService } from '../../services/fundiService';
import { fmtKES, Card, Spinner, MiniBarChart, Stars, OnlineDot, Btn } from './shared';

function StatCard({ label, value, icon, sub, accent }) {
  return (
    <Card className={`px-5 py-4 ${accent ? 'bg-forest-900 border-forest-700' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-[11px] font-landing-sans font-semibold uppercase tracking-wide mb-2 ${accent ? 'text-white/50' : 'text-mute'}`}>{label}</p>
          <p className={`font-landing-display text-[22px] font-semibold leading-none ${accent ? 'text-white' : 'text-ink'}`}>{value ?? '—'}</p>
          {sub && <p className={`text-[11px] mt-1.5 font-landing-sans ${accent ? 'text-white/40' : 'text-mute'}`}>{sub}</p>}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[17px] shrink-0 ${accent ? 'bg-white/10' : 'bg-forest-50'}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

const QUICK_ACTIONS = [
  { label: 'Go Online', icon: '🟢', action: 'online' },
  { label: 'Go Offline', icon: '🔴', action: 'offline' },
  { label: 'Edit Services', icon: '🛠️', action: 'services' },
  { label: 'Withdraw', icon: '💸', action: 'withdrawals' },
  { label: 'Schedule', icon: '📅', action: 'schedule' },
  { label: 'Support', icon: '🆘', action: 'help' },
];

const ACHIEVEMENTS = [
  { icon: '⭐', label: 'Top Rated', desc: 'Avg rating above 4.5', earned: true },
  { icon: '💯', label: '100 Jobs', desc: 'Completed 100+ jobs', earned: false },
  { icon: '⚡', label: 'Fast Responder', desc: 'Responds in < 5 min', earned: true },
  { icon: '✅', label: 'Verified Fundi', desc: 'ID & docs verified', earned: true },
  { icon: '🏆', label: 'Trusted Fundi', desc: '50+ 5-star reviews', earned: false },
];

export default function OverviewTab({ onNav, stats, requests, loading }) {
  const pending = (requests || []).filter(r => r.status === 'pending').slice(0, 3);
  const active  = (requests || []).filter(r => r.status === 'accepted' || r.status === 'in_progress').slice(0, 3);

  const handleToggle = async () => {
    try {
      await fundiService.setAvailability(!(stats?.is_available));
      window.location.reload();
    } catch { /* ignore */ }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">

      {/* Online toggle banner */}
      <div className={`rounded-2xl px-5 py-4 flex items-center justify-between gap-4 ${stats?.is_available ? 'bg-forest-50 border border-forest-200' : 'bg-ink/[0.04] border border-ink/[0.1]'}`}>
        <div className="flex items-center gap-3">
          <OnlineDot online={stats?.is_available} />
          <div>
            <p className="font-landing-sans font-bold text-[14px] text-ink">{stats?.is_available ? 'You are Online' : 'You are Offline'}</p>
            <p className="text-[12px] text-mute font-landing-sans">{stats?.is_available ? 'Receiving new job requests' : 'Not receiving job requests'}</p>
          </div>
        </div>
        <Btn variant={stats?.is_available ? 'outline' : 'primary'} size="sm" onClick={handleToggle}>
          {stats?.is_available ? 'Go Offline' : 'Go Online'}
        </Btn>
      </div>

      {/* KPI cards — row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Today's Earnings"  value={fmtKES(stats?.today_earnings)}  icon="💰" />
        <StatCard label="Weekly Earnings"   value={fmtKES(stats?.week_earnings)}   icon="📈" />
        <StatCard label="Monthly Earnings"  value={fmtKES(stats?.month_earnings)}  icon="🗓️" />
        <StatCard label="Available Balance" value={fmtKES(stats?.available_balance)} icon="💳" accent />
      </div>

      {/* KPI cards — row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Pending Requests" value={stats?.pending_requests ?? 0}  icon="📥" />
        <StatCard label="Today's Jobs"     value={stats?.today_jobs ?? 0}         icon="📅" />
        <StatCard label="Completed Jobs"   value={stats?.completed_jobs ?? 0}     icon="✅" />
        <StatCard label="Avg Rating"       value={`${(stats?.rating || 0).toFixed(1)}★`} icon="⭐" />
        <StatCard label="Acceptance Rate"  value={`${stats?.acceptance_rate ?? 0}%`} icon="👍" />
        <StatCard label="Completion Rate"  value={`${stats?.completion_rate ?? 0}%`} icon="🏁" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="px-5 py-5">
          <p className="font-landing-sans font-semibold text-[13px] text-ink/80 mb-4">Earnings — Last 7 Days</p>
          {stats?.last_7_days?.length > 0
            ? <MiniBarChart data={stats.last_7_days} valueKey="amount" labelKey="day" />
            : <p className="text-mute text-sm font-landing-sans text-center py-6">No earnings data yet</p>
          }
        </Card>

        <Card className="px-5 py-5">
          <p className="font-landing-sans font-semibold text-[13px] text-ink/80 mb-4">Performance Overview</p>
          <div className="space-y-3">
            {[
              ['Acceptance Rate', stats?.acceptance_rate ?? 0, '#1A7F4B'],
              ['Completion Rate', stats?.completion_rate ?? 0, '#3E6C7A'],
              ['Customer Satisfaction', Math.min(100, Math.round((stats?.rating || 0) * 20)), '#D97A3D'],
            ].map(([label, val, color]) => (
              <div key={label}>
                <div className="flex justify-between text-[12px] font-landing-sans mb-1">
                  <span className="text-ink/70">{label}</span>
                  <span className="font-semibold text-ink/90">{val}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink/[0.06] overflow-hidden">
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending requests + Active jobs */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/[0.06] flex items-center justify-between">
            <p className="font-landing-sans font-semibold text-[13px] text-ink/80">New Requests</p>
            <button onClick={() => onNav('requests')} className="text-[11.5px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">View all →</button>
          </div>
          <div className="divide-y divide-ink/[0.05]">
            {pending.length === 0
              ? <p className="px-5 py-8 text-center text-mute font-landing-sans text-sm">No pending requests</p>
              : pending.map(r => (
                <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-landing-sans font-semibold text-[13px] text-ink/90 truncate">{r.description}</p>
                    <p className="text-[11.5px] text-mute font-landing-sans">{r.customer?.full_name || 'Customer'} · {r.address || 'Nairobi'}</p>
                    <p className="text-[11.5px] font-semibold text-forest-600 font-landing-sans">{fmtKES(r.price_offered)}</p>
                  </div>
                  <button onClick={() => onNav('requests')} className="text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-lg bg-forest-50 text-forest-700 hover:bg-forest-100 shrink-0">
                    View
                  </button>
                </div>
              ))
            }
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/[0.06] flex items-center justify-between">
            <p className="font-landing-sans font-semibold text-[13px] text-ink/80">Active Jobs</p>
            <button onClick={() => onNav('jobs')} className="text-[11.5px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">View all →</button>
          </div>
          <div className="divide-y divide-ink/[0.05]">
            {active.length === 0
              ? <p className="px-5 py-8 text-center text-mute font-landing-sans text-sm">No active jobs right now</p>
              : active.map(r => (
                <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-landing-sans font-semibold text-[13px] text-ink/90 truncate">{r.description}</p>
                    <p className="text-[11.5px] text-mute font-landing-sans">{r.customer?.full_name || 'Customer'} · {r.address || 'Nairobi'}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-landing-sans shrink-0">In Progress</span>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="px-5 py-5">
        <p className="font-landing-sans font-semibold text-[13px] text-ink/80 mb-4">Quick Actions</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(a => (
            <button key={a.action} onClick={() => onNav(a.action === 'online' || a.action === 'offline' ? null : a.action) || (a.action === 'online' ? fundiService.setAvailability(true) : a.action === 'offline' ? fundiService.setAvailability(false) : null)} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-sand-50 hover:bg-forest-50 transition-colors group">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[11px] font-landing-sans font-semibold text-ink/70 group-hover:text-forest-700 text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="px-5 py-5">
        <p className="font-landing-sans font-semibold text-[13px] text-ink/80 mb-4">🏆 Achievements</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map(a => (
            <div key={a.label} className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all ${a.earned ? 'bg-forest-50 border border-forest-200' : 'bg-ink/[0.03] border border-ink/[0.06] opacity-50'}`}>
              <span className="text-2xl">{a.icon}</span>
              <p className="font-landing-sans font-semibold text-[12px] text-ink/90">{a.label}</p>
              <p className="text-[10.5px] text-mute font-landing-sans leading-tight">{a.desc}</p>
              {a.earned && <span className="text-[10px] font-semibold text-forest-600 font-landing-sans">Earned ✓</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
