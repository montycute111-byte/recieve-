(() => {
  "use strict";

  const MORSE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
    5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.", "=": "-...-"
  };

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUMBERS = "0123456789";
  const WORDS = [
    "RADIO", "SIGNAL", "RECEIVE", "COPY", "PRACTICE", "MORSE", "LISTEN", "READY", "DECODE", "OPERATOR", "CONTACT", "BEACON",
    "ALERT", "ANSWER", "ARRIVE", "ARROW", "AUDIO", "AUTUMN", "AWAKE", "BACK", "BASIC", "BEACH", "BEAM", "BEGIN", "BETTER", "BIRD", "BLACK", "BLUE", "BOARD", "BOLD", "BOOK", "BRAVE", "BRIDGE", "BRIGHT", "BROAD", "BROWN", "BUILD", "CABLE", "CALL", "CALM", "CAMP", "CANAL", "CARRY", "CHAIN", "CHANGE", "CHARLIE", "CHECK", "CLEAR", "CLOCK", "CLOSE", "CLOUD", "COAST", "CODE", "COFFEE", "COLD", "COMET", "COMMON", "COMPASS", "CORRECT", "COUNT", "COURSE", "COVER", "CROSS", "CYCLE", "DASH", "DATA", "DAWN", "DELAY", "DELTA", "DEPTH", "DIAMOND", "DIGIT", "DIRECT", "DOOR", "DOT", "DOWN", "DRIVE", "EAGLE", "EARLY", "EARTH", "ECHO", "EIGHT", "ELBOW", "ELECTRIC", "EMPTY", "ENTER", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXTRA", "FAMILY", "FAST", "FIELD", "FIFTH", "FINAL", "FIRE", "FIRST", "FIVE", "FLASH", "FLAT", "FOCUS", "FORWARD", "FOUR", "FRAME", "FREQUENCY", "FRIDAY", "FRONT", "FROST", "FULL", "GATE", "GATHER", "GENTLE", "GHOST", "GIVE", "GLASS", "GLOBE", "GOAL", "GOLD", "GOOD", "GREEN", "GROUP", "GUARD", "GUIDE", "HALF", "HAND", "HARBOR", "HARD", "HEAR", "HEART", "HEAVY", "HELLO", "HELP", "HIGH", "HOLD", "HOME", "HORIZON", "HOTEL", "HOUR", "HOUSE", "IDEA", "IMAGE", "INDEX", "INPUT", "ISLAND", "JULIET", "JUMP", "KEEP", "KEY", "KIND", "KILO", "KNOW", "LAMP", "LARGE", "LASER", "LAST", "LATE", "LAUNCH", "LEARN", "LEFT", "LIGHT", "LINE", "LINK", "LION", "LOCAL", "LOGIC", "LONG", "LOW", "LUCKY", "MAGIC", "MAIN", "MAP", "MARCH", "MARK", "MAYBE", "MEET", "MESSAGE", "METER", "MIDDLE", "MILE", "MINUTE", "MIXED", "MOON", "MORNING", "MOTION", "MOUNTAIN", "MUSIC", "NARROW", "NIGHT", "NORTH", "NOTE", "OCEAN", "OCTOBER", "OFF", "ONWARD", "OPEN", "ORANGE", "ORDER", "OTHER", "OUTER", "PAPER", "PARADE", "PART", "PAUSE", "PEACE", "PEARL", "PHONE", "PILOT", "PLAIN", "PLAN", "PLANT", "PLUTO", "POINT", "POWER", "PRESS", "PRIME", "PROPER", "PULSE", "QUICK", "QUIET", "RADAR", "RANGE", "RAPID", "REPEAT", "REPORT", "RESCUE", "RIGHT", "RIVER", "ROGER", "ROUND", "ROUTE", "ROYAL", "SAME", "SCHOOL", "SECOND", "SEVEN", "SHADOW", "SHARE", "SHIFT", "SHORT", "SHOW", "SIMPLE", "SIX", "SKY", "SLOW", "SMALL", "SOLAR", "SOUND", "SOUTH", "SPACE", "SPEED", "SPELL", "STAR", "START", "STATION", "STEADY", "STONE", "STOP", "STORM", "STREET", "STRONG", "SUMMER", "SUN", "SWIFT", "TABLE", "TAKE", "TEAM", "TEN", "THREE", "THUNDER", "TIGER", "TONE", "TRACK", "TRAIN", "TRANSIT", "TRAVEL", "TREE", "TRUST", "TUNE", "TWO", "UNDER", "UNION", "UNIQUE", "UNIT", "UPPER", "VALUE", "VOICE", "WATER", "WAVE", "WAY", "WEST", "WHISPER", "WHITE", "WHOLE", "WINDOW", "WINTER", "WISDOM", "WOLF", "WOMAN", "WORD", "WORK", "WORLD", "WRITE", "YEAR", "YELLOW", "YOUNG", "ZERO", "ZULU"
  ];
  const HALLOWEEN_WORDS = [
    "AUTUMN", "BAT", "BLACK", "BONES", "BOO", "BROOM", "CANDLE", "CANDY", "CAPE", "CASKET", "CAULDRON", "CEMETERY",
    "CLOAK", "COBWEB", "COSTUME", "COVEN", "CREEPY", "CROW", "DARK", "DEMON", "DRACULA", "EERIE", "FANG", "FRIGHT",
    "GHOST", "GHOUL", "GOBLIN", "GRAVE", "HAUNT", "HAUNTED", "HARVEST", "HOWL", "JACKOLANTERN", "MAGIC", "MASK",
    "MIDNIGHT", "MOON", "MONSTER", "MUMMY", "NIGHT", "OCTOBER", "ORANGE", "OWL", "PHANTOM", "POTION", "PUMPKIN", "RAVEN",
    "RITUAL", "SCARY", "SCREAM", "SHADOW", "SKELETON", "SPELL", "SPIDER", "SPOOK", "SPOOKY", "TREAT", "TRICK", "VAMPIRE",
    "WARLOCK", "WEB", "WITCH", "WOLF", "ZOMBIE"
  ];
  const SENTENCES = [
    "THE RADIO IS READY.", "SEND THE NEXT MESSAGE.", "LISTEN FOR THE SIGNAL.", "THE NIGHT IS CALM.",
    "MEET AT THE LIGHTHOUSE.", "COPY THE MESSAGE CLEARLY.", "PRACTICE MAKES PROGRESS.", "THE BEACON IS ON.",
    "WAIT FOR THE NEXT TONE.", "THE WEATHER IS CLEAR.", "KEEP YOUR COPY STEADY.", "CALL WHEN YOU ARE READY.",
    "THE SIGNAL IS STRONG.", "TURN THE VOLUME DOWN.", "MORSE CODE TAKES PRACTICE.", "THE TRAIN ARRIVES AT NOON.",
    "THE BAT FLIES AT MIDNIGHT.", "THE GHOST IS IN THE HOUSE.", "PUMPKINS GLOW AFTER DARK.", "WATCH FOR THE BLACK CAT.",
    "TRICK OR TREAT TONIGHT.", "THE MOON IS BRIGHT.", "A QUIET SIGNAL CARRIES FAR.", "THE OPERATOR COPIED IT RIGHT."
  ];
  const HALLOWEEN_SENTENCES = [
    "THE WITCH FLIES OVER THE MOON.", "A GHOST WHISPERS IN THE HALL.", "THE BLACK CAT WATCHES THE DOOR.",
    "THE PUMPKIN GLOWS IN THE DARK.", "THE VAMPIRE HIDES UNDER THE CLOAK.", "BATS FLY OVER THE OLD CEMETERY.",
    "THE CAULDRON BUBBLES AT MIDNIGHT.", "A CROW CALLS FROM THE TOWER.", "THE GOBLIN GUARDS THE CANDY.",
    "THE SKELETON DANCES IN THE GRAVEYARD.", "A SPOOKY SHADOW CROSSES THE WALL.", "THE WEREWOLF HOWLS AT THE MOON.",
    "THE WITCH BREWS A MAGIC POTION.", "THE HAUNTED HOUSE IS VERY QUIET.", "A PHANTOM WALKS THROUGH THE MIST.",
    "THE OWL FLIES PAST THE WINDOW.", "THE MONSTER HIDES BEHIND THE TREE.", "THE CANDY BOWL IS FULL TONIGHT.",
    "A RAVEN SITS ON THE OLD GATE.", "THE SPELL BEGINS AFTER DARK.", "THE MUMMY WAKES AT MIDNIGHT.",
    "THE CEMETERY GATE CREAKS OPEN.", "A BLACK BAT CIRCLES THE HOUSE.", "THE PUMPKINS LINE THE PATH.",
    "THE FULL MOON SHINES ON THE CASTLE.", "A CANDLE FLICKERS IN THE WINDOW.", "THE WITCH HIDES A KEY IN THE COBWEB.",
    "THE GHOST DRIFTS THROUGH THE ATTIC.", "A PUMPKIN ROLLS DOWN THE HILL.", "THE VAMPIRE HEARS A SOUND OUTSIDE.",
    "THE OLD SPELL OPENS THE SECRET DOOR.", "A SKELETON RATTLES ITS BONES.", "THE OWL GUARDS THE HAUNTED TREE.",
    "THE GOBLIN LAUGHS BESIDE THE FIRE.", "A BLACK CAT CROSSES THE PATH.", "THE CROW FLIES OVER THE GRAVE.",
    "THE MOONLIGHT FILLS THE EMPTY ROOM.", "A MUMMY WALKS THROUGH THE SAND.", "THE CAULDRON SMOKES IN THE KITCHEN.",
    "THE MONSTER SLEEPS UNDER THE BED.", "A RAVEN KNOCKS ON THE WINDOW.", "THE WITCH LIGHTS THREE CANDLES.",
    "THE HAUNTED CLOCK STRIKES TWELVE.", "A BAT HIDES IN THE OLD BARN.", "THE PHANTOM WAITS BY THE GATE.",
    "THE PUMPKIN PATCH GLOWS AT NIGHT.", "A WOLF HOWLS BEHIND THE HOUSE.", "THE CEMETERY IS QUIET TONIGHT.",
    "THE SPELL FADES AT SUNRISE.", "A GHOST RINGS THE DOORBELL.", "THE CANDY DISAPPEARS FROM THE BOWL."
  ];
  const THEME_STORAGE_KEY = "morseReceiveSentenceThemes";
  const THEME_META = [
    { id: "video-games", icon: "🎮", name: "Video Games" },
    { id: "movies-tv", icon: "🎬", name: "Movies & TV" },
    { id: "famous-quotes", icon: "💬", name: "Famous Quotes" },
    { id: "jokes-riddles", icon: "😂", name: "Jokes & Riddles" },
    { id: "music", icon: "🎵", name: "Music" },
    { id: "general-sentences", icon: "📝", name: "General Sentences" },
    { id: "halloween", icon: "🎃", name: "Halloween" }
  ];
  const THEME_IDS = THEME_META.map((theme) => theme.id);
  const STORAGE_KEY = "morseReceiveSettings";
  const STANDARD = {
    characterWpm: 5, effectiveWpm: 5, frequency: 699, volume: 62,
    silenceBefore: 0.7, silenceAfter: 0.7, countdown: true,
    repeatCorrect: false, profileName: "Operator"
  };
  const DEFAULT_EXERCISE_GROUP_SIZE = 5;

  const $ = (id) => document.getElementById(id);
  const exercisePools = new Map();
  const themePools = new Map();
  const themeCache = new Map();
  const settings = loadSettings();
  let selectedThemes = loadSelectedThemes();
  window.morseSettings = settings;
  const playback = {
    active: false, paused: false, countdown: false, currentIndex: 0,
    runId: 0, audio: null, oscillator: null, toastTimer: null, successAudio: null
  };
  let exercise = "";
  let exerciseThemeId = "";
  let exerciseGeneration = 0;
  let lastAnswerCorrect = false;
  let exerciseRevealed = false;
  let transmissionFinished = false;
  let awaitingNext = false;
  let listenExercise = "";
  let listenThemeId = "";
  let listenGeneration = 0;
  let listenAwaitingNext = false;
  const listenPlayback = {
    active: false, paused: false, countdown: false, currentIndex: 0,
    runId: 0, audio: null, oscillator: null
  };

  function loadSettings() {
    try {
      return { ...STANDARD, ...JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || "{}") };
    } catch (_) {
      return { ...STANDARD };
    }
  }

  function saveSettings() {
    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {
      // Settings remain active for the current session if storage is blocked.
    }
  }

  function loadSelectedThemes() {
    try {
      const saved = JSON.parse(window.localStorage?.getItem(THEME_STORAGE_KEY) || "null");
      const valid = Array.isArray(saved) ? saved.filter((id) => THEME_IDS.includes(id)) : [];
      return valid.length ? [...new Set(valid)] : [...THEME_IDS];
    } catch (_) {
      return [...THEME_IDS];
    }
  }

  function saveSelectedThemes() {
    try {
      window.localStorage?.setItem(THEME_STORAGE_KEY, JSON.stringify(selectedThemes));
    } catch (_) {
      // The selection remains active for the current session if storage is blocked.
    }
  }

  function isThemedSentenceMode(mode) {
    return mode === "sentences";
  }

  function isThemedWordMode(mode) {
    return mode === "phrases";
  }

  function isRandomLettersMode(mode) {
    return mode === "random-letters";
  }

  function randomLettersLength(selectId) {
    const length = Number($(selectId)?.value);
    return [5, 10, 15].includes(length) ? length : DEFAULT_EXERCISE_GROUP_SIZE;
  }

  function isThemedPracticeMode(mode) {
    return isThemedSentenceMode(mode) || isThemedWordMode(mode);
  }

  function themePoolKey(prefix) {
    return `${prefix}:${selectedThemes.slice().sort().join("|")}`;
  }

  async function loadThemeData(themeId) {
    if (!themeCache.has(themeId)) {
      const request = fetch(`themes/${themeId}.json?v=2`).then((response) => {
        if (!response.ok) throw new Error(`Unable to load the ${themeId} sentence library.`);
        return response.json();
      });
      themeCache.set(themeId, request);
    }
    return themeCache.get(themeId);
  }

  async function loadThemePool(prefix) {
    const key = themePoolKey(`${prefix}:sentences`);
    const loaded = await Promise.all(selectedThemes.map(async (themeId) => {
      const data = await loadThemeData(themeId);
      const sentences = ["short", "medium", "long"].flatMap((group) => Array.isArray(data[group]) ? data[group] : []);
      return sentences.map((text) => ({ text, themeId }));
    }));
    return { key, items: loaded.flat() };
  }

  async function loadThemePhrasePool(prefix) {
    const key = themePoolKey(`${prefix}:phrases`);
    const loaded = await Promise.all(selectedThemes.map(async (themeId) => {
      const data = await loadThemeData(themeId);
      return (Array.isArray(data.phrases) ? data.phrases : []).map((text) => ({ text, themeId }));
    }));
    return { key, items: loaded.flat() };
  }


  function drawThemeUnused(items, key) {
    let used = themePools.get(key);
    if (!(used instanceof Set)) {
      used = new Set();
      themePools.set(key, used);
    }
    let available = items.filter((item) => !used.has(item.text));
    if (!available.length) {
      used.clear();
      available = items;
    }
    const selected = randomFrom(available);
    used.add(selected.text);
    return selected;
  }

  function themeOptionMarkup(theme, mode = "sentences") {
    const checked = selectedThemes.includes(theme.id) ? " checked" : "";
    const detail = isThemedWordMode(mode) ? "1–4 word phrases" : "500 sentences";
    return `<label class="theme-option"><input type="checkbox" value="${theme.id}"${checked}><span class="theme-option-icon" aria-hidden="true">${theme.icon}</span><span><strong>${theme.name}</strong><small>${detail}</small></span></label>`;
  }

  function updateThemeSelectorCopy() {
    const selectors = [
      { mode: $("mode-select")?.value, eyebrow: "practice-theme-eyebrow", description: "practice-theme-description" },
      { mode: $("listen-mode-select")?.value, eyebrow: "listen-theme-eyebrow", description: "listen-theme-description" }
    ];
    selectors.forEach(({ mode, eyebrow, description }) => {
      const wordMode = isThemedWordMode(mode);
      if ($(eyebrow)) $(eyebrow).textContent = wordMode ? "PHRASE THEMES" : "SENTENCE THEMES";
      if ($(description)) $(description).textContent = wordMode ? "Select one or more libraries for 1–4 word phrase practice." : "Select one or more libraries for sentence practice.";
    });
  }

  function renderThemeSelectors() {
    updateThemeSelectorCopy();
    const practiceMode = $("mode-select")?.value || "sentences";
    const listenMode = $("listen-mode-select")?.value || "sentences";
    ["theme-options", "listen-theme-options"].forEach((id) => {
      const container = $(id);
      if (!container) return;
      const mode = id === "theme-options" ? practiceMode : listenMode;
      container.innerHTML = THEME_META.map((theme) => themeOptionMarkup(theme, mode)).join("");
      container.querySelectorAll("input").forEach((input) => input.addEventListener("change", handleThemeChange));
    });
    ["theme-select-all", "listen-theme-select-all"].forEach((id) => {
      const button = $(id);
      if (button) button.addEventListener("click", selectAllThemes);
    });
    updateThemeSelectionMessage();
  }

  function updateThemeSelectionMessage(message = "") {
    const selectedText = `${selectedThemes.length} theme${selectedThemes.length === 1 ? "" : "s"} selected`;
    const messages = [
      { id: "theme-selection-message", mode: $("mode-select")?.value },
      { id: "listen-theme-selection-message", mode: $("listen-mode-select")?.value }
    ];
    messages.forEach(({ id, mode }) => {
      const element = $(id);
      const contentType = isThemedWordMode(mode) ? "Phrases" : "Sentences";
      if (element) element.textContent = message || `${selectedText}. ${contentType} will not repeat until the selected library is exhausted.`;
    });
    ["theme-select-all", "listen-theme-select-all"].forEach((id) => {
      const button = $(id);
      if (button) button.textContent = selectedThemes.length === THEME_IDS.length ? "All Selected" : "Select All";
    });
  }

  function updateThemeSelectorVisibility() {
    updateThemeSelectorCopy();
    const practiceVisible = isThemedPracticeMode($("mode-select").value);
    const listenVisible = isThemedPracticeMode($("listen-mode-select").value);
    if ($("practice-theme-selector")) $("practice-theme-selector").hidden = !practiceVisible;
    if ($("listen-theme-selector")) $("listen-theme-selector").hidden = !listenVisible;
    if ($("practice-length-control")) $("practice-length-control").hidden = !isRandomLettersMode($("mode-select").value);
    if ($("listen-length-control")) $("listen-length-control").hidden = !isRandomLettersMode($("listen-mode-select").value);
  }

  function handleThemeChange(event) {
    const checked = [...event.currentTarget.closest(".theme-options").querySelectorAll("input:checked")].map((input) => input.value);
    if (!checked.length) {
      renderThemeSelectors();
      updateThemeSelectionMessage("Keep at least one theme selected.");
      return;
    }
    selectedThemes = THEME_IDS.filter((id) => checked.includes(id));
    saveSelectedThemes();
    updateThemeSelectionMessage();
    themePools.clear();
    if (isThemedPracticeMode($("mode-select").value) && !playback.active && !awaitingNext) generateExercise();
    if (isThemedPracticeMode($("listen-mode-select").value) && !listenPlayback.active && !listenAwaitingNext) changeListenExercise();
  }

  function selectAllThemes() {
    selectedThemes = [...THEME_IDS];
    saveSelectedThemes();
    renderThemeSelectors();
    themePools.clear();
    if (isThemedPracticeMode($("mode-select").value) && !playback.active && !awaitingNext) generateExercise();
    if (isThemedPracticeMode($("listen-mode-select").value) && !listenPlayback.active && !listenAwaitingNext) changeListenExercise();
  }

  function randomFrom(value) {
    return value[Math.floor(Math.random() * value.length)];
  }

  function drawUnused(source, key, preferredSource = source) {
    let used = exercisePools.get(key);
    if (!(used instanceof Set)) {
      used = new Set();
      exercisePools.set(key, used);
    }
    let available = preferredSource.filter((item) => !used.has(item));
    if (!available.length) available = source.filter((item) => !used.has(item));
    if (!available.length) {
      used.clear();
      available = source;
    }
    const selected = randomFrom(available);
    used.add(selected);
    return selected;
  }

  function randomSequence(source, length, key) {
    const universeSize = source.length ** length;
    let used = exercisePools.get(key);
    if (!(used instanceof Set) || used.size >= universeSize) {
      used = new Set();
      exercisePools.set(key, used);
    }
    let selected;
    do {
      selected = Array.from({ length }, () => randomFrom(source)).join("");
    } while (used.has(selected));
    used.add(selected);
    return selected;
  }

  function letterCount(text) {
    return [...text].filter((char) => char !== " ").length;
  }

  function letterNumber(index) {
    return [...exercise.slice(0, index)].filter((char) => char !== " ").length + 1;
  }

  function isSentenceMode() {
    return ["sentences", "halloween-sentences"].includes($("mode-select").value);
  }

  function isWordMode() {
    return ["phrases", "halloween"].includes($("mode-select").value);
  }

  function wordCount(text) {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 1;
  }

  function positionLabel(index) {
    const safeIndex = Math.min(Math.max(0, index), Math.max(0, exercise.length - 1));
    if (!isSentenceMode() && !isWordMode()) return `Letter ${letterNumber(safeIndex)} of ${letterCount(exercise)} letters`;
    const throughCurrent = exercise.slice(0, safeIndex + 1);
    const wordNumber = throughCurrent.trim().split(/\s+/).length;
    const wordStart = Math.max(0, throughCurrent.lastIndexOf(" ") + 1);
    const letterInWord = [...exercise.slice(wordStart, safeIndex + 1)].filter((char) => char !== " ").length;
    return `Word ${wordNumber} · Letter ${Math.max(1, letterInWord)} of ${letterCount(exercise)} letters`;
  }

  function compactPositionLabel(index) {
    return positionLabel(index).replace(/ of \d+ letters$/, "");
  }

  function listenLetterNumber(index) {
    return [...listenExercise.slice(0, index)].filter((char) => char !== " ").length + 1;
  }

  function listenPositionLabel(index) {
    const mode = $("listen-mode-select").value;
    const safeIndex = Math.min(Math.max(0, index), Math.max(0, listenExercise.length - 1));
    const totalLetters = letterCount(listenExercise);
    if (!["sentences", "halloween-sentences", "phrases", "halloween"].includes(mode)) {
      return `Letter ${listenLetterNumber(safeIndex)} of ${totalLetters} letters`;
    }
    const throughCurrent = listenExercise.slice(0, safeIndex + 1);
    const wordNumber = throughCurrent.trim().split(/\s+/).length;
    const wordStart = Math.max(0, throughCurrent.lastIndexOf(" ") + 1);
    const letterInWord = [...listenExercise.slice(wordStart, safeIndex + 1)].filter((char) => char !== " ").length;
    return `Word ${wordNumber} · Letter ${Math.max(1, letterInWord)} of ${totalLetters} letters`;
  }

  function compactListenPositionLabel(index) {
    return listenPositionLabel(index).replace(/ of \d+ letters$/, "");
  }

  async function generateExercise() {
    const generation = ++exerciseGeneration;
    const mode = $("mode-select").value;
    const group = isRandomLettersMode(mode) ? randomLettersLength("group-size-select") : DEFAULT_EXERCISE_GROUP_SIZE;
    exerciseThemeId = "";
    if (mode === "numbers") {
      exercise = randomSequence(NUMBERS, group, `${mode}:${group}`);
    } else if (mode === "mixed") {
      const source = LETTERS + NUMBERS;
      exercise = randomSequence(source, group, `${mode}:${group}`);
    } else if (mode === "random-letters") {
      exercise = randomSequence(LETTERS, group, `${mode}:${group}`);
    } else if (mode === "phrases") {
      setStatus("Loading themed phrases…");
      let pool;
      try {
        pool = await loadThemePhrasePool("practice");
      } catch (error) {
        if (generation !== exerciseGeneration) return;
        showToast(error.message);
      }
      if (generation !== exerciseGeneration) return;
      if (pool?.items.length) {
        const selected = drawThemeUnused(pool.items, pool.key);
        exercise = selected.text;
        exerciseThemeId = selected.themeId;
      } else {
        exercise = drawUnused(WORDS, mode);
      }
    } else if (mode === "sentences") {
      setStatus("Loading themes…");
      let pool;
      try {
        pool = await loadThemePool("practice");
      } catch (error) {
        if (generation !== exerciseGeneration) return;
        exercise = drawUnused(SENTENCES, "sentences-fallback");
        showToast(error.message);
      }
      if (generation !== exerciseGeneration) return;
      if (pool) {
        const selected = drawThemeUnused(pool.items, pool.key);
        exercise = selected.text;
        exerciseThemeId = selected.themeId;
      }
    } else if (mode === "halloween-sentences") {
      exercise = drawUnused(HALLOWEEN_SENTENCES, mode);
    } else {
      exercise = randomSequence(LETTERS, group, `${mode}:${group}`);
    }
    if (generation !== exerciseGeneration) return;
    playback.currentIndex = 0;
    exerciseRevealed = false;
    transmissionFinished = false;
    awaitingNext = false;
    updateProgress(0);
    setStatus(compactPositionLabel(0));
    $("answer-input").value = "";
    $("submit-button").disabled = true;
    $("score-label").textContent = "";
    $("answer-message").textContent = "";
    $("result").hidden = true;
    $("result").classList.remove("perfect-result");
    $("revealed-answer").hidden = true;
    $("revealed-answer").innerHTML = "";
    $("reveal-button").disabled = false;
    $("continue-button").hidden = true;
    updateSummary();
    updateThemeSelectorVisibility();
    window.morseCurrentExercise = exercise;
    notifyRpg("exercise-start", { channel: "practice", mode, text: exercise, themeId: exerciseThemeId });
  }

  async function generateListenExercise() {
    const generation = ++listenGeneration;
    const mode = $("listen-mode-select").value;
    const group = isRandomLettersMode(mode) ? randomLettersLength("listen-group-size-select") : DEFAULT_EXERCISE_GROUP_SIZE;
    listenThemeId = "";
    if (mode === "numbers") {
      listenExercise = randomSequence(NUMBERS, group, `listen:${mode}:${group}`);
    } else if (mode === "mixed") {
      listenExercise = randomSequence(LETTERS + NUMBERS, group, `listen:${mode}:${group}`);
    } else if (mode === "random-letters") {
      listenExercise = randomSequence(LETTERS, group, `listen:${mode}:${group}`);
    } else if (mode === "phrases") {
      setListenStatus("Loading themed phrases…");
      let pool;
      try {
        pool = await loadThemePhrasePool("listen");
      } catch (error) {
        if (generation !== listenGeneration) return;
        showToast(error.message);
      }
      if (generation !== listenGeneration) return;
      if (pool?.items.length) {
        const selected = drawThemeUnused(pool.items, pool.key);
        listenExercise = selected.text;
        listenThemeId = selected.themeId;
      } else {
        listenExercise = drawUnused(WORDS, `listen:${mode}`);
      }
    } else if (mode === "sentences") {
      setListenStatus("Loading themes…");
      let pool;
      try {
        pool = await loadThemePool("listen");
      } catch (error) {
        if (generation !== listenGeneration) return;
        listenExercise = drawUnused(SENTENCES, "listen:sentences-fallback");
        showToast(error.message);
      }
      if (generation !== listenGeneration) return;
      if (pool) {
        const selected = drawThemeUnused(pool.items, pool.key);
        listenExercise = selected.text;
        listenThemeId = selected.themeId;
      }
    } else if (mode === "halloween-sentences") {
      listenExercise = drawUnused(HALLOWEEN_SENTENCES, `listen:${mode}`);
    } else {
      listenExercise = randomSequence(LETTERS, group, `listen:${mode}:${group}`);
    }
    if (generation !== listenGeneration) return;
    listenPlayback.currentIndex = 0;
    listenAwaitingNext = false;
    updateListenProgress(0);
    setListenStatus(compactListenPositionLabel(0));
    $("listen-countdown-label").textContent = "";
    $("listen-next-button").hidden = true;
    $("listen-next-button").disabled = false;
    $("listen-start-button").hidden = false;
    $("listen-start-button").disabled = false;
    updateThemeSelectorVisibility();
    updateListenSummary();
  }

  function updateSummary() {
    const mode = $("mode-select").value;
    const exerciseType = isSentenceMode() ? "Sentence" : isWordMode() ? "Phrase" : isRandomLettersMode(mode) ? `${randomLettersLength("group-size-select")} letters` : `${DEFAULT_EXERCISE_GROUP_SIZE} char`;
    $("summary").textContent = `${exerciseType} · ${settings.effectiveWpm} eff · ${settings.frequency} Hz`;
  }

  function updateListenSummary() {
    const mode = $("listen-mode-select").value;
    const exerciseType = ["sentences", "halloween-sentences"].includes(mode) ? "Sentence" : ["phrases", "halloween"].includes(mode) ? "Phrase" : isRandomLettersMode(mode) ? `${randomLettersLength("listen-group-size-select")} letters` : `${DEFAULT_EXERCISE_GROUP_SIZE} char`;
    $("listen-summary").textContent = `${exerciseType} · ${settings.effectiveWpm} eff · ${settings.frequency} Hz`;
  }

  function updateProgress(index) {
    $("progress-label").textContent = positionLabel(index);
  }

  function updateListenProgress(index) {
    $("listen-progress-label").textContent = listenPositionLabel(index);
  }

  function updateProfile() {
    $("profile-label").textContent = settings.profileName.trim() || "Operator";
    $("listen-profile-label").textContent = settings.profileName.trim() || "Operator";
    $("profile-name").value = settings.profileName;
  }

  function updateSettingDisplays() {
    $("character-wpm").value = settings.characterWpm;
    $("effective-wpm").value = settings.effectiveWpm;
    $("frequency").value = settings.frequency;
    $("volume").value = settings.volume;
    $("silence-before").value = settings.silenceBefore;
    $("silence-after").value = settings.silenceAfter;
    $("countdown-setting").checked = settings.countdown;
    $("repeat-correct").checked = settings.repeatCorrect;
    $("character-wpm-value").textContent = `${settings.characterWpm} WPM`;
    $("effective-wpm-value").textContent = `${settings.effectiveWpm} WPM`;
    $("frequency-value").textContent = `${settings.frequency} Hz`;
    $("volume-value").textContent = `${settings.volume}%`;
    $("before-value").textContent = `${Number(settings.silenceBefore).toFixed(1)}s`;
    $("after-value").textContent = `${Number(settings.silenceAfter).toFixed(1)}s`;
    updateSummary();
    updateListenSummary();
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(playback.toastTimer);
    playback.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function playPerfectCopySound() {
    if (!playback.successAudio) {
      playback.successAudio = new Audio("assets/perfect-copy.mp3");
      playback.successAudio.volume = 0.9;
    }
    playback.successAudio.currentTime = 0;
    const playPromise = playback.successAudio.play();
    if (playPromise?.catch) playPromise.catch(() => {});
  }

  function setStatus(message) {
    $("status-label").textContent = message;
  }

  function setListenStatus(message) {
    $("listen-status-label").textContent = message;
  }

  function notifyRpg(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(`morse:${eventName}`, { detail }));
  }

  function disarmAnswerInput() {
    const input = $("answer-input");
    input.readOnly = true;
    input.blur();
  }

  function armAnswerInput() {
    if (exerciseRevealed) return;
    $("answer-input").readOnly = false;
  }

  function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function waitForResume(runId) {
    while (playback.paused && playback.runId === runId) await sleep(50);
    return playback.runId === runId;
  }

  async function ensureAudio() {
    if (!playback.audio) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser.");
      playback.audio = new AudioContextClass();
    }
    if (playback.audio.state === "suspended") await playback.audio.resume();
  }

  function stopCurrentTone() {
    if (playback.oscillator) {
      try { playback.oscillator.stop(); } catch (_) { /* already stopped */ }
      playback.oscillator = null;
    }
  }

  function playTone(milliseconds, runId) {
    return new Promise((resolve) => {
      if (!playback.audio || runId !== playback.runId) return resolve(false);
      const context = playback.audio;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const duration = Math.max(0.025, milliseconds / 1000);
      const volume = Math.max(0, Math.min(1, settings.volume / 100));
      oscillator.frequency.value = Number(settings.frequency);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.82, now + 0.006);
      gain.gain.setValueAtTime(volume * 0.82, now + Math.max(0.008, duration - 0.012));
      gain.gain.linearRampToValueAtTime(0, now + duration);
      oscillator.connect(gain).connect(context.destination);
      playback.oscillator = oscillator;
      oscillator.onended = () => {
        if (playback.oscillator === oscillator) playback.oscillator = null;
        resolve(runId === playback.runId);
      };
      oscillator.start(now);
      oscillator.stop(now + duration + 0.015);
    });
  }

  async function playCharacter(character, runId) {
    const code = MORSE[character.toUpperCase()];
    if (!code) return true;
    const unit = 1200 / Number(settings.characterWpm);
    for (const mark of code) {
      if (!(await waitForResume(runId))) return false;
      if (!(await playTone(mark === "." ? unit : unit * 3, runId))) return false;
      await sleep(unit);
      if (runId !== playback.runId) return false;
    }
    return true;
  }

  async function countdown(runId) {
    playback.countdown = true;
    const seconds = [3, 2, 1];
    for (const second of seconds) {
      if (runId !== playback.runId) return false;
      $("countdown-label").textContent = String(second);
      setStatus(compactPositionLabel(playback.currentIndex));
      await sleep(700);
    }
    $("countdown-label").textContent = "";
    playback.countdown = false;
    return runId === playback.runId;
  }

  async function playFrom(startIndex) {
    const runId = ++playback.runId;
    disarmAnswerInput();
    playback.active = true;
    playback.paused = false;
    playback.countdown = false;
    playback.currentIndex = Math.max(0, Math.min(startIndex, Math.max(0, exercise.length - 1)));
    $("listening-window").classList.add("is-playing");
    $("start-button").disabled = true;
    $("start-button").hidden = true;
    $("replay-button").disabled = true;
    $("rewind-button").disabled = false;
    $("pause-button").disabled = false;
    $("stop-button").disabled = false;
    $("pause-button").innerHTML = "Ⅱ <span>Pause</span>";
    updateProgress(playback.currentIndex);
    setStatus(compactPositionLabel(playback.currentIndex));
    notifyRpg("playback-start", { channel: "practice", mode: $("mode-select").value });
    try {
      await ensureAudio();
      if (settings.silenceBefore > 0) await sleep(Number(settings.silenceBefore) * 1000);
      const characterUnit = 1200 / Number(settings.characterWpm);
      const effectiveUnit = 1200 / Number(settings.effectiveWpm);
      const letterGap = Math.max(characterUnit * 3, effectiveUnit * 3);
      const wordGap = Math.max(characterUnit * 7, effectiveUnit * 7);
      for (let index = playback.currentIndex; index < exercise.length; index += 1) {
        if (runId !== playback.runId) return;
        if (exercise[index] === " ") continue;
        playback.currentIndex = index;
        updateProgress(index);
        setStatus(compactPositionLabel(index));
        if (!(await playCharacter(exercise[index], runId))) return;
        if (index < exercise.length - 1) {
          await sleep(exercise[index + 1] === " " ? wordGap : letterGap);
        }
      }
      if (settings.silenceAfter > 0 && runId === playback.runId) await sleep(Number(settings.silenceAfter) * 1000);
      if (runId !== playback.runId) return;
      transmissionFinished = true;
      notifyRpg("playback-stop", { channel: "practice", mode: $("mode-select").value, completed: true });
      playback.active = false;
      playback.currentIndex = exercise.length;
      disarmAnswerInput();
      updateProgress(exercise.length);
      setStatus(compactPositionLabel(Math.max(0, exercise.length - 1)));
      $("listening-window").classList.remove("is-playing");
      $("start-button").disabled = false;
      $("start-button").hidden = false;
      $("replay-button").disabled = false;
      $("pause-button").disabled = true;
      $("stop-button").disabled = true;
    } catch (error) {
      if (runId !== playback.runId) return;
      notifyRpg("playback-stop", { channel: "practice", mode: $("mode-select").value, completed: false });
      playback.active = false;
      disarmAnswerInput();
      $("listening-window").classList.remove("is-playing");
      setStatus(compactPositionLabel(Math.max(0, playback.currentIndex)));
      $("start-button").disabled = false;
      $("start-button").hidden = false;
      $("replay-button").disabled = false;
      $("pause-button").disabled = true;
      $("stop-button").disabled = true;
      showToast(error.message);
    }
  }

  async function startTransmission() {
    disarmAnswerInput();
    if (playback.active && playback.paused) {
      playback.paused = false;
      if (playback.audio?.state === "suspended") await playback.audio.resume();
      $("pause-button").innerHTML = "Ⅱ <span>Pause</span>";
      setStatus(compactPositionLabel(playback.currentIndex));
      return;
    }
    if (playback.active) return;
    if (!exercise) generateExercise();
    const runId = ++playback.runId;
    playback.active = true;
    playback.countdown = settings.countdown;
    $("start-button").disabled = true;
    $("start-button").hidden = true;
    $("replay-button").disabled = true;
    $("rewind-button").disabled = false;
    $("pause-button").disabled = false;
    $("stop-button").disabled = false;
    try {
      // Initialize/resume Web Audio during the user's tap before the countdown.
      // Mobile browsers may reject audio if the context is first resumed later.
      await ensureAudio();
    } catch (error) {
      playback.active = false;
      playback.countdown = false;
      $("start-button").disabled = false;
      $("start-button").hidden = false;
      $("replay-button").disabled = false;
      $("pause-button").disabled = true;
      $("stop-button").disabled = true;
      showToast(error.message);
      return;
    }
    if (settings.countdown && !(await countdown(runId))) return;
    if (runId !== playback.runId) return;
    playback.active = false;
    await playFrom(0);
  }

  function rewindOneLetter() {
    if (playback.countdown || !exercise) return;
    const lastIndex = Math.max(0, [...exercise].reduce((last, character, index) => character === " " ? last : index, 0));
    const current = playback.currentIndex >= exercise.length ? exercise.length : playback.currentIndex;
    let target = current >= exercise.length ? lastIndex : Math.max(0, current - 1);
    while (target > 0 && exercise[target] === " ") target -= 1;
    notifyRpg("rewind", { mode: $("mode-select").value });
    playback.runId += 1;
    stopCurrentTone();
    playback.active = false;
    playback.paused = false;
    disarmAnswerInput();
    $("countdown-label").textContent = "";
    setStatus(compactPositionLabel(target));
    playFrom(target);
  }

  function stopTransmission() {
    notifyRpg("playback-stop", { channel: "practice", mode: $("mode-select").value, completed: false });
    playback.runId += 1;
    stopCurrentTone();
    playback.active = false;
    playback.paused = false;
    playback.countdown = false;
    disarmAnswerInput();
    $("countdown-label").textContent = "";
    $("listening-window").classList.remove("is-playing");
    $("start-button").disabled = false;
    $("start-button").hidden = false;
    $("replay-button").disabled = false;
    $("pause-button").disabled = true;
    $("stop-button").disabled = true;
    $("pause-button").innerHTML = "Ⅱ <span>Pause</span>";
    setStatus(compactPositionLabel(Math.min(playback.currentIndex, Math.max(0, exercise.length - 1))));
  }

  function togglePause() {
    if (!playback.active || playback.countdown) return;
    playback.paused = !playback.paused;
    if (playback.paused) notifyRpg("pause", { mode: $("mode-select").value });
    $("pause-button").innerHTML = playback.paused ? "▶ <span>Resume</span>" : "Ⅱ <span>Pause</span>";
    setStatus(`${compactPositionLabel(playback.currentIndex)}${playback.paused ? " · Paused" : ""}`);
  }

  async function listenWaitForResume(runId) {
    while (listenPlayback.paused && listenPlayback.runId === runId) await sleep(50);
    return listenPlayback.runId === runId;
  }

  async function ensureListenAudio() {
    if (!listenPlayback.audio) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser.");
      listenPlayback.audio = new AudioContextClass();
    }
    if (listenPlayback.audio.state === "suspended") await listenPlayback.audio.resume();
  }

  function stopListenTone() {
    if (listenPlayback.oscillator) {
      try { listenPlayback.oscillator.stop(); } catch (_) { /* already stopped */ }
      listenPlayback.oscillator = null;
    }
  }

  function playListenTone(milliseconds, runId) {
    return new Promise((resolve) => {
      if (!listenPlayback.audio || runId !== listenPlayback.runId) return resolve(false);
      const context = listenPlayback.audio;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const duration = Math.max(0.025, milliseconds / 1000);
      const volume = Math.max(0, Math.min(1, settings.volume / 100));
      oscillator.frequency.value = Number(settings.frequency);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.82, now + 0.006);
      gain.gain.setValueAtTime(volume * 0.82, now + Math.max(0.008, duration - 0.012));
      gain.gain.linearRampToValueAtTime(0, now + duration);
      oscillator.connect(gain).connect(context.destination);
      listenPlayback.oscillator = oscillator;
      oscillator.onended = () => {
        if (listenPlayback.oscillator === oscillator) listenPlayback.oscillator = null;
        resolve(runId === listenPlayback.runId);
      };
      oscillator.start(now);
      oscillator.stop(now + duration + 0.015);
    });
  }

  async function playListenCharacter(character, runId) {
    const code = MORSE[character.toUpperCase()];
    if (!code) return true;
    const unit = 1200 / Number(settings.characterWpm);
    for (const mark of code) {
      if (!(await listenWaitForResume(runId))) return false;
      if (!(await playListenTone(mark === "." ? unit : unit * 3, runId))) return false;
      await sleep(unit);
      if (runId !== listenPlayback.runId) return false;
    }
    return true;
  }

  async function listenCountdown(runId) {
    listenPlayback.countdown = true;
    for (const second of [3, 2, 1]) {
      if (runId !== listenPlayback.runId) return false;
      $("listen-countdown-label").textContent = String(second);
      setListenStatus(compactListenPositionLabel(listenPlayback.currentIndex));
      await sleep(700);
    }
    $("listen-countdown-label").textContent = "";
    listenPlayback.countdown = false;
    return runId === listenPlayback.runId;
  }

  async function playListenFrom(startIndex) {
    const runId = ++listenPlayback.runId;
    listenPlayback.active = true;
    listenPlayback.paused = false;
    listenPlayback.countdown = false;
    listenPlayback.currentIndex = Math.max(0, Math.min(startIndex, Math.max(0, listenExercise.length - 1)));
    $("listen-listening-window").classList.add("is-playing");
    $("listen-start-button").disabled = true;
    $("listen-start-button").hidden = true;
    $("listen-replay-button").disabled = true;
    $("listen-rewind-button").disabled = false;
    $("listen-pause-button").disabled = false;
    $("listen-stop-button").disabled = false;
    $("listen-next-button").hidden = false;
    $("listen-next-button").disabled = false;
    $("listen-pause-button").innerHTML = "Ⅱ <span>Pause</span>";
    updateListenProgress(listenPlayback.currentIndex);
    setListenStatus(compactListenPositionLabel(listenPlayback.currentIndex));
    notifyRpg("playback-start", { channel: "listen", mode: $("listen-mode-select").value });
    try {
      await ensureListenAudio();
      if (settings.silenceBefore > 0) await sleep(Number(settings.silenceBefore) * 1000);
      const characterUnit = 1200 / Number(settings.characterWpm);
      const effectiveUnit = 1200 / Number(settings.effectiveWpm);
      const letterGap = Math.max(characterUnit * 3, effectiveUnit * 3);
      const wordGap = Math.max(characterUnit * 7, effectiveUnit * 7);
      for (let index = listenPlayback.currentIndex; index < listenExercise.length; index += 1) {
        if (runId !== listenPlayback.runId) return;
        if (listenExercise[index] === " ") continue;
        listenPlayback.currentIndex = index;
        updateListenProgress(index);
        setListenStatus(compactListenPositionLabel(index));
        if (!(await playListenCharacter(listenExercise[index], runId))) return;
        if (index < listenExercise.length - 1) await sleep(listenExercise[index + 1] === " " ? wordGap : letterGap);
      }
      if (settings.silenceAfter > 0 && runId === listenPlayback.runId) await sleep(Number(settings.silenceAfter) * 1000);
      if (runId !== listenPlayback.runId) return;
      notifyRpg("playback-stop", { channel: "listen", mode: $("listen-mode-select").value, completed: true });
      listenPlayback.active = false;
      listenPlayback.currentIndex = listenExercise.length;
      listenAwaitingNext = true;
      updateListenProgress(Math.max(0, listenExercise.length - 1));
      setListenStatus(compactListenPositionLabel(Math.max(0, listenExercise.length - 1)));
      $("listen-listening-window").classList.remove("is-playing");
      $("listen-start-button").hidden = true;
      $("listen-replay-button").disabled = false;
      $("listen-pause-button").disabled = true;
      $("listen-stop-button").disabled = true;
      $("listen-next-button").hidden = false;
      $("listen-next-button").disabled = false;
    } catch (error) {
      if (runId !== listenPlayback.runId) return;
      notifyRpg("playback-stop", { channel: "listen", mode: $("listen-mode-select").value, completed: false });
      listenPlayback.active = false;
      $("listen-listening-window").classList.remove("is-playing");
      setListenStatus(compactListenPositionLabel(Math.max(0, listenPlayback.currentIndex)));
      $("listen-start-button").disabled = false;
      $("listen-start-button").hidden = false;
      $("listen-replay-button").disabled = false;
      $("listen-pause-button").disabled = true;
      $("listen-stop-button").disabled = true;
      $("listen-next-button").hidden = true;
      $("listen-next-button").disabled = false;
      showToast(error.message);
    }
  }

  async function startListenTransmission() {
    if (listenPlayback.active && listenPlayback.paused) {
      listenPlayback.paused = false;
      if (listenPlayback.audio?.state === "suspended") await listenPlayback.audio.resume();
      $("listen-pause-button").innerHTML = "Ⅱ <span>Pause</span>";
      setListenStatus(compactListenPositionLabel(listenPlayback.currentIndex));
      return;
    }
    if (listenPlayback.active) return;
    if (!listenExercise) generateListenExercise();
    const runId = ++listenPlayback.runId;
    listenPlayback.active = true;
    listenPlayback.countdown = settings.countdown;
    $("listen-start-button").disabled = true;
    $("listen-start-button").hidden = true;
    $("listen-replay-button").disabled = true;
    $("listen-rewind-button").disabled = false;
    $("listen-pause-button").disabled = false;
    $("listen-stop-button").disabled = false;
    $("listen-next-button").hidden = false;
    $("listen-next-button").disabled = false;
    try {
      await ensureListenAudio();
    } catch (error) {
      listenPlayback.active = false;
      listenPlayback.countdown = false;
      $("listen-start-button").disabled = false;
      $("listen-start-button").hidden = false;
      $("listen-replay-button").disabled = false;
      $("listen-pause-button").disabled = true;
      $("listen-stop-button").disabled = true;
      $("listen-next-button").hidden = true;
      $("listen-next-button").disabled = true;
      showToast(error.message);
      return;
    }
    if (settings.countdown && !(await listenCountdown(runId))) return;
    if (runId !== listenPlayback.runId) return;
    listenPlayback.active = false;
    await playListenFrom(0);
  }

  function listenRewindOneLetter() {
    if (listenPlayback.countdown || !listenExercise) return;
    const lastIndex = Math.max(0, [...listenExercise].reduce((last, character, index) => character === " " ? last : index, 0));
    const current = listenPlayback.currentIndex >= listenExercise.length ? listenExercise.length : listenPlayback.currentIndex;
    let target = current >= listenExercise.length ? lastIndex : Math.max(0, current - 1);
    while (target > 0 && listenExercise[target] === " ") target -= 1;
    notifyRpg("rewind", { mode: $("listen-mode-select").value });
    listenPlayback.runId += 1;
    stopListenTone();
    listenPlayback.active = false;
    listenPlayback.paused = false;
    listenAwaitingNext = false;
    $("listen-next-button").hidden = false;
    $("listen-next-button").disabled = false;
    setListenStatus(compactListenPositionLabel(target));
    playListenFrom(target);
  }

  function stopListenTransmission(keepNextButton = false) {
    notifyRpg("playback-stop", { channel: "listen", mode: $("listen-mode-select").value, completed: false });
    listenPlayback.runId += 1;
    stopListenTone();
    listenPlayback.active = false;
    listenPlayback.paused = false;
    listenPlayback.countdown = false;
    listenAwaitingNext = false;
    $("listen-countdown-label").textContent = "";
    $("listen-listening-window").classList.remove("is-playing");
    $("listen-start-button").disabled = false;
    $("listen-start-button").hidden = false;
    $("listen-replay-button").disabled = false;
    $("listen-pause-button").disabled = true;
    $("listen-stop-button").disabled = true;
    $("listen-next-button").hidden = !keepNextButton;
    $("listen-next-button").disabled = true;
    $("listen-pause-button").innerHTML = "Ⅱ <span>Pause</span>";
    setListenStatus(compactListenPositionLabel(Math.min(listenPlayback.currentIndex, Math.max(0, listenExercise.length - 1))));
  }

  function toggleListenPause() {
    if (!listenPlayback.active || listenPlayback.countdown) return;
    listenPlayback.paused = !listenPlayback.paused;
    if (listenPlayback.paused) notifyRpg("pause", { mode: $("listen-mode-select").value });
    $("listen-pause-button").innerHTML = listenPlayback.paused ? "▶ <span>Resume</span>" : "Ⅱ <span>Pause</span>";
    setListenStatus(`${compactListenPositionLabel(listenPlayback.currentIndex)}${listenPlayback.paused ? " · Paused" : ""}`);
  }

  async function continueListenToNext() {
    if (!listenExercise) return;
    stopListenTransmission();
    await generateListenExercise();
    startListenTransmission();
  }

  async function changeListenExercise() {
    if (listenPlayback.active || listenPlayback.paused || listenAwaitingNext) stopListenTransmission();
    await generateListenExercise();
  }

  function scoreAnswer(source = "submit") {
    if (source === "submit" && exerciseRevealed) return;
    const expected = exercise.trim().toUpperCase();
    const actual = $("answer-input").value.trim().toUpperCase().replace(/\s+/g, " ");
    const maxLength = Math.max(expected.length, actual.length, 1);
    let matches = 0;
    for (let index = 0; index < Math.min(expected.length, actual.length); index += 1) {
      if (expected[index] === actual[index]) matches += 1;
    }
    const accuracy = Math.round((matches / maxLength) * 100);
    lastAnswerCorrect = expected === actual;
    awaitingNext = true;
    $("score-label").textContent = `${accuracy}% accurate`;
    $("answer-message").textContent = lastAnswerCorrect
      ? (transmissionFinished ? "Perfect copy." : "100% accurate — finish the transmission to record progress.")
      : "Review your result below.";
    $("submit-button").disabled = true;
    $("continue-button").hidden = false;
    $("result").classList.toggle("perfect-result", lastAnswerCorrect && transmissionFinished);
    $("result").hidden = false;
    const reward = lastAnswerCorrect && transmissionFinished ? '<div class="reward-line">✦ Perfect copy! Excellent work. ✦</div>' : "";
    $("result").innerHTML = `${reward}<strong>Your copy: ${escapeHtml(actual || "—")}</strong><span>${accuracy}% character accuracy · ${matches}/${maxLength} characters matched</span>`;
    if (lastAnswerCorrect && transmissionFinished && source === "submit") {
      playPerfectCopySound();
      showToast("Perfect copy! Great work.");
    }
    notifyRpg("score", { source, channel: "practice", eligible: transmissionFinished, mode: $("mode-select").value, themeId: exerciseThemeId, accuracy, matches, maxLength, expected, actual });
  }

  function revealAnswer() {
    if (!exercise || exerciseRevealed) return;
    exerciseRevealed = true;
    disarmAnswerInput();
    $("submit-button").disabled = true;
    $("reveal-button").disabled = true;
    $("continue-button").hidden = false;
    $("answer-message").textContent = "Answer revealed.";
    $("revealed-answer").innerHTML = `<strong>Answer revealed.</strong><span>${escapeHtml(exercise.trim().toUpperCase())}</span>`;
    $("revealed-answer").hidden = false;
    notifyRpg("reveal", { channel: "practice", mode: $("mode-select").value, themeId: exerciseThemeId });
  }

  async function continueToNext() {
    if (!awaitingNext) return;
    awaitingNext = false;
    stopTransmission();
    if (settings.repeatCorrect && !lastAnswerCorrect && !exerciseRevealed) {
      $("answer-input").value = "";
      $("score-label").textContent = "";
      $("answer-message").textContent = "Try the same transmission again.";
      $("result").hidden = true;
      $("revealed-answer").hidden = true;
      $("continue-button").hidden = true;
      startTransmission();
      return;
    }
    await generateExercise();
    startTransmission();
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  function renderAlphabet() {
    $("alphabet-grid").innerHTML = Object.entries(MORSE).map(([character, code]) => `<div class="morse-cell"><strong>${escapeHtml(character)}</strong><code>${code}</code></div>`).join("");
  }

  function switchView(viewName) {
    if (viewName !== "listen-only" && (listenPlayback.active || listenPlayback.paused || listenAwaitingNext)) stopListenTransmission();
    document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
    document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `${viewName}-view`));
  }

  function bindEvents() {
    document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
    $("mode-select").addEventListener("change", () => { renderThemeSelectors(); generateExercise(); });
    $("group-size-select").addEventListener("change", generateExercise);
    $("session-select").addEventListener("change", () => showToast($("session-select").value === "0" ? "Unlimited session selected" : `${$("session-select").value}-minute session selected`));
    $("start-button").addEventListener("click", startTransmission);
    $("replay-button").addEventListener("click", () => { stopTransmission(); playFrom(0); });
    $("rewind-button").addEventListener("click", rewindOneLetter);
    $("pause-button").addEventListener("click", togglePause);
    $("stop-button").addEventListener("click", stopTransmission);
    $("listen-mode-select").addEventListener("change", () => { renderThemeSelectors(); changeListenExercise(); });
    $("listen-group-size-select").addEventListener("change", changeListenExercise);
    $("listen-session-select").addEventListener("change", () => showToast($("listen-session-select").value === "0" ? "Unlimited session selected" : `${$("listen-session-select").value}-minute session selected`));
    $("listen-start-button").addEventListener("click", startListenTransmission);
    $("listen-replay-button").addEventListener("click", () => { stopListenTransmission(true); playListenFrom(0); });
    $("listen-rewind-button").addEventListener("click", listenRewindOneLetter);
    $("listen-pause-button").addEventListener("click", toggleListenPause);
    $("listen-stop-button").addEventListener("click", stopListenTransmission);
    $("listen-next-button").addEventListener("click", continueListenToNext);
    $("answer-input").addEventListener("pointerdown", armAnswerInput);
    $("answer-input").addEventListener("click", armAnswerInput);
    $("answer-input").addEventListener("input", (event) => {
      const input = event.currentTarget;
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;
      const uppercaseValue = input.value.toUpperCase();
      if (input.value !== uppercaseValue) {
        input.value = uppercaseValue;
        input.setSelectionRange(selectionStart, selectionEnd);
      }
      $("submit-button").disabled = exerciseRevealed || !input.value.trim();
    });
    $("submit-button").addEventListener("click", () => scoreAnswer("submit"));
    $("reveal-button").addEventListener("click", revealAnswer);
    $("continue-button").addEventListener("click", continueToNext);

    const rangeSettings = [
      ["character-wpm", "characterWpm"], ["effective-wpm", "effectiveWpm"], ["frequency", "frequency"],
      ["volume", "volume"], ["silence-before", "silenceBefore"], ["silence-after", "silenceAfter"]
    ];
    rangeSettings.forEach(([id, key]) => $(id).addEventListener("input", (event) => {
      settings[key] = Number(event.target.value);
      saveSettings();
      updateSettingDisplays();
    }));
    $("countdown-setting").addEventListener("change", (event) => { settings.countdown = event.target.checked; saveSettings(); });
    $("repeat-correct").addEventListener("change", (event) => { settings.repeatCorrect = event.target.checked; saveSettings(); });
    $("profile-name").addEventListener("input", (event) => { settings.profileName = event.target.value; saveSettings(); updateProfile(); });
    $("reset-settings").addEventListener("click", () => { Object.assign(settings, STANDARD); saveSettings(); updateSettingDisplays(); updateProfile(); showToast("Standard timing restored"); });

    document.addEventListener("keydown", (event) => {
      const answerInput = $("answer-input");
      const typingInAnswer = document.activeElement === answerInput && !answerInput.readOnly;
      const transmissionCanRewind = playback.active || playback.currentIndex >= exercise.length;
      const listenTabActive = $("listen-only-view").classList.contains("active");
      const listenCanRewind = listenPlayback.active || listenPlayback.currentIndex >= listenExercise.length;
      if (event.code === "Space" && listenTabActive && listenCanRewind && !listenPlayback.countdown) {
        event.preventDefault();
        listenRewindOneLetter();
        return;
      }
      if (event.code === "Space" && transmissionCanRewind && !playback.countdown && !typingInAnswer) {
        event.preventDefault();
        rewindOneLetter();
      }
    });
  }

  updateSettingDisplays();
  updateProfile();
  renderAlphabet();
  renderThemeSelectors();
  bindEvents();
  updateThemeSelectorVisibility();
  generateExercise();
  generateListenExercise();
  disarmAnswerInput();
})();
