import { useEffect, useState } from 'react'

function App() {
  const [ipcResult, setIpcResult] = useState('waiting...')

  useEffect(() => {
    window.vault.generateKeypair().then((res) => {
      setIpcResult(JSON.stringify(res))
    })
  }, [])

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>RodVault</h1>
      <p>IPC test — vault:generateKeypair response:</p>
      <pre style={{ background: '#eee', padding: 12 }}>{ipcResult}</pre>
    </div>
  )
}

export default App
