/* Division pages (original: /universal-space?id=…)
   Places get imagery (gallery layout); services get a numbered index. */

import { DIVISIONS, divisionById, CONTACT, img } from "bloom:/js/data.js";
import { eyebrow, icon, arrow, esc, pad, html } from "bloom:/js/ui/dom.js";
import { t } from "bloom:/js/i18n.js";
import { openOverlay } from "bloom:/js/ui/overlay.js";
import { openContact } from "bloom:/js/ui/contact.js";

const headline = (d) =>
  d.headline.map((line, i) => {
    const l = d.serifWord && line.includes(d.serifWord) ? line.replace(d.serifWord, `<span class="t-serif">${d.serifWord}</span>`) : line;
    return `<span class="line-mask" style="--i:${i}"><span>${l}</span></span>`;
  }).join(" ");

export const breadcrumb = (items) => `
  <nav class="breadcrumb" aria-label="Breadcrumb"><ol>
    ${items.map((it, i) => i < items.length - 1
      ? `<li><a href="${it.href}">${esc(it.label)}</a>${icon("chevronRight", 14, "icon--dir")}</li>`
      : `<li aria-current="page">${esc(it.label)}</li>`).join("")}
  </ol></nav>`;

function galleryOfferings(d) {
  return `<div class="bento bento--${d.offerings.length}">
    ${d.offerings.map((o, i) => `
      <button class="bento__item reveal" style="--i:${i}" data-offering="${esc(o.name)}" data-tilt="4">
        <img src="${img(o.image, i === 0 ? 1400 : 900)}" alt="" loading="lazy" />
        <span class="bento__shade" aria-hidden="true"></span>
        ${o.comingSoon ? '<span class="badge badge--light bento__badge">Opening soon</span>' : ""}
        <span class="bento__text">
          <span class="t-meta bento__num">${pad(i + 1)}</span>
          <span class="bento__name">${esc(o.name)}</span>
          ${o.sub ? `<span class="bento__sub">${esc(o.sub)}</span>` : ""}
        </span>
        <span class="bento__go" aria-hidden="true">${icon("arrowUpRight", 18)}</span>
      </button>`).join("")}
  </div>`;
}

function indexOfferings(d) {
  return `<ol class="svc-index">
    ${d.offerings.map((o, i) => `
      <li class="svc reveal" style="--i:${i}">
        <button class="svc__row" aria-expanded="false" aria-controls="svc-${i}" data-svc>
          <span class="svc__num t-meta">${pad(i + 1)}</span>
          <span class="svc__name">${esc(o.name)}</span>
          <span class="svc__plus" aria-hidden="true"></span>
        </button>
        <div class="svc__panel" id="svc-${i}" role="region" aria-label="${esc(o.name)}">
          <div class="svc__panel-inner">
            <p class="t-body">${esc(o.name)} is part of ${esc(d.name)}. Speak to the team for scope, availability and pricing.</p>
            <div class="cluster">
              <button class="btn btn--primary" data-enquire="${esc(o.name)}">Enquire ${arrow(16)}</button>
              <a class="btn btn--ghost" href="${CONTACT.corporateSite}" target="_blank" rel="noopener">${t("discoverMore")} ${icon("arrowUpRight", 16)}</a>
            </div>
          </div>
        </div>
      </li>`).join("")}
  </ol>`;
}

function openOffering(d, o) {
  const content = html(`
    <div class="drawer-content offering">
      ${o.image ? `<div class="offering__media"><img src="${img(o.image, 1100)}" alt="${esc(o.name)}" /></div>` : ""}
      ${eyebrow(null, d.name)}
      <h2 class="t-h2">${esc(o.name)}</h2>
      ${o.sub ? `<p class="t-body-lg">${esc(o.sub)}</p>` : ""}
      ${o.comingSoon ? `<p class="notice">${icon("info", 18)} New destinations are on the way. Contact us to hear first.</p>` : ""}
      <dl class="facts">
        <div><dt class="t-meta">Division</dt><dd>${esc(d.name)}</dd></div>
        <div><dt class="t-meta">Toll free</dt><dd><a href="${CONTACT.tollFreeHref}">${CONTACT.tollFree}</a></dd></div>
      </dl>
      <div class="cluster">
        <a class="btn btn--primary btn--lg" href="${CONTACT.corporateSite}" target="_blank" rel="noopener">${t("discoverMore")} ${icon("arrowUpRight", 16)}</a>
        <button class="btn btn--ghost btn--lg" data-enquire>Enquire</button>
      </div>
    </div>`);
  content.dataset.division = d.id;
  const o2 = openOverlay({ kind: "drawer", label: o.name, content });
  content.querySelector("[data-enquire]").addEventListener("click", () => { o2.close(); setTimeout(() => openContact({ topic: d.name, context: o.name }), 80); });
}

