// Serviço de Integração com a API Pública de Categorias & Taxonomia
// Fornece um catálogo rico por domínios e pesquisa em tempo real na API da Wikimedia/Wikipedia,
// permitindo obter capas oficiais, descrições verificadas e subcategorias automáticas para qualquer tema.
// Sem retenção de caches locais: todas as consultas refletem o estado mais recente.

// Mapeamento de domínios para ícones e cores temáticas
export const DOMAIN_THEMES = {
  gaming: { label: "Gaming & Videojogos", color: "#7C5CFF", icon: "Gamepad2" },
  sports: { label: "Desporto & Futebol", color: "#FF3B5C", icon: "Trophy" },
  entertainment: { label: "Cinema & TV", color: "#FF5252", icon: "Film" },
  anime: { label: "Anime & Manga", color: "#FF6B7A", icon: "Sparkles" },
  music: { label: "Música & Artistas", color: "#FFD23F", icon: "Music" },
  tech: { label: "Tecnologia & Ciência", color: "#4D96FF", icon: "Cpu" },
  culture: { label: "Cultura Pop & Geek", color: "#A259FF", icon: "Shield" },
  lifestyle: { label: "Gastronomia & Lifestyle", color: "#FFA800", icon: "Utensils" },
  general: { label: "Geral & Conhecimento", color: "#00E5A3", icon: "Globe" },
};

