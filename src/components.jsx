import { useState, useEffect } from "react";
import React from "react";
import { Ic, Stars, Magnetic, Particles, useScrollDirection } from "./shared.jsx";
import DestVisual from "./DestVisual.jsx";

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar = ({ navigate, page, user, onLogin, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const scrollDir = useScrollDirection();
  const isHeroPage = page === "home";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navBg = isHeroPage ? (scrolled ? "rgba(15,25,35,.97)" : "transparent") : "rgba(15,25,35,.98)";
  const navHidden = scrollDir === "down" && scrolled && !mobileOpen;

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, background: navBg, backdropFilter: scrolled || !isHeroPage ? "blur(16px)" : "none", borderBottom: `1px solid ${scrolled || !isHeroPage ? "rgba(255,255,255,.08)" : "transparent"}`, transition: "transform .4s var(--ease), background .4s var(--ease), border-color .4s", transform: navHidden ? "translateY(-100%)" : "translateY(0)" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", height: 70, gap: 40 }}>
          <button onClick={() => navigate("home")} style={{ display: "flex", alignItems: "center", gap: 11, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <img src="/src/images/freepik__create-favicon-for-hospitality-website-Veloura-sty__31023.png" alt="Veloura Logo" style={{ width: 36, height: 36, objectFit: "contain" }} />
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 600, color: "#fff", letterSpacing: ".06em", lineHeight: 1 }}>Veloura</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".56rem", color: "rgba(201,168,76,.8)", letterSpacing: ".2em", marginTop: 1 }}>LUXURY HOTELS</div>
            </div>
          </button>
          <div className="hide-md" style={{ display: "flex", alignItems: "center", gap: 28, flex: 1, justifyContent: "center" }}>
            {[["Hotels", "hotels"], ["Destinations", "destinations"], ["Deals", "deals"], ["About", "about"]].map(([label, pg]) => (
              <button key={label} onClick={() => navigate(pg)} className={`nav-link ${page === pg ? "active" : ""}`}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 25, padding: "6px 14px 6px 8px", cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: ".72rem", fontWeight: 600, color: "var(--ink)" }}>{user.avatar}</div>
                  <span style={{ fontFamily: "var(--sans)", fontSize: ".83rem", color: "#fff" }}>{user.name.split(" ")[0]}</span>
                  <Ic n="chevD" s={14} c="rgba(255,255,255,.5)" />
                </button>
                {userMenuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: "var(--navy)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: 8, minWidth: 200, animation: "fadeDown .25s var(--ease)", zIndex: 100, boxShadow: "0 20px 50px rgba(0,0,0,.4)" }} onMouseLeave={() => setUserMenuOpen(false)}>
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.06)", marginBottom: 4 }}>
                      <div style={{ fontFamily: "var(--sans)", fontSize: ".88rem", color: "#fff", fontWeight: 500 }}>{user.name}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginTop: 2 }}>{user.email}</div>
                    </div>
                    {[["booking", "My Bookings", "bookings"], ["user", "Profile", "bookings"]].map(([ico, label, pg]) => (
                      <button key={label} onClick={() => { navigate(pg); setUserMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", width: "100%", color: "rgba(255,255,255,.7)", fontFamily: "var(--sans)", fontSize: ".85rem" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <Ic n={ico} s={14} c="var(--gold)" />{label}
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 4, paddingTop: 4 }}>
                      <button onClick={() => { onLogout(); setUserMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", width: "100%", color: "rgba(255,100,100,.8)", fontFamily: "var(--sans)", fontSize: ".85rem" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,50,50,.05)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <Ic n="logout" s={14} c="rgba(255,100,100,.8)" />Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={onLogin} className="btn-ghost hide-md">Sign In</button>
                <button onClick={onLogin} className="btn-gold" style={{ padding: "9px 22px", fontSize: ".8rem" }}><span>Book Now</span></button>
              </>
            )}
            <button onClick={() => setMobileOpen(true)} className="hide-lg" style={{ background: "none", border: "none", cursor: "pointer" }}><Ic n="menu" s={22} c="#fff" /></button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, background: "var(--navy)", zIndex: 990, padding: "80px 32px 40px", display: "flex", flexDirection: "column", animation: "fadeIn .3s ease" }}>
          <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer" }}><Ic n="close" s={26} c="#fff" /></button>
          {[["Home", "home"], ["Hotels", "hotels"], ["Destinations", "destinations"], ["Deals", "deals"], ["About", "about"]].map(([l, pg]) => (
            <button key={l} onClick={() => { navigate(pg); setMobileOpen(false); }} style={{ fontFamily: "var(--serif)", fontSize: "2.4rem", color: "#fff", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontWeight: 300 }} onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.color = "#fff"}>{l}</button>
          ))}
          <div style={{ marginTop: "auto" }}>
            {user
              ? <button onClick={() => { onLogout(); setMobileOpen(false); }} className="btn-outline-white" style={{ width: "100%", justifyContent: "center" }}>Sign Out</button>
              : <button onClick={() => { onLogin(); setMobileOpen(false); }} className="btn-gold" style={{ width: "100%", justifyContent: "center" }}>Sign In / Book Now</button>}
          </div>
        </div>
      )}
    </>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
