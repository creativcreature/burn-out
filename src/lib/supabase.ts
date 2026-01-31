/**
 * Supabase Client Configuration
 * 
 * Provides configured Supabase client for auth and data sync.
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Flag to check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create client (may be null if not configured)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// ============================================
// Database Types (match Supabase schema)
// ============================================

export interface DbTask {
  id: string
  user_id: string
  project_id?: string
  goal_id?: string
  category_id?: string
  verb_label: string
  task_body: string
  time_estimate: number
  feed_level: 'low' | 'medium' | 'high'
  scheduled_for?: string
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'anytime'
  status: 'pending' | 'in_progress' | 'completed' | 'deferred'
  deferred_until?: string
  created_at: string
  updated_at: string
  task_order: number
  deleted_at?: string // Soft delete for conflict resolution
  version: number // Optimistic concurrency control
}

export interface DbGoal {
  id: string
  user_id: string
  title: string
  description?: string
  timeframe: string
  target_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
  archived: boolean
  goal_order: number
  deleted_at?: string
  version: number
}

export interface DbProject {
  id: string
  user_id: string
  goal_id: string
  parent_project_id?: string
  title: string
  description?: string
  status: 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
  project_order: number
  deleted_at?: string
  version: number
}

export interface DbHabit {
  id: string
  user_id: string
  verb_label: string
  habit_body: string
  frequency: 'daily' | 'weekly' | 'custom'
  custom_days?: number[]
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime'
  feed_level: 'low' | 'medium' | 'high'
  goal_id?: string
  created_at: string
  last_completed?: string
  completion_count: number
  deleted_at?: string
  version: number
}

export interface DbJournalEntry {
  id: string
  user_id: string
  entry_date: string
  content: string
  mood?: 'struggling' | 'okay' | 'good' | 'great'
  created_at: string
  updated_at: string
  deleted_at?: string
  version: number
}

export interface DbSyncMetadata {
  user_id: string
  table_name: string
  last_synced_at: string
  last_server_version: number
}

// ============================================
// Auth Helpers
// ============================================

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signUp({ email, password })
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign in with magic link (email)
 */
export async function signInWithMagicLink(email: string) {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
}

/**
 * Sign out
 */
export async function signOut() {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signOut()
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  return supabase.auth.onAuthStateChange(callback)
}
