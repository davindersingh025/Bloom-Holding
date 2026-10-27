/* Holiday Home agent — My bookings (Ongoing / Past) and Booking details
   (stay, guests & documents, progress, actions: check out via Bloom GPT,
   extend stay, mark arrived, cancel, check in again). */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, rows, eyebrow, btn, segmented, tile, unitIcon, avatar } from "bloom:/js/app/ui.js";
import { timeline } from "bloom:/js/app/pages/requests.js";
import { toast } from "bloom:/js/app/shell.js";

export function page(ctx) {
  if (!st.isAgent()) {
    const sh = ctx.shell({ active: "home", title: "Bookings" });
    sh.content.innerHTML = `<div class="ap-empty">${tile("calendar")}<b>Bookings are for holiday home agents</b><span>Switch the demo journey to Holiday Home to see guest check-ins and bookings.</span>${btn("Back to home", { href: "#/app" })}</div>`;
    return { title: "Bookings", cleanup: sh.cleanup };
  }
  return ctx.b ? detail(ctx) : list(ctx);
}

const bkCard = (b, i) => {
  const u = st.unit(b.unit), n = st.nights(b.checkIn, b.checkOut);
  return `<a class="ap-card bk-card" href="#/app/bookings/${b.id}" style="--i:${i}">
    <div class="rq-top">${tile(unitIcon(u))}<span class="rq-t"><b>${esc(u.name)}</b><small>${esc(u.community)} · ${b.id}</small></span>${pill(b.status, st.BK_TONE[b.status])}</div>
    <div class="bk-guest">${icon("user", 16, "#6B665C")}<span><b>${esc(b.guests[0].name)}</b>${b.guests.length > 1 ? ` + ${b.guests.length - 1} guest${b.guests.length > 2 ? "s" : ""}` : ""}</span></div>
    <div class="bk-dates"><div><small>Check-in</small><b>${st.fmtS(b.checkIn)}</b></div><span class="bk-nights">${st.nTxt(n)}</span><div><small>Check-out</small><b>${st.fmtS(b.checkOut)}</b></div></div>
  </a>`;
};

function list({ shell }) {
  const sh = shell({ active: "bookings" });
  const c = sh.content;
  let tab = "on";
  function draw() {
    const on = st.ongoing(), pa = st.past(), L = tab === "on" ? on : pa;
    c.innerHTML = `
      <div class="ap-head"><h1 class="ap-h1">My <i>bookings</i></h1>${btn("New check-in", { attrs: "data-new" })}</div>
      ${segmented([["on", "Ongoing", on.length], ["past", "Past", pa.length]], tab)}
      <div class="bk-list">${L.length ? L.map(bkCard).join("") : `<div class="ap-empty">${tile("calendar")}<b>${tab === "on" ? "No ongoing bookings" : "No past bookings yet"}</b><span>${tab === "on" ? "Check in a guest with Bloom GPT and the stay will show up here." : "Completed and cancelled stays will appear here."}</span></div>`}</div>`;
  }
  draw();
  c.addEventListener("click", (e) => {
    const s = e.target.closest("[data-seg]"); if (s) { tab = s.dataset.seg; draw(); return; }
    if (e.target.closest("[data-new]")) { st.setIntent({ type: "checkin" }); location.hash = "/app/gpt"; }
  });
  const off = st.on((w) => w === "bookings" && draw());
  return { title: "My bookings", cleanup: () => { off(); sh.cleanup(); } };
}

