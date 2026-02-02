import { useState, useEffect, useMemo } from 'react'

export type TimeOfDayPeriod = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'lateNight'

interface TimeOfDayColors {
  primary: string
  secondary: string
  tertiary: string
  glow: string
  glowOpacity: number
}

// Color palettes for each time period
const TIME_COLORS: Record<TimeOfDayPeriod, TimeOfDayColors> = {
  dawn: {
    // 5am-7am: Soft pink/peach awakening
    primary: '#FF9A8B',
    secondary: '#FF6B6B',
    tertiary: '#FFA07A',
    glow: 'rgba(255, 154, 139, 0.3)',
    glowOpacity: 0.25
  },
  morning: {
    // 7am-11am: Warm orange/gold energy
    primary: '#FF7B00',
    secondary: '#FF4500',
    tertiary: '#FFB347',
    glow: 'rgba(255, 123, 0, 0.35)',
    glowOpacity: 0.35
  },
  midday: {
    // 11am-2pm: Bright, vibrant orange/red
    primary: '#FF4500',
    secondary: '#FF2200',
    tertiary: '#FF6B35',
    glow: 'rgba(255, 69, 0, 0.4)',
    glowOpacity: 0.4
  },
  afternoon: {
    // 2pm-5pm: Warm amber, slightly mellowing
    primary: '#FF6B35',
    secondary: '#FF4500',
    tertiary: '#FFA500',
    glow: 'rgba(255, 107, 53, 0.35)',
    glowOpacity: 0.35
  },
  dusk: {
    // 5pm-7pm: Golden hour, pink/purple hints
    primary: '#FF6B6B',
    secondary: '#E84393',
    tertiary: '#FF9F43',
    glow: 'rgba(232, 67, 147, 0.3)',
    glowOpacity: 0.3
  },
  evening: {
    // 7pm-10pm: Deep purple/magenta
    primary: '#E84393',
    secondary: '#9B59B6',
    tertiary: '#FF6B6B',
    glow: 'rgba(155, 89, 182, 0.3)',
    glowOpacity: 0.28
  },
  night: {
    // 10pm-1am: Deep blue/purple, calming
    primary: '#6C5CE7',
    secondary: '#5B48D9',
    tertiary: '#9B59B6',
    glow: 'rgba(108, 92, 231, 0.25)',
    glowOpacity: 0.22
  },
  lateNight: {
    // 1am-5am: Very soft, muted deep blues
    primary: '#5B48D9',
    secondary: '#4A3FC7',
    tertiary: '#7C6DD9',
    glow: 'rgba(91, 72, 217, 0.2)',
    glowOpacity: 0.18
  }
}

// Get the period for a given hour
function getPeriodForHour(hour: number): TimeOfDayPeriod {
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'midday'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 19) return 'dusk'
  if (hour >= 19 && hour < 22) return 'evening'
  if (hour >= 22 || hour < 1) return 'night'
  return 'lateNight' // 1am-5am
}

// Get next period for transitions
function getNextPeriod(period: TimeOfDayPeriod): TimeOfDayPeriod {
  const order: TimeOfDayPeriod[] = ['lateNight', 'dawn', 'morning', 'midday', 'afternoon', 'dusk', 'evening', 'night']
  const idx = order.indexOf(period)
  return order[(idx + 1) % order.length]
}

// Interpolate between two colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Parse hex colors
  const c1 = {
    r: parseInt(color1.slice(1, 3), 16),
    g: parseInt(color1.slice(3, 5), 16),
    b: parseInt(color1.slice(5, 7), 16)
  }
  const c2 = {
    r: parseInt(color2.slice(1, 3), 16),
    g: parseInt(color2.slice(3, 5), 16),
    b: parseInt(color2.slice(5, 7), 16)
  }

  const r = Math.round(c1.r + (c2.r - c1.r) * factor)
  const g = Math.round(c1.g + (c2.g - c1.g) * factor)
  const b = Math.round(c1.b + (c2.b - c1.b) * factor)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Calculate transition progress within a period
function getTransitionProgress(hour: number, minute: number): number {
  // Create smooth transitions at period boundaries
  // Returns 0-1 representing how far into transitioning to next period
  const periodStarts: Record<TimeOfDayPeriod, number> = {
    lateNight: 1,
    dawn: 5,
    morning: 7,
    midday: 11,
    afternoon: 14,
    dusk: 17,
    evening: 19,
    night: 22
  }

  const currentPeriod = getPeriodForHour(hour)
  const nextPeriod = getNextPeriod(currentPeriod)
  const periodStart = periodStarts[currentPeriod]
  const nextPeriodStart = periodStarts[nextPeriod]

  // Handle wrap-around at midnight
  let periodLength: number
  if (nextPeriodStart < periodStart) {
    periodLength = (24 - periodStart) + nextPeriodStart
  } else {
    periodLength = nextPeriodStart - periodStart
  }

  // How far into this period are we?
  let hoursIntoPeriod: number
  if (hour < periodStart && currentPeriod !== 'night') {
    hoursIntoPeriod = (24 - periodStart) + hour + (minute / 60)
  } else {
    hoursIntoPeriod = (hour - periodStart) + (minute / 60)
  }

  // Start blending 30 mins before period ends
  const blendStartHours = periodLength - 0.5
  if (hoursIntoPeriod >= blendStartHours) {
    return (hoursIntoPeriod - blendStartHours) / 0.5
  }

  return 0
}

export interface UseTimeOfDayReturn {
  period: TimeOfDayPeriod
  colors: TimeOfDayColors
  gradient: string
  boxShadow: string
  isTransitioning: boolean
}

export function useTimeOfDay(): UseTimeOfDayReturn {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const result = useMemo(() => {
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()

    const currentPeriod = getPeriodForHour(hour)
    const nextPeriod = getNextPeriod(currentPeriod)
    const transitionProgress = getTransitionProgress(hour, minute)

    const currentColors = TIME_COLORS[currentPeriod]
    const nextColors = TIME_COLORS[nextPeriod]

    // Interpolate colors if transitioning
    let colors: TimeOfDayColors
    if (transitionProgress > 0) {
      colors = {
        primary: interpolateColor(currentColors.primary, nextColors.primary, transitionProgress),
        secondary: interpolateColor(currentColors.secondary, nextColors.secondary, transitionProgress),
        tertiary: interpolateColor(currentColors.tertiary, nextColors.tertiary, transitionProgress),
        glow: nextColors.glow, // Use target glow
        glowOpacity: currentColors.glowOpacity + (nextColors.glowOpacity - currentColors.glowOpacity) * transitionProgress
      }
    } else {
      colors = currentColors
    }

    // Build gradient
    const gradient = `radial-gradient(
      circle at 35% 35%,
      ${colors.primary} 0%,
      ${colors.secondary} 40%,
      ${colors.tertiary} 80%,
      ${interpolateColor(colors.tertiary, colors.secondary, 0.5)} 100%
    )`

    // Build box shadow
    const boxShadow = `0 0 120px 60px ${colors.glow}`

    return {
      period: currentPeriod,
      colors,
      gradient,
      boxShadow,
      isTransitioning: transitionProgress > 0
    }
  }, [currentTime])

  return result
}
