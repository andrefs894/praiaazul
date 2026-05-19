import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { PraiaComMeteo } from '../types'
import { labelVento } from '../lib/utils'

interface Filtros {
  tipo: 'costeira' | 'fluvial' | 'albufeira' | null
  bandeira_azul: boolean
  nadador_salvador: boolean
  acessivel: boolean
  restaurante: boolean
}

const FILTROS_INICIAIS: Filtros = {
  tipo: null,
  bandeira_azul: false,
  nadador_salvador: false,
  acessivel: false,
  restaurante: false,
}

const PAGINA = 50

function iconeEstadoTempo(estado: string | null | undefined): React.ReactNode {
  if (!estado) return <IcWeatherPartlyCloudy />
  const s = estado.toLowerCase()
  if (s.includes('limpo')) return <IcWeatherSunny />
  if (s.includes('pouco nublado') || s.includes('parcialmente')) return <IcWeatherPartlyCloudy />
  if (s.includes('muito nublado') || s.includes('encoberto')) return <IcWeatherCloudy />
  if (s.includes('trovoada')) return <IcWeatherThunderstorm />
  if (s.includes('neve')) return <IcWeatherSnow />
  if (s.includes('nevoeiro')) return <IcWeatherFog />
  if (s.includes('chuva') || s.includes('aguaceiro')) return <IcWeatherRain />
  return <IcWeatherPartlyCloudy />
}

const W = {
  sun:       '#FDB813',
  sunStroke: '#F4A100',
  cloud:     '#E8EEF3',
  cloudEdge: '#B8C5D1',
  cloudDark: '#9AAAB8',
  rain:      '#4FA8E0',
  bolt:      '#FFD23F',
  snow:      '#E8F1F8',
  snowEdge:  '#A8BDD0',
  fog:       '#B8C5D1',
}

function IcWeatherSunny() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
      <g stroke={W.sunStroke} strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="3"  x2="16" y2="6" />
        <line x1="16" y1="26" x2="16" y2="29" />
        <line x1="3"  y1="16" x2="6"  y2="16" />
        <line x1="26" y1="16" x2="29" y2="16" />
        <line x1="6.7"  y1="6.7"  x2="8.8"  y2="8.8" />
        <line x1="23.2" y1="23.2" x2="25.3" y2="25.3" />
        <line x1="6.7"  y1="25.3" x2="8.8"  y2="23.2" />
        <line x1="23.2" y1="8.8"  x2="25.3" y2="6.7" />
      </g>
      <circle cx="16" cy="16" r="7" fill={W.sun} stroke={W.sunStroke} strokeWidth="1.5" />
    </svg>
  )
}

function IcWeatherPartlyCloudy() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
      <g stroke={W.sunStroke} strokeWidth="1.6" strokeLinecap="round">
        <line x1="11" y1="2"  x2="11" y2="4" />
        <line x1="2"  y1="11" x2="4"  y2="11" />
        <line x1="4.5" y1="4.5" x2="6"  y2="6" />
        <line x1="17.5" y1="4.5" x2="16" y2="6" />
        <line x1="4.5" y1="17.5" x2="6" y2="16" />
      </g>
      <circle cx="11" cy="11" r="5" fill={W.sun} stroke={W.sunStroke} strokeWidth="1.3" />
      <path
        d="M23.5 26H11a5 5 0 0 1-0.6-9.96A6 6 0 0 1 22.4 17.2 4.5 4.5 0 0 1 23.5 26z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IcWeatherCloudy() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
      <path
        d="M27 18.5a4 4 0 0 1-2.8 3.8 4.5 4.5 0 0 0-3.4-5.6 6 6 0 0 0-9.4-3.3A4 4 0 0 1 18 11a4.5 4.5 0 0 1 4.5 4.1A4 4 0 0 1 27 18.5z"
        fill={W.cloudEdge}
      />
      <path
        d="M22.5 26H9.5a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.4 17.2 4.5 4.5 0 0 1 22.5 26z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IcWeatherRain() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
      <path
        d="M23 21H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 12.2 4.5 4.5 0 0 1 23 21z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <g fill={W.rain}>
        <path d="M11 24c-0.5 1-1 2-1 2.7a1 1 0 1 0 2 0c0-0.7-0.5-1.7-1-2.7z" />
        <path d="M16 25c-0.5 1-1 2-1 2.7a1 1 0 1 0 2 0c0-0.7-0.5-1.7-1-2.7z" />
        <path d="M21 24c-0.5 1-1 2-1 2.7a1 1 0 1 0 2 0c0-0.7-0.5-1.7-1-2.7z" />
      </g>
    </svg>
  )
}

