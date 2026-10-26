import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjJXow9sFr3jt1uKJy7MNuZ9r5v8zwvaY",
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
let loadedCloudRevision = 0;

async function loadProgress(userId) {
  loadedCloudRevision = 0;
  const snapshot = await getDoc(doc(db, "users", userId));
  if (!snapshot.exists()) return null;
  const progressJson = snapshot.data().progressJson;
  if (typeof progressJson !== "string") return null;
  const progress = JSON.parse(progressJson);
  loadedCloudRevision = Number(progress.cloudRevision) || 0;
  return progress;
}

async function saveProgress(userId, progress) {
  const reference = doc(db, "users", userId);
  const nextRevision = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    let currentRevision = 0;
    if (snapshot.exists() && typeof snapshot.data().progressJson === "string") {
      try {
        currentRevision = Number(JSON.parse(snapshot.data().progressJson).cloudRevision) || 0;
      } catch (_) {}
    }
    if (currentRevision > loadedCloudRevision) {
      const error = new Error("This account was updated on another device. Reload it before saving.");
      error.code = "stale-progress";
      throw error;
    }
    const revision = Math.max(Date.now(), currentRevision + 1);
    const nextProgress = { ...progress, cloudRevision: revision };
    transaction.set(reference, {
      progressJson: JSON.stringify(nextProgress),
      updatedAt: serverTimestamp()
    });
    return revision;
  });
  loadedCloudRevision = nextRevision;
}

window.morseCloud = { auth, loadProgress, saveProgress };

const $ = (id) => document.getElementById(id);

function setMessage(message, isError = false) {
  const element = $("auth-message");
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "#a33b3b" : "";
}

function friendlyAuthError(error) {
  const messages = {
    "auth/email-already-in-use": "That email already has an account. Try signing in.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Use a password with at least 6 characters.",
    "auth/network-request-failed": "Network error. Check your connection and try again."
  };
  if (error.code === "stale-progress") return error.message;
  return messages[error.code] || "Firebase could not complete that request. Try again.";
}

function renderAccount(user) {
  const signedOut = $("auth-signed-out");
  const signedIn = $("auth-signed-in");
  if (signedOut) signedOut.hidden = Boolean(user);
  if (signedIn) signedIn.hidden = !user;
  if (user && $("auth-user-label")) $("auth-user-label").textContent = user.email || "your account";
  const saveButton = $("auth-save-progress");
  if (saveButton) saveButton.disabled = true;
}

async function runAuthAction(action) {
  const email = $("auth-email")?.value.trim() || "";
  const password = $("auth-password")?.value || "";
  if (!email || !password) {
    setMessage("Enter your email and password.", true);
    return;
  }
  setMessage(action === "signup" ? "Creating account…" : "Signing in…");
  try {
    if (action === "signup") await createUserWithEmailAndPassword(auth, email, password);
    else await signInWithEmailAndPassword(auth, email, password);
    if ($("auth-password")) $("auth-password").value = "";
    setMessage("Cloud saving is connected.");
  } catch (error) {
    setMessage(friendlyAuthError(error), true);
  }
}

$("auth-sign-in")?.addEventListener("click", () => runAuthAction("signin"));
$("auth-sign-up")?.addEventListener("click", () => runAuthAction("signup"));
$("auth-save-progress")?.addEventListener("click", async () => {
  const button = $("auth-save-progress");
  if (!window.morseProgress?.isCloudReady()) {
    setMessage("Wait for your account to finish loading, then try again.", true);
    return;
  }
  button.disabled = true;
  button.textContent = "Saving…";
  try {
    await window.morseProgress.saveNow();
    setMessage("Progress saved. You can sign in on another device to load it.");
  } catch (error) {
    setMessage("Progress could not be saved. Check Firestore Rules and try again.", true);
  } finally {
    button.disabled = !window.morseProgress?.isCloudReady();
    button.textContent = "Save Progress";
  }
});
$("auth-sign-out")?.addEventListener("click", async () => {
  if (window.morseProgress?.isDirty() && !window.confirm("You have unsaved progress. Sign out anyway?")) return;
  try {
    await signOut(auth);
    setMessage("Signed out. Progress remains saved on this device.");
  } catch (error) {
    setMessage(friendlyAuthError(error), true);
  }
});

window.addEventListener("morse:cloud-progress", (event) => {
  const detail = event.detail || {};
  const button = $("auth-save-progress");
  if (button) button.disabled = !detail.user || Boolean(detail.error);
});

onAuthStateChanged(auth, async (user) => {
  renderAccount(user);
  if (!user) {
    loadedCloudRevision = 0;
    window.dispatchEvent(new CustomEvent("morse:cloud-progress", { detail: { user: null } }));
    return;
  }
  try {
    const progress = await loadProgress(user.uid);
    window.dispatchEvent(new CustomEvent("morse:cloud-progress", { detail: { user, progress } }));
  } catch (error) {
    setMessage("Signed in, but cloud progress could not be loaded. Check Firestore Rules.", true);
    window.dispatchEvent(new CustomEvent("morse:cloud-progress", { detail: { user, error } }));
  }
});
