import React from "react";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, Badge, colorFor } from "./UI";
import { TIER_COLORS } from "../data/mock";

function MiniTierPreview({ seedIndex }) {
  const rows = ["S", "A", "B", "C"];
  return (
    <div className="flex w-full flex-col gap-[3px]">
      {rows.map((r, ri) => (
        <div key={r} className="flex h-[22px] overflow-hidden rounded-md">
          <div
            className="flex w-[26px] items-center justify-center font-display text-[10.5px] font-extrabold text-[#0A0A0D]"
            style={{ background: TIER_COLORS[r] }}
          >
            {r}
          </div>
          <div className="flex flex-1 items-center gap-[3px] bg-surface2 px-1">
            {Array.from({ length: 5 - ri }).map((_, ci) => (
              <div
                key={ci}
                className="h-4 w-4 rounded border border-border"
                style={{
                  background: `linear-gradient(135deg, ${colorFor(String(seedIndex + ri + ci))}55, #121218)`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TierListCard({ list }) {
  return (
    <Link
      to={`/tier-list/${list.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-[3px] hover:border-borderStrong hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)]"
    >
      <MiniTierPreview seedIndex={list.id.length} />
      <div>
        <div className="mb-2 flex gap-1.5">
          <Badge>{list.category}</Badge>
          {list.createdDaysAgo < 2 && <Badge tone="teal">New</Badge>}
        </div>
        <div className="mb-2 font-display text-[15px] font-semibold leading-snug">{list.title}</div>
        <div className="mb-2.5 flex items-center gap-1.5">
          <Avatar name={list.creator} size={20} />
          <span className="text-[12.5px] text-muted">{list.creator}</span>
        </div>
        <div className="flex items-center justify-between text-[12px] text-mutedDim">
          <span className="flex items-center gap-1"><Heart size={13} /> {list.votes.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Eye size={13} /> {(list.views / 1000).toFixed(1)}k</span>
          <span className="flex items-center gap-1"><MessageCircle size={13} /> {list.comments}</span>
        </div>
      </div>
    </Link>
  );
}
