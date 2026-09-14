import React, { useState } from "react";
import { X, Check, Copy, Share2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { GhostButton, PrimaryButton } from "./UI";

export default function ShareModal({ isOpen, onClose, title, url, description = "" }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = url || window.location.href;
  const shareText = encodeURIComponent(`${title ? title + " — " : ""}TierWorld: ${description || ""}`);
  const shareUrl = encodeURIComponent(targetUrl);

  function handleCopy() {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: "𝕏",
      color: "hover:bg-white/15",
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
    },
    {
      name: "WhatsApp",
      icon: "💬",
      color: "hover:bg-[#25D366]/20 hover:text-[#25D366]",
      url: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
    },
    {
      name: "Reddit",
      icon: "🤖",
      color: "hover:bg-[#FF4500]/20 hover:text-[#FF4500]",
      url: `https://reddit.com/submit?url=${shareUrl}&title=${shareText}`,
    },
    {
      name: "Telegram",
      icon: "✈️",
      color: "hover:bg-[#0088cc]/20 hover:text-[#0088cc]",
      url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-[460px] rounded-3xl border border-borderStrong bg-surface p-6 shadow-2xl">
        {/* Cabeçalho */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentSoft text-accent">
              <Share2 size={18} />
            </div>
            <h3 className="font-display text-[18px] font-bold text-white">
              {t("share.title")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-surface2 hover:text-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Informação do link */}
        <p className="mb-3 text-[13px] font-medium text-muted line-clamp-1">
          {title || targetUrl}
        </p>

        {/* Input de Copiar Link */}
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-border bg-surface2 p-2 focus-within:border-accent">
          <input
            readOnly
            value={targetUrl}
            className="flex-1 bg-transparent px-2.5 text-[13px] text-text outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-bold transition-all ${
              copied
                ? "bg-teal text-[#0A0A0D]"
                : "bg-accent text-white hover:bg-accent/90"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? t("share.copied") : t("share.copyLink")}</span>
          </button>
        </div>

        {/* Partilha Direta nas Redes Sociais */}
        <div>
          <span className="mb-3 block text-[12px] font-bold uppercase tracking-wider text-mutedDim">
            {t("share.shareOn")}
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-[13px] font-semibold text-text transition-all ${s.color}`}
              >
                <span className="text-[16px]">{s.icon}</span>
                <span>{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <GhostButton small onClick={onClose}>
            {t("builder.close")}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}

