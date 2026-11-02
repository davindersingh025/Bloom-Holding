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

    const st0 = s0 ? pill(st.ST_LABEL[s0], st.ST_TONE[s0]) : "";

    /* Property — photo-led card */
    const residence = `
      <a class="db2-prop db-in" style="--d:1" href="#/app/property/${u.id}" aria-label="View property details for ${esc(u.name)}">
        <span class="db2-prop-media" aria-hidden="true">${icon(unitIcon(u), 40, "#922A22")}<img src="${st.unitImg(u, 960)}" alt="" loading="lazy" onerror="this.remove()"></span>
        <span class="db2-prop-top"><span class="db2-chip"><i class="db-live"></i>${esc(u.community.toUpperCase())}</span><span class="db2-code">${esc(u.code)}</span></span>
        <span class="db2-prop-b">
          <span class="db2-prop-t"><b>${esc(u.type)}</b><small>${icon("pin", 14, "#922A22")} ${esc(u.address)}</small></span>
          ${st0}<span class="db2-go">${icon("chev", 18)}</span>
        </span>
        ${us.length > 1 ? `<span class="db2-more">+ ${us.length - 1} more propert${us.length > 2 ? "ies" : "y"}</span>` : ""}
      </a>`;

    /* Action — renewal (tenant) or guest check-in (agent) */
    const cta = st.isTenant() ? `
      <button type="button" class="db2-act db-in" style="--d:2" data-renew aria-label="Tenancy contract expiring soon. Renew with Bloom GPT">
        <span class="db2-ring"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="rgba(146,42,34,.14)" stroke-width="3.5"/><circle class="db-ring-arc" cx="24" cy="24" r="21" fill="none" stroke="#922A22" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="132" stroke-dashoffset="106" transform="rotate(-90 24 24)"/></svg><b>12</b><small>Days</small></span>
        <span class="db2-act-t"><b>Tenancy contract expiring soon</b><small>Renew before 10 Oct 2026 to keep access active</small></span>
        <span class="db2-act-go">${icon("arrow", 18, "#fff")}</span>
      </button>` : st.isAgent() ? `
      <button type="button" class="db2-act db-in" style="--d:2" data-checkin aria-label="Guest check-in with Bloom GPT">
        <span class="db2-ring db2-ring--ic">${icon("key", 24, "#922A22")}</span>
        <span class="db2-act-t"><b>Guest check-in</b><small>${inn} in-house · ${on.length - inn} upcoming</small></span>
        <span class="db2-act-go">${icon("arrow", 18, "#fff")}</span>
      </button>` : "";

    /* Active request */
    const active = lead ? `
      <a class="db2-req db-in" style="--d:3" href="#/app/requests/${lead.id}" aria-label="${esc(lead.title)}, request ${lead.id}, ${esc(lead.status)}. View details">
        <span class="db2-req-h">${tile("wrench")}${pill(lead.status, st.REQ_STATUS[lead.status])}</span>
        <b class="db2-req-t">${esc(lead.title)}</b>
        <small class="db2-req-m">Ref #${lead.id} · ${esc(lead.category)}</small>
        <span class="db2-req-p"><span class="db-bar"><i style="--w:${lead.progress}%"></i></span><em>${lead.progress}%</em></span>
      </a>` : "";

    const scope = (href, ic, col, name, sub, d) => `
      <a class="db2-scope db-in" style="--d:${d};--c:${col}" href="${href}"><span class="db2-scope-i">${icon(ic, 22, "#fff")}</span><span class="db2-scope-t"><b>${name}</b><small>${esc(sub)}</small></span><span class="db2-scope-go">${icon("arrowUR", 16, col)}</span></a>`;

    c.innerHTML = `
      <div class="db2">
        <header class="db2-head db-in" style="--d:0">
          <p class="db2-hi">${greeting()}, ${esc(first)}</p>
          <h1 class="db-h1 db2-h1">Welcome back to, <span>Bloom <i>Holding</i></span></h1>
        </header>
        <div class="db2-grid${cta || active ? "" : " db2-grid--one"}">
          <div class="db2-main">${residence}</div>
          ${cta || active ? `<aside class="db2-side">${cta}${active}</aside>` : ""}
        </div>
        <section class="db2-help db-in" style="--d:4" aria-labelledby="db-help-h">
          <div class="db2-help-h"><h2 id="db-help-h" class="db-h2">How can we <i>help?</i></h2><p>Do you need help with your unit or the common areas?</p></div>
          <div class="db2-scopes">
            ${scope("#/app/requests/new?scope=unit", "home", "#922A22", "My unit", us.length > 1 ? `${us.length} properties` : u.name, 5)}
            ${scope("#/app/requests/new?scope=common", "community", "#2F6F73", "Common areas", u.community, 6)}
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
