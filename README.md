# RodVault

Desktop encryption app for Windows. Paste a string, encrypt it with an RSA public key, get a Base64 ciphertext back. Decrypt it later with the matching private key.

Built with Electron + React.

---

## Features

- **Encrypt** any text with an RSA public key → single Base64 string output
- **Decrypt** that string with the matching RSA private key → original text back
- **Generate Keypair** — create a fresh 2048-bit RSA keypair in one click
- Supports both **PEM** (`-----BEGIN PUBLIC KEY-----`) and **SSH** (`ssh-rsa AAAA...`) public keys
- Supports **PEM** (`-----BEGIN PRIVATE KEY-----`) and **OpenSSH** (`-----BEGIN OPENSSH PRIVATE KEY-----`) private keys
- Hybrid encryption (RSA-OAEP + AES-256-GCM) — no length limit on input text
- Nothing stored — keys and plaintext never touch disk

---

## How it works

Encryption uses a hybrid scheme so there's no limit on string length:

1. Random AES-256 key + IV generated per message
2. Plaintext encrypted with AES-256-GCM (authenticated)
3. AES key encrypted with RSA-OAEP (SHA-256)
4. Everything bundled as JSON → Base64 output

Decryption reverses the process. The AES-GCM auth tag also detects any tampering.

---

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/your-username/RodVault.git
cd RodVault
npm install
```

### Run (dev)

```bash
npm run dev
```

### Build installer (Windows)

```bash
npm run package
```

Produces `dist/RodVault-Setup-1.0.0.exe`.

---

## Usage

### Generate a keypair

1. Open the **Generate Keypair** tab
2. Click **Generate Keypair**
3. Copy and save both keys — the private key is never stored

### Encrypt

1. Open the **Encrypt** tab
2. Paste your text in the **Plaintext** field
3. Paste the recipient's public key (PEM or `ssh-rsa` format)
4. Click **Encrypt**
5. Copy the Base64 output

### Decrypt

1. Open the **Decrypt** tab
2. Paste the Base64 ciphertext
3. Paste your private key (PEM or OpenSSH format)
4. Click **Decrypt**

---

## Tech stack

| Layer | Tech |
|---|---|
| Shell | Electron 43 |
| UI | React 19 + Vite 7 |
| Crypto | Node.js `crypto` (built-in) |
| Build | electron-vite + electron-builder |

No external crypto dependencies.

---

## Security notes

- Private keys are never written to disk or stored anywhere
- Each encryption uses a fresh random AES key and IV
- AES-GCM authentication tag detects ciphertext tampering
- Encrypted OpenSSH private keys (passphrase-protected) are not supported — remove the passphrase before use
- This app is for personal/local use — it has not been audited
