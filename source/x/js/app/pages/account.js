/* Profile · Contact us · Notifications (same content as the mobile app). */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, rows, eyebrow, btn, tile, unitIcon, avatar, segmented } from "bloom:/js/app/ui.js";
import { toast } from "bloom:/js/app/shell.js";

export function page(ctx) {
  if (ctx.a === "contact") return contact(ctx);
  if (ctx.a === "notifications") return notifications(ctx);
  return profile(ctx);
}

function profile({ shell }) {
  const sh = shell({ active: "profile", title: "Profile" });
  const c = sh.content;
  const u = st.journey().user, us = st.units();
  const row = (ic, k, act) => `<button type="button" class="pf-row" data-f="${act}">${tile(ic)}<span class="pf-k">${esc(k)}</span>${icon("chev", 16, "#8A847A")}</button>`;
  c.innerHTML = `
    <div class="pf-grid">
      <section class="ap-card pf-hero">
        <div class="pf-cover" aria-hidden="true"></div>
        ${avatar(u.name, "pf-av")}
        <h1 class="ap-h2 pf-name">${esc(u.name)}</h1>
        <p class="ap-muted">${esc(u.email)} · ${esc(u.phone)}</p>
        <div class="pf-tags"><span class="pf-tag pf-tag--role">${esc(u.role)}</span><span class="pf-tag">${esc(us[0].community)}</span><span class="pf-tag pf-tag--ok">ID verified</span></div>
        <div class="pf-stats"><div><b>${us.length}</b><span>${us.length === 1 ? "Property" : "Properties"}</span></div><div><b>${st.activeRequests().length}</b><span>Active requests</span></div><div><b>${st.isAgent() ? st.ongoing().length : st.unreadCount()}</b><span>${st.isAgent() ? "Ongoing bookings" : "Unread updates"}</span></div></div>
        ${btn("View personal information", { kind: "ghost", attrs: 'data-f="personal"' })}
      </section>
      <div class="pd-col">
        <section class="ap-card">${eyebrow(us.length > 1 ? "MY PROPERTIES" : "MY PROPERTY")}${us.map((x) => `<a class="pf-row" href="#/app/property/${x.id}">${tile(unitIcon(x))}<span class="pf-k">${esc(x.name)}<small>${esc(x.community)} · Documents & contract</small></span>${icon("chev", 16, "#8A847A")}</a>`).join("")}</section>
        <section class="ap-card">${row("help", "FAQs", "soon")}${row("feedback", "Provide feedback", "soon")}<a class="pf-row" href="#/app/contact">${tile("phone")}<span class="pf-k">Contact us</span>${icon("chev", 16, "#8A847A")}</a>
          <label class="pf-row pf-lang">${tile("globe")}<span class="pf-k">Language</span><select aria-label="Language" data-lang><option>English</option><option>العربية</option></select></label></section>
        <section class="ap-card">${row("lock", "Change password", "soon")}<a class="pf-row pf-out" href="#/" data-logout>${tile("logout")}<span class="pf-k">Log out</span></a></section>
      </div>
    </div>
    <div class="ap-modal" data-modal hidden></div>`;
  const m = c.querySelector("[data-modal]");
  c.addEventListener("click", (e) => {
    if (e.target.closest("[data-logout]")) { st.signOut(); return; }
    const f = e.target.closest("[data-f]"); if (!f) return;
    if (f.dataset.f === "soon") return toast("Prototype: this opens in the full app.");
    if (f.dataset.f === "personal") {
      m.innerHTML = `<div class="ap-modal-card ap-modal-card--l" role="dialog" aria-modal="true" aria-labelledby="pi-h"><div class="ap-card-h"><h2 id="pi-h" class="ap-h2">Personal information</h2><button type="button" class="ap-ib" data-x aria-label="Close">${icon("x", 18)}</button></div>${rows([["Full name", u.name], ["Email", u.email], ["Mobile", u.phone], ["Emirates ID", "784-••••-•••••21-3"], ["Nationality", "United Arab Emirates"], ["Role", u.role]])}<p class="ap-muted" style="margin-top:12px">To change these details, raise a request or contact us.</p></div>`;
      m.hidden = false; m.querySelector("[data-x]").focus();
    }
  });
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-x]")) m.hidden = true; });
  c.querySelector("[data-lang]").addEventListener("change", (e) => { if (e.target.selectedIndex) toast("Prototype: Arabic is available on the public site (EN / عربي)."); e.target.selectedIndex = 0; });
  return { title: "Profile", cleanup: sh.cleanup };
}

