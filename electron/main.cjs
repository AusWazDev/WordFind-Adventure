const { app, BrowserWindow, Menu, protocol, net, shell } = require('electron')
const path = require('path')

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
    },
  })

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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
