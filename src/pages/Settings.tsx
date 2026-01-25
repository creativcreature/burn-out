import { useState, useEffect, CSSProperties } from 'react'
import { AppLayout, Header } from '../components/layout'
import { Card, Button, Input } from '../components/shared'
import { useThemeContext } from '../components/shared/ThemeProvider'
import { getData, updateData } from '../utils/storage'
import type { Settings as SettingsType } from '../data/types'

export function SettingsPage() {
  const { toggleTheme, isDark } = useThemeContext()
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getData().then(data => setSettings(data.settings))
  }, [])

  const contentStyle: CSSProperties = {
    padding: 'var(--space-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const sectionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  }

  const sectionTitleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--text-primary)'
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-sm) 0'
  }

  const labelStyle: CSSProperties = {
    color: 'var(--text-primary)'
  }

  const descStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)'
  }

  const toggleStyle = (isActive: boolean): CSSProperties => ({
    width: 48,
    height: 28,
    borderRadius: 'var(--radius-full)',
    background: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)'
  })

  const toggleKnobStyle = (isActive: boolean): CSSProperties => ({
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'white',
    position: 'absolute',
    top: 2,
    left: isActive ? 22 : 2,
    transition: 'left var(--transition-fast)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  })

  const handleSave = async () => {
    if (!settings) return
    await updateData(data => ({ ...data, settings }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) {
    return (
      <AppLayout>
        <Header title="Settings" />
        <div style={contentStyle}>Loading...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Header title="Settings" />
      <main style={contentStyle}>
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Appearance</h2>
          <Card>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>Dark Mode</div>
                <div style={descStyle}>Switch between light and dark themes</div>
              </div>
              <button
                style={toggleStyle(isDark)}
                onClick={toggleTheme}
                aria-label={`${isDark ? 'Disable' : 'Enable'} dark mode`}
              >
                <div style={toggleKnobStyle(isDark)} />
              </button>
            </div>
          </Card>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Notifications</h2>
          <Card>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>Push Notifications</div>
                <div style={descStyle}>Receive gentle reminders</div>
              </div>
              <button
                style={toggleStyle(settings.notifications)}
                onClick={() => setSettings(prev => prev ? {
                  ...prev,
                  notifications: !prev.notifications
                } : null)}
                aria-label={`${settings.notifications ? 'Disable' : 'Enable'} notifications`}
              >
                <div style={toggleKnobStyle(settings.notifications)} />
              </button>
            </div>
          </Card>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Sounds & Haptics</h2>
          <Card>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>Sound Effects</div>
                <div style={descStyle}>Play sounds for actions</div>
              </div>
              <button
                style={toggleStyle(settings.soundEnabled)}
                onClick={() => setSettings(prev => prev ? {
                  ...prev,
                  soundEnabled: !prev.soundEnabled
                } : null)}
                aria-label={`${settings.soundEnabled ? 'Disable' : 'Enable'} sounds`}
              >
                <div style={toggleKnobStyle(settings.soundEnabled)} />
              </button>
            </div>
            <div style={rowStyle}>
              <div>
                <div style={labelStyle}>Haptic Feedback</div>
                <div style={descStyle}>Vibration on interactions</div>
              </div>
              <button
                style={toggleStyle(settings.haptics)}
                onClick={() => setSettings(prev => prev ? {
                  ...prev,
                  haptics: !prev.haptics
                } : null)}
                aria-label={`${settings.haptics ? 'Disable' : 'Enable'} haptics`}
              >
                <div style={toggleKnobStyle(settings.haptics)} />
              </button>
            </div>
          </Card>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>AI Integration</h2>
          <Card>
            <Input
              label="Claude API Key"
              type="password"
              placeholder="sk-ant-..."
              value={settings.apiKey || ''}
              onChange={(value) => setSettings(prev => prev ? {
                ...prev,
                apiKey: value
              } : null)}
            />
            <p style={{ ...descStyle, marginTop: 'var(--space-sm)' }}>
              Required for AI chat features. Your key stays on your device.
            </p>
          </Card>
        </section>

        <Button variant="primary" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>

        <Card>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: 'var(--space-sm)' }}>BurnOut v0.3.0</p>
            <p style={{ fontSize: 'var(--text-xs)' }}>
              Work with your energy, not against it.
            </p>
          </div>
        </Card>
      </main>
    </AppLayout>
  )
}
