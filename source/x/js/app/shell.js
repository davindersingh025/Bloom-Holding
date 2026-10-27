/* Signed-in shell — desktop: left sidebar + top bar; tablet/phone: top bar
   + bottom tab bar (same items as the mobile app: Home · Bookings (agent) ·
   Requests · Bloom GPT). The demo journey switch lives in the top bar. */

import { LOGO } from "bloom:/js/ui/logo.js";
import { icon, esc, avatar, orb } from "bloom:/js/app/ui.js";
import * as st from "bloom:/js/app/store.js";

const NAV = () => [
  { k: "home", label: "Home", href: "#/app", ic: "home" },
  st.isAgent() ? { k: "bookings", label: "Bookings", href: "#/app/bookings", ic: "calendar" } : null,
  { k: "requests", label: "Requests", href: "#/app/requests", ic: "requests" },
  { k: "properties", label: st.units().length > 1 ? "My properties" : "My property", href: `#/app/property/${st.units()[0].id}`, ic: "building", desk: true },
  { k: "gpt", label: "Bloom GPT", href: "#/app/gpt", ic: "gpt" },
].filter(Boolean);

const navIcon = (n, on) => (n.ic === "gpt" ? orb("siri--tab") : icon(n.ic, 22, on ? "#922A22" : "#6B665C"));

