import React from "react";
import { Crown, Sparkles } from "lucide-react";
import { Avatar } from "../components/UI";
import { useLanguage } from "../context/LanguageContext";

const TOP_CREATORS = [
  { name: "Rodrigo Matos", badge: "Criador de Elite", xp: 64200, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" },
  { name: "Alexandre Rocha", badge: "Especialista Gaming", xp: 58900, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80" },
  { name: "Beatriz Costa", badge: "Crítica de Cinema", xp: 49100, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
  { name: "Marco Fernandes", badge: "Criador Top", xp: 42300, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
  { name: "Carolina Silva", badge: "Avaliadora Pro", xp: 38700, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
  { name: "Diogo Santos", badge: "Criador em Ascensão", xp: 33100, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" },
];

export default function Leaderboard() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-[900px] px-6 pb-24 pt-10">
      <h1 className="mb-2 font-display text-[32px] sm:text-[38px] font-black text-white">
        {t("leaderboard.title")}
      </h1>
      <p className="mb-8 text-muted">{t("leaderboard.subtitle")}</p>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border/80 bg-surface2/60 px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-mutedDim">
          <div className="flex items-center gap-4">
            <span className="w-8">{t("leaderboard.rank")}</span>
            <span>{t("leaderboard.creator")}</span>
          </div>
          <span>{t("leaderboard.xp")}</span>
        </div>

        {TOP_CREATORS.map((r, i) => (
          <div
            key={r.name}
            className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface2/50 ${
              i < TOP_CREATORS.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 font-display text-[15px] font-black ${
                  i === 0
                    ? "text-[#FFD23F]"
                    : i === 1
                    ? "text-[#C0C0C0]"
                    : i === 2
                    ? "text-[#CD7F32]"
                    : "text-mutedDim"
                }`}
              >
                {i + 1}
              </div>

              <Avatar name={r.name} size={36} />

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[14.5px] font-bold text-text">
                    {r.name}
                  </span>
                  {i === 0 && <Crown size={15} className="text-[#FFD23F]" />}
                </div>
                <div className="text-[12px] text-mutedDim">{r.badge}</div>
              </div>
            </div>

            <div className="font-display text-[14.5px] font-bold text-white">
              {r.xp.toLocaleString()} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
