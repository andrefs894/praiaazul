import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase'
import type { Praia, MeteoDiario, QualidadeAgua } from '../types'
import { dataHoje, labelVento, iconeEstadoTempo, labelUV } from '../lib/utils'
import { estimarOcupacao } from '../lib/ocupacao'
import IndicadorOcupacao from './IndicadorOcupacao'
import { useFavoritas } from '../hooks/useFavoritas'

const ICONE_PRAIA = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#FF4444;border-radius:50%;border:2px solid rgba(255,68,68,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const C = {
  bg: '#0F1923',
  card: '#132A3A',
  accent: '#1A6FB5',
  text: '#E8EDF2',
  text2: '#7A8A9E',
  border: '#1A3D52',
  iconBox: '#1A3D52',
} as const

function labelTipo(tipo: string | null): string {
  if (tipo === 'costeira') return 'Costeira'
  if (tipo === 'fluvial') return 'Fluvial'
  if (tipo === 'albufeira') return 'Albufeira'
  return ''
}

const QUALIDADE_LABEL: Record<string, string> = { excelente: 'Excelente', boa: 'Boa', aceitavel: 'Aceitável', ma: 'Má' }

function DataBox({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ flex: 1, background: C.iconBox, borderRadius: 10, padding: '10px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 9, fontWeight: 500, color: C.text2, letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor ?? C.text }}>{value}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '0 20px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: C.card, borderRadius: 16, height: 32, width: '60%' }} className="animate-pulse" />
        <div style={{ background: C.card, borderRadius: 12, height: 140 }} className="animate-pulse" />
        <div style={{ background: C.card, borderRadius: 12, height: 100 }} className="animate-pulse" />
      </div>
    </div>
  )
}

