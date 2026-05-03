import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PraiaComMeteo } from '../types'

interface PesquisaPraiasProps {
  praias: PraiaComMeteo[]
}

export default function PesquisaPraias({ praias }: PesquisaPraiasProps) {
  const [query, setQuery] = useState('')
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const resultados = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase()
    return praias
      .filter(
        p =>
          p.nome.toLowerCase().includes(q) ||
          (p.concelho?.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => {
        if (a.distancia_minutos != null && b.distancia_minutos != null)
          return a.distancia_minutos - b.distancia_minutos
        if (a.distancia_minutos != null) return -1
        if (b.distancia_minutos != null) return 1
        return a.nome.localeCompare(b.nome, 'pt')
      })
      .slice(0, 10)
  }, [praias, query])

  useEffect(() => {
    function fecharFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [])

  function selecionar(id: number) {
    navigate(`/praia/${id}`)
    setQuery('')
    setAberto(false)
  }

  const mostrarDropdown = aberto && query.trim().length >= 2

  return (
    <div ref={containerRef} className="relative">
      <input
        type="search"
        placeholder="Pesquisar praia ou concelho…"
        value={query}
        onChange={e => { setQuery(e.target.value); setAberto(true) }}
        onFocus={() => setAberto(true)}
        onKeyDown={e => e.key === 'Escape' && setAberto(false)}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-sky-400 shadow-sm"
      />

      {mostrarDropdown && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {resultados.map(p => (
            <button
              key={p.id}
              onMouseDown={() => selecionar(p.id)}
              className="w-full px-4 py-3 text-left hover:bg-sky-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <p className="text-sm font-medium text-gray-800">{p.nome}</p>
              <p className="text-xs text-gray-400">
                {p.concelho}
                {p.distancia_minutos != null && ` · ~${p.distancia_minutos} min`}
              </p>
            </button>
          ))}
        </div>
      )}

      {mostrarDropdown && resultados.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 z-50">
          <p className="text-sm text-gray-400">Nenhuma praia encontrada.</p>
        </div>
      )}
    </div>
  )
}
