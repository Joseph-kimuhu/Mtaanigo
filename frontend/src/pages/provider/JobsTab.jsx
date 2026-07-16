import { useState } from 'react';
import { fundiService } from '../../services/fundiService';
import { fmtKES, Card, Empty, StatusPill, Stars, Modal, Btn } from './shared';

const TABS = [
  { key: 'upcoming',  label: 'Upcoming',  statuses: ['accepted'] },
  { key: 'ongoing',   label: 'Ongoing',   statuses: ['in_progress'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled', 'disputed'] },
];

function downloadReceipt(r) {
  const lines = [
    'MtaaniGo — Job Receipt',
    '─────────────────────────────',
    `Job ID:       #${r.id}`,
    `Service:      ${r.category?.name || r.description}`,
    `Customer:     ${r.customer?.full_name || '—'}`,
    `Address:      ${r.address || '—'}`,
    `Amount:       ${fmtKES(r.final_price || r.price_offered)}`,
    `Commission:   ${fmtKES((r.final_price || r.price_offered || 0) * 0.15)}`,
    `Net Earned:   ${fmtKES((r.final_price || r.price_offered || 0) * 0.85)}`,
    `Date:         ${new Date(r.created_at).toLocaleString()}`,
    '─────────────────────────────',
    'Thank you for using MtaaniGo!',
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }));
  a.download = `receipt-${r.id}.txt`;
  a.click();
}

