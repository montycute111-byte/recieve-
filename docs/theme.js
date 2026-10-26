(function () {
  const STORAGE_KEY = "morseReceiveTheme";
  const validThemes = new Set(["dark", "light", "system"]);
  const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
  function readChoice() { try { const saved = window.localStorage?.getItem(STORAGE_KEY); return validThemes.has(saved) ? saved : "dark"; } catch (error) { return "dark"; } }
  function resolve(choice) { return choice === "system" ? (mediaQuery?.matches ? "dark" : "light") : choice; }
  function apply(choice = readChoice()) {
    const selected = validThemes.has(choice) ? choice : "dark";
    const resolved = resolve(selected);
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.themeChoice = selected;
    root.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === "dark" ? "#0B1420" : "#101820";
    document.querySelectorAll("#theme-select").forEach((select) => { select.value = selected; });
    window.dispatchEvent(new CustomEvent("morse:theme-change", { detail: { choice: selected, theme: resolved } }));
  }
  function set(choice) { const selected = validThemes.has(choice) ? choice : "dark"; try { window.localStorage?.setItem(STORAGE_KEY, selected); } catch (error) {} apply(selected); }
  window.morseTheme = { get: readChoice, set, apply };
  apply();
  document.addEventListener("DOMContentLoaded", () => { apply(); document.addEventListener("change", (event) => { if (event.target?.id === "theme-select") set(event.target.value); }); });
  mediaQuery?.addEventListener?.("change", () => { if (readChoice() === "system") apply("system"); });
})();
