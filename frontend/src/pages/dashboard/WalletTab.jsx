import { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';

function formatCurrencyKES(amount) {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `KSh ${Math.round(amount || 0).toLocaleString('en-KE')}`;
  }
}

export default function WalletTab() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('mpesa');
  const [depositPhone, setDepositPhone] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [savedCards, setSavedCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mtaanigo_cards') || '[]'); } catch { return []; }
  });
  const [promoCode, setPromoCode] = useState('');
  const [promos, setPromos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mtaanigo_promos') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerService.getPayments();
        setPayments(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const balance = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalSpent = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount) return;
    setDepositing(true);
    try {
      await customerService.createPayment({ amount: parseFloat(depositAmount), payment_method: depositMethod });
      const data = await customerService.getPayments();
      setPayments(data || []);
      setShowDeposit(false);
      setDepositAmount('');
    } catch (e) {
      console.error(e);
    } finally {
      setDepositing(false);
    }
  };

  const addCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv) return;
    const cards = [...savedCards, { ...newCard, id: Date.now() }];
    setSavedCards(cards);
    localStorage.setItem('mtaanigo_cards', JSON.stringify(cards));
    setNewCard({ number: '', expiry: '', cvv: '', name: '' });
  };

  const removeCard = (id) => {
    const cards = savedCards.filter((c) => c.id !== id);
    setSavedCards(cards);
    localStorage.setItem('mtaanigo_cards', JSON.stringify(cards));
  };

  const applyPromo = () => {
    if (!promoCode.trim()) return;
    const promos = [...promos, { code: promoCode.trim(), amount: 500, created_at: new Date().toISOString() }];
    setPromos(promos);
    localStorage.setItem('mtaanigo_promos', JSON.stringify(promos));
    setPromoCode('');
  };

  const promoBalance = promos.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      <h1 className="font-landing-display text-[26px] font-medium text-ink mb-6">Wallet</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-forest-900 text-white p-5">
          <p className="text-[13px] font-landing-sans text-forest-300 mb-1">Wallet balance</p>
          <p className="font-landing-display text-[28px] font-semibold">{formatCurrencyKES(balance + promoBalance)}</p>
          <button onClick={() => setShowDeposit(true)} className="mt-3 rounded-full bg-forest-500 hover:bg-forest-400 text-white text-[13px] font-landing-sans font-semibold px-4 py-2 transition-colors">Top up</button>
        </div>
        <div className="rounded-2xl bg-white border border-ink/[0.06] p-5">
          <p className="text-[13px] font-landing-sans text-mute mb-1">Total spent</p>
          <p className="font-landing-display text-[28px] font-semibold text-ink">{formatCurrencyKES(totalSpent)}</p>
          <p className="text-[12px] text-mute font-landing-sans mt-2">Lifetime spending on services</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink/[0.06] p-5">
          <p className="text-[13px] font-landing-sans text-mute mb-1">Promo credits</p>
          <p className="font-landing-display text-[28px] font-semibold text-ink">{formatCurrencyKES(promoBalance)}</p>
          <button onClick={() => setShowCards(true)} className="mt-3 text-[13px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">Manage cards</button>
        </div>
      </div>

      {/* Promo code */}
      <div className="rounded-2xl border border-ink/[0.06] bg-white p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 w-full">
          <p className="text-[14px] font-landing-sans font-semibold text-ink mb-1">Have a promo code?</p>
          <p className="text-[12px] text-mute font-landing-sans">Enter code to add credits to your wallet.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="PROMO123"
            className="rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[13.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors w-full sm:w-40"
          />
          <button onClick={applyPromo} className="rounded-full bg-forest-500 text-white px-5 py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors">Apply</button>
        </div>
      </div>

      {/* Payment history */}
      <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Payment history</h2>
      {loading ? (
        <div className="text-center py-8 text-mute text-sm">Loading…</div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-8 text-center">
          <p className="text-mute font-landing-sans text-sm mb-3">No payments yet.</p>
          <button onClick={() => setShowDeposit(true)} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-landing-sans font-semibold px-5 py-2.5 transition-colors">Make your first deposit</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="text-left text-mute border-b border-ink/[0.06]">
              <th className="font-landing-sans font-medium px-5 py-3">Date</th>
              <th className="font-landing-sans font-medium px-5 py-3">Method</th>
              <th className="font-landing-sans font-medium px-5 py-3">Amount</th>
              <th className="font-landing-sans font-medium px-5 py-3">Status</th>
              <th className="font-landing-sans font-medium px-5 py-3 text-right">Receipt</th>
            </tr></thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3.5 font-landing-sans text-ink/90">{p.created_at ? new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td className="px-5 py-3.5 font-landing-sans text-ink/90 capitalize">{p.payment_method || '—'}</td>
                  <td className="px-5 py-3.5 font-landing-sans font-medium text-ink/90">{formatCurrencyKES(p.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 font-landing-sans font-semibold text-xs ${p.status === 'completed' ? 'text-forest-600' : p.status === 'pending' ? 'text-clay-600' : 'text-red-600'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-500" />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {p.mpesa_receipt ? (
                      <span className="text-[11px] text-mute font-landing-sans">{p.mpesa_receipt}</span>
                    ) : (
                      <span className="text-[11px] text-mute font-landing-sans">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setShowDeposit(false)}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-landing-display text-[20px] font-medium text-ink">Deposit money</h3>
              <button onClick={() => setShowDeposit(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-[13px] text-mute font-landing-sans mb-1">Amount (KES)</label>
                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required min="1" className="w-full rounded-xl border border-ink/[0.07] px-4 py-3 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" placeholder="e.g. 2000" />
              </div>
              <div>
                <label className="block text-[13px] text-mute font-landing-sans mb-1">Payment method</label>
                <select value={depositMethod} onChange={(e) => setDepositMethod(e.target.value)} className="w-full rounded-xl border border-ink/[0.07] px-4 py-3 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors">
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              {depositMethod === 'mpesa' && (
                <div>
                  <label className="block text-[13px] text-mute font-landing-sans mb-1">Phone number</label>
                  <input type="tel" value={depositPhone} onChange={(e) => setDepositPhone(e.target.value)} className="w-full rounded-xl border border-ink/[0.07] px-4 py-3 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" placeholder="254712345678" />
                </div>
              )}
              <button type="submit" disabled={depositing} className="w-full rounded-full bg-forest-500 text-white py-3 text-[14px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors disabled:opacity-50">
                {depositing ? 'Processing…' : `Pay ${formatCurrencyKES(depositAmount || 0)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cards Modal */}
      {showCards && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setShowCards(false)}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-landing-display text-[20px] font-medium text-ink">Saved cards</h3>
              <button onClick={() => setShowCards(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {savedCards.length === 0 && <p className="text-mute text-sm">No saved cards.</p>}
              {savedCards.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-ink/[0.06] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-landing-sans font-semibold text-ink">**** **** **** {c.number.slice(-4)}</p>
                    <p className="text-[12px] text-mute font-landing-sans">{c.name} · {c.expiry}</p>
                  </div>
                  <button onClick={() => removeCard(c.id)} className="text-[12px] text-red-600 hover:text-red-700 font-landing-sans font-medium">Remove</button>
                </div>
              ))}
            </div>
            <div className="border-t border-ink/[0.06] pt-4">
              <p className="text-[13px] font-landing-sans font-semibold text-ink mb-2">Add new card</p>
              <div className="space-y-2">
                <input type="text" value={newCard.number} onChange={(e) => setNewCard({ ...newCard, number: e.target.value })} placeholder="Card number" className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[13px] font-landing-sans outline-none focus:border-forest-500 transition-colors" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })} placeholder="MM/YY" className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[13px] font-landing-sans outline-none focus:border-forest-500 transition-colors" />
                  <input type="text" value={newCard.cvv} onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })} placeholder="CVV" className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[13px] font-landing-sans outline-none focus:border-forest-500 transition-colors" />
                </div>
                <input type="text" value={newCard.name} onChange={(e) => setNewCard({ ...newCard, name: e.target.value })} placeholder="Name on card" className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[13px] font-landing-sans outline-none focus:border-forest-500 transition-colors" />
                <button onClick={addCard} className="w-full rounded-full bg-forest-500 text-white py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors">Save card</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
