// Dual-source favorites hook.
// - Logged out: reads/writes localStorage (`praia_azul_favoritas`)
// - Logged in:  reads/writes Supabase `user_favoritas`
// On first sign-in, localStorage favorites are merged into Supabase
// (union — we never delete a remote favorite during migration).
// On sign-out, localStorage is preserved so the user can keep using offline mode.

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const CHAVE = 'praia_azul_favoritas'

function lerLocal(): number[] {
  try {
    const raw = localStorage.getItem(CHAVE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function gravarLocal(ids: number[]) {
  localStorage.setItem(CHAVE, JSON.stringify(ids))
}

export function useFavoritas() {
  const { user } = useAuth()
  const [favoritas, setFavoritas] = useState<number[]>(lerLocal)
  const migratedRef = useRef(false)

  useEffect(() => {
    if (!user) {
      setFavoritas(lerLocal())
      migratedRef.current = false
      return
    }

    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('user_favoritas')
        .select('praia_id')
        .eq('user_id', user.id)
      if (cancelled) return

      const remoteIds = (data ?? []).map(r => r.praia_id as number)

      if (!migratedRef.current) {
        // First sign-in this session: union local + remote, push any new locals up
        migratedRef.current = true
        const local = lerLocal()
        const union = Array.from(new Set([...remoteIds, ...local]))
        const novosLocais = local.filter(id => !remoteIds.includes(id))
        if (novosLocais.length > 0) {
          await supabase.from('user_favoritas').upsert(
            novosLocais.map(praia_id => ({ user_id: user.id, praia_id })),
            { onConflict: 'user_id,praia_id' },
          )
        }
        setFavoritas(union)
      } else {
        setFavoritas(remoteIds)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  async function toggleFavorita(id: number) {
    const isCurrentlyFav = favoritas.includes(id)
    const next = isCurrentlyFav ? favoritas.filter(f => f !== id) : [...favoritas, id]
    setFavoritas(next)

    if (user) {
      if (isCurrentlyFav) {
        await supabase
          .from('user_favoritas')
          .delete()
          .eq('user_id', user.id)
          .eq('praia_id', id)
      } else {
        await supabase
          .from('user_favoritas')
          .upsert({ user_id: user.id, praia_id: id }, { onConflict: 'user_id,praia_id' })
      }
    } else {
      gravarLocal(next)
    }
  }

  return {
    favoritas,
    isFavorita: (id: number) => favoritas.includes(id),
    toggleFavorita,
  }
}
