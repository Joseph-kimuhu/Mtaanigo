import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader } from './shared';

const DOC_TYPES = ['all', 'id', 'business_permit', 'certificate', 'license'];

export default function VerificationCenterTab() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState({});

  const reload = () =>
    adminService.listProviders()
      .then(data => setProviders(data.filter(p => p.status === 'offline' || p.status === 'pending')))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const act = async (fn, id, key) => {
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(id); await reload(); }
    finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  return (
    <div>
      <SectionHeader title="Verification Center" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending Review', value: providers.length, color: 'bg-amber-50 border-amber-200' },
          { label: 'Verified Today', value: 0, color: 'bg-forest-50 border-forest-200' },
          { label: 'Rejected', value: 0, color: 'bg-red-50 border-red-200' },
          { label: 'Total Verified', value: 0, color: 'bg-blue-50 border-blue-200' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border px-5 py-4 ${c.color}`}>
            <p className="text-[12px] text-mute font-landing-sans mb-1">{c.label}</p>
            <p className="font-landing-display text-[22px] font-semibold text-ink">{loading ? '…' : c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-5 flex-wrap">
        {DOC_TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium capitalize transition-colors ${filter === t ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Table
        headers={['Provider', 'Status', 'Bio', 'Experience', 'Joined', 'Actions']}
        loading={loading}
        empty={providers.length === 0 ? 'No providers pending verification.' : null}
      >
        {providers.map(p => (
          <tr key={p.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-[12px] shrink-0">
                  {(p.full_name || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-landing-sans font-medium text-ink/90">{p.full_name || `Provider #${p.id}`}</p>
                  <p className="text-[11px] text-mute font-landing-sans">{p.address || '—'}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5">
              <Badge label={p.status} color={{ online: 'green', offline: 'gray', suspended: 'red' }[p.status] || 'yellow'} />
            </td>
            <td className="px-5 py-3.5 font-landing-sans text-mute max-w-[160px] truncate">{p.bio || '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{p.years_of_experience ? `${p.years_of_experience} yrs` : '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <ActionBtn label="Verify ID" variant="green" disabled={busy[`v${p.id}`]} onClick={() => act(id => adminService.verifyProvider(id, true), p.id, `v${p.id}`)} />
                <ActionBtn label="Reject" variant="red" disabled={busy[`r${p.id}`]} onClick={() => act(id => adminService.verifyProvider(id, false), p.id, `r${p.id}`)} />
                <ActionBtn label="Suspend" variant="yellow" disabled={busy[`s${p.id}`]} onClick={() => act(adminService.suspendProvider, p.id, `s${p.id}`)} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
