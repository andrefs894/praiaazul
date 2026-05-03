import { useState } from 'react'

const CHAVE = 'praia_azul_favoritas'

function ler(): number[] {
  try {
    const raw = localStorage.getItem(CHAVE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useFavoritas() {
  const [favoritas, setFavoritas] = useState<number[]>(ler)

  function toggleFavorita(id: number) {
    setFavoritas(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(CHAVE, JSON.stringify(next))
      return next
    })
  }

  return {
    favoritas,
    isFavorita: (id: number) => favoritas.includes(id),
    toggleFavorita,
  }
}
