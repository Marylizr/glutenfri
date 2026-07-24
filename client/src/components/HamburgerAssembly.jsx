const IMAGES = {
  pan: '/images/pan.png',
  rucula: '/images/rucula.png',
  tomate: '/images/tomate.png',
  queso: '/images/queso.png',
  carne: '/images/carne.png',
  salsa: '/images/salsa.png',
  panBottom: '/images/pan-bottom.png',
  plato: '/images/plato.png',
};

const LAYERS = [
  { key: 'pan', src: IMAGES.pan, x: 10.25, y: 0, width: 432, height: 185.5, delay: 0.6, duration: 0.62 },
  { key: 'rucula', src: IMAGES.rucula, x: 9.5, y: 81, width: 432, height: 131.5, delay: 0.5, duration: 0.6 },
  { key: 'tomate', src: IMAGES.tomate, x: 8.75, y: 96, width: 431, height: 140.5, delay: 0.4, duration: 0.6 },
  { key: 'queso', src: IMAGES.queso, x: 12, y: 118, width: 432, height: 127, delay: 0.3, duration: 0.6 },
  { key: 'carne', src: IMAGES.carne, x: 10, y: 151, width: 432, height: 103, delay: 0.2, duration: 0.58 },
  { key: 'salsa', src: IMAGES.salsa, x: 11.25, y: 172, width: 430, height: 97, delay: 0.1, duration: 0.58 },
  { key: 'panBottom', src: IMAGES.panBottom, x: 13, y: 180, width: 431, height: 95, delay: 0, duration: 0.58 },
];

export default function HamburgerAssembly() {
  return (
    <div className="gf-hamburger-animation">
      <style>{CSS}</style>
      <svg
        className="gf-hamburger-stage"
        viewBox="0 0 700 560"
        role="img"
        aria-label="Hamburguesa sin gluten montándose capa a capa"
      >
        <circle cx="350" cy="280" r="230" fill="#dfeadd" />
        <circle cx="265" cy="365" r="100" fill="#f3e1d8" opacity="0.72" />

        <g transform="translate(350 280) scale(2.1) translate(-230 -190)">
          {LAYERS.map((layer) => (
            <image
              key={layer.key}
              className="gf-burger-layer"
              href={layer.src}
              x={layer.x}
              y={layer.y}
              width={layer.width}
              height={layer.height}
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{
                animationDuration: `${layer.duration}s`,
                animationDelay: `${layer.delay}s`,
              }}
            />
          ))}

          <image
            className="gf-burger-plate"
            href={IMAGES.plato}
            x="16.25"
            y="214"
            width="429"
            height="111.5"
            preserveAspectRatio="none"
            aria-hidden="true"
          />
        </g>
      </svg>

      <div className="gf-burger-badge" aria-hidden="true">
        <span>✓</span>
        100% sin gluten
      </div>
    </div>
  );
}

const CSS = `
.gf-hamburger-animation {
  position: relative;
  width: calc(100% + 20px);
  height: clamp(240px, 34dvh, 320px);
  margin: 0 -10px 2px;
  flex: 0 1 auto;
  overflow: hidden;
}

.gf-hamburger-stage {
  display: block;
  width: 100%;
  height: 100%;
}

.gf-burger-layer {
  opacity: 0;
  animation-name: gfBurgerFallIn;
  animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-fill-mode: both;
}

.gf-burger-plate {
  opacity: 0;
  animation: gfBurgerPlateIn 0.5s ease-out both;
}

.gf-burger-badge {
  position: absolute;
  z-index: 2;
  bottom: 13%;
  left: 7%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  color: #fff;
  background: #3d5a45;
  box-shadow: 0 6px 16px rgba(38, 65, 46, 0.28);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  animation: gfBurgerBadgeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s both;
}

.gf-burger-badge span {
  display: grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  font-size: 10px;
}

@keyframes gfBurgerFallIn {
  0% { transform: translateY(-420px); opacity: 0; }
  55% { opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes gfBurgerPlateIn {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes gfBurgerBadgeIn {
  0% { transform: translateY(-80px) scale(0.8); opacity: 0; }
  60% { opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .gf-burger-layer,
  .gf-burger-plate,
  .gf-burger-badge {
    animation: none !important;
    opacity: 1 !important;
  }
}
`;
