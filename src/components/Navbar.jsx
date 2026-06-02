import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/rate', label: 'Rate Deck' },
    { to: '/create', label: 'Create Deck' },
    { to: '/research', label: 'Research' },
  ]

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(12, 18, 32, 0.75)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-[52px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-black"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            P
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            PitchDeck <span style={{ color: 'var(--accent)', fontWeight: 400 }}>AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {links.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className="relative px-3.5 py-1.5 text-sm rounded-lg transition-colors"
                style={{
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  background: active ? 'var(--surface-md)' : 'transparent',
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
