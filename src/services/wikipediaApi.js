// Serviço de integração com a API pública da Wikipedia/Wikimedia Commons
// Permite pesquisar em tempo real qualquer entidade real (jogadores, clubes, filmes, jogos, séries, etc.)
// e importar fotografias oficiais e dados verificados diretamente para a tier list.

export async function searchWikimediaEntities(query, lang = "pt") {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const endpoint = `https://${lang === "pt-BR" ? "pt" : lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=prefixsearch&gpssearch=${encodeURIComponent(
    cleanQuery
  )}&gpslimit=8&prop=pageimages|description|pageterms&piprop=thumbnail&pithumbsize=400&pilimit=8`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.query || !data.query.pages) {
      // Tentar em inglês se não houver resultados na língua local
      if (lang !== "en") {
        return searchWikimediaEntities(query, "en");
      }
      return [];
    }

    const pages = Object.values(data.query.pages);
    return pages
      .map((page) => {
        const title = page.title;
        const imageUrl = page.thumbnail?.source;
        const description = page.description || page.terms?.description?.[0] || "";

        if (!imageUrl) return null; // Dar prioridade a entidades com imagem real

        return {
          id: `wiki-${page.pageid}`,
          name: title,
          imageUrl,
          description,
          source: "Wikipedia / Wikimedia Commons",
          category: "general",
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("Erro na pesquisa da Wikimedia:", error);
    return [];
  }
}

