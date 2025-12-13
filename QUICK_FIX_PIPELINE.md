# Quick Fix: Pipeline Failing - Secrets Setup

## ❌ Problem

Your pipeline is failing because Vercel credentials are not set up correctly.

## ✅ Solution: Add Secrets to GitHub (NOT `.env`)

### Step 1: Add Secrets to GitHub

1. **Go to your GitHub repository**
2. **Navigate to**: `Settings` → `Secrets and variables` → `Actions`
3. **Click**: `New repository secret`

### Step 2: Add Each Secret

Add these secrets one by one:

#### Secret 1: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: gT8PKiKX1zAMBeLYaOcY7HYE
```

#### Secret 2: VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: team_dW7nledyAnF0l6CS8WRex2aU
```

#### Secret 3: VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Value: prj_BbO1tPzCqUWevR76ItanKi3nqO4r
```

#### Secret 4: VITE_API_URL_PROD (Recommended)
```
Name: VITE_API_URL_PROD
Value: https://cineflix-api-rho.vercel.app/api
```

#### Secret 5: VITE_API_URL_DEV (Optional)
```
Name: VITE_API_URL_DEV
Value: http://localhost:5000/api
```

### Step 3: Verify Secrets

After adding, you should see all 5 secrets listed.

### Step 4: Re-run Workflow

1. Go to **Actions** tab
2. Find the failed workflow
3. Click **"Re-run all jobs"**

## 🚨 Important: Do NOT Use `.env`

- ❌ **Don't put secrets in `.env` file**
- ❌ **Don't commit `.env` to git**
- ✅ **Use GitHub Secrets instead**

## 📋 Why GitHub Secrets?

- ✅ Secure (encrypted)
- ✅ Accessible to workflows
- ✅ Never exposed in logs
- ✅ Can be updated without code changes

## ✅ After Setup

Your workflows will access secrets like this:
```yaml
vercel-token: ${{ secrets.VERCEL_TOKEN }}
vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🐛 Still Failing?

1. **Check secret names**: Must be exact (case-sensitive)
2. **Check workflow logs**: Look for error messages
3. **Verify secrets exist**: Settings → Secrets and variables → Actions
4. **Re-run workflow**: After adding secrets

---

**Add secrets to GitHub, not `.env` file! ✅**

