/* Bloom Properties — guest project listing (original: /guest). */

import { PROJECTS, EXPLORE, divisionById, img } from "bloom:/js/data.js";
import { eyebrow, icon, esc, arrow, monogram } from "bloom:/js/ui/dom.js";
import { t } from "bloom:/js/i18n.js";
import { mediaCarousel, wireCarousels } from "bloom:/js/ui/carousel.js";
import { exploreMarkup, wireExplore } from "bloom:/js/ui/explore.js";
import { cursorPreview, observeReveals, tilt, imageFade } from "bloom:/js/ui/motion.js";
import { breadcrumb } from "bloom:/js/pages/space.js";
import { tabsMarkup, wireTabs } from "bloom:/js/ui/tabs.js";

const COLLECTIONS = ["All", "Bloom Living", "Bloom Communities"];
const COLLECTION_COLOR = { "Bloom Living": "var(--div-retail)", "Bloom Communities": "var(--div-properties)" };
const SORTS = { featured: "Featured", az: "Name A–Z", za: "Name Z–A", photos: "Most photos" };

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? t("goodMorning") : h < 17 ? t("goodAfternoon") : t("goodEvening");
};

export const mapHref = (p) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} Bloom Abu Dhabi`)}`;

export function projectCard(p, i) {
  return `
    <article class="pcard reveal" style="--i:${i % 6}">
      ${mediaCarousel({ images: p.images, name: p.name })}
      <div class="pcard__body">
        <h3 class="pcard__name"><a class="pcard__link" href="#/project/${p.id}">${esc(p.name)}</a></h3>
        <p class="pcard__meta">
          <span class="dot-label" style="--c: ${COLLECTION_COLOR[p.collection]}">${esc(p.collection)}</span>
          ${p.images.length ? `<span>${icon("image", 14)} ${p.images.length}</span>` : ""}
          ${p.documents ? `<span>${icon("file", 14)} Brochure</span>` : ""}
        </p>
        ${p.map ? `<a class="pcard__map" href="${mapHref(p)}" target="_blank" rel="noopener">${icon("pin", 14)} Google Map</a>` : ""}
      </div>
      <span class="pcard__go" aria-hidden="true">${icon("arrowUpRight", 18)}</span>
    </article>`;
}

const listRow = (p, i) => `
  <li class="prow reveal" style="--i:${i % 8}" ${p.images[0] ? `data-preview="${img(p.images[0], 520)}"` : ""}>
    <a class="prow__link" href="#/project/${p.id}">
      <span class="prow__thumb">${p.images[0] ? `<img src="${img(p.images[0], 200)}" alt="" loading="lazy" />` : `<span>${monogram(p.name)}</span>`}</span>
      <span class="prow__name">${esc(p.name)}</span>
      <span class="prow__col t-caption">${esc(p.collection)}</span>
      <span class="prow__col t-caption">${p.images.length ? `${p.images.length} photos` : "Imagery coming soon"}</span>
      ${arrow(18)}
    </a>
  </li>`;

const skeletons = (n) => Array.from({ length: n }, () => `
  <div class="pcard pcard--skeleton" aria-hidden="true"><div class="sk sk--media"></div><div class="pcard__body"><div class="sk sk--line"></div><div class="sk sk--line sk--short"></div></div></div>`).join("");

