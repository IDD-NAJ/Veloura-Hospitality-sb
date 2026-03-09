import { useState, useEffect } from "react";
import { Ic, Stars, Magnetic, Particles, useInView, useParallax, useCounter } from "./shared.jsx";
import { SearchBar, HotelCard } from "./components.jsx";
import DestVisual from "./DestVisual.jsx";
import { authAPI, hotelsAPI, bookingsAPI, statsAPI } from "./api.js";

// ─── Animated trust-strip counters ─────────────────────────────────────────
const TrustCounters = ({ stats }) => {
  const [ref, vis] = useInView(0.3);
  const c1 = useCounter(stats?.totalHotels || 0, 1600, vis);
  const c2 = useCounter(stats?.totalCountries || 0, 1200, vis);
  const rating = stats?.avgRating ? `${stats.avgRating.toFixed(1)}★` : "—";
  const support = stats?.support || "24/7";
  
  return (
    <div ref={ref} style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
      {[
        [vis && c1 > 0 ? c1.toLocaleString() + "+" : "—", "Hotels Worldwide"],
        [vis && c2 > 0 ? c2.toString() : "—", "Countries"],
        [rating, "Average Rating"],
        [support, "Concierge Support"],
      ].map(([n, l], i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)", transition: `opacity .6s var(--ease) ${i * .1}s, transform .6s var(--ease) ${i * .1}s` }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 600, color: "var(--navy)", minWidth: 60, display: "inline-block" }}>{n}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", letterSpacing: ".08em", color: "var(--fog)", textTransform: "uppercase" }}>{l}</span>
        </div>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  HOME PAGE
// ════════════════════════════════════════════════════════════════════════════
export const HomePage = ({ navigate, wishlist, onWishlist }) => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const parallax = useParallax(0.25);
  const [r1, v1] = useInView(); const [r2, v2] = useInView(); const [r3, v3] = useInView(); const [r4, v4] = useInView();
  
  // Real data from APIs
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // Load each API independently to allow partial success
        const results = await Promise.allSettled([
          hotelsAPI.getFeatured(3),
          statsAPI.getDestinations(),
          statsAPI.getSummary()
        ]);
        
        if (!isMounted) return;
        
        // Handle featured hotels
        if (results[0].status === 'fulfilled') {
          setFeaturedHotels(results[0].value);
        } else {
          console.error('Failed to load featured hotels:', results[0].reason);
          setFeaturedHotels([]);
        }
        
        // Handle destinations
        if (results[1].status === 'fulfilled') {
          setDestinations(results[1].value);
        } else {
          console.error('Failed to load destinations:', results[1].reason);
          setDestinations([]);
        }
        
        // Handle stats
        if (results[2].status === 'fulfilled') {
          setStats(results[2].value);
        } else {
          console.error('Failed to load stats:', results[2].reason);
          setStats(null);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const heroSlides = [
    { title: "Sleep Above the Clouds", sub: "Rooftop suites in the world's greatest cities", city: "Paris" },
    { title: "The Caldera Awaits", sub: "Cliffside cave suites above the Aegean Sea", city: "Santorini" },
    { title: "Ancient Silence", sub: "Ryokan retreats in the heart of old Kyoto", city: "Tokyo" },
  ];

  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 6000); return () => clearInterval(t); }, []);

  const h = heroSlides[activeSlide];

  return (
    <div className="page">
      {/* HERO */}
      <section style={{ height: "100vh", minHeight: 700, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transition: "all 1.4s cubic-bezier(0.16,1,0.3,1)", transform: `translateY(${parallax}px) scale(1.12)`, transformOrigin: "center top" }}>
          <DestVisual name={h.city} w="100%" h="100%" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.35) 0%,rgba(0,0,0,.05) 40%,rgba(0,0,0,.75) 100%)" }} />
        </div>
        <Particles count={22} color="rgba(201,168,76," />
        <div style={{ position: "absolute", top: "15%", right: "8%", width: 320, height: 320, pointerEvents: "none", opacity: .12 }}>
          <div className="spin-ring" style={{ position: "absolute", inset: 0, border: "1px solid var(--gold)", borderRadius: "50%" }} />
          <div className="spin-ring-rev" style={{ position: "absolute", inset: 30, border: "1px dashed var(--gold-lt)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", inset: "50%", width: 8, height: 8, marginTop: -4, marginLeft: -4, borderRadius: "50%", background: "var(--gold)", animation: "orbit 8s linear infinite" }} />
          <div style={{ position: "absolute", inset: "50%", width: 5, height: 5, marginTop: -2.5, marginLeft: -2.5, borderRadius: "50%", background: "var(--gold-lt)", animation: "orbitSlow 12s linear infinite reverse" }} />
        </div>
        {/* Scroll indicator */}
        <div className="scroll-indicator" style={{ bottom: 140 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>Scroll</div>
          <div className="scroll-indicator-line" />
        </div>
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 5 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setActiveSlide(i)} style={{ width: i === activeSlide ? 28 : 7, height: 7, borderRadius: 4, background: i === activeSlide ? "var(--gold)" : "rgba(255,255,255,.4)", border: "none", cursor: "pointer", transition: "all .4s var(--ease)", padding: 0 }} />
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 1380, margin: "0 auto", padding: "0 28px" }}>
          <div key={activeSlide} style={{ maxWidth: 700 }}>
            <div className="eyebrow" style={{ color: "var(--gold-lt)", marginBottom: 22, opacity: heroLoaded ? 1 : 0, transition: "opacity .9s .1s", animation: "slideRight .8s var(--ease) .05s both" }}>
              Featured · {h.city}
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(3rem,6vw,6rem)", color: "#fff", lineHeight: 1.05, marginBottom: 22, animation: "fadeUpBig .9s var(--ease) .15s both" }}>{h.title}</h1>
            <div style={{ width: 0, height: 2, background: "linear-gradient(90deg,var(--gold),var(--gold-lt))", marginBottom: 22, animation: "drawLine 1.2s var(--ease) .6s forwards", borderRadius: 2 }} />
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.1rem", color: "rgba(255,255,255,.7)", marginBottom: 48, fontWeight: 300, lineHeight: 1.7, animation: "fadeUp .8s var(--ease) .4s both" }}>{h.sub}</p>
            <div style={{ animation: "fadeUp .8s var(--ease) .6s both" }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Magnetic>
                  <button className="btn-gold" onClick={() => navigate("hotels")} style={{ position: "relative", overflow: "hidden" }}>
                    <span>Explore Hotels</span><Ic n="arrow" s={14} c="var(--ink)" />
                  </button>
                </Magnetic>
                <button className="btn-outline-white" onClick={() => navigate("destinations")}>View Destinations</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, padding: "0 28px", zIndex: 10 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <SearchBar onSearch={() => navigate("hotels")} />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div style={{ background: "var(--white)", padding: "40px 28px", borderTop: "1px solid var(--linen)", borderBottom: "1px solid var(--linen)" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto" }}>
          <TrustCounters stats={stats} />
        </div>
      </div>

      {/* FEATURED HOTELS */}
      <section style={{ padding: "90px 28px" }}>
        <div ref={r1} style={{ maxWidth: 1380, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, opacity: v1 ? 1 : 0, transition: "all .8s var(--ease)" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Curated Selection</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "var(--navy)" }}>
                Our finest <em style={{ fontStyle: "italic" }}>properties</em>
                <span style={{ display: "block", width: v1 ? "80%" : 0, height: 2, background: "linear-gradient(90deg,var(--gold),transparent)", marginTop: 8, transition: "width 1.2s var(--ease) .3s", borderRadius: 2 }} />
              </h2>
            </div>
            <button className="btn-outline" onClick={() => navigate("hotels")}>View All Hotels <Ic n="arrow" s={14} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {loadingData ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ background: "var(--linen)", borderRadius: 14, height: 400, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))
            ) : featuredHotels.length > 0 ? (
              featuredHotels.map((hotel, i) => (
                <div key={hotel.id} style={{ opacity: v1 ? 1 : 0, transform: v1 ? "translateY(0)" : "translateY(40px)", transition: `all .8s var(--ease) ${i * .12}s` }}>
                  <HotelCard hotel={hotel} navigate={navigate} wishlist={wishlist} onWishlist={onWishlist} />
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "var(--fog)" }}>
                <Ic n="hotel" s={48} c="var(--mist)" />
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", marginTop: 16 }}>No featured hotels available</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section style={{ padding: "0 0 90px" }}>
        <div ref={r2} style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 50, opacity: v2 ? 1 : 0, transition: "all .8s" }}>
            <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 14 }}>Top Destinations</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "var(--navy)" }}>Where will you go <em>next?</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {loadingData ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: "var(--linen)", borderRadius: 14, height: i < 3 ? 300 : 220, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))
            ) : destinations.length > 0 ? (
              destinations.map((dest, i) => (
                <div key={dest.name} onClick={() => navigate("hotels")} className="dest-card" style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative", height: i < 2 ? 300 : 220, opacity: v2 ? 1 : 0, transition: `opacity .8s var(--ease) ${i * .1}s, transform .8s var(--ease) ${i * .1}s, box-shadow .6s var(--ease)`, transform: v2 ? "translateY(0)" : "translateY(40px)" }}>
                  <div className="dest-img" style={{ position: "absolute", inset: 0, transition: "transform .7s var(--ease)" }}><DestVisual name={dest.name} w="100%" h="100%" /></div>
                  <div className="dest-overlay" />
                  <div style={{ position: "absolute", bottom: 0, left: 0, padding: 22 }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "#fff", fontWeight: 400, lineHeight: 1.2 }}>{dest.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "rgba(255,255,255,.6)" }}>{dest.hotels} hotels · {dest.country}</div>
                      <span className="dest-arrow"><Ic n="arrow" s={13} c="var(--gold-lt)" /></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "var(--fog)" }}>
                <Ic n="globe" s={48} c="var(--mist)" />
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", marginTop: 16 }}>No destinations available</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "var(--navy)", padding: "90px 28px", position: "relative", overflow: "hidden" }}>
        <Particles count={14} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(201,168,76,.06)", pointerEvents: "none" }} />
        <div className="spin-ring" style={{ position: "absolute", top: "50%", left: "50%", width: 550, height: 550, marginTop: -275, marginLeft: -275, borderRadius: "50%", border: "1px dashed rgba(201,168,76,.08)", pointerEvents: "none" }} />
        <div ref={r3} style={{ maxWidth: 1380, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>Simple Process</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 300, color: "#fff", marginBottom: 60 }}>Book your stay in <em style={{ color: "var(--gold-lt)" }}>3 steps</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 40 }}>
            {[
              { icon: "search", step: "01", title: "Discover", desc: "Search thousands of hand-verified luxury properties by destination, dates, and preferences." },
              { icon: "calendar", step: "02", title: "Choose & Book", desc: "Compare rooms, read genuine reviews, and book instantly with free cancellation on most stays." },
              { icon: "conf", step: "03", title: "Experience", desc: "Receive your confirmation instantly and enjoy our 24/7 concierge support throughout your stay." },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{ opacity: v3 ? 1 : 0, transform: v3 ? "translateY(0)" : "translateY(40px)", transition: `opacity .8s var(--ease) ${i * .15}s, transform .8s var(--ease) ${i * .15}s`, background: "rgba(255,255,255,.03)", borderRadius: 16, padding: "32px 24px", border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", position: "relative", transition: "all .4s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,.25)"; e.currentTarget.style.transform = "scale(1.15) rotate(-5deg)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(201,168,76,.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,.1)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <Ic n={s.icon} s={28} c="var(--gold)" />
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--gold)", letterSpacing: ".14em", marginBottom: 10 }}>STEP {s.step}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "#fff", fontWeight: 400, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,.5)", lineHeight: 1.8, fontSize: ".88rem" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEALS */}
      <section style={{ padding: "90px 28px", background: "var(--linen)" }}>
        <div ref={r4} style={{ maxWidth: 1380, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Limited Time</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 300, color: "var(--navy)" }}>Exclusive <em>offers</em></h2>
            </div>
            <button className="btn-outline" onClick={() => navigate("deals")}>All Deals <Ic n="arrow" s={14} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { label: "Early Bird", discount: "30% Off", desc: "Book 30+ days ahead", hotels: "Select luxury hotels", color: "var(--navy)" },
              { label: "Weekend Escape", discount: "20% Off", desc: "Fri–Sun stays", hotels: "200+ city properties", color: "var(--ocean)" },
              { label: "Last Minute", discount: "Up to 40%", desc: "Check-in within 7 days", hotels: "While availability lasts", color: "#3a1a0a" },
            ].map((deal, i) => (
              <div key={i} onClick={() => navigate("deals")} className="deal-card" style={{ background: deal.color, borderRadius: 14, padding: "32px 28px", cursor: "pointer", position: "relative", overflow: "hidden", opacity: v4 ? 1 : 0, transition: `opacity .8s var(--ease) ${i * .12}s, transform .8s var(--ease) ${i * .12}s, box-shadow .4s var(--ease)`, transform: v4 ? "translateY(0)" : "translateY(40px)" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
                <div style={{ position: "absolute", bottom: -40, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
                <span className="badge" style={{ background: "rgba(201,168,76,.2)", color: "var(--gold-lt)", marginBottom: 16 }}>{deal.label}</span>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.8rem", fontWeight: 300, color: "var(--gold-lt)", lineHeight: 1, marginBottom: 10 }}>{deal.discount}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".9rem", color: "rgba(255,255,255,.7)", marginBottom: 4 }}>{deal.desc}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "rgba(255,255,255,.4)" }}>{deal.hotels}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center"
          }}
        >
          <source src="/src/images/6005532_Receptionist_Woman_3840x2160.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,25,35,0.85) 0%, rgba(26,51,82,0.75) 50%, rgba(15,25,35,0.9) 100%)" }} />
        <Particles count={20} />
        {[300, 450, 620].map((size, i) => (
          <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: size, height: size, marginTop: -size / 2, marginLeft: -size / 2, borderRadius: "50%", border: "1px solid rgba(201,168,76,.07)", animation: `pulseFast ${4 + i}s ease-in-out ${i * 0.8}s infinite`, pointerEvents: "none" }} />
        ))}
        <div style={{ position: "relative", maxWidth: 620, margin: "0 auto", zIndex: 2 }}>
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 20 }}>Members Only</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 300, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
            Join Veloura <em style={{ color: "var(--gold-lt)" }}>Elite</em><br />and save on every stay
          </h2>
          <p style={{ color: "rgba(255,255,255,.55)", maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.85, fontSize: ".95rem" }}>Exclusive rates, room upgrades, priority support, and late check-out as standard. No fees, ever.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Magnetic>
              <button className="btn-gold" onClick={() => navigate("hotels")} style={{ fontSize: ".95rem", padding: "15px 36px" }}><span>Start Exploring</span><Ic n="arrow" s={15} c="var(--ink)" /></button>
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
export const HotelsPage = ({ navigate, wishlist, onWishlist }) => {
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState(1500);
  const [starFilter, setStarFilter] = useState([]);
  const [catFilter, setCatFilter] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    hotelsAPI.list()
      .then(data => { 
        if (isMounted) {
          setHotels(data); 
          setLoadingHotels(false);
        }
      })
      .catch(err => { 
        console.error('Failed to load hotels:', err);
        if (isMounted) {
          setError(err.message);
          setLoadingHotels(false);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, []);

  const allHotels = hotels;

  const toggleStar = s => setStarFilter(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleCat = c => setCatFilter(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const filtered = allHotels.filter(h => {
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
      <div style={{ background: "var(--navy)", padding: "48px 28px 36px" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Browse</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "#fff" }}>hospitality<em style={{ color: "var(--gold-lt)" }}>Worldwide</em></h1>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "rgba(255,255,255,.4)" }}>{filtered.length} properties found</div>
          </div>
          <SearchBar onSearch={() => {}} compact={true} />
        </div>
      </div>

      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "32px 28px", display: "flex", gap: 30 }}>
        {sidebarOpen && (
          <aside style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: "var(--white)", borderRadius: 14, padding: "22px 20px", border: "1.5px solid var(--linen)", position: "sticky", top: 90 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 500, color: "var(--navy)" }}>Filters</div>
                <button onClick={() => { setStarFilter([]); setCatFilter([]); setPriceRange(1500); }} style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--gold-dk)", background: "none", border: "none", cursor: "pointer" }}>Clear all</button>
              </div>
              <div className="filter-section">
                <div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 14 }}>Price per night</div>
                <input type="range" min="100" max="1500" value={priceRange} onChange={e => setPriceRange(+e.target.value)} style={{ marginBottom: 8 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--fog)" }}>
                  <span>$100</span><span style={{ color: "var(--navy)", fontWeight: 600 }}>Up to ${priceRange}</span>
                </div>
              </div>
              <div className="filter-section">
                <div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 12 }}>Star Rating</div>
                {[5, 4, 3].map(s => (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={starFilter.includes(s)} onChange={() => toggleStar(s)} style={{ width: 16, height: 16, accentColor: "var(--gold-dk)", cursor: "pointer" }} />
                    <Stars rating={s} size={12} /><span style={{ fontFamily: "var(--sans)", fontSize: ".83rem", color: "var(--slate)" }}>{s} Stars</span>
                  </label>
                ))}
              </div>
              <div className="filter-section">
                <div style={{ fontFamily: "var(--sans)", fontSize: ".85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 12 }}>Category</div>
                {["Luxury", "Resort", "Boutique", "Urban", "Lodge"].map(cat => (
                  <label key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={catFilter.includes(cat)} onChange={() => toggleCat(cat)} style={{ width: 16, height: 16, accentColor: "var(--gold-dk)", cursor: "pointer" }} />
                    <span style={{ fontFamily: "var(--sans)", fontSize: ".83rem", color: "var(--slate)" }}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1.5px solid var(--linen)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--sans)", fontSize: ".82rem", color: "var(--slate)" }}><Ic n="filter" s={14} c="var(--slate)" />{sidebarOpen ? "Hide" : "Show"} Filters</button>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontFamily: "var(--mono)", fontSize: ".78rem", padding: "8px 14px", border: "1.5px solid var(--linen)", borderRadius: 8, background: "#fff", cursor: "pointer", color: "var(--navy)", outline: "none" }}>
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div style={{ display: "flex", border: "1.5px solid var(--linen)", borderRadius: 8, overflow: "hidden" }}>
                {["grid", "list"].map(m => <button key={m} onClick={() => setViewMode(m)} style={{ padding: "8px 10px", background: viewMode === m ? "var(--navy)" : "#fff", border: "none", cursor: "pointer" }}><Ic n={m} s={15} c={viewMode === m ? "#fff" : "var(--fog)"} /></button>)}
              </div>
            </div>
          </div>

          {loadingHotels ? (
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill,minmax(300px,1fr))" : "1fr", gap: 20 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: "var(--linen)", borderRadius: 14, height: viewMode === "grid" ? 400 : 200, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Ic n="alert" s={40} c="var(--mist)" />
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--fog)", marginTop: 16, marginBottom: 8 }}>Failed to load hotels</div>
              <div style={{ color: "var(--slate)", marginBottom: 20 }}>{error}</div>
              <button className="btn-outline" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Ic n="search" s={40} c="var(--mist)" />
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--fog)", marginTop: 16, marginBottom: 8 }}>
                {allHotels.length === 0 ? "No hotels available" : "No hotels match your filters"}
              </div>
              {allHotels.length > 0 && (
                <button className="btn-outline" onClick={() => { setStarFilter([]); setCatFilter([]); setPriceRange(1500); }}>Clear Filters</button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
              {filtered.map(h => <HotelCard key={h.id} hotel={h} navigate={navigate} wishlist={wishlist} onWishlist={onWishlist} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map(h => (
                <div key={h.id} onClick={() => navigate("hotel", h)} className="hotel-list-row" style={{ background: "var(--white)", borderRadius: 14, display: "flex", overflow: "hidden", cursor: "pointer", border: "1.5px solid var(--linen)" }}>
                  <div style={{ width: 260, flexShrink: 0, position: "relative" }}>
                    <DestVisual name={h.city} w="260" h="200" />
                    <div style={{ position: "absolute", top: 12, left: 12 }}><span className="badge badge-gold">{h.category}</span></div>
                  </div>
                  <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)", textTransform: "uppercase", marginBottom: 5 }}>{h.city}, {h.country}</div>
                        <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.35rem", color: "var(--navy)", marginBottom: 8 }}>{h.name}</h3>
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><Stars rating={h.stars} /><span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--slate)" }}>{h.rating} ({h.reviews.toLocaleString()})</span></div>
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
export const HotelDetailPage = ({ hotel, navigate, onBook, user, onLogin, wishlist, onWishlist }) => {
  const [h, setH] = useState(hotel);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [r1, v1] = useInView();
  const [loading, setLoading] = useState(!hotel || !hotel.rooms);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    if (hotel?.id) {
      setLoading(true);
      hotelsAPI.getWithRooms(hotel.id)
        .then(full => { 
          if (!isMounted) return;
          if (full) {
            setH(full);
          } else {
            setError('Hotel not found');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load hotel details:', err);
          if (isMounted) {
            setError(err.message);
            setLoading(false);
          }
        });
    } else if (!hotel) {
      setError('No hotel selected');
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [hotel?.id]);

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, border: '3px solid var(--linen)', borderTop: '3px solid var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--slate)' }}>Loading hotel details...</div>
        </div>
      </div>
    );
  }

  if (error || !h) {
    return (
      <div className="page" style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Ic n="alert" s={60} c="var(--mist)" />
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', color: 'var(--navy)', marginTop: 20, marginBottom: 10 }}>Hotel Not Found</div>
          <div style={{ color: 'var(--slate)', marginBottom: 30 }}>{error || 'The hotel you are looking for does not exist.'}</div>
          <button className="btn-gold" onClick={() => navigate('hotels')}>
            <span>Browse Hotels</span>
            <Ic n="arrow" s={14} c="var(--ink)" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 70 }}>
      <div style={{ height: 420, background: h.gradient, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}><DestVisual name={h.city} w="100%" h="420" /></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.6))" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 28px 36px", maxWidth: 1380, margin: "0 auto" }}>
          <button onClick={() => navigate("hotels")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.6)", fontFamily: "var(--mono)", fontSize: ".72rem", marginBottom: 20 }}><Ic n="arrowL" s={14} c="rgba(255,255,255,.6)" />Back to Hotels</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span className="badge" style={{ background: "rgba(201,168,76,.2)", color: "var(--gold-lt)", marginBottom: 12 }}>{h.category}</span>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 8 }}>{h.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Stars rating={h.stars} />
                <span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "rgba(255,255,255,.8)" }}>{h.rating} · {h.reviews.toLocaleString()} reviews</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,.6)", fontFamily: "var(--mono)", fontSize: ".72rem" }}><Ic n="pin" s={12} c="var(--gold)" />{h.city}, {h.country}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => onWishlist(h.id)} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: wishlist?.includes(h.id) ? "#d63031" : "#fff", fontFamily: "var(--sans)", fontSize: ".83rem" }}>
                <Ic n={wishlist?.includes(h.id) ? "heartF" : "heart"} s={14} c={wishlist?.includes(h.id) ? "#d63031" : "#fff"} />{wishlist?.includes(h.id) ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--linen)", marginTop: 8 }}>
          {["overview", "rooms", "amenities", "location", "reviews"].map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, padding: "40px 0 60px", alignItems: "start" }}>
          <div>
            {activeTab === "overview" && (
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "var(--navy)", fontWeight: 400, marginBottom: 16 }}>About the Hotel</h2>
                <p style={{ color: "var(--slate)", lineHeight: 1.9, marginBottom: 32, fontSize: ".95rem" }}>{h.desc}</p>
                <div className="gold-rule" style={{ marginBottom: 32 }} />
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--navy)", marginBottom: 20 }}>Top Amenities</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {h.amenities.map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--white)", border: "1.5px solid var(--linen)", borderRadius: 10, padding: "10px 16px" }}>
                      <Ic n={a} s={16} c="var(--gold-dk)" />
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
                    <div key={room.id} onClick={() => setSelectedRoom(room)} className={`room-card${selectedRoom?.id === room.id ? " selected" : ""}`} style={{ background: "var(--white)", border: `2px solid ${selectedRoom?.id === room.id ? "var(--gold)" : "var(--linen)"}`, borderRadius: 14, padding: 24, cursor: "pointer", opacity: v1 ? 1 : 0, transform: v1 ? "translateY(0)" : "translateY(20px)", transition: `opacity .7s var(--ease) ${i * .12}s, transform .7s var(--ease) ${i * .12}s, border-color .25s, box-shadow .25s` }}>
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
                  {[["Connectivity", ["wifi", "High-Speed WiFi", "Fiber 1Gbps throughout"], ["tv", "Smart TVs", "50\" 4K in all rooms"]],
                    ["Dining", ["restaurant", "Fine Dining", "Award-winning cuisine"], ["coffee", "In-Room Dining", "24-hour service"]],
                    ["Wellness", ["pool", "Heated Pool", "Indoor & outdoor"], ["spa", "Spa & Wellness", "Full-service treatments"]],
                    ["Services", ["car", "Airport Transfer", "Private vehicle"], ["gym", "Fitness Center", "State-of-the-art equipment"]]
                  ].map(([cat, ...items]) => (
                    <div key={cat} style={{ background: "var(--white)", borderRadius: 12, padding: 20, border: "1.5px solid var(--linen)" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold-dk)", marginBottom: 14 }}>{cat}</div>
                      {items.map(([icon, label, desc]) => (
                        <div key={label} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(201,168,76,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic n={icon} s={16} c="var(--gold-dk)" /></div>
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
                  <div className="map-grid" />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                    <Ic n="pin" s={36} c="var(--gold)" />
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "#fff" }}>{h.city}, {h.country}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "rgba(255,255,255,.5)" }}>{Math.abs(h.lat).toFixed(4)}°{h.lat >= 0 ? "N" : "S"}, {Math.abs(h.lng).toFixed(4)}°{h.lng >= 0 ? "E" : "W"}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--sans)", color: "var(--slate)", lineHeight: 1.8 }}>Situated in the heart of {h.city}, {h.name} offers convenient access to major attractions, transport links, and the city's finest dining.</div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, background: "var(--white)", borderRadius: 14, padding: 24, border: "1.5px solid var(--linen)" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "3.5rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1 }}>{h.rating}</div>
                    <Stars rating={h.rating} size={16} />
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginTop: 6 }}>{h.reviews.toLocaleString()} reviews</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[["Cleanliness", 4.9], ["Service", 4.8], ["Location", 4.7], ["Value", 4.6]].map(([label, val], ri) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--slate)", width: 100 }}>{label}</span>
                        <div style={{ flex: 1, height: 4, background: "var(--linen)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${val / 5 * 100}%`, height: "100%", background: "linear-gradient(90deg,var(--gold-dk),var(--gold-lt))", borderRadius: 2, animation: `drawLine .9s var(--ease) ${ri * .1 + .3}s both`, transformOrigin: "left" }} />
                        </div>
                        <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", fontWeight: 600, color: "var(--navy)", width: 28 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {[
                  { name: "Sophie M.", rating: 5, text: "Absolutely impeccable. The views are exactly as described and the service was extraordinary from the moment we arrived.", date: "February 2026" },
                  { name: "James W.", rating: 5, text: "We stayed for our anniversary and couldn't have chosen better. The staff remembered small details and made every moment feel special.", date: "January 2026" },
                  { name: "Priya K.", rating: 4, text: "Stunning property with world-class facilities. The spa alone is worth the visit. Only minor feedback: breakfast wait times.", date: "December 2025" }
                ].map((rev, i) => (
                  <div key={i} className="review-card" style={{ background: "var(--white)", borderRadius: 12, padding: 20, marginBottom: 14, border: "1.5px solid var(--linen)", animation: `fadeUp .6s var(--ease) ${i * .12}s both` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--ocean),var(--slate))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: ".72rem", color: "#fff" }}>{rev.name[0]}</div>
                        <div>
                          <div style={{ fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 500, color: "var(--navy)" }}>{rev.name}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--fog)" }}>{rev.date}</div>
                        </div>
                      </div>
                      <Stars rating={rev.rating} size={13} />
                    </div>
                    <p style={{ fontFamily: "var(--serif)", fontSize: ".95rem", color: "var(--slate)", lineHeight: 1.75, fontStyle: "italic" }}>{rev.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
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
                <div className="field"><label>Check In</label><input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
                <div className="field"><label>Check Out</label><input type="date" defaultValue={new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]} /></div>
                <div className="field"><label>Guests</label><select>{[1, 2, 3, 4].map(n => <option key={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}</select></div>
              </div>
              <button className="btn-gold book-sidebar-btn" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: ".9rem" }}
                onClick={() => { if (!user) { onLogin(); } else { onBook(h, selectedRoom || h.rooms[0]); navigate("confirmation"); } }}>
                <Ic n="lock" s={15} c="var(--ink)" /><span>Reserve Now</span>
              </button>
              <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--fog)", marginTop: 12 }}>Free cancellation · No prepayment required</div>
              <div className="gold-rule" style={{ margin: "18px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["check", "Best price guarantee"], ["conf", "Instant confirmation"], ["lock", "Secure payment"]].map(([ico, txt]) => (
                  <div key={txt} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--sans)", fontSize: ".82rem", color: "var(--slate)" }}>
                    <Ic n={ico} s={13} c="var(--emerald)" />{txt}
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
export const DestinationsPage = ({ navigate }) => {
  const [r1, v1] = useInView();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.getDestinations()
      .then(data => {
        setDestinations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load destinations:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page" style={{ paddingTop: 70 }}>
      <div style={{ background: "var(--navy)", padding: "60px 28px 50px", textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>Explore the World</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 300, color: "#fff", marginBottom: 16 }}>Top <em style={{ color: "var(--gold-lt)" }}>Destinations</em></h1>
        <p style={{ color: "rgba(255,255,255,.55)", maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>Hand-curated cities with the world's finest hotel collections, from iconic skylines to remote island retreats.</p>
      </div>
      <div ref={r1} style={{ maxWidth: 1380, margin: "0 auto", padding: "70px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: "var(--linen)", borderRadius: 16, height: 300, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))
          ) : destinations.length > 0 ? (
            destinations.map((dest, i) => (
            <div key={dest.name} onClick={() => navigate("hotels")} className="dest-card" style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", height: 300, position: "relative", opacity: v1 ? 1 : 0, transform: v1 ? "translateY(0)" : "translateY(40px)", transition: `opacity .8s var(--ease) ${i * .1}s, transform .8s var(--ease) ${i * .1}s, box-shadow .6s var(--ease)` }}>
              <div className="dest-img" style={{ position: "absolute", inset: 0, transition: "transform .7s var(--ease)" }}><DestVisual name={dest.name} w="100%" h="300" /></div>
              <div className="dest-overlay" />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "#fff", fontWeight: 400, marginBottom: 4 }}>{dest.name}</h2>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "rgba(255,255,255,.6)" }}>{dest.country}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="badge" style={{ background: "rgba(201,168,76,.25)", color: "var(--gold-lt)" }}>{dest.hotels} hotels</span>
                    <span className="dest-arrow"><Ic n="arrow" s={14} c="var(--gold-lt)" /></span>
                  </div>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "var(--fog)" }}>
              <Ic n="globe" s={48} c="var(--mist)" />
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", marginTop: 16 }}>No destinations available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  DEALS PAGE
// ════════════════════════════════════════════════════════════════════════════
export const DealsPage = ({ navigate }) => {
  const deals = [
    { label: "Early Bird Special", discount: "30% Off", desc: "Book at least 30 days in advance and save big on our most popular luxury suites.", expiry: "Ongoing", hotels: "400+ hotels", code: "EARLY30" },
    { label: "Weekend Getaway", discount: "20% Off", desc: "Check in Friday, check out Sunday — and enjoy 20% off all room types.", expiry: "Every Weekend", hotels: "200+ city hotels", code: "WEEKEND20" },
    { label: "Last Minute Luxury", discount: "Up to 40% Off", desc: "Booking within 7 days? Some of our finest suites are released at dramatic discounts.", expiry: "Limited availability", hotels: "Selected properties", code: "LASTMIN" },
    { label: "Honeymoon Package", discount: "Complimentary Upgrades", desc: "Receive a complimentary room upgrade, champagne on arrival, and late check-out.", expiry: "Ongoing", hotels: "All properties", code: "HONEYMOON" },
    { label: "Business Traveller", discount: "15% Off + Perks", desc: "For frequent business travellers: enjoy 15% off plus complimentary breakfast.", expiry: "Ongoing", hotels: "All properties", code: "BIZ15" },
    { label: "Family Escape", discount: "Kids Stay Free", desc: "Children under 12 stay absolutely free when sharing with parents.", expiry: "Ongoing", hotels: "Family-friendly properties", code: "FAMILY" },
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
          {deals.map((deal, di) => (
            <div key={deal.label} onClick={() => navigate("hotels")} className="deal-card" style={{ background: "var(--white)", borderRadius: 16, padding: 28, border: "1.5px solid var(--linen)", cursor: "pointer", position: "relative", overflow: "hidden", animation: `fadeUp .7s var(--ease) ${di * .08}s both` }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(201,168,76,.06)" }} />
              <span className="badge badge-gold" style={{ marginBottom: 16 }}>{deal.label}</span>
              <div style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", fontWeight: 300, color: "var(--navy)", lineHeight: 1.1, marginBottom: 12 }}>{deal.discount}</div>
              <p style={{ color: "var(--fog)", lineHeight: 1.75, fontSize: ".85rem", marginBottom: 20 }}>{deal.desc}</p>
              <div className="gold-rule" style={{ marginBottom: 18 }} />
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
//  ABOUT PAGE
// ════════════════════════════════════════════════════════════════════════════
export const AboutPage = ({ navigate }) => {
  const [r1, v1] = useInView(); const [r2, v2] = useInView();
  return (
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
          <button className="btn-navy" onClick={() => navigate("hotels")}><span>Explore Our Collection</span><Ic n="arrow" s={14} c="var(--sand)" /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, opacity: v1 ? 1 : 0, transform: v1 ? "translateX(0)" : "translateX(48px)", transition: "all .9s var(--ease) .1s" }}>
          {[["12,000+", "Curated Properties"], ["180", "Countries"], ["2.4M+", "Happy Guests"], ["4.9★", "Average Rating"]].map(([n, l], i) => (
            <div key={l} className="stat-card" style={{ background: "var(--navy)", borderRadius: 14, padding: 24, textAlign: "center", animation: `float ${4 + i * 0.8}s ease-in-out ${i * 0.4}s infinite` }}>
              <div className="glow-number" style={{ marginBottom: 6, animationDelay: `${i * .15}s` }}>{n}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="gold-rule" style={{ marginBottom: 90 }} />
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 14 }}>Why Choose Veloura</div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--navy)" }}>The Veloura <em>difference</em></h2>
      </div>
      <div ref={r2} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 30 }}>
        {[
          { icon: "conf", title: "Verified Excellence", desc: "Every property is personally inspected by our team. No hotel makes it onto our platform without meeting our strict quality standards." },
          { icon: "lock", title: "Secure & Transparent", desc: "Bank-level encryption, no hidden fees, and full cancellation transparency. What you see is exactly what you pay." },
          { icon: "phone", title: "24/7 Concierge", desc: "Our global team of luxury travel experts is available around the clock, in 28 languages, to handle any request." }
        ].map((item, i) => (
          <div key={i} className="step-card" style={{ textAlign: "center", padding: "32px 24px", background: "var(--white)", borderRadius: 14, border: "1.5px solid var(--linen)", opacity: v2 ? 1 : 0, transform: v2 ? "translateY(0)" : "translateY(40px)", transition: `opacity .8s var(--ease) ${i * .15}s, transform .8s var(--ease) ${i * .15}s` }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", transition: "transform .4s var(--ease), box-shadow .4s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2) rotate(-8deg)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,168,76,.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <Ic n={item.icon} s={24} c="var(--ink)" />
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", color: "var(--navy)", marginBottom: 12, fontWeight: 500 }}>{item.title}</h3>
            <p style={{ color: "var(--fog)", lineHeight: 1.8, fontSize: ".87rem" }}>{item.desc}</p>
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
export const ConfirmationPage = ({ navigate, booking }) => {
  const [confNum] = useState(`VLR-${Date.now().toString(36).toUpperCase().slice(-6)}`);
  return (
    <div className="page" style={{ paddingTop: 70, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--sand) 0%,var(--linen) 100%)" }}>
      <div style={{ background: "var(--white)", borderRadius: 20, padding: "56px 48px", maxWidth: 540, width: "100%", margin: "20px", boxShadow: "0 30px 80px rgba(0,0,0,.12)", textAlign: "center", animation: "zoomIn .5s var(--ease)", position: "relative", overflow: "hidden" }}>
        {/* Decorative rings */}
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 200, height: 200, marginTop: -100, marginLeft: -100, borderRadius: "50%", border: "1px solid rgba(201,168,76,.08)", pointerEvents: "none" }} className="check-ring-1" />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 280, height: 280, marginTop: -140, marginLeft: -140, borderRadius: "50%", border: "1px solid rgba(201,168,76,.05)", pointerEvents: "none" }} className="check-ring-2" />
        <div className="check-bounce" style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(201,168,76,.4)" }}>
          <Ic n="check" s={40} c="var(--ink)" sw={2.5} />
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
          <button className="btn-gold" onClick={() => navigate("bookings")} style={{ flex: 1, justifyContent: "center" }}><Ic n="booking" s={14} c="var(--ink)" /><span>My Bookings</span></button>
          <button className="btn-outline" onClick={() => navigate("home")} style={{ flex: 1, justifyContent: "center" }}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  MY BOOKINGS PAGE
// ════════════════════════════════════════════════════════════════════════════
export const BookingsPage = ({ navigate, user, bookings }) => {
  if (!user) return (
    <div className="page" style={{ paddingTop: 70, minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Ic n="lock" s={44} c="var(--mist)" />
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
            <Ic n="booking" s={44} c="var(--mist)" />
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--navy)", marginTop: 16, marginBottom: 8 }}>No bookings yet</div>
            <p style={{ color: "var(--fog)", marginBottom: 28 }}>Start exploring our collection of luxury hotels.</p>
            <button className="btn-gold" onClick={() => navigate("hotels")}><span>Browse Hotels</span><Ic n="arrow" s={14} c="var(--ink)" /></button>
          </div>
        ) : bookings.map((b, i) => (
          <div key={i} style={{ background: "var(--white)", borderRadius: 14, padding: 24, marginBottom: 14, border: "1.5px solid var(--linen)", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 100, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
              <DestVisual name={b.hotel?.city || "paris"} w="100" h="80" />
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
//  AUTH MODAL
// ════════════════════════════════════════════════════════════════════════════
export const AuthModal = ({ mode: initMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState(initMode || "signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const errs = {};
    if (mode === "signup" && !form.name.trim()) errs.name = "Name is required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (form.password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      let user;
      if (mode === "signin") {
        user = await authAPI.login(form.email, form.password);
      } else {
        user = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      }
      onSuccess(user);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || "Authentication failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ padding: "28px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/src/images/freepik__create-favicon-for-hospitality-website-Veloura-sty__31023.png" alt="Veloura Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 500, color: "var(--navy)" }}>Veloura</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,.04)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="close" s={16} c="var(--slate)" /></button>
        </div>
        <div style={{ padding: "24px 28px 0" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", color: "var(--navy)", fontWeight: 400, marginBottom: 6 }}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "var(--fog)", fontSize: ".85rem", marginBottom: 28 }}>
            {mode === "signin" ? "Sign in to access your bookings and exclusive rates." : "Join Veloura for member-only prices and perks."}
          </p>
          {errors.form && (
            <div style={{ background: "rgba(214,48,49,.08)", border: "1px solid rgba(214,48,49,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 22, display: "flex", gap: 8, alignItems: "center" }}>
              <Ic n="alert" s={14} c="var(--ruby)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--ruby)" }}>{errors.form}</span>
            </div>
          )}
          <div style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 22, display: "flex", gap: 8, alignItems: "center" }}>
            <Ic n="alert" s={14} c="var(--gold-dk)" />
            <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--gold-dk)" }}>Admin: admin@Veloura.com · Manager: manager@Veloura.com (pw: Admin@2024!)</span>
          </div>
        </div>
        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <div className="field">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Alexandra Chen" />
              {errors.name && <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--ruby)", marginTop: 4 }}>{errors.name}</div>}
            </div>
          )}
          <div className="field">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" />
            {errors.email && <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--ruby)", marginTop: 4 }}>{errors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handle} placeholder="••••••••" style={{ paddingRight: 40 }} />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}><Ic n={showPw ? "eyeOff" : "eye"} s={16} c="var(--fog)" /></button>
            </div>
            {errors.password && <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--ruby)", marginTop: 4 }}>{errors.password}</div>}
          </div>
          <button onClick={submit} className="btn-gold" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: ".9rem", marginTop: 4, opacity: loading ? .7 : 1 }}>
            <span>{loading ? "Signing in…" : mode === "signin" ? "Sign In" : "Create Account"}</span>
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
