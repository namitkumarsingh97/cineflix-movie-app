# GitHub Actions CI/CD Workflows

This repository uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. **Development CI/CD** (`.github/workflows/development.yml`)
- **Triggers**: 
  - Push to `develop`, `dev`, or `development` branches
  - Pull requests to development branches
- **Actions**:
  - Installs dependencies
  - Runs linter (if configured)
  - Builds the application
  - Deploys to Vercel preview/development environment
- **Environment**: Development

### 2. **Production CI/CD** (`.github/workflows/production.yml`)
- **Triggers**: 
  - Push to `main` or `master` branch
  - Manual workflow dispatch
- **Actions**:
  - Installs dependencies
  - Runs linter (if configured)
  - Builds the application with production settings
  - Verifies build output
  - Deploys to Vercel production
- **Environment**: Production

### 3. **Continuous Integration** (`.github/workflows/ci.yml`)
- **Triggers**: 
  - Pull requests to `main`, `master`, `develop`, or `dev` branches
- **Actions**:
  - Installs dependencies
  - Runs linter
  - Builds the application
  - Comments on PR with status
- **Purpose**: Pre-merge validation

## Required Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Vercel Secrets
- `VERCEL_TOKEN` - Your Vercel authentication token
  - Get it from: https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - Your Vercel organization ID
  - Get it from: Vercel dashboard > Settings > General
- `VERCEL_PROJECT_ID` - Your Vercel project ID
  - Get it from: Vercel project settings

### Environment Variables
- `VITE_API_URL_DEV` - Development API URL (optional, defaults to localhost)
- `VITE_API_URL_PROD` - Production API URL (required for production)

## Setup Instructions

1. **Get Vercel Credentials**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project (this will show your org and project IDs)
   vercel link
   ```

2. **Add GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to `Settings > Secrets and variables > Actions`
   - Add the required secrets listed above

3. **Create Development Branch** (if not exists):
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

4. **Test the Workflow**:
   - Make a small change and push to `develop` branch
   - Check the Actions tab to see the workflow run
   - Verify deployment on Vercel

## Workflow Features

- ✅ Automatic builds on push
- ✅ Lint checking (if configured)
- ✅ Build verification
- ✅ Artifact storage
- ✅ Automatic Vercel deployment
- ✅ Environment-specific configurations
- ✅ PR comments with CI status
- ✅ Deployment summaries

## Branch Strategy

- **`main`/`master`** → Production deployments
- **`develop`/`dev`** → Development deployments
- **Feature branches** → CI checks only (no deployment)

## Manual Deployment

You can manually trigger production deployment:
1. Go to Actions tab
2. Select "Production CI/CD"
3. Click "Run workflow"
4. Select branch and run

## Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

### Deployment Fails
- Verify Vercel secrets are correct
- Check Vercel project settings
- Ensure environment variables are set

### Vercel Token Issues
- Regenerate token from Vercel dashboard
- Ensure token has correct permissions
- Check token hasn't expired

