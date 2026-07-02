import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, fmtKES } from './shared';

export default function WithdrawRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});

  const reload = () =>
    adminService.listWithdrawRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const act = async (id, action) => {
    setBusy(b => ({ ...b, [`${action}${id}`]: true }));
    try { await adminService.updateWithdrawRequest(id, action); await reload(); }
    finally { setBusy(b => ({ ...b, [`${action}${id}`]: false })); }
  };

  const statusColor = (s) => ({ approved: 'green', pending: 'yellow', rejected: 'red', paid: 'blue' }[s] || 'gray');

  return (
    <div>
      <SectionHeader title={`Withdraw Requests (${requests.length})`} />
      <Table
        headers={['ID', 'Provider', 'Amount', 'Method', 'Account', 'Status', 'Requested', 'Actions']}
        loading={loading}
        empty={requests.length === 0 ? 'No withdraw requests.' : null}
      >
        {requests.map(r => (
          <tr key={r.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-mono text-[12px] text-mute">#{r.id}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.provider_name || `Provider #${r.provider_id}`}</td>
            <td className="px-5 py-3.5 font-landing-sans font-semibold text-ink/90">{fmtKES(r.amount)}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70">{r.method || 'M-Pesa'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{r.account_number || '—'}</td>
            <td className="px-5 py-3.5"><Badge label={r.status} color={statusColor(r.status)} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
            <td className="px-5 py-3.5">
              {r.status === 'pending' && (
                <div className="flex items-center gap-1.5">
                  <ActionBtn label="Approve" variant="green" disabled={busy[`approve${r.id}`]} onClick={() => act(r.id, 'approved')} />
                  <ActionBtn label="Reject" variant="red" disabled={busy[`rejected${r.id}`]} onClick={() => act(r.id, 'rejected')} />
                </div>
              )}
              {r.status !== 'pending' && <span className="text-[12px] text-mute font-landing-sans capitalize">{r.status}</span>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
