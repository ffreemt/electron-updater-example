let { app, autoUpdater, dialog } = require('electron')

console.log(app.isPackaged)
console.log(typeof app)

autoUpdater.setFeedURL('https://github.com/ffreemt/electron-updater-example/releases')

// autoUpdater.checkForUpdates()
