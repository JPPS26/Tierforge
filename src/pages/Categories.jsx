import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getCategories,
  saveCategoryWithApiData,
  createCustomCategory,
  getCategoryDisplayName,
  slugify,
} from "../services/db";
import {
  DOMAIN_THEMES,
  searchApiCategories,
  fetchCategoryDetailsFromApi,
  slugifyCategory,
} from "../services/categoriesApi";
import useRealtimeDb from "../hooks/useRealtimeDb";
import { PrimaryButton, GhostButton, Badge } from "../components/UI";
import {
  Trophy,
  Gamepad2,
  Film,
  Tv,
  Sparkles,
  Music,
  Cpu,
  Flame,
  Search,
  Plus,
  X,
  Zap,
  Shield,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Layers,
  ArrowRight,
  Compass,
  Info,
  CheckCircle2,
  FolderPlus,
  Loader2,
  Palette,
  ExternalLink,
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

const DOMAIN_FILTERS = [
  { id: "all", label: "Todas as Áreas", icon: Layers },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "sports", label: "Desportos", icon: Trophy },
  { id: "entertainment", label: "Cinema & Séries", icon: Film },
  { id: "anime", label: "Anime & Manga", icon: Sparkles },
  { id: "music", label: "Música", icon: Music },
  { id: "tech", label: "Tecnologia & Ciência", icon: Cpu },
  { id: "lifestyle", label: "Gastronomia & Lifestyle", icon: Utensils },
  { id: "culture", label: "Cultura Pop & Geek", icon: Shield },
  { id: "general", label: "Geral & Sociedade", icon: Globe },
];

const PRESET_COLORS = [
  "#7C5CFF",
  "#FF3B5C",
  "#00E5A3",
  "#FF9F43",
  "#FFD23F",
  "#38B6FF",
  "#FF6B7A",
  "#A259FF",
];

function getCatVisuals(cat) {
  const key = (cat.id || cat.slug || "").toLowerCase();
  const IconComponent = CATEGORY_ICONS[key] || CATEGORY_ICONS[cat.icon] || Layers;
  const color = cat.color || CATEGORY_COLORS[key] || "#7C5CFF";
  return { IconComponent, color };
}

