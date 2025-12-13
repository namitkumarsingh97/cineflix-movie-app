# Contributing Guide

Thank you for your interest in contributing to CineFlix Movie App! This guide will help you understand our development workflow.

## 🌿 Branching Strategy

```
main (production) ← Requires PR
  ↑
develop (development) ← Requires PR
  ↑
feature/your-feature (your branch)
```

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/cineflix-movie-app.git
cd cineflix-movie-app
git remote add upstream https://github.com/ORIGINAL_OWNER/cineflix-movie-app.git
```

### 2. Create a Feature Branch

**Never work directly on `main` or `develop`!**

```bash
# Update your local develop branch
git checkout develop
git pull upstream develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments where necessary
- Test your changes locally

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git add .
git commit -m "feat: add user authentication"
```

**Commit message prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Build process, dependencies

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then:
1. Go to GitHub repository
2. Click "New Pull Request"
3. Select base: `develop` (for features) or `main` (for hotfixes)
4. Fill out PR template
5. Request reviewers
6. Create PR

## 📋 Pull Request Process

### PR Requirements

- ✅ Code must pass CI checks (lint, build)
- ✅ At least 1 approval required (for `main`)
- ✅ All conversations must be resolved
- ✅ Branch must be up to date with base branch

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added tests (if applicable)

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

1. **CI Checks**: Automatically run on PR creation
2. **Code Review**: Team members review your code
3. **Address Feedback**: Make requested changes
4. **Approval**: Once approved, you can merge
5. **Merge**: Squash and merge (recommended)

## 🔄 Syncing Your Branch

Keep your branch up to date:

```bash
# Fetch latest changes
git fetch upstream

# Rebase on latest develop
git checkout feature/your-feature-name
git rebase upstream/develop

# Force push (if already pushed)
git push origin feature/your-feature-name --force-with-lease
```

## 🐛 Reporting Bugs

1. Check if issue already exists
2. Create new issue with:
   - Clear title
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details

## 💡 Suggesting Features

1. Check if feature already requested
2. Create feature request issue
3. Describe the feature
4. Explain use case
5. Wait for discussion/approval

## 📝 Code Style

- Use ESLint (if configured)
- Follow Vue.js style guide
- Use meaningful variable names
- Keep functions small and focused
- Add JSDoc comments for complex functions

## ✅ Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console errors
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with base

## 🎯 Branch Naming

Use these prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Tests

Examples:
- `feature/user-authentication`
- `fix/login-error`
- `hotfix/security-patch`

## 🚨 Hotfix Process

For urgent production fixes:

1. Create branch from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b hotfix/urgent-fix
   ```

2. Make fix and test
3. Create PR to `main` (bypasses `develop`)
4. After merge, also merge `main` → `develop`

## 📞 Getting Help

- Check existing issues/PRs
- Ask in discussions
- Contact maintainers

## 🙏 Thank You!

Your contributions make this project better. We appreciate your time and effort!

---

**Happy Contributing! 🎉**

