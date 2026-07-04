import { useState, useEffect } from 'react';
import { PrimaryBtn, Input, Select } from './shared';
import { adminService } from '../../services/adminService';

const SECTIONS = ['General', 'Payments', 'Commissions', 'Notifications', 'Maintenance'];

function toSectionState(settings = []) {
  const map = {};
  for (const s of settings) {
    try {
      map[s.key] = JSON.parse(s.value || '{}');
    } catch {
      map[s.key] = { value: s.value };
    }
  }
  return {
    general: map.general || { app_name: 'MtaaniGo', support_email: 'support@mtaanigo.com', support_phone: '+254700000000', currency: 'KES', timezone: 'Africa/Nairobi' },
    payments: map.payments || { mpesa_enabled: true, card_enabled: false, cash_enabled: true, min_withdrawal: '500', withdrawal_fee: '30' },
    commissions: map.commissions || { default_commission: '15', company_commission: '12', min_payout: '200' },
    notifications: map.notifications || { email_enabled: true, sms_enabled: true, push_enabled: true, booking_alerts: true, payment_alerts: true },
    maintenance: map.maintenance || { maintenance_mode: false, maintenance_message: 'We are performing scheduled maintenance. Back shortly.' },
  };
}

const KEYS = {
  general: 'general',
  payments: 'payments',
  commissions: 'commissions',
  notifications: 'notifications',
  maintenance: 'maintenance',
};

export default function SystemSettingsTab() {
  const [active, setActive] = useState('General');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(toSectionState());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService.listSettings()
      .then(rows => {
        if (!cancelled) setForm(toSectionState(rows));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const persist = async (key, payload) => {
    await adminService.updateSetting(key, JSON.stringify(payload));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const pairs = [
      [KEYS.general, form.general],
      [KEYS.payments, form.payments],
      [KEYS.commissions, form.commissions],
      [KEYS.notifications, form.notifications],
      [KEYS.maintenance, form.maintenance],
    ];
    await Promise.all(pairs.map(([k, v]) => persist(k, v)));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-ink/[0.06]">
      <span className="text-[13px] font-landing-sans text-ink/80">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? 'bg-forest-500' : 'bg-ink/20'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ width: '18px', height: '18px', top: '2px', left: checked ? '20px' : '2px', transition: 'left 0.2s' }} />
      </button>
    </div>
  );

  if (loading) {
    return <p className="text-ink/60 text-[13px]">Loading settings...</p>;
  }

  const sectionFor = (key) => {
    if (active === 'General') return form.general;
    if (active === 'Payments') return form.payments;
    if (active === 'Commissions') return form.commissions;
    if (active === 'Notifications') return form.notifications;
    if (active === 'Maintenance') return form.maintenance;
    return {};
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-landing-sans font-semibold text-[15px] text-ink">System Settings</h2>
        {saved && <span className="text-[12.5px] font-landing-sans text-forest-600 font-semibold">✓ Settings saved</span>}
      </div>

      <div className="flex gap-1 mb-6 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActive(s)} className={`px-4 py-1.5 rounded-lg text-[12.5px] font-landing-sans font-medium transition-colors ${active === s ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}>{s}</button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-xl">
        {active === 'General' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 space-y-1">
            <Input label="App Name" value={form.general.app_name} onChange={e => set(KEYS.general, { ...form.general, app_name: e.target.value })} />
            <Input label="Support Email" type="email" value={form.general.support_email} onChange={e => set(KEYS.general, { ...form.general, support_email: e.target.value })} />
            <Input label="Support Phone" value={form.general.support_phone} onChange={e => set(KEYS.general, { ...form.general, support_phone: e.target.value })} />
            <Select label="Currency" value={form.general.currency} onChange={e => set(KEYS.general, { ...form.general, currency: e.target.value })}>
              <option value="KES">KES – Kenyan Shilling</option>
              <option value="USD">USD – US Dollar</option>
            </Select>
            <Select label="Timezone" value={form.general.timezone} onChange={e => set(KEYS.general, { ...form.general, timezone: e.target.value })}>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="UTC">UTC</option>
            </Select>
          </div>
        )}

        {active === 'Payments' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6">
            <Toggle label="M-Pesa Enabled" checked={form.payments.mpesa_enabled} onChange={v => set(KEYS.payments, { ...form.payments, mpesa_enabled: v })} />
            <Toggle label="Card Payments Enabled" checked={form.payments.card_enabled} onChange={v => set(KEYS.payments, { ...form.payments, card_enabled: v })} />
            <Toggle label="Cash on Delivery Enabled" checked={form.payments.cash_enabled} onChange={v => set(KEYS.payments, { ...form.payments, cash_enabled: v })} />
            <div className="mt-4 space-y-1">
              <Input label="Minimum Withdrawal (KSh)" type="number" value={form.payments.min_withdrawal} onChange={e => set(KEYS.payments, { ...form.payments, min_withdrawal: e.target.value })} />
              <Input label="Withdrawal Fee (KSh)" type="number" value={form.payments.withdrawal_fee} onChange={e => set(KEYS.payments, { ...form.payments, withdrawal_fee: e.target.value })} />
            </div>
          </div>
        )}

        {active === 'Commissions' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 space-y-1">
            <Input label="Default Commission (%)" type="number" min="0" max="100" value={form.commissions.default_commission} onChange={e => set(KEYS.commissions, { ...form.commissions, default_commission: e.target.value })} />
            <Input label="Company Commission (%)" type="number" min="0" max="100" value={form.commissions.company_commission} onChange={e => set(KEYS.commissions, { ...form.commissions, company_commission: e.target.value })} />
            <Input label="Minimum Payout (KSh)" type="number" value={form.commissions.min_payout} onChange={e => set(KEYS.commissions, { ...form.commissions, min_payout: e.target.value })} />
          </div>
        )}

        {active === 'Notifications' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6">
            <Toggle label="Email Notifications" checked={form.notifications.email_enabled} onChange={v => set(KEYS.notifications, { ...form.notifications, email_enabled: v })} />
            <Toggle label="SMS Notifications" checked={form.notifications.sms_enabled} onChange={v => set(KEYS.notifications, { ...form.notifications, sms_enabled: v })} />
            <Toggle label="Push Notifications" checked={form.notifications.push_enabled} onChange={v => set(KEYS.notifications, { ...form.notifications, push_enabled: v })} />
            <Toggle label="Booking Alerts" checked={form.notifications.booking_alerts} onChange={v => set(KEYS.notifications, { ...form.notifications, booking_alerts: v })} />
            <Toggle label="Payment Alerts" checked={form.notifications.payment_alerts} onChange={v => set(KEYS.notifications, { ...form.notifications, payment_alerts: v })} />
          </div>
        )}

        {active === 'Maintenance' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6">
            <Toggle label="Maintenance Mode" checked={form.maintenance.maintenance_mode} onChange={v => set(KEYS.maintenance, { ...form.maintenance, maintenance_mode: v })} />
            {form.maintenance.maintenance_mode && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12.5px] font-landing-sans text-amber-700 mb-4">
                ⚠️ Maintenance mode is ON. The app is inaccessible to users.
              </div>
            )}
            <div className="mt-4">
              <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">Maintenance Message</label>
              <textarea
                rows={3}
                value={form.maintenance.maintenance_message}
                onChange={e => set(KEYS.maintenance, { ...form.maintenance, maintenance_message: e.target.value })}
                className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/40 resize-none"
              />
            </div>
          </div>
        )}

        <div className="mt-5">
          <PrimaryBtn type="submit">Save Settings</PrimaryBtn>
        </div>
      </form>
    </div>
  );
}
