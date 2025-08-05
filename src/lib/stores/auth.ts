import { writable } from 'svelte/store'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '$lib/supabase/client'
import { goto } from '$app/navigation'
import { browser } from '$app/environment'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  const supabase = browser ? createClient() : null

  return {
    subscribe,
    
    async initialize() {
      if (!browser || !supabase) return
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        set({
          user: session?.user ?? null,
          session,
          loading: false
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          set({
            user: session?.user ?? null,
            session,
            loading: false
          })
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('Auth initialization error:', error)
        set({ user: null, session: null, loading: false })
      }
    },

    async signUp(email: string, password: string, username?: string, accountType?: 'personal' | 'brand', brandName?: string) {
      if (!supabase) throw new Error('Supabase client not initialized')
      
      update(s => ({ ...s, loading: true }))
      
      try {
        const metadata: any = { username }
        if (accountType) metadata.account_type = accountType
        if (brandName) metadata.brand_name = brandName

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        })

        if (error) throw error

        if (data.user && (username || accountType || brandName)) {
          const profileUpdates: any = {}
          if (username) profileUpdates.username = username
          if (accountType) profileUpdates.account_type = accountType
          if (brandName) profileUpdates.brand_name = brandName

          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', data.user.id)

          if (profileError) console.error('Profile update error:', profileError)
        }

        return { data, error: null }
      } catch (error) {
        console.error('Sign up error:', error)
        return { data: null, error }
      } finally {
        update(s => ({ ...s, loading: false }))
      }
    },

    async signIn(email: string, password: string) {
      if (!supabase) throw new Error('Supabase client not initialized')
      
      update(s => ({ ...s, loading: true }))
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        return { data, error: null }
      } catch (error) {
        console.error('Sign in error:', error)
        return { data: null, error }
      } finally {
        update(s => ({ ...s, loading: false }))
      }
    },

    async signOut() {
      if (!supabase) throw new Error('Supabase client not initialized')
      
      update(s => ({ ...s, loading: true }))
      
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        await goto('/')
        return { error: null }
      } catch (error) {
        console.error('Sign out error:', error)
        return { error }
      } finally {
        update(s => ({ ...s, loading: false }))
      }
    },

    async updateProfile(updates: { username?: string; full_name?: string; phone?: string; address?: any }) {
      if (!supabase) throw new Error('Supabase client not initialized')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}

export const auth = createAuthStore()