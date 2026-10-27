/* Sections reused on more than one page, placed directly above the footer:
   animated Testimonials and the "Ready to revolutionize…" contact-sales band.
   Content is verbatim from Bloom's original portal page (/welcome). */

import { PORTAL } from "bloom:/js/data.js";
import { eyebrow, icon, arrow, esc, pad } from "bloom:/js/ui/dom.js";
import { t } from "bloom:/js/i18n.js";
import { openContact } from "bloom:/js/ui/contact.js";
import { reducedMotion } from "bloom:/js/ui/motion.js";

export const stars = (r) =>
  `<span class="stars" role="img" aria-label="${r} out of 5">${[1, 2, 3, 4, 5].map((i) =>
    `<span class="stars__s ${r >= i ? "is-full" : ""}">${icon("star", 18)}${r < i && r >= i - 0.5 ? `<span class="stars__fill">${icon("star", 18)}</span>` : ""}</span>`).join("")}</span>`;

/* Unsplash CDN crops: large for the card, small square for the avatar */
const photoUrl = (q, w, h) => `${q.photo}?w=${w}&h=${h}&fit=crop&crop=${q.focus || "faces"}&q=80&auto=format`;
const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
const CARD_COLORS = ["var(--div-properties)", "var(--div-hospitality)", "var(--div-education)"];
const DURATION = 6500;

/* Animated spotlight: a stacked deck of monogram cards (active springs to the
   front, the rest fan out behind) + the quote revealed word by word. */
