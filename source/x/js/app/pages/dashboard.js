/* Dashboard — kept as calm as the mobile home: welcome + property card,
   the one action that matters (tenancy renewal for tenants, guest check-in
   for agents), the active request, and "How can we help?". Everything else
   lives in the sidebar (Requests, Bookings, Bloom GPT) and the bell. */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, tile, unitIcon } from "bloom:/js/app/ui.js";

function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

function tiltCard(el) {
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`); el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(0)}%`); el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(0)}%`);
  });
  el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
}

export function page({ shell }) {
  const sh = shell({ active: "home" });
  const c = sh.content;
  const first = st.journey().user.name.split(" ")[0];

  function draw() {
    const us = st.units(), u = us[0], act = st.activeRequests(), lead = act.find((r) => r.id === "SR-9042") || act[0];
    const on = st.ongoing(), inn = on.filter((b) => b.status === "Checked in").length;
    const s0 = st.unitStatus(u);

    const st0 = s0 ? pill(st.ST_LABEL[s0], st.ST_TONE[s0]) : "";

    const cta = st.isTenant() ? `
      <button type="button" class="d3-act" data-renew aria-label="Tenancy contract expiring soon. Renew with Bloom GPT">
        <span class="d3-ring"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="rgba(146,42,34,.14)" stroke-width="3.5"/><circle class="db-ring-arc" cx="24" cy="24" r="21" fill="none" stroke="#922A22" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="132" stroke-dashoffset="106" transform="rotate(-90 24 24)"/></svg><b>12</b><small>Days</small></span>
        <span class="d3-act-t"><b>Tenancy contract expiring soon</b><small>Renew before 10 Oct 2026 to keep access active</small></span>
        <span class="d3-act-go">${icon("arrow", 18, "#fff")}</span>
      </button>` : st.isAgent() ? `
      <button type="button" class="d3-act" data-checkin aria-label="Guest check-in with Bloom GPT">
        <span class="d3-ring d3-ring--ic">${icon("key", 24, "#922A22")}</span>
        <span class="d3-act-t"><b>Guest check-in</b><small>${inn} in-house · ${on.length - inn} upcoming</small></span>
        <span class="d3-act-go">${icon("arrow", 18, "#fff")}</span>
      </button>` : "";

    const prop = `
      <a class="d3-arch" href="#/app/property/${u.id}" aria-label="View property details for ${esc(u.name)}">
        <span class="d3-arch-frame"><span class="d3-arch-ph" aria-hidden="true">${icon(unitIcon(u), 44, "#922A22")}</span><img src="${st.unitImg(u, 960)}" alt="" loading="lazy" onerror="this.remove()"></span>
        <span class="d3-code">${esc(u.code)}</span>
        ${us.length > 1 ? `<span class="d3-more">+ ${us.length - 1} more propert${us.length > 2 ? "ies" : "y"}</span>` : ""}
        <span class="d3-chip">
          <i class="db-live" aria-hidden="true"></i>
          <span class="d3-chip-t"><em>${esc(u.community.toUpperCase())}</em><b>${esc(u.type)}</b><small>${icon("pin", 13, "#922A22")} ${esc(u.address)}</small></span>
          ${st0}<span class="d3-chip-go">${icon("arrowUR", 16)}</span>
        </span>
      </a>`;

    const active = lead ? `
      <a class="d3-req" href="#/app/requests/${lead.id}" aria-label="${esc(lead.title)}, request ${lead.id}, ${esc(lead.status)}. View details">
        ${tile("wrench")}
        <span class="d3-req-t"><b>${esc(lead.title)}</b><small>Ref #${lead.id} · ${esc(lead.category)}</small></span>
        <span class="d3-req-p"><span class="db-bar"><i style="--w:${lead.progress}%"></i></span><em>${lead.progress}%</em></span>
        ${pill(lead.status, st.REQ_STATUS[lead.status])}
        <span class="d3-req-go">${icon("chev", 18)}</span>
      </a>` : "";

    const scope = (href, ic, col, name, sub) => `
      <a class="d3-scope" style="--c:${col}" href="${href}">
        <span class="d3-scope-dots" aria-hidden="true"></span>
        <span class="d3-scope-top"><span class="d3-scope-i">${icon(ic, 22, "#fff")}</span><span class="d3-scope-go">${icon("arrowUR", 16, col)}</span></span>
        <span class="d3-scope-t"><b>${name}</b><small>${esc(sub)}</small></span>
      </a>`;

    c.innerHTML = `
      <div class="pf d5">
        <aside class="pf-side">
          <a class="pf-card d5-card" data-tilt href="#/app/property/${u.id}" aria-label="View property details for ${esc(u.name)}">
            <div class="pf-card-glow" aria-hidden="true"></div>
            <div class="pf-card-top"><span class="d5-comm"><i class="db-live" aria-hidden="true"></i>${esc(u.community.toUpperCase())}</span><span class="pf-card-role">${esc(u.code)}</span></div>
            <div class="pf-card-mid"><span class="d5-ic">${icon(unitIcon(u), 28, "#922A22")}</span><span><b class="pf-card-name">${esc(u.type)}</b></span></div>
            <div class="pf-card-bot"><span><small>${us.length > 1 ? `+ ${us.length - 1} MORE PROPERT${us.length > 2 ? "IES" : "Y"}` : "MY PROPERTY"}</small><b class="d5-addr">${esc(u.address)}</b></span>${s0 ? `<span class="pf-card-ver d5-st">${esc(st.ST_LABEL[s0])}</span>` : ""}<span class="d5-go">${icon("arrowUR", 16, "#1A1A1A")}</span></div>
          </a>
          ${cta ? `<div class="d5-act">${cta}</div>` : ""}
        </aside>
        <div class="pf-main d5-main">
          <div class="pf-head"><p class="ap-muted d5-hi">${greeting()}, ${esc(first)}</p><h1 class="ap-h1 d5-h1">Welcome back to, Bloom <i>Holding</i></h1></div>
          ${lead ? `
          <section class="ap-card pf-panel">
            <div class="ap-card-h"><p class="ap-eyebrow">ACTIVE REQUEST</p></div>
            <a class="d5-req" href="#/app/requests/${lead.id}" aria-label="${esc(lead.title)}, request ${lead.id}, ${esc(lead.status)}. View details">
              ${tile("wrench")}
              <span class="d5-req-t"><b>${esc(lead.title)}</b><small>Ref #${lead.id} · ${esc(lead.category)}</small></span>
              ${pill(lead.status, st.REQ_STATUS[lead.status])}
              ${icon("chev", 16, "#8A847A")}
            </a>
            <div class="d5-prog"><span class="db-bar"><i style="--w:${lead.progress}%"></i></span><em>${lead.progress}%</em></div>
          </section>` : ""}
          <section class="ap-card pf-panel" aria-labelledby="db-help-h">
            <div class="ap-card-h d5-help-h"><h2 id="db-help-h" class="db-h2 d5-h2">How can we <i>help?</i></h2></div>
            <p class="ap-muted d5-help-p">Do you need help with your unit or the common areas?</p>
            <div class="d5-scopes">
              <a class="d5-scope" style="--c:#922A22" href="#/app/requests/new?scope=unit"><span class="d5-scope-i">${icon("home", 22, "#fff")}</span><span class="d5-scope-t"><b>My unit</b><small>${esc(us.length > 1 ? `${us.length} properties` : u.name)}</small></span>${icon("arrowUR", 16, "#922A22")}</a>
              <a class="d5-scope" style="--c:#2F6F73" href="#/app/requests/new?scope=common"><span class="d5-scope-i">${icon("community", 22, "#fff")}</span><span class="d5-scope-t"><b>Common areas</b><small>${esc(u.community)}</small></span>${icon("arrowUR", 16, "#2F6F73")}</a>
            </div>
          </section>
        </div>
      </div>`;
    tiltCard(c.querySelector("[data-tilt]"));
  }
  draw();

  c.addEventListener("click", (e) => {
    if (e.target.closest("[data-renew]")) { st.setIntent({ type: "renew", src: "dashboard", unit: st.units()[0].id }); location.hash = "/app/gpt"; }
    if (e.target.closest("[data-checkin]")) { st.setIntent({ type: "checkin" }); location.hash = "/app/gpt"; }
  });
  const off = st.on((w) => { if (w === "bookings" || w === "requests") draw(); });
  return { title: "Home", cleanup: () => { off(); sh.cleanup(); } };
}
