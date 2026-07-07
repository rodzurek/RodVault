import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename } from 'path'
import { createReadStream, createWriteStream, promises as fsp } from 'fs'
import { pipeline } from 'stream/promises'
import { is } from '@electron-toolkit/utils'
import {
  generateKeyPairSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createPublicKey,
  createPrivateKey,
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
      preload: join(__dirname, '../preload/index.mjs'),
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

function opensshPrivateKeyToKeyObject(pem) {
  const b64 = pem
    .replace(/-----BEGIN OPENSSH PRIVATE KEY-----/, '')
    .replace(/-----END OPENSSH PRIVATE KEY-----/, '')
    .replace(/\s+/g, '')
  const buf = Buffer.from(b64, 'base64')

  const magic = 'openssh-key-v1\0'
  if (buf.slice(0, magic.length).toString() !== magic) throw new Error('Not a valid OpenSSH private key')

  let pos = magic.length
  function readStr() {
    const len = buf.readUInt32BE(pos); pos += 4
    const data = buf.slice(pos, pos + len); pos += len
    return data
  }

  const ciphername = readStr().toString()
  if (ciphername !== 'none') throw new Error('Encrypted OpenSSH private keys are not supported — remove passphrase first')
  readStr() // kdfname
  readStr() // kdfoptions
  const numKeys = buf.readUInt32BE(pos); pos += 4
  if (numKeys !== 1) throw new Error('Only single-key OpenSSH files are supported')
  readStr() // public key blob

  const priv = readStr()
  let pp = 0
  function readPrivStr() {
    const len = priv.readUInt32BE(pp); pp += 4
    const data = priv.slice(pp, pp + len); pp += len
    return data
  }

  const c1 = priv.readUInt32BE(pp); pp += 4
  const c2 = priv.readUInt32BE(pp); pp += 4
  if (c1 !== c2) throw new Error('OpenSSH private key checksum mismatch — file may be corrupted')

  const keyType = readPrivStr().toString()
  if (keyType !== 'ssh-rsa') throw new Error(`Unsupported key type: ${keyType}. Only ssh-rsa is supported`)

  // SSH RSA order: n, e, d, iqmp, p, q
  const n = readPrivStr()
  const e = readPrivStr()
  const d = readPrivStr()
  const iqmp = readPrivStr()
  const p = readPrivStr()
  const q = readPrivStr()

  const strip = (b) => (b[0] === 0 ? b.slice(1) : b)
  const toB64url = (b) => strip(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const dBig = BigInt('0x' + strip(d).toString('hex'))
  const pBig = BigInt('0x' + strip(p).toString('hex'))
  const qBig = BigInt('0x' + strip(q).toString('hex'))
  const bigToB64url = (big) => {
    let hex = big.toString(16); if (hex.length % 2) hex = '0' + hex
    return Buffer.from(hex, 'hex').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  return createPrivateKey({
    key: {
      kty: 'RSA',
      n: toB64url(n), e: toB64url(e), d: toB64url(d),
      p: toB64url(p), q: toB64url(q),
      dp: bigToB64url(dBig % (pBig - 1n)),
      dq: bigToB64url(dBig % (qBig - 1n)),
      qi: toB64url(iqmp)
    },
    format: 'jwk'
  })
}

function sshRsaToKeyObject(sshKey) {
  const parts = sshKey.trim().split(/\s+/)
  if (parts[0] !== 'ssh-rsa') throw new Error('Only ssh-rsa keys are supported')
  const buf = Buffer.from(parts[1], 'base64')
  let pos = 0
  function readBytes() {
    const len = buf.readUInt32BE(pos); pos += 4
    const data = buf.slice(pos, pos + len); pos += len
    return data
  }
  const keyType = readBytes().toString('ascii')
  if (keyType !== 'ssh-rsa') throw new Error('Not ssh-rsa format')
  const eBytes = readBytes()
  const nBytes = readBytes()
  const toB64url = (b) => (b[0] === 0 ? b.slice(1) : b).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return createPublicKey({ key: { kty: 'RSA', n: toB64url(nBytes), e: toB64url(eBytes) }, format: 'jwk' })
}

function resolvePublicKey(raw) {
  const trimmed = raw.trim()
  return /^ssh-rsa\s/.test(trimmed) ? sshRsaToKeyObject(trimmed) : trimmed
}

function resolvePrivateKey(raw) {
  const trimmed = raw.trim()
  return trimmed.includes('BEGIN OPENSSH PRIVATE KEY')
    ? opensshPrivateKeyToKeyObject(trimmed)
    : createPrivateKey(trimmed)
}

ipcMain.handle('vault:encrypt', async (_event, plaintext, publicKeyRaw) => {
  try {
    const publicKey = resolvePublicKey(publicKeyRaw)

    const aesKey = randomBytes(32)
    const iv = randomBytes(12)

    const cipher = createCipheriv('aes-256-gcm', aesKey, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    const encryptedKey = publicEncrypt(
      { key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
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
    console.error('[vault:encrypt]', err)
    const msg = err?.message ?? String(err)
    if (/key|PEM|ASN|ssh/i.test(msg)) {
      return { error: 'Invalid public key — paste a valid PEM or SSH public key.' }
    }
    return { error: `Encryption failed: ${msg}` }
  }
})

ipcMain.handle('vault:decrypt', async (_event, base64Bundle, privateKeyPem) => {
  try {
    const bundle = JSON.parse(Buffer.from(base64Bundle, 'base64').toString('utf8'))

    const privateKey = resolvePrivateKey(privateKeyPem)

    const aesKey = privateDecrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
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
    console.error('[vault:decrypt]', err)
    if (/key|PEM|ASN|format|passphrase/i.test(err?.message ?? '')) {
      return { error: `Invalid private key format: ${err.message}` }
    }
    return { error: 'Decryption failed: data may be corrupted or wrong key.' }
  }
})

// .rvault container: magic | u16BE wrappedKeyLen | wrappedKey | iv(12) | ciphertext | authTag(16)
const FILE_MAGIC = Buffer.from('RVLT1')

ipcMain.handle('vault:pickFile', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const { canceled, filePaths } = await dialog.showOpenDialog(win, { properties: ['openFile'] })
  return canceled || !filePaths.length ? null : filePaths[0]
})

ipcMain.handle('vault:encryptFile', async (event, inputPath, publicKeyRaw) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  let outputPath
  try {
    const publicKey = resolvePublicKey(publicKeyRaw)

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save encrypted file',
      defaultPath: basename(inputPath) + '.rvault',
      filters: [{ name: 'RodVault Encrypted', extensions: ['rvault'] }]
    })
    if (canceled || !filePath) return { canceled: true }
    outputPath = filePath

    const aesKey = randomBytes(32)
    const iv = randomBytes(12)
    const wrappedKey = publicEncrypt(
      { key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      aesKey
    )
    const keyLen = Buffer.alloc(2)
    keyLen.writeUInt16BE(wrappedKey.length)
    const cipher = createCipheriv('aes-256-gcm', aesKey, iv)

    async function* body() {
      yield Buffer.concat([FILE_MAGIC, keyLen, wrappedKey, iv])
      for await (const chunk of createReadStream(inputPath)) yield cipher.update(chunk)
      const last = cipher.final()
      if (last.length) yield last
      yield cipher.getAuthTag()
    }
    await pipeline(body(), createWriteStream(outputPath))

    return { result: outputPath }
  } catch (err) {
    console.error('[vault:encryptFile]', err)
    if (outputPath) await fsp.unlink(outputPath).catch(() => {})
    const msg = err?.message ?? String(err)
    if (/key|PEM|ASN|ssh/i.test(msg)) {
      return { error: 'Invalid public key — paste a valid PEM or SSH public key.' }
    }
    return { error: `File encryption failed: ${msg}` }
  }
})

ipcMain.handle('vault:decryptFile', async (event, inputPath, privateKeyPem) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  let outputPath
  let fd
  try {
    const privateKey = resolvePrivateKey(privateKeyPem)

    const stat = await fsp.stat(inputPath)
    fd = await fsp.open(inputPath, 'r')

    const head = Buffer.alloc(7)
    await fd.read(head, 0, 7, 0)
    if (stat.size < 7 || !head.subarray(0, 5).equals(FILE_MAGIC)) {
      throw new Error('Not a RodVault encrypted file — expected a .rvault file created by this app')
    }
    const wrappedKeyLen = head.readUInt16BE(5)
    const headerLen = 7 + wrappedKeyLen + 12
    if (stat.size < headerLen + 16) throw new Error('File is truncated or corrupted')

    const rest = Buffer.alloc(wrappedKeyLen + 12)
    await fd.read(rest, 0, rest.length, 7)
    const wrappedKey = rest.subarray(0, wrappedKeyLen)
    const iv = rest.subarray(wrappedKeyLen)
    const authTag = Buffer.alloc(16)
    await fd.read(authTag, 0, 16, stat.size - 16)
    await fd.close()
    fd = null

    const aesKey = privateDecrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      wrappedKey
    )
    const decipher = createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)

    const base = basename(inputPath)
    const defaultName = base.endsWith('.rvault') ? base.slice(0, -'.rvault'.length) : base + '.decrypted'
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save decrypted file',
      defaultPath: defaultName
    })
    if (canceled || !filePath) return { canceled: true }
    outputPath = filePath

    const ciphertextLen = stat.size - headerLen - 16
    async function* body() {
      if (ciphertextLen > 0) {
        const src = createReadStream(inputPath, { start: headerLen, end: stat.size - 17 })
        for await (const chunk of src) yield decipher.update(chunk)
      }
      const last = decipher.final() // throws if wrong key or file tampered with
      if (last.length) yield last
    }
    await pipeline(body(), createWriteStream(outputPath))

    return { result: outputPath }
  } catch (err) {
    console.error('[vault:decryptFile]', err)
    if (fd) await fd.close().catch(() => {})
    if (outputPath) await fsp.unlink(outputPath).catch(() => {})
    const msg = err?.message ?? String(err)
    if (/key|PEM|ASN|format|passphrase/i.test(msg)) {
      return { error: `Invalid private key format: ${msg}` }
    }
    if (/RVLT|rvault|truncated/i.test(msg)) {
      return { error: msg }
    }
    return { error: 'File decryption failed: wrong key, or file is corrupted.' }
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

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
