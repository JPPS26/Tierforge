// Camada de serviços da base de dados (Repository Pattern)
// Sincroniza com o Firebase Firestore e mantém persistência local com dados reais verificados.

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { REAL_ITEMS, SEED_TIERLISTS, REAL_CATEGORIES } from "../data/realCatalog";
import { searchWikimediaEntities } from "./wikipediaApi";

const STORAGE_KEY_TIERLISTS = "tierforge_real_tierlists";
const STORAGE_KEY_COMMENTS = "tierforge_real_comments";
const STORAGE_KEY_VOTES = "tierforge_user_votes";

// Inicializa o armazenamento local com dados reais se necessário
function getStoredTierLists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIERLISTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TIERLISTS, JSON.stringify(SEED_TIERLISTS));
      return SEED_TIERLISTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_TIERLISTS;
  }
}

function saveStoredTierLists(lists) {
  try {
    localStorage.setItem(STORAGE_KEY_TIERLISTS, JSON.stringify(lists));
  } catch (e) {
    console.warn("Could not save tierlists to localStorage", e);
  }
}

function getStoredComments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMENTS);
    if (!raw) {
      const initial = {
        "tl-football-goat-2026": [
          {
            id: "c-1",
            userName: "Tiago Silva",
            userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
            text: "Totalmente de acordo com o Cristiano e o Messi no topo. Mas colocaria o De Bruyne também no nível mais alto!",
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            likes: 42,
          },
          {
            id: "c-2",
            userName: "André Pereira",
            userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
            text: "O Bellingham teve uma época incrível no Real Madrid, merecia estar taco a taco com os melhores.",
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            likes: 19,
          },
        ],
      };
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStoredComments(allComments) {
  try {
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(allComments));
  } catch (e) {
    console.warn("Could not save comments to localStorage", e);
  }
}

// Verifica se o Firebase está devidamente configurado com chaves válidas
function isFirebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

// Obter tier lists recentes/filtradas
export async function getTierLists({ category = "All", tab = "Trending", queryText = "" } = {}) {
  let lists = [];

  if (isFirebaseConfigured()) {
    try {
      const colRef = collection(db, "tierlists");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      lists = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("Firestore not reachable, using local verified repository:", e);
      lists = getStoredTierLists();
    }
  } else {
    lists = getStoredTierLists();
  }

  // Filtragem por categoria
  if (category && category !== "All" && category !== "all") {
    lists = lists.filter(
      (l) => (l.category || "").toLowerCase() === category.toLowerCase()
    );
  }

  // Filtragem por texto de pesquisa
  if (queryText && queryText.trim()) {
    const qLower = queryText.toLowerCase().trim();
    lists = lists.filter(
      (l) =>
        (l.title && l.title.toLowerCase().includes(qLower)) ||
        (l.description && l.description.toLowerCase().includes(qLower)) ||
        (l.creator && l.creator.toLowerCase().includes(qLower))
    );
  }

  // Ordenação
  const copy = [...lists];
  if (tab === "New") {
    copy.sort((a, b) => (b.createdAt?.seconds || b.createdDaysAgo || 0) - (a.createdAt?.seconds || a.createdDaysAgo || 0));
  } else if (tab === "Popular") {
    copy.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    // Trending (padrão)
    copy.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  }

  return copy;
}

// Obter uma tier list por ID
export async function getTierListById(id) {
  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, "tierlists", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (e) {
      console.warn("Firestore fetch error, checking local store", e);
    }
  }

  const stored = getStoredTierLists();
  return stored.find((l) => l.id === id) || null;
}

