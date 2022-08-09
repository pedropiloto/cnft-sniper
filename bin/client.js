require('dotenv').config()
const { app, BrowserWindow, ipcMain } = require('electron')
const BotInteractor = require('../app/interactors/bot')
const ActivityLoggerInteractor = require('../app/interactors/activity-logger')
const ConfigStore = require('../app/utils/config-store')
const Logger = require('../app/utils/logger')
const path = require('path')
const Settings = require('../app/config/settings')

// if (process.env.NODE_ENV === 'development') {
//     try {
//         require('electron-reloader')(module)
//     } catch {
//         Logger.log('Error in electron-reload', false)
//     }
// }

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../client/js/preload.js'),
        },
        icon: __dirname + '/favicon.ico',
    })

    // and load the index.html of the app.
    mainWindow.loadFile('app/../client/index.html')

    // if (process.env.NODE_ENV === 'development') {
    //     // Open the DevTools.
    //     mainWindow.webContents.openDevTools()
    // }
}

app.whenReady().then(() => {
    ipcMain.on('start-stop-bot', async (event, config) => {
        try {
            const configJson = JSON.parse(config)
            ConfigStore.setConfig(configJson)
            Settings.loadConfigByConfigsJson(configJson)
            BotInteractor.startStopBot()
        } catch (e) {
            Logger.log('Invalid JSON config')
        }
    })
    ipcMain.handle('get-activity', async () => {
        return await ActivityLoggerInteractor.getAll()
    })

    ipcMain.handle('get-config', () => {
        return ConfigStore.getConfig()
    })

    ipcMain.on('console-log', async (log) => {
        /* eslint-disable no-console */
        console.log(`remote log - ${log}`)
        /* eslint-enable no-console */
    })
    createWindow()

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
