/* Floating navigation: free-standing logo + pill.
   - Plain, labelled destinations: Properties · Divisions ▾
   - Divisions menu: colour-coded, each entry says what you can do there
   - Search (⌘K), language, contact, sign in
   - Scroll progress as a slim terracotta line along the pill
   - Mobile: full-screen sheet */

import { LOGO } from "bloom:/js/ui/logo.js";
import { html, icon, esc, arrow, siri } from "bloom:/js/ui/dom.js";
import { DIVISIONS, img } from "bloom:/js/data.js";
import { t, getLang, setLang } from "bloom:/js/i18n.js";
import { openSearch } from "bloom:/js/ui/search.js";
import { openAuth } from "bloom:/js/ui/auth.js";
import { openContact } from "bloom:/js/ui/contact.js";
import { openOverlay } from "bloom:/js/ui/overlay.js";
import { themeToggle } from "bloom:/js/ui/theme.js";

const signedIn = () => { try { return sessionStorage.getItem("bloom-signed-in") === "1"; } catch (e) { return false; } };

let navEl, currentKey = "universal";

const isDivision = (key) => DIVISIONS.some((d) => d.id === key && d.id !== "properties");
const cur = (key) => (key === currentKey ? 'aria-current="page"' : "");

function template() {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  return `
  <header class="nav" data-state="shown">
    <div class="nav__bar">
    <a class="nav__brand" href="#/" aria-label="Bloom — ${t("home")}"><span class="wordmark wordmark--logo">${LOGO}</span></a>
    <div class="nav__pill">

      <div class="nav__center">
        <nav class="nav__links" aria-label="Primary">
          <a class="nav__link" href="#/properties" ${cur("properties")} style="--c: var(--div-properties)">${t("properties")}</a>
          <div class="nav__dest">
            <button class="nav__link nav__link--menu ${isDivision(currentKey) ? "is-current" : ""}" aria-haspopup="true" aria-expanded="false" aria-controls="nav-menu">
              ${t("divisions")} ${icon("chevronDown", 16, "nav__chev")}
            </button>
            <div class="menu" id="nav-menu" hidden></div>
          </div>
        </nav>
        <span class="nav__sep" aria-hidden="true"></span>
        <button class="nav__search" data-search aria-label="${t("search")} (${isMac ? "⌘" : "Ctrl"} K)">
          ${icon("search", 22)}<kbd class="kbd nav__kbd">${isMac ? "⌘" : "Ctrl"} K</kbd>
        </button>
        <div class="seg nav__lang" role="group" aria-label="Language">
          <button class="seg__btn" data-lang="en" aria-pressed="${getLang() === "en"}">EN</button>
          <button class="seg__btn" data-lang="ar" aria-pressed="${getLang() === "ar"}" lang="ar">عربي</button>
        </div>
      </div>

      <div class="nav__end">
        <a class="nav__gpt ${currentKey === "gpt" ? "is-current" : ""}" href="#/gpt" aria-label="Bloom GPT"><span class="siri" aria-hidden="true"><i></i><i></i><i></i><i></i><em></em><u></u><b></b></span><span class="nav__gpt-label">Bloom GPT</span></a>
        ${themeToggle("nav__theme")}
        <button class="icon-btn nav__search-m" data-search aria-label="${t("search")}">${icon("search", 20)}</button>
        <button class="nav__register" data-register>
          ${t("register")}
        </button>
        <button class="btn btn--primary nav__signin" data-signin>${signedIn() ? "My Bloom" : t("signIn")}</button>
        <button class="icon-btn nav__menu-btn" data-sheet aria-label="${t("menu")}">${icon("menu", 22)}</button>
      </div>
      <span class="nav__progress" aria-hidden="true"><span></span></span>
    </div>
    </div>
  </header>`;
}

const divisionItem = (d, cls, i = 0) => `
  <a class="${cls} ${d.id === currentKey ? "is-current" : ""}" href="${d.route}" ${cur(d.id)} style="--c: var(--div-${d.id}); --i:${i}">
    <img class="menu__thumb" src="${img(d.image, 160)}" alt="" loading="lazy" />
    <span class="menu__text"><span class="menu__label">${esc(d.name)}</span><span class="menu__sub">${esc(d.task)}</span></span>
    ${arrow(16)}
  </a>`;

function renderMenu() {
  navEl.querySelector(".menu").innerHTML = `
    <p class="menu__title t-meta">${t("destinations")}</p>
    <div class="menu__grid">${DIVISIONS.map((d, i) => divisionItem(d, "menu__item", i)).join("")}</div>
    <a class="menu__foot" href="#/">${t("theBloomExperience")} ${arrow(14)}</a>`;
}

