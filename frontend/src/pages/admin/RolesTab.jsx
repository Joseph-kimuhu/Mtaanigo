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

const DEFAULT_ROLES = [
  { id: 1, name: 'Super Admin', key: 'super_admin', permissions: ALL_PERMISSIONS, users: 1 },
  { id: 2, name: 'Support', key: 'support', permissions: ['view_dashboard', 'manage_users', 'manage_bookings', 'manage_disputes'], users: 3 },
  { id: 3, name: 'Finance', key: 'finance', permissions: ['view_dashboard', 'manage_payments', 'manage_reports'], users: 2 },
  { id: 4, name: 'Content Manager', key: 'content_manager', permissions: ['view_dashboard', 'manage_announcements', 'manage_coupons', 'manage_reviews'], users: 2 },
];

export default function RolesTab() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', permissions: [] });

  const togglePerm = (perm) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (editing) {
      setRoles(r => r.map(role => role.id === editing.id ? { ...role, ...form } : role));
      setEditing(null);
    } else {
      setRoles(r => [...r, { id: Date.now(), key: form.name.toLowerCase().replace(/\s+/g, '_'), users: 0, ...form }]);
      setShowCreate(false);
    }
    setForm({ name: '', permissions: [] });
  };

  const openEdit = (role) => {
    setEditing(role);
    setForm({ name: role.name, permissions: [...role.permissions] });
  };

  return (
    <div>
      <SectionHeader
        title="Roles & Permissions"
        action={
          <button onClick={() => { setShowCreate(true); setForm({ name: '', permissions: [] }); }} className="bg-forest-500 hover:bg-forest-600 text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2 rounded-xl transition-colors">
            + Create Role
          </button>
        }
      />

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
              {role.permissions.slice(0, 6).map(p => (
                <span key={p} className="text-[10.5px] font-landing-sans px-2 py-0.5 rounded bg-ink/[0.05] text-ink/60">
                  {p.replace(/_/g, ' ')}
                </span>
              ))}
              {role.permissions.length > 6 && (
                <span className="text-[10.5px] font-landing-sans px-2 py-0.5 rounded bg-ink/[0.05] text-mute">
                  +{role.permissions.length - 6} more
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <ActionBtn label="Edit" onClick={() => openEdit(role)} />
              {role.key !== 'super_admin' && (
                <ActionBtn label="Delete" variant="red" onClick={() => { if (confirm('Delete role?')) setRoles(r => r.filter(x => x.id !== role.id)); }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate || !!editing} onClose={() => { setShowCreate(false); setEditing(null); setForm({ name: '', permissions: [] }); }} title={editing ? 'Edit Role' : 'Create Role'}>
        <form onSubmit={handleCreate}>
          <Input label="Role Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
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
          <PrimaryBtn type="submit" className="w-full">{editing ? 'Save Changes' : 'Create Role'}</PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}
