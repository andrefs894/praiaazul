import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navy      = '#1E3A5F'
const cream     = '#EDE3CD'
const creamText = '#F5EFE0'
const creamDim  = 'rgba(245,239,224,0.65)'

export default function Header() {
  const { user } = useAuth()
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <header style={{
      background: navy,
      padding: '18px 20px 40px',
      position: 'relative',
    }}>
      <svg
        aria-hidden
        style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 36, display: 'block' }}
        viewBox="0 0 420 36" preserveAspectRatio="none"
      >
        <path d="M0,18 Q105,0 210,18 T420,18 L420,36 L0,36 Z" fill={cream} />
      </svg>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}>
        <p style={{
          color: creamText, fontSize: 12, fontWeight: 600,
          letterSpacing: '2px', margin: 0,
        }}>
          MARÉ ALTA
        </p>
        <Link
          to="/perfil"
          aria-label="Perfil"
          style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: -10,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              style={{ width: 28, height: 28, borderRadius: '50%', display: 'block', objectFit: 'cover' }}
            />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={creamDim} strokeWidth="1.8" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </Link>
      </div>
    </header>
  )
}
