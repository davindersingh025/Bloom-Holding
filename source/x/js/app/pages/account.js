/* Profile · Contact us · Notifications (same content as the mobile app). */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, eyebrow, btn, tile, unitIcon, avatar, segmented, pill, orb } from "bloom:/js/app/ui.js";
import { LOGO } from "bloom:/js/ui/logo.js";
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
  const memberSince = { tenant: "Oct 2025", holiday: "Apr 2025", owner: "Jun 2022" }[st.journey().id];
  const memberId = { tenant: "BLM-25-01138", holiday: "BLM-HH-20431", owner: "BLM-22-00614" }[st.journey().id];
  let tab = "overview";
  const prefs = { push: true, email: true, sms: false };

  const stats = () => [
    [us.length, us.length === 1 ? "Property" : "Properties"],
    [st.activeRequests().length, "Active requests"],
    st.isAgent() ? [st.ongoing().length, "Ongoing stays"] : [st.unreadCount(), "Unread updates"],
  ];
  const activity = () => {
    const items = st.requests().slice(0, 4).map((r) => ({ t: r.title, s: `Ref #${r.id} · ${r.status}`, d: r.submitted, href: `#/app/requests/${r.id}`, ic: "wrench", tone: st.REQ_STATUS[r.status] }));
    if (st.isAgent()) st.bookings().slice(0, 3).forEach((b) => items.push({ t: `${b.guests[0].name} · ${st.unit(b.unit).name}`, s: `${b.id} · ${b.status}`, d: b.checkIn, href: `#/app/bookings/${b.id}`, ic: "key", tone: st.BK_TONE[b.status] }));
    return items.sort((x, y) => y.d - x.d).slice(0, 5);
  };
  const sw = (k, label, sub) => `<label class="pf-sw"><span class="pf-sw-t"><b>${esc(label)}</b><small>${esc(sub)}</small></span><input type="checkbox" role="switch" data-pref="${k}" ${prefs[k] ? "checked" : ""}><i aria-hidden="true"></i></label>`;
  const link = (ic, k, sub, attrs) => `<a class="pf-link" ${attrs}>${tile(ic)}<span class="pf-k">${esc(k)}${sub ? `<small>${esc(sub)}</small>` : ""}</span>${icon("chev", 16, "#8A847A")}</a>`;

  function panel() {
    if (tab === "info") return `
      <section class="ap-card pf-panel">
        <div class="pf-fields">${[["Full name", u.name, "user"], ["Email", u.email, "mail"], ["Mobile", u.phone, "phone"], ["Emirates ID", "784-••••-•••••21-3", "id"], ["Nationality", "United Arab Emirates", "globe"], ["Role", u.role, "key"]].map(([k, v, ic]) => `
          <div class="pf-field">${tile(ic)}<span><small>${esc(k)}</small><b>${esc(v)}</b></span>${k === "Role" ? "" : '<em class="pf-ok">Verified</em>'}</div>`).join("")}</div>
        <div class="pf-note">${icon("info", 16, "#1A1A1A")}<span>Your details come from your Emirates ID and contract. To change them, raise a request and our team will update them.</span></div>
        ${btn("Request a change", { kind: "ghost", href: "#/app/requests/new?scope=unit" })}
      </section>`;
    if (tab === "settings") return `
      <section class="ap-card pf-panel">
        <p class="ap-eyebrow">NOTIFICATIONS</p>
        <div class="pf-sws">${sw("push", "Push notifications", "Request updates, bookings and reminders")}${sw("email", "Email", "Statements, receipts and confirmations")}${sw("sms", "SMS", "Urgent alerts only")}</div>
        <p class="ap-eyebrow pf-gap">LANGUAGE</p>
        ${segmented([["en", "English"], ["ar", "العربية"]], "en", "data-lang")}
        <p class="ap-eyebrow pf-gap">SECURITY & HELP</p>
        <div class="pf-links">${link("lock", "Change password", "Last changed 3 months ago", 'href="#" data-soon')}${link("help", "FAQs", "", 'href="#" data-soon')}${link("feedback", "Provide feedback", "", 'href="#" data-soon')}${link("phone", "Contact us", "800 BLOOM (25666)", 'href="#/app/contact"')}</div>
        <a class="ap-btn ap-btn--ghost pf-logout" href="#/" data-logout>Log out</a>
      </section>`;
    return `
      <section class="ap-card pf-panel">
        <div class="ap-card-h"><p class="ap-eyebrow">${us.length > 1 ? "MY PROPERTIES" : "MY PROPERTY"}</p></div>
        <div class="pf-props">${us.map((x, i) => { const s = st.unitStatus(x); return `
          <a class="pf-prop" href="#/app/property/${x.id}" style="--i:${i}">
            <span class="pf-prop-img">${icon(unitIcon(x), 26, "#922A22")}<img src="${st.unitImg(x, 360)}" alt="" loading="lazy" onerror="this.remove()"></span>
            <span class="pf-prop-t"><b>${esc(x.name)}</b><small>${esc(x.type)} · ${esc(x.community)}</small>${s ? pill(st.ST_LABEL[s], st.ST_TONE[s]) : st.isTenant() ? pill(x.contract.status, x.contract.tone) : ""}</span>
            ${icon("chev", 16, "#8A847A")}
          </a>`; }).join("")}</div>
      </section>
      <section class="ap-card pf-panel">
        <div class="ap-card-h"><p class="ap-eyebrow">RECENT ACTIVITY</p><a class="ap-link" href="#/app/requests">View all</a></div>
        <ol class="pf-act">${activity().map((x) => `<li><a href="${x.href}"><span class="pf-act-dot" data-tone="${x.tone}"></span><span class="pf-act-t"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span><time>${st.fmtDM(x.d)}</time></a></li>`).join("")}</ol>
      </section>`;
  }

  function draw() {
    c.innerHTML = `
      <div class="pf">
        <aside class="pf-side">
          <div class="pf-card" data-tilt>
            <div class="pf-card-glow" aria-hidden="true"></div>
            <div class="pf-card-top"><span class="pf-card-logo">${LOGO}</span><span class="pf-card-role">${esc(u.role)}</span></div>
            <div class="pf-card-mid">${avatar(u.name, "pf-card-av")}<span><b class="pf-card-name">${esc(u.name)}</b><small>Member since ${memberSince}</small></span></div>
            <div class="pf-card-bot"><span><small>MEMBER ID</small><b>${memberId}</b></span><span class="pf-card-ver">${icon("check", 14, "#1A1A1A")} ID verified</span></div>
          </div>
          <div class="pf-stats">${stats().map(([n, l]) => `<div><b>${n}</b><span>${esc(l)}</span></div>`).join("")}</div>
          <div class="pf-quick">
            <a href="#/app/gpt" class="pf-q">${orb("pf-q-orb")}<span>Ask Bloom GPT</span></a>
            <a href="#/app/contact" class="pf-q">${icon("phone", 20, "#922A22")}<span>Contact us</span></a>
          </div>
        </aside>
        <div class="pf-main">
          <div class="pf-head"><h1 class="ap-h1">Hello, <i>${esc(u.name.split(" ")[0])}</i></h1><p class="ap-muted">${esc(u.email)} · ${esc(u.phone)}</p></div>
          ${segmented([["overview", "Overview"], ["info", "Personal info"], ["settings", "Settings"]], tab, "data-tab")}
          <div class="pf-body" data-body>${panel()}</div>
        </div>
      </div>`;
    tiltCard(c.querySelector("[data-tilt]"));
  }
  draw();

  c.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; c.querySelectorAll("[data-tab]").forEach((b) => { const on = b.dataset.tab === tab; b.classList.toggle("is-on", on); b.setAttribute("aria-selected", on); }); const body = c.querySelector("[data-body]"); body.innerHTML = panel(); body.classList.remove("is-swap"); void body.offsetWidth; body.classList.add("is-swap"); return; }
    if (e.target.closest("[data-logout]")) { st.signOut(); return; }
    if (e.target.closest("[data-soon]")) { e.preventDefault(); toast("Prototype: this opens in the full app."); return; }
    const l = e.target.closest("[data-lang]"); if (l && l.dataset.lang === "ar") toast("Prototype: Arabic is available on the public site (EN / عربي).");
  });
  c.addEventListener("change", (e) => { const p = e.target.closest("[data-pref]"); if (p) { prefs[p.dataset.pref] = p.checked; toast(`${p.closest(".pf-sw").querySelector("b").textContent} ${p.checked ? "on" : "off"}`); } });
  return { title: "Profile", cleanup: sh.cleanup };
}

/* the membership card leans gently towards the pointer */
function tiltCard(el) {
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`); el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(0)}%`); el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(0)}%`);
  });
  el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
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
