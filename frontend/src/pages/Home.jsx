import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

/* ── Intersection Observer hook for scroll reveal ── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const RevealSection = ({ children, className = "", delay = 0 }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-target ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ── Data ── */
const features = [
  {
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    title: "Video Upload",
    desc: "Upload dashcam or phone video of damaged roads with GPS coordinates auto-tagged.",
    stat: "30s",
    statLabel: "avg upload",
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    title: "Live Heatmap",
    desc: "Every report visualized on an interactive heatmap — zoom in to your neighborhood.",
    stat: "Real-time",
    statLabel: "updates",
  },
  {
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "AI Detection",
    desc: "YOLOv8 model detects, classifies, and estimates severity of every pothole detection.",
    stat: "95%+",
    statLabel: "accuracy",
  },
  {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    title: "Smart Contracts",
    desc: "Transparent repair tenders on Ethereum. Lowest bid wins. No backroom deals.",
    stat: "On-chain",
    statLabel: "verified",
  },
];

const stats = [
  { value: "10K+", label: "Potholes Reported" },
  { value: "340+", label: "Cities Covered" },
  { value: "₹2.1Cr", label: "Tenders Processed" },
  { value: "98%", label: "Detection Rate" },
];

const steps = [
  {
    num: "01",
    title: "Record",
    desc: "Capture road damage with your phone or dashcam while driving.",
  },
  {
    num: "02",
    title: "Upload",
    desc: "Submit the footage with GPS coordinates — or let the app auto-detect.",
  },
  {
    num: "03",
    title: "Detect",
    desc: "Our YOLO model identifies potholes, cracks, and severity in real-time.",
  },
  {
    num: "04",
    title: "Repair",
    desc: "Municipalities create transparent blockchain tenders for verified damage.",
  },
];

