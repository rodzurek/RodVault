import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('vault:encrypt', async (_event, plaintext, publicKeyPem) => {
  // stub — real impl in STORY-04
  return { result: `[stub] encrypt called: ${plaintext?.slice(0, 20)}` }
})

ipcMain.handle('vault:decrypt', async (_event, ciphertext, privateKeyPem) => {
  // stub — real impl in STORY-05
  return { result: `[stub] decrypt called` }
})

ipcMain.handle('vault:generateKeypair', async () => {
  // stub — real impl in STORY-03
  return { result: '[stub] generateKeypair called' }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
