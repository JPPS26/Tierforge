export const TIER_COLORS = {
  "S+": "#FFE9B0",
  S: "#FFC64D",
  A: "#F0924B",
  B: "#C77A4A",
  C: "#9C5FA0",
  D: "#5C86A8",
  F: "#6B6560",
};

export const CATEGORIES = [
  { name: "Gaming", count: "12.4k" },
  { name: "Football", count: "8.1k" },
  { name: "Basketball", count: "5.6k" },
  { name: "Movies", count: "9.9k" },
  { name: "TV Shows", count: "6.2k" },
  { name: "Anime", count: "11.3k" },
  { name: "Music", count: "4.8k" },
  { name: "Tech", count: "3.1k" },
];

const CREATORS = [
  { name: "kairox", badge: "Elite Creator" },
  { name: "nova.tiers", badge: "Top Creator" },
  { name: "benchwarmr", badge: "Rising Creator" },
  { name: "midlane_meta", badge: "Expert Ranker" },
  { name: "cinereel", badge: "Trending Creator" },
  { name: "hoopsdaily", badge: "Elite Creator" },
];

function makeTierList(i) {
  const cat = CATEGORIES[i % CATEGORIES.length];
  const creator = CREATORS[i % CREATORS.length];
  const titles = [
    "Best Premier League Midfielders 2026",
    "Every Zelda Game, Ranked",
    "GOAT Point Guards of All Time",
    "Marvel Phase Villains Tier List",
    "S-Tier Anime Openings This Decade",
    "Best Rappers Right Now",
    "Fighting Game Characters, Ranked",
    "Every Pixar Movie Ranked",
    "Best Laptops Under $1500",
    "Champions League Finals Ranked",
    "Best Souls-like Bosses",
    "Every Studio Ghibli Film",
  ];
  return {
    id: `demo-${i}`,
    title: titles[i % titles.length],
    category: cat.name,
    creator: creator.name,
    creatorBadge: creator.badge,
    votes: Math.floor(400 + ((i * 137) % 9000)),
    views: Math.floor(2000 + ((i * 731) % 80000)),
    comments: Math.floor(5 + ((i * 13) % 400)),
    createdDaysAgo: (i * 3) % 21,
  };
}

export const DEMO_LISTS = Array.from({ length: 24 }, (_, i) => makeTierList(i));

export const STARTER_ITEMS = [
  "Kylian Mbappé", "Erling Haaland", "Jude Bellingham", "Vinícius Jr.",
  "Rodri", "Bukayo Saka", "Phil Foden", "Pedri",
  "Jamal Musiala", "Florian Wirtz", "Lamine Yamal", "Victor Osimhen",
].map((name, idx) => ({ id: `item-${idx}`, name }));

export { CREATORS };
