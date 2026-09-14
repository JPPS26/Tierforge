// Camada de serviços da base de dados (Repository Pattern)
// Todas as métricas (votos, listas, visualizações, rankings de criadores)
// são calculadas estritamente a partir dos dados reais da base de dados.

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
import { REAL_ITEMS, SEED_TIERLISTS, REAL_CATEGORIES, SEED_USERS } from "../data/realCatalog";
import { searchWikimediaEntities } from "./wikipediaApi";

const STORAGE_KEY_TIERLISTS = "tierforge_real_tierlists";
const STORAGE_KEY_USERS = "tierforge_real_users";
const STORAGE_KEY_CATEGORIES = "tierforge_real_categories";
const STORAGE_KEY_COMMENTS = "tierforge_real_comments";
const STORAGE_KEY_USER_VOTES = "tierforge_antiabuse_votes";

// Helper de persistência segura com fallback
function getStored(key, initialFallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialFallback));
      return initialFallback;
    }
    return JSON.parse(raw);
  } catch {
    return initialFallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Could not save ${key} to storage`, e);
  }
}

function isFirebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

// -------------------------------------------------------------
// GESTÃO DE UTILIZADORES E PERFIS
// -------------------------------------------------------------
export function getAllUsers() {
  return getStored(STORAGE_KEY_USERS, SEED_USERS);
}

export function getUserByUid(uid) {
  if (!uid) return null;
  const users = getAllUsers();
  return users.find((u) => u.uid === uid) || null;
}

export function getUserByHandle(handle) {
  if (!handle) return null;
  const clean = handle.replace(/^#/, "").toLowerCase().trim();
  const users = getAllUsers();
  const user = users.find((u) => (u.handle || "").toLowerCase() === clean);
  if (!user) return null;

  // Calcula métricas reais deste criador a partir das suas tier lists na base de dados
  const allLists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const userLists = allLists.filter((l) => l.ownerId === user.uid);
  const publicLists = userLists.filter((l) => l.visibility !== "private");

  const totalVotes = userLists.reduce((acc, l) => acc + (l.votes || 0), 0);
  const totalViews = userLists.reduce((acc, l) => acc + (l.views || 0), 0);
  const totalLikes = userLists.reduce((acc, l) => acc + (l.likes || 0), 0);
  const followersCount = user.followers?.length || 0;

  // Fórmula real de Creator XP
  const realXp =
    userLists.length * 50 +
    totalVotes * 10 +
    totalViews * 1 +
    followersCount * 25;

  return {
    ...user,
    tierListCount: userLists.length,
    publicListsCount: publicLists.length,
    totalVotes,
    totalViews,
    totalLikes,
    followersCount,
    followingCount: user.following?.length || 0,
    creatorXp: realXp,
  };
}

const RESERVED_HANDLES = [
  "admin", "administrator", "tierforge", "support", "help",
  "explore", "categories", "login", "register", "create",
  "api", "settings", "leaderboard", "terms", "privacy"
];

export function checkHandleAvailable(handle, currentUid) {
  if (!handle) return { available: false, reason: "empty" };
  const clean = handle.replace(/^#/, "").toLowerCase().trim();

  // Validação de formato alfanumérico com underscore (3 a 20 caracteres)
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!regex.test(clean)) {
    return { available: false, reason: "invalid_format" };
  }

  if (RESERVED_HANDLES.includes(clean)) {
    return { available: false, reason: "reserved" };
  }

  const users = getAllUsers();
  const existing = users.find(
    (u) => (u.handle || "").toLowerCase() === clean && u.uid !== currentUid
  );

  if (existing) {
    return { available: false, reason: "taken" };
  }

  return { available: true, handle: clean };
}

export async function updateUserProfile(uid, data) {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.uid === uid);
  if (index === -1) return null;

  const current = users[index];
  const updated = {
    ...current,
    displayName: data.displayName !== undefined ? data.displayName.trim() : current.displayName,
    handle: data.handle !== undefined ? data.handle.replace(/^#/, "").toLowerCase().trim() : current.handle,
    bio: data.bio !== undefined ? data.bio.trim() : current.bio,
    avatar: data.avatar !== undefined ? data.avatar : current.avatar,
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;
  setStored(STORAGE_KEY_USERS, users);

  // Sincroniza o nome e avatar do criador nas suas tier lists existentes
  const lists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  let listsChanged = false;
  lists.forEach((l) => {
    if (l.ownerId === uid) {
      l.creator = updated.displayName;
      l.creatorHandle = updated.handle;
      l.creatorAvatar = updated.avatar;
      listsChanged = true;
    }
  });
  if (listsChanged) {
    setStored(STORAGE_KEY_TIERLISTS, lists);
  }

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, "users", uid);
      await updateDoc(ref, {
        displayName: updated.displayName,
        handle: updated.handle,
        bio: updated.bio,
        avatar: updated.avatar,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Firestore user update error:", e);
    }
  }

  return updated;
}

export function toggleFollowUser(currentUid, targetUid) {
  if (!currentUid || !targetUid || currentUid === targetUid) return false;

  const users = getAllUsers();
  const currentUser = users.find((u) => u.uid === currentUid);
  const targetUser = users.find((u) => u.uid === targetUid);
  if (!currentUser || !targetUser) return false;

  const following = new Set(currentUser.following || []);
  const followers = new Set(targetUser.followers || []);

  const isFollowing = following.has(targetUid);
  if (isFollowing) {
    following.delete(targetUid);
    followers.delete(currentUid);
  } else {
    following.add(targetUid);
    followers.add(currentUid);
  }

  currentUser.following = Array.from(following);
  targetUser.followers = Array.from(followers);

  setStored(STORAGE_KEY_USERS, users);
  return !isFollowing;
}

// -------------------------------------------------------------
// ESTATÍSTICAS GLOBAIS REAIS (CÁLCULO ESTRITO)
// -------------------------------------------------------------
export function getGlobalStats() {
  const lists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const users = getAllUsers();

  const totalTierLists = lists.length;
  // Criadores que criaram pelo menos uma lista ou estão registados
  const totalCreators = users.length;
  const totalVotes = lists.reduce((acc, l) => acc + (l.votes || 0), 0);
  const totalViews = lists.reduce((acc, l) => acc + (l.views || 0), 0);

  return {
    totalTierLists,
    totalCreators,
    totalVotes,
    totalViews,
  };
}

// -------------------------------------------------------------
// CLASSIFICAÇÃO DOS CRIADORES (LEADERBOARD) 100% DINÂMICA
// -------------------------------------------------------------
export function getLeaderboard() {
  const users = getAllUsers();
  const allLists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);

  const creators = users.map((u) => {
    const userLists = allLists.filter((l) => l.ownerId === u.uid);
    const totalVotes = userLists.reduce((acc, l) => acc + (l.votes || 0), 0);
    const totalViews = userLists.reduce((acc, l) => acc + (l.views || 0), 0);
    const totalLikes = userLists.reduce((acc, l) => acc + (l.likes || 0), 0);
    const followersCount = u.followers?.length || 0;

    // Fórmula de Creator XP
    const score =
      userLists.length * 50 +
      totalVotes * 10 +
      totalViews * 1 +
      followersCount * 25;

    let badge = "Novo Criador";
    if (score > 1500) badge = "Criador de Elite";
    else if (score > 1000) badge = "Criador Verificado";
    else if (score > 500) badge = "Criador em Ascensão";
    else if (userLists.length > 0) badge = "Criador Ativo";

    return {
      uid: u.uid,
      handle: u.handle || `user${u.uid.slice(0, 6)}`,
      name: u.displayName || "Criador",
      avatar: u.avatar || "",
      badge,
      xp: score,
      listsCount: userLists.length,
      votesCount: totalVotes,
      followersCount,
    };
  });

  // Ordenar decrescente por XP
  creators.sort((a, b) => b.xp - a.xp);

  return creators.map((c, idx) => ({
    ...c,
    rank: idx + 1,
  }));
}

// -------------------------------------------------------------
// SISTEMA DE CATEGORIAS DINÂMICAS E ESCALÁVEIS
// -------------------------------------------------------------
export function getCategories() {
  const categories = getStored(STORAGE_KEY_CATEGORIES, REAL_CATEGORIES);
  const lists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);

  // Calcula a contagem real de tier lists públicas para cada categoria
  return categories.map((cat) => {
    const realCount = lists.filter(
      (l) => l.category === cat.id && (l.visibility === "public" || !l.visibility)
    ).length;
    return {
      ...cat,
      count: realCount,
    };
  });
}

// -------------------------------------------------------------
// TIER LISTS (CONSULTA, FILTRAGEM E VISIBILIDADE)
// -------------------------------------------------------------
export async function getTierLists({
  category = "All",
  tab = "Trending",
  queryText = "",
  requestingUid = null,
} = {}) {
  let lists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);

  // Filtragem estrita de visibilidade:
  // Apenas públicas aparecem no Explorar e pesquisa geral (ou privadas se pertencerem ao próprio utilizador)
  lists = lists.filter((l) => {
    const vis = l.visibility || "public";
    if (vis === "public") return true;
    if (vis === "private") return requestingUid && l.ownerId === requestingUid;
    return false; // unlisted não aparece no feed geral
  });

  // Filtragem por categoria
  if (category && category !== "All" && category !== "all") {
    lists = lists.filter(
      (l) => (l.category || "").toLowerCase() === category.toLowerCase()
    );
  }

  // Filtragem por pesquisa de texto
  if (queryText && queryText.trim()) {
    const qLower = queryText.toLowerCase().trim();
    lists = lists.filter(
      (l) =>
        (l.title && l.title.toLowerCase().includes(qLower)) ||
        (l.description && l.description.toLowerCase().includes(qLower)) ||
        (l.creator && l.creator.toLowerCase().includes(qLower)) ||
        (l.creatorHandle && l.creatorHandle.toLowerCase().includes(qLower))
    );
  }

  // Ordenação com métricas reais
  const copy = [...lists];
  if (tab === "New") {
    copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (tab === "Popular") {
    copy.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    // Trending: ponderação de votos e visualizações
    copy.sort((a, b) => {
      const scoreB = (b.votes || 0) * 3 + (b.views || 0);
      const scoreA = (a.votes || 0) * 3 + (a.views || 0);
      return scoreB - scoreA;
    });
  }

  return copy;
}

export async function getTierListById(id, requestingUid = null) {
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === id);
  if (!target) return null;

  // Verifica permissão de visibilidade privada
  if (target.visibility === "private" && target.ownerId !== requestingUid) {
    return { ...target, isPrivateForbidden: true };
  }

  return target;
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
  visibility = "public",
  creatorName = "Anónimo",
  creatorHandle = "",
  creatorAvatar = "",
}) {
  const newId = `tl-${Date.now()}`;
  const now = new Date().toISOString();

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
    visibility: visibility || "public",
    ownerId: uid || "anon",
    creator: creatorName,
    creatorHandle: creatorHandle || (uid ? `user_${uid.slice(0, 6)}` : "anon"),
    creatorAvatar,
    votes: 0,
    views: 1,
    likes: 0,
    commentsCount: 0,
    createdAt: now,
    createdDaysAgo: 0,
  };

  const existing = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  setStored(STORAGE_KEY_TIERLISTS, [record, ...existing]);

  if (isFirebaseConfigured() && uid) {
    try {
      await addDoc(collection(db, "tierlists"), {
        ...record,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Could not save to Firestore, local state preserved:", e);
    }
  }

  return record;
}

// Obter tier lists criadas por um utilizador (com filtro de privadas)
export async function getUserTierLists(uid, isOwner = false) {
  if (!uid) return [];
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);

  return stored.filter((l) => {
    if (l.ownerId !== uid) return false;
    // Se não for o próprio dono a consultar, omite as privadas
    if (!isOwner && l.visibility === "private") return false;
    return true;
  });
}

// -------------------------------------------------------------
// SISTEMA DE VOTOS COM PROTEÇÃO ANTI-ABUSO
// -------------------------------------------------------------
export async function voteTierList(tierListId, userId = "anonymous", direction = 1) {
  const voteStore = getStored(STORAGE_KEY_USER_VOTES, {});
  const listVotes = voteStore[tierListId] || {};
  const currentVote = listVotes[userId] || 0;

  let delta = 0;
  if (currentVote === direction) {
    // Se clicar no mesmo voto, cancela o voto
    delta = -direction;
    delete listVotes[userId];
  } else if (currentVote !== 0) {
    // Inverte o voto (ex: de -1 para +1 => diferença de +2)
    delta = direction * 2;
    listVotes[userId] = direction;
  } else {
    // Novo voto
    delta = direction;
    listVotes[userId] = direction;
  }

  voteStore[tierListId] = listVotes;
  setStored(STORAGE_KEY_USER_VOTES, voteStore);

  // Atualiza a tier list na base de dados
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === tierListId);
  if (target) {
    target.votes = Math.max(0, (target.votes || 0) + delta);
    setStored(STORAGE_KEY_TIERLISTS, stored);
  }

  return {
    votes: target ? target.votes : 0,
    userVote: listVotes[userId] || 0,
  };
}

export function getUserVoteForList(tierListId, userId = "anonymous") {
  const voteStore = getStored(STORAGE_KEY_USER_VOTES, {});
  return voteStore[tierListId]?.[userId] || 0;
}

// Incrementar contagem de visualizações
export async function incrementViews(id) {
  const sessionKey = `viewed_${id}`;
  if (sessionStorage.getItem(sessionKey)) return; // Evita contagem infinita por recarregamento da página

  sessionStorage.setItem(sessionKey, "1");
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === id);
  if (target) {
    target.views = (target.views || 0) + 1;
    setStored(STORAGE_KEY_TIERLISTS, stored);
  }
}

// -------------------------------------------------------------
// PESQUISA GLOBAL OMNI-SEARCH (UTILIZADORES E TIER LISTS)
// -------------------------------------------------------------
export function searchOmni(queryText) {
  if (!queryText || queryText.trim().length < 2) {
    return { creators: [], tierlists: [] };
  }

  const q = queryText.toLowerCase().trim().replace(/^#/, "");

  // Pesquisa criadores
  const users = getAllUsers();
  const creators = users
    .filter(
      (u) =>
        (u.handle && u.handle.toLowerCase().includes(q)) ||
        (u.displayName && u.displayName.toLowerCase().includes(q))
    )
    .slice(0, 5);

  // Pesquisa tier lists públicas
  const lists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const tierlists = lists
    .filter((l) => {
      if (l.visibility === "private") return false;
      const titleMatch = l.title && l.title.toLowerCase().includes(q);
      const catMatch = l.category && l.category.toLowerCase().includes(q);
      const creatorMatch = l.creator && l.creator.toLowerCase().includes(q);
      return titleMatch || catMatch || creatorMatch;
    })
    .slice(0, 5);

  return { creators, tierlists };
}

// -------------------------------------------------------------
// COMENTÁRIOS REAIS
// -------------------------------------------------------------
export function getCommentsForTierList(tierListId) {
  const all = getStored(STORAGE_KEY_COMMENTS, {});
  return all[tierListId] || [];
}

export function addCommentToTierList(tierListId, { userName, userAvatar, text }) {
  const all = getStored(STORAGE_KEY_COMMENTS, {});
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
  setStored(STORAGE_KEY_COMMENTS, all);

  // Atualiza contador de comentários na lista
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === tierListId);
  if (target) {
    target.commentsCount = (target.commentsCount || 0) + 1;
    setStored(STORAGE_KEY_TIERLISTS, stored);
  }

  return newComment;
}

// -------------------------------------------------------------
// PESQUISA NO CATÁLOGO REAL + WIKIMEDIA API
// -------------------------------------------------------------
export async function searchCatalog(queryText, category = null, lang = "pt") {
  if (!queryText || queryText.trim().length === 0) {
    let results = REAL_ITEMS;
    if (category && category !== "All") {
      results = results.filter((item) => item.category === category);
    }
    return results.slice(0, 12);
  }

  const q = queryText.toLowerCase().trim();

  let localMatches = REAL_ITEMS.filter((item) => {
    const matchName = item.name.toLowerCase().includes(q);
    const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
    const matchCat = category && category !== "All" ? item.category === category : true;
    return (matchName || matchTags) && matchCat;
  });

  if (localMatches.length < 5) {
    try {
      const externalResults = await searchWikimediaEntities(queryText, lang);
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
