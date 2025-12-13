# GitHub Secrets Setup Guide

## ❌ DO NOT Put in `.env` File!

**These Vercel credentials should NOT be in `.env` file!**

They should be added as **GitHub Repository Secrets** for CI/CD workflows.

## ✅ Correct Setup: GitHub Secrets

### Step 1: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret one by one:

#### Secret 1: VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Value**: `gT8PKiKX1zAMBeLYaOcY7HYE`
- Click **"Add secret"**

#### Secret 2: VERCEL_ORG_ID
- **Name**: `VERCEL_ORG_ID`
- **Value**: `team_dW7nledyAnF0l6CS8WRex2aU`
- Click **"Add secret"**

#### Secret 3: VERCEL_PROJECT_ID
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: `prj_BbO1tPzCqUWevR76ItanKi3nqO4r`
- Click **"Add secret"**

#### Secret 4: VITE_API_URL_PROD (Optional but recommended)
- **Name**: `VITE_API_URL_PROD`
- **Value**: `https://cineflix-api-rho.vercel.app/api`
- Click **"Add secret"**

#### Secret 5: VITE_API_URL_DEV (Optional)
- **Name**: `VITE_API_URL_DEV`
- **Value**: `http://localhost:5000/api` (or your dev API URL)
- Click **"Add secret"**

### Step 2: Verify Secrets Are Added

After adding, you should see:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID`
- ✅ `VITE_API_URL_PROD` (optional)
- ✅ `VITE_API_URL_DEV` (optional)

## 🚨 Why NOT in `.env`?

### Problems with `.env`:
1. ❌ `.env` files are for **local development only**
2. ❌ If committed to git, secrets are exposed publicly
3. ❌ CI/CD workflows can't access `.env` files
4. ❌ Security risk if pushed to repository

### Why GitHub Secrets:
1. ✅ Secure storage (encrypted)
2. ✅ Only accessible to workflows
3. ✅ Never exposed in logs
4. ✅ Can be updated without code changes
5. ✅ Different secrets for different environments

## 📋 Complete Secrets List

| Secret Name | Value | Required |
|------------|-------|----------|
| `VERCEL_TOKEN` | `gT8PKiKX1zAMBeLYaOcY7HYE` | ✅ Yes |
| `VERCEL_ORG_ID` | `team_dW7nledyAnF0l6CS8WRex2aU` | ✅ Yes |
| `VERCEL_PROJECT_ID` | `prj_BbO1tPzCqUWevR76ItanKi3nqO4r` | ✅ Yes |
| `VITE_API_URL_PROD` | `https://cineflix-api-rho.vercel.app/api` | ⚠️ Recommended |
| `VITE_API_URL_DEV` | `http://localhost:5000/api` | ⚠️ Optional |

## 🔍 Verify `.env` is Ignored

Make sure `.env` is in `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

**Check**: If `.env` is already committed, remove it:
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## ✅ After Adding Secrets

1. **Re-run failed workflows**:
   - Go to **Actions** tab
   - Find failed workflow
   - Click **"Re-run all jobs"**

2. **Test the workflow**:
   - Make a small change
   - Push to `develop` branch
   - Check if workflow succeeds

## 🐛 Troubleshooting

### Issue: "VERCEL_TOKEN not found"
- **Solution**: Make sure secret name is exactly `VERCEL_TOKEN` (case-sensitive)
- Check: Settings → Secrets and variables → Actions

### Issue: "Invalid Vercel token"
- **Solution**: 
  - Regenerate token from Vercel: https://vercel.com/account/tokens
  - Update `VERCEL_TOKEN` secret in GitHub

### Issue: "Project not found"
- **Solution**: 
  - Verify `VERCEL_PROJECT_ID` is correct
  - Check project exists in Vercel dashboard

### Issue: Workflow still failing
- **Solution**:
  - Check workflow logs in Actions tab
  - Verify all secrets are added correctly
  - Make sure secret names match exactly (case-sensitive)

## 📝 Quick Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env` is NOT committed to git
- [ ] `VERCEL_TOKEN` added to GitHub Secrets
- [ ] `VERCEL_ORG_ID` added to GitHub Secrets
- [ ] `VERCEL_PROJECT_ID` added to GitHub Secrets
- [ ] `VITE_API_URL_PROD` added (optional)
- [ ] Secrets verified in GitHub Settings
- [ ] Re-run failed workflows

## 🎯 Summary

**DO:**
- ✅ Add secrets to GitHub: Settings → Secrets and variables → Actions
- ✅ Use secrets in workflows via `${{ secrets.SECRET_NAME }}`
- ✅ Keep `.env` in `.gitignore`

**DON'T:**
- ❌ Put secrets in `.env` file
- ❌ Commit `.env` to git
- ❌ Hardcode secrets in workflow files

---

**Add these secrets to GitHub, not `.env` file! ✅**

