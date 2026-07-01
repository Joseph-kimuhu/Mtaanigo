import { useState } from 'react';
import { settingsService } from '../../services/settingsService';

export default function SettingsTab() {
  const [settings, setSettings] = useState(() => settingsService.getAll());
  const [passwordForm, setPasswordForm] = useState({ current: '', new_password: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const toggle = (key) => {
    setSettings((prev) => {
      const updated = settingsService.update({ ...prev, [key]: !prev[key] });
      setSettings(updated);
      return updated;
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm) {
      alert('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    setTimeout(() => {
      alert('Password updated successfully');
      setPasswordSaving(false);
      setPasswordForm({ current: '', new_password: '', confirm: '' });
    }, 800);
  };

  return (
    <div>
      <h1 className="font-landing-display text-[26px] font-medium text-ink mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="rounded-2xl border border-ink/[0.06] bg-white p-5">
          <h3 className="text-[14px] font-landing-sans font-semibold text-ink mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-landing-sans text-ink">Dark mode</p>
              <p className="text-[12px] text-mute font-landing-sans">Switch between light and dark theme</p>
            </div>
            <button onClick={() => toggle('darkMode')} className={`relative w-12 h-7 rounded-full transition-colors ${settings.darkMode ? 'bg-forest-500' : 'bg-ink/10'}`}>
              <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-[13.5px] font-landing-sans text-ink">Language</p>
              <p className="text-[12px] text-mute font-landing-sans">Choose your preferred language</p>
            </div>
            <select value={settings.language} onChange={(e) => { setSettings(settingsService.update({ ...settings, language: e.target.value })); }} className="rounded-xl border border-ink/[0.07] px-4 py-2 text-[13.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors">
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-ink/[0.06] bg-white p-5">
          <h3 className="text-[14px] font-landing-sans font-semibold text-ink mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'notificationsEnabled', label: 'Push notifications', desc: 'Receive push notifications on your device' },
              { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive email updates about bookings' },
              { key: 'smsNotifications', label: 'SMS notifications', desc: 'Receive SMS alerts for bookings' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] font-landing-sans text-ink">{item.label}</p>
                  <p className="text-[12px] text-mute font-landing-sans">{item.desc}</p>
                </div>
                <button onClick={() => toggle(item.key)} className={`relative w-12 h-7 rounded-full transition-colors ${settings[item.key] ? 'bg-forest-500' : 'bg-ink/10'}`}>
                  <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-2xl border border-ink/[0.06] bg-white p-5">
          <h3 className="text-[14px] font-landing-sans font-semibold text-ink mb-4">Privacy & Security</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-landing-sans text-ink">Two-factor authentication</p>
              <p className="text-[12px] text-mute font-landing-sans">Add an extra layer of security to your account</p>
            </div>
            <button onClick={() => toggle('twoFactorEnabled')} className={`relative w-12 h-7 rounded-full transition-colors ${settings.twoFactorEnabled ? 'bg-forest-500' : 'bg-ink/10'}`}>
              <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="mt-6">
            <h4 className="text-[13px] font-landing-sans font-semibold text-ink mb-3">Change password</h4>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Current password" required className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
              <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} placeholder="New password" required className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm new password" required className="w-full rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
              <button type="submit" disabled={passwordSaving} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white font-landing-sans font-semibold text-[13.5px] px-6 py-2.5 transition-colors disabled:opacity-50">
                {passwordSaving ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5">
          <h3 className="text-[14px] font-landing-sans font-semibold text-red-700 mb-2">Danger zone</h3>
          <p className="text-[13px] text-mute font-landing-sans mb-4">Deleting your account is irreversible. All data will be permanently removed.</p>
          <button onClick={() => alert('Account deletion request submitted. This action is final.')} className="rounded-full border border-red-200 text-red-600 px-5 py-2 text-[13px] font-landing-sans font-semibold hover:bg-red-50 transition-colors">Delete account</button>
        </div>
      </div>
    </div>
  );
}
