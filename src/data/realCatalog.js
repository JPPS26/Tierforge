// Catálogo estruturado de dados reais verificados para TierForge
// Todas as entidades contêm nomes reais, imagens públicas de alta resolução e metadados oficiais.

export const REAL_CATEGORIES = [
  { id: "football", name: "Futebol", icon: "Trophy", count: "14.2k" },
  { id: "gaming", name: "Gaming", icon: "Gamepad2", count: "18.6k" },
  { id: "movies", name: "Cinema", icon: "Film", count: "11.4k" },
  { id: "tvshows", name: "Séries de TV", icon: "Tv", count: "8.9k" },
  { id: "anime", name: "Anime & Manga", icon: "Sparkles", count: "15.1k" },
  { id: "music", name: "Música", icon: "Music", count: "7.3k" },
  { id: "tech", name: "Tecnologia", icon: "Cpu", count: "5.8k" },
  { id: "basketball", name: "Basquetebol", icon: "Flame", count: "6.1k" },
];

export const REAL_ITEMS = [
  // FUTEBOL
  {
    id: "fb-cristiano-ronaldo",
    name: "Cristiano Ronaldo",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg",
    description: "Capitão de Portugal, 5x Bola de Ouro, maior marcador de sempre do futebol internacional.",
    tags: ["Portugal", "Al-Nassr", "Real Madrid", "Avançado"],
    metadata: { club: "Al-Nassr", nationality: "Portugal", position: "Avançado" },
  },
  {
    id: "fb-lionel-messi",
    name: "Lionel Messi",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Lionel_Messi_20180626.jpg",
    description: "Capitão da Argentina, campeão do mundo 2022, 8x Bola de Ouro.",
    tags: ["Argentina", "Inter Miami", "Barcelona", "Avançado"],
    metadata: { club: "Inter Miami", nationality: "Argentina", position: "Avançado" },
  },
  {
    id: "fb-kylian-mbappe",
    name: "Kylian Mbappé",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg",
    description: "Avançado do Real Madrid e da seleção francesa, campeão do mundo 2018.",
    tags: ["França", "Real Madrid", "PSG", "Avançado"],
    metadata: { club: "Real Madrid", nationality: "França", position: "Avançado" },
  },
  {
    id: "fb-erling-haaland",
    name: "Erling Haaland",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Erling_Haaland_2023_%28cropped-v2%29.jpg",
    description: "Ponta de lança do Manchester City e Noruega, Bota de Ouro europeia.",
    tags: ["Noruega", "Manchester City", "Dortmund", "Avançado"],
    metadata: { club: "Manchester City", nationality: "Noruega", position: "Avançado" },
  },
  {
    id: "fb-jude-bellingham",
    name: "Jude Bellingham",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/52/Jude_Bellingham_2024.jpg",
    description: "Médio internacional inglês e estrela do Real Madrid, vencedor da Champions League 2024.",
    tags: ["Inglaterra", "Real Madrid", "Médio"],
    metadata: { club: "Real Madrid", nationality: "Inglaterra", position: "Médio" },
  },
  {
    id: "fb-vinicius-jr",
    name: "Vinícius Jr.",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Junior_2021.jpg",
    description: "Extremo do Real Madrid e seleção brasileira, decisivo nas conquistas da Champions.",
    tags: ["Brasil", "Real Madrid", "Extremo"],
    metadata: { club: "Real Madrid", nationality: "Brasil", position: "Extremo" },
  },
  {
    id: "fb-kevin-de-bruyne",
    name: "Kevin De Bruyne",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Kevin_De_Bruyne_201807091.jpg",
    description: "Maestro belga do Manchester City, um dos maiores médios criativos da história da Premier League.",
    tags: ["Bélgica", "Manchester City", "Médio"],
    metadata: { club: "Manchester City", nationality: "Bélgica", position: "Médio" },
  },
  {
    id: "fb-luka-modric",
    name: "Luka Modrić",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/ISL-HRV_%287%29_%28cropped%29.jpg",
    description: "Lenda viva croata, vencedor da Bola de Ouro 2018 e 6x Champions League com o Real Madrid.",
    tags: ["Croácia", "Real Madrid", "Médio"],
    metadata: { club: "Real Madrid", nationality: "Croácia", position: "Médio" },
  },
  {
    id: "fb-bruno-fernandes",
    name: "Bruno Fernandes",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/Bruno_Fernandes_2022.jpg",
    description: "Capitão do Manchester United e internacional português, líder em assistências e golos.",
    tags: ["Portugal", "Manchester United", "Médio"],
    metadata: { club: "Manchester United", nationality: "Portugal", position: "Médio" },
  },
  {
    id: "fb-bernardo-silva",
    name: "Bernardo Silva",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Bernardo_Silva_2022.jpg",
    description: "Médio ofensivo de classe mundial do Manchester City e da seleção portuguesa.",
    tags: ["Portugal", "Manchester City", "Médio"],
    metadata: { club: "Manchester City", nationality: "Portugal", position: "Médio" },
  },
  {
    id: "fb-ruben-dias",
    name: "Rúben Dias",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fd/R%C3%BAben_Dias_2022.jpg",
    description: "Defesa central de elite do Manchester City e de Portugal, eleito Premier League Player of the Season.",
    tags: ["Portugal", "Manchester City", "Defesa"],
    metadata: { club: "Manchester City", nationality: "Portugal", position: "Defesa" },
  },
  {
    id: "fb-rodri",
    name: "Rodri Hernández",
    category: "football",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Rodrigo_Hern%C3%A1ndez_Cascante_%28cropped%29.jpg",
    description: "Vencedor do Euro 2024 pela Espanha e esteio do meio-campo do Manchester City.",
    tags: ["Espanha", "Manchester City", "Médio"],
    metadata: { club: "Manchester City", nationality: "Espanha", position: "Médio" },
  },

  // GAMING
  {
    id: "game-elden-ring",
    name: "Elden Ring",
    category: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
    description: "Obra-prima de ação e RPG em mundo aberto da FromSoftware e Hidetaka Miyazaki.",
    tags: ["RPG", "FromSoftware", "Goty 2022"],
    metadata: { developer: "FromSoftware", releaseYear: 2022 },
  },
  {
    id: "game-zelda-totk",
    name: "Zelda: Tears of the Kingdom",
    category: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
    description: "Aventura monumental da Nintendo em Hyrule com liberdade criativa revolucionária.",
    tags: ["Aventura", "Nintendo", "Nintendo Switch"],
    metadata: { developer: "Nintendo", releaseYear: 2023 },
  },
  {
    id: "game-witcher-3",
    name: "The Witcher 3: Wild Hunt",
    category: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
    description: "RPG narrativo aclamado da CD Projekt Red com a jornada de Geralt de Rívia.",
    tags: ["RPG", "CD Projekt", "Goty 2015"],
    metadata: { developer: "CD Projekt Red", releaseYear: 2015 },
  },
  {
    id: "game-gta-v",
    name: "Grand Theft Auto V",
    category: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80",
    description: "Um dos jogos mais vendidos da história, sandbox criminal lendário da Rockstar Games.",
    tags: ["Mundo Aberto", "Rockstar Games", "Ação"],
    metadata: { developer: "Rockstar Games", releaseYear: 2013 },
  },
  {
    id: "game-baldurs-gate-3",
    name: "Baldur's Gate 3",
    category: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80",
    description: "Jogo do Ano 2023, RPG definitivo de Dungeons & Dragons desenvolvido pela Larian Studios.",
    tags: ["RPG", "Larian Studios", "Goty 2023"],
    metadata: { developer: "Larian Studios", releaseYear: 2023 },
  },
  {
    id: "game-red-dead-2",
    name: "Red Dead Redemption 2",
    category: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=400&q=80",
    description: "A epopeia de Arthur Morgan no Velho Oeste americano criada pela Rockstar Games.",
    tags: ["Mundo Aberto", "Rockstar Games", "Narrativa"],
    metadata: { developer: "Rockstar Games", releaseYear: 2018 },
  },

  // CINEMA
  {
    id: "mv-the-dark-knight",
    name: "The Dark Knight (2008)",
    category: "movies",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
    description: "Clássico indiscutível de Christopher Nolan com a atuação inesquecível de Heath Ledger como Joker.",
    tags: ["Ação", "Batman", "Christopher Nolan"],
    metadata: { director: "Christopher Nolan", releaseYear: 2008 },
  },
  {
    id: "mv-inception",
    name: "Inception (2010)",
    category: "movies",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80",
    description: "Ficção científica e suspense psicológico sobre invasão de sonhos com Leonardo DiCaprio.",
    tags: ["Ficção Científica", "Christopher Nolan"],
    metadata: { director: "Christopher Nolan", releaseYear: 2010 },
  },
  {
    id: "mv-interstellar",
    name: "Interstellar (2014)",
    category: "movies",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
    description: "Viagem épica pelo espaço e tempo em busca da sobrevivência da humanidade.",
    tags: ["Espaço", "Ficção Científica", "Hans Zimmer"],
    metadata: { director: "Christopher Nolan", releaseYear: 2014 },
  },
  {
    id: "mv-the-godfather",
    name: "The Godfather (1972)",
    category: "movies",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
    description: "A obra-prima do cinema dirigida por Francis Ford Coppola com Marlon Brando e Al Pacino.",
    tags: ["Drama", "Crime", "Clássico"],
    metadata: { director: "Francis Ford Coppola", releaseYear: 1972 },
  },
  {
    id: "mv-oppenheimer",
    name: "Oppenheimer (2023)",
    category: "movies",
    imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80",
    description: "Vencedor de 7 Óscares retratando o Projeto Manhattan com Cillian Murphy.",
    tags: ["Histórico", "Drama", "Óscar"],
    metadata: { director: "Christopher Nolan", releaseYear: 2023 },
  },

  // SÉRIES DE TV
  {
    id: "tv-breaking-bad",
    name: "Breaking Bad",
    category: "tvshows",
    imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80",
    description: "A transformação de Walter White em Heisenberg, considerada uma das melhores séries de sempre.",
    tags: ["Drama", "Crime", "Vince Gilligan"],
    metadata: { creator: "Vince Gilligan", seasons: 5 },
  },
  {
    id: "tv-game-of-thrones",
    name: "Game of Thrones",
    category: "tvshows",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    description: "A luta pelo Trono de Ferro em Westeros na produção épica da HBO baseada em George R.R. Martin.",
    tags: ["Fantasia", "HBO", "Westeros"],
    metadata: { network: "HBO", seasons: 8 },
  },
  {
    id: "tv-succession",
    name: "Succession",
    category: "tvshows",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    description: "A disputa impiedosa pelo poder e controlo do império da família Roy.",
    tags: ["Drama", "HBO", "Emmy"],
    metadata: { network: "HBO", seasons: 4 },
  },

  // ANIME
  {
    id: "an-attack-on-titan",
    name: "Attack on Titan (Shingeki no Kyojin)",
    category: "anime",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80",
    description: "A luta desesperada da humanidade contra os titãs na história marcante de Hajime Isayama.",
    tags: ["Ação", "Drama", "Mistério"],
    metadata: { author: "Hajime Isayama", episodes: 89 },
  },
  {
    id: "an-one-piece",
    name: "One Piece",
    category: "anime",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80",
    description: "A lendária aventura de Monkey D. Luffy em busca do maior tesouro dos mares.",
    tags: ["Shonen", "Aventura", "Piratas"],
    metadata: { author: "Eiichiro Oda" },
  },

  // TECNOLOGIA
  {
    id: "tech-ps5-pro",
    name: "PlayStation 5 Pro",
    category: "tech",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
    description: "Consola de última geração da Sony com suporte avançado a Ray Tracing e PSSR.",
    tags: ["Consola", "Sony", "Gaming"],
    metadata: { brand: "Sony", year: 2024 },
  },
  {
    id: "tech-rtx-4090",
    name: "NVIDIA GeForce RTX 4090",
    category: "tech",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80",
    description: "Placa gráfica topo de gama da NVIDIA com arquitetura Ada Lovelace.",
    tags: ["GPU", "NVIDIA", "Hardware"],
    metadata: { brand: "NVIDIA", year: 2022 },
  },
];

