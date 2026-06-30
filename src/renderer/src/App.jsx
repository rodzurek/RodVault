import EncryptPane from './components/EncryptPane'
import DecryptPane from './components/DecryptPane'

function App() {
  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', padding: 32, color: '#e0e0e0' }}>
      <h1 style={{ fontFamily: 'sans-serif', marginTop: 0, marginBottom: 32, color: '#fff' }}>
        RodVault — STORY-07 Test
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'sans-serif', color: '#a5b4fc', marginTop: 0 }}>Encrypt</h2>
          <EncryptPane />
        </div>
        <div>
          <h2 style={{ fontFamily: 'sans-serif', color: '#4ade80', marginTop: 0 }}>Decrypt</h2>
          <DecryptPane />
        </div>
      </div>
    </div>
  )
}

export default App
