// Fetches nearby restaurants/bars/cafes for a beach from `pontos_interesse`.
// Top 5 by rating × log(review_count), refreshed monthly by the
// `nearby-places.json` n8n workflow.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PontoInteresse } from '../types'

export function usePontosInteresse(praiaId: number | null | undefined) {
  const [pontos, setPontos] = useState<PontoInteresse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (praiaId == null) { setPontos([]); setIsLoading(false); return }

    let cancelled = false
    setIsLoading(true)

    supabase
      .from('pontos_interesse')
      .select('*')
      .eq('praia_id', praiaId)
      .order('rating', { ascending: false })
      .limit(15)
      .then(({ data }) => {
        if (cancelled) return
        setPontos((data as PontoInteresse[] | null) ?? [])
        setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [praiaId])

  return { pontos, isLoading }
}
