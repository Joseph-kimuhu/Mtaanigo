import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { SectionHeader, Badge, ActionBtn, Table } from './shared';

const FRAUD_FLAGS = [
  { id: 1, type: 'Suspicious Account', entity: 'User #482', reason: 'Multiple accounts from same device', severity: 'high', status: 'open', date: '2025-05-20' },
  { id: 2, type: 'Repeated Cancellations', entity: 'Provider #91', reason: '12 cancellations in 3 days', severity: 'medium', status: 'investigating', date: '2025-05-19' },
  { id: 3, type: 'Unusual Payment', entity: 'Payment #3041', reason: 'Same M-Pesa number used on 8 accounts', severity: 'high', status: 'open', date: '2025-05-18' },
  { id: 4, type: 'Fake Review', entity: 'Rating #204', reason: '5-star reviews from newly created accounts', severity: 'low', status: 'resolved', date: '2025-05-17' },
  { id: 5, type: 'Account Takeover', entity: 'User #119', reason: 'Login from unusual location (different country)', severity: 'critical', status: 'open', date: '2025-05-16' },
];

const SEVERITY_COLOR = { critical: 'red', high: 'red', medium: 'yellow', low: 'blue' };
const STATUS_COLOR = { open: 'red', investigating: 'yellow', resolved: 'green', closed: 'gray' };

export default function FraudDetectionTab() {
  const [flags, setFlags] = useState(FRAUD_FLAGS);
  const [filter, setFilter] = useState('all');

  const updateFlag = (id, status) => setFlags(f => f.map(x => x.id === id ? { ...x, status } : x));

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

      {/* Summary cards */}
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

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        {['all', 'open', 'investigating', 'resolved', 'closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium capitalize transition-colors ${filter === s ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>{s}</button>
        ))}
      </div>

      <Table
        headers={['Type', 'Entity', 'Reason', 'Severity', 'Status', 'Date', 'Actions']}
        loading={false}
        empty={filtered.length === 0 ? 'No fraud flags found.' : null}
      >
        {filtered.map(f => (
          <tr key={f.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-landing-sans font-medium text-ink/90">{f.type}</td>
            <td className="px-5 py-3.5 font-mono text-[12px] text-mute">{f.entity}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70 max-w-[200px] truncate">{f.reason}</td>
            <td className="px-5 py-3.5"><Badge label={f.severity} color={SEVERITY_COLOR[f.severity] || 'gray'} /></td>
            <td className="px-5 py-3.5"><Badge label={f.status} color={STATUS_COLOR[f.status] || 'gray'} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{f.date}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {f.status === 'open' && (
                  <ActionBtn label="Investigate" variant="yellow" onClick={() => updateFlag(f.id, 'investigating')} />
                )}
                {f.status === 'investigating' && (
                  <ActionBtn label="Resolve" variant="green" onClick={() => updateFlag(f.id, 'resolved')} />
                )}
                {f.status !== 'closed' && (
                  <ActionBtn label="Close" onClick={() => updateFlag(f.id, 'closed')} />
                )}
                <ActionBtn label="Dismiss" variant="red" onClick={() => setFlags(fl => fl.filter(x => x.id !== f.id))} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
