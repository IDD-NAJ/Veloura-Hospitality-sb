/**
 * Veloura — Hotel Operations Backend
 * ─────────────────────────────────────────────────────────────────────────────
 * Integrations:
 *   Database      → Supabase
 *   Hotel PMS     → Cloudbeds API
 *   Channel Mgr   → SiteMinder API
 *   Payments      → Stripe
 *   SMS/WhatsApp  → Twilio
 *   Email         → SendGrid
 *   Auth          → Clerk
 *   Maps          → Google Maps Platform
 * ─────────────────────────────────────────────────────────────────────────────
 * ENV VARS REQUIRED:
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 *   VITE_CLERK_PUBLISHABLE_KEY
 *   VITE_STRIPE_PUBLISHABLE_KEY
 *   VITE_GOOGLE_MAPS_API_KEY
 *   VITE_CLOUDBEDS_CLIENT_ID, VITE_CLOUDBEDS_CLIENT_SECRET
 *   VITE_SITEMINDER_API_KEY
 *   (Twilio + SendGrid run server-side only — proxy via Supabase Edge Functions)
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { ClerkProvider, useAuth, useUser, SignIn, SignUp, UserButton } from "@clerk/clerk-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// ════════════════════════════════════════════════════════════════════════════
//  FONT + GLOBAL CSS  (matches frontend Veloura theme)
// ════════════════════════════════════════════════════════════════════════════
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap";
document.head.appendChild(fl);

const gs = document.createElement("style");
gs.textContent = `
  :root {
    --ink:#0C0D0F; --navy:#0F1923; --deep:#162234; --ocean:#1A3352;
    --slate:#2A4A6B; --steel:#3A6491;
    --gold:#C9A84C; --gold-lt:#E8C97A; --gold-dk:#A07828;
    --sand:#F4EFE4; --linen:#EDE7D9; --parchment:#E5DCCB;
    --white:#FDFCFA; --fog:#9BA8B5; --mist:#BDC8D4;
    --emerald:#1A6B4A; --ruby:#8B1C1C; --amber:#B45309;
    --sidebar:220px;
    --serif:'Cormorant',Georgia,serif;
    --sans:'Jost',sans-serif;
    --mono:'DM Mono',monospace;
    --ease:cubic-bezier(0.16,1,0.3,1);
    --r:8px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;font-family:var(--sans);background:#0D1117;color:var(--sand);overflow-x:hidden;}
  ::selection{background:var(--gold);color:var(--ink);}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:var(--navy);}
  ::-webkit-scrollbar-thumb{background:var(--slate);border-radius:4px;}

  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  @keyframes goldShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes statusPing{0%{transform:scale(1);opacity:1}100%{transform:scale(2.4);opacity:0}}

  .admin-layout{display:flex;min-height:100vh;background:#0D1117;}
  .sidebar{width:var(--sidebar);background:var(--navy);border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;position:fixed;height:100vh;left:0;top:0;z-index:100;transition:width .3s var(--ease);}
  .sidebar-logo{padding:28px 20px 22px;border-bottom:1px solid rgba(255,255,255,.06);}
  .sidebar-nav{flex:1;padding:16px 10px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;}
  .nav-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--r);cursor:pointer;font-size:.85rem;font-weight:500;color:rgba(255,255,255,.55);transition:all .2s;border:none;background:none;width:100%;text-align:left;white-space:nowrap;}
  .nav-item:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.85);}
  .nav-item.active{background:rgba(201,168,76,.12);color:var(--gold-lt);}
  .nav-item .nav-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);flex-shrink:0;opacity:0;transition:opacity .2s;}
  .nav-item.active .nav-dot{opacity:1;}
  .nav-section-label{font-family:var(--mono);font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.2);padding:16px 14px 6px;}
  .main-content{margin-left:var(--sidebar);flex:1;display:flex;flex-direction:column;min-height:100vh;}
  .topbar{background:rgba(13,17,23,.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
  .page-body{padding:28px;flex:1;}

  /* Cards */
  .card{background:var(--deep);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;}
  .card-header{padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;}
  .card-body{padding:22px;}

  /* Stats */
  .stat-card{background:var(--deep);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:22px;transition:all .3s var(--ease);}
  .stat-card:hover{border-color:rgba(201,168,76,.2);transform:translateY(-2px);}
  .stat-value{font-family:var(--serif);font-size:2.4rem;font-weight:400;color:var(--sand);line-height:1;}
  .stat-label{font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--fog);margin-top:8px;}
  .stat-delta{font-family:var(--mono);font-size:.72rem;margin-top:10px;}
  .stat-delta.up{color:var(--emerald);}
  .stat-delta.down{color:var(--ruby);}

  /* Table */
  .data-table{width:100%;border-collapse:collapse;}
  .data-table th{font-family:var(--mono);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--fog);padding:12px 16px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap;}
  .data-table td{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.88rem;color:rgba(255,255,255,.8);}
  .data-table tr:last-child td{border-bottom:none;}
  .data-table tr:hover td{background:rgba(255,255,255,.02);}

  /* Badges */
  .badge{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:.63rem;letter-spacing:.07em;text-transform:uppercase;padding:4px 10px;border-radius:20px;}
  .badge-confirmed{background:rgba(26,107,74,.2);color:#4ADE80;border:1px solid rgba(74,222,128,.15);}
  .badge-pending{background:rgba(180,83,9,.2);color:#FCD34D;border:1px solid rgba(252,211,77,.15);}
  .badge-cancelled{background:rgba(139,28,28,.2);color:#FCA5A5;border:1px solid rgba(252,165,165,.15);}
  .badge-checked-in{background:rgba(59,100,145,.2);color:#93C5FD;border:1px solid rgba(147,197,253,.15);}
  .badge-gold{background:rgba(201,168,76,.15);color:var(--gold-lt);border:1px solid rgba(201,168,76,.2);}
  .badge-gray{background:rgba(155,168,181,.1);color:var(--fog);border:1px solid rgba(155,168,181,.15);}

  /* Buttons */
  .btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--sans);font-weight:500;font-size:.83rem;padding:9px 18px;border-radius:var(--r);cursor:pointer;transition:all .2s;border:none;letter-spacing:.02em;}
  .btn-primary{background:linear-gradient(135deg,var(--gold),var(--gold-lt));color:var(--ink);}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,168,76,.35);}
  .btn-secondary{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.1);}
  .btn-secondary:hover{background:rgba(255,255,255,.12);}
  .btn-danger{background:rgba(139,28,28,.3);color:#FCA5A5;border:1px solid rgba(252,165,165,.2);}
  .btn-danger:hover{background:rgba(139,28,28,.5);}
  .btn-sm{padding:6px 12px;font-size:.78rem;}
  .btn-icon{padding:8px;border-radius:var(--r);}
  .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}

  /* Forms */
  .field{display:flex;flex-direction:column;gap:6px;}
  .field label{font-family:var(--mono);font-size:.63rem;letter-spacing:.1em;text-transform:uppercase;color:var(--fog);}
  .field input,.field select,.field textarea{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:var(--r);padding:10px 14px;font-family:var(--sans);font-size:.88rem;color:var(--sand);outline:none;transition:border-color .2s,box-shadow .2s;}
  .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1);}
  .field input::placeholder{color:rgba(255,255,255,.2);}
  .field select{cursor:pointer;-webkit-appearance:none;}
  .field select option{background:var(--navy);}

  /* Status dot */
  .status-dot{position:relative;display:inline-block;width:8px;height:8px;border-radius:50%;}
  .status-dot::after{content:'';position:absolute;inset:0;border-radius:50%;animation:statusPing 1.8s ease-out infinite;}
  .status-dot.online{background:#4ADE80;}.status-dot.online::after{background:#4ADE80;}
  .status-dot.offline{background:#F87171;}.status-dot.offline::after{background:#F87171;}
  .status-dot.warning{background:#FCD34D;}.status-dot.warning::after{background:#FCD34D;}

  /* Integration status pill */
  .int-pill{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:12px 16px;transition:all .2s;}
  .int-pill:hover{border-color:rgba(255,255,255,.12);}

  /* Toast */
  .toast-container{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;}
  .toast{background:var(--deep);color:var(--sand);padding:14px 18px;border-radius:12px;font-size:.85rem;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.5);animation:fadeUp .35s var(--ease);border-left:3px solid var(--gold);min-width:280px;}
  .toast.error{border-left-color:#F87171;}
  .toast.success{border-left-color:#4ADE80;}

  /* Tabs */
  .tab-bar{display:flex;gap:2px;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:24px;}
  .tab-btn{font-family:var(--sans);font-size:.85rem;font-weight:500;padding:10px 18px;border:none;background:none;cursor:pointer;color:var(--fog);transition:all .2s;border-bottom:2px solid transparent;margin-bottom:-1px;}
  .tab-btn:hover{color:rgba(255,255,255,.8);}
  .tab-btn.active{color:var(--gold-lt);border-bottom-color:var(--gold);}

  /* Divider */
  .divider{height:1px;background:rgba(255,255,255,.06);margin:20px 0;}

  /* Shimmer skeleton */
  .skeleton{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:400px 100%;animation:shimmer 1.6s infinite;border-radius:6px;}

  /* Modal */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:800;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;backdrop-filter:blur(6px);}
  .modal{background:var(--deep);border:1px solid rgba(255,255,255,.1);border-radius:18px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;animation:scaleIn .3s var(--ease);}
  .modal-header{padding:22px 24px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;}
  .modal-body{padding:24px;}
  .modal-footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,.07);display:flex;justify-content:flex-end;gap:10px;}

  /* Stripe card element */
  .stripe-card-wrapper{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:var(--r);padding:14px 16px;transition:border-color .2s;}
  .stripe-card-wrapper:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1);}

  /* Google Maps embed */
  .map-container{border-radius:14px;overflow:hidden;background:var(--ocean);position:relative;}
  .map-container iframe{display:block;}

  /* Channel sync */
  .channel-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05);}
  .channel-row:last-child{border-bottom:none;}

  /* Occupancy bar */
  .occ-bar{height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden;}
  .occ-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold),var(--gold-lt));transition:width .8s var(--ease);}

  /* Timeline */
  .timeline{display:flex;flex-direction:column;gap:0;}
  .timeline-item{display:flex;gap:16px;padding:14px 0;border-left:2px solid rgba(255,255,255,.08);padding-left:20px;margin-left:8px;position:relative;}
  .timeline-item::before{content:'';position:absolute;left:-5px;top:18px;width:8px;height:8px;border-radius:50%;background:var(--slate);border:2px solid var(--deep);}
  .timeline-item.gold::before{background:var(--gold);}

  /* WhatsApp / SMS toggle */
  .channel-toggle{display:flex;background:rgba(255,255,255,.05);border-radius:8px;padding:3px;}
  .channel-toggle button{padding:5px 14px;border:none;border-radius:6px;font-family:var(--mono);font-size:.68rem;cursor:pointer;transition:all .2s;background:none;color:var(--fog);}
  .channel-toggle button.active{background:rgba(201,168,76,.2);color:var(--gold-lt);}

  /* Revenue chart bars */
  .rev-bar-wrap{display:flex;align-items:flex-end;gap:6px;height:80px;}
  .rev-bar{flex:1;border-radius:4px 4px 0 0;background:linear-gradient(to top,var(--gold-dk),var(--gold));transition:height .6s var(--ease);min-width:0;opacity:.85;}
  .rev-bar:hover{opacity:1;}

  /* Clerk override */
  .cl-rootBox,.cl-card{background:transparent!important;}

  @media(max-width:900px){
    .sidebar{width:64px;}
    .main-content{margin-left:64px;}
    .nav-item span,.nav-section-label,.sidebar-wordmark{display:none;}
    .nav-item{justify-content:center;padding:10px;}
  }
