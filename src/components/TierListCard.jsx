import React from "react";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, Badge, colorFor } from "./UI";
import { useLanguage } from "../context/LanguageContext";

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
    <div className="flex w-full flex-col gap-[3px] overflow-hidden rounded-lg bg-surface2/60 p-1">
      {tiers.map((t) => {
        // Obter os itens colocados nesta tier
        const tierItems = items.filter((it) => placements[it.id] === t.id);

        return (
          <div key={t.id || t.label} className="flex h-[24px] overflow-hidden rounded-md">
            <div
              className="flex w-[28px] flex-shrink-0 items-center justify-center font-display text-[11px] font-black text-[#0A0A0D]"
              style={{ background: t.color || "#8A6BFF" }}
            >
              {t.label}
            </div>
            <div className="flex flex-1 items-center gap-[4px] bg-black/20 px-1.5 overflow-hidden">
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
                <div className="h-2 w-12 rounded bg-white/5" />
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
      className="group flex flex-col justify-between gap-3.5 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-borderStrong hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]"
    >
      <MiniTierPreview list={list} />

      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Badge tone="accent">
            {t(`categories.${list.category}`) || list.category?.toUpperCase() || "GERAL"}
          </Badge>
          {list.createdDaysAgo !== undefined && list.createdDaysAgo < 2 && (
            <Badge tone="teal">Novo</Badge>
          )}
        </div>

        <h3 className="mb-2 font-display text-[15.5px] font-bold leading-snug text-text group-hover:text-accent transition-colors line-clamp-2">
          {list.title}
        </h3>

        <div className="mb-3 flex items-center gap-2">
          <Avatar name={list.creator || "Criador"} size={22} />
          <span className="text-[12.5px] font-medium text-muted truncate">
            {list.creator || "Anónimo"}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-[12px] text-mutedDim">
          <span className="flex items-center gap-1 font-semibold">
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
            {list.commentsCount ?? list.comments ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
