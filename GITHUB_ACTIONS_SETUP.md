# GitHub Actions Windows Build Setup Guide

This guide explains how to use GitHub Actions to build your WellStation Windows application without needing a Windows machine.

## 📋 Table of Contents

1. [How It Works](#how-it-works)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [Configuration](#configuration)
5. [Running the Build](#running-the-build)
6. [Downloading Build Artifacts](#downloading-build-artifacts)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 How It Works

The GitHub Actions workflow (`.github/workflows/build-windows.yml`) does the following:

1. **Spins up a Windows VM** (free on GitHub)
2. **Installs Python** and all your backend dependencies
3. **Builds the backend** using PyInstaller → creates `wellstation-backend.exe`
4. **Builds the frontend** using your React build process
5. **Packages everything** with Electron Builder → creates Windows installer
6. **Uploads the installer** as a downloadable artifact

**Cost**: FREE for public repositories, 2000 minutes/month for private repos

---

## ✅ Prerequisites

1. Your code must be in a **GitHub repository**
2. You need **push access** to the repository
3. You need to configure **GitHub Secrets** (see Configuration below)

---

## 🚀 Setup Instructions

### Step 1: Push Your Code to GitHub

```bash
# If you haven't already created a GitHub repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/wellstation-desktop-app.git
git push -u origin main
```

### Step 2: Create Environment Files Locally

You need to create `.env.development` and `.env.production` files in your `backend/` directory. These contain your configuration like MongoDB connection strings, API keys, etc.

**Example `.env.production`:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-here
FLASK_ENV=production
PORT=3001
# Add all your other environment variables
```

**Example `.env.development`:**

```env
MONGODB_URI=mongodb://localhost:27017/wellstation_dev
JWT_SECRET=dev-secret-key
FLASK_ENV=development
PORT=3001
# Add all your other environment variables
```

**⚠️ Important**: Do NOT commit these files to Git! They should be in your `.gitignore`.

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Secret 1: `BACKEND_ENV_PRODUCTION`

- **Name**: `BACKEND_ENV_PRODUCTION`
- **Value**: Copy the entire contents of your `backend/.env.production` file

#### Secret 2: `BACKEND_ENV_DEVELOPMENT`

- **Name**: `BACKEND_ENV_DEVELOPMENT`
- **Value**: Copy the entire contents of your `backend/.env.development` file

### Step 4: Verify Workflow File

Make sure the workflow file exists at:

```
.github/workflows/build-windows.yml
```

If you need to adjust Python version, edit line 42:

```yaml
python-version: "3.11" # Change to your Python version (3.8, 3.9, 3.10, 3.11, etc.)
```

---

## ⚙️ Configuration

### Adjusting the Build Type

The workflow builds for **production** by default. To change this:

Edit the workflow file and modify the build command (around line 95):

```yaml
# For development build:
- name: Build Backend Windows Executable
  run: npm run build:python:windows:dev
```

### Adjusting Node.js Version

If you need a different Node.js version, edit line 64:

```yaml
node-version: "20" # Change to your required version
```

### Adjusting Triggers

The workflow currently triggers on:

- Push to `main` or `master` branch
- Pull requests to `main` or `master`
- Manual trigger from GitHub UI

To change triggers, edit the `on:` section at the top of the workflow file.

---

## ▶️ Running the Build

### Option 1: Automatic Trigger (Push to Main)

```bash
git add .
git commit -m "Your changes"
git push origin main
```

The workflow will automatically start building.

### Option 2: Manual Trigger

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Build Windows Application** workflow
4. Click **Run workflow** button (top right)
5. Select branch and build type
6. Click **Run workflow**

### Option 3: Create a Release Tag

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

This will build AND create a GitHub release with the installer attached.

---

## 📦 Downloading Build Artifacts

### After the Build Completes:

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click on the completed workflow run
4. Scroll down to **Artifacts** section
5. Download:
   - **wellstation-windows-installer** - The `.exe` installer file
   - **wellstation-windows-unpacked** - Full unpacked application (for debugging)

### Artifact Retention:

- Installers: **30 days**
- Unpacked apps: **7 days**

---

## 🐛 Troubleshooting

### Build Fails at "Install Python Dependencies"

**Problem**: Missing or incompatible packages

**Solutions**:

1. Check your `backend/requirements.txt` is up to date
2. Some packages may not have Windows wheels available
3. Check the build logs for specific package errors

**Fix for packages without wheels**:

```bash
# Add to workflow before pip install:
- name: Install Build Tools
  run: choco install visualstudio2019buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools"
```

### Build Fails at "Build Backend Windows Executable"

**Problem**: PyInstaller can't find modules or files

**Check**:

1. Verify all hidden imports are in `backend/scripts/build-windows.js`
2. Verify all data files are being added
3. Check the build logs for "module not found" errors

**Common fixes**:

- Add missing module to `--hidden-import` list
- Add missing data files to `--add-data` list

### Build Succeeds but .exe Doesn't Work on Windows

**Problem**: Missing DLLs or incorrect binaries

**Solutions**:

1. Download the unpacked artifact and check logs
2. Verify ffmpeg.exe is included (should be at `backend/tools/ffmpeg.exe`)
3. Check that all native libraries (OpenCV, OpenSMILE) have Windows versions

### Environment Variables Not Working

**Problem**: Backend can't connect to database or services

**Check**:

1. Verify GitHub secrets are correctly named:
   - `BACKEND_ENV_PRODUCTION`
   - `BACKEND_ENV_DEVELOPMENT`
2. Verify the secret values include ALL required variables
3. Check there are no extra spaces or newlines

**Test locally**:

```bash
# Copy the secret value and test locally
cd backend
echo "YOUR_SECRET_VALUE" > .env.production
python run.py
```

### "Artifact Not Found" Error

**Problem**: Build completed but no artifacts uploaded

**Check**:

1. Verify the output directory is `release-prod/` (check `electron-builder-prod.json`)
2. Check if electron-builder actually created files
3. Look at the "List Build Output" step logs

### Workflow Takes Too Long

**Normal build time**: 10-20 minutes

**If longer**:

- Check if pip is downloading large packages (PyTorch, TensorFlow)
- Consider using cache for pip and npm (already configured)
- Some packages compile from source (very slow)

**Optimize**:

```yaml
# Add this to Python setup for faster installs
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: "3.11"
    cache: "pip"
    cache-dependency-path: "backend/requirements.txt"
```

---

## 📊 Monitoring Builds

### View Build Status

1. Go to **Actions** tab in your repository
2. See list of all workflow runs
3. Green checkmark = success ✅
4. Red X = failed ❌
5. Yellow circle = in progress 🟡

### Build Time Limits

- **Free tier**: 2000 minutes/month for private repos
- **Public repos**: Unlimited
- **Per job limit**: 6 hours max

---

## 🔄 Updating the Workflow

If you need to modify the build process:

1. Edit `.github/workflows/build-windows.yml`
2. Commit and push changes
3. Next run will use updated workflow

**Tip**: Test changes on a separate branch first!

---

## 📝 Additional Notes

### Why GitHub Actions vs Docker + Wine?

✅ **Native Windows environment** - no emulation issues  
✅ **Works with your existing build scripts** - no modifications needed  
✅ **Can actually test the .exe** - same environment as end users  
✅ **Free** - 2000 minutes/month (private) or unlimited (public)  
✅ **Industry standard** - used by major projects  
✅ **Reliable** - less debugging than Wine approach

### Security Considerations

- **Never** commit `.env` files to Git
- **Always** use GitHub Secrets for sensitive data
- **Review** secrets carefully before saving
- **Rotate** keys if repository becomes public

### Multiple Build Configurations

To build both dev and prod versions:

Create a workflow matrix:

```yaml
strategy:
  matrix:
    build_type: [dev, prod]

steps:
  - name: Build Backend
    run: npm run build:python:windows:${{ matrix.build_type }}
```

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the workflow logs** - Most errors are explained there
2. **Search GitHub Actions documentation** - https://docs.github.com/en/actions
3. **Check PyInstaller documentation** - https://pyinstaller.org/
4. **Check Electron Builder documentation** - https://www.electron.build/

---

## ✅ Quick Checklist

Before running your first build:

- [ ] Code is pushed to GitHub
- [ ] Workflow file exists at `.github/workflows/build-windows.yml`
- [ ] GitHub Secrets configured: `BACKEND_ENV_PRODUCTION`, `BACKEND_ENV_DEVELOPMENT`
- [ ] `backend/requirements.txt` is up to date
- [ ] `backend/tools/ffmpeg.exe` exists
- [ ] Python version in workflow matches your development environment
- [ ] All necessary files are not in `.gitignore` (except `.env` files)

---

## 🎉 Success!

Once the build completes successfully:

1. Download the installer from Artifacts
2. Test on a real Windows machine
3. If it works, you're done!
4. If not, check troubleshooting section above

**Remember**: The first build might take longer as it caches dependencies. Subsequent builds will be faster!

---

**Happy Building! 🚀**
