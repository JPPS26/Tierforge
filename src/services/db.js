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
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { REAL_ITEMS, SEED_TIERLISTS, SEED_USERS } from "../data/realCatalog";
import { BASE_CATEGORIES } from "../data/categoriesData";
import { getApiCatalog, slugifyCategory } from "./categoriesApi";
import { searchWikimediaEntities } from "./wikipediaApi";
import { checkContentSafety, extractMentions } from "./safetyFilter";

const STORAGE_KEY_TIERLISTS = "tierforge_real_tierlists";
const STORAGE_KEY_USERS = "tierforge_real_users";
const STORAGE_KEY_CATEGORIES = "tierforge_real_categories";
const STORAGE_KEY_COMMENTS = "tierforge_real_comments";
const STORAGE_KEY_USER_VOTES = "tierforge_antiabuse_votes";
const STORAGE_KEY_NOTIFICATIONS = "tierforge_real_notifications";

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

    // Notificação de novo seguidor
    createNotification({
      recipientUid: targetUid,
      senderUid: currentUid,
      senderName: currentUser.displayName || "Um criador",
      senderHandle: currentUser.handle || "",
      senderAvatar: currentUser.avatar || "",
      type: "new_follower",
      text: "começou a seguir o teu perfil",
    });
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
  const baseCatalog = getApiCatalog();
  const stored = getStored(STORAGE_KEY_CATEGORIES, baseCatalog);
  const existingIds = new Set(stored.map((c) => c.id || c.slug));
  const merged = [...stored];
  for (const baseCat of baseCatalog) {
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

// Retorna exclusivamente categorias que tenham pelo menos 1 Tier List criada
export function getActiveCategories() {
  return getCategories().filter((c) => (c.count || 0) > 0);
}

export function getGuestClientId() {
  if (typeof window === "undefined") return "guest_user";
  let guestId = localStorage.getItem("tierforge_guest_client_id");
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("tierforge_guest_client_id", guestId);
  }
  return guestId;
}

// Categorias populares calculadas estritamente com base na atividade real de listas e votos
// REGRA ESTRITA: Só aparecem categorias que tenham pelo menos 1 Tier List criada
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
  imageUrl = null,
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
    imageUrl,
    subcategories: Array.isArray(subcategories)
      ? subcategories.filter(Boolean)
      : [],
    isActive: true,
    isCustom: true,
    createdBy: createdBy || "community",
    createdAt: new Date().toISOString(),
    count: 0,
  };

  const stored = getStored(STORAGE_KEY_CATEGORIES, getApiCatalog());
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

