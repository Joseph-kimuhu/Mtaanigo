import { useState } from 'react';

const faqs = [
  { q: 'How do I book a service?', a: 'Browse services, select a category, choose a provider, and confirm the booking. You can track your professional in real-time.' },
  { q: 'How are payments handled?', a: 'Payments are processed securely through M-Pesa or card. Funds are held safely until the job is completed.' },
  { q: 'Can I cancel a booking?', a: 'Yes, you can cancel up to 2 hours before the scheduled time without penalty. Late cancellations may incur a fee.' },
  { q: 'How do I become a service professional?', a: 'Click "Join as a professional" on the homepage, complete your profile, and submit required documents for verification.' },
  { q: 'Are service providers verified?', a: 'All providers undergo background checks and skill verification before joining the platform.' },
  { q: 'What if I am not satisfied with the service?', a: 'You can raise a complaint through the app. Our support team will review and help resolve the issue or process a refund.' },
];

export default function HelpTab() {
  const [expanded, setExpanded] = useState(null);
  const [issue, setIssue] = useState({ type: 'report', subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [refund, setRefund] = useState({ bookingId: '', reason: '' });
  const [refunding, setRefunding] = useState(false);

  const submitTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const existing = JSON.parse(localStorage.getItem('mtaanigo_tickets') || '[]');
      existing.unshift({ id: Date.now(), ...issue, status: 'open', created_at: new Date().toISOString() });
      localStorage.setItem('mtaanigo_tickets', JSON.stringify(existing));
      setIssue({ type: 'report', subject: '', description: '' });
      alert('Your request has been submitted. Our support team will contact you shortly.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    setRefunding(true);
    try {
      const existing = JSON.parse(localStorage.getItem('mtaanigo_refunds') || '[]');
      existing.unshift({ id: Date.now(), ...refund, status: 'pending', created_at: new Date().toISOString() });
      localStorage.setItem('mtaanigo_refunds', JSON.stringify(existing));
      setRefund({ bookingId: '', reason: '' });
      alert('Refund request submitted successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div>
      <h1 className="font-landing-display text-[26px] font-medium text-ink mb-6">Help & Support</h1>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button onClick={() => alert('Connecting to live chat…')} className="rounded-2xl border border-ink/[0.06] bg-white p-4 text-center hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 01-9 8.4A8.5 8.5 0 014 13a8.4 8.4 0 018.4-8.4 8.5 8.5 0 018.6 6.9z" /></svg>
          </div>
          <p className="text-[13px] font-landing-sans font-semibold text-ink">Live chat</p>
          <p className="text-[11px] text-mute font-landing-sans">Instant help</p>
        </button>
        <button onClick={() => alert('Dialing +254 700 000 000…')} className="rounded-2xl border border-ink/[0.06] bg-white p-4 text-center hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v-3.8a2 2 0 00-.6-1.5l-7.1-6.6a2 2 0 01-.5-1.8l.2-1.9a2 2 0 00-.4-1.7l-1.8-1.8a2 2 0 00-1.7-.4l-1.9.2a2 2 0 01-1.8-.5L2.1 5.4A2 2 0 00.6 6 .8.8 0 001 8.6l.2 1.9a2 2 0 01-.5 1.8L1.2 14a2 2 0 000 2.1l6.6 7.1a2 2 0 001.8.5l1.9-.2a2 2 0 011.8.5l6.6 7.1a2 2 0 001.8.5l1.9-.2a2 2 0 011.7.4l1.8 1.8a2 2 0 00.4 1.7l.2 1.9a2 2 0 01-.4 1.7l-1.8 1.8a2 2 0 00-.4 1.7z" /></svg>
          </div>
          <p className="text-[13px] font-landing-sans font-semibold text-ink">Call support</p>
          <p className="text-[11px] text-mute font-landing-sans">Mon-Fri 9-5</p>
        </button>
        <button onClick={() => setExpanded(expanded === 'report' ? null : 'report')} className="rounded-2xl border border-ink/[0.06] bg-white p-4 text-center hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <p className="text-[13px] font-landing-sans font-semibold text-ink">Report issue</p>
          <p className="text-[11px] text-mute font-landing-sans">Submit report</p>
        </button>
        <button onClick={() => setExpanded(expanded === 'refund' ? null : 'refund')} className="rounded-2xl border border-ink/[0.06] bg-white p-4 text-center hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
          </div>
          <p className="text-[13px] font-landing-sans font-semibold text-ink">Refund request</p>
          <p className="text-[11px] text-mute font-landing-sans">Request money back</p>
        </button>
      </div>

      {/* Report form */}
      {expanded === 'report' && (
        <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 mb-8">
          <h3 className="font-landing-display text-[18px] font-medium text-ink mb-4">Report an issue</h3>
          <form onSubmit={submitTicket} className="space-y-4">
            <div>
              <label className="block text-[13px] text-mute font-landing-sans mb-1">Issue type</label>
              <select value={issue.type} onChange={(e) => setIssue({ ...issue, type: e.target.value })} className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors">
                <option value="report">Bug / Technical issue</option>
                <option value="complaint">Complaint about provider</option>
                <option value="safety">Safety concern</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] text-mute font-landing-sans mb-1">Subject</label>
              <input type="text" value={issue.subject} onChange={(e) => setIssue({ ...issue, subject: e.target.value })} required className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[13px] text-mute font-landing-sans mb-1">Description</label>
              <textarea value={issue.description} onChange={(e) => setIssue({ ...issue, description: e.target.value })} required className="w-full rounded-xl border border-ink/[0.07] px-4 py-3 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors h-24 resize-none" />
            </div>
            <button type="submit" disabled={submitting} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white font-landing-sans font-semibold text-[13.5px] px-6 py-2.5 transition-colors disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        </div>
      )}

      {/* Refund form */}
      {expanded === 'refund' && (
        <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 mb-8">
          <h3 className="font-landing-display text-[18px] font-medium text-ink mb-4">Request a refund</h3>
          <form onSubmit={submitRefund} className="space-y-4">
            <div>
              <label className="block text-[13px] text-mute font-landing-sans mb-1">Booking ID</label>
              <input type="text" value={refund.bookingId} onChange={(e) => setRefund({ ...refund, bookingId: e.target.value })} placeholder="e.g. 42" className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[13px] text-mute font-landing-sans mb-1">Reason</label>
              <textarea value={refund.reason} onChange={(e) => setRefund({ ...refund, reason: e.target.value })} required className="w-full rounded-xl border border-ink/[0.07] px-4 py-3 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors h-24 resize-none" />
            </div>
            <button type="submit" disabled={refunding} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white font-landing-sans font-semibold text-[13.5px] px-6 py-2.5 transition-colors disabled:opacity-50">
              {refunding ? 'Submitting…' : 'Submit refund request'}
            </button>
          </form>
        </div>
      )}

      {/* FAQs */}
      <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Frequently asked questions</h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-ink/[0.06] bg-white overflow-hidden">
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between">
              <span className="text-[14px] font-landing-sans font-semibold text-ink">{faq.q}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {expanded === i && (
              <div className="px-5 pb-4 text-[13px] text-mute font-landing-sans leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
