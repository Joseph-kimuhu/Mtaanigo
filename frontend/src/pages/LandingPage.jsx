import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <style>{`
        :root{
          --chalk:#FBF8F2;
          --chalk-dim:#F1ECE1;
          --ink:#1A1A18;
          --red:#D7263D;
          --green:#1B7340;
          --ochre:#E8A33D;
          --blue:#3E6C7A;
          --paper-edge: rgba(26,26,24,0.12);
        }

        *{box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{
          margin:0;
          background:var(--chalk);
          color:var(--ink);
          font-family:'Work Sans', sans-serif;
          -webkit-font-smoothing:antialiased;
          overflow-x:hidden;
        }
        img,svg{display:block;}
        a{color:inherit;text-decoration:none;}
        ul{margin:0;padding:0;list-style:none;}

        .wrap{max-width:1180px;margin:0 auto;padding:0 28px;}

        :focus-visible{outline:3px solid var(--blue); outline-offset:2px;}

        .display{
          font-family:'Anton', sans-serif;
          text-transform:uppercase;
          letter-spacing:0.01em;
          line-height:0.96;
          font-weight:400;
        }
        .mono{
          font-family:'IBM Plex Mono', monospace;
          text-transform:uppercase;
          letter-spacing:0.06em;
          font-weight:600;
        }

        .printed{
          color:var(--ink);
          text-shadow: 7px 7px 0 var(--red);
          display:inline-block;
        }
        .printed.small{ text-shadow: 4px 4px 0 var(--ochre); }
        @media (max-width:640px){
          .printed{ text-shadow: 4px 4px 0 var(--red); }
          .printed.small{ text-shadow: 3px 3px 0 var(--ochre); }
        }

        .stamp{
          width:64px;height:64px;
          border-radius:50%;
          border:2.5px dashed var(--green);
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          color:var(--green);
          font-size:9px;
          line-height:1.15;
          transform:rotate(-9deg);
          flex-shrink:0;
          background:var(--chalk);
        }

        .btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:14px 26px;
          border:2.5px solid var(--ink);
          border-radius:6px;
          font-family:'IBM Plex Mono', monospace;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.05em;
          font-size:13px;
          cursor:pointer;
          background:var(--ink);
          color:var(--chalk);
          transition:transform 0.15s ease;
        }
        .btn:hover{ transform:translate(-2px,-2px); }
        .btn.outline{ background:transparent; color:var(--ink); }
        .btn.red{ background:var(--red); border-color:var(--ink); color:var(--chalk); }

        header{
          position:sticky;top:0;z-index:50;
          background:var(--chalk);
          border-bottom:3px solid var(--ink);
        }
        nav{
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 0;
        }
        .logo{
          font-family:'Anton', sans-serif;
          text-transform:uppercase;
          font-size:24px;
          letter-spacing:0.02em;
        }
        .logo span{color:var(--red);}
        .nav-links{display:flex;gap:24px;align-items:center;}
        .nav-links a{
          font-family:'IBM Plex Mono', monospace;
          font-size:12.5px;
          text-transform:uppercase;
          letter-spacing:0.05em;
        }
        .nav-links .nav-auth{
          font-family:'IBM Plex Mono', monospace;
          font-size:12.5px;
          text-transform:uppercase;
          letter-spacing:0.05em;
          padding:6px 14px;
          border:2px solid var(--ink);
          border-radius:4px;
          background:transparent;
          color:var(--ink);
        }
        .nav-links .nav-auth:hover{background:var(--ink);color:var(--chalk);}
        .nav-links a:hover{color:var(--red);}
        .nav-cta{display:flex;}
        .burger{display:none;background:none;border:none;cursor:pointer;}
        @media (max-width:760px){
          .nav-links{display:none;}
          .nav-cta .btn span.full{display:none;}
        }

        .hero{
          position:relative;
          padding:64px 0 40px;
          border-bottom:3px solid var(--ink);
          background:
            radial-gradient(circle at 92% 10%, rgba(232,163,61,0.18) 0, transparent 45%),
            radial-gradient(circle at 4% 90%, rgba(27,115,64,0.14) 0, transparent 40%);
        }
        .hero-grid{
          display:grid;
          grid-template-columns:1.15fr 0.85fr;
          gap:48px;
          align-items:start;
        }
        .eyebrow{
          font-family:'IBM Plex Mono', monospace;
          font-size:12.5px;
          text-transform:uppercase;
          letter-spacing:0.12em;
          color:var(--red);
          margin:0 0 14px;
          display:flex;align-items:center;gap:8px;
        }
        .eyebrow::before{content:"●";font-size:9px;}
        .hero h1{
          font-size:clamp(42px,6.2vw,76px);
          margin:0 0 22px;
        }
        .hero p.lead{
          font-size:18px;
          max-width:480px;
          line-height:1.55;
          color:#3a3a36;
          margin:0 0 28px;
        }
        .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:36px;}

        .search-board{
          background:var(--chalk);
          border:3px solid var(--ink);
          border-radius:10px;
          padding:22px;
          transform:rotate(-1.1deg);
          box-shadow:8px 8px 0 var(--ink);
        }
        .search-board .mono.tag{
          font-size:11px;color:var(--ink);
          background:var(--ochre);
          display:inline-block;
          padding:4px 10px;
          border-radius:4px;
          margin-bottom:14px;
          transform:rotate(1.4deg);
        }
        .field{margin-bottom:14px;}
        .field label{
          display:block;
          font-family:'IBM Plex Mono', monospace;
          font-size:10.5px;
          text-transform:uppercase;
          letter-spacing:0.06em;
          color:#6b6b64;
          margin-bottom:6px;
        }
        .field select, .field input{
          width:100%;
          padding:12px 14px;
          border:2px solid var(--ink);
          border-radius:6px;
          background:#fff;
          font-family:'Work Sans',sans-serif;
          font-size:15px;
          color:var(--ink);
          appearance:none;
        }
        .search-board .btn{width:100%;justify-content:center;margin-top:6px;}

        .ticker-wrap{
          border-top:2px solid var(--ink);
          border-bottom:2px solid var(--ink);
          background:var(--ink);
          overflow:hidden;
          margin-top:18px;
        }
        .ticker{
          display:flex;
          gap:36px;
          white-space:nowrap;
          padding:10px 0;
          font-family:'IBM Plex Mono', monospace;
          font-size:12.5px;
          color:var(--chalk);
          text-transform:uppercase;
          letter-spacing:0.06em;
          animation:scroll-left 26s linear infinite;
          width:max-content;
        }
        .ticker span::after{content:"•";margin-left:36px;color:var(--ochre);}
        @keyframes scroll-left{
          from{transform:translateX(0);}
          to{transform:translateX(-50%);}
        }
        @media (prefers-reduced-motion:reduce){
          .ticker{animation:none;}
        }

        .trust-strip{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:0;
          margin-top:42px;
          border-top:2px solid var(--paper-edge);
          padding-top:28px;
        }
        .trust-strip div{padding-right:18px;}
        .trust-strip .num{
          font-family:'Anton',sans-serif;
          font-size:34px;
          color:var(--ink);
        }
        .trust-strip .label{
          font-family:'IBM Plex Mono', monospace;
          font-size:11.5px;
          color:#6b6b64;
          text-transform:uppercase;
          letter-spacing:0.04em;
          margin-top:4px;
        }

        .section{padding:70px 0;border-bottom:3px solid var(--ink);}
        .section:last-of-type{border-bottom:none;}
        .section-head{
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          margin-bottom:38px;
          gap:24px;
          flex-wrap:wrap;
        }
        .section-head h2{
          font-size:clamp(30px,4vw,46px);
          margin:0;
        }
        .section-head p{
          max-width:380px;
          color:#5b5b56;
          font-size:15px;
          line-height:1.5;
          margin:0;
        }

        .cat-grid{
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:14px;
        }
        .cat-tile{
          border:2.5px solid var(--ink);
          border-radius:8px;
          padding:22px 16px;
          background:var(--chalk);
          transition:transform 0.15s ease;
          cursor:pointer;
        }
        .cat-tile:hover{transform:translateY(-4px);}
        .cat-tile .icon{font-size:26px;margin-bottom:10px;}
        .cat-tile .name{
          font-family:'IBM Plex Mono', monospace;
          font-size:12.5px;
          text-transform:uppercase;
          letter-spacing:0.04em;
          font-weight:600;
        }
        .cat-tile .swahili{
          font-size:11.5px;
          color:#6b6b64;
          margin-top:3px;
          font-style:italic;
        }
        .cat-tile.c1{background:#FBEDEE;border-color:var(--red);}
        .cat-tile.c2{background:#EAF3EC;border-color:var(--green);}
        .cat-tile.c3{background:#FBF1E2;border-color:var(--ochre);}
        .cat-tile.c4{background:#EAF1F2;border-color:var(--blue);}

        .steps{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:24px;
        }
        .step{
          border:2.5px solid var(--ink);
          border-radius:10px;
          padding:30px 26px;
          position:relative;
          background:var(--chalk);
        }
        .step .step-num{
          font-family:'Anton',sans-serif;
          font-size:54px;
          color:var(--paper-edge);
          position:absolute;
          top:10px;right:18px;
          line-height:1;
        }
        .step h3{
          font-family:'Anton',sans-serif;
          text-transform:uppercase;
          font-size:20px;
          margin:0 0 10px;
          max-width:80%;
        }
        .step p{
          font-size:14.5px;
          line-height:1.55;
          color:#4a4a45;
          margin:0;
        }

        .fundi-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:18px;
        }
        .fundi-card{
          border:2.5px solid var(--ink);
          border-radius:10px;
          padding:22px;
          background:var(--chalk);
        }
        .fundi-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
        .avatar{
          width:54px;height:54px;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-family:'Anton',sans-serif;
          font-size:18px;
          color:var(--chalk);
          border:2px solid var(--ink);
        }
        .fundi-card h4{
          margin:14px 0 2px;
          font-size:17px;
          font-weight:700;
        }
        .fundi-role{
          font-family:'IBM Plex Mono', monospace;
          font-size:11px;
          text-transform:uppercase;
          color:var(--red);
          letter-spacing:0.04em;
          margin:0 0 12px;
        }
        .fundi-meta{
          display:flex;justify-content:space-between;
          font-size:12.5px;
          color:#5b5b56;
          border-top:1.5px dashed var(--paper-edge);
          padding-top:12px;
        }
        .fundi-meta .stars{color:var(--ochre);}

        .testi-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
        }
        .testi{
          border:2.5px solid var(--ink);
          border-radius:10px;
          padding:26px;
          background:var(--chalk-dim);
        }
        .testi p.quote{
          font-size:15.5px;
          line-height:1.6;
          margin:0 0 18px;
        }
        .testi .who{
          font-family:'IBM Plex Mono', monospace;
          font-size:11.5px;
          text-transform:uppercase;
          letter-spacing:0.04em;
          color:#5b5b56;
        }

        .dual{
          display:grid;
          grid-template-columns:1fr 1fr;
        }
        .dual > div{
          padding:62px 44px;
          position:relative;
        }
        .dual .left{background:var(--ink);color:var(--chalk);}
        .dual .right{background:var(--red);color:var(--chalk);}
        .dual h3{
          font-size:clamp(24px,3.4vw,34px);
          margin:0 0 12px;
        }
        .dual p{
          font-size:15px;
          max-width:340px;
          opacity:0.85;
          margin:0 0 24px;
          line-height:1.5;
        }
        .dual .btn{border-color:var(--chalk);}
        .dual .left .btn{background:var(--chalk);color:var(--ink);}
        .dual .right .btn{background:var(--ink);color:var(--chalk);border-color:var(--ink);}

        footer{padding:54px 0 28px;background:var(--ink);color:var(--chalk);}
        .foot-grid{
          display:grid;
          grid-template-columns:1.4fr 1fr 1fr 1fr;
          gap:32px;
          margin-bottom:40px;
        }
        .foot-grid h5{
          font-family:'IBM Plex Mono', monospace;
          font-size:11.5px;
          text-transform:uppercase;
          letter-spacing:0.06em;
          color:var(--ochre);
          margin:0 0 14px;
        }
        .foot-grid li{margin-bottom:9px;font-size:14px;color:#d8d6cd;}
        .foot-grid li:hover{color:var(--chalk);}
        .foot-brand .logo{color:var(--chalk);}
        .foot-brand .logo span{color:var(--ochre);}
        .foot-brand p{font-size:13.5px;color:#a9a79d;max-width:280px;line-height:1.5;margin-top:14px;}
        .foot-bottom{
          border-top:1px solid #38382f;
          padding-top:22px;
          display:flex;justify-content:space-between;
          font-size:12.5px;color:#8d8b82;
          flex-wrap:wrap;gap:10px;
        }

        @media (max-width:980px){
          .hero-grid{grid-template-columns:1fr;}
          .trust-strip{grid-template-columns:repeat(2,1fr);row-gap:22px;}
          .cat-grid{grid-template-columns:repeat(3,1fr);}
          .steps{grid-template-columns:1fr;}
          .fundi-grid{grid-template-columns:repeat(2,1fr);}
          .testi-grid{grid-template-columns:1fr;}
          .dual{grid-template-columns:1fr;}
          .foot-grid{grid-template-columns:1fr 1fr;}
        }
        @media (max-width:560px){
          .cat-grid{grid-template-columns:repeat(2,1fr);}
          .fundi-grid{grid-template-columns:1fr;}
          .section{padding:50px 0;}
          .wrap{padding:0 18px;}
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />

      <header>
        <div className="wrap">
          <nav>
            <div className="logo">Mtaa<span>nigo</span></div>
            <div className="nav-links">
              <a href="#how">How it works</a>
              <a href="#categories">Categories</a>
              <a href="#fundis">Fundis</a>
              <a href="#join">For fundis</a>
              <Link to="/login" className="nav-auth">Log in</Link>
              <Link to="/register" className="btn outline">Sign up</Link>
            </div>
            <div className="nav-cta">
              <Link to="#search" className="btn red"><span className="full">Find a fundi</span><span>→</span></Link>
            </div>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">Sasa hivi · 48 mtaa, one app</p>
            <h1 className="display">
              Find your <span className="printed">fundi.</span><br />
              Right in your <span className="printed small">mtaa.</span>
            </h1>
            <p className="lead">From leaking pipes to last-minute catering, Mtaanigo matches you with vetted workers near you — see ratings, prices and how fast they can get there, before you commit.</p>
            <div className="hero-actions">
              <Link to="#search" className="btn red">Find a fundi</Link>
              <Link to="#join" className="btn outline">Earn as a fundi</Link>
            </div>
            <div className="ticker-wrap">
              <div className="ticker">
                <span>Plumbing</span><span>Electrical</span><span>Cleaning</span><span>Painting</span><span>Moving</span><span>Carpentry</span><span>Gardening</span><span>Tutoring</span><span>Beauty &amp; Hair</span><span>Catering</span><span>Mechanic</span><span>Tailoring</span>
                <span>Plumbing</span><span>Electrical</span><span>Cleaning</span><span>Painting</span><span>Moving</span><span>Carpentry</span><span>Gardening</span><span>Tutoring</span><span>Beauty &amp; Hair</span><span>Catering</span><span>Mechanic</span><span>Tailoring</span>
              </div>
            </div>
            <div className="trust-strip">
              <div><div className="num">12.4K+</div><div className="label">Fundis vetted</div></div>
              <div><div className="num">48</div><div className="label">Mtaa covered</div></div>
              <div><div className="num">4.8★</div><div className="label">Average rating</div></div>
              <div><div className="num">15min</div><div className="label">Avg. response</div></div>
            </div>
          </div>

          <div id="search" className="search-board">
            <span className="mono tag">Tafuta fundi</span>
            <div className="field">
              <label htmlFor="service">What do you need done?</label>
              <select id="service">
                <option>Plumbing — Mabomba</option>
                <option>Electrical — Umeme</option>
                <option>Cleaning — Usafi</option>
                <option>Painting — Rangi</option>
                <option>Moving — Mizigo</option>
                <option>Tutoring — Masomo</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="mtaa">Your mtaa</label>
              <input id="mtaa" type="text" placeholder="e.g. Kilimani, Kawangware, Embakasi" />
            </div>
            <div className="field">
              <label htmlFor="when">When do you need it?</label>
              <select id="when">
                <option>As soon as possible</option>
                <option>Today</option>
                <option>This week</option>
                <option>I'm just browsing</option>
              </select>
            </div>
            <button className="btn red" type="button">Tafuta sasa →</button>
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display">Kazi <span className="printed small">zote</span> hapa.</h2>
            <p>Every kind of job your mtaa needs, sorted into one board. Tap a category to see who's available nearby right now.</p>
          </div>
          <div className="cat-grid">
            <div className="cat-tile c1"><div className="icon">🔧</div><div className="name">Plumbing</div><div className="swahili">Mabomba</div></div>
            <div className="cat-tile c2"><div className="icon">⚡</div><div className="name">Electrical</div><div className="swahili">Umeme</div></div>
            <div className="cat-tile c3"><div className="icon">🧹</div><div className="name">Cleaning</div><div className="swahili">Usafi</div></div>
            <div className="cat-tile c4"><div className="icon">🎨</div><div className="name">Painting</div><div className="swahili">Rangi</div></div>
            <div className="cat-tile c1"><div className="icon">📦</div><div className="name">Moving</div><div className="swahili">Mizigo</div></div>
            <div className="cat-tile c2"><div className="icon">🪚</div><div className="name">Carpentry</div><div className="swahili">Useremala</div></div>
            <div className="cat-tile c3"><div className="icon">🌱</div><div className="name">Gardening</div><div className="swahili">Bustani</div></div>
            <div className="cat-tile c4"><div className="icon">📚</div><div className="name">Tutoring</div><div className="swahili">Masomo</div></div>
            <div className="cat-tile c1"><div className="icon">💇</div><div className="name">Beauty &amp; Hair</div><div className="swahili">Urembo</div></div>
            <div className="cat-tile c2"><div className="icon">🍲</div><div className="name">Catering</div><div className="swahili">Chakula</div></div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display">How it <span className="printed small">works.</span></h2>
            <p>Three steps from "I need help" to a fundi at your door.</p>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <h3>Post the job</h3>
              <p>Tell us what needs doing, which mtaa you're in, and when. Takes under a minute, no account needed to browse.</p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <h3>Get matched nearby</h3>
              <p>See vetted fundis close to you, with real ratings, completed jobs, prices and how fast they can show up.</p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <h3>Hire, pay, rate</h3>
              <p>Pay safely through the app once the job's done, then leave a rating that helps the rest of your mtaa.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="fundis">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display">Fundis near <span className="printed small">you.</span></h2>
            <p>A handful of vetted workers active in Nairobi mtaa this week.</p>
          </div>
          <div className="fundi-grid">
            <div className="fundi-card">
              <div className="fundi-top">
                <div className="avatar" style={{ background: 'var(--red)' }}>OK</div>
                <div className="stamp">VETTED<br />FUNDI</div>
              </div>
              <h4>Otieno K.</h4>
              <p className="fundi-role">Plumbing · Kawangware</p>
              <div className="fundi-meta"><span className="stars">★ 4.9</span><span>312 jobs</span><span>~12 min</span></div>
            </div>
            <div className="fundi-card">
              <div className="fundi-top">
                <div className="avatar" style={{ background: 'var(--green)' }}>AW</div>
                <div className="stamp">VETTED<br />FUNDI</div>
              </div>
              <h4>Amina W.</h4>
              <p className="fundi-role">Cleaning · Kilimani</p>
              <div className="fundi-meta"><span className="stars">★ 5.0</span><span>540 jobs</span><span>~8 min</span></div>
            </div>
            <div className="fundi-card">
              <div className="fundi-top">
                <div className="avatar" style={{ background: 'var(--blue)' }}>BM</div>
                <div className="stamp">VETTED<br />FUNDI</div>
              </div>
              <h4>Brian M.</h4>
              <p className="fundi-role">Electrical · Embakasi</p>
              <div className="fundi-meta"><span className="stars">★ 4.7</span><span>198 jobs</span><span>~20 min</span></div>
            </div>
            <div className="fundi-card">
              <div className="fundi-top">
                <div className="avatar" style={{ background: 'var(--ochre)' }}>FN</div>
                <div className="stamp">VETTED<br />FUNDI</div>
              </div>
              <h4>Faith N.</h4>
              <p className="fundi-role">Tutoring · Westlands</p>
              <div className="fundi-meta"><span className="stars">★ 4.9</span><span>87 jobs</span><span>~30 min</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display">Sema <span className="printed small">mtaa.</span></h2>
            <p>What people are saying after their first job on Mtaanigo.</p>
          </div>
          <div className="testi-grid">
            <div className="testi">
              <p className="quote">"My bathroom pipe burst on a Sunday night. I posted the job and had a plumber at my gate in twenty minutes."</p>
              <div className="who">— Sina K., Kilimani</div>
            </div>
            <div className="testi">
              <p className="quote">"I compared three painters before picking one, all without leaving the house. Saved me a full afternoon of calling around."</p>
              <div className="who">— David O., South B</div>
            </div>
            <div className="testi">
              <p className="quote">"As a fundi, I get more jobs in my own mtaa now than I used to get walking around asking shops if they need help."</p>
              <div className="who">— Mary A., Electrician</div>
            </div>
          </div>
        </div>
      </section>

      <section className="dual" id="join">
        <div className="left">
          <h3 className="display">Need something done?</h3>
          <p>Post a job and see who's nearby in minutes. No calling around, no guesswork on price.</p>
          <Link to="#search" className="btn">Find a fundi →</Link>
        </div>
        <div className="right">
          <h3 className="display">Got a skill?</h3>
          <p>List your services, set your own hours, and get matched with jobs in your own mtaa.</p>
          <a href="#" className="btn">Join as a fundi →</a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="logo">Mtaa<span>nigo</span></div>
              <p>Connecting every mtaa to the workers who keep it running — vetted, rated, and just around the corner.</p>
            </div>
            <div>
              <h5>For customers</h5>
              <ul>
                <li>Find a fundi</li>
                <li>How pricing works</li>
                <li>Safety &amp; vetting</li>
                <li>Help centre</li>
              </ul>
            </div>
            <div>
              <h5>For fundis</h5>
              <ul>
                <li>Join Mtaanigo</li>
                <li>How payouts work</li>
                <li>Fundi resources</li>
                <li>Success stories</li>
              </ul>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Mtaanigo. Made for every mtaa.</span>
            <span>Nairobi · Mombasa · Kisumu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
