/* Holiday Home agent — guest check-in / check-out (Nov 2026 spec, same as mobile).
   · My bookings: Ongoing (Submitted · Approved) / Past (Checked Out · Rejected),
     hotel-style cards, newest first.
   · Booking details: photo, title, status line, Stay details, Guests + IDs,
     Special needs; Approved → Extend Stay + Check-out; BCM prototype strip.
   · New check-in: compact booking form (unit · check-in · check-out · guests),
     guest rows with an ID button (Guest ID dialog), special needs, sticky
     summary + Submit → status Submitted.
   · Shared actions (also used by Home and Property details): extend stay
     ("Choose a New Date"), check-out ("Check Out Guest?"), pick an ongoing
     booking to check out.
   PROTOTYPE: bookings live in memory (store.js). */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, btn, segmented, tile, secH, avatar, reduced } from "bloom:/js/app/ui.js";
import { toast } from "bloom:/js/app/shell.js";

const MONL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOWL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DOW2 = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const initials = (n) => String(n).split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const photo = (uid) => st.unitImg(st.unit(uid), 480);

export function page(ctx) {
  if (!st.isAgent()) {
    const sh = ctx.shell({ active: "home", title: "Bookings" });
    sh.content.innerHTML = `<div class="ap-empty">${tile("calendar")}<b>Bookings are for holiday home agents</b><span>Switch the demo journey to Holiday Home to see guest check-ins and bookings.</span>${btn("Back to home", { href: "#/app" })}</div>`;
    return { title: "Bookings", cleanup: sh.cleanup };
  }
  if (ctx.b === "new") return newCheckin(ctx);
  return ctx.b ? detail(ctx) : list(ctx);
}

/* ============================================================================
   Dialogs: generic modal · calendar · confirm · success · pick ongoing booking
   ============================================================================ */
