const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process
// This replaces localStorage with native file-based storage
contextBridge.exposeInMainWorld('electronAPI', {
  // Persistent storage (replaces localStorage)
  storage: {
    get: (key) => ipcRenderer.invoke('storage:get', key),
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value),
    remove: (key) => ipcRenderer.invoke('storage:remove', key),
    clear: () => ipcRenderer.invoke('storage:clear'),
    getAll: () => ipcRenderer.invoke('storage:getAll'),
    getPath: () => ipcRenderer.invoke('storage:getPath')
  },

  // File dialogs (replaces browser download/upload)
  dialog: {
    saveFile: (defaultName, content) => ipcRenderer.invoke('dialog:saveFile', defaultName, content),
    openFile: () => ipcRenderer.invoke('dialog:openFile')
  },

  // Menu events from main process
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-export-data', () => callback('export'));
    ipcRenderer.on('menu-import-data', () => callback('import'));
  },

  // Flag to indicate we're running in Electron
  isElectron: true,
  platform: 'darwin'
});
