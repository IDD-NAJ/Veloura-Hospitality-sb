# GitHub Secrets Configuration Template

Copy this template and fill in your actual values. Then add them to GitHub repository secrets.

---

## Required Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

### Vercel Configuration

```
Name: VERCEL_TOKEN
Value: [Get from https://vercel.com/account/tokens]

Name: VERCEL_ORG_ID
Value: [Get from .vercel/project.json or Vercel Dashboard]

Name: VERCEL_BACKEND_PROJECT_ID
Value: [Get from backend/.vercel/project.json]

Name: VERCEL_FRONTEND_PROJECT_ID
Value: [Get from .vercel/project.json in root]
```

### Deployment URLs

```
Name: BACKEND_URL
Value: https://your-backend-name.vercel.app

Name: FRONTEND_URL
Value: https://your-frontend-name.vercel.app

Name: VITE_API_URL
Value: https://your-backend-name.vercel.app/api
```

---

## How to Get Values

### 1. VERCEL_TOKEN

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `GitHub Actions`
4. Scope: Full Account
5. Copy the token

### 2. VERCEL_ORG_ID

**Method 1: From Vercel Dashboard**
- Go to https://vercel.com/account
- Settings → General
- Copy "Organization ID" or "Team ID"

**Method 2: From CLI**
```bash
vercel login
vercel link
cat .vercel/project.json
```
Look for `"orgId"` field

### 3. VERCEL_BACKEND_PROJECT_ID

```bash
cd backend
vercel link
cat .vercel/project.json
```
Copy the `"projectId"` value

### 4. VERCEL_FRONTEND_PROJECT_ID

```bash
# In project root
vercel link
cat .vercel/project.json
```
Copy the `"projectId"` value

### 5. Deployment URLs

After first manual deployment to Vercel:
- Backend: Check Vercel Dashboard → Backend Project → Domains
- Frontend: Check Vercel Dashboard → Frontend Project → Domains

---

## Verification Checklist

After adding all secrets:

- [ ] All 7 secrets added to GitHub
- [ ] Secret names match exactly (case-sensitive)
- [ ] No extra spaces in values
- [ ] URLs include `https://` prefix
- [ ] URLs do NOT have trailing slashes
- [ ] Project IDs are correct for each project

---

## Test Deployment

After adding secrets, test the workflow:

1. Make a small change to README.md
2. Commit and push to `main`
3. Go to GitHub → Actions tab
4. Watch workflow run
5. Check for green checkmark ✅

If deployment fails, check the logs in the Actions tab for specific errors.
