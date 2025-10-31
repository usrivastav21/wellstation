# 🔀 Fork Workflow Guide

This guide explains how to work with your fork of the WellStation repository.

## Current Setup

Your repository is already configured with:
- **Origin (Your Fork)**: `git@github.com:usrivastav21/wellstation.git`
- **Upstream (Original)**: `https://github.com/pranavdhamanage-work/wellstation.git`

## 📋 Fork Operations

### 1. **Committing Your Changes**

To commit and push your local changes (like the YouTube Error 153 fixes):

```bash
# Stage your changes
git add frontend/src/report-generation/result/Report.jsx
git add src/electron/windows.js

# Commit with a descriptive message
git commit -m "Fix YouTube Error 153 in embedded videos

- Add webRequest handlers in Electron to set Referer/Origin headers
- Enhanced origin detection for Electron apps
- Added retry functionality and better error handling
- Improved YouTube embed URL generation with proper parameters"

# Push to your fork (origin)
git push origin main
```

### 2. **Syncing with Upstream (Original Repository)**

To get the latest changes from the original repository:

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream changes into your main branch
git checkout main
git merge upstream/main

# Push updated branch to your fork
git push origin main
```

### 3. **Creating a New Fork (If Needed)**

If you need to create a fresh fork on GitHub:

1. **On GitHub:**
   - Go to `https://github.com/pranavdhamanage-work/wellstation`
   - Click the **"Fork"** button in the top right
   - Choose your account (`usrivastav21`)
   - Wait for the fork to be created

2. **On Your Local Machine:**
   ```bash
   # Clone your new fork
   git clone git@github.com:usrivastav21/wellstation.git
   cd wellstation
   
   # Add upstream remote (if not already set)
   git remote add upstream https://github.com/pranavdhamanage-work/wellstation.git
   
   # Verify remotes
   git remote -v
   ```

### 4. **Creating a Pull Request**

To contribute your changes back to the original repository:

```bash
# 1. Make sure your changes are committed and pushed to your fork
git add .
git commit -m "Your descriptive commit message"
git push origin main

# 2. Create a new branch for your PR (optional, but recommended)
git checkout -b fix-youtube-error-153
git push -u origin fix-youtube-error-153
```

Then on GitHub:
1. Go to your fork: `https://github.com/usrivastav21/wellstation`
2. Click **"Contribute"** → **"Open Pull Request"**
3. Select your branch and fill out the PR description
4. Submit the pull request

### 5. **Updating Your Fork from Upstream**

To keep your fork in sync with the original repository:

```bash
# Fetch all changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Resolve any conflicts if they occur
# Then push to your fork
git push origin main
```

### 6. **Working on Feature Branches**

Best practice for working on features:

```bash
# Create a new feature branch from main
git checkout main
git pull upstream main  # Get latest changes
git checkout -b feature/youtube-error-fix

# Make your changes and commit
git add .
git commit -m "Description of changes"

# Push to your fork
git push -u origin feature/youtube-error-fix

# Create PR from this branch
```

## 🔧 Current Status

You currently have:
- ✅ Fork configured correctly (`origin` = your fork)
- ✅ Upstream configured (`upstream` = original repo)
- ⚠️ Uncommitted changes (YouTube Error 153 fixes)

## 🚀 Quick Commands for Your Current Situation

To commit and push your YouTube Error 153 fixes:

```bash
# Stage the changes
git add frontend/src/report-generation/result/Report.jsx src/electron/windows.js

# Commit
git commit -m "Fix YouTube Error 153: Add referrer headers and enhanced error handling"

# Push to your fork
git push origin main
```

## 📝 Useful Git Commands

```bash
# Check current status
git status

# View remotes
git remote -v

# View commits ahead/behind
git log --oneline --graph --decorate --all

# Compare with upstream
git fetch upstream
git log HEAD..upstream/main  # See what's in upstream you don't have
git log upstream/main..HEAD  # See what you have that upstream doesn't

# Update your fork
git pull upstream main
git push origin main
```

## 🔗 Repository Links

- **Your Fork**: https://github.com/usrivastav21/wellstation
- **Original**: https://github.com/pranavdhamanage-work/wellstation
