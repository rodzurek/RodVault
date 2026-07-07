import { useState, useEffect } from 'react'
import EncryptPane from './components/EncryptPane'
import DecryptPane from './components/DecryptPane'
import KeypairGenerator from './components/KeypairGenerator'
import { colors } from './styles/shared'

// Purge private key persisted to disk by older versions; public key stays persisted
localStorage.removeItem('vault_private_key')

// Files dropped outside a drop zone must not navigate the window to the file
window.addEventListener('dragover', (e) => e.preventDefault())
window.addEventListener('drop', (e) => e.preventDefault())

const TABS = [
  { id: 'encrypt', label: 'Encrypt' },
  { id: 'decrypt', label: 'Decrypt' },
  { id: 'keygen', label: 'Generate Keypair' }
]

export default function App() {
  const [active, setActive] = useState('encrypt')

  const [publicKey, setPublicKey] = useState(
    () => localStorage.getItem('vault_public_key') || ''
  )
  const [privateKey, setPrivateKey] = useState('')

  useEffect(() => { localStorage.setItem('vault_public_key', publicKey) }, [publicKey])

  function handleSaveKeypair(pub, priv) {
    setPublicKey(pub)
    setPrivateKey(priv)
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>
          <span style={styles.logoIcon}>🔐</span> RodVault
        </span>
        <nav style={styles.nav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={active === tab.id ? styles.tabActive : styles.tab}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={styles.main}>
        <div style={{ display: active === 'encrypt' ? 'block' : 'none' }}>
          <EncryptPane publicKey={publicKey} onPublicKeyChange={setPublicKey} />
        </div>
        <div style={{ display: active === 'decrypt' ? 'block' : 'none' }}>
          <DecryptPane privateKey={privateKey} onPrivateKeyChange={setPrivateKey} />
        </div>
        <div style={{ display: active === 'keygen' ? 'block' : 'none' }}>
          <KeypairGenerator onSaveKeypair={handleSaveKeypair} savedPublicKey={publicKey} savedPrivateKey={privateKey} />
        </div>
      </main>
    </div>
  )
}

const styles = {
  root: {
    background: colors.bg,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    padding: '0 24px',
    height: 52,
    borderBottom: `1px solid ${colors.border}`,
    background: colors.surfaceAlt,
    flexShrink: 0
  },
  logo: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    letterSpacing: '-0.2px'
  },
  logoIcon: { fontSize: 18 },
  nav: { display: 'flex', gap: 2 },
  tab: {
    background: 'transparent',
    color: colors.textMuted,
    border: 'none',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  tabActive: {
    background: colors.accentBg,
    color: colors.accent,
    border: 'none',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  main: {
    flex: 1,
    padding: 24,
    overflowY: 'auto',
    maxWidth: 800,
    width: '100%'
  }
}
