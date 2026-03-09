# Veloura Hotel - Complete Backend Integration Strategy & Checklist

**Project Overview**: Full-stack hotel operations platform with React frontend, Node.js/Express backend, Neon PostgreSQL database, and third-party integrations (Stripe, Cloudbeds, SiteMinder, Twilio, SendGrid).

---

## 📋 PHASE 1: BACKEND FOUNDATION (Core Infrastructure)

### 1.1 Database Setup & Schema ✓
- [x] Neon PostgreSQL database provisioned
- [ ] Run database migrations (`npm run db:migrate`)
- [ ] Verify all tables created:
  - [ ] `users` (guests, staff, admin with roles)
  - [ ] `hotels` (properties with location data)
  - [ ] `rooms` (inventory with pricing)
  - [ ] `bookings` (reservations with status tracking)
  - [ ] `payments` (Stripe integration)
  - [ ] `reviews` (guest feedback)
  - [ ] `staff` (employee management)
  - [ ] `message_log` (communication tracking)
- [ ] Create indexes for performance optimization
- [ ] Set up database functions (`is_available` for room availability)
- [ ] Seed initial data (`npm run db:seed`)
- [ ] Test database connection from backend

**Files to verify:**
- `backend/src/database/setup.js`
- `backend/database/schema.sql`
- `backend/database/seeds/001-sample-data.sql`

---

### 1.2 Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Configure database connection:
  - [ ] `DATABASE_URL` (Neon PostgreSQL connection string)
- [ ] Set up authentication:
  - [ ] `JWT_SECRET` (generate secure random string)
  - [ ] `JWT_EXPIRES_IN` (default: 24h)
- [ ] Configure server settings:
  - [ ] `PORT` (default: 3000)
  - [ ] `NODE_ENV` (development/production)
  - [ ] `CORS_ORIGIN` (frontend URL)
- [ ] Test environment loading

**Action**: Create `.env` file with all required variables

---

### 1.3 Core Server Setup
- [ ] Install backend dependencies (`npm install` in `/backend`)
- [ ] Verify Express server configuration in `src/server.js`
- [ ] Test server startup (`npm run dev`)
- [ ] Verify middleware stack:
  - [ ] CORS configured for frontend origin
  - [ ] Helmet security headers
  - [ ] Compression enabled
  - [ ] Morgan request logging
  - [ ] Rate limiting configured
  - [ ] JSON body parsing
  - [ ] Error handling middleware
- [ ] Test health endpoint: `GET /api/health`
- [ ] Verify API documentation endpoint: `GET /api`

**Expected Response**: Server running on `http://localhost:3000`

---

## 📋 PHASE 2: AUTHENTICATION & USER MANAGEMENT

### 2.1 Authentication System
- [ ] Implement JWT token generation and validation
- [ ] Set up bcrypt password hashing
- [ ] Create authentication middleware
- [ ] Implement role-based access control (RBAC):
  - [ ] Guest role (basic access)
  - [ ] Staff role (operational access)
  - [ ] Manager role (property management)
  - [ ] Admin role (full access)
- [ ] Test authentication endpoints:
  - [ ] `POST /api/auth/register` (create new user)
  - [ ] `POST /api/auth/login` (get JWT tokens)
  - [ ] `POST /api/auth/refresh` (refresh access token)
  - [ ] `GET /api/auth/profile` (get current user)
  - [ ] `PUT /api/auth/profile` (update profile)
  - [ ] `POST /api/auth/logout` (invalidate tokens)

**Files to verify:**
- `backend/src/auth/jwt.js`
- `backend/src/auth/middleware.js`
- `backend/src/routes/auth.js`

---

### 2.2 Frontend Auth Integration
- [ ] Update `src/api.js` with correct `API_BASE` URL
- [ ] Test token storage in localStorage
- [ ] Implement auto-refresh on 401 responses
- [ ] Test login flow from frontend
- [ ] Test registration flow
- [ ] Test profile retrieval
- [ ] Verify token expiration handling
- [ ] Test logout functionality

**Test Scenarios:**
1. Register new user → receive tokens → auto-login
2. Login existing user → receive tokens → access protected routes
3. Token expires → auto-refresh → continue session
4. Manual logout → tokens cleared → redirect to login

---

## 📋 PHASE 3: CORE HOTEL OPERATIONS

