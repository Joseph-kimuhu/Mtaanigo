import { useEffect, useState } from 'react';
import { fundiService } from '../../services/fundiService';
import { fmtKES, Card, Spinner, MiniBarChart, StatusPill, Modal, Input, Select, Btn } from './shared';

function exportCSV(data, name) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  a.download = `${name}.csv`; a.click();
}

export default function EarningsTab({ stats, requests }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wForm, setWForm] = useState({ amount: '', method: 'mpesa', account: '' });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    fundiService.getWithdrawals().then(setWithdrawals).catch(() => {});
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!wForm.amount || parseFloat(wForm.amount) < 100) return showToast('Minimum withdrawal is KES 100');
    setBusy(true);
    try {
      await fundiService.requestWithdrawal(parseFloat(wForm.amount), wForm.method, wForm.account);
      showToast('Withdrawal request submitted! ✅');
      setShowWithdraw(false);
      setWForm({ amount: '', method: 'mpesa', account: '' });
      const data = await fundiService.getWithdrawals();
      setWithdrawals(data);
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to submit withdrawal');
    } finally { setBusy(false); }
  };

  const completed = requests.filter(r => r.status === 'completed');

  const txData = completed.map(r => ({
    id: r.id,
    customer: r.customer?.full_name || '—',
    service: r.category?.name || r.description,
    amount: r.final_price || r.price_offered || 0,
    commission: ((r.final_price || r.price_offered || 0) * 0.15).toFixed(0),
    net: ((r.final_price || r.price_offered || 0) * 0.85).toFixed(0),
    status: 'cleared',
    date: new Date(r.created_at).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl font-landing-sans text-[13px] shadow-lg">{toast}</div>}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          ['Today', fmtKES(stats?.today_earnings)],
          ['This Week', fmtKES(stats?.week_earnings)],
          ['This Month', fmtKES(stats?.month_earnings)],
          ['Lifetime', fmtKES(stats?.lifetime_earnings)],
          ['Pending', fmtKES(stats?.pending_clearance)],
          ['Available', fmtKES(stats?.available_balance)],
        ].map(([label, val]) => (
          <Card key={label} className="px-4 py-3.5">
            <p className="text-[10.5px] font-landing-sans font-semibold uppercase tracking-wide text-mute mb-1.5">{label}</p>
            <p className="font-landing-display text-[17px] font-semibold text-ink">{val}</p>
          </Card>
        ))}
      </div>

      {/* Chart + Withdraw */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 px-5 py-5">
          <p className="font-landing-sans font-semibold text-[13px] text-ink/80 mb-4">Daily Earnings — Last 7 Days</p>
          {stats?.last_7_days?.length > 0
            ? <MiniBarChart data={stats.last_7_days} valueKey="amount" labelKey="day" />
            : <p className="text-mute text-sm font-landing-sans text-center py-6">No data yet</p>
          }
        </Card>

        <Card className="px-5 py-5 flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-landing-sans font-semibold uppercase tracking-wide text-mute mb-1">Available Balance</p>
            <p className="font-landing-display text-[28px] font-semibold text-forest-600">{fmtKES(stats?.available_balance)}</p>
          </div>
          <Btn variant="primary" className="w-full" onClick={() => setShowWithdraw(true)}>💸 Withdraw to M-Pesa</Btn>
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" className="flex-1" onClick={() => exportCSV(txData, 'earnings')}>CSV</Btn>
            <Btn variant="ghost" size="sm" className="flex-1" onClick={() => exportCSV(txData, 'earnings-statement')}>Export</Btn>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-ink/[0.06]">
          <p className="font-landing-sans font-semibold text-[13px] text-ink/80">Transaction History</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-ink/[0.06] bg-sand-50/60">
                {['Customer', 'Service', 'Amount', 'Commission', 'Net', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-landing-sans font-semibold text-[11px] text-ink/40 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.04]">
              {txData.length === 0
                ? <tr><td colSpan="7" className="px-5 py-10 text-center text-mute font-landing-sans text-sm">No completed jobs yet</td></tr>
                : txData.map(t => (
                  <tr key={t.id} className="hover:bg-sand-50">
                    <td className="px-5 py-3 font-landing-sans text-ink/90">{t.customer}</td>
                    <td className="px-5 py-3 font-landing-sans text-ink/70">{t.service}</td>
                    <td className="px-5 py-3 font-landing-sans font-semibold text-ink/90">{fmtKES(t.amount)}</td>
                    <td className="px-5 py-3 font-landing-sans text-red-600">-{fmtKES(t.commission)}</td>
                    <td className="px-5 py-3 font-landing-sans font-semibold text-forest-600">{fmtKES(t.net)}</td>
                    <td className="px-5 py-3"><StatusPill status={t.status} /></td>
                    <td className="px-5 py-3 font-landing-sans text-mute">{t.date}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </Card>

      {/* Withdrawal history */}
      {withdrawals.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/[0.06]">
            <p className="font-landing-sans font-semibold text-[13px] text-ink/80">Withdrawal History</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-ink/[0.06] bg-sand-50/60">
                  {['Amount', 'Method', 'Account', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-landing-sans font-semibold text-[11px] text-ink/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.04]">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-sand-50">
                    <td className="px-5 py-3 font-landing-sans font-semibold text-ink/90">{fmtKES(w.amount)}</td>
                    <td className="px-5 py-3 font-landing-sans text-ink/70 capitalize">{w.method}</td>
                    <td className="px-5 py-3 font-landing-sans text-mute">{w.account_number || '—'}</td>
                    <td className="px-5 py-3"><StatusPill status={w.status} /></td>
                    <td className="px-5 py-3 font-landing-sans text-mute">{new Date(w.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Withdraw Modal */}
      <Modal open={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds">
        <form onSubmit={handleWithdraw}>
          <div className="mb-4 px-4 py-3 rounded-xl bg-forest-50 border border-forest-200 text-[12.5px] font-landing-sans text-forest-700">
            Available: <strong>{fmtKES(stats?.available_balance)}</strong>
          </div>
          <Input label="Amount (KES)" type="number" min="100" required placeholder="e.g. 5000" value={wForm.amount} onChange={e => setWForm(f => ({ ...f, amount: e.target.value }))} />
          <Select label="Method" value={wForm.method} onChange={e => setWForm(f => ({ ...f, method: e.target.value }))}>
            <option value="mpesa">M-Pesa</option>
            <option value="bank">Bank Transfer</option>
          </Select>
          <Input label={wForm.method === 'mpesa' ? 'M-Pesa Number' : 'Account Number'} placeholder={wForm.method === 'mpesa' ? '07XXXXXXXX' : 'Bank account number'} value={wForm.account} onChange={e => setWForm(f => ({ ...f, account: e.target.value }))} />
          <Btn type="submit" variant="primary" disabled={busy} className="w-full">{busy ? 'Submitting…' : 'Request Withdrawal'}</Btn>
        </form>
      </Modal>
    </div>
  );
}
