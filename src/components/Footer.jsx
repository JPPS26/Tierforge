import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import TierWorldLogo from "./TierWorldLogo";
import LanguageSelector from "./LanguageSelector";
import {
  Compass,
  Layers,
  Trophy,
  PlusCircle,
  ShieldCheck,
  Zap,
  Globe,
  Heart,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/[0.08] bg-[#090A10]/95 backdrop-blur-2xl">
      {/* Hairline com gradiente luminoso no topo */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* Luz ambiente de fundo sutil */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-64 w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(124,92,255,0.12),transparent_70%)]" />

      {/* Secção Principal do Rodapé */}
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Coluna 1: Logótipo & Marca */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <TierWorldLogo size={36} showText={true} />
            </Link>
            <p className="text-[13.5px] leading-relaxed text-muted font-normal">
              {t("footer.tagline") ||
                "A plataforma global definitiva para criar, comparar e debater rankings com dados e métricas 100% autênticas."}
            </p>

            {/* Status do Sistema */}
            <div className="mt-1 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11.5px] text-mutedDim w-fit backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5A3] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E5A3]"></span>
              </span>
              <span>Rede Operacional • tierworld.netlify.app</span>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-display text-[12px] font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Compass size={14} className="text-accent" />
              Navegar
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13.5px] text-muted">
              <li>
                <Link
                  to="/"
                  className="transition-all duration-150 hover:text-white hover:translate-x-1 inline-block"
                >
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="transition-all duration-150 hover:text-white hover:translate-x-1 inline-block"
                >
                  {t("nav.explore") || "Explorar Tier Lists"}
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="transition-all duration-150 hover:text-white hover:translate-x-1 inline-block"
                >
                  {t("nav.leaderboard") || "Classificação de Criadores"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Criar & Comunidade */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-display text-[12px] font-black uppercase tracking-wider text-white flex items-center gap-2">
              <PlusCircle size={14} className="text-[#00E5A3]" />
              Comunidade
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13.5px] text-muted">
              <li>
                <Link
                  to="/create"
                  className="transition-all duration-150 hover:text-accent hover:translate-x-1 inline-block font-semibold text-text"
                >
                  + {t("nav.create") || "Criar Nova Tier List"}
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="transition-all duration-150 hover:text-white hover:translate-x-1 inline-block"
                >
                  {t("nav.profile") || "O Meu Perfil"}
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?sort=most_voted"
                  className="transition-all duration-150 hover:text-white hover:translate-x-1 inline-block"
                >
                  Mais Populares
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?sort=newest"
                  className="transition-all duration-150 hover:text-white hover:translate-x-1 inline-block"
                >
                  Recém-Publicadas
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Funcionalidades */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-display text-[12px] font-black uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#FFD166]" />
              Destaques
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-mutedDim">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                <span>Dados 100% Autênticos em Nuvem</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E5A3]"></span>
                <span>Notificações em Tempo Real no Site</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5470]"></span>
                <span>Duelo 1 vs 1 Interativo</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFD166]"></span>
                <span>Exportação HD para Redes Sociais</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Inferior com Copyright, Seletor de Idioma e Domínio */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row text-[12.5px] text-mutedDim">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white">TierWorld</span>
            <span>•</span>
            <span>© {currentYear} {t("footer.rights") || "Todos os direitos reservados."}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Seletor de Idioma */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-mutedDim flex items-center gap-1">
                <Globe size={13} /> {t("footer.language") || "Idioma:"}
              </span>
              <LanguageSelector compact direction="up" />
            </div>

            <span className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted">
              tierworld.netlify.app
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

