import React from "react";
import { Crown } from "lucide-react";
import { Avatar } from "../components/UI";
import { CREATORS } from "../data/mock";

export default function Leaderboard() {
  const rows = CREATORS.concat(CREATORS).map((c, i) => ({ ...c, xp: 48000 - i * 3120, rank: i + 1 }));
  return (
    <div className="mx-auto max-w-[900px] px-6 pb-24 pt-10">
      <h1 className="mb-1.5 font-display text-[34px] font-bold">Leaderboard</h1>
      <p className="mb-7 text-muted">Top creators this month, ranked by Creator XP.</p>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.slice(0, 10).map((r, i) => (
          <div
            key={i}
            className={`flex items-center gap-3.5 px-4.5 py-3.5 ${i < 9 ? "border-b border-border" : ""}`}
          >
            <div className={`w-6 font-display text-[14px] font-bold ${r.rank <= 3 ? "text-[#FFD23F]" : "text-mutedDim"}`}>
              {r.rank}
            </div>
            <Avatar name={r.name} size={34} />
            <div className="flex-1">
              <div className="text-[14.5px] font-semibold">{r.name}</div>
              <div className="text-[12px] text-mutedDim">{r.badge}</div>
            </div>
            {r.rank <= 3 && <Crown size={16} className="text-[#FFD23F]" />}
            <div className="font-display text-[14px] font-bold">{r.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}
