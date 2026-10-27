/* Explore Properties — the full portfolio as a searchable, grouped table.
   Original: 60 stacked image cards (most without imagery). */

import { EXPLORE, EXPLORE_CATEGORIES, img } from "bloom:/js/data.js";
import { icon, esc, monogram, arrow } from "bloom:/js/ui/dom.js";
import { cursorPreview } from "bloom:/js/ui/motion.js";

const PAGE = 12;

/* Category colours reuse the division palette where a category maps to one */
export const CAT_COLOR = {
  "Communities": "var(--div-properties)",
  "Towers & Buildings": "var(--div-facilities)",
  "Education": "var(--div-education)",
  "Retail": "var(--div-retail)",
  "Leasing": "var(--div-hospitality)",
  "Land": "var(--div-landscape)",
};

export function exploreMarkup({ cat = "All", q = "" } = {}) {
  return `
    <div class="explore" data-explore>
      <div class="toolbar">
        <label class="search-field">
          ${icon("search", 18)}
          <span class="sr-only">Search properties</span>
          <input class="search-field__input" type="search" placeholder="Search ${EXPLORE.length} properties" value="${esc(q)}" data-ex-q />
          <button class="search-field__clear" type="button" aria-label="Clear search" data-ex-clear ${q ? "" : "hidden"}>${icon("close", 16)}</button>
        </label>
        <div class="chips" role="radiogroup" aria-label="Category">
          ${EXPLORE_CATEGORIES.map((c) => {
            const n = c === "All" ? EXPLORE.length : EXPLORE.filter((e) => e.category === c).length;
            return `<button class="chip" role="radio" aria-checked="${c === cat}" data-ex-cat="${esc(c)}" style="--c: ${CAT_COLOR[c] || "var(--color-secondary)"}">${esc(c)}<span class="chip__count">${n}</span></button>`;
          }).join("")}
        </div>
      </div>
      <p class="t-caption explore__status" aria-live="polite" data-ex-status></p>
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th scope="col" class="table__num">#</th>
            <th scope="col">Property</th>
            <th scope="col">Category</th>
            <th scope="col">Imagery</th>
            <th scope="col"><span class="sr-only">Open</span></th>
          </tr></thead>
          <tbody data-ex-body></tbody>
        </table>
      </div>
      <nav class="pagination" aria-label="Pagination" data-ex-pages></nav>
    </div>`;
}

export function wireExplore(root, { cat = "All", q = "", onState } = {}) {
  const el = root.querySelector("[data-explore]");
  if (!el) return () => {};
  const state = { cat, q, page: 1 };
  const body = el.querySelector("[data-ex-body]");
  const pages = el.querySelector("[data-ex-pages]");
  const status = el.querySelector("[data-ex-status]");
  const input = el.querySelector("[data-ex-q]");
  const clear = el.querySelector("[data-ex-clear]");

  const filtered = () => {
    const nq = state.q.trim().toLowerCase();
    return EXPLORE.filter((e) => (state.cat === "All" || e.category === state.cat) && (!nq || e.name.toLowerCase().includes(nq)));
  };

  const draw = () => {
    const rows = filtered();
    const total = Math.max(1, Math.ceil(rows.length / PAGE));
    state.page = Math.min(state.page, total);
    const slice = rows.slice((state.page - 1) * PAGE, state.page * PAGE);
    status.textContent = rows.length
      ? `Showing ${(state.page - 1) * PAGE + 1}–${(state.page - 1) * PAGE + slice.length} of ${rows.length}${state.cat !== "All" ? ` in ${state.cat}` : ""}`
      : "";

    body.innerHTML = rows.length
      ? slice.map((e, i) => `
        <tr class="table__row" style="--i:${i}" ${e.images[0] ? `data-preview="${img(e.images[0], 520)}"` : ""}>
          <td class="table__num t-meta">${String((state.page - 1) * PAGE + i + 1).padStart(2, "0")}</td>
          <th scope="row"><a class="table__link" href="#/project/${e.id}">
            <span class="table__thumb">${e.images[0] ? `<img src="${img(e.images[0], 120)}" alt="" loading="lazy" />` : `<span>${monogram(e.name)}</span>`}</span>
            <span>${esc(e.name)}</span></a></th>
          <td><span class="badge badge--cat" style="--c: ${CAT_COLOR[e.category]}">${esc(e.category)}</span></td>
          <td>${e.images.length ? `<span class="status status--ok">${e.images.length} photos</span>` : '<span class="status">Not yet published</span>'}</td>
          <td class="table__go">${arrow(16)}</td>
        </tr>`).join("")
      : `<tr><td colspan="5"><div class="empty">
          <span class="empty__icon">${icon("search", 22)}</span>
          <p class="t-h3">No properties match “${esc(state.q)}”${state.cat !== "All" ? ` in ${esc(state.cat)}` : ""}</p>
          <p class="t-caption">Check the spelling or clear the filters.</p>
          <button class="btn btn--ghost" data-ex-reset>Clear filters</button></div></td></tr>`;

    pages.innerHTML = total > 1 ? `
      <button class="icon-btn icon-btn--outline" data-ex-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Previous page">${icon("chevronLeft", 16, "icon--dir")}</button>
      ${Array.from({ length: total }, (_, i) => `<button class="pagination__num" data-ex-page="${i + 1}" ${i + 1 === state.page ? 'aria-current="page"' : ""}>${i + 1}</button>`).join("")}
      <button class="icon-btn icon-btn--outline" data-ex-page="${state.page + 1}" ${state.page === total ? "disabled" : ""} aria-label="Next page">${icon("chevronRight", 16, "icon--dir")}</button>` : "";

    el.querySelectorAll("[data-ex-cat]").forEach((c) => c.setAttribute("aria-checked", String(c.dataset.exCat === state.cat)));
    clear.hidden = !state.q;
    onState?.(state);
  };

  let tmr;
  input.addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(() => { state.q = input.value; state.page = 1; draw(); }, 120); });
  clear.addEventListener("click", () => { input.value = ""; state.q = ""; draw(); input.focus(); });
  el.addEventListener("click", (e) => {
    const c = e.target.closest("[data-ex-cat]"); if (c) { state.cat = c.dataset.exCat; state.page = 1; draw(); }
    const p = e.target.closest("[data-ex-page]"); if (p && !p.disabled) { state.page = Number(p.dataset.exPage); draw(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    if (e.target.closest("[data-ex-reset]")) { state.cat = "All"; state.q = ""; input.value = ""; draw(); }
    const row = e.target.closest(".table__row");
    if (row && !e.target.closest("a")) row.querySelector("a").click();
  });
  /* Arrow keys move between chips in the radiogroup */
  el.querySelector(".chips").addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const chips = [...el.querySelectorAll("[data-ex-cat]")];
    const i = chips.indexOf(document.activeElement);
    const next = chips[(i + (e.key === "ArrowRight" ? 1 : -1) + chips.length) % chips.length];
    next.focus(); next.click();
  });

  draw();
  return cursorPreview(el.querySelector("tbody")) || (() => {});
}