// Catálogo Curado da API com capas reais da Wikimedia Commons
export const API_CATALOG = [
  {
    id: "gaming",
    slug: "gaming",
    name: "Gaming & Videojogos",
    domain: "gaming",
    color: "#7C5CFF",
    icon: "Gamepad2",
    description: "Consolas, franchises lendárias, jogos de PC, eSports, RPGs e clássicos dos videojogos.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "PlayStation",
      "Xbox",
      "Nintendo",
      "PC Gaming",
      "RPGs & Ação",
      "FPS & Tiro",
      "Indie Games",
      "Battle Royale",
      "Soulslike",
      "Retro Gaming",
    ],
  },
  {
    id: "football",
    slug: "futebol",
    name: "Futebol",
    domain: "sports",
    color: "#FF3B5C",
    icon: "Trophy",
    description: "Ligas europeias e mundiais, clubes lendários, avançados, médios, treinadores e Bolas de Ouro.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Champions League",
      "Premier League",
      "La Liga",
      "Liga Portugal",
      "Mundial de Seleções",
      "Bolas de Ouro",
      "Treinadores",
      "Guarda-redes",
      "Lendas do Futebol",
    ],
  },
  {
    id: "sports",
    slug: "desportos",
    name: "Outros Desportos",
    domain: "sports",
    color: "#FF9F43",
    icon: "Flame",
    description: "Basquetebol NBA, Fórmula 1, MotoGP, ténis de Grand Slam, MMA / UFC e Jogos Olímpicos.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "NBA & Basquetebol",
      "Fórmula 1",
      "MotoGP",
      "Ténis & Grand Slams",
      "UFC & MMA",
      "Wrestling & WWE",
      "Futebol Americano / NFL",
      "Jogos Olímpicos",
    ],
  },
  {
    id: "movies",
    slug: "cinema",
    name: "Cinema & Filmes",
    domain: "entertainment",
    color: "#FF5252",
    icon: "Film",
    description: "Sagas cinematográficas, realizadores de culto, clássicos de Hollywood e vencedores de Óscares.",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Ficção Científica",
      "Terror & Suspense",
      "Ação & Aventura",
      "Drama & Óscares",
      "Realizadores",
      "Animação & Pixar",
      "Trilogias Lendárias",
    ],
  },
  {
    id: "tvshows",
    slug: "series-tv",
    name: "Séries & Televisão",
    domain: "entertainment",
    color: "#31D8A8",
    icon: "Tv",
    description: "Séries de culto da HBO, Netflix, Apple TV, sitcoms inesquecíveis e episódios históricos.",
    imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Séries Dramáticas",
      "Sitcoms & Comédia",
      "HBO & Max",
      "Netflix Originals",
      "Mistério & Crime",
      "Mini-séries",
      "Fantasia & Ficção",
    ],
  },
  {
    id: "anime",
    slug: "anime-manga",
    name: "Anime & Manga",
    domain: "anime",
    color: "#FF6B7A",
    icon: "Sparkles",
    description: "Shonen, Seinen, estúdios lendários como Ghibli, aberturas marcantes e personagens épicas.",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Shonen",
      "Seinen",
      "Isekai",
      "Filmes & Studio Ghibli",
      "Vilões Icónicos",
      "Aberturas & OSTs",
      "Manga & Manhwa",
    ],
  },
  {
    id: "music",
    slug: "musica",
    name: "Música & Artistas",
    domain: "music",
    color: "#FFD23F",
    icon: "Music",
    description: "Álbuns históricos, cantores, bandas, hip-hop, rock, pop, música eletrónica e festivais.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Hip Hop & Rap",
      "Rock & Metal",
      "Pop Internacional",
      "Eletrónica & EDM",
      "R&B & Soul",
      "Álbuns do Século",
      "Bandas Lendárias",
    ],
  },
  {
    id: "tech",
    slug: "tecnologia",
    name: "Tecnologia & IA",
    domain: "tech",
    color: "#4D96FF",
    icon: "Cpu",
    description: "Smartphones, placas gráficas, computadores, modelos de IA, sistemas operativos e gadgets.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Smartphones",
      "Placas Gráficas & GPUs",
      "Inteligência Artificial",
      "Laptops & PCs",
      "Sistemas Operativos",
      "Linguagens de Programação",
    ],
  },
  {
    id: "geek",
    slug: "universo-geek",
    name: "Universo Geek & Pop",
    domain: "culture",
    color: "#A259FF",
    icon: "Shield",
    description: "Marvel Cinematic Universe, DC, Star Wars, Harry Potter, banda desenhada e jogos de tabuleiro.",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Marvel (MCU)",
      "DC Comics & Batman",
      "Star Wars",
      "Harry Potter & Feiticeiros",
      "Senhor dos Anéis",
      "Super-heróis",
    ],
  },
  {
    id: "food",
    slug: "gastronomia",
    name: "Gastronomia & Comida",
    domain: "lifestyle",
    color: "#FFA800",
    icon: "Utensils",
    description: "Cozinhas do mundo, fast food, sobremesas, cafés, vinhos e gastronomia tradicional.",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Comida Tradicional",
      "Pizzas & Hambúrgueres",
      "Sushi & Cozinha Asiática",
      "Sobremesas & Doces",
      "Bebidas & Cocktails",
    ],
  },
  {
    id: "vehicles",
    slug: "automoveis-motores",
    name: "Automóveis & Motores",
    domain: "lifestyle",
    color: "#E02424",
    icon: "Car",
    description: "Supercarros, lendas JDM, hipercarros elétricos, motas e marcas icónicas do asfalto.",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Carros JDM Japoneses",
      "Supercarros & Hipercarros",
      "Carros Elétricos",
      "Motas & Superbikes",
      "Marcas Lendárias",
    ],
  },
  {
    id: "science",
    slug: "ciencia-natureza",
    name: "Ciência & Natureza",
    domain: "tech",
    color: "#059669",
    icon: "GraduationCap",
    description: "Astronomia, física, fauna do planeta, descobertas históricas e maravilhas da natureza.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Planetas & Universo",
      "Espécies Animais",
      "Maiores Invenções",
      "Cientistas Históricos",
      "Física & Química",
    ],
  },
  {
    id: "culture",
    slug: "cultura-viagens",
    name: "Cultura, Países & Viagens",
    domain: "culture",
    color: "#059669",
    icon: "Globe",
    description: "Cidades imperdíveis, países do mundo, história universal, monumentos, maravilhas e literatura.",
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Cidades Europeias",
      "Destinos de Praia & Ilhas",
      "Países do Mundo",
      "Períodos Históricos",
      "Livros & Obras Literárias",
      "Monumentos do Mundo",
    ],
  },
  {
    id: "lifestyle",
    slug: "lifestyle-fitness",
    name: "Lifestyle & Fitness",
    domain: "lifestyle",
    color: "#10B981",
    icon: "Dumbbell",
    description: "Treinos de ginásio, sapatilhas, marcas de moda, nutrição e desenvolvimento pessoal.",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Treinos & Ginásio",
      "Sapatilhas & Sneakers",
      "Marcas de Roupa & Moda",
      "Suplementos & Nutrição",
      "Hábitos de Sucesso",
    ],
  },
  {
    id: "business",
    slug: "negocios-financas",
    name: "Negócios & Finanças",
    domain: "general",
    color: "#0284C7",
    icon: "Briefcase",
    description: "Grandes empresas de tecnologia, empreendedores, criptomoedas e investimentos.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "Empresas Tecnológicas",
      "Empreendedores & CEOs",
      "Criptomoedas & Bitcoin",
      "Marcas Mais Valiosas",
      "Ideias de Negócio",
    ],
  },
  {
    id: "creators",
    slug: "criadores-internet",
    name: "Criadores & Internet",
    domain: "culture",
    color: "#A259FF",
    icon: "Zap",
    description: "YouTubers, streamers Twitch, podcasts, personalidades digitais e cultura da internet.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    subcategories: [
      "YouTubers Globais",
      "Criadores Portugueses",
      "Streamers Twitch",
      "Podcasts",
      "Memes Lendários",
      "Canais de Gaming",
    ],
  },
];

