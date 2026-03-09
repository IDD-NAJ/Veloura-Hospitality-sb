# GitHub Actions Deployment Guide

Complete guide to set up automated deployments using GitHub Actions and Vercel.

---

## 🚀 Overview

This setup provides:
- **Automatic deployments** when you push to `main` branch
- **CI/CD pipeline** for testing and linting
- **Separate workflows** for frontend and backend
- **Health checks** after deployment

---

## 📋 Prerequisites

1. **GitHub repository** with your code
2. **Vercel account** with projects created
3. **Vercel CLI** installed: `npm i -g vercel`

---

## Part 1: Get Vercel Credentials

### Step 1: Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name it: `GitHub Actions`
4. Copy the token (you'll only see it once)

### Step 2: Get Organization ID

```bash
# Login to Vercel CLI
vercel login

# Link your projects (run in project root)
vercel link

# Get org ID from .vercel/project.json
cat .vercel/project.json
```

Or find it in Vercel Dashboard → Settings → General → Organization ID

### Step 3: Get Project IDs

**Backend Project:**
```bash
cd backend
vercel link
cat .vercel/project.json
```

**Frontend Project:**
```bash
# In project root
vercel link
cat .vercel/project.json
```

Copy the `projectId` from each `.vercel/project.json` file.

---

## Part 2: Configure GitHub Secrets

### Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VERCEL_TOKEN` | Vercel API token | `abc123...` |
| `VERCEL_ORG_ID` | Your Vercel organization ID | `team_abc123` |
| `VERCEL_BACKEND_PROJECT_ID` | Backend project ID | `prj_abc123` |
| `VERCEL_FRONTEND_PROJECT_ID` | Frontend project ID | `prj_xyz789` |
| `BACKEND_URL` | Backend production URL | `https://your-backend.vercel.app` |
| `FRONTEND_URL` | Frontend production URL | `https://your-app.vercel.app` |
| `VITE_API_URL` | Backend API URL for frontend | `https://your-backend.vercel.app/api` |

---

## Part 3: Workflow Files

Three GitHub Actions workflows are configured:

### 1. Backend Deployment (`.github/workflows/deploy-backend.yml`)

**Triggers:**
- Push to `main` branch with changes in `backend/` folder
- Manual trigger via GitHub UI

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run tests
5. Deploy to Vercel
6. Health check

### 2. Frontend Deployment (`.github/workflows/deploy-frontend.yml`)

**Triggers:**
- Push to `main` branch with changes in frontend files
- Manual trigger via GitHub UI

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Build with Vite
5. Deploy to Vercel
6. Health check

### 3. CI Testing (`.github/workflows/ci.yml`)

**Triggers:**
- Pull requests to `main`
- Push to `develop` branch

**Steps:**
1. Run backend linter and tests
2. Build frontend
3. Verify build output

---

## Part 4: Deployment Workflow

### Automatic Deployment

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main
```

GitHub Actions will:
1. Detect which files changed
2. Run appropriate workflow (backend/frontend/both)
3. Deploy to Vercel
4. Run health checks
5. Report status

### Manual Deployment

1. Go to GitHub repository
2. Click **Actions** tab
3. Select workflow (Deploy Backend or Deploy Frontend)
4. Click **Run workflow**
5. Select `main` branch
6. Click **Run workflow**

---

## Part 5: Monitoring Deployments

### View Workflow Status

**GitHub:**
- Repository → **Actions** tab
- Click on workflow run to see details
- View logs for each step

**Vercel:**
- Dashboard → Your Project → **Deployments**
- See deployment triggered by GitHub Actions
- View build logs and runtime logs

### Deployment Notifications

GitHub will:
- ✅ Show green checkmark if successful
- ❌ Show red X if failed
- 📧 Email you on failures (if configured)

---

## Part 6: Environment Variables

### Backend Environment Variables (Vercel Dashboard)

Set these in Vercel Dashboard → Backend Project → Settings → Environment Variables:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend.vercel.app
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
TWILIO_AUTH_TOKEN=...
```

### Frontend Environment Variables (Vercel Dashboard)

Set in Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.vercel.app/api
```

**Note:** GitHub Actions uses `VITE_API_URL` from GitHub Secrets for build-time.

---

## Part 7: Branch Strategy

### Recommended Workflow

```
main (production)
  ↑
  └── develop (staging)
        ↑
        └── feature/your-feature
```

**Branches:**
- `main` - Production (auto-deploys to Vercel)
- `develop` - Staging (runs CI tests)
- `feature/*` - Feature branches (create PRs to develop)

### Deployment Flow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit
3. Push: `git push origin feature/new-feature`
4. Create PR to `develop`
5. CI runs tests
6. Merge to `develop` after approval
7. Test on staging
8. Create PR from `develop` to `main`
9. Merge to `main` → **Auto-deploys to production**

---

## Part 8: Troubleshooting

### Deployment Fails

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click failed workflow
3. Expand failed step
4. Read error message

**Common Issues:**

**"Vercel token invalid"**
- Verify `VERCEL_TOKEN` secret is correct
- Token may have expired - create new one

**"Project not found"**
- Verify `VERCEL_BACKEND_PROJECT_ID` and `VERCEL_FRONTEND_PROJECT_ID`
- Ensure projects exist in Vercel

**"Build failed"**
- Check build logs in workflow
- Test build locally: `npm run build`
- Verify all dependencies in `package.json`

**"Health check failed"**
- Deployment succeeded but app not responding
- Check Vercel runtime logs
- Verify environment variables set correctly

### Tests Fail

**Backend tests:**
```bash
cd backend
npm test
```

**Frontend build:**
```bash
npm run build
```

Fix issues locally before pushing.

---

## Part 9: Advanced Configuration

### Deploy to Staging

Create separate Vercel projects for staging:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches:
      - develop
```

Add staging secrets:
- `VERCEL_BACKEND_STAGING_PROJECT_ID`
- `VERCEL_FRONTEND_STAGING_PROJECT_ID`

### Add Slack Notifications

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Run Database Migrations

```yaml
- name: Run migrations
  working-directory: ./backend
  run: npm run db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Part 10: Security Best Practices

### Secrets Management

- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate tokens regularly
- ✅ Use different tokens for staging/production
- ✅ Limit token permissions

### Code Review

- ✅ Require PR reviews before merging to `main`
- ✅ Run CI tests on all PRs
- ✅ Use branch protection rules
- ✅ Enable status checks

### Deployment Safety

- ✅ Test on staging before production
- ✅ Use health checks after deployment
- ✅ Monitor error rates
- ✅ Have rollback plan ready

---

## Part 11: Quick Reference

### GitHub Secrets Needed

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_BACKEND_PROJECT_ID
VERCEL_FRONTEND_PROJECT_ID
BACKEND_URL
FRONTEND_URL
VITE_API_URL
```

### Manual Deployment Commands

```bash
# Deploy backend
cd backend
vercel --prod

# Deploy frontend
vercel --prod

# Check deployment status
vercel ls
```

### Workflow Files Location

```
.github/
  workflows/
    deploy-backend.yml    # Backend deployment
    deploy-frontend.yml   # Frontend deployment
    ci.yml               # CI testing
```

---

## ✅ Setup Checklist

- [ ] Vercel token created
- [ ] Organization ID obtained
- [ ] Backend project ID obtained
- [ ] Frontend project ID obtained
- [ ] All GitHub Secrets added
- [ ] Workflow files committed to repository
- [ ] Test deployment by pushing to `main`
- [ ] Verify deployments in GitHub Actions
- [ ] Verify deployments in Vercel Dashboard
- [ ] Test deployed applications

---

## 📞 Support

- **GitHub Actions Docs:** https://docs.github.com/actions
- **Vercel Deployment Docs:** https://vercel.com/docs/deployments/git
- **Vercel CLI Docs:** https://vercel.com/docs/cli

---

**Status:** Ready for Automated Deployment ✅

Last Updated: March 9, 2026
