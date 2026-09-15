/**
 * Persistent IndexedDB Storage Layer for TierWorld
 * Provides resilient, virtually unlimited storage capacity for tierlists and users.
 * Acts as a failsafe and high-capacity persistence layer alongside localStorage.
 */

const DB_NAME = "tierforge_persistent_db";
const DB_VERSION = 1;
const STORE_TIERLISTS = "tierlists";
const STORE_USERS = "users";

let dbInstance = null;
let dbPromise = null;

function openDatabase() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_TIERLISTS)) {
            db.createObjectStore(STORE_TIERLISTS, { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains(STORE_USERS)) {
            db.createObjectStore(STORE_USERS, { keyPath: "uid" });
          }
        };

        req.onsuccess = (e) => {
          dbInstance = e.target.result;
          resolve(dbInstance);
        };

        req.onerror = (e) => {
          console.warn("Could not open IndexedDB:", e);
          resolve(null);
        };

        req.onblocked = () => {
          console.warn("IndexedDB open request blocked.");
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB initialization error:", err);
        resolve(null);
      }
    });
  }

  return dbPromise;
}

export async function idbSaveTierList(tierList) {
  if (!tierList || !tierList.id) return false;
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TIERLISTS, "readwrite");
      const store = tx.objectStore(STORE_TIERLISTS);
      store.put(tierList);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbSaveTierLists(tierLists) {
  if (!Array.isArray(tierLists) || tierLists.length === 0) return false;
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TIERLISTS, "readwrite");
      const store = tx.objectStore(STORE_TIERLISTS);
      for (const list of tierLists) {
        if (list && list.id) {
          store.put(list);
        }
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbGetTierList(id) {
  if (!id) return null;
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TIERLISTS, "readonly");
      const store = tx.objectStore(STORE_TIERLISTS);
      const req = store.get(id);
      req.onsuccess = (e) => resolve(e.target.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbGetAllTierLists() {
  const db = await openDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TIERLISTS, "readonly");
      const store = tx.objectStore(STORE_TIERLISTS);
      const req = store.getAll();
      req.onsuccess = (e) => {
        const res = e.target.result;
        resolve(Array.isArray(res) ? res : []);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function idbDeleteTierList(id) {
  if (!id) return false;
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TIERLISTS, "readwrite");
      const store = tx.objectStore(STORE_TIERLISTS);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbSaveUser(user) {
  if (!user || !user.uid) return false;
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_USERS, "readwrite");
      const store = tx.objectStore(STORE_USERS);
      store.put(user);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbSaveUsers(users) {
  if (!Array.isArray(users) || users.length === 0) return false;
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_USERS, "readwrite");
      const store = tx.objectStore(STORE_USERS);
      for (const u of users) {
        if (u && u.uid) {
          store.put(u);
        }
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbGetAllUsers() {
  const db = await openDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_USERS, "readonly");
      const store = tx.objectStore(STORE_USERS);
      const req = store.getAll();
      req.onsuccess = (e) => {
        const res = e.target.result;
        resolve(Array.isArray(res) ? res : []);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}
