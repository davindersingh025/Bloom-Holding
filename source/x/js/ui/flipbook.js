/* Flipbook — a project's photos as a real page-turning book.
   Opens from a Featured "book" card: the book flies from the card to the
   centre of the screen (FLIP), everything behind blurs, and each click,
   arrow key or swipe turns a leaf on its spine with a curling shadow.
   Leaf 0's front is a title page; after that every page is a photo. The
   last right-hand page links to the project. Esc / the close button /
   the backdrop close it and return focus to the card. */

import { icon, esc, arrow } from "bloom:/js/ui/dom.js";
import { img } from "bloom:/js/data.js";

export function openFlipbook(project, originEl) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const photos = project.images;
  /* Pages: [title, photo1, photo2, …, end]; leaves carry two pages each */
  const pages = [{ kind: "title" }, ...photos.map((src, i) => ({ kind: "photo", src, i })), { kind: "end" }];
  if (pages.length % 2) pages.splice(pages.length - 1, 0, { kind: "blank" });
  const leaves = [];
  for (let i = 0; i < pages.length; i += 2) leaves.push([pages[i], pages[i + 1]]);
  const total = photos.length;

  const face = (pg, side) => {
    if (pg.kind === "title") return `
      <div class="fb__title">
        <img src="${img(photos[0], 900)}" alt="" />
        <div class="fb__title-body"><span class="wordmark">Bloom</span><span class="t-meta">${esc(project.collection)}</span><strong>${esc(project.name)}</strong><span class="fb__title-hint">${icon("return", 14)} Tap to turn the page</span></div>
      </div>`;
    if (pg.kind === "photo") return `
      <img class="fb__photo" src="${img(pg.src, 1200)}" alt="${esc(project.name)} — photo ${pg.i + 1} of ${total}" />
      <span class="fb__folio">${String(pg.i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>`;
    if (pg.kind === "end") return `
      <div class="fb__end"><span class="wordmark">Bloom</span><strong>${esc(project.name)}</strong><p>Brochure, location and enquiries are on the project page.</p><a class="fb__cta" href="#/project/${project.id}" data-fb-go>View project ${arrow(16)}</a></div>`;
    return `<div class="fb__blank ${side}"></div>`;
  };

  const el = document.createElement("div");
  el.className = "fb";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", `${project.name} photo book`);
  el.innerHTML = `
    <div class="fb__scrim" data-fb-close></div>
    <div class="fb__stage">
      <div class="fb__book" data-fb-book>
        <div class="fb__base fb__base--left"><div class="fb__endpaper"><span class="wordmark">Bloom</span></div></div>
        <div class="fb__base fb__base--right"></div>
        ${leaves.map(([a, b], i) => `
          <div class="fb__leaf" data-leaf="${i}" style="--i:${i}">
            <div class="fb__face fb__face--front">${face(a, "right")}<span class="fb__curl"></span></div>
            <div class="fb__face fb__face--back">${face(b, "left")}<span class="fb__curl"></span></div>
          </div>`).join("")}
      </div>
    </div>
    <div class="fb__bar">
      <button class="fb__btn" type="button" data-fb-prev aria-label="Previous page">${icon("chevronLeft", 20, "icon--dir")}</button>
      <span class="fb__count" aria-live="polite" data-fb-count></span>
      <button class="fb__btn" type="button" data-fb-next aria-label="Next page">${icon("chevronRight", 20, "icon--dir")}</button>
      <a class="fb__view" href="#/project/${project.id}" data-fb-go>View project ${arrow(16)}</a>
    </div>
    <button class="fb__close" type="button" data-fb-close aria-label="Close photo book">${icon("close", 22)}</button>`;
  document.body.appendChild(el);
  document.body.classList.add("has-flipbook");

  const book = el.querySelector("[data-fb-book]");
  const leafEls = [...el.querySelectorAll(".fb__leaf")];
  const count = el.querySelector("[data-fb-count]");
  let turned = 0;          /* number of leaves turned to the left */

  const layout = () => {
    leafEls.forEach((lf, i) => {
      const flipped = i < turned;
      lf.classList.toggle("is-flipped", flipped);
      if (!lf.classList.contains("is-turning")) lf.style.zIndex = flipped ? i + 1 : leafEls.length - i + 1;
    });
    el.classList.toggle("is-open", turned > 0);
    el.classList.toggle("is-end", turned === leafEls.length);
    /* Photos showing on the current spread */
    const left = turned > 0 ? leaves[turned - 1][1] : null, right = turned < leaves.length ? leaves[turned][0] : null;
    const shown = [left, right].filter((p) => p && p.kind === "photo").map((p) => p.i + 1);
    count.textContent = shown.length ? `Photos ${shown.join("–")} of ${total}` : turned === 0 ? "Cover" : "The end";
    el.querySelector("[data-fb-prev]").disabled = turned === 0;
    el.querySelector("[data-fb-next]").disabled = turned === leafEls.length;
  };
  const turn = (dir) => {
    const target = turned + dir;
    if (target < 0 || target > leafEls.length) return;
    const lf = leafEls[dir > 0 ? turned : turned - 1];
    lf.classList.add("is-turning");
    lf.style.zIndex = 200;
    turned = target;
    layout();
    setTimeout(() => { lf.classList.remove("is-turning"); layout(); }, reduce ? 0 : 950);
  };
  layout();

  /* Fly in from the card */
  if (!reduce && originEl) {
    const from = originEl.getBoundingClientRect();
    const right = el.querySelector(".fb__base--right").getBoundingClientRect();
    const s = from.width / right.width;
    book.animate([
      { transform: `translate(${from.left - right.left}px, ${from.top - right.top}px) scale(${s})`, transformOrigin: "left top" },
      { transform: "none", transformOrigin: "left top" },
    ], { duration: 750, easing: "cubic-bezier(.2,.8,.2,1)" });
  }
  requestAnimationFrame(() => el.classList.add("is-in"));
  setTimeout(() => turn(1), reduce ? 0 : 850);   /* open the cover for them */

  /* Input: page halves, buttons, keys, swipe */
  book.addEventListener("click", (e) => {
    if (e.target.closest("a") || swiped) return;
    const r = book.getBoundingClientRect();
    const onRight = e.clientX > r.left + r.width / 2;
    const rtl = document.documentElement.dir === "rtl";
    turn((onRight !== rtl) ? 1 : -1);
  });
  el.querySelector("[data-fb-prev]").addEventListener("click", () => turn(-1));
  el.querySelector("[data-fb-next]").addEventListener("click", () => turn(1));
  let sx = null, swiped = false;
  book.addEventListener("pointerdown", (e) => { sx = e.clientX; swiped = false; });
  book.addEventListener("pointerup", (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 50) { swiped = true; turn(e.clientX < sx ? 1 : -1); } sx = null; });

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("hashchange", close);
    el.classList.remove("is-in");
    el.classList.add("is-out");
    document.body.classList.remove("has-flipbook");
    setTimeout(() => el.remove(), reduce ? 0 : 450);
    originEl?.focus({ preventScroll: true });
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") turn(document.documentElement.dir === "rtl" ? -1 : 1);
    else if (e.key === "ArrowLeft") turn(document.documentElement.dir === "rtl" ? 1 : -1);
    else if (e.key === "Tab") {       /* keep focus inside the dialog */
      const f = [...el.querySelectorAll("button:not(:disabled), a[href]")];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener("keydown", onKey);
  el.querySelectorAll("[data-fb-close]").forEach((b) => b.addEventListener("click", close));
  el.querySelectorAll("[data-fb-go]").forEach((a) => a.addEventListener("click", () => close()));
  window.addEventListener("hashchange", close);
  el.querySelector("[data-fb-next]").focus({ preventScroll: true });
}
