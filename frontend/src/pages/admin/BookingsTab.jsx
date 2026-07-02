import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, SearchBar, statusBadgeColor, Modal, fmtKES } from './shared';

const STATUSES = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'];

function downloadInvoice(r) {
  const lines = [
    'MtaaniGo — Service Invoice',
    '─────────────────────────────',
    `Booking ID:   #${r.id}`,
    `Customer:     ${r.customer?.full_name || `User #${r.customer_id}`}`,
    `Provider:     ${r.provider?.full_name || '—'}`,
    `Service:      ${r.category?.name || '—'}`,
    `Address:      ${r.address || '—'}`,
    `Status:       ${r.status}`,
    `Price Offered: ${fmtKES(r.price_offered)}`,
    `Final Price:  ${fmtKES(r.final_price)}`,
    `Commission:   ${fmtKES((r.final_price || r.price_offered || 0) * 0.15)}`,
    `Date:         ${r.created_at ? new Date(r.created_at).toLocaleString() : '—'}`,
    '─────────────────────────────',
    'Thank you for using MtaaniGo!',
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }));
  a.download = `invoice-${r.id}.txt`;
  a.click();
}

export default function BookingsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState({});

  const reload = () => adminService.listRequests().then(setRequests).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, id, key) => {
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(id); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const filtered = requests.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = !search || r.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) || String(r.id).includes(search);
    return matchFilter && matchSearch;
  });

  const statusCounts = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <SectionHeader
        title={`Bookings (${filtered.length})`}
        action={<SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search booking ID or customer…" />}
      />

      {/* Status filter tabs with counts */}
      <div className="flex gap-1 mb-5 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium transition-colors ${filter === 'all' ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>
          All ({requests.length})
        </button>
        {STATUSES.slice(1).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium capitalize transition-colors ${filter === s ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>
            {s.replace('_', ' ')} {statusCounts[s] > 0 && <span className="ml-1 opacity-70">({statusCounts[s]})</span>}
          </button>
        ))}
      </div>

      <Table
        headers={['ID', 'Customer', 'Provider', 'Service', 'Date', 'Price', 'Commission', 'Status', 'Actions']}
        loading={loading}
        empty={filtered.length === 0 ? 'No bookings found.' : null}
      >
        {filtered.map(r => (
          <tr key={r.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-mono text-[12px] text-mute">#{r.id}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.customer?.full_name || `User #${r.customer_id}`}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70">{r.provider?.full_name || '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/80">{r.category?.name || '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans font-medium text-ink/90">{fmtKES(r.final_price || r.price_offered)}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{fmtKES((r.final_price || r.price_offered || 0) * 0.15)}</td>
            <td className="px-5 py-3.5"><Badge label={r.status} color={statusBadgeColor(r.status)} /></td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <ActionBtn label="View" onClick={() => setSelected(r)} />
                <ActionBtn label="Invoice" onClick={() => downloadInvoice(r)} />
                <ActionBtn label="Cancel" variant="red" disabled={busy[`c${r.id}`]} onClick={() => act(adminService.cancelRequest, r.id, `c${r.id}`)} />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Booking #${selected?.id}`} size="lg">
        {selected && (
          <div className="space-y-3 text-[13px] font-landing-sans">
            <div className="flex items-center gap-2 mb-2">
              <Badge label={selected.status} color={statusBadgeColor(selected.status)} />
              <span className="text-[11.5px] text-mute">Created {new Date(selected.created_at).toLocaleString()}</span>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl bg-sand-50 px-4 py-3">
                <p className="text-[10.5px] text-mute uppercase tracking-wide font-semibold mb-1">Customer</p>
                <p className="font-semibold text-ink/90">{selected.customer?.full_name || `User #${selected.customer_id}`}</p>
                <p className="text-[11px] text-mute">{selected.customer?.email || '—'}</p>
                <p className="text-[11px] text-mute">{selected.customer?.phone || '—'}</p>
              </div>
              <div className="rounded-xl bg-sand-50 px-4 py-3">
                <p className="text-[10.5px] text-mute uppercase tracking-wide font-semibold mb-1">Provider</p>
                <p className="font-semibold text-ink/90">{selected.provider?.full_name || '—'}</p>
                <p className="text-[11px] text-mute">{selected.provider?.user?.email || '—'}</p>
              </div>
            </div>

            {[
              ['Service', selected.category?.name || '—'],
              ['Address', selected.address || '—'],
              ['Description', selected.description || '—'],
              ['Price Offered', fmtKES(selected.price_offered)],
              ['Final Price', fmtKES(selected.final_price)],
              ['Commission (15%)', fmtKES((selected.final_price || selected.price_offered || 0) * 0.15)],
              ['Completed', selected.completed_at ? new Date(selected.completed_at).toLocaleString() : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-ink/[0.06] pb-2">
                <span className="text-mute">{k}</span>
                <span className="font-medium text-ink/80 text-right max-w-[220px]">{v}</span>
              </div>
            ))}

            <div className="flex gap-2 pt-3 flex-wrap">
              <ActionBtn label="Download Invoice" onClick={() => downloadInvoice(selected)} />
              <ActionBtn label="Mark Complete" variant="green" onClick={() => { act(id => adminService.updateRequestStatus(id, 'completed'), selected.id, `comp${selected.id}`); setSelected(null); }} />
              <ActionBtn label="Cancel Booking" variant="red" onClick={() => { act(adminService.cancelRequest, selected.id, `c${selected.id}`); setSelected(null); }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
