const { spawnSync, execSync } = require("child_process");
const { existsSync, writeFileSync, copyFileSync } = require("fs");
const path = require("path");

const spawnOptions = { detached: false, shell: true, stdio: "inherit" };

class WindowsBuilder {
  buildPython = (buildType = "prod") => {
    console.log(
      `🚀 Building Python backend for Windows (${buildType} build)...`
    );

    // Create build info and prepare environment file
    this.prepareBuildEnvironment(buildType);

    // Windows-specific PyInstaller command
    const pyinstallerCommand = this.buildWindowsPyInstallerCommand();

    console.log("Running command:");
    console.log(pyinstallerCommand);

    // Set environment variable to indicate PyInstaller build process
    const env = { ...process.env, PYINSTALLER_BUILD: "1" };
    const spawnOptionsWithEnv = { ...spawnOptions, env };

    const result = spawnSync(pyinstallerCommand, spawnOptionsWithEnv);

    if (result.status === 0) {
      console.log("✅ Windows Python backend built successfully!");
      console.log(
        `📁 Executable location: ${path.resolve(
          process.cwd(),
          "dist",
          "wellstation-backend.exe"
        )}`
      );

      // Clean up any running processes that might have been started during build
      this.cleanupRunningProcesses();
    } else {
      console.error("❌ Windows Python backend build failed!");
      console.error(`Exit code: ${result.status}`);
      process.exit(1);
    }
  };

  prepareBuildEnvironment = (buildType) => {
    const isDev = buildType === "dev";
    const environment = isDev ? "development" : "production";

    console.log(`📝 Creating build info for ${buildType} build...`);

    // Create build_info.json
    const buildInfo = {
      build_type: buildType,
      environment: environment,
    };

    writeFileSync(
      path.join(process.cwd(), "build_info.json"),
      JSON.stringify(buildInfo, null, 2)
    );

    // Copy appropriate .env file to .env
    const sourceEnvFile = isDev ? ".env.development" : ".env.production";
    const targetEnvFile = ".env";

    console.log(`📁 Copying ${sourceEnvFile} to ${targetEnvFile}...`);
    copyFileSync(
      path.join(process.cwd(), sourceEnvFile),
      path.join(process.cwd(), targetEnvFile)
    );

    console.log(`✅ Build environment prepared for ${environment}`);
  };

