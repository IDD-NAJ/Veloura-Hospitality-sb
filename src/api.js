// Veloura API Service Layer
// Connects the frontend to the backend, transforms data between formats

// Use relative path to leverage Vite proxy in development
// In production, set VITE_API_URL to the full backend URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Token management ────────────────────────────────────────────────────────
let accessToken = localStorage.getItem('Veloura_token');
let refreshToken = localStorage.getItem('Veloura_refresh');

const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem('Veloura_token', access);
  else localStorage.removeItem('Veloura_token');
  if (refresh) localStorage.setItem('Veloura_refresh', refresh);
  else localStorage.removeItem('Veloura_refresh');
};

const clearTokens = () => setTokens(null, null);

// ─── Base fetch wrapper ──────────────────────────────────────────────────────
const request = async (path, options = {}) => {
  try {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401 && refreshToken && !options._retried) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request(path, { ...options, _retried: true });
      }
      clearTokens();
    }

    const data = await res.json().catch(() => ({ success: false, message: 'Invalid response format' }));
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  } catch (error) {
    // Handle network errors gracefully
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

const get = (path) => request(path);
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

const refreshAccessToken = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken || refreshToken);
      return true;
    }
    return false;
  } catch { return false; }
};

// ─── Data transformers (backend → frontend) ──────────────────────────────────

// Map city names to visual/styling hints the frontend uses
const CITY_STYLES = {
  'Paris':     { gradient: 'linear-gradient(160deg,#1a3352 0%,#0f1923 100%)', accentColor: '#C9A84C', category: 'Luxury' },
  'Nice':      { gradient: 'linear-gradient(160deg,#1a4a6b 0%,#0d2a3a 100%)', accentColor: '#5BA0C8', category: 'Resort' },
  'Chamonix':  { gradient: 'linear-gradient(160deg,#2d1a0e 0%,#1a0a08 100%)', accentColor: '#C07840', category: 'Lodge' },
  'Oia':       { gradient: 'linear-gradient(160deg,#1a4a6b 0%,#0d2a3a 100%)', accentColor: '#5BA0C8', category: 'Resort' },
  'Kyoto':     { gradient: 'linear-gradient(160deg,#2d1a0e 0%,#1a0a08 100%)', accentColor: '#C07840', category: 'Boutique' },
  'Cape Town': { gradient: 'linear-gradient(160deg,#1a3a2a 0%,#0a1a12 100%)', accentColor: '#7AB878', category: 'Lodge' },
  'New York':  { gradient: 'linear-gradient(160deg,#1a1a2e 0%,#0a0a1a 100%)', accentColor: '#C9A84C', category: 'Urban' },
  'Ubud':      { gradient: 'linear-gradient(160deg,#1a3a1a 0%,#0a1a08 100%)', accentColor: '#78B878', category: 'Resort' },
};
const DEFAULT_STYLE = { gradient: 'linear-gradient(160deg,#1a2a3a 0%,#0a1520 100%)', accentColor: '#C9A84C', category: 'Luxury' };

const transformHotel = (h) => {
  const style = CITY_STYLES[h.city] || DEFAULT_STYLE;
  const amenities = Array.isArray(h.amenities) ? h.amenities : (typeof h.amenities === 'string' ? JSON.parse(h.amenities) : []);
  // Map full amenity names to icon keys the frontend uses
  const amenityIcons = amenities.map(a => {
    const lower = (a || '').toLowerCase();
    if (lower.includes('wifi')) return 'wifi';
    if (lower.includes('pool')) return 'pool';
    if (lower.includes('spa')) return 'spa';
    if (lower.includes('restaurant') || lower.includes('dining')) return 'restaurant';
    if (lower.includes('gym') || lower.includes('fitness')) return 'gym';
    if (lower.includes('parking') || lower.includes('valet') || lower.includes('transfer')) return 'car';
    if (lower.includes('air') || lower.includes('ac')) return 'ac';
    if (lower.includes('bar')) return 'restaurant';
    if (lower.includes('concierge') || lower.includes('room service')) return 'concierge';
    return lower.split(' ')[0];
  }).filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  return {
    id: h.id,
    name: h.name,
    city: h.city,
    country: h.country,
    stars: h.stars,
    rating: parseFloat(h.avg_rating) || 4.8,
    reviews: parseInt(h.review_count) || 0,
    priceFrom: parseFloat(h.price_from) || 0,
    category: style.category,
    tags: amenities.slice(0, 5),
    lat: parseFloat(h.latitude) || 0,
    lng: parseFloat(h.longitude) || 0,
    desc: h.description || '',
    amenities: amenityIcons,
    rooms: [],
    gradient: style.gradient,
    accentColor: style.accentColor,
  };
};

