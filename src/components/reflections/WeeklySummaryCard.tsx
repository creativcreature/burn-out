import { CSSProperties } from 'react'
import type { WeeklySummary } from '../../data/types'
import { Button } from '../shared/Button'

interface WeeklySummaryCardProps {
  summary: WeeklySummary | null
  loading: boolean
  error: string | null
  hasRecentData: boolean
  onRefresh: () => void
}

export function WeeklySummaryCard({ 
  summary, 
  loading, 
  error, 
  hasRecentData, 
  onRefresh 
}: WeeklySummaryCardProps) {
  
  const cardStyle: CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-lg)',
    marginBottom: 'var(--space-lg)'
  }

  const statsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 'var(--space-md)',
    marginBottom: 'var(--space-lg)'
  }

  const insightStyle: CSSProperties = {
    background: 'linear-gradient(135deg, var(--orb-orange), var(--orb-red))',
    color: 'white',
    padding: 'var(--space-lg)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-base)',
    lineHeight: 1.6,
    marginBottom: 'var(--space-md)'
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-lg)'
  }

  const titleStyle: CSSProperties = {
    fontSize: 'var(--text-xl)',
    fontWeight: 600,
    color: 'var(--text)'
  }

  const emptyStateStyle: CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-xl)',
    color: 'var(--text-muted)'
  }

  // Show loading state
  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Weekly Insights</h3>
        </div>
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <div style={{ color: 'var(--text-muted)' }}>Generating insights...</div>
        </div>
      </div>
    )
  }

  // Show empty state if no recent data
  if (!hasRecentData) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Weekly Insights</h3>
        </div>
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>
            Complete some tasks this week
          </div>
          <div style={{ fontSize: 'var(--text-sm)' }}>
            Your weekly insights will appear here after you finish a few tasks
          </div>
        </div>
      </div>
    )
  }

  // Show error state with stats if available
  if (error) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Weekly Insights</h3>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onRefresh}
          >
            Retry
          </Button>
        </div>
        {summary && (
          <div style={statsGridStyle}>
            <StatCard value={summary.completedTaskCount} label="Tasks Done" />
            <StatCard value={summary.lowEnergyTaskCount} label="Low Energy" />
            <StatCard value={summary.mediumEnergyTaskCount} label="Medium Energy" />
            <StatCard value={summary.highEnergyTaskCount} label="High Energy" />
          </div>
        )}
        <div style={{ 
          background: 'var(--bg-error)', 
          color: 'var(--text-error)', 
          padding: 'var(--space-md)', 
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)'
        }}>
          Unable to generate AI insights right now. {error}
        </div>
      </div>
    )
  }

  // Show full summary
  if (!summary) {
    return null
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Weekly Insights</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Grid */}
      <div style={statsGridStyle}>
        <StatCard value={summary.completedTaskCount} label="Tasks Done" />
        <StatCard value={summary.lowEnergyTaskCount} label="Low Energy" />
        <StatCard value={summary.mediumEnergyTaskCount} label="Medium Energy" />
        <StatCard value={summary.highEnergyTaskCount} label="High Energy" />
      </div>

      {/* Verb Label Breakdown */}
      {Object.keys(summary.timePerVerbLabel).length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h4 style={{ 
            fontSize: 'var(--text-sm)', 
            fontWeight: 600, 
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Time Spent
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            {Object.entries(summary.timePerVerbLabel)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([label, minutes]) => (
                <span
                  key={label}
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {label}: {minutes}m
                </span>
              ))}
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div style={insightStyle}>
        {summary.aiInsight}
      </div>

      <div style={{ 
        fontSize: 'var(--text-xs)', 
        color: 'var(--text-subtle)',
        textAlign: 'center'
      }}>
        Generated {new Date(summary.generatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}

// Helper component for individual stats
function StatCard({ value, label }: { value: number; label: string }) {
  const statCardStyle: CSSProperties = {
    background: 'var(--bg-elevated)',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center'
  }

  const statValueStyle: CSSProperties = {
    fontSize: 'var(--text-2xl)',
    fontWeight: 600,
    color: 'var(--orb-orange)',
    display: 'block',
    marginBottom: 'var(--space-xs)'
  }

  const statLabelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  }

  return (
    <div style={statCardStyle}>
      <span style={statValueStyle}>{value}</span>
      <span style={statLabelStyle}>{label}</span>
    </div>
  )
}
