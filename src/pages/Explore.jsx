import React, { useMemo, useState } from "react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TierListCard from "../components/TierListCard";
import { CATEGORIES, DEMO_LISTS } from "../data/mock";
import { useLanguage } from "../context/LanguageContext";
import { getTierLists, getCategories } from "../services/db";

const TABS = ["Trending", "Popular", "New", "Featured"];
export default function Explore() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

export default function Explore() {
  const initialCat = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [tab, setTab] = useState("Trending");
  const [cat, setCat] = useState("All");
  const [cat, setCat] = useState(initialCat);
  const [queryText, setQueryText] = useState(initialSearch);
  const [lists, setLists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    let list = [...DEMO_LISTS];
    if (cat !== "All") list = list.filter((l) => l.category === cat);
    if (tab === "New") list.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
    else if (tab === "Popular") list.sort((a, b) => b.views - a.views);
    else if (tab === "Featured") list = list.filter((_, i) => i % 3 === 0);
    else list.sort((a, b) => b.votes - a.votes);
    return list;
  }, [tab, cat]);
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
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10">
      <h1 className="mb-1.5 font-display text-[34px] font-bold">Explore</h1>
      <p className="mb-7 text-muted">Discover what the community is ranking right now.</p>
      <h1 className="mb-2 font-display text-[32px] sm:text-[38px] font-black text-white">
        {t("explore.title")}
      </h1>
      <p className="mb-8 text-muted">{t("explore.subtitle")}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
      {/* Abas de Ordenação */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {tabs.map((tItem) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-[10px] border px-4 py-2 text-[13.5px] font-semibold ${
              tab === t
                ? "border-[rgba(124,92,255,0.5)] bg-accentSoft text-[#B6A5FF]"
                : "border-border text-muted"
            key={tItem.key}
            type="button"
            onClick={() => setTab(tItem.key)}
            className={`rounded-xl border px-4 py-2 text-[13.5px] font-bold transition-all ${
              tab === tItem.key
                ? "border-accent bg-accentSoft text-[#B6A5FF] shadow-sm"
                : "border-border bg-surface text-muted hover:border-borderStrong hover:text-text"
            }`}
          >
            {t}
            {tItem.label}
          </button>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap gap-2">
        {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
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
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border border-border px-3 py-1.5 text-[12.5px] ${
              cat === c ? "bg-surface2 text-text" : "text-mutedDim"
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
            {c}
            {t(`categories.${c.id}`) || c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {filtered.map((l) => <TierListCard key={l.id} list={l} />)}
      </div>
      {/* Lista de Resultados */}
      {loading ? (
        <div className="py-20 text-center text-muted">A carregar rankings…</div>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted">
          {t("explore.noLists")}
        </div>
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
