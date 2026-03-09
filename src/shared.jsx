import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export const useInView = (threshold = 0.12) => {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

export const useParallax = (speed = 0.3) => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const fn = () => setOffset(window.scrollY * speed);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [speed]);
  return offset;
};

export const useCounter = (target, duration = 1800, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = ts => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

export const useScrollDirection = () => {
  const [dir, setDir] = useState("up");
  const last = useRef(0);
  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setDir(y > last.current ? "down" : "up");
      last.current = y;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return dir;
};

export const useToast = () => {
  const [t, setT] = useState(null);
  const show = useCallback((msg, icon = "✓") => {
    setT({ msg, icon });
    setTimeout(() => setT(null), 3200);
  }, []);
  return [t, show];
};

export const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <div className="scroll-line" style={{ width: `${pct}%` }} />;
};

export const Particles = ({ count = 18, color = "rgba(201,168,76," }) => {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 6,
      size: 2 + Math.random() * 4, dur: 4 + Math.random() * 5, opacity: 0.2 + Math.random() * 0.5,
    }))
  ).current;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, bottom: 0, width: p.size, height: p.size, borderRadius: "50%", background: `${color}${p.opacity})`, animation: `particle ${p.dur}s ease-out ${p.delay}s infinite` }} />
      ))}
    </div>
  );
};

export const Magnetic = ({ children, strength = 0.3 }) => {
  const ref = useRef();
  const onMove = e => { const r = ref.current.getBoundingClientRect(); ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px,${(e.clientY - r.top - r.height / 2) * strength}px)`; };
  const onLeave = () => { ref.current.style.transform = "translate(0,0)"; ref.current.style.transition = "transform .6s var(--ease)"; };
  const onEnter = () => { ref.current.style.transition = "transform .1s linear"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseEnter={onEnter} style={{ display: "inline-block" }}>{children}</div>;
};

export const Toast = ({ t }) => t ? (
  <div className="toast" style={{ flexDirection: "column", alignItems: "flex-start", padding: 0, overflow: "hidden", minWidth: 260 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px" }}>
      <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>{t.msg}
    </div>
    <div style={{ height: 3, background: "rgba(255,255,255,.15)", width: "100%" }}>
      <div style={{ height: "100%", background: "var(--gold)", animation: "drawLine 3.2s linear forwards", width: "100%", transformOrigin: "left" }} />
    </div>
  </div>
) : null;

export const Ic = ({ n, s = 18, c = "currentColor", sw = 1.6 }) => {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    menu: <svg {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
    close: <svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    calendar: <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    user: <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    users: <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    pin: <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    star: <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    starO: <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    heart: <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    heartF: <svg {...p} fill={c}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    arrow: <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
    arrowL: <svg {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    check: <svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    wifi: <svg {...p}><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>,
    pool: <svg {...p}><path d="M2 12h20" /><path d="M2 8c1.4 1.4 3 2 5 2s3.6-.6 5-2 3.6-2 5-2 3.6.6 5 2" /><path d="M2 16c1.4 1.4 3 2 5 2s3.6-.6 5-2 3.6-2 5-2 3.6.6 5 2" /></svg>,
    car: <svg {...p}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>,
    coffee: <svg {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
    gym: <svg {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M6 8H5a4 4 0 0 0 0 8h1" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="12" y1="8" x2="12" y2="16" /></svg>,
    spa: <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    restaurant: <svg {...p}><line x1="12" y1="20" x2="12" y2="10" /><path d="M8 10V4" /><path d="M16 10V4" /><path d="M8 10a4 4 0 0 0 8 0" /></svg>,
    chevD: <svg {...p} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
    plus: <svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    minus: <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    bed: <svg {...p}><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>,
    tv: <svg {...p}><rect x="2" y="7" width="20" height="15" rx="2" /><polyline points="17 2 12 7 7 2" /></svg>,
    ac: <svg {...p}><rect x="2" y="3" width="20" height="13" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 8l5 4 5-4" /></svg>,
    lock: <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    phone: <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 7.16 7.16l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    eye: <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    eyeOff: <svg {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    logout: <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    booking: <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    filter: <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    grid: <svg {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    list: <svg {...p}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    alert: <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    conf: <svg {...p} fill="none"><path strokeWidth="2" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline strokeWidth="2" points="22 4 12 14.01 9 11.01" /></svg>,
    logo: <svg width={s} height={s} viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#C9A84C" /><path d="M10 34V18l12-8 12 8v16" stroke="#fff" strokeWidth="2" fill="none" /><rect x="17" y="24" width="10" height="10" rx="1" fill="#fff" /><circle cx="22" cy="14" r="3" fill="#0F1923" /><path d="M10 22h24" stroke="rgba(255,255,255,.3)" strokeWidth="1" /></svg>,
  };
  return icons[n] || <svg {...p} />;
};

export const Stars = ({ rating, size = 13 }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map(i => (
      <Ic key={i} n={i <= Math.round(rating) ? "star" : "starO"} s={size} c={i <= Math.round(rating) ? "#C9A84C" : "#CBD5E0"} />
    ))}
  </span>
);
