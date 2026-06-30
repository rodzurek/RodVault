import EncryptPane from './components/EncryptPane'

function App() {
  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', padding: 32, color: '#e0e0e0' }}>
      <h1 style={{ fontFamily: 'sans-serif', marginTop: 0, marginBottom: 24, color: '#fff' }}>
        RodVault — Encrypt
      </h1>
      <EncryptPane />
    </div>
  )
}

export default App
