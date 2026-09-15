import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Monitor,
  Square,
  Loader2,
  Share2,
} from "lucide-react";
import {
  renderTierListToCanvas,
  SHARE_FORMATS,
} from "../services/shareCardGenerator";

export default function ExportModal({
  isOpen,
  onClose,
  tierList,
  tiers = [],
  items = [],
  placements = {},
  creatorName = "Criador",
  creatorHandle = "",
}) {
  const [format, setFormat] = useState("feed"); // "feed" | "square" | "story"
  const [rendering, setRendering] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const canvasRef = useRef(null);

  const displayMode = tierList?.itemDisplayMode || "both";

  // Renderiza o canvas sempre que o modal abre ou o formato é alterado
  useEffect(() => {
    if (!isOpen || !tierList || !canvasRef.current) return;

    let isMounted = true;
    setRendering(true);

    renderTierListToCanvas(canvasRef.current, {
      tierList,
      tiers: tiers.length > 0 ? tiers : (tierList.tiers || []),
      items: items.length > 0 ? items : (tierList.items || []),
      placements: Object.keys(placements).length > 0 ? placements : (tierList.placements || {}),
      creatorName: creatorName || tierList.creator || "Criador TierWorld",
      creatorHandle: creatorHandle || tierList.creatorHandle || "",
      format,
      displayMode,
    }).then(() => {
      if (isMounted) setRendering(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, format, tierList, tiers, items, placements, creatorName, creatorHandle, displayMode]);

  if (!isOpen || !tierList) return null;

  function handleDownload() {
    if (!canvasRef.current) return;

    const cleanTitle = (tierList.title || "tier-list")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tierworld-${cleanTitle}-${format}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      },
      "image/png"
    );
  }

  function handleCopy() {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(
      async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new window.ClipboardItem({ "image/png": blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } else {
            handleDownload();
          }
        } catch (err) {
          console.warn("Clipboard copy fallback to download:", err);
          handleDownload();
        }
      },
      "image/png"
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border border-white/10 bg-[#0E0E15] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================
            1. CABEÇALHO DO MODAL
           ========================================================= */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#12121D]/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 border border-accent/40 text-accent">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-display text-[17px] font-bold text-white">
                Exportar Card de Partilha
              </h3>
              <p className="text-xs text-mutedDim">
                Gera uma imagem de ultra alta resolução (HD/2K) pronta para redes sociais.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-mutedDim hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================================================
            2. SELETOR DE FORMATO & BOTÕES DE AÇÃO
           ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#141422]/60 px-6 py-3.5">
          {/* Formatos: Feed, Quadrado, Story */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-mutedDim mr-1">Formato:</span>

            <button
              type="button"
              onClick={() => setFormat("feed")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                format === "feed"
                  ? "bg-accent text-black shadow-glow font-black"
                  : "bg-surface text-mutedDim hover:text-white border border-white/5"
              }`}
            >
              <Monitor size={14} />
              <span>Feed / Twitter (16:9)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("square")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                format === "square"
                  ? "bg-accent text-black shadow-glow font-black"
                  : "bg-surface text-mutedDim hover:text-white border border-white/5"
              }`}
            >
              <Square size={13} />
              <span>Post / Insta (1:1)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("story")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                format === "story"
                  ? "bg-accent text-black shadow-glow font-black"
                  : "bg-surface text-mutedDim hover:text-white border border-white/5"
              }`}
            >
              <Smartphone size={14} />
              <span>Story / TikTok (9:16)</span>
            </button>
          </div>

          {/* Ações de Descarregar e Copiar */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              disabled={rendering}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 bg-surface text-xs font-bold text-white hover:bg-surface2 hover:border-accent transition-all disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copiado para Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar Imagem</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={rendering}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent text-xs font-black text-black hover:opacity-90 transition-all shadow-glow disabled:opacity-40"
            >
              {downloadSuccess ? (
                <>
                  <Check size={14} />
                  <span>Guardado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Descarregar PNG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            3. ÁREA DE PRÉ-VISUALIZAÇÃO DO CANVAS (PIXEL-PERFECT)
           ========================================================= */}
        <div className="relative flex-1 overflow-auto p-6 flex items-center justify-center bg-[#07070B] min-h-[380px]">
          {rendering && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#07070B]/85 backdrop-blur-sm text-white">
              <Loader2 size={32} className="animate-spin text-accent" />
              <span className="text-sm font-bold">A desenhar card em alta resolução…</span>
            </div>
          )}

          {/* O próprio Canvas HTML5 renderizado com proporção correta */}
          <canvas
            ref={canvasRef}
            className={`max-w-full rounded-2xl shadow-2xl border border-white/10 transition-all duration-300 ${
              format === "story"
                ? "max-h-[62vh] aspect-[9/16]"
                : format === "square"
                ? "max-h-[60vh] aspect-square"
                : "max-h-[58vh] aspect-[16/9]"
            }`}
          />
        </div>

        {/* =========================================================
            4. RODAPÉ DE AJUDA
           ========================================================= */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-3 bg-[#0E0E15] text-[11.5px] text-mutedDim">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>Resolução nativa: {SHARE_FORMATS[format].width} × {SHARE_FORMATS[format].height} px (PNG Lossless)</span>
          </div>
          <span>Pronto para publicar no Instagram, Twitter/X, TikTok, WhatsApp e Discord</span>
        </div>
      </div>
    </div>
  );
}
