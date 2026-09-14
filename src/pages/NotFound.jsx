import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Home,
  Layers,
  Plus,
  ArrowLeft,
  Search,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-160px)] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
      {/* Luzes Ambientais de Fundo (Glow Prestige) */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-accent/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-[#00E5A3]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#FF5470]/10 blur-[100px]" />

      {/* Cartão Central Glassmorphic */}
      <div className="w-full max-w-[760px] rounded-[32px] border border-white/10 bg-[#12121C]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl text-center">
        {/* Badge do Erro */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5470]/40 bg-[#FF5470]/10 px-4 py-1.5 text-[12px] font-bold text-[#FF8599] mb-6 shadow-sm">
          <HelpCircle size={14} className="text-[#FF5470]" />
          <span>{t("notFound.badge") || "Erro 404 — Página Não Encontrada"}</span>
        </div>

        {/* 404 Grande com Tipografia Estilizada */}
        <div className="relative mb-4 select-none">
          <div className="font-display text-[84px] sm:text-[112px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#B6A5FF] via-white to-[#00E5A3] opacity-90 drop-shadow-[0_10px_30px_rgba(124,92,255,0.3)]">
            404
          </div>
        </div>

        {/* Título e Explicação */}
        <h1 className="font-display text-[26px] sm:text-[34px] font-black text-white tracking-tight leading-tight mb-3">
          {t("notFound.title") || "Perdeste-te no TierWorld?"}
        </h1>
        <p className="text-[14.5px] sm:text-[15.5px] text-muted max-w-xl mx-auto leading-relaxed mb-10">
          {t("notFound.subtitle") ||
            "O link que seguiste pode ter sido movido, eliminado ou nunca existiu. Mas não te preocupes: podes navegar pelas opções abaixo ou voltar ao início."}
        </p>

        {/* Grelha de Ações Rápidas em Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-10 text-left">
          {/* Card 1: Página Inicial */}
          <Link
            to="/"
            className="group relative flex flex-col justify-between p-4.5 rounded-2xl border border-white/[0.08] bg-[#161624]/80 hover:border-accent/60 hover:bg-[#1A1A2C] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/30 text-accent mb-3 group-hover:scale-110 transition-transform">
              <Home size={18} />
            </div>
            <div>
              <div className="font-display text-[14.5px] font-bold text-white group-hover:text-accent transition-colors">
                {t("notFound.homeBtn") || "Página Inicial"}
              </div>
              <p className="text-[12px] text-mutedDim mt-0.5 leading-snug">
                Volta ao feed principal e às listas do momento.
              </p>
            </div>
          </Link>

          {/* Card 2: Explorar Tier Lists */}
          <Link
            to="/explore"
            className="group relative flex flex-col justify-between p-4.5 rounded-2xl border border-white/[0.08] bg-[#161624]/80 hover:border-[#00E5A3]/60 hover:bg-[#1A1A2C] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5A3]/10 border border-[#00E5A3]/30 text-[#00E5A3] mb-3 group-hover:scale-110 transition-transform">
              <Compass size={18} />
            </div>
            <div>
              <div className="font-display text-[14.5px] font-bold text-white group-hover:text-[#00E5A3] transition-colors">
                {t("notFound.exploreBtn") || "Explorar Rankings"}
              </div>
              <p className="text-[12px] text-mutedDim mt-0.5 leading-snug">
                Descobre centenas de tier lists da comunidade.
              </p>
            </div>
          </Link>

          {/* Card 3: Categorias Ativas */}
          <Link
            to="/categories"
            className="group relative flex flex-col justify-between p-4.5 rounded-2xl border border-white/[0.08] bg-[#161624]/80 hover:border-[#FFD166]/60 hover:bg-[#1A1A2C] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/30 text-[#FFD166] mb-3 group-hover:scale-110 transition-transform">
              <Layers size={18} />
            </div>
            <div>
              <div className="font-display text-[14.5px] font-bold text-white group-hover:text-[#FFD166] transition-colors">
                {t("notFound.categoriesBtn") || "Ver Categorias"}
              </div>
              <p className="text-[12px] text-mutedDim mt-0.5 leading-snug">
                Futebol, gaming, cinema, música e mais.
              </p>
            </div>
          </Link>
        </div>

        {/* Botões de Ação Inferiores */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface/80 px-4.5 py-2.5 text-[13px] font-bold text-white hover:bg-surface2 hover:border-white/20 transition-all"
          >
            <ArrowLeft size={15} />
            <span>Voltar à página anterior</span>
          </button>

          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] px-5 py-2.5 text-[13px] font-bold text-white shadow-glow hover:from-[#8B6EFA] hover:to-[#7954F5] transition-all"
          >
            <Plus size={15} />
            <span>{t("notFound.createBtn") || "Criar Nova Tier List"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
