# Veloura Hotel Backend

Complete Node.js backend for Veloura Hotel Operations Platform with full PMS integration, channel management, and payment processing.

## Features

- **Hotel Operations**: Complete reservation management, room inventory, guest services
- **PMS Integration**: Cloudbeds API integration for property management
- **Channel Management**: SiteMinder integration for OTA distribution
- **Payments**: Stripe integration with multiple payment methods
- **Communications**: SendGrid email, Twilio SMS/WhatsApp
- **Analytics**: Revenue reporting, occupancy analytics, channel performance
- **Authentication**: JWT-based auth with role-based access control
- **Real-time**: WebSocket support for live updates
- **Database**: Neon PostgreSQL with optimized queries

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Neon PostgreSQL
- **Auth**: JWT + bcrypt
- **Payments**: Stripe
- **Email**: SendGrid
- **SMS**: Twilio
- **PMS**: Cloudbeds API
- **Channel Manager**: SiteMinder API
- **Maps**: Google Maps API

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Start the server:
```bash
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/Veloura

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG....

# Twilio
TWILIO_ACCOUNT_SID=AC....
TWILIO_AUTH_TOKEN=....
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Cloudbeds
CLOUDBEDS_CLIENT_ID=....
CLOUDBEDS_CLIENT_SECRET=....
CLOUDBEDS_PROPERTY_ID=....

# SiteMinder
SITEMINDER_API_KEY=....

# Google Maps
GOOGLE_MAPS_API_KEY=....

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## API Documentation

Base URL: `http://localhost:3000/api`

### Health & Info
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Server health check + integration status |
| GET | `/` | — | API info and available endpoints |

### Authentication (`/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | User login (returns JWT) |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | JWT | Logout (invalidate refresh token) |
| POST | `/auth/forgot-password` | — | Request password reset email |
| POST | `/auth/reset-password` | — | Reset password with token |
| POST | `/auth/verify-email` | — | Verify email address |
| GET | `/auth/profile` | JWT | Get current user profile |
| PUT | `/auth/profile` | JWT | Update user profile |
| PUT | `/auth/change-password` | JWT | Change password |

### Hotels (`/hotels`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/hotels` | — | List all hotels (public, filterable) |
| POST | `/hotels` | Admin | Create a new hotel |
| GET | `/hotels/:id` | — | Get hotel by ID (public) |
| GET | `/hotels/:id/details` | JWT | Get hotel with stats |
| PUT | `/hotels/:id` | Admin/Manager | Update hotel |
| DELETE | `/hotels/:id` | Admin | Deactivate hotel |
| GET | `/hotels/:id/rooms` | — | List hotel rooms (filterable) |
| GET | `/hotels/:id/analytics` | Admin/Manager | Hotel analytics dashboard |

### Rooms (`/hotels/rooms`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/hotels/rooms` | Admin/Manager | Create a room |
| GET | `/hotels/rooms/search` | — | Search available rooms by date/guests |
| GET | `/hotels/rooms/:id` | — | Get room by ID |
| PUT | `/hotels/rooms/:id` | Admin/Manager | Update room |
| PUT | `/hotels/rooms/:id/status` | Staff+ | Update room status |
| GET | `/hotels/rooms/:id/availability` | — | Check room availability |
| GET | `/hotels/rooms/:id/rates` | — | Get room rates for date range |
| POST | `/hotels/rooms/:id/rates` | Admin/Manager | Set room rates |
| GET | `/hotels/rooms/:id/performance` | Admin/Manager | Room performance metrics |
| DELETE | `/hotels/rooms/:id` | Admin | Mark room out of order |

### Bookings (`/bookings`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bookings` | JWT | List bookings (guests see own only) |
| POST | `/bookings` | JWT | Create a new booking |
| GET | `/bookings/:id` | JWT | Get booking by ID |
| GET | `/bookings/ref/:ref` | Optional | Lookup booking by reference |
| PUT | `/bookings/:id` | JWT | Update booking |
| POST | `/bookings/:id/checkin` | Staff+ | Check-in guest |
| POST | `/bookings/:id/checkout` | Staff+ | Check-out guest |
| POST | `/bookings/:id/cancel` | JWT | Cancel booking |
| POST | `/bookings/:id/no-show` | Staff+ | Mark as no-show |
| GET | `/bookings/today/arrivals` | Staff+ | Today's arrivals |
| GET | `/bookings/today/departures` | Staff+ | Today's departures |

