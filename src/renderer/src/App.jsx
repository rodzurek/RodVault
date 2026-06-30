import { useState } from 'react'
import EncryptPane from './components/EncryptPane'
import DecryptPane from './components/DecryptPane'
import KeypairGenerator from './components/KeypairGenerator'

const TABS = [
  { id: 'encrypt', label: 'Encrypt' },
  { id: 'decrypt', label: 'Decrypt' },
  { id: 'keygen', label: 'Generate Keypair' }
]

export default function App() {
  const [active, setActive] = useState('encrypt')

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>🔐 RodVault</span>
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
        {active === 'encrypt' && <EncryptPane />}
        {active === 'decrypt' && <DecryptPane />}
        {active === 'keygen' && <KeypairGenerator />}
      </main>
    </div>
  )
}

const styles = {
  root: {
    background: '#0f0f1a',
    minHeight: '100vh',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    padding: '14px 28px',
    borderBottom: '1px solid #1e1e3a',
    background: '#0b0b16'
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    fontFamily: 'sans-serif',
    letterSpacing: '-0.3px'
  },
  nav: { display: 'flex', gap: 4 },
  tab: {
    background: 'transparent',
    color: '#888',
    border: 'none',
    borderRadius: 6,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'sans-serif'
  },
  tabActive: {
    background: '#1e1e3a',
    color: '#a5b4fc',
    border: 'none',
    borderRadius: 6,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'sans-serif'
  },
  main: {
    flex: 1,
    padding: 28,
    maxWidth: 780,
    width: '100%',
    boxSizing: 'border-box'
  }
}