export function render(view, { id, query }) {
  const d = divisionById(id);
  if (!d || d.id === "properties") { location.hash = d ? "/properties" : "/"; return null; }
  const idx = DIVISIONS.indexOf(d);
  const others = DIVISIONS.filter((x) => x.id !== d.id);

  view.innerHTML = `
    <section class="space-hero" data-section="${esc(d.short)}"><div class="container">
      ${breadcrumb([{ label: t("home"), href: "#/" }, { label: d.name }])}
      <div class="space-hero__grid">
        <div class="space-hero__copy" data-reveal>
          ${eyebrow(null, `Division ${pad(idx + 1)} · ${d.name}`)}
          <h1 class="t-h1">${headline(d)}</h1>
          <p class="space-hero__task reveal" style="--i:2">${icon(d.icon, 18)} ${esc(d.task)}</p>
          <p class="t-body-lg reveal" style="--i:2">${esc(d.description)}</p>
          <div class="cluster reveal" style="--i:3">
            <a class="btn btn--primary btn--lg" href="${CONTACT.corporateSite}" target="_blank" rel="noopener" data-magnetic>${t("discoverMore")} ${icon("arrowUpRight", 18)}</a>
            <button class="btn btn--ghost btn--lg" data-contact>${icon("phone", 18)} ${t("contactUs")}</button>
          </div>
        </div>
        <figure class="space-hero__media reveal reveal--clip" style="--i:1">
          <img src="${img(d.image, 1800)}" alt="${esc(d.name)}" fetchpriority="high" data-parallax />
          <figcaption class="space-hero__cap t-meta">${pad(d.offerings.length)} ${d.layout === "gallery" ? "destinations" : "services"}</figcaption>
        </figure>
      </div>
    </div></section>

    <section class="section" data-section="${t("offerings")}">
      <div class="container">
        <div class="section-head">
          <div class="reveal">${eyebrow(1, t("offerings"))}<h2 class="t-h2">${d.layout === "gallery" ? "Explore our destinations" : "End-to-end services"}</h2></div>
          <p class="t-body section-head__aside reveal" style="--i:1">${d.layout === "gallery" ? "Select a destination for details and ways to get in touch." : "Open a service to enquire or learn more on bloomholding.com."}</p>
        </div>
        ${d.layout === "gallery" ? galleryOfferings(d) : indexOfferings(d)}
      </div>
    </section>

    <section class="section section--tight more" data-section="${t("otherDivisions")}">
      <div class="container">
        <div class="reveal">${eyebrow(2, t("otherDivisions"))}</div>
        <ul class="more__list">
          ${others.map((o, i) => `
            <li class="reveal" style="--i:${i}"><a class="more__item" href="${o.route}" style="--c: var(--div-${o.id})">
              <span class="more__img"><img src="${img(o.image, 500)}" alt="" loading="lazy" /></span>
              <span class="more__name">${esc(o.name)}<span class="more__task">${esc(o.task)}</span></span>${arrow(18)}
            </a></li>`).join("")}
        </ul>
      </div>
    </section>`;

  view.querySelector("[data-contact]").addEventListener("click", () => openContact({ topic: d.name }));

  view.querySelectorAll("[data-offering]").forEach((b) =>
    b.addEventListener("click", () => openOffering(d, d.offerings.find((o) => o.name === b.dataset.offering)))
  );

  view.querySelectorAll("[data-svc]").forEach((b) =>
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      view.querySelectorAll("[data-svc]").forEach((x) => x.setAttribute("aria-expanded", "false"));
      b.setAttribute("aria-expanded", String(open));
    })
  );
  view.querySelectorAll("[data-enquire]").forEach((b) =>
    b.addEventListener("click", () => openContact({ topic: d.name, context: b.dataset.enquire }))
  );

  /* Hero image drifts slightly with scroll */
  const par = view.querySelector("[data-parallax]");
  const onScroll = () => { par.style.transform = `scale(1.08) translateY(${Math.min(60, window.scrollY * 0.06)}px)`; };
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { addEventListener("scroll", onScroll, { passive: true }); onScroll(); }

  /* Deep link from search: ?offering=Name */
  const deep = query.get("offering");
  if (deep) {
    const o = d.offerings.find((x) => x.name === deep);
    if (o && d.layout === "gallery") setTimeout(() => openOffering(d, o), 450);
    if (o && d.layout === "index") {
      const b = [...view.querySelectorAll("[data-svc]")].find((x) => x.textContent.includes(deep));
      setTimeout(() => { b?.click(); b?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 350);
    }
  }

  return { title: d.name, key: d.id, cleanup: () => removeEventListener("scroll", onScroll) };
}
