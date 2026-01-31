# Code Templates for Weekly Reflection Summary

Use these templates as starting points for implementation. Adapt as needed to match existing code style.

---

## 1. Type Definition (src/data/types.ts)

### Add this interface:

```typescript
export interface WeeklySummary {
  id: string
  weekStartDate: string                          // YYYY-MM-DD (Monday of week)
  completedTaskCount: number
  lowEnergyTaskCount: number
  mediumEnergyTaskCount: number
  highEnergyTaskCount: number
  timePerVerbLabel: Record<string, number>       // e.g. { "Deep Work": 120, "Quick Win": 45 }
  moodBreakdown: Record<string, number>          // e.g. { "good": 3, "great": 1 }
  aiInsight: string
  generatedAt: string
  userEnergyPattern?: string
}
```

### Update BurnOutData interface:

Add this field to the BurnOutData interface:
```typescript
export interface BurnOutData {
  // ... existing fields ...
  weeklySummaries: WeeklySummary[]
}
```

---

## 2. Storage Helpers (src/utils/storage.ts)

### Add these helper functions:

```typescript
// Get data from last 7 days
export async function getLastWeekData(): Promise<{
  completedTasks: CompletedTask[]
  journalEntries: JournalEntry[]
}> {
  const data = await getData()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const completedTasks = data.completedTasks.filter(task => {
    const taskDate = new Date(task.completedAt)
    return taskDate >= sevenDaysAgo
  })

  const journalEntries = data.journalEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate >= sevenDaysAgo
  })

  return { completedTasks, journalEntries }
}

// Get this week's summary (Monday-based)
export async function getWeeklySummary(): Promise<WeeklySummary | null> {
  const data = await getData()
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  const weekStartDate = monday.toISOString().split('T')[0]

  return data.weeklySummaries.find(s => s.weekStartDate === weekStartDate) || null
}

// Save a new weekly summary
export async function saveWeeklySummary(summary: WeeklySummary): Promise<void> {
  await updateData(data => {
    // Remove old summary for same week if exists
    const filtered = data.weeklySummaries.filter(s => s.weekStartDate !== summary.weekStartDate)
    return {
      ...data,
      weeklySummaries: [...filtered, summary]
    }
  })
}
```

---

## 3. AI Integration (src/utils/ai.ts)

### Add this helper interface and function:

```typescript
interface WeeklyData {
  taskCount: number
  lowEnergyCount: number
  mediumEnergyCount: number
  highEnergyCount: number
  timeBreakdown: Record<string, number>
  moodBreakdown: Record<string, number>
}

export async function generateWeeklySummary(
  weekData: WeeklyData,
  config: AIConfig
): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

  if (!apiKey) {
    return "I'd love to generate insights, but I need an API key. Please add VITE_GOOGLE_API_KEY to your .env file."
  }

  // Format time breakdown for readability
  const timeBreakdownText = Object.entries(weekData.timeBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([label, minutes]) => `${label}: ${minutes} min`)
    .join(' | ')

  // Format mood breakdown
  const moodBreakdownText = Object.entries(weekData.moodBreakdown)
    .map(([mood, count]) => `${mood}: ${count}`)
    .join(', ')

  const systemPrompt = `You are a supportive wellness coach analyzing weekly productivity for BurnOut, an app for neurodivergent users.

${getToneInstruction(config.tonePreference)}
${getModeInstruction(config.burnoutMode)}

IMPORTANT GUIDELINES:
- Be affirming and encouraging about their accomplishments
- Never use gamification language (no "streak", "achievement", "badge", or "level" language)
- Focus on energy patterns and sustainable practices
- Keep response to 2-3 sentences
- Be concise and warm`

  const userMessage = `This week, the user completed ${weekData.taskCount} tasks.

Energy breakdown: High ${weekData.highEnergyCount} | Medium ${weekData.mediumEnergyCount} | Low ${weekData.lowEnergyCount}

Time spent: ${timeBreakdownText}

Mood entries: ${moodBreakdownText}

Provide 2-3 sentences reflecting on their week. Focus on:
1. What they accomplished
2. Energy patterns you notice
3. One supportive observation

