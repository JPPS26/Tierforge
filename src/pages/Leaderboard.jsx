import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  Sparkles,
  Trophy,
  Plus,
  Layers,
  Heart,
  Users,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  Zap,
  Info,
  Medal,
  X,
} from "lucide-react";
import { Avatar, EmptyState, PrimaryButton } from "../components/UI";
import { getLeaderboard } from "../services/db";
import useRealtimeDb from "../hooks/useRealtimeDb";

function getPatentBadge(badge) {
  if (badge === "Criador de Elite") {
    return {
      label: "Elite",
      icon: Crown,
      classes: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    };
  }
  if (badge === "Criador Verificado") {
    return {
      label: "Verificado",
      icon: ShieldCheck,
      classes: "border-teal-400/40 bg-teal-400/10 text-teal-300",
    };
  }
  if (badge === "Criador em Ascensão") {
    return {
      label: "Em Ascensão",
      icon: Flame,
      classes: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    };
  }
  if (badge === "Criador Ativo") {
    return {
      label: "Ativo",
      icon: Zap,
      classes: "border-accent/40 bg-accent/10 text-[#B6A5FF]",
    };
  }
  return {
    label: "Novo",
    icon: Sparkles,
    classes: "border-white/10 bg-white/5 text-mutedDim",
  };
}

function getRankVisuals(rank) {
  if (rank === 1) {
    return {
      pill: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
      icon: Crown,
      rowBg: "bg-gradient-to-r from-amber-500/[0.07] via-transparent to-transparent border-l-2 border-l-amber-400",
      barColor: "bg-gradient-to-r from-amber-400 to-orange-400",
    };
  }
  if (rank === 2) {
    return {
      pill: "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-400/60 text-teal-300 shadow-[0_0_12px_rgba(0,229,163,0.25)]",
      icon: Medal,
      rowBg: "bg-gradient-to-r from-teal-500/[0.07] via-transparent to-transparent border-l-2 border-l-teal-400",
      barColor: "bg-gradient-to-r from-teal-400 to-cyan-400",
    };
  }
  if (rank === 3) {
    return {
      pill: "bg-gradient-to-r from-rose-500/20 to-purple-500/20 border-rose-400/60 text-rose-300 shadow-[0_0_12px_rgba(255,84,112,0.25)]",
      icon: Medal,
      rowBg: "bg-gradient-to-r from-rose-500/[0.07] via-transparent to-transparent border-l-2 border-l-rose-400",
      barColor: "bg-gradient-to-r from-rose-400 to-purple-400",
    };
  }
  return {
    pill: "border-white/10 bg-white/5 text-mutedDim font-semibold",
    icon: null,
    rowBg: "border-l-2 border-l-transparent",
    barColor: "bg-gradient-to-r from-accent to-[#B6A5FF]",
  };
}

