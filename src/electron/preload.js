const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkToken: (token) => ipcRenderer.invoke('check-token-and-get-response', token)
});
console.log('[Preload Context] Preload script loaded and API exposed.');