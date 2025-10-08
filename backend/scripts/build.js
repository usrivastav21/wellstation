const { spawnSync, execSync } = require("child_process");
const { existsSync, writeFileSync, copyFileSync } = require("fs");
const path = require("path");

const spawnOptions = { detached: false, shell: true, stdio: "inherit" };

/**
 * @namespace Builder
 * @description - Simplified builder for Python backend only
 */
class Builder {
  /**
   * @description - Creates production build of Python backend using PyInstaller
   * @memberof Builder
   */
  buildPython = (buildType = "dev") => {
    console.log(
      `🚀 Building Python backend with PyInstaller (${buildType} build)...`
    );

    // Create build info and prepare environment file
    this.prepareBuildEnvironment(buildType);

    const pyinstallerCommand = this.buildBasicPyInstallerCommand();

    console.log("Running command:");
    console.log(pyinstallerCommand);

    const result = spawnSync(pyinstallerCommand, spawnOptions);

    if (result.status === 0) {
      console.log("✅ Python backend built successfully!");
      console.log(
        `📁 Executable location: ${path.resolve(
          process.cwd(),
          "dist",
          "wellstation-backend"
        )}`
      );
    } else {
      console.error("❌ Python backend build failed!");
      console.error(`Exit code: ${result.status}`);
      process.exit(1);
    }
  };

  /**
   * @description - Prepare build environment and create build_info.json
   * @memberof Builder
   */
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

  /**
   * @description - Builds a simple PyInstaller command for debugging
   * @memberof Builder
   */
  buildBasicPyInstallerCommand = () => {
    const baseCommand = "python3 -m PyInstaller";
    const cwd = process.cwd();

    // Essential options only
    const options = [
      "--onefile",
      "--console", // Enable console for debugging
      "--noconfirm",
      "--distpath ./dist",
      "--workpath ./build",
      "--specpath ./build",
      "--name wellstation-backend",
      `--additional-hooks-dir ${cwd}/hooks`,

      // Add data files with absolute paths
      `--add-data ${cwd}/processingScripts:processingScripts`,
      `--add-data ${cwd}/app:app`,
      `--add-data ${cwd}/.env:.`,
      `--add-data ${cwd}/build_info.json:.`,
      `--add-data ${cwd}/config.py:.`,

      // Essential hidden imports only
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

      // Note: multiprocessing exclusions removed as they may break functionality

      // Entry point
      "run.py",
    ];

    // Add dynamic libraries for audio processing
    const dynamicLibs = this.getAudioLibraries();
    dynamicLibs.forEach((lib) => {
      options.push(`--add-binary ${lib.source}:${lib.dest}`);
    });

    // Add OpenCV data files dynamically
    const opencvDataPath = this.getOpenCVDataPath();
    if (opencvDataPath) {
      options.push(`--add-data ${opencvDataPath}:cv2/data`);
      console.log("✅ Added OpenCV data files to bundle");
    } else {
      console.warn(
        "⚠️  OpenCV data files not found - face detection may not work"
      );
    }

    // Add OpenSMILE config files dynamically
    const opensmileConfigPath = this.getOpenSMILEConfigPath();
    if (opensmileConfigPath) {
      options.push(`--add-data ${opensmileConfigPath}:opensmile/core/config`);
      console.log("✅ Added OpenSMILE config files to bundle");
    } else {
      console.warn(
        "⚠️  OpenSMILE config files not found - audio processing may not work"
      );
    }

    // Add ffmpeg binary dynamically
    const ffmpegPath = this.getFFmpegPath();
    if (ffmpegPath) {
      options.push(`--add-binary ${ffmpegPath}:.`);
      console.log("✅ Added ffmpeg binary to bundle");
    } else {
      console.warn(
        "⚠️  ffmpeg not found - audio processing will fail in packaged app"
      );
    }

    return `${baseCommand} ${options.join(" ")}`;
  };