### Payments (`/payments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payments` | Admin/Manager | List payments |
| POST | `/payments/create-intent` | JWT | Create Stripe PaymentIntent |
| GET | `/payments/status/:id` | JWT | Get payment status |
| POST | `/payments/confirm` | JWT | Confirm payment |
| POST | `/payments/refund` | Admin/Manager | Process refund |
| GET | `/payments/:id` | JWT | Get payment by ID |

### Staff (`/staff`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/staff` | Admin/Manager | List staff members |
| POST | `/staff` | Admin/Manager | Create staff member |
| GET | `/staff/:id` | Staff+ | Get staff details |
| PUT | `/staff/:id` | Admin/Manager | Update staff member |
| DELETE | `/staff/:id` | Admin | Remove staff member |
| GET | `/staff/:id/performance` | Admin/Manager | Staff performance metrics |

### Reviews (`/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/hotel/:hotelId` | Optional | List hotel reviews |
| GET | `/reviews/hotel/:hotelId/rating` | — | Average hotel rating |
| GET | `/reviews/:id` | — | Get single review |
| POST | `/reviews` | JWT | Submit a review |
| POST | `/reviews/:id/respond` | Admin/Manager | Respond to review |
| PATCH | `/reviews/:id/visibility` | Admin | Toggle review visibility |

### Analytics (`/analytics`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/dashboard` | Admin/Manager | Combined dashboard stats |
| GET | `/analytics/revenue` | Admin/Manager | Revenue analytics |
| GET | `/analytics/occupancy` | Admin/Manager | Occupancy analytics |
| GET | `/analytics/channels` | Admin/Manager | Channel performance |
| GET | `/analytics/demographics` | Admin/Manager | Guest demographics |
| GET | `/analytics/rooms` | Admin/Manager | Room performance |
| POST | `/analytics/reports/generate` | Admin/Manager | Generate a report |
| GET | `/analytics/reports` | Admin/Manager | List generated reports |

### Integrations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/integrations/cloudbeds/sync` | Admin | Sync reservations from Cloudbeds |
| POST | `/integrations/siteminder/sync` | Admin | Push ARI to OTA channels |
| GET | `/integrations/siteminder/channels/:id` | Admin | List OTA channels |
| PATCH | `/integrations/siteminder/channels/:pid/:cid` | Admin | Toggle OTA channel |
| GET | `/integrations/maps/geocode` | — | Geocode an address |
| GET | `/integrations/maps/nearby` | — | Find nearby places |

### Messaging
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/messaging/sms` | Admin | Send SMS via Twilio |
| POST | `/messaging/whatsapp` | Admin | Send WhatsApp via Twilio |
| POST | `/messaging/email` | Admin | Send email via SendGrid |

### Webhooks (`/webhooks`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/webhooks/stripe` | Stripe Sig | Stripe payment events |
| POST | `/webhooks/cloudbeds` | API Key | Cloudbeds reservation events |
| POST | `/webhooks/siteminder` | API Key | SiteMinder OTA events |
| POST | `/webhooks/twilio/status` | — | Twilio delivery status |
| POST | `/webhooks/sendgrid/events` | — | SendGrid delivery events |

## Database Schema

See `database/schema.sql` for complete database schema including:
- Users (guests, staff, admin)
- Hotels and properties
- Rooms and inventory
- Bookings and reservations
- Payments and transactions
- Reviews and ratings
- Staff management
- Message logs

## Integration Services

### Cloudbeds PMS
- Reservation synchronization
- Room status updates
- Guest information sync
- Housekeeping management

### SiteMinder Channel Manager
- Availability updates
- Rate management
- Channel configuration
- Booking imports

### Stripe Payments
- Payment processing
- Subscription management
- Webhook handling
- Refund processing

### SendGrid Email
- Booking confirmations
- Pre-arrival reminders
- Post-stay communications
- Marketing emails

### Twilio Communications
- SMS notifications
- WhatsApp messaging
- Two-factor authentication
- Guest communications

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Migrations
```bash
npm run db:migrate
```

### Seeding Data
```bash
npm run db:seed
```

## Deployment

### Docker
```bash
docker build -t Veloura-backend .
docker run -p 3000:3000 Veloura-backend
```

### Environment Setup
1. Configure all environment variables
2. Run database migrations
3. Set up webhooks (Stripe, external services)
4. Configure CORS and security settings

## Security

- JWT authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- SQL injection prevention
- Password hashing with bcrypt

## Monitoring

- Request logging with Morgan
- Error tracking and reporting
- Performance monitoring
- Database query optimization
- API response time tracking

## License

MIT License - see LICENSE file for details.
