import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('vault', {
  encrypt: (plaintext, publicKeyPem) =>
    ipcRenderer.invoke('vault:encrypt', plaintext, publicKeyPem),
  decrypt: (ciphertext, privateKeyPem) =>
    ipcRenderer.invoke('vault:decrypt', ciphertext, privateKeyPem),
  generateKeypair: () =>
    ipcRenderer.invoke('vault:generateKeypair')
})
