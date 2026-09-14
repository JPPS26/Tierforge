import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

// Saves a tier list owned by the given user id.
export async function saveTierList(uid, { title, category, tiers, placements }) {
  return addDoc(collection(db, "tierlists"), {
    title,
    category,
    tiers,
    placements,
    ownerId: uid,
    votes: 0,
    views: 0,
    createdAt: serverTimestamp(),
  });
}

// Fetches all tier lists created by a given user, newest first.
export async function getUserTierLists(uid) {
  const q = query(
    collection(db, "tierlists"),
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Fetches the most recent public tier lists across all users, for Explore.
export async function getRecentTierLists(max = 24) {
  const q = query(collection(db, "tierlists"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.slice(0, max).map((d) => ({ id: d.id, ...d.data() }));
}
