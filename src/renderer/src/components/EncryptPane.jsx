import { useState, useEffect } from 'react'
import { s } from '../styles/shared'

function isValidPublicKey(str) {
  const t = str.trim()
  return t.startsWith('-----BEGIN') || /^ssh-rsa\s/.test(t)
}

export default function EncryptPane({ publicKey, onPublicKeyChange }) {
  const [plaintext, setPlaintext] = useState(
    () => localStorage.getItem('vault_encrypt_plaintext') || ''
  )
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    localStorage.setItem('vault_encrypt_plaintext', plaintext)
  }, [plaintext])

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
    </div>
  )
}
