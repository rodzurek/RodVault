import { useState } from 'react'

export default function KeypairGenerator() {
  const [keys, setKeys] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState({ pub: false, priv: false })

  async function handleGenerate() {
    setError('')
    setKeys(null)
    setLoading(true)
    const { publicKey, privateKey, error: err } = await window.vault.generateKeypair()
    setLoading(false)
    if (err) setError(err)
    else setKeys({ publicKey, privateKey })
  }

  async function handleCopy(which) {
    await navigator.clipboard.writeText(which === 'pub' ? keys.publicKey : keys.privateKey)
    setCopied((prev) => ({ ...prev, [which]: true }))
    setTimeout(() => setCopied((prev) => ({ ...prev, [which]: false })), 1500)
  }

  return (
    <div style={styles.pane}>
      <button style={loading ? styles.btnDisabled : styles.btn} onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Keypair'}
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {keys && (
        <>
          <div style={styles.warning}>
            ⚠ Save your private key — it cannot be recovered after closing this app.
          </div>

          <div style={styles.field}>
            <div style={styles.outputHeader}>
              <label style={styles.label}>Public Key (PEM)</label>
              <button style={styles.copyBtn} onClick={() => handleCopy('pub')}>
                {copied.pub ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea style={{ ...styles.textarea, ...styles.mono }} rows={7} readOnly value={keys.publicKey} />
          </div>

          <div style={styles.field}>
            <div style={styles.outputHeader}>
              <label style={styles.label}>Private Key (PEM)</label>
              <button style={styles.copyBtn} onClick={() => handleCopy('priv')}>
                {copied.priv ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea style={{ ...styles.textarea, ...styles.mono }} rows={12} readOnly value={keys.privateKey} />
          </div>
        </>
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
  mono: { fontFamily: 'monospace', fontSize: 11 },
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
  warning: {
    background: '#2d2500',
    color: '#fbbf24',
    border: '1px solid #78350f',
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
