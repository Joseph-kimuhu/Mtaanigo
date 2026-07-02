import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, SectionHeader } from './shared';

function Stars({ n }) {
  return <span className="text-amber-400">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

export default function ReviewsTab() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});

  const reload = () => adminService.listRatings().then(setRatings).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, id, key) => {
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(id); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const avg = ratings.length ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '—';
  const best = ratings.length ? ratings.reduce((a, b) => a.rating > b.rating ? a : b) : null;
  const worst = ratings.length ? ratings.reduce((a, b) => a.rating < b.rating ? a : b) : null;

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
          <p className="text-[12px] text-mute font-landing-sans mb-1">Average Rating</p>
          <p className="font-landing-display text-[22px] font-semibold text-ink">⭐ {avg}</p>
        </div>
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
          <p className="text-[12px] text-mute font-landing-sans mb-1">Most Rated Provider</p>
          <p className="font-landing-sans font-semibold text-ink text-sm">{best?.provider_name || '—'}</p>
          {best && <Stars n={best.rating} />}
        </div>
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
          <p className="text-[12px] text-mute font-landing-sans mb-1">Worst Rated Provider</p>
          <p className="font-landing-sans font-semibold text-ink text-sm">{worst?.provider_name || '—'}</p>
          {worst && <Stars n={worst.rating} />}
        </div>
      </div>

      <SectionHeader title={`Reviews (${ratings.length})`} />

      <Table
        headers={['Customer', 'Provider', 'Service', 'Rating', 'Comment', 'Date', 'Actions']}
        loading={loading}
        empty={ratings.length === 0 ? 'No reviews yet.' : null}
      >
        {ratings.map(r => (
          <tr key={r.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.customer_name || `User #${r.customer_id}`}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.provider_name || `Provider #${r.provider_id}`}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{r.category_name || '—'}</td>
            <td className="px-5 py-3.5"><Stars n={r.rating} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70 max-w-[200px] truncate">{r.comment || '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <ActionBtn label="Hide" variant="yellow" disabled={busy[`h${r.id}`]} onClick={() => act(adminService.hideRating, r.id, `h${r.id}`)} />
                <ActionBtn label="Delete" variant="red" disabled={busy[`d${r.id}`]} onClick={() => { if (confirm('Delete review?')) act(adminService.deleteRating, r.id, `d${r.id}`); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
