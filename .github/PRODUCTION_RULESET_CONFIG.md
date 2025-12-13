# Production Ruleset Configuration Guide

## ✅ Correct Configuration for Production (main)

### "Require status checks to pass" Settings

**For Production, configure as follows:**

#### ✅ Require branches to be up to date before merging
- **Status**: ✅ **ENABLED** (Checked)
- **Why**: Ensures PRs are tested against the latest code from `main`
- **Effect**: PRs must be rebased/updated if `main` has new commits

#### ❌ Do not require status checks on creation
- **Status**: ❌ **DISABLED** (Unchecked)
- **Why**: We want status checks to run even when branches are first created
- **Effect**: Status checks are required from the moment a branch is created

### Required Status Checks

Add these specific checks (they appear after workflows run once):

1. **`lint-and-build`**
   - Source: `.github/workflows/ci.yml`
   - Job: `lint-and-build`
   - **Source Selection**: **"Any source"** ✅

2. **`build-and-test`**
   - Source: `.github/workflows/production.yml`
   - Job: `build-and-test`
   - **Source Selection**: **"Any source"** ✅

3. **`validate-pr`**
   - Source: `.github/workflows/pr-validation.yml`
   - Job: `validate-pr`
   - **Source Selection**: **"Any source"** ✅

**Important**: When configuring each check, select **"Any source"** from the dropdown. This is correct for GitHub Actions workflows.

### Visual Configuration

```
Require status checks to pass
├── ✅ Require branches to be up to date before merging
├── ❌ Do not require status checks on creation
└── Required status checks:
    ├── ✅ lint-and-build
    ├── ✅ build-and-test
    └── ✅ validate-pr
```

## 🎯 Why These Settings?

### ✅ Require branches to be up to date
**Enabled for Production** because:
- Prevents merging outdated code
- Ensures PRs are tested against latest `main`
- Prevents merge conflicts
- Maintains code quality

### ❌ Do not require status checks on creation
**Disabled for Production** because:
- We want strict checks from the start
- Prevents merging untested code
- Ensures all PRs go through CI
- Maintains production quality standards

## 📊 Comparison: Production vs Development

| Setting | Production (main) | Development (develop) |
|---------|------------------|----------------------|
| Require up to date | ✅ Yes | ✅ Yes |
| Do not require on creation | ❌ No (checks required) | ⚠️ Optional (can be Yes) |

## ✅ Final Production Configuration

```
Require status checks to pass
├── ✅ Require branches to be up to date before merging
├── ❌ Do not require status checks on creation (UNCHECKED)
└── Required status checks:
    ├── ✅ lint-and-build
    ├── ✅ build-and-test
    └── ✅ validate-pr
```

## 🚨 Common Mistakes

### ❌ Wrong: "Do not require status checks on creation" = Checked
- **Problem**: Allows branches to be created without checks
- **Risk**: Untested code could be merged
- **Fix**: Uncheck this option

### ❌ Wrong: "Require branches to be up to date" = Unchecked
- **Problem**: PRs can merge with outdated code
- **Risk**: Merge conflicts, broken builds
- **Fix**: Check this option

## 🔍 Verification

After configuration, test:

1. **Create a PR** from feature branch to `main`
2. **Verify**: Status checks run automatically
3. **Update main**: Make a commit to `main`
4. **Verify**: PR shows "This branch is out of date"
5. **Update PR**: Rebase or merge `main` into PR branch
6. **Verify**: Status checks run again
7. **Verify**: PR can only merge when checks pass

## 📝 Summary

**For Production Ruleset:**

✅ **Require branches to be up to date before merging**: **ENABLED**  
❌ **Do not require status checks on creation**: **DISABLED** (unchecked)  
✅ **Required status checks**: Add all three checks listed above

This ensures:
- All PRs are tested
- PRs are always up to date
- No untested code reaches production
- High code quality standards

---

**Your production ruleset is now correctly configured! 🛡️**

