// Firebase project configuration.
// Values come from environment variables so real keys never get committed.
// Copy .env.example to .env and fill them in with your Firebase project's config
// (Firebase console → Project settings → General → Your apps → SDK setup and config).
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForTierforgePreview123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tierforge.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tierforge",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tierforge.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (err) {
  console.warn("Firebase initialization warning (falling back to local mode):", err);
}

export { app, auth, db, googleProvider };
