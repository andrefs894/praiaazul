import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Praia } from '../types'

export function usePraias() {
  const [praias, setPraias] = useState<Praia[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from('praias')
        .select('*')
        .order('nome')

      if (error) {
        setErro(error.message)
      } else {
        setPraias(data ?? [])
      }
      setLoading(false)
    }

    carregar()
  }, [])

  return { praias, loading, erro }
}
