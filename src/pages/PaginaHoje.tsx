import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import Mapa from '../components/Mapa'
import { useAuth } from '../hooks/useAuth'
import { useRecomendacao } from '../hooks/useRecomendacao'
import { useFavoritas } from '../hooks/useFavoritas'
import { usePerfil } from '../hooks/usePerfil'
import { haversineKm, iconeEstadoTempo, labelQualidadeAgua, labelUV, labelVento } from '../lib/utils'
import type { ContextoApp } from '../App'
import type { DistanciaMaxima, RecomendacaoResult } from '../types'

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

const SERIF = '"Playfair Display", Georgia, serif'

export default function PaginaHoje() {
  const { praiaComMeteo, loading, erro, coordenadas } = useOutletContext<ContextoApp>()
  const { perfil, atualizar } = usePerfil()
  const { isFavorita, toggleFavorita } = useFavoritas()
  const { user } = useAuth()
  const radiusKm = perfil.distancia_maxima ?? 50
  const [outrasAbertas, setOutrasAbertas] = useState(false)

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  // Make iOS overscroll / page area outside the column show white
  useEffect(() => {
    const prev = document.documentElement.style.backgroundColor
    document.documentElement.style.backgroundColor = '#FFFFFF'
    return () => { document.documentElement.style.backgroundColor = prev }
  }, [])

  const praiasNoRaio = useMemo(() => {
    if (!coordenadas) return praiaComMeteo
    return praiaComMeteo.filter(p => {
      if (p.latitude == null || p.longitude == null) return false
      return haversineKm(coordenadas.lat, coordenadas.lng, p.latitude, p.longitude) <= radiusKm
    })
  }, [praiaComMeteo, coordenadas, radiusKm])

  const recomendacoes = useRecomendacao(praiasNoRaio, perfil)
  const topRec = recomendacoes[0]
  const outrasOpcoes = recomendacoes.slice(1)

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 90 }}>
     <div style={{ maxWidth: 420, margin: '0 auto', background: C.cream, position: 'relative', minHeight: '100vh' }}>

      {/* HERO — navy with wave-shaped bottom */}
      <section style={{
        background: C.navy,
        padding: '18px 20px 75px',
        position: 'relative',
      }}>
        {/* True wave (one full sine cycle): up-peak, then down-trough */}
        <svg
          aria-hidden
          style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 65, display: 'block' }}
          viewBox="0 0 420 65" preserveAspectRatio="none"
        >
          <path d="M0,30 Q105,0 210,30 T420,30 L420,65 L0,65 Z" fill={C.cream} />
        </svg>

        {/* Brand bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <p style={{ color: C.creamText, fontSize: 12, fontWeight: 600, letterSpacing: '2px', margin: 0 }}>
            PRAIA AZUL
          </p>
          <Link to="/perfil" aria-label="Perfil" style={{ display: 'flex' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" referrerPolicy="no-referrer"
                style={{ width: 28, height: 28, borderRadius: '50%', display: 'block', objectFit: 'cover' }} />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.creamDim} strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </Link>
        </div>

        <div style={{ position: 'relative' }}>
          {topRec ? (
            <Hero
              rec={topRec}
              isFavorita={isFavorita(topRec.praia.id)}
              onToggleFavorita={() => toggleFavorita(topRec.praia.id)}
            />
          ) : (
            <p style={{ color: C.creamDim, marginTop: 36, fontSize: 14 }}>
              {loading ? 'A calcular a melhor praia para hoje…' : 'Sem praias no raio selecionado.'}
            </p>
          )}
        </div>
      </section>

      {/* BODY */}
      {topRec && (
        <section style={{
          padding: '24px 20px 0',
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>

          {/* 3 databoxes — wind / water quality / UV */}
          <div style={{ display: 'flex', gap: 10 }}>
            <DataBox
              icone="💨"
              value={topRec.praia.meteo?.vento_intensidade != null ? labelVento(topRec.praia.meteo.vento_intensidade) : '—'}
              label="VENTO"
            />
            <DataBox
              icone="💧"
              value={labelQualidadeAgua(topRec.praia.qualidade_agua?.classificacao)}
              label="ÁGUA"
            />
            <DataBox
              icone="☀️"
              value={labelUV(topRec.praia.meteo?.uv_index)}
              label="UV"
            />
          </div>

          {/* Serviços */}
          <Servicos praia={topRec.praia} />

          {/* Map + Como chegar */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden' }}>
              <Mapa
                praias={praiaComMeteo}
                recomendacoes={recomendacoes}
                coordenadas={coordenadas}
                radiusKm={radiusKm}
                onRadiusChange={(km) => atualizar({ distancia_maxima: km as DistanciaMaxima })}
              />
            </div>
            {topRec.praia.latitude != null && topRec.praia.longitude != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${topRec.praia.latitude},${topRec.praia.longitude}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  position: 'absolute', bottom: 12, right: 12,
                  background: C.navy, color: C.creamText,
                  padding: '9px 18px', borderRadius: 22,
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                }}
              >
                Como chegar
              </a>
            )}
          </div>

          {/* Outras opções (collapsible) */}
          {outrasOpcoes.length > 0 && (
            <section style={{ marginBottom: 8 }}>
              <button
                onClick={() => setOutrasAbertas(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                }}
              >
                <p style={{
                  fontSize: 11, fontWeight: 600, color: C.navyDim,
                  letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0,
                }}>
                  Outras opções
                </p>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: C.navy, color: C.creamText,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, lineHeight: 1,
                  transform: outrasAbertas ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}>
                  ↓
                </span>
              </button>
              {outrasAbertas && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {outrasOpcoes.map(rec => <CartaoSecundario key={rec.praia.id} rec={rec} />)}
                </div>
              )}
            </section>
          )}
        </section>
      )}

      {erro && (
        <div style={{ padding: '24px 20px' }}>
          <p style={{ color: '#C04848', fontSize: 14, margin: 0 }}>Erro ao carregar: {erro}</p>
        </div>
      )}
     </div>
    </div>
  )
}