export const Footer = ({ navigate }) => {
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  return (
    <footer style={{ background: "var(--navy)", color: "rgba(255,255,255,.55)" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)", padding: "60px 28px" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Exclusive Offers</div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,3vw,2.4rem)", color: "#fff", fontWeight: 300, lineHeight: 1.25 }}>Members get <em style={{ color: "var(--gold-lt)" }}>up to 30% off</em><br />our best rates</h3>
          </div>
          <div>
            {subDone ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--gold-lt)", fontFamily: "var(--mono)", fontSize: ".85rem" }}><Ic n="check" s={16} c="var(--gold)" />You're on the list. Watch your inbox.</div>
            ) : (
              <div style={{ display: "flex", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,.04)" }}>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" style={{ flex: 1, background: "transparent", border: "none", padding: "14px 18px", fontFamily: "var(--sans)", fontSize: ".9rem", color: "#fff", outline: "none" }} />
                <button onClick={() => email && setSubDone(true)} className="btn-gold" style={{ borderRadius: "0 9px 9px 0", whiteSpace: "nowrap" }}>Subscribe</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "50px 28px 28px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 50 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <img src="/src/images/freepik__create-favicon-for-hospitality-website-Veloura-sty__31023.png" alt="Veloura Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "#fff" }}>Veloura</div>
          </div>
          <p style={{ fontSize: ".85rem", lineHeight: 1.85, color: "rgba(255,255,255,.4)", maxWidth: 260, marginBottom: 24 }}>Curating the world's finest hotel experiences since 2008. Over 12,000 properties across 180 countries.</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["★ 4.9 App Store", "★ 4.8 Play Store"].map(l => <span key={l} className="badge badge-gold" style={{ fontSize: ".62rem" }}>{l}</span>)}
          </div>
        </div>
        {[
          { title: "Explore", links: [["Hotels", "hotels"], ["Destinations", "destinations"], ["Luxury Collection", "hotels"], ["Deals & Offers", "deals"], ["Last Minute", "deals"]] },
          { title: "Support", links: [["Help Centre", "about"], ["Cancellation Policy", "about"], ["Contact Us", "about"], ["Accessibility", "about"]] },
          { title: "Company", links: [["About Veloura", "about"], ["Careers", "about"], ["Press", "about"], ["Partners", "about"], ["Privacy", "about"]] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 18 }}>{col.title}</div>
            {col.links.map(([label, pg]) => (
              <button key={label} onClick={() => navigate(pg)} className="footer-link" style={{ display: "block", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.45)", fontSize: ".84rem", padding: "5px 0", textAlign: "left", fontFamily: "var(--sans)", transition: "color .25s var(--ease)", width: "100%" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.45)"}>{label}</button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "20px 28px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".67rem", color: "rgba(255,255,255,.28)" }}>© 2026 Veloura Holdings Ltd · All rights reserved</div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Privacy", "Terms", "Cookies"].map(l => <button key={l} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: ".67rem", color: "rgba(255,255,255,.28)", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = "var(--gold)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.28)"}>{l}</button>)}
        </div>
      </div>
    </footer>
  );
};

// ─── SearchBar ────────────────────────────────────────────────────────────────
export const SearchBar = ({ onSearch, compact = false }) => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [dest, setDest] = useState("");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [guestOpen, setGuestOpen] = useState(false);

  return (
    <div style={{ background: compact ? "var(--white)" : "rgba(255,255,255,.95)", backdropFilter: "blur(20px)", borderRadius: compact ? 14 : 18, padding: compact ? "12px" : "14px", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "stretch", boxShadow: compact ? "0 4px 24px rgba(0,0,0,.1)" : "0 24px 80px rgba(0,0,0,.35)", border: compact ? "1.5px solid var(--linen)" : "1px solid rgba(255,255,255,.3)" }}>
      <div style={{ flex: "1 1 200px", padding: "6px 14px", borderRight: "1px solid var(--linen)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Destination</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="search" s={14} c="var(--gold)" />
          <input value={dest} onChange={e => setDest(e.target.value)} placeholder="Where to?" style={{ border: "none", outline: "none", fontFamily: "var(--sans)", fontSize: ".92rem", color: "var(--ink)", background: "transparent", width: "100%" }} />
        </div>
      </div>
      <div style={{ flex: "0 1 150px", padding: "6px 14px", borderRight: "1px solid var(--linen)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Check In</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="calendar" s={14} c="var(--gold)" />
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ border: "none", outline: "none", fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--ink)", background: "transparent", width: "100%" }} />
        </div>
      </div>
      <div style={{ flex: "0 1 150px", padding: "6px 14px", borderRight: "1px solid var(--linen)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Check Out</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="calendar" s={14} c="var(--gold)" />
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ border: "none", outline: "none", fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--ink)", background: "transparent", width: "100%" }} />
        </div>
      </div>
      <div style={{ flex: "0 1 140px", padding: "6px 14px", position: "relative" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--slate)", marginBottom: 3 }}>Guests & Rooms</div>
        <button onClick={() => setGuestOpen(!guestOpen)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
          <Ic n="users" s={14} c="var(--gold)" />
          <span style={{ fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--ink)" }}>{guests} guest{guests > 1 ? "s" : ""}, {rooms} room{rooms > 1 ? "s" : ""}</span>
        </button>
        {guestOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "var(--white)", border: "1.5px solid var(--linen)", borderRadius: 12, padding: 18, zIndex: 200, width: 240, boxShadow: "0 16px 48px rgba(0,0,0,.15)", animation: "fadeDown .25s" }}>
            {[["Adults", guests, v => setGuests(Math.max(1, v))], ["Rooms", rooms, v => setRooms(Math.max(1, v))]].map(([label, val, set]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--linen)" }}>
                <div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 500, color: "var(--navy)" }}>{label}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)" }}>Min 1</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button onClick={() => set(val - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid var(--mist)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="minus" s={12} c="var(--slate)" /></button>
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".9rem", fontWeight: 500, minWidth: 20, textAlign: "center" }}>{val}</span>
                  <button onClick={() => set(val + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid var(--mist)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="plus" s={12} c="var(--slate)" /></button>
                </div>
              </div>
            ))}
            <button onClick={() => setGuestOpen(false)} className="btn-navy" style={{ width: "100%", justifyContent: "center", marginTop: 14, padding: "10px" }}>Apply</button>
          </div>
        )}
      </div>
      <button onClick={() => onSearch({ dest, checkIn, checkOut, guests, rooms })} className="btn-gold" style={{ padding: "0 28px", borderRadius: 12, fontSize: ".88rem", flexShrink: 0 }}>
        <Ic n="search" s={16} c="var(--ink)" /><span>Search</span>
      </button>
    </div>
  );
};

