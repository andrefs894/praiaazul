import { useState, useMemo, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import type { PraiaComMeteo } from '../types'
import type { ContextoApp } from '../App'

const C = {
  bg: '#0F1923', card: '#132A3A', accent: '#1A6FB5',
  text: '#E8EDF2', text2: '#7A8A9E', border: '#1A3D52',
} as const

const MAX_PRAIAS_POR_CONCELHO = 8
const MAX_RESULTADOS_PRAIAS   = 10

function labelTipo(t: string | null) {
  if (t === 'costeira') return 'Costeira'
  if (t === 'fluvial') return 'Fluvial'
  if (t === 'albufeira') return 'Albufeira'
  return ''
}

// Group beaches whose concelho substring-matches the query.
// Returns: [{ concelho, praias }, ...] sorted by total beach count desc.
function agruparPorConcelho(
  praias: PraiaComMeteo[],
  q: string,
): { concelho: string; praias: PraiaComMeteo[] }[] {
  const grupos = new Map<string, PraiaComMeteo[]>()
  for (const p of praias) {
    if (!p.concelho) continue
    if (!p.concelho.toLowerCase().includes(q)) continue
    const lista = grupos.get(p.concelho) ?? []
    lista.push(p)
    grupos.set(p.concelho, lista)
  }

  return Array.from(grupos.entries())
    .map(([concelho, lista]) => ({
      concelho,
      praias: [...lista].sort((a, b) => {
        if (a.distancia_minutos != null && b.distancia_minutos != null)
          return a.distancia_minutos - b.distancia_minutos
        return a.nome.localeCompare(b.nome, 'pt')
      }),
    }))
    .sort((a, b) => b.praias.length - a.praias.length)
}

export default function PaginaExplorar() {
  const { praiaComMeteo } = useOutletContext<ContextoApp>()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build two result groups: matched concelhos (with their beaches) + beaches matched by name
  const { gruposConcelho, praiasNome } = useMemo(() => {
    if (query.trim().length < 2) return { gruposConcelho: [], praiasNome: [] as PraiaComMeteo[] }
    const q = query.toLowerCase()

    const gruposConcelho = agruparPorConcelho(praiaComMeteo, q)

    // Beaches matched by their own name. We exclude beaches already covered by a
    // matching concelho group to avoid duplication in the dropdown.
    const idsJaListados = new Set<number>()
    for (const g of gruposConcelho) for (const p of g.praias) idsJaListados.add(p.id)

    const praiasNome = praiaComMeteo
      .filter(p => p.nome.toLowerCase().includes(q) && !idsJaListados.has(p.id))
      .sort((a, b) => {
        if (a.distancia_minutos != null && b.distancia_minutos != null)
          return a.distancia_minutos - b.distancia_minutos
        if (a.distancia_minutos != null) return -1
        if (b.distancia_minutos != null) return 1
        return a.nome.localeCompare(b.nome, 'pt')
      })
      .slice(0, MAX_RESULTADOS_PRAIAS)

    return { gruposConcelho, praiasNome }
  }, [praiaComMeteo, query])

  const semResultados =
    gruposConcelho.length === 0 && praiasNome.length === 0

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function selecionar(praia: PraiaComMeteo) {
    setAberto(false)
    navigate(`/praia/${praia.id}`)
  }

  function limpar() {
    setQuery('')
    setAberto(false)
  }

  const mostrarDropdown = aberto && query.trim().length >= 2

  return (
    <div style={{ paddingBottom: 90 }}>
      <Header />

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Search bar */}
        <div ref={containerRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: C.card, border: `0.5px solid ${C.border}`,
            borderRadius: 24, padding: '11px 16px',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Pesquisar praia ou concelho..."
              value={query}
              onChange={e => { setQuery(e.target.value); setAberto(true); if (!e.target.value) limpar() }}
              onFocus={() => setAberto(true)}
              onKeyDown={e => e.key === 'Escape' && setAberto(false)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: C.text }}
            />
            {query && (
              <button onClick={limpar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown */}
          {mostrarDropdown && !semResultados && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: C.card, border: `0.5px solid ${C.border}`,
              borderRadius: 16, overflow: 'hidden', zIndex: 50,
              maxHeight: '70vh', overflowY: 'auto',
            }}>
              {/* County groups */}
              {gruposConcelho.map(({ concelho, praias }) => (
                <div key={`concelho-${concelho}`}>
                  <div style={{
                    padding: '10px 16px 6px',
                    background: 'rgba(26, 111, 181, 0.08)',
                    borderBottom: `0.5px solid ${C.border}`,
                  }}>
                    <p style={{
                      fontSize: 11, fontWeight: 600, color: C.accent,
                      letterSpacing: '1px', textTransform: 'uppercase',
                      margin: 0,
                    }}>
                      📍 Concelho de {concelho} · {praias.length} {praias.length === 1 ? 'praia' : 'praias'}
                    </p>
                  </div>
                  {praias.slice(0, MAX_PRAIAS_POR_CONCELHO).map((p, i, arr) => (
                    <button
                      key={p.id}
                      onMouseDown={() => selecionar(p)}
                      style={{
                        width: '100%', padding: '12px 16px', textAlign: 'left',
                        background: 'none', border: 'none',
                        borderBottom: i < arr.length - 1 ? `0.5px solid ${C.border}` : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>{p.nome}</p>
                      <p style={{ fontSize: 12, color: C.text2, margin: '2px 0 0' }}>
                        {[labelTipo(p.tipo), p.distancia_minutos != null ? `~${p.distancia_minutos} min` : null]
                          .filter(Boolean).join(' · ')}
                      </p>
                    </button>
                  ))}
                  {praias.length > MAX_PRAIAS_POR_CONCELHO && (
                    <p style={{
                      fontSize: 11, color: C.text2, textAlign: 'center',
                      padding: '8px 16px', margin: 0,
                      borderBottom: `0.5px solid ${C.border}`,
                    }}>
                      + {praias.length - MAX_PRAIAS_POR_CONCELHO} {praias.length - MAX_PRAIAS_POR_CONCELHO === 1 ? 'outra' : 'outras'}
                    </p>
                  )}
                </div>
              ))}

              {/* Beaches matched by name (only if any AND we showed at least one county group) */}
              {praiasNome.length > 0 && (
                <div>
                  {gruposConcelho.length > 0 && (
                    <div style={{
                      padding: '10px 16px 6px',
                      background: 'rgba(255,255,255,0.03)',
                      borderBottom: `0.5px solid ${C.border}`,
                    }}>
                      <p style={{
                        fontSize: 11, fontWeight: 600, color: C.text2,
                        letterSpacing: '1px', textTransform: 'uppercase',
                        margin: 0,
                      }}>
                        🏖️ Praias
                      </p>
                    </div>
                  )}
                  {praiasNome.map((p, i) => (
                    <button
                      key={p.id}
                      onMouseDown={() => selecionar(p)}
                      style={{
                        width: '100%', padding: '12px 16px', textAlign: 'left',
                        background: 'none', border: 'none',
                        borderBottom: i < praiasNome.length - 1 ? `0.5px solid ${C.border}` : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>{p.nome}</p>
                      <p style={{ fontSize: 12, color: C.text2, margin: '2px 0 0' }}>
                        {[p.concelho, labelTipo(p.tipo), p.distancia_minutos != null ? `~${p.distancia_minutos} min` : null]
                          .filter(Boolean).join(' · ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mostrarDropdown && semResultados && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: C.card, border: `0.5px solid ${C.border}`,
              borderRadius: 16, padding: '16px', zIndex: 50, textAlign: 'center',
            }}>
              <p style={{ color: C.text2, fontSize: 13, margin: 0 }}>Nenhuma praia encontrada.</p>
            </div>
          )}
        </div>

        {!query && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontSize: 40, margin: '0 0 14px' }}>🧭</p>
            <p style={{ color: C.text2, fontSize: 15, margin: 0 }}>Pesquisa uma praia ou concelho para ver os detalhes</p>
          </div>
        )}

      </div>
    </div>
  )
}
