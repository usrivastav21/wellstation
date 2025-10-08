# 🚀 Quick Start: Building Windows App with GitHub Actions

This is a streamlined guide to get your Windows builds working quickly.

## ⚡ 5-Minute Setup

### 1. Create Environment Files (2 minutes)

```bash
# In the backend directory
cd backend

# Copy the template
cp env.template .env.development
cp env.template .env.production

# Edit with your actual values
nano .env.production  # or use your preferred editor
nano .env.development
```

**Required variables** (minimum):

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A random secret key for JWT tokens
- `SECRET_KEY` - Flask secret key

### 2. Push to GitHub (1 minute)

```bash
# From project root
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### 3. Configure GitHub Secrets (2 minutes)

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add these two secrets:

**Secret 1:**

- Name: `BACKEND_ENV_PRODUCTION`
- Value: [Copy entire contents of `backend/.env.production`]

**Secret 2:**

- Name: `BACKEND_ENV_DEVELOPMENT`
- Value: [Copy entire contents of `backend/.env.development`]

### 4. Trigger Build

**Option A - Automatic:**

```bash
git commit -m "Trigger build"
git push origin main
```

**Option B - Manual:**

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Click **"Build Windows Application"**
3. Click **"Run workflow"**
4. Click **"Run workflow"** button

### 5. Download Your App (after ~15 minutes)

1. Go to the **Actions** tab
2. Click on your completed workflow run
3. Scroll to **Artifacts**
4. Download **"wellstation-windows-installer"**
5. Extract and find your `.exe` file!

---

## 📋 What Gets Built

The workflow creates:

- ✅ `wellstation-backend.exe` - Your Python backend (PyInstaller)
- ✅ `frontend/dist/` - Your React frontend
- ✅ `WellStation Desktop Setup.exe` - Windows installer (NSIS)
- ✅ Unpacked application folder (for debugging)

---

## 🔍 Monitoring Your Build

1. Go to **Actions** tab in GitHub
2. See your workflow running in real-time
3. Click on it to see detailed logs
4. Each step shows its progress:
   - ✅ Green = Success
   - ❌ Red = Failed (check logs)
   - 🟡 Yellow = Running

**Typical build time**: 10-20 minutes

---

## ❓ FAQ

### Q: Do I need a Windows machine?

**A:** No! GitHub provides free Windows VMs to build your app.

### Q: How much does it cost?

**A:** FREE for public repos. Private repos get 2000 minutes/month free.

### Q: Can I test the app without Windows?

**A:** No, you'll need a Windows machine to test the final `.exe`. But GitHub Actions runs on actual Windows, so builds are reliable.

### Q: What if the build fails?

**A:** Check the detailed guide in `GITHUB_ACTIONS_SETUP.md` for troubleshooting.

### Q: Can I build for Mac/Linux too?

**A:** Yes! You can modify the workflow or create separate workflows for other platforms.

### Q: How do I create a release?

**A:** Tag your commit:

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

The workflow will automatically create a GitHub release with the installer attached.

---

## 📚 Additional Resources

- **Full Setup Guide**: `GITHUB_ACTIONS_SETUP.md`
- **Environment Template**: `backend/env.template`
- **Workflow File**: `.github/workflows/build-windows.yml`

---

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain secrets!
2. **Always use GitHub Secrets** for sensitive data
3. **Test the installer on real Windows** before distributing
4. **Keep `requirements.txt` up to date** with your Python dependencies
5. **Monitor your build minutes** if using private repo

---

## 🆘 Having Issues?

1. Check the workflow logs in GitHub Actions
2. Read the full troubleshooting guide in `GITHUB_ACTIONS_SETUP.md`
3. Verify your GitHub Secrets are correct
4. Make sure all required files are pushed to GitHub

---

## ✅ Success Checklist

Before your first build:

- [ ] Environment files created (`.env.development`, `.env.production`)
- [ ] GitHub Secrets configured (both secrets added)
- [ ] Code pushed to GitHub (including workflow file)
- [ ] `backend/requirements.txt` includes all dependencies
- [ ] `backend/tools/ffmpeg.exe` exists
- [ ] `.gitignore` prevents committing sensitive files

---

## 🎉 You're Ready!

Run your first build and in ~15 minutes you'll have a Windows installer ready to distribute!

**Need more details?** See `GITHUB_ACTIONS_SETUP.md` for comprehensive documentation.
