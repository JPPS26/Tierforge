// Serviço de Geração de Cards de Partilha de Alta Resolução via HTML5 Canvas
// Garante exportação pixel-perfect em 3 formatos: Feed (16:9), Quadrado (1:1) e Stories (9:16)
// Sem dependência do html2canvas, sem erros de CORS, com suporte a Retina / 2x DPI.

import { getCategoryDisplayName } from "./db";

export const SHARE_FORMATS = {
  feed: {
    id: "feed",
    label: "Feed / Twitter / Discord (16:9)",
    width: 1920,
    height: 1080,
    aspect: "16:9",
  },
  square: {
    id: "square",
    label: "Post / Instagram / WhatsApp (1:1)",
    width: 1080,
    height: 1080,
    aspect: "1:1",
  },
  story: {
    id: "story",
    label: "Stories / TikTok / Reels (9:16)",
    width: 1080,
    height: 1920,
    aspect: "9:16",
  },
};

// Determina se a cor do texto deve ser clara ou escura para máximo contraste
export function getContrastColor(hexColor) {
  if (!hexColor || typeof hexColor !== "string") return "#0A0A0D";
  let hex = hexColor.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#0A0A0D" : "#FFFFFF";
}

// Utilitário de desenho de retângulo arredondado compatível com todos os navegadores
export function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Quebra de texto automática em múltiplas linhas para títulos no canvas
function wrapText(ctx, text, maxWidth) {
  const words = String(text || "").split(" ");
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Pré-carregamento seguro de imagens para o canvas com fallback contra CORS
export async function preloadImage(url) {
  if (!url || typeof url !== "string") return null;

  return new Promise((resolve) => {
    const img = new Image();
    // Se for data URL, não precisa de crossOrigin
    if (!url.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    const timer = setTimeout(() => {
      resolve(null); // Timeout de 3s para evitar bloqueios de rede
    }, 3000);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null); // Fallback silencioso sem interromper a geração
    };

    img.src = url;
  });
}

/**
 * Renderiza uma Tier List completa diretamente num Canvas HTML5
 * @param {HTMLCanvasElement} canvas Canvas de destino
 * @param {Object} options Opções de configuração e dados da Tier List
 */