// ─── HotelCard ────────────────────────────────────────────────────────────────
export const HotelCard = ({ hotel, navigate, wishlist, onWishlist }) => {
  const saved = wishlist?.includes(hotel.id);
  const [hovered, setHovered] = useState(false);
  const cardRef = React.useRef();

  const onMouseMove = e => {
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
  };
  const onMouseLeave = () => {
    setHovered(false);
    cardRef.current.style.transform = "perspective(900px) rotateY(0) rotateX(0) translateY(0)";
    cardRef.current.style.transition = "transform .6s var(--ease), box-shadow .4s";
  };
  const onMouseEnter = () => {
    setHovered(true);
    cardRef.current.style.transition = "transform .1s linear, box-shadow .3s";
  };

  return (
    <div ref={cardRef} className="hotel-card card-shine" onClick={() => navigate("hotel", hotel)} style={{ display: "flex", flexDirection: "column", willChange: "transform" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseMove={onMouseMove}>
      <div className="hotel-card-img" style={{ height: 220 }}>
        <div className="hotel-card-img-inner" style={{ height: "100%", background: hotel.gradient, position: "relative", overflow: "hidden" }}>
          <DestVisual name={hotel.city} w="100%" h="220" />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.25)", opacity: hovered ? 1 : 0, transition: "opacity .4s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "rgba(201,168,76,.9)", color: "var(--ink)", fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", padding: "9px 18px", borderRadius: 6, transform: hovered ? "scale(1)" : "scale(.8)", transition: "transform .4s var(--ease)" }}>View Hotel</div>
        </div>
        <div style={{ position: "absolute", top: 14, left: 14 }}><span className="badge badge-gold">{hotel.category}</span></div>
        <button onClick={e => { e.stopPropagation(); onWishlist(hotel.id); }} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "transform .3s var(--ease), box-shadow .3s", transform: saved ? "scale(1.2)" : "scale(1)", boxShadow: saved ? "0 4px 16px rgba(214,48,49,.3)" : "none" }}>
          <Ic n={saved ? "heartF" : "heart"} s={15} c={saved ? "#d63031" : "var(--slate)"} />
        </button>
      </div>
      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>{hotel.city}, {hotel.country}</div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 500, color: "var(--navy)", lineHeight: 1.25 }}>{hotel.name}</h3>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.35rem", fontWeight: 600, color: hovered ? "var(--gold-dk)" : "var(--navy)", transition: "color .3s" }}>${hotel.priceFrom}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)" }}>per night</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Stars rating={hotel.stars} />
          <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--slate)", fontWeight: 500 }}>{hotel.rating}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)" }}>({hotel.reviews.toLocaleString()})</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {hotel.tags.slice(0, 3).map(t => <span key={t} className="amenity">{t}</span>)}
          {hotel.tags.length > 3 && <span className="amenity">+{hotel.tags.length - 3}</span>}
        </div>
        <div style={{ marginTop: "auto" }}>
          <button className="btn-gold" style={{ width: "100%", justifyContent: "center", transform: hovered ? "translateY(-1px)" : "translateY(0)", transition: "transform .3s var(--ease)", boxShadow: hovered ? "0 8px 24px rgba(201,168,76,.4)" : "none" }} onClick={e => { e.stopPropagation(); navigate("hotel", hotel); }}>
            <span>View Rooms</span><Ic n="arrow" s={14} c="var(--ink)" />
          </button>
        </div>
      </div>
    </div>
  );
};
