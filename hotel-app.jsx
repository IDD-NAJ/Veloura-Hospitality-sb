import { useState, useEffect, useRef, useCallback } from "react";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap";
document.head.appendChild(fl);

// ─── Global CSS ───────────────────────────────────────────────────────────────
const gs = document.createElement("style");
gs.textContent = `
  :root {
    --ink:#0C0D0F; --navy:#0F1923; --deep:#162234; --ocean:#1A3352;
    --slate:#2A4A6B; --steel:#3A6491;
    --gold:#C9A84C; --gold-lt:#E8C97A; --gold-dk:#A07828;
    --sand:#F4EFE4; --linen:#EDE7D9; --parchment:#E5DCCB;
    --white:#FDFCFA; --fog:#9BA8B5; --mist:#BDC8D4;
    --emerald:#1A6B4A; --ruby:#8B1C1C;
    --serif:'Cormorant',Georgia,serif;
    --sans:'Jost',sans-serif;
    --mono:'DM Mono',monospace;
    --ease:cubic-bezier(0.16,1,0.3,1);
    --ease-in:cubic-bezier(0.7,0,0.84,0);
    --r:8px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{font-family:var(--sans);background:var(--sand);color:var(--ink);overflow-x:hidden;}
  ::selection{background:var(--gold);color:var(--ink);}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:var(--linen);}
  ::-webkit-scrollbar-thumb{background:var(--slate);border-radius:3px;}

  @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeUpBig{from{opacity:0;transform:translateY(70px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes fadeDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideLeft{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
  @keyframes zoomIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
  @keyframes zoomInBounce{0%{opacity:0;transform:scale(.8)}70%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes floatSlow{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-16px) rotate(2deg)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes spinSlow{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes pulseFast{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  @keyframes drawLine{from{width:0}to{width:100%}}
  @keyframes drawLineV{from{height:0}to{height:100%}}
  @keyframes borderGlow{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.5)}60%{box-shadow:0 0 0 14px rgba(201,168,76,.0)}}
  @keyframes goldShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  @keyframes ripple{0%{transform:scale(0);opacity:.5}100%{transform:scale(4);opacity:0}}
  @keyframes orbit{from{transform:rotate(0deg) translateX(120px) rotate(0deg)}to{transform:rotate(360deg) translateX(120px) rotate(-360deg)}}
  @keyframes orbitSlow{from{transform:rotate(0deg) translateX(80px) rotate(0deg)}to{transform:rotate(360deg) translateX(80px) rotate(-360deg)}}
  @keyframes particle{0%{opacity:0;transform:translateY(0) scale(0)}20%{opacity:1}80%{opacity:.6}100%{opacity:0;transform:translateY(-120px) scale(1)}}
  @keyframes clipReveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
  @keyframes clipRevealUp{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}
  @keyframes scaleX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes heroKen{0%{transform:scale(1) translateX(0)}100%{transform:scale(1.08) translateX(-1%)}}
  @keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 6px rgba(201,168,76,.4))}50%{filter:drop-shadow(0 0 18px rgba(201,168,76,.9))}}
  @keyframes countUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes wipe{from{transform:translateX(-101%)}to{transform:translateX(101%)}}
  @keyframes hoverLift{to{transform:translateY(-4px)}}
  @keyframes cardFlip{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
  @keyframes staggerFadeUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes shine{0%{left:-100%}100%{left:200%}}

  /* Page transition */
  .page{animation:pageEnter .55s cubic-bezier(0.16,1,0.3,1);}
  @keyframes pageEnter{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

  /* Gold shimmer text */
  .shimmer-text{background:linear-gradient(90deg,var(--gold) 0%,var(--gold-lt) 30%,#fff 50%,var(--gold-lt) 70%,var(--gold) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:goldShimmer 4s linear infinite;}

  /* Animated underline on headings */
  .anim-underline{position:relative;display:inline-block;}
  .anim-underline::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold-lt));transition:width .6s var(--ease);}
  .anim-underline:hover::after,.anim-underline.active::after{width:100%;}

  /* Reveal clip */
  .reveal-clip{animation:clipReveal .9s cubic-bezier(0.16,1,0.3,1) forwards;}
  .reveal-clip-up{animation:clipRevealUp .8s cubic-bezier(0.16,1,0.3,1) forwards;}

  /* Float animations */
  .float-1{animation:float 4s ease-in-out infinite;}
  .float-2{animation:float 5.5s ease-in-out infinite .8s;}
  .float-3{animation:float 6s ease-in-out infinite 1.6s;}
  .float-slow{animation:floatSlow 8s ease-in-out infinite;}

  /* Hover lift */
  .hover-lift{transition:transform .3s var(--ease),box-shadow .3s var(--ease);}
  .hover-lift:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,.15);}

  /* Stagger children */
  .stagger-children > *{opacity:0;animation:staggerFadeUp .7s cubic-bezier(0.16,1,0.3,1) forwards;}
  .stagger-children > *:nth-child(1){animation-delay:.05s;}
  .stagger-children > *:nth-child(2){animation-delay:.15s;}
  .stagger-children > *:nth-child(3){animation-delay:.25s;}
  .stagger-children > *:nth-child(4){animation-delay:.35s;}
  .stagger-children > *:nth-child(5){animation-delay:.45s;}
  .stagger-children > *:nth-child(6){animation-delay:.55s;}

  /* Glow icon */
  .glow-icon{animation:glowPulse 2.5s ease-in-out infinite;}

  /* Gradient animated bg */
  .grad-anim{background-size:300% 300%;animation:gradientShift 8s ease infinite;}

  /* Card shine effect */
  .card-shine{position:relative;overflow:hidden;}
  .card-shine::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);animation:shine 3.5s ease-in-out infinite;z-index:1;pointer-events:none;}

  /* Scroll progress line */
  .scroll-line{position:fixed;top:70px;left:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold-lt));z-index:499;transition:width .1s linear;transform-origin:left;}

  /* Ticker tape */
  .ticker-wrap{overflow:hidden;white-space:nowrap;}
  .ticker-track{display:inline-flex;gap:0;animation:ticker 24s linear infinite;}
  .ticker-track:hover{animation-play-state:paused;}

  /* Spinning ring */
  .spin-ring{animation:spinSlow 20s linear infinite;}
  .spin-ring-rev{animation:spinSlow 15s linear infinite reverse;}

  /* Buttons */
  .btn-gold{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,var(--gold),var(--gold-lt));color:var(--ink);font-family:var(--sans);font-weight:600;font-size:.85rem;letter-spacing:.07em;text-transform:uppercase;padding:13px 30px;border:none;border-radius:var(--r);cursor:pointer;transition:all .3s var(--ease);text-decoration:none;}
  .btn-gold:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(201,168,76,.45);}
  .btn-navy{display:inline-flex;align-items:center;gap:9px;background:var(--navy);color:var(--sand);font-family:var(--sans);font-weight:600;font-size:.85rem;letter-spacing:.07em;text-transform:uppercase;padding:13px 30px;border:none;border-radius:var(--r);cursor:pointer;transition:all .3s var(--ease);}
  .btn-navy:hover{background:var(--deep);transform:translateY(-2px);box-shadow:0 10px 28px rgba(15,25,35,.4);}
  .btn-outline{display:inline-flex;align-items:center;gap:9px;background:transparent;color:var(--navy);font-family:var(--sans);font-weight:500;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;padding:12px 28px;border:1.5px solid var(--navy);border-radius:var(--r);cursor:pointer;transition:all .3s;}
  .btn-outline:hover{background:var(--navy);color:var(--sand);}
  .btn-outline-white{display:inline-flex;align-items:center;gap:9px;background:transparent;color:#fff;font-family:var(--sans);font-weight:500;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;padding:12px 28px;border:1.5px solid rgba(255,255,255,.5);border-radius:var(--r);cursor:pointer;transition:all .3s;}
  .btn-outline-white:hover{background:rgba(255,255,255,.1);border-color:#fff;}
  .btn-ghost{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);color:#fff;font-family:var(--sans);font-weight:500;font-size:.83rem;padding:10px 20px;border:1px solid rgba(255,255,255,.15);border-radius:var(--r);cursor:pointer;transition:all .3s;backdrop-filter:blur(8px);}
  .btn-ghost:hover{background:rgba(255,255,255,.15);}

  /* Cards */
  .hotel-card{background:var(--white);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .4s var(--ease);}
  .hotel-card:hover{transform:translateY(-8px);box-shadow:0 28px 60px rgba(15,25,35,.18);}
  .hotel-card-img{overflow:hidden;position:relative;}
  .hotel-card-img-inner{width:100%;height:100%;transition:transform .7s var(--ease);}
  .hotel-card:hover .hotel-card-img-inner{transform:scale(1.06);}

  /* Skeleton */
  .skeleton{background:linear-gradient(90deg,var(--linen) 25%,var(--parchment) 50%,var(--linen) 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;}

  /* Star rating */
  .stars{display:inline-flex;gap:2px;}

  /* Form inputs */
  .field{position:relative;}
  .field input,.field select,.field textarea{width:100%;font-family:var(--sans);font-size:.92rem;color:var(--ink);background:var(--white);border:1.5px solid var(--mist);border-radius:var(--r);padding:13px 16px;outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;}
  .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.12);}
  .field label{display:block;font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--slate);margin-bottom:7px;}
  .field select{cursor:pointer;}

  /* Badge */
  .badge{display:inline-block;font-family:var(--mono);font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:20px;}
  .badge-gold{background:rgba(201,168,76,.15);color:var(--gold-dk);}
  .badge-green{background:rgba(26,107,74,.12);color:var(--emerald);}
  .badge-navy{background:rgba(15,25,35,.08);color:var(--navy);}

  /* Eyebrow */
  .eyebrow{font-family:var(--mono);font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:12px;}
  .eyebrow::before{content:'';display:block;width:24px;height:1px;background:var(--gold);}

  /* Dividers */
  .gold-rule{height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:.35;}

  /* Toast */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--navy);color:var(--sand);padding:14px 20px;border-radius:12px;font-size:.87rem;z-index:9999;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.3);animation:fadeUp .4s var(--ease);border-left:3px solid var(--gold);}

  /* Modal overlay */
  .modal-overlay{position:fixed;inset:0;background:rgba(12,13,15,.7);z-index:900;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease;backdrop-filter:blur(6px);}
  .modal-box{background:var(--white);border-radius:18px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;animation:zoomIn .35s var(--ease);}

  /* Nav link */
  .nav-link{font-family:var(--sans);font-size:.88rem;font-weight:400;color:rgba(255,255,255,.75);text-decoration:none;padding:4px 0;position:relative;transition:color .2s;background:none;border:none;cursor:pointer;}
  .nav-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1px;background:var(--gold);transition:width .35s var(--ease);}
  .nav-link:hover{color:#fff;}
  .nav-link:hover::after{width:100%;}
  .nav-link.active{color:var(--gold-lt);}

  /* Amenity pill */
  .amenity{display:inline-flex;align-items:center;gap:6px;background:rgba(26,50,82,.06);color:var(--slate);border:1px solid rgba(26,50,82,.12);border-radius:20px;padding:6px 14px;font-size:.8rem;font-weight:500;}

  /* Range slider */
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:var(--mist);outline:none;padding:0;border:none;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--gold);cursor:pointer;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.2);}

  /* Date input */
  input[type=date]{cursor:pointer;}

  /* Progress steps */
  .step-item{display:flex;flex-direction:column;align-items:center;gap:6px;}
  .step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.82rem;font-weight:500;transition:all .3s;}

  /* Tab */
  .tab-btn{font-family:var(--sans);font-size:.88rem;font-weight:500;padding:11px 22px;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;color:var(--fog);transition:all .25s;}
  .tab-btn.active{color:var(--navy);border-bottom-color:var(--gold);}
  .tab-btn:hover:not(.active){color:var(--slate);}

  /* Map placeholder */
  .map-placeholder{background:linear-gradient(135deg,#1a3352 0%,#0f1923 100%);border-radius:14px;position:relative;overflow:hidden;}
  .map-grid{position:absolute;inset:0;opacity:.15;background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:30px 30px;}

  /* Booking summary sticky */
  .booking-sticky{position:sticky;top:100px;}

  /* Filter sidebar */
  .filter-section{border-bottom:1px solid var(--linen);padding:20px 0;}
  .filter-section:last-child{border-bottom:none;}

  @media(max-width:1024px){.hide-lg{display:none!important;}}
  @media(max-width:768px){
    .hide-md{display:none!important;}
    .stack-md{flex-direction:column!important;}
    .cols-1-md{grid-template-columns:1fr!important;}
  }
  @media(max-width:480px){.hide-sm{display:none!important;}  }
`;
document.head.appendChild(gs);

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
const useInView = (threshold = 0.12) => {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

// ─── Counter Hook (animated number count-up) ─────────────────────────────────
const useCounter = (target, duration = 1800, start = false) => {
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

// ─── Parallax Hook ────────────────────────────────────────────────────────────
const useParallax = (speed = 0.3) => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const fn = () => setOffset(window.scrollY * speed);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [speed]);
  return offset;
};

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <div className="scroll-line" style={{ width: `${pct}%` }}/>;
};

