import { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function ProfileTab() {
  const { user, updateUser } = useAuth();
  const initRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mtaanigo_addresses') || '[]'); } catch { return []; }
  });
  const [newAddress, setNewAddress] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '', preferred_payment: 'mpesa' });
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (user && !initRef.current) {
      initRef.current = true;
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        preferred_payment: 'mpesa',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      updateUser(updated);
      alert('Profile updated successfully');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await authService.requestOtp(user.phone_number || '+254');
      setOtpSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpVerify = async () => {
    setVerifying(true);
    try {
      const res = await authService.verifyOtp(user.phone_number || '+254', otp);
      alert(res.message || 'Verified successfully');
      setOtpSent(false);
      setOtp('');
    } catch (e) {
      console.error(e);
      alert('Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  const addAddress = () => {
    if (!newAddress.trim()) return;
    const addr = { id: Date.now(), text: newAddress.trim() };
    setAddresses([...addresses, addr]);
    localStorage.setItem('mtaanigo_addresses', JSON.stringify([...addresses, addr]));
    setNewAddress('');
    setShowAddressModal(false);
  };

  const removeAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('mtaanigo_addresses', JSON.stringify(updated));
  };

  return (
    <div>
      <h1 className="font-landing-display text-[26px] font-medium text-ink mb-6">Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-forest-100 border-2 border-forest-200 flex items-center justify-center text-2xl font-bold text-forest-700">
              {form.full_name ? form.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'OK'}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-forest-500 text-white flex items-center justify-center cursor-pointer hover:bg-forest-600 transition-colors" title="Change photo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-[14px] font-landing-sans font-semibold text-ink">Profile photo</p>
            <p className="text-[12px] text-mute font-landing-sans">JPG, PNG. Max 2MB.</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[14px] font-landing-sans font-medium text-ink mb-1.5">Full name</label>
          <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full rounded-2xl border border-ink/[0.07] px-5 py-3 text-[14.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[14px] font-landing-sans font-medium text-ink mb-1.5">Email</label>
          <div className="flex gap-3">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="flex-1 rounded-2xl border border-ink/[0.07] px-5 py-3 text-[14.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
            <span className={`text-[13px] font-landing-sans font-semibold px-3 rounded-full ${user?.is_email_verified ? 'bg-forest-50 text-forest-700' : 'bg-clay-500/10 text-clay-600'}`}>
              {user?.is_email_verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[14px] font-landing-sans font-medium text-ink mb-1.5">Phone number</label>
          <div className="flex gap-3">
            <input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required className="flex-1 rounded-2xl border border-ink/[0.07] px-5 py-3 text-[14.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
            <button type="button" onClick={() => handleVerify('phone')} disabled={verifying || otpSent} className="rounded-2xl border border-ink/[0.07] px-4 text-[13px] font-landing-sans font-semibold text-ink/80 hover:bg-sand-100 transition-colors disabled:opacity-50 whitespace-nowrap">
              {otpSent ? 'OTP sent' : verifying ? 'Sending…' : 'Verify'}
            </button>
          </div>
          {otpSent && (
            <div className="mt-3 flex gap-3">
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="flex-1 rounded-2xl border border-ink/[0.07] px-5 py-3 text-[14.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors" />
              <button type="button" onClick={handleOtpVerify} disabled={verifying} className="rounded-2xl bg-forest-500 text-white px-5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors disabled:opacity-50">Submit</button>
            </div>
          )}
        </div>

        {/* Preferred payment */}
        <div>
          <label className="block text-[14px] font-landing-sans font-medium text-ink mb-1.5">Preferred payment method</label>
          <select value={form.preferred_payment} onChange={(e) => setForm({ ...form, preferred_payment: e.target.value })} className="w-full rounded-2xl border border-ink/[0.07] px-5 py-3 text-[14.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors">
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white font-landing-sans font-semibold text-[14.5px] px-7 py-3 shadow-[0_6px_16px_-6px_rgba(20,108,67,0.55)] transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      {/* Saved addresses */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80">Saved addresses</h2>
          <button onClick={() => setShowAddressModal(true)} className="text-[13px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700">Add new</button>
        </div>
        <div className="flex flex-col gap-3">
          {addresses.length === 0 ? (
            <p className="text-mute text-sm">No saved addresses.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="flex items-center justify-between rounded-2xl border border-ink/[0.06] bg-white px-5 py-3.5">
                <p className="text-[13.5px] font-landing-sans text-ink/90">{addr.text}</p>
                <button onClick={() => removeAddress(addr.id)} className="text-[12px] text-red-600 hover:text-red-700 font-landing-sans font-medium">Remove</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add address modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setShowAddressModal(false)}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-landing-display text-[20px] font-medium text-ink mb-4">Add address</h3>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="e.g. 123 Main Street, Nairobi"
              className="w-full rounded-2xl border border-ink/[0.07] px-5 py-3 text-[14.5px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors mb-4"
            />
            <div className="flex gap-3">
              <button onClick={addAddress} className="flex-1 rounded-full bg-forest-500 text-white py-2.5 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors">Save address</button>
              <button type="button" onClick={() => setShowAddressModal(false)} className="rounded-full border border-ink/15 text-ink/80 py-2.5 px-4 text-[13px] font-landing-sans font-semibold hover:bg-sand-100 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
