import React from "react";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, Badge, colorFor } from "./UI";
import { useLanguage } from "../context/LanguageContext";
import { getCategoryDisplayName } from "../services/db";

const TIER_COLORS = {
  "S+": "#FF3B5C",
  S: "#FF6B7A",
  A: "#FF9F43",
  B: "#FFD23F",
  C: "#6BCB77",
  D: "#4D96FF",
};

function MiniTierPreview({ list }) {
  const tiers = list.tiers && list.tiers.length > 0 ? list.tiers.slice(0, 4) : [
    { id: "t1", label: "S", color: TIER_COLORS.S },
    { id: "t2", label: "A", color: TIER_COLORS.A },
    { id: "t3", label: "B", color: TIER_COLORS.B },
  ];

  const items = list.items || [];
  const placements = list.placements || {};

  return (
    <div className="flex w-full flex-col gap-[3px] overflow-hidden rounded-xl bg-black/40 p-1.5 border border-white/[0.06]">
      {tiers.map((t) => {
        const tierItems = items.filter((it) => t.id && placements[it.id] === t.id);

        return (
          <div key={t.id || t.label} className="flex h-[26px] overflow-hidden rounded-lg">
            <div
              className="flex w-[28px] flex-shrink-0 items-center justify-center font-display text-[11px] font-black text-[#0A0A0D]"
              style={{ background: t.color || "#8A6BFF" }}
            >
              {t.label}
            </div>
            <div className="flex flex-1 items-center gap-[5px] bg-white/[0.03] px-2 overflow-hidden">
              {tierItems.length > 0 ? (
                tierItems.slice(0, 5).map((it) =>
                  it.imageUrl ? (
                    <img
                      key={it.id}
                      src={it.imageUrl}
                      alt={it.name}
                      className="h-[18px] w-[18px] flex-shrink-0 rounded-md object-cover border border-white/15"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      key={it.id}
                      className="flex h-[18px] min-w-[20px] items-center justify-center rounded-md px-1 text-[8.5px] font-bold text-white border border-white/15"
                      style={{ background: `${colorFor(it.name)}70` }}
                    >
                      {it.name?.slice(0, 3)}
                    </div>
                  )
                )
              ) : (
                <div className="h-1.5 w-8 rounded-full bg-white/[0.06]" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TierListCard({ list }) {
  const { t } = useLanguage();

  return (
    <Link
      to={`/tier-list/${list.id}`}
      className="group flex flex-col justify-between gap-3.5 rounded-2xl border border-white/[0.08] bg-[#131422] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-accent/60 hover:bg-[#18192A] hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(124,92,255,0.15)]"
    >
      <MiniTierPreview list={list} />

      <div className="flex flex-col flex-1 justify-between">
        <div>
          <div className="mb-2 flex items-center gap-1.5 flex-wrap">
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-extrabold text-accent border border-accent/30">
              {getCategoryDisplayName(list.category)}
            </span>
            {list.subcategory && (
              <span className="text-[11px] font-semibold text-mutedDim truncate max-w-[120px]">
                • {list.subcategory}
              </span>
            )}
            {list.visibility === "unlisted" && (
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10.5px] font-bold text-amber-300 border border-amber-500/30">
                Não Listada
              </span>
            )}
          </div>

          <div className="h-[44px] flex items-start mb-2.5">
            <h3 className="font-display text-[14.5px] font-bold leading-snug text-white group-hover:text-accent transition-colors line-clamp-2">
              {list.title}
            </h3>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Avatar
              name={list.creator || "Criador"}
              image={list.creatorAvatar}
              size={22}
            />
            <span className="text-[12px] font-semibold text-muted truncate max-w-[130px]">
              {list.creator || "Anónimo"}
            </span>
            {list.creatorHandle && (
              <span className="text-[11px] font-bold text-accent/80 truncate">
                #{list.creatorHandle}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[11.5px] text-mutedDim font-medium">
            <span className="flex items-center gap-1 font-bold text-white">
              <Heart size={13} className="text-[#FF5470]" />
              {(list.votes || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={13} />
              {list.views > 1000
                ? `${(list.views / 1000).toFixed(1)}k`
                : (list.views || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={13} />
              {list.commentsCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
