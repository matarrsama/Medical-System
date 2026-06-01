import { app, BrowserWindow, session, Menu, nativeTheme, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'node:url'

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

let mainWindow
let appTitle = ''

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

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
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
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
