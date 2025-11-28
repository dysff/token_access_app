const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkToken: (token) => ipcRenderer.invoke('check-token-and-get-response', token),
  makeCalculation: (valueA, valueB) => ipcRenderer.invoke('make-calculations-and-get-response', [valueA, valueB]),
  checkDatabaseMatch: (email) => ipcRenderer.invoke('check-database-and-get-response', email),
  makeRegistration: (name, email, password) => ipcRenderer.invoke('make-registration-and-get-response', [name, email, password])
});
console.log('[Preload Context] Preload script loaded and API exposed.');