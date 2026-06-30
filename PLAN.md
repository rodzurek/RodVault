# RodVault — Encryption App Plan

## Overview

Desktop Electron app. Paste string → encrypt with RSA public key → get Base64 ciphertext. Paste ciphertext + private key → decrypt → get plaintext back. Hybrid encryption (RSA + AES) handles strings of any length.

---

## Tech Stack

- Electron (main process)
- React + Vite (renderer)
- Node.js built-in `crypto` (no external crypto deps)
- RSA-OAEP 2048-bit + AES-256-GCM hybrid
- Base64 output encoding

---

## Stories

---

### STORY-01 — Project Scaffold

**As a developer, I want a working Electron + React + Vite project so I can start building features.**

**Tasks:**
- Init project with `npm create vite` (React template)
- Install and configure Electron
- Configure Vite for Electron (main + renderer build targets)
- Add `electron-builder` for packaging
- Verify app launches with blank window

**Acceptance criteria:**
- `npm run dev` opens an Electron window
- React renders inside the window
- Hot reload works in dev mode

---

### STORY-02 — Main Process IPC Setup

**As a developer, I want a secure IPC bridge between renderer and main process so crypto never runs in the browser context.**

**Tasks:**
- Create `preload.js` with `contextBridge` exposing `window.vault` API
- Define IPC channels: `vault:encrypt`, `vault:decrypt`, `vault:generateKeypair`
- Register `ipcMain.handle()` stubs for each channel in `main.js`
- Verify renderer can call `window.vault.encrypt()` and receive a response

**Acceptance criteria:**
- Renderer calls IPC → main process receives it → returns response
- No Node.js APIs exposed directly to renderer (only via contextBridge)

---

### STORY-03 — Keypair Generator (Core Crypto)

**As a user, I want to generate an RSA keypair so I have keys to use for encryption and decryption.**

**Tasks:**
- Implement `generateKeypair()` in main process using `crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })`
- Export both keys as PEM strings
- Wire to `vault:generateKeypair` IPC handler
- Return `{ publicKey: string, privateKey: string }`

**Acceptance criteria:**
- Returns valid 2048-bit RSA PEM keypair
- Public key starts with `-----BEGIN PUBLIC KEY-----`
- Private key starts with `-----BEGIN PRIVATE KEY-----`

---

### STORY-04 — Hybrid Encrypt (Core Crypto)

**As a user, I want to encrypt a string of any length using an RSA public key.**

**Tasks:**
- Generate random AES-256-GCM key + IV per encryption call
- Encrypt plaintext with AES-256-GCM → get `{ ciphertext, authTag, iv }`
- Encrypt AES key with RSA-OAEP using provided public key PEM
- Bundle result: `{ encryptedKey, iv, authTag, ciphertext }` → JSON → Base64
- Wire to `vault:encrypt` IPC handler
- Input: `(plaintext: string, publicKeyPem: string)`
- Output: `Base64 string`

**Acceptance criteria:**
- Encrypts strings of any length (not limited by RSA key size)
- Output is a single Base64 string
- Each call produces different ciphertext (random IV)
- Invalid public key throws descriptive error

---

### STORY-05 — Hybrid Decrypt (Core Crypto)

**As a user, I want to decrypt a Base64 ciphertext using my RSA private key.**

**Tasks:**
- Decode Base64 → parse JSON bundle `{ encryptedKey, iv, authTag, ciphertext }`
- Decrypt AES key with RSA-OAEP using provided private key PEM
- Decrypt ciphertext with AES-256-GCM using recovered key + iv + authTag
- Return plaintext string
- Wire to `vault:decrypt` IPC handler
- Input: `(base64Cipher: string, privateKeyPem: string)`
- Output: `plaintext string`

**Acceptance criteria:**
- Correctly decrypts output from STORY-04
- Wrong private key → throws descriptive error (not crash)
- Tampered ciphertext → AES-GCM authTag fails → throws descriptive error

---

### STORY-06 — Encrypt UI Pane

**As a user, I want a UI pane where I paste my text and public key and see the encrypted result.**

