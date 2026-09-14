import React from "react";

/**
 * Componente de Bandeiras Nacionais em SVG de Alta Resolução
 * Resolve o problema do Windows onde emojis de bandeiras aparecem como siglas de duas letras (PT, GB, ES, BR).
 */
export default function CountryFlag({ code, size = 18, className = "" }) {
  const normalized = (code || "").toLowerCase();

  switch (normalized) {
    case "pt":
      // Bandeira de Portugal
      return (
        <svg
          width={size}
          height={Math.round((size * 2) / 3)}
          viewBox="0 0 600 400"
          className={`inline-block rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="240" height="400" fill="#046A38" />
          <rect x="240" width="360" height="400" fill="#DA291C" />
          <circle cx="240" cy="200" r="80" fill="#FFC72C" stroke="#000" strokeWidth="6" />
          <circle cx="240" cy="200" r="55" fill="#DA291C" />
          <rect x="215" y="175" width="50" height="50" rx="6" fill="#FFFFFF" />
          <path
            d="M240 178 L240 222 M218 200 L262 200"
            stroke="#002B7F"
            strokeWidth="8"
          />
        </svg>
      );

    case "pt-br":
    case "br":
      // Bandeira do Brasil
      return (
        <svg
          width={size}
          height={Math.round((size * 2) / 3)}
          viewBox="0 0 720 504"
          className={`inline-block rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="720" height="504" fill="#009739" />
          <polygon points="360,60 660,252 360,444 60,252" fill="#FEDD00" />
          <circle cx="360" cy="252" r="120" fill="#012169" />
          <path
            d="M 246,270 A 120,120 0 0,0 474,228"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="16"
          />
        </svg>
      );

    case "en":
    case "gb":
    case "uk":
      // Bandeira do Reino Unido (Union Jack)
      return (
        <svg
          width={size}
          height={Math.round((size * 2) / 3)}
          viewBox="0 0 60 30"
          className={`inline-block rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path
              d="M0,0 L60,30 M60,0 L0,30"
              clipPath="url(#t)"
              stroke="#C8102E"
              strokeWidth="4"
            />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      );

    case "es":
      // Bandeira de Espanha
      return (
        <svg
          width={size}
          height={Math.round((size * 2) / 3)}
          viewBox="0 0 750 500"
          className={`inline-block rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="750" height="125" fill="#AA151B" />
          <rect y="125" width="750" height="250" fill="#F1BF00" />
          <rect y="375" width="750" height="125" fill="#AA151B" />
          <circle cx="180" cy="250" r="38" fill="#AA151B" opacity="0.3" />
        </svg>
      );

    case "fr":
      // Bandeira de França
      return (
        <svg
          width={size}
          height={Math.round((size * 2) / 3)}
          viewBox="0 0 900 600"
          className={`inline-block rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="300" height="600" fill="#002395" />
          <rect x="300" width="300" height="600" fill="#FFFFFF" />
          <rect x="600" width="300" height="600" fill="#ED2939" />
        </svg>
      );

    case "de":
      // Bandeira da Alemanha
      return (
        <svg
          width={size}
          height={Math.round((size * 2) / 3)}
          viewBox="0 0 5 3"
          className={`inline-block rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="5" height="1" fill="#000" />
          <rect y="1" width="5" height="1" fill="#DD0000" />
          <rect y="2" width="5" height="1" fill="#FFCE00" />
        </svg>
      );

    case "it":
      // Bandeira da Itália
      return (
        <svg
          width={size}
          height={Math.round((size * 2) / 3)}
          viewBox="0 0 3 2"
          className={`inline-block rounded-[2px] shadow-sm flex-shrink-0 ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="1" height="2" fill="#009246" />
          <rect x="1" width="1" height="2" fill="#FFFFFF" />
          <rect x="2" width="1" height="2" fill="#CE2B37" />
        </svg>
      );

    default:
      return <span className="text-[14px]">🌐</span>;
  }
}