export function shell(view, { active = "home", title = "", back = null, flush = false } = {}) {
  const j = st.journey(), u = j.user;
  const unread = st.unreadCount();
  view.innerHTML = `
    <div class="ap" data-journey="${j.id}">
      <aside class="ap-side" aria-label="Main">
        <a class="ap-brand" href="#/app" aria-label="Bloom — Home">${LOGO}</a>
        <nav class="ap-nav">
          ${NAV().map((n) => `<a class="ap-nav-i ${n.k === active ? "is-on" : ""}" href="${n.href}" ${n.k === active ? 'aria-current="page"' : ""}>${navIcon(n, n.k === active)}<span>${esc(n.label)}</span></a>`).join("")}
        </nav>
        <div class="ap-side-foot">
          <a class="ap-nav-i ${active === "contact" ? "is-on" : ""}" href="#/app/contact">${icon("phone", 20, active === "contact" ? "#922A22" : "#6B665C")}<span>Contact us</span></a>
          <a class="ap-nav-i" href="#/">${icon("globe", 20, "#6B665C")}<span>Bloom website</span></a>
          <a class="ap-me ${active === "profile" ? "is-on" : ""}" href="#/app/profile">${avatar(u.name)}<span><b>${esc(u.name)}</b><small>${esc(u.role)}</small></span>${icon("chev", 16, "#8A847A")}</a>
        </div>
      </aside>
      <div class="ap-main">
        <header class="ap-top">
          <div class="ap-top-l">
            <a class="ap-brand ap-brand--m" href="#/app" aria-label="Bloom — Home">${LOGO}</a>
            ${back ? `<a class="ap-back" href="${back}" aria-label="Back">${icon("chevL", 20)}</a>` : ""}
            ${title ? `<h1 class="ap-title">${esc(title)}</h1>` : ""}
          </div>
          <div class="ap-top-r">
            <div class="ap-demo" role="group" aria-label="Demo journey">
              <span class="ap-demo-l">Demo journey</span>
              <div class="ap-demo-seg">${st.JOURNEY_ORDER.map((id) => `<button type="button" data-journey="${id}" aria-pressed="${id === j.id}">${esc(st.JOURNEYS[id].label)}</button>`).join("")}</div>
              <label class="ap-demo-sel"><span class="sr-only">Demo journey</span><select data-journey-sel>${st.JOURNEY_ORDER.map((id) => `<option value="${id}" ${id === j.id ? "selected" : ""}>${esc(st.JOURNEYS[id].label)}</option>`).join("")}</select>${icon("chevD", 14, "#fff")}</label>
            </div>
            <a class="ap-ib ap-ib--d" href="#/app/contact" aria-label="Contact us">${icon("phone", 20)}</a>
            <button type="button" class="ap-ib ap-bell" data-bell aria-label="Notifications${unread ? `, ${unread} unread` : ""}" aria-expanded="false">${icon("bell", 20)}${unread ? `<b class="ap-badge">${unread}</b>` : ""}</button>
            <a class="ap-top-me" href="#/app/profile" aria-label="Profile">${avatar(u.name)}</a>
          </div>
          <div class="ap-pop" data-pop hidden></div>
        </header>
        <main class="ap-content ${flush ? "ap-content--flush" : ""}" data-content></main>
      </div>
      <nav class="ap-tabs" aria-label="Main">
        ${NAV().filter((n) => !n.desk).map((n) => `<a class="ap-tab ${n.k === active ? "is-on" : ""}" href="${n.href}" ${n.k === active ? 'aria-current="page"' : ""}>${navIcon(n, n.k === active)}<span>${esc(n.label)}</span></a>`).join("")}
      </nav>
    </div>`;

  const root = view.querySelector(".ap");
  const pick = (id) => { if (st.setJourney(id)) { if (location.hash === "#/app") window.dispatchEvent(new HashChangeEvent("hashchange")); else location.hash = "/app"; } };
  root.querySelectorAll("button[data-journey]").forEach((b) => b.addEventListener("click", () => pick(b.dataset.journey)));
  root.querySelector("[data-journey-sel]").addEventListener("change", (e) => pick(e.target.value));

  /* notifications popover (desktop) / page (small screens) */
  const pop = root.querySelector("[data-pop]"), bell = root.querySelector("[data-bell]");
  const close = () => { pop.hidden = true; bell.setAttribute("aria-expanded", "false"); };
  const drawPop = () => {
    pop.innerHTML = `<div class="ap-pop-h"><b>Notifications</b>${st.unreadCount() ? `<button type="button" class="ap-link" data-allread>Mark all as read</button>` : ""}</div>
      <div class="ap-pop-l">${st.notifs().map((n) => `<a class="ap-nt ${n.unread ? "is-unread" : ""}" href="${n.go || "#"}" data-nt="${n.id}"><span class="ap-tile">${icon(n.ic, 18, "#922A22")}</span><span class="ap-nt-t"><b>${esc(n.title)}</b><small>${esc(n.body)}</small><em>${esc(n.g)} · ${esc(n.t)}</em></span>${n.unread ? '<i class="ap-dot" aria-label="Unread"></i>' : ""}</a>`).join("")}</div>
      <a class="ap-pop-f" href="#/app/notifications">View all notifications</a>`;
  };
  const refreshBadge = () => {
    const n = st.unreadCount();
    bell.querySelector(".ap-badge")?.remove();
    if (n) bell.insertAdjacentHTML("beforeend", `<b class="ap-badge">${n}</b>`);
    bell.setAttribute("aria-label", `Notifications${n ? `, ${n} unread` : ""}`);
  };
  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    if (matchMedia("(max-width: 899px)").matches) { location.hash = "/app/notifications"; return; }
    if (!pop.hidden) return close();
    drawPop(); pop.hidden = false; bell.setAttribute("aria-expanded", "true");
  });
  pop.addEventListener("click", (e) => {
    if (e.target.closest("[data-allread]")) { st.markAllRead(); drawPop(); return; }
    const a = e.target.closest("[data-nt]");
    if (a) { st.markRead(+a.dataset.nt); if (a.getAttribute("href") === "#") { e.preventDefault(); drawPop(); } else close(); }
  });
  const outside = (e) => { if (!pop.hidden && !pop.contains(e.target) && !bell.contains(e.target)) close(); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("click", outside);
  document.addEventListener("keydown", onKey);
  const off = st.on((w) => { if (w === "notifs") refreshBadge(); });

  return {
    content: root.querySelector("[data-content]"),
    root,
    cleanup: () => { document.removeEventListener("click", outside); document.removeEventListener("keydown", onKey); off(); },
  };
}

/* lightweight toast in the app style */
export function toast(msg) {
  let el = document.getElementById("ap-toast");
  if (!el) { el = document.createElement("div"); el.id = "ap-toast"; el.className = "ap-toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add("is-in");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("is-in"), 2800);
}
