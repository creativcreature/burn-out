import { InputHTMLAttributes, CSSProperties } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  onChange: (value: string) => void
}

export function Input({
  label,
  error,
  onChange,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  }

  const labelStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--text-muted)'
  }

  const inputStyle: CSSProperties = {
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--text-md)',
    fontFamily: 'var(--font-body)',
    background: 'var(--bg-card)',
    border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)'
  }

  const errorStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: '#ef4444'
  }

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={inputStyle}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      {error && (
        <span style={errorStyle} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