export function getApiCatalog() {
  return API_CATALOG;
}

// Converte string para slug seguro
export function slugifyCategory(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Pesquisa tópicos e categorias em tempo real na API da Wikimedia / Wikipedia
 * @param {string} query Termo pesquisado
 * @param {string} lang Idioma primário (pt com fallback en)
 * @returns {Promise<Array>} Lista de categorias normalizadas prontas para uso
 */
export async function searchApiCategories(query, lang = "pt") {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();

  const endpoint = `https://${lang === "pt-BR" ? "pt" : lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=prefixsearch&gpssearch=${encodeURIComponent(
    cleanQuery
  )}&gpslimit=8&prop=pageimages|extracts|description&exintro=1&explaintext=1&exsentences=2&piprop=thumbnail&pithumbsize=600&pilimit=8`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.query || !data.query.pages) {
      if (lang !== "en") {
        return searchApiCategories(cleanQuery, "en");
      }
      return [];
    }

    const pages = Object.values(data.query.pages).sort(
      (a, b) => (a.index || 0) - (b.index || 0)
    );

    const results = pages
      .map((page) => {
        const title = page.title;
        const slug = slugifyCategory(title);
        const imageUrl = page.thumbnail?.source || null;
        const description =
          page.description ||
          (page.extract ? page.extract.slice(0, 160) + "…" : `Rankings e Tier Lists sobre ${title}`);

        return {
          id: slug,
          slug,
          name: title,
          description,
          imageUrl,
          source: "api",
          icon: "Sparkles",
          color: "#7C5CFF",
          subcategories: [], // Podem ser preenchidas sob demanda
        };
      })
      .filter((c) => c.slug.length > 1);

    return results;
  } catch (error) {
    console.warn("Erro ao pesquisar categorias na API:", error);
    return [];
  }
}

/**
 * Obtém detalhes enriquecidos (resumo, imagem e subcategorias) para um tema da API
 * @param {string} topicName Nome do tema/categoria
 * @param {string} lang Idioma
 */
export async function fetchCategoryDetailsFromApi(topicName, lang = "pt") {
  if (!topicName || !topicName.trim()) return null;
  const cleanName = topicName.trim();

  try {
    // 1. Procurar a página principal para resumo e imagem
    const infoEndpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(
      cleanName
    )}&prop=pageimages|extracts|description&exintro=1&explaintext=1&exsentences=3&piprop=thumbnail&pithumbsize=800`;

    const infoRes = await fetch(infoEndpoint);
    const infoData = await infoRes.json();
    const pages = infoData.query?.pages ? Object.values(infoData.query.pages) : [];
    const page = pages[0];

    if (!page || page.missing) {
      return null;
    }

    const title = page.title;
    const slug = slugifyCategory(title);
    const imageUrl = page.thumbnail?.source || null;
    const description =
      page.description ||
      page.extract ||
      `Tier Lists e rankings da comunidade sobre ${title}.`;

    // 2. Tentar obter secções como subcategorias
    let subcategories = [];
    try {
      const secEndpoint = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
        cleanName
      )}&prop=sections&format=json&origin=*`;
      const secRes = await fetch(secEndpoint);
      const secData = await secRes.json();
      if (secData.parse?.sections) {
        subcategories = secData.parse.sections
          .filter((s) => s.toclevel === 1 || s.toclevel === 2)
          .map((s) => s.line.replace(/<[^>]*>?/gm, "").trim())
          .filter(
            (s) =>
              s.length > 2 &&
              s.length < 35 &&
              !/ver também|referências|notas|ligações externas|bibliografia/i.test(s)
          )
          .slice(0, 8);
      }
    } catch {
      // subcategorias secundárias opcionais
    }

    const result = {
      id: slug,
      slug,
      name: title,
      description,
      imageUrl,
      subcategories,
      color: "#7C5CFF",
      icon: "Sparkles",
      isCustom: true,
      source: "api",
    };

    return result;
  } catch (err) {
    console.warn("Erro ao obter detalhes da categoria na API:", err);
    return null;
  }
}