No gamification language.`

  const geminiMessages = [
    {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nAnalyze this week: ${userMessage}` }]
    }
  ]

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512
          }
        })
      }
    )

    if (!response.ok) {
      console.error('Gemini API Error')
      return 'Unable to generate insights right now. Please try again in a moment.'
    }

    const data = await response.json()
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return insight.trim()
  } catch (error) {
    console.error('AI Error:', error)
    return 'Something went wrong generating insights. Please try again.'
  }
}
```

---

## 4. Custom Hook (src/hooks/useWeeklySummary.ts)

### Create new file:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { getData } from '../utils/storage'
import { getLastWeekData, getWeeklySummary, saveWeeklySummary } from '../utils/storage'
import { generateWeeklySummary } from '../utils/ai'
import type { CompletedTask, JournalEntry, WeeklySummary } from '../data/types'

export function useWeeklySummary() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load cached summary on mount
  useEffect(() => {
    async function loadSummary() {
      try {
        const cached = await getWeeklySummary()
        setSummary(cached)
      } catch (err) {
        console.error('Failed to load summary:', err)
        setError(err instanceof Error ? err : new Error('Failed to load summary'))
      }
    }
    loadSummary()
  }, [])

  const calculateMetrics = (
    completedTasks: CompletedTask[],
    journalEntries: JournalEntry[]
  ) => {
    const timePerVerbLabel: Record<string, number> = {}
    let lowEnergyCount = 0
    let mediumEnergyCount = 0
    let highEnergyCount = 0

    // Aggregate time by verb label - need to fetch task data
    // For now, count by feedLevel approximation
    completedTasks.forEach(ct => {
      // This is a simplified version - in real impl, would fetch task details
      const duration = ct.duration || 0
      if (!timePerVerbLabel['Activities']) {
        timePerVerbLabel['Activities'] = 0
      }
      timePerVerbLabel['Activities'] += duration
    })

    const moodBreakdown: Record<string, number> = {}
    journalEntries.forEach(entry => {
      const mood = entry.mood || 'unspecified'
      moodBreakdown[mood] = (moodBreakdown[mood] || 0) + 1
    })

    // This is simplified - real implementation would use task.feedLevel
    const taskCount = completedTasks.length
    const estimatedEnergySplit = Math.ceil(taskCount / 3)
    lowEnergyCount = estimatedEnergySplit
    mediumEnergyCount = estimatedEnergySplit
    highEnergyCount = taskCount - lowEnergyCount - mediumEnergyCount

    return {
      taskCount,
      lowEnergyCount,
      mediumEnergyCount,
      highEnergyCount,
      timePerVerbLabel,
      moodBreakdown
    }
  }

  const generateSummary = useCallback(async (): Promise<WeeklySummary | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getData()
      const { completedTasks, journalEntries } = await getLastWeekData()

      if (completedTasks.length === 0) {
        setIsLoading(false)
        return null
      }

      const metrics = calculateMetrics(completedTasks, journalEntries)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(now.setDate(diff))
      const weekStartDate = monday.toISOString().split('T')[0]

      const insight = await generateWeeklySummary(
        {
          taskCount: metrics.taskCount,
          lowEnergyCount: metrics.lowEnergyCount,
          mediumEnergyCount: metrics.mediumEnergyCount,
          highEnergyCount: metrics.highEnergyCount,
          timeBreakdown: metrics.timePerVerbLabel,
          moodBreakdown: metrics.moodBreakdown
        },
        {
          burnoutMode: data.user.burnoutMode,
          tonePreference: data.user.tonePreference
        }
      )

      const newSummary: WeeklySummary = {
        id: crypto.randomUUID(),
        weekStartDate,
        completedTaskCount: metrics.taskCount,
        lowEnergyTaskCount: metrics.lowEnergyCount,
        mediumEnergyTaskCount: metrics.mediumEnergyCount,
        highEnergyTaskCount: metrics.highEnergyCount,
        timePerVerbLabel: metrics.timePerVerbLabel,
        moodBreakdown: metrics.moodBreakdown,
        aiInsight: insight,
        generatedAt: new Date().toISOString()
      }

      await saveWeeklySummary(newSummary)
      setSummary(newSummary)
      return newSummary
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate summary')
      setError(error)
      console.error('Generate summary error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshSummary = useCallback(async (): Promise<void> => {
    await generateSummary()
  }, [generateSummary])

  return {
    summary,
    isLoading,
    error,
    generateSummary,
    refreshSummary
  }
}
```

---

## 5. UI Component (src/components/reflections/WeeklySummaryCard.tsx)

### Create new file:

