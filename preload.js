const { contextBridge, ipcRenderer } = require("electron");

// Expose basic window management functions to the renderer process
contextBridge.exposeInMainWorld("electron", {
  // Window management
  maximize: () => ipcRenderer.send("app-maximize"),
  minimize: () => ipcRenderer.send("app-minimize"),
  unmaximize: () => ipcRenderer.send("app-unmaximize"),
  quit: () => ipcRenderer.send("app-quit"),

  // Get backend port for API calls
  getPort: () => ipcRenderer.sendSync("get-port-number"),

  // Event listeners
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Add version info for debugging
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