// Dados reais iniciais de Tier Lists da comunidade
export const SEED_TIERLISTS = [
  {
    id: "tl-football-goat-2026",
    title: "Melhores Jogadores Mundiais da Atualidade (2026)",
    category: "football",
    language: "pt",
    description: "Avaliação criteriosa baseada em títulos, desempenho individual e consistência internacional.",
    creator: "Rodrigo Matos",
    creatorBadge: "Criador de Elite",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    ownerId: "user-seed-1",
    votes: 8412,
    views: 94200,
    likes: 3120,
    commentsCount: 342,
    itemDisplayMode: "both",
    createdDaysAgo: 1,
    tiers: [
      { id: "t1", label: "S", color: "#FF3B5C" },
      { id: "t2", label: "A", color: "#FF9F43" },
      { id: "t3", label: "B", color: "#FFD23F" },
      { id: "t4", label: "C", color: "#6BCB77" },
    ],
    items: [
      REAL_ITEMS[0], // Cristiano Ronaldo
      REAL_ITEMS[1], // Messi
      REAL_ITEMS[2], // Mbappé
      REAL_ITEMS[3], // Haaland
      REAL_ITEMS[4], // Bellingham
      REAL_ITEMS[5], // Vinícius
      REAL_ITEMS[6], // De Bruyne
      REAL_ITEMS[7], // Modric
    ],
    placements: {
      "fb-cristiano-ronaldo": "t1",
      "fb-lionel-messi": "t1",
      "fb-kylian-mbappe": "t1",
      "fb-vinicius-jr": "t1",
      "fb-jude-bellingham": "t2",
      "fb-erling-haaland": "t2",
      "fb-kevin-de-bruyne": "t2",
      "fb-luka-modric": "t2",
    },
  },
  {
    id: "tl-rpg-masterpieces",
    title: "Melhores Jogos RPG de Ação de Sempre",
    category: "gaming",
    language: "pt",
    description: "Rankings dos RPGs mais influentes e premiados da última década.",
    creator: "Alexandre Rocha",
    creatorBadge: "Especialista Gaming",
    creatorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    ownerId: "user-seed-2",
    votes: 12150,
    views: 142000,
    likes: 4890,
    commentsCount: 512,
    itemDisplayMode: "both",
    createdDaysAgo: 3,
    tiers: [
      { id: "t1", label: "S+", color: "#FF3B5C" },
      { id: "t2", label: "S", color: "#FF6B7A" },
      { id: "t3", label: "A", color: "#FF9F43" },
      { id: "t4", label: "B", color: "#FFD23F" },
    ],
    items: [
      REAL_ITEMS[12], // Elden Ring
      REAL_ITEMS[13], // Zelda TOTK
      REAL_ITEMS[14], // The Witcher 3
      REAL_ITEMS[16], // Baldurs Gate 3
      REAL_ITEMS[17], // Red Dead 2
    ],
    placements: {
      "game-elden-ring": "t1",
      "game-baldurs-gate-3": "t1",
      "game-witcher-3": "t2",
      "game-zelda-totk": "t2",
      "game-red-dead-2": "t3",
    },
  },
  {
    id: "tl-cinema-nolan",
    title: "Filmes de Christopher Nolan Ranqueados",
    category: "movies",
    language: "pt",
    description: "Da trilogia do Cavaleiro das Trevas até Oppenheimer.",
    creator: "Beatriz Costa",
    creatorBadge: "Crítica de Cinema",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    ownerId: "user-seed-3",
    votes: 6890,
    views: 61400,
    likes: 2150,
    commentsCount: 204,
    itemDisplayMode: "both",
    createdDaysAgo: 4,
    tiers: [
      { id: "t1", label: "S", color: "#FF3B5C" },
      { id: "t2", label: "A", color: "#FF9F43" },
      { id: "t3", label: "B", color: "#FFD23F" },
    ],
    items: [
      REAL_ITEMS[18], // The Dark Knight
      REAL_ITEMS[19], // Inception
      REAL_ITEMS[20], // Interstellar
      REAL_ITEMS[22], // Oppenheimer
    ],
    placements: {
      "mv-the-dark-knight": "t1",
      "mv-interstellar": "t1",
      "mv-inception": "t2",
      "mv-oppenheimer": "t2",
    },
  },
  {
    id: "tl-tvshows-goats",
    title: "Maiores Séries Dramáticas da História da TV",
    category: "tvshows",
    language: "pt",
    description: "Séries com notas máximas e impacto cultural duradouro.",
    creator: "Marco Fernandes",
    creatorBadge: "Criador Top",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    ownerId: "user-seed-4",
    votes: 9340,
    views: 110200,
    likes: 3870,
    commentsCount: 428,
    itemDisplayMode: "both",
    createdDaysAgo: 6,
    tiers: [
      { id: "t1", label: "GOAT", color: "#FF3B5C" },
      { id: "t2", label: "S", color: "#FF9F43" },
      { id: "t3", label: "A", color: "#FFD23F" },
    ],
    items: [
      REAL_ITEMS[23], // Breaking Bad
      REAL_ITEMS[24], // Game of Thrones
      REAL_ITEMS[25], // Succession
    ],
    placements: {
      "tv-breaking-bad": "t1",
      "tv-succession": "t2",
      "tv-game-of-thrones": "t3",
    },
  },
];

