import { useState, useEffect } from 'react'
import { s } from '../styles/shared'

function isPemKey(str) {
  return str.trim().startsWith('-----BEGIN')
}

export default function DecryptPane({ privateKey, onPrivateKeyChange }) {
  const [ciphertext, setCiphertext] = useState(
    () => localStorage.getItem('vault_decrypt_ciphertext') || ''
  )
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    localStorage.setItem('vault_decrypt_ciphertext', ciphertext)
  }, [ciphertext])

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
    </div>
  )
}
