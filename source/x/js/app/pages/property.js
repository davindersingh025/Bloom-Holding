/* Property details — by role and unit status (same rules as mobile):
   Tenant  : contract (Expiring soon · Renew · contract PDF) · owner name · move-out
   Owner   : status chip + switcher dots; pending / vacant / resident / rented /
             holiday home cards + documents · owner details (share %, Primary) ·
             payments (Upcoming / History) · move-out only when resident
   Agent   : chip from bookings (Guest checked in / No guest) · owner name ·
             agreement with owner + holiday home permit · move-out */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, rows, eyebrow, docRows, hint, btn, segmented, unitIcon, avatar, tile } from "bloom:/js/app/ui.js";
import { toast } from "bloom:/js/app/shell.js";

const OMAR = "Omar Al Suwaidi";

export function page({ shell, b }) {
  const sh = shell({ active: "properties", title: "Property details", back: "#/app" });
  const c = sh.content;
  let cur = st.units().some((u) => u.id === b) ? b : st.units()[0].id;
  let payTab = "up";

  const card = (inner, cls = "") => `<section class="ap-card ${cls}">${inner}</section>`;
  const endTxt = (end) => { const l = st.daysTo(end); return esc(st.fmt(end)) + (l >= 0 && l <= 60 ? ` <span class="ap-warn">· ${l} days left</span>` : ""); };
  const docs = (l) => card(eyebrow("DOCUMENTS") + `<div class="ap-docs">${docRows(l)}</div>`);

  function ownerCard(u) {
    if (!st.isOwner()) return card(eyebrow("OWNER DETAILS") + rows([["Owner name", u.ownerName || OMAR]]));
    return card(eyebrow("OWNER DETAILS") + `<div class="pd-owners">${u.own.owners.map((o) => `<div class="pd-own">${avatar(o[0])}<span class="pd-ot"><b>${esc(o[0])}</b><small>Ownership share ${o[1]}%</small></span>${o[2] ? '<span class="pd-prim">Primary</span>' : ""}</div>`).join("")}</div>`);
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
    return card(eyebrow("PAYMENTS") + segmented([["up", "Upcoming"], ["hist", "History"]], payTab, "data-ptab") +
      `<div class="pd-pl">${L.map((x) => `<div class="pd-pr"><span class="pd-pt"><b>${esc(x[0])}</b><small>${esc(x[1])}</small></span><span class="pd-pa"><b>${esc(x[2])}</b>${pill(x[3], x[4])}</span></div>`).join("")}</div>`);
  }
  function statusCards(u) {
    const o = u.own, spa = ["Sales and Purchase Agreement", `PDF · signed ${st.fmt(o.spa)}`];
    if (o.status === "pending") return card(eyebrow("PAYMENT SUMMARY") +
      `<div class="pd-prog"><div class="pd-prog-h"><span>Payment completed</span><b>${o.paidPct}%</b></div><div class="pd-bar"><i style="width:${o.paidPct}%"></i></div></div>` +
      rows([["Amount outstanding", o.outstanding], ["Next due date", st.fmt(o.next)]]) + hint("Handover after payment is complete.")) + docs([spa]);
    if (o.status === "vacant") return card(eyebrow("OCCUPANCY") + `<div class="pd-occ">${tile("home", "#6B665C", "rgba(28,28,26,.06)")}<span class="pd-ot"><b>Unit is vacant</b><small>Handed over ${st.fmt(o.handover)}</small></span>${pill("Fully paid", "green")}</div>`) +
      docs([spa, ["Handover documents", `PDF · ${st.fmt(o.handover)}`]]);
    if (o.status === "resident") return card(eyebrow("OCCUPANCY") + `<div class="pd-occ">${tile("home")}<span class="pd-ot"><b>You live here</b><small>Moved in on ${st.fmt(o.moveIn)}</small></span></div>`) + docs([spa]);
    if (o.status === "rented") { const t = o.tenancy; return card(eyebrow("TENANCY CONTRACT", pill(t.status, t.tone)) + rows([["Tenant name", t.tenant], ["Contract no.", t.no], ["Start date", st.fmt(t.start)], ["End date", endTxt(t.end), true]])) +
      docs([spa, ["Tenancy contract", `PDF · signed ${st.fmt(t.start)}`]]); }
    if (o.status === "holiday") return card(eyebrow("HOLIDAY HOME") + rows([["Agent", o.agent], ["Company", o.company]])) + docs([spa, ["Tenancy contract", `PDF · signed ${st.fmt(o.hhContract)}`]]);
    return "";
  }
  function tenantContract(u) {
    const k = u.contract;
    return card(eyebrow("TENANCY CONTRACT", pill(k.status, k.tone)) +
      rows([["Contract no.", k.no], ["Ejari no.", k.ejari], ["Start date", st.fmt(k.start)], ["End date", endTxt(k.end), true]]) +
      (k.status === "Expiring soon" ? btn("Renew contract", { attrs: "data-renew" }) : "") +
      `<div class="pd-docs"><p class="ap-eyebrow">DOCUMENTS</p><div class="ap-docs">${docRows([["Tenancy contract", `PDF · signed ${st.fmt(k.start)}`]])}</div></div>`);
  }
  function moveoutCard(u) {
    if (!st.canMoveOut(u)) return "";
    const r = st.moveout(u.id);
    let h = eyebrow("MOVE-OUT");
    if (!r) {
      const sub = st.isOwner() ? "Submit a move-out request with Bloom GPT. BCM reviews it and confirms your date." : "Submit a move-out request with Bloom GPT. You’ll need the owner’s NOC to upload, then BCM reviews it.";
      h += `<div class="pd-mo-h">${tile("exit")}<span class="pd-ot"><b class="ap-h3">Moving out of ${esc(u.name)}?</b><small>${sub}</small></span></div>` + hint("Pick a date at least 3 days from today.") + btn("Request move-out", { attrs: "data-mo-start" });
    } else {
      const s = st.MO_ST[r.status], closed = ["nocRejected", "bcmRejected"].includes(r.status);
      h += `<div class="pd-mo-h">${tile("exit")}<span class="pd-ot"><b class="ap-h3">Move-out request · ${esc(r.id)}</b><small>Move-out on ${esc(st.fmtS(r.date))}</small>${pill(s.pill, s.tone)}</span></div>` +
        (closed ? `<div class="ap-btns">${btn("Track request", { kind: "ghost", href: `#/app/moveout/${u.id}` })}${btn("New request", { attrs: "data-mo-new" })}</div>` : btn("Track request", { href: `#/app/moveout/${u.id}` }));
    }
    return card(h);
  }

  function draw(fade) {
    const list = st.units(), u = st.unit(cur), s = st.unitStatus(u);
    const switcher = list.length > 1 ? `<div class="pd-units" role="group" aria-label="Your properties">${list.map((x) => { const xs = st.unitStatus(x); return `<button type="button" class="pd-unit" data-u="${x.id}" aria-pressed="${x.id === u.id}"${xs ? ` aria-label="${esc(x.name + ", " + st.ST_LABEL[xs])}"` : ""}><i>${icon(unitIcon(x), 15)}</i>${esc(x.name)}${xs ? `<b class="pd-dot" data-tone="${st.ST_TONE[xs]}" aria-hidden="true"></b>` : ""}</button>`; }).join("")}</div>` : "";
    const header = `<section class="ap-card pd-head">
        <div class="db-res-h"><span class="db-live" aria-hidden="true"></span><span class="db-comm">${esc(u.community.toUpperCase())}</span><span class="db-code">${esc(u.code)}</span></div>
        <div class="pd-head-b"><span class="pd-img" aria-hidden="true">${icon(unitIcon(u), 34, "#922A22")}<img src="${st.unitImg(u, 640)}" alt="" loading="lazy" onerror="this.remove()"></span>
        <span class="pd-head-t"><b>${esc(u.type)}</b><small>${icon("pin", 14, "#922A22")} ${esc(u.address)}</small>${s ? pill(st.ST_LABEL[s], st.ST_TONE[s], 'class="pd-chip"') : ""}</span></div></section>`;
    const prop = card(eyebrow("PROPERTY") + rows([["Property type", u.type], ["Unit", u.name], ["Community", u.community], ["Address", u.address], ["Unit code", u.code]]));
    let side;
    if (st.isOwner()) side = statusCards(u) + ownerCard(u) + payments(u);
    else if (st.isAgent()) side = ownerCard(u) + docs([["Agreement with owner", `PDF · signed ${st.fmt(u.agreement)}`], ["Holiday home permit", `PDF · ${u.permit.no} · valid until ${st.fmt(u.permit.until)}`]]);
    else side = tenantContract(u) + ownerCard(u);
    c.innerHTML = `${switcher}<div class="pd-grid ${fade ? "is-fade" : ""}"><div class="pd-col">${header}${prop}</div><div class="pd-col">${side}${moveoutCard(u)}</div></div>`;
  }
  draw(false);

  c.addEventListener("click", (e) => {
    const ub = e.target.closest("[data-u]");
    if (ub && ub.dataset.u !== cur) { cur = ub.dataset.u; payTab = "up"; history.replaceState(null, "", `#/app/property/${cur}`); draw(true); return; }
    const pt = e.target.closest("[data-ptab]"); if (pt) { payTab = pt.dataset.ptab; draw(false); return; }
    if (e.target.closest("[data-renew]")) { st.setIntent({ type: "renew", src: "property", unit: cur }); location.hash = "/app/gpt"; return; }
    if (e.target.closest("[data-mo-start]")) { st.setIntent({ type: "moveout", unit: cur }); location.hash = "/app/gpt"; return; }
    if (e.target.closest("[data-mo-new]")) { st.setMoveout(cur, null); st.setIntent({ type: "moveout", unit: cur }); location.hash = "/app/gpt"; return; }
    const d = e.target.closest("[data-doc]"); if (d) toast(`Prototype: ${d.dataset.doc} (PDF) opens here.`);
  });
  const off = st.on((w) => { if (w === "bookings" || w === "moveout") draw(false); });
  return { title: "Property details", cleanup: () => { off(); sh.cleanup(); } };
}