function IcWeatherThunderstorm() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
      <path
        d="M23 21H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 12.2 4.5 4.5 0 0 1 23 21z"
        fill={W.cloudDark}
        stroke="#7C8B9A"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 21l-3.5 5h2.7l-1.2 4 4.5-6h-2.6l1.6-3z"
        fill={W.bolt}
        stroke="#E5B82E"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IcWeatherSnow() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
      <path
        d="M23 21H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 12.2 4.5 4.5 0 0 1 23 21z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <g stroke={W.snowEdge} strokeWidth="1.4" strokeLinecap="round">
        <line x1="11" y1="24" x2="11" y2="28" />
        <line x1="9"  y1="26" x2="13" y2="26" />
        <line x1="16" y1="24" x2="16" y2="28" />
        <line x1="14" y1="26" x2="18" y2="26" />
        <line x1="21" y1="24" x2="21" y2="28" />
        <line x1="19" y1="26" x2="23" y2="26" />
      </g>
    </svg>
  )
}

function IcWeatherFog() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
      <path
        d="M23 18H10a5 5 0 0 1-0.6-9.96A6.5 6.5 0 0 1 21.9 9.2 4.5 4.5 0 0 1 23 18z"
        fill={W.cloud}
        stroke={W.cloudEdge}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <g stroke={W.fog} strokeWidth="2" strokeLinecap="round">
        <line x1="6"  y1="22" x2="26" y2="22" />
        <line x1="8"  y1="26" x2="24" y2="26" />
        <line x1="11" y1="30" x2="22" y2="30" />
      </g>
    </svg>
  )
}

