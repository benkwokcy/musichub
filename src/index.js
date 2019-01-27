import { app, BrowserWindow } from 'electron';
import { readFile } from 'fs';
var fs = require('fs');
var git = require('simple-git');
var path = require('path');

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

  let configPath = path.normalize(app.getPath("appData") + "/musichub/configuration.json"); // hardcoded
  mainWindow.webContents.send('store-data', configPath);

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

 /** 
  * The first time the app is run, prompt user to configure score path.
  * This configuration will be stored in the environment's user data folder.
  * ex for Mac: /Users/<userName>/Library/Application Support/musichub
  * 
  * Then initialize git repo at the score path.
  * 
 */
function initialSetup() {
  // create configuration folder if none exists
  let configFolderPath = path.normalize(app.getPath("appData") + "/musichub");
  createFolder(configFolderPath);
  
  // create configuration file if none exists
  let configPath = path.normalize(app.getPath("appData") + "/musichub/configuration.json"); // hardcoded
  let userSettings;
	if (isConfigExists(configPath)) { 
    userSettings = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	} else {
    userSettings = promptUserSettings();
    let fileContents = JSON.stringify(userSettings, null, 4);
    console.log("Attempting to create configuration file.");
    createFile(configPath, fileContents);
  }

  // create score folder and initialize git repo if none exists
  console.log(userSettings);
  let scorePath = userSettings.scorePath;
  console.log(`Attempting to create score folder ${scorePath}`);
  createFolder(scorePath);
  initializeRepoIfNecessary(scorePath);
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

function promptUserSettings() {
  let userSettings = {};
	userSettings.scorePath = path.normalize(app.getPath("documents") + "/musichub"); // Default
  // TODO: Open modal

	return userSettings;
}

function initializeRepoIfNecessary(folderPath) {
  git(folderPath).checkIsRepo(function(error, result) {
    if (!result) {
      git(folderPath).init(false, function(error, result) {
        if (!error) {
          console.log("Git repository initialized");
        } else {
          console.log("Git repo could not be initialized");
        }
      })
    }
  }); 
}

function createFolder(folderPath) {
  let isFolderCreated;

	try {
    if (fs.existsSync(folderPath)){
      console.log(`Folder already exists at ${folderPath}`);
      isFolderCreated = false;
    } else {
      fs.mkdirSync(folderPath);
      console.log(`Folder was created at ${folderPath}`);
      isFolderCreated = true;
    }
	} catch(err) {
    console.error(`Cannot create new directory at ${folderPath}`);
    throw err;
  }  

  return isFolderCreated;
}

function createFile(filePath, fileContents) {
	try {
    fs.writeFileSync(filePath, fileContents);
    console.log(`File was created at ${filePath}`);
	} catch(err) {
    console.error("Cannot write new file.");
    throw err;
  }
}