import React from "react";

const AVATAR_COLORS = ["#7C5CFF", "#31D8A8", "#FF9F43", "#4D96FF", "#FF5470"];
export function colorFor(seed = "x") {
  return AVATAR_COLORS[Math.abs(seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % AVATAR_COLORS.length];
}

export function Avatar({ name, image, size = 32 }) {
  const [imgError, setImgError] = React.useState(false);
  React.useEffect(() => {
    setImgError(false);
  }, [image]);

  const initial = name?.[0]?.toUpperCase() || "?";
  const color = colorFor(name || "x");

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name || "Avatar"}
        className="rounded-full object-cover flex-shrink-0 border border-white/10"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-bold flex-shrink-0 select-none shadow-sm"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}77)`,
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
  rose: "bg-[rgba(255,84,112,0.15)] text-[#FF5470] border-[rgba(255,84,112,0.35)]",
  amber: "bg-[rgba(255,210,63,0.15)] text-[#FFD23F] border-[rgba(255,210,63,0.35)]",
};

export function Badge({ children, tone = "default" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold whitespace-nowrap shadow-sm ${badgeTones[tone] || badgeTones.default}`}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  icon: Icon,
  small,
  type = "button",
  disabled,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-display font-bold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(124,92,255,0.7)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 ${
        small ? "px-3.5 py-2 text-[13px]" : "px-5 py-2.5 text-[14.5px]"
      } ${className}`}
      style={{
        background: "linear-gradient(135deg, #8A6BFF 0%, #6A46F0 100%)",
      }}
    >
      {Icon && <Icon size={small ? 15 : 17} className="flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  icon: Icon,
  small,
  type = "button",
  disabled,
  active,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-display font-semibold transition-all duration-200 disabled:opacity-50 ${
        active
          ? "border-accent bg-accentSoft text-[#B6A5FF]"
          : "border-border bg-surface2 text-text hover:border-borderStrong hover:bg-surface"
      } ${small ? "px-3 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13.5px]"} ${className}`}
    >
      {Icon && <Icon size={small ? 14 : 16} className="flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  icon: Icon,
  small,
  type = "button",
  disabled,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface2/80 font-display font-semibold text-text transition-all duration-200 hover:border-borderStrong hover:bg-surface hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 ${
        small ? "px-3.5 py-2 text-[13px]" : "px-5 py-2.5 text-[14.5px]"
      } ${className}`}
    >
      {Icon && <Icon size={small ? 15 : 17} className="flex-shrink-0 text-muted" />}
      <span>{children}</span>
    </button>
  );
}

export function EmptyState({ icon: Icon, title, body, cta, actionLabel, onAction, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/80 bg-surface/40 p-8 sm:p-12 text-center backdrop-blur-sm ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent shadow-inner">
        {Icon ? <Icon size={22} /> : <span>✦</span>}
      </div>
      <div className="font-display text-[16.5px] font-bold text-white max-w-sm">
        {title}
      </div>
      {body && (
        <div className="max-w-md text-[13.5px] leading-relaxed text-muted">
          {body}
        </div>
      )}
      {(cta || actionLabel) && (
        <div className="mt-2">
          {cta || (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-all shadow-glow"
            >
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function SkeletonLoader({ count = 3, height = "h-24" }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} rounded-2xl animate-shimmer border border-white/5`}
        />
      ))}
    </div>
  );
}