export function testimonialsSection(num) {
  const T = PORTAL.testimonials;
  return `
  <section class="section testimonials" data-section="Testimonials">
    <div class="container">
      <div class="section-head">
        <div class="reveal">${eyebrow(num, "Testimonials")}<h2 class="t-h2">Trusted by thousands of property <span class="t-serif">investors</span></h2></div>
        <p class="t-body-lg section-head__aside reveal" style="--i:1">See what our customers have to say about their experience with Bloom.</p>
      </div>

      <div class="tst reveal" style="--i:2; --dur:${DURATION}ms" data-tst aria-roledescription="carousel" aria-label="Customer testimonials">
        <div class="tst__deck" aria-hidden="true">
          ${T.map((q, i) => `
            <div class="tst__card" data-card style="--c:${CARD_COLORS[i % CARD_COLORS.length]}">
              <span class="tst__pattern"></span>
              <span class="tst__mark">“</span>
              <img class="tst__photo" src="${photoUrl(q, 720, 900)}" srcset="${photoUrl(q, 480, 600)} 480w, ${photoUrl(q, 720, 900)} 720w, ${photoUrl(q, 1080, 1350)} 1080w" sizes="(min-width: 900px) 340px, 62vw" alt="" loading="lazy" decoding="async" onerror="this.closest('.tst__card').classList.add('is-missing')" />
              <span class="tst__shade"></span>
              <span class="tst__mono">${initials(q.name)}</span>
              <span class="tst__card-foot"><strong>${esc(q.name)}</strong><span>${esc(q.role)}</span></span>
            </div>`).join("")}
        </div>

        <div class="tst__body">
          <div class="tst__stars" data-stars></div>
          <blockquote class="tst__quote" data-quote aria-live="off"></blockquote>
          <p class="tst__who" data-who></p>
          <div class="tst__controls">
            <button class="icon-btn icon-btn--outline tst__nav" data-step="-1" aria-label="Previous testimonial">${icon("chevronLeft", 18, "icon--dir")}</button>
            <button class="icon-btn icon-btn--outline tst__nav" data-step="1" aria-label="Next testimonial">${icon("chevronRight", 18, "icon--dir")}</button>
            <div class="tst__bars" role="group" aria-label="Choose testimonial">
              ${T.map((q, i) => `<button class="tst__bar" data-go="${i}" aria-label="Testimonial ${i + 1}: ${esc(q.name)}"><span></span></button>`).join("")}
            </div>
            <span class="tst__count t-meta"><span data-cur>01</span> / ${pad(T.length)}</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

export function ctaBand() {
  return `
  <section class="section cta-band" data-section="${t("contactSales")}">
    <div class="cta-band__pattern" aria-hidden="true"></div>
    <div class="container cta-band__inner">
      <h2 class="t-h1 reveal">Ready to revolutionize your real estate <span class="t-serif">experience?</span></h2>
      <div class="cta-band__side reveal" style="--i:1">
        <p class="t-body-lg">Join thousands of property investors who trust Bloom to manage their real estate portfolio.</p>
        <button class="btn btn--primary btn--lg" data-sales data-magnetic>${t("contactSales")} ${arrow()}</button>
      </div>
    </div>
  </section>`;
}

function wireTestimonials(root) {
  const el = root.querySelector("[data-tst]");
  if (!el) return () => {};
  const T = PORTAL.testimonials;
  const cards = [...el.querySelectorAll("[data-card]")];
  const bars = [...el.querySelectorAll("[data-go]")];
  const quoteEl = el.querySelector("[data-quote]");
  const whoEl = el.querySelector("[data-who]");
  const starsEl = el.querySelector("[data-stars]");
  const curEl = el.querySelector("[data-cur]");
  const autoplay = !reducedMotion();
  let active = 0, timer = 0, paused = false, remaining = DURATION, startedAt = 0;

  const show = (i, { user = false } = {}) => {
    active = (i + T.length) % T.length;
    const q = T[active];

    /* Deck: position every card relative to the active one */
    cards.forEach((c, j) => {
      const pos = (j - active + T.length) % T.length;
      c.dataset.pos = pos;
      if (pos === 0) { c.classList.remove("is-lifting"); void c.offsetWidth; c.classList.add("is-lifting"); }
    });

    /* Quote words blur in one by one */
    quoteEl.setAttribute("aria-live", user ? "polite" : "off");
    quoteEl.innerHTML = q.quote.split(/\s+/).map((w, k) => `<span class="tst__word" style="--wi:${k}">${esc(w)}</span>`).join(" ");
    whoEl.innerHTML = `<img class="tst__avatar" src="${photoUrl(q, 160, 160)}" alt="" onerror="this.remove()" />
      <span><span class="tst__name">${esc(q.name)}</span><span class="tst__role">${esc(q.role)}</span></span>`;
    whoEl.classList.remove("is-in"); void whoEl.offsetWidth; whoEl.classList.add("is-in");
    starsEl.innerHTML = stars(q.rating);
    curEl.textContent = pad(active + 1);

    bars.forEach((b, j) => {
      b.classList.toggle("is-done", j < active);
      b.classList.remove("is-active"); void b.offsetWidth;
      b.classList.toggle("is-active", j === active);
      b.setAttribute("aria-current", j === active ? "true" : "false");
    });
    schedule();
  };

  /* Timer and progress bar pause/resume together from where they were */
  const schedule = () => {
    clearTimeout(timer);
    remaining = DURATION;
    if (!autoplay || paused) return;
    startedAt = performance.now();
    timer = setTimeout(() => show(active + 1), remaining);
  };

  const pause = (on) => {
    if (on === paused) return;
    paused = on;
    el.classList.toggle("is-paused", on);
    if (!autoplay) return;
    if (on) {
      clearTimeout(timer);
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    } else {
      startedAt = performance.now();
      timer = setTimeout(() => show(active + 1), remaining);
    }
  };

  el.addEventListener("click", (e) => {
    const s = e.target.closest("[data-step]"); if (s) show(active + Number(s.dataset.step), { user: true });
    const g = e.target.closest("[data-go]"); if (g) show(Number(g.dataset.go), { user: true });
  });
  el.addEventListener("keydown", (e) => {
    const dir = document.documentElement.dir === "rtl" ? -1 : 1;
    if (e.key === "ArrowRight") { e.preventDefault(); show(active + dir, { user: true }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(active - dir, { user: true }); }
  });
  el.addEventListener("pointerenter", () => pause(true));
  el.addEventListener("pointerleave", () => pause(false));
  el.addEventListener("focusin", () => pause(true));
  el.addEventListener("focusout", (e) => { if (!el.contains(e.relatedTarget)) pause(false); });

  /* Render the first testimonial immediately (content is never empty), but
     only start rotating once the section is on screen. */
  paused = true; show(0); paused = false;
  el.classList.add("is-paused");
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { io.disconnect(); el.classList.remove("is-paused"); show(active); }
  }, { threshold: 0.3 });
  io.observe(el);

  return () => { clearTimeout(timer); io.disconnect(); };
}

export function wireSharedSections(view) {
  view.querySelector("[data-sales]")?.addEventListener("click", () => openContact({ topic: "Sales" }));
  return wireTestimonials(view);
}
