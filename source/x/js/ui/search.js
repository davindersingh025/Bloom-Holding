/* ⌘K command palette over all existing Bloom content. */

import { openOverlay } from "bloom:/js/ui/overlay.js";
import { html, icon, esc, monogram } from "bloom:/js/ui/dom.js";
import { DIVISIONS, EXPLORE, img } from "bloom:/js/data.js";
import { t } from "bloom:/js/i18n.js";
import { openAuth } from "bloom:/js/ui/auth.js";
import { openContact } from "bloom:/js/ui/contact.js";

function buildIndex() {
  const items = [];
  DIVISIONS.forEach((d) => {
    items.push({ group: "Divisions", label: d.name, sub: d.headline.join(" "), href: d.route, thumb: img(d.image, 120) });
    (d.offerings || []).forEach((o) =>
      items.push({ group: "Services & destinations", label: o.name, sub: d.name, href: `${d.route}?offering=${encodeURIComponent(o.name)}`, thumb: o.image ? img(o.image, 120) : null })
    );
  });
  EXPLORE.forEach((p) =>
    items.push({ group: "Projects & properties", label: p.name, sub: p.category, href: `#/project/${p.id}`, thumb: p.images[0] ? img(p.images[0], 120) : null })
  );
  items.push(
    { group: "Actions", label: "Login", sub: "Your properties & requests", action: () => openAuth(), iconName: "id" },
    { group: "Actions", label: "Contact sales", sub: "800 Bloom (25666)", action: () => openContact(), iconName: "phone" },
  );
  return items;
}

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, "");

function rank(items, q) {
  if (!q) return items.filter((i) => i.group === "Divisions" || i.group === "Actions");
  const nq = norm(q);
  return items
    .map((i) => {
      const l = norm(i.label), s = norm(i.sub || "");
      const score = l.startsWith(nq) ? 3 : l.split(" ").some((w) => w.startsWith(nq)) ? 2 : l.includes(nq) ? 1.5 : s.includes(nq) ? 1 : 0;
      return { ...i, score };
    })
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);
}

const highlight = (label, q) => {
  if (!q) return esc(label);
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  return i < 0 ? esc(label) : `${esc(label.slice(0, i))}<mark>${esc(label.slice(i, i + q.length))}</mark>${esc(label.slice(i + q.length))}`;
};

let open = null;

export function openSearch(initial = "") {
  if (open) return open;
  const index = buildIndex();
  const content = html(`
    <div class="cmdk">
      <div class="cmdk__bar">
        ${icon("search", 20)}
        <input class="cmdk__input" type="search" placeholder="${t("searchPlaceholder")}" aria-label="${t("search")}"
               role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" autofocus />
        <kbd class="kbd">Esc</kbd>
      </div>
      <div class="cmdk__list" id="cmdk-list" role="listbox" aria-label="Results"></div>
      <div class="cmdk__foot t-caption"><span><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> to move</span><span><kbd class="kbd">↵</kbd> to open</span></div>
    </div>`);

  const overlay = openOverlay({ kind: "modal", label: t("search"), content, className: "overlay--cmdk", closeButton: false, onClose: () => { open = null; } });
  open = overlay;
  const input = content.querySelector("input");
  const list = content.querySelector(".cmdk__list");
  let results = [], active = 0;

  const render = () => {
    const q = input.value.trim();
    results = rank(index, q);
    active = 0;
    if (!results.length) {
      list.innerHTML = `<div class="empty empty--compact"><p class="t-h3">No matches for “${esc(q)}”</p><p class="t-caption">Try a project name like “Soho Square”, or a division like “Education”.</p></div>`;
      return;
    }
    let lastGroup = "";
    list.innerHTML = results.map((r, i) => {
      const head = r.group !== lastGroup ? `<p class="cmdk__group t-meta">${r.group}</p>` : "";
      lastGroup = r.group;
      const thumb = r.thumb ? `<img src="${r.thumb}" alt="" loading="lazy" />` : r.iconName ? icon(r.iconName, 18) : `<span>${monogram(r.label)}</span>`;
      return `${head}<div class="cmdk__item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="${i === 0}" style="--i:${Math.min(i, 12)}">
        <span class="cmdk__thumb">${thumb}</span>
        <span class="cmdk__label"><span>${highlight(r.label, q)}</span><span class="t-caption">${esc(r.sub || "")}</span></span>
        ${icon("return", 16, "cmdk__enter")}
      </div>`;
    }).join("");
    input.setAttribute("aria-activedescendant", "cmdk-0");
  };

  const setActive = (i) => {
    active = (i + results.length) % results.length;
    list.querySelectorAll(".cmdk__item").forEach((el) => el.setAttribute("aria-selected", String(Number(el.dataset.i) === active)));
    const el = list.querySelector(`[data-i="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", `cmdk-${active}`);
  };

  const choose = (i) => {
    const r = results[i];
    if (!r) return;
    overlay.close();
    if (r.action) setTimeout(r.action, 60);
    else location.hash = r.href.slice(1);
  };

  input.value = initial;
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    if (e.key === "Enter") { e.preventDefault(); choose(active); }
  });
  list.addEventListener("pointermove", (e) => { const it = e.target.closest(".cmdk__item"); if (it && Number(it.dataset.i) !== active) setActive(Number(it.dataset.i)); });
  list.addEventListener("click", (e) => { const it = e.target.closest(".cmdk__item"); if (it) choose(Number(it.dataset.i)); });
  render();
  return overlay;
}
