// Serviço de Auto-Categorização Semântica para TierForge
// Analisa automaticamente o título, descrição e elementos adicionados
// e define a categoria mais apropriada em tempo real sem esforço para o utilizador.

import { BASE_CATEGORIES } from "../data/categoriesData.js";

// Normaliza texto removendo acentos, pontuação e minúsculas
function normalizeText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Dicionário semântico com palavras-chave e pesos
const CATEGORY_KEYWORDS = {
  football: [
    "futebol", "football", "soccer", "jogador", "jogadores", "player", "players",
    "avancado", "medio", "defesa", "guarda redes", "guarda-redes", "goleiro", "treinador", "coach",
    "bola de ouro", "ballon d or", "golo", "golos", "gol", "gols", "estadio",
    "porto", "fc porto", "benfica", "slb", "sporting", "scp", "braga",
    "real madrid", "barcelona", "barca", "manchester", "united", "city", "liverpool", "arsenal", "chelsea",
    "bayern", "psg", "juventus", "milan", "inter", "atletico",
    "premier league", "la liga", "serie a", "bundesliga", "ligue 1", "liga portugal",
    "champions league", "ucl", "liga dos campeoes", "mundial", "copa do mundo", "world cup", "eurocopa", "euro 2024", "euro 2026", "copa america",
    "ronaldo", "cristiano", "messi", "mbappe", "haaland", "bellingham", "vinicius", "neymar", "modric",
    "de bruyne", "pele", "maradona", "zidane", "figo", "cruyff", "guardiola", "mourinho", "klopp", "ancelotti"
  ],
  gaming: [
    "jogo", "jogos", "game", "games", "gaming", "gamer", "videogame", "videojogos", "videojogos",
    "playstation", "ps5", "ps4", "ps3", "ps2", "ps1", "sony", "xbox", "xbox series", "game pass",
    "nintendo", "switch", "wii", "ds", "game boy", "zelda", "mario", "pokemon", "metroid",
    "pc gaming", "steam", "epic games", "gog", "consola", "consolas",
    "rpg", "jrpg", "fps", "battle royale", "mmo", "indie", "soulslike",
    "gta", "grand theft auto", "elden ring", "dark souls", "bloodborne", "sekiro", "witcher",
    "god of war", "kratos", "red dead", "rdr2", "cyberpunk", "fallout", "skyrim",
    "resident evil", "silent hill", "minecraft", "roblox", "fortnite", "valorant", "counter strike", "cs2", "csgo",
    "league of legends", "lol", "dota", "overwatch", "apex", "fifa", "ea fc", "efootball", "pes",
    "hollow knight", "hades", "celeste", "baldurs gate", "final fantasy", "assassins creed"
  ],
  sports: [
    "desporto", "desportos", "sport", "sports", "atleta", "atletas",
    "basquetebol", "basquete", "basketball", "nba", "lebron", "jordan", "curry", "kobe", "lakers", "warriors", "celtics",
    "formula 1", "f1", "fórmula 1", "piloto", "pilotos", "verstappen", "hamilton", "senna", "leclerc", "norris", "alonso", "ferrari", "mercedes f1", "red bull",
    "motogp", "moto gp", "marquez", "rossi", "bagnaia",
    "tenis", "ténis", "tennis", "nadal", "federer", "djokovic", "alcaraz", "wimbledon", "roland garros", "grand slam",
    "mma", "ufc", "conor", "mcgregor", "khabib", "jon jones", "pereira", "adesanya",
    "wrestling", "wwe", "smackdown", "raw", "undertaker", "john cena", "roman reigns",
    "futebol americano", "nfl", "super bowl", "tom brady", "mahomes",
    "ciclismo", "tour de france", "volta a franca", "surf", "skate", "atletismo", "olimpiadas", "jogos olimpicos", "olimpico"
  ],
  movies: [
    "filme", "filmes", "movie", "movies", "cinema", "cinematografico", "pelicula", "filme de",
    "ator", "atores", "atriz", "atrizes", "actor", "actors", "actress",
    "realizador", "realizadores", "diretor", "diretores", "director", "filmmaker",
    "oscar", "oscars", "oscares", "oscarizado", "hollywood", "cannes",
    "nolan", "christopher nolan", "tarantino", "scorsese", "spielberg", "kubrick", "hitchcock", "fincher", "denis villeneuve",
    "interstellar", "inception", "oppenheimer", "o cavaleiro das trevas", "dark knight", "pulp fiction",
    "marvel", "mcu", "vingadores", "avengers", "batman", "joker", "coringa", "superman", "homem aranha", "spiderman",
    "terror", "horror", "suspense", "ficcao cientifica", "scifi", "acao", "comedia", "drama", "romance",
    "animacao", "animation", "pixar", "disney", "dreamworks", "shrek", "toy story", "rei leao"
  ],
  tvshows: [
    "serie", "series", "série", "séries", "seriado", "seriados", "show", "shows", "tv show", "tv series",
    "televisao", "tv", "temporada", "temporadas", "season", "seasons", "episodio", "episodios", "episode",
    "netflix", "hbo", "max", "amazon prime", "disney plus", "apple tv", "streaming",
    "breaking bad", "better call saul", "game of thrones", "got", "house of the dragon", "stranger things",
    "succession", "the sopranos", "sopranos", "the wire", "peaky blinders", "chernobyl",
    "sitcom", "sitcoms", "the office", "friends", "how i met your mother", "brooklyn 99", "modern family",
    "black mirror", "dark", "squid game", "round 6", "the last of us", "the boys", "severance"
  ],
  anime: [
    "anime", "animes", "manga", "mangas", "mangá", "mangás", "otaku", "waifu", "japao", "japones", "animacao japonesa",
    "shonen", "seinen", "isekai", "shojo", "mecha",
    "one piece", "luffy", "zoro", "naruto", "sasuke", "dragon ball", "dbz", "goku", "vegeta",
    "attack on titan", "shingeki no kyojin", "eren", "levi", "mikasa",
    "jujutsu kaisen", "gojo", "sukuna", "demon slayer", "kimetsu no yaiba", "tanjiro", "nezuko",
    "bleach", "ichigo", "death note", "light", "hunter x hunter", "gon", "killua",
    "fullmetal alchemist", "my hero academia", "boku no hero", "solo leveling", "chainsaw man", "denji",
    "evangelion", "cowboy bebop", "berserk", "guts", "vinland saga", "studio ghibli", "hayao miyazaki"
  ],
  music: [
    "musica", "musicas", "música", "músicas", "music", "musical", "cancao", "cancoes", "song", "songs",
    "cantor", "cantores", "cantora", "cantoras", "singer", "vocalista",
    "banda", "bandas", "band", "bands", "grupo musical",
    "album", "albuns", "álbum", "álbuns", "faixa", "faixas", "track", "tracks",
    "artista", "artistas", "artist", "compositor", "produtor musical", "dj",
    "rap", "hip hop", "trap", "rock", "metal", "heavy metal", "pop", "r&b", "soul", "indie rock",
    "eletronica", "edm", "house", "techno", "reggaeton", "fado", "musica portuguesa",
    "kendrick lamar", "drake", "eminem", "kanye", "travis scott", "taylor swift", "beyonce", "rihanna",
    "the weeknd", "billie eilish", "michael jackson", "queen", "beatles", "pink floyd", "nirvana", "linkin park",
    "coldplay", "radiohead", "daft punk", "arctic monkeys"
  ],
  tech: [
    "tecnologia", "tech", "technology", "hardware", "software", "gadget", "gadgets", "eletronica",
    "smartphone", "smartphones", "telemovel", "telemoveis", "celular", "celulares", "telefone",
    "iphone", "apple", "macbook", "ipad", "ios", "samsung", "galaxy", "xiaomi", "google pixel", "android",
    "computador", "computadores", "pc", "laptop", "notebook", "desktop",
    "processador", "cpu", "placa grafica", "gpu", "rtx", "geforce", "nvidia", "intel", "amd", "ryzen", "radeon",
    "sistema operativo", "windows", "linux", "macos",
    "inteligencia artificial", "ia", "ai", "chatgpt", "openai", "gemini", "copilot", "llm",
    "aplicacao", "aplicacoes", "app", "apps", "browser", "navegador"
  ],
  vehicles: [
    "carro", "carros", "car", "cars", "automovel", "automoveis", "auto", "veiculo", "veiculos",
    "jdm", "jdm cars", "tuning", "motor", "motores", "ronco", "cavalos", "v8", "v12", "turbo",
    "mota", "motas", "moto", "motos", "motociclo", "motocicleta", "superbike",
    "supercarro", "supercarros", "hipercarro", "hipercarros", "desportivo", "desportivos",
    "porsche", "911", "ferrari", "lamborghini", "mclaren", "bugatti", "aston martin",
    "bmw", "mercedes", "audi", "volkswagen", "toyota", "nissan", "honda", "mazda", "subaru",
    "skyline", "gtr", "supra", "rx7", "miata", "civic", "impreza", "mustang", "camaro", "corvette",
    "eletrico", "eletricos", "tesla", "rally", "drift"
  ],
  food: [
    "comida", "comidas", "food", "gastronomia", "culinaria", "culinária", "cozinha",
    "prato", "pratos", "refeicao", "refeicoes", "restaurante", "restaurantes",
    "sabor", "sabores", "flavor", "sobremesa", "sobremesas", "doce", "doces", "doçaria",
    "gelado", "gelados", "ice cream", "sorvete", "sorvetes", "gelataria",
    "pizza", "pizzas", "hamburguer", "hamburgueres", "burger", "burgers",
    "sushi", "ramen", "massa", "pastas", "italiana", "churrasco", "carne", "peixe", "marisco",
    "fast food", "mcdonalds", "burger king", "kfc", "subway",
    "bebida", "bebidas", "drink", "drinks", "cocktail", "cocktails", "cafe", "cafes", "cha",
    "vinho", "vinhos", "cerveja", "cervejas", "pastel de nata", "francesinha", "bacalhau"
  ],
  creators: [
    "criador", "criadores", "creator", "creators", "conteudo",
    "youtuber", "youtubers", "youtube", "canal", "canais",
    "streamer", "streamers", "stream", "twitch", "kick",
    "podcast", "podcasts", "podcaster", "influenciador", "influenciadores", "influencer", "influencers",
    "meme", "memes", "viral", "internet", "tiktok", "tiktoker", "tiktokers",
    "mrbeast", "pewdiepie", "wuant", "ricfazeres", "windoh", "diogo bataguas", "casimiro", "alanzoka", "ibai", "xqc", "speed", "ishowspeed", "kai cenat"
  ],
  geek: [
    "geek", "nerd", "pop", "cultura pop", "super heroi", "super herois", "super-heroi", "heroi", "herois", "vilao", "viloes",
    "star wars", "jedi", "sith", "vader", "darth vader", "luke", "yoda",
    "harry potter", "hogwarts", "voldemort", "bruxo", "bruxos", "feiticeiro",
    "senhor dos aneis", "lord of the rings", "tolkien", "frodo", "gandalf", "sauron",
    "marvel", "avengers", "vingadores", "dc", "dc comics", "justice league", "liga da justica",
    "jogos de cartas", "cartas", "tcg", "card game", "magic", "magic the gathering", "pokemon cards", "yu gi oh",
    "jogo de tabuleiro", "jogos de tabuleiro", "board game", "board games", "catan", "monopoly"
  ],
  culture: [
    "cultura", "pais", "paises", "país", "países", "country", "countries",
    "cidade", "cidades", "city", "cities", "capital", "capitais",
    "viagem", "viagens", "travel", "visitar", "turismo", "destino", "destinos", "praia", "praias", "ilha", "ilhas",
    "europa", "asia", "america", "africa", "portugal", "espanha", "franca", "italia", "japao", "eua", "brasil",
    "monumento", "monumentos", "maravilhas do mundo",
    "historia", "história", "historico", "guerra", "imperio", "romano", "grego", "idade media",
    "livro", "livros", "book", "books", "literatura", "escritor", "escritores", "filosofia", "filosofo"
  ],
  lifestyle: [
    "lifestyle", "estilo de vida", "fitness", "ginasio", "ginásio", "gym", "treino", "treinos", "workout",
    "exercicio", "exercicios", "musculacao", "musculação", "saude", "saúde", "nutricao", "nutrição", "dieta",
    "sapatilha", "sapatilhas", "tenis", "tênis", "sneaker", "sneakers", "nike", "adidas", "jordan", "yeezy",
    "moda", "roupa", "roupas", "marca de roupa", "streetwear", "luxo", "vestuario"
  ],
  business: [
    "negocio", "negocios", "negócio", "negócios", "business", "empresa", "empresas", "company",
    "startup", "startups", "empreendedor", "empreendedores", "empreendedorismo", "ceo", "ceos", "bilionario", "bilionarios",
    "financas", "finanças", "investimento", "investimentos", "dinheiro", "acoes", "bolsa",
    "cripto", "crypto", "criptomoeda", "criptomoedas", "bitcoin", "btc", "ethereum", "eth", "blockchain"
  ],
  science: [
    "ciencia", "ciência", "science", "cientifico", "cientistas",
    "natureza", "meio ambiente", "animal", "animais", "bicho", "bichos", "especie", "especies", "fauna", "flora",
    "espaco", "espaço", "space", "astronomia", "planeta", "planetas", "estrela", "estrelas", "universo", "galaxia", "nasa",
    "fisica", "quimica", "biologia",
    "programacao", "programação", "coding", "codigo", "desenvolvedor", "linguagem de programacao", "python", "javascript", "react", "rust"
  ],
};