**Tasks:**
- Create `EncryptPane.jsx` component
- Fields: `Plaintext` textarea, `Public Key (PEM)` textarea
- Button: `Encrypt`
- Output: read-only textarea with Base64 result
- Copy-to-clipboard button on output
- Show error message if encryption fails
- Loading state on button while IPC call in flight

**Acceptance criteria:**
- Encrypt button calls `window.vault.encrypt(plaintext, publicKey)`
- Output appears in read-only field
- Copy button copies output to clipboard
- Error displayed inline (not crash/alert)

---

### STORY-07 — Decrypt UI Pane

**As a user, I want a UI pane where I paste my ciphertext and private key and see the decrypted result.**

**Tasks:**
- Create `DecryptPane.jsx` component
- Fields: `Ciphertext (Base64)` textarea, `Private Key (PEM)` textarea
- Button: `Decrypt`
- Output: read-only textarea with plaintext result
- Copy-to-clipboard button on output
- Show error message if decryption fails
- Loading state on button while IPC call in flight

**Acceptance criteria:**
- Decrypt button calls `window.vault.decrypt(ciphertext, privateKey)`
- Output appears in read-only field
- Copy button copies output to clipboard
- Error displayed inline (not crash/alert)

---

### STORY-08 — Keypair Generator UI

**As a user, I want a UI panel to generate a fresh RSA keypair so I can copy and save my keys.**

**Tasks:**
- Create `KeypairGenerator.jsx` component
- Button: `Generate Keypair`
- Output: two read-only textareas — Public Key, Private Key
- Copy button for each key
- Warning label: "Save your private key — it cannot be recovered"
- Loading state while generation in flight (generation is synchronous but blocks briefly)

**Acceptance criteria:**
- Clicking generate calls `window.vault.generateKeypair()`
- Both keys appear in their respective fields
- Copy buttons work independently
- Warning is visible

---

### STORY-09 — Tab Navigation Shell

**As a user, I want to switch between Encrypt, Decrypt, and Generate Keypair views.**

**Tasks:**
- Create `App.jsx` with tab/nav component
- Three tabs: `Encrypt`, `Decrypt`, `Generate Keypair`
- Render correct pane per active tab
- Persist active tab in component state (no routing needed)

**Acceptance criteria:**
- Clicking each tab shows correct pane
- State in each pane is preserved when switching tabs

---

### STORY-10 — Styling & Polish

**As a user, I want the app to look clean and be easy to use.**

**Tasks:**
- Dark theme (vault/security aesthetic)
- Monospace font for key and ciphertext fields
- Consistent spacing, button styles, error states
- Window size: 900×650, non-resizable optional
- App icon (lock/vault)

**Acceptance criteria:**
- App looks intentional, not default-Electron
- All interactive states (hover, focus, error, loading) have visual feedback

---

### STORY-11 — Error Handling & Edge Cases

**As a user, I want clear errors instead of crashes when I do something wrong.**

**Tasks:**
- Invalid PEM key → "Invalid key format" message
- Empty input on encrypt/decrypt → disable button or show validation
- Tampered ciphertext → "Decryption failed: data may be corrupted or key is wrong"
- All IPC errors caught in main, returned as `{ error: string }` not thrown
- Renderer displays `result.error` inline

**Acceptance criteria:**
- No unhandled promise rejections
- No app crashes on bad input
- Every error state has a user-readable message

---

### STORY-12 — Build & Package

**As a developer, I want to produce a distributable Windows installer.**

**Tasks:**
- Configure `electron-builder` for Windows (NSIS installer)
- Set app name, version, icon in `package.json` / `electron-builder.yml`
- `npm run build` produces installer in `dist/`
- Verify installed app launches and all features work

**Acceptance criteria:**
- `dist/RodVault-Setup.exe` produced
- Installed app runs without dev dependencies
- All three features (encrypt, decrypt, generate) work in production build

---

## Story Order (Suggested)

```
STORY-01 → STORY-02 → STORY-03 → STORY-04 → STORY-05
→ STORY-06 → STORY-07 → STORY-08 → STORY-09
→ STORY-10 → STORY-11 → STORY-12
```

Core crypto (01–05) before any UI. UI panes (06–08) before shell (09). Polish and packaging last.
