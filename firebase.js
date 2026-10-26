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
    const progressJson = JSON.stringify(nextProgress);
    if (progressJson.length > 900000) {
      const error = new Error("Saved progress is too large for one Firestore document.");
      error.code = "progress-too-large";
      throw error;
    }
    transaction.set(reference, {
      progressJson,
      updatedAt: serverTimestamp()
    });
    return revision;
  });
  loadedCloudRevision = nextRevision;
}

window.morseCloud = { auth, loadProgress, saveProgress };

const $ = (id) => document.getElementById(id);
const SESSION_KEY = "morseQuestSession";

function readSession() {
  try { return window.localStorage.getItem(SESSION_KEY) || ""; } catch (_) { return ""; }
}

function writeSession(value) {
  try { window.localStorage.setItem(SESSION_KEY, value); } catch (_) {}
}

function clearSession() {
  try { window.localStorage.removeItem(SESSION_KEY); } catch (_) {}
}

function setGatewayVisible(visible) {
  const gateway = $("account-gateway");
  if (!gateway) return;
  gateway.hidden = !visible;
  document.body.classList.toggle("account-gateway-open", visible);
}

function setGatewayMessage(message, isError = false) {
  const element = $("gateway-message");
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "#f39a9a" : "";
}

function openAccountForm(action = "signin") {
  writeSession("account");
  setGatewayVisible(false);
  document.querySelector('.nav-item[data-view="account"]')?.click();
  setMessage(action === "signup" ? "Create your MorseQuest account to save progress across devices." : "Sign in to continue.");
  window.setTimeout(() => $("auth-email")?.focus(), 0);
}

function continueAsGuest() {
  writeSession("guest");
  setGatewayMessage("");
  setGatewayVisible(false);
  window.dispatchEvent(new CustomEvent("morse:guest-session", { detail: { active: true } }));
  renderAccount(null);
}

function showAccountGateway() {
  setGatewayMessage("");
  setGatewayVisible(true);
}

function setMessage(message, isError = false) {
  const element = $("auth-message");
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "#a33b3b" : "";
}

function setSaveStatus(message, isError = false) {
  const element = $("global-save-status");
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "#a33b3b" : "";
}

function saveButtons() {
  return [$("auth-save-progress"), $("global-save-progress")].filter(Boolean);
}

function setSaveButtonsDisabled(disabled) {
  saveButtons().forEach((button) => { button.disabled = disabled; });
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
  if (error.code === "progress-too-large") return "This progress record is too large to save. Complete fewer stored history items, then try again.";
  return messages[error.code] || "Firebase could not complete that request. Try again.";
}

function friendlySaveError(error) {
  if (error.code === "stale-progress") return error.message;
  if (error.code === "progress-too-large") return "This progress record is too large for Firestore. Try again after reducing stored history.";
  if (error.code === "permission-denied") return "Firestore rejected this save. Publish the owner-only users/{userId} rules for the MorseTrain project, then try again.";
  if (error.code === "failed-precondition") return "Firestore is not ready for this project yet. Open Firestore Database in the MorseTrain console and try again.";
  if (error.code === "unavailable" || error.code === "deadline-exceeded") return "Firestore is temporarily unavailable. Check your connection and try again.";
  if (error.code === "resource-exhausted") return "Firestore is temporarily rate-limited. Wait a moment and try again.";
  return "Firestore could not save this progress right now. Try again.";
}

