/* Primary screen — The Bloom Experience (original: /universal) */

import { DIVISIONS, PROJECTS, EXPLORE, PORTAL, img, imgLite } from "bloom:/js/data.js";
import { eyebrow, icon, arrow, esc, pad, siri } from "bloom:/js/ui/dom.js";
import { t } from "bloom:/js/i18n.js";
import { openAuth } from "bloom:/js/ui/auth.js";
import { openFlipbook } from "bloom:/js/ui/flipbook.js";
import { testimonialsSection, ctaBand, wireSharedSections } from "bloom:/js/pages/shared-sections.js";

const serifLine = (words, serifWord) =>
  words.map((w) => (serifWord && w.includes(serifWord) ? w.replace(serifWord, `<span class="t-serif">${serifWord}</span>`) : w));

/* First-fold stats. Figures supplied by the business (not in the source site). */
const HERO_STATS = [
  { value: 1200, suffix: "+", key: "statProperties", icon: "building", color: "var(--div-properties)" },
  { value: 100, suffix: "+", key: "statHospitals", icon: "hospital", color: "var(--div-hospitality)" },
  { value: 50, suffix: "+", key: "statEducation", icon: "school", color: "var(--div-education)" },
  { value: 24, suffix: "/7", key: "statSupport", icon: "headset", color: "var(--color-accent)" },
];

function hero() {
  const arch = PROJECTS.find((p) => p.id === "bloom-gardens");
  return `
  <section class="hero" data-section="${t("experience")}">
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__pattern"></div>
      <div class="hero__halo"></div>
      <div class="hero__grain"></div>
    </div>

    <div class="container hero__grid">
      <div class="hero__copy" data-reveal>
        <p class="hero__kicker"><span class="hero__live" aria-hidden="true"></span>${t("theBloomExperience")}</p>
        <h1 class="t-display hero__title">
          <span class="line-mask" style="--i:0"><span>${t("heroA")}</span></span>
          <span class="line-mask hero__line2" style="--i:1"><span><span class="t-serif hero__place">${t("heroPlace")}<svg class="hero__swash" viewBox="0 0 220 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 50 6, 110 4, 150 10 S 200 18, 216 8" /></svg></span> ${t("heroB")}</span></span>
        </h1>
        <p class="t-body-lg hero__lede reveal" style="--i:2">${t("heroLede")}</p>
        <div class="cluster hero__ctas reveal" style="--i:3">
          <a class="btn btn--primary btn--lg" href="#divisions" data-explore data-magnetic>${t("getStarted")} ${icon("arrowDown", 18)}</a>
        </div>
      </div>

      <figure class="hero__arch reveal reveal--clip" style="--i:2">
        <span class="hero__arch-outline" aria-hidden="true"></span>
        <span class="hero__arch-frame"><img src="${img(arch.images[0], 1200)}" alt="${esc(arch.name)}, Abu Dhabi" fetchpriority="high" data-parallax-soft /></span>
        <a class="hero__arch-chip" href="#/project/${arch.id}">
          <span class="hero__arch-dot" aria-hidden="true"></span>
          <span><strong>${esc(arch.name)}</strong><span>${t("featured")}</span></span>
          ${icon("arrowUpRight", 16)}
        </a>
      </figure>
    </div>

    <div class="container">
      <dl class="stats reveal" style="--i:4">
        ${HERO_STATS.map((st, i) => `
          <div class="stat" style="--c: ${st.color}; --i:${i}">
            <span class="stat__icon" aria-hidden="true">${icon(st.icon, 22)}</span>
            <dt class="stat__label">${t(st.key)}</dt>
            <dd class="stat__value"><span class="sr-only">${st.value.toLocaleString("en-US")}${st.suffix}</span><span data-count="${st.value}" data-count-delay="${i * 140}" aria-hidden="true">${st.value.toLocaleString("en-US")}</span><span class="stat__suffix ${st.suffix === "+" ? "stat__suffix--sup" : ""}" aria-hidden="true">${st.suffix}</span></dd>
          </div>`).join("")}
      </dl>
    </div>
  </section>`;
}

/* Divisions orbit: a story column beside a morphing image blob, with the
   six divisions as nodes on a ring that turns to the chosen one. */
