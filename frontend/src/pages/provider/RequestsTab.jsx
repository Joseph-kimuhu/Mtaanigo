import { useState } from 'react';
import { fundiService } from '../../services/fundiService';
import { fmtKES, Card, Empty, StatusPill, Modal, Btn } from './shared';

function RequestCard({ req, onAccept, onDecline, onView, busy }) {
  const dist = req.latitude ? `~${(Math.random() * 4 + 0.5).toFixed(1)} km` : 'Nearby';
  const eta  = `${Math.round(Math.random() * 15 + 5)} min`;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusPill status={req.status} />
            <span className="text-[11px] text-mute font-landing-sans">{new Date(req.created_at).toLocaleString()}</span>
          </div>
          <h3 className="font-landing-sans font-bold text-[15px] text-ink leading-snug">{req.description}</h3>
        </div>
        <div className="text-right shrink-0">
          <p className="font-landing-display text-[18px] font-semibold text-forest-600">{fmtKES(req.price_offered)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-[12.5px] font-landing-sans">
        <div className="flex items-center gap-1.5 text-ink/70">
          <span>👤</span><span>{req.customer?.full_name || 'Customer'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink/70">
          <span>📍</span><span className="truncate">{req.address || 'Nairobi'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink/70">
          <span>📏</span><span>{dist}</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink/70">
          <span>⏱️</span><span>{eta} away</span>
        </div>
      </div>

      {req.description && (
        <div className="mb-4 px-3 py-2.5 rounded-xl bg-sand-50 text-[12.5px] font-landing-sans text-ink/70 italic">
          "{req.description}"
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {req.status === 'pending' && (
          <>
            <Btn variant="primary" size="sm" disabled={busy} onClick={() => onAccept(req.id)}>✅ Accept</Btn>
            <Btn variant="red" size="sm" disabled={busy} onClick={() => onDecline(req.id)}>❌ Decline</Btn>
          </>
        )}
        <Btn variant="outline" size="sm" onClick={() => onView(req)}>👀 Details</Btn>
        {req.customer?.phone && (
          <a href={`tel:${req.customer.phone}`} className="inline-flex items-center gap-1.5 text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-xl border border-ink/[0.15] bg-white hover:bg-sand-100 text-ink/80">
            📞 Call
          </a>
        )}
        {req.address && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-xl border border-ink/[0.15] bg-white hover:bg-sand-100 text-ink/80">
            🗺️ Map
          </a>
        )}
      </div>
    </Card>
  );
}

export default function RequestsTab({ requests, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleAccept = async (id) => {
    setBusy(true);
    try { await fundiService.acceptRequest(id); showToast('Job accepted! 🎉'); onRefresh(); }
    catch (e) { showToast(e?.response?.data?.detail || 'Failed to accept'); }
    finally { setBusy(false); }
  };

  const handleDecline = async (id) => {
    setBusy(true);
    try { await fundiService.declineRequest(id); showToast('Request declined'); onRefresh(); }
    catch (e) { showToast(e?.response?.data?.detail || 'Failed to decline'); }
    finally { setBusy(false); }
  };

  const pending   = requests.filter(r => r.status === 'pending');
  const accepted  = requests.filter(r => r.status === 'accepted' || r.status === 'in_progress');

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl font-landing-sans text-[13px] shadow-lg">
          {toast}
        </div>
      )}

      {/* New requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-landing-sans font-bold text-[16px] text-ink">
            New Requests <span className="ml-2 text-[12px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{pending.length}</span>
          </h2>
          <Btn variant="ghost" size="sm" onClick={onRefresh}>↻ Refresh</Btn>
        </div>
        {pending.length === 0
          ? <Empty icon="📥" text="No new job requests right now. Stay online to receive jobs." />
          : <div className="space-y-4">{pending.map(r => <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} onView={setSelected} busy={busy} />)}</div>
        }
      </div>

      {/* Accepted / In Progress */}
      {accepted.length > 0 && (
        <div>
          <h2 className="font-landing-sans font-bold text-[16px] text-ink mb-4">In Progress</h2>
          <div className="space-y-4">
            {accepted.map(r => <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} onView={setSelected} busy={busy} />)}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Request #${selected?.id}`} size="lg">
        {selected && (
          <div className="space-y-3 text-[13px] font-landing-sans">
            <StatusPill status={selected.status} />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl bg-sand-50 px-4 py-3">
                <p className="text-[10.5px] text-mute uppercase tracking-wide font-semibold mb-1">Customer</p>
                <p className="font-semibold text-ink/90">{selected.customer?.full_name || 'Customer'}</p>
                <p className="text-[11px] text-mute">{selected.customer?.phone || '—'}</p>
              </div>
              <div className="rounded-xl bg-sand-50 px-4 py-3">
                <p className="text-[10.5px] text-mute uppercase tracking-wide font-semibold mb-1">Budget</p>
                <p className="font-semibold text-forest-600 text-[16px]">{fmtKES(selected.price_offered)}</p>
              </div>
            </div>
            {[
              ['Service', selected.category?.name || '—'],
              ['Address', selected.address || '—'],
              ['Description', selected.description || '—'],
              ['Date', new Date(selected.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-ink/[0.06] pb-2">
                <span className="text-mute">{k}</span>
                <span className="font-medium text-ink/80 text-right max-w-[220px]">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-3 flex-wrap">
              {selected.status === 'pending' && (
                <>
                  <Btn variant="primary" onClick={() => { handleAccept(selected.id); setSelected(null); }}>✅ Accept Job</Btn>
                  <Btn variant="red" onClick={() => { handleDecline(selected.id); setSelected(null); }}>❌ Decline</Btn>
                </>
              )}
              {selected.address && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noopener noreferrer">
                  <Btn variant="outline">🗺️ Open in Maps</Btn>
                </a>
              )}
              {selected.customer?.phone && (
                <a href={`tel:${selected.customer.phone}`}><Btn variant="outline">📞 Call Customer</Btn></a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
