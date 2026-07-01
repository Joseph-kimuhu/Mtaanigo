import LandingNavbar from "../components/LandingNavbar";
import Hero from "../components/Hero";
import { Link } from "react-router-dom";

function SearchStrip() {
  return (
    <section className="px-6 md:px-10 -mt-4 mb-16">
      <div className="max-w-7xl mx-auto fade-up delay-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white border border-ink/[0.07] px-5 py-4 shadow-sm max-w-xl">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5B6760"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search for a service or professional…"
            className="w-full bg-transparent text-[14.5px] font-landing-sans placeholder:text-mute focus:outline-none text-ink"
          />
          <span className="hidden sm:flex items-center gap-1 text-[12.5px] text-mute font-landing-sans shrink-0 border-l border-ink/10 pl-3">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            Nairobi, Kenya
          </span>
        </div>
      </div>
    </section>
  );
}

function PopularServices() {
  const services = [
    { name: "Cleaning", icon: "M5 3v18M19 3v18M5 7h14M5 14h14" },
    { name: "Plumbing", icon: "M3 12h18M3 12a4 4 0 014-4h10a4 4 0 014 4M5 16h.01M19 16h.01" },
    { name: "Electrical", icon: "M13 2L3 14h7l-1 8 11-12h-7l1-8z" },
    { name: "Carpentry", icon: "M14 4l6 6-9 9H5v-6l9-9z" },
    { name: "Car repair", icon: "M3 12h18M3 12a4 4 0 014-4h10a4 4 0 014 4M5 16h.01M19 16h.01" },
    { name: "Beauty", icon: "M3 21l4-4M10 14l-7 7M14.5 6.5a4 4 0 11-5.66-5.66L17 9l4 4-6.5-6.5z" },
    { name: "Painting", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
    { name: "More", icon: "M5 12h14M12 5l7 7-7 7", dots: true },
  ];

  return (
    <section id="services" className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-[13px] font-landing-sans font-semibold text-forest-600 mb-1">Browse</p>
          <h2 className="font-landing-display text-[26px] font-medium text-ink">Popular services</h2>
        </div>
        <a
          href="#"
          className="text-[14px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700 flex items-center gap-1"
        >
          View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {services.map((s) => (
          <a
            key={s.name}
            href="#"
            className="group flex flex-col items-center text-center gap-2.5 rounded-2xl border border-ink/[0.06] bg-white py-6 px-3 hover:border-forest-200 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center group-hover:bg-forest-500 group-hover:text-white transition-colors">
              {s.dots ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="5" cy="5" r="1.6" />
                  <circle cx="12" cy="5" r="1.6" />
                  <circle cx="19" cy="5" r="1.6" />
                  <circle cx="5" cy="12" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="19" cy="12" r="1.6" />
                  <circle cx="5" cy="19" r="1.6" />
                  <circle cx="12" cy="19" r="1.6" />
                  <circle cx="19" cy="19" r="1.6" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={s.icon} />
                </svg>
              )}
            </span>
            <span className="text-[13px] font-landing-sans font-medium text-ink/80">{s.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-forest-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <p className="text-[13px] font-landing-sans font-semibold text-forest-300 mb-2">How it works</p>
        <h2 className="font-landing-display text-[28px] sm:text-[32px] font-medium max-w-md mb-12 text-white">
          Three steps between you and a finished job.
        </h2>

        <div className="grid sm:grid-cols-3 gap-8">
          <div className="border-t border-white/15 pt-5">
            <p className="font-landing-display text-[15px] text-forest-300 mb-3">Search</p>
            <p className="text-[15px] text-white/70 font-landing-sans leading-relaxed">
              Tell us what you need and we&apos;ll match you with vetted pros nearby.
            </p>
          </div>
          <div className="border-t border-white/15 pt-5">
            <p className="font-landing-display text-[15px] text-forest-300 mb-3">Book</p>
            <p className="text-[15px] text-white/70 font-landing-sans leading-relaxed">
              Compare ratings and prices, then schedule a time that works for you.
            </p>
          </div>
          <div className="border-t border-white/15 pt-5">
            <p className="font-landing-display text-[15px] text-forest-300 mb-3">Relax</p>
            <p className="text-[15px] text-white/70 font-landing-sans leading-relaxed">
              Your pro shows up, does the job, and you pay securely through the app.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ForProfessionals() {
  const benefits = [
    {
      title: "More customers",
      desc: "Get discovered by thousands of customers searching for services in your area.",
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      title: "Flexible work",
      desc: "Choose the jobs that fit your schedule and availability. Work when you want.",
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      title: "Secure payouts",
      desc: "Receive fast, reliable payments directly to your account after every job.",
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M16 14h.01M2 10h20" />
        </svg>
      ),
    },
  ];

  return (
    <section id="for-professionals" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-[13px] font-landing-sans font-semibold text-forest-600 mb-2">For professionals</p>
          <h2 className="font-landing-display text-[26px] sm:text-[32px] font-medium text-ink mb-4">
            Grow your business with MtaaniGo
          </h2>
          <p className="text-[15px] text-mute font-landing-sans leading-relaxed">
            Whether you&apos;re a plumber, cleaner, or handyman — we connect you with nearby customers looking for your skills.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-ink/[0.06] bg-sand-50 p-6 text-center hover:border-forest-200 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto mb-4 group-hover:bg-forest-500 group-hover:text-white transition-colors">
                {item.svg}
              </div>
              <h3 className="font-landing-display text-[18px] font-medium text-ink mb-2">{item.title}</h3>
              <p className="text-[14px] text-mute font-landing-sans leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-forest-500 hover:bg-forest-600 text-white font-landing-sans font-semibold text-[15px] px-8 py-3.5 shadow-[0_10px_24px_-8px_rgba(20,108,67,0.55)] transition-colors"
          >
            Start earning today
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutUs() {
  const stats = [
    { value: "10K+", label: "Happy customers" },
    { value: "5K+", label: "Verified pros" },
    { value: "50+", label: "Service categories" },
    { value: "4.8", label: "Average rating" },
  ];

  return (
    <section id="about" className="bg-sand-50/60 border-t border-ink/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[13px] font-landing-sans font-semibold text-forest-600 mb-2">About us</p>
            <h2 className="font-landing-display text-[26px] sm:text-[32px] font-medium text-ink mb-4">
              Built for the neighbourhood
            </h2>
            <p className="text-[15px] text-mute font-landing-sans leading-relaxed mb-4">
              MtaaniGo was born from a simple idea: every community deserves easy access to trusted professionals. We started in Nairobi with a mission to make home services as easy as ordering a ride.
            </p>
            <p className="text-[15px] text-mute font-landing-sans leading-relaxed">
              Today, we connect customers with verified pros across multiple categories — all with vetted profiles, fair pricing, and secure payments.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white border border-ink/[0.06] p-5 text-center hover:shadow-md hover:shadow-forest-900/5 transition-all">
                <p className="font-landing-display text-[28px] font-semibold text-ink">{stat.value}</p>
                <p className="text-[13px] text-mute font-landing-sans mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-mute font-landing-sans">
        <p>© 2026 MtaaniGo. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-ink transition-colors">Privacy</a>
          <a href="#" className="hover:text-ink transition-colors">Terms</a>
          <a href="#" className="hover:text-ink transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <Hero />
      <SearchStrip />
      <PopularServices />
      <HowItWorks />
      <ForProfessionals />
      <AboutUs />
      <LandingFooter />
    </>
  );
}