function toggleMenu(force) {
  const btn = navEl.querySelector(".nav__link--menu");
  const menu = navEl.querySelector(".menu");
  const open = force ?? btn.getAttribute("aria-expanded") !== "true";
  btn.setAttribute("aria-expanded", String(open));
  if (open) { renderMenu(); menu.hidden = false; requestAnimationFrame(() => menu.classList.add("is-open")); menu.querySelector(".menu__item")?.focus(); }
  else { menu.classList.remove("is-open"); setTimeout(() => { if (btn.getAttribute("aria-expanded") === "false") menu.hidden = true; }, 220); }
}

function openSheet() {
  const content = html(`
    <nav class="sheet" aria-label="${t("menu")}">
      <span class="wordmark wordmark--logo">${LOGO}</span>
      <a class="sheet__home ${currentKey === "universal" ? "is-current" : ""}" href="#/" data-close>${t("theBloomExperience")} ${arrow(18)}</a>
      <ul class="sheet__list">
        ${DIVISIONS.map((d, i) => `<li style="--i:${i}">${divisionItem(d, "sheet__link").replace("<a ", "<a data-close ")}</li>`).join("")}
      </ul>
      <div class="sheet__foot">
        <a class="nav__gpt nav__gpt--lg" href="#/gpt" data-close><span class="siri" aria-hidden="true"><i></i><i></i><i></i><i></i><em></em><u></u><b></b></span><span>Ask Bloom GPT</span>${arrow(16)}</a>
        <div class="sheet__auth">
          <button class="nav__register nav__register--lg" data-sheet-register>${t("register")}</button>
          <button class="btn btn--primary btn--lg" data-sheet-signin>${t("signIn")}</button>
        </div>
        <div class="cluster">
          <button class="btn btn--ghost" data-sheet-contact>${t("contactUs")}</button>
          <div class="seg" role="group" aria-label="Language">
            <button class="seg__btn" data-lang="en" aria-pressed="${getLang() === "en"}">EN</button>
            <button class="seg__btn" data-lang="ar" aria-pressed="${getLang() === "ar"}" lang="ar">عربي</button>
          </div>
        </div>
      </div>
    </nav>`);
  const o = openOverlay({ kind: "sheet", label: t("menu"), content });
  content.querySelector("[data-sheet-signin]").addEventListener("click", () => { o.close(); setTimeout(() => openAuth(), 80); });
  content.querySelector("[data-sheet-register]").addEventListener("click", () => { o.close(); setTimeout(() => openAuth("register"), 80); });
  content.querySelector("[data-sheet-contact]").addEventListener("click", () => { o.close(); setTimeout(() => openContact(), 80); });
  content.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => { setLang(b.dataset.lang); o.close(); }));
}

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, y / max) : 0;
  navEl.querySelector(".nav__progress span").style.transform = `scaleX(${p})`;

  const header = navEl.firstElementChild;
  const last = onScroll.last ?? 0;
  const menuOpen = navEl.querySelector(".nav__link--menu").getAttribute("aria-expanded") === "true";
  header.dataset.state = y > 240 && y > last + 4 && !menuOpen ? "hidden" : y < last - 4 || y < 240 ? "shown" : header.dataset.state;
  document.documentElement.dataset.nav = header.dataset.state;
  header.classList.toggle("is-scrolled", y > 40);
  /* The free-standing logo turns cream while it sits over a dark video hero */
  const darkHero = document.querySelector("#view > .vhero:first-child");
  header.classList.toggle("is-over-dark", Boolean(darkHero) && y < darkHero.offsetHeight - 90);
  onScroll.last = y;
}

export function setNavRoute(key) {
  currentKey = key;
  if (!navEl) return;
  navEl.querySelectorAll(".nav__links > a").forEach((a) => {
    const on = a.getAttribute("href") === (key === "properties" ? "#/properties" : "");
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
  navEl.querySelector(".nav__link--menu").classList.toggle("is-current", isDivision(key));
  toggleMenu(false);
  onScroll();
}

export function mountNav() {
  const mount = document.getElementById("site-nav");
  const draw = () => {
    mount.innerHTML = template();
    navEl = mount;
    wire();
  };

  function wire() {
    navEl.querySelector(".nav__link--menu").addEventListener("click", () => toggleMenu());
    navEl.querySelectorAll("[data-search]").forEach((b) => b.addEventListener("click", () => openSearch()));
    navEl.querySelector("[data-signin]").addEventListener("click", () => { if (signedIn()) location.hash = "/app"; else openAuth(); });
    navEl.querySelector("[data-register]").addEventListener("click", () => openAuth("register"));
    navEl.querySelector("[data-sheet]").addEventListener("click", openSheet);
    navEl.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

    const menu = navEl.querySelector(".menu");
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) toggleMenu(false); });
    menu.addEventListener("keydown", (e) => {
      const items = [...menu.querySelectorAll("a")];
      const i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      if (e.key === "Escape") { toggleMenu(false); navEl.querySelector(".nav__link--menu").focus(); }
    });
  }

  draw();
  document.addEventListener("click", (e) => { if (navEl && !e.target.closest(".nav__dest")) toggleMenu(false); });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    else if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); }
  });

  return { redraw: () => { draw(); setNavRoute(currentKey); } };
}
