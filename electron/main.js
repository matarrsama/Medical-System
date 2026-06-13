import { app, BrowserWindow, session, Menu, nativeTheme, ipcMain, globalShortcut } from 'electron'
import path from 'path'
import fs from 'fs'
import http from 'http'
import { fileURLToPath } from 'node:url'
import pkg from 'electron-updater'
const { autoUpdater } = pkg

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CACHE_DIR = path.join(app.getPath('userData'), 'cache')
const QUEUE_FILE = path.join(app.getPath('userData'), 'pending-writes.json')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return []
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8')) } catch { return [] }
}

function writeQueue(queue) {
  ensureDir(path.dirname(QUEUE_FILE))
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2))
}

// ── Disk cache IPC ──────────────────────────────────
ipcMain.handle('cache:save', (_event, collection, data) => {
  ensureDir(CACHE_DIR)
  fs.writeFileSync(path.join(CACHE_DIR, `${collection}.json`), JSON.stringify({ data, cachedAt: Date.now() }))
  return true
})

ipcMain.handle('cache:load', (_event, collection) => {
  const file = path.join(CACHE_DIR, `${collection}.json`)
  if (!fs.existsSync(file)) return null
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return null }
})

ipcMain.handle('cache:list', () => {
  ensureDir(CACHE_DIR)
  return fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))
})

// ── Write queue IPC ─────────────────────────────────
ipcMain.handle('queue:add', (_event, operation) => {
  const queue = readQueue()
  queue.push({ ...operation, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, queuedAt: Date.now() })
  writeQueue(queue)
  return queue.length
})

ipcMain.handle('queue:list', () => readQueue())

ipcMain.handle('queue:remove', (_event, id) => {
  const queue = readQueue().filter(op => op.id !== id)
  writeQueue(queue)
  return queue.length
})

ipcMain.handle('queue:flush', () => { writeQueue([]); return 0 })

ipcMain.handle('queue:count', () => readQueue().length)

// ── App version IPC ───────────────────────────────────
ipcMain.handle('get-app-version', () => app.getVersion())

// ── Auto-updater IPC handlers ─────────────────────────
ipcMain.handle('check-for-updates', async () => {
  if (!app.isPackaged) {
    return { success: false, error: 'Not in packaged app' }
  }
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, updateInfo: result?.updateInfo || null }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('install-update', async () => {
  if (!app.isPackaged) {
    return { success: false, error: 'Not in packaged app' }
  }
  if (!updateStatus.downloaded) {
    return { success: false, error: 'No update downloaded' }
  }
  autoUpdater.quitAndInstall()
  return { success: true }
})

ipcMain.handle('get-update-status', async () => {
  return updateStatus
})

ipcMain.handle('toggle-devtools', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.toggleDevTools()
  }
})

// ── Auto-updater setup ────────────────────────────────
function setupAutoUpdater() {
  autoUpdater.logger = console
  autoUpdater.autoDownload = false // Manual download
  autoUpdater.autoInstallOnAppQuit = true // Install on restart

  // Check for updates on startup
  console.log('[AutoUpdater] Checking for updates...')
  updateStatus.checking = true
  sendUpdateStatus()
  
  autoUpdater.checkForUpdates().catch(err => {
    console.error('[AutoUpdater] Failed to check for updates:', err)
    updateStatus.checking = false
    updateStatus.error = err.message
    sendUpdateStatus()
  })

  // Update available
  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available event fired. Version:', info.version)
    
    // Check if we are already downloading or have downloaded this version
    if (isDownloadingInSession) {
      console.log('[AutoUpdater] Skip download trigger: already active in this session')
      return
    }

    if (updateStatus.downloaded && updateStatus.version === info.version) {
      console.log('[AutoUpdater] Skip download trigger: already downloaded in this session')
      return
    }

    // Immediately lock to prevent race conditions from multiple events
    isDownloadingInSession = true

    console.log('[AutoUpdater] Starting fresh download for version:', info.version)
    
    const alreadyNotified = lastNotifiedVersion === info.version
    
    updateStatus = {
      checking: false,
      available: true,
      downloaded: false,
      error: null,
      version: info.version,
      percent: 0,
    }
    
    // Only send status update if we haven't already notified about this version
    if (!alreadyNotified) {
      lastNotifiedVersion = info.version
      sendUpdateStatus()
    }
    
    // Start download
    autoUpdater.downloadUpdate().then(() => {
      console.log('[AutoUpdater] downloadUpdate call resolved')
    }).catch((err) => {
      console.error('[AutoUpdater] downloadUpdate call failed:', err)
      isDownloadingInSession = false
      updateStatus.error = err.message
      sendUpdateStatus()
    })
  })

  // Update not available
  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Update not available:', info?.version)
    updateStatus = {
      checking: false,
      available: false,
      downloaded: false,
      error: null,
      version: null,
      percent: 0,
    }
    sendUpdateStatus()
  })

  // Download progress
  let lastProgressUpdate = 0
  autoUpdater.on('download-progress', (progress) => {
    const now = Date.now()
    updateStatus.percent = Math.round(progress.percent)
    
    // Update in-memory state for UI
    sendUpdateStatus()
    
    // Throttle logging to once every 2 seconds to avoid performance issues
    if (now - lastProgressUpdate > 2000) {
      console.log(`[AutoUpdater] Progress: ${updateStatus.percent}% (${progress.transferred}/${progress.total})`)
      lastProgressUpdate = now
    }
  })

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded successfully:', info.version)
    updateStatus = {
      checking: false,
      available: true,
      downloaded: true,
      error: null,
      version: info.version,
      percent: 100,
    }
    
    isDownloadingInSession = false
    
    sendUpdateStatus()
  })

  // Error
  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Global error event:', err)
    
    // Don't reset everything if it was already downloaded (sometimes verification errors happen but file is fine)
    if (!updateStatus.downloaded) {
      updateStatus = {
        ...updateStatus,
        checking: false,
        error: err.message,
      }
      isDownloadingInSession = false
      sendUpdateStatus()
    }
  })

  // Periodic check every 30 minutes
  setInterval(() => {
    // Skip check if update already available or downloaded
    if (!updateStatus.available && !updateStatus.downloaded && !isDownloadingInSession) {
      console.log('[AutoUpdater] Periodic update check...')
      autoUpdater.checkForUpdates().catch(() => {})
    }
  }, 30 * 60 * 1000)
}

