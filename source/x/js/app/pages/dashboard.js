/* Dashboard — per journey, same building blocks as the mobile home:
   residence card · tenancy renewal card (tenant) · guest check-in card (agent)
   · active request · "How can we help?" (My unit / Common areas). */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, tile, unitIcon, btn } from "bloom:/js/app/ui.js";

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
      </a>`;

    const others = us.length > 1 ? `
      <div class="db-units"><span>Your properties</span>${us.map((x) => { const s = st.unitStatus(x); return `<a href="#/app/property/${x.id}" class="db-unit">${icon(unitIcon(x), 15, "#F8F5EB")}${esc(x.name)}${s ? `<i class="db-udot" data-tone="${st.ST_TONE[s]}" title="${esc(st.ST_LABEL[s])}"></i>` : ""}</a>`; }).join("")}</div>` : "";

    const renew = st.isTenant() ? `
      <button type="button" class="db-cta" data-renew aria-label="Tenancy contract expiring soon. Renew with Bloom GPT">
        <span class="db-ring"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="rgba(248,245,235,.25)" stroke-width="3"/><circle cx="24" cy="24" r="21" fill="none" stroke="#F8F5EB" stroke-width="3" stroke-linecap="round" stroke-dasharray="132" stroke-dashoffset="106" transform="rotate(-90 24 24)"/></svg><b>12</b><small>Days</small></span>
        <span class="db-cta-t"><b>Tenancy contract expiring soon</b><small>Renew before 10 Oct 2026 to keep access active</small></span>
        <span class="db-cta-go">${icon("arrow", 18, "#F8F5EB")}</span>
      </button>` : "";

    const checkin = st.isAgent() ? `
      <button type="button" class="db-cta" data-checkin aria-label="Guest check-in with Bloom GPT">
        <span class="db-cta-ic">${icon("key", 24, "#F8F5EB")}</span>
        <span class="db-cta-t"><b>Guest check-in</b><small>Register guests and inform security in a few steps</small><span class="db-cta-stats"><span>${inn} in-house</span><span>${on.length - inn} upcoming</span></span></span>
        <span class="db-cta-go">${icon("arrow", 18, "#F8F5EB")}</span>
      </button>` : "";

    const active = lead ? `
      <a class="db-req" href="#/app/requests/${lead.id}" aria-label="${esc(lead.title)}, request ${lead.id}, ${esc(lead.status)}. View details">
        <div class="db-req-h">${tile("wrench")}<span class="db-req-t"><b>${esc(lead.title)}</b><small>Ref #${lead.id} · ${esc(lead.category)}</small></span>${pill(lead.status, st.REQ_STATUS[lead.status])}</div>
        <span class="db-bar"><i style="width:${lead.progress}%"></i></span>
      </a>` : "";

    const help = `
      <section class="db-help" aria-labelledby="db-help-h">
        <div class="db-sec-h"><h2 id="db-help-h" class="db-h2">How can we <i>help?</i></h2><p>Do you need help with your unit or the common areas?</p></div>
        <div class="db-scopes">
          <a class="db-scope" href="#/app/requests/new?scope=unit"><span class="ap-tile ap-tile--solid" style="background:#922A22">${icon("home", 20, "#fff")}</span><b>My unit</b><small style="color:#922A22">${esc(us.length > 1 ? `${us.length} properties` : u.name)}</small><span class="db-scope-go">${icon("arrowUR", 16, "#922A22")}</span></a>
          <a class="db-scope" href="#/app/requests/new?scope=common"><span class="ap-tile ap-tile--solid" style="background:#2F6F73">${icon("community", 20, "#fff")}</span><b>Common areas</b><small style="color:#2F6F73">${esc(u.community)}</small><span class="db-scope-go">${icon("arrowUR", 16, "#2F6F73")}</span></a>
        </div>
      </section>`;

    const recent = `
      <section class="ap-card db-side" aria-labelledby="db-rq">
        <div class="ap-card-h"><h2 id="db-rq" class="ap-h3">Active requests</h2><a class="ap-link" href="#/app/requests">View all</a></div>
        ${act.length ? act.slice(0, 4).map((r) => `<a class="db-li" href="#/app/requests/${r.id}"><span class="db-li-t"><b>${esc(r.title)}</b><small>Ref #${r.id} · ${esc(r.category)}</small></span>${pill(r.status, st.REQ_STATUS[r.status])}</a>`).join("") : `<p class="ap-muted">No active requests.</p>`}
        ${btn("New request", { kind: "ghost", href: "#/app/requests/new" })}
      </section>`;

    const stays = st.isAgent() ? `
      <section class="ap-card db-side" aria-labelledby="db-bk">
        <div class="ap-card-h"><h2 id="db-bk" class="ap-h3">Ongoing bookings</h2><a class="ap-link" href="#/app/bookings">View all</a></div>
        ${on.length ? on.slice(0, 4).map((b) => `<a class="db-li" href="#/app/bookings/${b.id}"><span class="db-li-t"><b>${esc(b.guests[0].name)}${b.guests.length > 1 ? ` + ${b.guests.length - 1}` : ""}</b><small>${esc(st.unit(b.unit).name)} · ${st.fmtDM(b.checkIn)} – ${st.fmtDM(b.checkOut)}</small></span>${pill(b.status, st.BK_TONE[b.status])}</a>`).join("") : `<p class="ap-muted">No ongoing bookings.</p>`}
      </section>` : "";

    const notes = `
      <section class="ap-card db-side" aria-labelledby="db-nt">
        <div class="ap-card-h"><h2 id="db-nt" class="ap-h3">Latest updates</h2><a class="ap-link" href="#/app/notifications">View all</a></div>
        ${st.notifs().slice(0, 3).map((n) => `<a class="db-li" href="${n.go || "#/app/notifications"}" data-nt="${n.id}"><span class="ap-tile">${icon(n.ic, 18, "#922A22")}</span><span class="db-li-t"><b>${esc(n.title)}</b><small>${esc(n.g)} · ${esc(n.t)}</small></span></a>`).join("")}
      </section>`;

    c.innerHTML = `
      <section class="db-hero">
        <div class="db-hero-t">
          <p class="db-hi">${greeting()}, ${esc(first)}</p>
          <h1 class="db-h1">Welcome back to, <span>Bloom <i>Holding</i></span></h1>
          ${others}
        </div>
        ${residence}
      </section>
      <div class="db-grid">
        <div class="db-col">${renew}${checkin}${active}${help}</div>
        <div class="db-col db-col--side">${stays}${recent}${notes}</div>
      </div>`;
  }
  draw();

  c.addEventListener("click", (e) => {
    if (e.target.closest("[data-renew]")) { st.setIntent({ type: "renew", src: "dashboard", unit: st.units()[0].id }); location.hash = "/app/gpt"; }
    if (e.target.closest("[data-checkin]")) { st.setIntent({ type: "checkin" }); location.hash = "/app/gpt"; }
    const n = e.target.closest("[data-nt]"); if (n) st.markRead(+n.dataset.nt);
  });
  const off = st.on((w) => { if (w !== "notifs") draw(); });
  return { title: "Home", cleanup: () => { off(); sh.cleanup(); } };
}
