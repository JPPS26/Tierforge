import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  deleteUser,
  reauthenticateWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import {
  getUserByUid,
  getAllUsers,
  saveUsers,
  updateUserProfile as dbUpdateUserProfile,
  deleteUserAccountAndData,
  subscribeToDbSync,
  notifyDbChange,
} from "../services/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gera um handle único automático para novos utilizadores (ex: tierworldplayer1)
  function generateDefaultHandle(users) {
    let num = users.length + 1;
    let candidate = `tierworldplayer${num}`;
    const taken = new Set(users.map((u) => (u.handle || "").toLowerCase()));
    while (taken.has(candidate)) {
      num++;
      candidate = `tierworldplayer${num}`;
    }
    return candidate;
  }

  async function ensureUserDoc(firebaseUser, extra = {}) {
    // 1. Tenta obter no armazenamento local ou Firestore
    const existingInLocal = await getUserByUid(firebaseUser.uid);
    if (existingInLocal) {
      setProfile(existingInLocal);
      return existingInLocal;
    }

    // 2. Tenta obter do Firestore se já existir remotamente
    try {
      if (db) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const cloudData = { ...snap.data(), uid: snap.id };
          const allUsers = getAllUsers();
          const filtered = allUsers.filter((u) => u.uid !== cloudData.uid);
          saveUsers([...filtered, cloudData]);
          setProfile(cloudData);
          return cloudData;
        }
      }
    } catch (e) {
      console.warn("Firestore user check notice:", e);
    }

    const allUsers = getAllUsers();
    const defaultHandle = generateDefaultHandle(allUsers);

    const newUserData = {
      uid: firebaseUser.uid,
      handle: defaultHandle,
      displayName: firebaseUser.displayName || extra.displayName || `Criador ${defaultHandle}`,
      email: firebaseUser.email,
      avatar: firebaseUser.photoURL || "",
      bio: "",
      creatorXp: 0,
      badges: ["Novo Criador"],
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
    };

    allUsers.push(newUserData);
    saveUsers(allUsers);
    setProfile(newUserData);

    try {
      if (db) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            ...newUserData,
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch (e) {
      console.warn("Firestore user creation notice:", e);
    }

    return newUserData;
  }

  useEffect(() => {
    try {
      if (!auth) {
        setLoading(false);
        return;
      }
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          await ensureUserDoc(firebaseUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Firebase Auth listener inactive:", e);
      setLoading(false);
    }
  }, []);

  // Sincronização ao segundo do perfil do utilizador autenticado com a base de dados
  useEffect(() => {
    if (!user) return;

    const refreshProfile = async () => {
      const fresh = await getUserByUid(user.uid);
      if (fresh) {
        setProfile((prev) => {
          // Apenas atualiza se houver alguma diferença real
          if (JSON.stringify(prev) !== JSON.stringify(fresh)) {
            return fresh;
          }
          return prev;
        });
      }
    };

    const unsubscribe = subscribeToDbSync(refreshProfile);
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refreshProfile();
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const prof = await ensureUserDoc(cred.user);
    return { user: cred.user, profile: prof };
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }

  // Atualizar perfil em tempo real
  async function updateProfile(data) {
    const targetUid = user?.uid || profile?.uid;
    if (!targetUid) return null;
    const updated = await dbUpdateUserProfile(targetUid, data);
    if (updated) {
      setProfile(updated);
    }
    return updated;
  }

  // Eliminar permanentemente a conta e dados do utilizador
  async function deleteAccount() {
    if (!user) return false;
    const currentUid = user.uid;

    // 1. Elimina todos os dados da base de dados local e Firestore
    await deleteUserAccountAndData(currentUid);

    // 2. Elimina a conta de autenticação no Firebase
    try {
      if (user.delete) {
        await deleteUser(user);
      }
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        try {
          await reauthenticateWithPopup(user, googleProvider);
          await deleteUser(user);
        } catch (reauthErr) {
          console.warn("Could not reauthenticate for deletion:", reauthErr);
        }
      } else {
        console.warn("Notice deleting auth user:", err);
      }
    }

    // 3. Termina a sessão
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Sign out notice on deletion:", e);
    }

    setUser(null);
    setProfile(null);
    return true;
  }

  const value = {
    user,
    profile,
    loading,
    loginWithGoogle,
    logout,
    updateProfile,
    deleteAccount,
    ensureUserDoc,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
