import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, SearchBar, fmtKES } from './shared';

export default function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState({});

  const reload = () => adminService.listPayments().then(setPayments).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const handleRefund = async (id) => {
    if (!confirm('Refund this payment?')) return;
    setBusy(b => ({ ...b, [id]: true }));
    try { await adminService.refundPayment(id); await reload(); }
    finally { setBusy(b => ({ ...b, [id]: false })); }
  };

  const filtered = payments.filter(p =>
    !search || String(p.id).includes(search) || String(p.request_id).includes(search) || (p.mpesa_receipt || '').includes(search)
  );

  const statusColor = (s) => ({ completed: 'green', paid: 'green', pending: 'yellow', refunded: 'blue', failed: 'red' }[s] || 'gray');

  return (
    <div>
      <SectionHeader
        title={`Payments (${filtered.length})`}
        action={<SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or receipt…" />}
      />
      <Table
        headers={['ID', 'Booking', 'Amount', 'Method', 'M-Pesa Receipt', 'Status', 'Paid At', 'Actions']}
        loading={loading}
        empty={filtered.length === 0 ? 'No payments found.' : null}
      >
        {filtered.map(p => (
          <tr key={p.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-mono text-[12px] text-mute">#{p.id}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70">#{p.request_id}</td>
            <td className="px-5 py-3.5 font-landing-sans font-semibold text-ink/90">{fmtKES(p.amount)}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70">{p.payment_method || '—'}</td>
            <td className="px-5 py-3.5 font-mono text-[12px] text-mute">{p.mpesa_receipt || '—'}</td>
            <td className="px-5 py-3.5"><Badge label={p.status} color={statusColor(p.status)} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
            <td className="px-5 py-3.5">
              {p.status !== 'refunded' && (
                <ActionBtn label="Refund" variant="blue" disabled={busy[p.id]} onClick={() => handleRefund(p.id)} />
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
