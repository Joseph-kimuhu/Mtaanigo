import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      const sections = [
        { id: "services" },
        { id: "how" },
        { id: "for-professionals" },
        { id: "about" },
      ];
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveHash(section.id);
            return;
          }
        }
      }
      setActiveHash("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback((e, hash) => {
    setMobileOpen(false);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `/#${hash}`);
      }
    }
  }, []);

  const navLinks = [
    { to: "/", label: "Home", hash: "" },
    { to: "/#services", label: "Services", hash: "services" },
    { to: "/#how", label: "How it works", hash: "how" },
    { to: "/#for-professionals", label: "For professionals", hash: "for-professionals" },
    { to: "/#about", label: "About us", hash: "about" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-sand-50/95 backdrop-blur-md border-b border-ink/[0.08] shadow-sm"
          : "bg-sand-50/85 backdrop-blur border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-landing-display text-[22px] font-semibold tracking-tight text-ink"
        >
          <span className="w-7 h-7 rounded-lg bg-forest-500 text-white flex items-center justify-center text-[13px] font-landing-sans font-bold">
            M
          </span>
          Mtaani<span className="text-forest-500">Go</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[14.5px] font-landing-sans font-medium">
          {navLinks.map((link) => {
            const isActive =
              link.hash === ""
                ? activeHash === ""
                : activeHash === link.hash;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.hash)}
                className={`group relative py-1.5 inline-block ${
                  isActive ? "text-ink font-semibold" : "text-ink/60 hover:text-ink"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[2px] bg-forest-500 rounded-full transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-ink/15 hover:border-ink/30 hover:bg-white hover:shadow-sm transition-all font-landing-sans font-semibold text-[14.5px] px-5 py-2.5 text-ink/80"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-forest-500 hover:bg-forest-600 hover:shadow-[0_10px_22px_-8px_rgba(20,108,67,0.55)] transition-all text-white text-[14.5px] font-landing-sans font-semibold px-5 py-2.5 shadow-[0_6px_16px_-6px_rgba(20,108,67,0.55)]"
          >
            Sign up
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-ink/5 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg
            className="w-5 h-5 text-ink transition-transform duration-300"
            style={{ transform: mobileOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-ink/[0.06] bg-sand-50/98 backdrop-blur-md ${
          mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 md:px-10 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.hash === ""
                ? activeHash === ""
                : activeHash === link.hash;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.hash)}
                className={`text-left py-3 px-4 rounded-xl text-[15px] font-landing-sans font-medium transition-colors ${
                  isActive
                    ? "bg-forest-50 text-forest-700"
                    : "text-ink/70 hover:bg-ink/[0.03] hover:text-ink"
                }`}
              >
                <span className="flex items-center justify-between">
                  {link.label}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-500 shrink-0" />
                  )}
                </span>
              </Link>
            );
          })}
          <div className="mt-4 flex flex-col gap-3 px-4 pb-4">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-ink/15 text-center px-5 py-3 text-ink/80 font-landing-sans font-semibold text-[14.5px] hover:border-ink/30 hover:bg-white transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-forest-500 text-center px-5 py-3 text-white font-landing-sans font-semibold text-[14.5px] shadow-[0_6px_16px_-6px_rgba(20,108,67,0.55)] hover:bg-forest-600 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