`;
document.head.appendChild(gs);

// ════════════════════════════════════════════════════════════════════════════
//  CONFIG
// ════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  supabase: {
    url:     import.meta.env.VITE_SUPABASE_URL     || "https://YOUR_PROJECT.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_ANON_KEY",
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YOUR_CLERK_KEY",
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_YOUR_STRIPE_KEY",
  },
  cloudbeds: {
    baseUrl:      "https://hotels.cloudbeds.com/api/v1.2",
    clientId:     import.meta.env.VITE_CLOUDBEDS_CLIENT_ID     || "YOUR_CB_CLIENT_ID",
    clientSecret: import.meta.env.VITE_CLOUDBEDS_CLIENT_SECRET  || "YOUR_CB_CLIENT_SECRET",
    propertyId:   import.meta.env.VITE_CLOUDBEDS_PROPERTY_ID    || "YOUR_PROPERTY_ID",
  },
  siteminder: {
    baseUrl: "https://connect.siteminder.com/v1",
    apiKey:  import.meta.env.VITE_SITEMINDER_API_KEY || "YOUR_SM_API_KEY",
  },
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GMAPS_API_KEY",
  },
  // Twilio + SendGrid: server-side only — proxy via Supabase Edge Functions
  twilio: {
    edgeFnUrl: "/functions/v1/twilio-send",
  },
  sendgrid: {
    edgeFnUrl: "/functions/v1/sendgrid-send",
  },
};

// ════════════════════════════════════════════════════════════════════════════
//  SUPABASE CLIENT
// ════════════════════════════════════════════════════════════════════════════
export const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  realtime: { params: { eventsPerSecond: 10 } },
});

/**
 * DATABASE SCHEMA (run in Supabase SQL editor):
 *
 * -- Reservations
 * create table reservations (
 *   id uuid primary key default gen_random_uuid(),
 *   cloudbeds_reservation_id text unique,
 *   guest_id uuid references guests(id),
 *   room_id uuid references rooms(id),
 *   check_in date not null,
 *   check_out date not null,
 *   status text default 'confirmed',   -- confirmed | checked_in | checked_out | cancelled
 *   total_amount numeric(10,2),
 *   currency text default 'USD',
 *   source text,                        -- direct | booking.com | expedia | airbnb
 *   stripe_payment_intent_id text,
 *   notes text,
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now()
 * );
 *
 * -- Guests
 * create table guests (
 *   id uuid primary key default gen_random_uuid(),
 *   clerk_user_id text unique,
 *   name text,
 *   email text unique,
 *   phone text,
 *   country text,
 *   loyalty_tier text default 'standard',  -- standard | silver | gold | platinum
 *   total_stays integer default 0,
 *   created_at timestamptz default now()
 * );
 *
 * -- Rooms
 * create table rooms (
 *   id uuid primary key default gen_random_uuid(),
 *   cloudbeds_room_id text unique,
 *   name text,
 *   type text,
 *   floor integer,
 *   capacity integer default 2,
 *   base_rate numeric(10,2),
 *   status text default 'available',  -- available | occupied | maintenance | blocked
 *   amenities jsonb default '[]',
 *   created_at timestamptz default now()
 * );
 *
 * -- Payments
 * create table payments (
 *   id uuid primary key default gen_random_uuid(),
 *   reservation_id uuid references reservations(id),
 *   stripe_payment_intent_id text unique,
 *   amount numeric(10,2),
 *   currency text default 'USD',
 *   status text,   -- requires_payment_method | processing | succeeded | canceled
 *   method text,   -- card | bank_transfer | cash
 *   created_at timestamptz default now()
 * );
 *
 * -- Messages log
 * create table message_log (
 *   id uuid primary key default gen_random_uuid(),
 *   guest_id uuid references guests(id),
 *   channel text,  -- sms | whatsapp | email
 *   direction text default 'outbound',
 *   subject text,
 *   body text,
 *   status text,
 *   provider_id text,
 *   created_at timestamptz default now()
 * );
 *
 * -- Channel sync log
 * create table channel_sync_log (
 *   id uuid primary key default gen_random_uuid(),
 *   channel text,  -- booking.com | expedia | airbnb | direct
 *   event_type text,
 *   reservation_id uuid references reservations(id),
 *   raw_payload jsonb,
 *   synced_at timestamptz default now()
 * );
 *
 * -- Enable RLS
 * alter table reservations enable row level security;
 * alter table guests enable row level security;
 * alter table rooms enable row level security;
 * alter table payments enable row level security;
 * alter table message_log enable row level security;
 *
 * -- Realtime
 * alter publication supabase_realtime add table reservations;
 * alter publication supabase_realtime add table rooms;
 */

// ── Supabase DB helpers ────────────────────────────────────────────────────
export const db = {
  // Reservations
  reservations: {
    list: (filters = {}) => {
      let q = supabase.from("reservations")
        .select("*, guests(*), rooms(*), payments(*)")
        .order("check_in", { ascending: true });
      if (filters.status)    q = q.eq("status", filters.status);
      if (filters.checkIn)   q = q.gte("check_in", filters.checkIn);
      if (filters.checkOut)  q = q.lte("check_out", filters.checkOut);
      if (filters.guestId)   q = q.eq("guest_id", filters.guestId);
      return q;
    },
    get:    (id)     => supabase.from("reservations").select("*, guests(*), rooms(*), payments(*)").eq("id", id).single(),
    create: (data)   => supabase.from("reservations").insert(data).select().single(),
    update: (id, d)  => supabase.from("reservations").update({ ...d, updated_at: new Date().toISOString() }).eq("id", id).select().single(),
    delete: (id)     => supabase.from("reservations").delete().eq("id", id),
  },
  // Guests
  guests: {
    list:    (search) => {
      let q = supabase.from("guests").select("*").order("created_at", { ascending: false });
      if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      return q;
    },
    get:     (id)    => supabase.from("guests").select("*, reservations(*)").eq("id", id).single(),
    byEmail: (email) => supabase.from("guests").select("*").eq("email", email).single(),
    upsert:  (data)  => supabase.from("guests").upsert(data, { onConflict: "email" }).select().single(),
    update:  (id,d)  => supabase.from("guests").update(d).eq("id", id).select().single(),
  },
  // Rooms
  rooms: {
    list:    (status) => {
      let q = supabase.from("rooms").select("*").order("floor").order("name");
      if (status) q = q.eq("status", status);
      return q;
    },
    get:     (id)    => supabase.from("rooms").select("*").eq("id", id).single(),
    update:  (id,d)  => supabase.from("rooms").update(d).eq("id", id).select().single(),
    availability: (checkIn, checkOut) =>
      supabase.rpc("get_available_rooms", { p_check_in: checkIn, p_check_out: checkOut }),
  },
  // Payments
  payments: {
    list:         ()    => supabase.from("payments").select("*, reservations(*, guests(*))").order("created_at", { ascending: false }),
    byReservation:(id)  => supabase.from("payments").select("*").eq("reservation_id", id),
    create:       (d)   => supabase.from("payments").insert(d).select().single(),
    update:       (id,d)=> supabase.from("payments").update(d).eq("id", id).select().single(),
  },
  // Messages
  messages: {
    log:  (d)   => supabase.from("message_log").insert(d).select().single(),
    list: (gid) => supabase.from("message_log").select("*").eq("guest_id", gid).order("created_at", { ascending: false }),
  },
  // Stats RPC (create this as a Postgres function)
  stats: () => supabase.rpc("get_dashboard_stats"),
};

// Realtime subscription helper
export const subscribeReservations = (callback) => {
  const sub = supabase
    .channel("reservations-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, callback)
    .subscribe();
  return () => supabase.removeChannel(sub);
};

// ════════════════════════════════════════════════════════════════════════════
//  CLOUDBEDS API SERVICE
// ════════════════════════════════════════════════════════════════════════════
class CloudbedsService {
  constructor() {
    this.base     = CONFIG.cloudbeds.baseUrl;
    this.propId   = CONFIG.cloudbeds.propertyId;
    this._token   = null;
    this._tokenTs = 0;
  }

  async _getToken() {
    // Access token expires in 3600s — refresh proactively
    if (this._token && Date.now() - this._tokenTs < 3_500_000) return this._token;
    const r = await fetch("https://hotels.cloudbeds.com/api/v1.2/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     CONFIG.cloudbeds.clientId,
        client_secret: CONFIG.cloudbeds.clientSecret,
      }),
    });
    const data = await r.json();
    this._token   = data.access_token;
    this._tokenTs = Date.now();
    return this._token;
  }

  async _fetch(path, opts = {}) {
    const token = await this._getToken();
    const url   = `${this.base}${path}`;
    const res   = await fetch(url, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`Cloudbeds ${path} → ${res.status}`);
    return res.json();
  }

  // ── Reservations ──
  getReservations(params = {}) {
    const qs = new URLSearchParams({ propertyID: this.propId, ...params }).toString();
    return this._fetch(`/getReservations?${qs}`);
  }

  getReservation(id) {
    return this._fetch(`/getReservation?propertyID=${this.propId}&reservationID=${id}`);
  }

  createReservation(payload) {
    return this._fetch("/postReservation", {
      method: "POST",
      body:   JSON.stringify({ propertyID: this.propId, ...payload }),
    });
  }

  updateReservation(id, payload) {
    return this._fetch("/putReservation", {
      method: "PUT",
      body:   JSON.stringify({ propertyID: this.propId, reservationID: id, ...payload }),
    });
  }

  cancelReservation(id, reason = "") {
    return this._fetch("/deleteReservation", {
      method: "DELETE",
      body:   JSON.stringify({ propertyID: this.propId, reservationID: id, reason }),
    });
  }

  // ── Check-in / Check-out ──
  checkIn(reservationId) {
    return this._fetch("/postCheckIn", {
      method: "POST",
      body:   JSON.stringify({ propertyID: this.propId, reservationID: reservationId }),
    });
  }

  checkOut(reservationId) {
    return this._fetch("/postCheckOut", {
      method: "POST",
      body:   JSON.stringify({ propertyID: this.propId, reservationID: reservationId }),
    });
  }

  // ── Rooms ──
  getRooms() {
    return this._fetch(`/getRooms?propertyID=${this.propId}`);
  }

  getRoomAvailability(startDate, endDate) {
    return this._fetch(
      `/getRoomAvailability?propertyID=${this.propId}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  updateRoomStatus(roomId, status) {
    return this._fetch("/putRoomStatus", {
      method: "PUT",
      body:   JSON.stringify({ propertyID: this.propId, roomID: roomId, status }),
    });
  }

  // ── Guests ──
  getGuest(guestId) {
    return this._fetch(`/getGuest?propertyID=${this.propId}&guestID=${guestId}`);
  }

  createGuest(payload) {
    return this._fetch("/postGuest", {
      method: "POST",
      body:   JSON.stringify({ propertyID: this.propId, ...payload }),
    });
  }

  // ── Rates ──
  getRates(startDate, endDate) {
    return this._fetch(
      `/getRatePlans?propertyID=${this.propId}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  updateRate(rateId, amount, dates) {
    return this._fetch("/putRoomRate", {
      method: "PUT",
      body:   JSON.stringify({ propertyID: this.propId, rateID: rateId, amount, dates }),
    });
  }

  // ── Housekeeping ──
  getHousekeeping() {
    return this._fetch(`/getHousekeepingStatus?propertyID=${this.propId}`);
  }

  updateHousekeeping(roomId, status) {
    return this._fetch("/putHousekeepingStatus", {
      method: "PUT",
      body:   JSON.stringify({ propertyID: this.propId, roomID: roomId, status }),
    });
  }

  // ── Reports ──
  getOccupancyReport(startDate, endDate) {
    return this._fetch(
      `/getOccupancyReport?propertyID=${this.propId}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  getRevenueReport(startDate, endDate) {
    return this._fetch(
      `/getRevenueReport?propertyID=${this.propId}&startDate=${startDate}&endDate=${endDate}`
    );
  }
}

export const cloudbeds = new CloudbedsService();

// ════════════════════════════════════════════════════════════════════════════
//  SITEMINDER API SERVICE  (Channel Manager / OTA Sync)
// ════════════════════════════════════════════════════════════════════════════
class SiteMinderService {
  constructor() {
    this.base    = CONFIG.siteminder.baseUrl;
    this.headers = {
      Authorization:  `Bearer ${CONFIG.siteminder.apiKey}`,
      "Content-Type": "application/json",
      Accept:         "application/json",
    };
  }

  async _fetch(path, opts = {}) {
    const res = await fetch(`${this.base}${path}`, {
      ...opts,
      headers: { ...this.headers, ...(opts.headers || {}) },
    });
    if (!res.ok) throw new Error(`SiteMinder ${path} → ${res.status}`);
    return res.json();
  }

  // ── Inventory ──
  getInventory(propertyId, startDate, endDate) {
    return this._fetch(`/properties/${propertyId}/inventory?from=${startDate}&to=${endDate}`);
  }

  updateInventory(propertyId, roomTypeId, dates, availability) {
    return this._fetch(`/properties/${propertyId}/inventory`, {
      method: "PUT",
      body: JSON.stringify({ room_type_id: roomTypeId, dates, availability }),
    });
  }

  // ── Rates ──
  getRates(propertyId, ratePlanId, startDate, endDate) {
    return this._fetch(
      `/properties/${propertyId}/rates/${ratePlanId}?from=${startDate}&to=${endDate}`
    );
  }

  updateRates(propertyId, ratePlanId, rates) {
    return this._fetch(`/properties/${propertyId}/rates/${ratePlanId}`, {
      method: "PUT",
      body: JSON.stringify({ rates }),
    });
  }

  // ── Restrictions ──
  updateRestrictions(propertyId, roomTypeId, restrictions) {
    // restrictions: { min_stay, max_stay, closed_to_arrival, closed_to_departure }
    return this._fetch(`/properties/${propertyId}/restrictions`, {
      method: "PUT",
      body: JSON.stringify({ room_type_id: roomTypeId, ...restrictions }),
    });
  }

  // ── Reservations from OTAs ──
  getReservations(propertyId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this._fetch(`/properties/${propertyId}/reservations?${qs}`);
  }

  // ── Channels ──
  getChannels(propertyId) {
    return this._fetch(`/properties/${propertyId}/channels`);
  }

  toggleChannel(propertyId, channelId, enabled) {
    return this._fetch(`/properties/${propertyId}/channels/${channelId}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  }

  // ── Bulk sync (push ARI to all channels) ──
  pushARI(propertyId, payload) {
    // ARI = Availability, Rates, and Inventory
    return this._fetch(`/properties/${propertyId}/ari`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const siteminder = new SiteMinderService();

// ════════════════════════════════════════════════════════════════════════════
//  STRIPE SERVICE
// ════════════════════════════════════════════════════════════════════════════
export const stripePromise = loadStripe(CONFIG.stripe.publishableKey);

export const StripeService = {
  /**
   * Create a PaymentIntent via your Supabase Edge Function
   * Edge Function: supabase/functions/create-payment-intent/index.ts
   */
  async createPaymentIntent(reservationId, amount, currency = "usd", metadata = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${CONFIG.supabase.url}/functions/v1/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ reservationId, amount, currency, metadata }),
    });
    if (!res.ok) throw new Error("Failed to create PaymentIntent");
    return res.json(); // { clientSecret, paymentIntentId }
  },

  /**
   * Retrieve payment status
   */
  async getPaymentStatus(paymentIntentId) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${CONFIG.supabase.url}/functions/v1/stripe-payment-status?id=${paymentIntentId}`,
      { headers: { Authorization: `Bearer ${session?.access_token}` } }
    );
    return res.json();
  },

  /**
   * Issue a refund
   */
  async refund(paymentIntentId, amount, reason = "requested_by_customer") {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${CONFIG.supabase.url}/functions/v1/stripe-refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ paymentIntentId, amount, reason }),
    });
    return res.json();
  },
};