function detail({ shell, b: id }) {
  const sh = shell({ active: "bookings", title: "Booking details", back: "#/app/bookings" });
  const c = sh.content;
  let ext = false, arm = false;
  function draw() {
    const b = st.booking(id);
    if (!b) { c.innerHTML = `<div class="ap-empty">${tile("calendar")}<b>Booking not found</b>${btn("My bookings", { href: "#/app/bookings" })}</div>`; return; }
    const u = st.unit(b.unit), n = st.nights(b.checkIn, b.checkOut), lead = b.guests[0];
    const out = b.status === "Checked out", can = b.status === "Cancelled", inn = b.status === "Checked in" || out;
    const steps = [["Check-in submitted", "Via Bloom GPT · no approval needed", "d"], ["Security informed", `${u.community} security has the guest list`, "d"],
      can ? ["Booking cancelled", "Security informed · access removed", "x"] : ["Guests checked in", inn ? st.fmtS(b.checkIn) : `Expected ${st.fmtS(b.checkIn)}`, inn ? "d" : "c"]];
    if (!can) steps.push(["Checked out", out ? `${st.fmtS(b.checkedOutAt || b.checkOut)} · access ended` : `Due ${st.fmtS(b.checkOut)}`, out ? "d" : b.status === "Checked in" ? "c" : ""]);
    let A;
    if (b.status === "Checked in") A = [["checkout", "Check out guest", "primary"], ["extend", ext ? "Close" : "Extend stay", "ghost"]];
    else if (b.status === "Upcoming") A = [["arrived", "Mark as arrived", "primary"], ["cancel", arm ? "Tap again to cancel" : "Cancel booking", "ghost"]];
    else A = [["again", `Check in ${lead.name.split(" ")[0]} again`, "primary"]];
    c.innerHTML = `
      <div class="rq-grid">
        <div class="pd-col">
          <section class="ap-card ap-sum">${tile(unitIcon(u))}<span class="ap-sum-t"><b class="ap-h2">${esc(u.name)}</b><small>${esc(u.community)} · ${b.id}</small></span>${pill(b.status, st.BK_TONE[b.status])}</section>
          <section class="ap-card">${eyebrow("STAY")}<div class="bk-stay"><div><small>Check-in</small><b>${st.fmtS(b.checkIn)}</b><span>From 3:00 pm</span></div><span class="bk-nights">${st.nTxt(n)}</span><div><small>Check-out</small><b>${st.fmtS(b.checkOut)}</b><span>By 12:00 pm</span></div></div>
            ${ext && b.status === "Checked in" ? `<div class="bk-ext" role="group" aria-label="Extend stay by">${[1, 2, 3].map((k) => `<button type="button" class="ap-btn ap-btn--ghost" data-ext="${k}">+${st.nTxt(k)}</button>`).join("")}</div>` : ""}</section>
          <section class="ap-card">${eyebrow(`GUESTS · ${b.guests.length}`, `<a class="ap-link" href="tel:${b.phone.replace(/\s/g, "")}" data-call>Call guest</a>`)}<div class="bk-gl">${b.guests.map((g, i) => `<div class="bk-g">${avatar(g.name)}<span class="pd-ot"><b>${esc(g.name)}${i === 0 ? '<span class="bk-lead">Main guest</span>' : ""}</b><small>${esc(g.type)} · ${esc(g.no)}</small><small>Valid until ${st.fmt(g.exp)}</small></span>${pill("Verified", "green")}</div>`).join("")}</div></section>
        </div>
        <div class="pd-col">
          <section class="ap-card">${eyebrow("PROGRESS")}${timeline(steps)}</section>
          <section class="ap-card">${rows([["Booking ID", b.id], ["Main guest phone", b.phone], ["Submitted", st.fmt(b.submitted)], ["Approval", "Not required"]])}</section>
          <div class="ap-btns ap-btns--stack">${A.map((x) => btn(x[1], { kind: x[2], attrs: `data-act="${x[0]}"` })).join("")}</div>
        </div>
      </div>`;
  }
  draw();
  c.addEventListener("click", (e) => {
    const b = st.booking(id); if (!b) return;
    if (e.target.closest("[data-call]")) { e.preventDefault(); toast(`Calling ${b.guests[0].name} on ${b.phone}…`); return; }
    const x = e.target.closest("[data-ext]"); if (x) { b.checkOut = st.addDays(b.checkOut, +x.dataset.ext); ext = false; st.bookingsChanged(); toast(`Stay extended to ${st.fmtS(b.checkOut)}. Security informed.`); return; }
    const a = e.target.closest("[data-act]"); if (!a) return;
    const act = a.dataset.act;
    if (act === "checkout") { st.setIntent({ type: "checkout", id: b.id }); location.hash = "/app/gpt"; }
    else if (act === "extend") { ext = !ext; draw(); }
    else if (act === "arrived") { b.status = "Checked in"; if (b.checkIn > st.TODAY) { const len = st.nights(b.checkIn, b.checkOut); b.checkIn = st.TODAY; b.checkOut = st.addDays(st.TODAY, len); } st.bookingsChanged(); toast(`${b.guests[0].name} checked in. Security informed.`); }
    else if (act === "cancel") { if (!arm) { arm = true; draw(); setTimeout(() => { if (arm) { arm = false; draw(); } }, 3000); return; } arm = false; b.status = "Cancelled"; st.bookingsChanged(); toast("Booking cancelled. Security informed and access removed."); }
    else if (act === "again") { st.setIntent({ type: "checkin", unit: b.unit, guest: b.guests[0].name }); location.hash = "/app/gpt"; }
  });
  const off = st.on((w) => w === "bookings" && draw());
  return { title: "Booking details", cleanup: () => { off(); sh.cleanup(); } };
}
