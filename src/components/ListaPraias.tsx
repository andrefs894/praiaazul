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

function iconeEstadoTempo(estado: string | null | undefined): string {
  if (!estado) return '🌤️'
  const s = estado.toLowerCase()
  if (s.includes('limpo')) return '☀️'
  if (s.includes('pouco nublado') || s.includes('parcialmente')) return '🌤️'
  if (s.includes('muito nublado') || s.includes('encoberto')) return '☁️'
  if (s.includes('trovoada')) return '⛈️'
  if (s.includes('neve')) return '🌨️'
  if (s.includes('nevoeiro')) return '🌫️'
  if (s.includes('chuva') || s.includes('aguaceiro')) return '🌧️'
  return '🌤️'
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
