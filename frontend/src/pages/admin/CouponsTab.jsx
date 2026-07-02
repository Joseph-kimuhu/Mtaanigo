import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, Modal, Input, PrimaryBtn } from './shared';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', discount_percent: '', expiry_date: '', max_uses: '', min_amount: '' });
  const [busy, setBusy] = useState({});

  const reload = () => adminService.listCoupons().then(setCoupons).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, ...args) => {
    const key = args.join('-');
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(...args); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await adminService.createCoupon({
      code: form.code,
      discount_percent: parseFloat(form.discount_percent),
      expiry_date: form.expiry_date || null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      min_amount: form.min_amount ? parseFloat(form.min_amount) : null,
    });
    setShowCreate(false);
    setForm({ code: '', discount_percent: '', expiry_date: '', max_uses: '', min_amount: '' });
    reload();
  };

  return (
    <div>
      <SectionHeader
        title={`Coupons (${coupons.length})`}
        action={<button onClick={() => setShowCreate(true)} className="bg-forest-500 hover:bg-forest-600 text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2 rounded-xl transition-colors">+ Create Coupon</button>}
      />

      <Table
        headers={['Code', 'Discount', 'Min Amount', 'Max Uses', 'Expiry', 'Status', 'Actions']}
        loading={loading}
        empty={coupons.length === 0 ? 'No coupons yet.' : null}
      >
        {coupons.map(c => (
          <tr key={c.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-mono font-semibold text-ink/90">{c.code}</td>
            <td className="px-5 py-3.5 font-landing-sans font-semibold text-forest-600">{c.discount_percent}%</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{c.min_amount ? `KSh ${c.min_amount}` : '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{c.max_uses || '∞'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}</td>
            <td className="px-5 py-3.5"><Badge label={c.is_active ? 'Active' : 'Disabled'} color={c.is_active ? 'green' : 'gray'} /></td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <ActionBtn label={c.is_active ? 'Disable' : 'Enable'} variant={c.is_active ? 'yellow' : 'green'} disabled={busy[`t${c.id}`]} onClick={() => act(id => adminService.updateCoupon(id, { is_active: !c.is_active }), c.id)} />
                <ActionBtn label="Delete" variant="red" disabled={busy[`d${c.id}`]} onClick={() => { if (confirm('Delete coupon?')) act(adminService.deleteCoupon, c.id); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Coupon">
        <form onSubmit={handleCreate}>
          <Input label="Coupon Code" required placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          <Input label="Discount %" required type="number" min="1" max="100" placeholder="e.g. 20" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} />
          <Input label="Minimum Amount (KSh)" type="number" placeholder="e.g. 500" value={form.min_amount} onChange={e => setForm(f => ({ ...f, min_amount: e.target.value }))} />
          <Input label="Maximum Uses" type="number" placeholder="Leave blank for unlimited" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} />
          <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
          <PrimaryBtn type="submit" className="w-full">Create Coupon</PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}
