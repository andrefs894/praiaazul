import { useState, useMemo, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import type { PraiaComMeteo } from '../types'
import type { ContextoApp } from '../App'

const C = {
  navy: '#1E3A5F',
  cream: '#EDE3CD',
  white: '#FFFFFF',
  creamText: '#F5EFE0',
  creamDim: 'rgba(245,239,224,0.65)',
  navyDim: 'rgba(30,58,95,0.55)',
  navySoft: 'rgba(30,58,95,0.08)',
  pillBorder: 'rgba(30,58,95,0.25)',
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
  const [concelhosExpandidos, setConcelhosExpandidos] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const { gruposConcelho, praiasNome } = useMemo(() => {
    if (query.trim().length < 2) return { gruposConcelho: [], praiasNome: [] as PraiaComMeteo[] }
    const q = query.toLowerCase()

    const gruposConcelho = agruparPorConcelho(praiaComMeteo, q)

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
    setConcelhosExpandidos(new Set())
  }

  function alternarConcelho(concelho: string) {
    setConcelhosExpandidos(prev => {
      const next = new Set(prev)
      if (next.has(concelho)) next.delete(concelho)
      else next.add(concelho)
      return next
    })
  }

  const mostrarDropdown = aberto && query.trim().length >= 2

  return (
    <div style={{ background: C.navy, minHeight: '100vh' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', background: C.cream, minHeight: '100vh', position: 'relative', paddingBottom: 90 }}>
        <Header />

        {/* Page title */}
        <div style={{ padding: '24px 20px 4px' }}>
          <h1 style={{
            fontSize: 34, fontWeight: 500,
            color: C.navy, margin: 0, letterSpacing: '-0.5px', lineHeight: 1,
          }}>
            Explorar
          </h1>
          <p style={{ fontSize: 13, color: C.navyDim, margin: '8px 0 0' }}>
            Pesquisa por praia ou concelho.
          </p>
        </div>

        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Search bar */}
          <div ref={containerRef} style={{ position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: C.white,
              border: `1px solid ${C.pillBorder}`,
              borderRadius: 24, padding: '11px 16px',
              boxShadow: '0 1px 3px rgba(30,58,95,0.06)',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.navyDim} strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar praia ou concelho..."
                value={query}
                onChange={e => { setQuery(e.target.value); setAberto(true); if (!e.target.value) limpar() }}
                onFocus={() => setAberto(true)}
                onKeyDown={e => e.key === 'Escape' && setAberto(false)}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: C.navy }}
              />
              {query && (
                <button onClick={limpar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.navyDim} strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Dropdown */}
            {mostrarDropdown && !semResultados && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: C.white,
                border: `1px solid ${C.pillBorder}`,
                borderRadius: 16, overflow: 'hidden', zIndex: 50,
                maxHeight: 'calc(100dvh - 320px)', overflowY: 'auto',
                boxShadow: '0 6px 20px rgba(30,58,95,0.12)',
              }}>
                {/* County groups */}
                {gruposConcelho.map(({ concelho, praias }) => {
                  const expandido = concelhosExpandidos.has(concelho)
                  const visiveis = expandido ? praias : praias.slice(0, MAX_PRAIAS_POR_CONCELHO)
                  const restantes = praias.length - MAX_PRAIAS_POR_CONCELHO
                  return (
                  <div key={`concelho-${concelho}`}>
                    <div style={{
                      padding: '10px 16px 6px',
                      background: C.navySoft,
                      borderBottom: `1px solid ${C.pillBorder}`,
                    }}>
                      <p style={{
                        fontSize: 11, fontWeight: 600, color: C.navy,
                        letterSpacing: '1.5px', textTransform: 'uppercase',
                        margin: 0,
                      }}>
                        Concelho de {concelho} · {praias.length} {praias.length === 1 ? 'praia' : 'praias'}
                      </p>
                    </div>
                    {visiveis.map((p, i, arr) => (
                      <button
                        key={p.id}
                        onMouseDown={() => selecionar(p)}
                        style={{
                          width: '100%', padding: '12px 16px', textAlign: 'left',
                          background: 'none', border: 'none',
                          borderBottom: i < arr.length - 1 ? `1px solid ${C.pillBorder}` : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.navy, margin: 0 }}>{p.nome}</p>
                        <p style={{ fontSize: 12, color: C.navyDim, margin: '2px 0 0' }}>
                          {[labelTipo(p.tipo), p.distancia_minutos != null ? `~${p.distancia_minutos} min` : null]
                            .filter(Boolean).join(' · ')}
                        </p>
                      </button>
                    ))}
                    {restantes > 0 && (
                      <button
                        type="button"
                        onMouseDown={e => { e.preventDefault(); alternarConcelho(concelho) }}
                        style={{
                          width: '100%', padding: '8px 16px', margin: 0,
                          background: 'none', border: 'none',
                          borderTop: `1px solid ${C.pillBorder}`,
                          borderBottom: `1px solid ${C.pillBorder}`,
                          cursor: 'pointer',
                          fontSize: 11, color: C.navy, fontWeight: 600,
                          letterSpacing: '0.3px',
                        }}
                      >
                        {expandido
                          ? 'Mostrar menos'
                          : `+ ${restantes} ${restantes === 1 ? 'outra' : 'outras'}`}
                      </button>
                    )}
                  </div>
                  )
                })}

                {/* Beaches matched by name */}
                {praiasNome.length > 0 && (
                  <div>
                    {gruposConcelho.length > 0 && (
                      <div style={{
                        padding: '10px 16px 6px',
                        background: C.navySoft,
                        borderBottom: `1px solid ${C.pillBorder}`,
                      }}>
                        <p style={{
                          fontSize: 11, fontWeight: 600, color: C.navy,
                          letterSpacing: '1.5px', textTransform: 'uppercase',
                          margin: 0,
                        }}>
                          Praias
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
                          borderBottom: i < praiasNome.length - 1 ? `1px solid ${C.pillBorder}` : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.navy, margin: 0 }}>{p.nome}</p>
                        <p style={{ fontSize: 12, color: C.navyDim, margin: '2px 0 0' }}>
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
                background: C.white,
                border: `1px solid ${C.pillBorder}`,
                borderRadius: 16, padding: '16px', zIndex: 50, textAlign: 'center',
                boxShadow: '0 6px 20px rgba(30,58,95,0.12)',
              }}>
                <p style={{ color: C.navyDim, fontSize: 13, margin: 0 }}>Nenhuma praia encontrada.</p>
              </div>
            )}
          </div>

          {!query && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <p style={{ fontSize: 40, margin: '0 0 14px' }}>🏖️</p>
              <p style={{ color: C.navyDim, fontSize: 15, margin: 0 }}>
                Pesquisa uma praia ou concelho para ver os detalhes
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
