// Fetches photos for a given beach from `praia_fotos`.
// Returns up to 10 photos ordered by `ordem ASC` (primary first).
// Returns an empty array (no error) when the beach has no photos yet —
// the n8n photos workflow runs monthly so coverage will be incremental.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Foto } from '../types'

export function useFotos(praiaId: number | null | undefined) {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (praiaId == null) { setFotos([]); setIsLoading(false); return }

    let cancelled = false
    setIsLoading(true)

    supabase
      .from('praia_fotos')
      .select('*')
      .eq('praia_id', praiaId)
      .order('ordem', { ascending: true })
      .limit(10)
      .then(({ data }) => {
        if (cancelled) return
        setFotos((data as Foto[] | null) ?? [])
        setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [praiaId])

  return { fotos, isLoading }
}
