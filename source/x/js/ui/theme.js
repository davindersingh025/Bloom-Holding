/* Light / dark theme.
   The initial theme is applied by an inline script in index.html (before
   first paint, no flash); this module renders the toggle and switches with a
   circular reveal that grows from the button (View Transitions API where
   supported, instant otherwise). */

import { icon } from "bloom:/js/ui/dom.js";

const KEY = "bloom.theme";

export const getTheme = () => document.documentElement.dataset.theme === "dark" ? "dark" : "light";

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#15100E" : "#F8F5EB");
  try { localStorage.setItem(KEY, theme); } catch { /* storage unavailable */ }
  document.querySelectorAll("[data-theme-toggle]").forEach(syncButton);
}

function syncButton(btn) {
  const dark = getTheme() === "dark";
  btn.setAttribute("aria-checked", String(dark));
  btn.title = dark ? "Switch to light mode" : "Switch to dark mode";
}

/* A sliding light/dark switch: sun and moon sit in the track, the knob
   glides between them (role="switch", checked = dark). */
/* Theme switching is paused for now — the toggle renders nothing and the
   site always runs in light mode. */
export const themeToggle = () => "";
const _themeToggleOff = (cls = "") => `
  <button class="theme-toggle ${cls}" type="button" role="switch" data-theme-toggle aria-checked="${getTheme() === "dark"}" aria-label="Dark mode" title="${getTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode"}">
    <span class="theme-toggle__sun" aria-hidden="true">${icon("sun", 15)}</span>
    <span class="theme-toggle__moon" aria-hidden="true">${icon("moon", 15)}</span>
    <span class="theme-toggle__knob" aria-hidden="true"></span>
  </button>`;

export function toggleTheme(originEl) {
  const next = getTheme() === "dark" ? "light" : "dark";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce || document.hidden) { apply(next); return; }
  const r = originEl?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : innerWidth - 40, y = r ? r.top + r.height / 2 : 40;
  const root = document.documentElement;
  root.style.setProperty("--tx", `${x}px`);
  root.style.setProperty("--ty", `${y}px`);
  root.style.setProperty("--tr", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  /* The browser may skip the transition (e.g. tab in background); the theme
     still applies via the update callback, so swallow the aborted promises. */
  const vt = document.startViewTransition(() => apply(next));
  [vt.ready, vt.finished, vt.updateCallbackDone].forEach((p) => p?.catch(() => {}));
}

/* One delegated listener for every toggle on the page (nav, login, register). */
export function initTheme() {
  apply("light");
  return;
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-toggle]");
    if (btn) toggleTheme(btn);
  });
  /* Follow the OS setting until the visitor makes an explicit choice. */
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
    if (!saved) apply(e.matches ? "dark" : "light");
  });
}
