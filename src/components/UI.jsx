import React from "react";

const AVATAR_COLORS = ["#7C5CFF", "#31D8A8", "#FF9F43", "#4D96FF", "#FF5470"];
export function colorFor(seed = "x") {
  return AVATAR_COLORS[seed.length % AVATAR_COLORS.length];
}

export function Avatar({ name, size = 32 }) {
  const initial = name?.[0]?.toUpperCase() || "?";
  const color = colorFor(name || "x");
  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}66)`,
        fontSize: size * 0.42,
        color: "#0A0A0D",
      }}
    >
      {initial}
    </div>
  );
}

const badgeTones = {
  default: "bg-surface2 text-muted border-border",
  accent: "bg-accentSoft text-[#B6A5FF] border-[rgba(124,92,255,0.35)]",
  teal: "bg-[rgba(49,216,168,0.15)] text-teal border-[rgba(49,216,168,0.35)]",
};

export function Badge({ children, tone = "default" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({ children, onClick, icon: Icon, small, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl font-display font-semibold text-white shadow-glow transition-transform hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 ${
        small ? "px-3.5 py-2 text-[13.5px]" : "px-5 py-3 text-[14.5px]"
      }`}
      style={{ background: "linear-gradient(135deg, #8A6BFF, #6A46F0)" }}
    >
      {Icon && <Icon size={small ? 15 : 17} />}
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, icon: Icon, small, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border border-border bg-surface2 font-display font-semibold text-text transition-colors hover:border-borderStrong ${
        small ? "px-3.5 py-2 text-[13.5px]" : "px-5 py-3 text-[14.5px]"
      }`}
    >
      {Icon && <Icon size={small ? 15 : 17} />}
      {children}
    </button>
  );
}

export function EmptyState({ title, body, cta }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface2 text-mutedDim">
        ✦
      </div>
      <div className="text-[15.5px] font-semibold">{title}</div>
      <div className="max-w-xs text-[13.5px] text-mutedDim">{body}</div>
      {cta}
    </div>
  );
}