function divisions() {
  const n = DIVISIONS.length;
  const cta = (d) => (d.id === "properties" ? "View communities" : `Explore ${esc(d.short)}`);
  /* Story side: one slide per division, stacked; only the active one shows */
  const slides = DIVISIONS.map((d, i) => `
    <article class="dv-slide ${i === 0 ? "is-active" : ""}" data-dv-slide style="--c: var(--div-${d.id})" aria-hidden="${i !== 0}">
      <span class="dv-slide__tag">${icon(d.icon, 14)} ${esc(d.name)}</span>
      <h3 class="dv-slide__title">${serifLine(d.headline, d.serifWord).join(" ")}</h3>
      <p class="dv-slide__task">${esc(d.task)}</p>
      <p class="dv-slide__meta">${d.id === "properties" ? `${PROJECTS.length} communities` : `${d.offerings.length} ${d.layout === "gallery" ? "destinations" : "services"}`}</p>
      <a class="dv-slide__cta" href="${d.route}" ${i !== 0 ? 'tabindex="-1"' : ""}>${cta(d)} ${arrow(16)}</a>
    </article>`).join("");

  return `
  <section class="section on-dark divisions" id="divisions" data-section="${t("divisions")}">
    <div class="dv-bg" aria-hidden="true">
      <div class="dv-goo">${DIVISIONS.map((d, i) => `<i style="--c: var(--div-${d.id}); --i:${i}"></i>`).join("")}<i class="dv-goo__cursor" data-goo-cursor></i></div>
      <div class="dv-grid"></div>
    </div>
    <div class="container">
      <div class="section-head">
        <div class="reveal">${eyebrow(1, t("divisions"))}<h2 class="t-h2 section-head__title">${t("divisionsTitle")}</h2></div>
        <p class="t-body-lg section-head__aside reveal" style="--i:1">${t("divisionsAside")}</p>
      </div>

      <div class="dv-stage reveal" style="--i:2; --dc: var(--div-${DIVISIONS[0].id}); --n:${n}" data-dv-stage>
        <div class="dv-story">
          <div class="dv-count" aria-hidden="true"><span class="dv-count__cur" data-dv-cur>01</span><span class="dv-count__of">/ ${pad(n)}</span></div>
          <div class="dv-slides" aria-live="polite">${slides}</div>
          <div class="dv-controls">
            <button class="dv-arrow" type="button" data-dv-step="-1" aria-label="Previous division">${icon("chevronLeft", 20, "icon--dir")}</button>
            <span class="dv-progress" aria-hidden="true"><span></span></span>
            <button class="dv-arrow" type="button" data-dv-step="1" aria-label="Next division">${icon("chevronRight", 20, "icon--dir")}</button>
          </div>
        </div>

        <div class="dv-orbit" data-dv-orbit>
          <span class="dv-beam" aria-hidden="true"></span>
          <span class="dv-orbit__ring" aria-hidden="true"></span>
          <span class="dv-orbit__ring dv-orbit__ring--inner" aria-hidden="true"></span>
          <span class="dv-halo" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="dv-blob" data-dv-blob>
            ${DIVISIONS.map((d, i) => `<img class="dv-blob__img ${i === 0 ? "is-active" : ""}" data-dv-img src="${img(d.image, 1100)}" alt="" loading="${i < 2 ? "eager" : "lazy"}" />`).join("")}
            <span class="dv-blob__shade" aria-hidden="true"></span>
          </div>
          <div class="dv-nodes" role="group" aria-label="${t("divisions")}" data-dv-nodes>
            ${DIVISIONS.map((d, i) => `
              <button class="dv-node ${i === 0 ? "is-active" : ""}" type="button" data-dv-node="${i}" style="--i:${i}; --c: var(--div-${d.id})" aria-pressed="${i === 0}" aria-label="${esc(d.name)}">
                <span class="dv-node__dot"><img src="${img(d.image, 240)}" alt="" loading="lazy" /></span><span class="dv-node__badge">${icon(d.icon, 14)}</span><span class="dv-node__label">${esc(d.short)}</span>
              </button>`).join("")}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

/* Up to three example names per division for the quick-start tags:
   communities for Properties, offerings for everything else */
const qsTags = (d) => (d.id === "properties" ? PROJECTS.map((p) => p.name) : (d.offerings || []).map((o) => o.name)).slice(0, 3);

/* Task-based entry: "What brings you to Bloom?" — colour-coded by division */
function quickstart() {
  return `
  <section class="section section--tight quickstart-section" data-section="${t("quickStart")}">
    <div class="container">
      <div class="section-head">
        <div class="reveal">${eyebrow(2, t("quickStart"))}<h2 class="t-h2" id="qs-title">${t("whatBrings").replace(/(Bloom\?|بلوم؟)$/, '<span class="t-serif">$1</span>')}</h2></div>
        <p class="t-body-lg section-head__aside reveal" style="--i:1">${t("quickStartAside")}</p>
      </div>
      <div class="quickstart reveal" style="--i:2">
      <ul class="quickstart__grid" aria-labelledby="qs-title">
        ${DIVISIONS.map((d, i) => `
          <li><a class="qs" href="${d.route}" style="--c: var(--div-${d.id}); --i:${i}">
            <span class="qs__top">
              <span class="qs__icon"><i class="qs__halo" aria-hidden="true"></i>${icon(d.icon, 24)}</span>
              <span class="qs__go" aria-hidden="true">${icon("arrowUpRight", 18)}</span>
            </span>
            <span class="qs__text"><span class="qs__task">${esc(d.task)}</span>
              <span class="qs__meta">${esc(QS_SHORT[d.id] || d.short)} · ${d.id === "properties" ? `${PROJECTS.length} communities` : `${d.offerings.length} ${d.layout === "gallery" ? "destinations" : "services"}`}</span></span>
            <span class="qs__tags">${qsTags(d).map((n, k) => `<span class="qs__tag" style="--k:${k}">${esc(n)}</span>`).join("")}</span>
            <span class="qs__photo" aria-hidden="true"><img src="${imgLite(d.image, 360)}" alt="" loading="lazy" decoding="async" /></span>
            <span class="qs__dots" aria-hidden="true"></span>
          </a></li>`).join("")}
      </ul>
      <a class="qs-portal" href="#/portal">
        <span class="qs-portal__icon">${icon("key", 26)}</span>
        <span class="qs-portal__text"><span class="qs-portal__task">${t("manageProperty")}</span>
          <span class="qs-portal__meta">${t("portal")} · payments, progress, documents</span></span>
        <span class="qs-portal__cta">${t("portal")} ${arrow(16)}</span>
        <span class="qs-portal__rings" aria-hidden="true"><i></i><i></i><i></i></span>
      </a>
      <p class="quickstart__foot t-caption">${EXPLORE.length} properties &amp; assets across Abu Dhabi, Al Ain and Dubai · <a href="#/properties?tab=explore">${t("browseAll")}</a></p>
    </div>
    </div>
  </section>`;
}

function featured() {
  const items = PROJECTS.filter((p) => p.images.length);
  return `
  <section class="section featured" data-section="Communities">
    <div class="container">
      <div class="section-head section-head--rail">
        <div class="reveal">${eyebrow(3, t("featured"))}<h2 class="t-h2">${t("featuredTitle").replace("home", '<span class="t-serif">home</span>')}</h2></div>
        <div class="rail-controls reveal" style="--i:1">
          <span class="rail-controls__count t-meta"><span data-rail-cur>01</span> / ${pad(items.length)}</span>
          <button class="icon-btn icon-btn--outline" data-rail="-1" aria-label="Previous">${icon("chevronLeft", 18, "icon--dir")}</button>
          <button class="icon-btn icon-btn--outline" data-rail="1" aria-label="Next">${icon("chevronRight", 18, "icon--dir")}</button>
          <a class="btn btn--ghost" href="#/properties">${t("viewAllProjects")} ${arrow(16)}</a>
        </div>
      </div>
    </div>
    <div class="rail" data-rail-track tabindex="0" aria-label="${t("featured")}">
      ${items.map((p, i) => `
        <a class="rail-card reveal" style="--i:${Math.min(i, 4)}" href="#/project/${p.id}" data-book="${p.id}" aria-haspopup="dialog" aria-label="${esc(p.name)} — ${esc(p.collection)}. Open the ${p.images.length}-photo book">
          <span class="book">
            <span class="book__page" aria-hidden="true">
              <span class="book__page-body">
                <span class="t-meta">${pad(i + 1)} · ${esc(p.collection)}</span>
                <span class="book__title">${esc(p.name)}</span>
                <span class="book__facts"><span>${icon("image", 14)} ${p.images.length} photos</span>${p.documents ? `<span>${icon("file", 14)} Brochure</span>` : ""}${p.map ? `<span>${icon("pin", 14)} Map</span>` : ""}</span>
                <span class="book__thumbs">${p.images.slice(1, 4).map((src) => `<img src="${img(src, 240)}" alt="" loading="lazy" />`).join("")}</span>
                <span class="book__cta">${icon("image", 15)} Click to flip through</span>
              </span>
            </span>
            <span class="book__cover">
              <span class="book__front">
                <span class="rail-card__media"><img src="${img(p.images[0], 900)}" alt="" loading="lazy" /></span>
                <span class="book__hint" aria-hidden="true">${icon("return", 14)} Open</span>
              </span>
              <span class="book__inside" aria-hidden="true">
                <img src="${img(p.images[1] || p.images[0], 500)}" alt="" loading="lazy" />
                <span class="book__inside-label"><span class="wordmark">Bloom</span><span>${esc(p.collection)}</span></span>
              </span>
            </span>
          </span>
          <span class="rail-card__meta">
            <span class="t-meta">${pad(i + 1)} · ${esc(p.collection)}</span>
            <span class="rail-card__name">${esc(p.name)}</span>
          </span>
        </a>`).join("")}
    </div>
  </section>`;
}

function portalTeaser() {
  const [pay, build] = PORTAL.notifications;
  return `
  <section class="section on-dark portal-teaser" data-section="${t("portal")}">
    <div class="container portal-teaser__grid">
      <div class="portal-teaser__copy">
        <div class="reveal">${eyebrow(4, t("portalEyebrow"))}</div>
        <h2 class="t-h1 reveal" style="--i:1">${t("portalTitleA")} <span class="t-serif">${t("portalTitleB")}</span></h2>
        <p class="t-body-lg reveal" style="--i:2">${t("portalLede")}</p>
        <div class="cluster reveal" style="--i:3">
          <button class="btn btn--light btn--lg" data-signin data-magnetic>${t("signIn")} ${arrow()}</button>
          <button class="btn btn--ghost-light btn--lg portal-teaser__register" data-register-cta data-magnetic>${t("register")}</button>
        </div>
        <ol class="feature-list">
          ${PORTAL.features.map((f, i) => `
            <li class="feature-list__item reveal" style="--i:${i + 4}">
              <span class="feature-list__icon">${icon(f.icon, 20)}</span>
              <span><span class="feature-list__title">${esc(f.title)}</span><span class="t-body">${esc(f.body)}</span></span>
            </li>`).join("")}
        </ol>
        <a class="link-arrow reveal" href="#/portal">How the portal works ${arrow(16)}</a>
      </div>

      <!-- Layered, animated composition: Ken Burns photo with a light sweep,
           a live badge, and two notifications that spring in, count up and
           respond to the pointer at different depths. -->
      <div class="portal-teaser__visual reveal reveal--clip" style="--i:2" aria-hidden="true" data-depth-scene>
        <div class="portal-teaser__frame" data-depth="10">
          <img class="portal-teaser__img" data-speed="-0.05" src="${imgLite(DIVISIONS[0].image, 720)}" srcset="${[480, 720, 960].map((w) => `${imgLite(DIVISIONS[0].image, w)} ${w}w`).join(", ")}" sizes="(min-width: 1024px) 460px, 90vw" width="720" height="900" alt="" decoding="async" />
        </div>
        <span class="live-badge" data-depth="22"><span class="live-badge__dot"></span>Live updates</span>
        <div class="notif notif--a" data-depth="34">
          <span class="notif__icon notif__icon--ok">${icon(pay.icon, 16)}</span>
          <span><strong>${pay.title}</strong><span>${esc(pay.body).replace("110,000", '<span data-count="110000" data-count-delay="900">110,000</span>')}</span></span>
        </div>
        <div class="notif notif--b" data-depth="26">
          <span class="notif__icon">${icon(build.icon, 16)}</span>
          <span><strong>${build.title}</strong><span>${esc(build.body).replace(`${build.progress}%`, `<span data-count="${build.progress}" data-count-delay="1300">${build.progress}</span>%`)}</span>
          <span class="progress"><span style="--p:${build.progress}%"></span></span></span>
        </div>
      </div>
    </div>
  </section>`;
}

function marquee() {
  const words = DIVISIONS.map((d) => d.short);
  const run = words.map((w) => `<span>${esc(w)}</span><span class="marquee__dot" aria-hidden="true">✦</span>`).join("");
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${run}${run}</div></div>`;
}

