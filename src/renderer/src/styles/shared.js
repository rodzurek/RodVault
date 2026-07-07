export const colors = {
  bg: '#0f0f1a',
  surface: '#1a1a2e',
  surfaceAlt: '#0b0b16',
  border: '#1e1e3a',
  borderSubtle: '#2a2a4a',
  text: '#e0e0e0',
  textMuted: '#888',
  textDim: '#555',
  accent: '#a5b4fc',
  accentBg: '#1e1e3a',
  green: '#4ade80',
  greenBg: '#1e3a2f',
  greenBorder: '#166534',
  yellow: '#fbbf24',
  yellowBg: '#2d2500',
  yellowBorder: '#78350f',
  red: '#f87171',
  redBg: '#2d1a1a',
  redBorder: '#7f1d1d',
  btnPrimary: '#4f46e5',
  btnPrimaryHover: '#4338ca',
  btnDisabled: '#1e1e3a',
  btnDisabledText: '#444'
}

export const s = {
  pane: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  textarea: {
    background: colors.surface,
    color: colors.text,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    resize: 'vertical',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    lineHeight: 1.5,
    transition: 'border-color 0.15s'
  },
  mono: {
    fontFamily: '"Cascadia Code", "Fira Code", "Consolas", monospace',
    fontSize: 11
  },
  btn: {
    background: colors.btnPrimary,
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    padding: '9px 22px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    fontFamily: 'sans-serif',
    letterSpacing: '0.01em'
  },
  btnDisabled: {
    background: colors.btnDisabled,
    color: colors.btnDisabledText,
    border: 'none',
    borderRadius: 7,
    padding: '9px 22px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'not-allowed',
    alignSelf: 'flex-start',
    fontFamily: 'sans-serif'
  },
  error: {
    background: colors.redBg,
    color: colors.red,
    border: `1px solid ${colors.redBorder}`,
    borderRadius: 7,
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.5
  },
  success: {
    background: colors.greenBg,
    color: colors.green,
    border: `1px solid ${colors.greenBorder}`,
    borderRadius: 7,
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: 'break-all'
  },
  warning: {
    background: colors.yellowBg,
    color: colors.yellow,
    border: `1px solid ${colors.yellowBorder}`,
    borderRadius: 7,
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.5
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  copyBtn: {
    background: colors.greenBg,
    color: colors.green,
    border: `1px solid ${colors.greenBorder}`,
    borderRadius: 5,
    padding: '4px 12px',
    fontSize: 11,
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'sans-serif'
  }
}
