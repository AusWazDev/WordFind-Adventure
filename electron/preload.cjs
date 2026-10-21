// The page's only route to the Microsoft Store (S25, SF-75). Context isolation stays
// on and node integration stays off: the page sees exactly these three calls, each a
// fixed IPC channel the main process validates. Nothing else is exposed.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('soundfindStore', {
  getProducts: () => ipcRenderer.invoke('soundfind-store:getProducts'),
  purchase: storeId => ipcRenderer.invoke('soundfind-store:purchase', String(storeId)),
  reportFulfillment: (storeId, trackingId) =>
    ipcRenderer.invoke('soundfind-store:reportFulfillment', String(storeId), String(trackingId)),
})
