import { app, BrowserWindow } from 'electron';
var fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools(); // Turn off when building for production

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

initialSetup()

/********************************
 *         INITIAL SETUP        *
 ********************************/

// The first time the app is run, prompt user to configure score path.
// This configuration will be stored in the environment's user data folder.
// ex for Mac: /Users/<userName>/Library/Application Support/Electron
function initialSetup() {
	let configPath = app.getPath("appData") + "/musichub/configuration.json"; // hardcoded
  // let configPath = app.getPath("userData") + "/configuration.json"; // non-hardcoded but defaults to Electron folder
  console.log(configPath);
	if (isConfigExists(configPath)) { 
		return; 
	}

	let userSettings = getUserSettings();
	userSettings = JSON.stringify(userSettings, null, 4);
	createConfigurationFile(configPath, userSettings);
}

function isConfigExists(configPath) {  
  try {
    fs.accessSync(configPath, fs.constants.R_OK | fs.constants.W_OK);
    console.log(`Configuration already exists at ${configPath}`);
    isConfigExists = true;
  } catch (err) {
    console.log(`Configuration file does not exist or could be not accessed at ${configPath}`);
    isConfigExists = false;
  }
  
	return isConfigExists;
}

function getUserSettings() {
  let userSettings = {};
	userSettings.scorePath = app.getPath("documents") + "/musichub" // Default
	// TODO: Open modal

	return userSettings;
}

function createConfigurationFile(filePath, fileContents) {
	try {
    fs.writeFileSync(filePath, fileContents);
    console.log(`Configuration was created at ${filePath}`);
	} catch(err) {
		console.log("Cannot write new configuration file.", err);
	}
}