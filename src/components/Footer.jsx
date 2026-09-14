import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import TierWorldLogo from "./TierWorldLogo";
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
  ArrowUp,
} from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-[#0B0C12]/90 backdrop-blur-xl">
      {/* Secção Principal do Rodapé */}
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Coluna 1: Logótipo & Marca */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <TierWorldLogo size={36} showText={true} />
            </Link>
            <p className="text-[13.5px] leading-relaxed text-muted">
              {t("footer.tagline") ||
                "A plataforma global definitiva para criar, comparar e debater rankings com dados e métricas 100% autênticas."}
            </p>

            {/* Status do Sistema */}
            <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-border bg-surface2/60 px-3 py-1.5 text-[11.5px] text-mutedDim w-fit">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5A3] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E5A3]"></span>
              </span>
              <span>Plataforma Online • tierworld.netlify.app</span>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-[13px] font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Compass size={15} className="text-accent" />
              Navegar
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13.5px] text-muted">
              <li>
                <Link
                  to="/"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block"
                >
                  {t("nav.explore") || "Explorar Tier Lists"}
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block"
                >
                  {t("nav.categories") || "Categorias Ativas"}
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block"
                >
                  {t("nav.leaderboard") || "Classificação de Criadores"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Criar & Comunidade */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-[13px] font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <PlusCircle size={15} className="text-[#00E5A3]" />
              Comunidade
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13.5px] text-muted">
              <li>
                <Link
                  to="/create"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block font-medium text-text"
                >
                  {t("nav.create") || "Criar Nova Tier List"}
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block"
                >
                  {t("nav.profile") || "O Meu Perfil"}
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?sort=most_voted"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block"
                >
                  Mais Populares da Semana
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?sort=newest"
                  className="transition-colors hover:text-text hover:translate-x-0.5 inline-block"
                >
                  Recém-Publicadas
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Funcionalidades */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-[13px] font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#FFD166]" />
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

        {/* Linha Inferior com Copyright e Badges */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 sm:flex-row text-[12.5px] text-mutedDim">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-white">TierWorld</span>
            <span>•</span>
            <span>© {currentYear} {t("footer.rights") || "Todos os direitos reservados."}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
              tierworld.netlify.app
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted hover:border-accent/40 hover:bg-surface2 hover:text-white transition-all group"
            >
              <span>Voltar ao topo</span>
              <ArrowUp size={12} className="transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