export function render(view, { query }) {
  const d = divisionById("properties");
  const state = {
    tab: query.get("tab") === "explore" ? "explore" : "communities",
    collection: COLLECTIONS.includes(query.get("collection")) ? query.get("collection") : "All",
    q: query.get("q") || "",
    sort: "featured",
    view: "grid",
  };
  try { state.view = localStorage.getItem("bloom.view") === "list" ? "list" : "grid"; } catch { /* ignore */ }

  view.innerHTML = `
    <section class="page-head container" data-section="${t("properties")}">
      ${breadcrumb([{ label: t("home"), href: "#/" }, { label: d.name }])}
      <div class="page-head__grid" data-reveal>
        <div>
          <p class="t-meta page-head__greet">${icon("sparkle", 14)} ${greeting()}</p>
          <h1 class="t-h1"><span class="line-mask"><span>Curated <span class="t-serif">communities</span></span></span></h1>
        </div>
        <p class="t-body-lg reveal" style="--i:2">Browse Bloom's residential communities and the wider portfolio. Sign in to see the units you own.</p>
      </div>
    </section>

    <section class="container listing" data-section="Communities">
      ${tabsMarkup("ptabs", [
        { id: "communities", label: `Communities <span class="tab__count">${PROJECTS.length}</span>` },
        { id: "explore", label: `${t("exploreProperties")} <span class="tab__count">${EXPLORE.length}</span>` },
      ], state.tab)}

      <div class="tabpanel" id="ptabs-panel-communities" role="tabpanel" aria-labelledby="ptabs-tab-communities" ${state.tab === "communities" ? "" : "hidden"}>
        <div class="toolbar toolbar--sticky">
          <label class="search-field">
            ${icon("search", 18)}<span class="sr-only">Search communities</span>
            <input class="search-field__input" type="search" placeholder="Search communities" value="${esc(state.q)}" data-q />
            <button class="search-field__clear" type="button" aria-label="Clear search" data-clear ${state.q ? "" : "hidden"}>${icon("close", 16)}</button>
          </label>
          <div class="chips" role="radiogroup" aria-label="Collection">
            ${COLLECTIONS.map((c) => {
              const n = c === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.collection === c).length;
              return `<button class="chip" role="radio" aria-checked="${c === state.collection}" data-col="${c}" style="--c: ${COLLECTION_COLOR[c] || "var(--color-secondary)"}">${c}<span class="chip__count">${n}</span></button>`;
            }).join("")}
          </div>
          <div class="toolbar__end">
            <div class="select select--inline">
              <label class="sr-only" for="sort">Sort</label>
              <select class="input input--sm" id="sort" data-sort>${Object.entries(SORTS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
              ${icon("chevronDown", 16)}
            </div>
            <div class="seg" role="group" aria-label="View">
              <button class="seg__btn seg__btn--icon" data-view="grid" aria-pressed="${state.view === "grid"}" aria-label="Grid view">${icon("grid", 18)}</button>
              <button class="seg__btn seg__btn--icon" data-view="list" aria-pressed="${state.view === "list"}" aria-label="List view">${icon("list", 18)}</button>
            </div>
          </div>
        </div>
        <p class="t-caption listing__status" aria-live="polite" data-status></p>
        <div class="listing__results" data-results>${skeletons(6)}</div>
      </div>

      <div class="tabpanel" id="ptabs-panel-explore" role="tabpanel" aria-labelledby="ptabs-tab-explore" ${state.tab === "explore" ? "" : "hidden"}>
        ${exploreMarkup({ cat: query.get("cat") || "All" })}
      </div>
    </section>`;

  const results = view.querySelector("[data-results]");
  const status = view.querySelector("[data-status]");
  const input = view.querySelector("[data-q]");
  let disposePreview = () => {};

  const filtered = () => {
    const nq = state.q.trim().toLowerCase();
    let rows = PROJECTS.filter((p) => (state.collection === "All" || p.collection === state.collection) && (!nq || p.name.toLowerCase().includes(nq)));
    if (state.sort === "az") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === "za") rows = [...rows].sort((a, b) => b.name.localeCompare(a.name));
    if (state.sort === "photos") rows = [...rows].sort((a, b) => b.images.length - a.images.length);
    return rows;
  };

  const draw = () => {
    const rows = filtered();
    disposePreview();
    status.textContent = `${rows.length} ${rows.length === 1 ? "community" : "communities"}${state.collection !== "All" ? ` in ${state.collection}` : ""}${state.q ? ` matching “${state.q}”` : ""}`;
    if (!rows.length) {
      results.className = "listing__results";
      results.innerHTML = `<div class="empty">
        <span class="empty__icon">${icon("search", 22)}</span>
        <p class="t-h3">No communities match “${esc(state.q)}”</p>
        <p class="t-caption">Try another name, or look in the full portfolio.</p>
        <div class="cluster"><button class="btn btn--ghost" data-reset>Clear filters</button><button class="btn btn--primary" data-goto-explore>Search all properties</button></div></div>`;
      return;
    }
    if (state.view === "grid") {
      results.className = "listing__results pgrid";
      results.innerHTML = rows.map(projectCard).join("");
      wireCarousels(results);
    } else {
      results.className = "listing__results";
      results.innerHTML = `<ul class="plist">${rows.map(listRow).join("")}</ul>`;
      disposePreview = cursorPreview(results.querySelector(".plist")) || (() => {});
    }
    observeReveals(results);
    tilt(results);
    imageFade(results);
  };

  const syncHash = () => {
    const p = new URLSearchParams();
    if (state.tab === "explore") p.set("tab", "explore");
    if (state.collection !== "All") p.set("collection", state.collection);
    if (state.q) p.set("q", state.q);
    history.replaceState(null, "", `#/properties${p.toString() ? `?${p}` : ""}`);
  };

  /* Brief skeleton on first paint, as data would stream from the API */
  const boot = setTimeout(draw, 450);

  let tmr;
  input.addEventListener("input", () => {
    clearTimeout(tmr);
    tmr = setTimeout(() => { state.q = input.value; view.querySelector("[data-clear]").hidden = !state.q; draw(); syncHash(); }, 120);
  });
  view.querySelector("[data-clear]").addEventListener("click", (e) => { input.value = ""; state.q = ""; e.currentTarget.hidden = true; draw(); syncHash(); input.focus(); });
  view.querySelector("[data-sort]").addEventListener("change", (e) => { state.sort = e.target.value; draw(); });
  view.querySelectorAll("[data-col]").forEach((c) => c.addEventListener("click", () => {
    state.collection = c.dataset.col;
    view.querySelectorAll("[data-col]").forEach((x) => x.setAttribute("aria-checked", String(x === c)));
    draw(); syncHash();
  }));
  view.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
    state.view = b.dataset.view;
    try { localStorage.setItem("bloom.view", state.view); } catch { /* ignore */ }
    view.querySelectorAll("[data-view]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    draw();
  }));
  results.addEventListener("click", (e) => {
    if (e.target.closest("[data-reset]")) {
      state.q = ""; state.collection = "All"; input.value = "";
      view.querySelectorAll("[data-col]").forEach((x) => x.setAttribute("aria-checked", String(x.dataset.col === "All")));
      draw(); syncHash();
    }
    if (e.target.closest("[data-goto-explore]")) {
      view.querySelector("#ptabs-tab-explore").click();
      const ex = view.querySelector("[data-ex-q]"); ex.value = state.q; ex.dispatchEvent(new Event("input"));
    }
  });

  wireTabs(view, "ptabs", (id) => { state.tab = id; syncHash(); });
  const disposeExplore = wireExplore(view, { cat: query.get("cat") || "All" });

  return {
    title: "Bloom Properties",
    key: "properties",
    cleanup: () => { clearTimeout(boot); disposePreview(); disposeExplore(); },
  };
}
