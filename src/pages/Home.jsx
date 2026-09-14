import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Flame, TrendingUp, Sparkles, SlidersHorizontal, Zap, Trophy, Activity, Heart, Eye } from "lucide-react";
import { PrimaryButton, GhostButton, colorFor } from "../components/UI";
import TierListCard from "../components/TierListCard";
import { CATEGORIES, DEMO_LISTS, TIER_COLORS } from "../data/mock";

function LiveHeroTierList() {
  const rows = [
    { t: "S", items: 3 }, { t: "A", items: 4 }, { t: "B", items: 3 }, { t: "C", items: 2 }, { t: "D", items: 2 },
  ];
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPulse((p) => (p + 1) % 999), 1400);
    return () => clearInterval(iv);
  }, []);
  return (
    <div
      className="w-full max-w-[460px] rounded-[22px] border border-borderStrong p-5"
      style={{
        background: "linear-gradient(160deg, #14141C 0%, #0E0E14 100%)",
        boxShadow: "0 30px 90px -30px rgba(124,92,255,0.35)",
        transform: "rotate(1.4deg)",
      }}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-display text-[13.5px] font-bold">Best PL Midfielders — 2026</span>
        <span className="flex items-center gap-1 rounded-full border border-[rgba(49,216,168,0.35)] bg-[rgba(49,216,168,0.15)] px-2.5 py-1 text-[11.5px] font-semibold text-teal">
          <Activity size={11} /> Live
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r, ri) => (
          <div key={r.t} className="flex h-10 overflow-hidden rounded-lg">
            <div
              className="flex w-10 items-center justify-center font-display text-[14.5px] font-extrabold text-[#0A0A0D]"
              style={{ background: TIER_COLORS[r.t] }}
            >
              {r.t}
            </div>
            <div className="flex flex-1 items-center gap-1.5 bg-white/[0.03] px-2">
              {Array.from({ length: r.items }).map((_, ci) => {
                const active = (pulse + ri * 3 + ci) % 11 === 0;
                return (
                  <div
                    key={ci}
                    className="h-7 w-7 rounded-lg border transition-all duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${colorFor(String(ri + ci))}80, #121218)`,
                      borderColor: active ? "rgba(124,92,255,0.8)" : "rgba(255,255,255,0.08)",
                      transform: active ? "scale(1.12)" : "scale(1)",
                      boxShadow: active ? "0 0 0 3px rgba(124,92,255,0.25)" : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex items-center justify-between text-[11.5px] text-mutedDim">
        <span>4,208 votes</span>
        <span className="flex gap-2.5">
          <span className="flex items-center gap-1"><Heart size={12} /> 92%</span>
          <span className="flex items-center gap-1"><Eye size={12} /> 51k</span>
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, to }) {
  return (
    <div className="mb-4.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-[#B6A5FF]" />
        <h2 className="font-display text-[19px] font-semibold">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="text-[13.5px] text-muted hover:text-text">
          See all →
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const trending = DEMO_LISTS.slice(0, 4);

  return (
    <div>
      <section className="mx-auto max-w-[1240px] px-6 pb-14 pt-16">
        <div className="flex flex-wrap items-center gap-14">
          <div className="min-w-[300px] flex-1 basis-[480px]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(124,92,255,0.35)] bg-accentSoft px-2.5 py-1 text-[11.5px] font-semibold text-[#B6A5FF]">
              <Sparkles size={12} /> AI-assisted ranking, built in
            </span>
            <h1 className="my-5 font-display text-[clamp(40px,5.4vw,64px)] font-bold leading-[1.03] tracking-tighter">
              Every ranking
              <br />
              has a home here.
            </h1>
            <p className="mb-8 max-w-[460px] text-[17px] leading-relaxed text-muted">
              Build tier lists on anything — players, games, characters, gear — and put them
              in front of a community that actually argues back. Drag, drop, debate, done.
            </p>
            <div className="mb-10 flex flex-wrap gap-3">
              <Link to="/create"><PrimaryButton icon={Plus}>Create a tier list</PrimaryButton></Link>
              <Link to="/explore"><GhostButton icon={Flame}>Explore tier lists</GhostButton></Link>
            </div>
            <div className="flex gap-8">
              {[["2.1M", "tier lists"], ["380K", "creators"], ["48M", "votes cast"]].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-[22px] font-bold">{n}</div>
                  <div className="text-[12.5px] text-mutedDim">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-[300px] flex-1 basis-[380px] justify-center">
            <LiveHeroTierList />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-14">
        <SectionHeader icon={TrendingUp} title="Trending right now" to="/explore" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {trending.map((l) => <TierListCard key={l.id} list={l} />)}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-14">
        <SectionHeader icon={SlidersHorizontal} title="Browse by category" to="/categories" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/explore"
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 hover:border-borderStrong"
            >
              <div className="font-semibold">{c.name}</div>
              <div className="text-[11.5px] text-mutedDim">{c.count} lists</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-24">
        <SectionHeader icon={Zap} title="Built different" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {[
            { icon: Sparkles, title: "AI Tier List Generator", body: "Describe a ranking in plain English and get a first draft in seconds, fully editable." },
            { icon: Activity, title: "Live community score", body: "Every list carries a real-time agree/disagree pulse from everyone who's ranked it." },
            { icon: SlidersHorizontal, title: "Head-to-head compare", body: "Drop any two items into the comparison view for stats, form, and community verdicts." },
            { icon: Trophy, title: "Creator progression", body: "XP, streaks and creator scores that reward consistency, not just viral hits." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-surface p-5.5">
              <div className="mb-3.5 flex h-9.5 w-9.5 items-center justify-center rounded-[10px] bg-accentSoft">
                <f.icon size={19} className="text-[#B6A5FF]" />
              </div>
              <div className="mb-2 font-display font-semibold">{f.title}</div>
              <div className="text-[13.5px] leading-relaxed text-muted">{f.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
