import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import {
  RevealOnScroll,
  useGlobalScroll,
} from "../hooks/useScrollAnimations";

/* ── Data ── */
const features = [
  {
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    title: "Video Upload",
    desc: "Upload dashcam or phone video of damaged roads. GPS coordinates auto-tagged from device.",
    tag: "30s avg",
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    title: "Live Heatmap",
    desc: "Every report plotted on an interactive dark-tile map. Real-time severity visualization.",
    tag: "Real-time",
  },
  {
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "AI Detection",
    desc: "YOLOv8 detects, classifies, and estimates severity of every pothole automatically.",
    tag: "95%+ acc",
  },
  {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    title: "Smart Contracts",
    desc: "Transparent repair tenders on Ethereum. Lowest bid wins — no backroom deals.",
    tag: "On-chain",
  },
];

const stats = [
  { value: "10K+", label: "Potholes Reported" },
  { value: "340+", label: "Cities Covered" },
  { value: "₹2.1Cr", label: "Tenders Processed" },
  { value: "98%", label: "Detection Rate" },
];

const steps = [
  { num: "01", title: "Record", desc: "Capture road damage with your phone or dashcam while driving." },
  { num: "02", title: "Upload", desc: "Submit the footage with GPS coordinates — or let the app auto-detect." },
  { num: "03", title: "Detect", desc: "YOLO model identifies potholes, cracks, and severity in real-time." },
  { num: "04", title: "Repair", desc: "Municipalities create transparent blockchain tenders for verified damage." },
];

const techStack = [
  "React", "Vite", "Tailwind CSS", "Leaflet", "YOLOv8",
  "Django", "Web3.js", "Solidity", "MongoDB", "Express",
];