  buildWindowsPyInstallerCommand = () => {
    const baseCommand = "python -m PyInstaller"; // Note: 'python' not 'python3'
    const cwd = process.cwd();

    const options = [
      "--onefile",
      "--console",
      "--noconfirm",
      "--distpath ./dist",
      "--workpath ./build",
      "--specpath ./build",
      "--name wellstation-backend.exe", // Note: .exe extension
      `--additional-hooks-dir ${cwd}/hooks`,

      // Add data files with Windows path separators
      `--add-data ${cwd}/processingScripts;processingScripts`,
      `--add-data ${cwd}/app;app`,
      `--add-data ${cwd}/.env;.`,
      `--add-data ${cwd}/build_info.json;.`,
      `--add-data ${cwd}/config.py;.`,

      // Windows-specific hidden imports
      "--hidden-import win32api",
      "--hidden-import win32con",
      "--hidden-import win32gui",
      "--hidden-import win32process",

      // Essential hidden imports
      "--hidden-import flask",
      "--hidden-import flask_cors",
      "--hidden-import numpy",
      "--hidden-import pandas",
      "--hidden-import sklearn",
      "--hidden-import cv2",
      "--hidden-import cv2.data",
      "--hidden-import cv2.objdetect",
      "--hidden-import cv2.data.haarcascades",
      "--hidden-import opensmile",
      "--hidden-import opensmile.core",
      "--hidden-import opensmile.core.config",
      "--hidden-import audresample",
      "--hidden-import audresample.core",
      "--hidden-import audresample.core.api",
      "--hidden-import audresample.core.lib",
      "--hidden-import audinterface",
      "--hidden-import audinterface.core",
      "--hidden-import audinterface.core.utils",
      "--hidden-import pymongo",
      "--hidden-import dotenv",
      "--hidden-import sys",

      // Scikit-learn imports
      "--hidden-import sklearn",
      "--hidden-import sklearn.base",
      "--hidden-import sklearn.ensemble",
      "--hidden-import sklearn.ensemble._forest",
      "--hidden-import sklearn.ensemble._base",
      "--hidden-import sklearn.tree",
      "--hidden-import sklearn.tree._utils",
      "--hidden-import sklearn.tree._splitter",
      "--hidden-import sklearn.tree._criterion",
      "--hidden-import sklearn.utils",
      "--hidden-import sklearn.utils._cython_blas",
      "--hidden-import sklearn.utils._typedefs",
      "--hidden-import sklearn.utils._heap",
      "--hidden-import sklearn.utils._sorting",
      "--hidden-import sklearn.preprocessing",
      "--hidden-import sklearn.preprocessing._label",
      "--hidden-import sklearn.neighbors",
      "--hidden-import sklearn.svm",
      "--hidden-import sklearn.linear_model",
      "--hidden-import sklearn.metrics",
      "--hidden-import sklearn.model_selection",
      "--hidden-import sklearn._lib",
      "--hidden-import sklearn._lib.sklearn_utils",
      "--hidden-import sklearn._lib.sklearn_parallel",

      // Entry point
      "run.py",
    ];

    // Add Windows-specific libraries
    const windowsLibs = this.getWindowsLibraries();
    windowsLibs.forEach((lib) => {
      options.push(`--add-binary ${lib.source};${lib.dest}`);
    });

    // Add OpenCV data files
    const opencvDataPath = this.getWindowsOpenCVDataPath();
    if (opencvDataPath) {
      options.push(`--add-data ${opencvDataPath};cv2/data`);
      console.log("✅ Added OpenCV data files to bundle");
    } else {
      console.warn(
        "⚠️  OpenCV data files not found - face detection may not work"
      );
    }

    // Add OpenSMILE config files
    const opensmileConfigPath = this.getWindowsOpenSMILEConfigPath();
    if (opensmileConfigPath) {
      options.push(`--add-data ${opensmileConfigPath};opensmile/core/config`);
      console.log("✅ Added OpenSMILE config files to bundle");
    } else {
      console.warn(
        "⚠️  OpenSMILE config files not found - audio processing may not work"
      );
    }

    // Add static ffmpeg from tools directory
    const staticFfmpegPath = path.join(process.cwd(), "tools", "ffmpeg.exe");
    if (existsSync(staticFfmpegPath)) {
      options.push(`--add-binary ${staticFfmpegPath};.`);
      console.log("✅ Added static ffmpeg binary to bundle");
    } else {
      console.warn(
        "⚠️  Static ffmpeg not found at tools/ffmpeg.exe - audio processing will fail in packaged app"
      );
    }

    return `${baseCommand} ${options.join(" ")}`;
  };

  // getWindowsFFmpegPath = () => {
  //   try {
  //     // Try PATH first
  //     const ffmpegPath = execSync("where ffmpeg", { encoding: "utf8" }).trim();
  //     if (ffmpegPath) {
  //       console.log(`Found ffmpeg at: ${ffmpegPath}`);
  //       return ffmpegPath;
  //     }
  //   } catch (error) {
  //     // Check common Windows locations
  //     const commonPaths = [
  //       "C:\\ffmpeg\\bin\\ffmpeg.exe",
  //       "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
  //       "C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe",
  //       "C:\\ProgramData\\chocolatey\\lib\\tools\\ffmpeg\\bin\\ffmpeg.exe",
  //       path.join(process.env.USERPROFILE, "ffmpeg", "bin", "ffmpeg.exe"),
  //     ];

  //     for (const ffmpegPath of commonPaths) {
  //       if (existsSync(ffmpegPath)) {
  //         console.log(`Found ffmpeg at: ${ffmpegPath}`);
  //         return ffmpegPath;
  //       }
  //     }

  //     console.warn("⚠️  ffmpeg not found on Windows");
  //     return null;
  //   }
  // };

  getWindowsOpenCVDataPath = () => {
    try {
      const result = spawnSync(
        "python",
        [
          "-c",
          "import cv2; import os; print(os.path.dirname(cv2.data.haarcascades))",
        ],
        { stdio: "pipe", encoding: "utf8" }
      );

      if (result.status === 0) {
        const opencvDataPath = result.stdout.trim();
        console.log("✅ Found OpenCV data path:", opencvDataPath);
        return opencvDataPath;
      } else {
        console.warn("⚠️  Could not detect OpenCV data path:", result.stderr);
        return null;
      }
    } catch (error) {
      console.warn("⚠️  Error detecting OpenCV data path:", error.message);
      return null;
    }
  };

