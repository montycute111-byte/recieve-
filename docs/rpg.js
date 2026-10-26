(() => {
  "use strict";

  const STORAGE_KEY = "morseReceiveRpgProgress";
  const SESSION_KEY = "morseQuestSession";
  const GUEST_PROGRESS_KEY = "morseQuestGuestProgress";
  const THEME_META = [
    { id: "video-games", icon: "video-games", name: "Video Games" },
    { id: "movies-tv", icon: "movies-tv", name: "Movies & TV" },
    { id: "famous-quotes", icon: "famous-quotes", name: "Famous Quotes" },
    { id: "jokes-riddles", icon: "jokes-riddles", name: "Jokes & Riddles" },
    { id: "music", icon: "music", name: "Music" },
    { id: "general-sentences", icon: "general-sentences", name: "General Sentences" },
    { id: "halloween", icon: "halloween", name: "Halloween" }
  ];
  const STANDARD_QUESTS = [
    { id: "warm-up", title: "Warm-Up", description: "Decode 10 words correctly.", target: 10, metric: "words", group: "standard" },
    { id: "sentence-starter", title: "Sentence Starter", description: "Decode 10 sentences correctly.", target: 10, metric: "sentences", group: "standard" },
    { id: "steady-signal", title: "Steady Signal", description: "Decode 30 characters correctly.", target: 30, metric: "characters", group: "standard" },
    { id: "time-on-air", title: "Time on the Air", description: "Practice for 10 minutes.", target: 10, metric: "practiceMinutes", group: "standard" },
    { id: "signal-check", title: "Signal Check", description: "Decode 5 words correctly.", target: 5, metric: "words", group: "standard" }
  ];
  const BONUS_QUESTS = [
    { id: "cw-marathon", title: "CW Marathon", description: "Decode 250 characters correctly.", target: 250, metric: "characters", group: "bonus" },
    { id: "sentence-marathon", title: "Sentence Marathon", description: "Decode 25 sentences correctly.", target: 25, metric: "sentences", group: "bonus" },
    { id: "deep-reception", title: "Deep Reception", description: "Practice for 25 minutes.", target: 25, metric: "practiceMinutes", group: "bonus" }
  ];
  const SEASONAL_QUESTS = [
    { id: "halloween-25", title: "Haunted Warm-Up", description: "Decode 25 Halloween words correctly.", target: 25, metric: "halloweenWords", group: "bonus", season: "halloween" },
    { id: "halloween-100", title: "Halloween Marathon", description: "Decode 100 Halloween-themed words.", target: 100, metric: "halloweenWords", group: "bonus", season: "halloween" },
    { id: "halloween-sentences", title: "Spooky Story", description: "Complete 10 Halloween sentences.", target: 10, metric: "halloweenSentences", group: "bonus", season: "halloween" },
  ];
  const QUESTS = [...STANDARD_QUESTS, ...BONUS_QUESTS, ...SEASONAL_QUESTS];
  const REMOVED_QUEST_IDS = new Set(["perfect-copy", "clean-circuit", "perfect-run", "halloween-perfect"]);
  const PROGRESSION_CATEGORIES = [
    ["letters", "Letters"], ["random-letters", "Random Letters"], ["numbers", "Numbers"],
    ["words", "Words"], ["sentences", "Sentences"], ["halloween-words", "Halloween Words"],
    ["halloween-sentences", "Halloween Sentences"]
  ];

  function defaultProgression() {
    return {
      totalXp: 0,
      totalExercisesCompleted: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      claimedRewardIds: [],
      xpRewardHistory: [],
      dailyActivity: [],
      practiceStreak: { current: 0, longest: 0, lastPracticeDate: "", activeDays: 0, streakStartDate: "", claimedMilestones: [] },
      categoryStats: {},
      wpmStats: {},
      lastSessionRewardAt: 0
    };
  }

  const defaultState = () => ({
    perfectStreak: 0,
    longestPerfectStreak: 0,
    sentencePerfectStreak: 0,
    bestSentencePerfectStreak: 0,
    totalWords: 0,
    totalSentences: 0,
    totalCharacters: 0,
    totalAccuracyPoints: 0,
    totalAccuracyCharacters: 0,
    totalRewinds: 0,
    totalPracticeMs: 0,
    successfulExercises: 0,
    perfectSentences: 0,
    sentencesNoRewind: 0,
    halloweenWords: 0,
    perfectAt10: 0,
    totalQuestsCompleted: 0,
    halloweenQuestsCompleted: 0,
    themeProgress: Object.fromEntries(THEME_META.map((theme) => [theme.id, { completed: [] }])),
    progression: defaultProgression(),
    daily: {
      date: "",
      questIds: [],
      progress: { words: 0, sentences: 0, perfectSentences: 0, noRewindSentences: 0, characters: 0, practiceMinutes: 0, practiceMs: 0, halloweenWords: 0, halloweenSentences: 0, halloweenPerfectSentences: 0 },
      completed: [],
      allQuestsXpAwarded: false,
      qualified: false,
      currentStreak: 0,
      longestStreak: 0,
      successfulDays: 0,
      lastQualifiedDate: ""
    }
  });

  const $ = (id) => document.getElementById(id);
  const state = loadState();
  let activeExercise = { id: `initial-${Date.now()}`, mode: "letters", rewinds: 0, pauses: 0, playStartedAt: 0, rewarded: false, revealed: false, transmissionFinished: false, statsRecorded: false, xpAwarded: false };
  let toastTimer = 0;
  let cloudUser = null;
  let cloudReady = false;
  let progressDirty = false;
  let selectedStatsRange = 7;
  let levelUpQueueTimer = 0;
  let queuedLevelUp = 0;
  let levelUpTimer = 0;

  function normalizeState(saved) {
    const fresh = defaultState();
    return {
      ...fresh,
      ...saved,
      themeProgress: Object.fromEntries(THEME_META.map((theme) => [theme.id, {
        ...fresh.themeProgress[theme.id],
        ...((saved.themeProgress || {})[theme.id] || {}),
        completed: Array.isArray((saved.themeProgress || {})[theme.id]?.completed) ? [...new Set((saved.themeProgress || {})[theme.id].completed)] : []
      }])),
      progression: {
        ...fresh.progression,
        ...(saved.progression || {}),
        claimedRewardIds: Array.isArray(saved.progression?.claimedRewardIds) ? [...new Set(saved.progression.claimedRewardIds)] : [],
        xpRewardHistory: Array.isArray(saved.progression?.xpRewardHistory) ? saved.progression.xpRewardHistory.slice(-1500) : [],
        dailyActivity: Array.isArray(saved.progression?.dailyActivity) ? saved.progression.dailyActivity.slice(-1200) : [],
        practiceStreak: { ...fresh.progression.practiceStreak, ...(saved.progression?.practiceStreak || {}), claimedMilestones: Array.isArray(saved.progression?.practiceStreak?.claimedMilestones) ? saved.progression.practiceStreak.claimedMilestones : [] },
        categoryStats: saved.progression?.categoryStats && typeof saved.progression.categoryStats === "object" ? saved.progression.categoryStats : {},
        wpmStats: saved.progression?.wpmStats && typeof saved.progression.wpmStats === "object" ? saved.progression.wpmStats : {}
      },
      daily: { ...fresh.daily, ...(saved.daily || {}), questIds: Array.isArray((saved.daily || {}).questIds) ? saved.daily.questIds : [], progress: { ...fresh.daily.progress, ...((saved.daily || {}).progress || {}) }, completed: Array.isArray((saved.daily || {}).completed) ? saved.daily.completed : [], allQuestsXpAwarded: Boolean(saved.daily?.allQuestsXpAwarded) }
    };
  }

  function loadState() {
    // Guests keep progress only in this browser. Authenticated progress is
    // loaded explicitly by Firebase after sign-in.
    if (window.localStorage?.getItem(SESSION_KEY) !== "guest") return defaultState();
    try {
      const saved = JSON.parse(window.localStorage.getItem(GUEST_PROGRESS_KEY) || "null");
      return saved && typeof saved === "object" ? normalizeState(saved) : defaultState();
    } catch (_) {
      return defaultState();
    }
  }

  function saveState() {
    // Guest progress is local-only and may be persisted immediately. Registered
    // progress remains manual-save-only and is handled by Firebase.
    if (window.localStorage?.getItem(SESSION_KEY) !== "guest") return;
    try {
      window.localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  async function saveProgressNow() {
    if (!cloudUser || !cloudReady || !window.morseCloud) return false;
    await window.morseCloud.saveProgress(cloudUser.uid, state);
    progressDirty = false;
    return true;
  }

  function replaceState(nextState) {
    const normalized = normalizeState(nextState);
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, normalized);
    ensureDaily();
    progressDirty = false;
    renderAll();
  }

  function clearProgressState() {
    window.localStorage?.removeItem(STORAGE_KEY);
    replaceState(defaultState());
  }

  window.addEventListener("morse:cloud-progress", (event) => {
    const detail = event.detail || {};
    cloudUser = detail.user || null;
    cloudReady = false;
    if (!cloudUser && window.localStorage?.getItem(SESSION_KEY) === "guest") return;
    if (cloudUser && !detail.error && detail.progress && typeof detail.progress === "object") replaceState(detail.progress);
    else clearProgressState();
    if (cloudUser && !detail.error) {
      cloudReady = true;
    }
  });

  window.addEventListener("morse:guest-session", (event) => {
    if (!event.detail?.active) return;
    cloudUser = null;
    cloudReady = false;
    replaceState(loadState());
    renderAll();
  });

  window.morseProgress = {
    saveNow: saveProgressNow,
    isCloudReady: () => cloudReady && Boolean(cloudUser),
    isDirty: () => progressDirty,
    getSnapshot: () => JSON.parse(JSON.stringify(state))
  };

  function markDirty() {
    if (window.localStorage?.getItem(SESSION_KEY) === "guest") {
      saveState();
      return;
    }
    progressDirty = true;
  }

  window.addEventListener("beforeunload", (event) => {
    if (!progressDirty) return;
    event.preventDefault();
    event.returnValue = "You have unsaved progress.";
  });

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateFromKey(value) {
    const [year, month, day] = String(value).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function daysBetween(first, second) {
    if (!first || !second) return Infinity;
    return Math.round((dateFromKey(second) - dateFromKey(first)) / 86400000);
  }

  function hashValue(value) {
    return [...String(value)].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7);
  }

  function seededShuffle(items, seed) {
    const result = [...items];
    let value = hashValue(seed) || 1;
    for (let index = result.length - 1; index > 0; index -= 1) {
      value = (value * 1664525 + 1013904223) >>> 0;
      const swapIndex = value % (index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function isHalloweenAvailable(dateKey = todayKey()) {
    return dateFromKey(dateKey).getMonth() === 9;
  }

  function questIdsForDate(dateKey, previousIds = []) {
    const activeBonus = [...BONUS_QUESTS, ...(isHalloweenAvailable(dateKey) ? SEASONAL_QUESTS : [])];
    let selected = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const standard = seededShuffle(STANDARD_QUESTS, `${dateKey}:standard:${attempt}`).slice(0, 3);
      let bonus = seededShuffle(activeBonus, `${dateKey}:bonus:${attempt}`).slice(0, 2);
      if (isHalloweenAvailable(dateKey) && !bonus.some((quest) => quest.season === "halloween")) {
        bonus[0] = seededShuffle(SEASONAL_QUESTS, `${dateKey}:season:${attempt}`)[0];
      }
      selected = [...standard, ...bonus].map((quest) => quest.id);
      if (selected.slice().sort().join("|") !== previousIds.slice().sort().join("|")) break;
    }
    return selected;
  }

  function dailyQuests() {
    return state.daily.questIds.map((id) => QUESTS.find((quest) => quest.id === id)).filter(Boolean);
  }

  function emptyDailyProgress() {
    return { words: 0, sentences: 0, perfectSentences: 0, noRewindSentences: 0, characters: 0, practiceMinutes: 0, practiceMs: 0, halloweenWords: 0, halloweenSentences: 0, halloweenPerfectSentences: 0 };
  }

  function syncQualifiedStreak(awardMilestone = false) {
    const daily = state.daily;
    const streak = state.progression.practiceStreak;
    const previousDate = streak.lastPracticeDate;
    const current = Number(daily.currentStreak) || 0;
    streak.current = current;
    streak.longest = Number(daily.longestStreak) || 0;
    streak.activeDays = Number(daily.successfulDays) || 0;
    streak.lastPracticeDate = daily.lastQualifiedDate || "";
    if (!current) {
      streak.streakStartDate = "";
      streak.claimedMilestones = [];
      return 0;
    }
    if (current === 1 || (!streak.streakStartDate && previousDate !== streak.lastPracticeDate)) {
      streak.streakStartDate = streak.lastPracticeDate;
      streak.claimedMilestones = [];
    }
    if (!awardMilestone) return 0;
    const milestone = current >= 30 && current % 30 === 0 ? current : [3, 7, 14].find((value) => value === current) || 0;
    const reward = milestone === 3 ? 25 : milestone === 7 ? 75 : milestone === 14 ? 150 : milestone >= 30 ? 300 : 0;
    if (!reward || streak.claimedMilestones.includes(milestone)) return 0;
    streak.claimedMilestones.push(milestone);
    return awardXp(reward, `${milestone}-day streak`, `streak:${streak.streakStartDate}:${milestone}`);
  }

  function qualifyToday() {
    if (state.daily.qualified) return 0;
    const today = state.daily.date || todayKey();
    const previous = state.daily.lastQualifiedDate;
    state.daily.currentStreak = previous && daysBetween(previous, today) === 1 ? state.daily.currentStreak + 1 : 1;
    state.daily.longestStreak = Math.max(state.daily.longestStreak, state.daily.currentStreak);
    state.daily.successfulDays += 1;
    state.daily.lastQualifiedDate = today;
    state.daily.qualified = true;
    showRpgToast(`STREAK DAY COMPLETE! ${state.daily.currentStreak} day${state.daily.currentStreak === 1 ? "" : "s"}`, true);
    return syncQualifiedStreak(true);
  }

  function ensureDaily() {
    const date = todayKey();
    if (state.daily.date !== date) {
      const previousDate = state.daily.date;
      if (previousDate && (!state.daily.qualified || daysBetween(previousDate, date) > 1)) state.daily.currentStreak = 0;
      state.daily.date = date;
      state.daily.questIds = questIdsForDate(date, state.daily.questIds);
      state.daily.progress = emptyDailyProgress();
      state.daily.completed = [];
      state.daily.qualified = false;
      state.daily.allQuestsXpAwarded = false;
      saveState();
    } else if (!Array.isArray(state.daily.questIds) || state.daily.questIds.length !== 5 || state.daily.questIds.some((id) => REMOVED_QUEST_IDS.has(id) || !QUESTS.some((quest) => quest.id === id))) {
      state.daily.questIds = questIdsForDate(date);
      state.daily.progress = emptyDailyProgress();
      state.daily.completed = [];
      state.daily.qualified = false;
      state.daily.allQuestsXpAwarded = false;
      saveState();
    }
    syncQualifiedStreak();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  function isWordMode(mode) {
    return mode === "phrases" || mode === "words" || mode === "halloween";
  }

  function isSentenceMode(mode) {
    return mode === "sentences" || mode === "halloween-sentences";
  }

  function getLevelInfo(totalXp = state.progression.totalXp) {
    let level = 1;
    let remaining = Math.max(0, Number(totalXp) || 0);
    let required = 100;
    while (remaining >= required) {
      remaining -= required;
      level += 1;
      required = level * 100;
    }
    return { level, currentXp: remaining, requiredXp: required, percent: Math.min(100, (remaining / required) * 100) };
  }

  function categoryForMode(mode) {
    if (isSentenceMode(mode)) return mode === "halloween-sentences" ? "halloween-sentences" : "sentences";
    if (isWordMode(mode)) return mode === "halloween" ? "halloween-words" : "words";
    if (mode === "random-letters") return "random-letters";
    if (mode === "numbers") return "numbers";
    return "letters";
  }

  function getCategoryStats(category) {
    if (!state.progression.categoryStats[category]) state.progression.categoryStats[category] = { exercises: 0, correctAnswers: 0, incorrectAnswers: 0, accuracyPoints: 0, characters: 0, xpEarned: 0 };
    return state.progression.categoryStats[category];
  }

  function getWpmStats() {
    const value = Math.round(Number(window.morseSettings?.effectiveWpm || 0));
    if (!value) return null;
    const key = String(value);
    if (!state.progression.wpmStats[key]) state.progression.wpmStats[key] = { exercises: 0, correctAnswers: 0, accuracyPoints: 0, characters: 0 };
    return state.progression.wpmStats[key];
  }

  function getActivity(date = todayKey()) {
    let activity = state.progression.dailyActivity.find((entry) => entry.date === date);
    if (!activity) {
      activity = { date, exercises: 0, correct: 0, accuracyPoints: 0, characters: 0, xp: 0, practiceMs: 0 };
      state.progression.dailyActivity.push(activity);
      state.progression.dailyActivity.sort((first, second) => first.date.localeCompare(second.date));
      state.progression.dailyActivity = state.progression.dailyActivity.slice(-1200);
    }
    return activity;
  }

  function awardXp(amount, reason, rewardId = "") {
    const value = Math.max(0, Math.round(Number(amount) || 0));
    if (!value) return 0;
    if (rewardId && state.progression.claimedRewardIds.includes(rewardId)) return 0;
    const levelBefore = getLevelInfo().level;
    if (rewardId) state.progression.claimedRewardIds.push(rewardId);
    state.progression.totalXp += value;
    state.progression.xpRewardHistory.push({ id: rewardId || `${todayKey()}-${Date.now()}`, date: todayKey(), amount: value, reason });
    state.progression.xpRewardHistory = state.progression.xpRewardHistory.slice(-1500);
    getActivity().xp += value;
    markDirty();
    const levelAfter = getLevelInfo().level;
    if (levelAfter > levelBefore) queueLevelUp(levelAfter);
    return value;
  }

  function exerciseXp(mode, matches, exact) {
    let value = isSentenceMode(mode) ? (exact ? 15 : 0) : isWordMode(mode) ? (exact ? 5 : 0) : Math.max(0, Math.round(matches)) * 2;
    if (exact) value += 10;
    return value;
  }

  function recordGradedActivity(detail, exact, matches, maxLength) {
    const progression = state.progression;
    const levelBefore = getLevelInfo().level;
    const category = getCategoryStats(categoryForMode(detail.mode));
    const wpm = getWpmStats();
    const activity = getActivity();
    const accuracy = Math.max(0, Math.min(100, Number(detail.accuracy) || 0));
    progression.totalExercisesCompleted += 1;
    progression.totalCorrectAnswers += exact ? 1 : 0;
    progression.totalIncorrectAnswers += exact ? 0 : 1;
    category.exercises += 1;
    category.correctAnswers += exact ? 1 : 0;
    category.incorrectAnswers += exact ? 0 : 1;
    category.accuracyPoints += accuracy * maxLength;
    category.characters += maxLength;
    if (wpm) {
      wpm.exercises += 1;
      wpm.correctAnswers += exact ? 1 : 0;
      wpm.accuracyPoints += accuracy * maxLength;
      wpm.characters += maxLength;
    }
    activity.exercises += 1;
    activity.correct += exact ? 1 : 0;
    activity.accuracyPoints += accuracy * maxLength;
    activity.characters += maxLength;
    let xp = 0;
    if (!activeExercise.xpAwarded) {
      xp += awardXp(exerciseXp(detail.mode, matches, exact), exact ? "Perfect exercise" : "Correct characters", `exercise:${activeExercise.id}`);
      if (Date.now() - Number(progression.lastSessionRewardAt || 0) >= 30 * 60 * 1000) {
        progression.lastSessionRewardAt = Date.now();
        xp += awardXp(20, "Practice session", `session:${todayKey()}:${Math.floor(Date.now() / (30 * 60 * 1000))}`);
      }
      activeExercise.xpAwarded = true;
    }
    category.xpEarned += xp;
    activeExercise.statsRecorded = true;
    markDirty();
    return { xp, levelBefore, levelAfter: getLevelInfo() };
  }

  function showXpToast(amount) {
    if (!amount) return;
    const toast = $("rpg-toast");
    if (!toast) return;
    toast.classList.remove("prominent", "accuracy-reward", "level-up", "show");
    toast.classList.add("xp-reward");
    toast.innerHTML = `<span class="xp-toast-kicker">PROGRESS EARNED</span><strong class="xp-toast-amount">+${amount} XP</strong>`;
    window.clearTimeout(toastTimer);
    window.requestAnimationFrame(() => toast.classList.add("show"));
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2300);
  }

  function showLevelUp(level) {
    const overlay = $("level-up-overlay");
    if (!overlay) return;
    const levelLabel = $("level-up-level");
    if (levelLabel) levelLabel.textContent = `LEVEL ${level}`;
    overlay.hidden = false;
    overlay.classList.remove("show");
    window.clearTimeout(levelUpTimer);
    window.requestAnimationFrame(() => overlay.classList.add("show"));
    levelUpTimer = window.setTimeout(() => {
      overlay.classList.remove("show");
      window.setTimeout(() => { if (!overlay.classList.contains("show")) overlay.hidden = true; }, 450);
    }, 3900);
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.08 + 0.18);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + index * 0.08);
        oscillator.stop(context.currentTime + index * 0.08 + 0.2);
      });
      window.setTimeout(() => context.close(), 700);
    } catch (_) {}
  }

  function queueLevelUp(level) {
    queuedLevelUp = Math.max(queuedLevelUp, level);
    window.clearTimeout(levelUpQueueTimer);
    levelUpQueueTimer = window.setTimeout(() => {
      const reachedLevel = queuedLevelUp;
      queuedLevelUp = 0;
      levelUpQueueTimer = 0;
      showLevelUp(reachedLevel);
    }, 450);
  }

  function showRpgToast(message, prominent = false) {
    const toast = $("rpg-toast");
    if (!toast) return;
    toast.classList.remove("accuracy-reward", "xp-reward", "level-up");
    toast.textContent = message;
    toast.classList.toggle("prominent", prominent);
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), prominent ? 3400 : 2600);
  }

  function showAccuracyToast() {
    const toast = $("rpg-toast");
    if (!toast) return;
    toast.classList.remove("prominent", "accuracy-reward", "xp-reward", "level-up", "show");
    toast.classList.add("accuracy-reward");
    toast.innerHTML = "<span class=\"accuracy-toast-kicker\"><span class=\"icon-svg inline-icon icon-sparkle\" aria-hidden=\"true\"></span> PERFECT COPY <span class=\"icon-svg inline-icon icon-sparkle\" aria-hidden=\"true\"></span></span><strong class=\"accuracy-toast-amount\">100% ACCURACY</strong><span class=\"accuracy-toast-label\">Clean transmission</span>";
    window.clearTimeout(toastTimer);
    window.requestAnimationFrame(() => toast.classList.add("show"));
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3400);
  }

  function recordPracticeTime(detail = {}) {
    if (detail.channel !== "practice") return;
    if (!activeExercise.playStartedAt) return;
    const elapsed = Math.max(0, Date.now() - activeExercise.playStartedAt);
    activeExercise.playStartedAt = 0;
    state.totalPracticeMs += elapsed;
    if (detail.completed) {
      ensureDaily();
      state.daily.progress.practiceMs += elapsed;
      state.daily.progress.practiceMinutes = Math.floor(state.daily.progress.practiceMs / 60000);
      getActivity().practiceMs += elapsed;
      markDirty();
      updateDailyQuests();
    }
    renderDaily();
  }

  function updateDailyQuests() {
    ensureDaily();
    let earned = 0;
    dailyQuests().forEach((quest) => {
      const value = Number(state.daily.progress[quest.metric] || 0);
      if (value >= quest.target && !state.daily.completed.includes(quest.id)) {
        state.daily.completed.push(quest.id);
        state.totalQuestsCompleted += 1;
        if (quest.season) state.halloweenQuestsCompleted += 1;
        earned += awardXp(25, `Daily quest: ${quest.title}`, `quest:${state.daily.date}:${quest.id}`);
      }
    });
    if (state.daily.completed.length === dailyQuests().length && !state.daily.allQuestsXpAwarded) {
      state.daily.allQuestsXpAwarded = true;
      earned += awardXp(50, "All daily quests", `all-quests:${state.daily.date}`);
    }
    if (state.daily.completed.length >= 3) earned += qualifyToday();
    saveState();
    renderDaily();
    return earned;
  }

  function handleScore(detail) {
    if (detail.source === "reveal") {
      activeExercise.revealed = true;
      return;
    }
    if (activeExercise.revealed || activeExercise.rewarded) return;
    if (!activeExercise.transmissionFinished) return;
    // The score event carries the authoritative mode. This keeps rewards working
    // even if the initial exercise-start event was missed during script loading.
    const exerciseMode = String(detail.mode || activeExercise.mode || "letters");
    activeExercise.mode = exerciseMode;
    ensureDaily();
    const expected = String(detail.expected || "");
    const actual = String(detail.actual || "");
    const accuracy = Math.max(0, Math.min(100, Number(detail.accuracy) || 0));
    const maxLength = Math.max(Number(detail.maxLength) || expected.length, 1);
    const exact = accuracy === 100 && expected === actual;
    const matches = Math.max(0, Number(detail.matches) || (exact ? maxLength : 0));
    let earned = 0;
    if (!activeExercise.statsRecorded) {
      state.totalAccuracyPoints += accuracy * maxLength;
      state.totalAccuracyCharacters += maxLength;
      const result = recordGradedActivity(detail, exact, matches, maxLength);
      earned += result.xp;
    }
    if (accuracy !== 100 || expected !== actual) {
      state.perfectStreak = 0;
      if (isSentenceMode(exerciseMode)) state.sentencePerfectStreak = 0;
      saveState();
      renderAll();
      if (earned) showXpToast(earned);
      return;
    }

    activeExercise.rewarded = true;
    state.successfulExercises += 1;
    state.totalCharacters += expected.replace(/\s/g, "").length;
    if (isSentenceMode(exerciseMode) && detail.themeId && state.themeProgress[detail.themeId]) {
      const completed = state.themeProgress[detail.themeId].completed;
      if (!completed.includes(expected)) completed.push(expected);
    }
    state.perfectStreak += 1;
    state.longestPerfectStreak = Math.max(state.longestPerfectStreak, state.perfectStreak);
    if (isWordMode(exerciseMode)) {
      state.totalWords += 1;
      state.daily.progress.words += 1;
      if (exerciseMode === "halloween") {
        state.halloweenWords += 1;
        state.daily.progress.halloweenWords += 1;
      }
    }
    if (isSentenceMode(exerciseMode)) {
      state.totalSentences += 1;
      state.daily.progress.sentences += 1;
      state.perfectSentences += 1;
      state.sentencePerfectStreak += 1;
      state.bestSentencePerfectStreak = Math.max(state.bestSentencePerfectStreak, state.sentencePerfectStreak);
      if (!activeExercise.rewinds) {
        state.sentencesNoRewind += 1;
        state.daily.progress.noRewindSentences += 1;
        state.daily.progress.perfectSentences += 1;
      }
      if (exerciseMode === "halloween-sentences") {
        state.daily.progress.halloweenSentences += 1;
        if (!activeExercise.rewinds) state.daily.progress.halloweenPerfectSentences += 1;
      }
    }
    if (Number(window.morseSettings?.effectiveWpm || 0) >= 10) state.perfectAt10 += 1;
    state.daily.progress.characters += expected.replace(/\s/g, "").length;
    earned += updateDailyQuests();
    saveState();
    showAccuracyToast();
    renderAll();
    if (earned) window.setTimeout(() => showXpToast(earned), 1500);
  }

  function renderThemeProgress() {
    const container = $("theme-progress-grid");
    if (!container) return;
    container.innerHTML = THEME_META.map((theme) => {
      const count = Math.min(500, state.themeProgress[theme.id]?.completed.length || 0);
      const percentage = (count / 500) * 100;
      return `<article class="theme-progress-card"><div class="theme-progress-icon"><span class="icon-svg icon-${theme.icon}" aria-hidden="true"></span></div><div class="theme-progress-copy"><div class="theme-progress-title"><strong>${escapeHtml(theme.name)}</strong><span>${count} / 500</span></div><div class="challenge-progress"><i style="width:${percentage}%"></i></div><small>${count === 500 ? "Library mastered" : `${500 - count} sentences remaining`}</small></div></article>`;
    }).join("");
  }

  function resetCountdownText() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const seconds = Math.max(0, Math.floor((next - now) / 1000));
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${remainingSeconds}`;
  }

  function updateResetCountdown() {
    const previousDate = state.daily.date;
    ensureDaily();
    if (previousDate && previousDate !== state.daily.date) renderDaily();
    if ($("daily-reset-countdown")) $("daily-reset-countdown").textContent = `Resets in ${resetCountdownText()}`;
  }

  function renderQuest(quest) {
    const raw = Number(state.daily.progress[quest.metric] || 0);
    const progress = Math.min(quest.target, raw);
    const complete = state.daily.completed.includes(quest.id);
    return `<article class="challenge-card quest-card${complete ? " complete" : ""}"><div class="challenge-icon"><span class="icon-svg icon-star" aria-hidden="true"></span></div><div class="challenge-copy"><div class="quest-title-row"><strong>${escapeHtml(quest.title)}</strong></div><span>${escapeHtml(quest.description)}</span><div class="challenge-progress"><i style="width:${(progress / quest.target) * 100}%"></i></div><small>${progress} / ${quest.target}${complete ? " · Complete" : ""}</small></div></article>`;
  }

  function renderDaily() {
    ensureDaily();
    const quests = dailyQuests();
    const completeCount = state.daily.completed.length;
    if ($("daily-date")) $("daily-date").textContent = state.daily.date;
    if ($("daily-quest-count")) $("daily-quest-count").textContent = `${completeCount}/5 quests complete`;
    if ($("daily-streak-status")) $("daily-streak-status").textContent = state.daily.qualified ? `Today qualifies · ${state.daily.currentStreak} day streak` : `Complete ${Math.max(0, 3 - completeCount)} more quest${3 - completeCount === 1 ? "" : "s"} to qualify for today’s streak.`;
    updateResetCountdown();
    if ($("daily-quests-standard")) $("daily-quests-standard").innerHTML = quests.filter((quest) => quest.group === "standard").map(renderQuest).join("");
    if ($("daily-quests-bonus")) $("daily-quests-bonus").innerHTML = quests.filter((quest) => quest.group === "bonus").map(renderQuest).join("");
  }

  function percentage(points, characters) {
    return characters ? Math.max(0, Math.min(100, Math.round((points / characters) * 100))) : 0;
  }

  function renderProgression() {
    const info = getLevelInfo();
    const streak = state.progression.practiceStreak;
    const values = {
      "compact-streak-label": `${streak.current}-Day Streak`,
      "compact-level-label": `Level ${info.level}`,
      "compact-xp": `${Math.round(info.currentXp).toLocaleString()} / ${info.requiredXp.toLocaleString()} XP`,
      "stats-level": `Level ${info.level}`,
      "stats-xp": `${Math.round(info.currentXp).toLocaleString()} / ${info.requiredXp.toLocaleString()} XP`,
      "stats-xp-total": Math.round(state.progression.totalXp).toLocaleString(),
      "stats-streak": `${streak.current} day${streak.current === 1 ? "" : "s"}`,
      "stats-longest-streak": `${streak.longest} day${streak.longest === 1 ? "" : "s"}`,
      "stats-exercises": state.progression.totalExercisesCompleted.toLocaleString(),
      "stats-correct": state.progression.totalCorrectAnswers.toLocaleString(),
      "stats-accuracy": `${percentage(state.totalAccuracyPoints, state.totalAccuracyCharacters)}%`,
      "stats-practice-time": formatDuration(state.totalPracticeMs),
      "stats-practice-days": streak.activeDays.toLocaleString()
    };
    Object.entries(values).forEach(([id, value]) => { if ($(id)) $(id).textContent = value; });
    ["compact-xp-bar", "stats-xp-bar"].forEach((id) => { if ($(id)) $(id).style.width = `${info.percent}%`; });
  }

  function statsEntries() {
    const entries = state.progression.dailyActivity.filter((entry) => entry && entry.date);
    if (selectedStatsRange === "all") return entries;
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - Number(selectedStatsRange) + 1);
    return entries.filter((entry) => dateFromKey(entry.date) >= cutoff);
  }

  function chartSvg(entries, value, color, suffix = "") {
    const width = 520;
    const height = 180;
    const padding = 24;
    const points = entries.map((entry) => Math.max(0, Number(value(entry)) || 0));
    if (!points.length || !points.some(Boolean)) return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="No data yet"><text x="260" y="92" text-anchor="middle" class="chart-empty-text">Practice to build this chart</text></svg>`;
    const max = Math.max(...points, 1);
    const coordinates = points.map((point, index) => {
      const x = points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - (point / max) * (height - padding * 2);
      return [x, y, point];
    });
    const polyline = coordinates.map(([x, y]) => `${x},${y}`).join(" ");
    const circles = coordinates.map(([x, y, point]) => `<circle cx="${x}" cy="${y}" r="3.5"><title>${point}${suffix}</title></circle>`).join("");
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Progress chart"><line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis"/><polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${circles}</svg>`;
  }

  function barChartSvg(entries, value, color) {
    const width = 520;
    const height = 180;
    const padding = 24;
    const points = entries.map((entry) => Math.max(0, Number(value(entry)) || 0));
    if (!points.length || !points.some(Boolean)) return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="No data yet"><text x="260" y="92" text-anchor="middle" class="chart-empty-text">Practice to build this chart</text></svg>`;
    const max = Math.max(...points, 1);
    const slot = (width - padding * 2) / points.length;
    const bars = points.map((point, index) => {
      const barHeight = (point / max) * (height - padding * 2);
      const x = padding + index * slot + slot * 0.16;
      const y = height - padding - barHeight;
      return `<rect x="${x}" y="${y}" width="${Math.max(2, slot * 0.68)}" height="${barHeight}" rx="3" fill="${color}"><title>${point}</title></rect>`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily activity chart"><line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis"/>${bars}</svg>`;
  }

  function renderStats() {
    const categoryGrid = $("category-stats-grid");
    if (categoryGrid) {
      categoryGrid.innerHTML = PROGRESSION_CATEGORIES.map(([id, label]) => {
        const item = state.progression.categoryStats[id] || { exercises: 0, correctAnswers: 0, incorrectAnswers: 0, accuracyPoints: 0, characters: 0, xpEarned: 0 };
        return `<div class="category-stat-row"><strong>${label}</strong><span>${item.exercises} exercises</span><span>${percentage(item.accuracyPoints, item.characters)}% accuracy</span><span>${item.correctAnswers} correct · ${item.incorrectAnswers} incorrect</span><span>${item.xpEarned} XP</span></div>`;
      }).join("");
    }
    const wpmGrid = $("wpm-stats-grid");
    if (wpmGrid) {
      const rows = Object.entries(state.progression.wpmStats).filter(([, item]) => item && item.exercises).sort(([first], [second]) => Number(first) - Number(second));
      wpmGrid.innerHTML = rows.length ? rows.map(([wpm, item]) => `<div class="wpm-stat-row"><strong>${escapeHtml(wpm)} WPM</strong><span>${percentage(item.accuracyPoints, item.characters)}% accuracy</span><span>${item.exercises} exercise${item.exercises === 1 ? "" : "s"}</span></div>`).join("") : `<p class="stats-empty">WPM results will appear after graded practice.</p>`;
      const highest = rows.filter(([, item]) => item.exercises >= 3 && percentage(item.accuracyPoints, item.characters) >= 90).at(-1);
      if ($("highest-wpm")) $("highest-wpm").textContent = highest ? `${highest[0]} WPM` : "—";
    }
    const entries = statsEntries();
    if ($("stats-range-label")) $("stats-range-label").textContent = selectedStatsRange === "all" ? "All time" : `Last ${selectedStatsRange} days`;
    if ($("xp-chart")) $("xp-chart").innerHTML = chartSvg(entries, (entry) => entry.xp, "#63d6b2", " XP");
    if ($("accuracy-chart")) $("accuracy-chart").innerHTML = chartSvg(entries, (entry) => percentage(entry.accuracyPoints, entry.characters), "#f2b861", "%");
    if ($("activity-chart")) $("activity-chart").innerHTML = barChartSvg(entries, (entry) => entry.exercises, "#9e8cff");
    if ($("exercise-chart")) $("exercise-chart").innerHTML = barChartSvg(entries, (entry) => entry.correct, "#ef7aa8");
  }

  function renderAll() {
    renderProgression();
    renderThemeProgress();
    renderDaily();
    renderStats();
  }

  function bindEvents() {
    window.addEventListener("morse:exercise-start", (event) => {
      activeExercise = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, mode: event.detail.mode || "letters", themeId: event.detail.themeId || "", rewinds: 0, pauses: 0, playStartedAt: 0, rewarded: false, revealed: false, transmissionFinished: false, statsRecorded: false, xpAwarded: false };
    });
    window.addEventListener("morse:playback-start", (event) => {
      if (event.detail?.channel !== "practice") return;
      if (!activeExercise.playStartedAt) activeExercise.playStartedAt = Date.now();
    });
    window.addEventListener("morse:playback-stop", (event) => {
      if (event.detail?.channel === "practice" && event.detail.completed) activeExercise.transmissionFinished = true;
      recordPracticeTime(event.detail);
    });
    window.addEventListener("morse:rewind", () => {
      activeExercise.rewinds += 1;
      state.totalRewinds += 1;
      saveState();
    });
    window.addEventListener("morse:pause", () => { activeExercise.pauses += 1; });
    window.addEventListener("morse:reveal", () => { activeExercise.revealed = true; });
    window.addEventListener("morse:score", (event) => handleScore(event.detail));
    document.querySelectorAll("[data-stats-range]").forEach((button) => button.addEventListener("click", () => {
      selectedStatsRange = button.dataset.statsRange === "all" ? "all" : Number(button.dataset.statsRange);
      document.querySelectorAll("[data-stats-range]").forEach((item) => item.classList.toggle("active", item === button));
      renderStats();
    }));
    window.setInterval(updateResetCountdown, 1000);
  }

  ensureDaily();
  bindEvents();
  renderAll();
})();
