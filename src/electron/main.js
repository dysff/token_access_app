import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isDev } from './util.js';
import path from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'TokenAccessApp',
    width: 400,
    height: 450,
    backgroundColor: '#1b1c1d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
    autoHideMenuBar: true
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }
}

app.on('ready', () => {
  createMainWindow();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

ipcMain.handle('check-token-and-get-response', async (event, token) => {
  console.log('Received token from React for validation:', token);
  try {
    const response = await fetch('http://localhost:3001/check-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token })
    });
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error('Error checking token with server:', error);
    return false;
  }
});

ipcMain.handle('make-calculations-and-get-response', async (event, [valueA, valueB]) => {
  console.log(`Received calculation request from React with values: ${valueA}, ${valueB}`)
  try {
    const response = await fetch('http://localhost:3001/make-calculations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: valueA, b: valueB})
    });
    const data = await response.json();
    console.log('DATA: ', data)

    if (data) {
      
      return data;
    }
    
  } catch (error) {
    console.log('Error making calculations with server: ', error);

    return null;
  }
});