export async function renderTierListToCanvas(canvas, {
  tierList,
  tiers = [],
  items = [],
  placements = {},
  creatorName = "Criador",
  creatorHandle = "",
  format = "feed", // "feed" | "square" | "story"
  displayMode = "both",
}) {
  if (!canvas || !tierList) return null;

  const config = SHARE_FORMATS[format] || SHARE_FORMATS.feed;
  const W = config.width;
  const H = config.height;

  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Pré-carregar todas as imagens dos itens em paralelo
  const imageMap = new Map();
  const itemsWithImages = items.filter((it) => Boolean(it.imageUrl));
  await Promise.all(
    itemsWithImages.map(async (it) => {
      const img = await preloadImage(it.imageUrl);
      if (img) imageMap.set(it.id, img);
    })
  );

  // 2. Fundo Gradiente Luxury Dark
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#08080C");
  bgGrad.addColorStop(0.5, "#0E0E15");
  bgGrad.addColorStop(1, "#12121D");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 3. Luzes Ambientais (Glow Effects)
  const glow1 = ctx.createRadialGradient(W * 0.15, H * 0.15, 50, W * 0.15, H * 0.15, W * 0.45);
  glow1.addColorStop(0, "rgba(124, 92, 255, 0.18)");
  glow1.addColorStop(1, "transparent");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.85, H * 0.8, 50, W * 0.85, H * 0.8, W * 0.4);
  glow2.addColorStop(0, "rgba(0, 229, 163, 0.10)");
  glow2.addColorStop(1, "transparent");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // 4. Margens e Moldura Externa
  const marginX = format === "story" ? 48 : 56;
  const marginY = format === "story" ? 64 : 48;
  const cardW = W - marginX * 2;
  const cardH = H - marginY * 2;

  // Moldura suave do cartão
  drawRoundedRect(ctx, marginX, marginY, cardW, cardH, 28);
  ctx.fillStyle = "rgba(16, 16, 24, 0.75)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.stroke();

  // Dados formatados
  const categoryName = getCategoryDisplayName(tierList.category);
  const subcategory = tierList.subcategory || "";
  const title = tierList.title || "Tier List Oficial";

  // =========================================================
  // RENDERIZAÇÃO: FORMATO STORY (9:16 VERTICAL)
  // =========================================================
  if (format === "story") {
    let curY = marginY + 50;

    // Topo: Marca TierWorld
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Logo Icon Box
    const logoSize = 42;
    const logoX = W / 2 - logoSize / 2;
    drawRoundedRect(ctx, logoX, curY, logoSize, logoSize, 12);
    const logoGrad = ctx.createLinearGradient(logoX, curY, logoX + logoSize, curY + logoSize);
    logoGrad.addColorStop(0, "#7C5CFF");
    logoGrad.addColorStop(1, "#00E5A3");
    ctx.fillStyle = logoGrad;
    ctx.fill();

    ctx.fillStyle = "#0A0A0D";
    ctx.font = "900 22px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("T", W / 2, curY + logoSize / 2 + 1);

    curY += logoSize + 22;

    ctx.font = "800 20px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("TIERWORLD", W / 2, curY);

    curY += 28;

    // Badge de Categoria + Subcategoria
    ctx.font = "800 15px 'Plus Jakarta Sans', system-ui, sans-serif";
    const badgeText = subcategory ? `${categoryName.toUpperCase()} • ${subcategory.toUpperCase()}` : categoryName.toUpperCase();
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = badgeMetrics.width + 32;
    const badgeH = 34;

    drawRoundedRect(ctx, (W - badgeW) / 2, curY, badgeW, badgeH, 17);
    ctx.fillStyle = "rgba(124, 92, 255, 0.22)";
    ctx.fill();
    ctx.strokeStyle = "rgba(124, 92, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#C4B5FD";
    ctx.fillText(badgeText, W / 2, curY + badgeH / 2 + 1);

    curY += badgeH + 28;

    // Título da Tier List
    ctx.font = "900 42px 'Cabinet Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    const titleLines = wrapText(ctx, title, cardW - 60).slice(0, 3);
    for (const line of titleLines) {
      ctx.fillText(line, W / 2, curY);
      curY += 52;
    }

    curY += 16;

    // Info do Criador
    ctx.font = "600 16px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#94A3B8";
    const creatorText = creatorHandle ? `Rankings por ${creatorName} #${creatorHandle}` : `Rankings por ${creatorName}`;
    ctx.fillText(creatorText, W / 2, curY);

    curY += 40;

    // Espaço restante para os Tiers
    const footerH = 140;
    const tableH = H - marginY - footerH - curY;
    const tableW = cardW - 40;
    const tableX = marginX + 20;
    const tableY = curY;

    // Desenhar Tabela de Tiers
    drawTiersTable(ctx, {
      tiers,
      items,
      placements,
      imageMap,
      displayMode,
      x: tableX,
      y: tableY,
      width: tableW,
      height: tableH,
      labelWidth: 120,
      format,
    });

    // Rodapé do Story
    const storyFooterY = H - marginY - 65;
    ctx.textAlign = "center";
    ctx.font = "700 17px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Vota e cria a tua versão em tierworld.app", W / 2, storyFooterY);

    ctx.font = "600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("Comunidade Aberta de Classificações & Rankings", W / 2, storyFooterY + 26);
  }

  // =========================================================
  // RENDERIZAÇÃO: FORMATO FEED (16:9) OU QUADRADO (1:1)
  // =========================================================
  else {
    const padX = 42;
    const padY = 36;
    const headerX = marginX + padX;
    const headerY = marginY + padY;
    const headerW = cardW - padX * 2;

    // 1. Topo: Badge de Categoria + Subcategoria
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const badgeText = subcategory ? `${categoryName.toUpperCase()} • ${subcategory.toUpperCase()}` : categoryName.toUpperCase();
    ctx.font = "800 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = badgeMetrics.width + 24;
    const badgeH = 28;

    drawRoundedRect(ctx, headerX, headerY, badgeW, badgeH, 14);
    ctx.fillStyle = "rgba(124, 92, 255, 0.22)";
    ctx.fill();
    ctx.strokeStyle = "rgba(124, 92, 255, 0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#C4B5FD";
    ctx.fillText(badgeText, headerX + 12, headerY + 8);

    // Marca D'Água no Canto Superior Direito
    const logoSize = 34;
    const logoX = headerX + headerW - logoSize;
    drawRoundedRect(ctx, logoX, headerY, logoSize, logoSize, 10);
    const logoGrad = ctx.createLinearGradient(logoX, headerY, logoX + logoSize, headerY + logoSize);
    logoGrad.addColorStop(0, "#7C5CFF");
    logoGrad.addColorStop(1, "#00E5A3");
    ctx.fillStyle = logoGrad;
    ctx.fill();

    ctx.fillStyle = "#0A0A0D";
    ctx.font = "900 18px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("T", logoX + logoSize / 2, headerY + logoSize / 2 + 1);

    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = "900 17px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("TIERWORLD", logoX - 12, headerY + 2);

    ctx.font = "600 11.5px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("tierworld.app", logoX - 12, headerY + 22);

    // 2. Título da Tier List
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const titleY = headerY + badgeH + 12;
    const titleMaxWidth = headerW - 220;

    const fontSize = format === "feed" ? 34 : 28;
    ctx.font = `900 ${fontSize}px 'Cabinet Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = "#FFFFFF";

    const titleLines = wrapText(ctx, title, titleMaxWidth).slice(0, 2);
    let currentTitleY = titleY;
    for (const line of titleLines) {
      ctx.fillText(line, headerX, currentTitleY);
      currentTitleY += fontSize + 8;
    }

    // 3. Tabela de Tiers
    const footerH = 50;
    const tableHeaderGap = 20;
    const tableY = currentTitleY + tableHeaderGap;
    const tableH = marginY + cardH - padY - footerH - tableY;
    const tableX = headerX;
    const tableW = headerW;

    const labelWidth = format === "feed" ? 150 : 120;

    drawTiersTable(ctx, {
      tiers,
      items,
      placements,
      imageMap,
      displayMode,
      x: tableX,
      y: tableY,
      width: tableW,
      height: tableH,
      labelWidth,
      format,
    });

    // 4. Rodapé do Card
    const footerY = marginY + cardH - padY - 26;
    ctx.textBaseline = "middle";

    // Criador à esquerda
    ctx.textAlign = "left";
    ctx.font = "600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("Criado por", headerX, footerY);

    ctx.font = "800 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    const nameX = headerX + ctx.measureText("Criado por ").width + 4;
    ctx.fillText(creatorName, nameX, footerY);

    if (creatorHandle) {
      ctx.fillStyle = "#A78BFA";
      const handleX = nameX + ctx.measureText(creatorName).width + 6;
      ctx.fillText(`#${creatorHandle}`, handleX, footerY);
    }

    // Call to Action à direita
    ctx.textAlign = "right";
    ctx.font = "700 12.5px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("Cria e vota em rankings livres • tierworld.app", headerX + headerW, footerY);
  }

  return canvas;
}

