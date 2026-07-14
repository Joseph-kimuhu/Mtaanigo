import { useEffect, useState } from 'react';
import { fundiService } from '../../services/fundiService';
import { Card, Spinner, Empty, Stars, Btn, Modal, Textarea } from './shared';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    fundiService.getReviews().then(setReviews).finally(() => setLoading(false));
  }, []);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl font-landing-sans text-[13px] shadow-lg">{toast}</div>}

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-5">
          <Card className="px-5 py-5 flex flex-col items-center justify-center text-center">
            <p className="font-landing-display text-[52px] font-semibold text-ink leading-none">{avg.toFixed(1)}</p>
            <Stars n={avg} size="lg" />
            <p className="text-[12px] text-mute font-landing-sans mt-2">{reviews.length} reviews</p>
          </Card>

          <Card className="px-5 py-5 sm:col-span-2">
            <p className="font-landing-sans font-semibold text-[13px] text-ink/80 mb-4">Rating Breakdown</p>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-[12px] font-landing-sans text-ink/70 w-10 shrink-0">{star} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-ink/[0.06] overflow-hidden">
                      <div className="h-2 rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11.5px] font-landing-sans text-mute w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0
        ? <Empty icon="⭐" text="No reviews yet. Complete jobs to receive ratings." />
        : (
          <div className="space-y-4">
            {reviews.map(r => (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-[13px] shrink-0">
                      {(r.customer_name || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-landing-sans font-semibold text-[13.5px] text-ink/90">{r.customer_name || 'Customer'}</p>
                      <div className="flex items-center gap-2">
                        <Stars n={r.rating} />
                        <span className="text-[11px] text-mute font-landing-sans">{r.category_name || ''}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11.5px] text-mute font-landing-sans shrink-0">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>

                {r.comment && (
                  <p className="text-[13px] font-landing-sans text-ink/70 leading-relaxed mb-3">"{r.comment}"</p>
                )}

                {r.address && (
                  <p className="text-[11.5px] text-mute font-landing-sans mb-3">📍 {r.address}</p>
                )}

                <div className="flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={() => { setReplyTarget(r); setReplyText(''); }}>💬 Reply</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => showToast('Report submitted')}>🚩 Report</Btn>
                </div>
              </Card>
            ))}
          </div>
        )
      }

      {/* Reply Modal */}
      <Modal open={!!replyTarget} onClose={() => setReplyTarget(null)} title={`Reply to ${replyTarget?.customer_name}`}>
        <div className="mb-4 px-4 py-3 rounded-xl bg-sand-50 border border-ink/[0.06] text-[12.5px] font-landing-sans text-ink/70 italic">
          "{replyTarget?.comment}"
        </div>
        <Textarea label="Your Reply" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Thank the customer or address their feedback…" />
        <Btn variant="primary" className="w-full" onClick={() => { showToast('Reply sent ✅'); setReplyTarget(null); }}>Send Reply</Btn>
      </Modal>
    </div>
  );
}
