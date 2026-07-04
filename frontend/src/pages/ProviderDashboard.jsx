import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fundiService } from '../services/fundiService';

const navItems = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'requests', label: 'Job Requests', icon: '📥' },
  { id: 'jobs', label: 'My Jobs', icon: '🗂️' },
  { id: 'earnings', label: 'Earnings', icon: '💰' },
  { id: 'services', label: 'Services & Profile', icon: '🛠️' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
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
    --accent: var(--green);
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
  .topbar .search{flex:1;max-width:320px;position:relative;}
  .topbar .search input{width:100%;padding:10px 14px 10px 34px;border:2px solid var(--ink);border-radius:7px;font-size:14px;background:var(--chalk-dim);}
  .topbar .search::before{content:"🔍";position:absolute;left:11px;top:9px;font-size:13px;}
  .topbar .right{display:flex;align-items:center;gap:16px;}
  .avail-pill{display:flex;align-items:center;gap:9px;border:2px solid var(--ink);border-radius:30px;padding:6px 14px 6px 10px;font-size:13px;font-weight:600;cursor:pointer;user-select:none;}
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
  .panel-row{display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:22px;}
  .panel{border:2.5px solid var(--ink);border-radius:10px;background:var(--chalk);padding:20px 22px;margin-bottom:22px;}
  .panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
  .panel-head h3{font-size:14px;margin:0;font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:0.05em;}
  .panel-head .link{font-size:12.5px;font-family:'IBM Plex Mono',monospace;color:var(--accent);cursor:pointer;text-transform:uppercase;letter-spacing:0.04em;}
  .req-card{border:2px solid var(--ink);border-radius:10px;padding:16px 18px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;transition:opacity .3s ease;}
  .req-card:last-child{margin-bottom:0;}
  .req-card .info h4{margin:0 0 3px;font-size:14.5px;}
  .req-card .info span{font-size:12px;color:#6b6b64;}
  .req-actions{display:flex;gap:8px;}
  .mini-job{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--paper-edge);}
  .mini-job:last-child{border-bottom:none;}
  .mini-job .dot-cat{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
  .mini-job .info{flex:1;}
  .mini-job .info h4{margin:0 0 2px;font-size:14px;}
  .mini-job .info span{font-size:12px;color:#6b6b64;}
  .vbar-wrap{display:flex;align-items:flex-end;gap:10px;height:140px;padding-top:10px;}
  .vbar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;}
  .vbar .stick{width:100%;border-radius:5px 5px 2px 2px;background:var(--green);}
  .vbar .day{margin-top:8px;font-size:10.5px;font-family:'IBM Plex Mono',monospace;color:#6b6b64;}
  .hbar-row{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
  .hbar-row .cat{width:58px;font-size:12.5px;flex-shrink:0;}
  .hbar-track{flex:1;background:var(--chalk-dim);border-radius:5px;height:14px;overflow:hidden;}
  .hbar-fill{height:100%;border-radius:5px;background:var(--ochre);}
  .hbar-row .v{width:46px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#5b5b56;}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border:2.5px solid var(--ink);border-radius:6px;font-family:'IBM Plex Mono', monospace;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:12.5px;cursor:pointer;background:var(--ink);color:var(--chalk);transition:transform 0.15s ease;}
  .btn:hover{transform:translate(-2px,-2px);}
  .btn.outline{background:transparent;color:var(--ink);}
  .btn.accent{background:var(--accent);border-color:var(--accent);}
  .mini-btn{border:2px solid var(--ink);background:var(--chalk);border-radius:6px;padding:7px 13px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;cursor:pointer;}
  .mini-btn.solid-green{background:var(--green);color:var(--chalk);border-color:var(--green);}
  .mini-btn.solid-red{background:var(--red);color:var(--chalk);border-color:var(--red);}
  .mini-btn:disabled{opacity:0.45;cursor:default;}
  .tabs{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
  .tab-btn{border:2px solid var(--ink);background:var(--chalk);padding:8px 16px;border-radius:30px;font-family:'IBM Plex Mono',monospace;font-size:11.5px;text-transform:uppercase;letter-spacing:0.03em;cursor:pointer;}
  .tab-btn.active{background:var(--ink);color:var(--chalk);}
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
  .pay-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px;}
  .service-list{margin-bottom:20px;}
  .service-row{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--paper-edge);}
  .service-row:last-child{border-bottom:none;}
  .service-row .name{flex:1;font-size:14px;font-weight:600;}
  .service-row .price{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--green);width:110px;}
  .add-service{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}
  .add-service input, .add-service select{padding:10px 13px;border:2px solid var(--ink);border-radius:6px;font-size:13.5px;background:var(--chalk-dim);}
  .form-card{border:2.5px solid var(--ink);border-radius:10px;background:var(--chalk);padding:26px;max-width:680px;}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
  .field{margin-bottom:16px;}
  .field label{display:block;font-family:'IBM Plex Mono', monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;color:#6b6b64;margin-bottom:6px;}
  .field select, .field input, .field textarea{width:100%;padding:11px 14px;border:2px solid var(--ink);border-radius:6px;background:#fff;font-size:14.5px;color:var(--ink);}
  .field textarea{resize:vertical;min-height:80px;}
  .stamp{width:60px;height:60px;border-radius:50%;border:2.5px dashed var(--green);display:flex;align-items:center;justify-content:center;text-align:center;color:var(--green);font-size:9px;line-height:1.15;transform:rotate(-9deg);flex-shrink:0;background:var(--chalk);font-family:'IBM Plex Mono',monospace;}
  .rev-summary{display:flex;gap:36px;align-items:center;margin-bottom:24px;flex-wrap:wrap;}
  .rev-big{text-align:center;}
  .rev-big .num{font-family:'Anton',sans-serif;font-size:54px;}
  .rev-big .stars-static{color:var(--ochre);font-size:16px;}
  .rev-big .count{font-size:12px;color:#6b6b64;margin-top:4px;}
  .rev-breakdown{flex:1;min-width:220px;}
  .review-card{border:2px solid var(--ink);border-radius:10px;padding:18px;margin-bottom:14px;}
  .review-card:last-child{margin-bottom:0;}
  .review-top{display:flex;justify-content:space-between;margin-bottom:8px;align-items:center;}
  .review-top .who{font-weight:700;font-size:14px;}
  .review-top .stars-static{color:var(--ochre);font-size:13px;}
  .review-card p{margin:0;font-size:13.5px;color:#3a3a36;line-height:1.5;}
  .review-meta{font-size:11.5px;color:#6b6b64;margin-top:8px;font-family:'IBM Plex Mono',monospace;text-transform:uppercase;}
  .toast{position:fixed;bottom:26px;right:26px;background:var(--ink);color:var(--chalk);padding:13px 20px;border-radius:8px;font-size:13.5px;font-family:'IBM Plex Mono',monospace;box-shadow:5px 5px 0 var(--accent);transform:translateY(20px);opacity:0;pointer-events:none;transition:all .25s ease;z-index:100;}
  .toast.show{transform:translateY(0);opacity:1;}
  @media (prefers-reduced-motion:reduce){ .toast,.req-card{transition:none;} }
  .burger{display:none;}
  @media (max-width:980px){
    .kpi-row{grid-template-columns:repeat(2,1fr);}
    .panel-row{grid-template-columns:1fr;}
    .pay-summary{grid-template-columns:1fr;}
    .form-row{grid-template-columns:1fr;}
  }
  @media (max-width:760px){
    .sidebar{position:fixed;left:-240px;z-index:60;transition:left .2s ease;box-shadow:8px 0 24px rgba(0,0,0,0.25);}
    .sidebar.open{left:0;}
    .burger{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:2px solid var(--ink);border-radius:8px;background:var(--chalk);cursor:pointer;}
    .topbar .search{display:none;}
    .kpi-row{grid-template-columns:1fr 1fr;}
    .req-card{flex-direction:column;align-items:flex-start;}
  }
`;

function ProviderDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobFilter, setJobFilter] = useState('all');
  const [toast, setToast] = useState({ msg: '', show: false });
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState({});
  const { user } = useAuth();

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg: '', show: false }), 2600);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (activeSection === 'overview' || activeSection === 'requests' || activeSection === 'jobs') {
        setLoading((l) => ({ ...l, requests: true }));
        try {
          const data = await fundiService.getRequests();
          if (!cancelled) setRequests(data);
        } catch (e) {
          if (!cancelled) showToast(e?.response?.data?.detail || 'Failed to load requests');
        } finally {
          if (!cancelled) setLoading((l) => ({ ...l, requests: false }));
        }
      }
      if (activeSection === 'earnings') {
        setLoading((l) => ({ ...l, earnings: true }));
        try {
          const data = await fundiService.getEarnings();
          if (!cancelled) setEarnings(data);
        } catch (e) {
          if (!cancelled) showToast(e?.response?.data?.detail || 'Failed to load earnings');
        } finally {
          if (!cancelled) setLoading((l) => ({ ...l, earnings: false }));
        }
      }
      if (activeSection === 'reviews') {
        setLoading((l) => ({ ...l, reviews: true }));
        try {
          const data = await fundiService.getReviews();
          if (!cancelled) setReviews(data);
        } catch (e) {
          if (!cancelled) showToast(e?.response?.data?.detail || 'Failed to load reviews');
        } finally {
          if (!cancelled) setLoading((l) => ({ ...l, reviews: false }));
        }
      }
      if (activeSection === 'services') {
        setLoading((l) => ({ ...l, profile: true, services: true }));
        try {
          const [profileData, servicesData] = await Promise.all([
            fundiService.getProfile(),
            fundiService.getServices(),
          ]);
          if (!cancelled) {
            setProfile(profileData);
            setServices(servicesData);
          }
        } catch (e) {
          if (!cancelled) showToast(e?.response?.data?.detail || 'Failed to load profile/services');
        } finally {
          if (!cancelled) setLoading((l) => ({ ...l, profile: false, services: false }));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeSection, showToast]);

  const handleAccept = async (requestId) => {
    try {
      await fundiService.acceptRequest(requestId);
      showToast('Request accepted');
      setActiveSection('jobs');
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to accept');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await fundiService.declineRequest(requestId);
      showToast('Request declined');
      setActiveSection('jobs');
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to decline');
    }
  };

  const handleMarkComplete = async (requestId) => {
    try {
      await fundiService.completeRequest(requestId);
      showToast('Job marked complete');
      setActiveSection('jobs');
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to complete');
    }
  };

  const handleRemoveService = async (serviceId) => {
    try {
      await fundiService.removeService(serviceId);
      showToast('Service removed');
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to remove');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    const form = e.target;
    const categoryId = parseInt(form.category.value);
    const price = form.price.value;
    const desc = form.desc.value;
    if (!categoryId || !price) return;
    try {
      await fundiService.addService(categoryId, price, desc);
      showToast('Service added');
      form.reset();
      setServices((prev) => [...prev, { category_id: categoryId, price_per_hour: price, description: desc, id: Date.now() }]);
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to add service');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await fundiService.setAvailability(!profile?.is_available);
      showToast(profile?.is_available ? 'You are now offline' : 'You are now visible for new jobs');
      const data = await fundiService.getProfile();
      setProfile(data);
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to update availability');
    }
  };

  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'OK';
  const mtaa = profile?.address || 'Nairobi';

  const incomingRequests = requests.filter((r) => r.status === 'pending').slice(0, 2);

  const getRequestPillClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'accepted' || s === 'in_progress' || s === 'in progress') return 'blue';
    if (s === 'completed') return 'green';
    if (s === 'pending') return 'ochre';
    if (s === 'declined' || s === 'disputed') return 'red';
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
          <div className="tag">Fundi console</div>
        </div>
        <div className="nav-group">
          <div className="label">Work</div>
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="ic">{item.icon}</span>
              {item.label}
              {item.id === 'overview' && incomingRequests.length > 0 && <span className="count">{incomingRequests.length}</span>}
              {item.id === 'requests' && incomingRequests.length > 0 && <span className="count">{incomingRequests.length}</span>}
            </button>
          ))}
        </div>
        <div className="nav-group">
          <div className="label">Profile</div>
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
          <strong style={{ color: '#d8d6cd' }}>{user?.full_name || 'Fundi'} — {mtaa}</strong>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <button className="burger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            ☰
          </button>
          <div className="search">
            <input type="text" placeholder="Search your jobs…" />
          </div>
          <div className="right">
            <label className="avail-pill" onClick={() => !loading.profile && handleToggleAvailability()}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: profile?.is_available !== false ? 'var(--green)' : '#b8b6ac', display: 'inline-block' }}></span>
              <span>{profile?.is_available !== false ? 'Online' : 'Offline'}</span>
            </label>
            <button className="icon-btn" aria-label="Notifications">
              🔔<span className="dot"></span>
            </button>
            <div className="profile-chip">
              <div className="av">{initials}</div>
              <span>{user?.full_name || 'Fundi'}</span>
            </div>
          </div>
        </div>

        <div className="content">
          {/* OVERVIEW */}
          <section className={`section${activeSection === 'overview' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Habari, {user?.full_name ? user.full_name.split(' ')[0] : 'Fundi'}.</h1>
                <p>Here's how your week is shaping up.</p>
              </div>
            </div>

            <div className="kpi-row">
              <div className="kpi">
                <div className="label">Earnings today</div>
                <div className="val">KES {earnings ? earnings.last_7_days?.[6]?.amount?.toLocaleString() || '0' : '0'}</div>
                <div className="delta">▲ from {requests.filter((r) => r.status === 'completed').length} jobs</div>
              </div>
              <div className="kpi">
                <div className="label">Jobs this week</div>
                <div className="val">{requests.filter((r) => r.status === 'completed').length}</div>
                <div className="delta">▲ {requests.filter((r) => r.status === 'completed').length} completed</div>
              </div>
              <div className="kpi">
                <div className="label">Rating</div>
                <div className="val">★ {profile?.rating?.toFixed(1) || '0.0'}</div>
                <div className="delta">{profile?.total_jobs || 0} jobs total</div>
              </div>
              <div className="kpi">
                <div className="label">Acceptance rate</div>
                <div className="val">
                  {requests.length > 0 ? Math.round((requests.filter((r) => r.status !== 'pending').length / requests.length) * 100) : 0}%
                </div>
                <div className="delta">Keep it up!</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Incoming job requests</h3>
                <span className="link" onClick={() => setActiveSection('requests')}>
                  View all
                </span>
              </div>
              {loading.requests ? (
                <p style={{ color: '#6b6b64' }}>Loading...</p>
              ) : incomingRequests.length === 0 ? (
                <p style={{ color: '#6b6b64' }}>No pending requests right now</p>
              ) : (
                incomingRequests.map((req) => (
                  <div className="req-card" key={req.id}>
                    <div className="info">
                      <h4>{req.description}</h4>
                      <span>
                        {req.customer?.full_name || 'Customer'} · {req.address || 'Nairobi'} · Budget KES{' '}
                        {req.price_offered ? req.price_offered.toLocaleString() : '—'} · Posted{' '}
                        {req.created_at ? new Date(req.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="req-actions">
                      <button className="mini-btn solid-green" onClick={() => handleAccept(req.id)}>Accept</button>
                      <button className="mini-btn solid-red" onClick={() => handleDecline(req.id)}>Decline</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="panel-row">
              <div className="panel">
                <div className="panel-head"><h3>Earnings — last 7 days</h3></div>
                {earnings ? (
                  <div className="vbar-wrap">
                    {earnings.last_7_days.map((d, i) => (
                      <div className="vbar" key={i}>
                        <div
                          className="stick"
                          style={{
                            height: `${Math.max(5, (d.amount / Math.max(1, ...earnings.last_7_days.map((x) => x.amount))) * 100)}%`,
                          }}
                        ></div>
                        <div className="day">{d.day}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b6b64' }}>No earnings data yet</p>
                )}
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Today's schedule</h3></div>
                {requests.filter((r) => r.status === 'accepted').length === 0 ? (
                  <p style={{ color: '#6b6b64' }}>No active jobs today</p>
                ) : (
                  requests
                    .filter((r) => r.status === 'accepted')
                    .slice(0, 2)
                    .map((r, i) => (
                      <div className="mini-job" key={i}>
                        <div className="dot-cat" style={{ background: 'var(--red)' }}></div>
                        <div className="info">
                          <h4>{r.description}</h4>
                          <span>{r.customer?.full_name || 'Customer'} · {r.address || 'Nairobi'}</span>
                        </div>
                        <span className="pill blue">In progress</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </section>

          {/* JOB REQUESTS */}
          <section className={`section${activeSection === 'requests' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Job Requests</h1>
                <p>New jobs near you that match your services.</p>
              </div>
            </div>
            {loading.requests && <p>Loading requests...</p>}
            {requests.filter((r) => r.status === 'pending').length === 0 && !loading.requests && (
              <p style={{ color: '#6b6b64' }}>No pending requests</p>
            )}
            {requests
              .filter((r) => r.status === 'pending')
              .map((req) => (
                <div className="req-card" key={req.id}>
                  <div className="info">
                    <h4>{req.description}</h4>
                    <span>
                      {req.customer?.full_name || 'Customer'} · {req.address || 'Nairobi'} · Budget KES{' '}
                      {req.price_offered ? req.price_offered.toLocaleString() : '—'} · Posted{' '}
                      {req.created_at ? new Date(req.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="req-actions">
                    <button className="mini-btn solid-green" onClick={() => handleAccept(req.id)}>Accept</button>
                    <button className="mini-btn solid-red" onClick={() => handleDecline(req.id)}>Decline</button>
                  </div>
                </div>
              ))}
          </section>

          {/* MY JOBS */}
          <section className={`section${activeSection === 'jobs' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">My Jobs</h1>
                <p>Everything on your plate right now.</p>
              </div>
            </div>

            <div className="tabs" id="jobTabs">
              <button
                className={`tab-btn${jobFilter === 'all' ? ' active' : ''}`}
                onClick={() => setJobFilter('all')}
              >
                All
              </button>
              <button
                className={`tab-btn${jobFilter === 'accepted' ? ' active' : ''}`}
                onClick={() => setJobFilter('accepted')}
              >
                In progress
              </button>
              <button
                className={`tab-btn${jobFilter === 'completed' ? ' active' : ''}`}
                onClick={() => setJobFilter('completed')}
              >
                Completed
              </button>
              <button
                className={`tab-btn${jobFilter === 'declined' ? ' active' : ''}`}
                onClick={() => setJobFilter('declined')}
              >
                Declined
              </button>
            </div>

            <div className="table-card">
              <table className="data">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Customer</th>
                    <th>Mtaa</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter((r) => jobFilter === 'all' || r.status === jobFilter)
                    .map((r, i) => (
                    <tr key={i} data-status={r.status}>
                      <td>{r.description}</td>
                      <td>{r.customer?.full_name || '—'}</td>
                      <td>{r.address || '—'}</td>
                      <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                      <td>
                        KES {r.final_price ? r.final_price.toLocaleString() : r.price_offered ? r.price_offered.toLocaleString() : '—'}
                      </td>
                      <td>
                        <span className={`pill ${getRequestPillClass(r.status)}`}>{r.status}</span>
                      </td>
                      <td className="row-actions">
                        {r.status === 'accepted' || r.status === 'in_progress' ? (
                          <button className="mini-btn solid-green" onClick={() => handleMarkComplete(r.id)}>Mark complete</button>
                        ) : r.status === 'pending' ? (
                          <>
                            <button className="mini-btn solid-green" onClick={() => handleAccept(r.id)}>Accept</button>
                            <button className="mini-btn solid-red" onClick={() => handleDecline(r.id)}>Decline</button>
                          </>
                        ) : r.status === 'completed' ? (
                          <span className="pill grey">Rated</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && !loading.requests && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#6b6b64', padding: 24 }}>
                        No jobs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* EARNINGS */}
          <section className={`section${activeSection === 'earnings' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Earnings</h1>
                <p>Track what you've made and what's still clearing.</p>
              </div>
            </div>

            {loading.earnings && <p>Loading earnings...</p>}

            {earnings && (
              <>
                <div className="pay-summary">
                  <div className="kpi">
                    <div className="label">Available balance</div>
                    <div className="val">KES {earnings.available_balance?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="kpi">
                    <div className="label">Pending clearance</div>
                    <div className="val">KES {earnings.pending_clearance?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="kpi">
                    <div className="label">Earned this month</div>
                    <div className="val">KES {earnings.month_earnings?.toLocaleString() || '0'}</div>
                  </div>
                </div>

                <button
                  className="btn accent"
                  style={{ marginBottom: 20 }}
                  onClick={() => showToast('Withdrawal requested')}
                >
                  Withdraw to M-Pesa →
                </button>

                <div className="table-card">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Job</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests
                        .filter((r) => r.status === 'completed')
                        .map((r, i) => (
                          <tr key={i}>
                            <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                            <td>{r.description}</td>
                            <td>{r.customer?.full_name || '—'}</td>
                            <td>
                              KES {r.final_price ? r.final_price.toLocaleString() : r.price_offered ? r.price_offered.toLocaleString() : '—'}
                            </td>
                            <td>
                              <span className="pill green">Cleared</span>
                            </td>
                          </tr>
                        ))}
                      {requests.filter((r) => r.status === 'completed').length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#6b6b64', padding: 24 }}>
                            No completed jobs yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {/* SERVICES & PROFILE */}
          <section className={`section${activeSection === 'services' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Services &amp; Profile</h1>
                <p>What you offer, and how customers see you.</p>
              </div>
            </div>

            <div className="panel-row">
              <div className="panel">
                <div className="panel-head"><h3>My services</h3></div>
                {loading.services && <p>Loading services...</p>}
                <div className="service-list" id="serviceList">
                  {services.map((svc) => (
                    <div className="service-row" key={svc.id}>
                      <span className="name">
                        {svc.category_icon || '🛠️'} {svc.category_name}
                      </span>
                      <span className="price">
                        {svc.price_per_hour ? 'KES ' + svc.price_per_hour.toLocaleString() + '/hr' : '—'}
                      </span>
                      <button className="mini-btn" onClick={() => handleRemoveService(svc.id)}>Remove</button>
                    </div>
                  ))}
                  {services.length === 0 && !loading.services && (
                    <p style={{ color: '#6b6b64' }}>No services added yet</p>
                  )}
                </div>
                <form className="add-service" onSubmit={handleAddService}>
                  <select name="category" required style={{ padding: '10px 13px', border: '2px solid var(--ink)', borderRadius: 6, fontSize: '13.5px', background: 'var(--chalk-dim)' }}>
                    <option value="">Category</option>
                    <option value="1">Plumbing</option>
                    <option value="2">Electrical</option>
                    <option value="3">Cleaning</option>
                    <option value="4">Carpentry</option>
                    <option value="5">Painting</option>
                  </select>
                  <input type="text" name="price" placeholder="Price /hr (KES)" required style={{ padding: '10px 13px', border: '2px solid var(--ink)', borderRadius: 6, fontSize: '13.5px', background: 'var(--chalk-dim)', width: 160 }} />
                  <input type="text" name="desc" placeholder="Description (optional)" style={{ padding: '10px 13px', border: '2px solid var(--ink)', borderRadius: 6, fontSize: '13.5px', background: 'var(--chalk-dim)', flex: 1, minWidth: 200 }} />
                  <button type="submit" className="btn accent">Add</button>
                </form>
              </div>

              <div className="panel">
                <div className="panel-head"><h3>Verification</h3></div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="stamp">VETTED<br />FUNDI</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px' }}>ID verified</div>
                    <div style={{ fontSize: '12.5px', color: '#6b6b64' }}>Approved 14 Jan 2025</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="panel-head"><h3>Profile details</h3></div>
              {loading.profile && <p>Loading profile...</p>}
              {profile && (
                <>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="fp-name">Full name</label>
                      <input id="fp-name" type="text" defaultValue={profile.full_name} />
                    </div>
                    <div className="field">
                      <label htmlFor="fp-phone">Phone number</label>
                      <input id="fp-phone" type="text" defaultValue={profile.phone} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="fp-cat">Primary category</label>
                      <select id="fp-cat" defaultValue="Plumbing">
                        <option>Plumbing</option>
                        <option>Electrical</option>
                        <option>Carpentry</option>
                        <option>Cleaning</option>
                        <option>Painting</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="fp-mtaa">Mtaa you cover</label>
                      <input id="fp-mtaa" type="text" defaultValue={profile.address || ''} />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="fp-bio">Bio</label>
                    <textarea id="fp-bio" defaultValue={profile.bio || ''} />
                  </div>
                  <button className="btn accent" onClick={() => showToast('Profile updated')}>Save changes</button>
                </>
              )}
            </div>
          </section>

          {/* REVIEWS */}
          <section className={`section${activeSection === 'reviews' ? ' active' : ''}`}>
            <div className="page-head">
              <div>
                <h1 className="printed">Reviews</h1>
                <p>What customers are saying about your work.</p>
              </div>
            </div>

            {loading.reviews && <p>Loading reviews...</p>}

            {reviews.length > 0 && (
              <div className="rev-summary">
                <div className="rev-big">
                  <div className="num">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </div>
                  <div className="stars-static">{'★'.repeat(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}</div>
                  <div className="count">
                    {reviews.length} ratings
                  </div>
                </div>
                <div className="rev-breakdown">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div className="hbar-row" key={star}>
                        <div className="cat">{star} stars</div>
                        <div className="hbar-track">
                          <div className="hbar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="v">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {reviews.map((r) => (
              <div className="review-card" key={r.id}>
                <div className="review-top">
                  <span className="who">{r.customer_name}</span>
                  <span className="stars-static">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p>{r.comment || '—'}</p>
                <div className="review-meta">
                  {r.category_name || ''} · {r.address || ''} · {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}

            {reviews.length === 0 && !loading.reviews && (
              <p style={{ color: '#6b6b64' }}>No reviews yet</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;