let mainWindow
let appTitle = ''

// ── Auto-updater state ───────────────────────────────
let updateStatus = {
  checking: false,
  available: false,
  downloaded: false,
  error: null,
  version: null,
  percent: 0,
}
let lastNotifiedVersion = null
let isDownloadingInSession = false

function sendUpdateStatus() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', { ...updateStatus })
  }
}

ipcMain.on('set-app-title', (_event, title) => {
  appTitle = title
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 375,
    minHeight: 600,
    show: false,
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({
    action: 'allow',
    overrideBrowserWindowOptions: {
      title: appTitle || 'Medical Records System',
      backgroundColor: '#ffffff',
    },
  }))

  mainWindow.webContents.on('did-create-window', (win) => {
    win.webContents.on('page-title-updated', (event) => {
      event.preventDefault()
      win.setTitle(appTitle || 'Medical Records System')
    })
  })

  mainWindow.maximize()

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.webContents.openDevTools()
    }
  })

  // DevTools shortcut for packaged builds (remove for final product)
  if (app.isPackaged) {
    globalShortcut.register('F12', () => {
      mainWindow?.webContents.toggleDevTools()
    })
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      mainWindow?.webContents.toggleDevTools()
    })
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Serve from a local HTTP server so Firebase Auth OAuth popup works
    // (file:// protocol is not supported by Firebase Auth)
    const distDir = path.join(__dirname, '../dist')
    const MIME = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.map': 'application/json',
      '.woff': 'font/woff', '.woff2': 'font/woff2',
    }
    const server = http.createServer((req, res) => {
      const filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0]
      const fullPath = path.join(distDir, filePath)
      try {
        if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
          // SPA fallback — serve index.html for hash-based routing
          const content = fs.readFileSync(path.join(distDir, 'index.html'))
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          return res.end(content)
        }
        const ext = path.extname(fullPath).toLowerCase()
        const content = fs.readFileSync(fullPath)
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        res.end(content)
      } catch {
        try {
          const content = fs.readFileSync(path.join(distDir, 'index.html'))
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(content)
        } catch { res.writeHead(500); res.end('Error') }
      }
    })
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      mainWindow.loadURL(`http://127.0.0.1:${port}`)
    })
  }
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'light'
  Menu.setApplicationMenu(null)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders }
    for (const key of Object.keys(headers)) {
      const lower = key.toLowerCase()
      if (lower === 'cross-origin-opener-policy' || lower === 'cross-origin-embedder-policy') {
        delete headers[key]
      }
    }
    callback({
      responseHeaders: {
        ...headers,
        'Cross-Origin-Opener-Policy': ['unsafe-none'],
        'Content-Security-Policy': [
          app.isPackaged
            ? "default-src 'self'; script-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com https://www.googletagmanager.com https://www.google.com https://apis.google.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://*.gstatic.com 'unsafe-inline'; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://lh3.googleusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://www.googleapis.com https://clients3.google.com https://bansanggh.netlify.app wss://*.firebaseio.com; frame-src 'self' https://*.firebaseio.com https://*.google.com https://medical-system-26144.firebaseapp.com; manifest-src 'self'"
            : "default-src 'self'; script-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com https://www.googletagmanager.com https://www.google.com https://apis.google.com 'unsafe-inline' 'unsafe-eval'; style-src 'self' https://fonts.googleapis.com https://*.gstatic.com 'unsafe-inline'; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://lh3.googleusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://www.googleapis.com https://clients3.google.com https://bansanggh.netlify.app wss://*.firebaseio.com; frame-src 'self' https://*.firebaseio.com https://*.google.com https://medical-system-26144.firebaseapp.com; manifest-src 'self'",
        ],
      },
    })
  })
  createWindow()
  if (app.isPackaged) {
    setupAutoUpdater()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
