import { useState } from 'react';
import { PrimaryBtn, Input, Select } from './shared';

const SECTIONS = ['General', 'Payments', 'Commissions', 'Notifications', 'Maintenance'];

export default function SystemSettingsTab() {
  const [active, setActive] = useState('General');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({ app_name: 'MtaaniGo', support_email: 'support@mtaanigo.com', support_phone: '+254700000000', currency: 'KES', timezone: 'Africa/Nairobi' });
  const [payments, setPayments] = useState({ mpesa_enabled: true, card_enabled: false, cash_enabled: true, min_withdrawal: '500', withdrawal_fee: '30' });
  const [commissions, setCommissions] = useState({ default_commission: '15', company_commission: '12', min_payout: '200' });
  const [notifications, setNotifications] = useState({ email_enabled: true, sms_enabled: true, push_enabled: true, booking_alerts: true, payment_alerts: true });
  const [maintenance, setMaintenance] = useState({ maintenance_mode: false, maintenance_message: 'We are performing scheduled maintenance. Back shortly.' });

  const handleSave = (e) => {
    e.preventDefault();
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
            <Input label="App Name" value={general.app_name} onChange={e => setGeneral(g => ({ ...g, app_name: e.target.value }))} />
            <Input label="Support Email" type="email" value={general.support_email} onChange={e => setGeneral(g => ({ ...g, support_email: e.target.value }))} />
            <Input label="Support Phone" value={general.support_phone} onChange={e => setGeneral(g => ({ ...g, support_phone: e.target.value }))} />
            <Select label="Currency" value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))}>
              <option value="KES">KES – Kenyan Shilling</option>
              <option value="USD">USD – US Dollar</option>
            </Select>
            <Select label="Timezone" value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="UTC">UTC</option>
            </Select>
          </div>
        )}

        {active === 'Payments' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6">
            <Toggle label="M-Pesa Enabled" checked={payments.mpesa_enabled} onChange={v => setPayments(p => ({ ...p, mpesa_enabled: v }))} />
            <Toggle label="Card Payments Enabled" checked={payments.card_enabled} onChange={v => setPayments(p => ({ ...p, card_enabled: v }))} />
            <Toggle label="Cash on Delivery Enabled" checked={payments.cash_enabled} onChange={v => setPayments(p => ({ ...p, cash_enabled: v }))} />
            <div className="mt-4 space-y-1">
              <Input label="Minimum Withdrawal (KSh)" type="number" value={payments.min_withdrawal} onChange={e => setPayments(p => ({ ...p, min_withdrawal: e.target.value }))} />
              <Input label="Withdrawal Fee (KSh)" type="number" value={payments.withdrawal_fee} onChange={e => setPayments(p => ({ ...p, withdrawal_fee: e.target.value }))} />
            </div>
          </div>
        )}

        {active === 'Commissions' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 space-y-1">
            <Input label="Default Commission (%)" type="number" min="0" max="100" value={commissions.default_commission} onChange={e => setCommissions(c => ({ ...c, default_commission: e.target.value }))} />
            <Input label="Company Commission (%)" type="number" min="0" max="100" value={commissions.company_commission} onChange={e => setCommissions(c => ({ ...c, company_commission: e.target.value }))} />
            <Input label="Minimum Payout (KSh)" type="number" value={commissions.min_payout} onChange={e => setCommissions(c => ({ ...c, min_payout: e.target.value }))} />
          </div>
        )}

        {active === 'Notifications' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6">
            <Toggle label="Email Notifications" checked={notifications.email_enabled} onChange={v => setNotifications(n => ({ ...n, email_enabled: v }))} />
            <Toggle label="SMS Notifications" checked={notifications.sms_enabled} onChange={v => setNotifications(n => ({ ...n, sms_enabled: v }))} />
            <Toggle label="Push Notifications" checked={notifications.push_enabled} onChange={v => setNotifications(n => ({ ...n, push_enabled: v }))} />
            <Toggle label="Booking Alerts" checked={notifications.booking_alerts} onChange={v => setNotifications(n => ({ ...n, booking_alerts: v }))} />
            <Toggle label="Payment Alerts" checked={notifications.payment_alerts} onChange={v => setNotifications(n => ({ ...n, payment_alerts: v }))} />
          </div>
        )}

        {active === 'Maintenance' && (
          <div className="rounded-2xl border border-ink/[0.06] bg-white p-6">
            <Toggle label="Maintenance Mode" checked={maintenance.maintenance_mode} onChange={v => setMaintenance(m => ({ ...m, maintenance_mode: v }))} />
            {maintenance.maintenance_mode && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12.5px] font-landing-sans text-amber-700 mb-4">
                ⚠️ Maintenance mode is ON. The app is inaccessible to users.
              </div>
            )}
            <div className="mt-4">
              <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">Maintenance Message</label>
              <textarea
                rows={3}
                value={maintenance.maintenance_message}
                onChange={e => setMaintenance(m => ({ ...m, maintenance_message: e.target.value }))}
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