/* Short division labels on the quick-start cards (as in the mobile app) */
const QS_SHORT = { properties: "Properties", education: "Education", retail: "Retail", hospitality: "Hospitality", landscape: "Landscape", facilities: "Facilities" };

export function render(view) {
  view.innerHTML = hero() + divisions() + quickstart() + marquee() + featured() + portalTeaser() + testimonialsSection(5) + ctaBand();
  const disposeShared = wireSharedSections(view);

  /* Quick start cards: a soft spotlight follows the pointer */
  view.querySelectorAll(".qs").forEach((card) => card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  /* "Explore" scrolls to the divisions directly below */
  view.querySelector("[data-explore]").addEventListener("click", (e) => {
    e.preventDefault();
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("divisions").scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  });

  /* Divisions orbit: picking a division rotates the ring so its node lands
     beside the story (9 o'clock), swaps the blob image with a liquid reveal
     and slides the story over. The ring always turns the short way round. */
  const stage = view.querySelector("[data-dv-stage]");
  const nodes = [...view.querySelectorAll("[data-dv-node]")];
  const slides = [...view.querySelectorAll("[data-dv-slide]")];
  const imgs = [...view.querySelectorAll("[data-dv-img]")];
  const curEl = view.querySelector("[data-dv-cur]");
  const STEP = 360 / nodes.length;
  let current = 0, rot = 180;
  stage.style.setProperty("--rot", `${rot}deg`);
  const activate = (idx) => {
    idx = (idx + nodes.length) % nodes.length;
    if (idx === current) return;
    const target = 180 - idx * STEP;
    let delta = (target - rot) % 360;
    if (delta > 180) delta -= 360;
    if (delta <= -180) delta += 360;
    rot += delta;
    stage.style.setProperty("--rot", `${rot}deg`);
    stage.style.setProperty("--dc", getComputedStyle(nodes[idx]).getPropertyValue("--c"));
    stage.dataset.dir = delta < 0 ? "next" : "prev";
    nodes.forEach((b, i) => { b.classList.toggle("is-active", i === idx); b.setAttribute("aria-pressed", String(i === idx)); });
    slides.forEach((sl, i) => {
      sl.classList.toggle("is-active", i === idx);
      sl.classList.toggle("was-active", i === current);
      sl.setAttribute("aria-hidden", String(i !== idx));
      sl.querySelector("a").tabIndex = i === idx ? 0 : -1;
    });
    imgs.forEach((im, i) => { im.classList.toggle("is-active", i === idx); im.classList.toggle("was-active", i === current); });
    curEl.textContent = pad(idx + 1);
    curEl.classList.remove("is-swap"); void curEl.offsetWidth; curEl.classList.add("is-swap");
    current = idx;
  };
  nodes.forEach((b, i) => b.addEventListener("click", () => { activate(i); if (cycleOn) restartBar(); }));
  view.querySelectorAll("[data-dv-step]").forEach((b) => b.addEventListener("click", () => {
    const dir = Number(b.dataset.dvStep) * (document.documentElement.dir === "rtl" ? -1 : 1);
    activate(current + dir); if (cycleOn) restartBar();
  }));
  /* The image blob tilts toward the pointer; the photo drifts the other way */
  const orbitEl = view.querySelector("[data-dv-orbit]");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    orbitEl.addEventListener("pointermove", (e) => {
      const r = orbitEl.getBoundingClientRect();
      orbitEl.style.setProperty("--tx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      orbitEl.style.setProperty("--ty", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    orbitEl.addEventListener("pointerleave", () => { orbitEl.style.setProperty("--tx", 0); orbitEl.style.setProperty("--ty", 0); });
  }
  view.querySelector("[data-dv-nodes]").addEventListener("keydown", (e) => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!k) return;
    e.preventDefault(); activate(current + k); nodes[current].focus();
  });

  /* Background goo: a cursor blob that melts into the division blobs */
  const dv = view.querySelector(".divisions");
  const gooCursor = view.querySelector("[data-goo-cursor]");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let gx = 0, gy = 0, cx = 0, cy = 0, graf = 0;
    const gstep = () => {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      gooCursor.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      graf = Math.abs(gx - cx) + Math.abs(gy - cy) > 0.5 ? requestAnimationFrame(gstep) : 0;
    };
    dv.addEventListener("pointermove", (e) => {
      const r = dv.getBoundingClientRect();
      gx = e.clientX - r.left; gy = e.clientY - r.top;
      dv.classList.add("is-gooing");
      if (!graf) graf = requestAnimationFrame(gstep);
    });
    dv.addEventListener("pointerleave", () => dv.classList.remove("is-gooing"));
  }
  /* Auto-advance while on screen; hovering or focusing the stage pauses it.
     The progress line under the story fills over each interval. */
  const CYCLE = 6000;
  let cycleTimer = 0, cycleOn = false;
  const canCycle = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const restartBar = () => {
    stage.classList.remove("is-cycling"); void stage.offsetWidth;
    if (cycleOn) stage.classList.add("is-cycling");
    clearInterval(cycleTimer);
    if (cycleOn) cycleTimer = setInterval(() => { activate(current + 1); restartBar(); }, CYCLE);
  };
  const startCycle = () => { if (!canCycle()) return; cycleOn = true; restartBar(); };
  const stopCycle = () => { cycleOn = false; clearInterval(cycleTimer); stage.classList.remove("is-cycling"); };
  stage.addEventListener("pointerenter", stopCycle);
  stage.addEventListener("pointerleave", startCycle);
  stage.addEventListener("focusin", stopCycle);
  stage.addEventListener("focusout", (e) => { if (!stage.contains(e.relatedTarget)) startCycle(); });
  const cycleIO = new IntersectionObserver(([en]) => (en.isIntersecting ? startCycle() : stopCycle()), { threshold: 0.35 });
  cycleIO.observe(stage);

  /* Featured books: a click opens the photo flipbook (the card's href to
     the project stays as the no-JS fallback; the flipbook links there too) */
  view.querySelectorAll("[data-book]").forEach((card) => card.addEventListener("click", (e) => {
    const project = PROJECTS.find((x) => x.id === card.dataset.book);
    if (!project?.images.length) return;
    e.preventDefault();
    openFlipbook(project, card.querySelector(".book"));
  }));

  /* Featured rail controls + counter */
  const track = view.querySelector("[data-rail-track]");
  const cur = view.querySelector("[data-rail-cur]");
  const step = () => track.querySelector(".rail-card").getBoundingClientRect().width + 20;
  view.querySelectorAll("[data-rail]").forEach((b) =>
    b.addEventListener("click", () => {
      const dir = Number(b.dataset.rail) * (document.documentElement.dir === "rtl" ? -1 : 1);
      track.scrollBy({ left: dir * step(), behavior: "smooth" });
    })
  );
  track.addEventListener("scroll", () => {
    cur.textContent = pad(Math.min(track.children.length, Math.round(Math.abs(track.scrollLeft) / step()) + 1));
  }, { passive: true });

  /* Arch photo drifts slightly with scroll */
  const archImg = view.querySelector("[data-parallax-soft]");
  const onScroll = () => { archImg.style.transform = `scale(1.1) translateY(${Math.min(40, window.scrollY * 0.05)}px)`; };
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { addEventListener("scroll", onScroll, { passive: true }); onScroll(); }

  view.querySelector("[data-signin]").addEventListener("click", () => openAuth());
  view.querySelector("[data-register-cta]").addEventListener("click", () => openAuth("register"));

  /* Owner-portal visual: layers shift at different depths with the pointer */
  const scene = view.querySelector("[data-depth-scene]");
  if (scene && matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const layers = [...scene.querySelectorAll("[data-depth]")];
    scene.addEventListener("pointermove", (e) => {
      const r = scene.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => { const d = Number(l.dataset.depth); l.style.translate = `${(-dx * d).toFixed(1)}px ${(-dy * d).toFixed(1)}px`; });
    });
    scene.addEventListener("pointerleave", () => layers.forEach((l) => { l.style.translate = ""; }));
  }

  return { title: "The Bloom Experience", key: "universal", cleanup: () => { removeEventListener("scroll", onScroll); disposeShared(); stopCycle(); cycleIO.disconnect(); } };
}
