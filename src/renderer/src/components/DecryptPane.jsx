import { useState } from 'react'
import { s } from '../styles/shared'
import FileDropZone from './FileDropZone'

// Purge ciphertext persisted to disk by older versions
localStorage.removeItem('vault_decrypt_ciphertext')

function isPemKey(str) {
  return str.trim().startsWith('-----BEGIN')
}

export default function DecryptPane({ privateKey, onPrivateKeyChange }) {
  const [ciphertext, setCiphertext] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fileBusy, setFileBusy] = useState(false)
  const [fileStatus, setFileStatus] = useState(null)

  async function handleDecrypt() {
    if (!isPemKey(privateKey)) {
      setError('Invalid key format — paste a PEM private key starting with -----BEGIN PRIVATE KEY----- or -----BEGIN OPENSSH PRIVATE KEY-----')
      return
    }
    setError('')
    setOutput('')
    setLoading(true)
    try {
      const { result, error: err } = await window.vault.decrypt(ciphertext.trim(), privateKey)
      if (err) setError(err)
      else setOutput(result)
    } catch (e) {
      setError(`Unexpected error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileDecrypt(path) {
    if (!isPemKey(privateKey)) {
      setFileStatus({ type: 'error', msg: 'Paste a valid private key above before decrypting a file.' })
      return
    }
    setFileBusy(true)
    setFileStatus(null)
    try {
      const res = await window.vault.decryptFile(path, privateKey)
      if (res.canceled) return
      if (res.error) setFileStatus({ type: 'error', msg: res.error })
      else setFileStatus({ type: 'success', msg: `Decrypted file saved to ${res.result}` })
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

  const canDecrypt = ciphertext.trim().length > 0 && privateKey.trim().length > 0 && !loading

  return (
    <div style={s.pane}>
      <div style={s.field}>
        <label style={s.label}>Ciphertext (Base64)</label>
        <textarea
          style={{ ...s.textarea, ...s.mono }}
          rows={5}
          placeholder="Paste Base64 encrypted string..."
          value={ciphertext}
          onChange={(e) => { setCiphertext(e.target.value); setError('') }}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Private Key (PEM)</label>
        <textarea
          style={{ ...s.textarea, ...s.mono }}
          rows={8}
          placeholder={'-----BEGIN PRIVATE KEY-----\n...\nor: -----BEGIN OPENSSH PRIVATE KEY-----'}
          value={privateKey}
          onChange={(e) => { onPrivateKeyChange(e.target.value); setError('') }}
        />
      </div>

      <button style={canDecrypt ? s.btn : s.btnDisabled} onClick={handleDecrypt} disabled={!canDecrypt}>
        {loading ? 'Decrypting...' : 'Decrypt'}
      </button>

      {error && <div style={s.error}>{error}</div>}

      {output && (
        <div style={s.field}>
          <div style={s.outputHeader}>
            <label style={s.label}>Decrypted Plaintext</label>
            <button style={s.copyBtn} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea style={s.textarea} rows={6} readOnly value={output} />
        </div>
      )}

      <div style={s.field}>
        <label style={s.label}>Decrypt a File</label>
        <FileDropZone hint="Decrypt a .rvault file with the private key above" busy={fileBusy} onFile={handleFileDecrypt} />
      </div>

      {fileStatus && (
        <div style={fileStatus.type === 'error' ? s.error : s.success}>{fileStatus.msg}</div>
      )}
    </div>
  )
}