/**
 * Stripe Edge Function boilerplate (supabase/functions/create-payment-intent/index.ts):
 *
 * import Stripe from "https://esm.sh/stripe@14";
 * const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
 *
 * Deno.serve(async (req) => {
 *   const { reservationId, amount, currency, metadata } = await req.json();
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount: Math.round(amount * 100),
 *     currency,
 *     metadata: { reservationId, ...metadata },
 *     automatic_payment_methods: { enabled: true },
 *   });
 *   return new Response(
 *     JSON.stringify({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }),
 *     { headers: { "Content-Type": "application/json" } }
 *   );
 * });
 */

// ════════════════════════════════════════════════════════════════════════════
//  TWILIO SERVICE  (SMS + WhatsApp — via Supabase Edge Function)
// ════════════════════════════════════════════════════════════════════════════
export const TwilioService = {
  async send({ to, body, channel = "sms", guestId, reservationId }) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${CONFIG.supabase.url}${CONFIG.twilio.edgeFnUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ to, body, channel }), // channel: 'sms' | 'whatsapp'
    });
    const result = await res.json();
    if (result.sid) {
      // Log to Supabase
      await db.messages.log({
        guest_id:    guestId,
        channel,
        direction:   "outbound",
        body,
        status:      "sent",
        provider_id: result.sid,
      });
    }
    return result;
  },

  // Pre-built message templates
  templates: {
    bookingConfirmation: (guest, reservation) =>
      `Hi ${guest.name.split(" ")[0]}, your booking at Veloura is confirmed! ` +
      `Check-in: ${reservation.check_in} | Room: ${reservation.rooms?.name}. ` +
      `Confirmation #: ${reservation.id.slice(0, 8).toUpperCase()}. We look forward to welcoming you.`,

    checkInReminder: (guest, reservation) =>
      `Reminder: Your Veloura check-in is tomorrow, ${reservation.check_in}. ` +
      `Check-in from 3:00 PM. Reply HELP for assistance.`,

    checkOutReminder: (guest) =>
      `Good morning ${guest.name.split(" ")[0]}! Check-out today is by 12:00 PM. ` +
      `Need a late check-out? Reply LATE and we'll do our best to accommodate.`,

    cancellationConfirmed: (guest, reservation) =>
      `Your Veloura reservation (${reservation.id.slice(0, 8).toUpperCase()}) has been cancelled. ` +
      `Any refund will appear in 5–7 business days. Contact us if you need assistance.`,
  },
};

