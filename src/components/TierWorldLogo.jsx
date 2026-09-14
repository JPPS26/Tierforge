import React from "react";

/**
 * Logótipo Oficial da Plataforma TierWorld
 * Combina um globo tridimensional orbital com os degraus de ranking de tier lists em gradiente roxo/ciano.
 */
export default function TierWorldLogo({
  size = 36,
  showText = true,
  className = "",
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Símbolo do Logótipo */}
      <div
        className="relative flex items-center justify-center rounded-[12px] shadow-glow transition-transform duration-300 group-hover:scale-105"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #1C1C28 0%, #12121A 100%)",
          border: "1px solid rgba(124, 92, 255, 0.4)",
        }}
      >
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Círculo do Globo */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#tw-globe-grad)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            opacity="0.8"
          />

          {/* Meridianos Orbitais */}
          <ellipse
            cx="24"
            cy="24"
            rx="20"
            ry="9"
            stroke="#7C5CFF"
            strokeWidth="1.5"
            opacity="0.4"
            transform="rotate(-25 24 24)"
          />

          {/* Degraus de Ranking (Tiers S, A, B) */}
          {/* Tier S (Topo) */}
          <rect
            x="16"
            y="12"
            width="16"
            height="4"
            rx="2"
            fill="url(#tw-tier-s)"
          />

          {/* Tier A (Meio) */}
          <rect
            x="12"
            y="19"
            width="24"
            height="4"
            rx="2"
            fill="url(#tw-tier-a)"
          />

          {/* Tier B (Base) */}
          <rect
            x="9"
            y="26"
            width="30"
            height="4"
            rx="2"
            fill="url(#tw-tier-b)"
          />

          {/* Ponto / Estrela de Destaque */}
          <circle cx="24" cy="36" r="2" fill="#00E5A3" />

          {/* Definições de Gradientes */}
          <defs>
            <linearGradient
              id="tw-globe-grad"
              x1="4"
              y1="4"
              x2="44"
              y2="44"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#7C5CFF" />
              <stop offset="1" stopColor="#00E5A3" />
            </linearGradient>

            <linearGradient
              id="tw-tier-s"
              x1="16"
              y1="12"
              x2="32"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FF3B5C" />
              <stop offset="1" stopColor="#FF6B7A" />
            </linearGradient>

            <linearGradient
              id="tw-tier-a"
              x1="12"
              y1="19"
              x2="36"
              y2="23"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#7C5CFF" />
              <stop offset="1" stopColor="#A259FF" />
            </linearGradient>

            <linearGradient
              id="tw-tier-b"
              x1="9"
              y1="26"
              x2="39"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#00E5A3" />
              <stop offset="1" stopColor="#4D96FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Nome da Marca com Tipografia Estilizada */}
      {showText && (
        <div className="flex items-baseline">
          <span className="font-display text-[22px] font-black tracking-tight text-white">
            Tier
          </span>
          <span
            className="font-display text-[22px] font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #A259FF 0%, #00E5A3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            World
          </span>
        </div>
      )}
    </div>
  );
}

