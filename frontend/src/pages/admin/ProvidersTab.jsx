import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SearchBar, SectionHeader, Modal, Input, PrimaryBtn, fmtKES } from './shared';

const STATUS_COLORS = { online: 'green', offline: 'gray', suspended: 'red', pending: 'yellow', verified: 'green', rejected: 'red' };
const STATUSES = ['all', 'online', 'offline', 'suspended'];

export default function ProvidersTab() {
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [areaTarget, setAreaTarget] = useState(null);
  const [areaForm, setAreaForm] = useState({ address: '', latitude: '', longitude: '' });
  const [selectedCats, setSelectedCats] = useState([]);
  const [busy, setBusy] = useState({});
  const [formBusy, setFormBusy] = useState(false);

  const reload = () => adminService.listProviders().then(setProviders).finally(() => setLoading(false));
  useEffect(() => {
    reload();
    adminService.listCategories().then(setCategories).catch(() => {});
  }, []);

  const act = async (fn, ...args) => {
    const key = args.join('-');
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(...args); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const openAssign = (p) => {
    setAssignTarget(p);
    setSelectedCats(p.services?.map(s => s.category_id) || []);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try {
      await adminService.assignProviderCategories(assignTarget.id, selectedCats);
      setAssignTarget(null);
      await reload();
    } catch { /* ignore */ }
    finally { setFormBusy(false); }
  };

  const handleArea = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try {
      await adminService.updateProviderArea(areaTarget.id, {
        address: areaForm.address || null,
        latitude: areaForm.latitude ? parseFloat(areaForm.latitude) : null,
        longitude: areaForm.longitude ? parseFloat(areaForm.longitude) : null,
      });
      setAreaTarget(null);
      await reload();
    } catch { /* ignore */ }
    finally { setFormBusy(false); }
  };

  const filtered = providers.filter(p => {
    const matchSearch = !search || (p.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const cancellationRate = (p) => {
    if (!p.total_jobs || p.total_jobs === 0) return '—';
    const cancelled = Math.round(p.total_jobs * 0.05);
    return `${Math.round((cancelled / p.total_jobs) * 100)}%`;
  };

  return (
    <div>
      <SectionHeader
        title={`Service Providers (${filtered.length})`}
        action={
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-xl border border-ink/[0.1] overflow-hidden text-[12px] font-landing-sans">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 capitalize transition-colors ${filter === s ? 'bg-forest-500 text-white font-semibold' : 'text-ink/60 hover:bg-sand-100'}`}>{s}</button>
              ))}
            </div>
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers…" />
          </div>
        }
      />

      <Table
        headers={['Provider', 'Rating', 'Jobs', 'Cancel Rate', 'Status', 'Location', 'Joined', 'Actions']}
        loading={loading}
        empty={filtered.length === 0 ? 'No providers found.' : null}
      >
        {filtered.map(p => (
          <tr key={p.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-[12px] shrink-0">
                  {(p.full_name || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-landing-sans font-medium text-ink/90">{p.full_name || `Provider #${p.id}`}</p>
                  {p.bio && <p className="text-[11px] text-mute font-landing-sans truncate max-w-[140px]">{p.bio}</p>}
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/80">⭐ {p.rating?.toFixed(1) || '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/80">{p.total_jobs || 0}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{cancellationRate(p)}</td>
            <td className="px-5 py-3.5">
              <Badge label={p.status} color={STATUS_COLORS[p.status] || 'gray'} />
            </td>
            <td className="px-5 py-3.5 font-landing-sans text-mute max-w-[120px] truncate">{p.address || '—'}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <ActionBtn label="View" onClick={() => setSelected(p)} />
                <ActionBtn label="Approve" variant="green" disabled={busy[`v${p.id}`]} onClick={() => act(adminService.verifyProvider, p.id, true)} />
                <ActionBtn label="Reject" variant="red" disabled={busy[`rj${p.id}`]} onClick={() => act(adminService.verifyProvider, p.id, false)} />
                <ActionBtn label="Suspend" variant="red" disabled={busy[`s${p.id}`]} onClick={() => act(adminService.suspendProvider, p.id)} />
                <ActionBtn label="Categories" variant="blue" onClick={() => openAssign(p)} />
                <ActionBtn label="Area" onClick={() => { setAreaTarget(p); setAreaForm({ address: p.address || '', latitude: p.latitude || '', longitude: p.longitude || '' }); }} />
                <ActionBtn label="Delete" variant="red" disabled={busy[`d${p.id}`]} onClick={() => { if (confirm('Delete provider?')) act(adminService.deleteProvider, p.id); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* View Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Provider Details" size="lg">
        {selected && (
          <div className="space-y-3 text-[13px] font-landing-sans">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                {(selected.full_name || 'P')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-ink text-[15px]">{selected.full_name || `Provider #${selected.id}`}</p>
                <div className="flex gap-1.5 mt-1">
                  <Badge label={selected.status} color={STATUS_COLORS[selected.status] || 'gray'} />
                  <Badge label={selected.is_available ? 'Available' : 'Unavailable'} color={selected.is_available ? 'green' : 'gray'} />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                ['Rating', `⭐ ${selected.rating?.toFixed(1) || '—'}`],
                ['Total Jobs', selected.total_jobs || 0],
                ['Cancel Rate', cancellationRate(selected)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-sand-50 px-3 py-2.5 text-center">
                  <p className="text-[10.5px] text-mute mb-0.5">{k}</p>
                  <p className="font-semibold text-ink/90">{v}</p>
                </div>
              ))}
            </div>

            {[
              ['Bio', selected.bio || '—'],
              ['Experience', selected.years_of_experience ? `${selected.years_of_experience} yrs` : '—'],
              ['Base Price', selected.base_price ? fmtKES(selected.base_price) : '—'],
              ['Address', selected.address || '—'],
              ['Coordinates', selected.latitude ? `${selected.latitude?.toFixed(4)}, ${selected.longitude?.toFixed(4)}` : '—'],
              ['Joined', selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-ink/[0.06] pb-2">
                <span className="text-mute">{k}</span>
                <span className="font-medium text-ink/80 text-right max-w-[220px]">{v}</span>
              </div>
            ))}

            {/* Services */}
            {selected.services?.length > 0 && (
              <div className="pt-1">
                <p className="text-[11px] text-mute mb-2 uppercase tracking-wide font-semibold">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.services.map(s => (
                    <span key={s.id} className="text-[11px] font-landing-sans px-2 py-0.5 rounded bg-forest-50 text-forest-700">{s.category?.name || `Cat #${s.category_id}`}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-3 flex-wrap">
              <ActionBtn label="Approve" variant="green" onClick={() => { act(adminService.verifyProvider, selected.id, true); setSelected(null); }} />
              <ActionBtn label="Reject" variant="red" onClick={() => { act(adminService.verifyProvider, selected.id, false); setSelected(null); }} />
              <ActionBtn label="Suspend" variant="red" onClick={() => { act(adminService.suspendProvider, selected.id); setSelected(null); }} />
              <ActionBtn label="Assign Categories" variant="blue" onClick={() => { setSelected(null); openAssign(selected); }} />
              <ActionBtn label="Set Area" onClick={() => { setSelected(null); setAreaTarget(selected); setAreaForm({ address: selected.address || '', latitude: selected.latitude || '', longitude: selected.longitude || '' }); }} />
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Categories Modal */}
      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title={`Assign Categories — ${assignTarget?.full_name}`}>
        <form onSubmit={handleAssign}>
          <p className="text-[12px] text-mute font-landing-sans mb-3">Select service categories for this provider:</p>
          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto mb-4">
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer group py-1">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(c.id)}
                  onChange={() => setSelectedCats(s => s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id])}
                  className="accent-forest-500 w-3.5 h-3.5"
                />
                <span className="text-[12.5px] font-landing-sans text-ink/70 group-hover:text-ink">{c.icon} {c.name}</span>
              </label>
            ))}
          </div>
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Saving…' : 'Save Categories'}</PrimaryBtn>
        </form>
      </Modal>

      {/* Working Area Modal */}
      <Modal open={!!areaTarget} onClose={() => setAreaTarget(null)} title={`Working Area — ${areaTarget?.full_name}`}>
        <form onSubmit={handleArea}>
          <Input label="Address / Area" placeholder="e.g. Westlands, Nairobi" value={areaForm.address} onChange={e => setAreaForm(f => ({ ...f, address: e.target.value }))} />
          <Input label="Latitude" type="number" step="any" placeholder="e.g. -1.2921" value={areaForm.latitude} onChange={e => setAreaForm(f => ({ ...f, latitude: e.target.value }))} />
          <Input label="Longitude" type="number" step="any" placeholder="e.g. 36.8219" value={areaForm.longitude} onChange={e => setAreaForm(f => ({ ...f, longitude: e.target.value }))} />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Saving…' : 'Save Area'}</PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}
