import React, { useState } from "react";
import { X, Check, Copy, Share2, Download, Sparkles, FileText, ExternalLink, Smartphone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { GhostButton } from "./UI";

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  description = "",
  onOpenExport = null,
}) {
  const { t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!isOpen) return null;

  const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const cleanTitle = title || "TierWorld";
  const cleanDesc = description ? description.trim() : "";

  // Mensagem completa formatada para partilha com título + descrição + link
  const fullShareText = [
    cleanTitle ? `*${cleanTitle}*` : "",
    cleanDesc ? `${cleanDesc}` : "",
    `🔗 ${targetUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  function handleCopyLinkOnly() {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleCopyFullMessage() {
    // Para clipboard normal sem asteriscos de markdown se preferível, ou limpo:
    const plainFull = [
      cleanTitle,
      cleanDesc,
      targetUrl,
    ]
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard.writeText(plainFull);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2500);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: cleanTitle,
          text: cleanDesc || cleanTitle,
          url: targetUrl,
        });
      } catch {
        // Ignora cancelamento do utilizador
      }
    }
  }

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: "💬",
      color: "hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/40",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`,
    },
    {
      name: "X (Twitter)",
      icon: "𝕏",
      color: "hover:bg-white/15 hover:border-white/40",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${cleanTitle}${cleanDesc ? `\n${cleanDesc}` : ""}`
      )}&url=${encodeURIComponent(targetUrl)}`,
    },
    {
      name: "Telegram",
      icon: "✈️",
      color: "hover:bg-[#0088cc]/20 hover:text-[#0088cc] hover:border-[#0088cc]/40",
      url: `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(
        `${cleanTitle}${cleanDesc ? `\n\n${cleanDesc}` : ""}`
      )}`,
    },
    {
      name: "Reddit",
      icon: "🤖",
      color: "hover:bg-[#FF4500]/20 hover:text-[#FF4500] hover:border-[#FF4500]/40",
      url: `https://reddit.com/submit?url=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(
        `${cleanTitle}${cleanDesc ? ` — ${cleanDesc}` : ""}`
      )}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-[500px] rounded-3xl border border-borderStrong bg-[#12121C] p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accentSoft border border-accent/30 text-accent shadow-sm">
              <Share2 size={19} />
            </div>
            <div>
              <h3 className="font-display text-[18px] font-bold text-white">
                Partilhar
              </h3>
              <p className="text-[12px] text-mutedDim">
                Partilha com amigos e redes sociais
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted hover:bg-surface2 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cartão de Pré-visualização com Título, Descrição e Link */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-[#161624]/90 p-4 shadow-inner">
          <div className="flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Conteúdo a Partilhar</span>
          </div>

          <h4 className="font-display text-[15px] font-bold text-white leading-snug mb-1.5">
            {cleanTitle}
          </h4>

          {cleanDesc ? (
            <div className="mb-3 rounded-xl bg-black/30 p-2.5 border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-mutedDim mb-1">
                <FileText size={11} className="text-[#00E5A3]" />
                <span>Descrição Incluída:</span>
              </div>
              <p className="text-[12.5px] text-muted leading-relaxed">
                {cleanDesc}
              </p>
            </div>
          ) : null}

          <div className="text-[11px] font-mono text-accent/80 bg-accent/10 px-2.5 py-1.5 rounded-lg border border-accent/20 truncate">
            {targetUrl}
          </div>
        </div>

        {/* Botões de Ação de Cópia */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Botão 1: Copiar com Descrição */}
          <button
            type="button"
            onClick={handleCopyFullMessage}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[13px] font-bold transition-all shadow-md ${
              copiedFull
                ? "bg-teal text-black"
                : "bg-gradient-to-r from-accent to-[#6A46F0] text-white hover:from-[#8B6EFA] hover:to-[#7954F5] shadow-glow"
            }`}
          >
            {copiedFull ? <Check size={16} /> : <FileText size={16} />}
            <span>{copiedFull ? "Copiado com Descrição! ✓" : "Copiar com Descrição"}</span>
          </button>

          {/* Botão 2: Copiar apenas Link */}
          <button
            type="button"
            onClick={handleCopyLinkOnly}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[13px] font-bold transition-all ${
              copiedLink
                ? "border-teal bg-teal/20 text-teal"
                : "border-white/10 bg-surface hover:bg-surface2 hover:text-white text-muted hover:border-white/25"
            }`}
          >
            {copiedLink ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedLink ? "Link Copiado! ✓" : "Copiar só o Link"}</span>
          </button>
        </div>

        {/* Partilha Nativa do Dispositivo (se suportado pelo navegador) */}
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface/70 hover:bg-surface2 px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:border-accent/40 shadow-sm"
            >
              <Smartphone size={15} className="text-[#00E5A3]" />
              <span>Partilhar no Dispositivo / Apps</span>
            </button>
          </div>
        )}

        {/* Botão para Gerar e Descarregar Card Visual (se aplicável) */}
        {onOpenExport && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExport();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-accent/40 bg-accent/10 hover:bg-accent hover:text-black text-white transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Download size={16} className="text-accent group-hover:text-black transition-colors" />
                <span className="text-[13px] font-bold">Descarregar Card Visual (PNG)</span>
              </div>
              <span className="text-[11px] font-bold text-accent group-hover:text-black transition-colors bg-accent/20 group-hover:bg-black/20 px-2 py-0.5 rounded-md">
                1080p / 2K
              </span>
            </button>
          </div>
        )}

        {/* Partilha Direta nas Redes Sociais com a descrição embutida */}
        <div>
          <span className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-mutedDim">
            Partilha Rápida com Mensagem Completa:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 rounded-2xl border border-white/10 bg-surface/60 px-3.5 py-2.5 text-[13px] font-semibold text-text transition-all ${s.color}`}
              >
                <span className="text-[16px]">{s.icon}</span>
                <span>{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <GhostButton small onClick={onClose}>
            {t("builder.close") || "Fechar"}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
