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
  const tiers = list.tiers?.slice(0, 4) || [
    { label: "S", color: TIER_COLORS.S },
    { label: "A", color: TIER_COLORS.A },
    { label: "B", color: TIER_COLORS.B },
  ];

  const items = list.items || [];
  const placements = list.placements || {};

  return (
    <div className="flex w-full flex-col gap-[3px] overflow-hidden rounded-xl bg-surface2/60 p-1.5 border border-white/5">
      {tiers.map((t) => {
        const tierItems = items.filter((it) => placements[it.id] === t.id);

        return (
          <div key={t.id || t.label} className="flex h-[24px] overflow-hidden rounded-md">
            <div
              className="flex w-[28px] flex-shrink-0 items-center justify-center font-display text-[11px] font-black text-[#0A0A0D]"
              style={{ background: t.color || "#8A6BFF" }}
            >
              {t.label}
            </div>
            <div className="flex flex-1 items-center gap-[4px] bg-black/30 px-1.5 overflow-hidden">
              {tierItems.length > 0 ? (
                tierItems.slice(0, 5).map((it) =>
                  it.imageUrl ? (
                    <img
                      key={it.id}
                      src={it.imageUrl}
                      alt={it.name}
                      className="h-4 w-4 flex-shrink-0 rounded object-cover border border-white/10"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      key={it.id}
                      className="flex h-4 min-w-[20px] items-center justify-center rounded px-1 text-[8px] font-bold text-white border border-white/10"
                      style={{ background: `${colorFor(it.name)}60` }}
                    >
                      {it.name?.slice(0, 3)}
                    </div>
                  )
                )
              ) : (
                <div className="h-1.5 w-10 rounded bg-white/5" />
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
      className="group flex flex-col justify-between gap-3.5 rounded-3xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-accent/80 hover:bg-surface2/40 hover:shadow-glow"
    >
      <MiniTierPreview list={list} />

      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Badge tone="accent">
            {getCategoryDisplayName(list.category)}
          </Badge>
          {list.subcategory && (
            <span className="text-[11px] font-semibold text-mutedDim truncate max-w-[120px]">
              • {list.subcategory}
            </span>
          )}
          {list.visibility === "unlisted" && <Badge tone="amber">Não Listada</Badge>}
        </div>

        <h3 className="mb-2 font-display text-[15.5px] font-bold leading-snug text-white group-hover:text-accent transition-colors line-clamp-2">
          {list.title}
        </h3>

        <div className="mb-3 flex items-center gap-2">
          <Avatar
            name={list.creator || "Criador"}
            image={list.creatorAvatar}
            size={22}
          />
          <span className="text-[12.5px] font-medium text-muted truncate">
            {list.creator || "Anónimo"}
          </span>
          {list.creatorHandle && (
            <span className="text-[11.5px] font-bold text-accent/80">
              #{list.creatorHandle}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-[12px] text-mutedDim">
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
    </Link>
  );
}