/**
 * Deteta automaticamente a melhor categoria para uma Tier List.
 * 
 * @param {Object} options
 * @param {string} options.title - Título ou tema da tier list
 * @param {string} [options.description] - Descrição opcional
 * @param {Array} [options.items] - Itens adicionados à tier list
 * @returns {Object} Categoria identificada com id, name, icon, color e confiança
 */
export function detectCategory({ title = "", description = "", items = [] } = {}) {
  const normTitle = normalizeText(title);
  const normDesc = normalizeText(description);

  // Combina nomes dos elementos
  const itemsText = items
    .map((it) => `${it.name || ""} ${(it.tags || []).join(" ")} ${it.category || ""}`)
    .join(" ");
  const normItems = normalizeText(itemsText);

  // Mapa de pontuações por categoria
  const scores = {};
  Object.keys(CATEGORY_KEYWORDS).forEach((catId) => {
    scores[catId] = 0;
  });

  // Analisa cada categoria
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "i");

      // Título tem o peso mais alto (peso 10x)
      if (normTitle && regex.test(normTitle)) {
        scores[catId] += kw.includes(" ") ? 15 : 10;
      }

      // Descrição tem peso moderado (peso 3x)
      if (normDesc && regex.test(normDesc)) {
        scores[catId] += kw.includes(" ") ? 5 : 3;
      }

      // Itens individuais têm peso acumulativo (peso 2x)
      if (normItems && regex.test(normItems)) {
        scores[catId] += kw.includes(" ") ? 4 : 2;
      }
    }
  }

  // Encontra a categoria com maior pontuação
  let bestCatId = "gaming"; // fallback por defeito se tudo for vazio
  let maxScore = 0;

  for (const [catId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCatId = catId;
    }
  }

  // Procura o objeto completo da categoria
  const found = BASE_CATEGORIES.find((c) => c.id === bestCatId) || BASE_CATEGORIES[0];

  return {
    id: found.id,
    name: found.name,
    icon: found.icon,
    color: found.color,
    score: maxScore,
    confidence: maxScore >= 10 ? "high" : maxScore >= 3 ? "medium" : "low",
  };
}