export async function saveCategoryWithApiData(categoryData) {
  if (!categoryData || !categoryData.name) return null;
  const slug = categoryData.slug || slugifyCategory(categoryData.name);
  const baseCatalog = getApiCatalog();
  const stored = getStored(STORAGE_KEY_CATEGORIES, baseCatalog);

  const existingIdx = stored.findIndex((c) => c.id === slug || c.slug === slug);
  const enriched = {
    id: slug,
    slug,
    name: categoryData.name,
    description: categoryData.description || `Tier Lists e rankings sobre ${categoryData.name}.`,
    imageUrl: categoryData.imageUrl || null,
    subcategories: Array.isArray(categoryData.subcategories) ? categoryData.subcategories : [],
    color: categoryData.color || "#7C5CFF",
    icon: categoryData.icon || "Sparkles",
    domain: categoryData.domain || "general",
    isActive: true,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    stored[existingIdx] = { ...stored[existingIdx], ...enriched };
  } else {
    stored.push(enriched);
  }

  setStored(STORAGE_KEY_CATEGORIES, stored);

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, "categories", slug);
      await setDoc(ref, enriched, { merge: true });
    } catch (e) {
      console.warn("Notice saving category to Firestore:", e);
    }
  }

  return enriched;
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

  // Se o Firebase Firestore estiver ativo, pesquisa também na cloud
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, "tierlists"),
        where("visibility", "==", "public")
      );
      const snap = await getDocs(q);
      const cloudLists = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      const localIds = new Set(lists.map((l) => l.id));
      cloudLists.forEach((cl) => {
        if (!localIds.has(cl.id)) {
          lists.push(cl);
        }
      });
    } catch (e) {
      console.warn("Notice reading Firestore tierlists:", e);
    }
  }

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
  let stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  let target = stored.find((l) => l.id === id);

  if (!target && isFirebaseConfigured()) {
    try {
      const ref = doc(db, "tierlists", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        target = { ...snap.data(), id: snap.id };
        stored.push(target);
        setStored(STORAGE_KEY_TIERLISTS, stored);
      }
    } catch (e) {
      console.warn("Notice reading Firestore tierlist by id:", e);
    }
  }

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
  parentTemplateId = null,
  parentTemplateTitle = "",
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
    parentTemplateId,
    parentTemplateTitle,
    remixCount: 0,
  };

  const existing = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  
  // Se for um remix, incrementa a contagem de derivações no template de origem
  if (parentTemplateId) {
    const parentIndex = existing.findIndex((l) => l.id === parentTemplateId);
    if (parentIndex !== -1) {
      const parent = existing[parentIndex];
      parent.remixCount = (parent.remixCount || 0) + 1;

      // Notificação para o autor do template original
      if (parent.ownerId && parent.ownerId !== uid && parent.ownerId !== "anon") {
        createNotification({
          recipientUid: parent.ownerId,
          senderUid: uid,
          senderName: creatorName,
          senderHandle: creatorHandle,
          senderAvatar: creatorAvatar,
          type: "remix",
          tierListId: newId,
          tierListTitle: parent.title,
          text: "criou uma versão da tua Tier List",
        });
      }
    }
  }

  setStored(STORAGE_KEY_TIERLISTS, [record, ...existing]);

  // Regista o ID na lista de criações locais para permitir edição/eliminação mesmo como anónimo
  const myLists = getStored("tierforge_created_lists", []);
  if (!myLists.includes(newId)) {
    myLists.push(newId);
    setStored("tierforge_created_lists", myLists);
  }

  if (isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, "tierlists", newId), {
        ...record,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Could not save to Firestore, local state preserved:", e);
    }
  }

  return record;
}

// Obter derivações/remixes de um template específico
export function getRemixesForTemplate(templateId) {
  if (!templateId) return [];
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  return stored.filter(
    (l) => l.parentTemplateId === templateId && (l.visibility === "public" || !l.visibility)
  );
}

// Calcular consenso médio global da comunidade
export function calculateCommunityConsensus(templateId) {
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const template = stored.find((l) => l.id === templateId);
  if (!template) return null;

  const remixes = stored.filter(
    (l) => l.parentTemplateId === templateId && (l.visibility === "public" || !l.visibility)
  );

  const submissions = [template, ...remixes];
  const tiers = template.tiers || [];
  const items = template.items || [];
  const numTiers = tiers.length;

  if (numTiers === 0 || items.length === 0) {
    return { tiers, placements: {}, totalSubmissions: submissions.length, items };
  }

  // Mapeia cada tier a um valor de pontuação (Top Tier = maior pontuação)
  const tierScores = {};
  tiers.forEach((t, idx) => {
    tierScores[t.id] = numTiers - idx; // ex: 5, 4, 3, 2, 1
  });

  const consensusPlacements = {};

  items.forEach((item) => {
    let totalScore = 0;
    let placedCount = 0;

    submissions.forEach((sub) => {
      const placedTierId = sub.placements?.[item.id];
      if (placedTierId && tierScores[placedTierId] !== undefined) {
        totalScore += tierScores[placedTierId];
        placedCount += 1;
      }
    });

    if (placedCount > 0) {
      const avgScore = totalScore / placedCount;
      // Converte a pontuação média de volta ao índice de tier mais próximo
      const calculatedTierIdx = Math.max(
        0,
        Math.min(numTiers - 1, Math.round(numTiers - avgScore))
      );
      consensusPlacements[item.id] = tiers[calculatedTierIdx].id;
    }
  });

  return {
    tiers,
    placements: consensusPlacements,
    totalSubmissions: submissions.length,
    items,
  };
}

// Verifica se o utilizador tem permissões de edição/eliminação sobre uma Tier List
export function canEditTierList(tierList, currentUid = null) {
  if (!tierList) return false;
  // Se o utilizador tiver sessão iniciada e for o dono
  if (currentUid && tierList.ownerId === currentUid) return true;
  // Se tiver sido criada neste navegador localmente (mesmo como anónimo)
  const myLists = getStored("tierforge_created_lists", []);
  if (myLists.includes(tierList.id)) return true;
  return false;
}

