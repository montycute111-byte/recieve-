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
  const WORDS = ["RADIO", "SIGNAL", "RECEIVE", "COPY", "PRACTICE", "MORSE", "LISTEN", "READY", "DECODE", "OPERATOR", "CONTACT", "BEACON"];
  const STORAGE_KEY = "morseReceiveSettings";
  const STANDARD = {
    characterWpm: 5, effectiveWpm: 5, frequency: 699, volume: 62,
    silenceBefore: 0.7, silenceAfter: 0.7, countdown: true,
    autoAdvance: true, repeatCorrect: false, profileName: "Operator"
  };

  const $ = (id) => document.getElementById(id);
  const settings = loadSettings();
  const playback = {
    active: false, paused: false, countdown: false, currentIndex: 0,
    runId: 0, audio: null, oscillator: null, toastTimer: null
  };
  let exercise = "";
  let lastAnswerCorrect = false;

  function loadSettings() {
    try {
      return { ...STANDARD, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (_) {
      return { ...STANDARD };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function randomFrom(value) {
    return value[Math.floor(Math.random() * value.length)];
  }

  function letterCount(text) {
    return [...text].filter((char) => char !== " ").length;
  }

  function letterNumber(index) {
    return [...exercise.slice(0, index)].filter((char) => char !== " ").length + 1;
  }

  function generateExercise() {
    const mode = $("mode-select").value;
    const group = Number($("group-select").value);
    if (mode === "numbers") {
      exercise = Array.from({ length: group }, () => randomFrom(NUMBERS)).join("");
    } else if (mode === "mixed") {
      const source = LETTERS + NUMBERS;
      exercise = Array.from({ length: group }, () => randomFrom(source)).join("");
    } else if (mode === "words") {
      const possible = WORDS.filter((word) => word.length <= group + 2);
      exercise = randomFrom(possible.length ? possible : WORDS);
    } else {
      exercise = Array.from({ length: group }, () => randomFrom(LETTERS)).join("");
    }
    playback.currentIndex = 0;
    updateProgress(0);
    setStatus("Letter 1");
    $("answer-input").value = "";
    $("submit-button").disabled = true;
    $("score-label").textContent = "";
    $("answer-message").textContent = "";
    $("result").hidden = true;
    updateSummary();
  }

  function updateSummary() {
    const groupText = $("mode-select").value === "words" ? "word" : "char";
    $("summary").textContent = `${$("group-select").value} ${groupText} · ${settings.effectiveWpm} eff · ${settings.frequency} Hz`;
  }

  function updateProgress(index) {
    const total = letterCount(exercise);
    const current = Math.min(total, letterNumber(Math.min(index, exercise.length)));
    $("progress-label").textContent = `Letter ${Math.max(1, current)} of ${total}`;
  }

  function updateProfile() {
    $("profile-label").textContent = settings.profileName.trim() || "Operator";
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
    $("auto-advance").checked = settings.autoAdvance;
    $("repeat-correct").checked = settings.repeatCorrect;
    $("character-wpm-value").textContent = `${settings.characterWpm} WPM`;
    $("effective-wpm-value").textContent = `${settings.effectiveWpm} WPM`;
    $("frequency-value").textContent = `${settings.frequency} Hz`;
    $("volume-value").textContent = `${settings.volume}%`;
    $("before-value").textContent = `${Number(settings.silenceBefore).toFixed(1)}s`;
    $("after-value").textContent = `${Number(settings.silenceAfter).toFixed(1)}s`;
    updateSummary();
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(playback.toastTimer);
    playback.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function setStatus(message) {
    $("status-label").textContent = message;
  }

  function disarmAnswerInput() {
    const input = $("answer-input");
    input.readOnly = true;
    input.blur();
  }

  function armAnswerInput() {
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
      setStatus(`Letter ${letterNumber(playback.currentIndex)}`);
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
    $("replay-button").disabled = true;
    $("rewind-button").disabled = false;
    $("pause-button").disabled = false;
    $("stop-button").disabled = false;
    $("pause-button").innerHTML = "Ⅱ <span>Pause</span>";
    updateProgress(playback.currentIndex);
    setStatus(`Letter ${letterNumber(playback.currentIndex)}`);
    try {
      await ensureAudio();
      if (settings.silenceBefore > 0) await sleep(Number(settings.silenceBefore) * 1000);
      const characterUnit = 1200 / Number(settings.characterWpm);
      const effectiveUnit = 1200 / Number(settings.effectiveWpm);
      const letterGap = Math.max(characterUnit * 3, effectiveUnit * 3);
      for (let index = playback.currentIndex; index < exercise.length; index += 1) {
        if (runId !== playback.runId) return;
        if (exercise[index] === " ") continue;
        playback.currentIndex = index;
        updateProgress(index);
        setStatus(`Letter ${letterNumber(index)}`);
        if (!(await playCharacter(exercise[index], runId))) return;
        if (index < exercise.length - 1) await sleep(letterGap);
      }
      if (settings.silenceAfter > 0 && runId === playback.runId) await sleep(Number(settings.silenceAfter) * 1000);
      if (runId !== playback.runId) return;
      playback.active = false;
      playback.currentIndex = exercise.length;
      disarmAnswerInput();
      updateProgress(exercise.length);
      setStatus(`Letter ${letterNumber(Math.max(0, exercise.length - 1))}`);
      $("listening-window").classList.remove("is-playing");
      $("start-button").disabled = false;
      $("replay-button").disabled = false;
      $("pause-button").disabled = true;
      $("stop-button").disabled = true;
    } catch (error) {
      if (runId !== playback.runId) return;
      playback.active = false;
      disarmAnswerInput();
      $("listening-window").classList.remove("is-playing");
      setStatus(`Letter ${letterNumber(Math.max(0, playback.currentIndex))}`);
      $("start-button").disabled = false;
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
      setStatus(`Letter ${letterNumber(playback.currentIndex)}`);
      return;
    }
    if (playback.active) return;
    if (!exercise) generateExercise();
    const runId = ++playback.runId;
    playback.active = true;
    playback.countdown = settings.countdown;
    $("start-button").disabled = true;
    $("replay-button").disabled = true;
    $("rewind-button").disabled = false;
    $("pause-button").disabled = false;
    $("stop-button").disabled = false;
    if (settings.countdown && !(await countdown(runId))) return;
    if (runId !== playback.runId) return;
    playback.active = false;
    await playFrom(0);
  }

  function rewindOneLetter() {
    if (playback.countdown || !exercise) return;
    const lastIndex = Math.max(0, [...exercise].reduce((last, character, index) => character === " " ? last : index, 0));
    const current = playback.currentIndex >= exercise.length ? exercise.length : playback.currentIndex;
    const target = current >= exercise.length ? lastIndex : Math.max(0, current - 1);
    playback.runId += 1;
    stopCurrentTone();
    playback.active = false;
    playback.paused = false;
    disarmAnswerInput();
    $("countdown-label").textContent = "";
    setStatus(`Letter ${letterNumber(target)}`);
    playFrom(target);
  }

  function stopTransmission() {
    playback.runId += 1;
    stopCurrentTone();
    playback.active = false;
    playback.paused = false;
    playback.countdown = false;
    disarmAnswerInput();
    $("countdown-label").textContent = "";
    $("listening-window").classList.remove("is-playing");
    $("start-button").disabled = false;
    $("replay-button").disabled = false;
    $("pause-button").disabled = true;
    $("stop-button").disabled = true;
    $("pause-button").innerHTML = "Ⅱ <span>Pause</span>";
    setStatus(`Letter ${letterNumber(Math.min(playback.currentIndex, Math.max(0, exercise.length - 1)))}`);
  }

  function togglePause() {
    if (!playback.active || playback.countdown) return;
    playback.paused = !playback.paused;
    $("pause-button").innerHTML = playback.paused ? "▶ <span>Resume</span>" : "Ⅱ <span>Pause</span>";
    setStatus(`Letter ${letterNumber(playback.currentIndex)}${playback.paused ? " · Paused" : ""}`);
  }

  function scoreAnswer() {
    const expected = exercise.trim().toUpperCase();
    const actual = $("answer-input").value.trim().toUpperCase().replace(/\s+/g, " ");
    const maxLength = Math.max(expected.length, actual.length, 1);
    let matches = 0;
    for (let index = 0; index < Math.min(expected.length, actual.length); index += 1) {
      if (expected[index] === actual[index]) matches += 1;
    }
    const accuracy = Math.round((matches / maxLength) * 100);
    lastAnswerCorrect = expected === actual;
    $("score-label").textContent = `${accuracy}% accurate`;
    $("answer-message").textContent = lastAnswerCorrect ? "Perfect copy." : "Review the revealed copy below.";
    $("result").hidden = false;
    $("result").innerHTML = `<strong>Expected: ${escapeHtml(expected)}</strong><span>${accuracy}% character accuracy · ${matches}/${maxLength} characters matched</span>`;
    if (settings.autoAdvance && (!settings.repeatCorrect || lastAnswerCorrect)) {
      setTimeout(() => { if (!playback.active) { generateExercise(); startTransmission(); } }, 1300);
    }
  }

  function revealAnswer() {
    $("answer-input").value = exercise;
    $("submit-button").disabled = false;
    scoreAnswer();
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  function renderAlphabet() {
    $("alphabet-grid").innerHTML = Object.entries(MORSE).map(([character, code]) => `<div class="morse-cell"><strong>${escapeHtml(character)}</strong><code>${code}</code></div>`).join("");
  }

  function switchView(viewName) {
    document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
    document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `${viewName}-view`));
  }

  function bindEvents() {
    document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
    $("mode-select").addEventListener("change", generateExercise);
    $("group-select").addEventListener("change", generateExercise);
    $("session-select").addEventListener("change", () => showToast($("session-select").value === "0" ? "Unlimited session selected" : `${$("session-select").value}-minute session selected`));
    $("start-button").addEventListener("click", startTransmission);
    $("replay-button").addEventListener("click", () => { stopTransmission(); playFrom(0); });
    $("rewind-button").addEventListener("click", rewindOneLetter);
    $("pause-button").addEventListener("click", togglePause);
    $("stop-button").addEventListener("click", stopTransmission);
    $("skip-button").addEventListener("click", () => { stopTransmission(); generateExercise(); startTransmission(); });
    $("answer-input").addEventListener("pointerdown", armAnswerInput);
    $("answer-input").addEventListener("click", armAnswerInput);
    $("answer-input").addEventListener("input", () => { $("submit-button").disabled = !$("answer-input").value.trim(); });
    $("submit-button").addEventListener("click", scoreAnswer);
    $("reveal-button").addEventListener("click", revealAnswer);

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
    $("auto-advance").addEventListener("change", (event) => { settings.autoAdvance = event.target.checked; saveSettings(); });
    $("repeat-correct").addEventListener("change", (event) => { settings.repeatCorrect = event.target.checked; saveSettings(); });
    $("profile-name").addEventListener("input", (event) => { settings.profileName = event.target.value; saveSettings(); updateProfile(); });
    $("reset-settings").addEventListener("click", () => { Object.assign(settings, STANDARD); saveSettings(); updateSettingDisplays(); updateProfile(); showToast("Standard timing restored"); });

    document.addEventListener("keydown", (event) => {
      const answerInput = $("answer-input");
      const typingInAnswer = document.activeElement === answerInput && !answerInput.readOnly;
      const transmissionCanRewind = playback.active || playback.currentIndex >= exercise.length;
      if (event.code === "Space" && transmissionCanRewind && !playback.countdown && !typingInAnswer) {
        event.preventDefault();
        rewindOneLetter();
      }
    });
  }

  updateSettingDisplays();
  updateProfile();
  renderAlphabet();
  bindEvents();
  generateExercise();
  disarmAnswerInput();
})();