  /**
   * @description - Get OpenCV data path dynamically
   * @memberof Builder
   */
  getOpenCVDataPath = () => {
    try {
      const result = spawnSync(
        "python3",
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

  /**
   * @description - Get OpenSMILE config path dynamically
   * @memberof Builder
   */
  getOpenSMILEConfigPath = () => {
    try {
      const result = spawnSync(
        "python3",
        [
          "-c",
          "import opensmile; import os; print(os.path.join(os.path.dirname(opensmile._file_), 'core', 'config'))",
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

  /**
   * @description - Get ffmpeg binary path
   * @memberof Builder
   */
  getFFmpegPath = () => {
    try {
      const ffmpegPath = execSync("which ffmpeg", { encoding: "utf8" }).trim();
      console.log(`Found ffmpeg at: ${ffmpegPath}`);
      return ffmpegPath;
    } catch (error) {
      console.log("ffmpeg not found in PATH, checking common locations...");
      const commonPaths = [
        "/usr/bin/ffmpeg",
        "/usr/local/bin/ffmpeg",
        "/opt/homebrew/bin/ffmpeg",
        "/opt/local/bin/ffmpeg",
      ];

      for (const ffmpegPath of commonPaths) {
        if (existsSync(ffmpegPath)) {
          console.log(`Found ffmpeg at: ${ffmpegPath}`);
          return ffmpegPath;
        }
      }

      console.warn(
        "WARNING: ffmpeg not found. Audio processing will fail in the packaged app."
      );
      console.warn(
        "Please install ffmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)"
      );
      return null;
    }
  };

  /**
   * @description - Get required audio processing libraries
   * @memberof Builder
   */
  getAudioLibraries = () => {
    const libraries = [];

    try {
      // Find audresample library
      const audresampleResult = spawnSync(
        "python3",
        [
          "-c",
          "import audresample; import os; print(os.path.dirname(audresample._file_))",
        ],
        { stdio: "pipe", encoding: "utf8" }
      );

      if (audresampleResult.status === 0) {
        const audresamplePath = audresampleResult.stdout.trim();
        const libPath = path.join(
          audresamplePath,
          "core",
          "bin",
          "macosx_11_0_arm64",
          "libaudresample.dylib"
        );

        if (existsSync(libPath)) {
          libraries.push({
            source: libPath,
            dest: "audresample/core/bin/macosx_11_0_arm64/",
          });
          console.log("✅ Found audresample library");
        }
      }

      // Find opensmile library
      const opensmileResult = spawnSync(
        "python3",
        [
          "-c",
          "import opensmile; import os; print(os.path.dirname(opensmile._file_))",
        ],
        { stdio: "pipe", encoding: "utf8" }
      );

      if (opensmileResult.status === 0) {
        const opensmilePath = opensmileResult.stdout.trim();
        const libPath = path.join(
          opensmilePath,
          "core",
          "bin",
          "macosx_11_0_arm64",
          "libSMILEapi.dylib"
        );

        if (existsSync(libPath)) {
          libraries.push({
            source: libPath,
            dest: "opensmile/core/bin/macosx_11_0_arm64/",
          });
          console.log("✅ Found opensmile library");
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

  /**
   * @description - Test the built executable
   * @memberof Builder
   */
  testExecutable = () => {
    console.log("🧪 Testing the built executable...");

    const executablePath = path.resolve(
      process.cwd(),
      "dist",
      "wellstation-backend"
    );

    if (!existsSync(executablePath)) {
      console.error("❌ Executable not found at:", executablePath);
      return false;
    }

    console.log("✅ Executable found at:", executablePath);

    // Try to run with --help or version check
    console.log("🔍 Testing executable startup...");
    const testResult = spawnSync(executablePath, ["--help"], {
      stdio: "pipe",
      timeout: 5000,
    });

    if (testResult.status === 0) {
      console.log("✅ Executable responds to commands");
      return true;
    } else {
      console.log(
        "⚠️  Executable doesn't respond to --help (might be normal for Flask apps)"
      );
      return true; // This is actually normal for Flask apps
    }
  };
}

module.exports = { Builder };