// Atualizar uma Tier List existente
export async function updateTierList(id, uid, updates = {}) {
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const index = stored.findIndex((l) => l.id === id);
  if (index === -1) {
    throw new Error("Tier List não encontrada.");
  }

  const existing = stored[index];
  if (!canEditTierList(existing, uid)) {
    throw new Error("Não tens permissão para editar esta Tier List.");
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  stored[index] = updated;
  setStored(STORAGE_KEY_TIERLISTS, stored);

  if (isFirebaseConfigured() && existing.ownerId !== "anon") {
    try {
      const ref = doc(db, "tierlists", id);
      await setDoc(ref, updated, { merge: true });
    } catch (e) {
      console.warn("Could not update Firestore document:", e);
    }
  }

  return updated;
}

// Eliminar uma Tier List
export async function deleteTierList(id, uid) {
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const existing = stored.find((l) => l.id === id);
  if (!existing) {
    throw new Error("Tier List não encontrada.");
  }

  if (!canEditTierList(existing, uid)) {
    throw new Error("Não tens permissão para eliminar esta Tier List.");
  }

  // Remove da lista
  const filtered = stored.filter((l) => l.id !== id);
  setStored(STORAGE_KEY_TIERLISTS, filtered);

  // Remove dos meus IDs criados
  const myLists = getStored("tierforge_created_lists", []);
  setStored(
    "tierforge_created_lists",
    myLists.filter((x) => x !== id)
  );

  // Remove comentários e votos associados
  const comments = getStored(STORAGE_KEY_COMMENTS, {});
  delete comments[id];
  setStored(STORAGE_KEY_COMMENTS, comments);

  const votes = getStored(STORAGE_KEY_USER_VOTES, {});
  delete votes[id];
  setStored(STORAGE_KEY_USER_VOTES, votes);

  if (isFirebaseConfigured() && existing.ownerId !== "anon") {
    try {
      const ref = doc(db, "tierlists", id);
      await deleteDoc(ref);
    } catch (e) {
      console.warn("Could not delete from Firestore:", e);
    }
  }

  return true;
}

// Eliminar permanentemente a conta e todos os dados associados a um utilizador
export async function deleteUserAccountAndData(uid) {
  if (!uid) return false;

  // 1. Obter todas as tier lists
  const storedLists = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const userLists = storedLists.filter((l) => l.ownerId === uid);
  const userListIds = new Set(userLists.map((l) => l.id));

  // 2. Apagar comentários e votos associados às tier lists do utilizador
  const allComments = getStored(STORAGE_KEY_COMMENTS, {});
  const allVotes = getStored(STORAGE_KEY_USER_VOTES, {});

  // Remove entradas diretas das listas do utilizador
  userListIds.forEach((listId) => {
    delete allComments[listId];
    delete allVotes[listId];
  });

  // 3. Remover votos que este utilizador fez nas listas de OUTROS criadores e reajustar saldo
  // e remover comentários que este utilizador fez nas listas de outros criadores
  const remainingLists = storedLists.filter((l) => l.ownerId !== uid);

  remainingLists.forEach((l) => {
    // Votos do utilizador nesta lista
    if (allVotes[l.id] && allVotes[l.id][uid] !== undefined) {
      const userVote = allVotes[l.id][uid];
      l.votes = (l.votes || 0) - userVote;
      delete allVotes[l.id][uid];
    }

    // Comentários do utilizador nesta lista
    if (allComments[l.id]) {
      const beforeCount = allComments[l.id].length;
      allComments[l.id] = allComments[l.id].filter((c) => c.userUid !== uid);
      if (allComments[l.id].length !== beforeCount) {
        l.commentsCount = Math.max(0, (l.commentsCount || 0) - (beforeCount - allComments[l.id].length));
      }
    }
  });

  // Guardar listas, comentários e votos atualizados
  setStored(STORAGE_KEY_TIERLISTS, remainingLists);
  setStored(STORAGE_KEY_COMMENTS, allComments);
  setStored(STORAGE_KEY_USER_VOTES, allVotes);

  // 4. Remover IDs das listas criadas deste navegador
  const myCreatedLists = getStored("tierforge_created_lists", []);
  const cleanCreatedLists = myCreatedLists.filter((id) => !userListIds.has(id));
  setStored("tierforge_created_lists", cleanCreatedLists);

  // 5. Remover utilizador de STORAGE_KEY_USERS e das relações de seguidores/seguindo
  const allUsers = getStored(STORAGE_KEY_USERS, SEED_USERS);
  const updatedUsers = allUsers
    .filter((u) => u.uid !== uid)
    .map((u) => ({
      ...u,
      followers: (u.followers || []).filter((f) => f !== uid),
      following: (u.following || []).filter((f) => f !== uid),
    }));
  setStored(STORAGE_KEY_USERS, updatedUsers);

  // 6. Apagar documentos do Firestore (se configurado)
  if (isFirebaseConfigured()) {
    try {
      // Apagar utilizador
      const userRef = doc(db, "users", uid);
      await deleteDoc(userRef);

      // Apagar cada tier list do utilizador no Firestore
      for (const listId of userListIds) {
        try {
          const listRef = doc(db, "tierlists", listId);
          await deleteDoc(listRef);
        } catch (e) {
          console.warn("Could not delete tierlist from Firestore:", listId, e);
        }
      }
    } catch (e) {
      console.warn("Could not delete user document from Firestore:", e);
    }
  }

  return true;
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

    // Notificação de gosto na Tier List (se for voto positivo e de outro utilizador)
    if (
      direction === 1 &&
      listVotes[userId] === 1 &&
      target.ownerId &&
      target.ownerId !== userId &&
      target.ownerId !== "anon"
    ) {
      const voter = getUserByUid(userId);
      createNotification({
        recipientUid: target.ownerId,
        senderUid: userId,
        senderName: voter?.displayName || "Um criador",
        senderHandle: voter?.handle || "",
        senderAvatar: voter?.avatar || "",
        type: "list_like",
        tierListId,
        tierListTitle: target.title,
        text: "gostou da tua Tier List",
      });
    }
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

// Incrementar contagem de visualizações com marcos festivos
export async function incrementViews(id) {
  const sessionKey = `viewed_${id}`;
  if (sessionStorage.getItem(sessionKey)) return; // Evita contagem infinita por recarregamento da página

  sessionStorage.setItem(sessionKey, "1");
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === id);
  if (target) {
    const newViews = (target.views || 0) + 1;
    target.views = newViews;
    setStored(STORAGE_KEY_TIERLISTS, stored);

    // Marcos de visualizações para evitar spam individual
    const VIEW_MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    if (
      target.ownerId &&
      target.ownerId !== "anon" &&
      VIEW_MILESTONES.includes(newViews)
    ) {
      createNotification({
        recipientUid: target.ownerId,
        senderUid: "system",
        senderName: "TierForge",
        senderHandle: "tierforge",
        senderAvatar: "",
        type: "view_milestone",
        tierListId: target.id,
        tierListTitle: target.title,
        text: `atingiu o marco de ${newViews} visualizações! 🎉`,
      });
    }
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
// COMENTÁRIOS REAIS, RESPOSTAS E REAÇÕES
// -------------------------------------------------------------
function normalizeComment(c) {
  return {
    ...c,
    likes: Array.isArray(c.likes) ? c.likes : [],
    dislikes: Array.isArray(c.dislikes) ? c.dislikes : [],
    replies: Array.isArray(c.replies)
      ? c.replies.map((r) => ({
          ...r,
          likes: Array.isArray(r.likes) ? r.likes : [],
          dislikes: Array.isArray(r.dislikes) ? r.dislikes : [],
        }))
      : [],
  };
}

export function getCommentsForTierList(tierListId) {
  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const list = all[tierListId] || [];
  return list.map(normalizeComment);
}

export function addCommentToTierList(
  tierListId,
  { userName, userHandle, userAvatar, text, userUid, tierListOwnerId, tierListTitle }
) {
  const safety = checkContentSafety(text);
  if (!safety.isSafe) {
    throw new Error(safety.reason || "Conteúdo não cumpre as regras da comunidade.");
  }

  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const listComments = (all[tierListId] || []).map(normalizeComment);

  const newComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    tierListId,
    userUid: userUid || null,
    userName: userName || "Utilizador",
    userHandle: userHandle || "",
    userAvatar: userAvatar || "",
    text: text.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: null,
    likes: [],
    dislikes: [],
    replies: [],
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

  // Notificação para o dono da lista (se diferente de quem comentou)
  if (tierListOwnerId && tierListOwnerId !== userUid && tierListOwnerId !== "anon") {
    createNotification({
      recipientUid: tierListOwnerId,
      senderUid: userUid,
      senderName: userName,
      senderHandle: userHandle,
      senderAvatar: userAvatar,
      type: "comment",
      tierListId,
      tierListTitle: tierListTitle || target?.title || "Tier List",
      commentId: newComment.id,
      text: "comentou na tua Tier List",
    });
  }

  // Notificações para menções @handle
  const mentions = extractMentions(text);
  mentions.forEach((h) => {
    const mentioned = getUserByHandle(h);
    if (mentioned && mentioned.uid !== userUid && mentioned.uid !== tierListOwnerId) {
      createNotification({
        recipientUid: mentioned.uid,
        senderUid: userUid,
        senderName: userName,
        senderHandle: userHandle,
        senderAvatar: userAvatar,
        type: "mention",
        tierListId,
        tierListTitle: tierListTitle || target?.title || "Tier List",
        commentId: newComment.id,
        text: "mencionou-te num comentário",
      });
    }
  });

  return newComment;
}

export function updateComment(tierListId, commentId, newText, uid) {
  const safety = checkContentSafety(newText);
  if (!safety.isSafe) {
    throw new Error(safety.reason || "Conteúdo não cumpre as regras da comunidade.");
  }

  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const listComments = (all[tierListId] || []).map(normalizeComment);
  const comment = listComments.find((c) => c.id === commentId);

  if (!comment) throw new Error("Comentário não encontrado.");
  if (comment.userUid !== uid) throw new Error("Não tens permissão para editar este comentário.");

  comment.text = newText.trim();
  comment.updatedAt = new Date().toISOString();

  all[tierListId] = listComments;
  setStored(STORAGE_KEY_COMMENTS, all);
  return comment;
}

export function deleteComment(tierListId, commentId, uid, tierListOwnerId) {
  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const listComments = (all[tierListId] || []).map(normalizeComment);
  const comment = listComments.find((c) => c.id === commentId);

  if (!comment) throw new Error("Comentário não encontrado.");
  // Permite eliminar se for o autor do comentário OU o dono da tier list
  const isAuthor = comment.userUid && comment.userUid === uid;
  const isOwner = tierListOwnerId && tierListOwnerId === uid;
  if (!isAuthor && !isOwner) {
    throw new Error("Não tens permissão para eliminar este comentário.");
  }

  const removedRepliesCount = comment.replies?.length || 0;
  const totalRemoved = 1 + removedRepliesCount;

  all[tierListId] = listComments.filter((c) => c.id !== commentId);
  setStored(STORAGE_KEY_COMMENTS, all);

  // Atualiza contagem na lista
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === tierListId);
  if (target) {
    target.commentsCount = Math.max(0, (target.commentsCount || 0) - totalRemoved);
    setStored(STORAGE_KEY_TIERLISTS, stored);
  }

  return true;
}

export function addReplyToComment(
  tierListId,
  parentCommentId,
  { userUid, userName, userHandle, userAvatar, text, tierListTitle }
) {
  const safety = checkContentSafety(text);
  if (!safety.isSafe) {
    throw new Error(safety.reason || "Conteúdo não cumpre as regras da comunidade.");
  }

  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const listComments = (all[tierListId] || []).map(normalizeComment);
  const parent = listComments.find((c) => c.id === parentCommentId);

  if (!parent) throw new Error("Comentário original não encontrado.");

  const newReply = {
    id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    commentId: parentCommentId,
    userUid: userUid || null,
    userName: userName || "Utilizador",
    userHandle: userHandle || "",
    userAvatar: userAvatar || "",
    text: text.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: null,
    likes: [],
    dislikes: [],
  };

  parent.replies = parent.replies || [];
  parent.replies.push(newReply);

  all[tierListId] = listComments;
  setStored(STORAGE_KEY_COMMENTS, all);

  // Atualiza contagem na lista
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === tierListId);
  if (target) {
    target.commentsCount = (target.commentsCount || 0) + 1;
    setStored(STORAGE_KEY_TIERLISTS, stored);
  }

  // Notificação para o autor do comentário pai
  if (parent.userUid && parent.userUid !== userUid) {
    createNotification({
      recipientUid: parent.userUid,
      senderUid: userUid,
      senderName: userName,
      senderHandle: userHandle,
      senderAvatar: userAvatar,
      type: "reply",
      tierListId,
      tierListTitle: tierListTitle || target?.title || "Tier List",
      commentId: newReply.id,
      text: "respondeu ao teu comentário",
    });
  }

  // Notificações para menções @handle
  const mentions = extractMentions(text);
  mentions.forEach((h) => {
    const mentioned = getUserByHandle(h);
    if (mentioned && mentioned.uid !== userUid && mentioned.uid !== parent.userUid) {
      createNotification({
        recipientUid: mentioned.uid,
        senderUid: userUid,
        senderName: userName,
        senderHandle: userHandle,
        senderAvatar: userAvatar,
        type: "mention",
        tierListId,
        tierListTitle: tierListTitle || target?.title || "Tier List",
        commentId: newReply.id,
        text: "mencionou-te numa resposta",
      });
    }
  });

  return newReply;
}

export function updateReply(tierListId, parentCommentId, replyId, newText, uid) {
  const safety = checkContentSafety(newText);
  if (!safety.isSafe) {
    throw new Error(safety.reason || "Conteúdo não cumpre as regras da comunidade.");
  }

  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const listComments = (all[tierListId] || []).map(normalizeComment);
  const parent = listComments.find((c) => c.id === parentCommentId);
  if (!parent) throw new Error("Comentário original não encontrado.");

  const reply = parent.replies?.find((r) => r.id === replyId);
  if (!reply) throw new Error("Resposta não encontrada.");
  if (reply.userUid !== uid) throw new Error("Não tens permissão para editar esta resposta.");

  reply.text = newText.trim();
  reply.updatedAt = new Date().toISOString();

  all[tierListId] = listComments;
  setStored(STORAGE_KEY_COMMENTS, all);
  return reply;
}

export function deleteReply(tierListId, parentCommentId, replyId, uid, tierListOwnerId) {
  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const listComments = (all[tierListId] || []).map(normalizeComment);
  const parent = listComments.find((c) => c.id === parentCommentId);
  if (!parent) throw new Error("Comentário original não encontrado.");

  const reply = parent.replies?.find((r) => r.id === replyId);
  if (!reply) throw new Error("Resposta não encontrada.");

  const isAuthor = reply.userUid && reply.userUid === uid;
  const isOwner = tierListOwnerId && tierListOwnerId === uid;
  if (!isAuthor && !isOwner) {
    throw new Error("Não tens permissão para eliminar esta resposta.");
  }

  parent.replies = parent.replies.filter((r) => r.id !== replyId);
  all[tierListId] = listComments;
  setStored(STORAGE_KEY_COMMENTS, all);

  // Atualiza contagem na lista
  const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
  const target = stored.find((l) => l.id === tierListId);
  if (target) {
    target.commentsCount = Math.max(0, (target.commentsCount || 0) - 1);
    setStored(STORAGE_KEY_TIERLISTS, stored);
  }

  return true;
}

export function reactToComment(tierListId, commentId, replyId = null, uid, reactionType = "like") {
  if (!uid) return { likes: [], dislikes: [] };

  const all = getStored(STORAGE_KEY_COMMENTS, {});
  const listComments = (all[tierListId] || []).map(normalizeComment);
  const parent = listComments.find((c) => c.id === commentId);
  if (!parent) return { likes: [], dislikes: [] };

  let target = parent;
  if (replyId) {
    target = parent.replies?.find((r) => r.id === replyId);
    if (!target) return { likes: [], dislikes: [] };
  }

  target.likes = Array.isArray(target.likes) ? target.likes : [];
  target.dislikes = Array.isArray(target.dislikes) ? target.dislikes : [];

  if (reactionType === "like") {
    if (target.likes.includes(uid)) {
      // Toggle off
      target.likes = target.likes.filter((u) => u !== uid);
    } else {
      target.likes.push(uid);
      target.dislikes = target.dislikes.filter((u) => u !== uid);

      // Notificação de gosto no comentário (se for utilizador diferente)
      if (target.userUid && target.userUid !== uid && target.userUid !== "anon") {
        const voter = getUserByUid(uid);
        const stored = getStored(STORAGE_KEY_TIERLISTS, SEED_TIERLISTS);
        const tl = stored.find((l) => l.id === tierListId);
        createNotification({
          recipientUid: target.userUid,
          senderUid: uid,
          senderName: voter?.displayName || "Um utilizador",
          senderHandle: voter?.handle || "",
          senderAvatar: voter?.avatar || "",
          type: "comment_like",
          tierListId,
          tierListTitle: tl?.title || "Tier List",
          commentId: target.id,
          text: "gostou do teu comentário",
        });
      }
    }
  } else if (reactionType === "dislike") {
    if (target.dislikes.includes(uid)) {
      // Toggle off
      target.dislikes = target.dislikes.filter((u) => u !== uid);
    } else {
      target.dislikes.push(uid);
      target.likes = target.likes.filter((u) => u !== uid);
    }
  }

  all[tierListId] = listComments;
  setStored(STORAGE_KEY_COMMENTS, all);

  return {
    likes: target.likes,
    dislikes: target.dislikes,
  };
}

// -------------------------------------------------------------
// PREFERÊNCIAS E SILENCIAMENTO DE NOTIFICAÇÕES (MUTE & SNOOZE)
// -------------------------------------------------------------
export function getNotificationSettings(uid) {
  if (!uid) return null;
  const defaultSettings = {
    mutedUntil: null,
    mutedForever: false,
    soundEnabled: true,
    categories: {
      comments: true,
      replies: true,
      mentions: true,
      likes: true,
      followers: true,
      remixes: true,
      views: true,
    },
  };
  return getStored(`tierforge_notif_settings_${uid}`, defaultSettings);
}

export function updateNotificationSettings(uid, updates = {}) {
  if (!uid) return null;
  const current = getNotificationSettings(uid);
  const merged = {
    ...current,
    ...updates,
    categories: {
      ...current.categories,
      ...(updates.categories || {}),
    },
  };
  setStored(`tierforge_notif_settings_${uid}`, merged);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tierforge_notifications_updated", {
        detail: { recipientUid: uid },
      })
    );
  }
  return merged;
}

