import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { SectionHeader, Badge, ActionBtn, Table } from './shared';

const SEVERITY_COLOR = { critical: 'red', high: 'red', medium: 'yellow', low: 'blue' };
const STATUS_COLOR = { open: 'red', investigating: 'yellow', resolved: 'green', closed: 'gray' };

export default function FraudDetectionTab() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.listFraudFlags();
      setFlags(data);
    } catch {
      setFlags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateFlag = async (id, status) => {
    setBusy(b => ({ ...b, [`status-${id}`]: true }));
    try {
      await adminService.updateFraudFlag(id, status);
      setFlags(f => f.map(x => x.id === id ? { ...x, status } : x));
    } catch {
      // ignore
    } finally {
      setBusy(b => ({ ...b, [`status-${id}`]: false }));
    }
  };

  const removeFlag = async (id) => {
    setFlags(f => f.filter(x => x.id !== id));
  };

  const filtered = flags.filter(f => filter === 'all' || f.status === filter);

  const counts = {
    total: flags.length,
    open: flags.filter(f => f.status === 'open').length,
    investigating: flags.filter(f => f.status === 'investigating').length,
    resolved: flags.filter(f => f.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Fraud Detection" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Flags', value: counts.total, color: 'bg-white border-ink/[0.06]' },
          { label: 'Open', value: counts.open, color: 'bg-red-50 border-red-200' },
          { label: 'Investigating', value: counts.investigating, color: 'bg-amber-50 border-amber-200' },
          { label: 'Resolved', value: counts.resolved, color: 'bg-forest-50 border-forest-200' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border px-5 py-4 ${c.color}`}>
            <p className="text-[12px] text-mute font-landing-sans mb-1">{c.label}</p>
            <p className="font-landing-display text-[22px] font-semibold text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 flex-wrap">
        {['all', 'open', 'investigating', 'resolved', 'closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium capitalize transition-colors ${filter === s ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>{s}</button>
        ))}
      </div>

      <Table
        headers={['Type', 'Entity', 'Reason', 'Severity', 'Status', 'Date', 'Actions']}
        loading={loading}
        empty={filtered.length === 0 && !loading ? 'No fraud flags found.' : null}
      >
        {filtered.map(f => (
          <tr key={f.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-landing-sans font-medium text-ink/90">{f.type}</td>
            <td className="px-5 py-3.5 font-mono text-[12px] text-mute">{f.entity_type || ''} #{f.entity_id || ''}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70 max-w-[200px] truncate">{f.reason}</td>
            <td className="px-5 py-3.5"><Badge label={f.severity} color={SEVERITY_COLOR[f.severity] || 'gray'} /></td>
            <td className="px-5 py-3.5"><Badge label={f.status} color={STATUS_COLOR[f.status] || 'gray'} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{new Date(f.created_at).toLocaleDateString()}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {f.status === 'open' && (
                  <ActionBtn label="Investigate" variant="yellow" onClick={() => updateFlag(f.id, 'investigating')} disabled={busy[`status-${f.id}`]} />
                )}
                {f.status === 'investigating' && (
                  <ActionBtn label="Resolve" variant="green" onClick={() => updateFlag(f.id, 'resolved')} disabled={busy[`status-${f.id}`]} />
                )}
                {f.status !== 'closed' && (
                  <ActionBtn label="Close" onClick={() => updateFlag(f.id, 'closed')} disabled={busy[`status-${f.id}`]} />
                )}
                <ActionBtn label="Dismiss" variant="red" onClick={() => removeFlag(f.id)} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
