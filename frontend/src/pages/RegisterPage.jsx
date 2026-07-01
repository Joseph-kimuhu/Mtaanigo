import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OTPInput({ length, onComplete }) {
  const inputsRef = Array(length).fill(null);
  const [values, setValues] = useState(Array(length).fill(''));

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
    if (val && index < length - 1 && inputsRef[index + 1]) {
      inputsRef[index + 1].focus();
    }
    if (index === length - 1 && val) {
      onComplete?.(newValues.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0 && inputsRef[index - 1]) {
      inputsRef[index - 1].focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef[i] = el)}
          maxLength={1}
          inputMode="numeric"
          value={values[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          style={{
            width: 42, height: 48, textAlign: 'center', fontSize: 18,
            border: '2px solid #1A1A18', borderRadius: 6, background: '#fff'
          }}
        />
      ))}
    </div>
  );
}

function RegisterPage() {
  const [step, setStep] = useState('register');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      setStep('otp');
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const userData = await login(formData.email, formData.password);
      if (userData.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (userData.role === 'provider') {
        navigate('/provider-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1ECE1', padding: 24 }}>
        <div style={{ maxWidth: 380, width: '100%' }}>
          <h1 style={{ textAlign: 'center', fontSize: 24, marginBottom: 24 }}>Verify your phone</h1>
          <p style={{ textAlign: 'center', color: '#5b5b56', marginBottom: 24 }}>
            Enter the 6-digit code sent to {formData.phone}
          </p>
          {error && <div style={{ background: '#FBEDEE', border: '1.5px solid #D7263D', color: '#a32d2d', borderRadius: 6, padding: 10, marginBottom: 16 }}>{error}</div>}
          <OTPInput length={6} onComplete={(val) => setOtp(val)} />
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            style={{
              width: '100%', padding: 13, border: '2px solid #1A1A18', borderRadius: 6,
              background: '#1A1A18', color: '#FBF8F2', fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', marginTop: 8
            }}
          >
            {loading ? 'Verifying...' : 'Verify →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#6b6b56' }}>
            Didn't receive it? Check your SMS or{' '}
            <span style={{ color: '#D7263D', cursor: 'pointer' }} onClick={() => setStep('register')}>
              try again
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-green-600">MtaaniGo</h1>
          <h2 className="mt-6 text-center text-2xl text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input id="full_name" type="text" name="full_name" required value={formData.full_name} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email" type="email" name="email" required value={formData.email} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input id="phone" type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" name="password" required value={formData.password} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">I want to</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="customer">Find services (Customer)</option>
                <option value="provider">Offer services (Provider)</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => navigate('/login')} className="text-green-600 hover:text-green-500">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;