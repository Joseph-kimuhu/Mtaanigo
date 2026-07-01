import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
        {/* LEFT */}
        <div className="fade-up delay-1">
          <span className="inline-flex items-center gap-2 text-[13px] font-landing-sans font-semibold text-forest-600 bg-forest-50 border border-forest-100 rounded-full px-3.5 py-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 7v5l3 3" />
            </svg>
            Trusted pros, booked in minutes
          </span>

          <h1 className="font-landing-display font-medium leading-[1.04] text-[44px] sm:text-[56px] md:text-[60px] tracking-tight mt-6 text-ink">
            All the services
            <br />
            you need,
            <br />
            <span className="text-forest-500 italic">right in your</span>
            <br />
            <span className="text-forest-500 italic">neighborhood.</span>
          </h1>

          <p className="mt-6 text-[17px] text-mute font-landing-sans max-w-md leading-relaxed">
            Find trusted professionals for any job — cleaning, repairs, beauty and more.
            Fast, reliable, and affordable, just down the street.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/request"
              className="rounded-full bg-forest-500 hover:bg-forest-600 transition-colors text-white font-landing-sans font-semibold text-[15px] px-7 py-3.5 shadow-[0_10px_24px_-8px_rgba(20,108,67,0.55)]"
            >
              Book a service
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-ink/15 hover:border-ink/30 hover:bg-white transition-colors font-landing-sans font-semibold text-[15px] px-7 py-3.5 text-ink/80"
            >
              Join as a professional
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-4 gap-6 max-w-md">
            <div>
              <p className="font-landing-display text-[24px] font-semibold text-ink">10K+</p>
              <p className="text-[12.5px] text-mute mt-0.5 font-landing-sans">Happy customers</p>
            </div>
            <div>
              <p className="font-landing-display text-[24px] font-semibold text-ink">5K+</p>
              <p className="text-[12.5px] text-mute mt-0.5 font-landing-sans">Verified pros</p>
            </div>
            <div>
              <p className="font-landing-display text-[24px] font-semibold text-ink">50+</p>
              <p className="text-[12.5px] text-mute mt-0.5 font-landing-sans">Services</p>
            </div>
            <div>
              <p className="font-landing-display text-[24px] font-semibold text-ink">24/7</p>
              <p className="text-[12.5px] text-mute mt-0.5 font-landing-sans">Support</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative fade-up delay-2">
          <div className="relative aspect-square max-w-[480px] mx-auto rounded-[28px] bg-forest-50 grain border border-forest-100 overflow-hidden">
            {/* grid lines */}
            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
              <path d="M0 90 H400 M0 200 H400 M0 310 H400" stroke="#0F1E17" strokeOpacity="0.06" strokeWidth="2" />
              <path d="M110 0 V400 M260 0 V400" stroke="#0F1E17" strokeOpacity="0.06" strokeWidth="2" />
              <g fill="#1A7F4B" fillOpacity="0.12">
                <rect x="20" y="20" width="70" height="50" rx="6" />
                <rect x="130" y="115" width="110" height="65" rx="6" />
                <rect x="280" y="20" width="100" height="55" rx="6" />
                <rect x="20" y="230" width="70" height="60" rx="6" />
                <rect x="280" y="220" width="100" height="70" rx="6" />
                <rect x="150" y="320" width="100" height="60" rx="6" />
              </g>
            </svg>

            {/* pins */}
            <div className="absolute float-1" style={{ top: "14%", left: "20%" }}>
              <div className="relative w-10 h-10 rounded-full bg-clay-500 text-white flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M13 2L3 14h7l-1 8 11-12h-7l1-8z" />
                </svg>
              </div>
            </div>
            <div className="absolute float-2" style={{ top: "38%", left: "58%" }}>
              <div className="w-10 h-10 rounded-full bg-forest-500 text-white flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 4l6 6-9 9H5v-6l9-9z" />
                </svg>
              </div>
            </div>
            <div className="absolute float-3" style={{ top: "62%", left: "18%" }}>
              <div className="w-10 h-10 rounded-full bg-[#3A6FB0] text-white flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 12h18M3 12a4 4 0 014-4h10a4 4 0 014 4M5 16h.01M19 16h.01" />
                </svg>
              </div>
            </div>
            <div className="absolute float-1" style={{ top: "72%", left: "62%" }}>
              <div className="w-10 h-10 rounded-full bg-[#C2554F] text-white flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 21l4-4M10 14l-7 7M14.5 6.5a4 4 0 11-5.66-5.66L17 9l4 4-6.5-6.5z" />
                </svg>
              </div>
            </div>

            {/* center "you are here" */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 rounded-full bg-forest-500/40 pin-ring" />
                <div className="absolute inset-[5px] rounded-full bg-forest-600 border-2 border-white" />
              </div>
            </div>
          </div>

          {/* floating provider cards */}
          <div className="hidden sm:flex absolute -right-4 top-2 items-center gap-2.5 bg-white rounded-2xl pl-2 pr-3.5 py-2 shadow-lg shadow-ink/5 border border-ink/[0.04] float-2">
            <div className="w-9 h-9 rounded-full bg-forest-100" />
            <div>
              <p className="text-[12.5px] font-landing-sans font-semibold leading-tight text-ink">Electrician</p>
              <p className="text-[11px] text-amber-600 flex items-center gap-0.5 font-landing-sans">
                ★ 4.8 <span className="text-mute">(230)</span>
              </p>
            </div>
          </div>
          <div className="hidden sm:flex absolute -left-6 bottom-10 items-center gap-2.5 bg-white rounded-2xl pl-2 pr-3.5 py-2 shadow-lg shadow-ink/5 border border-ink/[0.04] float-3">
            <div className="w-9 h-9 rounded-full bg-forest-100" />
            <div>
              <p className="text-[12.5px] font-landing-sans font-semibold leading-tight text-ink">Cleaner</p>
              <p className="text-[11px] text-amber-600 flex items-center gap-0.5 font-landing-sans">
                ★ 4.7 <span className="text-mute">(150)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