function modal(html, cls = "") {
  const m = document.createElement("div");
  m.className = "ap-modal bkw-ov";
  m.innerHTML = `<div class="ap-modal-card ap-modal-card--l bkw-dlg ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  (document.querySelector(".ap") || document.body).appendChild(m);
  const prev = document.activeElement;
  const close = () => { m.remove(); document.removeEventListener("keydown", key); if (prev && prev.focus) prev.focus(); };
  const key = (e) => { if (e.key === "Escape") { e.preventDefault(); m.dispatchEvent(new CustomEvent("bkw-close")); } };
  document.addEventListener("keydown", key);
  m.addEventListener("click", (e) => { if (e.target === m) m.dispatchEvent(new CustomEvent("bkw-close")); });
  m.close = close;
  setTimeout(() => { const f = m.querySelector("[data-focus], button, input"); if (f) f.focus(); }, 30);
  return m;
}
const head = (title, sub = "") => `<div class="bkw-mh"><span><b class="ap-h2">${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span><button type="button" class="bkw-x" data-x aria-label="Close">${icon("x", 20, "#1C1C19")}</button></div>`;

/* calendar → Promise<Date|null> */
export function calendar({ title, hint, min, value, from, field = "Selected date", save = "Save" }) {
  return new Promise((res) => {
    min = st.day0(min); let sel = value ? st.day0(value) : null, view = new Date((sel || min).getFullYear(), (sel || min).getMonth(), 1);
    const m = modal(`${head(title, hint)}<div class="bkw-cal" data-cal></div>
      <div class="bkw-field">${icon("calendar", 20, "#922A22")}<span><small>${esc(field)}</small><b data-val>${sel ? st.fmtS(sel) : "Select a date"}</b></span></div>
      <button type="button" class="ap-btn ap-btn--primary bkw-save" data-save ${sel ? "" : "disabled"}>${esc(save)}</button>`, "bkw-dlg--cal");
    const draw = () => {
      const y = view.getFullYear(), mo = view.getMonth(), lead = new Date(y, mo, 1).getDay(), dim = new Date(y, mo + 1, 0).getDate();
      let h = `<div class="bkw-cal-h"><button type="button" data-pm aria-label="Previous month" ${new Date(y, mo, 1) <= new Date(min.getFullYear(), min.getMonth(), 1) ? "disabled" : ""}>${icon("chevL", 18)}</button><b>${MONL[mo]} ${y}</b><button type="button" data-nm aria-label="Next month">${icon("chev", 18)}</button></div><div class="bkw-dow">${DOW2.map((d) => `<span>${d}</span>`).join("")}</div><div class="bkw-days">`;
      for (let i = 0; i < lead; i++) h += "<span></span>";
      for (let d = 1; d <= dim; d++) {
        const dt = new Date(y, mo, d), dis = dt < min, on = sel && +dt === +sel, rng = from && sel && dt >= st.day0(from) && dt < sel, td = +dt === +st.TODAY;
        h += `<button type="button" data-d="${+dt}" ${dis ? "disabled" : ""} class="${on ? "is-on" : ""} ${rng ? "is-rng" : ""} ${td ? "is-today" : ""}" aria-label="${st.fmtS(dt)}" ${on ? 'aria-pressed="true"' : ""}>${d}</button>`;
      }
      m.querySelector("[data-cal]").innerHTML = h + "</div>";
    };
    draw();
    const done = (v) => { m.close(); res(v); };
    m.addEventListener("bkw-close", () => done(null));
    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-x]")) return done(null);
      if (e.target.closest("[data-pm]")) { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); return draw(); }
      if (e.target.closest("[data-nm]")) { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); return draw(); }
      const b = e.target.closest("[data-d]");
      if (b && !b.disabled) { sel = new Date(+b.dataset.d); m.querySelector("[data-val]").textContent = st.fmtS(sel); m.querySelector("[data-save]").disabled = false; draw(); return; }
      if (e.target.closest("[data-save]") && sel) done(sel);
    });
  });
}
/* confirmation → Promise<boolean> */
function confirmBox({ title, msg, ok = "Yes, Proceed", cancel = "Cancel", ic = "logout" }) {
  return new Promise((res) => {
    const m = modal(`<span class="bkw-ci">${icon(ic, 28, "#922A22")}</span><h2 class="ap-h2" id="bkw-ct">${esc(title)}</h2><p class="ap-muted">${esc(msg)}</p>
      <div class="ap-btns">${btn(cancel, { kind: "ghost", attrs: "data-no" })}${btn(ok, { attrs: "data-yes data-focus" })}</div>`, "bkw-dlg--c");
    m.querySelector(".bkw-dlg").setAttribute("role", "alertdialog");
    m.querySelector(".bkw-dlg").setAttribute("aria-labelledby", "bkw-ct");
    const done = (v) => { m.close(); res(v); };
    m.addEventListener("bkw-close", () => done(false));
    m.addEventListener("click", (e) => { if (e.target.closest("[data-yes]")) done(true); else if (e.target.closest("[data-no]")) done(false); });
  });
}
/* success → Promise<action|null> */
function success(title, msg, acts) {
  return new Promise((res) => {
    const m = modal(`<span class="bkw-ok"><svg viewBox="0 0 52 52" width="72" height="72" aria-hidden="true"><circle cx="26" cy="26" r="24" fill="none" stroke="#2E7D5B" stroke-width="3"/><path d="m15 27 7 7 15-16" fill="none" stroke="#2E7D5B" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <h2 class="ap-h2">${esc(title)}</h2><p class="ap-muted">${esc(msg)}</p>${acts ? `<div class="ap-btns">${acts.map((a) => btn(a[1], { kind: a[2] || "primary", attrs: `data-a="${a[0]}"` })).join("")}</div>` : ""}`, "bkw-dlg--c");
    const t = acts ? null : setTimeout(() => done(null), 1800);
    const done = (v) => { clearTimeout(t); m.close(); res(v); };
    m.addEventListener("bkw-close", () => done(null));
    m.addEventListener("click", (e) => { const a = e.target.closest("[data-a]"); if (a) done(a.dataset.a); else if (!acts) done(null); });
  });
}
/* ongoing approved bookings → pick one */
export function pickOngoing() {
  return new Promise((res) => {
    const L = st.approvedOngoing();
    const m = modal(`${head("Check out a guest", L.length ? "Ongoing approved bookings" : "")}
      ${L.length ? `<div class="bkw-pl">${L.map((b) => { const u = st.unit(b.unit); return `<button type="button" class="bkw-pi" data-b="${b.id}"><img src="${photo(b.unit)}" alt="" onerror="this.style.visibility='hidden'"><span><b>${esc(u.name)} · ${esc(b.guests[0].name)}</b><small>${st.fmtS(b.checkIn)} → ${st.fmtS(b.checkOut)} · ${st.gTxt(b.guests.length)}</small></span>${icon("chev", 18, "#8A847A")}</button>`; }).join("")}</div>`
        : `<div class="ap-empty bkw-empty">${tile("logout")}<b>No guests to check out</b><span>Approved stays will show up here.</span></div>`}`, "bkw-dlg--pick");
    const done = (v) => { m.close(); res(v); };
    m.addEventListener("bkw-close", () => done(null));
    m.addEventListener("click", (e) => { if (e.target.closest("[data-x]")) return done(null); const b = e.target.closest("[data-b]"); if (b) done(st.booking(b.dataset.b)); });
  });
}

/* ---------- shared actions (Booking details · Property details · Home) ---------- */
export function doCheckout(b) {
  if (!b || b.status !== "Approved") return Promise.resolve(false);
  return confirmBox({ title: "Check Out Guest?", msg: `You’re checking out ${b.guests[0].name}${b.guests.length > 1 ? "’s party" : ""} from ${st.unit(b.unit).name}. This can’t be undone.` })
    .then((ok) => {
      if (!ok) return false;
      b.status = "Checked Out"; b.checkedOutAt = new Date(); b.ext = null; st.bookingsChanged();
      return success("Guest checked out", `${st.fmtS(b.checkedOutAt)} · ${st.fmtT(b.checkedOutAt)}`).then(() => true);
    });
}
export function doExtend(b) {
  if (!b || b.status !== "Approved" || (b.ext && b.ext.st === "pending")) return Promise.resolve(false);
  return calendar({ title: "Choose a New Date", hint: `Current check-out: ${st.fmtS(b.checkOut)}. Pick a later date.`, min: st.addDays(b.checkOut, 1), field: "New End Date", from: b.checkIn })
    .then((d) => {
      if (!d) return false;
      b.ext = { st: "pending", date: d }; st.bookingsChanged();
      return success("Extension Submitted", `New end date ${st.fmtS(d)} · awaiting BCM approval`).then(() => true);
    });
}

/* ============================================================================
   My bookings
   ============================================================================ */
const bkCard = (b, i) => {
  const u = st.unit(b.unit);
  return `<a class="ap-card bkw-card${st.isPast(b) ? " is-past" : ""}" href="#/app/bookings/${b.id}" style="--i:${i}" aria-label="${esc(`${u.name}, ${st.fmtS(b.checkIn)} to ${st.fmtS(b.checkOut)}, ${b.status}`)}">
    <span class="bkw-top"><span class="bkw-img"><img src="${photo(b.unit)}" alt="" loading="lazy" onerror="this.remove()"></span><span class="bkw-t"><b>${esc(u.name)}</b><small>${esc(u.community)}</small></span>${pill(b.status, st.BK_TONE[b.status])}</span>
    <span class="bkw-dates"><span><small>Check-in</small><b>${st.fmtS(b.checkIn)}</b></span><span><small>Check-out</small><b>${st.fmtS(b.checkOut)}</b></span><span><small>Guests</small><b>${b.guests.length}</b></span></span>
  </a>`;
};

function list({ shell }) {
  const sh = shell({ active: "bookings" });
  const c = sh.content;
  let tab = "on";
  function draw() {
    const on = st.ongoing(), pa = st.past(), all = st.bookings(), L = tab === "on" ? on : pa;
    c.innerHTML = `
      <div class="ap-head"><h1 class="ap-h1">My <i>bookings</i></h1>${btn("New check-in", { href: "#/app/bookings/new" })}</div>
      ${segmented([["on", "Ongoing", on.length], ["past", "Past", pa.length]], tab)}
      <div class="bkw-list">${L.length ? L.map(bkCard).join("") : tab === "on"
        ? `<div class="ap-empty">${tile("calendar")}<b>${all.length ? "No ongoing bookings" : "No bookings yet."}</b><span>Check in a guest to get started.</span>${btn("New check-in", { href: "#/app/bookings/new" })}</div>`
        : `<div class="ap-empty">${tile("logout")}<b>No past bookings</b><span>Finished and rejected stays land here.</span></div>`}</div>`;
  }
  draw();
  c.addEventListener("click", (e) => { const s = e.target.closest("[data-seg]"); if (s) { tab = s.dataset.seg; draw(); } });
  const off = st.on((w) => w === "bookings" && draw());
  return { title: "My bookings", cleanup: () => { off(); sh.cleanup(); } };
}

/* ============================================================================
   Booking details
   ============================================================================ */
const BANNER = {
  Submitted: ["blue", "clock", "Awaiting BCM Approval", "BCM is reviewing this check-in request."],
  Approved: ["green", "check", "Approved by BCM", "Security has the guest list for this stay."],
  Rejected: ["red", "x", "Rejected by BCM", ""],
  "Checked Out": ["grey", "logout", "Checked Out", ""],
};
const TC = { blue: "#3D4CA3", green: "#2E7D5B", red: "#922A22", grey: "#54504A", amber: "#8F5A1C" };
const line = (tone, ic, t, sub) => `<div class="bkw-st" data-tone="${tone}"><span class="bkw-sti">${icon(ic, 18, TC[tone])}</span><span><b>${esc(t)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span></div>`;
const fact = (ic, label, val) => `<div class="ud-fact"><b>${icon(ic, 20, "#1C1C19")}${esc(val)}</b><small>${esc(label)}</small></div>`;

function detail({ shell, b: id }) {
  const sh = shell({ active: "bookings", title: "Booking details", back: "#/app/bookings" });
  const c = sh.content;
  function draw() {
    const b = st.booking(id);
    if (!b) { c.innerHTML = `<div class="ap-empty">${tile("calendar")}<b>Booking not found</b>${btn("My bookings", { href: "#/app/bookings" })}</div>`; return; }
    const u = st.unit(b.unit), n = st.nights(b.checkIn, b.checkOut), bn = BANNER[b.status], ext = b.ext;
    const sub = b.status === "Rejected" ? b.reason : b.status === "Checked Out" ? `Checked out on ${st.fmtS(b.checkedOutAt)} at ${st.fmtT(b.checkedOutAt)}` : bn[3];
    const A = [];
    if (b.status === "Approved") { if (!(ext && ext.st === "pending")) A.push(["extend", "Extend Stay", "ghost"]); A.push(["checkout", "Check-out", "primary"]); }
    const bcm = [];
    if (b.status === "Submitted") bcm.push(["approve", "Approve booking"], ["reject", "Reject booking"]);
    if (ext && ext.st === "pending") bcm.push(["ext-ok", "Approve extension"], ["ext-no", "Reject extension"]);
    c.innerHTML = `
      <div class="pd-grid ud bkw-det">
        <div class="pd-col">
          <section class="ud-hero bkw-hero"><span class="ud-shot"><img src="${st.unitImg(u, 1400)}" alt="${esc(u.name)}" onerror="this.remove()"></span><span class="ud-chip">${pill(b.status, st.BK_TONE[b.status])}</span></section>
          <div class="ud-title bkw-title"><h2>${esc(u.name)}</h2><p>${esc(u.community)} · ${esc(u.code)}</p><p class="bkw-id">${icon("hash", 14, "#8A847A")}Booking ${b.id}</p></div>
          <div class="bkw-stl">${line(bn[0], bn[1], bn[2], sub)}
            ${ext && ext.st === "pending" ? line("amber", "clock", "Extension Submitted", `Requested ${st.fmtS(ext.date)}. Check-out stays ${st.fmtS(b.checkOut)} until BCM approves.`) : ""}
            ${ext && ext.st === "rejected" ? line("red", "x", "Extension rejected", `${ext.reason} Check-out stays ${st.fmtS(b.checkOut)}.`) : ""}</div>
          <section class="ap-card">${secH("cal", "Stay details")}<div class="ud-facts bkw-facts">${fact("calendar", "Check-in", st.fmtS(b.checkIn))}${fact("logout", "Check-out", st.fmtS(b.checkOut))}${fact("clock", "Duration", st.nTxt(n))}${fact("users", "Guests", st.gTxt(b.guests.length))}</div></section>
        </div>
        <div class="pd-col">
          <section class="ap-card">${secH("users", "Guests", `<span class="bkw-cnt">${b.guests.length}</span>`)}<div class="bkw-gl">${b.guests.map((g, i) => `<div class="bkw-g">${avatar(g.name)}<span class="bkw-gt"><b>${esc(g.name)}</b><small>${i === 0 ? "Main guest · " : ""}${g.docs.length} ID document${g.docs.length > 1 ? "s" : ""}</small><span class="bkw-docs">${g.docs.map((d) => `<button type="button" class="bkw-doc" data-doc="${esc(d.name)}">${icon("id", 16, "#922A22")}<span>${esc(d.name)}</span></button>`).join("")}</span></span></div>`).join("")}</div></section>
          <section class="ap-card">${secH("help", "Special needs", pill(b.special ? "Yes" : "No", b.special ? "amber" : "grey"))}${b.special ? `<p class="bkw-sn">${icon("doc", 20, "#8F5A1C")}<span>${esc(b.comments)}</span></p>` : '<p class="ap-muted">No special requests for this stay.</p>'}</section>
          ${A.length ? `<div class="ap-btns bkw-acts">${A.map((x) => btn(x[1], { kind: x[2], attrs: `data-act="${x[0]}"` })).join("")}</div>` : ""}
          <section class="bkw-demo" aria-label="Prototype controls"><p class="ap-eyebrow">PROTOTYPE · BCM</p><div>${bcm.length ? bcm.map((x) => `<button type="button" class="bkw-chip" data-bcm="${x[0]}">${x[1]}</button>`).join("") : '<span class="ap-muted">Nothing waiting for BCM on this booking.</span>'}</div></section>
        </div>
      </div>`;
  }
  draw();
  c.addEventListener("click", (e) => {
    const b = st.booking(id); if (!b) return;
    const d = e.target.closest("[data-doc]"); if (d) { toast(`Prototype: ${d.dataset.doc} opens here.`); return; }
    const k = e.target.closest("[data-bcm]");
    if (k) {
      const v = k.dataset.bcm;
      if (v === "approve") { b.status = "Approved"; toast("BCM approved the booking."); }
      else if (v === "reject") { b.status = "Rejected"; b.reason = "The guest’s ID document is not clear enough to verify. Upload a clearer copy and submit again."; toast("BCM rejected the booking."); }
      else if (v === "ext-ok") { b.checkOut = b.ext.date; b.ext = null; toast(`Extension approved. Check-out is now ${st.fmtS(b.checkOut)}.`); }
      else if (v === "ext-no") { b.ext = { st: "rejected", date: b.ext.date, reason: "The unit is booked from the next day." }; toast("Extension rejected."); }
      st.bookingsChanged(); return;
    }
    const a = e.target.closest("[data-act]"); if (!a) return;
    if (a.dataset.act === "checkout") doCheckout(b);
    else if (a.dataset.act === "extend") doExtend(b);
  });
  const off = st.on((w) => w === "bookings" && draw());
  return { title: "Booking details", cleanup: () => { off(); sh.cleanup(); } };
}

/* ============================================================================
   New check-in
   ============================================================================ */
const MAXF = 5 * 1024 * 1024;
function newCheckin({ shell, query }) {
  const sh = shell({ active: "bookings", title: "New check-in", back: "#/app/bookings" });
  const c = sh.content;
  const pre = query && query.get && query.get("unit");
  const F = { unit: st.units().some((u) => u.id === pre) ? pre : null, from: null, to: null, guests: [{ name: "", docs: [] }], special: false, comments: "", err: {} };
  const valid = () => {
    if (!F.unit || !F.from || !F.to || F.to < F.from || F.from < st.TODAY) return false;
    if (!F.guests.length || F.guests.some((g) => !g.name.trim() || !g.docs.length)) return false;
    if (F.special && (!F.comments.trim() || F.comments.length > 500)) return false;
    return true;
  };
  const dval = (d) => d ? `<span class="bkn-dv"><b>${d.getDate()}</b><span>${MON[d.getMonth()]}’${String(d.getFullYear()).slice(2)}</span></span><small>${DOWL[d.getDay()]}</small>` : `<span class="bkn-dv is-ph"><span>Select date</span></span><small>&nbsp;</small>`;
  function draw() {
    const u = F.unit ? st.unit(F.unit) : null, n = F.from && F.to ? st.nights(F.from, F.to) : null, ok = valid();
    c.innerHTML = `
      <div class="bkn-grid">
        <div class="bkn-col">
          <section class="ap-card bkn-card">
            <button type="button" class="bkn-row bkn-unit" data-unitpick><span class="bkn-l">UNIT</span>
              ${u ? `<span class="bkn-uv"><img src="${photo(u.id)}" alt="" onerror="this.remove()"><span><b>${esc(u.name)}</b><small>${esc(u.community)} · ${esc(u.code)}</small></span></span>` : '<span class="bkn-uv is-ph"><span><b>Select unit</b><small>Choose the holiday home</small></span></span>'}
              <span class="bkn-chev">${icon("chev", 18, "#8A847A")}</span></button>
            <div class="bkn-dates"><button type="button" class="bkn-row bkn-d" data-pick="from"><span class="bkn-l">CHECK-IN</span>${dval(F.from)}</button>
              <span class="bkn-n">${n != null ? st.nTxt(n) : icon("clock", 14, "#8A847A")}</span>
              <button type="button" class="bkn-row bkn-d" data-pick="to" ${F.from ? "" : "disabled"}><span class="bkn-l">CHECK-OUT</span>${dval(F.to)}</button></div>
            <div class="bkn-row bkn-gr"><span><span class="bkn-l">GUESTS</span><span class="bkn-gv"><b>${F.guests.length}</b> ${F.guests.length === 1 ? "Guest" : "Guests"}</span></span>
              <span class="bkn-step"><button type="button" data-gm aria-label="Fewer guests" ${F.guests.length <= 1 ? "disabled" : ""}>−</button><button type="button" data-gp aria-label="More guests" ${F.guests.length >= 10 ? "disabled" : ""}>+</button></span></div>
          </section>
          <section class="ap-card bkn-pad"><button type="button" class="bkn-chk" role="checkbox" aria-checked="${F.special}" data-sn><span class="bkn-box">${F.special ? icon("check", 14, "#fff") : ""}</span><span><b>Guests have special needs</b><small>Accessibility, baby cot, medical needs…</small></span></button>
            ${F.special ? `<label class="bkn-ta"><span class="sr-only">Comments</span><textarea data-cm maxlength="500" rows="3" placeholder="Tell the community team what’s needed">${esc(F.comments)}</textarea><small data-cc>${F.comments.length} / 500</small></label>` : ""}</section>
        </div>
        <div class="bkn-col">
          <section class="ap-card bkn-pad"><div class="bkn-h"><b>Guest details</b><small>Name exactly as on the ID</small></div>
            ${F.guests.map((g, i) => { const nd = g.docs.length, e = F.err["g" + i];
              return `<div class="bkn-g" data-gi="${i}"><span class="ap-av bkn-av">${g.name.trim() ? initials(g.name) : i + 1}</span>
                <label class="bkn-in"><span class="sr-only">Guest ${i + 1} name</span><input type="text" data-gname="${i}" value="${esc(g.name)}" placeholder="${i === 0 ? "Main guest name" : `Guest ${i + 1} name`}" maxlength="60" autocomplete="off"></label>
                <button type="button" class="bkn-idb${nd ? " has" : ""}${e ? " err" : ""}" data-idsheet="${i}" aria-label="${nd ? `${nd} ID uploaded for guest ${i + 1}` : `Add ID for guest ${i + 1}`}">${icon("id", 16, nd ? "#2E7D5B" : "#922A22")}<span>${nd ? `${nd} ID` : "Add ID"}</span></button></div>`; }).join("")}
          </section>
          <section class="ap-card bkn-sum">
            <div class="bkn-sum-t">${n != null ? `<b>${st.nTxt(n)}</b><small>${st.gTxt(F.guests.length)}${u ? ` · ${esc(u.name)}` : ""}</small>` : `<b>${st.gTxt(F.guests.length)}</b><small>${u ? esc(u.name) : "Add unit & dates"}</small>`}</div>
            ${btn("Submit", { attrs: `data-save ${ok ? "" : "disabled"}` })}
          </section>
          <p class="bkn-note">${icon("info", 14, "#8A847A")}BCM approves every check-in before arrival.</p>
        </div>
      </div>`;
  }
  function refresh() { const s = c.querySelector("[data-save]"); if (s) s.disabled = !valid(); }
  function addFile(i, file) {
    const g = F.guests[i]; F.err["g" + i] = "";
    if (g.docs.length >= 2) { F.err["g" + i] = "Up to 2 files per guest."; return; }
    if (!(/^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name)) || /pdf/i.test(file.type)) { F.err["g" + i] = "Only JPG, JPEG or PNG images. PDF isn’t allowed."; return; }
    if (file.size > MAXF) { F.err["g" + i] = "This file is over 5 MB. Please choose a smaller image."; return; }
    let url = null; try { url = URL.createObjectURL(file); } catch (x) {}
    g.docs.push({ name: file.name, size: file.size >= 1048576 ? (file.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(file.size / 1024)) + " KB", url });
  }
  function idSheet(i) {
    const g = F.guests[i]; if (!g) return;
    const m = modal(`${head(`${g.name.trim() || (i === 0 ? "Main guest" : `Guest ${i + 1}`)} · ID`, "Passport or Emirates ID · JPG or PNG · up to 2 files, 5 MB each")}<div data-idb></div>${btn("Done", { attrs: "data-x data-done" })}`, "bkw-dlg--id");
    const box = m.querySelector("[data-idb]");
    const paint = () => {
      const e = F.err["g" + i];
      box.innerHTML = `<div class="bkn-idl">${g.docs.map((d, j) => `<div class="bkn-idr"><span class="bkn-idt">${d.url ? `<img src="${d.url}" alt="">` : icon("id", 22, "#922A22")}</span><span class="bkn-idn"><b>${esc(d.name)}</b><small>${esc(d.size || "")}</small></span><button type="button" data-rm="${j}" aria-label="Remove ${esc(d.name)}">${icon("x", 16, "#54504A")}</button></div>`).join("")}</div>
        ${g.docs.length < 2 ? `<label class="bkn-drop">${icon("download", 22, "#922A22")}<b>${g.docs.length ? "Add back side" : "Upload ID"}</b><small>Click to choose a photo · JPG or PNG, max 5 MB</small><input type="file" accept="image/jpeg,image/png" data-file></label><button type="button" class="bkn-smp" data-sample>Use a sample file</button>` : ""}
        ${e ? `<p class="ap-err" role="alert">${esc(e)}</p>` : ""}`;
    };
    paint();
    const done = () => { m.close(); draw(); };
    m.addEventListener("bkw-close", done);
    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-x]")) return done();
      const r = e.target.closest("[data-rm]"); if (r) { g.docs.splice(+r.dataset.rm, 1); F.err["g" + i] = ""; return paint(); }
      if (e.target.closest("[data-sample]")) { const f = g.name.trim().split(/\s+/)[0] || `Guest${i + 1}`; g.docs.push({ name: `${g.docs.length ? "ID_back_" : i % 2 ? "Emirates_ID_" : "Passport_"}${f}.jpg`, size: `${(1.2 + i * 0.3).toFixed(1)} MB`, url: null }); F.err["g" + i] = ""; paint(); }
    });
    m.addEventListener("change", (e) => { const f = e.target.closest("[data-file]"); if (f && f.files && f.files[0]) { addFile(i, f.files[0]); paint(); } });
  }
  function pickUnit() {
    const m = modal(`${head("Select unit")}<div class="bkw-pl">${st.units().map((u) => `<button type="button" class="bkw-pi${F.unit === u.id ? " is-on" : ""}" data-u="${u.id}" aria-pressed="${F.unit === u.id}"><img src="${photo(u.id)}" alt="" onerror="this.style.visibility='hidden'"><span><b>${esc(u.name)}</b><small>${esc(u.community)} · ${esc(u.code)}</small></span>${F.unit === u.id ? icon("check", 20, "#922A22") : ""}</button>`).join("")}</div>`, "bkw-dlg--pick");
    m.addEventListener("bkw-close", () => m.close());
    m.addEventListener("click", (e) => { if (e.target.closest("[data-x]")) return m.close(); const b = e.target.closest("[data-u]"); if (b) { F.unit = b.dataset.u; m.close(); draw(); } });
  }
  draw();
  c.addEventListener("click", (e) => {
    if (e.target.closest("[data-unitpick]")) return pickUnit();
    const pk = e.target.closest("[data-pick]");
    if (pk) {
      const w = pk.dataset.pick;
      (w === "from" ? calendar({ title: "Check-in date", min: st.TODAY, value: F.from, field: "Check-in", save: "Done" })
        : calendar({ title: "Check-out date", min: F.from, value: F.to, field: "Check-out", save: "Done", from: F.from }))
        .then((d) => { if (!d) return; if (w === "from") { F.from = d; if (F.to && F.to < d) F.to = null; } else F.to = d; draw(); });
      return;
    }
    if (e.target.closest("[data-gp]")) { if (F.guests.length < 10) { F.guests.push({ name: "", docs: [] }); draw(); } return; }
    if (e.target.closest("[data-gm]")) { if (F.guests.length > 1) { F.guests.pop(); draw(); } return; }
    const ids = e.target.closest("[data-idsheet]"); if (ids) return idSheet(+ids.dataset.idsheet);
    if (e.target.closest("[data-sn]")) { F.special = !F.special; draw(); if (F.special) { const t = c.querySelector("[data-cm]"); if (t) t.focus(); } return; }
    if (e.target.closest("[data-save]") && valid()) {
      const b = st.addBooking({ unit: F.unit, guests: F.guests.map((g) => ({ name: g.name.trim().replace(/\s+/g, " "), docs: g.docs.map((d) => ({ name: d.name })) })), checkIn: F.from, checkOut: F.to, special: F.special, comments: F.special ? F.comments.trim() : "" });
      success("Check-in request submitted", "Awaiting approval from BCM. You’ll find it in Bookings.", [["list", "Go to Bookings", "ghost"], ["view", "View booking"]])
        .then((v) => { location.hash = v === "view" ? `/app/bookings/${b.id}` : "/app/bookings"; });
    }
  });
  c.addEventListener("input", (e) => {
    const nm = e.target.closest("[data-gname]");
    if (nm) { const i = +nm.dataset.gname; F.guests[i].name = nm.value; const av = nm.closest(".bkn-g").querySelector(".bkn-av"); if (av) av.textContent = nm.value.trim() ? initials(nm.value) : i + 1; refresh(); return; }
    const cm = e.target.closest("[data-cm]"); if (cm) { F.comments = cm.value; const cc = c.querySelector("[data-cc]"); if (cc) cc.textContent = `${cm.value.length} / 500`; refresh(); }
  });
  return { title: "New check-in", cleanup: () => { sh.cleanup(); document.querySelectorAll(".bkw-ov").forEach((m) => m.remove()); } };
}
