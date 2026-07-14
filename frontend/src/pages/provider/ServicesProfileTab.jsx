import { useEffect, useState } from 'react';
import { fundiService } from '../../services/fundiService';
import { categoryService } from '../../services/categoryService';
import { Card, Spinner, Btn, Input, Select, Textarea, Modal } from './shared';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DOC_TYPES = [
  { key: 'id', label: 'National ID', icon: '🪪' },
  { key: 'certificate', label: 'Certificate', icon: '📜' },
  { key: 'business_permit', label: 'Business Permit', icon: '🏢' },
  { key: 'kra_pin', label: 'KRA PIN', icon: '📋' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️' },
];

export default function ServicesProfileTab() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  // Forms
  const [personalForm, setPersonalForm] = useState({ full_name: '', phone: '', bio: '', years_of_experience: '', base_price: '' });
  const [newService, setNewService] = useState({ category_id: '', price_per_hour: '', description: '' });
  const [newArea, setNewArea] = useState('');
  const [schedule, setSchedule] = useState({});
  const [showAddService, setShowAddService] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const reload = async () => {
    setLoading(true);
    try {
      const [p, s, a] = await Promise.all([fundiService.getProfile(), fundiService.getServices(), fundiService.getWorkingAreas().catch(() => [])]);
      setProfile(p);
      setServices(s);
      setAreas(a);
      setPersonalForm({ full_name: p.full_name || '', phone: p.phone || '', bio: p.bio || '', years_of_experience: p.years_of_experience || '', base_price: p.base_price || '' });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    reload();
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fundiService.updateProfile({ bio: personalForm.bio, years_of_experience: parseInt(personalForm.years_of_experience) || null, base_price: parseFloat(personalForm.base_price) || null });
      await fundiService.updateUserProfile({ full_name: personalForm.full_name, phone: personalForm.phone });
      showToast('Profile updated ✅');
      await reload();
    } catch (e) { showToast(e?.response?.data?.detail || 'Failed to save'); }
    finally { setBusy(false); }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fundiService.addService(parseInt(newService.category_id), parseFloat(newService.price_per_hour), newService.description);
      showToast('Service added ✅');
      setNewService({ category_id: '', price_per_hour: '', description: '' });
      setShowAddService(false);
      await reload();
    } catch (e) { showToast(e?.response?.data?.detail || 'Failed to add service'); }
    finally { setBusy(false); }
  };

  const handleRemoveService = async (id) => {
    try { await fundiService.removeService(id); showToast('Service removed'); await reload(); }
    catch (e) { showToast(e?.response?.data?.detail || 'Failed to remove'); }
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    if (!newArea.trim()) return;
    try { await fundiService.addWorkingArea(newArea.trim()); setNewArea(''); await reload(); showToast('Area added ✅'); }
    catch (e) { showToast(e?.response?.data?.detail || 'Failed to add area'); }
  };

  const handleRemoveArea = async (area) => {
    try { await fundiService.removeWorkingArea(area); await reload(); showToast('Area removed'); }
    catch (e) { showToast(e?.response?.data?.detail || 'Failed to remove area'); }
  };

  const SECTIONS = ['personal', 'services', 'areas', 'schedule', 'documents'];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl font-landing-sans text-[13px] shadow-lg">{toast}</div>}

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)} className={`px-4 py-2 rounded-xl text-[12.5px] font-landing-sans font-semibold capitalize transition-colors ${activeSection === s ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>
            {s === 'areas' ? 'Working Areas' : s === 'schedule' ? 'Availability' : s}
          </button>
        ))}
      </div>

      {/* Personal Details */}
      {activeSection === 'personal' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-landing-sans font-bold text-[14px] text-ink mb-5">Personal Details</h3>
          <form onSubmit={handleSavePersonal}>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Input label="Full Name" value={personalForm.full_name} onChange={e => setPersonalForm(f => ({ ...f, full_name: e.target.value }))} />
              <Input label="Phone Number" value={personalForm.phone} onChange={e => setPersonalForm(f => ({ ...f, phone: e.target.value }))} />
              <Input label="Years of Experience" type="number" min="0" value={personalForm.years_of_experience} onChange={e => setPersonalForm(f => ({ ...f, years_of_experience: e.target.value }))} />
              <Input label="Base Price (KES/hr)" type="number" min="0" value={personalForm.base_price} onChange={e => setPersonalForm(f => ({ ...f, base_price: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">Bio</label>
              <textarea rows={3} className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30 resize-none" value={personalForm.bio} onChange={e => setPersonalForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell customers about yourself…" />
            </div>
            <div className="mb-5 px-4 py-3 rounded-xl bg-sand-50 border border-ink/[0.06] text-[12.5px] font-landing-sans text-ink/70">
              <p><strong>Email:</strong> {profile?.email || user?.email || '—'}</p>
              <p className="mt-1"><strong>Rating:</strong> ⭐ {profile?.rating?.toFixed(1) || '0.0'} ({profile?.total_ratings || 0} reviews)</p>
              <p className="mt-1"><strong>Total Jobs:</strong> {profile?.total_jobs || 0}</p>
            </div>
            <Btn type="submit" variant="primary" disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</Btn>
          </form>
        </Card>
      )}

      {/* Services */}
      {activeSection === 'services' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-landing-sans font-bold text-[14px] text-ink">Services Offered ({services.length})</h3>
            <Btn variant="primary" size="sm" onClick={() => setShowAddService(true)}>+ Add Service</Btn>
          </div>
          {services.length === 0
            ? <Card className="px-5 py-10 text-center"><p className="text-mute font-landing-sans text-sm">No services added yet</p></Card>
            : services.map(s => (
              <Card key={s.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.category_icon || '🛠️'}</span>
                  <div>
                    <p className="font-landing-sans font-semibold text-[13.5px] text-ink/90">{s.category_name}</p>
                    <p className="text-[12px] text-mute font-landing-sans">{s.price_per_hour ? `KES ${Number(s.price_per_hour).toLocaleString()}/hr` : 'Price not set'}</p>
                    {s.description && <p className="text-[11.5px] text-mute font-landing-sans italic">{s.description}</p>}
                  </div>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => handleRemoveService(s.id)}>Remove</Btn>
              </Card>
            ))
          }

          <Modal open={showAddService} onClose={() => setShowAddService(false)} title="Add Service">
            <form onSubmit={handleAddService}>
              <Select label="Category" required value={newService.category_id} onChange={e => setNewService(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">Select category…</option>
                {categories.length > 0
                  ? categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)
                  : ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Mechanic', 'Tutor', 'Beauty', 'Laundry'].map((n, i) => <option key={i} value={i + 1}>{n}</option>)
                }
              </Select>
              <Input label="Price per Hour (KES)" type="number" min="0" required placeholder="e.g. 1500" value={newService.price_per_hour} onChange={e => setNewService(f => ({ ...f, price_per_hour: e.target.value }))} />
              <div className="mb-4">
                <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">Description (optional)</label>
                <textarea rows={2} className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30 resize-none" value={newService.description} onChange={e => setNewService(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Btn type="submit" variant="primary" disabled={busy} className="w-full">{busy ? 'Adding…' : 'Add Service'}</Btn>
            </form>
          </Modal>
        </div>
      )}

      {/* Working Areas */}
      {activeSection === 'areas' && (
        <div className="space-y-4 max-w-xl">
          <h3 className="font-landing-sans font-bold text-[14px] text-ink">Working Areas</h3>
          <form onSubmit={handleAddArea} className="flex gap-2">
            <input className="flex-1 border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30" placeholder="e.g. Westlands, Nairobi" value={newArea} onChange={e => setNewArea(e.target.value)} />
            <Btn type="submit" variant="primary">Add Area</Btn>
          </form>
          <div className="flex flex-wrap gap-2">
            {areas.length === 0
              ? <p className="text-mute font-landing-sans text-sm">No working areas set</p>
              : areas.map(a => (
                <div key={a} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-50 border border-forest-200">
                  <span className="text-[12.5px] font-landing-sans font-semibold text-forest-700">📍 {a}</span>
                  <button onClick={() => handleRemoveArea(a)} className="text-forest-500 hover:text-red-500 transition-colors text-[13px]">×</button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Availability Schedule */}
      {activeSection === 'schedule' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-landing-sans font-bold text-[14px] text-ink mb-5">Weekly Availability</h3>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-forest-500 w-4 h-4" checked={schedule[day]?.enabled ?? true} onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], enabled: e.target.checked } }))} />
                    <span className="text-[13px] font-landing-sans font-medium text-ink/80">{day.slice(0, 3)}</span>
                  </label>
                </div>
                {(schedule[day]?.enabled ?? true) && (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" defaultValue="08:00" className="border border-ink/[0.12] rounded-lg px-2.5 py-1.5 text-[12.5px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30" onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], start: e.target.value } }))} />
                    <span className="text-mute text-[12px]">to</span>
                    <input type="time" defaultValue="18:00" className="border border-ink/[0.12] rounded-lg px-2.5 py-1.5 text-[12.5px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30" onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], end: e.target.value } }))} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Btn variant="primary" onClick={() => showToast('Schedule saved ✅')}>Save Schedule</Btn>
          </div>
        </Card>
      )}

      {/* Documents */}
      {activeSection === 'documents' && (
        <div className="space-y-4 max-w-xl">
          <h3 className="font-landing-sans font-bold text-[14px] text-ink">Documents & Verification</h3>
          <div className="space-y-3">
            {DOC_TYPES.map(doc => (
              <Card key={doc.key} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div>
                    <p className="font-landing-sans font-semibold text-[13.5px] text-ink/90">{doc.label}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-landing-sans">Pending</span>
                  </div>
                </div>
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try { await fundiService.uploadDocument(doc.key, file); showToast(`${doc.label} uploaded ✅`); }
                    catch { showToast('Upload failed — feature coming soon'); }
                  }} />
                  <Btn variant="outline" size="sm" onClick={e => e.currentTarget.previousSibling?.click?.()}>Upload</Btn>
                </label>
              </Card>
            ))}
          </div>
          <div className="px-4 py-3 rounded-xl bg-forest-50 border border-forest-200 text-[12.5px] font-landing-sans text-forest-700">
            ✅ Verified documents increase customer trust and unlock more job opportunities.
          </div>
        </div>
      )}
    </div>
  );
}
