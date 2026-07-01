import { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';

export default function ReviewsTab() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerService.getMyRequests();
        const completed = data.filter((r) => r.status === 'completed');
        setReviews(completed.map((r) => ({
          id: r.id,
          provider_id: r.provider_id,
          request_id: r.id,
          provider_name: r.provider?.full_name || 'Professional',
          category: r.category?.name || 'Service',
          rating: 5,
          comment: '',
          created_at: r.completed_at || r.created_at,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await customerService.createRating({
        provider_id: selectedRequest.provider_id,
        request_id: selectedRequest.id,
        rating,
        comment,
      });
      setReviews((prev) => prev.map((r) => r.request_id === selectedRequest.id ? { ...r, rating, comment } : r));
      setSelectedRequest(null);
      setComment('');
      setRating(5);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-landing-display text-[26px] font-medium text-ink mb-2">Reviews</h1>
      <p className="text-mute text-[14px] font-landing-sans mb-6">Rate and review your service experiences.</p>

      {loading ? (
        <div className="text-center py-12 text-mute text-sm">Loading…</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
          <p className="text-mute font-landing-sans text-sm mb-3">No completed services to review yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-ink/[0.06] bg-white p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[14px] font-landing-sans font-semibold text-ink">{r.provider_name}</p>
                  <p className="text-[12px] text-mute font-landing-sans">{r.category}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= r.rating ? '#D97706' : 'none'} stroke="#D97706" strokeWidth="1.5"><path d="M12 17.3L6.2 21l1.6-6.9-5.3-4.6 7-.6L12 2.5l2.5 6.4 7 .6-5.3 4.6L17.8 21z" /></svg>
                  ))}
                </div>
              </div>
              {r.comment ? (
                <p className="text-[13px] text-mute font-landing-sans leading-relaxed">{r.comment}</p>
              ) : (
                <button onClick={() => setSelectedRequest({ provider_id: r.provider_id, id: r.request_id })} className="text-[13px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">Add review</button>
              )}
              <p className="text-[11px] text-mute font-landing-sans mt-2">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <form onSubmit={submitReview} className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-landing-display text-[20px] font-medium text-ink">Leave a review</h3>
              <button type="button" onClick={() => setSelectedRequest(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= rating ? '#D97706' : 'none'} stroke="#D97706" strokeWidth="1.5"><path d="M12 17.3L6.2 21l1.6-6.9-5.3-4.6 7-.6L12 2.5l2.5 6.4 7 .6-5.3 4.6L17.8 21z" /></svg>
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
              className="w-full rounded-xl border border-ink/[0.07] px-4 py-3 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors h-24 resize-none mb-4"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] text-mute font-landing-sans cursor-pointer">
                <input type="file" accept="image/*" className="hidden" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 16l5-5 4 4 3-3 5 5" /></svg>
                Add photo
              </label>
              <button type="submit" disabled={submitting} className="flex-1 rounded-full bg-forest-500 text-white py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
