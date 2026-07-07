import { contextBridge, ipcRenderer, webUtils } from 'electron'

contextBridge.exposeInMainWorld('vault', {
  encrypt: (plaintext, publicKeyPem) =>
    ipcRenderer.invoke('vault:encrypt', plaintext, publicKeyPem),
  decrypt: (ciphertext, privateKeyPem) =>
    ipcRenderer.invoke('vault:decrypt', ciphertext, privateKeyPem),
  encryptFile: (filePath, publicKeyPem) =>
    ipcRenderer.invoke('vault:encryptFile', filePath, publicKeyPem),
  decryptFile: (filePath, privateKeyPem) =>
    ipcRenderer.invoke('vault:decryptFile', filePath, privateKeyPem),
  pickFile: () =>
    ipcRenderer.invoke('vault:pickFile'),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  generateKeypair: () =>
    ipcRenderer.invoke('vault:generateKeypair')
})