function Hero({ rec, isFavorita, onToggleFavorita }: {
  rec: RecomendacaoResult
  isFavorita: boolean
  onToggleFavorita: () => void
}) {
  const { praia } = rec
  const m = praia.meteo

  const localizacao = [
    [praia.concelho, praia.distrito].filter(Boolean).join(', ') || null,
    praia.distancia_minutos != null ? `~${praia.distancia_minutos} min` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div style={{ marginTop: 26 }}>
      <p style={{
        fontSize: 11, fontWeight: 600, color: C.creamDim,
        letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 14px',
      }}>
        A sua recomendação para hoje
      </p>

      {/* Two columns: name+location on the left, weather on the right */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

        {/* Left — name + location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/praia/${praia.id}`} style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: SERIF,
              fontSize: 40, fontWeight: 500, lineHeight: 1.05,
              color: C.creamText, margin: 0, letterSpacing: '-0.5px',
            }}>
              {praia.nome}
            </h1>
          </Link>
          <p style={{
            fontSize: 13, color: C.creamDim, margin: '14px 0 0',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {localizacao}
          </p>
        </div>

        {/* Right — favourite + weather + temp */}
        <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button
            onClick={onToggleFavorita}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            aria-label="Favorita"
          >
            <IcCoracao preenchido={isFavorita} />
          </button>

          {m && (
            <>
              <span style={{ fontSize: 36, lineHeight: 1, marginTop: 2 }}>
                {iconeEstadoTempo(m.estado_tempo, m.precipitacao)}
              </span>
              <p style={{
                fontSize: 13, fontWeight: 500, color: C.creamText,
                margin: '4px 0 0', lineHeight: 1.2, maxWidth: 130,
              }}>
                {m.estado_tempo ?? '—'}
              </p>
              {m.temp_max != null && (
                <p style={{
                  fontFamily: SERIF,
                  fontSize: 30, fontWeight: 500, color: C.creamText,
                  margin: '4px 0 0', lineHeight: 1, letterSpacing: '-1px',
                }}>
                  {Math.round(m.temp_max)}°
                </p>
              )}
              {m.temp_min != null && (
                <p style={{ fontSize: 10, color: C.creamDim, margin: '2px 0 0', letterSpacing: '0.5px' }}>
                  mín {Math.round(m.temp_min)}°
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DataBox({ icone, value, label }: { icone: string; value: string; label: string }) {
  return (
    <div style={{
      flex: 1,
      background: C.white,
      borderRadius: 16,
      padding: '14px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
      boxShadow: '0 1px 3px rgba(30,58,95,0.06)',
      minWidth: 0,
    }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icone}</span>
      <span style={{
        fontSize: 14, fontWeight: 600, color: C.navy,
        lineHeight: 1.15, textAlign: 'center',
        maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {value}
      </span>
      <span style={{ fontSize: 9.5, fontWeight: 600, color: C.navyDim, letterSpacing: '2px' }}>
        {label}
      </span>
    </div>
  )
}

function Servicos({ praia }: { praia: RecomendacaoResult['praia'] }) {
  const servicos: { icone: string; texto: string }[] = []
  if (praia.bandeira_azul)                  servicos.push({ icone: '🏖️', texto: 'Bandeira Azul' })
  if (praia.nadador_salvador)               servicos.push({ icone: '🛟', texto: 'Nadador-Salvador' })
  if (praia.acessivel)                      servicos.push({ icone: '♿', texto: 'Acessível' })
  if (praia.estacionamento === 'gratuito')  servicos.push({ icone: '🅿️', texto: 'Estac. grátis' })
  else if (praia.estacionamento === 'pago') servicos.push({ icone: '🅿️', texto: 'Estac. pago' })
  if (praia.restaurante)                    servicos.push({ icone: '🍽️', texto: 'Restaurante' })

  if (servicos.length === 0) return null

  return (
    <div>
      <p style={{
        fontSize: 11, fontWeight: 600, color: C.navyDim,
        letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 12px',
      }}>
        Serviços
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {servicos.map((s, i) => <Pill key={s.texto} icone={s.icone} texto={s.texto} filled={i === 0} />)}
      </div>
    </div>
  )
}

function Pill({ icone, texto, filled }: { icone: string; texto: string; filled?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      border: `1px solid ${C.pillBorder}`,
      background: filled ? C.navySoft : 'transparent',
      color: C.navy,
      fontSize: 12, fontWeight: 500,
    }}>
      <span style={{ fontSize: 13, lineHeight: 1 }}>{icone}</span>
      {texto}
    </span>
  )
}

function IcCoracao({ preenchido }: { preenchido: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={preenchido ? C.creamText : 'none'}
      stroke={C.creamText} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CartaoSecundario({ rec }: { rec: RecomendacaoResult }) {
  const { praia, motivo } = rec
  const m = praia.meteo
  return (
    <Link to={`/praia/${praia.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: C.white,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 1px 3px rgba(30,58,95,0.05)',
      }}>
        <div style={{
          width: 40, height: 40, background: C.navySoft, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {iconeEstadoTempo(m?.estado_tempo, m?.precipitacao)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: 500, color: C.navy, margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {praia.nome}
          </p>
          <p style={{
            fontSize: 12, color: C.navyDim, margin: '3px 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {[praia.concelho, motivo].filter(Boolean).join(' · ')}
          </p>
        </div>
        {praia.distancia_minutos != null && (
          <span style={{ fontSize: 13, color: C.navy, fontWeight: 600, flexShrink: 0 }}>
            ~{praia.distancia_minutos} min
          </span>
        )}
      </div>
    </Link>
  )
}
