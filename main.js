const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { createWindows } = require("./src/electron/windows");
const { setupIpcHandlers } = require("./src/electron/ipcHandlers");
const {
  getAvailablePort,
  runFlaskServer,
  setShutdownFlag,
} = require("./src/electron/utils");
const { shutdown } = require("./src/electron/shutdown");
const isDevMode = require("electron-is-dev");

let port;
let mainWindow, loadingWindow;
let isShuttingDown = false;

global.isApplicationShuttingDown = false;

process.on("SIGINT", () => {
  if (isShuttingDown || global.isApplicationShuttingDown) {
    console.log("Shutdown already in progress, forcing exit...");
    process.exit(0);
  }

  console.log("Received SIGINT (Ctrl+C), shutting down gracefully...");
  isShuttingDown = true;
  global.isApplicationShuttingDown = true;
  setShutdownFlag(true);
  shutdown();
});

process.on("SIGTERM", () => {
  if (isShuttingDown || global.isApplicationShuttingDown) {
    console.log("Shutdown already in progress, forcing exit...");
    process.exit(0);
  }

  console.log("Received SIGTERM, shutting down gracefully...");
  isShuttingDown = true;
  global.isApplicationShuttingDown = true;
  setShutdownFlag(true);
  shutdown();
});

app.whenReady().then(async () => {
  try {
    port = await getAvailablePort();

    if (isDevMode) {
      const { installExtensions } = require("./src/electron/utils");
      await installExtensions();
    }

    const windows = await createWindows(port);
    mainWindow = windows.mainWindow;
    loadingWindow = windows.loadingWindow;

    await setupIpcHandlers(mainWindow, loadingWindow, port);

    loadingWindow.show();

    if (!isShuttingDown && !global.isApplicationShuttingDown) {
      runFlaskServer(port);

      try {
        await windows.waitForFlaskServer();

        loadingWindow.hide();

        // Add a small delay for smoother transition
        await new Promise((resolve) => setTimeout(resolve, 350));

        mainWindow.prepareForShow();
        mainWindow.loadContent();
        mainWindow.show();
      } catch (error) {
        console.error("Flask server failed to start:", error);
        app.quit();
      }
    } else {
      console.log("Skipping Flask server start - application is shutting down");
    }

    // Handle app activation (macOS)
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindows(port);
      }
    });
  } catch (error) {
    console.error("Error during app initialization:", error);
    app.quit();
  }
});

// Ensure single instance
const initialInstance = app.requestSingleInstanceLock();
if (!initialInstance) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (!isShuttingDown && !global.isApplicationShuttingDown) {
    isShuttingDown = true;
    global.isApplicationShuttingDown = true;
    setShutdownFlag(true);
    shutdown();
  }
});