export function setNotificationMute(uid, { durationMs = null, forever = false }) {
  if (!uid) return null;
  const updates = {
    mutedForever: Boolean(forever),
    mutedUntil: forever ? null : durationMs ? Date.now() + durationMs : null,
  };
  return updateNotificationSettings(uid, updates);
}

export function unmuteNotifications(uid) {
  return updateNotificationSettings(uid, {
    mutedForever: false,
    mutedUntil: null,
  });
}

export function isUserMuted(uid) {
  if (!uid) return false;
  const settings = getNotificationSettings(uid);
  if (!settings) return false;
  if (settings.mutedForever) return true;
  if (settings.mutedUntil && settings.mutedUntil > Date.now()) return true;
  return false;
}

// -------------------------------------------------------------
// SISTEMA DE NOTIFICAÇÕES COM ANTI-SPAM E AGRUPAMENTO (BUNDLING)
// -------------------------------------------------------------
export function createNotification({
  recipientUid,
  senderUid,
  senderName,
  senderHandle,
  senderAvatar,
  type,
  tierListId,
  tierListTitle,
  commentId,
  text,
}) {
  if (!recipientUid || recipientUid === senderUid) return null;

  // 1. Verifica se o destinatário tem notificações silenciadas
  if (isUserMuted(recipientUid)) return null;

  // 2. Verifica as preferências de categoria do utilizador
  const settings = getNotificationSettings(recipientUid);
  if (settings?.categories) {
    const catMap = {
      comment: "comments",
      reply: "replies",
      mention: "mentions",
      list_like: "likes",
      comment_like: "likes",
      new_follower: "followers",
      remix: "remixes",
      view_milestone: "views",
    };
    const categoryKey = catMap[type];
    if (categoryKey && settings.categories[categoryKey] === false) {
      return null;
    }
  }

  const notifs = getStored(STORAGE_KEY_NOTIFICATIONS, []);

  // 3. Controlo Anti-Spam: Throttling de 10 minutos para likes repetidos do mesmo utilizador
  if (type === "list_like" || type === "comment_like") {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const duplicate = notifs.find(
      (n) =>
        n.recipientUid === recipientUid &&
        n.senderUid === senderUid &&
        n.type === type &&
        n.tierListId === tierListId &&
        n.commentId === commentId &&
        new Date(n.createdAt).getTime() > tenMinutesAgo
    );
    if (duplicate) {
      return null;
    }

    // 4. Agrupamento Inteligente (Notification Bundling):
    // Se já existe uma notificação não lida de like neste item, agrupa com contagem!
    const existingLikeNotifIndex = notifs.findIndex(
      (n) =>
        n.recipientUid === recipientUid &&
        n.type === type &&
        n.tierListId === tierListId &&
        n.commentId === commentId &&
        !n.read
    );

    if (existingLikeNotifIndex !== -1) {
      const existing = notifs[existingLikeNotifIndex];
      const count = (existing.bundledCount || 1) + 1;
      existing.bundledCount = count;
      existing.senderName = `${senderName}`;
      existing.text = `e mais ${count - 1} ${count - 1 === 1 ? "pessoa gostaram" : "pessoas gostaram"} ${
        type === "list_like" ? "da tua Tier List" : "do teu comentário"
      }`;
      existing.createdAt = new Date().toISOString();
      setStored(STORAGE_KEY_NOTIFICATIONS, notifs);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tierforge_notifications_updated", {
            detail: { recipientUid, newNotification: false },
          })
        );
      }
      return existing;
    }
  }

  const newNotif = {
    id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    recipientUid,
    senderUid: senderUid || "anon",
    senderName: senderName || "Utilizador",
    senderHandle: senderHandle || "",
    senderAvatar: senderAvatar || "",
    type: type || "comment",
    tierListId: tierListId || null,
    tierListTitle: tierListTitle || "Tier List",
    commentId: commentId || null,
    text: text || "interagiu contigo",
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Mantém no máximo 100 notificações
  const updated = [newNotif, ...notifs].slice(0, 100);
  setStored(STORAGE_KEY_NOTIFICATIONS, updated);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tierforge_notifications_updated", {
        detail: { recipientUid, newNotification: true, notif: newNotif },
      })
    );
  }

  return newNotif;
}

