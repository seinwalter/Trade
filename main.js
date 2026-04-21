const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize persistent storage - data stored in user's Application Support folder
// On macOS: ~/Library/Application Support/trading-psychology-app/
const store = new Store({
  name: 'trading-data',
  defaults: {}
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.icns')
  });

  mainWindow.loadFile('trading-psychology-app.html');

  // Open external links in default browser instead of new Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Optional: Open DevTools during development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Export Data Backup',
          accelerator: 'Cmd+E',
          click: () => {
            mainWindow.webContents.send('menu-export-data');
          }
        },
        {
          label: 'Import Data Backup',
          accelerator: 'Cmd+I',
          click: () => {
            mainWindow.webContents.send('menu-import-data');
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open Data Folder',
          click: () => {
            shell.openPath(app.getPath('userData'));
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/seinwalter/Trade/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for persistent storage
// These replace localStorage with native file-based storage
ipcMain.handle('storage:get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('storage:set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('storage:remove', (event, key) => {
  store.delete(key);
  return true;
});

ipcMain.handle('storage:clear', () => {
  store.clear();
  return true;
});

ipcMain.handle('storage:getAll', () => {
  return store.store;
});

ipcMain.handle('storage:getPath', () => {
  return store.path;
});

// File dialog handlers for export/import
ipcMain.handle('dialog:saveFile', async (event, defaultName, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, content);
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf8');
    return { success: true, content, path: result.filePaths[0] };
  }
  return { success: false };
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
