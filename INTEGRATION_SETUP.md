# Veloura Backend Integration - Quick Setup Guide

## Current Status: Ready to Integrate

Your backend is configured with:
- ✅ Database credentials (Supabase/Neon PostgreSQL)
- ✅ Stripe payment keys (test mode)
- ✅ SendGrid email API
- ✅ Twilio SMS/WhatsApp
- ✅ JWT authentication configured
- ✅ Frontend API proxy configured

## Step 1: Install Dependencies & Start Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Run database setup (creates all tables and seeds data)
npm run db:setup

# Start the backend server
npm run dev
```

**Expected Output:**
```
✅ Database connected at [timestamp]
📐 Applying database schema...
✅ Schema applied successfully
🔄 Running migrations...
✅ All migrations are up to date
🌱 Running seed data...
✅ Seed completed: 001-sample-data
🎉 Done!

Server running on http://localhost:3000
```

## Step 2: Verify Backend is Running

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Veloura Hotel API is running",
  "timestamp": "2026-03-09T15:33:00.000Z",
  "database": "connected",
  "integrations": {
    "stripe": "configured",
    "sendgrid": "configured",
    "twilio": "configured"
  }
}
```

## Step 3: Start Frontend

In a new terminal:

```bash
# Navigate to project root
cd ..

# Install dependencies (if not already done)
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on: http://localhost:5173

## Step 4: Test Integration

### Test 1: Health Check
- Open browser to: http://localhost:5173
- Open browser console (F12)
- The frontend should load without errors

### Test 2: Hotels API
- Navigate to "Hotels" page
- Hotels should load from backend (not mock data)
- Check console for API calls to `/api/hotels`

### Test 3: Authentication
- Click "Sign In" or register a new account
- Test login flow
- Verify JWT token is stored in localStorage

### Test 4: Booking Flow
1. Select a hotel
2. Choose a room
3. Click "Book Now"
4. Complete booking form
5. Verify booking is created in database

## Step 5: Admin Dashboard

Open `admin.html` in browser or serve it:

```bash
# Option 1: Direct file
# Open admin.html in your browser

# Option 2: Serve via HTTP server
npx http-server . -p 8080
# Then open: http://localhost:8080/admin.html
```

Login with admin credentials (created during seed):
- Email: admin@Veloura.com
- Password: admin123

## Troubleshooting

### Backend won't start
- Check `.env` file exists in `/backend`
- Verify DATABASE_URL is correct
- Check port 3000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check browser console for CORS errors
- Verify proxy configuration in `vite.config.js`

### Database errors
- Verify Supabase/Neon database is accessible
- Check DATABASE_URL and DIRECT_URL are correct
- Try running `npm run db:reset` to reset database

### API returns 401 Unauthorized
- Check JWT_SECRET is set in backend `.env`
- Clear localStorage and login again
- Verify token is being sent in Authorization header

## Next Steps After Integration

1. **Test Payment Flow**
   - Add Stripe webhook endpoint
   - Test payment processing
   - Verify payment confirmation emails

2. **Configure Email Templates**
   - Customize SendGrid templates
   - Test booking confirmation emails
   - Set up automated email triggers

3. **Set Up SMS Notifications**
   - Configure Twilio phone numbers
   - Test SMS delivery
   - Set up booking reminders

4. **Deploy to Production**
   - Set up production database
   - Configure production environment variables
   - Deploy backend to hosting service
   - Deploy frontend to Vercel/Netlify

## API Endpoints Reference

### Public Endpoints (No Auth Required)
- `GET /api/health` - Health check
- `GET /api/hotels` - List hotels
- `GET /api/hotels/:id` - Hotel details
- `GET /api/hotels/:id/rooms` - Hotel rooms
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Protected Endpoints (Auth Required)
- `GET /api/auth/profile` - Get user profile
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user bookings
- `POST /api/payments/create-intent` - Create payment

### Admin Endpoints (Admin Role Required)
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/staff` - List staff
- `POST /api/hotels` - Create hotel
- `PUT /api/rooms/:id` - Update room

## Database Schema

Tables created:
- `users` - User accounts (guests, staff, admin)
- `hotels` - Hotel properties
- `rooms` - Room inventory
- `bookings` - Reservations
- `payments` - Payment records
- `reviews` - Guest reviews
- `staff` - Staff management
- `message_log` - Communication tracking

## Environment Variables

### Backend (.env)
All configured and ready to use.

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

## Support

If you encounter issues:
1. Check console logs (browser and terminal)
2. Verify all services are running
3. Review BACKEND_INTEGRATION_STRATEGY.md for detailed steps
4. Check database connection and migrations

---

**Last Updated:** 2026-03-09
**Status:** Ready for Integration Testing
