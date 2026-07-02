import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, Modal, Input, Textarea, PrimaryBtn } from './shared';

// ─── Services Tab ─────────────────────────────────────────────────────────────
export function ServicesTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [busy, setBusy] = useState({});
  const [formBusy, setFormBusy] = useState(false);

  const reload = () => adminService.listCategories().then(setServices).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, ...args) => {
    const key = args.join('-');
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(...args); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try { await adminService.createService(form); setShowCreate(false); setForm({ name: '', description: '' }); reload(); }
    finally { setFormBusy(false); }
  };

  const openEdit = (s) => { setEditTarget(s); setEditForm({ name: s.name || '', description: s.description || '' }); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try { await adminService.editService(editTarget.id, editForm); setEditTarget(null); reload(); }
    finally { setFormBusy(false); }
  };

  return (
    <div>
      <SectionHeader
        title={`Services (${services.length})`}
        action={<button onClick={() => setShowCreate(true)} className="bg-forest-500 hover:bg-forest-600 text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2 rounded-xl transition-colors">+ Add Service</button>}
      />
      <Table headers={['Service', 'Description', 'Status', 'Actions']} loading={loading} empty={services.length === 0 ? 'No services yet.' : null}>
        {services.map(s => (
          <tr key={s.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{s.icon || '🔧'}</span>
                <span className="font-landing-sans font-medium text-ink/90">{s.name}</span>
              </div>
            </td>
            <td className="px-5 py-3.5 font-landing-sans text-mute max-w-[240px] truncate">{s.description || '—'}</td>
            <td className="px-5 py-3.5"><Badge label={s.is_active ? 'Active' : 'Hidden'} color={s.is_active ? 'green' : 'gray'} /></td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <ActionBtn label="Edit" variant="blue" onClick={() => openEdit(s)} />
                <ActionBtn label={s.is_active ? 'Hide' : 'Activate'} variant={s.is_active ? 'yellow' : 'green'} disabled={busy[`t${s.id}`]} onClick={() => act(id => adminService.updateService(id, { is_active: !s.is_active }), s.id)} />
                <ActionBtn label="Delete" variant="red" disabled={busy[`d${s.id}`]} onClick={() => { if (confirm('Delete service?')) act(adminService.deleteService, s.id); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Service">
        <form onSubmit={handleCreate}>
          <Input label="Service Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Creating…' : 'Create Service'}</PrimaryBtn>
        </form>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}>
        <form onSubmit={handleEdit}>
          <Input label="Service Name" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Saving…' : 'Save Changes'}</PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────
export function CategoriesTab() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', icon: '', description: '' });
  const [busy, setBusy] = useState({});
  const [formBusy, setFormBusy] = useState(false);

  const reload = () => adminService.listCategories().then(setCats).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, ...args) => {
    const key = args.join('-');
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(...args); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try { await adminService.createCategory(form); setShowCreate(false); setForm({ name: '', icon: '', description: '' }); reload(); }
    finally { setFormBusy(false); }
  };

  const openEdit = (c) => { setEditTarget(c); setEditForm({ name: c.name || '', icon: c.icon || '', description: c.description || '' }); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try { await adminService.editCategory(editTarget.id, editForm); setEditTarget(null); reload(); }
    finally { setFormBusy(false); }
  };

  return (
    <div>
      <SectionHeader
        title={`Categories (${cats.length})`}
        action={<button onClick={() => setShowCreate(true)} className="bg-forest-500 hover:bg-forest-600 text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2 rounded-xl transition-colors">+ Add Category</button>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading && <p className="col-span-4 text-center text-mute py-10 font-landing-sans text-sm">Loading…</p>}
        {!loading && cats.map(c => (
          <div key={c.id} className="rounded-2xl border border-ink/[0.06] bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon || '📂'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-landing-sans font-semibold text-ink/90 text-sm truncate">{c.name}</p>
                <Badge label={c.is_active ? 'Active' : 'Inactive'} color={c.is_active ? 'green' : 'gray'} />
              </div>
            </div>
            {c.description && <p className="text-[11.5px] text-mute font-landing-sans line-clamp-2">{c.description}</p>}
            <div className="flex gap-1.5 mt-auto flex-wrap">
              <ActionBtn label="Edit" variant="blue" onClick={() => openEdit(c)} />
              <ActionBtn label={c.is_active ? 'Hide' : 'Activate'} variant={c.is_active ? 'yellow' : 'green'} disabled={busy[`t${c.id}`]} onClick={() => act(id => adminService.updateCategory(id, { is_active: !c.is_active }), c.id)} />
              <ActionBtn label="Delete" variant="red" disabled={busy[`d${c.id}`]} onClick={() => { if (confirm('Delete category?')) act(adminService.deleteCategory, c.id); }} />
            </div>
          </div>
        ))}
        {!loading && cats.length === 0 && <p className="col-span-4 text-center text-mute py-10 font-landing-sans text-sm">No categories yet.</p>}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Category">
        <form onSubmit={handleCreate}>
          <Input label="Category Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Icon (emoji)" placeholder="e.g. 🔧" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Creating…' : 'Create Category'}</PrimaryBtn>
        </form>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}>
        <form onSubmit={handleEdit}>
          <Input label="Category Name" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Icon (emoji)" placeholder="e.g. 🔧" value={editForm.icon} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} />
          <Textarea label="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Saving…' : 'Save Changes'}</PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}
