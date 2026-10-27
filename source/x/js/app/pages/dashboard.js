/* Dashboard — kept as calm as the mobile home: welcome + property card,
   the one action that matters (tenancy renewal for tenants, guest check-in
   for agents), the active request, and "How can we help?". Everything else
   lives in the sidebar (Requests, Bookings, Bloom GPT) and the bell. */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, tile, unitIcon } from "bloom:/js/app/ui.js";

function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

export function page({ shell }) {
  const sh = shell({ active: "home" });
  const c = sh.content;
  const first = st.journey().user.name.split(" ")[0];

  function draw() {
    const us = st.units(), u = us[0], act = st.activeRequests(), lead = act.find((r) => r.id === "SR-9042") || act[0];
    const on = st.ongoing(), inn = on.filter((b) => b.status === "Checked in").length;
    const s0 = st.unitStatus(u);

    const residence = `
      <a class="db-res" href="#/app/property/${u.id}" aria-label="View property details for ${esc(u.name)}">
        <div class="db-res-h"><span class="db-live" aria-hidden="true"></span><span class="db-comm">${esc(u.community.toUpperCase())}</span><span class="db-code">${esc(u.code)}</span></div>
        <div class="db-res-b">
          <span class="db-res-img" aria-hidden="true">${icon(unitIcon(u), 30, "#922A22")}<img src="${st.unitImg(u)}" alt="" loading="lazy" onerror="this.remove()"></span>
          <span class="db-res-t"><b>${esc(u.type)}</b><small>${icon("pin", 14, "#922A22")} ${esc(u.address)}</small>${s0 ? pill(st.ST_LABEL[s0], st.ST_TONE[s0]) : ""}</span>
          <span class="db-go">${icon("chev", 18)}</span>
        </div>
        ${us.length > 1 ? `<span class="db-more">+ ${us.length - 1} more propert${us.length > 2 ? "ies" : "y"}</span>` : ""}
      </a>`;

    const cta = st.isTenant() ? `
      <button type="button" class="db-cta" data-renew aria-label="Tenancy contract expiring soon. Renew with Bloom GPT">
        <span class="db-ring"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="rgba(248,245,235,.25)" stroke-width="3"/><circle class="db-ring-arc" cx="24" cy="24" r="21" fill="none" stroke="#F8F5EB" stroke-width="3" stroke-linecap="round" stroke-dasharray="132" stroke-dashoffset="106" transform="rotate(-90 24 24)"/></svg><b>12</b><small>Days</small></span>
        <span class="db-cta-t"><b>Tenancy contract expiring soon</b><small>Renew before 10 Oct 2026 to keep access active</small></span>
        <span class="db-cta-go">${icon("arrow", 18, "#F8F5EB")}</span>
      </button>` : st.isAgent() ? `
      <button type="button" class="db-cta" data-checkin aria-label="Guest check-in with Bloom GPT">
        <span class="db-cta-ic">${icon("key", 24, "#F8F5EB")}</span>
        <span class="db-cta-t"><b>Guest check-in</b><small>${inn} in-house · ${on.length - inn} upcoming</small></span>
        <span class="db-cta-go">${icon("arrow", 18, "#F8F5EB")}</span>
      </button>` : "";

    const active = lead ? `
      <a class="db-req" href="#/app/requests/${lead.id}" aria-label="${esc(lead.title)}, request ${lead.id}, ${esc(lead.status)}. View details">
        <div class="db-req-h">${tile("wrench")}<span class="db-req-t"><b>${esc(lead.title)}</b><small>Ref #${lead.id} · ${esc(lead.category)}</small></span>${pill(lead.status, st.REQ_STATUS[lead.status])}</div>
        <span class="db-bar"><i style="--w:${lead.progress}%"></i></span>
      </a>` : "";

    c.innerHTML = `
      <div class="db">
        <section class="db-hero db-in" style="--d:0">
          <div class="db-hero-t">
            <p class="db-hi">${greeting()}, ${esc(first)}</p>
            <h1 class="db-h1">Welcome back to, <span>Bloom <i>Holding</i></span></h1>
          </div>
          ${residence}
        </section>
        ${cta || active ? `<div class="db-row ${cta && active ? "" : "db-row--one"}">${cta ? `<div class="db-in" style="--d:1">${cta}</div>` : ""}${active ? `<div class="db-in" style="--d:2">${active}</div>` : ""}</div>` : ""}
        <section class="db-help db-in" style="--d:3" aria-labelledby="db-help-h">
          <div class="db-sec-h"><h2 id="db-help-h" class="db-h2">How can we <i>help?</i></h2><p>Do you need help with your unit or the common areas?</p></div>
          <div class="db-scopes">
            <a class="db-scope" href="#/app/requests/new?scope=unit"><span class="ap-tile ap-tile--solid" style="background:#922A22">${icon("home", 20, "#fff")}</span><b>My unit</b><small style="color:#922A22">${esc(us.length > 1 ? `${us.length} properties` : u.name)}</small><span class="db-scope-go">${icon("arrowUR", 16, "#922A22")}</span></a>
            <a class="db-scope" href="#/app/requests/new?scope=common"><span class="ap-tile ap-tile--solid" style="background:#2F6F73">${icon("community", 20, "#fff")}</span><b>Common areas</b><small style="color:#2F6F73">${esc(u.community)}</small><span class="db-scope-go">${icon("arrowUR", 16, "#2F6F73")}</span></a>
          </div>
        </section>
      </div>`;
  }
  draw();

  c.addEventListener("click", (e) => {
    if (e.target.closest("[data-renew]")) { st.setIntent({ type: "renew", src: "dashboard", unit: st.units()[0].id }); location.hash = "/app/gpt"; }
    if (e.target.closest("[data-checkin]")) { st.setIntent({ type: "checkin" }); location.hash = "/app/gpt"; }
  });
  const off = st.on((w) => { if (w === "bookings" || w === "requests") draw(); });
  return { title: "Home", cleanup: () => { off(); sh.cleanup(); } };
}
