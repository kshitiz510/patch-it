import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const staticLinks = [
  { to: "/", label: "Home" },
  { to: "/map", label: "Map" },
  { to: "/report", label: "Report" },
  { to: "/community", label: "Community" },
  { to: "/bid", label: "Bid" },
];

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ...staticLinks,
    isAuthenticated
      ? { to: "/profile", label: user?.name ? user.name.split(" ")[0] : "Profile" }
      : { to: "/auth", label: "Login" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-asphalt-950/95 backdrop-blur-md border-b border-asphalt-700/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-warn flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
            <svg viewBox="0 0 48 48" fill="none" className="w-5 h-5">
              <path
                d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                fill="#0a0c0f"
              />
            </svg>
          </div>
          <span className="font-display text-xl text-white tracking-wide">patch.it</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-warn" : "text-road-light hover:text-white"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-warn rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-road-light hover:text-white transition"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-64 border-t border-asphalt-700/50" : "max-h-0"
        }`}
      >
        <div className="bg-asphalt-950/98 backdrop-blur-md px-6 py-4 space-y-1">
          {links.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "text-warn bg-warn/10"
                    : "text-road-light hover:text-white hover:bg-asphalt-800"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
