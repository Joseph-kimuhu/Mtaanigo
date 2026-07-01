import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LogoutModal({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-clay-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97A3D" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          </div>
          <h3 className="font-landing-display text-[22px] font-medium text-ink mb-2">Log out of MtaaniGo?</h3>
          <p className="text-[14px] text-mute font-landing-sans leading-relaxed mb-6">You will need to sign in again to access your bookings and messages.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-full border border-ink/15 py-3 text-[14px] font-landing-sans font-semibold text-ink/80 hover:bg-sand-100 transition-colors">Cancel</button>
            <button onClick={handleLogout} disabled={loading} className="flex-1 rounded-full bg-clay-500 hover:bg-clay-600 text-white py-3 text-[14px] font-landing-sans font-semibold transition-colors disabled:opacity-50">
              {loading ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
