# GitHub Setup Instructions

## 1. Configure Git Identity

Run these commands to set your git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Or to set it only for this repository:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## 2. Create Initial Commit

```bash
git commit -m "Initial commit: Veloura Hotel booking platform with CORS fixes

- Full-stack hotel management system with React + Vite frontend
- Express.js backend with PostgreSQL database
- Fixed CORS configuration for localhost:5175
- Resilient API error handling with Promise.allSettled
- Database connection timeout fixes for Supabase
- Complete integration with Stripe, SendGrid, Twilio
- Admin dashboard and guest booking system"
```

## 3. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `veloura-hotel` (or your preferred name)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)

## 4. Add Remote and Push

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/veloura-hotel.git
git branch -M main
git push -u origin main
```

## 5. Verify

Visit your repository on GitHub to confirm all files were pushed successfully.

## Important Files to Verify Are Ignored

The following should NOT be in your repository (check .gitignore):
- ✅ `node_modules/` - Dependencies
- ✅ `.env` files - Environment variables with secrets
- ✅ `dist/` - Build outputs
- ✅ `.vite/` - Vite cache

## Environment Variables Setup for Deployment

When deploying, you'll need to set these environment variables on your hosting platform:

### Backend (.env)
```
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
TWILIO_AUTH_TOKEN=...
```

### Frontend
```
VITE_API_URL=https://your-backend-domain.com/api
```

## Quick Commands Reference

```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Current Repository Status

✅ Git initialized
✅ .gitignore configured
✅ All files staged
⏳ Awaiting git identity configuration
⏳ Awaiting initial commit
⏳ Awaiting GitHub remote setup
⏳ Awaiting push to GitHub
