// src/electron/utils.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const getPort = require("get-port");
const isDevMode = require("electron-is-dev");
const { app } = require("electron");

let flaskProcess = null;
let isShuttingDown = false;

const getAvailablePort = async () => {
  return await getPort({ port: [3001, 3002, 3003, 3004, 3005] });
};

const getBackendPath = () => {
  if (app.isPackaged) {
    // Production: use bundled executable
    const platform = process.platform;
    const executableName =
      platform === "win32" ? "wellstation-backend.exe" : "wellstation-backend";
    return path.join(process.resourcesPath, "backend", executableName);
  } else {
    // Development: use manage.py
    return path.join(__dirname, "../../backend/manage.py");
  }
};

const getBackendCommand = () => {
  if (app.isPackaged) {
    return null; // Executable handles environment internally
  }
  const environment = process.env.NODE_ENV || "development";
  return environment === "production" ? "prod" : "dev";
};

const terminateFlaskProcess = () => {
  if (flaskProcess && !flaskProcess.killed) {
    try {
      const http = require("http");
      const postData = JSON.stringify({});

      const options = {
        hostname: "localhost",
        port: 3001,
        path: "/api/shutdown",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        console.log(`HTTP shutdown response: ${res.statusCode}`);
      });

      req.on("error", (error) => {
        console.log("HTTP shutdown failed, trying process kill...");
        if (process.platform === "win32") {
          flaskProcess.kill("SIGTERM");
        } else {
          flaskProcess.kill("SIGKILL");
        }
      });

      req.write(postData);
      req.end();
    } catch (error) {
      console.error("Error terminating Flask process:", error);
    }
  }
  flaskProcess = null;
};

const monitorFlaskProcess = () => {
  if (flaskProcess) {
    flaskProcess.on("exit", (code, signal) => {
      console.log(
        `Flask process exited with code ${code} and signal ${signal}`
      );

      // If the process exited normally (code 0), PyInstaller should have cleaned up
      if (code === 0) {
        console.log(
          "Flask process exited normally - PyInstaller cleanup should be complete"
        );
      } else {
        console.log(
          "Flask process exited with error - cleanup may be incomplete"
        );
      }

      flaskProcess = null;
    });

    flaskProcess.on("error", (error) => {
      console.error("Flask process error:", error);
      flaskProcess = null;
    });
  }
};

const runFlaskServer = (port) => {
  if (isShuttingDown || flaskProcess) {
    console.log(
      "Skipping Flask server start - already running or shutting down"
    );
    return;
  }

  const backendPath = getBackendPath();
  const backendCommand = getBackendCommand();

  console.log(`Starting Flask server on port ${port}`);
  console.log(`Backend path: ${backendPath}`);

  try {
    if (isDevMode) {
      flaskProcess = spawn(
        process.platform === "win32" ? "python" : "python3",
        [backendPath, backendCommand, port.toString()],
        {
          stdio: "inherit",
          cwd: path.join(__dirname, "../../backend"),
          env: {
            ...process.env,
            PORT: port.toString(),
          },
        }
      );
    } else {
      flaskProcess = spawn(backendPath, [port.toString()], {
        stdio: "pipe",
        cwd: path.dirname(backendPath),
      });
    }

    monitorFlaskProcess();

    flaskProcess.on("exit", (code, signal) => {
      console.log(`Flask server exited with code ${code} and signal ${signal}`);
      flaskProcess = null;
    });

    // Log output in production
    if (!isDevMode && flaskProcess.stdout) {
      flaskProcess.stdout.on("data", (data) => {
        console.log(`Flask: ${data.toString().trim()}`);
      });
    }

    if (!isDevMode && flaskProcess.stderr) {
      flaskProcess.stderr.on("data", (data) => {
        console.error(`Flask error: ${data.toString().trim()}`);
      });
    }
  } catch (error) {
    console.error("Error starting Flask server:", error);
    flaskProcess = null;
  }
};

const installExtensions = async () => {
  const isForceDownload = Boolean(process.env.UPGRADE_EXTENSIONS);
  const installer = require("electron-devtools-installer");

  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"].map(
    (extension) => installer.default(installer[extension], isForceDownload)
  );

  return Promise.allSettled(extensions).catch(console.error);
};

const setShutdownFlag = (flag) => {
  isShuttingDown = flag;
  console.log(`Shutdown flag set to: ${flag}`);
};

const cleanupAllProcesses = () => {
  console.log("Cleaning up all processes...");

  terminateFlaskProcess();

  try {
    if (process.platform === "win32") {
      // Windows: kill Python processes that might be our Flask server
      require("child_process").execSync(
        "taskkill /f /im wellstation-backend.exe 2>nul || exit 0",
        {
          stdio: "ignore",
        }
      );
    } else {
      // Unix: kill Python processes with our specific patterns
      require("child_process").execSync(
        'pkill -f "python.*manage.py" 2>/dev/null || exit 0',
        {
          stdio: "ignore",
        }
      );
      require("child_process").execSync(
        'pkill -f "wellstation-backend" 2>/dev/null || exit 0',
        {
          stdio: "ignore",
        }
      );
    }
  } catch (error) {
    // Ignore errors - processes might not exist
  }
};

const cleanupWindowsTempFolders = () => {
  if (process.platform === "win32") {
    try {
      const { exec } = require("child_process");

      const tempDir = process.env.TEMP || process.env.TMP;
      if (tempDir) {
        exec(
          `for /d %i in ("${tempDir}\\_MEI*") do rmdir /s /q "%i"`,
          (error, stdout, stderr) => {
            if (error) {
              console.log(
                "Some temp folders could not be cleaned:",
                error.message
              );
            } else {
              console.log("Temp folders cleaned successfully");
            }
          }
        );
      }
    } catch (error) {
      console.error("Error cleaning temp folders:", error);
    }
  }
};

module.exports = {
  cleanupWindowsTempFolders,
  getAvailablePort,
  runFlaskServer,
  setShutdownFlag,
  terminateFlaskProcess,
  cleanupAllProcesses,
  installExtensions,
  getFlaskProcess: () => flaskProcess,
};
