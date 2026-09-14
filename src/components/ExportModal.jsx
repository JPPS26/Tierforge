import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { X, Download, Copy, Check, Sparkles, Smartphone, Monitor } from "lucide-react";
import { colorFor } from "./UI";

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
  const [format, setFormat] = useState("feed"); // "feed" | "story"
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const exportRef = useRef(null);

  if (!isOpen || !tierList) return null;

  const displayMode = tierList.itemDisplayMode || "both";

  async function handleDownload() {
    if (!exportRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0A0A0D",
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      const cleanTitle = (tierList.title || "tier-list")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
      a.download = `tierforge-${cleanTitle}-${format}.png`;
      a.click();
    } catch (err) {
      console.error("Erro ao exportar imagem:", err);
      alert("Não foi possível gerar a imagem. Tenta novamente.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!exportRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0A0A0D",
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          console.warn("Clipboard write failed, fallback download:", err);
          handleDownload();
        }
      });
    } catch (err) {
      console.error("Erro ao copiar imagem:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-border bg-[#0e0f14] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentSoft text-accent">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Exportar Tier List para Redes Sociais
              </h3>
              <p className="text-xs text-mutedDim">
                Gera uma imagem de alta resolução otimizada para partilhar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-mutedDim hover:bg-surface2 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Seleção de Formato */}
        <div className="flex items-center justify-between border-b border-border/60 bg-surface/50 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-mutedDim mr-2">Formato:</span>
            <button
              type="button"
              onClick={() => setFormat("feed")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                format === "feed"
                  ? "bg-accent text-black shadow-glow"
                  : "bg-surface2 text-mutedDim hover:text-white"
              }`}
            >
              <Monitor size={14} />
              <span>Feed / Clássico (16:9)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("story")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                format === "story"
                  ? "bg-accent text-black shadow-glow"
                  : "bg-surface2 text-mutedDim hover:text-white"
              }`}
            >
              <Smartphone size={14} />
              <span>Stories / TikTok (9:16)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-white hover:bg-surface2 hover:border-accent transition-all disabled:opacity-50"
            >
              {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
              <span>{copied ? "Copiado!" : "Copiar Imagem"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-xs font-bold text-black hover:opacity-90 transition-all shadow-glow disabled:opacity-50"
            >
              <Download size={14} />
              <span>{generating ? "A gerar…" : "Descarregar PNG"}</span>
            </button>
          </div>
        </div>

        {/* Área de Pré-visualização com Scroll */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#070709]">
          <div
            ref={exportRef}
            className={`transition-all bg-[#0A0A0D] text-white p-6 sm:p-8 flex flex-col justify-between border border-border/80 rounded-3xl shadow-2xl ${
              format === "story"
                ? "w-[380px] min-h-[640px]"
                : "w-full max-w-[760px] min-h-[420px]"
            }`}
          >
            {/* Topo do Cartão de Exportação */}
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent bg-accentSoft px-2 py-0.5 rounded-full">
                    {tierList.category || "TIER LIST"}
                  </span>
                  {tierList.parentTemplateTitle && (
                    <span className="text-[10px] text-mutedDim">
                      via {tierList.parentTemplateTitle}
                    </span>
                  )}
                </div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight leading-tight">
                  {tierList.title}
                </h2>
              </div>

              {/* Marca D'Água Tierforge */}
              <div className="flex flex-col items-end flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-lg bg-gradient-to-tr from-[#7C5CFF] to-[#31D8A8] flex items-center justify-center text-[10px] font-black text-black">
                    T
                  </div>
                  <span className="font-display text-xs font-black tracking-wider text-white">
                    TIERFORGE
                  </span>
                </div>
                <span className="text-[9px] font-bold text-mutedDim mt-0.5">
                  tierforge.app
                </span>
              </div>
            </div>

            {/* Tabela de Tiers */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-borderStrong bg-[#121218] mb-6">
              {tiers.map((tier) => {
                const tierItems = Object.entries(placements)
                  .filter(([, tId]) => tId === tier.id)
                  .map(([itemId]) => items.find((i) => i.id === itemId))
                  .filter(Boolean);

                return (
                  <div
                    key={tier.id}
                    className="flex border-b border-border/60 last:border-b-0 min-h-[68px]"
                  >
                    {/* Rótulo do Tier */}
                    <div
                      className="flex w-[68px] sm:w-[78px] flex-shrink-0 items-center justify-center p-2 text-center"
                      style={{ background: tier.color }}
                    >
                      <span className="font-display text-xl sm:text-2xl font-black text-[#0A0A0D]">
                        {tier.label}
                      </span>
                    </div>

                    {/* Itens do Tier */}
                    <div className="flex flex-1 flex-wrap items-center gap-2 p-2 bg-[#121218]">
                      {tierItems.length === 0 ? (
                        <span className="text-[11px] text-mutedDim italic px-2">—</span>
                      ) : (
                        tierItems.map((it) => {
                          const hasImage = Boolean(it.imageUrl);
                          const mode =
                            it.displayMode && it.displayMode !== "auto"
                              ? it.displayMode
                              : displayMode;
                          const showImage = hasImage && (mode === "image" || mode === "both");
                          const showText = mode === "text" || mode === "both" || !hasImage;

                          return (
                            <div
                              key={it.id}
                              className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-border/80 ${
                                mode === "image" && hasImage
                                  ? "h-14 w-14 flex-shrink-0 bg-[#161622]"
                                  : mode === "both" && hasImage
                                  ? "h-14 w-14 flex-shrink-0 bg-[#161622] flex-col justify-end"
                                  : "h-12 min-w-[60px] max-w-[90px] flex-shrink-0 px-2 py-1 text-center"
                              }`}
                              style={{
                                background:
                                  showImage && !showText
                                    ? "#101016"
                                    : showImage && showText
                                    ? "#12121c"
                                    : `linear-gradient(145deg, ${colorFor(it.name)}40, #14141e)`,
                              }}
                            >
                              {showImage && (
                                <img
                                  src={it.imageUrl}
                                  alt={it.name}
                                  className={`h-full w-full object-cover ${
                                    showText ? "absolute inset-0 z-0 opacity-75" : ""
                                  }`}
                                  crossOrigin="anonymous"
                                />
                              )}
                              {showText && (
                                <div
                                  className={`z-10 font-display text-center font-bold leading-tight ${
                                    showImage
                                      ? "w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-1 pt-2 px-1 text-[8.5px] text-white"
                                      : "text-[10px] text-white"
                                  }`}
                                >
                                  <span className="line-clamp-1">{it.name}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé do Cartão */}
            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-mutedDim font-semibold">
              <div className="flex items-center gap-1.5">
                <span>Criado por</span>
                <span className="font-bold text-white">{creatorName}</span>
                {creatorHandle && (
                  <span className="text-accent">#{creatorHandle}</span>
                )}
              </div>
              <span className="text-[10px] text-mutedDim">
                Cria e vota em tierforge.app
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

