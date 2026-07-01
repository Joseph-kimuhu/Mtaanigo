import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function OTPInput({ length, onComplete }) {
  const inputsRef = useRef([]);
  const [values, setValues] = useState(Array(length).fill(''));

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
    if (val && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
    if (index === length - 1 && val) {
      onComplete?.(newValues.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-row">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          maxLength={1}
          inputMode="numeric"
          value={values[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('creds');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [invitePassword2, setInvitePassword2] = useState('');
  const [totp, setTotp] = useState('');
  const [setupTotp, setSetupTotp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredsSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      const userData = await authService.getCurrentUser();
      if (userData.role !== 'admin') {
        localStorage.removeItem('access_token');
        setError('Incorrect email or password.');
        return;
      }
      localStorage.removeItem('access_token');
      setView('mfa');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === 'Incorrect email or password') {
        setError(detail);
      } else if (detail === 'User not verified') {
        setError('Account not verified. Check your email.');
      } else {
        setError(detail || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async () => {
    setError('');
    if (totp.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.adminVerifyMfa(email, totp);
      localStorage.setItem('access_token', data.access_token);
      navigate('/admin-dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail === 'Admin not found' ? 'Admin account not found.' : 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePasswordSubmit = () => {
    setError('');
    if (!invitePassword || invitePassword.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (invitePassword !== invitePassword2) {
      setError('Passwords do not match.');
      return;
    }
    setView('mfa-setup');
  };

  const handleMfaSetupConfirm = () => {
    setError('');
    if (setupTotp.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setView('success');
  };

  return (
    <>
      <style>{`
        :root{
          --chalk:#FBF8F2; --chalk-dim:#F1ECE1; --ink:#1A1A18;
          --red:#D7263D; --green:#1B7340; --ochre:#E8A33D; --blue:#3E6C7A;
          --paper-edge: rgba(26,26,24,0.12);
        }
        *{box-sizing:border-box;}
        body{margin:0;background:var(--ink);color:var(--chalk);font-family:'Work Sans', sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
        button,select,input{font-family:inherit;}
        :focus-visible{outline:3px solid var(--blue); outline-offset:2px;}
        .mono{font-family:'IBM Plex Mono', monospace;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;}

        .wrap{max-width:380px;width:100%;}
        .tag{text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#7d7b72;margin-bottom:22px;}
        .tag span{color:var(--ochre);}

        .card{background:var(--chalk);color:var(--ink);border:2.5px solid #38382f;border-radius:10px;padding:32px 28px;}
        .view{display:none;}
        .view.active{display:block;}
        .view h2{font-size:19px;margin:0 0 6px;font-weight:700;}
        .view p.sub{margin:0 0 24px;font-size:13px;color:#5b5b56;line-height:1.5;}

        .field{margin-bottom:16px;}
        .field label{display:block;font-family:'IBM Plex Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#6b6b64;margin-bottom:6px;}
        .field input{width:100%;padding:11px 13px;border:2px solid var(--ink);border-radius:6px;background:#fff;font-size:14px;color:var(--ink);}

        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px 18px;border:2px solid var(--ink);border-radius:6px;font-family:'IBM Plex Mono', monospace;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:12.5px;cursor:pointer;background:var(--ink);color:var(--chalk);transition:transform .15s ease;}
        .btn:hover{transform:translate(-2px,-2px);}
        .btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}

        .otp-row{display:flex;gap:8px;margin-bottom:18px;}
        .otp-row input{width:42px;height:48px;text-align:center;font-size:18px;border:2px solid var(--ink);border-radius:6px;background:#fff;}

        .qr-box{width:140px;height:140px;margin:0 auto 18px;border:2px solid var(--ink);border-radius:8px;display:flex;align-items:center;justify-content:center;background:#fff;}
        .secret-code{text-align:center;font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:0.1em;background:var(--chalk-dim);border:1.5px dashed var(--paper-edge);border-radius:6px;padding:10px;margin-bottom:20px;}

        .back-link{font-size:11.5px;font-family:'IBM Plex Mono',monospace;color:#6b6b64;cursor:pointer;display:inline-block;margin-bottom:14px;}
        .footnote{text-align:center;margin-top:20px;font-size:11.5px;color:#5f5e58;line-height:1.5;}

        .error-box{background:#FBEDEE;border:1.5px solid var(--red);color:#a32d2d;border-radius:6px;padding:10px 12px;font-size:12.5px;margin-bottom:16px;display:none;}
        .error-box.show{display:block;}

        .success-icon{width:54px;height:54px;border-radius:50%;background:var(--green);color:var(--chalk);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;}
        .view.success-view{text-align:center;}
      `}</style>

      <div className="wrap">
        <div className="tag">Mtaa<span>nigo</span> · ops console</div>
        <div className="card">
          {/* LOGIN: CREDENTIALS */}
          <div className={`view ${view === 'creds' ? 'active' : ''}`} id="view-creds">
            <h2>Sign in</h2>
            <p className="sub">Authorized personnel only. This page is not linked from the public site.</p>
            <div className={`error-box ${error && view === 'creds' ? 'show' : ''}`} id="credError">{error}</div>
            <div className="field">
              <label htmlFor="ad-email">Email</label>
              <input
                id="ad-email"
                type="text"
                placeholder="you@mtaanigo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCredsSubmit()}
              />
            </div>
            <div className="field">
              <label htmlFor="ad-pass">Password</label>
              <input
                id="ad-pass"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCredsSubmit()}
              />
            </div>
            <button className="btn" onClick={handleCredsSubmit} disabled={loading}>
              {loading ? 'Verifying...' : 'Continue →'}
            </button>
            <p className="footnote">First time here? Use the invite link sent to your email.</p>
          </div>

          {/* LOGIN: MFA */}
          <div className={`view ${view === 'mfa' ? 'active' : ''}`} id="view-mfa">
            <span className="back-link" onClick={() => setView('creds')}>← Back</span>
            <h2>Enter your code</h2>
            <p className="sub">Open your authenticator app and enter the current 6-digit code.</p>
            <div className="otp-row">
              <OTPInput length={6} onComplete={(val) => setTotp(val)} />
            </div>
            <button className="btn" onClick={handleMfaSubmit} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify →'}
            </button>
            <p className="footnote">Lost your device? Contact another admin to reset MFA.</p>
          </div>

          {/* INVITE: SET PASSWORD */}
          <div className={`view ${view === 'invite' ? 'active' : ''}`} id="view-invite">
            <h2>Set up your admin account</h2>
            <p className="sub">This invite was sent by <strong>ops@mtaanigo.com</strong> and expires in 24 hours.</p>
            <div className="field">
              <label htmlFor="iv-email">Email</label>
              <input id="iv-email" type="text" value="jane.n@mtaanigo.com" disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="field">
              <label htmlFor="iv-pass">Create password</label>
              <input
                id="iv-pass"
                type="password"
                placeholder="At least 12 characters"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="iv-pass2">Confirm password</label>
              <input
                id="iv-pass2"
                type="password"
                placeholder="Repeat password"
                value={invitePassword2}
                onChange={(e) => setInvitePassword2(e.target.value)}
              />
            </div>
            <div className={`error-box ${error && view === 'invite' ? 'show' : ''}`} id="inviteError">{error}</div>
            <button className="btn" onClick={handleInvitePasswordSubmit}>Continue to MFA setup →</button>
          </div>

          {/* INVITE: MFA SETUP */}
          <div className={`view ${view === 'mfa-setup' ? 'active' : ''}`} id="view-mfa-setup">
            <span className="back-link" onClick={() => setView('invite')}>← Back</span>
            <h2>Set up two-factor authentication</h2>
            <p className="sub">Scan this with Google Authenticator or Authy, then enter the code it shows.</p>
            <div className="qr-box">
              <svg width="100" height="100" viewBox="0 0 10 10">
                <rect width="10" height="10" fill="#fff"/>
                <rect x="0" y="0" width="3" height="3" fill="#1A1A18"/><rect x="4" y="0" width="1" height="1" fill="#1A1A18"/><rect x="7" y="0" width="3" height="3" fill="#1A1A18"/>
                <rect x="0" y="4" width="1" height="1" fill="#1A1A18"/><rect x="2" y="4" width="1" height="1" fill="#1A1A18"/><rect x="5" y="4" width="2" height="2" fill="#1A1A18"/><rect x="9" y="4" width="1" height="1" fill="#1A1A18"/>
                <rect x="0" y="7" width="3" height="3" fill="#1A1A18"/><rect x="4" y="8" width="1" height="1" fill="#1A1A18"/><rect x="7" y="7" width="3" height="3" fill="#1A1A18"/>
              </svg>
            </div>
            <div className="secret-code">JBSW Y3DP EHPK 3PXP</div>
            <OTPInput length={6} onComplete={(val) => setSetupTotp(val)} />
            <button className="btn" onClick={handleMfaSetupConfirm}>Confirm & finish setup →</button>
          </div>

          {/* SUCCESS */}
          <div className={`view success-view ${view === 'success' ? 'active' : ''}`} id="view-success">
            <div className="success-icon">✓</div>
            <h2>You're signed in</h2>
            <p className="sub">Opening the admin dashboard…</p>
            <button className="btn" onClick={() => navigate('/admin-dashboard')}>Go to dashboard →</button>
          </div>
        </div>

        <p className="footnote" id="toggleInviteLink" style={{ display: view === 'creds' ? 'block' : 'none' }}>
          Have an invite link instead?{' '}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setView('invite'); }}
            style={{ color: '#9c9a90', textDecoration: 'underline' }}
          >
            Set up account
          </a>
        </p>
      </div>
    </>
  );
}

export default AdminLoginPage;
