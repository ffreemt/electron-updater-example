const logger = require('tracer').colorConsole({
  format: '{{timestamp}} <{{title}}>{{file}}:{{line}}: {{message}}',
  dateformat: 'HH:MM:ss.L',
  level: process.env.TRACER_DEBUG || 'info'
})

// https://medium.com/@johndyer24/creating-and-deploying-an-auto-updating-electron-app-for-mac-and-windows-using-electron-builder-6a3982c0cee6
const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')

// hack isPackaged to true https://stackoverflow.com/questions/54147124/how-to-fix-skip-checkforupdatesandnotify-because-application-is-not-packed-in
Object.defineProperty(app, 'isPackaged', {
  get () {
    return true
  }
})

console.log('app.isPackaged: ', app.isPackaged)
logger.debug('app.isPackaged: ', app.isPackaged)

// -- chatgpt
/*
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'ffreemt',
  repo: 'electron-updater-example',
  releaseType: 'release',
  tagName: 'v' + app.getVersion(),
  accessToken: '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',
})
// */
// console.log(app)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  mainWindow.loadFile('index.html')
  mainWindow.on('closed', function () {
    mainWindow = null
  })

  // ---
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify()
  })
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() })
})

// ---
autoUpdater.on('update-available', () => {
  logger.debug('update-available')
  mainWindow.webContents.send('update_available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded')
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})
