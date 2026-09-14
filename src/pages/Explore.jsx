import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TierListCard from "../components/TierListCard";
import { useLanguage } from "../context/LanguageContext";
import { getTierLists, getCategories } from "../services/db";
import { EmptyState } from "../components/UI";
import { Sparkles } from "lucide-react";

export default function Explore() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [tab, setTab] = useState("Trending");
  const [cat, setCat] = useState(initialCat);
  const [queryText, setQueryText] = useState(initialSearch);
  const [lists, setLists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    setLoading(true);
    getTierLists({
      category: cat,
      tab,
      queryText,
    })
      .then(setLists)
      .finally(() => setLoading(false));
  }, [tab, cat, queryText]);

  const tabs = [
    { key: "Trending", label: t("explore.tabTrending") },
    { key: "Popular", label: t("explore.tabPopular") },
    { key: "New", label: t("explore.tabNew") },
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      <h1 className="mb-2 font-display text-[32px] sm:text-[40px] font-black text-white tracking-tight">
        {t("explore.title")}
      </h1>
      <p className="mb-8 text-[14.5px] text-muted max-w-xl leading-relaxed">
        {t("explore.subtitle")}
      </p>

      {/* Abas de Ordenação */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {tabs.map((tItem) => (
          <button
            key={tItem.key}
            type="button"
            onClick={() => setTab(tItem.key)}
            className={`rounded-xl border px-4 py-2 text-[13px] font-bold transition-all ${
              tab === tItem.key
                ? "border-accent bg-accentSoft text-[#B6A5FF] shadow-sm"
                : "border-border bg-surface text-muted hover:border-borderStrong hover:text-text"
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {/* Filtro por Categorias Reais */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCat("All");
            setSearchParams({});
          }}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            cat === "All"
              ? "border-accent bg-accent text-white"
              : "border-border bg-surface text-mutedDim hover:border-borderStrong hover:text-text"
          }`}
        >
          {t("explore.allCategories")}
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCat(c.id);
              setSearchParams({ category: c.id });
            }}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              cat === c.id
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-mutedDim hover:border-borderStrong hover:text-text"
            }`}
          >
            {t(`categories.${c.id}`) || c.name}
          </button>
        ))}
      </div>

      {/* Lista de Resultados Reais */}
      {loading ? (
        <div className="py-24 text-center text-muted">A carregar rankings…</div>
      ) : lists.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nenhuma Tier List encontrada"
          body={t("explore.noLists")}
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
