import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, SearchBar, Modal, Input, Textarea, PrimaryBtn } from './shared';

const EMPTY_FORM = { name: '', description: '', license_number: '', manager_id: '' };

export default function CompaniesTab() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  // Per-button loading
  const [busy, setBusy] = useState({});
  const [formBusy, setFormBusy] = useState(false);
  const [error, setError] = useState('');

  const reload = () =>
    adminService.listCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  // Generic action helper
  const act = async (fn, id, key) => {
    setBusy(b => ({ ...b, [key]: true }));
    try {
      await fn(id);
      await reload();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Action failed');
    } finally {
      setBusy(b => ({ ...b, [key]: false }));
    }
  };

  // Create
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    setError('');
    try {
      await adminService.createCompany({
        name: createForm.name,
        description: createForm.description || null,
        license_number: createForm.license_number || null,
        manager_id: createForm.manager_id ? parseInt(createForm.manager_id) : null,
      });
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      await reload();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to create company');
    } finally {
      setFormBusy(false);
    }
  };

  // Edit
  const openEdit = (c) => {
    setEditTarget(c);
    setEditForm({
      name: c.name || '',
      description: c.description || '',
      license_number: c.license_number || '',
      manager_id: c.manager_id || '',
    });
    setError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    setError('');
    try {
      await adminService.updateCompany(editTarget.id, {
        name: editForm.name || null,
        description: editForm.description || null,
        license_number: editForm.license_number || null,
        manager_id: editForm.manager_id ? parseInt(editForm.manager_id) : null,
      });
      setEditTarget(null);
      await reload();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to update company');
    } finally {
      setFormBusy(false);
    }
  };

  // Filtered list
  const filtered = companies.filter(c => {
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.license_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'verified' && c.is_verified) ||
      (filterStatus === 'unverified' && !c.is_verified) ||
      (filterStatus === 'active' && c.is_active) ||
      (filterStatus === 'suspended' && !c.is_active);
    return matchSearch && matchStatus;
  });

  const FILTERS = ['all', 'verified', 'unverified', 'active', 'suspended'];

  return (
    <div>
      {/* Header */}
      <SectionHeader
        title={`Companies (${filtered.length})`}
        action={
          <div className="flex items-center gap-3">
            <SearchBar
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or license…"
            />
            <button
              onClick={() => { setShowCreate(true); setCreateForm(EMPTY_FORM); setError(''); }}
              className="bg-forest-500 hover:bg-forest-600 text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              + Add Company
            </button>
          </div>
        }
      />

      {/* Status filter pills */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium capitalize transition-colors ${
              filterStatus === f
                ? 'bg-forest-500 text-white'
                : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table
        headers={['Company', 'License', 'Manager', 'Verified', 'Status', 'Joined', 'Actions']}
        loading={loading}
        empty={filtered.length === 0 ? 'No companies found.' : null}
      >
        {filtered.map(c => (
          <tr key={c.id} className="hover:bg-sand-50 transition-colors">
            {/* Company name + avatar */}
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[13px] shrink-0">
                  {(c.name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-landing-sans font-semibold text-ink/90 text-[13px]">{c.name}</p>
                  {c.description && (
                    <p className="text-[11px] text-mute font-landing-sans truncate max-w-[160px]">{c.description}</p>
                  )}
                </div>
              </div>
            </td>

            <td className="px-5 py-3.5 font-landing-sans text-mute text-[13px]">
              {c.license_number || <span className="text-ink/30">—</span>}
            </td>

            <td className="px-5 py-3.5 font-landing-sans text-ink/70 text-[13px]">
              {c.manager?.full_name || <span className="text-ink/30">—</span>}
            </td>

            <td className="px-5 py-3.5">
              <Badge
                label={c.is_verified ? 'Verified' : 'Unverified'}
                color={c.is_verified ? 'green' : 'yellow'}
              />
            </td>

            <td className="px-5 py-3.5">
              <Badge
                label={c.is_active ? 'Active' : 'Suspended'}
                color={c.is_active ? 'green' : 'red'}
              />
            </td>

            <td className="px-5 py-3.5 font-landing-sans text-mute text-[13px] whitespace-nowrap">
              {new Date(c.created_at).toLocaleDateString()}
            </td>

            {/* Action buttons */}
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <ActionBtn label="View" onClick={() => setViewTarget(c)} />
                <ActionBtn label="Edit" variant="blue" onClick={() => openEdit(c)} />
                {!c.is_verified && (
                  <ActionBtn
                    label="Approve"
                    variant="green"
                    disabled={busy[`approve${c.id}`]}
                    onClick={() => act(adminService.approveCompany, c.id, `approve${c.id}`)}
                  />
                )}
                {c.is_active ? (
                  <ActionBtn
                    label="Suspend"
                    variant="red"
                    disabled={busy[`suspend${c.id}`]}
                    onClick={() => act(adminService.suspendCompany, c.id, `suspend${c.id}`)}
                  />
                ) : (
                  <ActionBtn
                    label="Activate"
                    variant="green"
                    disabled={busy[`activate${c.id}`]}
                    onClick={() => act(adminService.activateCompany, c.id, `activate${c.id}`)}
                  />
                )}
                <ActionBtn
                  label="Delete"
                  variant="red"
                  disabled={busy[`delete${c.id}`]}
                  onClick={() => {
                    if (confirm(`Delete "${c.name}"? This cannot be undone.`))
                      act(adminService.deleteCompany, c.id, `delete${c.id}`);
                  }}
                />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* ── VIEW MODAL ─────────────────────────────────────────────────────── */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Company Details">
        {viewTarget && (
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl shrink-0">
                {viewTarget.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-landing-sans font-semibold text-ink text-[15px]">{viewTarget.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge label={viewTarget.is_verified ? 'Verified' : 'Unverified'} color={viewTarget.is_verified ? 'green' : 'yellow'} />
                  <Badge label={viewTarget.is_active ? 'Active' : 'Suspended'} color={viewTarget.is_active ? 'green' : 'red'} />
                </div>
              </div>
            </div>

            {/* Details */}
            {[
              ['License Number', viewTarget.license_number || '—'],
              ['Description', viewTarget.description || '—'],
              ['Manager', viewTarget.manager?.full_name || '—'],
              ['Created', new Date(viewTarget.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-ink/[0.06] text-[13px] font-landing-sans">
                <span className="text-mute">{k}</span>
                <span className="font-medium text-ink/80 text-right max-w-[220px]">{v}</span>
              </div>
            ))}

            {/* Quick actions inside modal */}
            <div className="flex gap-2 pt-4 flex-wrap">
              <ActionBtn
                label="Edit"
                variant="blue"
                onClick={() => { setViewTarget(null); openEdit(viewTarget); }}
              />
              {!viewTarget.is_verified && (
                <ActionBtn
                  label="Approve"
                  variant="green"
                  disabled={busy[`approve${viewTarget.id}`]}
                  onClick={() => { act(adminService.approveCompany, viewTarget.id, `approve${viewTarget.id}`); setViewTarget(null); }}
                />
              )}
              {viewTarget.is_active ? (
                <ActionBtn
                  label="Suspend"
                  variant="red"
                  disabled={busy[`suspend${viewTarget.id}`]}
                  onClick={() => { act(adminService.suspendCompany, viewTarget.id, `suspend${viewTarget.id}`); setViewTarget(null); }}
                />
              ) : (
                <ActionBtn
                  label="Activate"
                  variant="green"
                  disabled={busy[`activate${viewTarget.id}`]}
                  onClick={() => { act(adminService.activateCompany, viewTarget.id, `activate${viewTarget.id}`); setViewTarget(null); }}
                />
              )}
              <ActionBtn
                label="Delete"
                variant="red"
                onClick={() => {
                  if (confirm(`Delete "${viewTarget.name}"?`)) {
                    act(adminService.deleteCompany, viewTarget.id, `delete${viewTarget.id}`);
                    setViewTarget(null);
                  }
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── CREATE MODAL ───────────────────────────────────────────────────── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Company">
        <form onSubmit={handleCreate}>
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12.5px] font-landing-sans text-red-700">
              {error}
            </div>
          )}
          <Input
            label="Company Name *"
            required
            placeholder="e.g. CleanPro Ltd"
            value={createForm.name}
            onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="License Number"
            placeholder="e.g. BN/2024/001234"
            value={createForm.license_number}
            onChange={e => setCreateForm(f => ({ ...f, license_number: e.target.value }))}
          />
          <Input
            label="Description"
            placeholder="Brief description of the company"
            value={createForm.description}
            onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Manager User ID"
            type="number"
            placeholder="Optional — enter user ID"
            value={createForm.manager_id}
            onChange={e => setCreateForm(f => ({ ...f, manager_id: e.target.value }))}
          />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">
            {formBusy ? 'Creating…' : 'Create Company'}
          </PrimaryBtn>
        </form>
      </Modal>

      {/* ── EDIT MODAL ─────────────────────────────────────────────────────── */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}>
        <form onSubmit={handleEdit}>
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12.5px] font-landing-sans text-red-700">
              {error}
            </div>
          )}
          <Input
            label="Company Name"
            value={editForm.name}
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="License Number"
            value={editForm.license_number}
            onChange={e => setEditForm(f => ({ ...f, license_number: e.target.value }))}
          />
          <Input
            label="Description"
            value={editForm.description}
            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Manager User ID"
            type="number"
            value={editForm.manager_id}
            onChange={e => setEditForm(f => ({ ...f, manager_id: e.target.value }))}
          />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">
            {formBusy ? 'Saving…' : 'Save Changes'}
          </PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}