function renderAccount(user) {
  const signedOut = $("auth-signed-out");
  const signedIn = $("auth-signed-in");
  if (signedOut) signedOut.hidden = Boolean(user);
  if (signedIn) signedIn.hidden = !user;
  if (user && $("auth-user-label")) $("auth-user-label").textContent = user.email || "your account";
  const isGuest = !user && readSession() === "guest";
  if ($("account-save-copy")) $("account-save-copy").textContent = user
    ? "Signed in: cloud progress saves when you press Save Progress."
    : isGuest
      ? "Guest mode: progress is saved only in this browser. Sign in to sync across devices."
      : "Choose Guest for temporary local practice, or sign in to save progress in the cloud.";
  setSaveButtonsDisabled(true);
  setSaveStatus(user ? "Ready to save manually" : isGuest ? "Guest progress is local only" : "Sign in to save progress");
  const settingsAction = $("settings-account-action");
  if (settingsAction) settingsAction.textContent = user ? "Open Account" : "Log In or Create Account";
}

async function saveProgressFromButton() {
  if (!window.morseProgress?.isCloudReady()) {
    setMessage("Wait for your account to finish loading, then try again.", true);
    setSaveStatus("Sign in to save progress", true);
    return;
  }
  setSaveButtonsDisabled(true);
  saveButtons().forEach((button) => { button.textContent = "Saving…"; });
  setSaveStatus("Saving your progress…");
  try {
    await window.morseProgress.saveNow();
    setMessage("Progress saved. You can sign in on another device to load it.");
    setSaveStatus("Progress saved just now");
  } catch (error) {
    setMessage(friendlySaveError(error), true);
    setSaveStatus("Save failed — try again", true);
  } finally {
    saveButtons().forEach((button) => {
      button.disabled = !window.morseProgress?.isCloudReady();
      button.textContent = "Save Progress";
    });
  }
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
$("auth-save-progress")?.addEventListener("click", saveProgressFromButton);
$("global-save-progress")?.addEventListener("click", saveProgressFromButton);
$("gateway-sign-in")?.addEventListener("click", () => openAccountForm("signin"));
$("gateway-sign-up")?.addEventListener("click", () => openAccountForm("signup"));
$("gateway-guest")?.addEventListener("click", continueAsGuest);
$("settings-account-action")?.addEventListener("click", () => {
  if (auth.currentUser) document.querySelector('.nav-item[data-view="account"]')?.click();
  else openAccountForm("signin");
});
$("auth-sign-out")?.addEventListener("click", async () => {
  if (window.morseProgress?.isDirty() && !window.confirm("You have unsaved progress. Sign out anyway?")) return;
  try {
    await signOut(auth);
    clearSession();
    setMessage("Signed out. Choose Guest for temporary local practice or sign in again.");
    showAccountGateway();
  } catch (error) {
    setMessage(friendlyAuthError(error), true);
  }
});

window.addEventListener("morse:cloud-progress", (event) => {
  const detail = event.detail || {};
  setSaveButtonsDisabled(!detail.user || Boolean(detail.error));
  if (detail.user && !detail.error) setSaveStatus("Ready to save manually");
  if (!detail.user) setSaveStatus("Sign in to save progress");
  if (detail.error) setSaveStatus("Cloud save unavailable", true);
});

onAuthStateChanged(auth, async (user) => {
  renderAccount(user);
  if (!user) {
    loadedCloudRevision = 0;
    window.dispatchEvent(new CustomEvent("morse:cloud-progress", { detail: { user: null } }));
    if (readSession() === "guest") {
      setGatewayVisible(false);
      window.dispatchEvent(new CustomEvent("morse:guest-session", { detail: { active: true } }));
    } else {
      showAccountGateway();
    }
    return;
  }
  writeSession("account");
  setGatewayVisible(false);
  try {
    const progress = await loadProgress(user.uid);
    window.dispatchEvent(new CustomEvent("morse:cloud-progress", { detail: { user, progress } }));
  } catch (error) {
    setMessage("Signed in, but cloud progress could not be loaded. Check Firestore Rules.", true);
    window.dispatchEvent(new CustomEvent("morse:cloud-progress", { detail: { user, error } }));
  }
});

if (readSession() === "guest") {
  setGatewayVisible(false);
  window.dispatchEvent(new CustomEvent("morse:guest-session", { detail: { active: true } }));
} else {
  showAccountGateway();
}
