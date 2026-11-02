/* Dashboard — kept as calm as the mobile home: welcome + property card,
   the one action that matters (tenancy renewal for tenants, guest check-in
   for agents), the active request, and "How can we help?". Everything else
   lives in the sidebar (Requests, Bookings, Bloom GPT) and the bell. */

import * as st from "bloom:/js/app/store.js";
import { toast } from "bloom:/js/app/shell.js";
import { icon, esc, pill, tile, unitIcon, orb } from "bloom:/js/app/ui.js";

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

    const plural = (n, w) => `${n} ${w}${n === 1 ? "" : (w.endsWith("y") ? "" : "s")}`;
    const sub = st.isTenant() ? "Lease Term: Year 2 of 3 · Dedicated 2 Bay Garage"
      : `${s0 ? st.ST_LABEL[s0] + " · " : ""}${us.length > 1 ? `${us.length} properties on this account` : "Dedicated 2 Bay Garage"}`;

    const propCard = `
      <a class="d6-prop" href="#/app/property/${u.id}" aria-label="View property details for ${esc(u.name)}">
        <span class="d6-prop-top"><span class="d6-comm"><i></i>${esc(u.community.toUpperCase())}</span><span class="d6-code">${esc(u.code)}</span></span>
        <span class="d6-prop-mid"><span class="d6-prop-ic">${icon(unitIcon(u), 26, "#F8F5EB")}</span><span><b>${esc(u.type)}</b><small>${esc(sub)}</small></span></span>
        <span class="d6-prop-bot"><span><small>${us.length > 1 ? `MY PROPERTIES · +${us.length - 1} MORE` : "MY PROPERTY"}</small><b>${esc(u.address)}</b></span><span class="d6-prop-go">${icon("arrowUR", 18, "#922A22")}</span></span>
      </a>`;

    const ring = (n, l) => `<span class="d6-ring"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="rgba(146,42,34,.12)" stroke-width="3"/><circle class="db-ring-arc" cx="24" cy="24" r="21" fill="none" stroke="#922A22" stroke-width="3" stroke-linecap="round" stroke-dasharray="132" stroke-dashoffset="106" transform="rotate(-90 24 24)"/></svg><b>${n}</b><small>${l}</small></span>`;
    const notice = st.isTenant() ? `
      <div class="d6-card d6-notice">
        <div class="d6-notice-h"><span class="d6-tag">NOTICE: RENEWAL WINDOW</span>${ring(12, "DAYS")}</div>
        <h3>Tenancy contract expiring soon</h3>
        <p>Renew before <b>10 Oct 2026</b> to secure your existing rate and keep uninterrupted smart gate access.</p>
        <div class="d6-notice-f"><span>Annual Rent: <b>AED 285,000</b></span><button type="button" class="d6-btn d6-btn--red" data-renew>Renew Tenancy</button></div>
      </div>` : st.isAgent() ? `
      <div class="d6-card d6-notice">
        <div class="d6-notice-h"><span class="d6-tag">NOTICE: GUEST ARRIVALS</span>${ring(on.length - inn, "UPCOMING")}</div>
        <h3>Guest check-in</h3>
        <p><b>${inn} in-house</b> · ${on.length - inn} upcoming. Check guests in with Bloom GPT and share their access passes.</p>
        <div class="d6-notice-f"><span>Ongoing stays: <b>${on.length}</b></span><button type="button" class="d6-btn d6-btn--red" data-checkin>Start Check-in</button></div>
      </div>` : "";

    const STEPS = ["Logged", "Dispatched", "On Site", "Completed"];
    const cur = lead ? (lead.progress >= 100 ? 3 : lead.progress >= 50 ? 2 : lead.progress >= 25 ? 1 : 0) : 0;
    const request = lead ? `
      <div class="d6-card d6-req">
        <div class="d6-req-h"><span><p class="d6-eye">ACTIVE REQUEST</p><a class="d6-req-title" href="#/app/requests/${lead.id}">${esc(lead.title)}</a></span>${pill(lead.status, st.REQ_STATUS[lead.status])}</div>
        <div class="d6-steps">${STEPS.map((x, i) => `<span class="${i < cur ? "is-done" : i === cur ? "is-cur" : ""}">${i + 1}. ${x}${i === cur && i < 3 ? ' <em>Now</em>' : ""}</span>`).join("")}</div>
        <span class="d6-track"><i style="width:${lead.progress}%"></i></span>
        <div class="d6-meta"><span>Ref #${lead.id} · ${esc(lead.category)} Category: HVAC</span><span>Estimated finish: 2:45 PM</span></div>
        <div class="d6-tech"><span class="ap-av">DM</span><span class="d6-tech-t"><b>David M.</b><small>Lead HVAC Specialist · Bloom FM Team</small></span><a class="d6-btn d6-btn--ghost" href="#/app/requests/${lead.id}">Reschedule</a><a class="d6-btn d6-btn--red" href="#/app/gpt">Live Chat</a></div>
      </div>` : "";

    const mu = st.moveInUnits()[0], mr = mu && st.movein(mu.id);
    const moveIn = mu ? `
      <div class="d6-card d6-mi">
        <div class="d6-mi-h"><span class="d6-mi-i">${icon("enter", 22, "#2E7D5B")}</span><span><p class="d6-eye">${mr ? "MOVE-IN REQUEST" : "UPCOMING MOVE-IN"}</p><b class="d6-mi-t">${esc(mu.name)} · ${esc(mu.community)}</b></span>${mr ? pill(st.MI_ST[mr.status].pill, st.MI_ST[mr.status].tone) : ""}</div>
        <p class="d6-mi-p">${mr ? `Ref #${esc(mr.id)} · moving in on <b>${esc(st.fmtS(mr.date))}</b>. ${esc(st.MI_ST[mr.status].note.t)}.` : st.isOwner() ? "Villa 22 is handed over and vacant. Book your move-in, service lift and access cards with Bloom GPT." : `Your new tenancy starts on <b>${esc(st.fmt(mu.contract.start))}</b>. Book your move-in, service lift and access cards with Bloom GPT.`}</p>
        <div class="d6-mi-f">${mr ? `<a class="d6-btn d6-btn--red" href="#/app/movein/${mu.id}">Track Move-in</a>` : `<button type="button" class="d6-btn d6-btn--red" data-movein>Start Move-in</button><a class="d6-btn d6-btn--ghost" href="#/app/property/${mu.id}">View Property</a>`}</div>
      </div>` : "";

    const help = [
      ["#/app/requests/new?scope=unit", "home", "#922A22", "My Unit", "Plumbing, Electrical, AC & Repairs"],
      ["#/app/requests/new?scope=common", "building", "#2F6F73", "Common Areas", "Parks, Streetlights & Walkways"],
      ["#/app/gpt", "amen", "#B7863F", "Amenities", "Tennis Court, BBQ Lawn & Clubhouse"],
      ["#/app/gpt", "qr", "#4B5563", "Visitor Access", "Instant QR codes for guests & delivery"],
    ];
    const notices = [
      ["#922A22", "FACILITIES", "OCT 5, 2026", "Annual Lap Pool Chlorination & Maintenance", "The Community Clubhouse pool will be closed from 07:00 to 18:00 for scheduled quarterly sanitization."],
      ["#2E7D5B", "GREEN LIVING", "WEEKLY", "Landscape & Green Waste Collection", "Garden clippings should be placed in designated recyclable bags before Tuesday morning 08:00."],
      ["#B3261E", "SECURITY", "IMPORTANT", "Gate 3 RFID Barrier Upgrade", "Automated license plate scanners activated at East Gate. Registered vehicles pass seamlessly."],
    ];

    c.innerHTML = `
      <div class="d6">
        <header class="d6-head db-in" style="--d:0">
          <div><p class="d6-hi">${greeting().toUpperCase()}, ${esc(first.toUpperCase())}</p><h1 class="d6-h1">Welcome back to, <b>Bloom</b> <i>Holding</i></h1></div>
          <span class="d6-status"><i></i><b>Community Status:</b> All amenities operational</span>
        </header>
        <div class="d6-row1 ${notice ? "" : "d6-row1--one"} db-in" style="--d:1">${propCard}${notice}</div>
        <div class="d6-grid">
          <div class="d6-col">
            ${moveIn ? `<div class="db-in" style="--d:2">${moveIn}</div>` : ""}
            ${request ? `<div class="db-in" style="--d:2">${request}</div>` : ""}
            <section class="d6-help db-in" style="--d:3" aria-labelledby="db-help-h">
              <div class="d6-help-h"><h2 id="db-help-h" class="d6-h2">How can we <i>help?</i></h2><a class="d6-link" href="#/app/requests/new">View all 14 services →</a></div>
              <div class="d6-tiles">${help.map(([href, ic, col, t, d]) => `<a class="d6-tile" style="--c:${col}" href="${href}"><span class="d6-tile-i">${icon(ic, 22, col)}</span><span class="d6-tile-t"><b>${t}</b><small>${d}</small></span><span class="d6-tile-go">${icon("arrowUR", 15, "#A39D93")}</span></a>`).join("")}</div>
            </section>
          </div>
          <aside class="d6-col d6-side">
            <div class="d6-card d6-notes db-in" style="--d:2">
              <div class="d6-notes-h"><b>COMMUNITY NOTICES</b><span>${esc(u.community)}</span></div>
              ${notices.map(([col, cat, when, t, d]) => `<article class="d6-note"><p class="d6-note-k" style="--c:${col}">${cat}<span>·</span>${when}</p><h4>${t}</h4><p>${d}</p></article>`).join("")}
              <button type="button" class="d6-btn d6-btn--ghost d6-btn--wide" data-bylaws>View Community By-Laws (PDF)</button>
            </div>
          </aside>
        </div>
      </div>`;
  }
  draw();

  c.addEventListener("click", (e) => {
    if (e.target.closest("[data-renew]")) { st.setIntent({ type: "renew", src: "dashboard", unit: st.units()[0].id }); location.hash = "/app/gpt"; }
    if (e.target.closest("[data-movein]")) { st.setIntent({ type: "movein", unit: st.moveInUnits()[0].id }); location.hash = "/app/gpt"; }
    if (e.target.closest("[data-checkin]")) { st.setIntent({ type: "checkin" }); location.hash = "/app/gpt"; }
    const q = e.target.closest("[data-q]"); if (q) { try { sessionStorage.setItem("bloom-gpt-q", q.dataset.q); } catch (x) {} }
    if (e.target.closest("[data-bylaws]")) toast("Prototype: the Community By-Laws (PDF) open here.");
  });
  c.addEventListener("submit", (e) => { const f = e.target.closest("[data-ask]"); if (!f) return; e.preventDefault(); const v = f.querySelector("input").value.trim(); try { if (v) sessionStorage.setItem("bloom-gpt-q", v); } catch (x) {} location.hash = "/app/gpt"; });
  const off = st.on((w) => { if (w === "bookings" || w === "requests" || w === "movein") draw(); });
  return { title: "Home", cleanup: () => { off(); sh.cleanup(); } };
}
