import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Inicio', icon: '⌂', end: true },
  { to: '/mapa', label: 'Mapa', icon: '⚲' },
  { to: '/guardados', label: 'Guardados', icon: '♡' },
  { to: '/reseñas', label: 'Reseñas', icon: '✎' },
  { to: '/perfil', label: 'Perfil', icon: '◍' },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          style={({ isActive }) => ({
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontSize: '11px',
            fontWeight: isActive ? 600 : 400,
            textDecoration: 'none',
          })}
        >
          <span style={{ fontSize: '18px' }}>{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
