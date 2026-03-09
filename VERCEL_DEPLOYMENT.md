# Vercel Deployment Guide - Veloura Hotel

Complete guide to deploy both frontend and backend to Vercel.

---

## 📋 Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository set up (see `GITHUB_SETUP.md`)
- Vercel CLI installed (optional): `npm i -g vercel`

---

## 🚀 Deployment Strategy

We'll deploy as **two separate Vercel projects**:

1. **Frontend** - React + Vite app (main project)
2. **Backend** - Express.js API (separate project)

---

## Part 1: Deploy Backend API

### Step 1: Create Backend Project on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Configure Project:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

### Step 2: Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
NODE_ENV=production
PORT=3000

# Database (Supabase/Neon)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres

# CORS - Add your frontend Vercel URL
CORS_ORIGIN=https://your-frontend.vercel.app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Veloura Hotel

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaxxx

# Cloudbeds (optional)
CLOUDBEDS_CLIENT_ID=xxx
CLOUDBEDS_CLIENT_SECRET=xxx
CLOUDBEDS_PROPERTY_ID=xxx

# SiteMinder (optional)
SITEMINDER_API_KEY=xxx
SITEMINDER_PROPERTY_ID=xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

### Step 3: Deploy Backend

Click **Deploy** - Vercel will:
- Install dependencies
- Start the Express server
- Assign a URL like `https://veloura-hotel-backend.vercel.app`

### Step 4: Test Backend API

Visit: `https://your-backend.vercel.app/api/health`

Expected response:
```json
{
  "success": true,
  "service": "Veloura Hotel Backend",
  "environment": "production",
  "database": {
    "status": "healthy"
  }
}
```

---

## Part 2: Deploy Frontend

### Step 1: Update Frontend API URL

**Option A: Use Environment Variable (Recommended)**

In Vercel Dashboard for frontend project:
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

**Option B: Update Code Directly**

Edit `src/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-backend.vercel.app/api';
```

### Step 2: Update Frontend vercel.json

Edit `vercel.json` and replace the backend URL:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.vercel.app/api/:path*"
    }
  ]
}
```

### Step 3: Create Frontend Project on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository (same repo)
3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 4: Configure Frontend Environment Variables

```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### Step 5: Deploy Frontend

Click **Deploy** - Vercel will:
- Install dependencies
- Run `vite build`
- Deploy static files
- Assign URL like `https://veloura-hotel.vercel.app`

---

## Part 3: Update CORS Configuration

### Update Backend CORS_ORIGIN

In backend Vercel project → Environment Variables:

```env
CORS_ORIGIN=https://veloura-hotel.vercel.app,https://your-custom-domain.com
```

Redeploy backend for changes to take effect.

---

## Part 4: Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Go to frontend project → Settings → Domains
2. Add your domain: `www.velourahotel.com`
3. Configure DNS records as instructed by Vercel

### Add Custom Domain to Backend

1. Go to backend project → Settings → Domains
2. Add subdomain: `api.velourahotel.com`
3. Update frontend `VITE_API_URL` to `https://api.velourahotel.com/api`
4. Update backend `CORS_ORIGIN` to include `https://www.velourahotel.com`

---

## 🔧 Troubleshooting

### CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**
1. Verify `CORS_ORIGIN` in backend includes frontend URL
2. Check backend logs in Vercel Dashboard
3. Ensure URLs don't have trailing slashes

### Database Connection Timeout

**Problem:** `write CONNECT_TIMEOUT`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Use pooler connection (port 6543) not direct (port 5432)
3. Check Supabase/Neon database is active
4. Increase connection timeout in `backend/src/database/connection.js`

### Build Failures

**Frontend Build Fails:**
- Check `package.json` has `"build": "vite build"`
- Verify all dependencies are in `package.json`
- Check build logs in Vercel Dashboard

**Backend Deploy Fails:**
- Ensure `"start": "node src/server.js"` exists in `package.json`
- Verify `vercel.json` points to correct entry file
- Check environment variables are set

### API Routes Not Working

**Problem:** 404 on `/api/*` routes

**Solution:**
1. Verify `backend/vercel.json` routes configuration
2. Check `src/server.js` has correct route prefixes
3. Test backend URL directly: `https://backend.vercel.app/api/health`

---

## 📊 Monitoring & Logs

### View Logs

**Frontend:**
- Vercel Dashboard → Your Project → Deployments → Latest → Logs

**Backend:**
- Vercel Dashboard → Backend Project → Deployments → Latest → Runtime Logs

### Performance Monitoring

- Enable Vercel Analytics in project settings
- Monitor API response times
- Check database query performance in Supabase/Neon dashboard

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Production:** Push to `main` branch
- **Preview:** Push to any other branch or open PR

### Manual Deployment

Using Vercel CLI:

```bash
# Deploy frontend
vercel --prod

# Deploy backend
cd backend
vercel --prod
```

---

## 🔐 Security Checklist

- ✅ All API keys in environment variables (not in code)
- ✅ `NODE_ENV=production` set
- ✅ CORS configured with specific origins (not `*`)
- ✅ JWT secrets are strong and unique
- ✅ Database uses SSL connections
- ✅ Rate limiting enabled in backend
- ✅ Helmet.js security headers configured
- ✅ `.env` files in `.gitignore`

---

## 📝 Post-Deployment Tasks

1. **Test All Features:**
   - User registration/login
   - Hotel browsing
   - Booking creation
   - Admin dashboard
   - Payment processing (test mode)

2. **Update Documentation:**
   - Add production URLs to README
   - Document any deployment-specific configurations

3. **Set Up Monitoring:**
   - Configure error tracking (Sentry, LogRocket)
   - Set up uptime monitoring (UptimeRobot, Pingdom)

4. **Database Backups:**
   - Enable automated backups in Supabase/Neon
   - Test restore procedure

---

## 🌐 Production URLs

After deployment, update these in your documentation:

- **Frontend:** https://veloura-hotel.vercel.app
- **Backend API:** https://veloura-hotel-backend.vercel.app/api
- **Admin Dashboard:** https://veloura-hotel.vercel.app/admin.html
- **API Health Check:** https://veloura-hotel-backend.vercel.app/api/health

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Community:** https://github.com/vercel/vercel/discussions

---

**Deployment Status:** Ready for Vercel ✅

Last Updated: March 9, 2026
