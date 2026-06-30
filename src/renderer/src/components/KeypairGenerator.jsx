import { useState } from 'react'
import { s } from '../styles/shared'

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
    <div style={s.pane}>
      <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        Generate a 2048-bit RSA keypair. Use the public key to encrypt, the private key to decrypt.
      </p>

      <button style={loading ? s.btnDisabled : s.btn} onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Keypair'}
      </button>

      {error && <div style={s.error}>{error}</div>}

      {keys && (
        <>
          <div style={s.warning}>
            ⚠ Save your private key now — it is not stored anywhere and cannot be recovered.
          </div>

          <div style={s.field}>
            <div style={s.outputHeader}>
              <label style={s.label}>Public Key (PEM)</label>
              <button style={s.copyBtn} onClick={() => handleCopy('pub')}>
                {copied.pub ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea style={{ ...s.textarea, ...s.mono }} rows={7} readOnly value={keys.publicKey} />
          </div>

          <div style={s.field}>
            <div style={s.outputHeader}>
              <label style={s.label}>Private Key (PEM)</label>
              <button style={s.copyBtn} onClick={() => handleCopy('priv')}>
                {copied.priv ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea style={{ ...s.textarea, ...s.mono }} rows={12} readOnly value={keys.privateKey} />
          </div>
        </>
      )}
    </div>
  )
}
