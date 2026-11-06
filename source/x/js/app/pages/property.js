/* Property details — by role and unit status (same rules as mobile):
   Tenant  : contract (Expiring soon · Renew · contract PDF) · owner name · move-out
   Owner   : status chip + switcher dots; pending / vacant / resident / rented /
             holiday home cards + documents · owner details (share %, Primary) ·
             payments (Upcoming / History) · move-out only when resident
   Agent   : chip from bookings (Guest checked in / No guest) · owner name ·
             agreement with owner + holiday home permit · move-out */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, rows, eyebrow, docRows, hint, btn, segmented, unitIcon, avatar, tile, secH, irows, ikv, facts, tip } from "bloom:/js/app/ui.js";
import { toast } from "bloom:/js/app/shell.js";
import { doCheckout, doExtend } from "bloom:/js/app/pages/bookings.js";

const OMAR = "Omar Al Suwaidi";

export function page({ shell, b }) {
  const sh = shell({ active: "properties", title: "Property details", back: "#/app" });
  const c = sh.content;
  let cur = st.units().some((u) => u.id === b) ? b : st.units()[0].id;
  let payTab = "up", shot = 0;

  const card = (inner, cls = "") => `<section class="ap-card ${cls}">${inner}</section>`;
  const endTxt = (end) => { const l = st.daysTo(end); return esc(st.fmt(end)) + (l >= 0 && l <= 60 ? ` <span class="ap-warn">· ${l} days left</span>` : ""); };
  const docs = (l) => card(secH("folder", "Documents") + `<div class="ap-docs ap-docs--box">${docRows(l)}</div>`);

  function ownerCard(u) {
    if (!st.isOwner()) return card(secH("user", "Owner details") + `<div class="pd-owners"><div class="pd-own">${avatar(u.ownerName || OMAR)}<span class="pd-ot"><b>${esc(u.ownerName || OMAR)}</b><small>Owner</small></span></div></div>`);
    return card(secH("user", "Owner details") + `<div class="pd-owners">${u.own.owners.map((o) => `<div class="pd-own">${avatar(o[0])}<span class="pd-ot"><b>${esc(o[0])}</b><small>Ownership share ${o[1]}%</small></span>${o[2] ? '<span class="pd-prim">Primary</span>' : ""}</div>`).join("")}</div>`);
  }
  function payments(u) {
    const o = u.own;
    let up, hist;
    if (o.status === "pending") {
      up = [["Instalment 8 of 10", `Due ${st.fmt(o.next)}`, "AED 96,500", "Due", "amber"], ["Instalment 9 of 10", "Due 15 Feb 2027", "AED 96,500", "Scheduled", "grey"], ["Instalment 10 of 10 · handover", "Due 15 May 2027", "AED 96,500", "Scheduled", "grey"]];
      hist = [["Instalment 7 of 10", "Paid 15 Aug 2026", "AED 96,500", "Paid", "green"], ["Instalment 6 of 10", "Paid 15 May 2026", "AED 96,500", "Paid", "green"], ["Instalment 5 of 10", "Paid 15 Feb 2026", "AED 96,500", "Paid", "green"]];
    } else {
      const sc = { resident: "AED 7,840", rented: "AED 4,120", holiday: "AED 2,360", vacant: "AED 6,980" }[o.status] || "AED 4,000";
      up = [["Service charge · Q1 2027", "Due 1 Jan 2027", sc, "Upcoming", "grey"]];
      hist = [["Service charge · Q4 2026", "Paid 1 Oct 2026", sc, "Paid", "green"], ["Service charge · Q3 2026", "Paid 1 Jul 2026", sc, "Paid", "green"], ["Final payment", `Paid ${st.fmt(o.handover || new Date(2023, 11, 10))}`, "Fully paid", "Paid", "green"]];
    }
    const L = payTab === "up" ? up : hist;
    return card(secH("card", "Payments") + segmented([["up", "Upcoming"], ["hist", "History"]], payTab, "data-ptab") +
      `<div class="pd-pl">${L.map((x) => `<div class="pd-pr"><span class="pd-pt"><b>${esc(x[0])}</b><small>${esc(x[1])}</small></span><span class="pd-pa"><b>${esc(x[2])}</b>${pill(x[3], x[4])}</span></div>`).join("")}</div>`);
  }
  function statusCards(u) {
    const o = u.own, spa = ["Sales and Purchase Agreement", `PDF · signed ${st.fmt(o.spa)}`];
    if (o.status === "pending") return card(secH("coins", "Payment summary") +
      `<div class="pd-prog"><div class="pd-prog-h"><span>Payment completed</span><b>${o.paidPct}%</b></div><div class="pd-bar"><i style="width:${o.paidPct}%"></i></div></div>` +
      ikv([["coins", "Amount outstanding", o.outstanding], ["cal", "Next due date", st.fmt(o.next)]], "ud-kv--2") + hint("Handover after payment is complete.")) + docs([spa]);
    if (o.status === "vacant") return card(secH("house", "Occupancy") + `<div class="pd-occ">${tile("home", "#6B665C", "rgba(28,28,26,.06)")}<span class="pd-ot"><b>Unit is vacant</b><small>Handed over ${st.fmt(o.handover)}</small></span>${pill("Fully paid", "green")}</div>`) +
      docs([spa, ["Handover documents", `PDF · ${st.fmt(o.handover)}`]]);
    if (o.status === "resident") return card(secH("house", "Occupancy") + `<div class="pd-occ">${tile("home")}<span class="pd-ot"><b>You live here</b><small>Moved in on ${st.fmt(o.moveIn)}</small></span></div>`) + docs([spa]);
    if (o.status === "rented") { const t = o.tenancy; return card(secH("doc", "Tenancy contract", pill(t.status, t.tone)) + ikv([["user", "Tenant name", t.tenant], ["hash", "Contract no.", t.no]], "ud-kv--2")) +
      docs([spa, ["Tenancy contract", `PDF · signed ${st.fmt(t.start)}`]]); }
    if (o.status === "holiday") return card(secH("key", "Holiday home") + ikv([["user", "Agent", o.agent], ["brief", "Company", o.company]], "ud-kv--2")) + docs([spa, ["Tenancy contract", `PDF · signed ${st.fmt(o.hhContract)}`]]);
    return "";
  }
  function tenantContract(u) {
    const k = u.contract, ended = st.daysTo(k.end) < 0;
    return card(secH("doc", "Tenancy contract", pill(k.status, k.tone)) +
      ikv([["hash", "Contract no.", k.no], ["file", "Ejari no.", k.ejari],
        k.rent ? ["coins", "Annual rent", k.rent] : null, k.payment ? ["receipt", "Payment", k.payment] : null, k.deposit ? ["lock", "Security deposit", k.deposit] : null], "ud-kv--2") +
      (ended && !u.upcoming ? `<div class="pd-ctr-btns">${btn("Renew contract", { attrs: "data-renew" })}</div>` : ""));
  }
  function moveoutCard(u) {
    if (!st.canMoveOut(u)) return "";
    const r = st.moveout(u.id);
    let h = secH("exit", "Move-out");
    if (!r) {
      const sub = st.isOwner() ? "Submit a move-out request with Bloom GPT. BCM reviews it and confirms your date." : "Submit a move-out request with Bloom GPT. We’ll ask the owner for the NOC, then BCM reviews it.";
      h += `<div class="pd-mo-h"><span class="pd-ot"><b class="ap-h3">Moving out of ${esc(u.name)}?</b><small>${sub}</small></span></div>` + tip("Pick a date at least 3 days from today.") + btn("Request move-out", { kind: "ghost", attrs: "data-mo-start" });
    } else {
      const s = st.MO_ST[r.status], closed = ["nocRejected", "bcmRejected"].includes(r.status);
      h += `<div class="pd-mo-h"><span class="pd-ot"><b class="ap-h3">Move-out request · ${esc(r.id)}</b><small>Move-out on ${esc(st.fmtS(r.date))}</small>${pill(s.pill, s.tone)}</span></div>` +
        (closed ? `<div class="ap-btns">${btn("Track request", { kind: "ghost", href: `#/app/moveout/${u.id}` })}${btn("New request", { attrs: "data-mo-new" })}</div>` : btn("Track request", { href: `#/app/moveout/${u.id}` }));
    }
    return card(h);
  }

  function moveinCard(u) {
    if (!st.canMoveIn(u)) return "";
    const r = st.movein(u.id), t = (x) => tile("enter", "#2E7D5B", "rgba(46,125,91,.1)");
    let h = secH("enter", "Move-in");
    if (!r) {
      const sub = st.isOwner() ? "Book your move-in with Bloom GPT. Upload your title deed and Emirates ID, then BCM confirms your slot and access cards." : `Your tenancy starts on ${st.fmt(u.contract.start)}. Book your move-in with Bloom GPT — you’ll need your Ejari certificate and Emirates ID.`;
      h += `<div class="pd-mo-h"><span class="pd-ot"><b class="ap-h3">Moving in to ${esc(u.name)}?</b><small>${sub}</small></span></div>` + tip("Pick a date at least 3 days from today.") + btn("Request move-in", { kind: "ghost", attrs: "data-mi-start" });
    } else {
      const s = st.MI_ST[r.status], closed = ["docsRejected", "bcmRejected"].includes(r.status);
      h += `<div class="pd-mo-h"><span class="pd-ot"><b class="ap-h3">Move-in request · ${esc(r.id)}</b><small>Move-in on ${esc(st.fmtS(r.date))}</small>${pill(s.pill, s.tone)}</span></div>` +
        (closed ? `<div class="ap-btns">${btn("Track request", { kind: "ghost", href: `#/app/movein/${u.id}` })}${btn("New request", { attrs: "data-mi-new" })}</div>` : btn("Track request", { href: `#/app/movein/${u.id}` }));
    }
    return card(h);
  }

  function keyCard(u) {
    const warn = (d) => (st.daysTo(d) <= 60 ? " is-warn" : "");
    let a, b;
    if (st.isOwner()) {
      const o = u.own;
      if (o.status === "pending") { a = ["Payment completed", `${o.paidPct}%`]; b = ["Next due date", st.fmt(o.next), warn(o.next)]; }
      else if (o.status === "rented") { a = ["Start date", st.fmt(o.tenancy.start)]; b = ["End date", st.fmt(o.tenancy.end), warn(o.tenancy.end)]; }
      else if (o.status === "vacant") { a = ["Handed over", st.fmt(o.handover)]; b = ["Status", "Vacant"]; }
      else if (o.status === "resident") { a = ["Moved in", st.fmt(o.moveIn)]; b = ["Status", "Resident"]; }
      else { a = ["Holiday home since", st.fmt(o.hhContract)]; b = ["Agent", o.agent]; }
    } else if (st.isAgent()) { a = ["Agreement signed", st.fmt(u.agreement)]; b = ["Permit valid until", st.fmt(u.permit.until), warn(u.permit.until)]; }
    else { const k = u.contract; a = ["Start date", st.fmt(k.start)]; b = ["End date", st.fmt(k.end), u.upcoming ? "" : warn(k.end)]; }
    return `<section class="ap-card ud-key"><div><small>${esc(a[0])}</small><b>${esc(a[1])}</b></div><div><small>${esc(b[0])}</small><b class="${b[2] || ""}">${esc(b[1])}</b></div></section>`;
  }

  function guestCard(u) {
    const act = st.activeFor(u.id);
    if (!act) {
      const nx = st.nextFor(u.id);
      return card(secH("key", "Guest details", pill("No Guest", "grey")) + `<p class="ud-occ"><b>No guest checked in</b><small>${nx ? `Next: ${esc(st.fmtS(nx.checkIn))} → ${esc(st.fmtS(nx.checkOut))} · ${esc(nx.status)}` : "The unit is free for a new stay."}</small></p>` + btn("Check-in a guest", { attrs: "data-g-in" }));
    }
    const inH = st.day0(act.checkIn) <= st.TODAY, ext = act.ext, pend = ext && ext.st === "pending";
    return card(secH("key", "Guest details", pill(inH ? "Guest Checked In" : `Arriving ${st.fmtS(act.checkIn)}`, inH ? "green" : "blue")) +
      `<a class="ud-gst" href="#/app/bookings/${act.id}">${avatar(act.guests[0].name)}<span><b>${esc(act.guests[0].name)}</b><small>${act.id} · ${st.gTxt(act.guests.length)}</small></span>${icon("chev", 18, "#8A847A")}</a>` +
      ikv([["calendar", "Check-in date", st.fmt(act.checkIn)], ["logout", "Check-out date", st.fmt(act.checkOut)]], "ud-kv--2") +
      (pend ? `<p class="ud-gext" data-tone="amber"><b>Extension Submitted</b><small>Requested ${esc(st.fmtS(ext.date))} · awaiting BCM</small></p>` : "") +
      (ext && ext.st === "rejected" ? `<p class="ud-gext" data-tone="red"><b>Extension rejected</b><small>${esc(ext.reason)}</small></p>` : "") +
      `<div class="ap-btns">${pend ? "" : btn("Extend Stay", { kind: "ghost", attrs: "data-g-ext" })}${btn("Check-out", { attrs: "data-g-out" })}</div>`);
  }

  function draw(fade) {
    const list = st.units(), u = st.unit(cur), s = st.unitStatus(u);
    const switcher = false ? `<div class="pd-units" role="group" aria-label="Your properties">${list.map((x) => { const xs = st.unitStatus(x); return `<button type="button" class="pd-unit" data-u="${x.id}" aria-pressed="${x.id === u.id}"${xs ? ` aria-label="${esc(x.name + ", " + st.ST_LABEL[xs])}"` : ""}><i>${icon(unitIcon(x), 15)}</i>${esc(x.name)}${xs ? `<b class="pd-dot" data-tone="${st.ST_TONE[xs]}" aria-hidden="true"></b>` : ""}</button>`; }).join("")}</div>` : "";
    const imgs = st.unitImgs(u, 1400); if (shot >= imgs.length) shot = 0;
    const header = `<section class="ud-hero" aria-label="Photos of ${esc(u.name)}">
        <div class="ud-shots" style="--i:${shot}">${imgs.map((src, i) => `<span class="ud-shot">${icon(unitIcon(u), 40, "#922A22")}<img src="${src}" alt="" loading="${i ? "lazy" : "eager"}" onerror="this.remove()"></span>`).join("")}</div>
        <div class="ud-dots" role="tablist" aria-label="Photo">${imgs.map((_, i) => `<button type="button" role="tab" data-shot="${i}" aria-selected="${i === shot}" aria-label="Photo ${i + 1} of ${imgs.length}"></button>`).join("")}</div>
        ${s ? `<span class="ud-chip">${pill(st.ST_LABEL[s], st.ST_TONE[s])}</span>` : ""}
      </section>
      <div class="ud-title"><h2>${esc(u.address)}</h2><p>${esc(u.community)}</p></div>`;
    const key = keyCard(u);
    const prop = card(secH("building", "About unit") + facts([[u.icon === "building" ? "apt" : "house", u.type, "Property type"], ["tag", u.code, "Unit code"]]));
    let side;
    if (st.isOwner()) side = statusCards(u) + ownerCard(u) + payments(u);
    else if (st.isAgent()) side = guestCard(u) + ownerCard(u) + docs([["Agreement with owner", `PDF · signed ${st.fmt(u.agreement)}`], ["Holiday home permit", `PDF · ${u.permit.no} · valid until ${st.fmt(u.permit.until)}`]]);
    else side = tenantContract(u) + ownerCard(u) + docs([["Tenancy contract", `PDF · signed ${st.fmt(u.upcoming ? st.addDays(st.TODAY, -6) : u.contract.start)}`]]);
    c.innerHTML = `${switcher}<div class="pd-grid ud ${fade ? "is-fade" : ""}"><div class="pd-col">${header}${key}${prop}</div><div class="pd-col">${side}${moveinCard(u)}${moveoutCard(u)}</div></div>`;
  }
  draw(false);

  c.addEventListener("click", (e) => {
    const ub = e.target.closest("[data-u]");
    if (ub && ub.dataset.u !== cur) { cur = ub.dataset.u; payTab = "up"; shot = 0; history.replaceState(null, "", `#/app/property/${cur}`); draw(true); return; }
    const sb = e.target.closest("[data-shot]"); if (sb) { shot = +sb.dataset.shot; c.querySelector(".ud-shots").style.setProperty("--i", shot); c.querySelectorAll("[data-shot]").forEach((x) => x.setAttribute("aria-selected", x === sb)); return; }
    const pt = e.target.closest("[data-ptab]"); if (pt) { payTab = pt.dataset.ptab; draw(false); return; }
    if (e.target.closest("[data-renew]")) { st.setIntent({ type: "renew", src: "property", unit: cur }); location.hash = "/app/gpt"; return; }
    if (e.target.closest("[data-mo-start]")) { st.setIntent({ type: "moveout", unit: cur }); location.hash = "/app/gpt"; return; }
    if (e.target.closest("[data-mi-start]")) { st.setIntent({ type: "movein", unit: cur }); location.hash = "/app/gpt"; return; }
    if (e.target.closest("[data-mi-new]")) { st.setMovein(cur, null); st.setIntent({ type: "movein", unit: cur }); location.hash = "/app/gpt"; return; }
    if (e.target.closest("[data-mo-new]")) { st.setMoveout(cur, null); st.setIntent({ type: "moveout", unit: cur }); location.hash = "/app/gpt"; return; }
    if (e.target.closest("[data-g-in]")) { location.hash = `/app/bookings/new?unit=${cur}`; return; }
    if (e.target.closest("[data-g-ext]")) { doExtend(st.activeFor(cur)); return; }
    if (e.target.closest("[data-g-out]")) { doCheckout(st.activeFor(cur)); return; }
    const d = e.target.closest("[data-doc]"); if (d) toast(`Prototype: ${d.dataset.doc} (PDF) opens here.`);
  });
  const off = st.on((w) => { if (w === "bookings" || w === "moveout" || w === "movein") draw(false); });
  return { title: "Property details", cleanup: () => { off(); sh.cleanup(); } };
}
