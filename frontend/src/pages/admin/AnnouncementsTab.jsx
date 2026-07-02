import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Table, ActionBtn, Badge, SectionHeader, Modal, Input, Textarea, Select, PrimaryBtn } from './shared';

const TARGETS = ['all', 'customers', 'providers', 'companies'];
const TYPES = ['maintenance', 'promotions', 'new_features', 'security_alerts'];

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', target: 'all', type: 'promotions' });
  const [busy, setBusy] = useState({});

  const reload = () => adminService.listAnnouncements().then(setAnnouncements).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const act = async (fn, ...args) => {
    const key = args.join('-');
    setBusy(b => ({ ...b, [key]: true }));
    try { await fn(...args); await reload(); } finally { setBusy(b => ({ ...b, [key]: false })); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await adminService.createAnnouncement(form);
    setShowCreate(false);
    setForm({ title: '', message: '', target: 'all', type: 'promotions' });
    reload();
  };

  const typeColor = (t) => ({ maintenance: 'yellow', promotions: 'green', new_features: 'blue', security_alerts: 'red' }[t] || 'gray');

  return (
    <div>
      <SectionHeader
        title={`Announcements (${announcements.length})`}
        action={<button onClick={() => setShowCreate(true)} className="bg-forest-500 hover:bg-forest-600 text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2 rounded-xl transition-colors">+ New Announcement</button>}
      />

      <Table
        headers={['Title', 'Message', 'Target', 'Type', 'Status', 'Date', 'Actions']}
        loading={loading}
        empty={announcements.length === 0 ? 'No announcements yet.' : null}
      >
        {announcements.map(a => (
          <tr key={a.id} className="hover:bg-sand-50 transition-colors">
            <td className="px-5 py-3.5 font-landing-sans font-semibold text-ink/90">{a.title}</td>
            <td className="px-5 py-3.5 font-landing-sans text-mute max-w-[200px] truncate">{a.message}</td>
            <td className="px-5 py-3.5"><Badge label={a.target} color="blue" /></td>
            <td className="px-5 py-3.5"><Badge label={a.type?.replace('_', ' ')} color={typeColor(a.type)} /></td>
            <td className="px-5 py-3.5"><Badge label={a.is_active ? 'Active' : 'Inactive'} color={a.is_active ? 'green' : 'gray'} /></td>
            <td className="px-5 py-3.5 font-landing-sans text-mute whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <ActionBtn label={a.is_active ? 'Deactivate' : 'Activate'} variant={a.is_active ? 'yellow' : 'green'} disabled={busy[`t${a.id}`]} onClick={() => act(id => adminService.updateAnnouncement(id, { is_active: !a.is_active }), a.id)} />
                <ActionBtn label="Delete" variant="red" disabled={busy[`d${a.id}`]} onClick={() => { if (confirm('Delete announcement?')) act(adminService.deleteAnnouncement, a.id); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Announcement">
        <form onSubmit={handleCreate}>
          <Input label="Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Message" required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          <Select label="Target Audience" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
            {TARGETS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </Select>
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </Select>
          <PrimaryBtn type="submit" className="w-full">Send Announcement</PrimaryBtn>
        </form>
      </Modal>
    </div>
  );
}
