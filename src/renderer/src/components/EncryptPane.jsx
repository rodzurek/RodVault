import { useState } from 'react'
import { s } from '../styles/shared'
import FileDropZone from './FileDropZone'

// Purge plaintext persisted to disk by older versions
localStorage.removeItem('vault_encrypt_plaintext')

function isValidPublicKey(str) {
  const t = str.trim()
  return t.startsWith('-----BEGIN') || /^ssh-rsa\s/.test(t)
}

export default function EncryptPane({ publicKey, onPublicKeyChange }) {
  const [plaintext, setPlaintext] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fileBusy, setFileBusy] = useState(false)
  const [fileStatus, setFileStatus] = useState(null)

  async function handleEncrypt() {
    if (!isValidPublicKey(publicKey)) {
      setError('Invalid key format — paste a PEM public key (-----BEGIN PUBLIC KEY-----) or SSH public key (ssh-rsa ...)')
      return
    }
    setError('')
    setOutput('')
    setLoading(true)
    try {
      const { result, error: err } = await window.vault.encrypt(plaintext, publicKey)
      if (err) setError(err)
      else setOutput(result)
    } catch (e) {
      setError(`Unexpected error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileEncrypt(path) {
    if (!isValidPublicKey(publicKey)) {
      setFileStatus({ type: 'error', msg: 'Paste a valid public key above before encrypting a file.' })
      return
    }
    setFileBusy(true)
    setFileStatus(null)
    try {
      const res = await window.vault.encryptFile(path, publicKey)
      if (res.canceled) return
      if (res.error) setFileStatus({ type: 'error', msg: res.error })
      else setFileStatus({ type: 'success', msg: `Encrypted file saved to ${res.result}` })
    } catch (e) {
      setFileStatus({ type: 'error', msg: `Unexpected error: ${e.message}` })
    } finally {
      setFileBusy(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const canEncrypt = plaintext.trim().length > 0 && publicKey.trim().length > 0 && !loading

  return (
    <div style={s.pane}>
      <div style={s.field}>
        <label style={s.label}>Plaintext</label>
        <textarea
          style={s.textarea}
          rows={6}
          placeholder="Paste text to encrypt..."
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Public Key (PEM)</label>
        <textarea
          style={{ ...s.textarea, ...s.mono }}
          rows={8}
          placeholder={'-----BEGIN PUBLIC KEY-----\n...\nor: ssh-rsa AAAA...(RSA only)'}
          value={publicKey}
          onChange={(e) => { onPublicKeyChange(e.target.value); setError('') }}
        />
      </div>

      <button style={canEncrypt ? s.btn : s.btnDisabled} onClick={handleEncrypt} disabled={!canEncrypt}>
        {loading ? 'Encrypting...' : 'Encrypt'}
      </button>

      {error && <div style={s.error}>{error}</div>}

      {output && (
        <div style={s.field}>
          <div style={s.outputHeader}>
            <label style={s.label}>Encrypted Output (Base64)</label>
            <button style={s.copyBtn} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea style={{ ...s.textarea, ...s.mono }} rows={5} readOnly value={output} />
        </div>
      )}

      <div style={s.field}>
        <label style={s.label}>Encrypt a File</label>
        <FileDropZone hint="Encrypt any file with the public key above" busy={fileBusy} onFile={handleFileEncrypt} />
      </div>

      {fileStatus && (
        <div style={fileStatus.type === 'error' ? s.error : s.success}>{fileStatus.msg}</div>
      )}
    </div>
  )
}
