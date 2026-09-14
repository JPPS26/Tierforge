import React, { useMemo, useState } from "react";
import TierListCard from "../components/TierListCard";
import { CATEGORIES, DEMO_LISTS } from "../data/mock";

const TABS = ["Trending", "Popular", "New", "Featured"];

export default function Explore() {
  const [tab, setTab] = useState("Trending");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    let list = [...DEMO_LISTS];
    if (cat !== "All") list = list.filter((l) => l.category === cat);
    if (tab === "New") list.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
    else if (tab === "Popular") list.sort((a, b) => b.views - a.views);
    else if (tab === "Featured") list = list.filter((_, i) => i % 3 === 0);
    else list.sort((a, b) => b.votes - a.votes);
    return list;
  }, [tab, cat]);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10">
      <h1 className="mb-1.5 font-display text-[34px] font-bold">Explore</h1>
      <p className="mb-7 text-muted">Discover what the community is ranking right now.</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-[10px] border px-4 py-2 text-[13.5px] font-semibold ${
              tab === t
                ? "border-[rgba(255,122,61,0.5)] bg-accentSoft text-[#FFB37D]"
                : "border-border text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap gap-2">
        {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border border-border px-3 py-1.5 text-[12.5px] ${
              cat === c ? "bg-surface2 text-text" : "text-mutedDim"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {filtered.map((l) => <TierListCard key={l.id} list={l} />)}
      </div>
    </div>
  );
}
