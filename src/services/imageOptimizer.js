/**
 * Image Optimizer for TierWorld
 * Automatically downscales and compresses user-uploaded images in the browser
 * using HTML5 Canvas to prevent LocalStorage and Firestore quota issues.
 * Converts 3MB-15MB camera photos into crisp, high-DPI thumbnails (15KB-35KB).
 */

export function compressImage(
  fileOrBlobOrDataUrl,
  maxWidth = 360,
  maxHeight = 360,
  quality = 0.82
) {
  return new Promise((resolve) => {
    if (!fileOrBlobOrDataUrl) {
      return resolve(fileOrBlobOrDataUrl);
    }

    // Se já for um URL externo público, mantém inalterado
    if (typeof fileOrBlobOrDataUrl === "string" && fileOrBlobOrDataUrl.startsWith("http")) {
      return resolve(fileOrBlobOrDataUrl);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Se a imagem já for pequena (dimensões e tamanho de string), não necessita de recompressão
      if (
        width <= maxWidth &&
        height <= maxHeight &&
        typeof fileOrBlobOrDataUrl === "string" &&
        fileOrBlobOrDataUrl.length < 50000
      ) {
        return resolve(fileOrBlobOrDataUrl);
      }

      // Mantém aspect ratio proporcional perfeito
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(fileOrBlobOrDataUrl);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      let compressed = null;
      try {
        // Tenta WebP para compressão superior com transparência
        compressed = canvas.toDataURL("image/webp", quality);
        if (!compressed || !compressed.startsWith("data:image/webp")) {
          compressed = canvas.toDataURL("image/jpeg", quality);
        }
      } catch {
        try {
          compressed = canvas.toDataURL("image/jpeg", quality);
        } catch {
          compressed = fileOrBlobOrDataUrl;
        }
      }

      resolve(compressed);
    };

    img.onerror = () => {
      if (typeof fileOrBlobOrDataUrl === "string") {
        resolve(fileOrBlobOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileOrBlobOrDataUrl);
      }
    };

    if (typeof fileOrBlobOrDataUrl === "string") {
      img.src = fileOrBlobOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result || "";
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(fileOrBlobOrDataUrl);
    }
  });
}

