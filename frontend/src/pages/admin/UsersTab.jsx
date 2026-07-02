import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SearchBar, SectionHeader, statusBadgeColor, Modal, Input, PrimaryBtn, fmtKES } from './shared';

function exportCSV(data, name) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  a.download = `${name}.csv`; a.click();
}

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '' });
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [bookingsTarget, setBookingsTarget] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [busy, setBusy] = useState({});
  const [formBusy, setFormBusy] = useState(false);

  const reload = () => adminService.listUsers().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, id, key) => {
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(id); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try { await adminService.updateUser(editTarget.id, editForm); setEditTarget(null); await reload(); }
    finally { setFormBusy(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setFormBusy(true);
    try { await adminService.resetUserPassword(resetTarget.id, newPassword); setResetTarget(null); setNewPassword(''); }
    finally { setFormBusy(false); }
  };

  const openBookings = async (u) => {
    setBookingsTarget(u);
    setBookingsLoading(true);
    try { const data = await adminService.getUserBookings(u.id); setBookings(data); }
    catch { setBookings([]); }
    finally { setBookingsLoading(false); }
  };

  const ROLES = ['all', 'customer', 'provider', 'admin'];
  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <SectionHeader
        title={`Users (${filtered.length})`}
        action={
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-xl border border-ink/[0.1] overflow-hidden text-[12px] font-landing-sans">
              {ROLES.map(r => (
                <button key={r} onClick={() => setFilterRole(r)} className={`px-3 py-1.5 capitalize transition-colors ${filterRole === r ? 'bg-forest-500 text-white font-semibold' : 'text-ink/60 hover:bg-sand-100'}`}>{r}</button>
              ))}
            </div>
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…" />
            <button onClick={() => exportCSV(filtered.map(u => ({ id: u.id, name: u.full_name, email: u.email, phone: u.phone, role: u.role, verified: u.is_verified, joined: u.created_at })), 'users')} className="text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-lg bg-ink/[0.06] text-ink/70 hover:bg-ink/[0.1] transition-colors">
              Export CSV
            </button>
          </div>
        }
      />

      <Table
        headers={['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions']}
        loading={loading}
        empty={filtered.length === 0 ? 'No users found.' : null}
      >
        {filtered.map(u => (
          <tr key={u.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold text-[12px] shrink-0">
                  {(u.full_name || 'U')[0].toUpperCase()}
                </div>
                <span className="font-landing-sans font-medium text-ink/90">{u.full_name}</span>
              </div>
            </td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70">{u.email}</td>
            <td className="px-5 py-3.5 font-landing-sans text-ink/70">{u.phone || '—'}</td>
            <td className="px-5 py-3.5"><Badge label={u.role} color={u.role === 'admin' ? 'purple' : u.role === 'provider' ? 'blue' : 'gray'} /></td>
            <td className="px-5 py-3.5"><Badge label={u.is_verified ? 'Active' : 'Suspended'} color={u.is_verified ? 'green' : 'red'} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-mute">{new Date(u.created_at).toLocaleDateString()}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <ActionBtn label="View" onClick={() => setSelected(u)} />
                <ActionBtn label="Edit" variant="blue" onClick={() => openEdit(u)} />
                <ActionBtn label="Bookings" onClick={() => openBookings(u)} />
                <ActionBtn label="Reset PW" variant="yellow" onClick={() => { setResetTarget(u); setNewPassword(''); }} />
                {u.is_verified
                  ? <ActionBtn label="Suspend" variant="red" disabled={busy[`s${u.id}`]} onClick={() => act(adminService.suspendUser, u.id, `s${u.id}`)} />
                  : <ActionBtn label="Reactivate" variant="green" disabled={busy[`r${u.id}`]} onClick={() => act(adminService.reactivateUser, u.id, `r${u.id}`)} />
                }
                <ActionBtn label="Delete" variant="red" disabled={busy[`d${u.id}`]} onClick={() => { if (confirm('Delete this user?')) act(adminService.deleteUser, u.id, `d${u.id}`); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* View Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Profile">
        {selected && (
          <div className="space-y-3 text-[13px] font-landing-sans">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-xl">
                {(selected.full_name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-ink text-[15px]">{selected.full_name}</p>
                <p className="text-mute">{selected.email}</p>
                <div className="flex gap-1.5 mt-1">
                  <Badge label={selected.role} color={selected.role === 'admin' ? 'purple' : selected.role === 'provider' ? 'blue' : 'gray'} />
                  <Badge label={selected.is_verified ? 'Active' : 'Suspended'} color={selected.is_verified ? 'green' : 'red'} />
                </div>
              </div>
            </div>
            {[['Phone', selected.phone || '—'], ['Joined', new Date(selected.created_at).toLocaleString()]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-ink/[0.06] pb-2">
                <span className="text-mute">{k}</span>
                <span className="font-medium text-ink/80">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-3 flex-wrap">
              <ActionBtn label="Edit Details" variant="blue" onClick={() => { setSelected(null); openEdit(selected); }} />
              <ActionBtn label="View Bookings" onClick={() => { setSelected(null); openBookings(selected); }} />
              <ActionBtn label="Reset Password" variant="yellow" onClick={() => { setSelected(null); setResetTarget(selected); setNewPassword(''); }} />
              {selected.is_verified
                ? <ActionBtn label="Suspend" variant="red" onClick={() => { act(adminService.suspendUser, selected.id, `s${selected.id}`); setSelected(null); }} />
                : <ActionBtn label="Reactivate" variant="green" onClick={() => { act(adminService.reactivateUser, selected.id, `r${selected.id}`); setSelected(null); }} />
              }
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.full_name}`}>
        <form onSubmit={handleEdit}>
          <Input label="Full Name" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
          <Input label="Email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Saving…' : 'Save Changes'}</PrimaryBtn>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Reset Password — ${resetTarget?.full_name}`}>
        <form onSubmit={handleReset}>
          <Input label="New Password" type="password" required minLength={6} placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <PrimaryBtn type="submit" disabled={formBusy} className="w-full">{formBusy ? 'Resetting…' : 'Reset Password'}</PrimaryBtn>
        </form>
      </Modal>

      {/* Bookings Modal */}
      <Modal open={!!bookingsTarget} onClose={() => setBookingsTarget(null)} title={`Bookings — ${bookingsTarget?.full_name}`} size="lg">
        {bookingsLoading ? (
          <p className="text-center text-mute font-landing-sans text-sm py-8">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-mute font-landing-sans text-sm py-8">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] font-landing-sans">
              <thead>
                <tr className="border-b border-ink/[0.06] text-left">
                  {['ID', 'Service', 'Status', 'Amount', 'Date'].map(h => (
                    <th key={h} className="px-3 py-2 text-[11px] font-semibold text-ink/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.04]">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-sand-50">
                    <td className="px-3 py-2.5 font-mono text-mute">#{b.id}</td>
                    <td className="px-3 py-2.5 text-ink/80">{b.category || '—'}</td>
                    <td className="px-3 py-2.5"><Badge label={b.status} color={statusBadgeColor(b.status)} /></td>
                    <td className="px-3 py-2.5 font-medium text-ink/90">{fmtKES(b.final_price || b.price_offered)}</td>
                    <td className="px-3 py-2.5 text-mute">{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
