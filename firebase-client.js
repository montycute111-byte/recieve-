import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjJXOw9sFr3jt1uKJy7MNuZ9r5v8zwvaY",
  authDomain: "morsetrain.firebaseapp.com",
  projectId: "morsetrain",
  storageBucket: "morsetrain.firebasestorage.app",
  messagingSenderId: "1077582832625",
  appId: "1:1077582832625:web:8df925dc67e8a8cba05a50",
  measurementId: "G-QWE2NGPKLN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
let currentUser = null;

function userProgressRef(user = currentUser) {
  if (!user) throw new Error("Sign in before saving progress.");
  return doc(db, "users", user.uid);
}

async function loadProgress() {
  const snapshot = await getDoc(userProgressRef());
  return snapshot.exists() ? snapshot.data().progress || null : null;
}

async function saveProgress(progress) {
  await setDoc(userProgressRef(), { progress, updatedAt: serverTimestamp() }, { merge: true });
}

window.morseFirebase = {
  auth,
  db,
  signInWithGoogle: () => signInWithPopup(auth, googleProvider),
  signOut: () => signOut(auth),
  loadProgress,
  saveProgress,
  getCurrentUser: () => currentUser
};

window.dispatchEvent(new CustomEvent("morse:firebase-ready"));
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  window.dispatchEvent(new CustomEvent("morse:auth-state", {
    detail: { user: user ? { uid: user.uid, displayName: user.displayName, email: user.email } : null }
  }));
});
