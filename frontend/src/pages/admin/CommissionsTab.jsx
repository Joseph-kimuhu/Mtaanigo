import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { SectionHeader, ActionBtn } from './shared';

export default function CommissionsTab() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [busy, setBusy] = useState({});

  const reload = () => adminService.getCommissions().then(setCommissions).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const handleSave = async (catId) => {
    const val = parseFloat(editing[catId]);
    if (isNaN(val) || val < 0 || val > 100) return alert('Enter a value between 0 and 100');
    setBusy(b => ({ ...b, [catId]: true }));
    try {
      await adminService.updateCommission(catId, val);
      setEditing(e => { const n = { ...e }; delete n[catId]; return n; });
      await reload();
    } finally {
      setBusy(b => ({ ...b, [catId]: false }));
    }
  };

  return (
    <div>
      <SectionHeader title="Commission Rates" />
      {loading ? (
        <p className="text-mute font-landing-sans text-sm py-10 text-center">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commissions.map(c => (
            <div key={c.category_id} className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-landing-sans font-semibold text-ink/90">{c.category_name}</p>
                <span className={`text-[11px] font-landing-sans font-semibold px-2 py-0.5 rounded ${c.is_active ? 'bg-forest-50 text-forest-700' : 'bg-ink/[0.06] text-mute'}`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editing[c.category_id] !== undefined ? editing[c.category_id] : c.commission_percent}
                    onChange={e => setEditing(ed => ({ ...ed, [c.category_id]: e.target.value }))}
                    className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/40 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mute text-[12px] font-landing-sans">%</span>
                </div>
                {editing[c.category_id] !== undefined && (
                  <ActionBtn label="Save" variant="green" disabled={busy[c.category_id]} onClick={() => handleSave(c.category_id)} />
                )}
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-forest-50">
                <div className="h-1.5 rounded-full bg-forest-500 transition-all" style={{ width: `${c.commission_percent}%` }} />
              </div>
            </div>
          ))}
          {commissions.length === 0 && <p className="col-span-3 text-center text-mute font-landing-sans text-sm py-10">No categories found.</p>}
        </div>
      )}
    </div>
  );
}