### 3.1 Hotels & Rooms API
- [ ] Implement hotel CRUD operations:
  - [ ] `GET /api/hotels` (list with filters)
  - [ ] `GET /api/hotels/:id` (single hotel details)
  - [ ] `POST /api/hotels` (create - admin only)
  - [ ] `PUT /api/hotels/:id` (update - admin/manager)
  - [ ] `DELETE /api/hotels/:id` (soft delete - admin)
- [ ] Implement room management:
  - [ ] `GET /api/hotels/:id/rooms` (list hotel rooms)
  - [ ] `POST /api/hotels/rooms` (create room)
  - [ ] `GET /api/hotels/rooms/:id` (room details)
  - [ ] `PUT /api/hotels/rooms/:id` (update room)
  - [ ] `PUT /api/hotels/rooms/:id/status` (update status)
  - [ ] `GET /api/hotels/rooms/search` (availability search)
- [ ] Test data transformers in `src/api.js`:
  - [ ] `transformHotel()` maps backend → frontend format
  - [ ] `transformRoom()` handles amenities JSON parsing
  - [ ] City-based styling applied correctly

**Files to verify:**
- `backend/src/routes/hotels.js`
- `backend/src/routes/rooms.js`
- `src/api.js` (frontend transformers)

---

### 3.2 Frontend Hotel Integration
- [ ] Update `src/data.js` to fetch from API instead of mock data
- [ ] Test hotel listing page (`HotelsPage`)
- [ ] Test hotel detail page (`HotelDetailPage`)
- [ ] Verify room availability display
- [ ] Test search and filter functionality
- [ ] Verify amenity icons mapping correctly
- [ ] Test responsive design with real data

**Replace mock data with API calls in:**
- `src/pages.jsx` - Update `HomePage`, `HotelsPage`, `DestinationsPage`
- `src/data.js` - Replace `HOTELS` constant with API fetch

---

### 3.3 Booking System
- [ ] Implement booking endpoints:
  - [ ] `POST /api/bookings` (create booking)
  - [ ] `GET /api/bookings` (list user bookings)
  - [ ] `GET /api/bookings/:id` (booking details)
  - [ ] `GET /api/bookings/ref/:ref` (lookup by reference)
  - [ ] `PUT /api/bookings/:id` (update booking)
  - [ ] `POST /api/bookings/:id/cancel` (cancel booking)
  - [ ] `POST /api/bookings/:id/checkin` (staff check-in)
  - [ ] `POST /api/bookings/:id/checkout` (staff check-out)
- [ ] Implement booking validation:
  - [ ] Check room availability
  - [ ] Validate date ranges
  - [ ] Verify guest count vs room capacity
  - [ ] Calculate pricing with dynamic rates
- [ ] Test booking creation flow
- [ ] Verify booking reference generation
- [ ] Test booking status transitions

**Files to verify:**
- `backend/src/routes/bookings.js`
- `backend/src/services/bookingService.js`

---

### 3.4 Frontend Booking Integration
- [ ] Connect `onBook` handler in `App.jsx` to API
- [ ] Update `BookingsPage` to fetch from API
- [ ] Test booking creation from hotel detail page
- [ ] Verify confirmation page displays API data
- [ ] Test booking cancellation
- [ ] Implement booking history display
- [ ] Add loading states during API calls
- [ ] Add error handling for failed bookings

**Test Flow:**
1. Select hotel → Choose room → Click "Book Now"
2. API creates booking → Returns booking reference
3. Navigate to confirmation page → Display booking details
4. View "My Bookings" → See all user bookings

---

## 📋 PHASE 4: PAYMENT INTEGRATION

### 4.1 Stripe Setup
- [ ] Create Stripe account (or use existing)
- [ ] Get API keys from Stripe Dashboard
- [ ] Add to `.env`:
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Install Stripe SDK in backend (already in package.json)
- [ ] Configure Stripe webhook endpoint
- [ ] Test webhook signature verification

---

### 4.2 Payment Processing
- [ ] Implement payment endpoints:
  - [ ] `POST /api/payments/create-intent` (create PaymentIntent)
  - [ ] `GET /api/payments/status/:id` (check payment status)
  - [ ] `POST /api/payments/confirm` (confirm payment)
  - [ ] `POST /api/payments/refund` (process refund - admin)
