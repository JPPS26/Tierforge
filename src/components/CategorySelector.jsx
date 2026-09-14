import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Check,
  ChevronDown,
  Sparkles,
  X,
  Tag,
  Gamepad2,
  Trophy,
  Flame,
  Film,
  Tv,
  Music,
  Cpu,
  Zap,
  Shield,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { getCategories, saveCategoryWithApiData } from "../services/db";
import {
  searchApiCategories,
  fetchCategoryDetailsFromApi,
  getApiCatalog,
} from "../services/categoriesApi";
import { useLanguage } from "../context/LanguageContext";

const ICON_COMPONENTS = {
  Gamepad2,
  Trophy,
  Flame,
  Film,
  Tv,
  Sparkles,
  Music,
  Cpu,
  Zap,
  Shield,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Tag,
};

export default function CategorySelector({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Resultados da API em tempo real
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const searchTimeoutRef = useRef(null);

  const reloadCategories = () => {
    setCategories(getCategories());
  };

  useEffect(() => {
    reloadCategories();
  }, []);

  // Procura na API se o utilizador escrever algo novo
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const q = searchQuery.trim();
    if (q.length < 2) {
      setApiSuggestions([]);
      setIsSearchingApi(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const results = await searchApiCategories(q);
        // Exclui os que já existem localmente
        const existingSlugs = new Set(categories.map((c) => c.slug || c.id));
        const filtered = results.filter((r) => !existingSlugs.has(r.slug));
        setApiSuggestions(filtered.slice(0, 4));
      } catch (e) {
        console.warn("Erro ao pesquisar sugestões da API:", e);
      } finally {
        setIsSearchingApi(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, categories]);

  const activeCategoryObj = categories.find(
    (c) =>
      c.id === selectedCategory ||
      c.slug === selectedCategory ||
      (c.name && c.name.toLowerCase() === (selectedCategory || "").toLowerCase())
  );

  const filteredCategories = searchQuery.trim()
    ? categories.filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.slug || "").toLowerCase().includes(q) ||
          (c.subcategories || []).some((sub) =>
            (typeof sub === "string" ? sub : sub.name || "").toLowerCase().includes(q)
          )
        );
      })
    : categories;

  const handleSelectApiCategory = async (apiCat) => {
    try {
      const detailed = await fetchCategoryDetailsFromApi(apiCat.name);
      const saved = await saveCategoryWithApiData({
        ...apiCat,
        ...(detailed || {}),
      });
      reloadCategories();
      onSelectCategory(saved.slug || saved.id);
      if (saved.subcategories && saved.subcategories.length > 0) {
        onSelectSubcategory(saved.subcategories[0]);
      }
      setSearchQuery("");
      setApiSuggestions([]);
    } catch (e) {
      onSelectCategory(apiCat.slug);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface/70 p-5 shadow-lg backdrop-blur-md">
      {/* Cabeçalho */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="text-[12px] font-bold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
            <span>Categoria & Taxonomia</span>
          </label>
          <p className="text-xs text-mutedDim mt-0.5">
            Escolhe uma categoria ou pesquisa qualquer tema na nossa API pública.
          </p>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-mutedDim" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar categoria ou tema da API (ex: Fórmula 1, Rock, Marvel)..."
          className="w-full rounded-2xl border border-border bg-[#0e0f14] pl-10 pr-10 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setApiSuggestions([]);
            }}
            className="absolute right-3.5 top-3 text-mutedDim hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sugestões da API se o utilizador estiver a pesquisar */}
      {apiSuggestions.length > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-accentSoft/20 border border-accent/30 animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent mb-2">
            <Sparkles size={13} />
            <span>Sugerido da API Pública de Categorias:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {apiSuggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectApiCategory(item)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-accent/40 text-xs font-bold text-white hover:bg-accent hover:text-black transition-all shadow-sm group"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <Sparkles size={13} className="text-accent group-hover:text-black" />
                )}
                <span>{item.name}</span>
                <span className="text-[10px] text-accent group-hover:text-black/80 font-normal">
                  + Adicionar
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pílulas de Categorias Disponíveis */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(isExpanded || searchQuery ? filteredCategories : filteredCategories.slice(0, 10)).map(
          (cat) => {
            const isSelected =
              activeCategoryObj?.id === cat.id ||
              activeCategoryObj?.slug === cat.slug ||
              (activeCategoryObj?.name &&
                cat.name &&
                activeCategoryObj.name.toLowerCase() === cat.name.toLowerCase());
            const Icon = ICON_COMPONENTS[cat.icon] || Tag;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.slug || cat.id);
                  onSelectSubcategory("");
                }}
                className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-accent text-black shadow-glow scale-[1.02]"
                    : "bg-surface2/80 text-muted hover:text-white hover:border-accent/40 border border-border"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-black" : "text-accent"} />
                <span>{cat.name}</span>
                {isSelected && <Check size={13} className="stroke-[3]" />}
                {cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-black/20 text-black" : "bg-surface text-mutedDim"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          }
        )}

        {!searchQuery && filteredCategories.length > 10 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border bg-surface text-xs font-semibold text-mutedDim hover:text-white transition-colors"
          >
            <span>
              {isExpanded
                ? "Mostrar menos"
                : `+${filteredCategories.length - 10} mais categorias`}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Subcategorias da Categoria Selecionada */}
      {activeCategoryObj?.subcategories?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <div className="text-[11px] font-bold text-mutedDim mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent" />
            <span>Subcategorias de {activeCategoryObj.name}:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectSubcategory("")}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
                !selectedSubcategory
                  ? "bg-white/10 text-white font-bold border border-white/20"
                  : "bg-surface text-mutedDim hover:text-white"
              }`}
            >
              Geral / Todas
            </button>
            {activeCategoryObj.subcategories.map((sub) => {
              const subName = typeof sub === "string" ? sub : sub.name;
              const isSubSelected = selectedSubcategory === subName;

              return (
                <button
                  key={subName}
                  type="button"
                  onClick={() => onSelectSubcategory(subName)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    isSubSelected
                      ? "bg-accentSoft text-accent border border-accent/40 font-bold"
                      : "bg-surface text-mutedDim hover:text-white border border-border/50"
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
  );
}
