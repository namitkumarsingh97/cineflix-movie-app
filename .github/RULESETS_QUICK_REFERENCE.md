# GitHub Rulesets Quick Reference

Quick reference for configuring branch protection rulesets.

## 🎯 Production Ruleset (main)

### Basic Configuration
- **Name**: `Production Protection (main)`
- **Target**: `main` (or `master`)
- **Enforcement**: Active
- **Bypass**: None (recommended)

### Required Rules
```
✅ Restrict creations
✅ Restrict updates
✅ Restrict deletions
✅ Require a pull request before merging
   - Require approvals: 1+
   - Dismiss stale approvals: Yes
   - Require Code Owners: Yes (if CODEOWNERS exists)
✅ Require status checks to pass
   - Require up to date: Yes
   - Required checks: lint-and-build, build-and-test, validate-pr
✅ Block force pushes
```

### Optional Rules
```
❌ Require linear history (optional)
❌ Require signed commits (optional)
❌ Require deployments (optional)
❌ Code scanning (optional)
❌ Code quality (optional)
❌ Copilot review (optional)
```

---

## 🌿 Development Ruleset (develop)

### Basic Configuration
- **Name**: `Development Protection (develop)`
- **Target**: `develop` (or `dev`, `development`)
- **Enforcement**: Active
- **Bypass**: Admins (optional, for urgent fixes)

### Required Rules
```
✅ Restrict creations
✅ Restrict updates
✅ Restrict deletions
✅ Require a pull request before merging
   - Require approvals: 0-1 (less strict)
   - Dismiss stale approvals: Yes
   - Require Code Owners: Optional
✅ Require status checks to pass
   - Require up to date: Yes
   - Required checks: lint-and-build, build-and-test, validate-pr
✅ Block force pushes
```

### Optional Rules
```
❌ Require linear history (optional)
❌ Require signed commits (optional)
❌ Require deployments (optional)
❌ Code scanning (optional)
❌ Code quality (optional)
❌ Copilot review (optional)
```

---

## 📋 Status Checks

### Required Status Checks
These must be added to both rulesets:

1. **`lint-and-build`**
   - Source: `.github/workflows/ci.yml`
   - Job: `lint-and-build`

2. **`build-and-test`**
   - Source: `.github/workflows/production.yml` (for main)
   - Source: `.github/workflows/development.yml` (for develop)
   - Job: `build-and-test`

3. **`validate-pr`**
   - Source: `.github/workflows/pr-validation.yml`
   - Job: `validate-pr`

### How to Find Status Check Names
1. Go to **Actions** tab
2. Run a workflow
3. Check the job name in the workflow file
4. Use that exact name in ruleset

---

## 🔄 Workflow

```
Feature Branch
    ↓
Create PR → develop
    ↓
CI Checks Run
    ↓
Code Review
    ↓
Merge to develop
    ↓
Create PR → main
    ↓
CI Checks Run
    ↓
Code Review + Approval
    ↓
Merge to main
```

---

## ✅ Checklist

### Setup
- [ ] Create Production Ruleset for `main`
- [ ] Create Development Ruleset for `develop`
- [ ] Configure all required rules
- [ ] Add status checks
- [ ] Test with a feature branch PR

### Verification
- [ ] Direct push to `main` fails
- [ ] Direct push to `develop` fails
- [ ] PR to `develop` works
- [ ] PR to `main` requires approval
- [ ] CI checks run on PRs

---

## 🚨 Common Issues

### "Status check not found"
- Run the workflow once (create a test PR)
- Status check name appears after first run

### "Cannot push to protected branch"
- ✅ Expected behavior!
- Use PR workflow instead

### "PR blocked - status checks pending"
- Wait for workflows to complete
- Check Actions tab for status

---

**Quick Setup**: Follow `GITHUB_RULESETS_SETUP.md` for detailed instructions.

