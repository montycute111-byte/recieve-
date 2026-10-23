(() => {
  "use strict";

  const STORAGE_KEY = "morseReceiveRpgProgress";
  const RANKS = [
    { level: 1, name: "Signal Novice", icon: "◈" },
    { level: 3, name: "Signal Apprentice", icon: "◇" },
    { level: 6, name: "Code Operator", icon: "◆" },
    { level: 10, name: "Radio Specialist", icon: "✦" },
    { level: 15, name: "Morse Expert", icon: "✧" },
    { level: 21, name: "Master Operator", icon: "✪" },
    { level: 28, name: "Elite Operator", icon: "★" },
    { level: 36, name: "Morse Legend", icon: "♛" },
    { level: 45, name: "Grandmaster", icon: "♕" },
    { level: 55, name: "Morse Champion", icon: "☼" }
  ];
  const THEME_META = [
    { id: "video-games", icon: "🎮", name: "Video Games" },
    { id: "movies-tv", icon: "🎬", name: "Movies & TV" },
    { id: "famous-quotes", icon: "💬", name: "Famous Quotes" },
    { id: "jokes-riddles", icon: "😂", name: "Jokes & Riddles" },
    { id: "music", icon: "🎵", name: "Music" },
    { id: "general-sentences", icon: "📝", name: "General Sentences" }
  ];
  const STANDARD_QUESTS = [
    { id: "warm-up", title: "Warm-Up", description: "Decode 10 words correctly.", target: 10, reward: 25, metric: "words", group: "standard" },
    { id: "sentence-starter", title: "Sentence Starter", description: "Decode 10 sentences correctly.", target: 10, reward: 50, metric: "sentences", group: "standard" },
    { id: "steady-signal", title: "Steady Signal", description: "Decode 30 characters correctly.", target: 30, reward: 35, metric: "characters", group: "standard" },
    { id: "time-on-air", title: "Time on the Air", description: "Practice for 10 minutes.", target: 10, reward: 45, metric: "practiceMinutes", group: "standard" },
    { id: "signal-check", title: "Signal Check", description: "Decode 5 words correctly.", target: 5, reward: 20, metric: "words", group: "standard" }
  ];
  const BONUS_QUESTS = [
    { id: "cw-marathon", title: "CW Marathon", description: "Decode 250 characters correctly.", target: 250, reward: 200, metric: "characters", group: "bonus" },
    { id: "sentence-marathon", title: "Sentence Marathon", description: "Decode 25 sentences correctly.", target: 25, reward: 180, metric: "sentences", group: "bonus" },
    { id: "deep-reception", title: "Deep Reception", description: "Practice for 25 minutes.", target: 25, reward: 225, metric: "practiceMinutes", group: "bonus" }
  ];
  const SEASONAL_QUESTS = [
    { id: "halloween-25", title: "Haunted Warm-Up", description: "Decode 25 Halloween words correctly.", target: 25, reward: 75, metric: "halloweenWords", group: "bonus", season: "halloween" },
    { id: "halloween-100", title: "Halloween Marathon", description: "Decode 100 Halloween-themed words.", target: 100, reward: 150, metric: "halloweenWords", group: "bonus", season: "halloween" },
    { id: "halloween-sentences", title: "Spooky Story", description: "Complete 10 Halloween sentences.", target: 10, reward: 125, metric: "halloweenSentences", group: "bonus", season: "halloween" },
  ];
  const QUESTS = [...STANDARD_QUESTS, ...BONUS_QUESTS, ...SEASONAL_QUESTS];
  const REMOVED_QUEST_IDS = new Set(["perfect-copy", "clean-circuit", "perfect-run", "halloween-perfect"]);
  const REMOVED_ACHIEVEMENT_IDS = new Set(["unstoppable", "perfect-signal", "perfect-reception"]);
  const ACHIEVEMENTS = [
    { id: "first-quest", icon: "◇", title: "First Transmission", description: "Complete your first daily quest.", target: 1, getProgress: (s) => s.totalQuestsCompleted },
    { id: "flawless", icon: "✦", title: "Flawless Victory", description: "Complete a sentence with 100% accuracy.", target: 1, getProgress: (s) => s.perfectSentences },
    { id: "five-day-streak", icon: "▣", title: "Five-Day Streak", description: "Maintain a five-day daily practice streak.", target: 5, getProgress: (s) => s.daily.longestStreak },
    { id: "night-owl", icon: "☾", title: "Night Owl", description: "Successfully decode 100 Halloween-themed words.", target: 100, getProgress: (s) => s.halloweenWords },
    { id: "speed-demon", icon: "➤", title: "Speed Demon", description: "Achieve 100% accuracy at 10 WPM.", target: 1, getProgress: (s) => s.perfectAt10 },
    { id: "halloween-hero", icon: "☠", title: "Halloween Hero", description: "Complete 10 Halloween quests.", target: 10, getProgress: (s) => s.halloweenQuestsCompleted },
    { id: "morse-master", icon: "♛", title: "Morse Master", description: "Complete 1,000 practice exercises.", target: 1000, getProgress: (s) => s.successfulExercises },
    { id: "cw-champion", icon: "★", title: "CW Champion", description: "Complete 100 daily quests.", target: 100, getProgress: (s) => s.totalQuestsCompleted }
  ];

  const defaultState = () => ({
    totalXP: 0,
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
    unlockedAchievements: [],
    themeProgress: Object.fromEntries(THEME_META.map((theme) => [theme.id, { completed: [] }])),
    daily: {
      date: "",
      questIds: [],
      progress: { words: 0, sentences: 0, perfectSentences: 0, noRewindSentences: 0, characters: 0, practiceMinutes: 0, practiceMs: 0, halloweenWords: 0, halloweenSentences: 0, halloweenPerfectSentences: 0 },
      completed: [],
      qualified: false,
      currentStreak: 0,
      longestStreak: 0,
      successfulDays: 0,
      lastQualifiedDate: ""
    }
  });

  const $ = (id) => document.getElementById(id);
  const state = loadState();
  let activeExercise = { mode: "letters", rewinds: 0, pauses: 0, playStartedAt: 0, rewarded: false, revealed: false };
  let toastTimer = 0;

  function loadState() {
    const fresh = defaultState();
    try {
      const saved = JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return fresh;
      return {
        ...fresh,
        ...saved,
        unlockedAchievements: Array.isArray(saved.unlockedAchievements) ? saved.unlockedAchievements.filter((id) => !REMOVED_ACHIEVEMENT_IDS.has(id)) : [],
        themeProgress: Object.fromEntries(THEME_META.map((theme) => [theme.id, {
          ...fresh.themeProgress[theme.id],
          ...((saved.themeProgress || {})[theme.id] || {}),
          completed: Array.isArray((saved.themeProgress || {})[theme.id]?.completed) ? [...new Set((saved.themeProgress || {})[theme.id].completed)] : []
        }])),
        daily: { ...fresh.daily, ...(saved.daily || {}), questIds: Array.isArray((saved.daily || {}).questIds) ? saved.daily.questIds : [], progress: { ...fresh.daily.progress, ...((saved.daily || {}).progress || {}) }, completed: Array.isArray((saved.daily || {}).completed) ? saved.daily.completed : [] }
      };
    } catch (_) {
      return fresh;
    }
  }

  function saveState() {
    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // Progress still updates for the current session if storage is blocked.
    }
  }

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

  function qualifyToday() {
    if (state.daily.qualified) return;
    const today = state.daily.date || todayKey();
    const previous = state.daily.lastQualifiedDate;
    state.daily.currentStreak = previous && daysBetween(previous, today) === 1 ? state.daily.currentStreak + 1 : 1;
    state.daily.longestStreak = Math.max(state.daily.longestStreak, state.daily.currentStreak);
    state.daily.successfulDays += 1;
    state.daily.lastQualifiedDate = today;
    state.daily.qualified = true;
    showRpgToast(`STREAK DAY COMPLETE! ${state.daily.currentStreak} day${state.daily.currentStreak === 1 ? "" : "s"}`, true);
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
      saveState();
    } else if (!Array.isArray(state.daily.questIds) || state.daily.questIds.length !== 5 || state.daily.questIds.some((id) => REMOVED_QUEST_IDS.has(id) || !QUESTS.some((quest) => quest.id === id))) {
      state.daily.questIds = questIdsForDate(date);
      state.daily.progress = emptyDailyProgress();
      state.daily.completed = [];
      state.daily.qualified = false;
      saveState();
    }
  }

  function xpForNextLevel(level) {
    return 100 + ((level - 1) * 50) + ((level - 1) ** 2 * 10);
  }

  function levelData(totalXP) {
    let level = 1;
    let remaining = Math.max(0, Number(totalXP) || 0);
    let required = xpForNextLevel(level);
    let guard = 0;
    while (remaining >= required && guard < 10000) {
      remaining -= required;
      level += 1;
      required = xpForNextLevel(level);
      guard += 1;
    }
    return { level, current: remaining, required };
  }

  function rankForLevel(level) {
    return [...RANKS].reverse().find((rank) => level >= rank.level) || RANKS[0];
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

  function showRpgToast(message, prominent = false) {
    const toast = $("rpg-toast");
    if (!toast) return;
    toast.classList.remove("xp-reward", "level-up");
    toast.textContent = message;
    toast.classList.toggle("prominent", prominent);
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), prominent ? 3400 : 2600);
  }

  function showXpToast(amount, label, levelUp = false) {
    const toast = $("rpg-toast");
    if (!toast) return;
    toast.classList.remove("prominent", "level-up", "show");
    toast.classList.add("xp-reward");
    toast.innerHTML = `<span class="xp-toast-kicker">✦ XP EARNED</span><strong class="xp-toast-amount">+${amount} XP</strong><span class="xp-toast-label">${escapeHtml(label)}</span>`;
    window.clearTimeout(toastTimer);
    window.requestAnimationFrame(() => toast.classList.add("show"));
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), levelUp ? 4300 : 3400);
  }

  function showLevelUpToast(level, rank) {
    const toast = $("rpg-toast");
    if (!toast) return;
    toast.classList.remove("prominent", "xp-reward", "show");
    toast.classList.add("level-up");
    toast.innerHTML = `<span class="level-toast-kicker">✦ LEVEL UP ✦</span><strong class="level-toast-number">LEVEL ${level}</strong><span class="level-toast-rank">${escapeHtml(rank.icon)} ${escapeHtml(rank.name)}</span>`;
    window.clearTimeout(toastTimer);
    window.requestAnimationFrame(() => toast.classList.add("show"));
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4600);
  }

  function grantXp(amount, label) {
    if (!amount) return;
    const before = levelData(state.totalXP).level;
    state.totalXP += amount;
    const afterData = levelData(state.totalXP);
    saveState();
    renderProgression();
    showXpToast(amount, label, afterData.level > before);
    if (afterData.level > before) {
      const rank = rankForLevel(afterData.level);
      window.setTimeout(() => showLevelUpToast(afterData.level, rank), 2500);
    }
  }

  function recordPracticeTime(detail = {}) {
    if (!activeExercise.playStartedAt) return;
    const elapsed = Math.max(0, Date.now() - activeExercise.playStartedAt);
    activeExercise.playStartedAt = 0;
    state.totalPracticeMs += elapsed;
    if (detail.completed) {
      ensureDaily();
      state.daily.progress.practiceMs += elapsed;
      state.daily.progress.practiceMinutes = Math.floor(state.daily.progress.practiceMs / 60000);
      updateDailyQuests();
    }
    renderStats();
    renderDaily();
  }

  function updateDailyQuests() {
    ensureDaily();
    dailyQuests().forEach((quest) => {
      const value = Number(state.daily.progress[quest.metric] || 0);
      if (value >= quest.target && !state.daily.completed.includes(quest.id)) {
        state.daily.completed.push(quest.id);
        state.totalQuestsCompleted += 1;
        if (quest.season) state.halloweenQuestsCompleted += 1;
        grantXp(quest.reward, `QUEST COMPLETE! ${quest.title}`);
        checkAchievements();
      }
    });
    if (state.daily.completed.length >= 3) qualifyToday();
    saveState();
    renderDaily();
    renderStats();
    renderAchievements();
  }

  function checkAchievements() {
    ACHIEVEMENTS.forEach((achievement) => {
      const progress = achievement.getProgress(state);
      if (progress >= achievement.target && !state.unlockedAchievements.includes(achievement.id)) {
        state.unlockedAchievements.push(achievement.id);
        showRpgToast(`ACHIEVEMENT UNLOCKED! ${achievement.title}`, true);
      }
    });
  }

  function handleScore(detail) {
    if (detail.source === "reveal") {
      activeExercise.revealed = true;
      return;
    }
    if (activeExercise.revealed || activeExercise.rewarded) return;
    // The score event carries the authoritative mode. This keeps rewards working
    // even if the initial exercise-start event was missed during script loading.
    const exerciseMode = String(detail.mode || activeExercise.mode || "letters");
    activeExercise.mode = exerciseMode;
    ensureDaily();
    const expected = String(detail.expected || "");
    const actual = String(detail.actual || "");
    const accuracy = Number(detail.accuracy) || 0;
    const maxLength = Math.max(Number(detail.maxLength) || expected.length, 1);
    state.totalAccuracyPoints += accuracy * maxLength;
    state.totalAccuracyCharacters += maxLength;
    if (accuracy !== 100 || expected !== actual) {
      state.perfectStreak = 0;
      if (isSentenceMode(exerciseMode)) state.sentencePerfectStreak = 0;
      saveState();
      renderAll();
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
    let xp = 0;
    let label = "PERFECT COPY!";

    if (isWordMode(exerciseMode)) {
      state.totalWords += 1;
      xp += 10;
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
      xp += 50;
      if (!activeExercise.rewinds) {
        state.sentencesNoRewind += 1;
        state.daily.progress.noRewindSentences += 1;
        state.daily.progress.perfectSentences += 1;
      }
      if (exerciseMode === "halloween-sentences") {
        state.daily.progress.halloweenSentences += 1;
        if (!activeExercise.rewinds) state.daily.progress.halloweenPerfectSentences += 1;
      }
      label = "FLAWLESS TRANSMISSION!";
    }
    if (!activeExercise.rewinds) xp += 25;
    if (!activeExercise.pauses) xp += 15;
    if (state.perfectStreak % 5 === 0) xp += state.perfectStreak % 10 === 0 ? 200 : 100;
    if (Number(window.morseSettings?.effectiveWpm || 0) >= 10) state.perfectAt10 += 1;
    state.daily.progress.characters += expected.replace(/\s/g, "").length;
    updateDailyQuests();
    checkAchievements();
    saveState();
    grantXp(xp, label);
    renderAll();
  }

  function renderProgression() {
    const data = levelData(state.totalXP);
    const rank = rankForLevel(data.level);
    if ($("rpg-level")) $("rpg-level").textContent = data.level;
    if ($("rpg-rank")) $("rpg-rank").textContent = rank.name;
    if ($("rpg-rank-icon")) $("rpg-rank-icon").textContent = rank.icon;
    if ($("progress-rank-label")) $("progress-rank-label").textContent = rank.name;
    if ($("rpg-xp-label")) $("rpg-xp-label").textContent = `${data.current} / ${data.required} XP`;
    if ($("rpg-next-level")) $("rpg-next-level").textContent = `${data.required - data.current} XP to next level`;
    if ($("rpg-xp-fill")) $("rpg-xp-fill").style.width = `${Math.min(100, (data.current / data.required) * 100)}%`;
    if ($("rpg-xp-message")) $("rpg-xp-message").textContent = `${rank.name} · ${state.perfectStreak} perfect answer${state.perfectStreak === 1 ? "" : "s"} in a row`;
  }

  function renderStats() {
    const data = levelData(state.totalXP);
    const rank = rankForLevel(data.level);
    const accuracy = state.totalAccuracyCharacters ? Math.round(state.totalAccuracyPoints / state.totalAccuracyCharacters) : 0;
    const stats = [
      ["Total XP", state.totalXP], ["Level", data.level], ["Rank", rank.name], ["Overall accuracy", `${accuracy}%`],
      ["Words decoded", state.totalWords], ["Sentences decoded", state.totalSentences], ["Characters decoded", state.totalCharacters],
      ["Perfect streak", state.perfectStreak], ["Longest streak", state.longestPerfectStreak], ["Rewinds", state.totalRewinds],
      ["Practice time", formatDuration(state.totalPracticeMs)],
      ["Daily streak", state.daily.currentStreak], ["Longest daily streak", state.daily.longestStreak], ["Successful days", state.daily.successfulDays],
      ["Quests completed", state.totalQuestsCompleted], ["Achievements", `${state.unlockedAchievements.length}/${ACHIEVEMENTS.length}`]
    ];
    if ($("rpg-stat-grid")) $("rpg-stat-grid").innerHTML = stats.map(([label, value]) => `<div class="rpg-stat-tile"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  }

  function renderThemeProgress() {
    const container = $("theme-progress-grid");
    if (!container) return;
    container.innerHTML = THEME_META.map((theme) => {
      const count = Math.min(500, state.themeProgress[theme.id]?.completed.length || 0);
      const percentage = (count / 500) * 100;
      return `<article class="theme-progress-card"><div class="theme-progress-icon">${theme.icon}</div><div class="theme-progress-copy"><div class="theme-progress-title"><strong>${escapeHtml(theme.name)}</strong><span>${count} / 500</span></div><div class="challenge-progress"><i style="width:${percentage}%"></i></div><small>${count === 500 ? "Library mastered" : `${500 - count} sentences remaining`}</small></div></article>`;
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
    return `<article class="challenge-card quest-card${complete ? " complete" : ""}"><div class="challenge-icon">${complete ? "✓" : quest.season ? "☾" : "◇"}</div><div class="challenge-copy"><div class="quest-title-row"><strong>${escapeHtml(quest.title)}</strong><b>+${quest.reward} XP</b></div><span>${escapeHtml(quest.description)}</span><div class="challenge-progress"><i style="width:${(progress / quest.target) * 100}%"></i></div><small>${progress} / ${quest.target}${complete ? " · Complete" : ""}</small></div></article>`;
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

  function renderAchievements() {
    if ($("achievement-count")) $("achievement-count").textContent = `${state.unlockedAchievements.length}/${ACHIEVEMENTS.length} unlocked`;
    if (!$('achievement-grid')) return;
    $("achievement-grid").innerHTML = ACHIEVEMENTS.map((achievement) => {
      const progress = Math.min(achievement.target, achievement.getProgress(state));
      const unlocked = state.unlockedAchievements.includes(achievement.id);
      return `<article class="achievement-card${unlocked ? " unlocked" : ""}"><div class="achievement-icon">${achievement.icon}</div><div class="achievement-copy"><strong>${escapeHtml(achievement.title)}</strong><span>${escapeHtml(achievement.description)}</span><div class="challenge-progress"><i style="width:${(progress / achievement.target) * 100}%"></i></div><small>${progress} / ${achievement.target}${unlocked ? " · Unlocked" : ""}</small></div></article>`;
    }).join("");
  }

  function renderAll() {
    renderProgression();
    renderStats();
    renderThemeProgress();
    renderDaily();
    renderAchievements();
  }

  function bindEvents() {
    window.addEventListener("morse:exercise-start", (event) => {
      activeExercise = { mode: event.detail.mode || "letters", themeId: event.detail.themeId || "", rewinds: 0, pauses: 0, playStartedAt: 0, rewarded: false, revealed: false };
    });
    window.addEventListener("morse:playback-start", () => {
      if (!activeExercise.playStartedAt) activeExercise.playStartedAt = Date.now();
    });
    window.addEventListener("morse:playback-stop", (event) => recordPracticeTime(event.detail));
    window.addEventListener("morse:rewind", () => {
      activeExercise.rewinds += 1;
      state.totalRewinds += 1;
      saveState();
      renderStats();
    });
    window.addEventListener("morse:pause", () => { activeExercise.pauses += 1; });
    window.addEventListener("morse:score", (event) => handleScore(event.detail));
    window.setInterval(updateResetCountdown, 1000);
  }

  ensureDaily();
  bindEvents();
  renderAll();
})();