- [ ] Link payments to bookings
- [ ] Update booking payment_status on success
- [ ] Handle payment failures gracefully
- [ ] Test webhook handling:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`

**Files to verify:**
- `backend/src/routes/payments.js`
- `backend/src/services/stripeService.js`
- `backend/src/routes/webhooks.js`

---

### 4.3 Frontend Payment Integration
- [ ] Install Stripe.js in frontend
- [ ] Add Stripe publishable key to frontend env
- [ ] Create payment form component
- [ ] Implement payment flow:
  1. Create booking → Get booking ID
  2. Create PaymentIntent → Get client secret
  3. Show Stripe payment form
  4. Confirm payment → Update booking status
- [ ] Test successful payment
- [ ] Test failed payment handling
- [ ] Add payment confirmation UI

---

## 📋 PHASE 5: THIRD-PARTY INTEGRATIONS

### 5.1 Email Service (SendGrid)
- [ ] Create SendGrid account
- [ ] Verify sender email domain
- [ ] Get API key → Add to `.env`
- [ ] Implement email templates:
  - [ ] Booking confirmation
  - [ ] Pre-arrival reminder (24h before check-in)
  - [ ] Post-stay thank you + review request
  - [ ] Password reset
  - [ ] Email verification
- [ ] Test email sending endpoint: `POST /api/messaging/email`
- [ ] Set up webhook for delivery tracking
- [ ] Implement automated email triggers

**Files to verify:**
- `backend/src/services/emailService.js`
- `backend/src/routes/messaging.js`

---

### 5.2 SMS/WhatsApp (Twilio)
- [ ] Create Twilio account
- [ ] Get phone number for SMS
- [ ] Get WhatsApp Business number
- [ ] Add credentials to `.env`:
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN`
  - [ ] `TWILIO_PHONE_NUMBER`
  - [ ] `TWILIO_WHATSAPP_NUMBER`
- [ ] Implement messaging endpoints:
  - [ ] `POST /api/messaging/sms`
  - [ ] `POST /api/messaging/whatsapp`
- [ ] Test SMS notifications
- [ ] Test WhatsApp messaging
- [ ] Set up delivery status webhooks

**Use Cases:**
- Booking confirmation SMS
- Check-in reminder (day before)
- Room ready notification
- Two-factor authentication

---

### 5.3 PMS Integration (Cloudbeds)
- [ ] Get Cloudbeds API credentials
- [ ] Add to `.env`:
  - [ ] `CLOUDBEDS_CLIENT_ID`
  - [ ] `CLOUDBEDS_CLIENT_SECRET`
  - [ ] `CLOUDBEDS_PROPERTY_ID`
- [ ] Implement OAuth flow for token management
- [ ] Create sync endpoints:
  - [ ] `POST /api/integrations/cloudbeds/sync` (pull reservations)
  - [ ] Sync room status updates
  - [ ] Sync guest information
  - [ ] Sync housekeeping status
- [ ] Set up webhook receiver for Cloudbeds events
- [ ] Test bidirectional sync
- [ ] Implement conflict resolution strategy

**Files to verify:**
- `backend/src/services/cloudbedsService.js`
- `backend/src/routes/integrations.js`

---

### 5.4 Channel Manager (SiteMinder)
- [ ] Get SiteMinder API key
- [ ] Add to `.env`: `SITEMINDER_API_KEY`
- [ ] Implement channel management:
  - [ ] `POST /api/integrations/siteminder/sync` (push ARI)
  - [ ] `GET /api/integrations/siteminder/channels/:id`
  - [ ] `PATCH /api/integrations/siteminder/channels/:pid/:cid` (toggle)
- [ ] Configure OTA channels (Booking.com, Expedia, Airbnb)
- [ ] Test availability updates
- [ ] Test rate updates
- [ ] Test restriction management
- [ ] Set up webhook for OTA bookings

**Purpose**: Distribute inventory to online travel agencies

---

### 5.5 Maps Integration (Google Maps)
- [ ] Get Google Maps API key
- [ ] Enable required APIs:
  - [ ] Maps JavaScript API
  - [ ] Geocoding API
  - [ ] Places API
- [ ] Add to `.env`: `GOOGLE_MAPS_API_KEY`
- [ ] Implement geocoding endpoint
- [ ] Test hotel location display
- [ ] Add nearby places search
- [ ] Implement distance calculations

---

## 📋 PHASE 6: ADMIN DASHBOARD INTEGRATION

