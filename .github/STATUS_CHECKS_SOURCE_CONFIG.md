# Status Checks Source Configuration

## ✅ Correct Selection for Status Checks

For all three status checks (`lint-and-build`, `build-and-test`, `validate-pr`), you should select:

### **"Any source"** ✅

## Why "Any source"?

These status checks come from **GitHub Actions workflows**, not from external services:

1. **`lint-and-build`** - From `.github/workflows/ci.yml` (GitHub Actions)
2. **`build-and-test`** - From `.github/workflows/production.yml` (GitHub Actions)
3. **`validate-pr`** - From `.github/workflows/pr-validation.yml` (GitHub Actions)

**"Any source"** means the check can come from any source (GitHub Actions, external services, etc.), which is correct for GitHub Actions workflows.

## Configuration Summary

```
Status Checks:
├── lint-and-build
│   └── Source: "Any source" ✅
├── build-and-test
│   └── Source: "Any source" ✅
└── validate-pr
    └── Source: "Any source" ✅
```

## When to Use Other Sources

- **Vercel**: Only if you want to require Vercel deployment checks separately
- **GitGuardian**: Only if you use GitGuardian for security scanning
- **Copilot SWE Agent**: Only if you use GitHub Copilot for code review

**For your setup**: All checks are from GitHub Actions, so **"Any source"** is correct for all three.

## Quick Setup Steps

1. For each status check (`lint-and-build`, `build-and-test`, `validate-pr`):
   - Click the "Any source" button
   - Select **"Any source"** from the dropdown
   - ✅ Done!

2. Make sure all three checks are added to the required list

3. Save the ruleset

---

**All three checks should use "Any source" ✅**

