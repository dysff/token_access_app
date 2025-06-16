const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkToken: (token) => ipcRenderer.invoke('check-token-and-get-response', token),
  makeCalculation: (valueA, valueB) => ipcRenderer.invoke('make-calculations-and-get-response', [valueA, valueB])
});
console.log('[Preload Context] Preload script loaded and API exposed.');