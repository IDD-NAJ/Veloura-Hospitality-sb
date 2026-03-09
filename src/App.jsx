import { useState, useEffect, useCallback } from "react";
import { useToast, ScrollProgress, Toast } from "./shared.jsx";
import { Navbar, Footer } from "./components.jsx";
import {
  HomePage, HotelsPage, HotelDetailPage, DestinationsPage,
  DealsPage, AboutPage, ConfirmationPage, BookingsPage, AuthModal
} from "./pages.jsx";
import { authAPI, bookingsAPI } from "./api.js";
import Preloader from "./Preloader.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [pageData, setPageData] = useState(null);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lastBooking, setLastBooking] = useState(null);
  const [toast, showToast] = useToast();

  // Restore session on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (authAPI.isLoggedIn()) {
        try {
          const profile = await authAPI.getProfile();
          if (profile) {
            setUser(profile);
            // Load user bookings
            const userBookings = await bookingsAPI.list();
            setBookings(userBookings);
          }
        } catch (err) {
          console.error("Failed to load user data:", err);
        }
      }
    };
    loadUserData();
  }, []);

  const navigate = useCallback((pg, data = null) => {
    setPage(pg);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onWishlist = id => {
    // Require login to add to wishlist
    if (!user) {
      showToast("Please sign in to save to wishlist", "🔒");
      setAuthOpen(true);
      return;
    }
    
    setWishlist(p => {
      const saved = p.includes(id);
      const next = saved ? p.filter(x => x !== id) : [...p, id];
      showToast(saved ? "Removed from wishlist" : "Saved to wishlist", saved ? "✕" : "♡");
      return next;
    });
  };

  const onLogin = () => setAuthOpen(true);
  const onLogout = () => { authAPI.logout(); setUser(null); showToast("Signed out successfully", "👋"); };

  const onBook = async (hotel, room) => {
    const checkIn = new Date().toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
    
    try {
      // Create booking via API
      const apiBooking = await bookingsAPI.create({
        roomId: room.id,
        hotelId: hotel.id,
        checkIn,
        checkOut,
        guests: 2,
        adults: 2,
      });

      // Transform for local state
      const booking = {
        ...apiBooking,
        hotel,
        room,
        nights: 3,
        total: room.price * 3,
        guests: "2 Guests",
      };

      setLastBooking(booking);
      setBookings(p => [booking, ...p]);
      navigate("confirmation");
      showToast("Booking confirmed!", "✓");
    } catch (err) {
      console.error("Booking failed:", err);
      showToast(err.message || "Booking failed. Please try again.", "✕");
    }
  };

  const noLayout = ["confirmation"];
  const base = { navigate, user, wishlist, onWishlist };

  const renderPage = () => {
    switch (page) {
      case "home":         return <HomePage {...base} />;
      case "hotels":       return <HotelsPage {...base} />;
      case "hotel":        return <HotelDetailPage {...base} hotel={pageData} onBook={onBook} onLogin={onLogin} />;
      case "destinations": return <DestinationsPage {...base} />;
      case "deals":        return <DealsPage {...base} />;
      case "about":        return <AboutPage {...base} />;
      case "bookings":     return <BookingsPage {...base} bookings={bookings} />;
      case "confirmation": return <ConfirmationPage navigate={navigate} booking={lastBooking} />;
      default:             return <HomePage {...base} />;
    }
  };

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <ScrollProgress />
        <Toast t={toast} />
        {!noLayout.includes(page) && (
          <Navbar navigate={navigate} page={page} user={user} onLogin={onLogin} onLogout={onLogout} />
        )}
        <main style={{ flex: 1 }}>{renderPage()}</main>
        {!noLayout.includes(page) && <Footer navigate={navigate} />}
        {authOpen && (
          <AuthModal
            mode="signin"
            onClose={() => setAuthOpen(false)}
            onSuccess={u => { setUser(u); showToast(`Welcome back, ${u.name.split(" ")[0]}!`, "🏨"); }}
          />
        )}
      </div>
    </>
  );
}