  getWindowsOpenSMILEConfigPath = () => {
    try {
      const result = spawnSync(
        "python",
        [
          "-c",
          "import opensmile; import os; print(os.path.join(os.path.dirname(opensmile.__file__), 'core', 'config'))",
        ],
        { stdio: "pipe", encoding: "utf8" }
      );

      if (result.status === 0) {
        const opensmileConfigPath = result.stdout.trim();
        console.log("✅ Found OpenSMILE config path:", opensmileConfigPath);
        return opensmileConfigPath;
      } else {
        console.warn(
          "⚠️  Could not detect OpenSMILE config path:",
          result.stderr
        );
        return null;
      }
    } catch (error) {
      console.warn("⚠️  Error detecting OpenSMILE config path:", error.message);
      return null;
    }
  };

  getWindowsLibraries = () => {
    const libraries = [];

    try {
      // Find audresample library for Windows
      const audresampleResult = spawnSync(
        "python",
        [
          "-c",
          "import audresample; import os; print(os.path.dirname(audresample.__file__))",
        ],
        { stdio: "pipe", encoding: "utf8" }
      );

      if (audresampleResult.status === 0) {
        const audresamplePath = audresampleResult.stdout.trim();

        // Try different possible directory names for Windows
        const possibleDirs = ["win64", "win_amd64", "win_x64"];
        let foundAudresample = false;

        for (const dirName of possibleDirs) {
          const libPath = path.join(
            audresamplePath,
            "core",
            "bin",
            dirName,
            "audresample.dll"
          );

          if (existsSync(libPath)) {
            libraries.push({
              source: libPath,
              dest: `audresample/core/bin/${dirName}/`,
            });
            console.log(`✅ Found audresample library in ${dirName}`);
            foundAudresample = true;
            break;
          }
        }

        if (!foundAudresample) {
          console.warn(
            "⚠️  audresample.dll not found in any expected directory"
          );
        }
      }

      // Find opensmile library for Windows
      const opensmileResult = spawnSync(
        "python",
        [
          "-c",
          "import opensmile; import os; print(os.path.dirname(opensmile.__file__))",
        ],
        { stdio: "pipe", encoding: "utf8" }
      );

      if (opensmileResult.status === 0) {
        const opensmilePath = opensmileResult.stdout.trim();

        // Try different possible directory names for Windows
        const possibleDirs = ["win64", "win_amd64", "win_x64"];
        let foundOpensmile = false;

        for (const dirName of possibleDirs) {
          const libPath = path.join(
            opensmilePath,
            "core",
            "bin",
            dirName,
            "SMILEapi.dll"
          );

          if (existsSync(libPath)) {
            libraries.push({
              source: libPath,
              dest: `opensmile/core/bin/${dirName}/`,
            });
            console.log(`✅ Found opensmile library in ${dirName}`);
            foundOpensmile = true;
            break;
          }
        }

        if (!foundOpensmile) {
          console.warn("⚠️  SMILEapi.dll not found in any expected directory");
        }
      }
    } catch (error) {
      console.warn(
        "⚠️  Warning: Could not detect audio libraries:",
        error.message
      );
    }

    return libraries;
  };

  testExecutable = () => {
    console.log("🧪 Testing the Windows executable...");

    const executablePath = path.resolve(
      process.cwd(),
      "dist",
      "wellstation-backend.exe"
    );

    if (!existsSync(executablePath)) {
      console.error("❌ Windows executable not found at:", executablePath);
      return false;
    }

    console.log("✅ Windows executable found at:", executablePath);
    return true;
  };

  cleanupRunningProcesses = () => {
    console.log("🧹 Cleaning up any running Flask processes...");

    try {
      // Kill any Python processes that might be running Flask
      const killCommand =
        process.platform === "win32"
          ? "taskkill /f /im python.exe /t 2>nul || echo No Python processes found"
          : "pkill -f 'python.*run.py' || echo No Flask processes found";

      const result = spawnSync(killCommand, { shell: true, stdio: "pipe" });

      if (result.status === 0) {
        console.log("✅ Process cleanup completed");
      } else {
        console.log("ℹ️  No running processes found or cleanup not needed");
      }
    } catch (error) {
      console.log("ℹ️  Process cleanup skipped:", error.message);
    }
  };
}

module.exports = { WindowsBuilder };
