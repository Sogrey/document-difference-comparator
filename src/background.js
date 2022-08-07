'use strict'

import console from 'console';
import { app, BrowserWindow, protocol, ipcMain, dialog, Menu } from 'electron'

import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const winURL = isDevelopment ? ' http://localhost:9001/' : `file://${__dirname}/index.html`

import { readFile, writeFile } from './utils/readFile.js';
const Store = require('electron-store');
const store = new Store();

// 在程序中获取electron-store文件路径
const databaseStoreJsonPath = app.getPath('userData');
console.log('持久化数据存储于', databaseStoreJsonPath);

if (!store.has('version')) {
    store.set('version', '1.0');
}
if (!store.has('author')) {
    store.set('author', 'Sogrey');
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

let mainWindow;

async function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1060,
        height: 640,
        // frame: false, // 去除边框
        webPreferences: {

            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
        }
    })

    Menu.setApplicationMenu(null) // null值取消顶部菜单栏

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        // if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        mainWindow.loadURL('app://./index.html')
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    //   if (isDevelopment && !process.env.IS_TEST) {
    //     // Install Vue Devtools
    //     try {
    //       await installExtension(VUEJS3_DEVTOOLS)
    //     } catch (e) {
    //       console.error('Vue Devtools failed to install:', e.toString())
    //     }
    //   }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

ipcMain.on('openNewWindow', function (event, options) {

    const url = options.url;
    const isRelativePath = options.isRelativePath;

    if (isRelativePath) {
        // console.log(url)

        let newWin = new BrowserWindow({
            width: 1050,
            height: 600,
            // frame: false, // 去除边框
            webPreferences: {
                webSecurity: false,
                // Use pluginOptions.nodeIntegration, leave this alone
                // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
                nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
                contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
            }
        })

        newWin.on('ready-to-show', function () {
            newWin.show() // 初始化后再显示

            setTimeout(() => {
                newWin.webContents.send('data', 'Hekko'); // 发送消息
            }, 100)

        })
        newWin.on('closed', () => { newWin = null })

        // Load the index.html when not in development
        // newWin.loadURL(`file://${__dirname}/index.html#/HelloWorld`)
        newWin.loadURL(winURL + '#' + url)

        // createProtocol('app')
        // Load the index.html when not in development
        // newWin.loadURL('app://./index.html#'+ url)

    }

});

ipcMain.on('system-channel', function (event, options) {

    if (options.isQuit) {// 退出应用
        app.quit();
        return;
    }

    if (options.isCloseThisWindow) {// 关闭当前窗口，窗口Id？
        mainWindow && mainWindow.close();
        return;
    }

    if (options.isMinimizeWindows) {
        mainWindow.minimize();   //最小化函数
        return;
    }

});

// 选择文件
ipcMain.on('asynchronous-select-file', function (event, options) {

    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            // { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            // { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
            // { name: 'Custom File Type', extensions: ['as'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    }).then(result => {
        if (result.canceled) {
            console.log('Dialog was canceled')

            event.sender.send('error-message', 'Select file dialog was canceled');
        } else {
            const file = result.filePaths[0];
            options.filePath = file;
            event.sender.send('asynchronous-select-file-result', options);
        }
    }).catch(err => {
        console.error(err)
        event.sender.send('error-message', err);
    })

});
// 选择文件夹
ipcMain.on('asynchronous-select-directory', function (event, options) {

    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    }).then(result => {
        if (result.canceled) {
            console.log('Dialog was canceled')

            event.sender.send('error-message', 'Select directory dialog was canceled');
        } else {
            const file = result.filePaths[0];
            options.filePath = file;
            event.sender.send('asynchronous-select-file-result', options);
        }
    }).catch(err => {
        console.error(err)
        event.sender.send('error-message', err);
    })

});
// 读文件
ipcMain.on('asynchronous-read-file', function (event, options) {

    readFile(options).then((data) => {
        event.sender.send('asynchronous-read-file-result', data);
    }).catch((error) => {
        event.sender.send('error-message', error);
    })
});
// 写文件
ipcMain.on('asynchronous-save-file', function (event, arg) {

    let filePath = arg.filePath
    let data = arg.data

    writeFile(filePath, data).then((msg) => {
        event.sender.send('asynchronous-save-file-result', msg);
    }).catch((error) => {
        event.sender.send('error-message', error);
    })

});