import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getCategories } from "../services/db";
import { Trophy, Gamepad2, Film, Tv, Sparkles, Music, Cpu, Flame } from "lucide-react";

const ICON_MAP = {
  football: Trophy,
  gaming: Gamepad2,
  movies: Film,
  tvshows: Tv,
  anime: Sparkles,
  music: Music,
  tech: Cpu,
  basketball: Flame,
};

export default function Categories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      <h1 className="mb-2 font-display text-[32px] sm:text-[40px] font-black text-white tracking-tight">
        {t("categories.title")}
      </h1>
      <p className="mb-8 text-[14.5px] text-muted max-w-xl leading-relaxed">
        {t("categories.subtitle")}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {categories.map((c) => {
          const Icon = ICON_MAP[c.id] || Sparkles;
          return (
            <Link
              key={c.id}
              to={`/explore?category=${c.id}`}
              className="group rounded-3xl border border-border p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:bg-surface2/60 hover:shadow-glow"
              style={{ background: "linear-gradient(160deg, #13131A 0%, #181824 100%)" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent group-hover:scale-110 transition-transform shadow-inner">
                <Icon size={24} />
              </div>
              <div className="mb-1.5 font-display text-[19px] font-bold text-white group-hover:text-accent transition-colors">
                {t(`categories.${c.id}`) || c.name}
              </div>
              <div className="text-[13px] font-semibold text-mutedDim">
                {t("categories.listsCount", { count: c.count })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
