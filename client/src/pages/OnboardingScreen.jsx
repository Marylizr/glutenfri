import { useEffect, useState } from 'react';
import HamburgerAssembly from '../components/HamburgerAssembly';

const LANGUAGE_KEY = 'gf_language';

const COPY = {
  es: {
    language: 'Idioma',
    badge: '100% sin gluten',
    title: 'Encuentra lugares seguros',
    titleAccent: 'sin gluten en el norte',
    description:
      'Descubre restaurantes, cafeterías, tiendas y pastelerías de Braga, Porto, Maia, Matosinhos y alrededores.',
    features: [
      'Lugares sin gluten verificados',
      'Reseñas de seguridad de la comunidad',
      'Filtros pensados para personas celíacas',
    ],
    start: 'Empezar a explorar',
    account: '¿Ya tienes cuenta? Inicia sesión',
  },
  pt: {
    language: 'Idioma',
    badge: '100% sem glúten',
    title: 'Encontra lugares seguros',
    titleAccent: 'sem glúten no norte',
    description:
      'Descobre restaurantes, cafés, lojas e pastelarias em Braga, Porto, Maia, Matosinhos e arredores.',
    features: [
      'Locais sem glúten verificados',
      'Avaliações de segurança da comunidade',
      'Filtros pensados para pessoas celíacas',
    ],
    start: 'Começar a explorar',
    account: 'Já tens conta? Inicia sessão',
  },
  en: {
    language: 'Language',
    badge: '100% gluten-free',
    title: 'Find safe places',
    titleAccent: 'to eat gluten-free up north',
    description:
      'Discover restaurants, cafés, shops and bakeries in Braga, Porto, Maia, Matosinhos and nearby areas.',
    features: [
      'Verified gluten-free places',
      'Community safety reviews',
      'Filters designed for people with coeliac disease',
    ],
    start: 'Start exploring',
    account: 'Already have an account? Log in',
  },
};

function getInitialLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved && COPY[saved]) return saved;

  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return COPY[browserLanguage] ? browserLanguage : 'es';
}

export default function OnboardingScreen({ onStart, onLogin }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const copy = COPY[language];

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fffbed',
        padding: '10px 30px 24px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          minHeight: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            color: '#65504a',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          glutenfri
        </span>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 10px',
            border: '1px solid rgba(101, 80, 74, 0.22)',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.72)',
            color: '#65504a',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span aria-hidden="true">🌐</span>
          <select
            aria-label={copy.language}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            style={{
              border: 0,
              outline: 0,
              background: 'transparent',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="es">Español</option>
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      <HamburgerAssembly badge={copy.badge} />

      <h1
        style={{
          fontSize: '30px',
          lineHeight: 1.16,
          margin: '4px 0 14px',
          textAlign: 'center',
          letterSpacing: '-0.025em',
        }}
      >
        {copy.title}
        <span style={{ display: 'block', color: '#a8462f' }}>{copy.titleAccent}</span>
      </h1>
      <p
        style={{
          color: '#65504a',
          fontSize: '15px',
          lineHeight: 1.5,
          margin: '0 auto 20px',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        {copy.description}
      </p>

      <div style={{ width: '100%', maxWidth: '330px', margin: '0 auto 18px' }}>
        {copy.features.map((feature) => (
          <div
            key={feature}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                color: 'var(--color-accent)',
                border: '1.5px solid var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span style={{ fontSize: '14px', color: '#65504a' }}>{feature}</span>
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px',
        }}
      >
        <span style={{ width: 44, height: 8, borderRadius: 999, background: '#a8462f' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d9b9b0' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d9b9b0' }} />
      </div>

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '999px',
          border: 'none',
          background: '#a8462f',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '12px',
          boxShadow: '0 10px 22px rgba(168, 70, 47, 0.22)',
        }}
      >
        {copy.start}&nbsp;&nbsp; →
      </button>

      <button
        onClick={onLogin}
        style={{
          width: '100%',
          padding: '8px',
          background: 'none',
          border: 'none',
          color: '#65504a',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        {copy.account}
      </button>
    </div>
  );
}