### 6.1 Admin Backend APIs
- [ ] Implement analytics endpoints:
  - [ ] `GET /api/analytics/dashboard` (overview stats)
  - [ ] `GET /api/analytics/revenue` (revenue by period)
  - [ ] `GET /api/analytics/occupancy` (occupancy rates)
  - [ ] `GET /api/analytics/channels` (channel performance)
  - [ ] `GET /api/analytics/demographics` (guest data)
- [ ] Implement staff management:
  - [ ] `GET /api/staff` (list staff)
  - [ ] `POST /api/staff` (create staff member)
  - [ ] `PUT /api/staff/:id` (update staff)
  - [ ] `DELETE /api/staff/:id` (remove staff)
- [ ] Implement review management:
  - [ ] `GET /api/reviews` (all reviews)
  - [ ] `POST /api/reviews/:id/respond` (respond to review)
  - [ ] `PATCH /api/reviews/:id/visibility` (toggle visibility)

---

### 6.2 Admin Frontend Integration
- [ ] Update `hotel-admin.jsx` API calls:
  - [ ] Replace `adminRequest` with real backend URL
  - [ ] Update `adminAPI` object with all endpoints
  - [ ] Test authentication for admin users
- [ ] Connect dashboard stats to API
- [ ] Connect booking management to API
- [ ] Connect room management to API
- [ ] Connect guest management to API
- [ ] Connect staff management to API
- [ ] Test real-time updates (if WebSocket implemented)
- [ ] Verify charts display real data (Recharts)

**Files to update:**
- `hotel-admin.jsx` (lines 208-245)
- `admin.html` (ensure correct script loading)

---

## 📋 PHASE 7: TESTING & VALIDATION

### 7.1 Backend Testing
- [ ] Write unit tests for services
- [ ] Write integration tests for API endpoints
- [ ] Test authentication flows
- [ ] Test authorization (role-based access)
- [ ] Test database transactions
- [ ] Test error handling
- [ ] Test input validation
- [ ] Test rate limiting
- [ ] Run test suite: `npm test`
- [ ] Check test coverage

---

### 7.2 Frontend Testing
- [ ] Test all user flows end-to-end:
  - [ ] Browse hotels → View details → Book room → Pay → Confirm
  - [ ] Register → Login → View profile → Update profile
  - [ ] View bookings → Cancel booking
  - [ ] Leave review → View reviews
- [ ] Test error states:
  - [ ] Network errors
  - [ ] API errors (4xx, 5xx)
  - [ ] Validation errors
  - [ ] Payment failures
- [ ] Test loading states
- [ ] Test responsive design
- [ ] Test browser compatibility

---

### 7.3 Integration Testing
- [ ] Test frontend ↔ backend communication
- [ ] Test authentication token flow
- [ ] Test data synchronization
- [ ] Test webhook handling
- [ ] Test third-party integrations:
  - [ ] Stripe payment flow
  - [ ] SendGrid email delivery
  - [ ] Twilio SMS delivery
  - [ ] Cloudbeds sync
  - [ ] SiteMinder channel updates
- [ ] Test concurrent operations
- [ ] Test data consistency

---

## 📋 PHASE 8: DEPLOYMENT & PRODUCTION

### 8.1 Backend Deployment
- [ ] Choose hosting platform (Render, Railway, Heroku, AWS, etc.)
- [ ] Set up production database (Neon production instance)
- [ ] Configure production environment variables
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Run production migrations
- [ ] Deploy backend server
- [ ] Test production API endpoints

---

### 8.2 Frontend Deployment
- [ ] Update API_BASE to production backend URL
- [ ] Build frontend: `npm run build`
- [ ] Deploy to hosting (Vercel, Netlify, Cloudflare Pages)
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure environment variables
- [ ] Test production frontend
- [ ] Verify all API calls work in production

---

### 8.3 Post-Deployment
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure analytics (Google Analytics, Mixpanel)
- [ ] Set up uptime monitoring
- [ ] Configure backup automation
- [ ] Set up error alerting
- [ ] Create runbook for common issues
- [ ] Document deployment process
- [ ] Train team on admin dashboard

---

## 📋 PHASE 9: OPTIMIZATION & MAINTENANCE

