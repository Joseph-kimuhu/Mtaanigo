import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { fmtKES, StatCard, SectionHeader, Table, Badge } from './shared';

const PERIODS = ['today', 'week', 'month', 'year'];

export default function EarningsTab() {
  const [period, setPeriod] = useState('month');
  const [earnings, setEarnings] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminService.getEarnings(period), adminService.listPayments()])
      .then(([e, p]) => { setEarnings(e); setPayments(p); })
      .finally(() => setLoading(false));
  }, [period]);

  const handleExport = async (fmt) => {
    const data = await adminService.exportEarnings(fmt);
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `earnings.${fmt}`; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-landing-sans font-semibold text-[15px] text-ink">Earnings</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-ink/[0.1] overflow-hidden text-[12px] font-landing-sans">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 capitalize transition-colors ${period === p ? 'bg-forest-500 text-white font-semibold' : 'text-ink/60 hover:bg-sand-100'}`}>{p}</button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {['pdf', 'excel', 'csv'].map(f => (
              <button key={f} onClick={() => handleExport(f)} className="text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-lg bg-ink/[0.06] text-ink/70 hover:bg-ink/[0.1] uppercase transition-colors">{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={loading ? '…' : fmtKES(earnings?.revenue)} />
        <StatCard label="Provider Payouts" value={loading ? '…' : fmtKES(earnings?.payouts)} />
        <StatCard label="Commission" value={loading ? '…' : fmtKES(earnings?.commission)} />
        <StatCard label="Net Profit" value={loading ? '…' : fmtKES((earnings?.revenue || 0) - (earnings?.payouts || 0))} accent />
      </div>

      {/* Revenue bar chart */}
      <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5">
        <p className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-4">Revenue Chart</p>
        <svg viewBox="0 0 560 140" className="w-full h-36">
          <line x1="0" y1="35" x2="560" y2="35" stroke="#16241D" strokeOpacity="0.06" />
          <line x1="0" y1="70" x2="560" y2="70" stroke="#16241D" strokeOpacity="0.06" />
          <line x1="0" y1="105" x2="560" y2="105" stroke="#16241D" strokeOpacity="0.06" />
          <polyline points="0,120 80,100 160,80 240,90 320,60 400,50 480,30 560,40" fill="none" stroke="#1A7F4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polygon points="0,120 80,100 160,80 240,90 320,60 400,50 480,30 560,40 560,140 0,140" fill="#1A7F4B" fillOpacity="0.08" />
        </svg>
      </div>

      {/* Payments table */}
      <div>
        <p className="font-landing-sans font-semibold text-[14px] text-ink mb-4">All Transactions</p>
        <Table headers={['ID', 'Booking', 'Amount', 'Method', 'Status', 'Paid At']} loading={loading} empty={payments.length === 0 ? 'No payments found.' : null}>
          {payments.map(p => (
            <tr key={p.id} className="hover:bg-sand-50 transition-colors">
              <td className="px-5 py-3.5 font-mono text-[12px] text-mute">#{p.id}</td>
              <td className="px-5 py-3.5 font-landing-sans text-ink/70">#{p.request_id}</td>
              <td className="px-5 py-3.5 font-landing-sans font-medium text-ink/90">{fmtKES(p.amount)}</td>
              <td className="px-5 py-3.5 font-landing-sans text-ink/70">{p.payment_method || '—'}</td>
              <td className="px-5 py-3.5"><Badge label={p.status} color={p.status === 'completed' || p.status === 'paid' ? 'green' : p.status === 'pending' ? 'yellow' : 'red'} /></td>
              <td className="px-5 py-3.5 font-landing-sans text-mute">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
