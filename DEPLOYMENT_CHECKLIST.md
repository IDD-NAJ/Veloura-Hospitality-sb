# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

---

## ✅ Pre-Deployment Checklist

### Code Preparation
- [x] Git repository initialized
- [x] `.gitignore` configured (excludes `.env`, `node_modules/`, `dist/`)
- [x] `vercel.json` created for frontend
- [x] `backend/vercel.json` created for backend
- [x] `.vercelignore` files created
- [ ] All code committed to GitHub
- [ ] Code pushed to `main` branch

### Configuration Files
- [x] Frontend `package.json` has `build` script
- [x] Backend `package.json` has `start` script
- [x] `vite.config.js` configured with correct port (5175)
- [x] CORS configuration includes production URLs

### Environment Variables Ready
- [ ] Database URL (Supabase/Neon)
- [ ] JWT secrets generated
- [ ] Stripe API keys (test or live)
- [ ] SendGrid API key
- [ ] Twilio credentials
- [ ] All other service API keys

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend First
- [ ] Create new Vercel project
- [ ] Set root directory to `backend`
- [ ] Add all environment variables
- [ ] Deploy and get backend URL
- [ ] Test: `https://your-backend.vercel.app/api/health`

### Step 2: Update Frontend Configuration
- [ ] Update `VITE_API_URL` environment variable
- [ ] Update `vercel.json` with backend URL
- [ ] Commit changes to GitHub

### Step 3: Deploy Frontend
- [ ] Create new Vercel project
- [ ] Set root directory to `.` (root)
- [ ] Add `VITE_API_URL` environment variable
- [ ] Deploy and get frontend URL

### Step 4: Update CORS
- [ ] Add frontend URL to backend `CORS_ORIGIN`
- [ ] Redeploy backend
- [ ] Test frontend can connect to backend

---

## 🧪 Post-Deployment Testing

### Backend API Tests
- [ ] Health check: `/api/health`
- [ ] Hotels list: `/api/hotels`
- [ ] Featured hotels: `/api/hotels/featured?limit=3`
- [ ] Stats summary: `/api/stats/summary`
- [ ] Stats destinations: `/api/stats/destinations`

### Frontend Tests
- [ ] Homepage loads
- [ ] Featured hotels display
- [ ] Destination stats display
- [ ] Summary counters display
- [ ] Hotel search works
- [ ] Hotel detail pages load
- [ ] User registration works
- [ ] User login works
- [ ] Booking flow works

### Integration Tests
- [ ] No CORS errors in browser console
- [ ] All API calls succeed
- [ ] Images load correctly
- [ ] Navigation works
- [ ] Forms submit successfully

---

## 🔐 Security Verification

- [ ] No `.env` files in repository
- [ ] All secrets in Vercel environment variables
- [ ] CORS configured with specific origins (not `*`)
- [ ] HTTPS enforced
- [ ] Security headers present (check Network tab)
- [ ] Rate limiting active

---

## 📊 Monitoring Setup

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring (optional: UptimeRobot)
- [ ] Database backups enabled

---

## 🌐 Domain Configuration (Optional)

- [ ] Custom domain added to frontend
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] API subdomain added to backend
- [ ] CORS updated with custom domain

---

## 📝 Documentation Updates

- [ ] Production URLs added to README
- [ ] Deployment date recorded
- [ ] Team notified of deployment
- [ ] User documentation updated

---

## 🎯 Quick Commands

### Deploy via CLI
```bash
# Frontend
vercel --prod

# Backend
cd backend
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs [deployment-url]
```

---

## 🆘 Troubleshooting

### If Frontend Shows CORS Errors:
1. Check backend `CORS_ORIGIN` includes frontend URL
2. Verify no trailing slashes in URLs
3. Check browser console for exact error
4. Test backend URL directly

### If Database Won't Connect:
1. Verify `DATABASE_URL` is correct
2. Use pooler connection (port 6543)
3. Check database is active in Supabase/Neon
4. Review backend logs in Vercel

### If Build Fails:
1. Check build logs in Vercel Dashboard
2. Verify all dependencies in `package.json`
3. Test build locally: `npm run build`
4. Check Node.js version compatibility

---

## ✅ Deployment Complete

Once all items are checked:

- **Frontend URL:** _________________
- **Backend URL:** _________________
- **Deployment Date:** _________________
- **Deployed By:** _________________

---

**Status:** Ready for Deployment ✅
