import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import TierListCard from "../components/TierListCard";
import { useLanguage } from "../context/LanguageContext";
import { getTierLists, getCategories, getCategoryDisplayName, getGlobalStats, getLeaderboard } from "../services/db";
import { slugify } from "../services/db";
import useRealtimeDb from "../hooks/useRealtimeDb";
import { Avatar, Badge, PrimaryButton, GhostButton } from "../components/UI";
import {
  Sparkles,
  Search,
  Flame,
  X,
  Filter,
  Compass,
  Trophy,
  Clock,
  Layers,
  Plus,
  ArrowRight,
  Gamepad2,
  Film,
  Tv,
  Music,
  Cpu,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Shield,
  Zap,
  Dices,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  MessageCircle,
  TrendingUp,
  Users,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORY_ICONS = {
  gaming: Gamepad2,
  football: Trophy,
  sports: Flame,
  movies: Film,
  tvshows: Tv,
  anime: Sparkles,
  music: Music,
  tech: Cpu,
  food: Utensils,
  vehicles: Car,
  culture: Globe,
  lifestyle: Dumbbell,
  business: Briefcase,
  science: GraduationCap,
  creators: Zap,
  geek: Shield,
};

const CATEGORY_COLORS = {
  gaming: "#7C5CFF",
  football: "#FF3B5C",
  sports: "#FF9F43",
  movies: "#FF5252",
  tvshows: "#31D8A8",
  anime: "#FF6B7A",
  music: "#FFD23F",
  tech: "#00E5A3",
  food: "#FFAA00",
  vehicles: "#38B6FF",
  culture: "#9A7CFF",
  lifestyle: "#2EC4B6",
  business: "#6B7280",
  science: "#8B5CF6",
  creators: "#F59E0B",
  geek: "#6366F1",
};

function getCatVisuals(cat) {
  const key = (cat.id || cat.slug || "").toLowerCase();
  const IconComponent = CATEGORY_ICONS[key] || CATEGORY_ICONS[cat.icon] || Layers;
  const color = cat.color || CATEGORY_COLORS[key] || "#7C5CFF";
  return { IconComponent, color };
}

function SkeletonCard() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-white/[0.06] bg-[#14141F]/60 p-4 animate-pulse">
      <div>
        <div className="h-28 w-full rounded-2xl bg-white/[0.04] mb-4" />
        <div className="h-5 w-20 rounded-full bg-white/[0.06] mb-3" />
        <div className="h-5 w-3/4 rounded-lg bg-white/[0.06] mb-2" />
        <div className="h-4 w-1/2 rounded-lg bg-white/[0.04] mb-4" />
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
        <div className="h-4 w-12 rounded bg-white/[0.04]" />
        <div className="h-4 w-12 rounded bg-white/[0.04]" />
        <div className="h-4 w-12 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

function CompactTierListRow({ list }) {
  const { t } = useLanguage();
  const tiers = list.tiers?.slice(0, 4) || [];
  const items = list.items || [];

  return (
    <Link
      to={`/tier-list/${list.id}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-surface/80 p-3.5 sm:p-4 transition-all hover:border-accent/60 hover:bg-surface2/60 hover:shadow-glow"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Mini Preview Bar */}
        <div className="flex h-11 w-11 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40">
          {(tiers.length > 0 ? tiers.slice(0, 3) : [{ color: "#FF3B5C" }, { color: "#FF9F43" }, { color: "#FFD23F" }]).map((tr, idx) => (
            <div
              key={idx}
              className="flex-1 w-full"
              style={{ background: tr.color || "#8A6BFF" }}
            />
          ))}
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-extrabold text-accent border border-accent/30">
              {getCategoryDisplayName(list.category)}
            </span>
            {list.subcategory && (
              <span className="text-[11.5px] font-semibold text-mutedDim">
                • {list.subcategory}
              </span>
            )}
            <span className="text-[11px] font-medium text-mutedDim">
              • {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <h3 className="font-display text-[15px] font-bold text-white group-hover:text-accent transition-colors truncate">
            {list.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 flex-shrink-0 border-t sm:border-t-0 border-white/[0.06] pt-3 sm:pt-0">
        {/* Criador */}
        <div className="flex items-center gap-2 text-[12.5px] text-muted">
          <Avatar name={list.creator || "Criador"} image={list.creatorAvatar} size={22} />
          <span className="font-semibold text-white truncate max-w-[120px]">
            {list.creator || "Anónimo"}
          </span>
          {list.creatorHandle && (
            <span className="text-accent/80 font-bold hidden md:inline">
              #{list.creatorHandle}
            </span>
          )}
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-3 text-[12px] text-mutedDim">
          <span className="flex items-center gap-1 font-bold text-white">
            <Heart size={13} className="text-[#FF5470]" />
            {(list.votes || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={13} />
            {list.views > 1000
              ? `${(list.views / 1000).toFixed(1)}k`
              : (list.views || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={13} />
            {list.commentsCount ?? 0}
          </span>
        </div>

        {/* Seta de Acesso */}
        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 group-hover:bg-accent group-hover:text-black text-mutedDim transition-all">
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

export default function Explore() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get("category") || "All";
  const initialSub = searchParams.get("sub") || "";
  const initialSearch = searchParams.get("search") || "";

  const parseTabFromParams = (params) => {
    const sort = params.get("sort") || "";
    const tabParam = params.get("tab") || "";
    if (sort === "votes" || sort === "top_rated" || tabParam.toLowerCase() === "toprated") {
      return "TopRated";
    }
    if (sort === "most_voted" || sort === "popular" || tabParam.toLowerCase() === "popular") {
      return "Popular";
    }
    if (sort === "discussed" || tabParam.toLowerCase() === "discussed") {
      return "Discussed";
    }
    if (sort === "newest" || sort === "new" || tabParam.toLowerCase() === "new") {
      return "New";
    }
    return "Trending";
  };

  const [tab, setTab] = useState(() => parseTabFromParams(searchParams));
  const [cat, setCat] = useState(initialCat);
  const [selectedSub, setSelectedSub] = useState(initialSub);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [queryText, setQueryText] = useState(initialSearch);
  const [minItemsFilter, setMinItemsFilter] = useState(0);
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("tierworld_explore_view_mode") || "grid";
    } catch {
      return "grid";
    }
  });

  const [lists, setLists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTierLists: 0, totalVotes: 0, totalCreators: 0 });
  const [topCreators, setTopCreators] = useState([]);

  const categoryScrollRef = useRef(null);

  // Debounce da pesquisa para digitação a 60fps sem engasgos
  const [debouncedQuery, setDebouncedQuery] = useState(queryText);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(queryText);
    }, 200);
    return () => clearTimeout(timer);
  }, [queryText]);

  useEffect(() => {
    const urlCat = searchParams.get("category") || "All";
    const urlSub = searchParams.get("sub") || "";
    const urlSearch = searchParams.get("search");
    setCat(urlCat);
    setSelectedSub(urlSub);
    if (urlSearch !== null) {
      setQueryText(urlSearch);
    }
    const computedTab = parseTabFromParams(searchParams);
    if (searchParams.has("sort") || searchParams.has("tab")) {
      setTab(computedTab);
    }
  }, [searchParams]);

  // Persiste a preferência de visualização (Grelha ou Lista)
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("tierworld_explore_view_mode", mode);
    } catch {}
  };

  // Sincronização em tempo real da base de dados e métricas
  useRealtimeDb(() => {
    const all = getCategories();
    all.sort((a, b) => (b.count || 0) - (a.count || 0));
    setCategories(all);
    setStats(getGlobalStats());
    setTopCreators(getLeaderboard().slice(0, 4));

    getTierLists({
      category: cat,
      tab,
      queryText: debouncedQuery,
    })
      .then((res) => {
        let filtered = res;
        if (selectedSub) {
          filtered = filtered.filter(
            (l) =>
              l.subcategory === selectedSub ||
              (l.tags && l.tags.includes(selectedSub)) ||
              (l.title && l.title.toLowerCase().includes(selectedSub.toLowerCase()))
          );
        }
        if (minItemsFilter > 0) {
          filtered = filtered.filter((l) => (l.items?.length || 0) >= minItemsFilter);
        }
        setLists(filtered);
      })
      .finally(() => setLoading(false));
  }, [tab, cat, selectedSub, debouncedQuery, minItemsFilter]);

  const activeCategories = categories;
  const activeCatObj = categories.find(
    (c) =>
      c.id === cat ||
      c.slug === cat ||
      (c.name && c.name.toLowerCase() === (cat || "").toLowerCase()) ||
      slugify(c.name || "") === cat
  );

  const filteredPillCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return activeCategories;
    const q = categorySearchQuery.toLowerCase().trim();
    return activeCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.subcategories || []).some((sub) =>
          (typeof sub === "string" ? sub : sub.name || "").toLowerCase().includes(q)
        )
    );
  }, [activeCategories, categorySearchQuery]);

  const trendingTopicChips = useMemo(() => {
    return activeCategories.slice(0, 8).map((c) => ({
      label: c.name,
      category: c.id,
    }));
  }, [activeCategories]);

  const tabs = [
    { key: "Trending", label: "Em Destaque", icon: Flame, color: "#FF5470" },
    { key: "TopRated", label: "Mais Votadas", icon: Heart, color: "#FF3B5C" },
    { key: "Popular", label: "Mais Vistas", icon: Eye, color: "#FFD166" },
    { key: "Discussed", label: "Mais Comentadas", icon: MessageCircle, color: "#7C5CFF" },
    { key: "New", label: "Mais Recentes", icon: Clock, color: "#00E5A3" },
  ];

  const handleSelectCategory = (categoryId) => {
    setCat(categoryId);
    setSelectedSub("");
    const next = new URLSearchParams(searchParams);
    if (categoryId === "All") {
      next.delete("category");
    } else {
      next.set("category", categoryId);
    }
    next.delete("sub");
    setSearchParams(next);
  };

  const handleSelectSubcategory = (subName) => {
    setSelectedSub(subName);
    const next = new URLSearchParams(searchParams);
    if (subName) {
      next.set("category", cat);
      next.set("sub", subName);
    } else {
      next.delete("sub");
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setCat("All");
    setSelectedSub("");
    setQueryText("");
    setMinItemsFilter(0);
    setSearchParams({});
  };

  // Surpreende-me: escolhe uma tier list pública aleatória
  const handleSurpriseMe = () => {
    if (!lists || lists.length === 0) return;
    const randomIndex = Math.floor(Math.random() * lists.length);
    const chosen = lists[randomIndex];
    if (chosen && chosen.id) {
      navigate(`/tier-list/${chosen.id}`);
    }
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const hasActiveFilters = cat !== "All" || selectedSub || queryText.trim() !== "" || minItemsFilter > 0;
  const totalListsCount = categories.reduce((acc, c) => acc + (c.count || 0), 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-8 animate-fade-in">
      {/* =========================================================
          1. HERO DISCOVERY BANNER (HEADER + ESTATÍSTICAS + CTAS)
         ========================================================= */}
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-[#181826]/90 via-[#12121B]/95 to-[#0D0D14] p-6 sm:p-9 shadow-2xl backdrop-blur-2xl">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-[12px] font-bold text-[#C5B8FF] mb-3 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <Compass size={13} className="text-accent" />
              <span>Biblioteca Global da Comunidade</span>
            </div>

            <h1 className="font-display text-[32px] sm:text-[46px] font-black tracking-tight text-white leading-[1.1]">
              Explorar <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accentSoft to-accent">Tier Lists</span>
            </h1>
            <p className="mt-2.5 text-[14.5px] sm:text-[15.5px] text-muted max-w-xl leading-relaxed">
              Descobre, avalia e debate os rankings mais votados e autênticos criados pela comunidade em tempo real.
            </p>

            {/* Micro Chips de Métricas Reais da BD */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-bold text-white shadow-inner">
                <Layers size={13} className="text-accent" />
                <span>{stats.totalTierLists || totalListsCount} Tier Lists</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-bold text-white shadow-inner">
                <Heart size={13} className="text-[#FF5470]" />
                <span>{(stats.totalVotes || 0).toLocaleString()} Votos</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-bold text-white shadow-inner">
                <Users size={13} className="text-[#31D8A8]" />
                <span>{stats.totalCreators || 1} Criadores</span>
              </div>
            </div>
          </div>

          {/* CTAs de Topo */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {lists.length > 0 && (
              <button
                type="button"
                onClick={handleSurpriseMe}
                className="inline-flex items-center gap-2 rounded-2xl border border-accent/40 bg-accentSoft/60 px-4 py-2.5 text-[13.5px] font-bold text-accent hover:bg-accent hover:text-black transition-all duration-200 shadow-sm hover:shadow-glow active:scale-95"
                title="Abrir uma Tier List aleatória"
              >
                <Dices size={16} />
                <span>Surpreende-me</span>
              </button>
            )}

            <Link to="/create">
              <PrimaryButton icon={Plus}>
                Criar Tier List
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. CHIPS DE TEMAS RÁPIDOS EM DESTAQUE (TRENDING TOPICS)
         ========================================================= */}
      {trendingTopicChips.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="flex items-center gap-1 font-bold text-mutedDim uppercase tracking-wider text-[11px] shrink-0 mr-1">
            <TrendingUp size={13} className="text-accent" />
            <span>Em alta:</span>
          </span>
          {trendingTopicChips.map((topic) => {
            const isSelected = cat === topic.category;
            return (
              <button
                key={topic.category}
                type="button"
                onClick={() => handleSelectCategory(topic.category)}
                className={`shrink-0 rounded-xl border px-3 py-1.5 font-bold transition-all ${
                  isSelected
                    ? "border-accent bg-accent/20 text-white shadow-sm shadow-accent/30"
                    : "border-white/[0.08] bg-[#12121A]/80 text-muted hover:border-white/20 hover:text-white"
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      )}

      {/* =========================================================
          3. BARRA DE PESQUISA, ORDENAÇÃO E MODOS DE EXIBIÇÃO
         ========================================================= */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Abas de Ordenação */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#12121C]/90 p-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-md">
          {tabs.map((tItem) => {
            const Icon = tItem.icon;
            const isActive = tab === tItem.key;
            return (
              <button
                key={tItem.key}
                type="button"
                onClick={() => setTab(tItem.key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-surface2 text-white border border-accent/40 shadow-sm shadow-accent/20"
                    : "text-muted hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  size={14}
                  style={{ color: isActive ? tItem.color : undefined }}
                  className={isActive ? "" : "opacity-60"}
                />
                <span>{tItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ferramentas: Pesquisa Rápida + Filtro de Tamanho + Alternador de Visualização */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Input de Pesquisa */}
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedDim pointer-events-none" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Pesquisar por título, criador…"
              className="w-full rounded-2xl border border-white/10 bg-[#12121C]/90 pl-10 pr-9 py-2 text-[13px] text-white placeholder-mutedDim outline-none transition-all focus:border-accent focus:bg-[#181826] focus:ring-2 focus:ring-accent/20"
            />
            {queryText && (
              <button
                onClick={() => setQueryText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedDim hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtro de Mínimo de Itens */}
          <div className="relative flex items-center">
            <select
              value={minItemsFilter}
              onChange={(e) => setMinItemsFilter(Number(e.target.value))}
              className="rounded-2xl border border-white/10 bg-[#12121C]/90 px-3 py-2 text-[12.5px] font-bold text-white outline-none focus:border-accent cursor-pointer appearance-none pr-7"
            >
              <option value={0}>Todos os tamanhos</option>
              <option value={5}>5+ elementos</option>
              <option value={10}>10+ elementos</option>
              <option value={20}>20+ elementos</option>
            </select>
            <SlidersHorizontal size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mutedDim pointer-events-none" />
          </div>

          {/* Alternador de Visualização: Grelha vs Lista Compacta */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#12121C]/90 p-1">
            <button
              type="button"
              onClick={() => toggleViewMode("grid")}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "bg-surface2 text-accent shadow-sm"
                  : "text-mutedDim hover:text-white"
              }`}
              title="Visualização em Grelha"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => toggleViewMode("compact")}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "compact"
                  ? "bg-surface2 text-accent shadow-sm"
                  : "text-mutedDim hover:text-white"
              }`}
              title="Visualização em Lista Compacta"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          4. CAIXA DE CARROSSEL DE CATEGORIAS E NICHOS
         ========================================================= */}
      {activeCategories.length > 0 && (
        <div className="mb-8 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#161624]/90 to-[#101018]/90 p-5 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Filter size={14} />
              </div>
              <span className="font-display text-[15px] font-bold text-white">
                Navegar por Categoria
              </span>
              <span className="text-[11.5px] font-semibold text-mutedDim bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                {activeCategories.length} categorias
              </span>
            </div>

            {/* Controlos: Setas de Scroll + Pesquisa Interna */}
            <div className="flex items-center gap-2">
              {activeCategories.length > 4 && (
                <div className="relative w-full sm:w-56">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedDim pointer-events-none" />
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Filtrar categoria…"
                    className="w-full rounded-xl border border-white/10 bg-[#0E0E15] pl-8 pr-7 py-1.5 text-[12px] text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-all"
                  />
                  {categorySearchQuery && (
                    <button
                      onClick={() => setCategorySearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mutedDim hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => scrollCategories("left")}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Deslizar para a esquerda"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Deslizar para a direita"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Carrossel Deslizável de Categorias */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
          >
            {/* Pílula: Todas as Categorias */}
            <button
              type="button"
              onClick={() => handleSelectCategory("All")}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-[12.5px] font-bold transition-all duration-200 shrink-0 ${
                cat === "All"
                  ? "border-accent bg-accent/20 text-white shadow-sm shadow-accent/30"
                  : "border-white/[0.06] bg-surface/60 text-mutedDim hover:border-white/20 hover:text-white"
              }`}
            >
              <Layers size={14} className={cat === "All" ? "text-accent" : "opacity-60"} />
              <span>{t("explore.allCategories") || "Todas as Categorias"}</span>
              {totalListsCount > 0 && (
                <span
                  className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    cat === "All" ? "bg-accent/30 text-white" : "bg-white/[0.06] text-mutedDim"
                  }`}
                >
                  {totalListsCount}
                </span>
              )}
            </button>

            {/* Pílulas de Cada Categoria */}
            {filteredPillCategories.map((c) => {
              const isSelected =
                cat === c.id ||
                cat === c.slug ||
                (cat && cat.toLowerCase() === (c.name || "").toLowerCase()) ||
                (c.slug && slugify(cat) === c.slug);
              const { IconComponent, color } = getCatVisuals(c);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCategory(c.id)}
                  className={`group flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-[12.5px] font-bold transition-all duration-200 shrink-0 ${
                    isSelected
                      ? "border-white/40 bg-surface2 text-white shadow-md"
                      : "border-white/[0.06] bg-surface/60 text-mutedDim hover:border-white/20 hover:text-white"
                  }`}
                  style={{
                    borderColor: isSelected ? color : undefined,
                    backgroundColor: isSelected ? `${color}20` : undefined,
                  }}
                >
                  <IconComponent
                    size={14}
                    style={{ color: isSelected ? color : undefined }}
                    className={isSelected ? "" : "opacity-70 group-hover:opacity-100 transition-opacity"}
                  />
                  <span>{c.name || getCategoryDisplayName(c.id)}</span>
                  {c.count > 0 && (
                    <span
                      className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white/[0.06] text-mutedDim group-hover:text-muted"
                      }`}
                    >
                      {c.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subcategorias / Nichos quando uma categoria estiver selecionada */}
          {activeCatObj?.subcategories?.length > 0 && (
            <div className="mt-3.5 pt-3.5 border-t border-white/[0.06]">
              <div className="text-[12px] font-bold text-mutedDim mb-2 flex items-center gap-2">
                <span>Filtrar por nicho em {activeCatObj.name}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectSubcategory("")}
                  className={`px-3 py-1 rounded-xl text-[12px] font-bold transition-all ${
                    !selectedSub
                      ? "bg-white/15 text-white border border-white/20 shadow-sm"
                      : "bg-surface/60 text-mutedDim hover:text-white border border-white/[0.06]"
                  }`}
                >
                  Todos os temas
                </button>
                {activeCatObj.subcategories.map((sub) => {
                  const subName = typeof sub === "string" ? sub : sub.name;
                  const isSubActive = selectedSub === subName;
                  return (
                    <button
                      key={subName}
                      type="button"
                      onClick={() => handleSelectSubcategory(subName)}
                      className={`px-3 py-1 rounded-xl text-[12px] font-bold transition-all ${
                        isSubActive
                          ? "bg-accent/20 text-white border border-accent/60 shadow-sm"
                          : "bg-surface/60 text-mutedDim hover:text-white border border-white/[0.06]"
                      }`}
                    >
                      {subName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          5. CRIADORES EM ALTA (COMMUNITY CREATORS SPOTLIGHT)
         ========================================================= */}
      {topCreators.length > 0 && cat === "All" && !queryText && (
        <div className="mb-8 rounded-2xl border border-white/[0.06] bg-[#101018]/70 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mutedDim">
              <Trophy size={13} className="text-amber-400" />
              <span>Criadores em Destaque</span>
            </div>
            <Link to="/leaderboard" className="text-xs font-bold text-accent hover:underline">
              Ver Classificação Completa →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {topCreators.map((cr, idx) => (
              <Link
                key={cr.uid || idx}
                to={`/profile/${cr.handle || cr.uid}`}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface/50 p-2.5 hover:border-accent/40 hover:bg-surface2/60 transition-all"
              >
                <div className="relative">
                  <Avatar name={cr.displayName} image={cr.avatar} size={32} />
                  {idx === 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black">
                      1
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-white group-hover:text-accent transition-colors truncate">
                    {cr.displayName}
                  </div>
                  <div className="text-[11px] font-medium text-accent/80 truncate">
                    #{cr.handle || "criador"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          6. BARRA DE FILTROS ATIVOS
         ========================================================= */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.06] bg-[#12121C]/60 px-4 py-2.5 text-[12.5px]">
          <span className="font-bold text-mutedDim">Filtros ativos:</span>

          {cat !== "All" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-0.5 font-bold text-white">
              <span>{activeCatObj?.name || cat}</span>
              <button
                onClick={() => handleSelectCategory("All")}
                className="text-mutedDim hover:text-white transition-colors"
                title="Remover filtro de categoria"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedSub && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 font-bold text-[#B6A5FF]">
              <span>{selectedSub}</span>
              <button
                onClick={() => handleSelectSubcategory("")}
                className="text-mutedDim hover:text-white transition-colors"
                title="Remover filtro de subcategoria"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {debouncedQuery.trim() && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-0.5 font-bold text-white">
              <span>"{debouncedQuery}"</span>
              <button
                onClick={() => setQueryText("")}
                className="text-mutedDim hover:text-white transition-colors"
                title="Limpar pesquisa"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {minItemsFilter > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-0.5 font-bold text-white">
              <span>Mínimo: {minItemsFilter} itens</span>
              <button
                onClick={() => setMinItemsFilter(0)}
                className="text-mutedDim hover:text-white transition-colors"
                title="Remover filtro de itens"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="ml-auto font-bold text-accent hover:underline text-[12px] transition-all"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}

      {/* =========================================================
          7. CONTADOR DE RESULTADOS
         ========================================================= */}
      {!loading && (
        <div className="mb-5 flex items-center justify-between text-[13px] text-mutedDim font-medium">
          <div>
            A mostrar <span className="font-bold text-white">{lists.length}</span>{" "}
            {lists.length === 1 ? "tier list encontrada" : "tier lists encontradas"}
          </div>
        </div>
      )}

      {/* =========================================================
          8. GRELHA / LISTA DE RESULTADOS OU ESTADO VAZIO
         ========================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-[#161624] via-[#12121A] to-[#0E0E14] p-10 sm:p-14 text-center shadow-xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent shadow-inner">
            <Sparkles size={26} />
          </div>
          <h3 className="font-display text-[20px] font-bold text-white">
            Nenhuma Tier List encontrada
          </h3>
          <p className="mt-2 text-[14px] text-muted max-w-md mx-auto leading-relaxed">
            {selectedSub
              ? `Ainda não existem listas na subcategoria "${selectedSub}". Sê o pioneiro a inaugurá-la!`
              : cat !== "All"
              ? `Ainda não existem listas na categoria "${activeCatObj?.name || getCategoryDisplayName(cat)}". Sê o primeiro criador a inaugurar este tema!`
              : queryText
              ? `Não foram encontrados resultados para a pesquisa "${queryText}". Tenta outros termos ou cria a primeira lista!`
              : "Nenhuma tier list encontrada com os filtros selecionados."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-[13px] font-bold text-white hover:bg-surface2 transition-all"
              >
                Limpar Filtros
              </button>
            )}
            <Link to={`/create${cat !== "All" ? `?category=${cat}` : ""}`}>
              <PrimaryButton icon={Plus}>
                Criar a Primeira Tier List
              </PrimaryButton>
            </Link>
          </div>
        </div>
      ) : viewMode === "compact" ? (
        <div className="flex flex-col gap-3">
          {lists.map((l) => (
            <CompactTierListRow key={l.id} list={l} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {lists.map((l) => (
            <TierListCard key={l.id} list={l} />
          ))}
        </div>
      )}
    </div>
  );
}
