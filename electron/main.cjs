const { app, BrowserWindow, protocol, net } = require('electron')
const path = require('path')

// Register before app is ready — required by Electron
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, stream: true } }
])

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

  win.loadURL('app://localhost/index.html')

  win.once('ready-to-show', () => {
    win.show()
  })
}

app.whenReady().then(() => {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
