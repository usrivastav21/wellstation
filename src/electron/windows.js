// src/electron/windows.js
const { BrowserWindow, app, session } = require("electron");
const path = require("path");
const isDevMode = require("electron-is-dev");
const { shutdown } = require("./shutdown");

const waitForFlaskServer = (port, maxAttempts = 30) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkServer = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/api/health`);
        if (response.ok) {
          resolve(true);
        } else {
          throw new Error("Server not ready");
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error("Server failed to start"));
        } else {
          setTimeout(checkServer, 3000);
        }
      }
    };

    checkServer();
  });
};

const createMainWindow = (port) => {
  let mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: path.join(__dirname, "../../preload.js"),
      // Allow proper referrer handling for YouTube embeds
      // This helps prevent Error 153 when embedding YouTube videos
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // CRITICAL: Set proper User-Agent that YouTube accepts
  // This helps prevent Error 153 by making YouTube think it's a standard browser
  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // CRITICAL: Modify headers for YouTube requests to fix Error 153
  // This adds proper Referer and Origin headers that YouTube requires
  const filter = {
    urls: ['*://www.youtube.com/*', '*://www.youtube-nocookie.com/*', '*://*.youtube.com/*', '*://*.youtube-nocookie.com/*']
  };

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    // Set a valid Referer and Origin for YouTube requests
    // Using a valid domain that YouTube will accept
    details.requestHeaders['Referer'] = 'https://wellstation.app/';
    details.requestHeaders['Origin'] = 'https://wellstation.app';
    
    // Ensure other required headers are present
    if (!details.requestHeaders['User-Agent']) {
      details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }
    
    callback({ requestHeaders: details.requestHeaders });
  });

  mainWindow.prepareForShow = () => {
    mainWindow.maximize();
    mainWindow.center();
  };

  mainWindow.loadContent = () => {
    if (isDevMode) {
      console.log("Development mode: Loading from dev server");
      mainWindow.loadURL("http://localhost:3000");
      mainWindow.webContents.openDevTools({ mode: "right" });
    } else {
      console.log("Production mode: Loading from bundled frontend");
      const frontendPath = path.join(
        app.getAppPath(),
        "frontend",
        "dist",
        "index.html"
      );

      mainWindow.loadFile(frontendPath).catch((error) => {
        console.error("Failed to load frontend file:", error, frontendPath);
      });
    }
  };

  mainWindow.on("close", () => {
    shutdown();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
};

const createLoadingWindow = () => {
  let loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    show: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  const loadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Loading WellStation...</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: Lexend, sans-serif;
        }
        .loader {
          text-align: center;
          color: black;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255,255,255,0.3);
          border-top: 5px solid black;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        h2 {
          color: black;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <h2>Loading WellStation...</h2>
      </div>
    </body>
    </html>
  `;

  loadingWindow.center();

  loadingWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`
  );

  loadingWindow.on("closed", () => {
    loadingWindow = null;
  });

  return loadingWindow;
};

const createWindows = async (port) => {
  const main = createMainWindow(port);
  const loading = createLoadingWindow();

  return {
    mainWindow: main,
    loadingWindow: loading,
    waitForFlaskServer: () => waitForFlaskServer(port),
  };
};

module.exports = { createWindows, createMainWindow, createLoadingWindow };