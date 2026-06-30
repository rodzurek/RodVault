import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import {
  generateKeyPairSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  publicEncrypt,
  privateDecrypt,
  constants
} from 'crypto'

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 720,
    minHeight: 500,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    titleBarStyle: 'default',
    title: 'RodVault'
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('vault:encrypt', async (_event, plaintext, publicKeyPem) => {
  try {
    const aesKey = randomBytes(32)
    const iv = randomBytes(12)

    const cipher = createCipheriv('aes-256-gcm', aesKey, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    const encryptedKey = publicEncrypt(
      { key: publicKeyPem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      aesKey
    )

    const bundle = JSON.stringify({
      encryptedKey: encryptedKey.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      ciphertext: encrypted.toString('base64')
    })

    return { result: Buffer.from(bundle).toString('base64') }
  } catch (err) {
    if (err.message.includes('key') || err.message.includes('PEM') || err.message.includes('ASN')) {
      return { error: 'Invalid public key — paste a valid PEM public key.' }
    }
    return { error: `Encryption failed: ${err.message}` }
  }
})

ipcMain.handle('vault:decrypt', async (_event, base64Bundle, privateKeyPem) => {
  try {
    const bundle = JSON.parse(Buffer.from(base64Bundle, 'base64').toString('utf8'))

    const aesKey = privateDecrypt(
      { key: privateKeyPem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(bundle.encryptedKey, 'base64')
    )

    const decipher = createDecipheriv('aes-256-gcm', aesKey, Buffer.from(bundle.iv, 'base64'))
    decipher.setAuthTag(Buffer.from(bundle.authTag, 'base64'))

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(bundle.ciphertext, 'base64')),
      decipher.final()
    ]).toString('utf8')

    return { result: plaintext }
  } catch (err) {
    return { error: 'Decryption failed: data may be corrupted or wrong key.' }
  }
})

ipcMain.handle('vault:generateKeypair', async () => {
  try {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    })
    return { publicKey, privateKey }
  } catch (err) {
    return { error: err.message }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
