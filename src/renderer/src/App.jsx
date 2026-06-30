import { useEffect, useState } from 'react'

function App() {
  const [keys, setKeys] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.vault.generateKeypair().then((res) => {
      if (res.error) setError(res.error)
      else setKeys(res)
    })
  }, [])

  return (
    <div style={{ padding: 32, fontFamily: 'monospace' }}>
      <h1 style={{ fontFamily: 'sans-serif' }}>RodVault — STORY-03 IPC Test</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {keys && (
        <>
          <p><strong>Public Key:</strong></p>
          <pre style={{ background: '#eee', padding: 12, fontSize: 11, overflowX: 'auto' }}>{keys.publicKey}</pre>
          <p><strong>Private Key:</strong></p>
          <pre style={{ background: '#eee', padding: 12, fontSize: 11, overflowX: 'auto' }}>{keys.privateKey}</pre>
        </>
      )}
      {!keys && !error && <p>Generating keypair...</p>}
    </div>
  )
}

export default App
