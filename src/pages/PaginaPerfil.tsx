import Header from '../components/Header'
import { usePerfil } from '../hooks/usePerfil'
import { useLocalizacao } from '../hooks/useLocalizacao'
import type { TipoPerfil, DistanciaMaxima } from '../types'

const C = {
  card: '#132A3A', accent: '#1A6FB5',
  text: '#E8EDF2', text2: '#7A8A9E', border: '#1A3D52',
} as const

const LABEL_ST: React.CSSProperties = {
  fontSize: 10, fontWeight: 500, color: '#7A8A9E',
  letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px',
}

const TIPOS: { valor: TipoPerfil; label: string }[] = [
  { valor: 'familia', label: 'Família' },
  { valor: 'tranquila', label: 'Sossego' },
  { valor: 'surf', label: 'Surf' },
  { valor: 'social', label: 'Social' },
]

const DISTANCIAS: { valor: DistanciaMaxima; label: string }[] = [
  { valor: 15, label: '15 min' },
  { valor: 30, label: '30 min' },
  { valor: 60, label: '1h' },
  { valor: null, label: 'Tanto faz' },
]

function ChipSeletor({
  label,
  ativo,
  onClick,
}: {
  label: string
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 20,
        border: `0.5px solid ${ativo ? C.accent : 'rgba(255,255,255,0.15)'}`,
        background: ativo ? C.accent : 'transparent',
        color: ativo ? 'white' : C.text2,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  )
}

export default function PaginaPerfil() {
  const { perfil, atualizar } = usePerfil()
  const { coordenadas, erro: erroLoc } = useLocalizacao()

  return (
    <div style={{ paddingBottom: 90 }}>
      <Header />

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* What are you looking for */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
          <p style={LABEL_ST}>O que procuras?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TIPOS.map(({ valor, label }) => (
              <ChipSeletor
                key={valor}
                label={label}
                ativo={perfil.tipo === valor}
                onClick={() => atualizar({ tipo: valor })}
              />
            ))}
          </div>
        </div>

        {/* Max distance */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
          <p style={LABEL_ST}>Distância máxima</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DISTANCIAS.map(({ valor, label }) => (
              <ChipSeletor
                key={String(valor)}
                label={label}
                ativo={perfil.distancia_maxima === valor}
                onClick={() => atualizar({ distancia_maxima: valor })}
              />
            ))}
          </div>
        </div>

        {/* Location */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
          <p style={LABEL_ST}>Localização</p>
          {coordenadas ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#3DD9C4', flexShrink: 0,
              }} />
              <div>
                <p style={{ fontSize: 14, color: C.text, margin: 0 }}>Localização detectada</p>
                <p style={{ fontSize: 12, color: C.text2, margin: '2px 0 0' }}>
                  {coordenadas.lat.toFixed(4)}°N, {Math.abs(coordenadas.lng).toFixed(4)}°W
                </p>
              </div>
            </div>
          ) : erroLoc ? (
            <div>
              <p style={{ fontSize: 14, color: '#7A8A9E', margin: '0 0 6px' }}>Localização não disponível</p>
              <p style={{ fontSize: 12, color: '#5A7A8A', margin: 0 }}>
                Permite o acesso à localização no browser para ver distâncias e recomendações por raio.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: C.text2, margin: 0 }}>A detectar localização…</p>
          )}
        </div>

        {/* App info */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
          <p style={LABEL_ST}>Sobre</p>
          <p style={{ fontSize: 13, color: C.text2, margin: 0, lineHeight: 1.6 }}>
            Praia Azul recomenda a melhor praia para ti com base no tempo, vento, distância e o teu perfil. Dados meteorológicos: IPMA. Dados de praias: APA/SNIAmb.
          </p>
        </div>

      </div>
    </div>
  )
}
