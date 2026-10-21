const { app, BrowserWindow, Menu, protocol, net, shell, ipcMain } = require('electron')
const path = require('path')

// Microsoft Store purchases (S25, SF-75): a C++/WinRT addon, loaded here in the main
// process only. If it is missing or fails to load (an unpackaged dev run without the
// build, any other platform), every store call answers "unavailable" and the hint shop
// says the store isn't available. The page reaches it only through preload.cjs.
let store = null
try {
  store = require('./native/windows_store.node')
} catch {
  store = null
}
let storeReady = false // init succeeded: a StoreContext with the window as its owner
const UNAVAILABLE = { ok: false, hresult: 0, status: -1 }
const STORE_ID = /^[0-9A-Z]{12}$/i // a Store ID: 12 letters and digits
const TRACKING_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Register before app is ready — required by Electron
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, stream: true } }
])

const APP_ORIGIN = 'app://localhost'

// External links (Privacy Policy, Terms, Support) open in the user's browser,
// never inside the game window (CR-64). Only http(s) and mailto are handed on.
function openExternally(url) {
  try {
    const { protocol: scheme } = new URL(url)
    if (scheme === 'https:' || scheme === 'http:' || scheme === 'mailto:') shell.openExternal(url)
  } catch {
    // Not a URL: ignore
  }
}

// One instance only (CR-64): a second launch focuses the existing window.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    // No File/Edit/View/Window menu bar (CR-64).
    Menu.setApplicationMenu(null)

    const distPath = path.join(__dirname, '../dist')

    // Serve dist/ under app://localhost/ so absolute paths like /audio/... resolve correctly
    protocol.handle('app', (request) => {
      const url = new URL(request.url)
      const filePath = path.join(distPath, url.pathname)
      return net.fetch('file:///' + filePath.replace(/\\/g, '/'))
    })

    registerStoreIpc()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    icon: path.join(__dirname, '../dist/icon.png'),
    title: 'SoundFind',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  // The Store's purchase dialogs are owned by this window (Microsoft: a desktop app
  // must set the owner window on StoreContext). Set once, right after GetDefault().
  if (store) {
    try {
      storeReady = !!store.init(win.getNativeWindowHandle()).ok
    } catch {
      storeReady = false
    }
  }

  // target="_blank" links and window.open: open in the browser, deny the window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternally(url)
    return { action: 'deny' }
  })

  // Same-window navigation away from the app (a plain link click): block it and
  // open the destination in the browser instead. In-app HashRouter changes stay
  // on app://localhost and are never blocked.
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(APP_ORIGIN + '/')) return
    event.preventDefault()
    openExternally(url)
  })

  win.loadURL(APP_ORIGIN + '/index.html')

  win.once('ready-to-show', () => {
    win.show()
  })
}

// Only the app's own page may call the store, and only with well-formed arguments.
function fromApp(event) {
  const url = event?.senderFrame?.url || ''
  return url.startsWith(APP_ORIGIN + '/')
}

// The three store calls the hint shop needs (S25, SF-75), and nothing else. Each
// resolves to the addon's own { ok, hresult, status } answer, or UNAVAILABLE.
function registerStoreIpc() {
  ipcMain.handle('soundfind-store:getProducts', async (event) => {
    if (!fromApp(event) || !store || !storeReady) return { ...UNAVAILABLE, products: [] }
    return store.getProducts()
  })
  ipcMain.handle('soundfind-store:purchase', async (event, storeId) => {
    if (!fromApp(event) || !store || !storeReady) return UNAVAILABLE
    if (typeof storeId !== 'string' || !STORE_ID.test(storeId)) return UNAVAILABLE
    return store.purchase(storeId)
  })
  ipcMain.handle('soundfind-store:reportFulfillment', async (event, storeId, trackingId) => {
    if (!fromApp(event) || !store || !storeReady) return UNAVAILABLE
    if (typeof storeId !== 'string' || !STORE_ID.test(storeId)) return UNAVAILABLE
    if (typeof trackingId !== 'string' || !TRACKING_ID.test(trackingId)) return UNAVAILABLE
    return store.reportFulfillment(storeId, trackingId)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
