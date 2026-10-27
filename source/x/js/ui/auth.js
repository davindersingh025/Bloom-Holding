/* Sign in / Register entry point. Every "Sign in" and "Register" control on
   the site calls openAuth(); it routes to the login page (js/pages/login.js)
   or the Bloom GPT registration chat (js/pages/register.js) and remembers
   where the visitor came from so "Back" returns them there. */

import { siri } from "bloom:/js/ui/dom.js";

const RETURN_KEY = "bloom.authReturn";

/* Last pointer position, so the Register portal grows from where you clicked */
let lastPoint = null;
addEventListener("pointerdown", (e) => { lastPoint = { x: e.clientX, y: e.clientY, t: performance.now() }; }, true);

/* Register "portal": a terracotta circle expands from the click with the
   Bloom GPT orb swirling at its centre, the chat loads behind it, then the
   portal dissolves to reveal the conversation. */
function openPortal(go) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { go(); return; }
  const recent = lastPoint && performance.now() - lastPoint.t < 1500;
  const x = recent ? lastPoint.x : innerWidth / 2, y = recent ? lastPoint.y : innerHeight / 2;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const el = document.createElement("div");
  el.className = "gpt-portal";
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `--px:${x}px; --py:${y}px; --pr:${r}px`;
  el.innerHTML = `
    <div class="gpt-portal__core">
      <span class="gpt-portal__rings"><i></i><i></i><i></i></span>
      <span class="gpt-portal__orb">${siri()}</span>
      <p class="gpt-portal__name">Bloom GPT</p>
      <p class="gpt-portal__sub">Setting up your registration<span class="gpt-portal__dots"><i>.</i><i>.</i><i>.</i></span></p>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-open"));
  setTimeout(go, 650);
  setTimeout(() => el.classList.add("is-out"), 1500);
  setTimeout(() => el.remove(), 2300);
}

export function openAuth(view = "signin") {
  /* Remember the page we came from — but not when hopping between the two
     auth pages, and never a login deep link (e.g. #/portal?login=1), or it
     would redirect straight back here. */
  const onAuthPage = /^#\/(login|register)/.test(location.hash);
  if (!onAuthPage) {
    const here = location.hash.replace(/([?&])login=1(&|$)/, (_, a, b) => (b ? a : "")).replace(/[?&]$/, "");
    try { sessionStorage.setItem(RETURN_KEY, here || "#/"); } catch { /* storage unavailable */ }
  }
  if (view === "register" && !location.hash.startsWith("#/register")) openPortal(() => { location.hash = "/register"; });
  else location.hash = view === "register" ? "/register" : "/login";
}

export function authReturnRoute() {
  try { return sessionStorage.getItem(RETURN_KEY) || "#/"; } catch { return "#/"; }
}