export function deleteNotification(notifId) {
  const notifs = getStored(STORAGE_KEY_NOTIFICATIONS, []);
  const filtered = notifs.filter((n) => n.id !== notifId);
  setStored(STORAGE_KEY_NOTIFICATIONS, filtered);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tierforge_notifications_updated"));
  }
  return true;
}

export function getUserNotifications(uid) {
  if (!uid) return [];
  const notifs = getStored(STORAGE_KEY_NOTIFICATIONS, []);
  return notifs.filter((n) => n.recipientUid === uid);
}

export function markNotificationAsRead(notifId) {
  const notifs = getStored(STORAGE_KEY_NOTIFICATIONS, []);
  const target = notifs.find((n) => n.id === notifId);
  if (target) {
    target.read = true;
    setStored(STORAGE_KEY_NOTIFICATIONS, notifs);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tierforge_notifications_updated"));
    }
  }
}

export function markAllNotificationsAsRead(uid) {
  if (!uid) return;
  const notifs = getStored(STORAGE_KEY_NOTIFICATIONS, []);
  let changed = false;
  notifs.forEach((n) => {
    if (n.recipientUid === uid && !n.read) {
      n.read = true;
      changed = true;
    }
  });
  if (changed) {
    setStored(STORAGE_KEY_NOTIFICATIONS, notifs);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tierforge_notifications_updated"));
    }
  }
}

export function clearAllNotifications(uid) {
  if (!uid) return;
  const notifs = getStored(STORAGE_KEY_NOTIFICATIONS, []);
  const filtered = notifs.filter((n) => n.recipientUid !== uid);
  setStored(STORAGE_KEY_NOTIFICATIONS, filtered);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tierforge_notifications_updated"));
  }
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