const Home = () => {
  const { scrollY } = useGlobalScroll();

  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-asphalt-950 grid-bg noise-bg" />
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-asphalt-950 to-transparent z-[2]" />

        {/* Parallax amber glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-warn/[0.04] rounded-full blur-[140px] z-[1]"
          style={{ transform: `translate(-50%, ${scrollY * 0.08}px)` }}
        />

        {/* Parallax grid decoration */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] border border-asphalt-700/20 rounded-3xl opacity-30 z-[1]"
          style={{ transform: `translate(30%, ${-scrollY * 0.05}px) rotate(12deg)` }}
        />
        <div
          className="absolute bottom-20 left-10 w-[200px] h-[200px] border border-warn/10 rounded-2xl opacity-20 z-[1]"
          style={{ transform: `translate(0, ${-scrollY * 0.12}px) rotate(-8deg)` }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="animate-fade-up">
            <span className="badge badge-warn mb-8 inline-flex">AI + Blockchain</span>
            <h1 className={`${styles.heading} mb-8`}>patch.it</h1>
            <p className="text-lg md:text-xl text-road-light max-w-2xl mx-auto leading-relaxed">
              AI-powered pothole detection meets crowd-sourced reporting.
              <br className="hidden md:block" />
              Safer roads, faster repairs, transparent tenders — verified on-chain.
            </p>
          </div>

          <div className="animate-fade-up stagger-3 flex flex-wrap justify-center gap-4 mt-12">
            <Link to="/report" className="btn-primary rounded-full px-8">
              Report a Pothole
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/map" className="btn-secondary rounded-full px-8">Explore Map</Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-up stagger-5 mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-display text-white">{s.value}</div>
                <div className="text-[10px] text-road mt-1.5 uppercase tracking-[0.15em]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="w-5 h-9 rounded-full border border-asphalt-600 flex justify-center pt-2">
            <div className="w-0.5 h-2.5 bg-warn/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="relative py-32 bg-asphalt-950 overflow-hidden">
        <div className="absolute inset-0 topo-lines noise-bg" />
        {/* Parallax accent */}
        <div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-warn/[0.02] rounded-full blur-[100px]"
          style={{ transform: `translateY(${scrollY * 0.04}px)` }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <RevealOnScroll>
            <p className="mono-label mb-4">// platform</p>
            <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
              Four pillars of<br />
              <span className="text-warn">smarter infrastructure</span>
            </h2>
            <p className="text-road-light max-w-xl mb-20 text-lg leading-relaxed">
              From detection to repair — automated, transparent, and verifiable.
            </p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <RevealOnScroll key={i} delay={i * 80}>
                <div className="card p-7 group h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-warn/8 flex items-center justify-center text-warn group-hover:bg-warn group-hover:text-asphalt-950 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                      </svg>
                    </div>
                    <span className="badge badge-warn">{f.tag}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-road-light leading-relaxed">{f.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="relative py-32 bg-asphalt-950 overflow-hidden">
        <div className="absolute inset-0 grid-bg noise-bg" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <RevealOnScroll>
            <p className="mono-label mb-4">// process</p>
            <h2 className="text-3xl md:text-5xl font-display text-white mb-20">How it works</h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-4 gap-10">
            {steps.map((s, i) => (
              <RevealOnScroll key={i} delay={i * 100}>
                <div className="relative">
                  <div className="text-5xl font-display text-asphalt-700/60 mb-4">{s.num}</div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-asphalt-700/40 to-transparent" />
                  )}
                  <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-road-light leading-relaxed">{s.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Tech stack */}
          <RevealOnScroll delay={400}>
            <div className="mt-28 section-line" />
            <div className="pt-10">
              <p className="mono-label mb-5">Built with</p>
              <div className="flex flex-wrap gap-2.5">
                {techStack.map((t) => (
                  <span
                    key={t}
                    className="px-4 py-2 rounded-lg border border-asphalt-700/50 text-sm text-road hover:text-warn hover:border-warn/30 transition-all duration-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 topo-lines noise-bg bg-asphalt-900/50" />
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-warn/[0.03] rounded-full blur-[120px]"
          style={{ transform: `translate(-50%, ${-50 + scrollY * 0.02}%)` }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <RevealOnScroll>
            <p className="mono-label mb-4">// join</p>
            <h2 className="text-3xl md:text-5xl font-display text-white mb-6">
              Ready to make<br />roads safer?
            </h2>
            <p className="text-road-light text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Join citizens and municipalities using Patch-It to detect, report,
              and fix road damage — faster and more transparently than ever.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/report" className="btn-primary rounded-full text-base px-8 py-4">
                Start Reporting
              </Link>
              <Link to="/bid" className="btn-secondary rounded-full text-base px-8 py-4">
                View Tenders
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-asphalt-950 border-t border-asphalt-800/50 py-14 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-xl text-white mb-3">patch.it</div>
            <p className="text-sm text-road leading-relaxed">
              AI-powered road damage detection and transparent repair management.
            </p>
          </div>
          <div>
            <p className="mono-label mb-3">Platform</p>
            <div className="space-y-2">
              {[
                { to: "/map", label: "Map" },
                { to: "/report", label: "Report" },
                { to: "/community", label: "Community" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="block text-sm text-road-light hover:text-warn transition">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mono-label mb-3">Blockchain</p>
            <div className="space-y-2">
              <Link to="/bid" className="block text-sm text-road-light hover:text-warn transition">Tenders</Link>
              <span className="block text-sm text-road-light">Smart Contracts</span>
              <span className="block text-sm text-road-light">Ethereum Network</span>
            </div>
          </div>
          <div>
            <p className="mono-label mb-3">Technology</p>
            <div className="space-y-2">
              <span className="block text-sm text-road-light">YOLO Detection</span>
              <span className="block text-sm text-road-light">Depth Estimation</span>
              <span className="block text-sm text-road-light">Django ML API</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-asphalt-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-road/60">&copy; {new Date().getFullYear()} Patch-It</p>
          <p className="text-xs text-road/40 font-mono">React + Vite + Tailwind + Solidity + YOLOv8</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
