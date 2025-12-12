# GitHub Rulesets Setup Guide

This guide will help you configure GitHub Rulesets to protect your `main` (production) and `develop` (development) branches.

## 🎯 Overview

GitHub Rulesets provide a modern way to protect branches. We'll create two rulesets:
1. **Production Ruleset** - For `main` branch
2. **Development Ruleset** - For `develop` branch

## 📋 Step-by-Step Setup

### Step 1: Create Production Ruleset (main)

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Rules** → **Rulesets**
3. Click **"New ruleset"** or **"Add ruleset"**

#### Ruleset Configuration:

**Ruleset Name**: `Production Protection (main)`

**Enforcement status**: 
- Select: **Active** ✅
- **What this means**: Rules are fully enforced (not just evaluated)
- **Why**: You want the rules to actually protect the branch, not just report violations

**Bypass list**:
- Leave empty (or add specific admins if needed)
- For production, it's recommended to not allow bypasses

**Target branches**:
- Click **"Add branch targeting criteria"**
- Select: **Branch name**
- Enter: `main` (or `master` if you use master)
- ⚠️ **Important**: Use the actual branch name (`main` or `master`), NOT "default"
- Click **"Add"**

**Rules** - Configure each rule:

#### ✅ Restrict creations
- **Enable**: ✅ Checked
- **Effect**: Only users with bypass permission can create branches matching `main`

#### ✅ Restrict updates
- **Enable**: ✅ Checked
- **Effect**: Only users with bypass permission can push directly to `main`

#### ✅ Restrict deletions
- **Enable**: ✅ Checked
- **Effect**: Prevents deletion of `main` branch

#### ⚠️ Require linear history
- **Enable**: ❌ Unchecked (optional, allows merge commits)
- **Note**: Enable if you want only rebase/squash merges

#### ✅ Require a pull request before merging
- **Enable**: ✅ Checked
- **Settings**:
  - ✅ **Require approvals**: `1` (or more)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require review from Code Owners** (if you have CODEOWNERS file)
  - ✅ **Require last push approval** (recommended)

#### ✅ Require status checks to pass
- **Enable**: ✅ Checked
- **Settings**:
  - ✅ **Require branches to be up to date before merging** (ENABLED - Required)
  - ❌ **Do not require status checks on creation** (DISABLED/UNCHECKED - We want checks required)
  - **Required status checks** (add these):
    - `lint-and-build` (from CI workflow)
    - `build-and-test` (from Production workflow)
    - `validate-pr` (from PR Validation workflow)
  
  **Important**: 
  - ✅ Check "Require branches to be up to date" - This ensures PRs are tested against latest code
  - ❌ Uncheck "Do not require status checks on creation" - This ensures checks run from the start

#### ✅ Block force pushes
- **Enable**: ✅ Checked
- **Effect**: Prevents force pushes to `main`

#### ⚠️ Require signed commits
- **Enable**: ❌ Unchecked (optional, enable if you use GPG signing)

#### ⚠️ Require deployments to succeed
- **Enable**: ❌ Unchecked (optional, enable if you want to require successful deployments)

#### ⚠️ Require code scanning results
- **Enable**: ❌ Unchecked (optional, enable if you use code scanning)

#### ⚠️ Require code quality results
- **Enable**: ❌ Unchecked (optional, enable if you use code quality tools)

#### ⚠️ Automatically request Copilot code review
- **Enable**: ❌ Unchecked (optional, enable if you use GitHub Copilot)

4. Click **"Create ruleset"**

---

### Step 2: Create Development Ruleset (develop)

1. Still in **Settings** → **Rules** → **Rulesets**
2. Click **"New ruleset"** or **"Add ruleset"**

#### Ruleset Configuration:

**Ruleset Name**: `Development Protection (develop)`

**Enforcement status**: 
- Select: **Active** ✅
- **What this means**: Rules are fully enforced (not just evaluated)
- **Why**: You want the rules to actually protect the branch, not just report violations

**Bypass list**:
- **Optional**: Add admin users/teams if you want to allow bypasses for urgent fixes
- For development, allowing admin bypasses is acceptable

**Target branches**:
- Click **"Add branch targeting criteria"**
- Select: **Branch name**
- Enter: `develop` (or `dev`, `development` if you use those)
- Click **"Add"**

**Rules** - Configure each rule:

#### ✅ Restrict creations
- **Enable**: ✅ Checked

#### ✅ Restrict updates
- **Enable**: ✅ Checked
- **Note**: This prevents direct pushes to `develop`

