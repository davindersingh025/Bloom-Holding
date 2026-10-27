/* Project Details (original: /guest-details?id=…)
   Tabs: Project Details / Explore Properties. */

import { PROJECTS, projectById } from "bloom:/js/data.js";
import { eyebrow, icon, esc, arrow } from "bloom:/js/ui/dom.js";
import { t } from "bloom:/js/i18n.js";
import { galleryMarkup, wireGallery } from "bloom:/js/ui/gallery.js";
import { exploreMarkup, wireExplore } from "bloom:/js/ui/explore.js";
import { tabsMarkup, wireTabs } from "bloom:/js/ui/tabs.js";
import { openContact } from "bloom:/js/ui/contact.js";
import { toast } from "bloom:/js/ui/toast.js";
import { breadcrumb } from "bloom:/js/pages/space.js";
import { projectCard, mapHref } from "bloom:/js/pages/properties.js";
import { wireCarousels } from "bloom:/js/ui/carousel.js";

const AMENITY_ICONS = { Gym: "gym", "Swimming Pool": "pool", Restaurant: "restaurant", "Built-in Wardrobes": "wardrobe" };

function accordion(id, title, iconName, body, open = false) {
  return `
    <div class="acc ${open ? "is-open" : ""}">
      <h3 class="acc__h">
        <button class="acc__btn" aria-expanded="${open}" aria-controls="${id}" data-acc>
          <span class="acc__icon">${icon(iconName, 18)}</span><span class="acc__title">${title}</span>
          ${icon("chevronDown", 18, "acc__chev")}
        </button>
      </h3>
      <div class="acc__panel" id="${id}" role="region"><div class="acc__inner">${body}</div></div>
    </div>`;
}

function details(p) {
  const amenities = p.amenities?.length
    ? `<p class="t-meta">Amenities</p><ul class="amenities">${p.amenities.map((a) => `<li>${icon(AMENITY_ICONS[a] || "check", 22)}<span>${esc(a)}</span></li>`).join("")}</ul>`
    : `<p class="t-caption">${esc(p.name)}'s amenities haven't been published yet. Contact us for the full specification.</p>`;
  const docs = p.documents?.length
    ? `<ul class="docs">${p.documents.map((d) => `
        <li><button class="doc" data-doc="${esc(d.name)}">
          <span class="doc__icon">${icon("file", 18)}</span><span class="doc__name">${esc(d.name)}<span class="t-caption">${esc(d.size)}</span></span>
          <span class="doc__action">${icon("download", 18)}</span></button></li>`).join("")}</ul>`
    : `<p class="t-caption">No documents published for this project yet.</p>`;

  return `
    <div class="pd">
      <div class="pd__main">${galleryMarkup(p)}</div>
      <aside class="pd__side">
        ${accordion("acc-about", "About Property", "building", `${p.description ? `<p class="t-body">${esc(p.description)}</p>` : ""}${amenities}`, true)}
        ${accordion("acc-docs", "Documents", "file", docs, Boolean(p.documents))}
        ${accordion("acc-loc", "Location", "pin", `<a class="btn btn--ghost btn--block" href="${mapHref(p)}" target="_blank" rel="noopener">${icon("pin", 16)} Open in Google Maps ${icon("arrowUpRight", 16)}</a>`, false)}
        <div class="pd__cta">
          <p class="t-meta">Interested in ${esc(p.name)}?</p>
          <button class="btn btn--primary btn--lg btn--block" data-enquire data-magnetic>Enquire now ${arrow()}</button>
        </div>
      </aside>
    </div>`;
}