/**
 * Twilio Edge Function boilerplate (supabase/functions/twilio-send/index.ts):
 *
 * import { Twilio } from "https://esm.sh/twilio@4";
 * const client = new Twilio(
 *   Deno.env.get("TWILIO_ACCOUNT_SID")!,
 *   Deno.env.get("TWILIO_AUTH_TOKEN")!
 * );
 *
 * Deno.serve(async (req) => {
 *   const { to, body, channel } = await req.json();
 *   const from = channel === "whatsapp"
 *     ? `whatsapp:${Deno.env.get("TWILIO_WHATSAPP_NUMBER")}`
 *     : Deno.env.get("TWILIO_PHONE_NUMBER");
 *   const toNum = channel === "whatsapp" ? `whatsapp:${to}` : to;
 *   const msg = await client.messages.create({ from, to: toNum, body });
 *   return new Response(JSON.stringify({ sid: msg.sid, status: msg.status }),
 *     { headers: { "Content-Type": "application/json" } });
 * });
 */

// ════════════════════════════════════════════════════════════════════════════
//  SENDGRID SERVICE  (Email — via Supabase Edge Function)
// ════════════════════════════════════════════════════════════════════════════
export const SendGridService = {
  async send({ to, subject, html, text, guestId, templateId, dynamicData }) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${CONFIG.supabase.url}${CONFIG.sendgrid.edgeFnUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ to, subject, html, text, templateId, dynamicData }),
    });
    const result = await res.json();
    await db.messages.log({
      guest_id:    guestId,
      channel:     "email",
      direction:   "outbound",
      subject,
      body:        text || "",
      status:      result.success ? "sent" : "failed",
      provider_id: result.messageId,
    });
    return result;
  },

  // Email templates (SendGrid Dynamic Template IDs — set in your SG account)
  TEMPLATES: {
    BOOKING_CONFIRMATION:  "d-YOUR_SG_TEMPLATE_BOOKING_CONF",
    CHECK_IN_REMINDER:     "d-YOUR_SG_TEMPLATE_CHECKIN_REM",
    CHECK_OUT_REMINDER:    "d-YOUR_SG_TEMPLATE_CHECKOUT_REM",
    CANCELLATION:          "d-YOUR_SG_TEMPLATE_CANCEL",
    INVOICE:               "d-YOUR_SG_TEMPLATE_INVOICE",
    WELCOME:               "d-YOUR_SG_TEMPLATE_WELCOME",
    POST_STAY_REVIEW:      "d-YOUR_SG_TEMPLATE_REVIEW",
  },

  sendBookingConfirmation(guest, reservation) {
    return this.send({
      to:          guest.email,
      subject:     `Booking Confirmed — ${reservation.rooms?.name} | Veloura`,
      guestId:     guest.id,
      templateId:  this.TEMPLATES.BOOKING_CONFIRMATION,
      dynamicData: {
        guest_name:      guest.name,
        room_name:       reservation.rooms?.name,
        check_in:        reservation.check_in,
        check_out:       reservation.check_out,
        total_amount:    reservation.total_amount,
        confirmation_id: reservation.id.slice(0, 8).toUpperCase(),
      },
    });
  },

  sendInvoice(guest, reservation, payment) {
    return this.send({
      to:          guest.email,
      subject:     `Your Invoice — Veloura`,
      guestId:     guest.id,
      templateId:  this.TEMPLATES.INVOICE,
      dynamicData: {
        guest_name:   guest.name,
        amount:       payment.amount,
        currency:     payment.currency,
        payment_date: new Date(payment.created_at).toLocaleDateString(),
        invoice_id:   payment.id.slice(0, 8).toUpperCase(),
      },
    });
  },
};

/**
 * SendGrid Edge Function boilerplate (supabase/functions/sendgrid-send/index.ts):
 *
 * Deno.serve(async (req) => {
 *   const { to, subject, html, text, templateId, dynamicData } = await req.json();
 *   const sgKey = Deno.env.get("SENDGRID_API_KEY")!;
 *   const payload = templateId
 *     ? { personalizations: [{ to: [{ email: to }], dynamic_template_data: dynamicData }],
 *         from: { email: "noreply@Veloura.com", name: "Veloura" },
 *         template_id: templateId }
 *     : { personalizations: [{ to: [{ email: to }] }],
 *         from: { email: "noreply@Veloura.com", name: "Veloura" },
 *         subject, content: [{ type: "text/html", value: html }] };
 *   const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
 *     method: "POST",
 *     headers: { Authorization: `Bearer ${sgKey}`, "Content-Type": "application/json" },
 *     body: JSON.stringify(payload),
 *   });
 *   return new Response(JSON.stringify({ success: res.status === 202 }),
 *     { headers: { "Content-Type": "application/json" } });
 * });
 */

// ════════════════════════════════════════════════════════════════════════════
//  GOOGLE MAPS SERVICE
// ════════════════════════════════════════════════════════════════════════════
export const GoogleMapsService = {
  embedUrl: (address, zoom = 15) =>
    `https://www.google.com/maps/embed/v1/place?key=${CONFIG.googleMaps.apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom}&maptype=roadmap`,

  directionsUrl: (origin, destination, mode = "driving") =>
    `https://www.google.com/maps/embed/v1/directions?key=${CONFIG.googleMaps.apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`,

  async geocode(address) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${CONFIG.googleMaps.apiKey}`
    );
    const data = await res.json();
    if (data.results?.[0]) {
      return {
        lat:             data.results[0].geometry.location.lat,
        lng:             data.results[0].geometry.location.lng,
        formattedAddress: data.results[0].formatted_address,
      };
    }
    throw new Error("Geocode failed");
  },

  async reverseGeocode(lat, lng) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${CONFIG.googleMaps.apiKey}`
    );
    const data = await res.json();
    return data.results?.[0]?.formatted_address || "";
  },

  async getNearby(lat, lng, type = "restaurant", radius = 1000) {
    // Proxy via Supabase Edge Function to keep API key server-side
    const res = await fetch(
      `${CONFIG.supabase.url}/functions/v1/places-nearby?lat=${lat}&lng=${lng}&type=${type}&radius=${radius}`,
      { headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } }
    );
    return res.json();
  },
};

// ════════════════════════════════════════════════════════════════════════════
//  REACT HOOKS
// ════════════════════════════════════════════════════════════════════════════

// ── useReservations ────────────────────────────────────────────────────────
export const useReservations = (filters = {}) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await db.reservations.list(filters);
    if (err) setError(err.message);
    else setReservations(data || []);
    setLoading(false);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetch();
    const unsub = subscribeReservations(() => fetch());
    return unsub;
  }, [fetch]);

  const checkIn = async (id) => {
    await cloudbeds.checkIn(id);
    await db.reservations.update(id, { status: "checked_in" });
    await fetch();
  };

  const checkOut = async (id) => {
    await cloudbeds.checkOut(id);
    await db.reservations.update(id, { status: "checked_out" });
    await fetch();
  };

  const cancel = async (id, reason) => {
    await cloudbeds.cancelReservation(id, reason);
    await db.reservations.update(id, { status: "cancelled" });
    await fetch();
  };

  return { reservations, loading, error, refetch: fetch, checkIn, checkOut, cancel };
};

// ── useRooms ───────────────────────────────────────────────────────────────
export const useRooms = () => {
  const [rooms, setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.rooms.list().then(({ data }) => { setRooms(data || []); setLoading(false); });
    const sub = supabase
      .channel("rooms-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" },
        () => db.rooms.list().then(({ data }) => setRooms(data || [])))
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const updateStatus = async (id, status) => {
    await cloudbeds.updateRoomStatus(id, status);
    await db.rooms.update(id, { status });
    const { data } = await db.rooms.list();
    setRooms(data || []);
  };

  return { rooms, loading, updateStatus };
};

// ── useGuests ──────────────────────────────────────────────────────────────
export const useGuests = (search = "") => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await db.guests.list(search);
      setGuests(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return { guests, loading };
};