export default function Categories() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [filterMode, setFilterMode] = useState("all"); // "all" | "active_only"
  const [loading, setLoading] = useState(true);

  // Estado do Modal "Inaugurar Nova Categoria"
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatDomain, setNewCatDomain] = useState("general");
  const [newCatSubcategories, setNewCatSubcategories] = useState("");
  const [newCatColor, setNewCatColor] = useState("#7C5CFF");
  const [newCatImageUrl, setNewCatImageUrl] = useState("");
  const [modalApiSuggestions, setModalApiSuggestions] = useState([]);
  const [isSearchingModalApi, setIsSearchingModalApi] = useState(false);
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const modalSearchTimerRef = useRef(null);

  // Sincronização em tempo real das categorias da base de dados
  useRealtimeDb(() => {
    const all = getCategories();
    // Prioriza categorias que já tenham tier lists criadas
    all.sort((a, b) => (b.count || 0) - (a.count || 0));
    setCategories(all);
    setLoading(false);
  }, []);

  // Pesquisa dinâmica na API da Wikipedia quando o utilizador escreve o nome da nova categoria
  useEffect(() => {
    if (modalSearchTimerRef.current) clearTimeout(modalSearchTimerRef.current);
    const q = newCatName.trim();
    if (q.length < 2) {
      setModalApiSuggestions([]);
      setIsSearchingModalApi(false);
      return;
    }

    modalSearchTimerRef.current = setTimeout(async () => {
      setIsSearchingModalApi(true);
      try {
        const results = await searchApiCategories(q);
        setModalApiSuggestions(results.slice(0, 4));
      } catch (err) {
        console.warn("Erro ao sugerir categorias da Wikipedia:", err);
      } finally {
        setIsSearchingModalApi(false);
      }
    }, 350);

    return () => {
      if (modalSearchTimerRef.current) clearTimeout(modalSearchTimerRef.current);
    };
  }, [newCatName]);

  // Autopreenchimento inteligente a partir da sugestão da API
  const handleSelectApiSuggestion = async (suggestion) => {
    setNewCatName(suggestion.name);
    setNewCatImageUrl(suggestion.imageUrl || "");
    if (suggestion.description) setNewCatDesc(suggestion.description);
    try {
      const details = await fetchCategoryDetailsFromApi(suggestion.name);
      if (details) {
        if (details.description) setNewCatDesc(details.description);
        if (details.imageUrl) setNewCatImageUrl(details.imageUrl);
        if (details.subcategories && details.subcategories.length > 0) {
          setNewCatSubcategories(details.subcategories.join(", "));
        }
      }
    } catch {}
    setModalApiSuggestions([]);
  };

  // Submissão da nova categoria
  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSavingCat(true);
    const cleanName = newCatName.trim();
    const slug = slugifyCategory(cleanName);

    const subcats = newCatSubcategories
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const saved = await saveCategoryWithApiData({
        name: cleanName,
        slug,
        description: newCatDesc.trim() || `Comunidade e rankings abertos sobre ${cleanName}.`,
        imageUrl: newCatImageUrl.trim() || null,
        subcategories: subcats,
        domain: newCatDomain,
        color: newCatColor,
        icon: "Layers",
      });

      setSaveSuccessMsg(`Categoria "${cleanName}" inaugurada com sucesso! ✓`);

      setTimeout(() => {
        setCreateModalOpen(false);
        setNewCatName("");
        setNewCatDesc("");
        setNewCatSubcategories("");
        setNewCatImageUrl("");
        setSaveSuccessMsg("");
        setIsSavingCat(false);
        // Redireciona diretamente para o criador com esta nova categoria selecionada
        navigate(`/create?category=${saved.slug || saved.id}`);
      }, 1000);
    } catch (err) {
      console.error("Erro ao inaugurar categoria:", err);
      setIsSavingCat(false);
    }
  };

  // Filtragem composta: texto + domínio + modo ("todas" ou "ativas com listas")
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      // Filtro de atividade
      if (filterMode === "active_only" && (c.count || 0) === 0) {
        return false;
      }

      // Filtro por domínio
      if (selectedDomain !== "all") {
        const catDomain = (c.domain || "general").toLowerCase();
        if (catDomain !== selectedDomain.toLowerCase()) {
          // Permite compatibilidade caso o id coincida com o domínio
          if ((c.id || "").toLowerCase() !== selectedDomain.toLowerCase()) {
            return false;
          }
        }
      }

      // Filtro por pesquisa textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (c.name || "").toLowerCase().includes(q);
        const descMatch = (c.description || "").toLowerCase().includes(q);
        const subMatch = (c.subcategories || []).some((sub) =>
          (typeof sub === "string" ? sub : sub.name || "").toLowerCase().includes(q)
        );
        if (!nameMatch && !descMatch && !subMatch) return false;
      }

      return true;
    });
  }, [categories, filterMode, selectedDomain, searchQuery]);

  const activeCategoriesCount = useMemo(() => {
    return categories.filter((c) => (c.count || 0) > 0).length;
  }, [categories]);

  const totalTierListsCount = useMemo(() => {
    return categories.reduce((acc, c) => acc + (c.count || 0), 0);
  }, [categories]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      {/* =========================================================
          1. CABEÇALHO DA PÁGINA COM AÇÕES PRINCIPAIS
         ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-[#B6A5FF] font-bold text-[12px] mb-3 shadow-sm">
            <Layers size={13} className="text-accent" />
            <span>Catálogo Completo de Categorias & Comunidades</span>
          </div>
          <h1 className="font-display text-[32px] sm:text-[44px] font-black text-white tracking-tight leading-tight">
            Categorias & Temas
          </h1>
          <p className="mt-2 text-[14.5px] text-muted max-w-2xl leading-relaxed">
            Explora dezenas de universos temáticos, franchises e comunidades ativas. Cada categoria organiza rankings criados e votados livremente pelos membros do TierWorld.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-accent/40 bg-accent/10 text-white font-bold text-[13px] hover:bg-accent hover:text-black transition-all shadow-sm group"
          >
            <FolderPlus size={16} className="text-accent group-hover:text-black transition-colors" />
            <span>+ Nova Categoria</span>
          </button>
          <Link to="/create">
            <PrimaryButton icon={Plus}>
              {t("home.createBtn") || "Criar Tier List"}
            </PrimaryButton>
          </Link>
        </div>
      </div>

      {/* =========================================================
          2. CARTÕES DE MÉTRICAS / KPI DO CATÁLOGO
         ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {/* Card 1: Total de Categorias */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent shadow-sm shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">
              Catálogo de Nichos
            </span>
            <div className="font-display text-[22px] font-black text-white">
              {categories.length} Categorias
            </div>
            <span className="text-[12px] font-medium text-mutedDim">
              Comunidades disponíveis
            </span>
          </div>
        </div>

        {/* Card 2: Categorias com Listas Ativas */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E5A3]/40 bg-[#00E5A3]/10 text-[#00E5A3] shadow-sm shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">
              Inauguradas com Listas
            </span>
            <div className="font-display text-[22px] font-black text-white">
              {activeCategoriesCount} Ativas
            </div>
            <span className="text-[12px] font-medium text-mutedDim">
              Com tier lists da comunidade
            </span>
          </div>
        </div>

        {/* Card 3: Total de Tier Lists Organizadas */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-sm shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">
              Total de Listas
            </span>
            <div className="font-display text-[22px] font-black text-white">
              {totalTierListsCount} Publicadas
            </div>
            <span className="text-[12px] font-medium text-mutedDim">
              Organizadas nestes temas
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. BARRA DE PESQUISA E FILTROS POR DOMÍNIO
         ========================================================= */}
      <div className="space-y-4 mb-8">
        {/* Barra de Pesquisa + Toggle de Atividade */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedDim pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por categoria ou subcategoria (ex: Champions, RPGs, Nolan, Rock)..."
              className="w-full rounded-2xl border border-white/10 bg-[#12121C]/90 pl-12 pr-10 py-3 text-[14px] text-white placeholder-mutedDim focus:border-accent focus:bg-[#181826] focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all shadow-lg backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mutedDim hover:text-white transition-colors"
                title="Limpar pesquisa"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Alternador Todas vs Apenas com Listas */}
          <div className="inline-flex rounded-2xl border border-white/[0.08] bg-[#12121B]/90 p-1 shrink-0 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === "all"
                  ? "bg-accent text-black shadow-sm font-black"
                  : "text-mutedDim hover:text-white"
              }`}
            >
              Todas ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("active_only")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === "active_only"
                  ? "bg-accent text-black shadow-sm font-black"
                  : "text-mutedDim hover:text-white"
              }`}
            >
              Com Tier Lists ({activeCategoriesCount})
            </button>
          </div>
        </div>

        {/* Pílulas de Domínios Temáticos */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DOMAIN_FILTERS.map((dm) => {
            const Icon = dm.icon;
            const isSelected = selectedDomain === dm.id;
            return (
              <button
                key={dm.id}
                type="button"
                onClick={() => setSelectedDomain(dm.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[12px] font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-white text-black shadow-md font-black"
                    : "bg-surface/70 border border-white/[0.06] text-mutedDim hover:text-white hover:border-white/20"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-black" : "text-accent"} />
                <span>{dm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          4. GRELHA DE CATEGORIAS
         ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 border border-accent/30 text-accent">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="font-display text-[20px] font-black text-white tracking-tight">
                {searchQuery
                  ? "Resultados da Pesquisa"
                  : selectedDomain !== "all"
                  ? DOMAIN_FILTERS.find((d) => d.id === selectedDomain)?.label
                  : filterMode === "active_only"
                  ? "Categorias com Tier Lists Criadas"
                  : "Todas as Categorias"}
              </h2>
            </div>
          </div>
          <span className="text-[12px] font-bold text-mutedDim bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            {filteredCategories.length}{" "}
            {filteredCategories.length === 1 ? "categoria" : "categorias"}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted text-sm flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-accent" size={20} />
            <span>A carregar catálogo de categorias…</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-10 sm:p-14 text-center rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-[#161624] via-[#12121A] to-[#0E0E14] backdrop-blur-xl shadow-xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-surface2 text-mutedDim">
              <Search size={24} />
            </div>
            <p className="text-white font-display font-bold mb-1.5 text-[18px]">
              Nenhuma categoria encontrada
            </p>
            <p className="text-[13.5px] text-mutedDim mb-6 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `Ainda não existe nenhuma categoria que corresponda a "${searchQuery}". Podes inaugurar este nicho em segundos!`
                : "Não foram encontradas categorias com os filtros selecionados."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-[13px] font-bold text-white hover:bg-surface2 transition-all"
                >
                  Limpar Pesquisa
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setNewCatName(searchQuery.trim());
                  }
                  setCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-bold text-black hover:opacity-90 transition-all shadow-glow"
              >
                <FolderPlus size={16} />
                <span>Inaugurar Categoria {searchQuery ? `"${searchQuery.trim()}"` : ""}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((c) => {
              const { IconComponent, color } = getCatVisuals(c);
              const hasLists = (c.count || 0) > 0;

              return (
                <div
                  key={c.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#13131E]/90 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60"
                >
                  {/* Glow Colorido no Hover */}
                  <div
                    className="absolute -top-12 -right-12 h-36 w-36 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
                    style={{ background: color }}
                  />

                  {/* Capa Visual da Categoria */}
                  {c.imageUrl ? (
                    <div className="relative h-44 w-full overflow-hidden bg-surface2">
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131E] via-[#13131E]/50 to-black/40" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between">
                        <span className="rounded-full border border-white/20 bg-black/70 px-2.5 py-0.5 text-[10.5px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
                          {c.domain ? (DOMAIN_THEMES[c.domain]?.label?.split(" ")[0] || c.domain) : "Geral"}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md ${
                            hasLists
                              ? "border-emerald-500/40 bg-emerald-950/70 text-emerald-300"
                              : "border-white/15 bg-black/60 text-mutedDim"
                          }`}
                        >
                          {hasLists ? `${c.count} ${c.count === 1 ? "Tier List" : "Tier Lists"}` : "Disponível"}
                        </span>
                      </div>

                      {/* Bottom Icon */}
                      <div className="absolute bottom-3.5 left-4 right-4 flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-md shadow-md shrink-0"
                          style={{
                            background: `${color}30`,
                            border: `1px solid ${color}60`,
                            color: color,
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-[18px] font-bold text-white truncate drop-shadow-sm">
                            {c.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 pb-2">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm"
                          style={{
                            background: `${color}18`,
                            border: `1px solid ${color}35`,
                            color: color,
                          }}
                        >
                          <IconComponent size={22} />
                        </div>
                        <span
                          className={`rounded-full border px-3 py-0.5 text-[11px] font-bold ${
                            hasLists
                              ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                              : "border-white/15 bg-white/5 text-mutedDim"
                          }`}
                        >
                          {hasLists ? `${c.count} ${c.count === 1 ? "Tier List" : "Tier Lists"}` : "Disponível"}
                        </span>
                      </div>
                      <h3 className="font-display text-[20px] font-bold text-white group-hover:text-white transition-colors">
                        {c.name}
                      </h3>
                    </div>
                  )}

                  {/* Corpo do Cartão */}
                  <div className="p-6 pt-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[13px] text-muted leading-relaxed line-clamp-2">
                        {c.description || "Comunidade temática aberta com rankings e votações livres."}
                      </p>

                      {/* Subcategorias Chips */}
                      {c.subcategories && c.subcategories.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-mutedDim mb-2">
                            Nichos & Subcategorias:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {c.subcategories.slice(0, 4).map((sub) => {
                              const subName = typeof sub === "string" ? sub : sub.name;
                              return (
                                <Link
                                  key={subName}
                                  to={`/explore?category=${c.id}&sub=${encodeURIComponent(subName)}`}
                                  className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-surface/80 border border-white/[0.06] text-mutedDim hover:text-white hover:border-white/20 transition-colors"
                                >
                                  {subName}
                                </Link>
                              );
                            })}
                            {c.subcategories.length > 4 && (
                              <span className="text-[10.5px] text-mutedDim px-1 self-center font-semibold">
                                +{c.subcategories.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                      <Link
                        to={`/explore?category=${c.id}`}
                        className="group/btn flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface/70 py-2.5 px-3 text-[12.5px] font-bold text-white transition-all duration-200 hover:border-accent/60 hover:bg-surface2 hover:text-white"
                      >
                        <span>{hasLists ? "Explorar Rankings" : "Ver Categoria"}</span>
                        <ArrowRight size={13} className="text-accent transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </Link>
                      <Link
                        to={`/create?category=${c.id}`}
                        className={`flex items-center gap-1.5 justify-center rounded-xl px-3.5 py-2.5 text-[12.5px] font-bold transition-all duration-200 shrink-0 ${
                          hasLists
                            ? "bg-white/10 text-white hover:bg-accent hover:text-black border border-white/15"
                            : "bg-accent text-black hover:opacity-90 shadow-glow"
                        }`}
                        title={hasLists ? "Criar nova lista nesta categoria" : "Inaugurar categoria com a primeira lista"}
                      >
                        <Plus size={15} />
                        <span>{hasLists ? "Criar" : "Inaugurar"}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          5. MODAL: INAUGURAR NOVA CATEGORIA
         ========================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#12121C] p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-5 top-5 text-muted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 border border-accent/40 text-accent">
                <FolderPlus size={22} />
              </div>
              <div>
                <h3 className="font-display text-[20px] font-bold text-white">
                  Inaugurar Nova Categoria
                </h3>
                <p className="text-xs text-mutedDim">
                  Adiciona qualquer nicho ou comunidade temática à taxonomia do TierWorld.
                </p>
              </div>
            </div>

            {saveSuccessMsg ? (
              <div className="p-6 text-center rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold my-6">
                {saveSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
                {/* Nome da Categoria */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mutedDim mb-1.5">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Fórmula 1, Sapatilhas Sneakers, Cozinha Italiana, Soulslike..."
                    className="w-full rounded-2xl border border-white/15 bg-surface px-4 py-3 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors"
                  />

                  {/* Sugestões da API da Wikipedia se encontradas */}
                  {isSearchingModalApi ? (
                    <div className="mt-2 text-xs text-mutedDim flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin text-accent" />
                      <span>A procurar na enciclopédia da Wikipedia…</span>
                    </div>
                  ) : (
                    modalApiSuggestions.length > 0 && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-accentSoft/20 border border-accent/30">
                        <div className="text-[11px] font-bold text-accent mb-2 flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>Sugestões verificadas da Wikipedia:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {modalApiSuggestions.map((sug) => (
                            <button
                              key={sug.id}
                              type="button"
                              onClick={() => handleSelectApiSuggestion(sug)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-accent/40 text-xs font-bold text-white hover:bg-accent hover:text-black transition-all group"
                            >
                              {sug.imageUrl && (
                                <img
                                  src={sug.imageUrl}
                                  alt={sug.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              )}
                              <span>{sug.name}</span>
                              <span className="text-[10px] text-accent group-hover:text-black font-normal">
                                + Usar Dados
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mutedDim mb-1.5">
                    Descrição do Tema
                  </label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Breve resumo sobre o foco desta categoria e o que nela se classifica..."
                    className="w-full rounded-2xl border border-white/15 bg-surface px-4 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Domínio / Área Temática */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mutedDim mb-1.5">
                    Área Temática (Domínio)
                  </label>
                  <select
                    value={newCatDomain}
                    onChange={(e) => setNewCatDomain(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-surface px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                  >
                    <option value="gaming">Gaming & Videojogos</option>
                    <option value="sports">Desporto & Futebol</option>
                    <option value="entertainment">Cinema & TV</option>
                    <option value="anime">Anime & Manga</option>
                    <option value="music">Música & Artistas</option>
                    <option value="tech">Tecnologia & Ciência</option>
                    <option value="lifestyle">Gastronomia & Lifestyle</option>
                    <option value="culture">Cultura Pop & Geek</option>
                    <option value="general">Geral & Sociedade</option>
                  </select>
                </div>

                {/* Subcategorias */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mutedDim mb-1.5">
                    Subcategorias Sugeridas (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={newCatSubcategories}
                    onChange={(e) => setNewCatSubcategories(e.target.value)}
                    placeholder="Ex: Pilotos, Equipas, Circuitos, Temporadas"
                    className="w-full rounded-2xl border border-white/15 bg-surface px-4 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                {/* URL da Imagem de Capa */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mutedDim mb-1.5">
                    URL da Capa Visual (opcional)
                  </label>
                  <input
                    type="url"
                    value={newCatImageUrl}
                    onChange={(e) => setNewCatImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... ou URL direto da imagem"
                    className="w-full rounded-2xl border border-white/15 bg-surface px-4 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                {/* Cor de Destaque */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mutedDim mb-2">
                    Cor Temática de Destaque
                  </label>
                  <div className="flex items-center gap-2.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`h-8 w-8 rounded-full border transition-transform ${
                          newCatColor === c ? "scale-125 border-white" : "border-white/20 hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/15 bg-surface text-sm font-bold text-white hover:bg-surface2 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCat || !newCatName.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-sm font-bold text-black hover:opacity-90 transition-all shadow-glow disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSavingCat ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>A criar categoria…</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Inaugurar Categoria</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          6. PAINEL INFORMATIVO DE SINCRONIZAÇÃO
         ========================================================= */}
      <div className="mt-16 relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E14] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <Info size={20} />
            </div>
            <div>
              <h3 className="font-display text-[17px] font-bold text-white">
                Como Funciona a Taxonomia & Categorias no TierWorld?
              </h3>
              <p className="text-[12.5px] text-muted font-normal">
                Estrutura viva, dinâmica e escalável construída em colaboração com a comunidade.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300 shrink-0 self-start sm:self-auto">
            <CheckCircle2 size={13} />
            <span>Sincronização Bidirecional Ativa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4.5">
            <div className="font-display text-[15.5px] font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-black">1</span>
              <span>Catálogo Expandível</span>
            </div>
            <p className="text-[12px] text-mutedDim leading-relaxed">
              Dispomos de dezenas de categorias de base ricas e suportamos qualquer nicho criado organicamente pelos membros.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4.5">
            <div className="font-display text-[15.5px] font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-black">2</span>
              <span>Contagem em Tempo Real</span>
            </div>
            <p className="text-[12px] text-mutedDim leading-relaxed">
              Cada Tier List publicada atualiza instantaneamente os contadores e estatísticas de popularidade da respetiva categoria.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4.5">
            <div className="font-display text-[15.5px] font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-black">3</span>
              <span>Navegação por Nichos</span>
            </div>
            <p className="text-[12px] text-mutedDim leading-relaxed">
              Podes explorar diretamente as subcategorias de cada universo e filtrar rapidamente listas focadas nos teus tópicos favoritos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