export function render(view, { id, query }) {
  const p = projectById(id);
  if (!p) {
    view.innerHTML = `<section class="container page-head"><div class="empty empty--page">
      <span class="empty__icon">${icon("search", 24)}</span><h1 class="t-h2">We couldn't find that project</h1>
      <p class="t-body">It may have been renamed or removed.</p><a class="btn btn--primary" href="#/properties">Browse all properties ${arrow()}</a></div></section>`;
    return { title: "Project not found", key: "properties" };
  }
  const tab = query.get("tab") === "explore" ? "explore" : "details";
  const more = PROJECTS.filter((x) => x.id !== p.id && x.images.length).slice(0, 3);

  view.innerHTML = `
    <section class="page-head container" data-section="${esc(p.name)}">
      ${breadcrumb([{ label: t("home"), href: "#/" }, { label: t("properties"), href: "#/properties" }, { label: p.name }])}
      <div class="page-head__grid" data-reveal>
        <div>
          ${eyebrow(null, p.category || p.collection)}
          <h1 class="t-h1"><span class="line-mask"><span>${esc(p.name)}</span></span></h1>
        </div>
        <div class="cluster page-head__actions reveal" style="--i:2">
          <button class="btn btn--ghost" data-share>${icon("arrowUpRight", 16)} Share</button>
          ${p.map ? `<a class="btn btn--ghost" href="${mapHref(p)}" target="_blank" rel="noopener">${icon("pin", 16)} Google Map</a>` : ""}
          <button class="btn btn--primary" data-enquire>Enquire ${arrow(16)}</button>
        </div>
      </div>
    </section>

    <section class="container" data-section="${t("projectDetails")}">
      ${tabsMarkup("pd", [{ id: "details", label: t("projectDetails") }, { id: "explore", label: t("exploreProperties") }], tab)}
      <div class="tabpanel" id="pd-panel-details" role="tabpanel" aria-labelledby="pd-tab-details" ${tab === "details" ? "" : "hidden"}>
        ${details(p)}
      </div>
      <div class="tabpanel" id="pd-panel-explore" role="tabpanel" aria-labelledby="pd-tab-explore" ${tab === "explore" ? "" : "hidden"}>
        ${exploreMarkup()}
      </div>
    </section>

    ${more.length ? `
    <section class="section section--tight" data-section="More communities">
      <div class="container">
        <div class="section-head section-head--rail"><div>${eyebrow(null, "More communities")}<h2 class="t-h2">Keep exploring</h2></div>
          <a class="btn btn--ghost" href="#/properties">${t("viewAllProjects")} ${arrow(16)}</a></div>
        <div class="pgrid pgrid--3">${more.map(projectCard).join("")}</div>
      </div>
    </section>` : ""}`;

  wireGallery(view, p);
  wireCarousels(view);
  wireTabs(view, "pd", (tb) => history.replaceState(null, "", `#/project/${p.id}${tb === "explore" ? "?tab=explore" : ""}`));
  const disposeExplore = wireExplore(view);

  view.querySelectorAll("[data-acc]").forEach((b) =>
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      b.closest(".acc").classList.toggle("is-open", open);
    })
  );

  view.querySelectorAll("[data-enquire]").forEach((b) => b.addEventListener("click", () => openContact({ topic: "Sales", context: p.name })));

  view.querySelector("[data-share]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast({ title: "Link copied", body: `Share ${p.name} with anyone.` });
    } catch {
      toast({ tone: "error", title: "Couldn't copy the link", body: "Copy it from the address bar instead." });
    }
  });

  view.querySelectorAll("[data-doc]").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.classList.contains("is-busy")) return;
      b.classList.add("is-busy");
      const tt = toast({ tone: "progress", title: `Preparing ${b.dataset.doc}`, body: p.name, duration: 0 });
      let pct = 0;
      const tick = setInterval(() => {
        pct = Math.min(100, pct + 12 + Math.random() * 18);
        tt.update(pct);
        if (pct >= 100) {
          clearInterval(tick);
          tt.dismiss();
          b.classList.remove("is-busy");
          toast({ title: `${b.dataset.doc} ready`, body: "In production this downloads the PDF from Bloom's document service." });
        }
      }, 160);
    })
  );

  return { title: p.name, key: "properties", cleanup: disposeExplore };
}
