/* Project gallery: stage + thumbnails + keyboard + fullscreen lightbox. */

import { icon, esc, monogram, html } from "bloom:/js/ui/dom.js";
import { img } from "bloom:/js/data.js";
import { openOverlay } from "bloom:/js/ui/overlay.js";

export function galleryMarkup(project) {
  const { images, name } = project;
  if (!images.length) {
    return `<div class="gallery gallery--empty">
      <div class="media media--empty media--xl"><span class="media__mono">${monogram(name)}</span>
      <span class="t-meta">Imagery for ${esc(name)} hasn't been published yet</span></div></div>`;
  }
  return `
    <div class="gallery" data-gallery tabindex="0" aria-roledescription="carousel" aria-label="${esc(name)} gallery">
      <div class="gallery__stage">
        ${images.map((src, i) => `<img class="gallery__img ${i ? "" : "is-on"}" src="${img(src, 1800)}" alt="${esc(name)} — image ${i + 1} of ${images.length}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} />`).join("")}
        <button class="gallery__expand icon-btn icon-btn--glass" aria-label="View fullscreen">${icon("expand", 18)}</button>
        ${images.length > 1 ? `
        <div class="gallery__controls">
          <button class="icon-btn icon-btn--glass" data-step="-1" aria-label="Previous image">${icon("chevronLeft", 18, "icon--dir")}</button>
          <span class="gallery__count t-meta" aria-live="polite"><span data-cur>01</span> / ${String(images.length).padStart(2, "0")}</span>
          <button class="icon-btn icon-btn--glass" data-step="1" aria-label="Next image">${icon("chevronRight", 18, "icon--dir")}</button>
        </div>` : ""}
      </div>
      ${images.length > 1 ? `<div class="gallery__thumbs" role="tablist" aria-label="Choose image">
        ${images.map((src, i) => `<button role="tab" class="gallery__thumb" aria-selected="${i === 0}" aria-label="Image ${i + 1}" data-go="${i}"><img src="${img(src, 240)}" alt="" loading="lazy" /></button>`).join("")}
      </div>` : ""}
    </div>`;
}

export function wireGallery(root, project) {
  const g = root.querySelector("[data-gallery]");
  if (!g) return;
  const imgs = [...g.querySelectorAll(".gallery__img")];
  const thumbs = [...g.querySelectorAll(".gallery__thumb")];
  let cur = 0;
  const go = (i) => {
    cur = (i + imgs.length) % imgs.length;
    imgs.forEach((el, j) => el.classList.toggle("is-on", j === cur));
    thumbs.forEach((el, j) => el.setAttribute("aria-selected", String(j === cur)));
    thumbs[cur]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    const c = g.querySelector("[data-cur]"); if (c) c.textContent = String(cur + 1).padStart(2, "0");
  };
  g.addEventListener("click", (e) => {
    const s = e.target.closest("[data-step]"); if (s) go(cur + Number(s.dataset.step));
    const t = e.target.closest("[data-go]"); if (t) go(Number(t.dataset.go));
    if (e.target.closest(".gallery__expand")) lightbox(project, cur, go);
  });
  g.addEventListener("keydown", (e) => {
    const dir = document.documentElement.dir === "rtl" ? -1 : 1;
    if (e.key === "ArrowRight") go(cur + dir);
    if (e.key === "ArrowLeft") go(cur - dir);
  });
  /* swipe */
  let sx = null;
  g.querySelector(".gallery__stage").addEventListener("pointerdown", (e) => { sx = e.clientX; });
  g.querySelector(".gallery__stage").addEventListener("pointerup", (e) => {
    if (sx !== null && Math.abs(e.clientX - sx) > 40) go(cur + (e.clientX < sx ? 1 : -1));
    sx = null;
  });
}

function lightbox(project, start, sync) {
  let cur = start;
  const n = project.images.length;
  const content = html(`
    <figure class="lightbox">
      <img class="lightbox__img" alt="" />
      <figcaption class="lightbox__cap"><span class="t-meta">${esc(project.name)}</span><span class="t-meta" data-lb-count></span></figcaption>
      ${n > 1 ? `<button class="icon-btn icon-btn--glass lightbox__nav lightbox__nav--prev" data-lb="-1" aria-label="Previous image">${icon("chevronLeft", 22, "icon--dir")}</button>
      <button class="icon-btn icon-btn--glass lightbox__nav lightbox__nav--next" data-lb="1" aria-label="Next image">${icon("chevronRight", 22, "icon--dir")}</button>` : ""}
    </figure>`);
  const imgEl = content.querySelector("img");
  const show = () => {
    imgEl.classList.remove("is-in");
    imgEl.src = img(project.images[cur], 2400);
    imgEl.alt = `${project.name} — image ${cur + 1} of ${n}`;
    content.querySelector("[data-lb-count]").textContent = `${cur + 1} / ${n}`;
    imgEl.onload = () => imgEl.classList.add("is-in");
    sync(cur);
  };
  const onKey = (e) => {
    if (e.key === "ArrowRight") { cur = (cur + 1) % n; show(); }
    if (e.key === "ArrowLeft") { cur = (cur - 1 + n) % n; show(); }
  };
  document.addEventListener("keydown", onKey);
  openOverlay({
    kind: "modal", label: `${project.name} images`, content, className: "overlay--lightbox",
    onClose: () => document.removeEventListener("keydown", onKey),
  });
  content.addEventListener("click", (e) => { const b = e.target.closest("[data-lb]"); if (b) { cur = (cur + Number(b.dataset.lb) + n) % n; show(); } });
  show();
}
