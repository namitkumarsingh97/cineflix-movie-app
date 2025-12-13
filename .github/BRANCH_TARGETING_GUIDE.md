# Branch Targeting Guide

## ❌ Issue with Current Configuration

**Your current setup:**
- `develop` ruleset → Target: `develop` ✅ **CORRECT**
- `main` ruleset → Target: `default` ❌ **INCORRECT**

## ✅ Correct Configuration

### For `main` Ruleset:

**Target branch should be: `main`** (or `master` if that's your branch name)

**NOT "default"** - "default" is not a branch name!

```
Ruleset Name: Production Protection (main)
Target branches:
  └── Branch name: main ✅
```

### For `develop` Ruleset:

**Target branch: `develop`** ✅ **CORRECT**

```
Ruleset Name: Development Protection (develop)
Target branches:
  └── Branch name: develop ✅
```

## 🎯 How to Fix

### Step 1: Check Your Default Branch

1. Go to repository **Settings** → **General**
2. Check what your **Default branch** is:
   - If it's `main` → Use `main` as target
   - If it's `master` → Use `master` as target

### Step 2: Update `main` Ruleset

1. Go to **Settings** → **Rules** → **Rulesets**
2. Find your `main` ruleset
3. Click **Edit**
4. Under **Target branches**:
   - Remove `default` if it's there
   - Click **"Add branch targeting criteria"**
   - Select: **Branch name**
   - Enter: `main` (or `master` if that's your default branch)
   - Click **"Add"**

## 📋 Correct Configuration Summary

| Ruleset | Target Branch | Status |
|---------|--------------|--------|
| `develop` | `develop` | ✅ Correct |
| `main` | `main` (or `master`) | ✅ Should be this |

## 🔍 What is "default"?

- "default" is a **concept**, not a branch name
- It refers to your repository's default branch
- GitHub doesn't allow targeting "default" as a branch name
- You must use the actual branch name: `main` or `master`

## ✅ Final Configuration

### Production Ruleset:
```
Ruleset Name: Production Protection (main)
Target branches:
  └── Branch name: main ✅
```

### Development Ruleset:
```
Ruleset Name: Development Protection (develop)
Target branches:
  └── Branch name: develop ✅
```

## 🚨 Common Mistakes

### ❌ Wrong: Target = "default"
- **Problem**: "default" is not a valid branch name
- **Result**: Ruleset won't work
- **Fix**: Use actual branch name (`main` or `master`)

### ❌ Wrong: Target = "main*" (pattern)
- **Problem**: Pattern matching might match unintended branches
- **Result**: Rules might apply to branches like `main-dev`, `maintenance`, etc.
- **Fix**: Use exact match `main` unless you specifically want pattern matching

### ✅ Correct: Target = "main" (exact)
- **Result**: Rules apply only to the `main` branch
- **Best for**: Production protection

## 🎯 Quick Fix

**For your `main` ruleset:**

1. Edit the ruleset
2. Under **Target branches**, remove `default`
3. Add branch targeting criteria
4. Select **Branch name**
5. Enter: `main` (or `master` if that's your default branch)
6. Save

---

**Summary: Change `main` ruleset target from "default" to "main" (or "master") ✅**

