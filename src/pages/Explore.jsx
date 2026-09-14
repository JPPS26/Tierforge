import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TierListCard from "../components/TierListCard";
import { useLanguage } from "../context/LanguageContext";
import { getTierLists, getActiveCategories } from "../services/db";
import useRealtimeDb from "../hooks/useRealtimeDb";
import { PrimaryButton } from "../components/UI";
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
  Gamepad2,
  Trophy,
  Flame,
  Film,
  Tv,
  Music,
  Cpu,
  Sparkles,
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

export default function Explore() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get("category") || "All";
  const initialSub = searchParams.get("sub") || "";
  const initialSearch = searchParams.get("search") || "";

  // Sincronização inteligente dos parâmetros sort ou tab vindos do rodapé ou links externos
  const parseTabFromParams = (params) => {
    const sort = params.get("sort") || "";
    const tabParam = params.get("tab") || "";
    if (sort === "most_voted" || sort === "popular" || tabParam.toLowerCase() === "popular") {
      return "Popular";
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
  const [lists, setLists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Sincronização ao segundo em tempo real com a base de dados
  useRealtimeDb(() => {
    setCategories(getActiveCategories());
    getTierLists({
      category: cat,
      tab,
      queryText,
    })
      .then((res) => {
        if (selectedSub) {
          const filtered = res.filter(
            (l) =>
              l.subcategory === selectedSub ||
              (l.tags && l.tags.includes(selectedSub)) ||
              (l.title && l.title.toLowerCase().includes(selectedSub.toLowerCase()))
          );
          setLists(filtered);
        } else {
          setLists(res);
        }
      })
      .finally(() => setLoading(false));
  }, [tab, cat, selectedSub, queryText]);

  const activeCategories = categories;
  const activeCatObj = categories.find((c) => c.id === cat || c.slug === cat);

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

  const tabs = [
    { key: "Trending", label: t("explore.tabTrending") || "Em Destaque", icon: Flame, color: "#FF5470" },
    { key: "Popular", label: t("explore.tabPopular") || "Mais Populares", icon: Trophy, color: "#FFD166" },
    { key: "New", label: t("explore.tabNew") || "Mais Recentes", icon: Clock, color: "#00E5A3" },
  ];

  const handleSelectCategory = (categoryId) => {
    setCat(categoryId);
    setSelectedSub("");
    if (categoryId === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  const handleSelectSubcategory = (subName) => {
    setSelectedSub(subName);
    if (subName) {
      setSearchParams({ category: cat, sub: subName });
    } else {
      setSearchParams({ category: cat });
    }
  };

  const clearAllFilters = () => {
    setCat("All");
    setSelectedSub("");
    setQueryText("");
    setSearchParams({});
  };

  const hasActiveFilters = cat !== "All" || selectedSub || queryText.trim() !== "";
  const totalListsCount = categories.reduce((acc, c) => acc + (c.count || 0), 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      {/* Cabeçalho da Página com Badge e CTA */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-[12px] font-bold text-[#B6A5FF] mb-3 shadow-sm">
            <Compass size={13} className="text-accent" />
            <span>Biblioteca Global da Comunidade</span>
          </div>
          <h1 className="font-display text-[32px] sm:text-[44px] font-black text-white tracking-tight leading-tight">
            {t("explore.title") || "Explorar Tier Lists"}
          </h1>
          <p className="mt-2 text-[14.5px] text-muted max-w-xl leading-relaxed">
            {t("explore.subtitle") ||
              "Descobre, avalia e debate os rankings mais votados e recentes criados por toda a comunidade do TierWorld."}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link to="/create">
            <PrimaryButton icon={Plus}>
              {t("home.createBtn") || "Criar Tier List"}
            </PrimaryButton>
          </Link>
        </div>
      </div>

      {/* Barra de Ordenação e Pesquisa Principal */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Abas de Ordenação com Ícones */}
        <div className="flex flex-wrap items-center gap-2 bg-[#12121C]/80 p-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-md">
          {tabs.map((tItem) => {
            const Icon = tItem.icon;
            const isActive = tab === tItem.key;
            return (
              <button
                key={tItem.key}
                type="button"
                onClick={() => setTab(tItem.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-surface2 text-white border border-accent/40 shadow-sm shadow-accent/20"
                    : "text-muted hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  size={15}
                  style={{ color: isActive ? tItem.color : undefined }}
                  className={isActive ? "" : "opacity-60"}
                />
                <span>{tItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Campo de Pesquisa Rápida de Listas */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedDim pointer-events-none" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Pesquisar listas por nome, criador ou tema…"
            className="w-full rounded-2xl border border-white/10 bg-[#12121C]/90 pl-10 pr-9 py-2.5 text-[13.5px] text-white placeholder-mutedDim outline-none transition-all focus:border-accent focus:bg-[#181826] focus:ring-2 focus:ring-accent/20"
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
      </div>

      {/* Caixa de Exploração de Categorias */}
      {activeCategories.length > 0 && (
        <div className="mb-8 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#161624]/90 to-[#101018]/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Filter size={14} />
              </div>
              <span className="font-display text-[15px] font-bold text-white">
                Filtrar por Categoria
              </span>
              <span className="text-[11.5px] font-semibold text-mutedDim bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                {activeCategories.length} categorias ativas
              </span>
            </div>

            {/* Pesquisa interna de categorias (se existirem muitas) */}
            {activeCategories.length > 4 && (
              <div className="relative w-full sm:w-60">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedDim pointer-events-none" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Pesquisar categoria…"
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
          </div>

          {/* Pílulas de Categorias */}
          <div className="flex flex-wrap gap-2">
            {/* Pílula: Todas as Categorias */}
            <button
              type="button"
              onClick={() => handleSelectCategory("All")}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-[12.5px] font-bold transition-all duration-200 ${
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

            {/* Pílulas de cada Categoria */}
            {filteredPillCategories.map((c) => {
              const isSelected = cat === c.id || cat === c.slug;
              const { IconComponent, color } = getCatVisuals(c);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCategory(c.id)}
                  className={`group flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-[12.5px] font-bold transition-all duration-200 ${
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
                  <span>{t(`categories.${c.id}`) || c.name}</span>
                  <span
                    className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-white/[0.06] text-mutedDim group-hover:text-muted"
                    }`}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subcategorias quando uma categoria está selecionada */}
          {activeCatObj?.subcategories?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="text-[12px] font-bold text-mutedDim mb-2.5 flex items-center gap-2">
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

      {/* Barra de Filtros Ativos (quando existem filtros aplicados) */}
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

          {queryText.trim() && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-0.5 font-bold text-white">
              <span>"{queryText}"</span>
              <button
                onClick={() => setQueryText("")}
                className="text-mutedDim hover:text-white transition-colors"
                title="Limpar pesquisa"
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

      {/* Contador de Resultados */}
      {!loading && lists.length > 0 && (
        <div className="mb-5 flex items-center justify-between text-[13px] text-mutedDim font-medium">
          <div>
            A mostrar <span className="font-bold text-white">{lists.length}</span>{" "}
            {lists.length === 1 ? "tier list" : "tier lists"}
          </div>
        </div>
      )}

      {/* Lista de Resultados Reais / Skeletons */}
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
              ? `Ainda não existem listas nesta categoria. Sê o primeiro a criar!`
              : queryText
              ? `Não foram encontrados resultados para a pesquisa "${queryText}". Tenta outros termos.`
              : t("explore.noLists") || "Nenhuma tier list encontrada com os filtros selecionados."}
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
                {t("home.createBtn") || "Criar Tier List"}
              </PrimaryButton>
            </Link>
          </div>
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