// Desenha a estrutura da tabela de tiers com todos os itens colocados
function drawTiersTable(ctx, {
  tiers = [],
  items = [],
  placements = {},
  imageMap,
  displayMode,
  x,
  y,
  width,
  height,
  labelWidth = 140,
  format = "feed",
}) {
  if (tiers.length === 0) return;

  // Moldura geral da tabela
  drawRoundedRect(ctx, x, y, width, height, 18);
  ctx.fillStyle = "#101018";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Guarda estado para recorte dos cantos da tabela
  ctx.save();
  drawRoundedRect(ctx, x, y, width, height, 18);
  ctx.clip();

  const numTiers = tiers.length;
  const rowHeight = height / numTiers;

  tiers.forEach((tier, idx) => {
    const rowY = y + idx * rowHeight;

    // Fundo da linha
    ctx.fillStyle = idx % 2 === 0 ? "#12121B" : "#0F0F17";
    ctx.fillRect(x, rowY, width, rowHeight);

    // Bloco do Rótulo do Tier (à esquerda)
    const tierColor = tier.color || "#8A6BFF";
    ctx.fillStyle = tierColor;
    ctx.fillRect(x, rowY, labelWidth, rowHeight);

    // Texto do Rótulo do Tier
    ctx.fillStyle = getContrastColor(tierColor);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelFontSize = Math.min(32, Math.max(18, rowHeight * 0.42));
    ctx.font = `900 ${labelFontSize}px 'Cabinet Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(tier.label || "", x + labelWidth / 2, rowY + rowHeight / 2);

    // Divisória vertical direita do rótulo
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + labelWidth, rowY);
    ctx.lineTo(x + labelWidth, rowY + rowHeight);
    ctx.stroke();

    // Itens colocados neste tier
    const tierItems = Object.entries(placements)
      .filter(([, tId]) => tId === tier.id)
      .map(([itemId]) => items.find((i) => i.id === itemId))
      .filter(Boolean);

    const itemsAreaX = x + labelWidth + 12;
    const itemsAreaW = width - labelWidth - 24;
    const itemsAreaY = rowY + 6;
    const itemsAreaH = rowHeight - 12;

    if (tierItems.length === 0) {
      // Indicador sutil de linha vazia
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "italic 600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillText("— Sem elementos —", itemsAreaX + 8, rowY + rowHeight / 2);
    } else {
      // Tamanho dinâmico dos cartões de elemento
      const itemSize = Math.min(itemsAreaH, Math.max(48, rowHeight - 12));
      const gap = 8;
      const maxCols = Math.max(1, Math.floor(itemsAreaW / (itemSize + gap)));

      tierItems.forEach((it, itIdx) => {
        if (itIdx >= maxCols * 2) return; // Limita para não quebrar o layout

        const col = itIdx % maxCols;
        const row = Math.floor(itIdx / maxCols);
        const itX = itemsAreaX + col * (itemSize + gap);
        const itY = itemsAreaY + row * (itemSize + gap);

        if (itY + itemSize > rowY + rowHeight) return;

        const itImg = imageMap.get(it.id);
        const mode = it.displayMode && it.displayMode !== "auto" ? it.displayMode : displayMode;
        const showImage = Boolean(itImg) && (mode === "image" || mode === "both");
        const showText = mode === "text" || mode === "both" || !itImg;

        // Moldura do item
        drawRoundedRect(ctx, itX, itY, itemSize, itemSize, 10);
        ctx.fillStyle = "#181824";
        ctx.fill();

        ctx.save();
        drawRoundedRect(ctx, itX, itY, itemSize, itemSize, 10);
        ctx.clip();

        if (showImage && itImg) {
          // Desenhar imagem recortada
          ctx.drawImage(itImg, itX, itY, itemSize, itemSize);

          if (showText) {
            // Gradiente escuro no fundo para legibilidade do texto
            const textGrad = ctx.createLinearGradient(itX, itY + itemSize * 0.5, itX, itY + itemSize);
            textGrad.addColorStop(0, "transparent");
            textGrad.addColorStop(1, "rgba(0, 0, 0, 0.95)");
            ctx.fillStyle = textGrad;
            ctx.fillRect(itX, itY + itemSize * 0.45, itemSize, itemSize * 0.55);

            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.font = "800 9.5px 'Plus Jakarta Sans', system-ui, sans-serif";
            ctx.fillStyle = "#FFFFFF";

            const shortName = it.name.length > 13 ? `${it.name.slice(0, 12)}…` : it.name;
            ctx.fillText(shortName, itX + itemSize / 2, itY + itemSize - 3);
          }
        } else {
          // Card de Texto Puro estilizado
          const cardGrad = ctx.createLinearGradient(itX, itY, itX + itemSize, itY + itemSize);
          cardGrad.addColorStop(0, "#222234");
          cardGrad.addColorStop(1, "#181826");
          ctx.fillStyle = cardGrad;
          ctx.fillRect(itX, itY, itemSize, itemSize);

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "800 11px 'Plus Jakarta Sans', system-ui, sans-serif";
          ctx.fillStyle = "#FFFFFF";

          const lines = wrapText(ctx, it.name, itemSize - 8).slice(0, 2);
          const startY = itY + itemSize / 2 - ((lines.length - 1) * 12) / 2;
          lines.forEach((l, lIdx) => {
            ctx.fillText(l, itX + itemSize / 2, startY + lIdx * 12);
          });
        }

        ctx.restore();

        // Borda do item
        drawRoundedRect(ctx, itX, itY, itemSize, itemSize, 10);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Linha divisória horizontal entre os tiers
    if (idx < numTiers - 1) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, rowY + rowHeight);
      ctx.lineTo(x + width, rowY + rowHeight);
      ctx.stroke();
    }
  });

  ctx.restore();
}
