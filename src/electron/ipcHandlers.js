const { ipcMain } = require("electron");
const { shutdown } = require("./shutdown");

const setupIpcHandlers = async (mainWindow, loadingWindow, port) => {
  try {
    console.log("Setting up IPC handlers...");

    // Set up basic window management handlers
    ipcMain.on("app-maximize", () => mainWindow.maximize());
    ipcMain.on("app-minimize", () => mainWindow.minimize());
    ipcMain.on("app-quit", () => shutdown());
    ipcMain.on("app-unmaximize", () => mainWindow.unmaximize());
    ipcMain.on("get-port-number", (event) => {
      event.returnValue = port;
    });

    console.log("Basic window management handlers set up");
    console.log("Registered IPC handlers:", ipcMain.eventNames());
  } catch (error) {
    console.error("Error setting up IPC handlers:", error);
    throw error;
  }
};

module.exports = { setupIpcHandlers };