// ── usePayments ────────────────────────────────────────────────────────────
export const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    db.payments.list().then(({ data }) => { setPayments(data || []); setLoading(false); });
  }, []);

  const refund = async (payment) => {
    await StripeService.refund(payment.stripe_payment_intent_id, payment.amount);
    await db.payments.update(payment.id, { status: "refunded" });
    const { data } = await db.payments.list();
    setPayments(data || []);
  };

  return { payments, loading, refund };
};

// ── useChannels ────────────────────────────────────────────────────────────
export const useChannels = (propertyId) => {
  const [channels, setChannels]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    siteminder.getChannels(propertyId)
      .then(d => { setChannels(d.channels || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [propertyId]);

  const toggle = async (channelId, enabled) => {
    await siteminder.toggleChannel(propertyId, channelId, enabled);
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, enabled } : c));
  };

  const syncARI = async () => {
    setSyncing(true);
    try {
      const today    = new Date().toISOString().split("T")[0];
      const in90days = new Date(Date.now() + 90*86400000).toISOString().split("T")[0];
      const [cbRooms, cbRates] = await Promise.all([
        cloudbeds.getRoomAvailability(today, in90days),
        cloudbeds.getRates(today, in90days),
      ]);
      await siteminder.pushARI(propertyId, { rooms: cbRooms, rates: cbRates });
    } finally {
      setSyncing(false);
    }
  };

  return { channels, loading, syncing, toggle, syncARI };
};

// ── useToasts ──────────────────────────────────────────────────────────────
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

// ════════════════════════════════════════════════════════════════════════════
//  ICONS
// ════════════════════════════════════════════════════════════════════════════
const Ic = ({ n, s = 18, c = "currentColor", sw = 1.6 }) => {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    dashboard: <svg {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
    calendar:  <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    bed:       <svg {...p}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
    users:     <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    card:      <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    mail:      <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    phone:     <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 7.16 7.16l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    map:       <svg {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    channel:   <svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    settings:  <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    check:     <svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    close:     <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    refresh:   <svg {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    chevD:     <svg {...p} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
    plus:      <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:    <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trend:     <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    alert:     <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    logo:      <svg width={s} height={s} viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#C9A84C"/><path d="M10 34V18l12-8 12 8v16" stroke="#fff" strokeWidth="2" fill="none"/><rect x="17" y="24" width="10" height="10" rx="1" fill="#fff"/><circle cx="22" cy="14" r="3" fill="#0F1923"/></svg>,
    stripe:    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>,
    whatsapp:  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    sendgrid:  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M8.007 0H0v8.007h8.007V0zm7.986 0h-8.007v8.007h8.007V0zm8.007 0H16v8.007h8V0zM8.007 8.007H0V16h8.007V8.007zm8.007 7.986h-8.007V24h8.007v-8.007zm7.986 0H16V24h8v-8.007zM8.007 16H0v8h8.007v-8z"/></svg>,
    cloudbeds: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 17h18M3 17a5 5 0 1 1 10 0M3 17a3 3 0 0 1 0-6h1a5 5 0 0 1 9.9-1H15a3 3 0 0 1 0 6"/></svg>,
    siteminder:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    clerk:     <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M21.4 9.6a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 5.1 8.1l-1.4 2.4a1 1 0 0 0 .87 1.5h9a1 1 0 0 0 .87-1.5l-1.4-2.4a9 9 0 0 0 5.1-8.1zm-9 5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>,
    supabase:  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z"/></svg>,
    googlemaps:<svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  };
  return icons[n] || <svg {...p}/>;
};

// ════════════════════════════════════════════════════════════════════════════
//  UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

// ── Toast System ──────────────────────────────────────────────────────────
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <Ic n={t.type === "success" ? "check" : t.type === "error" ? "alert" : "alert"} s={16} c={t.type === "success" ? "#4ADE80" : t.type === "error" ? "#F87171" : "var(--gold)"}/>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    confirmed:   "badge-confirmed",
    checked_in:  "badge-checked-in",
    checked_out: "badge-gray",
    cancelled:   "badge-cancelled",
    pending:     "badge-pending",
    available:   "badge-confirmed",
    occupied:    "badge-checked-in",
    maintenance: "badge-pending",
    blocked:     "badge-cancelled",
    succeeded:   "badge-confirmed",
    processing:  "badge-pending",
    refunded:    "badge-gold",
    failed:      "badge-cancelled",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status?.replace("_", " ")}</span>;
};

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, delta, deltaDir, icon, color = "var(--gold)" }) => (
  <div className="stat-card" style={{ animation: "fadeUp .5s var(--ease) forwards" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {delta && <div className={`stat-delta ${deltaDir}`}>{deltaDir === "up" ? "↑" : "↓"} {delta}</div>}
      </div>
      <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}>
        <Ic n={icon} s={20} c={color}/>
      </div>
    </div>
  </div>
);

// ── Occupancy Bar ─────────────────────────────────────────────────────────
const OccupancyBar = ({ pct, label }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: "var(--fog)" }}>
      <span>{label}</span>
      <span style={{ color: "var(--sand)", fontFamily: "var(--mono)" }}>{pct}%</span>
    </div>
    <div className="occ-bar"><div className="occ-fill" style={{ width: `${pct}%` }}/></div>
  </div>
);

// ── Integration Status Pill ────────────────────────────────────────────────
const IntegrationPill = ({ icon, name, status, detail }) => (
  <div className="int-pill">
    <div className={`status-dot ${status}`}/>
    <Ic n={icon} s={16} c={status === "online" ? "#4ADE80" : status === "warning" ? "#FCD34D" : "#F87171"}/>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: ".84rem", fontWeight: 500 }}>{name}</div>
      {detail && <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", marginTop: 2 }}>{detail}</div>}
    </div>
    <span className={`badge ${status === "online" ? "badge-confirmed" : status === "warning" ? "badge-pending" : "badge-cancelled"}`}>
      {status}
    </span>
  </div>
);

// ── Skeleton Row ──────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[200,120,100,100,80].map((w,i) => (
      <td key={i}><div className="skeleton" style={{ height: 14, width: w }}/></td>
    ))}
  </tr>
);

// ── Search Input ──────────────────────────────────────────────────────────
const SearchInput = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative" }}>
    <Ic n="search" s={15} c="var(--fog)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}/>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || "Search…"}
      style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "var(--r)", padding: "9px 14px 9px 36px", fontFamily: "var(--sans)", fontSize: ".85rem", color: "var(--sand)", outline: "none", width: 240 }}
    />
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  PAGE COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

