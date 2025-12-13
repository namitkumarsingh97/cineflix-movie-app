# Secrets vs Variables - Where to Put What

## 🎯 Quick Answer

**Use "Secrets" for all Vercel credentials!**

## 📋 Difference

### 🔐 **Secrets** (Recommended for Vercel)
- **Purpose**: Sensitive data (tokens, passwords, API keys)
- **Security**: Encrypted, hidden in logs
- **Use for**: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

### 📝 **Variables** (For non-sensitive config)
- **Purpose**: Non-sensitive configuration
- **Security**: Visible in logs (but convenient)
- **Use for**: URLs, feature flags, non-sensitive config

## ✅ Recommended Setup: All as Secrets

### Add to "Secrets" (Encrypted):

1. **VERCEL_TOKEN** → **Secrets** ✅
   - Value: `gT8PKiKX1zAMBeLYaOcY7HYE`
   - Why: This is a sensitive authentication token

2. **VERCEL_ORG_ID** → **Secrets** ✅
   - Value: `team_dW7nledyAnF0l6CS8WRex2aU`
   - Why: Better to keep it secret (even though it's less sensitive)

3. **VERCEL_PROJECT_ID** → **Secrets** ✅
   - Value: `prj_BbO1tPzCqUWevR76ItanKi3nqO4r`
   - Why: Better to keep it secret (even though it's less sensitive)

4. **VITE_API_URL_PROD** → **Secrets** or **Variables** ⚠️
   - Value: `https://cineflix-api-rho.vercel.app/api`
   - Can be either (not sensitive, but secrets is fine)

5. **VITE_API_URL_DEV** → **Secrets** or **Variables** ⚠️
   - Value: `http://localhost:5000/api`
   - Can be either (not sensitive, but secrets is fine)

## 📊 Complete Setup

### Option 1: All as Secrets (Recommended) ✅

**Go to**: Settings → Secrets and variables → Actions → **Secrets** tab

Add all 5 as **Secrets**:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID`
- ✅ `VITE_API_URL_PROD`
- ✅ `VITE_API_URL_DEV`

### Option 2: Mixed (Alternative)

**Secrets** (Sensitive):
- ✅ `VERCEL_TOKEN` (must be secret)
- ✅ `VERCEL_ORG_ID` (recommended)
- ✅ `VERCEL_PROJECT_ID` (recommended)

**Variables** (Non-sensitive):
- ✅ `VITE_API_URL_PROD` (can be variable)
- ✅ `VITE_API_URL_DEV` (can be variable)

## 🎯 Step-by-Step: Add as Secrets

1. **Go to**: Settings → Secrets and variables → Actions
2. **Click**: "Secrets" tab (not "Variables")
3. **Click**: "New repository secret"
4. **Add each one**:

   ```
   Name: VERCEL_TOKEN
   Value: gT8PKiKX1zAMBeLYaOcY7HYE
   → Click "Add secret"
   
   Name: VERCEL_ORG_ID
   Value: team_dW7nledyAnF0l6CS8WRex2aU
   → Click "Add secret"
   
   Name: VERCEL_PROJECT_ID
   Value: prj_BbO1tPzCqUWevR76ItanKi3nqO4r
   → Click "Add secret"
   
   Name: VITE_API_URL_PROD
   Value: https://cineflix-api-rho.vercel.app/api
   → Click "Add secret"
   
   Name: VITE_API_URL_DEV
   Value: http://localhost:5000/api
   → Click "Add secret"
   ```

## 🔍 How to Access in Workflows

### Secrets:
```yaml
${{ secrets.VERCEL_TOKEN }}
${{ secrets.VERCEL_ORG_ID }}
${{ secrets.VERCEL_PROJECT_ID }}
```

### Variables:
```yaml
${{ vars.VITE_API_URL_PROD }}
${{ vars.VITE_API_URL_DEV }}
```

**Note**: Our workflows use `secrets.*`, so use **Secrets** for all.

## ✅ Final Recommendation

**Put ALL 5 in "Secrets"** because:
- ✅ More secure
- ✅ Consistent approach
- ✅ Works with existing workflows
- ✅ No need to change workflow files

## 📋 Checklist

- [ ] Go to Settings → Secrets and variables → Actions
- [ ] Click "Secrets" tab
- [ ] Add `VERCEL_TOKEN` as Secret
- [ ] Add `VERCEL_ORG_ID` as Secret
- [ ] Add `VERCEL_PROJECT_ID` as Secret
- [ ] Add `VITE_API_URL_PROD` as Secret
- [ ] Add `VITE_API_URL_DEV` as Secret
- [ ] Verify all 5 secrets are listed
- [ ] Re-run failed workflow

---

**Use "Secrets" tab for all Vercel credentials! ✅**

