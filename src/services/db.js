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
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { REAL_ITEMS, SEED_TIERLISTS, SEED_USERS } from "../data/realCatalog";
import { BASE_CATEGORIES } from "../data/categoriesData";
import { searchWikimediaEntities } from "./wikipediaApi";

const STORAGE_KEY_TIERLISTS = "tierforge_real_tierlists";
const STORAGE_KEY_USERS = "tierforge_real_users";
const STORAGE_KEY_CATEGORIES = "tierforge_real_categories";
const STORAGE_KEY_COMMENTS = "tierforge_real_comments";
const STORAGE_KEY_USER_VOTES = "tierforge_antiabuse_votes";

// IDs de listas e utilizadores de teste anteriores a purgar totalmente
const SEED_TIERLIST_IDS = new Set([
  "tl-football-goat-2026",
  "tl-rpg-masterpieces",
  "tl-cinema-nolan",
  "tl-tvshows-goats",
]);
const SEED_USER_UIDS = new Set([
  "user-rodrigo",
  "user-alexandre",
  "user-beatriz",
  "user-marco",
]);

function purgeSeedData() {
  try {
    const rawLists = localStorage.getItem(STORAGE_KEY_TIERLISTS);
    if (rawLists) {
      const parsed = JSON.parse(rawLists);
      const cleanLists = parsed.filter((l) => !SEED_TIERLIST_IDS.has(l.id));
      if (cleanLists.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_TIERLISTS, JSON.stringify(cleanLists));
      }
    }

    const rawUsers = localStorage.getItem(STORAGE_KEY_USERS);
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      const cleanUsers = parsedUsers.filter((u) => !SEED_USER_UIDS.has(u.uid));
      if (cleanUsers.length !== parsedUsers.length) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(cleanUsers));
      }
    }
  } catch (e) {
    console.warn("Notice during seed cleanup:", e);
  }
}

if (typeof window !== "undefined") {
  purgeSeedData();
}

// Helper de persistência segura com fallback
function getStored(key, initialFallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialFallback));
      return initialFallback;
    }
    const parsed = JSON.parse(raw);
    if (key === STORAGE_KEY_TIERLISTS) {
      return parsed.filter((l) => !SEED_TIERLIST_IDS.has(l.id));
    }
    if (key === STORAGE_KEY_USERS) {
      return parsed.filter((u) => !SEED_USER_UIDS.has(u.uid));
    }
    return parsed;
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
  const users = getStored(STORAGE_KEY_USERS, SEED_USERS);
  return users.filter((u) => !SEED_USER_UIDS.has(u.uid));
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

export function getUserFollowers(targetUid, currentUid = null) {
  if (!targetUid) return [];
  const users = getAllUsers();
  const targetUser = users.find((u) => u.uid === targetUid);
  if (!targetUser) return [];

  const followerIds = new Set(targetUser.followers || []);
  const currentUser = currentUid ? users.find((u) => u.uid === currentUid) : null;
  const currentFollowingIds = new Set(currentUser?.following || []);

  const result = [];
  for (const u of users) {
    if (followerIds.has(u.uid)) {
      result.push({
        uid: u.uid,
        handle: u.handle || `user_${u.uid.slice(0, 6)}`,
        displayName: u.displayName || "Utilizador",
        avatar: u.avatar || "",
        bio: u.bio || "",
        badges: u.badges || [],
        creatorXp: u.creatorXp || 0,
        followersCount: u.followers?.length || 0,
        followingCount: u.following?.length || 0,
        isFollowing: currentFollowingIds.has(u.uid),
        isSelf: currentUid === u.uid,
      });
    }
  }
  return result;
}

export function getUserFollowing(targetUid, currentUid = null) {
  if (!targetUid) return [];
  const users = getAllUsers();
  const targetUser = users.find((u) => u.uid === targetUid);
  if (!targetUser) return [];

  const followingIds = new Set(targetUser.following || []);
  const currentUser = currentUid ? users.find((u) => u.uid === currentUid) : null;
  const currentFollowingIds = new Set(currentUser?.following || []);

  const result = [];
  for (const u of users) {
    if (followingIds.has(u.uid)) {
      result.push({
        uid: u.uid,
        handle: u.handle || `user_${u.uid.slice(0, 6)}`,
        displayName: u.displayName || "Utilizador",
        avatar: u.avatar || "",
        bio: u.bio || "",
        badges: u.badges || [],
        creatorXp: u.creatorXp || 0,
        followersCount: u.followers?.length || 0,
        followingCount: u.following?.length || 0,
        isFollowing: currentFollowingIds.has(u.uid),
        isSelf: currentUid === u.uid,
      });
    }
  }
  return result;
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
export function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategories() {
  const stored = getStored(STORAGE_KEY_CATEGORIES, BASE_CATEGORIES);
  const existingIds = new Set(stored.map((c) => c.id || c.slug));
  const merged = [...stored];
  for (const baseCat of BASE_CATEGORIES) {
    if (!existingIds.has(baseCat.id) && !existingIds.has(baseCat.slug)) {
      merged.push(baseCat);
      existingIds.add(baseCat.id);
    }
  }

  const lists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);

  // Calcula a contagem estritamente real de tier lists públicas
  return merged.map((cat) => {
    const realCount = lists.filter((l) => {
      const isMatch =
        l.category === cat.id ||
        l.category === cat.slug ||
        (l.category && l.category.toLowerCase() === (cat.name || "").toLowerCase());
      return isMatch && (l.visibility === "public" || !l.visibility);
    }).length;

    return {
      ...cat,
      count: realCount,
    };
  });
}

