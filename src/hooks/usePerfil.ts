// Dual-source profile hook.
// - Logged out: reads/writes localStorage (`mare_alta_perfil`)
// - Logged in:  reads/writes Supabase `user_profiles`
// On first sign-in, the localStorage profile is migrated into Supabase
// (only if no remote row exists yet — never overwrites cloud data).

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { PerfilUtilizador } from '../types'

const CHAVE = 'mare_alta_perfil'
const PADRAO: PerfilUtilizador = {
  tipo: 'familia',
  localizacao: null,
  municipio: null,
  distancia_maxima: null,
}

function lerLocal(): PerfilUtilizador {
  try {
    const raw = localStorage.getItem(CHAVE)
    return raw ? { ...PADRAO, ...JSON.parse(raw) } : PADRAO
  } catch {
    return PADRAO
  }
}

function gravarLocal(p: PerfilUtilizador) {
  localStorage.setItem(CHAVE, JSON.stringify(p))
}

// Supabase row → app shape
type PerfilRow = {
  tipo: string | null
  localizacao_lat: number | null
  localizacao_lng: number | null
  municipio: string | null
  distancia_maxima: number | null
}

function fromRow(row: PerfilRow): PerfilUtilizador {
  return {
    tipo: (row.tipo as PerfilUtilizador['tipo']) ?? null,
    localizacao:
      row.localizacao_lat != null && row.localizacao_lng != null
        ? { lat: row.localizacao_lat, lng: row.localizacao_lng }
        : null,
    municipio: row.municipio,
    distancia_maxima: (row.distancia_maxima as PerfilUtilizador['distancia_maxima']) ?? null,
  }
}

// app shape → Supabase row (excluding user_id, which the caller adds)
function toRow(p: PerfilUtilizador) {
  return {
    tipo: p.tipo,
    localizacao_lat: p.localizacao?.lat ?? null,
    localizacao_lng: p.localizacao?.lng ?? null,
    municipio: p.municipio,
    distancia_maxima: p.distancia_maxima,
  }
}

export function usePerfil() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState<PerfilUtilizador>(lerLocal)
  const migratedRef = useRef(false)

  // Re-source the profile whenever auth state flips.
  useEffect(() => {
    if (!user) {
      setPerfil(lerLocal())
      migratedRef.current = false
      return
    }

    let cancelled = false
    ;(async () => {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('tipo, localizacao_lat, localizacao_lng, municipio, distancia_maxima')
        .eq('user_id', user.id)
        .maybeSingle()
      if (cancelled) return

      if (!existing && !migratedRef.current) {
        // First sign-in: push localStorage profile up to Supabase
        migratedRef.current = true
        const local = lerLocal()
        await supabase.from('user_profiles').upsert({ user_id: user.id, ...toRow(local) })
        setPerfil(local)
      } else if (existing) {
        setPerfil(fromRow(existing as PerfilRow))
      } else {
        setPerfil(PADRAO)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  async function atualizar(changes: Partial<PerfilUtilizador>) {
    const next = { ...perfil, ...changes }
    setPerfil(next)
    if (user) {
      await supabase.from('user_profiles').upsert({ user_id: user.id, ...toRow(next) })
    } else {
      gravarLocal(next)
    }
  }

  return { perfil, atualizar }
}
