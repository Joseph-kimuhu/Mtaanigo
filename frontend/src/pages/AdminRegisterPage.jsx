import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLoginPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const { register } = useAuth();

  const ADMIN_EMAIL = 'josephkimuhu66@gmail.com';

  const advanceToCode = () => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) setStep('code');
    else {
      setError('Only josephkimuhu66@gmail.com may register as admin.');
      setStep('email');
    }
  };

  const advanceToPassword = () => {
    if (secretCode.trim().length > 0) setStep('password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (secretCode !== 'MTAANI2026') {
      setError('Invalid secret code');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        full_name: email.split('@')[0].replace(/[^a-zA-Z\s]/g, ' ').trim() || 'Admin',
        phone: '+254' + Math.floor(100000000 + Math.random() * 900000000),
        password,
        role: 'admin',
      });
      window.location.href = '/admin-dashboard';
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('email')) {
        setError('Admin account with this email already exists. Please use the login page.');
        setAdminExists(true);
      } else {
        setError(detail || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-white">MtaaniConnect</h1>
          <h2 className="mt-6 text-center text-2xl text-gray-200">Admin Access</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
              {adminExists && (
                <div className="mt-2">
                  <Link to="/login" className="text-red-100 underline hover:text-white">
                    Go to Login Page
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (step === 'email') advanceToCode(); }}
                onBlur={advanceToCode}
                required
                autoFocus
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="admin@example.com"
              />
            </div>

            {step !== 'email' && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-300">Secret Code</label>
                <input
                  type="password"
                  value={secretCode}
                  onChange={(e) => { setSecretCode(e.target.value); if (step === 'code') advanceToPassword(); }}
                  onBlur={advanceToPassword}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter admin secret code"
                />
              </div>
            )}

            {step !== 'email' && step !== 'code' && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Create a strong password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name and phone will be auto-generated from your email.
                </p>
              </div>
            )}
          </div>

          {step !== 'email' && step !== 'code' && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
            </button>
          )}
        </form>

        <p className="text-center text-gray-400 text-sm">
          Regular user?{' '}
          <Link to="/register" className="text-red-400 hover:text-red-300">
            Sign up here
          </Link>
        </p>
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default AdminLoginPage;