// ── Dashboard Overview ─────────────────────────────────────────────────────
const DashboardPage = () => {
  const { reservations, loading } = useReservations();
  const { rooms }                 = useRooms();

  const stats = {
    todayArrivals:   reservations.filter(r => r.check_in === new Date().toISOString().split("T")[0]).length,
    todayDepartures: reservations.filter(r => r.check_out === new Date().toISOString().split("T")[0]).length,
    occupied:        rooms.filter(r => r.status === "occupied").length,
    available:       rooms.filter(r => r.status === "available").length,
    occupancyPct:    rooms.length ? Math.round(rooms.filter(r => r.status === "occupied").length / rooms.length * 100) : 0,
    revenue:         reservations.filter(r => r.status === "confirmed" || r.status === "checked_in")
                       .reduce((s, r) => s + (r.total_amount || 0), 0),
  };

  // Fake 7-day revenue bars (replace with real data from Cloudbeds report)
  const revBars = [62, 74, 58, 81, 93, 77, 88];
  const days    = ["M","T","W","T","F","S","S"];

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 400, color: "var(--sand)" }}>Operations Overview</h1>
        <p style={{ color: "var(--fog)", fontSize: ".88rem", marginTop: 6 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Today's Arrivals"   value={loading ? "—" : stats.todayArrivals}   icon="calendar" delta="vs yesterday" deltaDir="up"/>
        <StatCard label="Today's Departures" value={loading ? "—" : stats.todayDepartures} icon="logout"   color="#93C5FD"/>
        <StatCard label="Rooms Occupied"     value={loading ? "—" : stats.occupied}        icon="bed"      color="#A78BFA"/>
        <StatCard label="Rooms Available"    value={loading ? "—" : stats.available}       icon="check"    color="#4ADE80"/>
        <StatCard label="Total Revenue"      value={loading ? "—" : `$${stats.revenue.toLocaleString()}`} icon="card" delta="12.4% this month" deltaDir="up"/>
        <StatCard label="Occupancy"          value={loading ? "—" : `${stats.occupancyPct}%`} icon="trend" color="var(--gold)"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Revenue chart */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>7-Day Revenue</span>
            <span className="badge badge-gold">This Week</span>
          </div>
          <div className="card-body">
            <div className="rev-bar-wrap">
              {revBars.map((h, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                  <div className="rev-bar" style={{ height: `${h}%` }}/>
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--fog)" }}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Room occupancy */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>Occupancy By Type</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <OccupancyBar pct={stats.occupancyPct} label="All Rooms"/>
            <OccupancyBar pct={82} label="Suites"/>
            <OccupancyBar pct={71} label="Deluxe"/>
            <OccupancyBar pct={65} label="Standard"/>
          </div>
        </div>

        {/* Integration health */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>Integration Health</span>
          </div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            <IntegrationPill icon="supabase"   name="Supabase"    status="online"  detail="Database + Realtime"/>
            <IntegrationPill icon="cloudbeds"  name="Cloudbeds"   status="online"  detail="PMS — 24 rooms synced"/>
            <IntegrationPill icon="siteminder" name="SiteMinder"  status="online"  detail="6 channels active"/>
            <IntegrationPill icon="stripe"     name="Stripe"      status="online"  detail="Payments live"/>
            <IntegrationPill icon="whatsapp"   name="Twilio"      status="online"  detail="SMS + WhatsApp"/>
            <IntegrationPill icon="sendgrid"   name="SendGrid"    status="online"  detail="Email delivery"/>
            <IntegrationPill icon="clerk"      name="Clerk"       status="online"  detail="Auth provider"/>
            <IntegrationPill icon="googlemaps" name="Google Maps" status="online"  detail="Geocoding + Embeds"/>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Reservations Page ──────────────────────────────────────────────────────
const ReservationsPage = () => {
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const toast                   = useToast();
  const { reservations, loading, checkIn, checkOut, cancel } = useReservations(
    filter !== "all" ? { status: filter } : {}
  );

  const filtered = reservations.filter(r =>
    !search || r.guests?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.id.includes(search)
  );

  const tabs = ["all","confirmed","checked_in","checked_out","cancelled"];

  const handleAction = async (action, r) => {
    try {
      if (action === "checkin")  { await checkIn(r.id);  toast("Checked in: " + r.guests?.name, "success"); }
      if (action === "checkout") { await checkOut(r.id); toast("Checked out: " + r.guests?.name, "success"); }
      if (action === "cancel")   { await cancel(r.id);   toast("Reservation cancelled", "success"); }
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--sand)" }}>Reservations</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Guest name or ID…"/>
          <button className="btn btn-primary btn-sm"><Ic n="plus" s={14} c="var(--ink)"/> New</button>
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t} className={`tab-btn ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>
            {t === "all" ? "All" : t.replace("_"," ").replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Confirmation</th><th>Guest</th><th>Room</th>
                <th>Check-in</th><th>Check-out</th><th>Total</th>
                <th>Source</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array(6).fill(0).map((_,i) => <SkeletonRow key={i}/>) :
                filtered.map(r => (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--gold-lt)" }}>{r.id.slice(0,8).toUpperCase()}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.guests?.name || "—"}</div>
                      <div style={{ fontSize: ".75rem", color: "var(--fog)" }}>{r.guests?.email}</div>
                    </td>
                    <td>{r.rooms?.name || "—"}</td>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: ".8rem" }}>{r.check_in}</span></td>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: ".8rem" }}>{r.check_out}</span></td>
                    <td><span style={{ fontFamily: "var(--mono)" }}>${r.total_amount?.toLocaleString()}</span></td>
                    <td><span className="badge badge-gray">{r.source || "direct"}</span></td>
                    <td><StatusBadge status={r.status}/></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {r.status === "confirmed" && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleAction("checkin", r)} title="Check In">
                            <Ic n="check" s={13} c="#4ADE80"/>
                          </button>
                        )}
                        {r.status === "checked_in" && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleAction("checkout", r)} title="Check Out">
                            <Ic n="logout" s={13} c="#93C5FD"/>
                          </button>
                        )}
                        {(r.status === "confirmed") && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleAction("cancel", r)} title="Cancel">
                            <Ic n="close" s={13} c="#F87171"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservation Detail Modal */}
      {selected && <ReservationModal res={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
};

// ── Reservation Detail Modal ───────────────────────────────────────────────
const ReservationModal = ({ res, onClose }) => {
  const toast       = useToast();
  const [tab, setTab] = useState("details");
  const [msgCh, setMsgCh] = useState("sms");
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending]  = useState(false);

  const sendMessage = async () => {
    if (!msgBody.trim()) return;
    setSending(true);
    try {
      await TwilioService.send({
        to:       res.guests?.phone,
        body:     msgBody,
        channel:  msgCh,
        guestId:  res.guest_id,
      });
      toast("Message sent", "success");
      setMsgBody("");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSending(false);
    }
  };

  const sendEmail = async () => {
    setSending(true);
    try {
      await SendGridService.sendBookingConfirmation(res.guests, res);
      toast("Confirmation email sent", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--sand)" }}>
              Reservation #{res.id.slice(0,8).toUpperCase()}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              <StatusBadge status={res.status}/>
              <span className="badge badge-gray">{res.source || "direct"}</span>
            </div>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><Ic n="close" s={16}/></button>
        </div>

        <div style={{ padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 2 }}>
          {["details","messages","payment"].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ fontSize: ".82rem" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === "details" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Guest */}
              <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(201,168,76,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="users" s={20} c="var(--gold)"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{res.guests?.name}</div>
                  <div style={{ color: "var(--fog)", fontSize: ".82rem" }}>{res.guests?.email}</div>
                  <div style={{ color: "var(--fog)", fontSize: ".82rem" }}>{res.guests?.phone}</div>
                </div>
                <span className="badge badge-gold">{res.guests?.loyalty_tier || "standard"}</span>
              </div>
              {/* Stay details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Room",      value: res.rooms?.name || "—" },
                  { label: "Check-in",  value: res.check_in },
                  { label: "Check-out", value: res.check_out },
                  { label: "Guests",    value: res.rooms?.capacity || 2 },
                  { label: "Total",     value: `$${res.total_amount?.toLocaleString()}` },
                  { label: "Currency",  value: res.currency || "USD" },
                ].map(f => (
                  <div key={f.label} style={{ background: "rgba(255,255,255,.03)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)", marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".88rem", color: "var(--sand)" }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {res.notes && (
                <div style={{ background: "rgba(201,168,76,.06)", borderRadius: 8, padding: 12, border: "1px solid rgba(201,168,76,.15)", fontSize: ".85rem", color: "var(--fog)" }}>
                  <Ic n="alert" s={13} c="var(--gold)" style={{ marginRight: 6 }}/>
                  {res.notes}
                </div>
              )}
            </div>
          )}

          {tab === "messages" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: ".85rem", color: "var(--fog)" }}>Send message to {res.guests?.name?.split(" ")[0]}</span>
                <div className="channel-toggle">
                  {["sms","whatsapp","email"].map(ch => (
                    <button key={ch} className={msgCh === ch ? "active" : ""} onClick={() => setMsgCh(ch)}>{ch}</button>
                  ))}
                </div>
              </div>

              {msgCh !== "email" ? (
                <>
                  <div className="field">
                    <label>Message</label>
                    <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={3} placeholder="Type your message…" style={{ resize: "vertical" }}/>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Check-in reminder","Check-out reminder","Booking confirmed"].map(tpl => (
                      <button key={tpl} className="btn btn-sm btn-secondary" onClick={() => {
                        if (tpl === "Booking confirmed")    setMsgBody(TwilioService.templates.bookingConfirmation(res.guests, res));
                        if (tpl === "Check-in reminder")   setMsgBody(TwilioService.templates.checkInReminder(res.guests, res));
                        if (tpl === "Check-out reminder")  setMsgBody(TwilioService.templates.checkOutReminder(res.guests));
                      }}>{tpl}</button>
                    ))}
                  </div>
                  <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !msgBody.trim()}>
                    {sending ? <><Ic n="refresh" s={14} c="var(--ink)" style={{ animation: "spin 1s linear infinite" }}/> Sending…</> : <><Ic n={msgCh === "whatsapp" ? "whatsapp" : "phone"} s={14} c="var(--ink)"/> Send {msgCh === "whatsapp" ? "WhatsApp" : "SMS"}</>}
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ color: "var(--fog)", fontSize: ".85rem" }}>Send a pre-built email template via SendGrid.</p>
                  <button className="btn btn-primary" onClick={sendEmail} disabled={sending}>
                    {sending ? "Sending…" : <><Ic n="mail" s={14} c="var(--ink)"/> Send Booking Confirmation</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "payment" && (
            <PaymentTab reservation={res}/>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Payment Tab (Stripe) ───────────────────────────────────────────────────
const PaymentTab = ({ reservation }) => {
  const toast   = useToast();
  const stripe  = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [pi, setPi]           = useState(null);

  const createIntent = async () => {
    setLoading(true);
    try {
      const result = await StripeService.createPaymentIntent(
        reservation.id,
        reservation.total_amount,
        reservation.currency || "usd",
        { guest_name: reservation.guests?.name }
      );
      setPi(result);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!stripe || !elements || !pi) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(pi.clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });
    if (error) {
      toast(error.message, "error");
    } else if (paymentIntent.status === "succeeded") {
      await db.payments.create({
        reservation_id: reservation.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: reservation.total_amount,
        currency: reservation.currency || "usd",
        status: "succeeded",
        method: "card",
      });
      toast("Payment succeeded", "success");
      setPi(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", marginBottom: 8 }}>AMOUNT DUE</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--sand)" }}>
          ${reservation.total_amount?.toLocaleString()} <span style={{ fontSize: "1rem", color: "var(--fog)" }}>{reservation.currency?.toUpperCase() || "USD"}</span>
        </div>
      </div>

      {!pi ? (
        <button className="btn btn-primary" onClick={createIntent} disabled={loading}>
          {loading ? "Creating…" : <><Ic n="stripe" s={14} c="var(--ink)"/> Charge via Stripe</>}
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="stripe-card-wrapper">
            <CardElement options={{ style: { base: { color: "#F4EFE4", fontFamily: "'Jost', sans-serif", fontSize: "15px", "::placeholder": { color: "#4A5568" } } } }}/>
          </div>
          <button className="btn btn-primary" onClick={confirmPayment} disabled={loading}>
            {loading ? "Processing…" : `Confirm $${reservation.total_amount?.toLocaleString()}`}
          </button>
          <button className="btn btn-secondary" onClick={() => setPi(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

// ── Rooms Page ─────────────────────────────────────────────────────────────
const RoomsPage = () => {
  const { rooms, loading, updateStatus } = useRooms();
  const toast  = useToast();
  const [view, setView] = useState("grid");

  const statusColors = { available: "#4ADE80", occupied: "#93C5FD", maintenance: "#FCD34D", blocked: "#F87171" };

  const handleStatus = async (id, status) => {
    try {
      await updateStatus(id, status);
      toast("Room status updated", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--sand)" }}>Room Management</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {["grid","list"].map(v => (
            <button key={v} className={`btn btn-sm ${view === v ? "btn-secondary" : "btn-secondary"}`}
              style={{ opacity: view === v ? 1 : .5 }} onClick={() => setView(v)}>
              <Ic n={v} s={14}/>
            </button>
          ))}
        </div>
      </div>

      {/* Status legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {Object.entries(statusColors).map(([s, c]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "var(--fog)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }}/>
            {s.charAt(0).toUpperCase() + s.slice(1)}: {rooms.filter(r => r.status === s).length}
          </div>
        ))}
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {loading ? Array(12).fill(0).map((_,i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }}/>
          )) : rooms.map(room => (
            <div key={room.id} className="card" style={{ padding: 16, borderLeft: `3px solid ${statusColors[room.status] || "#555"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--fog)" }}>FLOOR {room.floor}</div>
                  <div style={{ fontWeight: 600, fontSize: ".95rem", marginTop: 2 }}>{room.name}</div>
                </div>
                <StatusBadge status={room.status}/>
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--fog)", marginBottom: 12 }}>{room.type} · {room.capacity} guests</div>
              <select
                value={room.status}
                onChange={e => handleStatus(room.id, e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 10px", fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--sand)", cursor: "pointer" }}
              >
                {["available","occupied","maintenance","blocked"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Room</th><th>Type</th><th>Floor</th><th>Capacity</th><th>Rate/Night</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_,i) => <SkeletonRow key={i}/>) :
                rooms.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>{r.type}</td>
                    <td><span style={{ fontFamily: "var(--mono)" }}>{r.floor}</span></td>
                    <td>{r.capacity}</td>
                    <td><span style={{ fontFamily: "var(--mono)" }}>${r.base_rate?.toLocaleString()}</span></td>
                    <td><StatusBadge status={r.status}/></td>
                    <td>
                      <select
                        value={r.status}
                        onChange={e => handleStatus(r.id, e.target.value)}
                        style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "5px 8px", fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--sand)", cursor: "pointer" }}
                      >
                        {["available","occupied","maintenance","blocked"].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Guests Page ────────────────────────────────────────────────────────────
const GuestsPage = () => {
  const [search, setSearch]   = useState("");
  const { guests, loading }   = useGuests(search);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  const tierColor = { standard: "var(--fog)", silver: "#CBD5E0", gold: "var(--gold)", platinum: "#E9D5FF" };

  const sendWelcome = async (guest) => {
    try {
      await SendGridService.send({
        to:         guest.email,
        subject:    "Welcome to Veloura",
        guestId:    guest.id,
        templateId: SendGridService.TEMPLATES.WELCOME,
        dynamicData: { guest_name: guest.name },
      });
      toast("Welcome email sent", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--sand)" }}>Guests</h1>
        <SearchInput value={search} onChange={setSearch} placeholder="Name or email…"/>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Guest</th><th>Phone</th><th>Country</th><th>Tier</th><th>Total Stays</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_,i) => <SkeletonRow key={i}/>) :
              guests.map(g => (
                <tr key={g.id} style={{ cursor: "pointer" }} onClick={() => setSelected(g)}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{g.name}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--fog)" }}>{g.email}</div>
                  </td>
                  <td><span style={{ fontFamily: "var(--mono)", fontSize: ".8rem" }}>{g.phone || "—"}</span></td>
                  <td>{g.country || "—"}</td>
                  <td><span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: tierColor[g.loyalty_tier] || "var(--fog)" }}>◆ {g.loyalty_tier || "standard"}</span></td>
                  <td><span style={{ fontFamily: "var(--mono)" }}>{g.total_stays}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => sendWelcome(g)} title="Send email">
                        <Ic n="mail" s={13}/>
                      </button>
                      <button className="btn btn-sm btn-secondary" title="SMS">
                        <Ic n="phone" s={13}/>
                      </button>
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

// ── Channels Page (SiteMinder) ─────────────────────────────────────────────
const ChannelsPage = () => {
  const propertyId              = CONFIG.cloudbeds.propertyId;
  const { channels, loading, syncing, toggle, syncARI } = useChannels(propertyId);
  const toast                   = useToast();

  // Fallback demo channels if SiteMinder not configured
  const demoChannels = [
    { id: "bc",  name: "Booking.com",  logo: "🔵", enabled: true,  reservations_today: 4,  commission: "15%" },
    { id: "ex",  name: "Expedia",      logo: "🟡", enabled: true,  reservations_today: 2,  commission: "18%" },
    { id: "ab",  name: "Airbnb",       logo: "🔴", enabled: true,  reservations_today: 1,  commission: "3%"  },
    { id: "ho",  name: "Hotels.com",   logo: "🟠", enabled: false, reservations_today: 0,  commission: "15%" },
    { id: "ag",  name: "Agoda",        logo: "🟣", enabled: true,  reservations_today: 1,  commission: "12%" },
    { id: "dr",  name: "Direct",       logo: "🟢", enabled: true,  reservations_today: 3,  commission: "0%"  },
  ];

  const display = channels.length > 0 ? channels : demoChannels;

  const handleToggle = async (ch) => {
    try {
      await toggle(ch.id, !ch.enabled);
      toast(`${ch.name} ${!ch.enabled ? "enabled" : "disabled"}`, "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const handleSync = async () => {
    try {
      await syncARI();
      toast("ARI pushed to all channels", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--sand)" }}>Channel Manager</h1>
          <p style={{ color: "var(--fog)", fontSize: ".85rem", marginTop: 4 }}>Powered by SiteMinder · ARI sync to all OTAs</p>
        </div>
        <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
          {syncing
            ? <><Ic n="refresh" s={14} c="var(--ink)" style={{ animation: "spin 1s linear infinite" }}/> Syncing…</>
            : <><Ic n="refresh" s={14} c="var(--ink)"/> Push ARI</>
          }
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>OTA Channels</span>
            <span className="badge badge-confirmed">{display.filter(c => c.enabled).length} active</span>
          </div>
          <div style={{ padding: "8px 22px" }}>
            {loading ? Array(6).fill(0).map((_,i) => (
              <div key={i} className="channel-row"><div className="skeleton" style={{ height: 18, width: "100%" }}/></div>
            )) : display.map(ch => (
              <div key={ch.id} className="channel-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.2rem" }}>{ch.logo}</span>
                  <div>
                    <div style={{ fontSize: ".9rem", fontWeight: 500 }}>{ch.name}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)" }}>
                      Commission: {ch.commission} · Today: {ch.reservations_today} bookings
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StatusBadge status={ch.enabled ? "confirmed" : "cancelled"}/>
                  <button
                    className={`btn btn-sm ${ch.enabled ? "btn-danger" : "btn-secondary"}`}
                    onClick={() => handleToggle(ch)}
                  >
                    {ch.enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Today's OTA breakdown */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>Today's Bookings by Source</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {display.filter(c => c.enabled && c.reservations_today > 0).map(ch => (
                <div key={ch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{ch.logo}</span>
                    <span style={{ fontSize: ".85rem" }}>{ch.name}</span>
                  </div>
                  <div style={{ display: "flex", align: "center", gap: 10 }}>
                    <div className="occ-bar" style={{ width: 80 }}>
                      <div className="occ-fill" style={{ width: `${ch.reservations_today * 20}%` }}/>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: ".8rem", color: "var(--gold-lt)" }}>{ch.reservations_today}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last sync */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>Sync Log</span>
            </div>
            <div className="card-body">
              <div className="timeline">
                {[
                  { time: "2 min ago",  event: "ARI pushed — all channels", type: "gold" },
                  { time: "14 min ago", event: "New booking from Booking.com" },
                  { time: "1h ago",     event: "Rate update sync completed" },
                  { time: "3h ago",     event: "Inventory adjusted — 2 rooms blocked" },
                ].map((e, i) => (
                  <div key={i} className={`timeline-item ${e.type || ""}`}>
                    <div>
                      <div style={{ fontSize: ".83rem" }}>{e.event}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", marginTop: 3 }}>{e.time}</div>
                    </div>
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

// ── Payments Page ──────────────────────────────────────────────────────────
const PaymentsPage = () => {
  const { payments, loading, refund } = usePayments();
  const toast = useToast();

  const handleRefund = async (p) => {
    if (!window.confirm(`Refund $${p.amount?.toLocaleString()} to ${p.reservations?.guests?.name}?`)) return;
    try {
      await refund(p);
      toast("Refund issued", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const totalRevenue = payments.filter(p => p.status === "succeeded").reduce((s, p) => s + (p.amount || 0), 0);
  const totalRefunds = payments.filter(p => p.status === "refunded").reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--sand)" }}>Payments</h1>
        <span style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--fog)", fontSize: ".85rem" }}>
          <Ic n="stripe" s={16} c="var(--gold)"/> Powered by Stripe
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Revenue"  value={`$${totalRevenue.toLocaleString()}`} icon="trend"  delta="all time" deltaDir="up"/>
        <StatCard label="Refunds Issued" value={`$${totalRefunds.toLocaleString()}`} icon="card"   color="#F87171"/>
        <StatCard label="Transactions"   value={payments.length}                     icon="calendar" color="#A78BFA"/>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Guest</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_,i) => <SkeletonRow key={i}/>) :
              payments.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--fog)" }}>{p.id.slice(0,8).toUpperCase()}</span></td>
                  <td>
                    <div>{p.reservations?.guests?.name || "—"}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--fog)" }}>{p.reservations?.guests?.email}</div>
                  </td>
                  <td><span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>${p.amount?.toLocaleString()} <span style={{ color: "var(--fog)", fontSize: ".75rem" }}>{p.currency?.toUpperCase()}</span></span></td>
                  <td><span className="badge badge-gray">{p.method || "card"}</span></td>
                  <td><StatusBadge status={p.status}/></td>
                  <td><span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--fog)" }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</span></td>
                  <td>
                    {p.status === "succeeded" && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleRefund(p)}>Refund</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Location / Maps Page ───────────────────────────────────────────────────
const MapsPage = () => {
  const [address, setAddress] = useState("Veloura Hotel, 15 Park Avenue, New York, NY");
  const [mapType, setMapType] = useState("place");
  const [loaded, setLoaded]   = useState(false);

  const iframeSrc = mapType === "place"
    ? GoogleMapsService.embedUrl(address)
    : GoogleMapsService.directionsUrl("JFK Airport, New York", address);

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--sand)" }}>Location & Maps</h1>
        <p style={{ color: "var(--fog)", fontSize: ".85rem", marginTop: 4 }}>Powered by Google Maps Platform</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header"><span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>Map Config</span></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Hotel address…"/>
              </div>
              <div className="field">
                <label>View Type</label>
                <select value={mapType} onChange={e => setMapType(e.target.value)}>
                  <option value="place">Place View</option>
                  <option value="directions">Directions from JFK</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={() => setLoaded(p => !p)}>
                <Ic n="map" s={14} c="var(--ink)"/> Load Map
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fog)" }}>API Methods</span></div>
            <div style={{ padding: "12px 0" }}>
              {[
                { fn: "geocode(address)",          desc: "Address → coordinates" },
                { fn: "reverseGeocode(lat, lng)",  desc: "Coordinates → address" },
                { fn: "getNearby(lat, lng, type)", desc: "Nearby places (POI)" },
                { fn: "embedUrl(address)",         desc: "Static map embed URL" },
                { fn: "directionsUrl(orig, dest)", desc: "Directions embed URL" },
              ].map(m => (
                <div key={m.fn} style={{ padding: "10px 22px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--gold-lt)" }}>{m.fn}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--fog)", marginTop: 2 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="map-container" style={{ height: 520 }}>
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Hotel Location"
          />
        </div>
      </div>
    </div>
  );
};

// ── Settings Page ──────────────────────────────────────────────────────────
const SettingsPage = () => {
  const integrations = [
    { key: "supabase",   name: "Supabase",        icon: "supabase",   fields: [["Project URL","VITE_SUPABASE_URL"],["Anon Key","VITE_SUPABASE_ANON_KEY"]] },
    { key: "cloudbeds",  name: "Cloudbeds PMS",   icon: "cloudbeds",  fields: [["Client ID","VITE_CLOUDBEDS_CLIENT_ID"],["Client Secret","VITE_CLOUDBEDS_CLIENT_SECRET"],["Property ID","VITE_CLOUDBEDS_PROPERTY_ID"]] },
    { key: "siteminder", name: "SiteMinder",      icon: "siteminder", fields: [["API Key","VITE_SITEMINDER_API_KEY"]] },
    { key: "stripe",     name: "Stripe",          icon: "stripe",     fields: [["Publishable Key","VITE_STRIPE_PUBLISHABLE_KEY"]] },
    { key: "twilio",     name: "Twilio",          icon: "whatsapp",   fields: [["Set in Supabase Edge Fn env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER","(server-side)"]],  note: true },
    { key: "sendgrid",   name: "SendGrid",        icon: "sendgrid",   fields: [["Set in Supabase Edge Fn env: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL","(server-side)"]],  note: true },
    { key: "clerk",      name: "Clerk Auth",      icon: "clerk",      fields: [["Publishable Key","VITE_CLERK_PUBLISHABLE_KEY"]] },
    { key: "googlemaps", name: "Google Maps",     icon: "googlemaps", fields: [["API Key","VITE_GOOGLE_MAPS_API_KEY"]] },
  ];

  return (
    <div style={{ animation: "fadeUp .4s var(--ease)" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--sand)" }}>Settings</h1>
        <p style={{ color: "var(--fog)", fontSize: ".85rem", marginTop: 6 }}>Configure integration credentials. Store secrets in environment variables, never in source code.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {integrations.map(int => (
          <div key={int.key} className="card">
            <div className="card-header">
              <div style={{ display: "flex", align: "center", gap: 12 }}>
                <div style={{ background: "rgba(201,168,76,.1)", borderRadius: 8, padding: 8, display: "flex" }}>
                  <Ic n={int.icon} s={18} c="var(--gold)"/>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{int.name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--fog)", marginTop: 2 }}>{int.key}</div>
                </div>
              </div>
              <div className={`status-dot ${Object.values(CONFIG).some(c => typeof c === "object" && Object.values(c).some(v => v?.startsWith("YOUR_"))) ? "warning" : "online"}`}/>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {int.fields.map(([label, envKey]) => (
                  <div key={envKey} className="field">
                    <label>{label}</label>
                    {int.note ? (
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--amber)", background: "rgba(180,83,9,.1)", borderRadius: 6, padding: "10px 14px", border: "1px solid rgba(180,83,9,.2)" }}>
                        ⚠ {envKey}
                      </div>
                    ) : (
                      <input
                        type="password"
                        placeholder={envKey}
                        defaultValue={import.meta.env[envKey] || ""}
                        readOnly
                        style={{ fontFamily: "var(--mono)", fontSize: ".75rem" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SIDEBAR NAV
// ════════════════════════════════════════════════════════════════════════════
const NAV = [
  { section: "Operations" },
  { id: "dashboard",    label: "Dashboard",       icon: "dashboard" },
  { id: "reservations", label: "Reservations",    icon: "calendar"  },
  { id: "rooms",        label: "Rooms",           icon: "bed"       },
  { section: "Guests & Revenue" },
  { id: "guests",       label: "Guests",          icon: "users"     },
  { id: "payments",     label: "Payments",        icon: "card"      },
  { section: "Distribution" },
  { id: "channels",     label: "Channels",        icon: "channel"   },
  { id: "maps",         label: "Location",        icon: "map"       },
  { section: "System" },
  { id: "settings",     label: "Settings",        icon: "settings"  },
];

const Sidebar = ({ page, setPage }) => (
  <div className="sidebar">
    <div className="sidebar-logo">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Ic n="logo" s={34}/>
        <div className="sidebar-wordmark">
          <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 500, color: "var(--sand)", letterSpacing: ".04em" }}>Veloura</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: ".55rem", color: "var(--fog)", letterSpacing: ".15em", textTransform: "uppercase", marginTop: 1 }}>Admin</div>
        </div>
      </div>
    </div>
    <nav className="sidebar-nav">
      {NAV.map((item, i) =>
        item.section ? (
          <div key={i} className="nav-section-label">{item.section}</div>
        ) : (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            <Ic n={item.icon} s={17}/>
            <span>{item.label}</span>
            <div className="nav-dot"/>
          </button>
        )
      )}
    </nav>
    <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <UserButton afterSignOutUrl="/"/>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  MAIN ADMIN APP
// ════════════════════════════════════════════════════════════════════════════
const AdminApp = () => {
  const [page, setPage]   = useState("dashboard");
  const { isLoaded, isSignedIn } = useAuth();
  const { user }          = useUser();

  if (!isLoaded) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D1117" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <Ic n="logo" s={48}/>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--fog)", animation: "pulse 1.4s ease-in-out infinite" }}>Loading…</div>
      </div>
    </div>
  );

  if (!isSignedIn) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D1117" }}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div style={{ textAlign: "center" }}>
          <Ic n="logo" s={52}/>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 400, color: "var(--sand)", marginTop: 12 }}>Veloura Admin</h1>
          <p style={{ color: "var(--fog)", fontSize: ".85rem", marginTop: 6 }}>Sign in to access hotel operations</p>
        </div>
        <SignIn appearance={{ variables: { colorBackground: "#162234", colorText: "#F4EFE4", colorPrimary: "#C9A84C" } }}/>
      </div>
    </div>
  );

  const pageMap = {
    dashboard:    <DashboardPage/>,
    reservations: <ReservationsPage/>,
    rooms:        <RoomsPage/>,
    guests:       <GuestsPage/>,
    payments:     <PaymentsPage/>,
    channels:     <ChannelsPage/>,
    maps:         <MapsPage/>,
    settings:     <SettingsPage/>,
  };

  const pageTitle = NAV.find(n => n.id === page)?.label || "Dashboard";

  return (
    <div className="admin-layout">
      <Sidebar page={page} setPage={setPage}/>
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "var(--sand)" }}>{pageTitle}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--fog)" }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }}/>
            <UserButton/>
          </div>
        </header>
        <div className="page-body">
          {pageMap[page] || <DashboardPage/>}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  ROOT EXPORT — wraps Clerk + Stripe + Toast providers
// ════════════════════════════════════════════════════════════════════════════
export default function HotelBackend() {
  return (
    <ClerkProvider publishableKey={CONFIG.clerk.publishableKey}>
      <Elements stripe={stripePromise} options={{ appearance: { theme: "night", variables: { colorPrimary: "#C9A84C" } } }}>
        <ToastProvider>
          <AdminApp/>
        </ToastProvider>
      </Elements>
    </ClerkProvider>
  );
}