#### ✅ Restrict deletions
- **Enable**: ✅ Checked

#### ⚠️ Require linear history
- **Enable**: ❌ Unchecked (optional)

#### ✅ Require a pull request before merging
- **Enable**: ✅ Checked
- **Settings**:
  - ⚠️ **Require approvals**: `0` or `1` (less strict than production)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ⚠️ **Require review from Code Owners**: Optional for dev
  - ⚠️ **Require last push approval**: Optional for dev

#### ✅ Require status checks to pass
- **Enable**: ✅ Checked
- **Settings**:
  - ✅ **Require branches to be up to date before merging**
  - **Required status checks** (add these):
    - `lint-and-build` (from CI workflow)
    - `build-and-test` (from Development workflow)
    - `validate-pr` (from PR Validation workflow)

#### ✅ Block force pushes
- **Enable**: ✅ Checked

#### ⚠️ Require signed commits
- **Enable**: ❌ Unchecked (optional)

#### ⚠️ Require deployments to succeed
- **Enable**: ❌ Unchecked (optional)

#### ⚠️ Require code scanning results
- **Enable**: ❌ Unchecked (optional)

#### ⚠️ Require code quality results
- **Enable**: ❌ Unchecked (optional)

#### ⚠️ Automatically request Copilot code review
- **Enable**: ❌ Unchecked (optional)

4. Click **"Create ruleset"**

---

## 📊 Ruleset Comparison

| Rule | Production (main) | Development (develop) |
|------|------------------|----------------------|
| Restrict creations | ✅ Yes | ✅ Yes |
| Restrict updates | ✅ Yes | ✅ Yes |
| Restrict deletions | ✅ Yes | ✅ Yes |
| Require PR | ✅ Yes (1+ approval) | ✅ Yes (0-1 approval) |
| Require status checks | ✅ Yes | ✅ Yes |
| Block force pushes | ✅ Yes | ✅ Yes |
| Bypass allowed | ❌ No | ⚠️ Admins (optional) |

## ✅ Verification

### Test 1: Direct Push to main (should fail)
```bash
git checkout main
git commit --allow-empty -m "test: direct push"
git push origin main
# Expected: Error about protected branch
```

### Test 2: Direct Push to develop (should fail)
```bash
git checkout develop
git commit --allow-empty -m "test: direct push"
git push origin develop
# Expected: Error about protected branch
```

### Test 3: PR Workflow (should work)
```bash
# Create feature branch
git checkout -b feature/test-pr
git commit --allow-empty -m "test: PR workflow"
git push origin feature/test-pr

# Create PR on GitHub
# Should see: CI checks run, PR can be created
```

## 🔍 Status Checks Reference

Make sure these workflows are set up (they should already be):

1. **`lint-and-build`** - From `.github/workflows/ci.yml`
2. **`build-and-test`** - From `.github/workflows/production.yml` or `.github/workflows/development.yml`
3. **`validate-pr`** - From `.github/workflows/pr-validation.yml`

## 🚨 Troubleshooting

### Issue: "Status check not found"
- **Solution**: Make sure the workflow has run at least once
- Create a test PR and let it run
- Then the status check will appear in the list

### Issue: "Cannot push to protected branch"
- **Solution**: This is expected! Use PR workflow instead
- Create a feature branch and submit PR

### Issue: "PR cannot be merged - status checks pending"
- **Solution**: Wait for CI workflows to complete
- Check Actions tab to see workflow status
- All required checks must pass

### Issue: "PR requires approval"
- **Solution**: Request review from team members
- Once approved, you can merge

## 📝 Additional Configuration

### Code Owners (Optional)

If you want to require specific reviewers:

1. Edit `.github/CODEOWNERS` (already created)
2. Add file patterns and owners
3. Enable "Require review from Code Owners" in ruleset

### Branch Name Patterns

You can also use patterns:
- `main` - Exact match
- `main*` - Matches main, main-dev, etc.
- `release/*` - Matches all release branches

### Multiple Branches

To protect multiple branches with same rules:
- Use branch name pattern: `main|master`
- Or create separate rulesets for each

## 🎯 Summary

✅ **Production (main)**: Fully protected, requires PR + approval  
✅ **Development (develop)**: Protected, requires PR (less strict)  
✅ **Feature branches**: Free to push, require PR to merge  
✅ **Direct pushes**: Blocked on protected branches  
✅ **Force pushes**: Blocked on protected branches  

---

**Your branches are now fully protected! 🛡️**