function CartaoPraia({ praia }: { praia: PraiaComMeteo }) {
  const m = praia.meteo

  return (
    <Link to={`/praia/${praia.id}`} className="bg-white rounded-xl px-4 py-3 shadow-sm block">
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none pt-0.5">{iconeEstadoTempo(m?.estado_tempo)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-semibold text-gray-800 text-sm truncate">{praia.nome}</p>
            {praia.distancia_minutos != null && (
              <span className="text-xs text-sky-600 shrink-0">~{praia.distancia_minutos} min</span>
            )}
          </div>
          <p className="text-gray-400 text-xs mb-1.5">
            {[
              praia.concelho,
              m?.temp_max != null ? `${m.temp_max}°C` : null,
              m?.vento_intensidade != null ? labelVento(m.vento_intensidade) : null,
            ].filter(Boolean).join(' · ')}
          </p>
          <div className="flex flex-wrap gap-1">
            {praia.bandeira_azul && (
              <span className="text-[10px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
                🏳️ Bandeira Azul
              </span>
            )}
            {praia.nadador_salvador && (
              <span className="text-[10px] bg-sky-50 text-sky-600 rounded-full px-2 py-0.5">
                🏊 Nadador-Salvador
              </span>
            )}
            {praia.acessivel && (
              <span className="text-[10px] bg-green-50 text-green-600 rounded-full px-2 py-0.5">
                ♿ Acessível
              </span>
            )}
            {praia.restaurante && (
              <span className="text-[10px] bg-orange-50 text-orange-600 rounded-full px-2 py-0.5">
                🍽️ Restaurante
              </span>
            )}
            {praia.estacionamento !== 'inexistente' && (
              <span className="text-[10px] bg-slate-50 text-slate-600 rounded-full px-2 py-0.5">
                🅿️ {praia.estacionamento === 'gratuito' ? 'Estac. grátis' : praia.estacionamento === 'pago' ? 'Estac. pago' : 'Estacionamento'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

interface ListaPraiasProps {
  praias: PraiaComMeteo[]
}

export default function ListaPraias({ praias }: ListaPraiasProps) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS)
  const [pesquisa, setPesquisa] = useState('')
  const [visiveis, setVisiveis] = useState(PAGINA)

  function toggleTipo(tipo: 'costeira' | 'fluvial' | 'albufeira') {
    setFiltros(f => ({ ...f, tipo: f.tipo === tipo ? null : tipo }))
    setVisiveis(PAGINA)
  }

  function toggleServico(
    servico: keyof Pick<Filtros, 'bandeira_azul' | 'nadador_salvador' | 'acessivel' | 'restaurante'>,
  ) {
    setFiltros(f => ({ ...f, [servico]: !f[servico] }))
    setVisiveis(PAGINA)
  }

  const filtradas = useMemo(() => {
    let res = praias

    if (pesquisa.trim()) {
      const q = pesquisa.toLowerCase()
      res = res.filter(
        p => p.nome.toLowerCase().includes(q) || (p.concelho?.toLowerCase().includes(q) ?? false),
      )
    }

    if (filtros.tipo)            res = res.filter(p => p.tipo === filtros.tipo)
    if (filtros.bandeira_azul)   res = res.filter(p => p.bandeira_azul)
    if (filtros.nadador_salvador) res = res.filter(p => p.nadador_salvador)
    if (filtros.acessivel)       res = res.filter(p => p.acessivel)
    if (filtros.restaurante)     res = res.filter(p => p.restaurante)

    return [...res].sort((a, b) => {
      if (a.distancia_minutos != null && b.distancia_minutos != null)
        return a.distancia_minutos - b.distancia_minutos
      if (a.distancia_minutos != null) return -1
      if (b.distancia_minutos != null) return 1
      return a.nome.localeCompare(b.nome, 'pt')
    })
  }, [praias, filtros, pesquisa])

  const chip = (ativo: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer select-none whitespace-nowrap ${
      ativo
        ? 'bg-sky-600 border-sky-600 text-white'
        : 'bg-white border-gray-200 text-gray-600'
    }`

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        placeholder="Pesquisar praia ou concelho…"
        value={pesquisa}
        onChange={e => { setPesquisa(e.target.value); setVisiveis(PAGINA) }}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-sky-400"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => toggleTipo('costeira')}       className={chip(filtros.tipo === 'costeira')}>🌊 Costeira</button>
        <button onClick={() => toggleTipo('fluvial')}        className={chip(filtros.tipo === 'fluvial')}>🏞️ Fluvial</button>
        <button onClick={() => toggleTipo('albufeira')}      className={chip(filtros.tipo === 'albufeira')}>💧 Albufeira</button>
        <button onClick={() => toggleServico('bandeira_azul')}    className={chip(filtros.bandeira_azul)}>🏳️ Bandeira Azul</button>
        <button onClick={() => toggleServico('nadador_salvador')} className={chip(filtros.nadador_salvador)}>🏊 Nadador-Salvador</button>
        <button onClick={() => toggleServico('acessivel')}        className={chip(filtros.acessivel)}>♿ Acessível</button>
        <button onClick={() => toggleServico('restaurante')}      className={chip(filtros.restaurante)}>🍽️ Restaurante</button>
      </div>

      <p className="text-xs text-gray-400 px-1">{filtradas.length} praias</p>

      <div className="flex flex-col gap-2">
        {filtradas.slice(0, visiveis).map(p => (
          <CartaoPraia key={p.id} praia={p} />
        ))}

        {filtradas.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            Nenhuma praia encontrada com estes filtros.
          </p>
        )}

        {visiveis < filtradas.length && (
          <button
            onClick={() => setVisiveis(v => v + PAGINA)}
            className="mt-1 py-2.5 text-sm text-sky-600 font-medium bg-white rounded-xl border border-gray-200"
          >
            Ver mais ({filtradas.length - visiveis} restantes)
          </button>
        )}
      </div>
    </div>
  )
}
