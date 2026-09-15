/**
 * Serviço de Metadados Dinâmicos (SEO & OpenGraph para Partilha Social)
 * Atualiza o título, descrição e tags OpenGraph (WhatsApp, Discord, Twitter, etc.)
 */
export function updatePageMeta({ title, description, image = null, url = null }) {
  if (typeof document === "undefined") return;

  const siteName = "TierWorld";
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} — Rank Everything`;

  document.title = fullTitle;

  function setMetaTag(selector, attrName, attrVal, content) {
    if (!content) return;
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attrName, attrVal);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }

  if (description) {
    setMetaTag('meta[name="description"]', "name", "description", description);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
  }

  setMetaTag('meta[property="og:title"]', "property", "og:title", fullTitle);
  setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);

  const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  if (targetUrl) {
    setMetaTag('meta[property="og:url"]', "property", "og:url", targetUrl);
  }

  if (image) {
    setMetaTag('meta[property="og:image"]', "property", "og:image", image);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", image);
  }
}

