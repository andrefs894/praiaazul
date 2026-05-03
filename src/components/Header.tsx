import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 20px 12px',
      }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#1A6FB5', letterSpacing: '0.5px', margin: 0 }}>
            PRAIA AZUL
          </p>
          <p style={{ fontSize: 11, color: '#7A8A9E', margin: '2px 0 0' }}>
            A melhor praia para ti, hoje
          </p>
        </div>
        <Link to="/perfil" style={{ display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A8A9E" strokeWidth="1.8" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>
      </header>
    </div>
  )
}
