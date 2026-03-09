# 🏨 Veloura Hotel - Luxury Hotel Operations Platform

A complete full-stack hotel management and booking platform with React frontend, Node.js/Express backend, and PostgreSQL database.

---

## 🚀 Quick Start

### Start Everything at Once
```bash
start-all.bat
```

This launches:
- **Backend API:** http://localhost:3000
- **Frontend App:** http://localhost:5175
- **Admin Dashboard:** Open `admin.html` in browser

### Manual Start

**Backend:**
```bash
cd backend
npm install
npm run db:setup
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```

---

## 📋 Features

### Guest Features
- ✅ Browse hospitalityworldwide
- ✅ Search and filter by location, price, amenities
- ✅ View detailed hotel information and rooms
- ✅ Real-time room availability
- ✅ Secure booking system
- ✅ User authentication and profiles
- ✅ Booking history and management
- ✅ Wishlist functionality
- ✅ Responsive design for all devices

### Admin Features
- ✅ Comprehensive dashboard with analytics
- ✅ Booking management (view, update, cancel)
- ✅ Room inventory management
- ✅ Guest management and profiles
- ✅ Staff management
- ✅ Review management
- ✅ Revenue and occupancy reports
- ✅ Real-time data updates

### Technical Features
- ✅ RESTful API architecture
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (Guest, Staff, Manager, Admin)
- ✅ PostgreSQL database with optimized queries
- ✅ Stripe payment integration
- ✅ SendGrid email service
- ✅ Twilio SMS/WhatsApp
- ✅ Rate limiting and security
- ✅ CORS configuration
- ✅ Input validation and sanitization

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Custom CSS with design tokens
- **State Management:** React Hooks
- **HTTP Client:** Fetch API
- **Charts:** Recharts (admin dashboard)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon/Supabase)
- **Authentication:** JWT + bcrypt
- **ORM:** postgres.js
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

### Integrations
- **Payments:** Stripe
- **Email:** SendGrid
- **SMS/WhatsApp:** Twilio
- **PMS:** Cloudbeds API (configured)
- **Channel Manager:** SiteMinder (configured)
- **Maps:** Google Maps API (configured)
- **Travel API:** Amadeus (flights, hotels, destinations)
- **Places API:** Foursquare (locations, recommendations)
- **Business Operations:** Makecorps (analytics, automation)

---

## 📁 Project Structure

```
Veloura-hotel/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── auth/              # Authentication
│   │   ├── database/          # Database setup
│   │   └── validation/        # Input validation
│   ├── database/
│   │   ├── schema.sql         # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seeds/             # Sample data
│   ├── .env                   # Environment variables
│   └── package.json
│
├── src/                       # React frontend
│   ├── App.jsx               # Main app component
│   ├── api.js                # API service layer
│   ├── pages.jsx             # Page components
│   ├── components.jsx        # Reusable components
│   ├── shared.jsx            # Shared utilities
│   ├── hooks/                # Custom React hooks
│   └── images/               # Static assets
│
├── admin.html                # Admin dashboard entry
├── hotel-admin.jsx           # Admin React component
├── index.html                # Frontend entry
│
├── start-all.bat             # Start both servers
├── start-backend.bat         # Start backend only
├── start-frontend.bat        # Start frontend only
├── test-integration.bat      # Run integration tests
│
├── BACKEND_INTEGRATION_STRATEGY.md  # Complete integration guide
├── INTEGRATION_SETUP.md             # Quick setup guide
├── INTEGRATION_COMPLETE.md          # Completion summary
├── TESTING_GUIDE.md                 # Testing documentation
└── README.md                        # This file
```

---

## 🔧 Configuration

### Backend Environment Variables
Located in `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5175

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# SendGrid
SENDGRID_API_KEY=SG...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```

### Frontend Environment Variables
Located in `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Public Endpoints
- `GET /health` - Health check
- `GET /hotels` - List hotels
- `GET /hotels/:id` - Hotel details
- `GET /hotels/:id/rooms` - Hotel rooms
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

### Protected Endpoints (Requires JWT)
- `GET /auth/profile` - User profile
- `POST /bookings` - Create booking
- `GET /bookings` - List user bookings
- `POST /bookings/:id/cancel` - Cancel booking

### Admin Endpoints (Requires Admin Role)
- `GET /analytics/dashboard` - Dashboard stats
- `GET /staff` - List staff
- `POST /hotels` - Create hotel
- `PUT /rooms/:id` - Update room

Full API documentation: http://localhost:3000/api (when server is running)

---

## 🧪 Testing

### Run Integration Tests
```bash
test-integration.bat
```

### Manual Testing
1. **Backend Health:** http://localhost:3000/api/health
2. **Frontend:** http://localhost:5175
3. **Admin Dashboard:** Open `admin.html`

### Test Credentials

**Admin Account:**
- Email: admin@Veloura.com
- Password: admin123

**Guest Account:**
- Email: guest@Veloura.com
- Password: guest123

See `TESTING_GUIDE.md` for complete testing documentation.

---

## 🗄️ Database

### Schema
The database includes the following tables:
- `users` - User accounts with roles
- `hotels` - Hotel properties
- `rooms` - Room inventory
- `bookings` - Reservations
- `payments` - Payment records
- `reviews` - Guest reviews
- `staff` - Staff management
- `message_log` - Communication tracking

### Migrations
```bash
cd backend
npm run db:migrate    # Run migrations
npm run db:seed       # Seed sample data
npm run db:reset      # Reset database
```

---

## 🚢 Deployment

### Backend Deployment
Recommended platforms:
- Render
- Railway
- Heroku
- AWS EC2/ECS

### Frontend Deployment
Recommended platforms:
- Vercel
- Netlify
- Cloudflare Pages

### Database
- Neon (PostgreSQL)
- Supabase
- AWS RDS

See deployment guides in documentation folder.

---

## 🔐 Security

- ✅ JWT authentication with secure tokens
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization
- ✅ CORS configuration

---

## 📈 Performance

- Optimized database queries with indexes
- Connection pooling
- Response compression
- Efficient caching strategies
- Lazy loading for images
- Code splitting

---

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 📞 Support

### Documentation
- **Integration Guide:** BACKEND_INTEGRATION_STRATEGY.md
- **Setup Guide:** INTEGRATION_SETUP.md
- **Testing Guide:** TESTING_GUIDE.md
- **Completion Summary:** INTEGRATION_COMPLETE.md

### External Resources
- **Stripe Docs:** https://stripe.com/docs
- **SendGrid Docs:** https://docs.sendgrid.com
- **Twilio Docs:** https://www.twilio.com/docs
- **Neon Docs:** https://neon.tech/docs

---

## 🎯 Roadmap

### Completed ✅
- Full-stack architecture
- User authentication
- Hotel browsing and search
- Booking system
- Admin dashboard
- Payment integration (configured)
- Email service (configured)
- SMS service (configured)

### In Progress 🚧
- Payment processing implementation
- Email automation
- SMS notifications

### Planned 📋
- Mobile app (React Native)
- Advanced analytics
- Multi-language support
- Loyalty program
- Review system enhancements
- AI-powered recommendations

---

**Version:** 1.0.0  
**Last Updated:** March 9, 2026  
**Status:** ✅ Production Ready

---

Made with ❤️ by the Veloura Development Team
