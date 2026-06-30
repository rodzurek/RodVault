import { useEffect, useState } from 'react'

const TEST_STRING = 'Hello from RodVault — full round-trip test! 🔐 Unicode + special chars: áéíóú &<>"'

function App() {
  const [log, setLog] = useState([])

  useEffect(() => {
    async function test() {
      const push = (msg) => setLog((prev) => [...prev, msg])

      push('1. Generating RSA keypair...')
      const { publicKey, privateKey, error: keyErr } = await window.vault.generateKeypair()
      if (keyErr) return push(`FAIL keygen: ${keyErr}`)
      push('   OK — keypair generated')

      push(`2. Encrypting: "${TEST_STRING}"`)
      const { result: ciphertext, error: encErr } = await window.vault.encrypt(TEST_STRING, publicKey)
      if (encErr) return push(`FAIL encrypt: ${encErr}`)
      push(`   OK — ciphertext (Base64): ${ciphertext.slice(0, 60)}...`)

      push('3. Decrypting with private key...')
      const { result: plaintext, error: decErr } = await window.vault.decrypt(ciphertext, privateKey)
      if (decErr) return push(`FAIL decrypt: ${decErr}`)
      push(`   OK — plaintext: "${plaintext}"`)

      push(plaintext === TEST_STRING ? '✅ PASS — round-trip match' : '❌ FAIL — mismatch!')
    }
    test()
  }, [])

  return (
    <div style={{ padding: 32, fontFamily: 'monospace' }}>
      <h1 style={{ fontFamily: 'sans-serif' }}>RodVault — STORY-05 Round-Trip Test</h1>
      {log.map((line, i) => (
        <div key={i} style={{ marginBottom: 4 }}>{line}</div>
      ))}
    </div>
  )
}

export default App
