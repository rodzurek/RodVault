import { useState } from 'react'
import { colors } from '../styles/shared'

export default function FileDropZone({ hint, busy, onFile }) {
  const [dragOver, setDragOver] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (busy) return
    const file = e.dataTransfer.files[0]
    if (file) onFile(window.vault.getPathForFile(file))
  }

  async function handleClick() {
    if (busy) return
    const path = await window.vault.pickFile()
    if (path) onFile(path)
  }

  return (
    <div
      style={{
        ...zoneStyle,
        ...(dragOver ? zoneActiveStyle : null),
        ...(busy ? { opacity: 0.5, cursor: 'wait' } : null)
      }}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); if (!busy) setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
    >
      <span style={{ fontSize: 20 }}>📄</span>
      <span>{busy ? 'Working...' : hint}</span>
      <span style={{ fontSize: 11, color: colors.textDim }}>
        {busy ? '' : 'Drop a file here or click to browse'}
      </span>
    </div>
  )
}

const zoneStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '18px 16px',
  border: `2px dashed ${colors.borderSubtle}`,
  borderRadius: 8,
  background: colors.surface,
  color: colors.textMuted,
  fontSize: 13,
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'border-color 0.15s, background 0.15s'
}

const zoneActiveStyle = {
  borderColor: colors.accent,
  background: colors.accentBg
}
