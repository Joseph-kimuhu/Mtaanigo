import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, Modal, Textarea, PrimaryBtn, statusBadgeColor } from './shared';

const STATUS_FILTERS = ['all', 'open', 'investigating', 'resolved', 'closed'];

export default function DisputesTab() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [busy, setBusy] = useState({});

  const reload = () => adminService.listDisputes().then(setDisputes).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, ...args) => {
    const key = args.join('-');
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(...args); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const handleResolve = async (status) => {
    await act(adminService.updateDispute, selected.id, status, resolution);
    setSelected(null);
    setResolution('');
  };

  const filtered = disputes.filter(d => filter === 'all' || d.status === filter);

  return (
    <div>
      <SectionHeader title={`Disputes (${filtered.length})`} />

      <div className="flex gap-1 mb-5 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium capitalize transition-colors ${filter === s ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>{s}</button>
        ))}
      </div>

      <Table
        headers={['ID', 'Booking', 'Raised By', 'Service', 'Reason', 'Status', 'Date', 'Actions']}
        loading={loading}
        empty={filtered.length === 0 ? 'No disputes found.' : null}
      >
        {filtered.map(d => (
          <tr key={d.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-mono text-[12px] text-mute">#{d.id}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70">#{d.request_id}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/90">{d.raiser_name || `User #${d.raised_by}`}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{d.service || '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70 max-w-[180px] truncate">{d.reason}</td>
            <td className="px-5 py-3.5"><Badge label={d.status} color={statusBadgeColor(d.status)} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{new Date(d.created_at).toLocaleDateString()}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <ActionBtn label="Review" onClick={() => { setSelected(d); setResolution(d.resolution || ''); }} />
                <ActionBtn label="Refund" variant="blue" disabled={busy[`rf${d.id}`]} onClick={() => act(adminService.refundDispute, d.id)} />
                <ActionBtn label="Pay Out" variant="green" disabled={busy[`po${d.id}`]} onClick={() => act(adminService.payoutDispute, d.id)} />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Dispute #${selected?.id}`}>
        {selected && (
          <div className="space-y-3 text-[13px] font-landing-sans">
            <Badge label={selected.status} color={statusBadgeColor(selected.status)} />
            {[
              ['Booking', `#${selected.request_id}`],
              ['Raised By', selected.raiser_name || `User #${selected.raised_by}`],
              ['Service', selected.service || '—'],
              ['Reason', selected.reason],
              ['Created', new Date(selected.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-ink/[0.06] pb-2">
                <span className="text-mute">{k}</span>
                <span className="font-medium text-ink/80 text-right max-w-[220px]">{v}</span>
              </div>
            ))}
            <Textarea label="Resolution Note" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe the resolution…" />
            <div className="flex gap-2 flex-wrap">
              <ActionBtn label="Mark Investigating" variant="yellow" onClick={() => handleResolve('investigating')} />
              <ActionBtn label="Resolve" variant="green" onClick={() => handleResolve('resolved')} />
              <ActionBtn label="Close" onClick={() => handleResolve('closed')} />
              <ActionBtn label="Refund Customer" variant="blue" onClick={() => { act(adminService.refundDispute, selected.id); setSelected(null); }} />
              <ActionBtn label="Pay Provider" variant="green" onClick={() => { act(adminService.payoutDispute, selected.id); setSelected(null); }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
