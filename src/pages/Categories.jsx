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
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10">
      <h1 className="mb-2 font-display text-[32px] sm:text-[38px] font-black text-white">
        {t("categories.title")}
      </h1>
      <p className="mb-8 text-muted">{t("categories.subtitle")}</p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {categories.map((c) => {
          const Icon = ICON_MAP[c.id] || Sparkles;
          return (
            <Link
              key={c.id}
              to={`/explore?category=${c.id}`}
              className="group rounded-2xl border border-border p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:bg-surface2"
              style={{ background: "linear-gradient(160deg, #13131A, #181822)" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accentSoft text-accent group-hover:scale-110 transition-transform">
                <Icon size={24} />
              </div>
              <div className="mb-1.5 font-display text-[19px] font-bold text-text group-hover:text-accent transition-colors">
                {t(`categories.${c.id}`) || c.name}
              </div>
              <div className="text-[13px] text-mutedDim">
                {t("categories.listsCount", { count: c.count })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
