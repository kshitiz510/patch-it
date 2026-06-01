import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
 * Scroll-driven animation hooks for Patch-It
 * Provides: reveal, parallax, progress tracking
 * ───────────────────────────────────────────── */

/**
 * Intersection Observer hook — triggers a class once visible.
 * @param {number} threshold - visibility ratio (0-1)
 */
export const useReveal = (threshold = 0.12) => {
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
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
};

/**
 * Parallax offset driven by scroll position.
 * Returns a ref and a `y` value representing translateY offset.
 * @param {number} speed - parallax factor (0.1 = subtle, 0.5 = strong)
 */
export const useParallax = (speed = 0.15) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const windowH = window.innerHeight;
        // Calculate how far through the viewport this element is
        const progress = (windowH - rect.top) / (windowH + rect.height);
        const clampedProgress = Math.max(0, Math.min(1, progress));
        // Map to offset — centered around 0
        setOffset((clampedProgress - 0.5) * speed * 300);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, offset };
};

/**
 * Returns scroll progress (0–1) for a given element.
 * 0 = element just entering bottom, 1 = element exiting top.
 */
export const useScrollProgress = () => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const windowH = window.innerHeight;
        const p = 1 - rect.top / windowH;
        setProgress(Math.max(0, Math.min(1, p)));
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref, progress };
};

/**
 * Tracks the global scroll position (0-1) of the entire page.
 */
export const useGlobalScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollY(y);
        setProgress(max > 0 ? y / max : 0);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrollY, progress };
};

/**
 * Reusable Reveal wrapper component.
 */
export const RevealOnScroll = ({ children, className = "", delay = 0, direction = "up" }) => {
  const ref = useReveal();
  const dirClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
        ? "reveal-right"
        : "reveal-target";

  return (
    <div
      ref={ref}
      className={`${dirClass} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * Parallax wrapper component.
 */
export const ParallaxLayer = ({ children, speed = 0.15, className = "" }) => {
  const { ref, offset } = useParallax(speed);
  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `translateY(${offset}px)`, willChange: "transform" }}
    >
      {children}
    </div>
  );
};
