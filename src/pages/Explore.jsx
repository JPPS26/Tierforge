import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TierListCard from "../components/TierListCard";
import { useLanguage } from "../context/LanguageContext";
import { getTierLists, getCategories, getPopularCategories } from "../services/db";
import { EmptyState } from "../components/UI";
import { Sparkles, Search, Flame, X, Filter } from "lucide-react";

export default function Explore() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get("category") || "All";
  const initialSub = searchParams.get("sub") || "";
  const initialSearch = searchParams.get("search") || "";

  const [tab, setTab] = useState("Trending");
  const [cat, setCat] = useState(initialCat);
  const [selectedSub, setSelectedSub] = useState(initialSub);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [queryText, setQueryText] = useState(initialSearch);
  const [lists, setLists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategories(getCategories());
    setPopularCategories(getPopularCategories());
  }, []);

  useEffect(() => {
    const urlCat = searchParams.get("category") || "All";
    const urlSub = searchParams.get("sub") || "";
    setCat(urlCat);
    setSelectedSub(urlSub);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
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

  const activeCategories = categories.filter((c) => (c.count || 0) > 0);
  const activeCatObj = categories.find((c) => c.id === cat || c.slug === cat);

  const filteredPillCategories = categorySearchQuery.trim()
    ? activeCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
          (c.subcategories || []).some((sub) =>
            (typeof sub === "string" ? sub : sub.name || "")
              .toLowerCase()
              .includes(categorySearchQuery.toLowerCase())
          )
      )
    : activeCategories;

  const tabs = [
    { key: "Trending", label: t("explore.tabTrending") },
    { key: "Popular", label: t("explore.tabPopular") },
    { key: "New", label: t("explore.tabNew") },
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

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      {/* Título & Descrição */}
      <h1 className="mb-2 font-display text-[32px] sm:text-[40px] font-black text-white tracking-tight">
        {t("explore.title")}
      </h1>
      <p className="mb-8 text-[14.5px] text-muted max-w-xl leading-relaxed">
        {t("explore.subtitle")}
      </p>

      {/* Barra de Ordenação e Pesquisa */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Abas de Ordenação */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tItem) => (
            <button
              key={tItem.key}
              type="button"
              onClick={() => setTab(tItem.key)}
              className={`rounded-2xl border px-4 py-2 text-[13px] font-bold transition-all ${
                tab === tItem.key
                  ? "border-accent bg-accent text-black shadow-glow"
                  : "border-border bg-surface text-muted hover:border-borderStrong hover:text-text"
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        {/* Pesquisa Rápida de Listas */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-mutedDim" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Filtrar por nome ou tema…"
            className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-2 text-xs text-white placeholder-mutedDim focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Secção de Descoberta de Categorias (Apenas exibida quando existem categorias com listas) */}
      {activeCategories.length > 0 && (
        <div className="mb-8 rounded-3xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent" />
              <span className="font-display text-sm font-bold text-white">
                Explorar Categorias
              </span>
            </div>

            {activeCategories.length > 4 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-mutedDim" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Pesquisar categoria…"
                  className="w-full rounded-xl border border-border bg-[#0a0b0e] pl-8 pr-3 py-1.5 text-xs text-white placeholder-mutedDim focus:border-accent focus:outline-none"
                />
                {categorySearchQuery && (
                  <button
                    onClick={() => setCategorySearchQuery("")}
                    className="absolute right-2.5 top-2 text-mutedDim hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pílulas de Categorias com Listas Reais */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSelectCategory("All")}
              className={`rounded-2xl border px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                cat === "All"
                  ? "border-accent bg-accent text-black shadow-glow"
                  : "border-border bg-surface text-mutedDim hover:text-white"
              }`}
            >
              {t("explore.allCategories")}
            </button>

            {filteredPillCategories.map((c) => {
              const isSelected = cat === c.id || cat === c.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCategory(c.id)}
                  className={`rounded-2xl border px-3.5 py-1.5 text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "border-accent bg-accent text-black shadow-glow"
                      : "border-border bg-surface text-mutedDim hover:border-accent/40 hover:text-white"
                  }`}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-black/25 text-black" : "bg-surface2 text-mutedDim"
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
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="text-[11px] font-bold text-mutedDim mb-2">
                Filtrar por subcategoria de {activeCatObj.name}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectSubcategory("")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                    !selectedSub
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-surface text-mutedDim hover:text-white"
                  }`}
                >
                  Todas as subcategorias
                </button>
                {activeCatObj.subcategories.map((sub) => {
                  const subName = typeof sub === "string" ? sub : sub.name;
                  const isSubActive = selectedSub === subName;
                  return (
                    <button
                      key={subName}
                      type="button"
                      onClick={() => handleSelectSubcategory(subName)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isSubActive
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
      )}

      {/* Lista de Resultados Reais */}
      {loading ? (
        <div className="py-24 text-center text-muted text-sm">
          A carregar rankings da comunidade…
        </div>
      ) : lists.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nenhuma Tier List encontrada"
          body={
            selectedSub
              ? `Ainda não existem listas na subcategoria "${selectedSub}". Sê o primeiro a criar!`
              : cat !== "All"
              ? `Ainda não existem listas nesta categoria. Sê o primeiro a criar!`
              : t("explore.noLists")
          }
          actionLabel="Criar Tier List"
          onAction={() => (window.location.href = "/create")}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {lists.map((l) => (
            <TierListCard key={l.id} list={l} />
          ))}
        </div>
      )}
    </div>
  );
}
