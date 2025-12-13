# GitHub Actions CI/CD Setup Guide

This guide will help you set up GitHub Actions for automated CI/CD pipelines for your Vue.js application.

## 📋 Prerequisites

- GitHub repository
- Vercel account
- Node.js installed locally (for getting Vercel credentials)

## 🚀 Quick Setup

### Step 1: Get Vercel Credentials

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (this will show your credentials):
   ```bash
   vercel link
   ```
   
   This will create a `.vercel` folder with your project configuration. You can find:
   - **Project ID**: In `.vercel/project.json` → `projectId`
   - **Org ID**: In `.vercel/project.json` → `orgId`

4. **Get Vercel Token**:
   - Go to: https://vercel.com/account/tokens
   - Click "Create Token"
   - Give it a name (e.g., "GitHub Actions")
   - Copy the token (you won't see it again!)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add:

   | Secret Name | Value | Description |
   |------------|-------|-------------|
   | `VERCEL_TOKEN` | Your Vercel token | From Step 1.4 |
   | `VERCEL_ORG_ID` | Your org ID | From `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | Your project ID | From `.vercel/project.json` |
   | `VITE_API_URL_DEV` | `http://localhost:5000/api` | Development API URL (optional) |
   | `VITE_API_URL_PROD` | `https://cineflix-api-rho.vercel.app/api` | Production API URL |

### Step 3: Create Development Branch (if needed)

If you don't have a `develop` branch:

```bash
git checkout -b develop
git push -u origin develop
```

### Step 4: Test the Workflow

1. Make a small change (e.g., update README)
2. Push to `develop` branch:
   ```bash
   git add .
   git commit -m "test: GitHub Actions workflow"
   git push origin develop
   ```
3. Go to **Actions** tab in GitHub
4. Watch the workflow run!

## 📁 Workflow Files Created

### 1. `.github/workflows/development.yml`
- Triggers on push to `develop`, `dev`, or `development` branches
- Builds and deploys to Vercel preview/development
- Runs on pull requests to development branches

### 2. `.github/workflows/production.yml`
- Triggers on push to `main` or `master` branch
- Builds with production settings
- Deploys to Vercel production
- Can be manually triggered

### 3. `.github/workflows/ci.yml`
- Runs on pull requests
- Validates code (lint, build)
- Comments on PR with status

## 🔄 Branch Strategy

```
main/master     → Production (auto-deploy)
develop/dev     → Development (auto-deploy)
feature/*       → CI checks only (no deploy)
```

## 🎯 Workflow Features

✅ **Automatic builds** on push  
✅ **Lint checking** (if configured)  
✅ **Build verification**  
✅ **Artifact storage**  
✅ **Vercel deployment**  
✅ **Environment variables**  
✅ **PR status comments**  
✅ **Deployment summaries**

## 🔧 Customization

### Change Node.js Version

Edit the workflows and update:
```yaml
env:
  NODE_VERSION: '20.x'  # Change from 18.x
```

### Add Environment Variables

In workflow files, add to `vercel-env`:
```yaml
vercel-env: |
  VITE_API_URL=${{ secrets.VITE_API_URL_PROD }}
  VITE_ANOTHER_VAR=${{ secrets.ANOTHER_VAR }}
```

### Skip Tests

For production workflow, you can manually trigger and skip tests:
1. Go to Actions → Production CI/CD
2. Click "Run workflow"
3. Check "Skip tests" option

## 🐛 Troubleshooting

### Build Fails

**Issue**: Build fails with dependency errors
- **Solution**: Run `npm ci` locally to verify dependencies
- Check Node.js version compatibility

**Issue**: Build fails with TypeScript/ESLint errors
- **Solution**: Fix linting errors locally first
- Or add `|| true` to lint step to make it non-blocking

### Deployment Fails

**Issue**: "Invalid Vercel token"
- **Solution**: 
  - Regenerate token from Vercel dashboard
  - Update `VERCEL_TOKEN` secret in GitHub

**Issue**: "Project not found"
- **Solution**: 
  - Verify `VERCEL_PROJECT_ID` is correct
  - Check project exists in Vercel dashboard

**Issue**: "Organization not found"
- **Solution**: 
  - Verify `VERCEL_ORG_ID` is correct
  - Ensure you have access to the organization

### Workflow Not Triggering

**Issue**: Workflow doesn't run on push
- **Solution**: 
  - Check branch name matches workflow trigger
  - Verify workflow file is in `.github/workflows/`
  - Check Actions tab is enabled in repository settings

## 📊 Monitoring

- **View workflow runs**: GitHub → Actions tab
- **View deployment logs**: Click on a workflow run
- **View Vercel deployments**: Vercel dashboard → Deployments

## 🔐 Security Best Practices

1. ✅ Never commit secrets to repository
2. ✅ Use GitHub Secrets for sensitive data
3. ✅ Rotate Vercel tokens periodically
4. ✅ Use environment-specific secrets
5. ✅ Review workflow changes before merging

## 📝 Next Steps

1. ✅ Set up secrets (Step 2)
2. ✅ Test development workflow
3. ✅ Test production workflow (on main branch)
4. ✅ Configure branch protection rules (optional)
5. ✅ Set up deployment notifications (optional)

## 🆘 Need Help?

- GitHub Actions Docs: https://docs.github.com/en/actions
- Vercel CLI Docs: https://vercel.com/docs/cli
- Vercel GitHub Action: https://github.com/amondnet/vercel-action

---

**Happy Deploying! 🚀**

