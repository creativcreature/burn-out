/**
 * Authentication Hook
 * 
 * Manages user authentication state with Supabase.
 * Works offline-first - auth is optional for local-only usage.
 */

import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import {
  supabase,
  isSupabaseConfigured,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signInWithMagicLink as supabaseMagicLink,
  signOut as supabaseSignOut,
  onAuthStateChange
} from '../lib/supabase'
import { syncWithServer, getSyncStatus, type SyncResult } from '../lib/sync'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  error: string | null
}

interface SyncState {
  lastSynced: string | null
  pendingChanges: number
  isOnline: boolean
  isSyncing: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isConfigured: isSupabaseConfigured,
    error: null
  })

  const [syncState, setSyncState] = useState<SyncState>({
    lastSynced: null,
    pendingChanges: 0,
    isOnline: navigator.onLine,
    isSyncing: false
  })

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isConfigured: true,
        error: null
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        isLoading: false
      }))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Update sync status periodically
  useEffect(() => {
    const updateSyncStatus = async () => {
      const status = await getSyncStatus()
      setSyncState(prev => ({
        ...prev,
        lastSynced: status.lastSyncedAt,
        pendingChanges: status.queueLength,
        isOnline: status.isOnline
      }))
    }

    updateSyncStatus()
    const interval = setInterval(updateSyncStatus, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Listen for online/offline
  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setSyncState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setAuthState(prev => ({ ...prev, error: 'Supabase not configured' }))
      return { error: 'Supabase not configured' }
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    const { data, error } = await supabaseSignIn(email, password)

    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }))
      return { error: error.message }
    }

    setAuthState(prev => ({
      ...prev,
      user: data.user,
      session: data.session,
      isLoading: false,
      error: null
    }))

    // Trigger initial sync after login (delayed to avoid circular dep)
    if (data.session) {
      setTimeout(() => syncWithServer(), 100)
    }

    return { error: null }
  }, [])

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setAuthState(prev => ({ ...prev, error: 'Supabase not configured' }))
      return { error: 'Supabase not configured' }
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    const { data, error } = await supabaseSignUp(email, password)

    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }))
      return { error: error.message }
    }

    setAuthState(prev => ({
      ...prev,
      user: data.user,
      session: data.session,
      isLoading: false,
      error: null
    }))

    return { error: null }
  }, [])

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      setAuthState(prev => ({ ...prev, error: 'Supabase not configured' }))
      return { error: 'Supabase not configured' }
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    const { error } = await supabaseMagicLink(email)

    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }))
      return { error: error.message }
    }

    setAuthState(prev => ({ ...prev, isLoading: false, error: null }))
    return { error: null, message: 'Check your email for the magic link!' }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return

    await supabaseSignOut()
    setAuthState(prev => ({
      ...prev,
      user: null,
      session: null,
      error: null
    }))
  }, [])

  // Manual sync trigger
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!authState.user) {
      return { success: false, error: 'Not authenticated', pulled: 0, pushed: 0, conflicts: 0 }
    }

    setSyncState(prev => ({ ...prev, isSyncing: true }))

    const result = await syncWithServer()

    const status = await getSyncStatus()
    setSyncState({
      lastSynced: status.lastSyncedAt,
      pendingChanges: status.queueLength,
      isOnline: status.isOnline,
      isSyncing: false
    })

    return result
  }, [authState.user])

  return {
    // Auth state
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isConfigured: authState.isConfigured,
    isAuthenticated: !!authState.user,
    error: authState.error,

    // Auth actions
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,

    // Sync state
    syncState,
    sync
  }
}
