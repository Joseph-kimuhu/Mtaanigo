import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { SectionHeader, Modal, Input, PrimaryBtn, ActionBtn, Badge } from './shared';

const ALL_PERMISSIONS = [
  'view_dashboard', 'manage_users', 'manage_providers', 'manage_companies',
  'manage_bookings', 'manage_payments', 'manage_disputes', 'manage_reviews',
  'manage_coupons', 'manage_announcements', 'manage_reports', 'manage_settings',
  'manage_roles', 'view_audit_logs', 'manage_fraud',
];

const ROLE_COLORS = { super_admin: 'purple', support: 'blue', finance: 'green', content_manager: 'yellow' };

export default function RolesTab() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', key: '', permissions: [] });
  const [busy, setBusy] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.listRoles();
      setRoles(data.map(r => ({
        id: r.id,
        name: r.name,
        key: r.key,
        permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions || '[]') : (r.permissions || []),
        users: 0,
      })));
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePerm = (perm) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(b => ({ ...b, submit: true }));
    try {
      const payload = editing
        ? { name: form.name, permissions: JSON.stringify(form.permissions) }
        : { name: form.name, key: form.key, permissions: JSON.stringify(form.permissions) };
      if (editing) {
        const updated = await adminService.updateRole(editing.id, payload);
        const saved = {
          id: updated.id,
          name: updated.name,
          key: updated.key,
          permissions: typeof updated.permissions === 'string' ? JSON.parse(updated.permissions || '[]') : (updated.permissions || []),
          users: editing.users,
        };
        setRoles(r => r.map(role => role.id === editing.id ? saved : role));
        setEditing(null);
      } else {
        const created = await adminService.createRole(payload);
        const saved = {
          id: created.id,
          name: created.name,
          key: created.key,
          permissions: typeof created.permissions === 'string' ? JSON.parse(created.permissions || '[]') : (created.permissions || []),
          users: 0,
        };
        setRoles(r => [...r, saved]);
        setShowCreate(false);
      }
      setForm({ name: '', key: '', permissions: [] });
    } catch (err) {
      setError(err.response?.data?.detail || 'Action failed');
    } finally {
      setBusy(b => ({ ...b, submit: false }));
    }
  };

  const openEdit = (role) => {
    setEditing(role);
    setForm({ name: role.name, key: role.key, permissions: [...role.permissions] });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete role?')) return;
    setBusy(b => ({ ...b, [`del-${id}`]: true }));
    try {
      await adminService.deleteRole(id);
      setRoles(r => r.filter(x => x.id !== id));
    } catch {
      // ignore
    } finally {
      setBusy(b => ({ ...b, [`del-${id}`]: false }));
    }
  };

  return (
    <div>
      <SectionHeader
        title="Roles & Permissions"
        action={
          <button onClick={() => { setShowCreate(true); setForm({ name: '', key: '', permissions: [] }); setError(''); }} className="bg-forest-500 hover:bg-forest-600 text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2 rounded-xl transition-colors">
            + Create Role
          </button>
        }
      />

      {error && <p className="text-red-600 text-[12.5px] mb-3">{error}</p>}

      {loading ? (
        <p className="text-ink/60 text-[13px]">Loading roles...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="rounded-2xl border border-ink/[0.06] bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-[13px]">
                    {role.name[0]}
                  </div>
                  <div>
                    <p className="font-landing-sans font-semibold text-ink/90">{role.name}</p>
                    <p className="text-[11px] text-mute font-landing-sans">{role.users} admin{role.users !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Badge label={role.key.replace('_', ' ')} color={ROLE_COLORS[role.key] || 'gray'} />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(role.permissions || []).slice(0, 6).map(p => (
                  <span key={p} className="text-[10.5px] font-landing-sans px-2 py-0.5 rounded bg-ink/[0.05] text-ink/60">
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
                {(role.permissions || []).length > 6 && (
                  <span className="text-[10.5px] font-landing-sans px-2 py-0.5 rounded bg-ink/[0.05] text-mute">
                    +{(role.permissions || []).length - 6} more
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                <ActionBtn label="Edit" onClick={() => openEdit(role)} />
                {role.key !== 'super_admin' && (
                  <ActionBtn label="Delete" variant="red" onClick={() => handleDelete(role.id)} disabled={busy[`del-${role.id}`]} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate || !!editing} onClose={() => { setShowCreate(false); setEditing(null); setForm({ name: '', key: '', permissions: [] }); setError(''); }} title={editing ? 'Edit Role' : 'Create Role'}>
        <form onSubmit={handleCreate}>
          <Input label="Role Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          {!editing && (
            <div className="mb-4">
              <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">Role Key (unique)</label>
              <Input value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))} />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm)}
                    onChange={() => togglePerm(perm)}
                    className="accent-forest-500 w-3.5 h-3.5"
                  />
                  <span className="text-[12px] font-landing-sans text-ink/70 group-hover:text-ink transition-colors">
                    {perm.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <PrimaryBtn type="submit" className="w-full" disabled={busy.submit}>{editing ? 'Save Changes' : 'Create Role'}</PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}
