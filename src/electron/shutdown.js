// src/electron/shutdown.js
const { app } = require("electron");
const {
  terminateFlaskProcess,
  cleanupAllProcesses,
  cleanupWindowsTempFolders,
} = require("./utils");

let isShuttingDown = false;

const shutdown = () => {
  // Prevent multiple shutdown calls
  if (isShuttingDown) {
    console.log("Shutdown already in progress, skipping...");
    return;
  }

  isShuttingDown = true;
  console.log("Shutting down application...");

  terminateFlaskProcess();

  if (process.platform === "win32") {
    setTimeout(() => {
      cleanupWindowsTempFolders();
    }, 2000);
  }

  cleanupAllProcesses();

  setTimeout(() => {
    console.log("Force exiting application...");
    process.exit(0);
  }, 1000);
};

module.exports = { shutdown };