export default function JobsTab({ requests, onRefresh }) {
  const [tab, setTab] = useState('upcoming');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const act = async (fn, id, key) => {
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(id); showToast('Done!'); onRefresh(); }
    catch (e) { showToast(e?.response?.data?.detail || 'Action failed'); }
    finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const updateStatus = async (id, status) => {
    setBusy(b => ({ ...b, [status + id]: true }));
    try {
      await requestService.updateRequest(id, { status });
      showToast('Done!');
      onRefresh();
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Action failed');
    } finally {
      setBusy(b => ({ ...b, [status + id]: false }));
    }
  };

  const currentStatuses = TABS.find(t => t.key === tab)?.statuses || [];
  const filtered = requests.filter(r => currentStatuses.includes(r.status));

  const tabCount = (key) => {
    const statuses = TABS.find(t => t.key === key)?.statuses || [];
    return requests.filter(r => statuses.includes(r.status)).length;
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl font-landing-sans text-[13px] shadow-lg">{toast}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-[12.5px] font-landing-sans font-semibold transition-colors ${tab === t.key ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>
            {t.label} {tabCount(t.key) > 0 && <span className="ml-1 opacity-70">({tabCount(t.key)})</span>}
          </button>
        ))}
      </div>

      {/* Job cards */}
      {filtered.length === 0
        ? <Empty icon={tab === 'upcoming' ? '📅' : tab === 'ongoing' ? '⚙️' : tab === 'completed' ? '✅' : '❌'} text={`No ${tab} jobs`} />
        : (
          <div className="space-y-4">
            {filtered.map(r => (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusPill status={r.status} />
                      {r.category?.name && <span className="text-[11px] font-landing-sans text-mute">{r.category.name}</span>}
                    </div>
                    <h3 className="font-landing-sans font-bold text-[14.5px] text-ink leading-snug">{r.description}</h3>
                    <p className="text-[12px] text-mute font-landing-sans mt-1">
                      {r.customer?.full_name || 'Customer'} · {r.address || 'Nairobi'} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-landing-display text-[17px] font-semibold text-forest-600">{fmtKES(r.final_price || r.price_offered)}</p>
                    {r.status === 'completed' && (
                      <p className="text-[11px] text-mute font-landing-sans">Net: {fmtKES((r.final_price || r.price_offered || 0) * 0.85)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Btn variant="outline" size="sm" onClick={() => setSelected(r)}>View</Btn>

                  {r.status === 'accepted' && (
                    <>
                      {r.address && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`} target="_blank" rel="noopener noreferrer">
                          <Btn variant="outline" size="sm">🗺️ Navigate</Btn>
                        </a>
                      )}
                      {r.customer?.phone && (
                        <a href={`tel:${r.customer.phone}`}><Btn variant="outline" size="sm">📞 Call</Btn></a>
                      )}
                      <Btn variant="primary" size="sm" disabled={busy[`on_the_way${r.id}`]} onClick={() => updateStatus(r.id, 'on_the_way')}>
                        🚗 On the way
                      </Btn>
                      <Btn variant="red" size="sm" disabled={busy[`x${r.id}`]} onClick={() => act(fundiService.declineRequest, r.id, `x${r.id}`)}>
                        Cancel
                      </Btn>
                    </>
                  )}

                  {r.status === 'on_the_way' && (
                    <Btn variant="primary" size="sm" disabled={busy[`arrived${r.id}`]} onClick={() => updateStatus(r.id, 'arrived')}>
                      📍 I've arrived
                    </Btn>
                  )}

                  {r.status === 'arrived' && (
                    <Btn variant="primary" size="sm" disabled={busy[`in_progress${r.id}`]} onClick={() => updateStatus(r.id, 'in_progress')}>
                      🔧 Start job
                    </Btn>
                  )}

                  {(r.status === 'in_progress') && (
                    <>
                      {r.address && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`} target="_blank" rel="noopener noreferrer">
                          <Btn variant="outline" size="sm">🗺️ Navigate</Btn>
                        </a>
                      )}
                      {r.customer?.phone && (
                        <a href={`tel:${r.customer.phone}`}><Btn variant="outline" size="sm">📞 Call</Btn></a>
                      )}
                      <Btn variant="primary" size="sm" disabled={busy[`c${r.id}`]} onClick={() => act(fundiService.completeRequest, r.id, `c${r.id}`)}>
                        ✅ Complete Job
                      </Btn>
                    </>
                  )}

                  {r.status === 'completed' && (
                    <Btn variant="outline" size="sm" onClick={() => downloadReceipt(r)}>🧾 Receipt</Btn>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      }

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Job #${selected?.id}`} size="lg">
        {selected && (
          <div className="space-y-3 text-[13px] font-landing-sans">
            <StatusPill status={selected.status} />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl bg-sand-50 px-4 py-3">
                <p className="text-[10.5px] text-mute uppercase tracking-wide font-semibold mb-1">Customer</p>
                <p className="font-semibold text-ink/90">{selected.customer?.full_name || '—'}</p>
                <p className="text-[11px] text-mute">{selected.customer?.phone || '—'}</p>
              </div>
              <div className="rounded-xl bg-sand-50 px-4 py-3">
                <p className="text-[10.5px] text-mute uppercase tracking-wide font-semibold mb-1">Earnings</p>
                <p className="font-semibold text-forest-600 text-[16px]">{fmtKES(selected.final_price || selected.price_offered)}</p>
                <p className="text-[11px] text-mute">Net: {fmtKES((selected.final_price || selected.price_offered || 0) * 0.85)}</p>
              </div>
            </div>
            {[
              ['Service', selected.category?.name || '—'],
              ['Address', selected.address || '—'],
              ['Description', selected.description || '—'],
              ['Date', new Date(selected.created_at).toLocaleString()],
              ['Completed', selected.completed_at ? new Date(selected.completed_at).toLocaleString() : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-ink/[0.06] pb-2">
                <span className="text-mute">{k}</span>
                <span className="font-medium text-ink/80 text-right max-w-[220px]">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-3 flex-wrap">
              {selected.status === 'completed' && <Btn variant="outline" onClick={() => downloadReceipt(selected)}>🧾 Download Receipt</Btn>}
              {(selected.status === 'accepted' || selected.status === 'in_progress') && (
                <Btn variant="primary" onClick={() => { act(fundiService.completeRequest, selected.id, `c${selected.id}`); setSelected(null); }}>✅ Complete Job</Btn>
              )}
              {selected.address && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noopener noreferrer">
                  <Btn variant="outline">🗺️ Navigate</Btn>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
