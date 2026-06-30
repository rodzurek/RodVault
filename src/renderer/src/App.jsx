import { useEffect, useState } from 'react'

function App() {
  const [output, setOutput] = useState('running...')

  useEffect(() => {
    async function test() {
      const { publicKey, privateKey, error: keyErr } = await window.vault.generateKeypair()
      if (keyErr) return setOutput(`keygen error: ${keyErr}`)

      const testString = 'Hello from RodVault — STORY-04 hybrid encrypt test!'
      const { result, error: encErr } = await window.vault.encrypt(testString, publicKey)
      if (encErr) return setOutput(`encrypt error: ${encErr}`)

      setOutput(result)
    }
    test()
  }, [])

  return (
    <div style={{ padding: 32, fontFamily: 'monospace' }}>
      <h1 style={{ fontFamily: 'sans-serif' }}>RodVault — STORY-04 Encrypt Test</h1>
      <p><strong>Encrypted Base64 output:</strong></p>
      <pre style={{ background: '#eee', padding: 12, fontSize: 11, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
        {output}
      </pre>
    </div>
  )
}

export default App