export default function FichaPraia() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isFavorita, toggleFavorita } = useFavoritas()

  const [praia, setPraia] = useState<Praia | null>(null)
  const [meteo, setMeteo] = useState<MeteoDiario | null>(null)
  const [qualidade, setQualidade] = useState<QualidadeAgua | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const praiaId = id ? parseInt(id, 10) : NaN
    if (isNaN(praiaId)) { setErro('ID inválido'); setLoading(false); return }

    async function carregar() {
      const [praiaRes, qualRes] = await Promise.all([
        supabase.from('praias').select('*').eq('id', praiaId).single(),
        supabase.from('qualidade_agua').select('*').eq('praia_id', praiaId)
          .order('data_analise', { ascending: false }).limit(1).maybeSingle(),
      ])

      if (praiaRes.error) { setErro(praiaRes.error.message); setLoading(false); return }

      const p = praiaRes.data as Praia
      setPraia(p)
      setQualidade(qualRes.data ?? null)

      if (p.ipma_global_id != null) {
        const meteoRes = await supabase.from('meteo_diario').select('*')
          .eq('ipma_global_id', p.ipma_global_id).eq('data', dataHoje()).maybeSingle()
        setMeteo(meteoRes.data ?? null)
      }

      setLoading(false)
    }

    carregar()
  }, [id])

  if (loading) return <Skeleton />

  if (erro || !praia) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '20px' }}>
          <button onClick={() => navigate(-1)} style={btnVoltar}>← Voltar</button>
          <p style={{ color: '#ff6b6b', fontSize: 14 }}>{erro ?? 'Praia não encontrada.'}</p>
        </div>
      </div>
    )
  }

  const mapsUrl = praia.latitude != null && praia.longitude != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${praia.latitude},${praia.longitude}`
    : null

  const tipo = labelTipo(praia.tipo)
  const favoritada = isFavorita(praia.id)

  const temServicos = praia.bandeira_azul || praia.nadador_salvador || praia.acessivel || praia.restaurante ||
    praia.estacionamento !== 'inexistente'

  const ocupacao = estimarOcupacao(praia, meteo)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: `0.5px solid ${C.border}`,
        }}>
          <button onClick={() => navigate(-1)} style={btnVoltar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p style={{ flex: 1, fontSize: 16, fontWeight: 500, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {praia.nome}
          </p>
          <button
            onClick={() => toggleFavorita(praia.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24"
              fill={favoritada ? C.accent : 'none'}
              stroke={favoritada ? C.accent : C.text2}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>{praia.nome}</h1>
            {tipo && (
              <span style={{
                border: '0.5px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 10,
              }}>
                {tipo}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: C.text2, margin: '4px 0 0' }}>
            {[praia.concelho, praia.distrito].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Weather + quality — merged card */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
          <p style={labelStyle}>Tempo hoje</p>
          {meteo ? (
            <>
              {/* State row: icon + description + separator + temps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, background: C.iconBox, borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{iconeEstadoTempo(meteo.estado_tempo, meteo.precipitacao)}</span>
                <span style={{ fontSize: 14, color: C.text, flex: 1, lineHeight: 1.2 }}>{meteo.estado_tempo ?? '—'}</span>
                {(meteo.temp_max != null || meteo.temp_min != null) && (
                  <>
                    <div style={{ width: 1, height: 28, background: C.border, flexShrink: 0 }} />
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {meteo.temp_max != null && <p style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1 }}>{meteo.temp_max}°</p>}
                      {meteo.temp_min != null && <p style={{ fontSize: 11, color: C.text2, margin: '3px 0 0', lineHeight: 1 }}>Min {meteo.temp_min}°</p>}
                    </div>
                  </>
                )}
              </div>

              {/* Row 1: Precipitação | Vento | UV */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <DataBox icon="🌧️" label="Precip." value={meteo.precipitacao != null ? `${meteo.precipitacao}%` : '—'} />
                <DataBox icon="💨" label="Vento" value={meteo.vento_intensidade != null ? labelVento(meteo.vento_intensidade) : '—'} />
                <DataBox icon="☀️" label="UV" value={labelUV(meteo.uv_index)} />
              </div>

              {/* Row 2: Qualidade água | Temp. água | Ondulação */}
              <div style={{ display: 'flex', gap: 8 }}>
                <DataBox
                  icon="💧"
                  label="Qualidade água"
                  value={qualidade?.classificacao ? (QUALIDADE_LABEL[qualidade.classificacao] ?? '—') : '—'}
                />
                <DataBox icon="🌡️" label="Temp. água" value={meteo.temp_agua != null ? `${meteo.temp_agua}°C` : '—'} />
                <DataBox icon="🌊" label="Ondulação" value={meteo.ondulacao_altura != null ? `${meteo.ondulacao_altura}m` : '—'} />
              </div>

              {qualidade?.data_analise && (
                <p style={{ fontSize: 11, color: C.text2, margin: '10px 0 0' }}>
                  Análise da água: {new Date(qualidade.data_analise).toLocaleDateString('pt-PT')}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: C.text2, fontSize: 13, margin: 0 }}>Sem dados meteorológicos para hoje.</p>
          )}
        </div>

        {/* Occupation */}
        <IndicadorOcupacao nivel={ocupacao.nivel} fonte={ocupacao.fonte} variant="card" />

        {/* Services */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
          <p style={labelStyle}>Serviços e Equipamentos</p>
          {temServicos ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {praia.bandeira_azul && <Servico texto="Bandeira Azul" icon="🚩" />}
                {praia.nadador_salvador && <Servico texto="Nadador-Salvador" icon="🏊" />}
                {praia.acessivel && <Servico texto="Acessível" icon="♿" />}
                {praia.restaurante && <Servico texto="Bar/Restaurante" icon="🍽️" />}
                {praia.estacionamento == null && <Servico texto="Estacionamento" icon="🅿️" />}
                {praia.estacionamento === 'gratuito' && <Servico texto="Estac. grátis" icon="🅿️" />}
                {praia.estacionamento === 'pago' && <Servico texto="Estac. pago" icon="🅿️" />}
              </div>
              {praia.estacionamento_capacidade != null && (
                <p style={{ fontSize: 12, color: C.text2, margin: '10px 0 0' }}>
                  ~{praia.estacionamento_capacidade} lugares
                  {praia.estacionamento_distancia_metros != null ? ` · ${praia.estacionamento_distancia_metros}m da praia` : ''}
                </p>
              )}
            </>
          ) : (
            <p style={{ fontSize: 13, color: C.text2, margin: 0 }}>Sem informação de serviços.</p>
          )}
        </div>

        {/* Description */}
        {praia.descricao && (
          <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
            <p style={labelStyle}>Descrição</p>
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, margin: 0 }}>{praia.descricao}</p>
          </div>
        )}

        {/* Mini-map */}
        {praia.latitude != null && praia.longitude != null && (
          <div style={{ borderRadius: 12, overflow: 'hidden', height: 180 }}>
            <MapContainer
              center={[praia.latitude, praia.longitude]}
              zoom={13}
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <Marker position={[praia.latitude, praia.longitude]} icon={ICONE_PRAIA} />
            </MapContainer>
          </div>
        )}

        {/* Directions */}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              background: C.accent,
              color: 'white',
              fontWeight: 500,
              borderRadius: 12,
              padding: '14px',
              textDecoration: 'none',
              fontSize: 15,
              transition: 'opacity 0.2s ease',
            }}
          >
            Como chegar
          </a>
        )}
      </div>
    </div>
  )
}

// --- helpers ---

const btnVoltar: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  color: '#7A8A9E',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: 12,
  marginTop: 0,
}

function Servico({ icon, texto }: { icon: string; texto: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, color: '#E8EDF2' }}>{texto}</span>
    </div>
  )
}
