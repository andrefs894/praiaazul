import { useState, useMemo, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Header from '../components/Header'
import { useFavoritas } from '../hooks/useFavoritas'
import { supabase } from '../lib/supabase'
import { labelVento, iconeEstadoTempo } from '../lib/utils'
import type { PraiaComMeteo, QualidadeAgua } from '../types'
import type { ContextoApp } from '../App'

const C = {
  bg: '#0F1923', card: '#132A3A', accent: '#1A6FB5',
  text: '#E8EDF2', text2: '#7A8A9E', border: '#1A3D52',
} as const

const LABEL_ST: React.CSSProperties = {
  fontSize: 10, fontWeight: 500, color: '#7A8A9E',
  letterSpacing: '2px', textTransform: 'uppercase',
  margin: '0 0 10px',
}

function labelTipo(t: string | null) {
  if (t === 'costeira') return 'Costeira'
  if (t === 'fluvial') return 'Fluvial'
  if (t === 'albufeira') return 'Albufeira'
  return ''
}

function MapaMinimo({ praia }: { praia: PraiaComMeteo }) {
  if (praia.latitude == null || praia.longitude == null) return null
  const pos: [number, number] = [praia.latitude, praia.longitude]
  const icon = L.divIcon({
    className: '',
    html: '<div class="marker-pulse" style="width:14px;height:14px;background:#3DD9C4;border-radius:50%;border:2px solid rgba(61,217,196,0.3)"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', height: 200 }}>
      <MapContainer key={praia.id} center={pos} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={pos} icon={icon}>
          <Popup>{praia.nome}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

function IcCoracao({ preenchido, cor }: { preenchido: boolean; cor: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={preenchido ? cor : 'none'} stroke={cor}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function Chip({ texto }: { texto: string }) {
  return (
    <span style={{
      border: '0.5px solid rgba(255,255,255,0.15)',
      color: C.text, borderRadius: 20, padding: '4px 10px', fontSize: 12,
    }}>
      {texto}
    </span>
  )
}

export default function PaginaExplorar() {
  const { praiaComMeteo } = useOutletContext<ContextoApp>()
  const { isFavorita, toggleFavorita } = useFavoritas()
  const [query, setQuery] = useState('')
  const [aberto, setAberto] = useState(false)
  const [selecionada, setSelecionada] = useState<PraiaComMeteo | null>(null)
  const [qualidade, setQualidade] = useState<QualidadeAgua | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const resultados = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase()
    return praiaComMeteo
      .filter(p =>
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
  }, [praiaComMeteo, query])

  useEffect(() => {
    if (!selecionada) { setQualidade(null); return }
    supabase
      .from('qualidade_agua').select('*')
      .eq('praia_id', selecionada.id)
      .order('data_analise', { ascending: false })
      .limit(1).maybeSingle()
      .then(({ data }) => setQualidade(data ?? null))
  }, [selecionada])

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function selecionar(praia: PraiaComMeteo) {
    setSelecionada(praia)
    setQuery(praia.nome)
    setAberto(false)
  }

  function limpar() {
    setSelecionada(null)
    setQuery('')
    setAberto(false)
  }

  const mostrarDropdown = aberto && query.trim().length >= 2
  const m = selecionada?.meteo
  const labelQTexto: Record<string, string> = { excelente: 'Excelente', boa: 'Boa', aceitavel: 'Aceitável', ma: 'Má' }
  const temServicos = selecionada && (
    selecionada.bandeira_azul || selecionada.nadador_salvador ||
    selecionada.acessivel || selecionada.restaurante || !!selecionada.estacionamento
  )

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
          {mostrarDropdown && resultados.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: C.card, border: `0.5px solid ${C.border}`,
              borderRadius: 16, overflow: 'hidden', zIndex: 50,
            }}>
              {resultados.map((p, i) => (
                <button
                  key={p.id}
                  onMouseDown={() => selecionar(p)}
                  style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left',
                    background: 'none', border: 'none',
                    borderBottom: i < resultados.length - 1 ? `0.5px solid ${C.border}` : 'none',
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

          {mostrarDropdown && resultados.length === 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: C.card, border: `0.5px solid ${C.border}`,
              borderRadius: 16, padding: '16px', zIndex: 50, textAlign: 'center',
            }}>
              <p style={{ color: C.text2, fontSize: 13, margin: 0 }}>Nenhuma praia encontrada.</p>
            </div>
          )}
        </div>

        {/* Selected beach detail */}
        {selecionada ? (
          <>
            <MapaMinimo praia={selecionada} />

            {/* Title + favorite */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 500, color: C.text, margin: 0 }}>{selecionada.nome}</h2>
                <p style={{ fontSize: 13, color: C.text2, margin: '4px 0 0' }}>
                  {[selecionada.concelho, selecionada.distancia_minutos != null ? `~${selecionada.distancia_minutos} min` : null]
                    .filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                onClick={() => toggleFavorita(selecionada.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
              >
                <IcCoracao
                  preenchido={isFavorita(selecionada.id)}
                  cor={isFavorita(selecionada.id) ? C.accent : C.text2}
                />
              </button>
            </div>

            {/* Weather */}
            {m && (
              <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
                <p style={LABEL_ST}>Tempo hoje</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 32 }}>{iconeEstadoTempo(m.estado_tempo, m.precipitacao)}</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: C.text, margin: 0 }}>{m.estado_tempo ?? '—'}</p>
                    {m.temp_max != null && (
                      <p style={{ fontSize: 13, color: C.text2, margin: '2px 0 0' }}>
                        {m.temp_max}°C máx{m.temp_min != null ? ` · ${m.temp_min}°C mín` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {m.precipitacao != null && <span style={{ fontSize: 13, color: C.text2 }}>Precip.: {m.precipitacao}%</span>}
                  {m.vento_intensidade != null && <span style={{ fontSize: 13, color: C.text2 }}>Vento: {labelVento(m.vento_intensidade)}</span>}
                  {m.temp_agua != null && <span style={{ fontSize: 13, color: C.text2 }}>Água: {m.temp_agua}°C</span>}
                  {m.uv_index != null && <span style={{ fontSize: 13, color: C.text2 }}>UV: {m.uv_index}</span>}
                </div>
              </div>
            )}

            {/* Water quality */}
            {qualidade?.classificacao && (
              <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
                <p style={LABEL_ST}>Qualidade da água</p>
                <p style={{ fontSize: 16, fontWeight: 500, color: C.text, margin: 0 }}>
                  {labelQTexto[qualidade.classificacao] ?? qualidade.classificacao}
                </p>
              </div>
            )}

            {/* Services */}
            {temServicos && (
              <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
                <p style={LABEL_ST}>Serviços</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selecionada.bandeira_azul && <Chip texto="🏳️ Bandeira Azul" />}
                  {selecionada.nadador_salvador && <Chip texto="🏊 Nadador-Salvador" />}
                  {selecionada.acessivel && <Chip texto="♿ Acessível" />}
                  {selecionada.restaurante && <Chip texto="🍽️ Restaurante" />}
                  {selecionada.estacionamento === 'gratuito' && <Chip texto="🅿️ Parque grátis" />}
                  {selecionada.estacionamento === 'pago' && <Chip texto="🅿️ Parque pago" />}
                </div>
              </div>
            )}

            {/* Directions */}
            {selecionada.latitude != null && selecionada.longitude != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selecionada.latitude},${selecionada.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center',
                  background: C.accent, color: 'white',
                  fontWeight: 500, borderRadius: 12, padding: '14px',
                  textDecoration: 'none', fontSize: 15,
                }}
              >
                Como chegar
              </a>
            )}
          </>
        ) : (
          !query && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <p style={{ fontSize: 40, margin: '0 0 14px' }}>🧭</p>
              <p style={{ color: C.text2, fontSize: 15, margin: 0 }}>Pesquisa uma praia para ver os detalhes</p>
            </div>
          )
        )}

      </div>
    </div>
  )
}