// Categorias populares calculadas estritamente com base na atividade real de listas e votos
export function getPopularCategories(limit = 6) {
  const categories = getCategories();
  const lists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);

  const populated = categories
    .map((cat) => {
      const catLists = lists.filter((l) => {
        const isMatch =
          l.category === cat.id ||
          l.category === cat.slug ||
          (l.category && l.category.toLowerCase() === (cat.name || "").toLowerCase());
        return isMatch && (l.visibility === "public" || !l.visibility);
      });

      const totalVotes = catLists.reduce((acc, l) => acc + (l.votes || 0), 0);
      const totalViews = catLists.reduce((acc, l) => acc + (l.views || 0), 0);
      const score = catLists.length * 20 + totalVotes * 5 + totalViews;

      return {
        ...cat,
        tierListsCount: catLists.length,
        totalVotes,
        popularityScore: score,
      };
    })
    .filter((c) => c.tierListsCount > 0) // REGRA ESTRITA: só é popular se houver listas reais criadas
    .sort((a, b) => b.popularityScore - a.popularityScore);

  return populated.slice(0, limit);
}

export function searchCategories(queryText) {
  const all = getCategories();
  if (!queryText || !queryText.trim()) return all;
  const q = queryText.toLowerCase().trim();

  return all.filter((c) => {
    const nameMatch = (c.name || "").toLowerCase().includes(q);
    const slugMatch = (c.slug || "").toLowerCase().includes(q);
    const descMatch = (c.description || "").toLowerCase().includes(q);
    const subMatch = (c.subcategories || []).some((sub) =>
      (typeof sub === "string" ? sub : sub.name || "").toLowerCase().includes(q)
    );
    return nameMatch || slugMatch || descMatch || subMatch;
  });
}

export function validateCategoryName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "O nome da categoria é obrigatório." };
  }
  const clean = name.trim();
  if (clean.length < 3) {
    return { valid: false, error: "O nome da categoria deve ter pelo menos 3 caracteres." };
  }
  if (clean.length > 45) {
    return { valid: false, error: "O nome da categoria não pode ter mais de 45 caracteres." };
  }

  const slug = slugify(clean);
  if (!slug) {
    return { valid: false, error: "O nome introduzido não é válido." };
  }

  const existing = getCategories();
  const isDuplicate = existing.some(
    (c) =>
      c.id === slug ||
      c.slug === slug ||
      (c.name || "").toLowerCase() === clean.toLowerCase()
  );

  if (isDuplicate) {
    return {
      valid: false,
      error: `Já existe uma categoria semelhante com o nome "${clean}".`,
    };
  }

  return { valid: true, slug, name: clean };
}

export async function createCustomCategory({
  name,
  description = "",
  icon = "Sparkles",
  color = "#7C5CFF",
  subcategories = [],
  createdBy = null,
}) {
  const validation = validateCategoryName(name);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const newCategory = {
    id: validation.slug,
    name: validation.name,
    slug: validation.slug,
    description: description.trim() || `Tier Lists e rankings da comunidade sobre ${validation.name}.`,
    icon,
    color,
    subcategories: Array.isArray(subcategories)
      ? subcategories.filter(Boolean)
      : [],
    isActive: true,
    isCustom: true,
    createdBy: createdBy || "community",
    createdAt: new Date().toISOString(),
    count: 0,
  };

  const stored = getStored(STORAGE_KEY_CATEGORIES, BASE_CATEGORIES);
  stored.push(newCategory);
  setStored(STORAGE_KEY_CATEGORIES, stored);

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, "categories", newCategory.id);
      await setDoc(ref, {
        ...newCategory,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Firestore category save notice:", e);
    }
  }

  return newCategory;
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