const Home = () => {
  return (
    <>
      <div>
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative flex items-center justify-center overflow-hidden min-h-screen">
          {/* Background layers */}
          <div className="absolute inset-0 bg-asphalt-950 grid-bg noise-bg" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-asphalt-950 to-transparent z-[2]" />
          {/* Decorative amber glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warn/5 rounded-full blur-[120px] z-[1]" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
            <div className="animate-fade-up">
              <span className="badge badge-warn mb-6 inline-flex">AI + Blockchain Powered</span>
              <h1 className={`${styles.heading} mb-6`}>patch.it</h1>
              <p className="text-lg md:text-xl text-road-light max-w-2xl mx-auto leading-relaxed">
                AI-powered pothole detection meets crowd-sourced reporting. Safer roads, faster
                repairs, transparent tenders — all verified on-chain.
              </p>
            </div>

            <div className="animate-fade-up stagger-3 flex flex-wrap justify-center gap-4 mt-10">
              <Link to="/report" className="btn-primary rounded-full">
                Report a Pothole
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/map" className="btn-secondary rounded-full">
                Explore Map
              </Link>
            </div>

            {/* Stats strip */}
            <div className="animate-fade-up stagger-5 mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white font-display">
                    {s.value}
                  </div>
                  <div className="text-xs text-road mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="w-5 h-8 rounded-full border-2 border-road/30 flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-warn rounded-full" />
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURES ═══════════ */}
        <section className="relative flex items-center bg-asphalt-900 topo-lines min-h-screen">
          <div className="absolute inset-0 noise-bg" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
            <RevealSection>
              <span className="badge badge-warn mb-4">The Platform</span>
              <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
                Four pillars of
                <br />
                <span className="text-warn">smarter infrastructure</span>
              </h2>
              <p className="text-road-light max-w-xl mb-16 text-lg">
                From detection to repair, every step is automated, transparent, and verifiable.
              </p>
            </RevealSection>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <RevealSection key={i} delay={i * 100}>
                  <div className="card p-8 group cursor-default h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-warn/10 flex items-center justify-center text-warn group-hover:bg-warn group-hover:text-asphalt-950 transition-all duration-300">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white font-display">{f.stat}</div>
                        <div className="text-[10px] text-road uppercase tracking-widest">
                          {f.statLabel}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-road-light leading-relaxed">{f.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="relative flex items-center bg-asphalt-950 grid-bg min-h-screen">
          <div className="absolute inset-0 noise-bg" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
            <RevealSection>
              <span className="badge badge-warn mb-4">Process</span>
              <h2 className="text-3xl md:text-5xl font-display text-white mb-16">How it works</h2>
            </RevealSection>

            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <RevealSection key={i} delay={i * 120}>
                  <div className="relative">
                    <div className="text-6xl font-display text-asphalt-700 mb-4">{s.num}</div>
                    {i < 3 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-asphalt-600 to-transparent" />
                    )}
                    <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-road-light leading-relaxed">{s.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>

            {/* Tech stack strip */}
            <RevealSection delay={500}>
              <div className="mt-24 border-t border-asphalt-700/50 pt-12">
                <p className="text-xs text-road uppercase tracking-widest mb-6">Built with</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    "React",
                    "Vite",
                    "Tailwind CSS",
                    "Leaflet",
                    "YOLOv8",
                    "Django",
                    "Web3.js",
                    "Solidity",
                    "MongoDB",
                    "Express",
                  ].map((t) => (
                    <span
                      key={t}
                      className="px-4 py-2 rounded-full border border-asphalt-700 text-sm text-road-light hover:border-warn/50 hover:text-warn transition-colors duration-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ═══════════ CTA ═══════════ */}
        <section className="relative flex items-center justify-center bg-asphalt-900 min-h-[70vh]">
          <div className="absolute inset-0 noise-bg topo-lines" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-warn/5 rounded-full blur-[150px]" />
          <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
            <RevealSection>
              <h2 className="text-3xl md:text-5xl font-display text-white mb-6">
                Ready to make
                <br />
                roads safer?
              </h2>
              <p className="text-road-light text-lg mb-10 max-w-xl mx-auto">
                Join thousands of citizens and municipalities already using Patch-It to detect,
                report, and fix road damage faster than ever.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/report" className="btn-primary rounded-full text-base px-8 py-4">
                  Start Reporting
                </Link>
                <Link to="/bid" className="btn-secondary rounded-full text-base px-8 py-4">
                  View Tenders
                </Link>
              </div>
            </RevealSection>
          </div>
        </section>
      </div>

      {/* ═══════════ FOOTER (outside snap-container) ═══════════ */}
      <footer className="bg-asphalt-950 border-t border-asphalt-800 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-display text-xl text-white mb-3">patch.it</div>
            <p className="text-sm text-road-light leading-relaxed">
              AI-powered road damage detection and transparent repair management.
            </p>
          </div>
          <div>
            <h4 className="text-xs text-road uppercase tracking-widest mb-3">Platform</h4>
            <div className="space-y-2">
              <Link to="/map" className="block text-sm text-road-light hover:text-warn transition">
                Map
              </Link>
              <Link
                to="/report"
                className="block text-sm text-road-light hover:text-warn transition"
              >
                Report
              </Link>
              <Link
                to="/community"
                className="block text-sm text-road-light hover:text-warn transition"
              >
                Community
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs text-road uppercase tracking-widest mb-3">Blockchain</h4>
            <div className="space-y-2">
              <Link to="/bid" className="block text-sm text-road-light hover:text-warn transition">
                Tenders
              </Link>
              <span className="block text-sm text-road-light">Smart Contracts</span>
              <span className="block text-sm text-road-light">Ethereum Network</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs text-road uppercase tracking-widest mb-3">Technology</h4>
            <div className="space-y-2">
              <span className="block text-sm text-road-light">YOLO Detection</span>
              <span className="block text-sm text-road-light">Depth Estimation</span>
              <span className="block text-sm text-road-light">Django ML API</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-asphalt-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-road">
            &copy; {new Date().getFullYear()} Patch-It. Built for safer roads.
          </p>
          <p className="text-xs text-road">React + Vite + Tailwind + Solidity + YOLO</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
