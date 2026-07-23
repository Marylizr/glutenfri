const TABS = [
  { key: 'home', label: 'Inicio', icon: '⌂' },
  { key: 'map', label: 'Mapa', icon: '⚲' },
  { key: 'saved', label: 'Guardados', icon: '♡' },
  { key: 'reviews', label: 'Reseñas', icon: '✎' },
  { key: 'profile', label: 'Perfil', icon: '◍' },
];

export default function BottomNav({ active, onChange }) {
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
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? 600 : 400,
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
