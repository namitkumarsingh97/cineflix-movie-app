# Branch Protection & PR Workflow Summary

## 🎯 Overview

This repository enforces a **Pull Request-based workflow** where:
- ✅ **Direct merges are blocked** on `main` (production) and `develop` (development)
- ✅ **All changes require Pull Requests** with code review
- ✅ **Contributors create feature branches** and submit PRs

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────┐
│  Individual Contributor                  │
│  Creates: feature/new-feature           │
└──────────────┬──────────────────────────┘
               │
               │ Push & Create PR
               ▼
┌─────────────────────────────────────────┐
│  develop (Development)                  │
│  ← Requires PR + Approval              │
│  ← Auto-deploys to Dev Environment     │
└──────────────┬──────────────────────────┘
               │
               │ PR when ready
               ▼
┌─────────────────────────────────────────┐
│  main (Production)                      │
│  ← Requires PR + Approval              │
│  ← Auto-deploys to Production          │
└─────────────────────────────────────────┘
```

## 📋 Setup Checklist

### 1. GitHub Branch Protection (Required)

**Recommended: Use GitHub Rulesets (newer method)**
- [ ] Set up Rulesets for `main` and `develop`
- [ ] Configure all required rules
- [ ] Add status checks

**See:** `GITHUB_RULESETS_SETUP.md` for detailed Rulesets instructions

**Alternative: Use Legacy Branch Protection**
- [ ] Set up branch protection for `main`
- [ ] Set up branch protection for `develop`
- [ ] Require PR before merging
- [ ] Require approvals (1+ for main)
- [ ] Require status checks to pass
- [ ] Block direct pushes

**See:** `BRANCH_PROTECTION_SETUP.md` for legacy method instructions

### 2. GitHub Secrets (Required)
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `VITE_API_URL_PROD`

**See:** `GITHUB_ACTIONS_SETUP.md` for setup

### 3. Code Owners (Optional)
- [ ] Update `.github/CODEOWNERS` with your username
- [ ] Add team members as needed

## 🚀 Contributor Workflow

### Step 1: Create Feature Branch

```bash
# Update local develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature
```

### Step 2: Make Changes

```bash
# Make your changes
# ... edit files ...

# Commit with conventional format
git add .
git commit -m "feat: add user authentication"
```

### Step 3: Push and Create PR

```bash
git push origin feature/my-new-feature
```

Then on GitHub:
1. Click "New Pull Request"
2. Base: `develop` (for features)
3. Compare: `feature/my-new-feature`
4. Fill PR template
5. Request reviewers
6. Create PR

### Step 4: CI Checks Run

Automatically runs:
- ✅ Branch name validation
- ✅ PR target validation
- ✅ Lint checks
- ✅ Build verification
- ✅ Status comment on PR

### Step 5: Code Review

- Reviewers check your code
- Address feedback
- Make requested changes
- Push updates (PR auto-updates)

### Step 6: Merge

Once approved:
- Merge PR to `develop`
- `develop` auto-deploys
- When ready, create PR `develop` → `main`
- `main` auto-deploys to production

## 🛡️ Protection Rules

### Main Branch (Production)
- ❌ No direct pushes
- ✅ Requires PR
- ✅ Requires 1+ approval
- ✅ Requires CI checks to pass
- ✅ Requires conversation resolution
- ✅ Admins cannot bypass (recommended)

### Develop Branch (Development)
- ❌ No direct pushes
- ✅ Requires PR
- ✅ Requires CI checks to pass
- ✅ Requires conversation resolution
- ⚠️ Admins can bypass (for urgent fixes)

## 📝 Branch Naming

**Required format:** `type/description`

**Types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Tests

**Examples:**
- ✅ `feature/user-authentication`
- ✅ `fix/login-error`
- ✅ `hotfix/security-patch`
- ❌ `my-feature` (missing type prefix)
- ❌ `feature` (missing description)

## 🔍 PR Validation

The `pr-validation.yml` workflow automatically checks:

1. **Branch name** follows convention
2. **PR target** is valid (not from main/develop to themselves)
3. **Commit messages** follow convention
4. **Code builds** successfully
5. **Lint checks** pass

## 📚 Documentation Files

- `BRANCH_PROTECTION_SETUP.md` - How to set up branch protection
- `CONTRIBUTING.md` - Contributor guide
- `GITHUB_ACTIONS_SETUP.md` - CI/CD setup
- `.github/pull_request_template.md` - PR template
- `.github/CODEOWNERS` - Code ownership

## 🚨 Emergency Hotfix

For urgent production fixes:

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/urgent-fix

# Make fix
# ... changes ...

# Create PR to main (bypasses develop)
# After merge, also merge main → develop
```

## ✅ Verification

Test that protection works:

```bash
# Try direct push to main (should fail)
git checkout main
git commit --allow-empty -m "test"
git push origin main
# Expected: "Protected branch update failed"
```

## 🎯 Benefits

✅ **Code Quality** - All code reviewed before merge  
✅ **Collaboration** - Team reviews all changes  
✅ **Safety** - Prevents accidental direct merges  
✅ **History** - Clear PR history for all changes  
✅ **CI/CD** - Automated testing before merge  
✅ **Documentation** - PR descriptions document changes  

## 📞 Need Help?

- Check `CONTRIBUTING.md` for contributor guide
- Check `BRANCH_PROTECTION_SETUP.md` for setup
- Review existing PRs for examples
- Ask maintainers for help

---

**Your repository is now fully protected! 🛡️**