// ─── Floating Particles ───────────────────────────────────────────────────────
const Particles = ({ count = 18, color = "rgba(201,168,76," }) => {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 6,
      size: 2 + Math.random() * 4, dur: 4 + Math.random() * 5, opacity: 0.2 + Math.random() * 0.5
    }))
  ).current;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, bottom: 0,
          width: p.size, height: p.size, borderRadius: "50%",
          background: `${color}${p.opacity})`,
          animation: `particle ${p.dur}s ease-out ${p.delay}s infinite`,
        }}/>
      ))}
    </div>
  );
};

// ─── Magnetic Button Wrapper ─────────────────────────────────────────────────
const Magnetic = ({ children, strength = 0.3 }) => {
  const ref = useRef();
  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) * strength;
    const dy = (e.clientY - r.top - r.height / 2) * strength;
    ref.current.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const onLeave = () => { ref.current.style.transform = "translate(0,0)"; ref.current.style.transition = "transform .6s var(--ease)"; };
  const onEnter = () => { ref.current.style.transition = "transform .1s linear"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseEnter={onEnter} style={{ display: "inline-block" }}>{children}</div>;
};

// ─── Toast Hook ───────────────────────────────────────────────────────────────
const useToast = () => {
  const [t, setT] = useState(null);
  const show = useCallback((msg, icon = "✓") => {
    setT({ msg, icon });
    setTimeout(() => setT(null), 3200);
  }, []);
  return [t, show];
};
const Toast = ({ t }) => t ? (
  <div className="toast" style={{ flexDirection: "column", alignItems: "flex-start", padding: 0, overflow: "hidden", minWidth: 260 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px" }}>
      <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>{t.msg}
    </div>
    <div style={{ height: 3, background: "rgba(255,255,255,.15)", width: "100%" }}>
      <div style={{ height: "100%", background: "var(--gold)", animation: "drawLine 3.2s linear forwards", width: "100%", transformOrigin: "left" }}/>
    </div>
  </div>
) : null;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = ({ n, s = 18, c = "currentColor", sw = 1.6 }) => {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    menu: <svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    calendar: <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    user: <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    users: <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    map: <svg {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    pin: <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    star: <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    starO: <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    heart: <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    heartF: <svg {...p} fill={c}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    arrow: <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    arrowL: <svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    check: <svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    wifi: <svg {...p}><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    pool: <svg {...p}><path d="M2 12h20"/><path d="M2 8c1.4 1.4 3 2 5 2s3.6-.6 5-2 3.6-2 5-2 3.6.6 5 2"/><path d="M2 16c1.4 1.4 3 2 5 2s3.6-.6 5-2 3.6-2 5-2 3.6.6 5 2"/></svg>,
    car: <svg {...p}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
    coffee: <svg {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    gym: <svg {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M6 8H5a4 4 0 0 0 0 8h1"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>,
    spa: <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    restaurant: <svg {...p}><line x1="12" y1="20" x2="12" y2="10"/><path d="M8 10V4"/><path d="M16 10V4"/><path d="M8 10a4 4 0 0 0 8 0"/></svg>,
    chevD: <svg {...p} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
    chevR: <svg {...p} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    plus: <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    minus: <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    bed: <svg {...p}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
    shower: <svg {...p}><path d="M4 4h16v2a10 10 0 0 1-16 0V4z"/><line x1="12" y1="8" x2="12" y2="22"/><line x1="4" y1="4" x2="4" y2="2"/></svg>,
    tv: <svg {...p}><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
    ac: <svg {...p}><rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8l5 4 5-4"/></svg>,
    lock: <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    mail: <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    phone: <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 7.16 7.16l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    eye: <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    logout: <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    booking: <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    filter: <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    sort: <svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    grid: <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    list: <svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    card: <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    tag: <svg {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    alert: <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    conf: <svg {...p} fill="none"><path strokeWidth="2" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline strokeWidth="2" points="22 4 12 14.01 9 11.01"/></svg>,
    logo: <svg width={s} height={s} viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#C9A84C"/><path d="M10 34V18l12-8 12 8v16" stroke="#fff" strokeWidth="2" fill="none"/><rect x="17" y="24" width="10" height="10" rx="1" fill="#fff"/><circle cx="22" cy="14" r="3" fill="#0F1923"/><path d="M10 22h24" stroke="rgba(255,255,255,.3)" strokeWidth="1"/></svg>,
  };
  return icons[n] || <svg {...p}/>;
};

// ─── Stars Component ──────────────────────────────────────────────────────────
const Stars = ({ rating, size = 13 }) => (
  <span className="stars">
    {[1,2,3,4,5].map(i => (
      <Ic key={i} n={i <= Math.round(rating) ? "star" : "starO"} s={size} c={i <= Math.round(rating) ? "#C9A84C" : "#CBD5E0"}/>
    ))}
  </span>
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const HOTELS = [
  {
    id: 1, name: "The Meridian Grand", city: "Paris", country: "France", stars: 5,
    rating: 4.9, reviews: 2847, priceFrom: 420, category: "Luxury",
    tags: ["Pool","Spa","Restaurant","Gym","City View"],
    lat: 48.8566, lng: 2.3522,
    desc: "Perched above the 8th arrondissement with uninterrupted views of the Eiffel Tower, The Meridian Grand is Paris's most coveted address. Blending Haussmann grandeur with contemporary luxury.",
    amenities: ["wifi","pool","spa","restaurant","gym","car","ac"],
    rooms: [
      { id:101, name:"Deluxe King", sqm:35, guests:2, beds:"King", price:420, view:"City", amenities:["AC","WiFi","Smart TV","Minibar","Rain Shower"], img:"deluxe" },
      { id:102, name:"Superior Suite", sqm:58, guests:2, beds:"King", price:680, view:"Eiffel Tower", amenities:["AC","WiFi","Smart TV","Minibar","Bathtub","Butler Service"], img:"suite" },
      { id:103, name:"Grand Penthouse", sqm:120, guests:4, beds:"2 King", price:1240, view:"Panoramic", amenities:["AC","WiFi","Smart TV","Full Kitchen","Private Pool","Butler Service"], img:"penthouse" },
    ],
    gradient: "linear-gradient(160deg,#1a3352 0%,#0f1923 100%)",
    accentColor: "#C9A84C",
  },
  {
    id: 2, name: "Azure Santorini", city: "Oia", country: "Greece", stars: 5,
    rating: 4.8, reviews: 1634, priceFrom: 380, category: "Resort",
    tags: ["Infinity Pool","Sea View","Spa","Private Terrace"],
    lat: 36.4618, lng: 25.3753,
    desc: "Carved into the volcanic caldera of Santorini's most breathtaking cliff. Azure redefines the Cycladic escape — cascading private plunge pools, cave suites, and sunsets that defy description.",
    amenities: ["wifi","pool","spa","restaurant","ac"],
    rooms: [
      { id:201, name:"Cave Suite", sqm:42, guests:2, beds:"King", price:380, view:"Caldera", amenities:["AC","WiFi","Smart TV","Plunge Pool","Breakfast"], img:"cave" },
      { id:202, name:"Infinity Villa", sqm:90, guests:2, beds:"King", price:760, view:"Caldera + Sea", amenities:["AC","WiFi","Smart TV","Private Pool","Private Chef","Breakfast"], img:"villa" },
    ],
    gradient: "linear-gradient(160deg,#1a4a6b 0%,#0d2a3a 100%)",
    accentColor: "#5BA0C8",
  },
  {
    id: 3, name: "Kyoto Ryokan Sublime", city: "Kyoto", country: "Japan", stars: 5,
    rating: 4.9, reviews: 987, priceFrom: 650, category: "Boutique",
    tags: ["Hot Spring","Tea Ceremony","Zen Garden","Kaiseki Dining"],
    lat: 35.0116, lng: 135.7681,
    desc: "A masterwork of Japanese minimalism in the ancient Higashiyama district. Fourteen private rooms, each with a garden view, onsen bath, and a dedicated attendant from arrival to departure.",
    amenities: ["wifi","spa","restaurant","pool"],
    rooms: [
      { id:301, name:"Garden Tatami", sqm:40, guests:2, beds:"Futon", price:650, view:"Zen Garden", amenities:["WiFi","Smart TV","Private Onsen","Yukata","Breakfast"], img:"tatami" },
      { id:302, name:"Grand Suikinkutsu", sqm:80, guests:2, beds:"Futon + King", price:1100, view:"Private Garden", amenities:["WiFi","Smart TV","Private Onsen","Tea Ceremony","Full Board"], img:"suikinkutsu" },
    ],
    gradient: "linear-gradient(160deg,#2d1a0e 0%,#1a0a08 100%)",
    accentColor: "#C07840",
  },
  {
    id: 4, name: "Coastal Dunes Lodge", city: "Cape Town", country: "South Africa", stars: 4,
    rating: 4.7, reviews: 2103, priceFrom: 210, category: "Lodge",
    tags: ["Ocean View","Pool","Wine Cellar","Safari Transfers"],
    lat: -33.9249, lng: 18.4241,
    desc: "Where the Atlantic crashes against Cape Point and Table Mountain glows at dusk. Coastal Dunes blends raw African landscape with understated luxury — local stone, reclaimed wood, and world-class wine.",
    amenities: ["wifi","pool","restaurant","car","gym"],
    rooms: [
      { id:401, name:"Mountain View Room", sqm:30, guests:2, beds:"Queen", price:210, view:"Table Mountain", amenities:["AC","WiFi","Smart TV","Minibar"], img:"mountain" },
      { id:402, name:"Ocean Loft Suite", sqm:55, guests:2, beds:"King", price:340, view:"Atlantic Ocean", amenities:["AC","WiFi","Smart TV","Minibar","Private Deck","Bathtub"], img:"ocean" },
    ],
    gradient: "linear-gradient(160deg,#1a3a2a 0%,#0a1a12 100%)",
    accentColor: "#7AB878",
  },
  {
    id: 5, name: "Manhattan Noir", city: "New York", country: "USA", stars: 5,
    rating: 4.8, reviews: 3214, priceFrom: 520, category: "Urban",
    tags: ["Rooftop Bar","Gym","Concierge","City Views"],
    lat: 40.7128, lng: -74.006,
    desc: "Art deco meets 21st-century precision in Midtown Manhattan. A skyscraper icon reborn — soaring ceilings, obsidian marble, and a rooftop bar that owns the New York skyline.",
    amenities: ["wifi","restaurant","gym","car","ac"],
    rooms: [
      { id:501, name:"City King", sqm:32, guests:2, beds:"King", price:520, view:"Central Park", amenities:["AC","WiFi","Smart TV","Nespresso","Work Desk"], img:"cityking" },
      { id:502, name:"Skyline Suite", sqm:65, guests:2, beds:"King", price:890, view:"Manhattan Skyline", amenities:["AC","WiFi","Smart TV","Full Bar","Soaking Tub"], img:"skyline" },
    ],
    gradient: "linear-gradient(160deg,#1a1a2e 0%,#0a0a1a 100%)",
    accentColor: "#C9A84C",
  },
  {
    id: 6, name: "Bali Hideaway Ubud", city: "Ubud", country: "Bali", stars: 4,
    rating: 4.6, reviews: 1876, priceFrom: 180, category: "Resort",
    tags: ["Rice Paddy View","Infinity Pool","Yoga","Spa"],
    lat: -8.5069, lng: 115.2625,
    desc: "Nestled among emerald rice terraces above the sacred Ayung River gorge. Twelve private villas, each with a plunge pool and butler, in Bali's most spiritual highland heartland.",
    amenities: ["wifi","pool","spa","restaurant","gym"],
    rooms: [
      { id:601, name:"Jungle Pool Villa", sqm:60, guests:2, beds:"King", price:180, view:"Rice Paddy", amenities:["AC","WiFi","Smart TV","Private Pool","Breakfast"], img:"jungle" },
      { id:602, name:"River Valley Suite", sqm:85, guests:4, beds:"King + Twin", price:320, view:"River Gorge", amenities:["AC","WiFi","Smart TV","Private Pool","Breakfast","Butler"], img:"river" },
    ],
    gradient: "linear-gradient(160deg,#1a3a1a 0%,#0a1a08 100%)",
    accentColor: "#78B878",
  },
];

const DESTINATIONS = [
  { name: "Paris", country: "France", hotels: 284, img: "paris", color: "#1a3352" },
  { name: "Santorini", country: "Greece", hotels: 97, img: "santorini", color: "#1a4a6b" },
  { name: "Tokyo", country: "Japan", hotels: 412, img: "tokyo", color: "#2d1a0e" },
  { name: "New York", country: "USA", hotels: 638, img: "newyork", color: "#1a1a2e" },
  { name: "Bali", country: "Indonesia", hotels: 203, img: "bali", color: "#1a3a1a" },
  { name: "Dubai", country: "UAE", hotels: 318, img: "dubai", color: "#3a2a0e" },
];

// ─── Destination Visual (CSS illustrated) ────────────────────────────────────
const DestVisual = ({ name, color, w = "100%", h = "100%" }) => {
  const shapes = {
    paris: <svg width={w} height={h} viewBox="0 0 400 280" style={{ display: "block" }}>
      <defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a3352"/><stop offset="100%" stopColor="#2a5a8a"/></linearGradient></defs>
      <rect width="400" height="280" fill="url(#sky1)"/>
      {[...Array(20)].map((_,i)=><circle key={i} cx={Math.sin(i*7)*200+200} cy={Math.cos(i*5)*60+80} r={i%3===0?2:1} fill="rgba(255,255,255,.7)" opacity={.4+Math.sin(i)*.4}/>)}
      <rect x="0" y="200" width="400" height="80" fill="rgba(15,25,35,.8)"/>
      <rect x="30" y="170" width="80" height="30" rx="2" fill="rgba(255,255,255,.08)"/>
      <rect x="130" y="160" width="60" height="40" rx="2" fill="rgba(255,255,255,.1)"/>
      <rect x="230" y="175" width="100" height="25" rx="2" fill="rgba(255,255,255,.07)"/>
      <rect x="340" y="165" width="50" height="35" rx="2" fill="rgba(255,255,255,.09)"/>
      <polygon points="178,140 185,200 192,200 188,140 185,100 182,140" fill="rgba(255,255,255,.25)"/>
      <polygon points="180,100 185,60 190,100" fill="rgba(255,255,255,.3)"/>
      <line x1="185" y1="60" x2="185" y2="55" stroke="rgba(201,168,76,.8)" strokeWidth="2"/>
      <rect x="170" y="155" width="30" height="45" rx="1" fill="rgba(255,255,255,.15)"/>
      <circle cx="185" cy="200" r="6" fill="rgba(201,168,76,.4)"/>
      <rect x="0" y="210" width="400" height="3" fill="rgba(201,168,76,.15)"/>
    </svg>,
    santorini: <svg width={w} height={h} viewBox="0 0 400 280" style={{ display: "block" }}>
      <defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d2a3a"/><stop offset="60%" stopColor="#1a4a6b"/><stop offset="100%" stopColor="#2a6a9a"/></linearGradient></defs>
      <rect width="400" height="280" fill="url(#sky2)"/>
      <ellipse cx="200" cy="320" rx="220" ry="80" fill="rgba(30,80,120,.5)"/>
      {[{x:60,y:140,w:90},{x:140,y:120,w:70},{x:200,y:130,w:80},{x:270,y:140,w:60},{x:310,y:150,w:50}].map((b,i)=>(
        <g key={i}><rect x={b.x} y={b.y} width={b.w} height={65} rx="4" fill="rgba(240,235,228,.9)"/>
        <ellipse cx={b.x+b.w*.4} cy={b.y} rx={b.w*.2} ry={10} fill="#3a6aab" opacity=".8"/></g>
      ))}
      <rect x="0" y="220" width="400" height="60" fill="rgba(30,100,160,.3)"/>
      {[...Array(6)].map((_,i)=><line key={i} x1={i*70+20} y1="220" x2={i*70+40} y2="280" stroke="rgba(255,255,255,.08)" strokeWidth="12"/>)}
    </svg>,
    tokyo: <svg width={w} height={h} viewBox="0 0 400 280" style={{ display: "block" }}>
      <defs><linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a06"/><stop offset="100%" stopColor="#4a1a0a"/></linearGradient></defs>
      <rect width="400" height="280" fill="url(#sky3)"/>
      {[...Array(15)].map((_,i)=><circle key={i} cx={i*28+14} cy={30+Math.sin(i)*15} r=".8" fill="rgba(255,255,255,.5)"/>)}
      {[{x:20,h:160,w:35},{x:60,h:140,w:28},{x:100,h:180,w:40},{x:145,h:120,w:25},{x:175,h:200,w:50},{x:230,h:160,w:35},{x:270,h:140,w:28},{x:305,h:170,w:38},{x:348,h:130,w:30}].map((b,i)=>(
        <g key={i}><rect x={b.x} y={280-b.h} width={b.w} height={b.h} fill={`rgba(${20+i*3},${15+i*2},${30+i*4},.95)`}/>
        {[...Array(Math.floor(b.h/14))].map((_,r)=>[...Array(Math.floor(b.w/9))].map((_,c)=><rect key={`${r}${c}`} x={b.x+c*9+2} y={280-b.h+r*14+3} width="5" height="7" fill={Math.random()>.6?"rgba(255,200,50,.6)":"rgba(255,255,255,.05)"}/>))}</g>
      ))}
      <polygon points="175,80 185,0 195,80" fill="rgba(180,180,180,.4)"/>
      <circle cx="185" cy="20" r="12" fill="rgba(220,60,40,.6)"/>
    </svg>,
    newyork: <svg width={w} height={h} viewBox="0 0 400 280" style={{ display: "block" }}>
      <defs><linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#050a1a"/><stop offset="100%" stopColor="#1a1a2e"/></linearGradient></defs>
      <rect width="400" height="280" fill="url(#sky4)"/>
      {[...Array(12)].map((_,i)=><circle key={i} cx={i*35+12} cy={20+Math.cos(i)*10} r=".8" fill="rgba(255,255,255,.4)"/>)}
      {[{x:0,h:200,w:30},{x:32,h:170,w:25},{x:60,h:220,w:35},{x:98,h:180,w:28},{x:130,h:240,w:45,spire:true},{x:178,h:190,w:32},{x:214,h:160,w:25},{x:244,h:210,w:38},{x:285,h:175,w:30},{x:318,h:230,w:42},{x:363,h:165,w:28}].map((b,i)=>(
        <g key={i}><rect x={b.x} y={280-b.h} width={b.w} height={b.h} fill={`rgba(20,20,${40+i*3},.98)`}/>
        {b.spire&&<polygon points={`${b.x+b.w*.4},${280-b.h} ${b.x+b.w*.5},${280-b.h-40} ${b.x+b.w*.6},${280-b.h}`} fill="rgba(100,100,120,.8)"/>}
        {[...Array(Math.floor(b.h/12))].map((_,r)=>[...Array(Math.floor(b.w/8))].map((_,c)=><rect key={`${r}${c}`} x={b.x+c*8+1} y={280-b.h+r*12+2} width="5" height="7" fill={Math.random()>.5?"rgba(255,200,80,.5)":"rgba(255,255,255,.03)"}/>))}</g>
      ))}
    </svg>,
    bali: <svg width={w} height={h} viewBox="0 0 400 280" style={{ display: "block" }}>
      <defs><linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1a0a"/><stop offset="100%" stopColor="#1a3a1a"/></linearGradient></defs>
      <rect width="400" height="280" fill="url(#sky5)"/>
      <circle cx="320" cy="60" r="28" fill="rgba(255,180,50,.15)"/>
      {[[60,200,80,160],[100,210,120,160],[145,205,160,160],[190,200,200,160],[230,208,240,160],[270,200,280,160],[310,205,320,160],[340,200,355,165]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(80,160,80,.3)" strokeWidth="2"/>
      ))}
      {[...Array(12)].map((_,i)=>{const x=i*35+10,y=160+Math.sin(i)*20; return <g key={i}><polygon points={`${x},${y} ${x+5},${y-40} ${x+10},${y}`} fill="rgba(40,100,40,.6)"/><polygon points={`${x-4},${y-15} ${x+5},${y-55} ${x+14},${y-15}`} fill="rgba(40,100,40,.5)"/></g>;})}
      <rect x="0" y="230" width="400" height="50" fill="rgba(30,80,30,.4)"/>
      {[...Array(8)].map((_,i)=><rect key={i} x={i*52+5} y={200+Math.sin(i)*15} width={35} height={35} rx="2" fill="rgba(180,130,80,.2)"/>)}
    </svg>,
    dubai: <svg width={w} height={h} viewBox="0 0 400 280" style={{ display: "block" }}>
      <defs><linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a02"/><stop offset="60%" stopColor="#3a2a0e"/><stop offset="100%" stopColor="#2a1a06"/></linearGradient></defs>
      <rect width="400" height="280" fill="url(#sky6)"/>
      <ellipse cx="60" cy="70" rx="50" ry="25" fill="rgba(255,130,0,.12)"/>
      {[{x:30,h:230,w:20},{x:55,h:200,w:18},{x:78,h:250,w:25,spire:true},{x:108,h:210,w:22},{x:140,h:180,w:20},{x:170,h:270,w:30,spire:true},{x:208,h:220,w:24},{x:238,h:190,w:20},{x:268,h:240,w:28},{x:302,h:200,w:22},{x:332,h:175,w:18},{x:358,h:220,w:28}].map((b,i)=>(
        <g key={i}><rect x={b.x} y={280-b.h} width={b.w} height={b.h} fill={`rgba(${40+i*2},${30+i*2},${10+i},.98)`}/>
        {b.spire&&<polygon points={`${b.x+b.w*.3},${280-b.h} ${b.x+b.w*.5},${280-b.h-60} ${b.x+b.w*.7},${280-b.h}`} fill="rgba(180,130,50,.5)"/>}
        {[...Array(Math.floor(b.h/14))].map((_,r)=><rect key={r} x={b.x+2} y={280-b.h+r*14+3} width={b.w-4} height="8" fill="rgba(255,160,30,.1)"/>)}</g>
      ))}
      <rect x="0" y="255" width="400" height="25" fill="rgba(200,160,80,.08)"/>
    </svg>,
  };
  return shapes[name.toLowerCase().replace(" ","")] || shapes.paris;
};

// ─── Hotel Visual (room illustration) ────────────────────────────────────────
const RoomVisual = ({ gradient, size = 240 }) => (
  <div style={{ width: size, height: size * 0.65, background: gradient, borderRadius: 10, position: "relative", overflow: "hidden", flexShrink: 0 }}>
    <div style={{ position: "absolute", inset: 0, opacity: .08, backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "24px 24px" }}/>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "rgba(0,0,0,.2)" }}/>
    <div style={{ position: "absolute", bottom: 0, left: "10%", width: "80%", height: "42%", background: "rgba(255,255,255,.06)", borderRadius: "6px 6px 0 0" }}/>
    <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(201,168,76,.2)", border: "1px solid rgba(201,168,76,.3)" }}/>
    <Ic n="bed" s={20} c="rgba(255,255,255,.3)"/>
  </div>
);

// ─── Auth State ───────────────────────────────────────────────────────────────
const DEMO_USER = { name: "Alexandra Chen", email: "alex@example.com", avatar: "AC" };

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ navigate, page, user, onLogin, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isHeroPage = ["home"].includes(page);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navBg = isHeroPage
    ? scrolled ? "rgba(15,25,35,.97)" : "transparent"
    : "rgba(15,25,35,.98)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        background: navBg, backdropFilter: scrolled || !isHeroPage ? "blur(16px)" : "none",
        borderBottom: `1px solid ${scrolled || !isHeroPage ? "rgba(255,255,255,.08)" : "transparent"}`,
        transition: "all .4s var(--ease)"
      }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", height: 70, gap: 40 }}>
          {/* Logo */}
          <button onClick={() => navigate("home")} style={{ display: "flex", alignItems: "center", gap: 11, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <Ic n="logo" s={36}/>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 600, color: "#fff", letterSpacing: ".06em", lineHeight: 1 }}>Veloura</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".56rem", color: "rgba(201,168,76,.8)", letterSpacing: ".2em", marginTop: 1 }}>LUXURY HOTELS</div>
            </div>
          </button>

          {/* Nav links */}
          <div className="hide-md" style={{ display: "flex", alignItems: "center", gap: 28, flex: 1, justifyContent: "center" }}>
            {[["Hotels","hotels"],["Destinations","destinations"],["Deals","deals"],["About","about"]].map(([label,pg]) => (
              <button key={label} onClick={() => navigate(pg)} className={`nav-link ${page===pg?"active":""}`}>{label}</button>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 25, padding: "6px 14px 6px 8px", cursor: "pointer", transition: "all .2s" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: ".72rem", fontWeight: 600, color: "var(--ink)" }}>{user.avatar}</div>
                  <span style={{ fontFamily: "var(--sans)", fontSize: ".83rem", color: "#fff", fontWeight: 400 }}>{user.name.split(" ")[0]}</span>
                  <Ic n="chevD" s={14} c="rgba(255,255,255,.5)"/>
                </button>
                {userMenuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: "var(--navy)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: 8, minWidth: 200, animation: "fadeDown .25s var(--ease)", zIndex: 100, boxShadow: "0 20px 50px rgba(0,0,0,.4)" }} onMouseLeave={() => setUserMenuOpen(false)}>
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.06)", marginBottom: 4 }}>
                      <div style={{ fontFamily: "var(--sans)", fontSize: ".88rem", color: "#fff", fontWeight: 500 }}>{user.name}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginTop: 2 }}>{user.email}</div>
                    </div>
                    {[["booking","My Bookings","bookings"],["user","Profile","profile"],].map(([ico,label,pg]) => (
                      <button key={label} onClick={() => { navigate(pg); setUserMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", width: "100%", color: "rgba(255,255,255,.7)", fontFamily: "var(--sans)", fontSize: ".85rem", transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <Ic n={ico} s={14} c="var(--gold)"/>{label}
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 4, paddingTop: 4 }}>
                      <button onClick={() => { onLogout(); setUserMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", width: "100%", color: "rgba(255,100,100,.8)", fontFamily: "var(--sans)", fontSize: ".85rem", transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,50,50,.05)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <Ic n="logout" s={14} c="rgba(255,100,100,.8)"/>Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={onLogin} className="btn-ghost hide-md">Sign In</button>
                <button onClick={onLogin} className="btn-gold" style={{ padding: "9px 22px", fontSize: ".8rem" }}>
                  <span>Book Now</span>
                </button>
              </>
            )}
            <button onClick={() => setMobileOpen(true)} className="hide-lg" style={{ background: "none", border: "none", cursor: "pointer" }}><Ic n="menu" s={22} c="#fff"/></button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, background: "var(--navy)", zIndex: 990, padding: "80px 32px 40px", display: "flex", flexDirection: "column", animation: "fadeIn .3s ease" }}>
          <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer" }}><Ic n="close" s={26} c="#fff"/></button>
          {[["Home","home"],["Hotels","hotels"],["Destinations","destinations"],["Deals","deals"],["About","about"]].map(([l,pg]) => (
            <button key={l} onClick={() => { navigate(pg); setMobileOpen(false); }} style={{ fontFamily: "var(--serif)", fontSize: "2.4rem", color: "#fff", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontWeight: 300, transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.color = "#fff"}>{l}</button>
          ))}
          <div style={{ marginTop: "auto" }}>
            {user ? (
              <button onClick={() => { onLogout(); setMobileOpen(false); }} className="btn-outline-white" style={{ width: "100%", justifyContent: "center" }}>Sign Out</button>
            ) : (
              <button onClick={() => { onLogin(); setMobileOpen(false); }} className="btn-gold" style={{ width: "100%", justifyContent: "center" }}>Sign In / Book Now</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = ({ navigate }) => {
  const [email, setEmail] = useState(""); const [subDone, setSubDone] = useState(false);
  return (
    <footer style={{ background: "var(--navy)", color: "rgba(255,255,255,.55)" }}>
      {/* Newsletter */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)", padding: "60px 28px" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Exclusive Offers</div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,3vw,2.4rem)", color: "#fff", fontWeight: 300, lineHeight: 1.25 }}>Members get <em style={{ color: "var(--gold-lt)" }}>up to 30% off</em><br/>our best rates</h3>
          </div>
          <div>
            {subDone ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--gold-lt)", fontFamily: "var(--mono)", fontSize: ".85rem" }}><Ic n="check" s={16} c="var(--gold)"/>You're on the list. Watch your inbox.</div>
            ) : (
              <div style={{ display: "flex", gap: 0, border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,.04)" }}>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" style={{ flex: 1, background: "transparent", border: "none", padding: "14px 18px", fontFamily: "var(--sans)", fontSize: ".9rem", color: "#fff", outline: "none" }}/>
                <button onClick={() => email && setSubDone(true)} className="btn-gold" style={{ borderRadius: "0 9px 9px 0", whiteSpace: "nowrap" }}>Subscribe</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Main footer */}
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "50px 28px 28px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 50 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Ic n="logo" s={32}/><div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "#fff" }}>Veloura</div>
          </div>
          <p style={{ fontSize: ".85rem", lineHeight: 1.85, color: "rgba(255,255,255,.4)", maxWidth: 260, marginBottom: 24 }}>Curating the world's finest hotel experiences since 2008. Over 12,000 properties across 180 countries.</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["★ 4.9 App Store", "★ 4.8 Play Store"].map(l => <span key={l} className="badge badge-gold" style={{ fontSize: ".62rem" }}>{l}</span>)}
          </div>
        </div>
        {[
          { title: "Explore", links: [["Hotels","hotels"],["Destinations","destinations"],["Luxury Collection","hotels"],["Deals & Offers","deals"],["Last Minute","deals"]] },
          { title: "Support", links: [["Help Centre","about"],["Cancellation Policy","about"],["Contact Us","about"],["Accessibility","about"]] },
          { title: "Company", links: [["About Veloura","about"],["Careers","about"],["Press","about"],["Partners","about"],["Privacy","about"]] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 18 }}>{col.title}</div>
            {col.links.map(([label, pg]) => (
              <button key={label} onClick={() => navigate(pg)} style={{ display: "block", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.45)", fontSize: ".84rem", padding: "5px 0", textAlign: "left", fontFamily: "var(--sans)", transition: "color .2s", width: "100%" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.45)"}>{label}</button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "20px 28px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".67rem", color: "rgba(255,255,255,.28)" }}>© 2026 Veloura Holdings Ltd · All rights reserved</div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Privacy","Terms","Cookies"].map(l => <button key={l} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: ".67rem", color: "rgba(255,255,255,.28)", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = "var(--gold)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.28)"}>{l}</button>)}
        </div>
      </div>
    </footer>
  );
};

// ─── Search Bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ onSearch, compact = false, initialVals = {} }) => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [dest, setDest] = useState(initialVals.dest || "");
  const [checkIn, setCheckIn] = useState(initialVals.checkIn || today);
  const [checkOut, setCheckOut] = useState(initialVals.checkOut || tomorrow);
  const [guests, setGuests] = useState(initialVals.guests || 2);
  const [guestOpen, setGuestOpen] = useState(false);
  const [rooms, setRooms] = useState(initialVals.rooms || 1);

  const handle = () => onSearch({ dest, checkIn, checkOut, guests, rooms });

  return (
    <div style={{
      background: compact ? "var(--white)" : "rgba(255,255,255,.95)",
      backdropFilter: "blur(20px)",
      borderRadius: compact ? 14 : 18,
      padding: compact ? "12px" : "14px",
      display: "flex", flexWrap: "wrap", gap: 2, alignItems: "stretch",
      boxShadow: compact ? "0 4px 24px rgba(0,0,0,.1)" : "0 24px 80px rgba(0,0,0,.35)",
      border: compact ? "1.5px solid var(--linen)" : "1px solid rgba(255,255,255,.3)"
    }}>
      {/* Destination */}
      <div style={{ flex: "1 1 200px", padding: "6px 14px", borderRight: "1px solid var(--linen)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Destination</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="search" s={14} c="var(--gold)"/>
          <input value={dest} onChange={e => setDest(e.target.value)} placeholder="Where to?" style={{ border: "none", outline: "none", fontFamily: "var(--sans)", fontSize: ".92rem", color: "var(--ink)", background: "transparent", width: "100%" }}/>
        </div>
      </div>
      {/* Check in */}
      <div style={{ flex: "0 1 150px", padding: "6px 14px", borderRight: "1px solid var(--linen)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Check In</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="calendar" s={14} c="var(--gold)"/>
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ border: "none", outline: "none", fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--ink)", background: "transparent", width: "100%" }}/>
        </div>
      </div>
      {/* Check out */}
      <div style={{ flex: "0 1 150px", padding: "6px 14px", borderRight: "1px solid var(--linen)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Check Out</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="calendar" s={14} c="var(--gold)"/>
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ border: "none", outline: "none", fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--ink)", background: "transparent", width: "100%" }}/>
        </div>
      </div>
      {/* Guests */}
      <div style={{ flex: "0 1 140px", padding: "6px 14px", position: "relative" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Guests & Rooms</div>
        <button onClick={() => setGuestOpen(!guestOpen)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
          <Ic n="users" s={14} c="var(--gold)"/>
          <span style={{ fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--ink)" }}>{guests} guest{guests > 1 ? "s" : ""}, {rooms} room{rooms > 1 ? "s" : ""}</span>
        </button>
        {guestOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "var(--white)", border: "1.5px solid var(--linen)", borderRadius: 12, padding: 18, zIndex: 200, width: 240, boxShadow: "0 16px 48px rgba(0,0,0,.15)", animation: "fadeDown .25s" }}>
            {[["Adults", guests, v => setGuests(Math.max(1, v))],["Rooms", rooms, v => setRooms(Math.max(1, v))]].map(([label, val, set]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--linen)" }}>
                <div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 500, color: "var(--navy)" }}>{label}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)" }}>Min 1</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button onClick={() => set(val - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid var(--mist)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="minus" s={12} c="var(--slate)"/></button>
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".9rem", fontWeight: 500, minWidth: 20, textAlign: "center" }}>{val}</span>
                  <button onClick={() => set(val + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid var(--mist)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="plus" s={12} c="var(--slate)"/></button>
                </div>
              </div>
            ))}
            <button onClick={() => setGuestOpen(false)} className="btn-navy" style={{ width: "100%", justifyContent: "center", marginTop: 14, padding: "10px" }}>Apply</button>
          </div>
        )}
      </div>
      {/* Search button */}
      <button onClick={handle} className="btn-gold" style={{ padding: "0 28px", borderRadius: 12, fontSize: ".88rem", flexShrink: 0 }}>
        <Ic n="search" s={16} c="var(--ink)"/><span>Search</span>
      </button>
    </div>
  );
};

// ─── Hotel Card ───────────────────────────────────────────────────────────────
const HotelCard = ({ hotel, navigate, wishlist, onWishlist }) => {
  const saved = wishlist?.includes(hotel.id);
  const [hovered, setHovered] = useState(false);
  return (
    <div className="hotel-card card-shine" onClick={() => navigate("hotel", hotel)} style={{ display: "flex", flexDirection: "column" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="hotel-card-img" style={{ height: 220 }}>
        <div className="hotel-card-img-inner" style={{ height: "100%", background: hotel.gradient, position: "relative", overflow: "hidden" }}>
          <DestVisual name={hotel.city} color={hotel.gradient} w="100%" h="220"/>
        </div>
        {/* Overlay on hover */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.25)", opacity: hovered ? 1 : 0, transition: "opacity .4s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "rgba(201,168,76,.9)", color: "var(--ink)", fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", padding: "9px 18px", borderRadius: 6, transform: hovered ? "scale(1)" : "scale(.8)", transition: "transform .4s var(--ease)" }}>View Hotel</div>
        </div>
        <div style={{ position: "absolute", top: 14, left: 14 }}>
          <span className="badge badge-gold">{hotel.category}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onWishlist(hotel.id); }} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all .25s", transform: saved ? "scale(1.15)" : "scale(1)" }}>
          <Ic n={saved ? "heartF" : "heart"} s={15} c={saved ? "#d63031" : "var(--slate)"}/>
        </button>
      </div>
      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>{hotel.city}, {hotel.country}</div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 500, color: "var(--navy)", lineHeight: 1.25 }}>{hotel.name}</h3>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.35rem", fontWeight: 600, color: "var(--navy)", transition: "color .3s", ...(hovered ? { color: "var(--gold-dk)" } : {}) }}>${hotel.priceFrom}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)" }}>per night</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Stars rating={hotel.stars}/>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--slate)", fontWeight: 500 }}>{hotel.rating}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)" }}>({hotel.reviews.toLocaleString()})</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {hotel.tags.slice(0, 3).map(t => <span key={t} className="amenity">{t}</span>)}
          {hotel.tags.length > 3 && <span className="amenity">+{hotel.tags.length - 3}</span>}
        </div>
        <div style={{ marginTop: "auto" }}>
          <button className="btn-gold" style={{ width: "100%", justifyContent: "center", transform: hovered ? "translateY(-1px)" : "translateY(0)", transition: "transform .3s var(--ease)", boxShadow: hovered ? "0 8px 24px rgba(201,168,76,.4)" : "none" }} onClick={e => { e.stopPropagation(); navigate("hotel", hotel); }}>
            <span>View Rooms</span><Ic n="arrow" s={14} c="var(--ink)"/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  HOME PAGE