const transformRoom = (r) => {
  const amenities = Array.isArray(r.amenities) ? r.amenities : (typeof r.amenities === 'string' ? JSON.parse(r.amenities) : []);
  return {
    id: r.id,
    name: r.name,
    sqm: r.sqm,
    guests: r.max_guests,
    beds: r.bed_configuration || r.type,
    price: parseFloat(r.base_price),
    view: r.view_type || '',
    amenities,
    status: r.status,
    type: r.type,
    category: r.category,
  };
};

const transformUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  avatar: u.name ? u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??',
  loyaltyTier: u.loyalty_tier,
  loyaltyPoints: u.loyalty_points,
});

const transformBooking = (b) => ({
  id: b.id,
  ref: b.ref,
  hotelId: b.hotel_id,
  roomId: b.room_id,
  checkIn: b.check_in,
  checkOut: b.check_out,
  nights: b.nights,
  guests: b.guests,
  total: parseFloat(b.total_amount),
  status: b.status,
  paymentStatus: b.payment_status,
  source: b.source,
  hotelName: b.hotel_name,
  roomName: b.room_name,
});

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password) => {
    const res = await post('/auth/login', { email, password });
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      return transformUser(res.data.user);
    }
    throw new Error(res.message || 'Login failed');
  },

  register: async ({ name, email, password, phone }) => {
    const res = await post('/auth/register', { name, email, password, phone });
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      return transformUser(res.data.user);
    }
    throw new Error(res.message || 'Registration failed');
  },

  getProfile: async () => {
    const res = await get('/auth/profile');
    return res.data ? transformUser(res.data) : null;
  },

  logout: () => {
    clearTokens();
  },

  isLoggedIn: () => !!accessToken,
};

// ─── Hotels API ──────────────────────────────────────────────────────────────
export const hotelsAPI = {
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.country) params.set('country', filters.country);
    if (filters.stars) params.set('stars', filters.stars);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    const res = await get(`/hotels${qs ? '?' + qs : ''}`);
    return (res.data || []).map(transformHotel);
  },

  getFeatured: async (limit = 3) => {
    const res = await get(`/hotels/featured?limit=${limit}`);
    return (res.data || []).map(transformHotel);
  },

  getById: async (id) => {
    const res = await get(`/hotels/${id}`);
    return res.data ? transformHotel(res.data) : null;
  },

  getRooms: async (hotelId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    if (filters.max_guests) params.set('max_guests', filters.max_guests);
    const qs = params.toString();
    const res = await get(`/hotels/${hotelId}/rooms${qs ? '?' + qs : ''}`);
    return (res.data || []).map(transformRoom);
  },

  getWithRooms: async (id) => {
    const [hotel, rooms] = await Promise.all([
      hotelsAPI.getById(id),
      hotelsAPI.getRooms(id)
    ]);
    if (hotel) hotel.rooms = rooms;
    return hotel;
  },
};

// ─── Bookings API ────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: async ({ roomId, hotelId, checkIn, checkOut, guests, adults, children, notes }) => {
    const res = await post('/bookings', {
      room_id: roomId,
      hotel_id: hotelId,
      check_in: checkIn,
      check_out: checkOut,
      guests: guests || 2,
      adults: adults || 2,
      children: children || 0,
      notes,
    });
    return res.data ? transformBooking(res.data) : null;
  },

  list: async () => {
    const res = await get('/bookings');
    return (res.data || []).map(transformBooking);
  },

  getById: async (id) => {
    const res = await get(`/bookings/${id}`);
    return res.data ? transformBooking(res.data) : null;
  },

  cancel: async (id, reason) => {
    const res = await put(`/bookings/${id}/cancel`, { cancellation_reason: reason });
    return res.data ? transformBooking(res.data) : null;
  },
};

// ─── Reviews API ─────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getByHotel: async (hotelId) => {
    const res = await get(`/reviews?hotel_id=${hotelId}`);
    return res.data || [];
  },
};

// ─── Stats API ───────────────────────────────────────────────────────────────
export const statsAPI = {
  getSummary: async () => {
    const res = await get('/stats/summary');
    return res.data || null;
  },

  getDestinations: async () => {
    const res = await get('/stats/destinations');
    return res.data || [];
  },
};

// ─── Health check ────────────────────────────────────────────────────────────
export const checkHealth = async () => {
  try {
    const res = await get('/health');
    return res.success;
  } catch {
    return false;
  }
};
