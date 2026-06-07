import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  setAppTitle: (title) => ipcRenderer.send('set-app-title', title),
  cache: {
    save: (collection, data) => ipcRenderer.invoke('cache:save', collection, data),
    load: (collection) => ipcRenderer.invoke('cache:load', collection),
    list: () => ipcRenderer.invoke('cache:list'),
  },
  queue: {
    add: (op) => ipcRenderer.invoke('queue:add', op),
    list: () => ipcRenderer.invoke('queue:list'),
    remove: (id) => ipcRenderer.invoke('queue:remove', id),
    flush: () => ipcRenderer.invoke('queue:flush'),
    count: () => ipcRenderer.invoke('queue:count'),
  },
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  onUpdateStatus: (callback) => {
    const handler = (_event, status) => callback(status)
    ipcRenderer.on('update-status', handler)
    return () => ipcRenderer.removeListener('update-status', handler)
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
})