export default function Leaderboard() {
  const { t } = useLanguage();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [sortBy, setSortBy] = useState("xp");

  // Sincronização ao segundo em tempo real da classificação de criadores
  useRealtimeDb(() => {
    const ranked = getLeaderboard();
    setCreators(ranked);
    setLoading(false);
  }, []);

  const maxXP = useMemo(() => {
    if (creators.length === 0) return 1;
    return Math.max(...creators.map((c) => c.xp), 1);
  }, [creators]);

  const filteredCreators = useMemo(() => {
    let list = [...creators];

    // Filtro por texto (nome ou #handle)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim().replace(/^#/, "");
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q)
      );
    }

    // Filtro por Patente/Tier
    if (filterTier === "elite") {
      list = list.filter((c) => c.xp >= 1500 || c.badge === "Criador de Elite");
    } else if (filterTier === "verified") {
      list = list.filter((c) => c.xp >= 1000 || c.badge === "Criador Verificado");
    } else if (filterTier === "rising") {
      list = list.filter((c) => c.xp >= 500 || c.badge === "Criador em Ascensão");
    }

    // Ordenação
    if (sortBy === "votes") {
      list.sort((a, b) => b.votesCount - a.votesCount);
    } else if (sortBy === "lists") {
      list.sort((a, b) => b.listsCount - a.listsCount);
    } else if (sortBy === "followers") {
      list.sort((a, b) => b.followersCount - a.followersCount);
    } else {
      list.sort((a, b) => b.xp - a.xp);
    }

    return list;
  }, [creators, searchQuery, filterTier, sortBy]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pb-28 pt-10">
      {/* Cabeçalho Principal */}
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[12px] font-bold text-[#FFD166] shadow-sm">
          <Trophy size={13} className="text-amber-400" />
          <span>Ranking Global da Comunidade</span>
        </div>
        <h1 className="font-display text-[32px] sm:text-[44px] font-black text-white tracking-tight leading-tight">
          {t("leaderboard.title") || "Classificação de Criadores"}
        </h1>
        <p className="mt-2.5 text-[15px] text-muted max-w-2xl leading-relaxed">
          {t("leaderboard.subtitle") ||
            "O hall da fama do TierWorld. Criadores classificados dinamicamente com base nas listas publicadas, votos comunitários recebidos, visualizações e seguidores reais."}
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-muted">A carregar classificação em tempo real…</div>
      ) : creators.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t("leaderboard.empty") || "Ainda não existem criadores com pontuação suficiente."}
          cta={
            <Link to="/create" className="inline-block mt-2">
              <PrimaryButton icon={Plus}>{t("home.createBtn") || "Criar Tier List"}</PrimaryButton>
            </Link>
          }
        />
      ) : (
        <>
          {/* KPI Stats Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {/* Card 1: Líder Atual */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-[#1E1912] via-[#14110E] to-[#0D0B0A] p-4.5 shadow-lg flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_rgba(255,209,102,0.25)] shrink-0">
                <Crown size={24} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80">Líder Atual</span>
                <div className="font-display text-[16px] font-bold text-white truncate">
                  {creators[0]?.name || "Nenhum"}
                </div>
                <span className="text-[12.5px] font-black text-amber-300">
                  {(creators[0]?.xp || 0).toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Card 2: Total de Criadores */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161622] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent shadow-sm shrink-0">
                <Users size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Criadores Registados</span>
                <div className="font-display text-[22px] font-black text-white">
                  {creators.length}
                </div>
                <span className="text-[12px] font-medium text-mutedDim">Perfis com pontuação ativa</span>
              </div>
            </div>

            {/* Card 3: Total XP Conquistado */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161622] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E5A3]/40 bg-[#00E5A3]/10 text-[#00E5A3] shadow-sm shrink-0">
                <Zap size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">XP Total Distribuído</span>
                <div className="font-display text-[22px] font-black text-white">
                  {creators.reduce((acc, c) => acc + (c.xp || 0), 0).toLocaleString()} XP
                </div>
                <span className="text-[12px] font-medium text-mutedDim">Mérito comunitário calculado</span>
              </div>
            </div>
          </div>

          {/* Pódio dos Top 3 (Exibido quando existem 3 ou mais criadores sem pesquisa ativa) */}
          {creators.length >= 3 && !searchQuery && filterTier === "all" && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={16} className="text-amber-400" />
                <h2 className="font-display text-[18px] font-bold text-white tracking-tight">
                  Pódio dos Campeões
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-end">
                {/* 2º LUGAR (Prata) */}
                <Link
                  to={`/profile/${creators[1].handle}`}
                  className="group relative overflow-hidden rounded-[26px] border border-teal-500/30 bg-gradient-to-b from-[#142220]/90 to-[#0D1514] p-5 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-400/60 hover:shadow-[0_0_30px_rgba(0,229,163,0.15)] flex flex-col items-center order-2 sm:order-1"
                >
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1 rounded-full border border-teal-400/40 bg-teal-400/10 px-2.5 py-0.5 text-[11px] font-black text-teal-300">
                    🥈 #2 Lugar
                  </div>
                  <div className="mt-6 mb-3 relative">
                    <div className="p-1 rounded-full border-2 border-teal-400/50 shadow-[0_0_15px_rgba(0,229,163,0.3)]">
                      <Avatar name={creators[1].name} image={creators[1].avatar} size={54} />
                    </div>
                  </div>
                  <div className="font-display text-[16px] font-bold text-white group-hover:text-teal-300 transition-colors truncate max-w-full">
                    {creators[1].name}
                  </div>
                  <div className="text-[12px] font-bold text-teal-300/80 mb-2">#{creators[1].handle}</div>
                  <div className="font-display text-[20px] font-black text-white">
                    {creators[1].xp.toLocaleString()} <span className="text-[12px] font-bold text-teal-300">XP</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-3 border-t border-teal-500/20 pt-3 text-[11.5px] text-mutedDim w-full font-semibold">
                    <span>{creators[1].listsCount} Listas</span>
                    <span>•</span>
                    <span>{creators[1].votesCount} Votos</span>
                  </div>
                </Link>

                {/* 1º LUGAR (Ouro / Campeão) */}
                <Link
                  to={`/profile/${creators[0].handle}`}
                  className="group relative overflow-hidden rounded-[30px] border-2 border-amber-400/60 bg-gradient-to-b from-[#281E10]/95 via-[#1E170C] to-[#120E07] p-6 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-400 hover:shadow-[0_0_40px_rgba(255,209,102,0.25)] flex flex-col items-center order-1 sm:order-2 sm:-translate-y-3 z-10"
                >
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-0.5 text-[11.5px] font-black text-amber-300 shadow-md">
                    <Crown size={13} className="text-amber-300" />
                    <span>#1 CAMPEÃO</span>
                  </div>
                  <div className="mt-7 mb-3 relative">
                    <div className="p-1 rounded-full border-2 border-amber-400 shadow-[0_0_20px_rgba(255,209,102,0.4)]">
                      <Avatar name={creators[0].name} image={creators[0].avatar} size={64} />
                    </div>
                  </div>
                  <div className="font-display text-[18px] font-black text-white group-hover:text-amber-300 transition-colors truncate max-w-full">
                    {creators[0].name}
                  </div>
                  <div className="text-[12.5px] font-bold text-amber-400/90 mb-2">#{creators[0].handle}</div>
                  <div className="font-display text-[24px] font-black text-white">
                    {creators[0].xp.toLocaleString()} <span className="text-[13px] font-bold text-amber-300">XP</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-3.5 border-t border-amber-400/20 pt-3 text-[12px] text-amber-200/70 w-full font-semibold">
                    <span>{creators[0].listsCount} Listas</span>
                    <span>•</span>
                    <span>{creators[0].votesCount} Votos</span>
                    <span>•</span>
                    <span>{creators[0].followersCount} Seg.</span>
                  </div>
                </Link>

                {/* 3º LUGAR (Bronze) */}
                <Link
                  to={`/profile/${creators[2].handle}`}
                  className="group relative overflow-hidden rounded-[26px] border border-rose-500/30 bg-gradient-to-b from-[#24151B]/90 to-[#140D11] p-5 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-400/60 hover:shadow-[0_0_30px_rgba(255,84,112,0.15)] flex flex-col items-center order-3 sm:order-3"
                >
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-400/10 px-2.5 py-0.5 text-[11px] font-black text-rose-300">
                    🥉 #3 Lugar
                  </div>
                  <div className="mt-6 mb-3 relative">
                    <div className="p-1 rounded-full border-2 border-rose-400/50 shadow-[0_0_15px_rgba(255,84,112,0.3)]">
                      <Avatar name={creators[2].name} image={creators[2].avatar} size={54} />
                    </div>
                  </div>
                  <div className="font-display text-[16px] font-bold text-white group-hover:text-rose-300 transition-colors truncate max-w-full">
                    {creators[2].name}
                  </div>
                  <div className="text-[12px] font-bold text-rose-300/80 mb-2">#{creators[2].handle}</div>
                  <div className="font-display text-[20px] font-black text-white">
                    {creators[2].xp.toLocaleString()} <span className="text-[12px] font-bold text-rose-300">XP</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-3 border-t border-rose-500/20 pt-3 text-[11.5px] text-mutedDim w-full font-semibold">
                    <span>{creators[2].listsCount} Listas</span>
                    <span>•</span>
                    <span>{creators[2].votesCount} Votos</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Barra de Pesquisa e Filtros */}
          <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Campo de Pesquisa */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedDim pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar criador por nome ou #handle..."
                className="w-full rounded-2xl border border-white/10 bg-[#14141E]/90 pl-10 pr-9 py-2.5 text-[13.5px] text-white placeholder-mutedDim outline-none transition-all focus:border-accent focus:bg-[#181826] focus:ring-2 focus:ring-accent/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedDim hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtros de Patente / Ordenação */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: "Todos" },
                { id: "elite", label: "Elite (1500+ XP)" },
                { id: "verified", label: "Verificados" },
                { id: "rising", label: "Em Ascensão" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterTier(f.id)}
                  className={`rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all whitespace-nowrap border ${
                    filterTier === f.id
                      ? "border-accent bg-accent/20 text-white shadow-sm"
                      : "border-white/[0.06] bg-surface/60 text-muted hover:border-white/20 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}

              {/* Seletor de Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#14141E] px-3 py-2 text-[12px] font-bold text-muted outline-none hover:border-white/20 transition-all cursor-pointer"
              >
                <option value="xp">Ordenar: Maior XP</option>
                <option value="votes">Ordenar: Mais Votos</option>
                <option value="lists">Ordenar: Mais Listas</option>
                <option value="followers">Ordenar: Mais Seguidores</option>
              </select>
            </div>
          </div>

          {/* Tabela de Classificação Moderna */}
          <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#12121C]/90 shadow-2xl backdrop-blur-xl">
            {/* Cabeçalho da Tabela */}
            <div className="grid grid-cols-[60px_1fr_90px_110px_140px_50px] md:grid-cols-[65px_1fr_100px_120px_110px_160px_50px] items-center border-b border-white/[0.08] bg-[#171625]/90 px-4 sm:px-6 py-4 text-[11px] font-black uppercase tracking-wider text-mutedDim">
              <div className="text-center">{t("leaderboard.rank") || "Pos"}</div>
              <div>{t("leaderboard.creator") || "Criador"}</div>
              <div className="text-center hidden sm:block">Listas</div>
              <div className="text-center hidden sm:block">Votos</div>
              <div className="text-center hidden md:block">Seguidores</div>
              <div className="text-right sm:text-right">{t("leaderboard.xp") || "Creator XP"}</div>
              <div className="text-center"></div>
            </div>

            {/* Linhas de Criadores */}
            {filteredCreators.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-surface2 text-mutedDim">
                  <Search size={20} />
                </div>
                <p className="font-display text-[15px] font-bold text-white">Nenhum criador encontrado</p>
                <p className="mt-1 text-[13px] text-mutedDim">
                  Tenta pesquisar por outro termo ou limpar os filtros aplicados.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTier("all");
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/15 px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-accent/25 transition-all"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filteredCreators.map((c) => {
                  const patent = getPatentBadge(c.badge);
                  const PatentIcon = patent.icon;
                  const rankVisuals = getRankVisuals(c.rank);
                  const RankIcon = rankVisuals.icon;
                  const pct = Math.min(100, Math.max(8, Math.round((c.xp / maxXP) * 100)));

                  return (
                    <Link
                      key={c.uid}
                      to={`/profile/${c.handle}`}
                      className={`grid grid-cols-[60px_1fr_90px_110px_140px_50px] md:grid-cols-[65px_1fr_100px_120px_110px_160px_50px] items-center px-4 sm:px-6 py-4 transition-all duration-200 hover:bg-surface2/60 group ${rankVisuals.rowBg}`}
                    >
                      {/* Posição / Rank */}
                      <div className="flex justify-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-black transition-transform duration-200 group-hover:scale-110 ${rankVisuals.pill}`}
                        >
                          {RankIcon ? <RankIcon size={14} /> : c.rank}
                        </div>
                      </div>

                      {/* Info do Criador */}
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <Avatar name={c.name} image={c.avatar} size={40} />

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-display text-[14.5px] font-bold text-white group-hover:text-accent transition-colors truncate">
                              {c.name}
                            </span>
                            {c.rank === 1 && <Crown size={14} className="text-amber-400 shrink-0" />}
                          </div>

                          <div className="flex items-center gap-2 text-[11.5px] mt-0.5">
                            <span className="font-bold text-accent">#{c.handle}</span>
                            <span className="text-mutedDim">•</span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-bold ${patent.classes}`}
                            >
                              <PatentIcon size={10} />
                              <span>{patent.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tier Lists Criadas */}
                      <div className="hidden sm:flex items-center justify-center gap-1.5 text-[13px] font-bold text-white">
                        <Layers size={14} className="text-[#B6A5FF]" />
                        <span>{c.listsCount}</span>
                      </div>

                      {/* Votos Recebidos */}
                      <div className="hidden sm:flex items-center justify-center gap-1.5 text-[13px] font-bold text-white">
                        <Heart size={14} className="text-[#FF5470]" />
                        <span>{c.votesCount.toLocaleString()}</span>
                      </div>

                      {/* Seguidores */}
                      <div className="hidden md:flex items-center justify-center gap-1.5 text-[13px] font-bold text-white">
                        <Users size={14} className="text-[#00E5A3]" />
                        <span>{c.followersCount.toLocaleString()}</span>
                      </div>

                      {/* Creator XP + Barra de Progresso Relativo */}
                      <div className="text-right">
                        <div className="font-display text-[15px] font-black text-white group-hover:text-accent transition-colors">
                          {c.xp.toLocaleString()} <span className="text-[11px] font-bold text-mutedDim">XP</span>
                        </div>
                        {/* Barra de Progresso */}
                        <div className="mt-1.5 h-1.5 w-20 sm:w-28 rounded-full bg-white/10 overflow-hidden ml-auto">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${rankVisuals.barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Botão de Ver Perfil */}
                      <div className="flex justify-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-muted group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:text-accent transition-all duration-200">
                          <ArrowUpRight size={15} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Secção Informativa: Como Funciona o Creator XP */}
          <div className="mt-14 relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E14] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="font-display text-[17px] font-bold text-white">Como é Calculado o Creator XP?</h3>
                  <p className="text-[12.5px] text-muted font-normal">
                    Fórmula 100% transparente com dados e votos em tempo real.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00E5A3]/30 bg-[#00E5A3]/10 px-3 py-1 text-[11px] font-bold text-[#00E5A3] shrink-0 self-start sm:self-auto">
                <ShieldCheck size={13} />
                <span>100% Livre de Bots</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4">
                <div className="font-display text-[20px] font-black text-accent">+50 XP</div>
                <div className="mt-1 text-[12.5px] font-bold text-white">Por Tier List</div>
                <div className="text-[11px] text-mutedDim mt-0.5">Criar e publicar novas listas</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4">
                <div className="font-display text-[20px] font-black text-[#FF5470]">+10 XP</div>
                <div className="mt-1 text-[12.5px] font-bold text-white">Por Voto Recebido</div>
                <div className="text-[11px] text-mutedDim mt-0.5">Aprovação da comunidade</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4">
                <div className="font-display text-[20px] font-black text-[#00E5A3]">+25 XP</div>
                <div className="mt-1 text-[12.5px] font-bold text-white">Por Novo Seguidor</div>
                <div className="text-[11px] text-mutedDim mt-0.5">Fidelização e influência real</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4">
                <div className="font-display text-[20px] font-black text-[#FFD166]">+1 XP</div>
                <div className="mt-1 text-[12.5px] font-bold text-white">Por Visualização</div>
                <div className="text-[11px] text-mutedDim mt-0.5">Alcance orgânico da lista</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
