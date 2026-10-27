/* Card media carousel: native scroll-snap (swipe on touch),
   arrow buttons on hover, dot indicator synced to scroll. */

import { icon, monogram, esc } from "bloom:/js/ui/dom.js";
import { img } from "bloom:/js/data.js";

export function mediaCarousel({ images, name, sizes = 900 }) {
  if (!images.length) {
    return `<div class="media media--empty" role="img" aria-label="${esc(name)} — imagery coming soon">
      <span class="media__mono">${monogram(name)}</span><span class="t-meta">Imagery coming soon</span></div>`;
  }
  const slides = images.map((src, i) =>
    `<img class="media__slide" src="${img(src, sizes)}" alt="${esc(name)} — image ${i + 1} of ${images.length}" loading="${i ? "lazy" : "eager"}" decoding="async" />`).join("");
  const multi = images.length > 1;
  return `
    <div class="media" data-carousel data-tilt="4">
      <div class="media__track" tabindex="-1">${slides}</div>
      ${multi ? `
      <button class="media__nav media__nav--prev" data-dir="-1" aria-label="Previous image">${icon("chevronLeft", 18, "icon--dir")}</button>
      <button class="media__nav media__nav--next" data-dir="1" aria-label="Next image">${icon("chevronRight", 18, "icon--dir")}</button>
      <div class="media__dots" aria-hidden="true">${images.map((_, i) => `<span class="${i ? "" : "is-on"}"></span>`).join("")}</div>
      <span class="media__count t-meta"><span data-idx>1</span> / ${images.length}</span>` : ""}
    </div>`;
}

export function wireCarousels(root) {
  root.querySelectorAll("[data-carousel]").forEach((el) => {
    const track = el.querySelector(".media__track");
    const dots = [...el.querySelectorAll(".media__dots span")];
    const idxEl = el.querySelector("[data-idx]");
    const rtl = () => document.documentElement.dir === "rtl";
    const current = () => Math.round(Math.abs(track.scrollLeft) / track.clientWidth);

    el.querySelectorAll(".media__nav").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        const n = track.children.length;
        const next = (current() + Number(b.dataset.dir) + n) % n;
        track.scrollTo({ left: next * track.clientWidth * (rtl() ? -1 : 1), behavior: "smooth" });
      })
    );
    let raf;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = current();
        dots.forEach((d, j) => d.classList.toggle("is-on", i === j));
        if (idxEl) idxEl.textContent = i + 1;
      });
    }, { passive: true });
  });
}
