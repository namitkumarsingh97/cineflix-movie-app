# Enforcement Status Guide

## 🎯 What is Enforcement Status?

**Enforcement status** determines whether the ruleset is **actively enforced** or just **evaluated** (for testing).

## 📋 Options

### ✅ **Active** (Recommended for Production)

- **What it does**: Rules are **fully enforced**
- **Effect**: 
  - Protected branches are actually protected
  - PRs cannot merge if rules aren't met
  - Direct pushes are blocked
  - Status checks are required
- **When to use**: 
  - ✅ For production rulesets (`main`)
  - ✅ For development rulesets (`develop`)
  - ✅ When you want rules to actually work

### ⚠️ **Evaluate** (Testing Mode)

- **What it does**: Rules are **evaluated but not enforced**
- **Effect**:
  - Rules are checked and reported
  - But they don't actually block anything
  - Useful for testing rules before enforcing
- **When to use**:
  - ⚠️ When testing new rulesets
  - ⚠️ When you want to see what would happen without blocking
  - ⚠️ Temporary testing phase

### ❌ **Disabled**

- **What it does**: Rules are **not applied at all**
- **Effect**: Ruleset exists but does nothing
- **When to use**:
  - ❌ Temporarily disable ruleset
  - ❌ Keep ruleset configuration but don't enforce it

## ✅ Correct Selection for Your Rulesets

### For `develop` (Development) Ruleset:

**Select: ✅ Active**

```
Ruleset Name: develop
Enforcement status: Active ✅
```

**Why Active?**
- You want to actually protect the `develop` branch
- You want PRs to be required
- You want status checks to be enforced
- You want the rules to work, not just be evaluated

### For `main` (Production) Ruleset:

**Select: ✅ Active**

```
Ruleset Name: Production Protection (main)
Enforcement status: Active ✅
```

**Why Active?**
- Production must be fully protected
- Rules must be enforced, not just evaluated
- No exceptions for production

## 📊 Comparison

| Status | Rules Enforced? | Blocks Actions? | Use Case |
|--------|----------------|-----------------|----------|
| **Active** ✅ | Yes | Yes | Production, Development |
| **Evaluate** ⚠️ | No (just reports) | No | Testing only |
| **Disabled** ❌ | No | No | Temporarily off |

## 🎯 Quick Answer

**For your `develop` ruleset:**

```
Enforcement status: Active ✅
```

This ensures your rules actually protect the branch and enforce PR requirements.

## ⚠️ Common Mistake

**Don't select "Evaluate" for production/development rulesets!**

- "Evaluate" is only for testing
- It won't actually block anything
- Your branches won't be protected
- PRs can merge without meeting requirements

---

**Select "Active" for both `develop` and `main` rulesets! ✅**

