import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../services/customerService';
import { requestService } from '../services/requestService';

const navItems = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'browse', label: 'Browse', icon: '🔍' },
  { id: 'bookings', label: 'My Bookings', icon: '📅' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'favorites', label: 'Favorites', icon: '⭐' },
];

const css = `
  :root{
    --chalk:#FBF8F2;
    --chalk-dim:#F1ECE1;
    --ink:#1A1A18;
    --red:#D7263D;
    --green:#1B7340;
    --ochre:#E8A33D;
    --blue:#3E6C7A;
    --paper-edge: rgba(26,26,24,0.12);
    --sidebar-w: 232px;
    --accent: var(--red);
  }

  *{box-sizing:border-box;}
  body{margin:0;background:var(--chalk-dim);color:var(--ink);font-family:'Work Sans', sans-serif;-webkit-font-smoothing:antialiased;display:flex;min-height:100vh;}
  a{color:inherit;text-decoration:none;}
  ul{margin:0;padding:0;list-style:none;}
  button,select,input,textarea{font-family:inherit;}
  :focus-visible{outline:3px solid var(--blue); outline-offset:2px;}

  .display{font-family:'Anton', sans-serif;text-transform:uppercase;letter-spacing:0.01em;line-height:1;font-weight:400;}
  .mono{font-family:'IBM Plex Mono', monospace;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;}
  .printed{color:var(--ink);text-shadow:4px 4px 0 var(--accent);display:inline-block;}

  .sidebar{width:var(--sidebar-w);flex-shrink:0;background:var(--ink);color:var(--chalk);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;}
  .sidebar .brand{padding:24px 22px 18px;border-bottom:1px solid #38382f;}
  .sidebar .brand .logo{font-family:'Anton',sans-serif;text-transform:uppercase;font-size:21px;}
  .sidebar .brand .logo span{color:var(--ochre);}
  .sidebar .brand .tag{font-family:'IBM Plex Mono', monospace;font-size:10.5px;letter-spacing:0.08em;color:#a9a79d;text-transform:uppercase;margin-top:3px;}
  .nav-group{padding:18px 12px;}
  .nav-group .label{font-family:'IBM Plex Mono', monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#7d7b72;padding:0 10px 8px;}
  .nav-item{width:100%;display:flex;align-items:center;gap:11px;padding:11px 12px;border:none;background:transparent;color:#d8d6cd;border-radius:7px;font-size:14px;cursor:pointer;text-align:left;margin-bottom:3px;}
  .nav-item .ic{font-size:16px;width:18px;text-align:center;}
  .nav-item:hover{background:#28281f;color:var(--chalk);}
  .nav-item.active{background:var(--accent);color:var(--chalk);}
  .nav-item .count{margin-left:auto;font-family:'IBM Plex Mono', monospace;font-size:10.5px;background:rgba(255,255,255,0.15);padding:2px 7px;border-radius:10px;}
  .sidebar .foot{margin-top:auto;padding:18px 22px;border-top:1px solid #38382f;font-size:12px;color:#7d7b72;}

  .main{flex:1; min-width:0; display:flex; flex-direction:column;}
  .topbar{height:68px;background:var(--chalk);border-bottom:3px solid var(--ink);display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:10;gap:18px;}
  .topbar .search{flex:1;max-width:360px;position:relative;}
  .topbar .search input{width:100%;padding:10px 14px 10px 34px;border:2px solid var(--ink);border-radius:7px;font-size:14px;background:var(--chalk-dim);}
  .topbar .search::before{content:"🔍";position:absolute;left:11px;top:9px;font-size:13px;}
  .topbar .right{display:flex;align-items:center;gap:16px;}
  .icon-btn{border:2px solid var(--ink);background:var(--chalk);border-radius:8px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;position:relative;}
  .icon-btn .dot{position:absolute;top:-4px;right:-4px;width:9px;height:9px;border-radius:50%;background:var(--red);border:2px solid var(--chalk);}
  .profile-chip{display:flex;align-items:center;gap:9px;padding:6px 12px 6px 6px;border:2px solid var(--ink);border-radius:30px;}
  .profile-chip .av{width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--chalk);font-family:'IBM Plex Mono',monospace;font-size:11px;display:flex;align-items:center;justify-content:center;}
  .profile-chip span{font-size:13px;font-weight:600;}

  .content{padding:30px 32px 60px;}
  .section{display:none;}
  .section.active{display:block;}
  .page-head{margin-bottom:26px;display:flex;justify-content:space-between;align-items:flex-end;gap:18px;flex-wrap:wrap;}
  .page-head h1{font-size:30px;margin:0 0 6px;}
  .page-head p{margin:0;color:#5b5b56;font-size:14px;}

  .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px;}
  .kpi{border:2.5px solid var(--ink);border-radius:10px;padding:18px;background:var(--chalk);}
  .kpi .label{font-family:'IBM Plex Mono', monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:0.05em;color:#6b6b64;margin-bottom:8px;}
  .kpi .val{font-family:'Anton',sans-serif;font-size:28px;}
  .kpi .delta{font-size:12px;margin-top:6px;font-weight:600;color:var(--green);}

  .panel{border:2.5px solid var(--ink);border-radius:10px;background:var(--chalk);padding:20px 22px;margin-bottom:22px;}
  .panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
  .panel-head h3{font-size:14px;margin:0;font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:0.05em;}

  .cat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:22px;}
  .cat-tile{border:2.5px solid var(--ink);border-radius:8px;padding:22px 16px;background:var(--chalk);text-align:center;cursor:pointer;transition:transform .15s ease;}
  .cat-tile:hover{transform:translateY(-4px);}
  .cat-tile .icon{font-size:26px;margin-bottom:10px;}
  .cat-tile .name{font-family:'IBM Plex Mono',monospace;font-size:12.5px;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;}
  .cat-tile .swahili{font-size:11.5px;color:#6b6b64;margin-top:3px;font-style:italic;}
  .cat-tile.c1{background:#FBEDEE;border-color:var(--red);}
  .cat-tile.c2{background:#EAF3EC;border-color:var(--green);}
  .cat-tile.c3{background:#FBF1E2;border-color:var(--ochre);}
  .cat-tile.c4{background:#EAF1F2;border-color:var(--blue);}

  .provider-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
  .provider-card{border:2.5px solid var(--ink);border-radius:10px;padding:22px;background:var(--chalk);}
  .provider-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
  .avatar{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Anton',sans-serif;font-size:18px;color:var(--chalk);border:2px solid var(--ink);}
  .stamp{width:64px;height:64px;border-radius:50%;border:2.5px dashed var(--green);display:flex;align-items:center;justify-content:center;text-align:center;color:var(--green);font-size:9px;line-height:1.15;transform:rotate(-9deg);flex-shrink:0;background:var(--chalk);font-family:'IBM Plex Mono',monospace;}
  .provider-card h4{margin:14px 0 2px;font-size:17px;font-weight:700;}
  .provider-role{font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;color:var(--red);letter-spacing:0.04em;margin:0 0 12px;}
  .provider-meta{display:flex;justify-content:space-between;font-size:12.5px;color:#5b5b56;border-top:1.5px dashed var(--paper-edge);padding-top:12px;}
  .provider-meta .stars{color:var(--ochre);}

  .table-card{border:2.5px solid var(--ink);border-radius:10px;background:var(--chalk);overflow:hidden;}
  table.data{width:100%;border-collapse:collapse;}
  table.data thead th{text-align:left;font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:0.04em;color:#6b6b64;padding:12px 18px;border-bottom:2px solid var(--ink);background:var(--chalk-dim);}
  table.data td{padding:13px 18px;border-bottom:1px solid var(--paper-edge);font-size:13.5px;vertical-align:middle;}
  table.data tbody tr:hover{background:var(--chalk-dim);}
  .row-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .pill{display:inline-block;padding:4px 11px;border-radius:20px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:0.03em;font-weight:600;}
  .pill.green{background:#EAF3EC;color:var(--green);}
  .pill.red{background:#FBEDEE;color:var(--red);}
  .pill.ochre{background:#FBF1E2;color:#9c6b1f;}
  .pill.blue{background:#EAF1F2;color:var(--blue);}
  .pill.grey{background:#ECECE8;color:#6b6b64;}

  .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border:2.5px solid var(--ink);border-radius:6px;font-family:'IBM Plex Mono', monospace;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:12.5px;cursor:pointer;background:var(--ink);color:var(--chalk);transition:transform 0.15s ease;}
  .btn:hover{transform:translate(-2px,-2px);}
  .btn.outline{background:transparent;color:var(--ink);}
  .btn.accent{background:var(--accent);border-color:var(--accent);}
  .mini-btn{border:2px solid var(--ink);background:var(--chalk);border-radius:6px;padding:7px 13px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;cursor:pointer;}
  .mini-btn.solid-green{background:var(--green);color:var(--chalk);border-color:var(--green);}
  .mini-btn.solid-red{background:var(--red);color:var(--chalk);border-color:var(--red);}
  .mini-btn:disabled{opacity:0.45;cursor:default;}

  .toast{position:fixed;bottom:26px;right:26px;background:var(--ink);color:var(--chalk);padding:13px 20px;border-radius:8px;font-size:13.5px;font-family:'IBM Plex Mono',monospace;box-shadow:5px 5px 0 var(--accent);transform:translateY(20px);opacity:0;pointer-events:none;transition:all .25s ease;z-index:100;}
  .toast.show{transform:translateY(0);opacity:1;}

  .search-board{background:var(--chalk);border:3px solid var(--ink);border-radius:10px;padding:22px;box-shadow:6px 6px 0 var(--ink);margin-bottom:22px;}
  .search-board .field{margin-bottom:14px;}
  .search-board .field label{display:block;font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;color:#6b6b64;margin-bottom:6px;}
  .search-board .field select, .search-board .field input{width:100%;padding:12px 14px;border:2px solid var(--ink);border-radius:6px;background:#fff;font-size:15px;color:var(--ink);}
  .search-board .btn{width:100%;justify-content:center;margin-top:6px;}

  .msg-card{border:2px solid var(--ink);border-radius:10px;padding:16px 18px;margin-bottom:12px;display:flex;gap:14px;align-items:flex-start;}
  .msg-card:last-child{margin-bottom:0;}
  .msg-card .msg-av{width:40px;height:40px;border-radius:50%;background:var(--blue);color:var(--chalk);display:flex;align-items:center;justify-content:center;font-family:'Anton',sans-serif;font-size:16px;flex-shrink:0;}
  .msg-card .msg-body{flex:1;}
  .msg-card .msg-body h4{margin:0 0 3px;font-size:14.5px;}
  .msg-card .msg-body span{font-size:12px;color:#6b6b64;}

  .burger{display:none;}
  @media (max-width:980px){
    .kpi-row{grid-template-columns:repeat(2,1fr);}
    .provider-grid{grid-template-columns:repeat(2,1fr);}
  }
  @media (max-width:760px){
    .sidebar{position:fixed;left:-240px;z-index:60;transition:left .2s ease;box-shadow:8px 0 24px rgba(0,0,0,0.25);}
    .sidebar.open{left:0;}
    .burger{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:2px solid var(--ink);border-radius:8px;background:var(--chalk);cursor:pointer;}
    .topbar .search{display:none;}
    .kpi-row{grid-template-columns:1fr 1fr;}
    .provider-grid{grid-template-columns:1fr;}
    .cat-grid{grid-template-columns:repeat(2,1fr);}
  }
`;

function CustomerDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ msg: '', show: false });
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState({});
  const { user } = useAuth();

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg: '', show: false }), 2600);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (activeSection === 'overview' || activeSection === 'bookings') {
        setLoading((l) => ({ ...l, requests: true }));
        try {
          const data = await customerService.getMyRequests();
          setRequests(data);
        } catch (e) {
          showToast(e?.response?.data?.detail || 'Failed to load bookings');
        } finally {
          setLoading((l) => ({ ...l, requests: false }));
        }
      }
      if (activeSection === 'browse') {
        setLoading((l) => ({ ...l, categories: true }));
        try {
          const data = await customerService.getCategories();
          setCategories(data);
        } catch (e) {
          showToast(e?.response?.data?.detail || 'Failed to load categories');
        } finally {
          setLoading((l) => ({ ...l, categories: false }));
        }
      }
      if (activeSection === 'payments') {
        setLoading((l) => ({ ...l, payments: true }));
        try {
          const data = await customerService.getPayments();
          setPayments(data);
        } catch (e) {
          showToast(e?.response?.data?.detail || 'Failed to load payments');
        } finally {
          setLoading((l) => ({ ...l, payments: false }));
        }
      }
    };
    load();
  }, [activeSection, showToast]);

  const handleCancelRequest = async (requestId) => {
    try {
      await requestService.updateRequest(requestId, { status: 'cancelled' });
      showToast('Booking cancelled');
      setActiveSection('bookings');
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to cancel');
    }
  };

  const handleBookNow = async (providerId) => {
    showToast('Booking flow would open here for provider #' + providerId);
  };

  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'OK';

  const upcomingBookings = requests.filter((r) => r.status === 'pending' || r.status === 'accepted').length;
  const completedBookings = requests.filter((r) => r.status === 'completed').length;
  const totalSpent = payments
    .filter((p) => p.status === 'completed' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const getRequestPillClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'green';
    if (s === 'pending') return 'ochre';
    if (s === 'accepted') return 'blue';
    if (s === 'cancelled' || s === 'disputed') return 'red';
    return 'grey';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
      <style>{css}</style>

      {/* Toast */}
      <div id="toast" style={{ transform: toast.show ? 'translateY(0)' : 'translateY(20px)', opacity: toast.show ? 1 : 0 }}>
        {toast.msg}
      </div>

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="brand">
          <div className="logo">Mtaa<span>nigo</span></div>
          <div className="tag">Customer console</div>
        </div>
        <div className="nav-group">
          <div className="label">Menu</div>
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="ic">{item.icon}</span>
              {item.label}
              {item.id === 'bookings' && upcomingBookings > 0 && <span className="count">{upcomingBookings}</span>}
            </button>
          ))}
        </div>
        <div className="nav-group">
          <div className="label">Account</div>
          {navItems.slice(4).map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="ic">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="foot">
          Signed in as<br />
          <strong style={{ color: '#d8d6cd' }}>{user?.full_name || 'Customer'}</strong>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <button className="burger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            ☰
          </button>
          <div className="search">
            <input type="text" placeholder="Search providers, services…" />
          </div>
          <div className="right">
            <button className="icon-btn" aria-label="Notifications">
              🔔<span className="dot"></span>
            </button>
            <div className="profile-chip">
              <div className="av">{initials}</div>
              <span>{user?.full_name || 'Customer'}</span>
            </div>
          </div>
        </div>

        <div className="content">
          {/* OVERVIEW */}
          <section className={`section${activeSection === 'overview' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Habari, {user?.full_name?.split(' ')[0] || 'Customer'}.</h1>
                <p>Here's what's happening with your bookings.</p>
              </div>
            </div>

            <div className="kpi-row">
              <div className="kpi">
                <div className="label">Upcoming bookings</div>
                <div className="val">{upcomingBookings}</div>
                <div className="delta">Active jobs</div>
              </div>
              <div className="kpi">
                <div className="label">Completed jobs</div>
                <div className="val">{completedBookings}</div>
                <div className="delta">All time</div>
              </div>
              <div className="kpi">
                <div className="label">Total spent</div>
                <div className="val">KES {totalSpent.toLocaleString()}</div>
                <div className="delta">On Mtaanigo</div>
              </div>
              <div className="kpi">
                <div className="label">Saved providers</div>
                <div className="val">0</div>
                <div className="delta">Tap ⭐ to save</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Upcoming bookings</h3>
                <span className="link" style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '12.5px', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.04em' }} onClick={() => setActiveSection('bookings')}>View all</span>
              </div>
              {loading.requests && <p style={{ color: '#6b6b64' }}>Loading...</p>}
              {requests.filter((r) => r.status === 'pending' || r.status === 'accepted').length === 0 && !loading.requests && (
                <p style={{ color: '#6b6b64' }}>No upcoming bookings. <span style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--accent)' }} onClick={() => setActiveSection('browse')}>Find a fundi</span></p>
              )}
              {requests.filter((r) => r.status === 'pending' || r.status === 'accepted').slice(0, 3).map((req) => (
                <div className="req-card" key={req.id} style={{ marginBottom: 12 }}>
                  <div className="info">
                    <h4>{req.description}</h4>
                    <span>
                      {req.provider?.full_name || 'Awaiting fundi'} · {req.address || 'Nairobi'} · Budget KES{' '}
                      {req.price_offered ? req.price_offered.toLocaleString() : '—'} ·{' '}
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <span className={`pill ${getRequestPillClass(req.status)}`}>{req.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* BROWSE */}
          <section className={`section${activeSection === 'browse' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Find a fundi</h1>
                <p>Browse categories and find vetted workers near you.</p>
              </div>
            </div>

            <div className="search-board">
              <div className="field">
                <label htmlFor="browse-service">What do you need done?</label>
                <select id="browse-service">
                  <option value="">Select a service…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon || ''} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="browse-mtaa">Your mtaa</label>
                <input id="browse-mtaa" type="text" placeholder="e.g. Kilimani, Kawangware, Embakasi" />
              </div>
              <button className="btn accent" type="button" onClick={() => showToast('Searching for fundis near you…')}>Search now →</button>
            </div>

            <div className="panel-head" style={{ marginTop: 26, marginBottom: 16 }}>
              <h3>All categories</h3>
            </div>
            {loading.categories && <p style={{ color: '#6b6b64' }}>Loading categories...</p>}
            <div className="cat-grid">
              {categories.map((cat, i) => (
                <div className={`cat-tile c${(i % 4) + 1}`} key={cat.id}>
                  <div className="icon">{cat.icon || '🛠️'}</div>
                  <div className="name">{cat.name}</div>
                </div>
              ))}
              {categories.length === 0 && !loading.categories && (
                <p style={{ color: '#6b6b64' }}>No categories available</p>
              )}
            </div>

            <div className="panel-head" style={{ marginTop: 26, marginBottom: 16 }}>
              <h3>Vetted fundis near you</h3>
            </div>
            <div className="provider-grid">
              <div className="provider-card">
                <div className="provider-top">
                  <div className="avatar" style={{ background: 'var(--red)' }}>OK</div>
                  <div className="stamp">VETTED<br />FUNDI</div>
                </div>
                <h4>Otieno K.</h4>
                <p className="provider-role">Plumbing · Kawangware</p>
                <div className="provider-meta"><span className="stars">★ 4.9</span><span>312 jobs</span><span>~12 min</span></div>
                <button className="btn accent" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={() => handleBookNow(1)}>Book now →</button>
              </div>
              <div className="provider-card">
                <div className="provider-top">
                  <div className="avatar" style={{ background: 'var(--green)' }}>AW</div>
                  <div className="stamp">VETTED<br />FUNDI</div>
                </div>
                <h4>Amina W.</h4>
                <p className="provider-role">Cleaning · Kilimani</p>
                <div className="provider-meta"><span className="stars">★ 5.0</span><span>540 jobs</span><span>~8 min</span></div>
                <button className="btn accent" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={() => handleBookNow(2)}>Book now →</button>
              </div>
              <div className="provider-card">
                <div className="provider-top">
                  <div className="avatar" style={{ background: 'var(--blue)' }}>BM</div>
                  <div className="stamp">VETTED<br />FUNDI</div>
                </div>
                <h4>Brian M.</h4>
                <p className="provider-role">Electrical · Embakasi</p>
                <div className="provider-meta"><span className="stars">★ 4.7</span><span>198 jobs</span><span>~20 min</span></div>
                <button className="btn accent" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={() => handleBookNow(3)}>Book now →</button>
              </div>
            </div>
          </section>

          {/* MY BOOKINGS */}
          <section className={`section${activeSection === 'bookings' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">My Bookings</h1>
                <p>All your service requests and their status.</p>
              </div>
            </div>

            <div className="table-card">
              <table className="data">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Fundi</th>
                    <th>Mtaa</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={i}>
                      <td>{r.description}</td>
                      <td>{r.provider?.full_name || '—'}</td>
                      <td>{r.address || '—'}</td>
                      <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                      <td>
                        KES {r.final_price ? r.final_price.toLocaleString() : r.price_offered ? r.price_offered.toLocaleString() : '—'}
                      </td>
                      <td>
                        <span className={`pill ${getRequestPillClass(r.status)}`}>{r.status}</span>
                      </td>
                      <td className="row-actions">
                        {(r.status === 'pending' || r.status === 'accepted') && (
                          <button className="mini-btn solid-red" onClick={() => handleCancelRequest(r.id)}>Cancel</button>
                        )}
                        {r.status === 'completed' && <span className="pill grey">Rated</span>}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && !loading.requests && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#6b6b64', padding: 24 }}>
                        No bookings yet. <span style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--accent)' }} onClick={() => setActiveSection('browse')}>Find a fundi</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAYMENTS */}
          <section className={`section${activeSection === 'payments' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Payments</h1>
                <p>Your payment history with Mtaanigo.</p>
              </div>
            </div>

            {loading.payments && <p>Loading payments...</p>}

            {payments.length > 0 && (
              <div className="table-card">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Booking</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i}>
                        <td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                        <td>#{p.request_id}</td>
                        <td>KES {p.amount ? p.amount.toLocaleString() : '—'}</td>
                        <td>{p.payment_method || '—'}</td>
                        <td>
                          <span className={`pill ${p.status === 'completed' || p.status === 'paid' ? 'green' : p.status === 'pending' ? 'ochre' : 'red'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {payments.length === 0 && !loading.payments && (
              <div className="panel">
                <p style={{ color: '#6b6b64' }}>No payments yet. Your completed jobs will appear here.</p>
              </div>
            )}
          </section>

          {/* MESSAGES */}
          <section className={`section${activeSection === 'messages' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Messages</h1>
                <p>Chat with your fundis about upcoming jobs.</p>
              </div>
            </div>

            <div className="panel">
              <p style={{ color: '#6b6b64' }}>No messages yet. When you book a fundi, you can message them directly from your bookings.</p>
            </div>
          </section>

          {/* FAVORITES */}
          <section className={`section${activeSection === 'favorites' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Favorites</h1>
                <p>Fundis you've saved for quick booking.</p>
              </div>
            </div>

            <div className="provider-grid">
              <div className="provider-card" style={{ opacity: 0.6 }}>
                <div style={{ textAlign: 'center', padding: 20, color: '#6b6b64' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
                  <p>No saved providers yet</p>
                  <p style={{ fontSize: '12px', marginTop: 6 }}>Tap the star icon on a provider's profile to save them here.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
