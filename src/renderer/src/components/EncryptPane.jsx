import { useState } from 'react'

export default function EncryptPane() {
  const [plaintext, setPlaintext] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleEncrypt() {
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
    <div style={styles.pane}>
      <div style={styles.field}>
        <label style={styles.label}>Plaintext</label>
        <textarea
          style={styles.textarea}
          rows={6}
          placeholder="Paste text to encrypt..."
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Public Key (PEM)</label>
        <textarea
          style={{ ...styles.textarea, ...styles.mono }}
          rows={8}
          placeholder="-----BEGIN PUBLIC KEY-----&#10;..."
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
        />
      </div>

      <button style={canEncrypt ? styles.btn : styles.btnDisabled} onClick={handleEncrypt} disabled={!canEncrypt}>
        {loading ? 'Encrypting...' : 'Encrypt'}
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {output && (
        <div style={styles.field}>
          <div style={styles.outputHeader}>
            <label style={styles.label}>Encrypted Output (Base64)</label>
            <button style={styles.copyBtn} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            style={{ ...styles.textarea, ...styles.mono }}
            rows={5}
            readOnly
            value={output}
          />
        </div>
      )}
    </div>
  )
}

const styles = {
  pane: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#ccc' },
  textarea: {
    background: '#1a1a2e',
    color: '#e0e0e0',
    border: '1px solid #333',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 13,
    resize: 'vertical',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  btn: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  btnDisabled: {
    background: '#333',
    color: '#666',
    border: 'none',
    borderRadius: 6,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'not-allowed',
    alignSelf: 'flex-start'
  },
  error: {
    background: '#2d1a1a',
    color: '#f87171',
    border: '1px solid #7f1d1d',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 13
  },
  outputHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  copyBtn: {
    background: '#1e3a2f',
    color: '#4ade80',
    border: '1px solid #166534',
    borderRadius: 4,
    padding: '4px 12px',
    fontSize: 12,
    cursor: 'pointer'
  }
}
