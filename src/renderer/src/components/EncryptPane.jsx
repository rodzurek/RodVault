import { useState } from 'react'
import { s } from '../styles/shared'

function isPemKey(str) {
  return str.trim().startsWith('-----BEGIN')
}

export default function EncryptPane() {
  const [plaintext, setPlaintext] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleEncrypt() {
    if (!isPemKey(publicKey)) {
      setError('Invalid key format — paste a PEM public key starting with -----BEGIN PUBLIC KEY-----')
      return
    }
    setError('')
    setOutput('')
    setLoading(true)
    const { result, error: err } = await window.vault.encrypt(plaintext, publicKey)
    setLoading(false)
    if (err) setError(err)
    else setOutput(result)
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
          placeholder={'-----BEGIN PUBLIC KEY-----\n...'}
          value={publicKey}
          onChange={(e) => { setPublicKey(e.target.value); setError('') }}
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
    </div>
  )
}
