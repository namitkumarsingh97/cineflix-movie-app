# Branch Protection Setup Guide

This guide will help you set up branch protection rules to enforce code review and prevent direct merges to `main` and `develop` branches.

## 🆕 New: GitHub Rulesets

GitHub now uses **Rulesets** (newer method) instead of the older Branch Protection Rules. 

**👉 For Rulesets setup, see: `GITHUB_RULESETS_SETUP.md`**

This guide covers the older method (still works, but Rulesets are recommended).

---

## 🛡️ Branch Protection Rules (Legacy Method)

### Required Setup

Both `main` (production) and `develop` (development) branches should require Pull Requests for merging.

## 📋 Step-by-Step Setup

### Step 1: Enable Branch Protection for `main` (Production)

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Branches**
3. Under **Branch protection rules**, click **"Add rule"**
4. Configure the following:

   **Branch name pattern**: `main` (or `master`)

   **Protection settings**:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: `1` (or more)
     - ✅ Dismiss stale pull request approvals when new commits are pushed
     - ✅ Require review from Code Owners (if you have CODEOWNERS file)
   
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Select required checks:
       - `lint-and-build` (from CI workflow)
       - `build-and-test` (from production workflow)
   
   - ✅ **Require conversation resolution before merging**
   
   - ✅ **Do not allow bypassing the above settings**
     - ✅ Even administrators (recommended for production)
   
   - ✅ **Restrict who can push to matching branches**
     - Leave empty (no one can push directly)
   
   - ✅ **Allow force pushes**: ❌ Unchecked
   - ✅ **Allow deletions**: ❌ Unchecked

5. Click **"Create"**

### Step 2: Enable Branch Protection for `develop` (Development)

1. Still in **Settings** → **Branches**
2. Click **"Add rule"** again
3. Configure:

   **Branch name pattern**: `develop` (or `dev`, `development`)

   **Protection settings**:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: `1` (optional for dev, but recommended)
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Select required checks:
       - `lint-and-build` (from CI workflow)
       - `build-and-test` (from development workflow)
   
   - ✅ **Require conversation resolution before merging**
   
   - ⚠️ **Do not allow bypassing the above settings**
     - ⚠️ Uncheck "Even administrators" (allows admins to bypass for urgent fixes)
   
   - ✅ **Restrict who can push to matching branches**
     - Leave empty (no one can push directly)
   
   - ✅ **Allow force pushes**: ❌ Unchecked
   - ✅ **Allow deletions**: ❌ Unchecked

4. Click **"Create"**

## 🔄 Branching Strategy

```
main (production)
  ↑ PR required
develop (development)
  ↑ PR required
feature/feature-name (contributor branch)
```

### Workflow:

1. **Contributor creates feature branch**:
   ```bash
   git checkout -b feature/new-feature
   # or
   git checkout -b fix/bug-fix
   # or
   git checkout -b hotfix/urgent-fix
   ```

2. **Make changes and push**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

3. **Create Pull Request**:
   - Go to GitHub repository
   - Click "New Pull Request"
   - Base: `develop` (for features) or `main` (for hotfixes)
   - Compare: `feature/new-feature`
   - Fill PR description
   - Request reviewers
   - Create PR

4. **CI Checks Run Automatically**:
   - Lint check
   - Build verification
   - Status comment on PR

5. **After Review & Approval**:
   - Merge PR to `develop`
   - `develop` auto-deploys to development environment
   - When ready, create PR from `develop` → `main`
   - `main` auto-deploys to production

## 📝 Branch Naming Conventions

Use these prefixes for feature branches:

- `feature/` - New features
  - Example: `feature/user-authentication`
- `fix/` - Bug fixes
  - Example: `fix/login-error`
- `hotfix/` - Urgent production fixes
  - Example: `hotfix/security-patch`
- `refactor/` - Code refactoring
  - Example: `refactor/api-structure`
- `docs/` - Documentation updates
  - Example: `docs/api-documentation`
- `test/` - Test additions/changes
  - Example: `test/user-service`

## ✅ Verification

After setting up branch protection:

1. **Test direct push to `main`** (should fail):
   ```bash
   git checkout main
   git commit --allow-empty -m "test: direct push"
   git push origin main
   # Should show error: "remote: error: GH006: Protected branch update failed"
   ```

2. **Test PR workflow**:
   - Create a feature branch
   - Make a small change
   - Create PR to `develop`
   - Verify CI checks run
   - Merge PR (should work)

## 🚨 Emergency Bypass (Admins Only)

If you need to bypass protection for urgent fixes:

1. Go to repository **Settings** → **Branches**
2. Temporarily uncheck "Do not allow bypassing" for the branch
3. Make the urgent fix
4. Re-enable protection immediately after

**⚠️ Warning**: Only use this for true emergencies!

## 📊 Status Checks Configuration

The following status checks are required (from workflows):

### For `main`:
- `lint-and-build` (CI workflow)
- `build-and-test` (Production workflow)

### For `develop`:
- `lint-and-build` (CI workflow)
- `build-and-test` (Development workflow)

## 🔐 Code Owners (Optional)

Create `.github/CODEOWNERS` file to require specific reviewers:

```
# Global owners
* @your-username

# Frontend
/src/ @frontend-team

# Backend
/cineflix-api/ @backend-team

# Documentation
*.md @docs-team
```

## 📋 Summary

✅ **Main branch**: Requires PR + 1 approval + CI checks  
✅ **Develop branch**: Requires PR + CI checks  
✅ **Feature branches**: Free to push, require PR to merge  
✅ **Direct pushes**: Blocked on protected branches  
✅ **Force pushes**: Disabled on protected branches  

---

**Your repository is now protected! 🛡️**

