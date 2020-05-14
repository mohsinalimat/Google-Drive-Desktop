const { screen, BrowserView, BrowserWindow, Menu } = require("electron");
const windowState = require("electron-window-state");
const electronLocalshortcut = require("electron-localshortcut");
const path = require("path");

const { userAgent } = require("../config");
const { TITLE_BAR_HEIGHT } = require("../util");

var createChildWindow = function (event, url, frameName, disposition, options) {
  event.preventDefault();

  if (url === "about:blank") {
    return;
  }

  // Get information about the screen size.
  const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  // Load the previous state with fall-back to defaults
  const childWindowState = windowState({
    defaultWidth: workAreaSize.width - 200,
    defaultHeight: workAreaSize.height - 100,
  });

  // Create the browser window.
  // Load options defined from parent window, or set defaults
  childwin = new BrowserWindow({
    x: options.pos ? options.pos[0] + 20 : childWindowState.x,
    y: options.pos ? options.pos[1] + 20 : childWindowState.x,
    width: options.size ? options.size[0] : childWindowState.width,
    height: options.size ? options.size[1] : childWindowState.height,
    minWidth: 300,
    minHeight: 300,
    backgroundColor: "#FFF",
    titleBarStyle: "hidden",
    center: true,
    scrollBounce: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  /**
   * Let us register listeners on the window, so we can update the state
   * automatically (the listeners will be removed when the window is closed)
   * and restore the maximized or full screen state
   */
  childWindowState.manage(childwin);

  // Load template containing title bar
  childwin.loadFile(path.join(__dirname, "../templates/index.html"));

  windowSettings = { url };

  // Create the browser window.
  let childview = new BrowserView();
  childwin.setBrowserView(childview);
  childview.setBounds({
    x: 0,
    y: TITLE_BAR_HEIGHT,
    width: options.size ? options.size[0] : childWindowState.width,
    height:
      (options.size ? options.size[1] : childWindowState.height) -
      TITLE_BAR_HEIGHT,
  });
  childview.setAutoResize({
    width: true,
    height: true,
  });
  childview.webContents.loadURL(windowSettings.url);

  if (process.env.NODE_ENV === "development") {
    childwin.webContents.openDevTools();
  }

  childview.webContents.once("ready-to-show", () => {
    childwin.show();
    childview.focus();
  });

  childwin.on("close", (e) => {
    electronLocalshortcut.unregisterAll(childwin);
    electronLocalshortcut.unregisterAll(childview);
  });

  childwin.on("closed", () => {
    childwin = null;
    childview = null;
  });

  electronLocalshortcut.register(childview, ["CmdOrCtrl+R", "F5"], () => {
    // console.log("You reloaded the child page!");
    childview.webContents.loadURL(windowSettings.url);
  });
  electronLocalshortcut.register(childwin, ["CmdOrCtrl+R", "F5"], () => {
    // console.log("You reloaded the child page!");
    childview.webContents.loadURL(windowSettings.url);
  });

  // childwin.webContents.openDevTools();
};

module.exports = { createChildWindow: createChildWindow };
