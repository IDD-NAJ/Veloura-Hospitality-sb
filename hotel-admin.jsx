import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from "recharts";

/* ─── Fonts ──────────────────────────────────────────────────────────────── */
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(_fl);

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const _gs = document.createElement("style");
_gs.textContent = `
  :root {
    --bg:#07090D; --surf:#0C1018; --card:#111820; --raised:#18222E;
    --b1:#1C2A3A; --b2:#243548; --b3:#2C4060;
    --gold:#D4A843; --gold-lt:#ECC96A; --gold-dim:rgba(212,168,67,.13);
    --teal:#2DD4BF; --teal-dim:rgba(45,212,191,.11);
    --red:#F87171;  --red-dim:rgba(248,113,113,.11);
    --green:#4ADE80; --green-dim:rgba(74,222,128,.11);
    --blue:#60A5FA; --blue-dim:rgba(96,165,250,.11);
    --amber:#FBBF24; --amber-dim:rgba(251,191,36,.11);
    --purple:#A78BFA; --purple-dim:rgba(167,139,250,.11);
    --t1:#DDE6F0; --t2:#6E8CA8; --t3:#374F67;
    --serif:'Syne',sans-serif; --mono:'IBM Plex Mono',monospace; --sans:'IBM Plex Sans',sans-serif;
    --ease:cubic-bezier(.16,1,.3,1);
    --sw:232px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;}
  body{font-family:var(--sans);background:var(--bg);color:var(--t1);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
  ::selection{background:var(--gold);color:#000;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--b3);border-radius:4px;}

  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  @keyframes fadeUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn {from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  @keyframes slideX  {from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
  @keyframes shimmer {0%{background-position:-600px 0}100%{background-position:600px 0}}
  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes glow    {0%,100%{box-shadow:0 0 0 0 rgba(212,168,67,.45)}60%{box-shadow:0 0 0 10px rgba(212,168,67,0)}}

  .pg { animation: fadeUp .38s var(--ease); }
  .stg > * { opacity:0; animation: fadeUp .5s var(--ease) forwards; }
  .stg > *:nth-child(1){animation-delay:.03s} .stg > *:nth-child(2){animation-delay:.07s}
  .stg > *:nth-child(3){animation-delay:.11s} .stg > *:nth-child(4){animation-delay:.15s}
  .stg > *:nth-child(5){animation-delay:.19s} .stg > *:nth-child(6){animation-delay:.23s}
  .stg > *:nth-child(7){animation-delay:.27s} .stg > *:nth-child(8){animation-delay:.31s}
  .stg > *:nth-child(9){animation-delay:.35s} .stg > *:nth-child(10){animation-delay:.39s}

  /* Sidebar nav */
  .nv{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:7px;cursor:pointer;color:var(--t2);font-size:.82rem;font-weight:500;border:none;background:none;width:100%;text-align:left;font-family:var(--sans);transition:all .17s;position:relative;}
  .nv:hover{background:var(--raised);color:var(--t1);}
  .nv.on{background:var(--gold-dim);color:var(--gold);}
  .nv.on::before{content:'';position:absolute;left:0;top:20%;height:60%;width:2px;background:var(--gold);border-radius:0 2px 2px 0;}
  .ng{font-family:var(--mono);font-size:.59rem;letter-spacing:.14em;text-transform:uppercase;color:var(--t3);padding:14px 12px 5px;margin-top:2px;}

  /* Card */
  .card{background:var(--card);border:1px solid var(--b1);border-radius:12px;}
  .card-h{transition:border-color .2s,transform .18s;}
  .card-h:hover{border-color:var(--b2);transform:translateY(-1px);}

  /* Badges */
  .bdg{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-family:var(--mono);font-size:.64rem;font-weight:500;white-space:nowrap;}
  .bdg-confirmed {background:var(--green-dim); color:var(--green);}
  .bdg-pending   {background:var(--amber-dim); color:var(--amber);}
  .bdg-cancelled {background:var(--red-dim);   color:var(--red);}
  .bdg-checkedin {background:var(--teal-dim);  color:var(--teal);}
  .bdg-checkedout{background:rgba(110,140,168,.1);color:var(--t2);}
  .bdg-available {background:var(--green-dim); color:var(--green);}
  .bdg-occupied  {background:var(--gold-dim);  color:var(--gold);}
  .bdg-maintenance{background:var(--red-dim);  color:var(--red);}
  .bdg-gold  {background:var(--gold-dim);   color:var(--gold);}
  .bdg-blue  {background:var(--blue-dim);   color:var(--blue);}
  .bdg-teal  {background:var(--teal-dim);   color:var(--teal);}
  .bdg-purple{background:var(--purple-dim); color:var(--purple);}

  /* Buttons */
  .bp{display:inline-flex;align-items:center;gap:7px;background:var(--gold);color:#000;font-family:var(--sans);font-weight:600;font-size:.8rem;padding:8px 17px;border:none;border-radius:7px;cursor:pointer;transition:all .2s;white-space:nowrap;}
  .bp:hover{background:var(--gold-lt);transform:translateY(-1px);box-shadow:0 5px 18px rgba(212,168,67,.32);}
  .bp:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .bs{display:inline-flex;align-items:center;gap:7px;background:var(--raised);color:var(--t2);font-family:var(--sans);font-weight:500;font-size:.8rem;padding:8px 17px;border:1px solid var(--b2);border-radius:7px;cursor:pointer;transition:all .2s;white-space:nowrap;}
  .bs:hover{background:var(--b1);color:var(--t1);}
  .bd{display:inline-flex;align-items:center;gap:7px;background:var(--red-dim);color:var(--red);font-family:var(--sans);font-weight:500;font-size:.8rem;padding:8px 17px;border:1px solid rgba(248,113,113,.2);border-radius:7px;cursor:pointer;transition:all .2s;}
  .bd:hover{background:rgba(248,113,113,.2);}
  .bi{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:6px;background:var(--raised);border:1px solid var(--b1);cursor:pointer;transition:all .17s;color:var(--t2);flex-shrink:0;}
  .bi:hover{background:var(--b2);color:var(--t1);}

  /* Inputs */
  .inp{background:var(--raised);border:1px solid var(--b2);border-radius:7px;padding:8px 12px;font-family:var(--sans);font-size:.84rem;color:var(--t1);outline:none;transition:border-color .2s,box-shadow .2s;width:100%;}
  .inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(212,168,67,.1);}
  .inp::placeholder{color:var(--t3);}
  select.inp{cursor:pointer;-webkit-appearance:none;}
  textarea.inp{resize:vertical;min-height:76px;}

  /* Table */
  .tbl{width:100%;border-collapse:collapse;}
  .tbl th{font-family:var(--mono);font-size:.61rem;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);padding:10px 14px;text-align:left;border-bottom:1px solid var(--b1);white-space:nowrap;font-weight:400;}
  .tbl td{padding:12px 14px;font-size:.82rem;border-bottom:1px solid var(--b1);color:var(--t2);vertical-align:middle;}
  .tbl tr:last-child td{border-bottom:none;}
  .tbl tbody tr{transition:background .12s;cursor:pointer;}
  .tbl tbody tr:hover td{background:rgba(255,255,255,.015);}
  .hi{color:var(--t1)!important;font-weight:500;}

  /* Modal */
  .mbg{position:fixed;inset:0;background:rgba(0,0,0,.74);z-index:600;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);animation:fadeIn .22s;}
  .mbox{background:var(--card);border:1px solid var(--b2);border-radius:14px;width:100%;overflow:hidden;animation:scaleIn .28s var(--ease);}
  .mhd{padding:19px 22px 15px;border-bottom:1px solid var(--b1);display:flex;justify-content:space-between;align-items:center;}
  .mbd{padding:22px;}
  .mft{padding:13px 22px;border-top:1px solid var(--b1);display:flex;justify-content:flex-end;gap:8px;}

  /* Toast */
  .tsts{position:fixed;top:18px;right:18px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
  .tst{background:var(--card);border:1px solid var(--b2);border-radius:9px;padding:11px 14px;display:flex;align-items:center;gap:9px;font-size:.81rem;box-shadow:0 12px 40px rgba(0,0,0,.5);animation:slideX .3s var(--ease);min-width:230px;}
  .tst-ok  {border-left:3px solid var(--green);}
  .tst-err {border-left:3px solid var(--red);}
  .tst-info{border-left:3px solid var(--gold);}

  /* Status dot */
  .dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0;}
  .dot-g{background:var(--green);box-shadow:0 0 5px rgba(74,222,128,.7);}
  .dot-o{background:var(--gold);}
  .dot-r{background:var(--red);}
  .dot-b{background:var(--blue);}
  .dot-x{background:var(--t3);}

  /* Progress */
  .prog{height:4px;background:var(--raised);border-radius:2px;overflow:hidden;}
  .prog-f{height:100%;border-radius:2px;transition:width .9s var(--ease);}

  /* Tab */
  .tab{padding:8px 14px;font-size:.8rem;font-weight:500;border:none;background:none;cursor:pointer;color:var(--t3);border-bottom:2px solid transparent;transition:all .17s;font-family:var(--sans);}
  .tab.on{color:var(--gold);border-bottom-color:var(--gold);}
  .tab:hover:not(.on){color:var(--t2);}

  /* Toggle */
  .tgl{position:relative;width:36px;height:19px;cursor:pointer;display:inline-block;}
  .tgl input{opacity:0;position:absolute;width:0;height:0;}
  .tgl-tr{position:absolute;inset:0;background:var(--raised);border:1px solid var(--b2);border-radius:20px;transition:all .22s;}
  .tgl input:checked~.tgl-tr{background:var(--gold);border-color:transparent;}
  .tgl-th{position:absolute;top:2px;left:2px;width:13px;height:13px;background:#fff;border-radius:50%;transition:transform .22s;box-shadow:0 1px 4px rgba(0,0,0,.4);}
  .tgl input:checked~.tgl-tr .tgl-th{transform:translateX(17px);}

  /* Skeleton */
  .skel{background:linear-gradient(90deg,var(--card) 25%,var(--raised) 50%,var(--card) 75%);background-size:600px 100%;animation:shimmer 1.5s infinite;border-radius:6px;}

  /* Calendar occupancy */
  .cc{border-radius:4px;transition:all .17s;cursor:pointer;}
  .cc:hover{transform:scale(1.06);z-index:2;}
  .cc-av{background:var(--green-dim);border:1px solid rgba(74,222,128,.2);}
  .cc-bk{background:var(--gold-dim);border:1px solid rgba(212,168,67,.22);}
  .cc-pt{background:var(--blue-dim);border:1px solid rgba(96,165,250,.2);}
  .cc-mt{background:var(--red-dim);border:1px solid rgba(248,113,113,.2);}

  /* SQL highlight */
  .sql{font-family:var(--mono);font-size:.73rem;background:var(--surf);border:1px solid var(--b1);border-radius:8px;padding:16px 18px;overflow-x:auto;line-height:1.8;color:#8FA3B8;white-space:pre;}
  .kw{color:#7DD3FC;} .tp{color:#86EFAC;} .cm{color:var(--t3);font-style:italic;} .st{color:#FCA5A5;} .fn{color:var(--gold-lt);}

  @media(max-width:860px){:root{--sw:0px;}}
`;
document.head.appendChild(_gs);

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const Ic = ({ n, s = 15, c = "currentColor", sw = 1.7 }) => {
  const p = { width:s, height:s, viewBox:"0 0 24 24", fill:"none", stroke:c, strokeWidth:sw, strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    grid:    <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    book:    <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    room:    <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    user:    <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    trend:   <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    cal:     <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    staff:   <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    cog:     <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    db:      <svg {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    bell:    <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    search:  <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    plus:    <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x:       <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit:    <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:   <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    eye:     <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    check:   <svg {...p} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>,
    warn:    <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    info:    <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    logout:  <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    dollar:  <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    pin:     <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    dl:      <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    refresh: <svg {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    chR:     <svg {...p} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>,
    copy:    <svg {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    mail:    <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    lock:    <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    bld:     <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>,
    bar:     <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  };
  return icons[n] || <svg {...p}/>;
};

/* ─── Backend API Layer ──────────────────────────────────────────────────── */
const API_BASE = "http://localhost:3000/api";
let _adminToken = localStorage.getItem("Veloura_token");

const adminRequest = async (path, opts = {}) => {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (_adminToken) headers["Authorization"] = `Bearer ${_adminToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({ success: false }));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const adminGet = (p) => adminRequest(p);
const adminPost = (p, body) => adminRequest(p, { method: "POST", body: JSON.stringify(body) });
const adminPut = (p, body) => adminRequest(p, { method: "PUT", body: JSON.stringify(body) });
const adminDelete = (p) => adminRequest(p, { method: "DELETE" });

const adminAPI = {
  health: () => adminGet("/health"),
  login: async (email, password) => {
    const res = await adminPost("/auth/login", { email, password });
    if (res.success && res.data) {
      _adminToken = res.data.tokens?.accessToken;
      localStorage.setItem("Veloura_token", _adminToken);
    }
    return res;
  },
  hotels:   { list: () => adminGet("/hotels").then(r => r.data || []) },
  rooms:    { list: (hotelId) => adminGet(`/hotels/${hotelId}/rooms`).then(r => r.data || []),
              listAll: async () => {
                try { const hotels = await adminAPI.hotels.list();
                  const all = await Promise.all(hotels.map(h => adminGet(`/hotels/${h.id}/rooms`).then(r => (r.data||[]).map(rm=>({...rm, hotel_id:h.id, hotel_name:h.name, hotel_city:h.city})))));
                  return all.flat();
                } catch { return []; }
              }},
  bookings: { list: () => adminGet("/bookings").then(r => r.data || []) },
  guests:   { list: () => adminGet("/auth?role=guest").then(r => r.data || []).catch(() => []) },
  staff:    { list: () => adminGet("/staff").then(r => r.data || []).catch(() => []) },
  reviews:  { list: () => adminGet("/reviews").then(r => r.data || []).catch(() => []) },
};

const dbQuery = async (sql, params = []) => {
  // Legacy stub — use adminAPI instead for real data
  await new Promise(r => setTimeout(r, 60 + Math.random() * 100));
  return { rows: [], rowCount: 0 };
};

/* ─── Schema SQL ─────────────────────────────────────────────────────────── */
const SCHEMA = `<span class="cm">-- Veloura · Neon PostgreSQL Schema</span>
<span class="cm">-- Paste into Neon SQL Editor and Run</span>

<span class="kw">CREATE EXTENSION IF NOT EXISTS</span> <span class="fn">pgcrypto</span>;

<span class="kw">CREATE TABLE</span> <span class="tp">users</span> (
  id            <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  email         <span class="tp">TEXT</span> <span class="kw">UNIQUE NOT NULL</span>,
  name          <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>,
  password_hash <span class="tp">TEXT</span>,
  role          <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'guest'</span> <span class="kw">CHECK</span>(role <span class="kw">IN</span>(<span class="st">'guest','staff','manager','admin'</span>)),
  phone         <span class="tp">TEXT</span>,
  nationality   <span class="tp">TEXT</span>,
  loyalty_tier  <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'standard'</span>,
  loyalty_pts   <span class="tp">INTEGER</span> <span class="kw">DEFAULT</span> 0,
  created_at    <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">hotels</span> (
  id          <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  name        <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>,
  city        <span class="tp">TEXT</span>, country <span class="tp">TEXT</span>, stars <span class="tp">INTEGER</span>,
  description <span class="tp">TEXT</span>, amenities <span class="tp">JSONB</span> <span class="kw">DEFAULT</span> <span class="st">'[]'</span>,
  lat <span class="tp">NUMERIC(9,6)</span>, lng <span class="tp">NUMERIC(9,6)</span>,
  active      <span class="tp">BOOLEAN</span> <span class="kw">DEFAULT TRUE</span>,
  created_at  <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">rooms</span> (
  id         <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  hotel_id   <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">hotels</span>(id) <span class="kw">ON DELETE CASCADE</span>,
  name       <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>, type <span class="tp">TEXT</span>,
  floor      <span class="tp">INTEGER</span>, sqm <span class="tp">INTEGER</span>,
  max_guests <span class="tp">INTEGER</span> <span class="kw">DEFAULT</span> 2,
  base_price <span class="tp">NUMERIC(10,2)</span> <span class="kw">NOT NULL</span>,
  status     <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'available'</span>
             <span class="kw">CHECK</span>(status <span class="kw">IN</span>(<span class="st">'available','occupied','maintenance','blocked'</span>)),
  amenities  <span class="tp">JSONB</span> <span class="kw">DEFAULT</span> <span class="st">'[]'</span>,
  created_at <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">bookings</span> (
  id             <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  ref            <span class="tp">TEXT</span> <span class="kw">UNIQUE DEFAULT</span> <span class="fn">upper</span>(<span class="fn">left</span>(<span class="fn">gen_random_uuid</span>()::<span class="tp">text</span>,8)),
  user_id        <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">users</span>(id),
  room_id        <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">rooms</span>(id),
  check_in       <span class="tp">DATE</span> <span class="kw">NOT NULL</span>,
  check_out      <span class="tp">DATE</span> <span class="kw">NOT NULL</span>,
  nights         <span class="tp">INTEGER</span> <span class="kw">GENERATED ALWAYS AS</span> (check_out - check_in) <span class="kw">STORED</span>,
  guests         <span class="tp">INTEGER</span> <span class="kw">DEFAULT</span> 1,
  room_rate      <span class="tp">NUMERIC(10,2)</span>,
  total_amount   <span class="tp">NUMERIC(10,2)</span>,
  status         <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'pending'</span>
                 <span class="kw">CHECK</span>(status <span class="kw">IN</span>(<span class="st">'pending','confirmed','checked_in','checked_out','cancelled'</span>)),
  payment_status <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'unpaid'</span>
                 <span class="kw">CHECK</span>(payment_status <span class="kw">IN</span>(<span class="st">'unpaid','paid','refunded','partial'</span>)),
  stripe_pi_id   <span class="tp">TEXT</span>,
  source         <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'direct'</span>,
  notes          <span class="tp">TEXT</span>,
  created_at     <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">payments</span> (
  id           <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  booking_id   <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">bookings</span>(id),
  amount       <span class="tp">NUMERIC(10,2)</span>,  currency <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'usd'</span>,
  stripe_pi_id <span class="tp">TEXT</span>,           method <span class="tp">TEXT</span>, status <span class="tp">TEXT</span>,
  created_at   <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">reviews</span> (
  id         <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  booking_id <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">bookings</span>(id),
  user_id    <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">users</span>(id),
  rating     <span class="tp">INTEGER</span> <span class="kw">CHECK</span>(rating <span class="kw">BETWEEN</span> 1 <span class="kw">AND</span> 5),
  title <span class="tp">TEXT</span>, body <span class="tp">TEXT</span>,
  is_public  <span class="tp">BOOLEAN</span> <span class="kw">DEFAULT TRUE</span>,
  created_at <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">staff</span> (
  id         <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  user_id    <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">users</span>(id),
  hotel_id   <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">hotels</span>(id),
  department <span class="tp">TEXT</span>, position <span class="tp">TEXT</span>, shift <span class="tp">TEXT</span>,
  active     <span class="tp">BOOLEAN</span> <span class="kw">DEFAULT TRUE</span>
);

<span class="cm">-- Indexes</span>
<span class="kw">CREATE INDEX ON</span> <span class="tp">bookings</span>(check_in, check_out);
<span class="kw">CREATE INDEX ON</span> <span class="tp">bookings</span>(user_id);
<span class="kw">CREATE INDEX ON</span> <span class="tp">bookings</span>(status);
<span class="kw">CREATE INDEX ON</span> <span class="tp">rooms</span>(hotel_id, status);

<span class="cm">-- Availability function</span>
<span class="kw">CREATE OR REPLACE FUNCTION</span> <span class="fn">is_available</span>(
  p_room <span class="tp">UUID</span>, p_in <span class="tp">DATE</span>, p_out <span class="tp">DATE</span>
) <span class="kw">RETURNS BOOLEAN AS</span> $$
  <span class="kw">SELECT NOT EXISTS</span>(
    <span class="kw">SELECT</span> 1 <span class="kw">FROM</span> <span class="tp">bookings</span>
    <span class="kw">WHERE</span> room_id = p_room
      <span class="kw">AND</span> status <span class="kw">NOT IN</span>(<span class="st">'cancelled'</span>)
      <span class="kw">AND</span> check_in &lt; p_out <span class="kw">AND</span> check_out &gt; p_in
  );
$$ <span class="kw">LANGUAGE SQL</span>;`;

/* ─── API Snippets ───────────────────────────────────────────────────────── */
const SNIPPETS = {
  connect: `<span class="cm">// Install: npm install @neondatabase/serverless</span>
<span class="kw">import</span> { neon } <span class="kw">from</span> <span class="st">'@neondatabase/serverless'</span>;

<span class="cm">// In Next.js — add to .env.local</span>
<span class="cm">// DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/Veloura?sslmode=require"</span>

<span class="kw">const</span> sql = <span class="fn">neon</span>(process.env.<span class="tp">DATABASE_URL</span>);
<span class="kw">export default</span> sql;`,

  bookings: `<span class="cm">// app/api/bookings/route.ts</span>
<span class="kw">import</span> sql <span class="kw">from</span> <span class="st">'@/lib/db'</span>;

<span class="kw">export async function</span> <span class="fn">GET</span>(req) {
  <span class="kw">const</span> { searchParams } = <span class="kw">new</span> <span class="fn">URL</span>(req.url);
  <span class="kw">const</span> status = searchParams.<span class="fn">get</span>(<span class="st">'status'</span>);

  <span class="kw">const</span> rows = <span class="kw">await</span> sql\`
    <span class="kw">SELECT</span> b.*, u.name guest_name, u.email,
           r.name room_name, h.name hotel_name,
           h.city, h.country
    <span class="kw">FROM</span> bookings b
    <span class="kw">JOIN</span> users  u <span class="kw">ON</span> b.user_id = u.id
    <span class="kw">JOIN</span> rooms  r <span class="kw">ON</span> b.room_id = r.id
    <span class="kw">JOIN</span> hotels h <span class="kw">ON</span> r.hotel_id = h.id
    <span class="kw">WHERE</span> (\${status} <span class="kw">IS NULL OR</span> b.status = \${status})
    <span class="kw">ORDER BY</span> b.created_at <span class="kw">DESC</span>
  \`;
  <span class="kw">return</span> <span class="fn">Response</span>.json(rows);
}`,

  availability: `<span class="cm">// app/api/availability/route.ts</span>
<span class="kw">export async function</span> <span class="fn">GET</span>(req) {
  <span class="kw">const</span> { hotel_id, check_in, check_out } =
    <span class="fn">Object</span>.fromEntries(<span class="kw">new</span> <span class="fn">URL</span>(req.url).searchParams);

  <span class="kw">const</span> rooms = <span class="kw">await</span> sql\`
    <span class="kw">SELECT</span> r.* <span class="kw">FROM</span> rooms r
    <span class="kw">WHERE</span> r.hotel_id = \${hotel_id}
      <span class="kw">AND</span> r.status = <span class="st">'available'</span>
      <span class="kw">AND</span> <span class="fn">is_available</span>(r.id, \${check_in}, \${check_out})
    <span class="kw">ORDER BY</span> r.base_price
  \`;
  <span class="kw">return</span> <span class="fn">Response</span>.json(rooms);
}`,

  revenue: `<span class="cm">// app/api/revenue/route.ts</span>
<span class="kw">export async function</span> <span class="fn">GET</span>(req) {
  <span class="kw">const</span> year = <span class="kw">new</span> <span class="fn">URL</span>(req.url).searchParams.<span class="fn">get</span>(<span class="st">'year'</span>) ?? <span class="fn">new Date</span>().<span class="fn">getFullYear</span>();

  <span class="kw">return</span> <span class="fn">Response</span>.json(<span class="kw">await</span> sql\`
    <span class="kw">SELECT</span>
      <span class="fn">to_char</span>(check_in, <span class="st">'Mon'</span>)          month,
      <span class="fn">EXTRACT</span>(month <span class="kw">FROM</span> check_in)      month_num,
      <span class="fn">SUM</span>(total_amount)::int            revenue,
      <span class="fn">COUNT</span>(*)::int                     bookings,
      <span class="fn">ROUND</span>(<span class="fn">AVG</span>(room_rate))::int        adr,
      <span class="fn">ROUND</span>(<span class="fn">COUNT</span>(*) * 100.0 /
        (<span class="kw">SELECT COUNT</span>(*) <span class="kw">FROM</span> rooms))::int occupancy
    <span class="kw">FROM</span> bookings
    <span class="kw">WHERE</span> <span class="fn">EXTRACT</span>(year <span class="kw">FROM</span> check_in) = \${year}
      <span class="kw">AND</span> status != <span class="st">'cancelled'</span>
    <span class="kw">GROUP BY</span> 1,2 <span class="kw">ORDER BY</span> 2
  \`);
}`,
};

/* ─── Mock Data ──────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2,10).toUpperCase();
const rDate = (off, span = 20) => {
  const d = new Date();
  d.setDate(d.getDate() + off + Math.floor(Math.random() * span));
  return d.toISOString().slice(0, 10);
};

const HOTELS = [
  { id:"h1", name:"The Meridian Grand", city:"Paris",    country:"France", stars:5, active:true },
  { id:"h2", name:"Azure Santorini",    city:"Oia",      country:"Greece", stars:5, active:true },
  { id:"h3", name:"Manhattan Noir",     city:"New York", country:"USA",    stars:5, active:true },
];

const ROOMS = [
  { id:"r1", hotel_id:"h1", name:"Deluxe King",      type:"Deluxe",   floor:3,  sqm:35,  max_guests:2, base_price:420,  status:"occupied"    },
  { id:"r2", hotel_id:"h1", name:"Superior Suite",   type:"Suite",    floor:5,  sqm:58,  max_guests:2, base_price:680,  status:"available"   },
  { id:"r3", hotel_id:"h1", name:"Grand Penthouse",  type:"Penthouse",floor:12, sqm:120, max_guests:4, base_price:1240, status:"available"   },
  { id:"r4", hotel_id:"h2", name:"Cave Suite",       type:"Suite",    floor:1,  sqm:42,  max_guests:2, base_price:380,  status:"occupied"    },
  { id:"r5", hotel_id:"h2", name:"Infinity Villa",   type:"Villa",    floor:1,  sqm:90,  max_guests:2, base_price:760,  status:"available"   },
  { id:"r6", hotel_id:"h3", name:"City King",        type:"Deluxe",   floor:22, sqm:32,  max_guests:2, base_price:520,  status:"maintenance" },
  { id:"r7", hotel_id:"h3", name:"Skyline Suite",    type:"Suite",    floor:38, sqm:65,  max_guests:2, base_price:890,  status:"available"   },
  { id:"r8", hotel_id:"h1", name:"Classic Twin",     type:"Classic",  floor:2,  sqm:28,  max_guests:2, base_price:280,  status:"available"   },
];

const GUESTS = [
  { id:"g1", name:"Alexandra Chen",  email:"alex.chen@email.com",    phone:"+1 212 555 0180", nationality:"USA",     loyalty_tier:"gold",     loyalty_pts:4820,  bookings:7,  total_spent:8640,  created_at:"2023-04-12" },
  { id:"g2", name:"James Whitfield", email:"j.whitfield@email.com",  phone:"+44 20 7946 0958",nationality:"UK",      loyalty_tier:"platinum", loyalty_pts:12400, bookings:14, total_spent:22300, created_at:"2022-11-03" },
  { id:"g3", name:"Sophie Marceau",  email:"s.marceau@email.com",    phone:"+33 1 42 00 0000",nationality:"France",  loyalty_tier:"standard", loyalty_pts:980,   bookings:2,  total_spent:1560,  created_at:"2024-02-19" },
  { id:"g4", name:"Priya Kapoor",    email:"priya.k@email.com",      phone:"+91 98765 43210", nationality:"India",   loyalty_tier:"gold",     loyalty_pts:3200,  bookings:5,  total_spent:6100,  created_at:"2023-09-07" },
  { id:"g5", name:"Carlos Rivera",   email:"c.rivera@email.com",     phone:"+1 305 555 0120", nationality:"USA",     loyalty_tier:"standard", loyalty_pts:640,   bookings:2,  total_spent:1020,  created_at:"2024-05-30" },
  { id:"g6", name:"Yuki Tanaka",     email:"yuki.t@email.com",       phone:"+81 3 0000 0000", nationality:"Japan",   loyalty_tier:"platinum", loyalty_pts:9800,  bookings:11, total_spent:18400, created_at:"2022-06-14" },
  { id:"g7", name:"Emma Nielsen",    email:"emma.n@email.com",       phone:"+45 20 20 20 20", nationality:"Denmark", loyalty_tier:"gold",     loyalty_pts:2860,  bookings:4,  total_spent:4900,  created_at:"2023-12-01" },
  { id:"g8", name:"Andrei Popescu",  email:"a.popescu@email.com",    phone:"+40 721 000 000", nationality:"Romania", loyalty_tier:"standard", loyalty_pts:320,   bookings:1,  total_spent:840,   created_at:"2024-07-22" },
];

const STATUSES  = ["confirmed","pending","checked_in","checked_out","cancelled"];
const SOURCES   = ["direct","booking.com","expedia","airbnb","phone"];
const mkBooking = (i) => {
  const g = GUESTS[i % GUESTS.length];
  const r = ROOMS[i % ROOMS.length];
  const h = HOTELS.find(x => x.id === r.hotel_id);
  const nights = 1 + (i % 6);
  const status = STATUSES[i % STATUSES.length];
  return {
    id:`b${i+1}`, ref:uid(),
    guest_name:g.name, guest_email:g.email,
    room_name:r.name, hotel_name:h?.name, hotel_id:h?.id, room_type:r.type,
    check_in:rDate(-8, 24), check_out:rDate(2, 12),
    nights, guests:1+(i%3), room_rate:r.base_price, total_amount:r.base_price*nights,
    status, payment_status: status==="cancelled"?"refunded":"paid",
    source:SOURCES[i%SOURCES.length], created_at:rDate(-28,28),
  };
};
const BOOKINGS_DATA = Array.from({ length:48 }, (_,i) => mkBooking(i));

const STAFF_DATA = [
  { id:"s1", name:"Marcus Fontaine", email:"m.fontaine@Veloura.com", dept:"Front Desk",  position:"General Manager",   shift:"Day",     hotel:"The Meridian Grand", role:"manager", active:true,  since:"2020-03-01" },
  { id:"s2", name:"Isabelle Roux",   email:"i.roux@Veloura.com",     dept:"Housekeeping",position:"Head Housekeeper",  shift:"Morning", hotel:"The Meridian Grand", role:"staff",   active:true,  since:"2021-07-15" },
  { id:"s3", name:"David Kim",       email:"d.kim@Veloura.com",      dept:"Concierge",   position:"Senior Concierge",  shift:"Day",     hotel:"Manhattan Noir",     role:"staff",   active:true,  since:"2022-01-10" },
  { id:"s4", name:"Lucia Ferreira",  email:"l.ferreira@Veloura.com", dept:"Restaurant",  position:"Maître d'hôtel",    shift:"Evening", hotel:"Azure Santorini",    role:"staff",   active:true,  since:"2021-11-20" },
  { id:"s5", name:"Thomas Berg",     email:"t.berg@Veloura.com",     dept:"Maintenance", position:"Facilities Manager",shift:"Day",     hotel:"The Meridian Grand", role:"staff",   active:false, since:"2019-05-12" },
  { id:"s6", name:"Aisha Rahman",    email:"a.rahman@Veloura.com",   dept:"Spa",         position:"Spa Manager",       shift:"Morning", hotel:"Azure Santorini",    role:"staff",   active:true,  since:"2023-02-28" },
];

const REVENUE_DATA = [
  { month:"Jan", revenue:142000, bookings:38, adr:524, occ:71 },
  { month:"Feb", revenue:168000, bookings:44, adr:546, occ:75 },
  { month:"Mar", revenue:192000, bookings:52, adr:558, occ:80 },
  { month:"Apr", revenue:224000, bookings:61, adr:572, occ:84 },
  { month:"May", revenue:248000, bookings:68, adr:580, occ:88 },
  { month:"Jun", revenue:286000, bookings:76, adr:596, occ:92 },
  { month:"Jul", revenue:312000, bookings:82, adr:608, occ:95 },
  { month:"Aug", revenue:298000, bookings:79, adr:600, occ:93 },
  { month:"Sep", revenue:264000, bookings:71, adr:584, occ:88 },
  { month:"Oct", revenue:238000, bookings:64, adr:570, occ:83 },
  { month:"Nov", revenue:196000, bookings:53, adr:552, occ:77 },
  { month:"Dec", revenue:218000, bookings:59, adr:564, occ:82 },
];

const PIE_DATA = [
  { name:"Direct",      value:38, color:"#D4A843" },
  { name:"Booking.com", value:28, color:"#60A5FA" },
  { name:"Expedia",     value:16, color:"#2DD4BF" },
  { name:"Airbnb",      value:11, color:"#A78BFA" },
  { name:"Phone",       value: 7, color:"#4ADE80" },
];

/* ─── Hooks ──────────────────────────────────────────────────────────────── */
const useToast = () => {
  const [list, setList] = useState([]);
  const add = useCallback((msg, type="info") => {
    const id = Date.now();
    setList(p => [...p, { id, msg, type }]);
    setTimeout(() => setList(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return [list, add];
};

const useDebounce = (v, d=280) => {
  const [dv, set] = useState(v);
  useEffect(() => { const t = setTimeout(() => set(v), d); return () => clearTimeout(t); }, [v, d]);
  return dv;
};

/* ─── Shared UI ──────────────────────────────────────────────────────────── */
const Toasts = ({ items }) => (
  <div className="tsts">
    {items.map(t => (
      <div key={t.id} className={`tst tst-${t.type==="success"?"ok":t.type==="error"?"err":"info"}`}>
        <Ic n={t.type==="success"?"check":t.type==="error"?"warn":"info"} s={13}
           c={t.type==="success"?"var(--green)":t.type==="error"?"var(--red)":"var(--gold)"}/>
        <span style={{ fontFamily:"var(--sans)", fontSize:".81rem", color:"var(--t1)" }}>{t.msg}</span>
      </div>
    ))}
  </div>
);

const PHdr = ({ title, sub, right }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:12 }}>
    <div>
      <h1 style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", fontWeight:700, color:"var(--t1)", letterSpacing:"-.01em" }}>{title}</h1>
      {sub && <div style={{ fontFamily:"var(--mono)", fontSize:".67rem", color:"var(--t3)", marginTop:4, letterSpacing:".06em" }}>{sub}</div>}
    </div>
    {right && <div style={{ display:"flex", gap:8, alignItems:"center" }}>{right}</div>}
  </div>
);

const SBar = ({ value, onChange, ph="Search…", w=210 }) => (
  <div style={{ position:"relative" }}>
    <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
      <Ic n="search" s={13} c="var(--t3)"/>
    </div>
    <input className="inp" value={value} onChange={e=>onChange(e.target.value)}
      placeholder={ph} style={{ paddingLeft:30, width:w, fontSize:".8rem" }}/>
  </div>
);

const SBadge = ({ status }) => {
  const map = { confirmed:"confirmed", pending:"pending", cancelled:"cancelled",
    checked_in:"checkedin", checked_out:"checkedout",
    available:"available", occupied:"occupied", maintenance:"maintenance",
    paid:"confirmed", unpaid:"pending", refunded:"checkedout" };
  const dotC = { confirmed:"g", available:"g", paid:"g", pending:"o", checked_in:"b", cancelled:"r", maintenance:"r", occupied:"o", refunded:"x", checked_out:"x", unpaid:"o" };
  const k = map[status] || "gold";
  const dc = dotC[status] || "x";
  return (
    <span className={`bdg bdg-${k}`}>
      <span className={`dot dot-${dc}`} style={{ width:5, height:5 }}/>
      {status?.replace(/_/g," ")}
    </span>
  );
};

const Avt = ({ name, size=30 }) => {
  const COLORS = ["#D4A843","#2DD4BF","#60A5FA","#A78BFA","#4ADE80","#F87171","#FBBF24"];
  const c = COLORS[(name?.charCodeAt(0)||0) % COLORS.length];
  const initials = name?.split(" ").map(n=>n[0]).slice(0,2).join("") || "?";
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${c}1E`, border:`1.5px solid ${c}40`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"var(--mono)", fontSize:`${size*.3}px`, fontWeight:600, color:c, flexShrink:0 }}>
      {initials}
    </div>
  );
};

const Dlg = ({ open, onClose, title, children, footer, mw=520 }) => {
  if (!open) return null;
  return (
    <div className="mbg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mbox" style={{ maxWidth:mw }}>
        <div className="mhd">
          <span style={{ fontFamily:"var(--serif)", fontSize:".96rem", fontWeight:700, color:"var(--t1)" }}>{title}</span>
          <button className="bi" onClick={onClose}><Ic n="x" s={13}/></button>
        </div>
        <div className="mbd">{children}</div>
        {footer && <div className="mft">{footer}</div>}
      </div>
    </div>
  );
};

const FF = ({ label, children, req }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontFamily:"var(--mono)", fontSize:".61rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--t3)", marginBottom:5 }}>
      {label}{req&&<span style={{ color:"var(--red)", marginLeft:3 }}>*</span>}
    </label>
    {children}
  </div>
);

const Hr = () => <div style={{ height:1, background:"var(--b1)", margin:"16px 0" }}/>;

const Empty = ({ icon, title, sub }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"52px 20px", gap:10, textAlign:"center" }}>
    <div style={{ width:44, height:44, borderRadius:10, background:"var(--raised)", border:"1px solid var(--b1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Ic n={icon} s={20} c="var(--t3)"/>
    </div>
    <div style={{ fontFamily:"var(--sans)", fontSize:".88rem", fontWeight:600, color:"var(--t2)" }}>{title}</div>
    {sub && <div style={{ fontFamily:"var(--mono)", fontSize:".68rem", color:"var(--t3)" }}>{sub}</div>}
  </div>
);

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
const NAV = [
  { id:"dashboard", label:"Dashboard",           icon:"grid",  group:"Operations" },
  { id:"bookings",  label:"Bookings",             icon:"book",  group:"Operations", badge:"48" },
  { id:"rooms",     label:"Rooms & Availability", icon:"room",  group:"Operations" },
  { id:"guests",    label:"Guests",               icon:"user",  group:"Operations" },
  { id:"revenue",   label:"Revenue & Analytics",  icon:"trend", group:"Analytics" },
  { id:"calendar",  label:"Occupancy Calendar",   icon:"cal",   group:"Analytics" },
  { id:"staff",     label:"Staff",                icon:"staff", group:"Management" },
  { id:"database",  label:"Database · Neon",      icon:"db",    group:"Management" },
  { id:"settings",  label:"Settings",             icon:"cog",   group:"Management" },
];

const Sidebar = ({ page, setPage }) => {
  const groups = ["Operations","Analytics","Management"];
  return (
    <aside style={{ width:"var(--sw)", flexShrink:0, background:"var(--surf)", borderRight:"1px solid var(--b1)", height:"100vh", position:"sticky", top:0, overflow:"auto", display:"flex", flexDirection:"column" }}>
      {/* Logo */}
      <div style={{ padding:"18px 14px 14px", borderBottom:"1px solid var(--b1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#D4A843,#ECC96A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ic n="bld" s={15} c="#000"/>
          </div>
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:".93rem", fontWeight:800, color:"var(--t1)", letterSpacing:".04em" }}>Veloura</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:".55rem", color:"var(--t3)", letterSpacing:".14em" }}>ADMIN · PORTAL</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, padding:"6px 10px" }}>
        {groups.map(g => (
          <div key={g}>
            <div className="ng">{g}</div>
            {NAV.filter(n=>n.group===g).map(n => (
              <button key={n.id} className={`nv${page===n.id?" on":""}`} onClick={()=>setPage(n.id)}>
                <Ic n={n.icon} s={13} c={page===n.id?"var(--gold)":"var(--t3)"}/>
                <span style={{ flex:1 }}>{n.label}</span>
                {n.badge && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", background:"var(--gold-dim)", color:"var(--gold)", padding:"1px 6px", borderRadius:10 }}>{n.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      {/* User */}
      <div style={{ padding:"10px", borderTop:"1px solid var(--b1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, background:"var(--raised)", border:"1px solid var(--b1)" }}>
          <Avt name="Marcus Fontaine" size={26}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--sans)", fontSize:".77rem", fontWeight:500, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Marcus F.</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--t3)" }}>Super Admin</div>
          </div>
          <button className="bi" style={{ width:24, height:24 }}><Ic n="logout" s={11} c="var(--t3)"/></button>
        </div>
      </div>
    </aside>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  DASHBOARD                                                                  */
/* ══════════════════════════════════════════════════════════════════════════ */
const Dashboard = ({ toast }) => {
  const KPIS = [
    { label:"Revenue (MTD)",   val:"$218,400", delta:"+12.4%", up:true,  icon:"dollar", c:"var(--gold)"   },
    { label:"Active Bookings", val:"34",        delta:"+5",     up:true,  icon:"book",   c:"var(--blue)"   },
    { label:"Rooms Occupied",  val:"23 / 31",   delta:"74.2%",  up:true,  icon:"room",   c:"var(--teal)"   },
    { label:"Guests In-House", val:"41",         delta:"+3",     up:true,  icon:"user",   c:"var(--purple)" },
    { label:"Avg Daily Rate",  val:"$564",       delta:"+$18",   up:true,  icon:"bar",    c:"var(--green)"  },
    { label:"RevPAR",          val:"$418",       delta:"-2.1%",  up:false, icon:"trend",  c:"var(--amber)"  },
  ];

  const TT = ({ active, payload, label }) => active && payload?.length
    ? <div style={{ background:"var(--card)", border:"1px solid var(--b2)", borderRadius:8, padding:"9px 13px" }}>
        <div style={{ fontFamily:"var(--mono)", fontSize:".67rem", color:"var(--t2)", marginBottom:5 }}>{label}</div>
        {payload.map(p=><div key={p.dataKey} style={{ fontFamily:"var(--mono)", fontSize:".72rem", color:p.color||"var(--gold)" }}>${(p.value/1000).toFixed(0)}k</div>)}
      </div>
    : null;

  return (
    <div className="pg">
      <PHdr title="Dashboard" sub={new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
        right={<><button className="bs"><Ic n="dl" s={13}/>Export</button><button className="bp" onClick={()=>toast("Dashboard refreshed","success")}><Ic n="refresh" s={13}/>Refresh</button></>}/>

      {/* KPIs */}
      <div className="stg" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:11, marginBottom:20 }}>
        {KPIS.map(k => (
          <div key={k.label} className="card card-h" style={{ padding:"17px 19px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:"var(--mono)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--t3)" }}>{k.label}</div>
                <div style={{ fontFamily:"var(--serif)", fontSize:"1.55rem", fontWeight:700, color:"var(--t1)", marginTop:9, lineHeight:1 }}>{k.val}</div>
              </div>
              <div style={{ width:36, height:36, borderRadius:9, background:`${k.c}18`, border:`1px solid ${k.c}28`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ic n={k.icon} s={16} c={k.c}/>
              </div>
            </div>
            <div style={{ marginTop:10 }}>
              <span style={{ fontFamily:"var(--mono)", fontSize:".68rem", padding:"2px 7px", borderRadius:5, background:k.up?"var(--green-dim)":"var(--red-dim)", color:k.up?"var(--green)":"var(--red)" }}>{k.up?"↑":"↓"} {k.delta}</span>
              <span style={{ fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--t3)", marginLeft:7 }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:14 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding:"19px 19px 10px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ fontFamily:"var(--serif)", fontSize:".97rem", fontWeight:700, color:"var(--t1)" }}>Revenue — 2026</span>
            <div style={{ display:"flex", gap:12 }}>
              {[["Revenue","var(--gold)"],["Bookings","var(--teal)"]].map(([l,c])=>(
                <span key={l} style={{ fontFamily:"var(--mono)", fontSize:".62rem", color:c, display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:8, height:2, background:c, display:"inline-block", borderRadius:1 }}/>{l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={REVENUE_DATA} margin={{ top:4, right:4, bottom:0, left:-22 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4A843" stopOpacity={.3}/><stop offset="95%" stopColor="#D4A843" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--b1)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontFamily:"var(--mono)", fontSize:9, fill:"var(--t3)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontFamily:"var(--mono)", fontSize:9, fill:"var(--t3)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="revenue" stroke="#D4A843" strokeWidth={2} fill="url(#gR)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sources Pie */}
        <div className="card" style={{ padding:"19px" }}>
          <div style={{ fontFamily:"var(--serif)", fontSize:".97rem", fontWeight:700, color:"var(--t1)", marginBottom:14 }}>Booking Sources</div>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            <PieChart width={140} height={140}>
              <Pie data={PIE_DATA} cx={65} cy={65} innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((e,i)=><Cell key={i} fill={e.color} opacity={.82}/>)}
              </Pie>
            </PieChart>
          </div>
          {PIE_DATA.map(s=>(
            <div key={s.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0", borderBottom:"1px solid var(--b1)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:7, height:7, borderRadius:2, background:s.color }}/>
                <span style={{ fontFamily:"var(--sans)", fontSize:".78rem", color:"var(--t2)" }}>{s.name}</span>
              </div>
              <span style={{ fontFamily:"var(--mono)", fontSize:".72rem", color:"var(--t1)", fontWeight:500 }}>{s.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings + arrivals */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {[["Recent Bookings", BOOKINGS_DATA.slice(0,6)],["Today's Arrivals", BOOKINGS_DATA.filter(b=>b.status==="confirmed").slice(0,5)]].map(([ttl, items]) => (
          <div key={ttl} className="card">
            <div style={{ padding:"14px 16px 11px", borderBottom:"1px solid var(--b1)", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"var(--serif)", fontSize:".92rem", fontWeight:700, color:"var(--t1)" }}>{ttl}</span>
              <span style={{ fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--t3)" }}>{items.length} records</span>
            </div>
            {items.map((b,i)=>(
              <div key={b.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom:i<items.length-1?"1px solid var(--b1)":"none", transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.013)"}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <Avt name={b.guest_name} size={27}/>
                  <div>
                    <div style={{ fontFamily:"var(--sans)", fontSize:".8rem", fontWeight:500, color:"var(--t1)" }}>{b.guest_name}</div>
                    <div style={{ fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--t3)" }}>{b.hotel_name} · {b.room_name}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--gold)", fontWeight:500, marginBottom:3 }}>${b.total_amount.toLocaleString()}</div>
                  <SBadge status={b.status}/>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  BOOKINGS                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
const BookingsPage = ({ toast }) => {
  const [bookings, setBookings] = useState(BOOKINGS_DATA);
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState("all");
  const [sort, setSort] = useState("date_desc");
  const [sel, setSel] = useState(null);
  const [newDlg, setNewDlg] = useState(false);
  const [pg, setPg] = useState(1);
  const PER = 12;
  const ds = useDebounce(search);

  const filtered = useMemo(() => bookings.filter(b => {
    const q = ds.toLowerCase();
    return (!q || b.guest_name.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q) || b.hotel_name?.toLowerCase().includes(q))
      && (sf==="all" || b.status===sf);
  }).sort((a,b) => {
    if (sort==="amount_d") return b.total_amount-a.total_amount;
    if (sort==="amount_a") return a.total_amount-b.total_amount;
    return new Date(b.created_at)-new Date(a.created_at);
  }), [bookings, ds, sf, sort]);

  const pages = Math.ceil(filtered.length/PER);
  const paged = filtered.slice((pg-1)*PER, pg*PER);

  const updateStatus = (id, status) => {
    setBookings(p=>p.map(b=>b.id===id?{...b,status}:b));
    toast(`Status updated to "${status}"`, "success"); setSel(null);
  };

  return (
    <div className="pg">
      <PHdr title="Bookings" sub={`${filtered.length} reservations · ${bookings.filter(b=>b.status==="confirmed").length} confirmed`}
        right={<><button className="bs"><Ic n="dl" s={13}/>Export CSV</button><button className="bp" onClick={()=>setNewDlg(true)}><Ic n="plus" s={13}/>New Booking</button></>}/>

      <div style={{ display:"flex", gap:9, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <SBar value={search} onChange={v=>{setSearch(v);setPg(1);}} ph="Search guest, ref, hotel…" w={230}/>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {["all","confirmed","pending","checked_in","checked_out","cancelled"].map(s=>(
            <button key={s} onClick={()=>{setSf(s);setPg(1);}} style={{ padding:"5px 11px", borderRadius:6, fontFamily:"var(--mono)", fontSize:".62rem", letterSpacing:".06em", textTransform:"uppercase", border:"1px solid", cursor:"pointer", transition:"all .17s",
              background:sf===s?"var(--gold)":"transparent",
              color:sf===s?"#000":"var(--t3)",
              borderColor:sf===s?"var(--gold)":"var(--b2)" }}>
              {s==="all"?`All (${bookings.length})`:s.replace(/_/g," ")}
            </button>
          ))}
        </div>
        <select className="inp" value={sort} onChange={e=>setSort(e.target.value)} style={{ width:"auto", fontSize:".78rem", padding:"7px 11px", marginLeft:"auto" }}>
          <option value="date_desc">Newest first</option>
          <option value="amount_d">Highest amount</option>
          <option value="amount_a">Lowest amount</option>
        </select>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table className="tbl">
            <thead><tr>
              <th>REF</th><th>GUEST</th><th>PROPERTY / ROOM</th>
              <th>CHECK-IN</th><th>CHECK-OUT</th><th>NIGHTS</th>
              <th>AMOUNT</th><th>SOURCE</th><th>STATUS</th><th>PAYMENT</th><th></th>
            </tr></thead>
            <tbody>
              {paged.map(b=>(
                <tr key={b.id} onClick={()=>setSel(b)}>
                  <td><span style={{ fontFamily:"var(--mono)", fontSize:".71rem", color:"var(--gold)", fontWeight:500 }}>#{b.ref}</span></td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Avt name={b.guest_name} size={25}/>
                      <div>
                        <div className="hi">{b.guest_name}</div>
                        <div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)" }}>{b.guest_email||"—"}</div>
                      </div>
                    </div>
                  </td>
                  <td><div className="hi" style={{ fontSize:".78rem" }}>{b.hotel_name}</div><div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)" }}>{b.room_name}</div></td>
                  <td style={{ fontFamily:"var(--mono)", fontSize:".73rem" }}>{b.check_in}</td>
                  <td style={{ fontFamily:"var(--mono)", fontSize:".73rem" }}>{b.check_out}</td>
                  <td style={{ fontFamily:"var(--mono)", fontSize:".73rem", color:"var(--t1)" }}>{b.nights}n</td>
                  <td style={{ fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--gold)", fontWeight:500 }}>${b.total_amount.toLocaleString()}</td>
                  <td><span className="bdg bdg-blue">{b.source}</span></td>
                  <td><SBadge status={b.status}/></td>
                  <td><SBadge status={b.payment_status}/></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="bi"><Ic n="edit" s={12}/></button>
                      <button className="bi"><Ic n="eye" s={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!paged.length && <tr><td colSpan={11}><Empty icon="book" title="No bookings found" sub="Adjust your filters"/></td></tr>}
            </tbody>
          </table>
        </div>
        {pages>1 && (
          <div style={{ padding:"11px 14px", borderTop:"1px solid var(--b1)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--t3)" }}>Page {pg} of {pages} · {filtered.length} results</span>
            <div style={{ display:"flex", gap:4 }}>
              <button className="bs" disabled={pg===1} onClick={()=>setPg(p=>p-1)} style={{ padding:"5px 10px", fontSize:".73rem" }}>← Prev</button>
              {Array.from({length:Math.min(5,pages)},(_,i)=>{
                const p=pg>3?pg-3+i+1:i+1; if(p>pages)return null;
                return <button key={p} onClick={()=>setPg(p)} style={{ padding:"5px 9px", fontSize:".73rem", fontFamily:"var(--mono)", borderRadius:6, border:"1px solid", cursor:"pointer", background:p===pg?"var(--gold)":"var(--raised)", color:p===pg?"#000":"var(--t3)", borderColor:p===pg?"var(--gold)":"var(--b2)" }}>{p}</button>;
              })}
              <button className="bs" disabled={pg===pages} onClick={()=>setPg(p=>p+1)} style={{ padding:"5px 10px", fontSize:".73rem" }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Dlg open={!!sel} onClose={()=>setSel(null)} title={`Booking #${sel?.ref}`} mw={560}
        footer={<><button className="bd" onClick={()=>{setBookings(p=>p.map(b=>b.id===sel.id?{...b,status:"cancelled",payment_status:"refunded"}:b));toast("Booking cancelled","info");setSel(null);}}>Cancel Booking</button><button className="bs" onClick={()=>setSel(null)}>Close</button><button className="bp" onClick={()=>updateStatus(sel?.id,"checked_in")}><Ic n="check" s={12}/>Check In</button></>}>
        {sel && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[["Guest",sel.guest_name],["Email",sel.guest_email],["Hotel",sel.hotel_name],["Room",sel.room_name],["Check-In",sel.check_in],["Check-Out",sel.check_out],["Nights",sel.nights],["Guests",sel.guests],["Rate",`$${sel.room_rate}/night`],["Total",`$${sel.total_amount.toLocaleString()}`],["Source",sel.source],["Payment",sel.payment_status]].map(([l,v])=>(
              <div key={l}>
                <div style={{ fontFamily:"var(--mono)", fontSize:".6rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--t3)", marginBottom:4 }}>{l}</div>
                <div style={{ fontFamily:"var(--sans)", fontSize:".84rem", color:"var(--t1)", fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Dlg>

      {/* New booking */}
      <Dlg open={newDlg} onClose={()=>setNewDlg(false)} title="New Booking" mw={540}
        footer={<><button className="bs" onClick={()=>setNewDlg(false)}>Cancel</button><button className="bp" onClick={()=>{toast("Booking created","success");setNewDlg(false);}}><Ic n="check" s={12}/>Create</button></>}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <FF label="Guest Name" req><input className="inp" placeholder="Full name"/></FF>
          <FF label="Email"><input className="inp" type="email" placeholder="email@example.com"/></FF>
          <FF label="Hotel" req><select className="inp">{HOTELS.map(h=><option key={h.id}>{h.name}</option>)}</select></FF>
          <FF label="Room" req><select className="inp">{ROOMS.map(r=><option key={r.id}>{r.name} – ${r.base_price}/n</option>)}</select></FF>
          <FF label="Check-In" req><input className="inp" type="date"/></FF>
          <FF label="Check-Out" req><input className="inp" type="date"/></FF>
          <FF label="Guests"><input className="inp" type="number" defaultValue={2} min={1}/></FF>
          <FF label="Source"><select className="inp"><option>Direct</option><option>Booking.com</option><option>Expedia</option><option>Phone</option></select></FF>
          <div style={{ gridColumn:"1/-1" }}><FF label="Notes"><textarea className="inp" placeholder="Special requests…"/></FF></div>
        </div>
      </Dlg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  ROOMS                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */
const RoomsPage = ({ toast }) => {
  const [rooms, setRooms] = useState(ROOMS);
  const [hf, setHf] = useState("all");
  const [sf, setSf] = useState("all");
  const [editR, setEditR] = useState(null);
  const [newR, setNewR] = useState(false);

  const filtered = rooms.filter(r => (hf==="all"||r.hotel_id===hf) && (sf==="all"||r.status===sf));
  const sc = s => ({available:"var(--green)",occupied:"var(--gold)",maintenance:"var(--red)",blocked:"var(--t3)"}[s]||"var(--t3)");

  return (
    <div className="pg">
      <PHdr title="Rooms & Availability"
        sub={`${rooms.filter(r=>r.status==="available").length} available · ${rooms.filter(r=>r.status==="occupied").length} occupied · ${rooms.filter(r=>r.status==="maintenance").length} maintenance`}
        right={<button className="bp" onClick={()=>setNewR(true)}><Ic n="plus" s={13}/>Add Room</button>}/>

      <div className="stg" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        {[["Available",rooms.filter(r=>r.status==="available").length,"var(--green)"],["Occupied",rooms.filter(r=>r.status==="occupied").length,"var(--gold)"],["Maintenance",rooms.filter(r=>r.status==="maintenance").length,"var(--red)"],["Total",rooms.length,"var(--blue)"]].map(([l,v,c])=>(
          <div key={l} className="card" style={{ padding:"13px 16px" }}>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.45rem", fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)", marginTop:4, textTransform:"uppercase", letterSpacing:".08em" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:9, marginBottom:16, flexWrap:"wrap" }}>
        <select className="inp" value={hf} onChange={e=>setHf(e.target.value)} style={{ width:"auto", fontSize:".78rem" }}>
          <option value="all">All Hotels</option>
          {HOTELS.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        {["all","available","occupied","maintenance","blocked"].map(s=>(
          <button key={s} onClick={()=>setSf(s)} style={{ padding:"5px 12px", borderRadius:6, fontFamily:"var(--mono)", fontSize:".62rem", textTransform:"uppercase", border:"1px solid", cursor:"pointer", transition:"all .17s",
            background:sf===s?sc(s)||"var(--raised)":"transparent",
            color:sf===s?"#000":"var(--t3)",
            borderColor:sf===s?sc(s)||"var(--b2)":"var(--b2)" }}>{s}</button>
        ))}
      </div>

      <div className="stg" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(268px,1fr))", gap:11 }}>
        {filtered.map(r=>{
          const hotel = HOTELS.find(h=>h.id===r.hotel_id);
          return (
            <div key={r.id} className="card card-h" style={{ padding:17, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, right:0, width:3, height:"100%", background:sc(r.status), opacity:.75 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:"var(--sans)", fontSize:".86rem", fontWeight:600, color:"var(--t1)", marginBottom:2 }}>{r.name}</div>
                  <div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)" }}>{hotel?.name} · Floor {r.floor}</div>
                </div>
                <SBadge status={r.status}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {[["Type",r.type],["Size",`${r.sqm}m²`],["Guests",`Max ${r.max_guests}`],["Rate",`$${r.base_price}/n`]].map(([l,v])=>(
                  <div key={l}>
                    <div style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--t3)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:2 }}>{l}</div>
                    <div style={{ fontFamily:"var(--sans)", fontSize:".78rem", color:"var(--t1)", fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <Hr/>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {r.status!=="available"&&<button className="bs" style={{ padding:"4px 9px", fontSize:".71rem" }} onClick={()=>{setRooms(p=>p.map(x=>x.id===r.id?{...x,status:"available"}:x));toast("Set to available","success");}}>Set Available</button>}
                {r.status!=="maintenance"&&<button className="bs" style={{ padding:"4px 9px", fontSize:".71rem" }} onClick={()=>{setRooms(p=>p.map(x=>x.id===r.id?{...x,status:"maintenance"}:x));toast("Set to maintenance","info");}}>Maintenance</button>}
                <button className="bi" onClick={()=>setEditR(r)} style={{ marginLeft:"auto" }}><Ic n="edit" s={12}/></button>
              </div>
            </div>
          );
        })}
      </div>

      <Dlg open={!!editR} onClose={()=>setEditR(null)} title={`Edit · ${editR?.name}`} mw={470}
        footer={<><button className="bs" onClick={()=>setEditR(null)}>Cancel</button><button className="bp" onClick={()=>{toast("Room updated","success");setEditR(null);}}>Save Changes</button></>}>
        {editR && <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <FF label="Room Name" req><input className="inp" defaultValue={editR.name}/></FF>
          <FF label="Type"><input className="inp" defaultValue={editR.type}/></FF>
          <FF label="Floor"><input className="inp" type="number" defaultValue={editR.floor}/></FF>
          <FF label="Size (m²)"><input className="inp" type="number" defaultValue={editR.sqm}/></FF>
          <FF label="Max Guests"><input className="inp" type="number" defaultValue={editR.max_guests}/></FF>
          <FF label="Base Price"><input className="inp" type="number" defaultValue={editR.base_price}/></FF>
          <div style={{ gridColumn:"1/-1" }}>
            <FF label="Status"><select className="inp" defaultValue={editR.status}><option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option><option value="blocked">Blocked</option></select></FF>
          </div>
        </div>}
      </Dlg>

      <Dlg open={newR} onClose={()=>setNewR(false)} title="Add New Room" mw={470}
        footer={<><button className="bs" onClick={()=>setNewR(false)}>Cancel</button><button className="bp" onClick={()=>{toast("Room added","success");setNewR(false);}}><Ic n="check" s={12}/>Add Room</button></>}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ gridColumn:"1/-1" }}><FF label="Hotel" req><select className="inp">{HOTELS.map(h=><option key={h.id}>{h.name}</option>)}</select></FF></div>
          <FF label="Room Name" req><input className="inp" placeholder="Deluxe King"/></FF>
          <FF label="Type"><input className="inp" placeholder="Suite, Deluxe…"/></FF>
          <FF label="Floor"><input className="inp" type="number" defaultValue={1}/></FF>
          <FF label="Size (m²)"><input className="inp" type="number"/></FF>
          <FF label="Max Guests"><input className="inp" type="number" defaultValue={2}/></FF>
          <FF label="Base Price/Night" req><input className="inp" type="number" placeholder="420"/></FF>
        </div>
      </Dlg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  GUESTS                                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */
const GuestsPage = ({ toast }) => {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [sel, setSel] = useState(null);
  const ds = useDebounce(search);

  const filtered = GUESTS.filter(g => {
    const q = ds.toLowerCase();
    return (!q||g.name.toLowerCase().includes(q)||g.email.toLowerCase().includes(q)||g.nationality.toLowerCase().includes(q))
      && (tier==="all"||g.loyalty_tier===tier);
  });

  const tc = t => ({platinum:"var(--teal)",gold:"var(--gold)",standard:"var(--t3)"}[t]);
  const tb = t => t==="platinum"?"bdg-teal":t==="gold"?"bdg-gold":"";

  return (
    <div className="pg">
      <PHdr title="Guests" sub={`${GUESTS.length} guests · ${GUESTS.filter(g=>g.loyalty_tier!=="standard").length} loyalty members`}
        right={<><button className="bs"><Ic n="dl" s={13}/>Export</button><button className="bp"><Ic n="plus" s={13}/>Add Guest</button></>}/>

      <div style={{ display:"flex", gap:9, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <SBar value={search} onChange={setSearch} ph="Name, email, country…" w={220}/>
        {["all","platinum","gold","standard"].map(t=>(
          <button key={t} onClick={()=>setTier(t)} style={{ padding:"5px 12px", borderRadius:6, fontFamily:"var(--mono)", fontSize:".62rem", textTransform:"uppercase", border:"1px solid", cursor:"pointer", transition:"all .17s",
            background:tier===t?tc(t)||"var(--raised)":"transparent",
            color:tier===t?"#000":"var(--t3)",
            borderColor:tier===t?tc(t)||"var(--b2)":"var(--b2)",
            fontWeight:tier===t?600:400 }}>{t}</button>
        ))}
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead><tr><th>GUEST</th><th>NATIONALITY</th><th>BOOKINGS</th><th>SPENT</th><th>TIER</th><th>POINTS</th><th>SINCE</th><th></th></tr></thead>
          <tbody>
            {filtered.map(g=>(
              <tr key={g.id} onClick={()=>setSel(g)}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <Avt name={g.name} size={28}/>
                    <div><div className="hi">{g.name}</div><div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)" }}>{g.email}</div></div>
                  </div>
                </td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".72rem" }}>{g.nationality}</td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--t1)", fontWeight:500 }}>{g.bookings}</td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--gold)", fontWeight:500 }}>${g.total_spent.toLocaleString()}</td>
                <td><span className={`bdg ${tb(g.loyalty_tier)}`} style={{ textTransform:"capitalize" }}>{g.loyalty_tier}</span></td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".73rem", color:tc(g.loyalty_tier) }}>{g.loyalty_pts.toLocaleString()}</td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".7rem", color:"var(--t3)" }}>{g.created_at}</td>
                <td onClick={e=>e.stopPropagation()}><div style={{ display:"flex", gap:4 }}><button className="bi"><Ic n="mail" s={12}/></button><button className="bi"><Ic n="edit" s={12}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dlg open={!!sel} onClose={()=>setSel(null)} title={sel?.name}
        footer={<><button className="bs" onClick={()=>setSel(null)}>Close</button><button className="bp" onClick={()=>{toast("Email sent","success");}}><Ic n="mail" s={12}/>Send Email</button></>}>
        {sel && <>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <Avt name={sel.name} size={50}/>
            <div>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", fontWeight:700, color:"var(--t1)" }}>{sel.name}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:".67rem", color:"var(--t3)", marginTop:3 }}>{sel.email}</div>
              <span className={`bdg ${tb(sel.loyalty_tier)}`} style={{ marginTop:6, display:"inline-flex", textTransform:"capitalize" }}>{sel.loyalty_tier}</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {[["Bookings",sel.bookings],["Total Spent",`$${sel.total_spent.toLocaleString()}`],[`${sel.loyalty_pts.toLocaleString()} pts`,"Loyalty"]].map(([v,l])=>(
              <div key={l} className="card" style={{ padding:"11px 13px", textAlign:"center" }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--gold)" }}>{v}</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--t3)", marginTop:3, textTransform:"uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
          <Hr/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Phone",sel.phone],["Nationality",sel.nationality],["Member Since",sel.created_at],["Guest ID",sel.id]].map(([l,v])=>(
              <div key={l}>
                <div style={{ fontFamily:"var(--mono)", fontSize:".59rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--t3)", marginBottom:4 }}>{l}</div>
                <div style={{ fontFamily:"var(--sans)", fontSize:".83rem", color:"var(--t1)", wordBreak:"break-all" }}>{v}</div>
              </div>
            ))}
          </div>
        </>}
      </Dlg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  REVENUE                                                                    */
/* ══════════════════════════════════════════════════════════════════════════ */
const RevenuePage = () => {
  const total = REVENUE_DATA.reduce((s,m)=>s+m.revenue,0);
  const avgOcc = Math.round(REVENUE_DATA.reduce((s,m)=>s+m.occ,0)/12);
  const avgADR = Math.round(REVENUE_DATA.reduce((s,m)=>s+m.adr,0)/12);

  const TT = ({ active, payload, label }) => active&&payload?.length
    ? <div style={{ background:"var(--card)", border:"1px solid var(--b2)", borderRadius:8, padding:"9px 13px" }}>
        <div style={{ fontFamily:"var(--mono)", fontSize:".65rem", color:"var(--t2)", marginBottom:5 }}>{label}</div>
        {payload.map(p=><div key={p.dataKey} style={{ fontFamily:"var(--mono)", fontSize:".7rem", color:p.fill||p.stroke||"var(--gold)", marginTop:2 }}>{p.name}: {p.dataKey==="revenue"?`$${(p.value/1000).toFixed(0)}k`:p.dataKey==="adr"?`$${p.value}`:`${p.value}%`}</div>)}
      </div>
    : null;

  return (
    <div className="pg">
      <PHdr title="Revenue & Analytics" sub="Full-year performance · All Properties"
        right={<><button className="bs"><Ic n="dl" s={13}/>PDF Report</button></>}/>

      <div className="stg" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:11, marginBottom:18 }}>
        {[["Total Revenue","$"+total.toLocaleString(),"+14.2%",true],["Avg Occupancy",avgOcc+"%","+4.1%",true],["Avg Daily Rate","$"+avgADR,"+$28",true],["RevPAR","$"+Math.round(avgADR*avgOcc/100),"+11.8%",true]].map(([l,v,d,u])=>(
          <div key={l} className="card" style={{ padding:"17px 19px" }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--t3)" }}>{l}</div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.55rem", fontWeight:700, color:"var(--t1)", marginTop:9 }}>{v}</div>
            <div style={{ marginTop:9 }}><span style={{ fontFamily:"var(--mono)", fontSize:".67rem", padding:"2px 6px", borderRadius:5, background:u?"var(--green-dim)":"var(--red-dim)", color:u?"var(--green)":"var(--red)" }}>{u?"↑":"↓"} {d}</span></div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div className="card" style={{ padding:"18px 18px 10px" }}>
          <div style={{ fontFamily:"var(--serif)", fontSize:".97rem", fontWeight:700, color:"var(--t1)", marginBottom:14 }}>Monthly Revenue vs ADR</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA} margin={{ top:4, right:4, bottom:0, left:-20 }} barGap={3}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--b1)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontFamily:"var(--mono)", fontSize:9, fill:"var(--t3)" }} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="l" tick={{ fontFamily:"var(--mono)", fontSize:9, fill:"var(--t3)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <YAxis yAxisId="r" orientation="right" tick={{ fontFamily:"var(--mono)", fontSize:9, fill:"var(--t3)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
              <Tooltip content={<TT/>}/>
              <Bar yAxisId="l" dataKey="revenue" name="Revenue" fill="#D4A843" opacity={.72} radius={[4,4,0,0]}/>
              <Bar yAxisId="r" dataKey="adr" name="ADR" fill="#2DD4BF" opacity={.6} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding:"18px 18px 10px" }}>
          <div style={{ fontFamily:"var(--serif)", fontSize:".97rem", fontWeight:700, color:"var(--t1)", marginBottom:14 }}>Occupancy Rate</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top:4, right:4, bottom:0, left:-22 }}>
              <defs><linearGradient id="gO" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60A5FA" stopOpacity={.28}/><stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--b1)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontFamily:"var(--mono)", fontSize:9, fill:"var(--t3)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontFamily:"var(--mono)", fontSize:9, fill:"var(--t3)" }} axisLine={false} tickLine={false} domain={[60,100]} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="occ" name="Occupancy" stroke="#60A5FA" strokeWidth={2} fill="url(#gO)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px 11px", borderBottom:"1px solid var(--b1)" }}>
          <span style={{ fontFamily:"var(--serif)", fontSize:".92rem", fontWeight:700, color:"var(--t1)" }}>Monthly Breakdown</span>
        </div>
        <table className="tbl">
          <thead><tr><th>MONTH</th><th>REVENUE</th><th>BOOKINGS</th><th>ADR</th><th>OCCUPANCY</th><th>REV%</th></tr></thead>
          <tbody>
            {REVENUE_DATA.map(m=>(
              <tr key={m.month}>
                <td style={{ fontFamily:"var(--mono)", fontSize:".73rem" }}>{m.month}</td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".74rem", color:"var(--gold)", fontWeight:500 }}>${(m.revenue/1000).toFixed(0)}k</td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".73rem" }}>{m.bookings}</td>
                <td style={{ fontFamily:"var(--mono)", fontSize:".73rem", color:"var(--teal)" }}>${m.adr}</td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div className="prog" style={{ width:60 }}><div className="prog-f" style={{ width:`${m.occ}%`, background:"var(--blue)" }}/></div>
                    <span style={{ fontFamily:"var(--mono)", fontSize:".68rem" }}>{m.occ}%</span>
                  </div>
                </td>
                <td>
                  <div className="prog" style={{ width:80 }}>
                    <div className="prog-f" style={{ width:`${(m.revenue/total*100).toFixed(0)}%`, background:"var(--gold)" }}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  OCCUPANCY CALENDAR                                                         */
/* ══════════════════════════════════════════════════════════════════════════ */
const CalendarPage = () => {
  const [month, setMonth] = useState(new Date().getMonth());
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS = Array.from({ length:31 }, (_,i) => i+1);

  const cellClass = (room, day) => {
    const n = (room.charCodeAt(0) + day * 3) % 10;
    return n < 4 ? "cc-bk" : n < 6 ? "cc-pt" : n === 9 ? "cc-mt" : "cc-av";
  };

  const legend = [["Available","cc-av","var(--green)"],["Booked","cc-bk","var(--gold)"],["Partial","cc-pt","var(--blue)"],["Maintenance","cc-mt","var(--red)"]];

  return (
    <div className="pg">
      <PHdr title="Occupancy Calendar" sub={`${MONTHS[month]} ${new Date().getFullYear()} · All Properties`}
        right={
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button className="bi" onClick={()=>setMonth(p=>Math.max(0,p-1))}><Ic n="chR" s={12} sw={2.5} c="var(--t2)" style={{ transform:"rotate(180deg)" }}/></button>
            <span style={{ fontFamily:"var(--mono)", fontSize:".76rem", color:"var(--t1)", minWidth:72, textAlign:"center" }}>{MONTHS[month]}</span>
            <button className="bi" onClick={()=>setMonth(p=>Math.min(11,p+1))}><Ic n="chR" s={12} sw={2.5} c="var(--t2)"/></button>
          </div>
        }/>

      <div style={{ display:"flex", gap:14, marginBottom:14 }}>
        {legend.map(([l,cls,c])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div className={`cc ${cls}`} style={{ width:12, height:12, borderRadius:3 }}/>
            <span style={{ fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--t3)" }}>{l}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:2, padding:12 }}>
          <thead>
            <tr>
              <th style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--t3)", padding:"5px 8px", textAlign:"left", minWidth:130, letterSpacing:".06em", textTransform:"uppercase" }}>Room</th>
              {DAYS.map(d=><th key={d} style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--t3)", padding:"4px 2px", textAlign:"center", width:26, minWidth:26 }}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROOMS.map(r=>{
              const hotel = HOTELS.find(h=>h.id===r.hotel_id);
              return (
                <tr key={r.id}>
                  <td style={{ padding:"3px 8px 3px 2px", whiteSpace:"nowrap" }}>
                    <div style={{ fontFamily:"var(--sans)", fontSize:".77rem", fontWeight:500, color:"var(--t1)" }}>{r.name}</div>
                    <div style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--t3)" }}>{hotel?.city}</div>
                  </td>
                  {DAYS.map(d=>(
                    <td key={d} style={{ padding:2 }}>
                      <div className={`cc ${cellClass(r.name, d)}`} style={{ width:22, height:26 }} title={`${r.name} Day ${d}`}/>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  STAFF                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */
const StaffPage = ({ toast }) => {
  const [staff, setStaff] = useState(STAFF_DATA);
  const [search, setSearch] = useState("");
  const [newDlg, setNewDlg] = useState(false);
  const ds = useDebounce(search);

  const filtered = staff.filter(s=>{
    const q = ds.toLowerCase();
    return !q||s.name.toLowerCase().includes(q)||s.dept.toLowerCase().includes(q)||s.hotel.toLowerCase().includes(q);
  });

  const dc = d => ({
    "Front Desk":"var(--blue)", "Housekeeping":"var(--teal)", "Concierge":"var(--gold)",
    "Restaurant":"var(--purple)", "Maintenance":"var(--red)", "Spa":"var(--green)"
  }[d]||"var(--t3)");

  return (
    <div className="pg">
      <PHdr title="Staff Management" sub={`${staff.filter(s=>s.active).length} active · ${staff.filter(s=>!s.active).length} inactive`}
        right={<button className="bp" onClick={()=>setNewDlg(true)}><Ic n="plus" s={13}/>Add Member</button>}/>

      <div style={{ marginBottom:16 }}>
        <SBar value={search} onChange={setSearch} ph="Name, department, hotel…" w={240}/>
      </div>

      <div className="stg" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:11 }}>
        {filtered.map(s=>(
          <div key={s.id} className="card" style={{ padding:17, opacity:s.active?1:.55, transition:"opacity .2s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:13 }}>
              <div style={{ display:"flex", gap:11, alignItems:"center" }}>
                <Avt name={s.name} size={36}/>
                <div>
                  <div style={{ fontFamily:"var(--sans)", fontSize:".86rem", fontWeight:600, color:"var(--t1)" }}>{s.name}</div>
                  <div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)", marginTop:2 }}>{s.position}</div>
                </div>
              </div>
              <label className="tgl">
                <input type="checkbox" checked={s.active} onChange={()=>{setStaff(p=>p.map(x=>x.id===s.id?{...x,active:!x.active}:x));toast("Staff updated","success");}}/>
                <div className="tgl-tr"><div className="tgl-th"/></div>
              </label>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["Dept",s.dept,dc(s.dept)],["Hotel",s.hotel,"var(--t2)"],["Shift",s.shift,"var(--t2)"],["Since",s.since,"var(--t3)"]].map(([l,v,c])=>(
                <div key={l}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:".57rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--t3)", marginBottom:2 }}>{l}</div>
                  <div style={{ fontFamily:"var(--sans)", fontSize:".77rem", fontWeight:500, color:c }}>{v}</div>
                </div>
              ))}
            </div>
            <Hr/>
            <div style={{ display:"flex", gap:5 }}>
              <button className="bs" style={{ flex:1, justifyContent:"center", fontSize:".71rem", padding:"5px" }}><Ic n="mail" s={11}/>Email</button>
              <button className="bi"><Ic n="edit" s={12}/></button>
              <button className="bi" onClick={()=>toast("Staff removed","info")}><Ic n="trash" s={12} c="var(--red)"/></button>
            </div>
          </div>
        ))}
      </div>

      <Dlg open={newDlg} onClose={()=>setNewDlg(false)} title="Add Staff Member" mw={470}
        footer={<><button className="bs" onClick={()=>setNewDlg(false)}>Cancel</button><button className="bp" onClick={()=>{toast("Staff member added","success");setNewDlg(false);}}>Add Member</button></>}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <FF label="Full Name" req><input className="inp" placeholder="Jane Smith"/></FF>
          <FF label="Email" req><input className="inp" type="email" placeholder="jane@Veloura.com"/></FF>
          <FF label="Hotel" req><select className="inp">{HOTELS.map(h=><option key={h.id}>{h.name}</option>)}</select></FF>
          <FF label="Department"><select className="inp"><option>Front Desk</option><option>Housekeeping</option><option>Concierge</option><option>Restaurant</option><option>Maintenance</option><option>Spa</option></select></FF>
          <FF label="Position"><input className="inp" placeholder="Senior Concierge"/></FF>
          <FF label="Shift"><select className="inp"><option>Day</option><option>Morning</option><option>Evening</option><option>Night</option></select></FF>
          <div style={{ gridColumn:"1/-1" }}><FF label="Role"><select className="inp"><option>staff</option><option>manager</option><option>admin</option></select></FF></div>
        </div>
      </Dlg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  DATABASE · NEON                                                            */
/* ══════════════════════════════════════════════════════════════════════════ */
const DatabasePage = ({ toast }) => {
  const [tab, setTab] = useState("schema");
  const [snip, setSnip] = useState("connect");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");

  const testConn = async () => {
    setTesting(true);
    await new Promise(r=>setTimeout(r,1400));
    setResult({ latency:38, tables:6, version:"PostgreSQL 16.1" });
    setTesting(false);
    toast("Neon connected · 38ms latency","success");
  };

  const copy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id); setTimeout(()=>setCopied(""),2000);
    toast("Copied to clipboard","info");
  };

  return (
    <div className="pg">
      <PHdr title="Database — Neon PostgreSQL" sub="Schema · API Queries · Connection · Setup Guide"/>

      {/* Connection banner */}
      <div className="card" style={{ padding:"17px 20px", marginBottom:16, borderColor:"rgba(45,212,191,.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <div style={{ width:40, height:40, borderRadius:9, background:"var(--teal-dim)", border:"1px solid rgba(45,212,191,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic n="db" s={18} c="var(--teal)"/>
            </div>
            <div>
              <div style={{ fontFamily:"var(--serif)", fontSize:".97rem", fontWeight:700, color:"var(--t1)" }}>Neon Serverless PostgreSQL</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                <span className="dot dot-g" style={{ animation:"pulse 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily:"var(--mono)", fontSize:".67rem", color:"var(--green)" }}>Connected · us-east-2</span>
                {result && <span style={{ fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--t3)" }}>· {result.latency}ms · {result.version}</span>}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="bs" onClick={()=>copy(NEON_URL,"url")}><Ic n={copied==="url"?"check":"copy"} s={12} c={copied==="url"?"var(--green)":undefined}/>{copied==="url"?"Copied!":"Copy URL"}</button>
            <button className="bp" onClick={testConn} disabled={testing}>
              {testing?<><span style={{ display:"inline-block", animation:"spin .8s linear infinite" }}>⟳</span> Testing…</>:<><Ic n="refresh" s={12}/>Test Connection</>}
            </button>
          </div>
        </div>

        <div style={{ marginTop:13, background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:7, padding:"9px 14px", fontFamily:"var(--mono)", fontSize:".7rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          <span style={{ color:"var(--teal)" }}>postgresql://</span>
          <span style={{ color:"var(--t2)" }}>user:••••••••@</span>
          <span style={{ color:"var(--gold)" }}>ep-xxxxx.us-east-2.aws.neon.tech</span>
          <span style={{ color:"var(--t2)" }}>/Veloura?sslmode=require</span>
        </div>

        {result && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginTop:12 }}>
            {[["6","Tables"],["~200","Rows (demo)"],["38ms","Latency"]].map(([v,l])=>(
              <div key={l} style={{ background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:7, padding:"10px 13px" }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", fontWeight:700, color:"var(--teal)" }}>{v}</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)", marginTop:3, textTransform:"uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--b1)", marginBottom:18 }}>
        {[["schema","Schema SQL"],["queries","API Queries"],["setup","Setup Guide"]].map(([id,l])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>

      {tab==="schema" && (
        <>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
            <button className="bs" style={{ fontSize:".75rem" }} onClick={()=>copy(SCHEMA.replace(/<[^>]+>/g,""),"schema")}>
              <Ic n={copied==="schema"?"check":"copy"} s={12} c={copied==="schema"?"var(--green)":undefined}/>{copied==="schema"?"Copied!":"Copy SQL"}
            </button>
          </div>
          <div className="sql" dangerouslySetInnerHTML={{ __html:SCHEMA }}/>
        </>
      )}

      {tab==="queries" && (
        <>
          <div style={{ display:"flex", gap:7, marginBottom:14 }}>
            {Object.keys(SNIPPETS).map(k=>(
              <button key={k} onClick={()=>setSnip(k)} style={{ padding:"5px 12px", borderRadius:6, fontFamily:"var(--mono)", fontSize:".62rem", textTransform:"uppercase", border:"1px solid", cursor:"pointer", transition:"all .17s",
                background:snip===k?"var(--gold)":"transparent", color:snip===k?"#000":"var(--t3)", borderColor:snip===k?"var(--gold)":"var(--b2)" }}>{k}</button>
            ))}
            <button className="bs" style={{ fontSize:".74rem", marginLeft:"auto" }} onClick={()=>copy(SNIPPETS[snip].replace(/<[^>]+>/g,""),"snip")}>
              <Ic n={copied==="snip"?"check":"copy"} s={12} c={copied==="snip"?"var(--green)":undefined}/>{copied==="snip"?"Copied!":"Copy"}
            </button>
          </div>
          <div className="sql" dangerouslySetInnerHTML={{ __html:SNIPPETS[snip] }}/>
        </>
      )}

      {tab==="setup" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { n:"01", t:"Install Neon driver", c:"npm install @neondatabase/serverless" },
            { n:"02", t:"Set env variable", c:'DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/Veloura?sslmode=require"' },
            { n:"03", t:"Initialize client (lib/db.ts)", c:"import { neon } from '@neondatabase/serverless';\nexport const sql = neon(process.env.DATABASE_URL!);" },
            { n:"04", t:"Run schema in Neon SQL Editor", c:"Copy the Schema SQL tab → open Neon dashboard → SQL Editor → paste → Run" },
            { n:"05", t:"Create API route (Next.js app router)", c:"// app/api/bookings/route.ts\nimport sql from '@/lib/db';\nexport async function GET() {\n  const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;\n  return Response.json(rows);\n}" },
            { n:"06", t:"Fetch from frontend", c:"const res = await fetch('/api/bookings');\nconst bookings = await res.json();" },
          ].map(({ n, t, c }) => (
            <div key={n} className="card" style={{ padding:"15px 17px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ display:"flex", gap:11, alignItems:"center" }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:"var(--gold-dim)", border:"1px solid rgba(212,168,67,.22)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--gold)", fontWeight:600 }}>{n}</div>
                  <span style={{ fontFamily:"var(--sans)", fontSize:".86rem", fontWeight:600, color:"var(--t1)" }}>{t}</span>
                </div>
                <button className="bi" onClick={()=>copy(c,n)}>
                  <Ic n={copied===n?"check":"copy"} s={11} c={copied===n?"var(--green)":undefined}/>
                </button>
              </div>
              <pre style={{ fontFamily:"var(--mono)", fontSize:".71rem", color:"var(--t2)", background:"var(--surf)", padding:"10px 13px", borderRadius:6, border:"1px solid var(--b1)", overflowX:"auto", lineHeight:1.75, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>{c}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  SETTINGS                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
const SettingsPage = ({ toast }) => {
  const [sec, setSec] = useState("general");
  const SECS = [["general","General","cog"],["database","Database · Neon","db"],["payments","Payments · Stripe","dollar"],["email","Email · Resend","mail"],["security","Security","lock"]];

  const save = () => toast("Settings saved","success");

  const Toggle = ({ on=true }) => (
    <label className="tgl"><input type="checkbox" defaultChecked={on}/><div className="tgl-tr"><div className="tgl-th"/></div></label>
  );

  return (
    <div className="pg">
      <PHdr title="Settings" sub="Configuration · Neon · Stripe · Resend"/>
      <div style={{ display:"grid", gridTemplateColumns:"190px 1fr", gap:14 }}>
        <div className="card" style={{ padding:8, alignSelf:"start" }}>
          {SECS.map(([id,l,ic])=>(
            <button key={id} className={`nv${sec===id?" on":""}`} onClick={()=>setSec(id)}>
              <Ic n={ic} s={13} c={sec===id?"var(--gold)":"var(--t3)"}/>{l}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding:"21px 23px" }}>
          {sec==="general" && <>
            <div style={{ fontFamily:"var(--serif)", fontSize:".96rem", fontWeight:700, color:"var(--t1)", marginBottom:18 }}>General Settings</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
              <FF label="Property Name"><input className="inp" defaultValue="The Meridian Grand"/></FF>
              <FF label="Default Currency"><select className="inp"><option>USD</option><option>EUR</option><option>GBP</option></select></FF>
              <FF label="Timezone"><select className="inp"><option>UTC+1 Europe/Paris</option><option>UTC America/New_York</option><option>UTC+9 Asia/Tokyo</option></select></FF>
              <FF label="Date Format"><select className="inp"><option>YYYY-MM-DD</option><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option></select></FF>
              <FF label="Check-In Time"><input className="inp" defaultValue="15:00"/></FF>
              <FF label="Check-Out Time"><input className="inp" defaultValue="11:00"/></FF>
              <div style={{ gridColumn:"1/-1" }}><FF label="Cancellation Policy"><textarea className="inp" defaultValue="Free cancellation up to 48 hours before check-in. After that, 1 night applies."/></FF></div>
            </div>
            {[["Guest Reviews","Allow guests to leave reviews after checkout",true],["Auto-Confirm","Auto-confirm bookings from verified guests",false],["Loyalty Program","Points system for returning guests",true]].map(([l,d,on])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderTop:"1px solid var(--b1)" }}>
                <div><div style={{ fontFamily:"var(--sans)", fontSize:".84rem", fontWeight:500, color:"var(--t1)" }}>{l}</div><div style={{ fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--t3)", marginTop:2 }}>{d}</div></div>
                <Toggle on={on}/>
              </div>
            ))}
          </>}

          {sec==="database" && <>
            <div style={{ fontFamily:"var(--serif)", fontSize:".96rem", fontWeight:700, color:"var(--t1)", marginBottom:18 }}>Neon Database</div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <FF label="Database URL" req><input className="inp" type="password" defaultValue={NEON_URL}/></FF>
              <FF label="Pool Size"><input className="inp" type="number" defaultValue={10}/></FF>
              <FF label="Query Timeout (ms)"><input className="inp" type="number" defaultValue={5000}/></FF>
              <div style={{ padding:"11px 14px", background:"var(--teal-dim)", border:"1px solid rgba(45,212,191,.18)", borderRadius:7, fontFamily:"var(--mono)", fontSize:".7rem", color:"var(--teal)" }}>
                Neon uses HTTP-based serverless PostgreSQL — works in Edge, Lambda, and Node.js environments with zero cold starts.
              </div>
              <pre style={{ fontFamily:"var(--mono)", fontSize:".73rem", color:"var(--gold)", background:"var(--surf)", padding:"10px 14px", borderRadius:6, border:"1px solid var(--b1)" }}>npm install @neondatabase/serverless</pre>
            </div>
          </>}

          {sec==="payments" && <>
            <div style={{ fontFamily:"var(--serif)", fontSize:".96rem", fontWeight:700, color:"var(--t1)", marginBottom:18 }}>Stripe Configuration</div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <FF label="Publishable Key"><input className="inp" defaultValue="pk_live_•••••••••••••••••••••••••••••"/></FF>
              <FF label="Secret Key"><input className="inp" type="password" defaultValue="sk_live_•••••••••••••••••••••••••••••"/></FF>
              <FF label="Webhook Secret"><input className="inp" type="password" defaultValue="whsec_••••••••••••••••••••••••••••••"/></FF>
              <FF label="Webhook URL">
                <div style={{ display:"flex", gap:8 }}>
                  <input className="inp" readOnly value="https://yourapp.com/api/webhooks/stripe"/>
                  <button className="bi"><Ic n="copy" s={12}/></button>
                </div>
              </FF>
              <FF label="Currencies"><input className="inp" defaultValue="USD, EUR, GBP, JPY"/></FF>
              <FF label="Capture Mode"><select className="inp"><option>Automatic</option><option>Manual</option></select></FF>
            </div>
          </>}

          {sec==="email" && <>
            <div style={{ fontFamily:"var(--serif)", fontSize:".96rem", fontWeight:700, color:"var(--t1)", marginBottom:18 }}>Email — Resend</div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <FF label="Resend API Key"><input className="inp" type="password" defaultValue="re_••••••••••••••••••••••••••••••"/></FF>
              <FF label="From Address"><input className="inp" defaultValue="reservations@Veloura.com"/></FF>
              <FF label="Reply-To"><input className="inp" defaultValue="concierge@Veloura.com"/></FF>
              <pre style={{ fontFamily:"var(--mono)", fontSize:".73rem", color:"var(--gold)", background:"var(--surf)", padding:"10px 14px", borderRadius:6, border:"1px solid var(--b1)" }}>npm install resend</pre>
            </div>
            <Hr/>
            <div style={{ fontFamily:"var(--sans)", fontSize:".84rem", fontWeight:600, color:"var(--t1)", marginBottom:10 }}>Automated Emails</div>
            {[["Booking Confirmation","Sent immediately on confirmed payment",true],["Pre-Arrival Reminder","3 days before check-in",true],["Check-In Instructions","Day of arrival at 8am",true],["Post-Stay Review Request","24h after check-out",true],["Cancellation Notice","On booking cancellation",true]].map(([l,d,on])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--b1)" }}>
                <div><div style={{ fontFamily:"var(--sans)", fontSize:".82rem", fontWeight:500, color:"var(--t1)" }}>{l}</div><div style={{ fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--t3)", marginTop:2 }}>{d}</div></div>
                <Toggle on={on}/>
              </div>
            ))}
          </>}

          {sec==="security" && <>
            <div style={{ fontFamily:"var(--serif)", fontSize:".96rem", fontWeight:700, color:"var(--t1)", marginBottom:18 }}>Security Settings</div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <FF label="JWT Secret"><input className="inp" type="password" defaultValue="••••••••••••••••••••••••••••••••"/></FF>
              <FF label="Session Duration (hours)"><input className="inp" type="number" defaultValue={24}/></FF>
              <FF label="Allowed Origins (CORS)"><textarea className="inp" defaultValue={"https://Veloura.com\nhttps://admin.Veloura.com"} style={{ minHeight:60 }}/></FF>
            </div>
            <Hr/>
            {[["Two-Factor Auth","Require 2FA for all admin accounts",true],["Rate Limiting","Limit API to 100 requests/min per IP",true],["Audit Logging","Log all admin actions to database",true]].map(([l,d,on])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderTop:"1px solid var(--b1)" }}>
                <div><div style={{ fontFamily:"var(--sans)", fontSize:".84rem", fontWeight:500, color:"var(--t1)" }}>{l}</div><div style={{ fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--t3)", marginTop:2 }}>{d}</div></div>
                <Toggle on={on}/>
              </div>
            ))}
          </>}

          <div style={{ marginTop:22, display:"flex", justifyContent:"flex-end" }}>
            <button className="bp" onClick={save}><Ic n="check" s={12} c="#000"/>Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  APP ROOT                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
export default function HotelAdmin() {
  const [page, setPage] = useState("dashboard");
  const [toasts, addToast] = useToast();
  const [notifs, setNotifs] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const NOTIF_LIST = [
    { id:1, msg:"New booking #A9F3D · The Meridian Grand",     time:"2m ago",  dot:"dot-g" },
    { id:2, msg:"Room 301 maintenance request raised",          time:"18m ago", dot:"dot-o" },
    { id:3, msg:"Payment failed · booking #BF2A190",            time:"1h ago",  dot:"dot-r" },
    { id:4, msg:"Alexandra Chen checked in · Suite 502",        time:"2h ago",  dot:"dot-b" },
    { id:5, msg:"Monthly revenue report ready to download",     time:"4h ago",  dot:"dot-g" },
  ];

  const renderPage = () => {
    const props = { toast: addToast };
    const pages = { dashboard:<Dashboard {...props}/>, bookings:<BookingsPage {...props}/>, rooms:<RoomsPage {...props}/>, guests:<GuestsPage {...props}/>, revenue:<RevenuePage {...props}/>, calendar:<CalendarPage {...props}/>, staff:<StaffPage {...props}/>, database:<DatabasePage {...props}/>, settings:<SettingsPage {...props}/> };
    return pages[page] || <Dashboard {...props}/>;
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Toasts items={toasts}/>
      <Sidebar page={page} setPage={setPage}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ height:50, background:"var(--surf)", borderBottom:"1px solid var(--b1)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Ic n={NAV.find(n=>n.id===page)?.icon||"grid"} s={13} c="var(--t3)"/>
            <span style={{ fontFamily:"var(--mono)", fontSize:".7rem", color:"var(--t3)", letterSpacing:".06em" }}>
              {NAV.find(n=>n.id===page)?.label}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ position:"relative" }}>
              <button className="bi" onClick={()=>setNotifOpen(!notifOpen)}>
                <Ic n="bell" s={13}/>
                {notifs && <div style={{ position:"absolute", top:4, right:4, width:6, height:6, borderRadius:"50%", background:"var(--red)", border:"1.5px solid var(--surf)" }}/>}
              </button>
              {notifOpen && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"var(--card)", border:"1px solid var(--b2)", borderRadius:12, width:300, boxShadow:"0 18px 48px rgba(0,0,0,.5)", zIndex:300, animation:"scaleIn .22s var(--ease)" }}>
                  <div style={{ padding:"11px 15px 9px", borderBottom:"1px solid var(--b1)", display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"var(--serif)", fontSize:".86rem", fontWeight:700, color:"var(--t1)" }}>Notifications</span>
                    <button style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)", background:"none", border:"none", cursor:"pointer" }} onClick={()=>{setNotifs(false);setNotifOpen(false);}}>Mark all read</button>
                  </div>
                  {NOTIF_LIST.map((n,i)=>(
                    <div key={n.id} style={{ display:"flex", gap:9, padding:"10px 15px", borderBottom:i<4?"1px solid var(--b1)":"none", cursor:"pointer", transition:"background .12s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--raised)"}
                      onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <span className={`dot ${n.dot}`} style={{ marginTop:5 }}/>
                      <div>
                        <div style={{ fontFamily:"var(--sans)", fontSize:".79rem", color:"var(--t2)", lineHeight:1.45 }}>{n.msg}</div>
                        <div style={{ fontFamily:"var(--mono)", fontSize:".61rem", color:"var(--t3)", marginTop:3 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ width:1, height:18, background:"var(--b1)" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span className="dot dot-g" style={{ animation:"pulse 2.5s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"var(--mono)", fontSize:".66rem", color:"var(--t3)" }}>Neon · Connected</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex:1, overflowY:"auto", padding:"22px 24px" }} key={page}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// ── Icon Library ──────────────────────────────────────────────────────────────
const Ic = ({ n, s = 15, c = "currentColor", sw = 1.7 }) => {
  const p = { width:s, height:s, viewBox:"0 0 24 24", fill:"none", stroke:c, strokeWidth:sw, strokeLinecap:"round", strokeLinejoin:"round" };
  const map = {
    grid:     <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    bookings: <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    rooms:    <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    guests:   <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    revenue:  <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    calendar: <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    staff:    <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    settings: <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    db:       <svg {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    bell:     <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    search:   <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    plus:     <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    close:    <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit:     <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:    <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    eye:      <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    check:    <svg {...p} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>,
    warn:     <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    info:     <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    logout:   <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    dollar:   <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    download: <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    refresh:  <svg {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    chevR:    <svg {...p} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>,
    copy:     <svg {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    lock:     <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    chart:    <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    mail:     <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    building: <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>,
    neon:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill={c} opacity=".3"/></svg>,
  };
  return map[n] || <svg {...p}/>;
};

// ── Mock Data ─────────────────────────────────────────────────────────────────
const mkId = () => Math.random().toString(36).slice(2,10).toUpperCase();
const rndDate = (off, span) => { const d=new Date(); d.setDate(d.getDate()+off+Math.floor(Math.random()*span)); return d.toISOString().split("T")[0]; };

const MOCK_HOTELS = [
  { id:"h1", name:"The Meridian Grand", city:"Paris", country:"France", stars:5, active:true },
  { id:"h2", name:"Azure Santorini", city:"Oia", country:"Greece", stars:5, active:true },
  { id:"h3", name:"Manhattan Noir", city:"New York", country:"USA", stars:5, active:true },
];
const MOCK_ROOMS = [
  { id:"r1", hotel_id:"h1", name:"Deluxe King", type:"Deluxe", floor:3, sqm:35, max_guests:2, base_price:420, status:"occupied" },
  { id:"r2", hotel_id:"h1", name:"Superior Suite", type:"Suite", floor:5, sqm:58, max_guests:2, base_price:680, status:"available" },
  { id:"r3", hotel_id:"h1", name:"Grand Penthouse", type:"Penthouse", floor:12, sqm:120, max_guests:4, base_price:1240, status:"available" },
  { id:"r4", hotel_id:"h2", name:"Cave Suite", type:"Suite", floor:1, sqm:42, max_guests:2, base_price:380, status:"occupied" },
  { id:"r5", hotel_id:"h2", name:"Infinity Villa", type:"Villa", floor:1, sqm:90, max_guests:2, base_price:760, status:"available" },
  { id:"r6", hotel_id:"h3", name:"City King", type:"Deluxe", floor:22, sqm:32, max_guests:2, base_price:520, status:"maintenance" },
  { id:"r7", hotel_id:"h3", name:"Skyline Suite", type:"Suite", floor:38, sqm:65, max_guests:2, base_price:890, status:"available" },
  { id:"r8", hotel_id:"h1", name:"Classic Twin", type:"Classic", floor:2, sqm:28, max_guests:2, base_price:280, status:"available" },
];
const MOCK_GUESTS = [
  { id:"g1", name:"Alexandra Chen", email:"alex.chen@email.com", phone:"+1 212 555 0180", nationality:"USA", loyalty_tier:"gold", loyalty_pts:4820, bookings:7, total_spent:8640, created_at:"2023-04-12" },
  { id:"g2", name:"James Whitfield", email:"j.whitfield@email.com", phone:"+44 20 7946 0958", nationality:"UK", loyalty_tier:"platinum", loyalty_pts:12400, bookings:14, total_spent:22300, created_at:"2022-11-03" },
  { id:"g3", name:"Sophie Marceau", email:"s.marceau@email.com", phone:"+33 1 42 00 00 00", nationality:"France", loyalty_tier:"standard", loyalty_pts:980, bookings:2, total_spent:1560, created_at:"2024-02-19" },
  { id:"g4", name:"Priya Kapoor", email:"priya.k@email.com", phone:"+91 98765 43210", nationality:"India", loyalty_tier:"gold", loyalty_pts:3200, bookings:5, total_spent:6100, created_at:"2023-09-07" },
  { id:"g5", name:"Carlos Rivera", email:"c.rivera@email.com", phone:"+1 305 555 0120", nationality:"USA", loyalty_tier:"standard", loyalty_pts:640, bookings:2, total_spent:1020, created_at:"2024-05-30" },
  { id:"g6", name:"Yuki Tanaka", email:"yuki.t@email.com", phone:"+81 3 0000 0000", nationality:"Japan", loyalty_tier:"platinum", loyalty_pts:9800, bookings:11, total_spent:18400, created_at:"2022-06-14" },
  { id:"g7", name:"Emma Nielsen", email:"emma.n@email.com", phone:"+45 20 20 20 20", nationality:"Denmark", loyalty_tier:"gold", loyalty_pts:2860, bookings:4, total_spent:4900, created_at:"2023-12-01" },
  { id:"g8", name:"Andrei Popescu", email:"a.popescu@email.com", phone:"+40 721 000 000", nationality:"Romania", loyalty_tier:"standard", loyalty_pts:320, bookings:1, total_spent:840, created_at:"2024-07-22" },
];
const MOCK_STAFF = [
  { id:"s1", name:"Marcus Fontaine", email:"m.fontaine@Veloura.com", role:"manager", department:"Front Desk", position:"General Manager", shift:"Day", hotel:"The Meridian Grand", active:true, since:"2020-03-01" },
  { id:"s2", name:"Isabelle Roux", email:"i.roux@Veloura.com", role:"staff", department:"Housekeeping", position:"Head Housekeeper", shift:"Morning", hotel:"The Meridian Grand", active:true, since:"2021-07-15" },
  { id:"s3", name:"David Kim", email:"d.kim@Veloura.com", role:"staff", department:"Concierge", position:"Senior Concierge", shift:"Day", hotel:"Manhattan Noir", active:true, since:"2022-01-10" },
  { id:"s4", name:"Lucia Ferreira", email:"l.ferreira@Veloura.com", role:"staff", department:"Restaurant", position:"Maitre d", shift:"Evening", hotel:"Azure Santorini", active:true, since:"2021-11-20" },
  { id:"s5", name:"Thomas Berg", email:"t.berg@Veloura.com", role:"staff", department:"Maintenance", position:"Facilities Manager", shift:"Day", hotel:"The Meridian Grand", active:false, since:"2019-05-12" },
  { id:"s6", name:"Aisha Rahman", email:"a.rahman@Veloura.com", role:"staff", department:"Spa", position:"Spa Manager", shift:"Morning", hotel:"Azure Santorini", active:true, since:"2023-02-28" },
];
const MONTHLY_REVENUE = [
  {month:"Jan",revenue:142000,bookings:38,adr:524,occupancy:71},
  {month:"Feb",revenue:168000,bookings:44,adr:546,occupancy:75},
  {month:"Mar",revenue:192000,bookings:52,adr:558,occupancy:80},
  {month:"Apr",revenue:224000,bookings:61,adr:572,occupancy:84},
  {month:"May",revenue:248000,bookings:68,adr:580,occupancy:88},
  {month:"Jun",revenue:286000,bookings:76,adr:596,occupancy:92},
  {month:"Jul",revenue:312000,bookings:82,adr:608,occupancy:95},
  {month:"Aug",revenue:298000,bookings:79,adr:600,occupancy:93},
  {month:"Sep",revenue:264000,bookings:71,adr:584,occupancy:88},
  {month:"Oct",revenue:238000,bookings:64,adr:570,occupancy:83},
  {month:"Nov",revenue:196000,bookings:53,adr:552,occupancy:77},
  {month:"Dec",revenue:218000,bookings:59,adr:564,occupancy:82},
];
const SOURCE_DATA = [
  {name:"Direct",value:38,color:"#D4A843"},{name:"Booking.com",value:28,color:"#60A5FA"},
  {name:"Expedia",value:16,color:"#2DD4BF"},{name:"Airbnb",value:11,color:"#A78BFA"},{name:"Phone",value:7,color:"#4ADE80"},
];
const STATUSES = ["confirmed","pending","checked_in","checked_out","cancelled"];
const SOURCES = ["direct","booking.com","expedia","airbnb","phone"];
const mkBooking = (i) => {
  const g=MOCK_GUESTS[i%MOCK_GUESTS.length], r=MOCK_ROOMS[i%MOCK_ROOMS.length];
  const h=MOCK_HOTELS.find(h=>h.id===r.hotel_id), nights=1+Math.floor(Math.random()*6);
  return { id:`b${i+1}`, ref:mkId(), guest_name:g.name, guest_email:g.email,
    room_name:r.name, hotel_name:h?.name, room_type:r.type, hotel_id:h?.id,
    check_in:rndDate(-10,30), check_out:rndDate(2,10), nights, guests:1+Math.floor(Math.random()*3),
    room_rate:r.base_price, total_amount:r.base_price*nights,
    status:STATUSES[i%STATUSES.length], payment_status:STATUSES[i%STATUSES.length]==="cancelled"?"refunded":"paid",
    source:SOURCES[i%SOURCES.length], created_at:rndDate(-30,30) };
};
const MOCK_BOOKINGS = Array.from({length:48},(_,i)=>mkBooking(i));

// ── Neon SQL Schema ───────────────────────────────────────────────────────────
const SCHEMA_SQL = `<span class="cm">-- Veloura Hotel · Neon PostgreSQL Schema</span>
<span class="kw">CREATE EXTENSION IF NOT EXISTS</span> <span class="fn">pgcrypto</span>;

<span class="kw">CREATE TABLE</span> <span class="tp">users</span> (
  id            <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  email         <span class="tp">TEXT</span> <span class="kw">UNIQUE NOT NULL</span>,
  name          <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>,
  password_hash <span class="tp">TEXT</span>,
  role          <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'guest'</span> <span class="kw">CHECK</span>(role <span class="kw">IN</span>(<span class="st">'guest','staff','manager','admin'</span>)),
  phone         <span class="tp">TEXT</span>,
  loyalty_tier  <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'standard'</span>,
  loyalty_pts   <span class="tp">INTEGER</span> <span class="kw">DEFAULT</span> 0,
  created_at    <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">hotels</span> (
  id          <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  name        <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>,
  city        <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>,
  country     <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>,
  stars       <span class="tp">INTEGER</span>,
  amenities   <span class="tp">JSONB</span> <span class="kw">DEFAULT</span> <span class="st">'[]'</span>,
  lat         <span class="tp">NUMERIC(9,6)</span>,
  lng         <span class="tp">NUMERIC(9,6)</span>,
  active      <span class="tp">BOOLEAN</span> <span class="kw">DEFAULT TRUE</span>,
  created_at  <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">rooms</span> (
  id         <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  hotel_id   <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">hotels</span>(id) <span class="kw">ON DELETE CASCADE</span>,
  name       <span class="tp">TEXT</span> <span class="kw">NOT NULL</span>,
  type       <span class="tp">TEXT</span>,
  floor      <span class="tp">INTEGER</span>,
  sqm        <span class="tp">INTEGER</span>,
  max_guests <span class="tp">INTEGER</span> <span class="kw">DEFAULT</span> 2,
  base_price <span class="tp">NUMERIC(10,2)</span> <span class="kw">NOT NULL</span>,
  status     <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'available'</span>
             <span class="kw">CHECK</span>(status <span class="kw">IN</span>(<span class="st">'available','occupied','maintenance','blocked'</span>)),
  created_at <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">bookings</span> (
  id             <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  ref            <span class="tp">TEXT</span> <span class="kw">UNIQUE DEFAULT</span> <span class="fn">upper</span>(<span class="fn">left</span>(<span class="fn">gen_random_uuid</span>()::<span class="tp">text</span>,8)),
  user_id        <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">users</span>(id),
  room_id        <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">rooms</span>(id),
  check_in       <span class="tp">DATE</span> <span class="kw">NOT NULL</span>,
  check_out      <span class="tp">DATE</span> <span class="kw">NOT NULL</span>,
  nights         <span class="tp">INTEGER</span> <span class="kw">GENERATED ALWAYS AS</span> (check_out - check_in) <span class="kw">STORED</span>,
  guests         <span class="tp">INTEGER</span> <span class="kw">DEFAULT</span> 1,
  room_rate      <span class="tp">NUMERIC(10,2)</span>,
  total_amount   <span class="tp">NUMERIC(10,2)</span>,
  status         <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'pending'</span>
                 <span class="kw">CHECK</span>(status <span class="kw">IN</span>(<span class="st">'pending','confirmed','checked_in','checked_out','cancelled'</span>)),
  payment_status <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'unpaid'</span>,
  stripe_pi_id   <span class="tp">TEXT</span>,
  notes          <span class="tp">TEXT</span>,
  source         <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'direct'</span>,
  created_at     <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">payments</span> (
  id           <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  booking_id   <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">bookings</span>(id),
  amount       <span class="tp">NUMERIC(10,2)</span>,
  currency     <span class="tp">TEXT</span> <span class="kw">DEFAULT</span> <span class="st">'usd'</span>,
  stripe_pi_id <span class="tp">TEXT</span>,
  status       <span class="tp">TEXT</span>,
  created_at   <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">reviews</span> (
  id         <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  booking_id <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">bookings</span>(id),
  user_id    <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">users</span>(id),
  rating     <span class="tp">INTEGER</span> <span class="kw">CHECK</span>(rating <span class="kw">BETWEEN</span> 1 <span class="kw">AND</span> 5),
  title      <span class="tp">TEXT</span>,
  body       <span class="tp">TEXT</span>,
  created_at <span class="tp">TIMESTAMPTZ</span> <span class="kw">DEFAULT NOW</span>()
);

<span class="kw">CREATE TABLE</span> <span class="tp">staff</span> (
  id         <span class="tp">UUID</span> <span class="kw">PRIMARY KEY DEFAULT</span> <span class="fn">gen_random_uuid</span>(),
  user_id    <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">users</span>(id),
  hotel_id   <span class="tp">UUID</span> <span class="kw">REFERENCES</span> <span class="tp">hotels</span>(id),
  department <span class="tp">TEXT</span>,
  position   <span class="tp">TEXT</span>,
  shift      <span class="tp">TEXT</span>,
  active     <span class="tp">BOOLEAN</span> <span class="kw">DEFAULT TRUE</span>
);

<span class="kw">CREATE INDEX ON</span> <span class="tp">bookings</span>(check_in, check_out);
<span class="kw">CREATE INDEX ON</span> <span class="tp">bookings</span>(user_id);
<span class="kw">CREATE INDEX ON</span> <span class="tp">bookings</span>(status);
<span class="kw">CREATE INDEX ON</span> <span class="tp">rooms</span>(hotel_id);

<span class="cm">-- Availability function</span>
<span class="kw">CREATE OR REPLACE FUNCTION</span> <span class="fn">check_availability</span>(p_room_id <span class="tp">UUID</span>, p_in <span class="tp">DATE</span>, p_out <span class="tp">DATE</span>)
<span class="kw">RETURNS BOOLEAN AS</span> $$
  <span class="kw">SELECT NOT EXISTS</span>(<span class="kw">SELECT</span> 1 <span class="kw">FROM</span> <span class="tp">bookings</span>
    <span class="kw">WHERE</span> room_id=p_room_id <span class="kw">AND</span> status != <span class="st">'cancelled'</span>
      <span class="kw">AND</span> check_in &lt; p_out <span class="kw">AND</span> check_out &gt; p_in);
$$ <span class="kw">LANGUAGE SQL</span>;`;

const API_SNIPPETS = {
  bookings:`<span class="cm">// @neondatabase/serverless · List bookings with joins</span>
<span class="kw">import</span> { neon } <span class="kw">from</span> <span class="st">'@neondatabase/serverless'</span>;
<span class="kw">const</span> sql = <span class="fn">neon</span>(process.env.<span class="tp">DATABASE_URL</span>);

<span class="kw">export async function</span> <span class="fn">getBookings</span>({ status, from, to }) {
  <span class="kw">return</span> sql\`
    <span class="kw">SELECT</span> b.*, u.name guest_name, u.email,
           r.name room_name, h.name hotel_name
    <span class="kw">FROM</span> bookings b
    <span class="kw">JOIN</span> users u  <span class="kw">ON</span> b.user_id  = u.id
    <span class="kw">JOIN</span> rooms r  <span class="kw">ON</span> b.room_id  = r.id
    <span class="kw">JOIN</span> hotels h <span class="kw">ON</span> r.hotel_id = h.id
    <span class="kw">WHERE</span> (\${status} <span class="kw">IS NULL OR</span> b.status = \${status})
      <span class="kw">AND</span> (\${from} <span class="kw">IS NULL OR</span> b.check_in >= \${from})
    <span class="kw">ORDER BY</span> b.created_at <span class="kw">DESC</span>
  \`;
}`,
  availability:`<span class="cm">// Check room availability for date range</span>
<span class="kw">export async function</span> <span class="fn">getAvailableRooms</span>(hotelId, checkIn, checkOut) {
  <span class="kw">return</span> sql\`
    <span class="kw">SELECT</span> r.* <span class="kw">FROM</span> rooms r
    <span class="kw">WHERE</span> r.hotel_id = \${hotelId}
      <span class="kw">AND</span> r.status = <span class="st">'available'</span>
      <span class="kw">AND</span> <span class="fn">check_availability</span>(r.id, \${checkIn}, \${checkOut})
    <span class="kw">ORDER BY</span> r.base_price
  \`;
}`,
  revenue:`<span class="cm">// Monthly revenue report</span>
<span class="kw">export async function</span> <span class="fn">getMonthlyRevenue</span>(year) {
  <span class="kw">return</span> sql\`
    <span class="kw">SELECT</span>
      <span class="fn">to_char</span>(check_in, <span class="st">'Mon'</span>) month,
      <span class="fn">SUM</span>(total_amount) revenue,
      <span class="fn">COUNT</span>(*) bookings,
      <span class="fn">ROUND</span>(<span class="fn">AVG</span>(room_rate), 2) adr
    <span class="kw">FROM</span> bookings
    <span class="kw">WHERE</span> <span class="fn">EXTRACT</span>(year <span class="kw">FROM</span> check_in) = \${year}
      <span class="kw">AND</span> status != <span class="st">'cancelled'</span>
    <span class="kw">GROUP BY</span> 1, <span class="fn">EXTRACT</span>(month <span class="kw">FROM</span> check_in)
    <span class="kw">ORDER BY</span> 2
  \`;
}`,
};


// ── Hooks & Shared Components ─────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="info") => {
    const id = Date.now();
    setToasts(p => [...p, {id,msg,type}]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3400);
  }, []);
  return [toasts, add];
};
const useDebounce = (val, delay=300) => {
  const [dv, setDv] = useState(val);
  useEffect(() => { const t=setTimeout(()=>setDv(val),delay); return ()=>clearTimeout(t); }, [val,delay]);
  return dv;
};

const Toasts = ({items}) => (
  <div className="toasts">
    {items.map(t=>(
      <div key={t.id} className={`toast toast-${t.type==="success"?"ok":t.type==="error"?"err":"info"}`}>
        <Ic n={t.type==="success"?"check":t.type==="error"?"warn":"info"} s={14} c={t.type==="success"?"var(--green)":t.type==="error"?"var(--red)":"var(--gold)"}/>
        <span style={{color:"var(--text)",fontFamily:"var(--sans)",fontSize:".82rem"}}>{t.msg}</span>
      </div>
    ))}
  </div>
);

const PageHeader = ({title, sub, actions}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
    <div>
      <h1 style={{fontFamily:"var(--serif)",fontSize:"1.35rem",fontWeight:700,color:"var(--text)",letterSpacing:"-.01em"}}>{title}</h1>
      {sub && <div style={{fontFamily:"var(--mono)",fontSize:".68rem",color:"var(--text3)",marginTop:4,letterSpacing:".06em"}}>{sub}</div>}
    </div>
    {actions && <div style={{display:"flex",gap:8,alignItems:"center"}}>{actions}</div>}
  </div>
);

const SearchInput = ({value, onChange, placeholder="Search…"}) => (
  <div style={{position:"relative"}}>
    <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Ic n="search" s={13} c="var(--text3)"/></div>
    <input className="inp" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{paddingLeft:30,width:220,fontSize:".81rem"}}/>
  </div>
);

const StatusBadge = ({status}) => {
  const map = {confirmed:"confirmed",pending:"pending",cancelled:"cancelled",checked_in:"checkedin",checked_out:"checkedout",available:"available",occupied:"occupied",maintenance:"maintenance",paid:"confirmed",unpaid:"pending",refunded:"checkedout"};
  const dotColor = {confirmed:"green",available:"green",paid:"green",cancelled:"red",maintenance:"red",pending:"gold",occupied:"gold",checked_in:"blue",checked_out:"gray",unpaid:"gold",refunded:"gray"};
  return <span className={`bdg bdg-${map[status]||"gold"}`}><span className={`dot dot-${dotColor[status]||"gray"}`} style={{width:5,height:5}}/>{status?.replace(/_/g," ")}</span>;
};

const Avatar = ({name, size=30}) => {
  const colors=["#D4A843","#2DD4BF","#60A5FA","#A78BFA","#4ADE80","#F87171"];
  const color=colors[name?.charCodeAt(0)%colors.length];
  const init=name?.split(" ").map(n=>n[0]).slice(0,2).join("")||"?";
  return <div style={{width:size,height:size,borderRadius:"50%",background:`${color}22`,border:`1.5px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:`${size*.3}px`,fontWeight:600,color,flexShrink:0}}>{init}</div>;
};

const Modal = ({open, onClose, title, children, footer, maxWidth=520}) => {
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth}}>
        <div className="modal-hd">
          <span style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)"}}>{title}</span>
          <button className="btn-ic" onClick={onClose}><Ic n="close" s={13}/></button>
        </div>
        <div className="modal-bd">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
};

const FormField = ({label, children, required}) => (
  <div style={{marginBottom:16}}>
    <label style={{display:"block",fontFamily:"var(--mono)",fontSize:".63rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--text3)",marginBottom:6}}>
      {label}{required && <span style={{color:"var(--red)",marginLeft:3}}>*</span>}
    </label>
    {children}
  </div>
);

const Divider = () => <div style={{height:1,background:"var(--border)",margin:"16px 0"}}/>;

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  {id:"dashboard",label:"Dashboard",icon:"grid"},
  {id:"bookings",label:"Bookings",icon:"bookings",badge:"48"},
  {id:"rooms",label:"Rooms",icon:"rooms"},
  {id:"guests",label:"Guests",icon:"guests"},
  {id:"revenue",label:"Revenue & Analytics",icon:"revenue"},
  {id:"calendar",label:"Occupancy Calendar",icon:"calendar"},
  {id:"staff",label:"Staff",icon:"staff"},
  {id:"database",label:"Database (Neon)",icon:"db"},
  {id:"settings",label:"Settings",icon:"settings"},
];
const NAV_GROUPS = [
  {label:"Operations", items:["dashboard","bookings","rooms","guests"]},
  {label:"Analytics", items:["revenue","calendar"]},
  {label:"Management", items:["staff","database","settings"]},
];

const Sidebar = ({page, setPage}) => (
  <aside style={{width:"var(--sidebar)",flexShrink:0,background:"var(--surface)",borderRight:"1px solid var(--border)",height:"100vh",position:"sticky",top:0,overflow:"auto",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"20px 16px 14px",borderBottom:"1px solid var(--border)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,var(--gold),var(--gold-lt))",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="building" s={16} c="#000"/></div>
        <div>
          <div style={{fontFamily:"var(--serif)",fontSize:".95rem",fontWeight:700,color:"var(--text)",letterSpacing:".02em"}}>Veloura</div>
          <div style={{fontFamily:"var(--mono)",fontSize:".56rem",color:"var(--text3)",letterSpacing:".12em"}}>ADMIN PORTAL</div>
        </div>
      </div>
    </div>
    <nav style={{flex:1,padding:"8px 10px"}}>
      {NAV_GROUPS.map(g=>(
        <div key={g.label}>
          <div className="nav-group">{g.label}</div>
          {g.items.map(id=>{
            const item=NAV.find(n=>n.id===id); if(!item) return null;
            return (
              <button key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>setPage(id)}>
                <Ic n={item.icon} s={14} c={page===id?"var(--gold)":"var(--text3)"}/>
                <span style={{flex:1}}>{item.label}</span>
                {item.badge && <span style={{fontFamily:"var(--mono)",fontSize:".6rem",background:"var(--gold-dim)",color:"var(--gold)",padding:"1px 6px",borderRadius:10}}>{item.badge}</span>}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
    <div style={{padding:"12px 10px",borderTop:"1px solid var(--border)"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"var(--raised)",border:"1px solid var(--border)"}}>
        <Avatar name="Marcus Fontaine" size={26}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"var(--sans)",fontSize:".78rem",fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Marcus F.</div>
          <div style={{fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--text3)"}}>Super Admin</div>
        </div>
        <button className="btn-ic" style={{width:24,height:24}}><Ic n="logout" s={12} c="var(--text3)"/></button>
      </div>
    </div>
  </aside>
);


// ── Dashboard ─────────────────────────────────────────────────────────────────
const DashboardPage = ({toast}) => {
  const stats = [
    {label:"Revenue (MTD)",value:"$218,400",delta:"+12.4%",up:true,icon:"dollar",color:"var(--gold)"},
    {label:"Active Bookings",value:"34",delta:"+5",up:true,icon:"bookings",color:"var(--blue)"},
    {label:"Occupied Rooms",value:"23 / 31",delta:"74.2%",up:true,icon:"rooms",color:"var(--teal)"},
    {label:"Guests In-House",value:"41",delta:"+3 today",up:true,icon:"guests",color:"var(--purple)"},
    {label:"Avg Daily Rate",value:"$564",delta:"+$18",up:true,icon:"chart",color:"var(--green)"},
    {label:"RevPAR",value:"$418",delta:"-2.1%",up:false,icon:"revenue",color:"var(--amber)"},
  ];
  const TT = ({active,payload,label}) => {
    if(!active||!payload?.length) return null;
    return <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:8,padding:"10px 14px",fontFamily:"var(--mono)",fontSize:".72rem"}}><div style={{color:"var(--text2)",marginBottom:6}}>{label}</div>{payload.map(p=><div key={p.name} style={{color:p.color}}>${(p.value/1000).toFixed(0)}k</div>)}</div>;
  };
  return (
    <div className="pg">
      <PageHeader title="Dashboard" sub={new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
        actions={<><button className="btn-s"><Ic n="download" s={13}/>Export</button><button className="btn-p" onClick={()=>toast("Refreshed!","success")}><Ic n="refresh" s={13}/>Refresh</button></>}/>
      <div className="stagger" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        {stats.map(s=>(
          <div key={s.label} className="card card-hover" style={{padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div className="stat-l">{s.label}</div>
                <div className="stat-v" style={{marginTop:10,fontSize:"1.6rem"}}>{s.value}</div>
              </div>
              <div style={{width:38,height:38,borderRadius:10,background:`${s.color}18`,border:`1px solid ${s.color}28`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n={s.icon} s={17} c={s.color}/></div>
            </div>
            <div style={{marginTop:12}}><span className={`stat-d ${s.up?"up":"dn"}`}>{s.up?"↑":"↓"} {s.delta}</span><span style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)",marginLeft:8}}>vs last month</span></div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,marginBottom:16}}>
        <div className="card" style={{padding:"20px 20px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)"}}>Revenue 2026</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_REVENUE} margin={{top:4,right:4,bottom:0,left:-20}}>
              <defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--gold)" stopOpacity={.25}/><stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="month" tick={{fontFamily:"var(--mono)",fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontFamily:"var(--mono)",fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2} fill="url(#gR)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{padding:"20px"}}>
          <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:18}}>Booking Sources</div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
            <PieChart width={140} height={140}><Pie data={SOURCE_DATA} cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">{SOURCE_DATA.map((e,i)=><Cell key={i} fill={e.color} opacity={.85}/>)}</Pie></PieChart>
          </div>
          {SOURCE_DATA.map(s=>(
            <div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:2,background:s.color}}/><span style={{fontFamily:"var(--sans)",fontSize:".8rem",color:"var(--text2)"}}>{s.name}</span></div>
              <span style={{fontFamily:"var(--mono)",fontSize:".75rem",color:"var(--text)",fontWeight:500}}>{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="card">
          <div style={{padding:"16px 18px 12px",borderBottom:"1px solid var(--border)"}}><span style={{fontFamily:"var(--serif)",fontSize:".95rem",fontWeight:700,color:"var(--text)"}}>Recent Bookings</span></div>
          {MOCK_BOOKINGS.slice(0,6).map((b,i)=>(
            <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:i<5?"1px solid var(--border)":"none",transition:"background .12s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.015)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={b.guest_name} size={28}/><div><div style={{fontFamily:"var(--sans)",fontSize:".82rem",fontWeight:500,color:"var(--text)"}}>{b.guest_name}</div><div style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)"}}>{b.hotel_name}</div></div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"var(--mono)",fontSize:".78rem",color:"var(--gold)",fontWeight:500,marginBottom:3}}>${b.total_amount.toLocaleString()}</div><StatusBadge status={b.status}/></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{padding:"16px 18px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--border)"}}><span style={{fontFamily:"var(--serif)",fontSize:".95rem",fontWeight:700,color:"var(--text)"}}>Today's Arrivals</span><span className="bdg bdg-gold">5 guests</span></div>
          {MOCK_BOOKINGS.filter(b=>b.status==="confirmed").slice(0,5).map((b,i)=>(
            <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:i<4?"1px solid var(--border)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:8,height:8,borderRadius:2,background:"var(--green)",flexShrink:0}}/><div><div style={{fontFamily:"var(--sans)",fontSize:".82rem",fontWeight:500,color:"var(--text)"}}>{b.guest_name}</div><div style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)"}}>{b.room_name} · {b.nights}n</div></div></div>
              <span style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)"}}>#{b.ref}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Bookings ──────────────────────────────────────────────────────────────────
const BookingsPage = ({toast}) => {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [selected, setSelected] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [page, setPage] = useState(1);
  const PER=12, dSearch=useDebounce(search,250);

  useEffect(() => {
    adminAPI.bookings.list().then(data => {
      if (data.length) setBookings(data.map(b => ({
        id: b.id, ref: b.ref || b.id.slice(0,8).toUpperCase(), guest_name: b.guest_name || "Guest",
        guest_email: b.guest_email || "", room_name: b.room_name || "", hotel_name: b.hotel_name || "",
        room_type: b.room_type || "", hotel_id: b.hotel_id, check_in: b.check_in, check_out: b.check_out,
        nights: b.nights || 1, guests: b.guests || 1, room_rate: parseFloat(b.room_rate || 0),
        total_amount: parseFloat(b.total_amount || 0), status: b.status, payment_status: b.payment_status,
        source: b.source || "direct", created_at: b.created_at
      })));
    }).catch(() => {});
  }, []);

  const filtered = useMemo(()=>bookings.filter(b=>{
    const q=dSearch.toLowerCase();
    return (!q||b.guest_name.toLowerCase().includes(q)||b.ref.toLowerCase().includes(q)||b.hotel_name?.toLowerCase().includes(q))
      &&(statusF==="all"||b.status===statusF);
  }).sort((a,b)=>sortBy==="amount_desc"?b.total_amount-a.total_amount:sortBy==="amount_asc"?a.total_amount-b.total_amount:new Date(b.created_at)-new Date(a.created_at)),[bookings,dSearch,statusF,sortBy]);

  const pages=Math.ceil(filtered.length/PER), paged=filtered.slice((page-1)*PER,page*PER);
  const updateStatus=(id,status)=>{setBookings(p=>p.map(b=>b.id===id?{...b,status}:b));toast(`Status → ${status}`,"success");setSelected(null);};
  const cancel=(id)=>{setBookings(p=>p.map(b=>b.id===id?{...b,status:"cancelled",payment_status:"refunded"}:b));toast("Booking cancelled","info");setSelected(null);};

  return (
    <div className="pg">
      <PageHeader title="Bookings" sub={`${filtered.length} reservations · ${bookings.filter(b=>b.status==="confirmed").length} confirmed`}
        actions={<><button className="btn-s"><Ic n="download" s={13}/>CSV</button><button className="btn-p" onClick={()=>setNewModal(true)}><Ic n="plus" s={13}/>New Booking</button></>}/>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <SearchInput value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder="Guest, ref, hotel…"/>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {["all","confirmed","pending","checked_in","checked_out","cancelled"].map(s=>(
            <button key={s} onClick={()=>{setStatusF(s);setPage(1);}} style={{padding:"6px 10px",borderRadius:6,fontFamily:"var(--mono)",fontSize:".63rem",textTransform:"uppercase",border:"1px solid",background:statusF===s?"var(--gold)":"transparent",color:statusF===s?"#000":"var(--text3)",borderColor:statusF===s?"var(--gold)":"var(--border2)",cursor:"pointer",transition:"all .18s"}}>
              {s==="all"?`All (${bookings.length})`:s.replace(/_/g," ")}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto"}}>
          <select className="inp" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:"auto",fontSize:".78rem",padding:"7px 12px"}}>
            <option value="created_at">Newest</option><option value="amount_desc">Highest $</option><option value="amount_asc">Lowest $</option>
          </select>
        </div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table className="tbl">
            <thead><tr><th>REF</th><th>GUEST</th><th>PROPERTY</th><th>CHECK-IN</th><th>CHECK-OUT</th><th>NIGHTS</th><th>AMOUNT</th><th>SOURCE</th><th>STATUS</th><th>PAYMENT</th><th></th></tr></thead>
            <tbody>
              {paged.map(b=>(
                <tr key={b.id} style={{cursor:"pointer"}} onClick={()=>setSelected(b)}>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:".72rem",color:"var(--gold)",fontWeight:500}}>#{b.ref}</span></td>
                  <td><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={b.guest_name} size={26}/><div><div className="cell-hi">{b.guest_name}</div><div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)"}}>{b.guest_email}</div></div></div></td>
                  <td><div className="cell-hi" style={{fontSize:".78rem"}}>{b.hotel_name}</div><div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)"}}>{b.room_name}</div></td>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:".75rem"}}>{b.check_in}</span></td>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:".75rem"}}>{b.check_out}</span></td>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:".75rem",color:"var(--text)"}}>{b.nights}n</span></td>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:".78rem",color:"var(--gold)",fontWeight:500}}>${b.total_amount.toLocaleString()}</span></td>
                  <td><span className="bdg bdg-blue">{b.source}</span></td>
                  <td><StatusBadge status={b.status}/></td>
                  <td><StatusBadge status={b.payment_status}/></td>
                  <td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}><button className="btn-ic" onClick={()=>setSelected(b)}><Ic n="eye" s={12}/></button></div></td>
                </tr>
              ))}
              {paged.length===0 && <tr><td colSpan={11} style={{textAlign:"center",padding:"40px 20px",color:"var(--text3)",fontFamily:"var(--mono)",fontSize:".75rem"}}>No bookings found</td></tr>}
            </tbody>
          </table>
        </div>
        {pages>1 && (
          <div style={{padding:"12px 16px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)"}}>Page {page} of {pages} · {filtered.length} results</span>
            <div style={{display:"flex",gap:4}}>
              <button className="btn-s" disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{padding:"5px 10px",fontSize:".75rem"}}>← Prev</button>
              {Array.from({length:Math.min(5,pages)},(_,i)=>{const pg=page>3?page-3+i+1:i+1; if(pg>pages)return null; return <button key={pg} onClick={()=>setPage(pg)} style={{padding:"5px 10px",fontSize:".75rem",fontFamily:"var(--mono)",borderRadius:6,border:"1px solid",background:pg===page?"var(--gold)":"var(--raised)",color:pg===page?"#000":"var(--text3)",borderColor:pg===page?"var(--gold)":"var(--border2)",cursor:"pointer"}}>{pg}</button>;})}
              <button className="btn-s" disabled={page===pages} onClick={()=>setPage(p=>p+1)} style={{padding:"5px 10px",fontSize:".75rem"}}>Next →</button>
            </div>
          </div>
        )}
      </div>
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={`Booking #${selected?.ref}`} maxWidth={580}
        footer={<><button className="btn-d" onClick={()=>cancel(selected?.id)}>Cancel</button><button className="btn-s" onClick={()=>setSelected(null)}>Close</button><button className="btn-p" onClick={()=>updateStatus(selected?.id,"checked_in")}>Check In</button></>}>
        {selected && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[["Guest",selected.guest_name],["Email",selected.guest_email],["Hotel",selected.hotel_name],["Room",selected.room_name],["Check-In",selected.check_in],["Check-Out",selected.check_out],["Nights",selected.nights],["Guests",selected.guests],["Rate",`$${selected.room_rate}/n`],["Total",`$${selected.total_amount?.toLocaleString()}`],["Source",selected.source],["Status",selected.status]].map(([l,v])=>(
            <div key={l}><div style={{fontFamily:"var(--mono)",fontSize:".62rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--text3)",marginBottom:4}}>{l}</div><div style={{fontFamily:"var(--sans)",fontSize:".85rem",color:"var(--text)",fontWeight:500}}>{v}</div></div>
          ))}</div>}
      </Modal>
      <Modal open={newModal} onClose={()=>setNewModal(false)} title="New Booking" maxWidth={540}
        footer={<><button className="btn-s" onClick={()=>setNewModal(false)}>Cancel</button><button className="btn-p" onClick={()=>{toast("Booking created","success");setNewModal(false);}}>Create</button></>}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <FormField label="Guest Name" required><input className="inp" placeholder="Full name"/></FormField>
          <FormField label="Email"><input className="inp" type="email" placeholder="email@…"/></FormField>
          <FormField label="Hotel" required><select className="inp">{MOCK_HOTELS.map(h=><option key={h.id}>{h.name}</option>)}</select></FormField>
          <FormField label="Room"><select className="inp">{MOCK_ROOMS.map(r=><option key={r.id}>{r.name} · ${r.base_price}/n</option>)}</select></FormField>
          <FormField label="Check-In" required><input className="inp" type="date"/></FormField>
          <FormField label="Check-Out" required><input className="inp" type="date"/></FormField>
          <FormField label="Guests"><input className="inp" type="number" defaultValue={2} min={1} max={4}/></FormField>
          <FormField label="Source"><select className="inp"><option>Direct</option><option>Booking.com</option><option>Expedia</option><option>Phone</option></select></FormField>
          <div style={{gridColumn:"1/-1"}}><FormField label="Notes"><textarea className="inp" placeholder="Special requests…"/></FormField></div>
        </div>
      </Modal>
    </div>
  );
};

// ── Rooms ─────────────────────────────────────────────────────────────────────
const RoomsPage = ({toast}) => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [hotelF, setHotelF] = useState("all");
  const [statusF, setStatusF] = useState("all");

  useEffect(() => {
    adminAPI.rooms.listAll().then(data => {
      if (data.length) setRooms(data.map(r => ({
        id: r.id, hotel_id: r.hotel_id, name: r.name, type: r.type || r.category || "Standard",
        floor: r.floor || 1, sqm: r.sqm || 30, max_guests: r.max_guests || 2,
        base_price: parseFloat(r.base_price || 0), status: r.status || "available",
        hotel_name: r.hotel_name, hotel_city: r.hotel_city
      })));
    }).catch(() => {});
  }, []);
  const [editRoom, setEditRoom] = useState(null);
  const [newRoom, setNewRoom] = useState(false);
  const filtered = rooms.filter(r=>(hotelF==="all"||r.hotel_id===hotelF)&&(statusF==="all"||r.status===statusF));
  const setStatus = (id,status) => { setRooms(p=>p.map(r=>r.id===id?{...r,status}:r)); toast(`Room → ${status}`,"success"); };
  const sc = s => ({available:"var(--green)",occupied:"var(--gold)",maintenance:"var(--red)",blocked:"var(--text3)"}[s]||"var(--text3)");
  return (
    <div className="pg">
      <PageHeader title="Rooms & Availability" sub={`${rooms.filter(r=>r.status==="available").length} avail · ${rooms.filter(r=>r.status==="occupied").length} occupied · ${rooms.filter(r=>r.status==="maintenance").length} maintenance`}
        actions={<button className="btn-p" onClick={()=>setNewRoom(true)}><Ic n="plus" s={13}/>Add Room</button>}/>
      <div className="stagger" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[["Available",rooms.filter(r=>r.status==="available").length,"var(--green)"],["Occupied",rooms.filter(r=>r.status==="occupied").length,"var(--gold)"],["Maintenance",rooms.filter(r=>r.status==="maintenance").length,"var(--red)"],["Total",rooms.length,"var(--blue)"]].map(([l,v,c])=>(
          <div key={l} className="card" style={{padding:"14px 16px"}}><div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:700,color:c}}>{v}</div><div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)",marginTop:4,letterSpacing:".08em",textTransform:"uppercase"}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <select className="inp" value={hotelF} onChange={e=>setHotelF(e.target.value)} style={{width:"auto",fontSize:".78rem"}}><option value="all">All Hotels</option>{MOCK_HOTELS.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select>
        {["all","available","occupied","maintenance"].map(s=>(
          <button key={s} onClick={()=>setStatusF(s)} style={{padding:"6px 14px",borderRadius:6,fontFamily:"var(--mono)",fontSize:".65rem",textTransform:"uppercase",border:"1px solid",background:statusF===s?sc(s):"transparent",color:statusF===s?"#000":"var(--text3)",borderColor:statusF===s?sc(s):"var(--border2)",cursor:"pointer",transition:"all .18s"}}>{s==="all"?"All":s}</button>
        ))}
      </div>
      <div className="stagger" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {filtered.map(r=>{
          const hotel=MOCK_HOTELS.find(h=>h.id===r.hotel_id);
          return (
            <div key={r.id} className="card card-hover" style={{padding:18,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,width:3,height:"100%",background:sc(r.status),opacity:.8}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div><div style={{fontFamily:"var(--sans)",fontSize:".88rem",fontWeight:600,color:"var(--text)",marginBottom:3}}>{r.name}</div><div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)"}}>{hotel?.name} · Floor {r.floor}</div></div>
                <StatusBadge status={r.status}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {[["Type",r.type],["Size",`${r.sqm}m²`],["Guests",`Max ${r.max_guests}`],["Rate",`$${r.base_price}/n`]].map(([l,v])=>(
                  <div key={l}><div style={{fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--text3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:2}}>{l}</div><div style={{fontFamily:"var(--sans)",fontSize:".8rem",color:"var(--text)",fontWeight:500}}>{v}</div></div>
                ))}
              </div>
              <Divider/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {r.status!=="available"&&<button className="btn-s" style={{padding:"4px 10px",fontSize:".72rem"}} onClick={()=>setStatus(r.id,"available")}>Set Available</button>}
                {r.status!=="maintenance"&&<button className="btn-s" style={{padding:"4px 10px",fontSize:".72rem"}} onClick={()=>setStatus(r.id,"maintenance")}>Maintenance</button>}
                <button className="btn-ic" onClick={()=>setEditRoom(r)} style={{marginLeft:"auto"}}><Ic n="edit" s={12}/></button>
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={!!editRoom} onClose={()=>setEditRoom(null)} title={`Edit · ${editRoom?.name}`} maxWidth={480}
        footer={<><button className="btn-s" onClick={()=>setEditRoom(null)}>Cancel</button><button className="btn-p" onClick={()=>{toast("Room updated","success");setEditRoom(null);}}>Save</button></>}>
        {editRoom && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <FormField label="Name" required><input className="inp" defaultValue={editRoom.name}/></FormField>
          <FormField label="Type"><input className="inp" defaultValue={editRoom.type}/></FormField>
          <FormField label="Floor"><input className="inp" type="number" defaultValue={editRoom.floor}/></FormField>
          <FormField label="Size (m²)"><input className="inp" type="number" defaultValue={editRoom.sqm}/></FormField>
          <FormField label="Max Guests"><input className="inp" type="number" defaultValue={editRoom.max_guests}/></FormField>
          <FormField label="Base Price"><input className="inp" type="number" defaultValue={editRoom.base_price}/></FormField>
          <div style={{gridColumn:"1/-1"}}><FormField label="Status"><select className="inp" defaultValue={editRoom.status}><option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option><option value="blocked">Blocked</option></select></FormField></div>
        </div>}
      </Modal>
      <Modal open={newRoom} onClose={()=>setNewRoom(false)} title="Add New Room" maxWidth={480}
        footer={<><button className="btn-s" onClick={()=>setNewRoom(false)}>Cancel</button><button className="btn-p" onClick={()=>{toast("Room added","success");setNewRoom(false);}}>Add Room</button></>}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <FormField label="Hotel" required><select className="inp">{MOCK_HOTELS.map(h=><option key={h.id}>{h.name}</option>)}</select></FormField>
          <FormField label="Room Name" required><input className="inp" placeholder="Deluxe King"/></FormField>
          <FormField label="Type"><input className="inp" placeholder="Suite, Deluxe…"/></FormField>
          <FormField label="Floor"><input className="inp" type="number" defaultValue={1}/></FormField>
          <FormField label="Size (m²)"><input className="inp" type="number"/></FormField>
          <FormField label="Max Guests"><input className="inp" type="number" defaultValue={2}/></FormField>
          <div style={{gridColumn:"1/-1"}}><FormField label="Base Price / Night" required><input className="inp" type="number" placeholder="420"/></FormField></div>
        </div>
      </Modal>
    </div>
  );
};

// ── Guests ────────────────────────────────────────────────────────────────────
const GuestsPage = ({toast}) => {
  const [search, setSearch] = useState("");
  const [tierF, setTierF] = useState("all");
  const [selected, setSelected] = useState(null);
  const [apiGuests, setApiGuests] = useState(null);

  useEffect(() => {
    adminAPI.guests.list().then(data => {
      if (data.length) setApiGuests(data.map(g => ({
        id: g.id, name: g.name, email: g.email, phone: g.phone || "",
        nationality: g.nationality || "", loyalty_tier: g.loyalty_tier || "standard",
        loyalty_pts: g.loyalty_points || 0, bookings: g.total_stays || 0,
        total_spent: parseFloat(g.total_spent || 0), created_at: g.created_at
      })));
    }).catch(() => {});
  }, []);
  const dSearch = useDebounce(search, 250);
  const guests = apiGuests || MOCK_GUESTS;
  const filtered = guests.filter(g=>{
    const q=dSearch.toLowerCase();
    return (!q||g.name.toLowerCase().includes(q)||g.email.toLowerCase().includes(q)||(g.nationality||"").toLowerCase().includes(q))&&(tierF==="all"||g.loyalty_tier===tierF);
  });
  const tc = t => ({platinum:"var(--teal)",gold:"var(--gold)",standard:"var(--text3)"}[t]);
  const tb = t => t==="platinum"?"bdg-blue":t==="gold"?"bdg-gold":"";
  return (
    <div className="pg">
      <PageHeader title="Guests" sub={`${guests.length} registered · ${guests.filter(g=>g.loyalty_tier!=="standard").length} loyalty members`}
        actions={<><button className="btn-s"><Ic n="download" s={13}/>Export</button><button className="btn-p"><Ic n="plus" s={13}/>Add Guest</button></>}/>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <SearchInput value={search} onChange={setSearch} placeholder="Name, email, country…"/>
        <div style={{display:"flex",gap:4}}>
          {["all","platinum","gold","standard"].map(t=>(
            <button key={t} onClick={()=>setTierF(t)} style={{padding:"6px 12px",borderRadius:6,fontFamily:"var(--mono)",fontSize:".65rem",textTransform:"uppercase",border:"1px solid",background:tierF===t?tc(t)||"var(--raised)":"transparent",color:tierF===t?"#000":"var(--text3)",borderColor:tierF===t?tc(t)||"var(--border2)":"var(--border2)",cursor:"pointer",transition:"all .18s"}}>{t}</button>
          ))}
        </div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table className="tbl">
          <thead><tr><th>GUEST</th><th>NATIONALITY</th><th>BOOKINGS</th><th>TOTAL SPENT</th><th>TIER</th><th>POINTS</th><th>SINCE</th><th></th></tr></thead>
          <tbody>
            {filtered.map(g=>(
              <tr key={g.id} style={{cursor:"pointer"}} onClick={()=>setSelected(g)}>
                <td><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={g.name} size={30}/><div><div className="cell-hi">{g.name}</div><div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)"}}>{g.email}</div></div></div></td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:".72rem"}}>{g.nationality}</span></td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:".78rem",color:"var(--text)",fontWeight:500}}>{g.bookings}</span></td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:".78rem",color:"var(--gold)",fontWeight:500}}>${g.total_spent.toLocaleString()}</span></td>
                <td><span className={`bdg ${tb(g.loyalty_tier)}`} style={{textTransform:"capitalize"}}>{g.loyalty_tier}</span></td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:".75rem",color:tc(g.loyalty_tier)}}>{g.loyalty_pts.toLocaleString()} pts</span></td>
                <td><span style={{fontFamily:"var(--mono)",fontSize:".72rem",color:"var(--text3)"}}>{g.created_at}</span></td>
                <td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}><button className="btn-ic" onClick={()=>setSelected(g)}><Ic n="eye" s={12}/></button><button className="btn-ic"><Ic n="mail" s={12}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected?.name}
        footer={<><button className="btn-s" onClick={()=>setSelected(null)}>Close</button><button className="btn-p" onClick={()=>{toast("Email sent","success");}}><Ic n="mail" s={13}/>Email Guest</button></>}>
        {selected && <div>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
            <Avatar name={selected.name} size={52}/>
            <div><div style={{fontFamily:"var(--serif)",fontSize:"1.15rem",fontWeight:700,color:"var(--text)"}}>{selected.name}</div><div style={{fontFamily:"var(--mono)",fontSize:".68rem",color:"var(--text3)",marginTop:3}}>{selected.email}</div><span className={`bdg ${tb(selected.loyalty_tier)}`} style={{marginTop:6,display:"inline-block",textTransform:"capitalize"}}>{selected.loyalty_tier}</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
            {[["Bookings",selected.bookings],["Total Spent",`$${selected.total_spent.toLocaleString()}`],["Points",`${selected.loyalty_pts.toLocaleString()} pts`]].map(([l,v])=>(
              <div key={l} className="card" style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontFamily:"var(--serif)",fontSize:"1.2rem",fontWeight:700,color:"var(--gold)"}}>{v}</div><div style={{fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--text3)",marginTop:3,textTransform:"uppercase",letterSpacing:".08em"}}>{l}</div></div>
            ))}
          </div>
          <Divider/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[["Phone",selected.phone],["Nationality",selected.nationality],["Member Since",selected.created_at],["Guest ID",selected.id]].map(([l,v])=>(
              <div key={l}><div style={{fontFamily:"var(--mono)",fontSize:".6rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--text3)",marginBottom:4}}>{l}</div><div style={{fontFamily:"var(--sans)",fontSize:".84rem",color:"var(--text)",wordBreak:"break-all"}}>{v}</div></div>
            ))}
          </div>
        </div>}
      </Modal>
    </div>
  );
};


// ── Revenue ───────────────────────────────────────────────────────────────────
const RevenuePage = () => {
  const total = MONTHLY_REVENUE.reduce((s,m)=>s+m.revenue,0);
  const avgOcc = Math.round(MONTHLY_REVENUE.reduce((s,m)=>s+m.occupancy,0)/MONTHLY_REVENUE.length);
  const avgADR = Math.round(MONTHLY_REVENUE.reduce((s,m)=>s+m.adr,0)/MONTHLY_REVENUE.length);
  const TT = ({active,payload,label}) => {
    if(!active||!payload?.length) return null;
    return <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:8,padding:"10px 14px"}}><div style={{fontFamily:"var(--mono)",fontSize:".68rem",color:"var(--text3)",marginBottom:6}}>{label}</div>{payload.map(p=><div key={p.dataKey} style={{fontFamily:"var(--mono)",fontSize:".72rem",color:p.color,marginTop:2}}>{p.name}: {p.dataKey==="revenue"?`$${(p.value/1000).toFixed(0)}k`:p.dataKey==="adr"?`$${p.value}`:`${p.value}%`}</div>)}</div>;
  };
  return (
    <div className="pg">
      <PageHeader title="Revenue & Analytics" sub="Full-year performance"
        actions={<button className="btn-s"><Ic n="download" s={13}/>Export PDF</button>}/>
      <div className="stagger" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[["Total Revenue","$"+total.toLocaleString(),"+14.2%",true],["Avg Occupancy",avgOcc+"%","+4.1%",true],["Avg Daily Rate","$"+avgADR,"+$28",true],["RevPAR","$"+Math.round(avgADR*avgOcc/100),"+11.8%",true]].map(([l,v,d,u])=>(
          <div key={l} className="card" style={{padding:"18px 20px"}}><div className="stat-l">{l}</div><div className="stat-v" style={{marginTop:8}}>{v}</div><div style={{marginTop:10}}><span className={`stat-d ${u?"up":"dn"}`}>{u?"↑":"↓"} {d}</span></div></div>
        ))}
      </div>
      <div className="card" style={{padding:"20px 20px 12px",marginBottom:16}}>
        <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:16}}>Monthly Revenue vs ADR</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_REVENUE} margin={{top:4,right:4,bottom:0,left:-18}} barGap={4}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="month" tick={{fontFamily:"var(--mono)",fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="l" tick={{fontFamily:"var(--mono)",fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
            <YAxis yAxisId="r" orientation="right" tick={{fontFamily:"var(--mono)",fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
            <Tooltip content={<TT/>}/>
            <Bar yAxisId="l" dataKey="revenue" name="Revenue" fill="var(--gold)" opacity={.75} radius={[4,4,0,0]}/>
            <Bar yAxisId="r" dataKey="adr" name="ADR" fill="var(--teal)" opacity={.6} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="card" style={{padding:"20px 20px 12px"}}>
          <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:16}}>Occupancy Rate</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_REVENUE} margin={{top:4,right:4,bottom:0,left:-20}}>
              <defs><linearGradient id="gO" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--blue)" stopOpacity={.3}/><stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="month" tick={{fontFamily:"var(--mono)",fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontFamily:"var(--mono)",fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false} domain={[60,100]} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="occupancy" name="Occupancy" stroke="var(--blue)" strokeWidth={2} fill="url(#gO)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{padding:"20px"}}>
          <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:16}}>Monthly Breakdown</div>
          <div style={{overflowY:"auto",maxHeight:220}}>
            <table className="tbl">
              <thead><tr><th>MONTH</th><th>REVENUE</th><th>BOOKINGS</th><th>ADR</th><th>OCC%</th></tr></thead>
              <tbody>
                {MONTHLY_REVENUE.map(m=>(
                  <tr key={m.month}>
                    <td style={{fontFamily:"var(--mono)",fontSize:".72rem"}}>{m.month}</td>
                    <td><span style={{fontFamily:"var(--mono)",fontSize:".72rem",color:"var(--gold)",fontWeight:500}}>${(m.revenue/1000).toFixed(0)}k</span></td>
                    <td style={{fontFamily:"var(--mono)",fontSize:".72rem"}}>{m.bookings}</td>
                    <td style={{fontFamily:"var(--mono)",fontSize:".72rem",color:"var(--teal)"}}>${m.adr}</td>
                    <td><div style={{display:"flex",alignItems:"center",gap:6}}><div className="prog" style={{width:50}}><div className="prog-fill" style={{width:`${m.occupancy}%`,background:"var(--blue)"}}/></div><span style={{fontFamily:"var(--mono)",fontSize:".68rem"}}>{m.occupancy}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Occupancy Calendar ────────────────────────────────────────────────────────
const CalendarPage = () => {
  const [month, setMonth] = useState(new Date().getMonth());
  const year = new Date().getFullYear();
  const days = Array.from({length:31},(_,i)=>i+1);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const cellStatus = (room, day) => { const s=(room.charCodeAt(0)+day)%10; if(s<4)return "cal-booked"; if(s<6)return "cal-partial"; if(s===9)return "cal-maint"; return "cal-avail"; };
  return (
    <div className="pg">
      <PageHeader title="Occupancy Calendar" sub={`${months[month]} ${year}`}
        actions={<div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="btn-ic" onClick={()=>setMonth(p=>Math.max(0,p-1))}><Ic n="chevR" s={12} c="var(--text2)" sw={2.5}/></button>
          <span style={{fontFamily:"var(--mono)",fontSize:".78rem",color:"var(--text)",minWidth:80,textAlign:"center"}}>{months[month]} {year}</span>
          <button className="btn-ic" onClick={()=>setMonth(p=>Math.min(11,p+1))}><Ic n="chevR" s={12} c="var(--text2)" sw={2.5}/></button>
        </div>}/>
      <div style={{display:"flex",gap:16,marginBottom:16}}>
        {[["Available","cal-avail","var(--green)"],["Booked","cal-booked","var(--gold)"],["Partial","cal-partial","var(--blue)"],["Maintenance","cal-maint","var(--red)"]].map(([l,cls,c])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:6}}><div className={`cal-cell ${cls}`} style={{width:12,height:12,borderRadius:3}}/><span style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)"}}>{l}</span></div>
        ))}
      </div>
      <div className="card" style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:2,padding:14}}>
          <thead>
            <tr>
              <th style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)",padding:"6px 8px",textAlign:"left",minWidth:140,letterSpacing:".06em",textTransform:"uppercase"}}>Room</th>
              {days.map(d=><th key={d} style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)",padding:"4px 2px",textAlign:"center",width:28,minWidth:28}}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {MOCK_ROOMS.map(r=>{
              const hotel=MOCK_HOTELS.find(h=>h.id===r.hotel_id);
              return (
                <tr key={r.id}>
                  <td style={{padding:"3px 8px 3px 4px",whiteSpace:"nowrap"}}>
                    <div style={{fontFamily:"var(--sans)",fontSize:".78rem",fontWeight:500,color:"var(--text)"}}>{r.name}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--text3)"}}>{hotel?.city}</div>
                  </td>
                  {days.map(d=>(
                    <td key={d} style={{padding:2}}><div className={`cal-cell ${cellStatus(r.name,d)}`} style={{width:24,height:28}} title={`${r.name} · Day ${d}`}/></td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Staff ─────────────────────────────────────────────────────────────────────
const StaffPage = ({toast}) => {
  const [staff, setStaff] = useState(MOCK_STAFF);
  const [newModal, setNewModal] = useState(false);
  const [search, setSearch] = useState("");
  const dSearch = useDebounce(search, 250);

  useEffect(() => {
    adminAPI.staff.list().then(data => {
      if (data.length) setStaff(data.map(s => ({
        id: s.id, name: s.name, email: s.email, role: s.role || "staff",
        department: s.department || "General", position: s.position || s.role || "Staff",
        shift: s.shift || "Day", hotel: s.hotel_name || "Veloura",
        active: s.is_active !== false, since: s.created_at?.split("T")[0] || "2024-01-01"
      })));
    }).catch(() => {});
  }, []);

  const filtered = staff.filter(s=>{const q=dSearch.toLowerCase();return !q||s.name.toLowerCase().includes(q)||(s.department||"").toLowerCase().includes(q)||(s.hotel||"").toLowerCase().includes(q);});
  const toggleActive = id => { setStaff(p=>p.map(s=>s.id===id?{...s,active:!s.active}:s)); toast("Status updated","success"); };
  const dc = d => ({"Front Desk":"var(--blue)","Housekeeping":"var(--teal)","Concierge":"var(--gold)","Restaurant":"var(--purple)","Maintenance":"var(--red)","Spa":"var(--green)"}[d]||"var(--text3)");
  return (
    <div className="pg">
      <PageHeader title="Staff Management" sub={`${staff.filter(s=>s.active).length} active · ${staff.filter(s=>!s.active).length} inactive`}
        actions={<button className="btn-p" onClick={()=>setNewModal(true)}><Ic n="plus" s={13}/>Add Staff</button>}/>
      <div style={{marginBottom:16}}><SearchInput value={search} onChange={setSearch} placeholder="Name, dept, hotel…"/></div>
      <div className="stagger" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {filtered.map(s=>(
          <div key={s.id} className="card" style={{padding:18,opacity:s.active?1:.6,transition:"opacity .2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <Avatar name={s.name} size={38}/>
                <div><div style={{fontFamily:"var(--sans)",fontSize:".88rem",fontWeight:600,color:"var(--text)"}}>{s.name}</div><div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)",marginTop:2}}>{s.position}</div></div>
              </div>
              <label className="toggle-wrap"><input type="checkbox" checked={s.active} onChange={()=>toggleActive(s.id)}/><div className="toggle-track"><div className="toggle-thumb"/></div></label>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Dept",s.department,dc(s.department)],["Hotel",s.hotel,"var(--text2)"],["Shift",s.shift,"var(--text2)"],["Since",s.since,"var(--text3)"]].map(([l,v,c])=>(
                <div key={l}><div style={{fontFamily:"var(--mono)",fontSize:".58rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--text3)",marginBottom:2}}>{l}</div><div style={{fontFamily:"var(--sans)",fontSize:".78rem",fontWeight:500,color:c}}>{v}</div></div>
              ))}
            </div>
            <Divider/>
            <div style={{display:"flex",gap:6}}>
              <button className="btn-s" style={{flex:1,justifyContent:"center",fontSize:".72rem",padding:"5px"}} onClick={()=>toast("Email drafted","info")}><Ic n="mail" s={12}/>Email</button>
              <button className="btn-ic"><Ic n="edit" s={12}/></button>
              <button className="btn-ic" onClick={()=>toast("Staff removed","info")}><Ic n="trash" s={12} c="var(--red)"/></button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={newModal} onClose={()=>setNewModal(false)} title="Add Staff Member" maxWidth={480}
        footer={<><button className="btn-s" onClick={()=>setNewModal(false)}>Cancel</button><button className="btn-p" onClick={()=>{toast("Staff added","success");setNewModal(false);}}>Add</button></>}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <FormField label="Full Name" required><input className="inp" placeholder="Jane Smith"/></FormField>
          <FormField label="Email" required><input className="inp" type="email" placeholder="jane@Veloura.com"/></FormField>
          <FormField label="Hotel" required><select className="inp">{MOCK_HOTELS.map(h=><option key={h.id}>{h.name}</option>)}</select></FormField>
          <FormField label="Department"><select className="inp"><option>Front Desk</option><option>Housekeeping</option><option>Concierge</option><option>Restaurant</option><option>Maintenance</option><option>Spa</option></select></FormField>
          <FormField label="Position"><input className="inp" placeholder="Senior Concierge"/></FormField>
          <FormField label="Shift"><select className="inp"><option>Day</option><option>Morning</option><option>Evening</option><option>Night</option></select></FormField>
          <div style={{gridColumn:"1/-1"}}><FormField label="Role"><select className="inp"><option>staff</option><option>manager</option><option>admin</option></select></FormField></div>
        </div>
      </Modal>
    </div>
  );
};

// ── Database (Supabase) ───────────────────────────────────────────────────────
const DatabasePage = ({toast}) => {
  const [tab, setTab] = useState("schema");
  const [snippet, setSnippet] = useState("bookings");
  const [tested, setTested] = useState(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState("");

  const testConn = async () => {
    setTesting(true);
    try {
      const start = Date.now();
      const res = await adminAPI.health();
      const latency = Date.now() - start;
      setTested({ok:true, latency, rows: res.data || {status:"connected"}});
      toast(`Backend connected · ${latency}ms`,"success");
    } catch (err) {
      setTested({ok:false, error: err.message});
      toast("Connection failed: " + err.message,"error");
    } finally {
      setTesting(false);
    }
  };
  const copy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id); setTimeout(()=>setCopied(""),1800);
    toast("Copied!","info");
  };

  return (
    <div className="pg">
      <PageHeader title="Database — Supabase PostgreSQL" sub="Schema · Queries · Connection · Setup"/>
      <div className="card" style={{padding:"18px 20px",marginBottom:16,borderColor:"rgba(45,212,191,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:10,background:"var(--teal-dim)",border:"1px solid rgba(45,212,191,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="neon" s={20} c="var(--teal)"/></div>
            <div>
              <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)"}}>Neon Serverless PostgreSQL</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                <span className="dot dot-green" style={{animation:"pulse 2s ease-in-out infinite"}}/>
                <span style={{fontFamily:"var(--mono)",fontSize:".68rem",color:"var(--green)"}}>Connected · eu-central-1</span>
                {tested && <span style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)"}}>· {tested.latency}ms</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-s" onClick={()=>copy("postgresql://user:pass@ep-xxxxx.us-east-2.aws.neon.tech/Veloura?sslmode=require","conn")}><Ic n={copied==="conn"?"check":"copy"} s={12} c={copied==="conn"?"var(--green)":"currentColor"}/>{copied==="conn"?"Copied!":"Copy URL"}</button>
            <button className="btn-p" onClick={testConn} disabled={testing}>{testing?<><span style={{animation:"spin .8s linear infinite",display:"inline-block",marginRight:4}}>⟳</span>Testing…</>:<><Ic n="refresh" s={12}/>Test Connection</>}</button>
          </div>
        </div>
        <div style={{marginTop:14,display:"flex",gap:8,alignItems:"center"}}>
          <div style={{flex:1,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"9px 14px",fontFamily:"var(--mono)",fontSize:".72rem",color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            <span style={{color:"var(--teal)"}}>postgresql://</span><span style={{color:"var(--text2)"}}>user:••••••••@</span><span style={{color:"var(--gold)"}}>ep-xxxxx.us-east-2.aws.neon.tech</span><span style={{color:"var(--text2)"}}>/Veloura?sslmode=require</span>
          </div>
        </div>
        {tested && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:14}}>
            {Object.entries(tested.rows).map(([t,c])=>(
              <div key={t} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"10px 14px"}}><div style={{fontFamily:"var(--serif)",fontSize:"1.1rem",fontWeight:700,color:"var(--text)"}}>{c}</div><div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)",marginTop:3,textTransform:"uppercase",letterSpacing:".08em"}}>{t}</div></div>
            ))}
          </div>
        )}
      </div>
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:20}}>
        {[["schema","Schema SQL"],["queries","Query Examples"],["setup","Setup Guide"]].map(([id,l])=>(
          <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>
      {tab==="schema" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontFamily:"var(--mono)",fontSize:".68rem",color:"var(--text3)"}}>Veloura_schema.sql · 6 tables</span>
            <button className="btn-s" style={{fontSize:".75rem"}} onClick={()=>copy(SCHEMA_SQL.replace(/<[^>]+>/g,""),"schema")}><Ic n={copied==="schema"?"check":"copy"} s={12} c={copied==="schema"?"var(--green)":"currentColor"}/>{copied==="schema"?"Copied!":"Copy SQL"}</button>
          </div>
          <div className="sql" dangerouslySetInnerHTML={{__html:SCHEMA_SQL}}/>
        </div>
      )}
      {tab==="queries" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {Object.keys(API_SNIPPETS).map(k=>(
              <button key={k} onClick={()=>setSnippet(k)} style={{padding:"6px 14px",borderRadius:6,fontFamily:"var(--mono)",fontSize:".65rem",textTransform:"uppercase",border:"1px solid",background:snippet===k?"var(--gold)":"transparent",color:snippet===k?"#000":"var(--text3)",borderColor:snippet===k?"var(--gold)":"var(--border2)",cursor:"pointer",transition:"all .18s"}}>{k}</button>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <button className="btn-s" style={{fontSize:".75rem"}} onClick={()=>copy(API_SNIPPETS[snippet].replace(/<[^>]+>/g,""),"snip")}><Ic n={copied==="snip"?"check":"copy"} s={12} c={copied==="snip"?"var(--green)":"currentColor"}/>{copied==="snip"?"Copied!":"Copy Code"}</button>
          </div>
          <div className="sql" dangerouslySetInnerHTML={{__html:API_SNIPPETS[snippet]}}/>
        </div>
      )}
      {tab==="setup" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            ["01","Install Neon driver","npm install @neondatabase/serverless"],
            ["02","Add env var","DATABASE_URL=\"postgresql://user:pass@ep-xxx.neon.tech/Veloura?sslmode=require\""],
            ["03","Init client","import { neon } from '@neondatabase/serverless';\nconst sql = neon(process.env.DATABASE_URL);"],
            ["04","Run schema","Copy the Schema SQL tab → paste into Neon SQL Editor → Run"],
            ["05","Create API route (Next.js)","// app/api/bookings/route.ts\nexport async function GET() {\n  const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;\n  return Response.json(rows);\n}"],
            ["06","Fetch from frontend","const res = await fetch('/api/bookings');\nconst bookings = await res.json();"],
          ].map(([step,title,code])=>(
            <div key={step} className="card" style={{padding:"16px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:26,height:26,borderRadius:6,background:"var(--gold-dim)",border:"1px solid rgba(212,168,67,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--gold)",fontWeight:600,flexShrink:0}}>{step}</div>
                  <span style={{fontFamily:"var(--sans)",fontSize:".88rem",fontWeight:600,color:"var(--text)"}}>{title}</span>
                </div>
                <button className="btn-ic" onClick={()=>copy(code,step)} style={{flexShrink:0}}><Ic n={copied===step?"check":"copy"} s={11} c={copied===step?"var(--green)":"currentColor"}/></button>
              </div>
              <pre style={{fontFamily:"var(--mono)",fontSize:".73rem",color:"var(--text2)",background:"var(--surface)",padding:"10px 14px",borderRadius:6,border:"1px solid var(--border)",overflowX:"auto",lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{code}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Settings ──────────────────────────────────────────────────────────────────
const SettingsPage = ({toast}) => {
  const [sec, setSec] = useState("general");
  const save = () => toast("Settings saved","success");
  const sections = [{id:"general",label:"General",icon:"settings"},{id:"database",label:"Database",icon:"db"},{id:"payments",label:"Payments (Stripe)",icon:"dollar"},{id:"email",label:"Email (Resend)",icon:"mail"},{id:"security",label:"Security",icon:"lock"}];
  return (
    <div className="pg">
      <PageHeader title="Settings" sub="System · Neon · Stripe · Resend"/>
      <div style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:16}}>
        <div className="card" style={{padding:8,alignSelf:"start"}}>
          {sections.map(s=><button key={s.id} className={`nav-item ${sec===s.id?"active":""}`} onClick={()=>setSec(s.id)}><Ic n={s.icon} s={13} c={sec===s.id?"var(--gold)":"var(--text3)"}/>{s.label}</button>)}
        </div>
        <div className="card" style={{padding:"22px 24px"}}>
          {sec==="general" && (
            <div>
              <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:20}}>General Settings</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FormField label="Property Name"><input className="inp" defaultValue="The Meridian Grand"/></FormField>
                <FormField label="Currency"><select className="inp"><option>USD</option><option>EUR</option><option>GBP</option></select></FormField>
                <FormField label="Timezone"><select className="inp"><option>UTC+1 Europe/Paris</option><option>UTC America/New_York</option><option>UTC+9 Asia/Tokyo</option></select></FormField>
                <FormField label="Date Format"><select className="inp"><option>YYYY-MM-DD</option><option>DD/MM/YYYY</option></select></FormField>
                <FormField label="Check-In Time"><input className="inp" defaultValue="15:00"/></FormField>
                <FormField label="Check-Out Time"><input className="inp" defaultValue="11:00"/></FormField>
                <div style={{gridColumn:"1/-1"}}><FormField label="Cancellation Policy"><textarea className="inp" defaultValue="Free cancellation up to 48h before check-in. After that, 1 night charge applies."/></FormField></div>
              </div>
              {[["Guest Reviews","Allow guests to leave reviews after checkout"],["Loyalty Program","Enable points for returning guests"],["Auto-Confirm","Auto-confirm bookings from verified guests"]].map(([l,d])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:"1px solid var(--border)"}}>
                  <div><div style={{fontFamily:"var(--sans)",fontSize:".85rem",fontWeight:500,color:"var(--text)"}}>{l}</div><div style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)",marginTop:2}}>{d}</div></div>
                  <label className="toggle-wrap"><input type="checkbox" defaultChecked={l!=="Auto-Confirm"}/><div className="toggle-track"><div className="toggle-thumb"/></div></label>
                </div>
              ))}
            </div>
          )}
          {sec==="database" && (
            <div>
              <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:20}}>Neon Database</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <FormField label="Database URL" required><input className="inp" type="password" defaultValue="postgresql://user:pass@ep-xxxxx.neon.tech/Veloura?sslmode=require"/></FormField>
                <FormField label="Pool Size"><input className="inp" type="number" defaultValue={10}/></FormField>
                <FormField label="Query Timeout (ms)"><input className="inp" type="number" defaultValue={5000}/></FormField>
                <div style={{padding:"12px 14px",background:"var(--teal-dim)",border:"1px solid rgba(45,212,191,.2)",borderRadius:8,fontFamily:"var(--mono)",fontSize:".72rem",color:"var(--teal)"}}>Neon is serverless HTTP-based — works in Edge & Lambda with zero cold-start latency.</div>
                <pre style={{fontFamily:"var(--mono)",fontSize:".75rem",color:"var(--gold)",background:"var(--surface)",padding:"10px 14px",borderRadius:6,border:"1px solid var(--border)"}}>npm install @neondatabase/serverless</pre>
              </div>
            </div>
          )}
          {sec==="payments" && (
            <div>
              <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:20}}>Stripe Configuration</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <FormField label="Publishable Key"><input className="inp" defaultValue="pk_live_•••••••••••••••••••••"/></FormField>
                <FormField label="Secret Key"><input className="inp" type="password" defaultValue="sk_live_•••••••••••••••••••••"/></FormField>
                <FormField label="Webhook Secret"><input className="inp" type="password" defaultValue="whsec_••••••••••••••••••••••"/></FormField>
                <FormField label="Webhook URL"><div style={{display:"flex",gap:8}}><input className="inp" readOnly value="https://yourapp.com/api/webhooks/stripe"/><button className="btn-ic"><Ic n="copy" s={12}/></button></div></FormField>
                <FormField label="Capture Mode"><select className="inp"><option>Automatic</option><option>Manual</option></select></FormField>
              </div>
            </div>
          )}
          {sec==="email" && (
            <div>
              <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:20}}>Email — Resend</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <FormField label="Resend API Key"><input className="inp" type="password" defaultValue="re_••••••••••••••••••••••••••••••"/></FormField>
                <FormField label="From Address"><input className="inp" defaultValue="reservations@Veloura.com"/></FormField>
                <FormField label="Reply-To"><input className="inp" defaultValue="concierge@Veloura.com"/></FormField>
                <pre style={{fontFamily:"var(--mono)",fontSize:".75rem",color:"var(--gold)",background:"var(--surface)",padding:"10px 14px",borderRadius:6,border:"1px solid var(--border)"}}>npm install resend</pre>
                <Divider/>
                <div style={{fontFamily:"var(--sans)",fontSize:".85rem",fontWeight:600,color:"var(--text)",marginBottom:10}}>Automated Emails</div>
                {[["Booking Confirmation","On payment"],["Pre-Arrival Reminder","3 days before"],["Check-In Instructions","Day of arrival"],["Post-Stay Review","24h after checkout"],["Cancellation Notice","On cancel"]].map(([l,d])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                    <div><div style={{fontFamily:"var(--sans)",fontSize:".83rem",fontWeight:500,color:"var(--text)"}}>{l}</div><div style={{fontFamily:"var(--mono)",fontSize:".63rem",color:"var(--text3)",marginTop:2}}>{d}</div></div>
                    <label className="toggle-wrap"><input type="checkbox" defaultChecked/><div className="toggle-track"><div className="toggle-thumb"/></div></label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sec==="security" && (
            <div>
              <div style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:20}}>Security</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <FormField label="JWT Secret"><input className="inp" type="password" defaultValue="••••••••••••••••••••••••••••••••••••"/></FormField>
                <FormField label="Session Duration (hours)"><input className="inp" type="number" defaultValue={24}/></FormField>
                <FormField label="Allowed Origins (CORS)"><textarea className="inp" defaultValue="https://Veloura.com&#10;https://admin.Veloura.com" style={{minHeight:60}}/></FormField>
                <Divider/>
                {[["Two-Factor Auth","Require 2FA for admin accounts"],["Rate Limiting","100 req/min per IP"],["Audit Logging","Log all admin actions to DB"]].map(([l,d])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                    <div><div style={{fontFamily:"var(--sans)",fontSize:".85rem",fontWeight:500,color:"var(--text)"}}>{l}</div><div style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--text3)",marginTop:2}}>{d}</div></div>
                    <label className="toggle-wrap"><input type="checkbox" defaultChecked/><div className="toggle-track"><div className="toggle-thumb"/></div></label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{marginTop:24,display:"flex",justifyContent:"flex-end"}}>
            <button className="btn-p" onClick={save}><Ic n="check" s={13} c="#000"/>Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── App Root ──────────────────────────────────────────────────────────────────
export default function HotelAdminApp() {
  const [page, setPage] = useState("dashboard");
  const [toasts, addToast] = useToast();
  const [notifOpen, setNotifOpen] = useState(false);
  const NOTIFS = [
    {id:1,msg:"New booking · The Meridian Grand",time:"2m ago",dot:"dot-green"},
    {id:2,msg:"Room 301 maintenance request",time:"18m ago",dot:"dot-gold"},
    {id:3,msg:"Payment failed · booking #BF2A190",time:"1h ago",dot:"dot-red"},
    {id:4,msg:"Alexandra Chen checked in",time:"2h ago",dot:"dot-blue"},
    {id:5,msg:"Monthly revenue report ready",time:"4h ago",dot:"dot-green"},
  ];
  const renderPage = () => {
    const props = {toast:addToast};
    switch(page) {
      case "dashboard": return <DashboardPage {...props}/>;
      case "bookings":  return <BookingsPage {...props}/>;
      case "rooms":     return <RoomsPage {...props}/>;
      case "guests":    return <GuestsPage {...props}/>;
      case "revenue":   return <RevenuePage {...props}/>;
      case "calendar":  return <CalendarPage {...props}/>;
      case "staff":     return <StaffPage {...props}/>;
      case "database":  return <DatabasePage {...props}/>;
      case "settings":  return <SettingsPage {...props}/>;
      default:          return <DashboardPage {...props}/>;
    }
  };
  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
      <Toasts items={toasts}/>
      <Sidebar page={page} setPage={setPage}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{height:52,background:"var(--surface)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {NAV.find(n=>n.id===page) && <Ic n={NAV.find(n=>n.id===page).icon} s={14} c="var(--text3)"/>}
            <span style={{fontFamily:"var(--mono)",fontSize:".72rem",color:"var(--text3)",letterSpacing:".06em"}}>{NAV.find(n=>n.id===page)?.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative"}}>
              <button className="btn-ic" onClick={()=>setNotifOpen(!notifOpen)}>
                <Ic n="bell" s={14}/>
                <div style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:"var(--red)",border:"1.5px solid var(--surface)"}}/>
              </button>
              {notifOpen && (
                <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,width:300,boxShadow:"0 20px 50px rgba(0,0,0,.5)",zIndex:200,animation:"scaleIn .2s var(--ease)"}}>
                  <div style={{padding:"12px 16px 10px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"var(--serif)",fontSize:".88rem",fontWeight:700,color:"var(--text)"}}>Notifications</span><button style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--text3)",background:"none",border:"none",cursor:"pointer"}} onClick={()=>setNotifOpen(false)}>Mark all read</button></div>
                  {NOTIFS.map((n,i)=>(
                    <div key={n.id} style={{display:"flex",gap:10,padding:"11px 16px",borderBottom:i<4?"1px solid var(--border)":"none",cursor:"pointer",transition:"background .12s"}} onMouseEnter={e=>e.currentTarget.style.background="var(--raised)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <div className={`dot ${n.dot}`} style={{marginTop:5,flexShrink:0}}/>
                      <div style={{flex:1}}><div style={{fontFamily:"var(--sans)",fontSize:".8rem",color:"var(--text2)",lineHeight:1.4}}>{n.msg}</div><div style={{fontFamily:"var(--mono)",fontSize:".63rem",color:"var(--text3)",marginTop:3}}>{n.time}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{width:1,height:20,background:"var(--border)"}}/>
            <span style={{fontFamily:"var(--mono)",fontSize:".68rem",color:"var(--text3)"}}>v1.0 · Supabase ●</span>
          </div>
        </div>
        <main style={{flex:1,overflowY:"auto",padding:"24px 26px"}} key={page}>{renderPage()}</main>
      </div>
    </div>
  );
}