function contact({ shell }) {
  const sh = shell({ active: "contact", title: "Contact us" });
  const c = sh.content;
  const CALL = [
    { ic: "phone", k: "Call", v: "800 BLOOM (25666)", href: "tel:80025666" },
    { ic: "mail", k: "Email", v: "customerservice@bloomholding.com", href: "mailto:customerservice@bloomholding.com" },
    { ic: "pin", k: "Visit", v: "7th Floor, Bloom Central, Sheikh Rashid Bin Saeed St, Rd 18, Abu Dhabi, UAE", href: "https://maps.google.com/?q=Bloom+Central+Sheikh+Rashid+Bin+Saeed+Street+Abu+Dhabi", ext: true },
  ];
  const SOC = [["facebook", "Facebook"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"]];
  c.innerHTML = `
    <div class="pf-grid pf-grid--even">
      <section class="ap-card">${eyebrow("CALL CENTRE")}${CALL.map((r) => `<a class="pf-row" href="${r.href}"${r.ext ? ' target="_blank" rel="noopener"' : ""} data-ck="${r.k}">${tile(r.ic)}<span class="pf-k"><small>${esc(r.k)}</small>${esc(r.v)}</span>${icon(r.ext ? "ext" : "chev", 16, "#8A847A")}</a>`).join("")}</section>
      <section class="ap-card">${eyebrow("SOCIAL MEDIA")}${SOC.map((s) => `<button type="button" class="pf-row" data-social="${s[1]}">${tile(s[0])}<span class="pf-k">${s[1]}</span>${icon("ext", 16, "#8A847A")}</button>`).join("")}</section>
    </div>`;
  c.addEventListener("click", (e) => {
    const s = e.target.closest("[data-social]"); if (s) toast(`Prototype: Bloom Holding on ${s.dataset.social} opens here.`);
    const k = e.target.closest('[data-ck="Call"]'); if (k) toast("Calling 800 BLOOM (25666)…");
  });
  return { title: "Contact us", cleanup: sh.cleanup };
}

function notifications({ shell }) {
  const sh = shell({ active: "home", title: "Notifications", back: "#/app" });
  const c = sh.content;
  let f = "all";
  const FILTERS = [["all", "All"], ["request", "Requests"], ...(st.isAgent() ? [["booking", "Bookings"]] : [["tenancy", "Tenancy"]]), ["payment", "Payments"], ["community", "Community"]];
  function draw() {
    const L = st.notifs().filter((n) => f === "all" || n.cat === f);
    const groups = [...new Set(L.map((n) => n.g))];
    c.innerHTML = `<div class="nt-wrap">
      <div class="ap-head"><h1 class="ap-h1">Notifications</h1>${st.unreadCount() ? `<button type="button" class="ap-link" data-all>Mark all as read</button>` : ""}</div>
      ${segmented(FILTERS, f, "data-f")}
      ${groups.length ? groups.map((g) => `<p class="ap-eyebrow nt-g">${esc(g.toUpperCase())}</p><section class="ap-card nt-card">${L.filter((n) => n.g === g).map((n) => `<a class="ap-nt ${n.unread ? "is-unread" : ""}" href="${n.go || "#"}" data-nt="${n.id}">${tile(n.ic)}<span class="ap-nt-t"><b>${esc(n.title)}</b><small>${esc(n.body)}</small><em>${esc(n.t)}</em></span>${n.unread ? '<i class="ap-dot" aria-label="Unread"></i>' : ""}</a>`).join("")}</section>`).join("") : `<div class="ap-empty">${tile("bell")}<b>No notifications here</b></div>`}
    </div>`;
  }
  draw();
  c.addEventListener("click", (e) => {
    const x = e.target.closest("[data-f]"); if (x) { f = x.dataset.f; draw(); return; }
    if (e.target.closest("[data-all]")) { st.markAllRead(); draw(); return; }
    const n = e.target.closest("[data-nt]"); if (n) { st.markRead(+n.dataset.nt); if (n.getAttribute("href") === "#") { e.preventDefault(); draw(); } }
  });
  return { title: "Notifications", cleanup: sh.cleanup };
}
