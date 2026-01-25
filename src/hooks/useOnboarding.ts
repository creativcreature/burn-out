import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import type { OnboardingData, BurnoutMode, TonePreference, EnergyLevel } from '../data/types'

export interface OnboardingState {
  step: number
  burnoutMode: BurnoutMode
  tonePreference: TonePreference
  energyDefaults: {
    morning: EnergyLevel
    afternoon: EnergyLevel
    evening: EnergyLevel
  }
}

const TOTAL_STEPS = 4

export function useOnboarding() {
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    burnoutMode: 'balanced',
    tonePreference: 'gentle',
    energyDefaults: { morning: 3, afternoon: 3, evening: 2 }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOnboarding() {
      try {
        const data = await getData()
        setOnboarding(data.onboarding)
        if (data.user) {
          setState(prev => ({
            ...prev,
            burnoutMode: data.user.burnoutMode,
            tonePreference: data.user.tonePreference,
            energyDefaults: data.user.energyDefaults
          }))
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadOnboarding()
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.min(prev.step + 1, TOTAL_STEPS)
    }))
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.max(prev.step - 1, 1)
    }))
  }, [])

  const setBurnoutMode = useCallback((mode: BurnoutMode) => {
    setState(prev => ({ ...prev, burnoutMode: mode }))
  }, [])

  const setTonePreference = useCallback((tone: TonePreference) => {
    setState(prev => ({ ...prev, tonePreference: tone }))
  }, [])

  const setEnergyDefaults = useCallback((energy: OnboardingState['energyDefaults']) => {
    setState(prev => ({ ...prev, energyDefaults: energy }))
  }, [])

  const completeOnboarding = useCallback(async () => {
    const now = new Date().toISOString()

    await updateData(data => ({
      ...data,
      onboarding: {
        completed: true,
        completedAt: now,
        skippedSteps: []
      },
      user: {
        ...data.user,
        burnoutMode: state.burnoutMode,
        tonePreference: state.tonePreference,
        energyDefaults: state.energyDefaults
      }
    }))

    // Reload to trigger App re-initialization
    window.location.reload()
  }, [state])

  const skipOnboarding = useCallback(async () => {
    const now = new Date().toISOString()

    await updateData(data => ({
      ...data,
      onboarding: {
        completed: true,
        completedAt: now,
        skippedSteps: ['all']
      }
    }))

    // Reload to trigger App re-initialization
    window.location.reload()
  }, [])

  return {
    isCompleted: onboarding?.completed ?? false,
    isLoading,
    state,
    totalSteps: TOTAL_STEPS,
    nextStep,
    prevStep,
    setBurnoutMode,
    setTonePreference,
    setEnergyDefaults,
    completeOnboarding,
    skipOnboarding
  }
}
