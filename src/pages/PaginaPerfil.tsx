import Header from '../components/Header'
import { usePerfil } from '../hooks/usePerfil'
import { useLocalizacao } from '../hooks/useLocalizacao'
import { useAuth } from '../hooks/useAuth'
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
  { valor: 25,  label: '25 km' },
  { valor: 50,  label: '50 km' },
  { valor: 100, label: '100 km' },
  { valor: 200, label: '200 km' },
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
  const { user, signInWithGoogle, signOut } = useAuth()

  const nome = user?.user_metadata?.full_name as string | undefined
  const email = user?.email
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <div style={{ paddingBottom: 90 }}>
      <Header />

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Account */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16 }}>
          <p style={LABEL_ST}>Conta</p>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: C.accent, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 500, flexShrink: 0,
                }}>
                  {(nome ?? email ?? '?').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {nome && <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome}</p>}
                {email && <p style={{ fontSize: 12, color: C.text2, margin: nome ? '2px 0 0' : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>}
              </div>
              <button
                onClick={signOut}
                style={{
                  background: 'transparent',
                  border: `0.5px solid rgba(255,255,255,0.15)`,
                  color: C.text2,
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: C.text2, margin: '0 0 12px', lineHeight: 1.5 }}>
                Inicia sessão para sincronizar as tuas praias favoritas em todos os dispositivos.
              </p>
              <button
                onClick={signInWithGoogle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '11px 14px',
                  background: 'white',
                  color: '#1f2937',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
                </svg>
                Entrar com Google
              </button>
            </div>
          )}
        </div>

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