// Guardar/Publicar uma nova tier list
export async function createTierList(uid, {
  title,
  category,
  description = "",
  language = "pt",
  tiers,
  items,
  placements,
  itemDisplayMode = "both",
  creatorName = "Anónimo",
  creatorAvatar = "",
}) {
  const newId = `tl-${Date.now()}`;
  const record = {
    id: newId,
    title: title || "A Minha Tier List",
    category: category || "football",
    description,
    language,
    tiers,
    items,
    placements,
    itemDisplayMode,
    ownerId: uid || "anon",
    creator: creatorName,
    creatorAvatar,
    votes: 1,
    views: 1,
    likes: 1,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    createdDaysAgo: 0,
  };

  if (isFirebaseConfigured() && uid) {
    try {
      const docRef = await addDoc(collection(db, "tierlists"), {
        ...record,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...record };
    } catch (e) {
      console.warn("Could not save to Firestore, saving locally:", e);
    }
  }

  // Guardar localmente
  const existing = getStoredTierLists();
  saveStoredTierLists([record, ...existing]);
  return record;
}

// Obter tier lists criadas por um utilizador
export async function getUserTierLists(uid) {
  if (!uid) return [];

  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, "tierlists"),
        where("ownerId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Firestore user tierlists error, falling back locally", e);
    }
  }

  const stored = getStoredTierLists();
  return stored.filter((l) => l.ownerId === uid);
}

// Votar numa tier list (+1 ou -1)
export async function voteTierList(id, direction = 1) {
  const stored = getStoredTierLists();
  const target = stored.find((l) => l.id === id);
  if (target) {
    target.votes = Math.max(0, (target.votes || 0) + direction);
    saveStoredTierLists(stored);
  }

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, "tierlists", id);
      await updateDoc(ref, { votes: increment(direction) });
    } catch (e) {
      console.warn("Firestore vote update failed", e);
    }
  }

  return target ? target.votes : 0;
}

// Incrementar contagem de visualizações
export async function incrementViews(id) {
  const stored = getStoredTierLists();
  const target = stored.find((l) => l.id === id);
  if (target) {
    target.views = (target.views || 0) + 1;
    saveStoredTierLists(stored);
  }

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, "tierlists", id);
      await updateDoc(ref, { views: increment(1) });
    } catch (e) {
      // Silencioso
    }
  }
}

// Obter comentários de uma tier list
export function getCommentsForTierList(tierListId) {
  const all = getStoredComments();
  return all[tierListId] || [];
}

// Adicionar um comentário
export function addCommentToTierList(tierListId, { userName, userAvatar, text }) {
  const all = getStoredComments();
  const listComments = all[tierListId] || [];

  const newComment = {
    id: `c-${Date.now()}`,
    userName: userName || "Utilizador",
    userAvatar: userAvatar || "",
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  all[tierListId] = [newComment, ...listComments];
  saveStoredComments(all);

  // Atualiza contador de comentários na lista
  const stored = getStoredTierLists();
  const target = stored.find((l) => l.id === tierListId);
  if (target) {
    target.commentsCount = (target.commentsCount || 0) + 1;
    saveStoredTierLists(stored);
  }

  return newComment;
}

// Pesquisa unificada no catálogo real + API externa
export async function searchCatalog(queryText, category = null, lang = "pt") {
  if (!queryText || queryText.trim().length === 0) {
    // Se a pesquisa estiver vazia, retorna os itens mais populares do catálogo
    let results = REAL_ITEMS;
    if (category && category !== "All") {
      results = results.filter((item) => item.category === category);
    }
    return results.slice(0, 12);
  }

  const q = queryText.toLowerCase().trim();

  // 1. Pesquisa nos itens reais verificados locais
  let localMatches = REAL_ITEMS.filter((item) => {
    const matchName = item.name.toLowerCase().includes(q);
    const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
    const matchCat = category && category !== "All" ? item.category === category : true;
    return (matchName || matchTags) && matchCat;
  });

  // 2. Se tiver poucos resultados, consulta a API real da Wikimedia/Wikipedia
  if (localMatches.length < 5) {
    try {
      const externalResults = await searchWikimediaEntities(queryText, lang);
      // Evitar duplicados por nome
      const existingNames = new Set(localMatches.map((m) => m.name.toLowerCase()));
      const filteredExternal = externalResults.filter(
        (ext) => !existingNames.has(ext.name.toLowerCase())
      );
      return [...localMatches, ...filteredExternal];
    } catch (e) {
      console.warn("Wikipedia live search failed:", e);
    }
  }

  return localMatches;
}

// Categorias com contagens dinâmicas
export function getCategories() {
  const lists = getStoredTierLists();
  return REAL_CATEGORIES.map((cat) => {
    const count = lists.filter((l) => l.category === cat.id).length;
    return {
      ...cat,
      liveCount: count,
    };
  });
}