### 9.1 Performance Optimization
- [ ] Optimize database queries (add indexes)
- [ ] Implement caching (Redis)
- [ ] Optimize API response times
- [ ] Implement pagination for large datasets
- [ ] Optimize image loading (lazy loading, CDN)
- [ ] Minimize bundle size
- [ ] Implement code splitting
- [ ] Add service worker for offline support

---

### 9.2 Security Hardening
- [ ] Implement rate limiting on all endpoints
- [ ] Add CSRF protection
- [ ] Implement SQL injection prevention
- [ ] Add XSS protection
- [ ] Configure security headers (Helmet.js)
- [ ] Implement input sanitization
- [ ] Add API request validation
- [ ] Set up security monitoring
- [ ] Conduct security audit
- [ ] Implement 2FA for admin users

---

### 9.3 Ongoing Maintenance
- [ ] Monitor error logs daily
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Backup database daily
- [ ] Test disaster recovery quarterly
- [ ] Review and update documentation
- [ ] Collect user feedback
- [ ] Plan feature enhancements

---

## 🔧 CRITICAL FILES CHECKLIST

### Backend Files to Verify/Create
- [ ] `backend/.env` (from .env.example)
- [ ] `backend/src/server.js` (main server file)
- [ ] `backend/src/config/database.js` (DB connection)
- [ ] `backend/src/database/setup.js` (migrations)
- [ ] `backend/src/database/schema.sql` (database schema)
- [ ] `backend/src/routes/*.js` (all route files)
- [ ] `backend/src/services/*.js` (business logic)
- [ ] `backend/src/auth/*.js` (authentication logic)

### Frontend Files to Update
- [ ] `src/api.js` (update API_BASE URL)
- [ ] `src/App.jsx` (connect to real API)
- [ ] `src/pages.jsx` (replace mock data)
- [ ] `src/data.js` (fetch from API)
- [ ] `hotel-admin.jsx` (admin API integration)
- [ ] `vite.config.js` (proxy configuration for dev)

---

## 🚀 QUICK START COMMANDS

```bash
# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run db:setup
npm run dev

# Frontend Setup (in new terminal)
cd ..
npm install
npm run dev

# Admin Dashboard (in new terminal)
# Open admin.html in browser or serve via HTTP server
```

---

## 📊 INTEGRATION STATUS DASHBOARD

| Component | Status | Priority | Notes |
|-----------|--------|----------|-------|
| Database | 🟡 Partial | HIGH | Schema exists, needs migration |
| Auth API | 🟡 Partial | HIGH | Backend ready, frontend needs update |
| Hotels API | 🟡 Partial | HIGH | Backend ready, frontend uses mock |
| Bookings API | 🟡 Partial | HIGH | Backend ready, frontend partial |
| Payments | 🔴 Not Started | HIGH | Needs Stripe keys |
| Email | 🔴 Not Started | MEDIUM | Needs SendGrid setup |
| SMS | 🔴 Not Started | LOW | Needs Twilio setup |
| Cloudbeds | 🔴 Not Started | MEDIUM | Needs credentials |
| SiteMinder | 🔴 Not Started | LOW | Needs API key |
| Admin Dashboard | 🟡 Partial | MEDIUM | UI ready, needs API connection |

**Legend**: 🟢 Complete | 🟡 Partial | 🔴 Not Started

---

## 🎯 RECOMMENDED EXECUTION ORDER

1. **Week 1**: Phase 1 (Database) + Phase 2 (Auth)
2. **Week 2**: Phase 3 (Hotels/Bookings) + Phase 4 (Payments)
3. **Week 3**: Phase 5 (Email/SMS) + Phase 6 (Admin)
4. **Week 4**: Phase 7 (Testing) + Phase 8 (Deployment)
5. **Ongoing**: Phase 9 (Optimization & Maintenance)

---

## 📞 SUPPORT & RESOURCES

- **Backend API Docs**: `http://localhost:3000/api` (when server running)
- **Database Schema**: `backend/database/schema.sql`
- **Environment Template**: `backend/.env.example`
- **Stripe Docs**: https://stripe.com/docs/api
- **SendGrid Docs**: https://docs.sendgrid.com
- **Twilio Docs**: https://www.twilio.com/docs
- **Cloudbeds API**: https://hotels.cloudbeds.com/api/docs
- **SiteMinder API**: https://developers.siteminder.com

---

**Last Updated**: 2026-03-09
**Version**: 1.0
**Maintainer**: Veloura Development Team
