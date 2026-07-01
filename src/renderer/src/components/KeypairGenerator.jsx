import { useState, useEffect } from 'react'
import { s, colors } from '../styles/shared'

export default function KeypairGenerator({ onSaveKeypair, savedPublicKey, savedPrivateKey }) {
  const [editPub, setEditPub] = useState(savedPublicKey || '')
  const [editPriv, setEditPriv] = useState(savedPrivateKey || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState({ pub: false, priv: false })
  const [saved, setSaved] = useState(false)

  // Sync editable fields when saved keys change from outside (e.g. on first load)
  useEffect(() => {
    if (savedPublicKey && !editPub) setEditPub(savedPublicKey)
  }, [savedPublicKey])
  useEffect(() => {
    if (savedPrivateKey && !editPriv) setEditPriv(savedPrivateKey)
  }, [savedPrivateKey])

  async function handleGenerate() {
    setError('')
    setSaved(false)
    setLoading(true)
    const { publicKey, privateKey, error: err } = await window.vault.generateKeypair()
    setLoading(false)
    if (err) { setError(err); return }
    setEditPub(publicKey)
    setEditPriv(privateKey)
  }

  function handleSave() {
    if (!editPub.trim() && !editPriv.trim()) return
    onSaveKeypair(editPub, editPriv)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleCopy(which) {
    await navigator.clipboard.writeText(which === 'pub' ? editPub : editPriv)
    setCopied((prev) => ({ ...prev, [which]: true }))
    setTimeout(() => setCopied((prev) => ({ ...prev, [which]: false })), 1500)
  }

  const hasContent = editPub.trim() || editPriv.trim()

  return (
    <div style={s.pane}>
      <p style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        Generate a new keypair or paste your own keys below. Click <strong style={{ color: colors.text }}>Save & Use</strong> to persist them across sessions and auto-fill the Encrypt / Decrypt tabs.
      </p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={loading ? s.btnDisabled : s.btn} onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate New Keypair'}
        </button>

        <button
          style={hasContent ? (saved ? styles.btnSaved : styles.btnSave) : s.btnDisabled}
          onClick={handleSave}
          disabled={!hasContent}
        >
          {saved ? '✓ Saved' : 'Save & Use'}
        </button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.field}>
        <div style={s.outputHeader}>
          <label style={s.label}>Public Key (PEM or ssh-rsa)</label>
          <button style={s.copyBtn} onClick={() => handleCopy('pub')} disabled={!editPub}>
            {copied.pub ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          style={{ ...s.textarea, ...s.mono }}
          rows={7}
          placeholder={'-----BEGIN PUBLIC KEY-----\n...\nor: ssh-rsa AAAA...'}
          value={editPub}
          onChange={(e) => { setEditPub(e.target.value); setSaved(false) }}
        />
      </div>

      <div style={s.field}>
        <div style={s.outputHeader}>
          <label style={s.label}>Private Key (PEM or OpenSSH)</label>
          <button style={s.copyBtn} onClick={() => handleCopy('priv')} disabled={!editPriv}>
            {copied.priv ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          style={{ ...s.textarea, ...s.mono }}
          rows={12}
          placeholder={'-----BEGIN PRIVATE KEY-----\n...\nor: -----BEGIN OPENSSH PRIVATE KEY-----\n...'}
          value={editPriv}
          onChange={(e) => { setEditPriv(e.target.value); setSaved(false) }}
        />
      </div>
    </div>
  )
}

const styles = {
  btnSave: {
    background: '#1e3a2f',
    color: '#4ade80',
    border: '1px solid #166534',
    borderRadius: 7,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  btnSaved: {
    background: '#14532d',
    color: '#86efac',
    border: '1px solid #166534',
    borderRadius: 7,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'default',
    fontFamily: 'inherit'
  }
}
