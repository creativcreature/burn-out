import { useState, useEffect, useRef, CSSProperties, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout, Header } from '../components/layout'
import { Card, Button } from '../components/shared'
import { useThemeContext } from '../components/shared/ThemeProvider'
import { useAppContext } from '../contexts/AppContext'
import { getData, updateData, seedSampleData } from '../utils/storage'
import { fileToDataUrl, compressImage, analyzeImageBrightness } from '../utils/imageAnalysis'
import type { Settings as SettingsType } from '../data/types'

export function SettingsPage() {
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useThemeContext()
  const { setIsOnboardingComplete } = useAppContext()
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [saved, setSaved] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getData().then(data => setSettings(data.settings))
  }, [])

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      // Convert to data URL
      const dataUrl = await fileToDataUrl(file)
      // Compress for storage
      const compressed = await compressImage(dataUrl, 800, 0.85)
      // Analyze brightness
      const brightness = await analyzeImageBrightness(compressed)

      setSettings(prev => prev ? {
        ...prev,
        cardBackgroundImage: compressed,
        cardBackgroundBrightness: brightness
      } : null)
    } catch (error) {
      console.error('Failed to process image:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setSettings(prev => prev ? {
      ...prev,
      cardBackgroundImage: undefined,
      cardBackgroundBrightness: undefined
    } : null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
    color: 'var(--text)'
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-sm) 0'
  }

  const labelStyle: CSSProperties = {
    color: 'var(--text)'
  }

  const descStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)'
  }

  const toggleStyle = (isActive: boolean): CSSProperties => ({
    width: 48,
    height: 28,
    borderRadius: 'var(--radius-full)',
    background: isActive ? 'var(--orb-orange)' : 'var(--bg-alt)',
    border: '1px solid var(--border)',
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

          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <div style={labelStyle}>Task Card Background</div>
                <div style={descStyle}>Upload an image for your task card background</div>
              </div>

              {settings?.cardBackgroundImage ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <div style={{
                    width: '100%',
                    height: 120,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={settings.cardBackgroundImage}
                      alt="Card background preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 'var(--space-xs)',
                      right: 'var(--space-xs)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: 'var(--text-xs)'
                    }}>
                      {settings.cardBackgroundBrightness === 'light' ? 'Light image' : 'Dark image'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="card-bg-upload"
                  />
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? 'Processing...' : 'Upload Image'}
                  </Button>
                </div>
              )}
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

        <Button variant="primary" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Data</h2>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <Button
                variant="secondary"
                fullWidth
                onClick={async () => {
                  if (confirm('Load sample data? This will replace your current data with demo content.')) {
                    await seedSampleData()
                    // Navigate to Now page to refresh all hooks with new data
                    navigate('/now')
                  }
                }}
              >
                Load Sample Data
              </Button>
              <p style={descStyle}>
                Populate the app with sample tasks, goals, and journal entries to explore features.
              </p>
            </div>
          </Card>
          <Card>
            <Button
              variant="secondary"
              fullWidth
              onClick={async () => {
                if (confirm('Reset onboarding? You will need to go through setup again.')) {
                  await updateData(data => ({
                    ...data,
                    onboarding: { completed: false, skippedSteps: [] }
                  }))
                  // Update app state to show onboarding
                  setIsOnboardingComplete(false)
                }
              }}
            >
              Reset Onboarding
            </Button>
          </Card>
        </section>

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