// ════════════════════════════════════════════════════════════════════════════
const HomePage = ({ navigate, wishlist, onWishlist }) => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const parallax = useParallax(0.25);
  const [r1, v1] = useInView(); const [r2, v2] = useInView(); const [r3, v3] = useInView(); const [r4, v4] = useInView();

  const heroSlides = [
    { title: "Sleep Above the Clouds", sub: "Rooftop suites in the world's greatest cities", city: "Paris", bg: "linear-gradient(160deg,#1a3352 0%,#0f1923 100%)" },
    { title: "The Caldera Awaits", sub: "Cliffside cave suites above the Aegean Sea", city: "Santorini", bg: "linear-gradient(160deg,#1a4a6b 0%,#0d2a3a 100%)" },
    { title: "Ancient Silence", sub: "Ryokan retreats in the heart of old Kyoto", city: "Tokyo", bg: "linear-gradient(160deg,#2d1a0e 0%,#1a0a08 100%)" },
  ];

  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 6000); return () => clearInterval(t); }, []);

  const h = heroSlides[activeSlide];

  return (
    <div className="page">
      {/* ── HERO ── */}
      <section style={{ height: "100vh", minHeight: 700, position: "relative", overflow: "hidden" }}>
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, transition: "all 1.4s cubic-bezier(0.16,1,0.3,1)", transform: `translateY(${parallax}px) scale(1.12)`, transformOrigin: "center top" }}>
          <DestVisual name={h.city} w="100%" h="100%"/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.35) 0%,rgba(0,0,0,.05) 40%,rgba(0,0,0,.75) 100%)" }}/>
        </div>

        {/* Ambient particles */}
        <Particles count={22} color="rgba(201,168,76,"/>

        {/* Decorative orbiting rings */}
        <div style={{ position: "absolute", top: "15%", right: "8%", width: 320, height: 320, pointerEvents: "none", opacity: .12 }}>
          <div className="spin-ring" style={{ position: "absolute", inset: 0, border: "1px solid var(--gold)", borderRadius: "50%" }}/>
          <div className="spin-ring-rev" style={{ position: "absolute", inset: 30, border: "1px dashed var(--gold-lt)", borderRadius: "50%" }}/>
          <div style={{ position: "absolute", inset: "50%", width: 8, height: 8, marginTop: -4, marginLeft: -4, borderRadius: "50%", background: "var(--gold)", animation: "orbit 8s linear infinite" }}/>
          <div style={{ position: "absolute", inset: "50%", width: 5, height: 5, marginTop: -2.5, marginLeft: -2.5, borderRadius: "50%", background: "var(--gold-lt)", animation: "orbitSlow 12s linear infinite reverse" }}/>
        </div>

        {/* Slide dots */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 5 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setActiveSlide(i)} style={{ width: i === activeSlide ? 28 : 7, height: 7, borderRadius: 4, background: i === activeSlide ? "var(--gold)" : "rgba(255,255,255,.4)", border: "none", cursor: "pointer", transition: "all .4s var(--ease)", padding: 0 }}/>
          ))}
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 1380, margin: "0 auto", padding: "0 28px" }}>
          <div key={activeSlide} style={{ maxWidth: 700 }}>
            <div className="eyebrow" style={{ color: "var(--gold-lt)", marginBottom: 22, opacity: heroLoaded ? 1 : 0, transition: "opacity .9s .1s", animation: "slideRight .8s var(--ease) .05s both" }}>
              Featured · {h.city}
            </div>
            <h1 style={{
              fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(3rem,6vw,6rem)",
              color: "#fff", lineHeight: 1.05, marginBottom: 22,
              animation: "fadeUpBig .9s var(--ease) .15s both",
            }}>{h.title}</h1>
            {/* Animated gold line under heading */}
            <div style={{ width: 0, height: 2, background: "linear-gradient(90deg,var(--gold),var(--gold-lt))", marginBottom: 22, animation: "drawLine 1.2s var(--ease) .6s forwards", borderRadius: 2 }}/>
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.1rem", color: "rgba(255,255,255,.7)", marginBottom: 48, fontWeight: 300, lineHeight: 1.7, animation: "fadeUp .8s var(--ease) .4s both" }}>{h.sub}</p>
            <div style={{ animation: "fadeUp .8s var(--ease) .6s both" }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Magnetic>
                  <button className="btn-gold" onClick={() => navigate("hotels")} style={{ position: "relative", overflow: "hidden" }}>
                    <span>Explore Hotels</span><Ic n="arrow" s={14} c="var(--ink)"/>
                  </button>
                </Magnetic>
                <button className="btn-outline-white" onClick={() => navigate("destinations")}>View Destinations</button>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, padding: "0 28px", zIndex: 10 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <SearchBar onSearch={() => navigate("hotels")}/>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={{ background: "var(--white)", borderBottom: "1px solid var(--linen)", padding: "18px 28px", overflow: "hidden" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto" }}>
          {/* Animated ticker */}
          <div className="ticker-wrap" style={{ borderBottom: "1px solid var(--linen)", paddingBottom: 14, marginBottom: 14 }}>
            <div className="ticker-track">
              {[...Array(2)].map((_, rep) => (
                <span key={rep} style={{ display: "inline-flex", gap: 60, paddingRight: 60 }}>
                  {["Paris","Santorini","Tokyo","New York","Bali","Dubai","Maldives","Venice","Kyoto","Cape Town","Marrakech","Sydney"].map(c => (
                    <span key={c} style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".15em", color: "var(--fog)", textTransform: "uppercase" }}>✦ {c}</span>
                  ))}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
            {[["12,000+","Hotels Worldwide"],["180","Countries"],["4.9★","Average Rating"],["24/7","Concierge Support"]].map(([n,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 600, color: "var(--navy)", animation: "countUp .8s var(--ease) forwards" }}>{n}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", letterSpacing: ".08em", color: "var(--fog)", textTransform: "uppercase" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED HOTELS ── */}
      <section style={{ padding: "90px 28px" }}>
        <div ref={r1} style={{ maxWidth: 1380, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, opacity: v1 ? 1 : 0, transition: "all .8s var(--ease)" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Curated Selection</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "var(--navy)" }}>Our finest <em style={{ fontStyle: "italic" }}>properties</em>
                <span style={{ display: "block", width: v1 ? "80%" : 0, height: 2, background: "linear-gradient(90deg,var(--gold),transparent)", marginTop: 8, transition: "width 1.2s var(--ease) .3s", borderRadius: 2 }}/>
              </h2>
            </div>
            <button className="btn-outline" onClick={() => navigate("hotels")}>View All Hotels <Ic n="arrow" s={14}/></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {HOTELS.slice(0, 3).map((h, i) => (
              <div key={h.id} style={{ opacity: v1 ? 1 : 0, transform: v1 ? "translateY(0)" : "translateY(40px)", transition: `all .8s var(--ease) ${i * .12}s` }}>
                <HotelCard hotel={h} navigate={navigate} wishlist={wishlist} onWishlist={onWishlist}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section style={{ padding: "0 0 90px" }}>
        <div ref={r2} style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 50, opacity: v2 ? 1 : 0, transition: "all .8s" }}>
            <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 14 }}>Top Destinations</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "var(--navy)" }}>Where will you go <em>next?</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {DESTINATIONS.map((dest, i) => (
              <div key={dest.name} onClick={() => navigate("hotels")} style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative", height: i < 2 ? 300 : 220, opacity: v2 ? 1 : 0, transition: `all .8s var(--ease) ${i * .1}s` }}>
                <div style={{ position: "absolute", inset: 0 }}><DestVisual name={dest.img} w="100%" h="100%"/></div>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.1) 60%)" }}/>
                <div style={{ position: "absolute", bottom: 0, left: 0, padding: 22 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "#fff", fontWeight: 400, lineHeight: 1.2 }}>{dest.name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "rgba(255,255,255,.6)", marginTop: 4 }}>{dest.hotels} hotels · {dest.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "var(--navy)", padding: "90px 28px", position: "relative", overflow: "hidden" }}>
        <Particles count={14}/>
        {/* Big decorative ring */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(201,168,76,.06)", pointerEvents: "none" }}/>
        <div className="spin-ring" style={{ position: "absolute", top: "50%", left: "50%", width: 550, height: 550, marginTop: -275, marginLeft: -275, borderRadius: "50%", border: "1px dashed rgba(201,168,76,.08)", pointerEvents: "none" }}/>
        <div ref={r3} style={{ maxWidth: 1380, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>Simple Process</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 300, color: "#fff", marginBottom: 60 }}>Book your stay in <em style={{ color: "var(--gold-lt)" }}>3 steps</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 40 }}>
            {[
              { icon: "search", step: "01", title: "Discover", desc: "Search thousands of hand-verified luxury properties by destination, dates, and preferences." },
              { icon: "calendar", step: "02", title: "Choose & Book", desc: "Compare rooms, read genuine reviews, and book instantly with free cancellation on most stays." },
              { icon: "conf", step: "03", title: "Experience", desc: "Receive your confirmation instantly and enjoy our 24/7 concierge support throughout your stay." },
            ].map((s, i) => (
              <div key={i} style={{ opacity: v3 ? 1 : 0, transform: v3 ? "translateY(0)" : "translateY(40px)", transition: `all .8s var(--ease) ${i * .15}s` }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", position: "relative", transition: "all .4s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,.2)"; e.currentTarget.style.transform = "scale(1.15) rotate(-5deg)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(201,168,76,.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,.1)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <Ic n={s.icon} s={28} c="var(--gold)"/>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--gold)", letterSpacing: ".14em", marginBottom: 10 }}>STEP {s.step}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "#fff", fontWeight: 400, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,.5)", lineHeight: 1.8, fontSize: ".88rem" }}>{s.desc}</p>
                {/* Connector line */}
                {i < 2 && <div style={{ display: "none" }}/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEALS ── */}
      <section style={{ padding: "90px 28px", background: "var(--linen)" }}>
        <div ref={r4} style={{ maxWidth: 1380, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Limited Time</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 300, color: "var(--navy)" }}>Exclusive <em>offers</em></h2>
            </div>
            <button className="btn-outline" onClick={() => navigate("deals")}>All Deals <Ic n="arrow" s={14}/></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { label: "Early Bird", discount: "30% Off", desc: "Book 30+ days ahead", hotels: "Select luxury hotels", color: "var(--navy)" },
              { label: "Weekend Escape", discount: "20% Off", desc: "Fri–Sun stays", hotels: "200+ city properties", color: "var(--ocean)" },
              { label: "Last Minute", discount: "Up to 40%", desc: "Check-in within 7 days", hotels: "While availability lasts", color: "#3a1a0a" },
            ].map((deal, i) => (
              <div key={i} onClick={() => navigate("deals")} style={{ background: deal.color, borderRadius: 14, padding: "32px 28px", cursor: "pointer", position: "relative", overflow: "hidden", opacity: v4 ? 1 : 0, transition: `all .8s var(--ease) ${i * .12}s` }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)" }}/>
                <div style={{ position: "absolute", bottom: -40, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.03)" }}/>
                <span className="badge" style={{ background: "rgba(201,168,76,.2)", color: "var(--gold-lt)", marginBottom: 16 }}>{deal.label}</span>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.8rem", fontWeight: 300, color: "var(--gold-lt)", lineHeight: 1, marginBottom: 10 }}>{deal.discount}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".9rem", color: "rgba(255,255,255,.7)", marginBottom: 4 }}>{deal.desc}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "rgba(255,255,255,.4)" }}>{deal.hotels}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "linear-gradient(135deg,#0f1923 0%,#1a3352 50%,#0f1923 100%)", backgroundSize: "300% 300%", padding: "100px 28px", textAlign: "center", position: "relative", overflow: "hidden", animation: "gradientShift 10s ease infinite" }}>
        <Particles count={20}/>
        {/* Concentric pulsing rings */}
        {[300,450,620].map((size, i) => (
          <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: size, height: size, marginTop: -size/2, marginLeft: -size/2, borderRadius: "50%", border: "1px solid rgba(201,168,76,.07)", animation: `pulseFast ${4 + i}s ease-in-out ${i * 0.8}s infinite`, pointerEvents: "none" }}/>
        ))}
        <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 20 }}>Members Only</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 300, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
            Join Veloura <em style={{ color: "var(--gold-lt)" }}>Elite</em><br/>and save on every stay
          </h2>
          <p style={{ color: "rgba(255,255,255,.55)", maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.85, fontSize: ".95rem" }}>Exclusive rates, room upgrades, priority support, and late check-out as standard. No fees, ever.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Magnetic>
              <button className="btn-gold" onClick={() => navigate("hotels")} style={{ fontSize: ".95rem", padding: "15px 36px" }}><span>Start Exploring</span><Ic n="arrow" s={15} c="var(--ink)"/></button>
            </Magnetic>
            <button className="btn-outline-white" onClick={() => navigate("about")}>Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  HOTELS PAGE
// ════════════════════════════════════════════════════════════════════════════
const HotelsPage = ({ navigate, wishlist, onWishlist }) => {
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState(1500);
  const [starFilter, setStarFilter] = useState([]);
  const [catFilter, setCatFilter] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleStar = s => setStarFilter(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleCat = c => setCatFilter(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const filtered = HOTELS.filter(h => {
    if (h.priceFrom > priceRange) return false;
    if (starFilter.length && !starFilter.includes(h.stars)) return false;
    if (catFilter.length && !catFilter.includes(h.category)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.priceFrom - b.priceFrom;
    if (sortBy === "price-desc") return b.priceFrom - a.priceFrom;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="page" style={{ paddingTop: 70 }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "48px 28px 36px" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Browse</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "#fff" }}>hospitality<em style={{ color: "var(--gold-lt)" }}>Worldwide</em></h1>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "rgba(255,255,255,.4)" }}>{filtered.length} properties found</div>
          </div>
          <SearchBar onSearch={() => {}} compact={true}/>
        </div>
      </div>

      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "32px 28px", display: "flex", gap: 30 }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: "var(--white)", borderRadius: 14, padding: "22px 20px", border: "1.5px solid var(--linen)", position: "sticky", top: 90 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 500, color: "var(--navy)" }}>Filters</div>
                <button onClick={() => { setStarFilter([]); setCatFilter([]); setPriceRange(1500); }} style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--gold-dk)", background: "none", border: "none", cursor: "pointer" }}>Clear all</button>
              </div>

              {/* Price */}
              <div className="filter-section">
                <div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 14 }}>Price per night</div>
                <input type="range" min="100" max="1500" value={priceRange} onChange={e => setPriceRange(+e.target.value)} style={{ marginBottom: 8 }}/>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--fog)" }}><span>$100</span><span style={{ color: "var(--navy)", fontWeight: 600 }}>Up to ${priceRange}</span></div>
              </div>

              {/* Stars */}
              <div className="filter-section">
                <div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 12 }}>Star Rating</div>
                {[5, 4, 3].map(s => (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={starFilter.includes(s)} onChange={() => toggleStar(s)} style={{ width: 16, height: 16, accentColor: "var(--gold-dk)", cursor: "pointer" }}/>
                    <Stars rating={s} size={12}/>
                    <span style={{ fontFamily: "var(--sans)", fontSize: ".83rem", color: "var(--slate)" }}>{s} Stars</span>
                  </label>
                ))}
              </div>

              {/* Category */}
              <div className="filter-section">
                <div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 12 }}>Category</div>
                {["Luxury","Resort","Boutique","Urban","Lodge"].map(cat => (
                  <label key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={catFilter.includes(cat)} onChange={() => toggleCat(cat)} style={{ width: 16, height: 16, accentColor: "var(--gold-dk)", cursor: "pointer" }}/>
                    <span style={{ fontFamily: "var(--sans)", fontSize: ".83rem", color: "var(--slate)" }}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1.5px solid var(--linen)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--sans)", fontSize: ".82rem", color: "var(--slate)" }}><Ic n="filter" s={14} c="var(--slate)"/>{sidebarOpen ? "Hide" : "Show"} Filters</button>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontFamily: "var(--mono)", fontSize: ".78rem", padding: "8px 14px", border: "1.5px solid var(--linen)", borderRadius: 8, background: "#fff", cursor: "pointer", color: "var(--navy)", outline: "none" }}>
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div style={{ display: "flex", border: "1.5px solid var(--linen)", borderRadius: 8, overflow: "hidden" }}>
                {["grid","list"].map(m => <button key={m} onClick={() => setViewMode(m)} style={{ padding: "8px 10px", background: viewMode === m ? "var(--navy)" : "#fff", border: "none", cursor: "pointer" }}><Ic n={m} s={15} c={viewMode === m ? "#fff" : "var(--fog)"}/></button>)}
              </div>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Ic n="search" s={40} c="var(--mist)"/>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--fog)", marginTop: 16, marginBottom: 8 }}>No hotels match your filters</div>
              <button className="btn-outline" onClick={() => { setStarFilter([]); setCatFilter([]); setPriceRange(1500); }}>Clear Filters</button>
            </div>
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
              {filtered.map(h => <HotelCard key={h.id} hotel={h} navigate={navigate} wishlist={wishlist} onWishlist={onWishlist}/>)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map(h => (
                <div key={h.id} onClick={() => navigate("hotel", h)} style={{ background: "var(--white)", borderRadius: 14, display: "flex", gap: 0, overflow: "hidden", cursor: "pointer", border: "1.5px solid var(--linen)", transition: "all .3s var(--ease)" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.12)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ width: 260, flexShrink: 0, position: "relative" }}>
                    <DestVisual name={h.city} w="260" h="200"/>
                    <div style={{ position: "absolute", top: 12, left: 12 }}><span className="badge badge-gold">{h.category}</span></div>
                  </div>
                  <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", textTransform: "uppercase", marginBottom: 5 }}>{h.city}, {h.country}</div>
                        <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.35rem", color: "var(--navy)", marginBottom: 8 }}>{h.name}</h3>
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                          <Stars rating={h.stars}/>
                          <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--slate)" }}>{h.rating} ({h.reviews.toLocaleString()})</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 600, color: "var(--navy)" }}>${h.priceFrom}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)" }}>per night</div>
                      </div>
                    </div>
                    <p style={{ color: "var(--fog)", fontSize: ".85rem", lineHeight: 1.7, marginBottom: 14, flex: 1 }}>{h.desc.slice(0, 120)}…</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {h.tags.slice(0, 4).map(t => <span key={t} className="amenity" style={{ fontSize: ".72rem" }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  HOTEL DETAIL PAGE
// ════════════════════════════════════════════════════════════════════════════
const HotelDetailPage = ({ hotel, navigate, onBook, user, onLogin, wishlist, onWishlist }) => {
  const h = hotel || HOTELS[0];
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [r1, v1] = useInView();

  return (
    <div className="page" style={{ paddingTop: 70 }}>
      {/* Hero */}
      <div style={{ height: 420, background: h.gradient, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}><DestVisual name={h.city} w="100%" h="420"/></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.6))" }}/>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 28px 36px", maxWidth: 1380, margin: "0 auto" }}>
          <button onClick={() => navigate("hotels")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.6)", fontFamily: "var(--mono)", fontSize: ".72rem", marginBottom: 20 }}><Ic n="arrowL" s={14} c="rgba(255,255,255,.6)"/>Back to Hotels</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span className="badge" style={{ background: "rgba(201,168,76,.2)", color: "var(--gold-lt)", marginBottom: 12 }}>{h.category}</span>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 8 }}>{h.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Stars rating={h.stars}/>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "rgba(255,255,255,.8)" }}>{h.rating} · {h.reviews.toLocaleString()} reviews</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,.6)", fontFamily: "var(--mono)", fontSize: ".72rem" }}><Ic n="pin" s={12} c="var(--gold)"/>{h.city}, {h.country}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => onWishlist(h.id)} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: wishlist?.includes(h.id) ? "#d63031" : "#fff", fontFamily: "var(--sans)", fontSize: ".83rem" }}><Ic n={wishlist?.includes(h.id) ? "heartF" : "heart"} s={14} c={wishlist?.includes(h.id) ? "#d63031" : "#fff"}/>{wishlist?.includes(h.id) ? "Saved" : "Save"}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--linen)", marginTop: 8 }}>
          {["overview","rooms","amenities","location","reviews"].map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, padding: "40px 0 60px", alignItems: "start" }}>
          <div>
            {activeTab === "overview" && (
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "var(--navy)", fontWeight: 400, marginBottom: 16 }}>About the Hotel</h2>
                <p style={{ color: "var(--slate)", lineHeight: 1.9, marginBottom: 32, fontSize: ".95rem" }}>{h.desc}</p>
                <div className="gold-rule" style={{ marginBottom: 32 }}/>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--navy)", marginBottom: 20 }}>Top Amenities</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {h.amenities.map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--white)", border: "1.5px solid var(--linen)", borderRadius: 10, padding: "10px 16px" }}>
                      <Ic n={a} s={16} c="var(--gold-dk)"/>
                      <span style={{ fontFamily: "var(--sans)", fontSize: ".83rem", color: "var(--navy)", textTransform: "capitalize" }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "rooms" && (
              <div ref={r1}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "var(--navy)", fontWeight: 400, marginBottom: 24 }}>Choose Your Room</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {h.rooms.map((room, i) => (
                    <div key={room.id} onClick={() => setSelectedRoom(room)} style={{ background: "var(--white)", border: `2px solid ${selectedRoom?.id === room.id ? "var(--gold)" : "var(--linen)"}`, borderRadius: 14, padding: 24, cursor: "pointer", transition: "all .3s var(--ease)", opacity: v1 ? 1 : 0, transform: v1 ? "translateY(0)" : "translateY(20px)", transition2: `all .6s var(--ease) ${i * .1}s` }} onMouseEnter={e => { if (selectedRoom?.id !== room.id) e.currentTarget.style.borderColor = "var(--mist)"; }} onMouseLeave={e => { if (selectedRoom?.id !== room.id) e.currentTarget.style.borderColor = "var(--linen)"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          {selectedRoom?.id === room.id && <span className="badge badge-gold" style={{ marginBottom: 10 }}>Selected</span>}
                          <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", color: "var(--navy)", marginBottom: 6 }}>{room.name}</h3>
                          <div style={{ display: "flex", gap: 16, fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--fog)", marginBottom: 14 }}>
                            <span>{room.sqm}m²</span><span>{room.beds}</span><span>Up to {room.guests} guests</span><span>{room.view}</span>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {room.amenities.map(a => <span key={a} className="amenity" style={{ fontSize: ".72rem" }}>{a}</span>)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 600, color: "var(--navy)" }}>${room.price}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", marginBottom: 14 }}>per night</div>
                          <button className="btn-gold" style={{ padding: "9px 20px", fontSize: ".8rem" }} onClick={e => { e.stopPropagation(); setSelectedRoom(room); }}>Select Room</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "amenities" && (
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "var(--navy)", fontWeight: 400, marginBottom: 28 }}>Hotel Amenities</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                  {[["Connectivity",["wifi","High-Speed WiFi","Fiber 1Gbps throughout"],["tv","Smart TVs","50\" 4K in all rooms"]],
                    ["Dining",["restaurant","Fine Dining","Award-winning cuisine"],["coffee","In-Room Dining","24-hour service"]],
                    ["Wellness",["pool","Heated Pool","Indoor & outdoor"],["spa","Spa & Wellness","Full-service treatments"]],
                    ["Services",["car","Airport Transfer","Private vehicle"],["gym","Fitness Center","State-of-the-art equipment"]]
                  ].map(([cat,...items]) => (
                    <div key={cat} style={{ background: "var(--white)", borderRadius: 12, padding: 20, border: "1.5px solid var(--linen)" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold-dk)", marginBottom: 14 }}>{cat}</div>
                      {items.map(([icon, label, desc]) => (
                        <div key={label} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(201,168,76,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic n={icon} s={16} c="var(--gold-dk)"/></div>
                          <div><div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 500, color: "var(--navy)" }}>{label}</div><div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)" }}>{desc}</div></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "var(--navy)", fontWeight: 400, marginBottom: 20 }}>Location</h2>
                <div className="map-placeholder" style={{ height: 320, marginBottom: 24 }}>
                  <div className="map-grid"/>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                    <Ic n="pin" s={36} c="var(--gold)"/>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "#fff" }}>{h.city}, {h.country}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "rgba(255,255,255,.5)" }}>{h.lat.toFixed(4)}°N, {h.lng.toFixed(4)}°E</div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--sans)", color: "var(--slate)", lineHeight: 1.8 }}>Situated in the heart of {h.city}, {h.name} offers convenient access to major attractions, transport links, and the city's finest dining. Coordinates: {h.lat.toFixed(4)}, {h.lng.toFixed(4)}.</div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, background: "var(--white)", borderRadius: 14, padding: 24, border: "1.5px solid var(--linen)" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "3.5rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1 }}>{h.rating}</div>
                    <Stars rating={h.rating} size={16}/>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginTop: 6 }}>{h.reviews.toLocaleString()} reviews</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[["Cleanliness",4.9],["Service",4.8],["Location",4.7],["Value",4.6]].map(([label, val]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--slate)", width: 100 }}>{label}</span>
                        <div style={{ flex: 1, height: 4, background: "var(--linen)", borderRadius: 2 }}>
                          <div style={{ width: `${val / 5 * 100}%`, height: "100%", background: "var(--gold)", borderRadius: 2 }}/>
                        </div>
                        <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", fontWeight: 600, color: "var(--navy)", width: 28 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {[{ name: "Sophie M.", rating: 5, text: "Absolutely impeccable. The views are exactly as described and the service was extraordinary from the moment we arrived.", date: "February 2026" },
                  { name: "James W.", rating: 5, text: "We stayed for our anniversary and couldn't have chosen better. The staff remembered small details and made every moment feel special.", date: "January 2026" },
                  { name: "Priya K.", rating: 4, text: "Stunning property with world-class facilities. The spa alone is worth the visit. Only minor feedback: breakfast wait times.", date: "December 2025" }].map((rev, i) => (
                  <div key={i} style={{ background: "var(--white)", borderRadius: 12, padding: 20, marginBottom: 14, border: "1.5px solid var(--linen)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--ocean),var(--slate))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: ".72rem", color: "#fff" }}>{rev.name[0]}</div>
                        <div>
                          <div style={{ fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 500, color: "var(--navy)" }}>{rev.name}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)" }}>{rev.date}</div>
                        </div>
                      </div>
                      <Stars rating={rev.rating} size={13}/>
                    </div>
                    <p style={{ fontFamily: "var(--serif)", fontSize: ".95rem", color: "var(--slate)", lineHeight: 1.75, fontStyle: "italic" }}>{rev.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="booking-sticky">
            <div style={{ background: "var(--white)", borderRadius: 16, border: "2px solid var(--linen)", padding: 26, boxShadow: "0 16px 50px rgba(0,0,0,.1)" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--navy)", marginBottom: 4 }}>
                <em>From</em> ${selectedRoom ? selectedRoom.price : h.priceFrom}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--fog)", marginBottom: 20 }}>per night · taxes included</div>

              {selectedRoom && (
                <div style={{ background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 600, color: "var(--navy)" }}>{selectedRoom.name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginTop: 2 }}>{selectedRoom.beds} · {selectedRoom.view}</div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <div className="field">
                  <label>Check In</label>
                  <input type="date" defaultValue={new Date().toISOString().split("T")[0]}/>
                </div>
                <div className="field">
                  <label>Check Out</label>
                  <input type="date" defaultValue={new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]}/>
                </div>
                <div className="field">
                  <label>Guests</label>
                  <select>
                    {[1,2,3,4].map(n => <option key={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>

              <button className="btn-gold" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: ".9rem" }}
                onClick={() => { if (!user) { onLogin(); } else { onBook(h, selectedRoom || h.rooms[0]); navigate("confirmation"); } }}>
                <Ic n="lock" s={15} c="var(--ink)"/><span>Reserve Now</span>
              </button>
              <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginTop: 12 }}>Free cancellation · No prepayment required</div>

              <div className="gold-rule" style={{ margin: "18px 0" }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["check","Best price guarantee"],["conf","Instant confirmation"],["lock","Secure payment"]].map(([ico, txt]) => (
                  <div key={txt} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--sans)", fontSize: ".82rem", color: "var(--slate)" }}>
                    <Ic n={ico} s={13} c="var(--emerald)"/>{txt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  DESTINATIONS PAGE
// ════════════════════════════════════════════════════════════════════════════
const DestinationsPage = ({ navigate }) => {
  const [r1, v1] = useInView();
  return (
    <div className="page" style={{ paddingTop: 70 }}>
      <div style={{ background: "var(--navy)", padding: "60px 28px 50px", textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>Explore the World</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 300, color: "#fff", marginBottom: 16 }}>Top <em style={{ color: "var(--gold-lt)" }}>Destinations</em></h1>
        <p style={{ color: "rgba(255,255,255,.55)", maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>Hand-curated cities with the world's finest hotel collections, from iconic skylines to remote island retreats.</p>
      </div>
      <div ref={r1} style={{ maxWidth: 1380, margin: "0 auto", padding: "70px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {DESTINATIONS.map((dest, i) => (
            <div key={dest.name} onClick={() => navigate("hotels")} style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", height: 300, position: "relative", opacity: v1 ? 1 : 0, transform: v1 ? "translateY(0)" : "translateY(40px)", transition: `all .8s var(--ease) ${i * .1}s`, boxShadow: "0 4px 20px rgba(0,0,0,.12)" }} onMouseEnter={e => { const img = e.currentTarget.querySelector(".dest-img"); if (img) img.style.transform = "scale(1.06)"; }} onMouseLeave={e => { const img = e.currentTarget.querySelector(".dest-img"); if (img) img.style.transform = "scale(1)"; }}>
              <div className="dest-img" style={{ position: "absolute", inset: 0, transition: "transform .7s var(--ease)" }}><DestVisual name={dest.img} w="100%" h="300"/></div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 60%)" }}/>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "#fff", fontWeight: 400, marginBottom: 4 }}>{dest.name}</h2>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "rgba(255,255,255,.6)" }}>{dest.country}</span>
                  <span className="badge" style={{ background: "rgba(201,168,76,.25)", color: "var(--gold-lt)" }}>{dest.hotels} hotels</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  DEALS PAGE
// ════════════════════════════════════════════════════════════════════════════
const DealsPage = ({ navigate }) => {
  const deals = [
    { label: "Early Bird Special", discount: "30% Off", desc: "Book at least 30 days in advance and save big on our most popular luxury suites. Available at over 400 properties worldwide.", expiry: "Ongoing", hotels: "400+ hotels", code: "EARLY30" },
    { label: "Weekend Getaway", discount: "20% Off", desc: "Check in Friday, check out Sunday — and enjoy 20% off all room types. Perfect for spontaneous city breaks.", expiry: "Every Weekend", hotels: "200+ city hotels", code: "WEEKEND20" },
    { label: "Last Minute Luxury", discount: "Up to 40% Off", desc: "Booking within 7 days? Some of our finest suites are released at dramatic discounts for spontaneous travellers.", expiry: "Limited availability", hotels: "Selected properties", code: "LASTMIN" },
    { label: "Honeymoon Package", discount: "Complimentary Upgrades", desc: "Planning your honeymoon? Receive a complimentary room upgrade, champagne on arrival, and late check-out.", expiry: "Ongoing", hotels: "All properties", code: "HONEYMOON" },
    { label: "Business Traveller", discount: "15% Off + Perks", desc: "For frequent business travellers: enjoy 15% off plus complimentary breakfast and express check-in.", expiry: "Ongoing", hotels: "All properties", code: "BIZ15" },
    { label: "Family Escape", discount: "Kids Stay Free", desc: "Travelling with children under 12? They stay absolutely free when sharing with parents. Plus, family amenity kit on arrival.", expiry: "Ongoing", hotels: "Family-friendly properties", code: "FAMILY" },
  ];
  return (
    <div className="page" style={{ paddingTop: 70 }}>
      <div style={{ background: "linear-gradient(135deg,#0f1923,#1a3352)", padding: "70px 28px", textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>Limited Time</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 300, color: "#fff", marginBottom: 14 }}>Exclusive <em style={{ color: "var(--gold-lt)" }}>Deals</em></h1>
        <p style={{ color: "rgba(255,255,255,.55)", maxWidth: 460, margin: "0 auto" }}>Member-only rates and seasonal offers on our finest hotel collection.</p>
      </div>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "70px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {deals.map((deal, i) => (
            <div key={deal.label} onClick={() => navigate("hotels")} style={{ background: "var(--white)", borderRadius: 16, padding: 28, border: "1.5px solid var(--linen)", cursor: "pointer", transition: "all .3s var(--ease)", position: "relative", overflow: "hidden" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,.12)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(201,168,76,.06)" }}/>
              <span className="badge badge-gold" style={{ marginBottom: 16 }}>{deal.label}</span>
              <div style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", fontWeight: 300, color: "var(--navy)", lineHeight: 1.1, marginBottom: 12 }}>{deal.discount}</div>
              <p style={{ color: "var(--fog)", lineHeight: 1.75, fontSize: ".85rem", marginBottom: 20 }}>{deal.desc}</p>
              <div className="gold-rule" style={{ marginBottom: 18 }}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", marginBottom: 4 }}>PROMO CODE</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".9rem", fontWeight: 600, color: "var(--gold-dk)", background: "rgba(201,168,76,.1)", padding: "4px 12px", borderRadius: 6, letterSpacing: ".1em" }}>{deal.code}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", marginBottom: 2 }}>{deal.expiry}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--slate)" }}>{deal.hotels}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  CONFIRMATION PAGE
// ════════════════════════════════════════════════════════════════════════════
const ConfirmationPage = ({ navigate, booking }) => {
  const ref = number => `VLR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const confNum = useState(ref())[0];
  return (
    <div className="page" style={{ paddingTop: 70, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--sand) 0%,var(--linen) 100%)" }}>
      <div style={{ background: "var(--white)", borderRadius: 20, padding: "56px 48px", maxWidth: 540, width: "100%", margin: "20px", boxShadow: "0 30px 80px rgba(0,0,0,.12)", textAlign: "center", animation: "zoomIn .5s var(--ease)" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "zoomInBounce .7s var(--ease) forwards, borderGlow 2.5s ease 1s infinite" }}>
          <Ic n="check" s={40} c="var(--ink)" sw={2.5}/>
        </div>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 12 }}>Booking Confirmed</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--navy)", marginBottom: 8 }}>You're booked!</h1>
        <p style={{ color: "var(--fog)", lineHeight: 1.75, marginBottom: 32 }}>Your reservation has been confirmed. A confirmation email has been sent to your inbox.</p>

        <div style={{ background: "var(--sand)", borderRadius: 12, padding: "20px 24px", marginBottom: 28, textAlign: "left" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--fog)", marginBottom: 12 }}>Booking Details</div>
          {[
            ["Confirmation #", confNum],
            ["Hotel", booking?.hotel?.name || "The Meridian Grand"],
            ["Room", booking?.room?.name || "Deluxe King"],
            ["Check-in", booking?.checkIn || new Date().toLocaleDateString()],
            ["Check-out", booking?.checkOut || new Date(Date.now() + 86400000 * 3).toLocaleDateString()],
            ["Guests", booking?.guests || "2 Guests"],
            ["Total", `$${booking?.total || "1,260"}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--linen)" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--fog)" }}>{k}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 500, color: "var(--navy)" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-gold" onClick={() => navigate("bookings")} style={{ flex: 1, justifyContent: "center" }}><Ic n="booking" s={14} c="var(--ink)"/><span>My Bookings</span></button>
          <button className="btn-outline" onClick={() => navigate("home")} style={{ flex: 1, justifyContent: "center" }}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  MY BOOKINGS PAGE
// ════════════════════════════════════════════════════════════════════════════
const BookingsPage = ({ navigate, user, bookings }) => {
  if (!user) return (
    <div className="page" style={{ paddingTop: 70, minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Ic n="lock" s={44} c="var(--mist)"/>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "var(--navy)", marginTop: 16, marginBottom: 8 }}>Please sign in</div>
        <button className="btn-gold" onClick={() => navigate("home")}><span>Go Home</span></button>
      </div>
    </div>
  );
  return (
    <div className="page" style={{ paddingTop: 70 }}>
      <div style={{ background: "var(--navy)", padding: "50px 28px 40px" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>My Account</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 300, color: "#fff" }}>My <em style={{ color: "var(--gold-lt)" }}>Bookings</em></h1>
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "50px 28px" }}>
        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Ic n="booking" s={44} c="var(--mist)"/>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--navy)", marginTop: 16, marginBottom: 8 }}>No bookings yet</div>
            <p style={{ color: "var(--fog)", marginBottom: 28 }}>Start exploring our collection of luxury hotels.</p>
            <button className="btn-gold" onClick={() => navigate("hotels")}><span>Browse Hotels</span><Ic n="arrow" s={14} c="var(--ink)"/></button>
          </div>
        ) : bookings.map((b, i) => (
          <div key={i} style={{ background: "var(--white)", borderRadius: 14, padding: 24, marginBottom: 14, border: "1.5px solid var(--linen)", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 100, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
              <DestVisual name={b.hotel?.city || "paris"} w="100" h="80"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--navy)", marginBottom: 4 }}>{b.hotel?.name || "The Meridian Grand"}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--fog)", marginBottom: 8 }}>{b.room?.name || "Deluxe King"} · {b.nights || 3} nights</div>
              <div style={{ display: "flex", gap: 10 }}>
                <span className="badge badge-green">Confirmed</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)" }}>Ref: VLR-{Math.random().toString(36).toUpperCase().slice(2, 8)}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 600, color: "var(--navy)" }}>${b.total || 1260}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginBottom: 10 }}>Total paid</div>
              <button className="btn-outline" style={{ padding: "7px 16px", fontSize: ".78rem" }} onClick={() => navigate("hotel", b.hotel)}>View Hotel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  ABOUT PAGE
// ════════════════════════════════════════════════════════════════════════════
const AboutPage = ({ navigate }) => (
  <div className="page" style={{ paddingTop: 70 }}>
    <div style={{ background: "linear-gradient(160deg,#0f1923,#1a3352)", padding: "100px 28px", textAlign: "center" }}>
      <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 18 }}>Our Story</div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 300, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
        Redefining the <em style={{ color: "var(--gold-lt)" }}>luxury stay</em>
      </h1>
      <p style={{ color: "rgba(255,255,255,.55)", maxWidth: 520, margin: "0 auto", lineHeight: 1.9, fontSize: "1rem" }}>Since 2008, Veloura has curated the world's finest hotel experiences — one extraordinary stay at a time.</p>
    </div>
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "90px 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", marginBottom: 90 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Who We Are</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--navy)", lineHeight: 1.2, marginBottom: 24 }}>Crafted for the discerning traveller</h2>
          <p style={{ color: "var(--slate)", lineHeight: 1.9, marginBottom: 18, fontSize: ".95rem" }}>Veloura was founded on a simple belief: that every traveller deserves an experience that exceeds expectation. Our team of 200+ travel experts personally vets every property on our platform.</p>
          <p style={{ color: "var(--fog)", lineHeight: 1.9, marginBottom: 36, fontSize: ".9rem" }}>From boutique ryokans in Kyoto to cliff-side villas in Santorini, we bring together the world's most extraordinary hotels under one trusted platform.</p>
          <button className="btn-navy" onClick={() => navigate("hotels")}><span>Explore Our Collection</span><Ic n="arrow" s={14} c="var(--sand)"/></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["12,000+","Curated Properties"],["180","Countries"],["2.4M+","Happy Guests"],["4.9★","Average Rating"]].map(([n, l], i) => (
            <div key={l} style={{ background: "var(--navy)", borderRadius: 14, padding: 24, textAlign: "center", transition: "all .35s var(--ease)", animation: `float ${4 + i * 0.8}s ease-in-out ${i * 0.4}s infinite` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 600, color: "var(--gold-lt)", marginBottom: 6 }}>{n}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="gold-rule" style={{ marginBottom: 90 }}/>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 14 }}>Why Choose Veloura</div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--navy)" }}>The Veloura <em>difference</em></h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 30 }}>
        {[{ icon: "conf", title: "Verified Excellence", desc: "Every property is personally inspected by our team. No hotel makes it onto our platform without meeting our strict quality standards." },
          { icon: "lock", title: "Secure & Transparent", desc: "Bank-level encryption, no hidden fees, and full cancellation transparency. What you see is exactly what you pay." },
          { icon: "phone", title: "24/7 Concierge", desc: "Our global team of luxury travel experts is available around the clock, in 28 languages, to handle any request." }].map((item, i) => (
          <div key={i} style={{ textAlign: "center", padding: "32px 24px", background: "var(--white)", borderRadius: 14, border: "1.5px solid var(--linen)" }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><Ic n={item.icon} s={24} c="var(--ink)"/></div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", color: "var(--navy)", marginBottom: 12, fontWeight: 500 }}>{item.title}</h3>
            <p style={{ color: "var(--fog)", lineHeight: 1.8, fontSize: ".87rem" }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  AUTH MODAL
// ════════════════════════════════════════════════════════════════════════════
const AuthModal = ({ mode: initMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState(initMode || "signin");
  const [form, setForm] = useState({ name: "", email: "demo@Veloura.com", password: "password123" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = () => {
    const errs = {};
    if (mode === "signup" && !form.name.trim()) errs.name = "Name is required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (form.password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(DEMO_USER); onClose(); }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ padding: "28px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Ic n="logo" s={32}/>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 500, color: "var(--navy)" }}>Veloura</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,.04)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="close" s={16} c="var(--slate)"/></button>
        </div>

        <div style={{ padding: "24px 28px 0" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", color: "var(--navy)", fontWeight: 400, marginBottom: 6 }}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "var(--fog)", fontSize: ".85rem", marginBottom: 28 }}>
            {mode === "signin" ? "Sign in to access your bookings and exclusive rates." : "Join Veloura for member-only prices and perks."}
          </p>

          {/* Demo hint */}
          <div style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 22, display: "flex", gap: 8, alignItems: "center" }}>
            <Ic n="alert" s={14} c="var(--gold-dk)"/>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--gold-dk)" }}>Demo: use any email & password (6+ chars)</span>
          </div>
        </div>

        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <div className="field">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Alexandra Chen"/>
              {errors.name && <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--ruby)", marginTop: 4 }}>{errors.name}</div>}
            </div>
          )}
          <div className="field">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com"/>
            {errors.email && <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--ruby)", marginTop: 4 }}>{errors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handle} placeholder="••••••••" style={{ paddingRight: 40 }}/>
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}><Ic n={showPw ? "eyeOff" : "eye"} s={16} c="var(--fog)"/></button>
            </div>
            {errors.password && <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--ruby)", marginTop: 4 }}>{errors.password}</div>}
          </div>

          <button onClick={submit} className="btn-gold" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: ".9rem", marginTop: 4, opacity: loading ? .7 : 1 }}>
            {loading ? <><Ic n="refresh" s={16} c="var(--ink)" style={{ animation: "spin 1s linear infinite" }}/><span>Signing in…</span></> : <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>}
          </button>

          <div style={{ textAlign: "center", fontFamily: "var(--sans)", fontSize: ".84rem", color: "var(--fog)" }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gold-dk)", fontWeight: 600, fontFamily: "var(--sans)", fontSize: ".84rem" }}>{mode === "signin" ? "Sign Up" : "Sign In"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  const [pageData, setPageData] = useState(null);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lastBooking, setLastBooking] = useState(null);
  const [toast, showToast] = useToast();

  const navigate = useCallback((pg, data = null) => {
    setPage(pg); setPageData(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onWishlist = id => {
    setWishlist(p => {
      const next = p.includes(id) ? p.filter(x => x !== id) : [...p, id];
      showToast(next.includes(id) ? "Saved to wishlist" : "Removed from wishlist", next.includes(id) ? "♡" : "✕");
      return next;
    });
  };

  const onLogin = () => setAuthOpen(true);
  const onLogout = () => { setUser(null); showToast("Signed out successfully", "👋"); };

  const onBook = (hotel, room) => {
    const booking = { hotel, room, nights: 3, total: room.price * 3, checkIn: new Date().toLocaleDateString(), checkOut: new Date(Date.now() + 86400000 * 3).toLocaleDateString(), guests: "2 Guests" };
    setLastBooking(booking);
    setBookings(p => [booking, ...p]);
    showToast("Booking confirmed!", "✓");
  };

  const noLayout = ["confirmation"];

  const renderPage = () => {
    const base = { navigate, user, wishlist, onWishlist };
    switch(page) {
      case "home":         return <HomePage {...base}/>;
      case "hotels":       return <HotelsPage {...base}/>;
      case "hotel":        return <HotelDetailPage {...base} hotel={pageData} onBook={onBook} onLogin={onLogin}/>;
      case "destinations": return <DestinationsPage {...base}/>;
      case "deals":        return <DealsPage {...base}/>;
      case "about":        return <AboutPage {...base}/>;
      case "bookings":     return <BookingsPage {...base} bookings={bookings}/>;
      case "confirmation": return <ConfirmationPage navigate={navigate} booking={lastBooking}/>;
      default:             return <HomePage {...base}/>;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollProgress/>
      <Toast t={toast}/>
      {!noLayout.includes(page) && <Navbar navigate={navigate} page={page} user={user} onLogin={onLogin} onLogout={onLogout}/>}
      <main style={{ flex: 1 }}>{renderPage()}</main>
      {!noLayout.includes(page) && <Footer navigate={navigate}/>}
      {authOpen && <AuthModal mode="signin" onClose={() => setAuthOpen(false)} onSuccess={u => { setUser(u); showToast(`Welcome back, ${u.name.split(" ")[0]}!`, "🏨"); }}/>}
    </div>
  );
}
