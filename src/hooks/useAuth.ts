// Thin wrapper over Supabase Auth.
// Subscribes to session changes and exposes sign-in / sign-out helpers.
// The app keeps working without login — useAuth just returns user=null in that case.

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Read the current session on mount (covers page reloads with a valid token)
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    })

    // React to subsequent sign-in / sign-out events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    // After Google redirects back to our domain, Supabase finishes the OAuth
    // exchange and lands the user back on /perfil.
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/perfil' },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, isLoading, signInWithGoogle, signOut }
}