```typescript
import { CSSProperties } from 'react'
import { Card } from '../shared'
import { Button } from '../shared'
import type { WeeklySummary } from '../../data/types'

interface WeeklySummaryCardProps {
  summary: WeeklySummary | null
  isLoading: boolean
  error: Error | null
  onRefresh: () => void
}

export function WeeklySummaryCard({
  summary,
  isLoading,
  error,
  onRefresh
}: WeeklySummaryCardProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 'var(--space-sm)'
  }

  const metricsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--space-sm)',
    marginBottom: 'var(--space-md)'
  }

  const metricStyle: CSSProperties = {
    padding: 'var(--space-md)',
    textAlign: 'center'
  }

  const metricLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    marginBottom: 'var(--space-xs)'
  }

  const metricValueStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    color: 'var(--orb-orange)'
  }

  const insightContainerStyle: CSSProperties = {
    padding: 'var(--space-md)'
  }

  const insightLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 'var(--space-sm)'
  }

  const insightTextStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    lineHeight: '1.6',
    color: 'var(--text)',
    marginBottom: 'var(--space-md)'
  }

  const buttonContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end'
  }

  const errorStyle: CSSProperties = {
    padding: 'var(--space-md)',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)',
    fontStyle: 'italic'
  }

  const loadingStyle: CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-lg)',
    color: 'var(--text-muted)'
  }

  if (isLoading && !summary) {
    return (
      <Card>
        <div style={loadingStyle}>
          <p>Generating insights...</p>
        </div>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>This Week's Summary</h2>

      <Card>
        {/* Metrics Grid */}
        <div style={metricsGridStyle}>
          <div style={metricStyle}>
            <div style={metricLabelStyle}>Tasks Completed</div>
            <div style={metricValueStyle}>{summary.completedTaskCount}</div>
          </div>
          <div style={metricStyle}>
            <div style={metricLabelStyle}>High Energy</div>
            <div style={metricValueStyle}>{summary.highEnergyTaskCount}</div>
          </div>
          <div style={metricStyle}>
            <div style={metricLabelStyle}>Medium Energy</div>
            <div style={metricValueStyle}>{summary.mediumEnergyTaskCount}</div>
          </div>
          <div style={metricStyle}>
            <div style={metricLabelStyle}>Low Energy</div>
            <div style={metricValueStyle}>{summary.lowEnergyTaskCount}</div>
          </div>
        </div>

        {/* Mood Breakdown */}
        {Object.keys(summary.moodBreakdown).length > 0 && (
          <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
            <div style={metricLabelStyle}>Mood This Week</div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
              {Object.entries(summary.moodBreakdown)
                .map(([mood, count]) => `${mood}: ${count}`)
                .join(' • ')}
            </p>
          </div>
        )}
      </Card>

      {/* AI Insight */}
      <Card>
        <div style={insightContainerStyle}>
          <div style={insightLabelStyle}>Weekly Insight</div>
          {error ? (
            <div style={errorStyle}>
              {error.message || 'Unable to generate insight. Please try again.'}
            </div>
          ) : (
            <p style={insightTextStyle}>{summary.aiInsight}</p>
          )}
          <div style={buttonContainerStyle}>
            <Button onClick={onRefresh} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Refresh Insights'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
```

---

## 6. Integration into Reflections Page (src/pages/Reflections.tsx)

### Update imports:

```typescript
import { useWeeklySummary } from '../hooks/useWeeklySummary'
import { WeeklySummaryCard } from '../components/reflections/WeeklySummaryCard'
```

### Add inside ReflectionsPage function, after Header:

```typescript
const { summary, isLoading, error, refreshSummary } = useWeeklySummary()

// Generate summary on mount if not cached
useEffect(() => {
  if (!summary && !isLoading) {
    // Optionally auto-generate on first load
    // Uncomment next line if desired:
    // generateSummary()
  }
}, [])
```

### Add new section in JSX:

```typescript
{/* NEW: Weekly Summary Section */}
{summary || (!summary && !isLoading) && (
  <section>
    <WeeklySummaryCard
      summary={summary}
      isLoading={isLoading}
      error={error}
      onRefresh={refreshSummary}
    />
  </section>
)}
```

---

## 7. Sample Data Update (src/utils/storage.ts)

### Add to createSampleData() return:

```typescript
weeklySummaries: [
  {
    id: crypto.randomUUID(),
    weekStartDate: daysAgo(7).split('T')[0],
    completedTaskCount: 12,
    lowEnergyTaskCount: 4,
    mediumEnergyTaskCount: 5,
    highEnergyTaskCount: 3,
    timePerVerbLabel: {
      'Deep Work': 120,
      'Quick Win': 45,
      'Review': 30,
      'Plan': 15
    },
    moodBreakdown: {
      'great': 1,
      'good': 3,
      'okay': 2,
      'struggling': 1
    },
    aiInsight: 'This week you balanced deep creative work with manageable tasks. Your mornings showed strong focus energy—consider protecting that time in the future. Take pride in maintaining consistency while honoring your rest days.',
    generatedAt: daysAgo(6)
  }
]
```

---

## Implementation Checklist

- [ ] Add WeeklySummary type to types.ts
- [ ] Update BurnOutData interface in types.ts
- [ ] Add storage helper functions to storage.ts
- [ ] Add generateWeeklySummary to ai.ts
- [ ] Create useWeeklySummary.ts hook
- [ ] Create WeeklySummaryCard.tsx component
- [ ] Update Reflections.tsx to use new component
- [ ] Add sample data to storage.ts
- [ ] Run `npm run typecheck` - should pass
- [ ] Run `npm run lint` - should pass
- [ ] Manual testing on Reflections page
- [ ] Test with different burnout modes
- [ ] Test API failure handling
- [ ] Test refresh button

---

## Common Modifications

### To adjust the AI prompt tone:
Edit `generateWeeklySummary()` in ai.ts - modify the systemPrompt

### To change metric calculations:
Edit `calculateMetrics()` in useWeeklySummary.ts

### To change card layout:
Edit styles in WeeklySummaryCard.tsx component

### To auto-generate summary on first load:
Uncomment the `generateSummary()` call in useEffect in Reflections.tsx

### To show summary even with 0 tasks:
Change `if (completedTasks.length === 0)` condition in generateSummary()
