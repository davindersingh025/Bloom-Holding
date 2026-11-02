/* Move-out request tracking — same as the mobile "Request #MO-…" screen:
   summary (Move-out request · Ref · status pill), progress (Request submitted →
   In review → BCM approval; owners living in the unit skip the NOC review),
   actions for the status (Provide information · Contact support / Raise SR /
   New request) and the request details. A prototype strip previews statuses. */

import * as st from "bloom:/js/app/store.js";
import { esc, pill, eyebrow, btn, tile, icon, irows } from "bloom:/js/app/ui.js";
import { timeline } from "bloom:/js/app/pages/requests.js";
import { toast } from "bloom:/js/app/shell.js";

export function page({ shell, b }) {
  const u = st.unit(b);
  const r0 = st.moveout(u.id);
  const sh = shell({ active: "properties", title: r0 ? `Request #${r0.id}` : "Move-out request", back: `#/app/property/${u.id}` });
  const c = sh.content;
  function draw() {
    const r = st.moveout(u.id);
    if (!r) { c.innerHTML = `<div class="ap-empty">${tile("exit")}<b>No move-out request for ${esc(u.name)}</b><span>Start one with Bloom GPT from Property details.</span>${btn("Go to property details", { href: `#/app/property/${u.id}` })}</div>`; return; }
    const s = st.MO_ST[r.status], own = !r.noc;
    const steps = own
      ? [["Request submitted", `Submitted on ${st.fmt(r.submitted)}`, "d"], ["BCM approval", r.status === "submitted" ? "Waiting for BCM approval" : s.sub[2], r.status === "submitted" ? "c" : s.steps[2]]]
      : [["Request submitted", `Submitted on ${st.fmt(r.submitted)}`, "d"], ["In review", s.sub[1], s.steps[1]], ["BCM approval", s.sub[2], s.steps[2]]];
    const closed = ["nocRejected", "bcmRejected"].includes(r.status);
    const acts = closed
      ? `<div class="mo-acts"><div class="ap-btns">${btn("Contact support", { kind: "ghost", href: "#/app/contact" })}${btn("Raise SR", { kind: "ghost", href: "#/app/requests/new?scope=unit" })}</div>${btn("New request", { attrs: "data-new" })}</div>`
      : r.status === "needInfo" ? `<div class="mo-acts">${btn("Provide information", { attrs: "data-info" })}</div>` : "";
    c.innerHTML = `
      <div class="rq-grid">
        <div class="pd-col">
          <section class="ap-card ap-sum">${tile("exit")}<span class="ap-sum-t"><b class="ap-h2">Move-out request</b><small>Ref #${esc(r.id)} · Move-out</small></span>${pill(s.pill, s.tone)}</section>
          <section class="ap-card">${eyebrow("PROGRESS")}<div class="ap-tl-mo">${timeline(steps)}</div>${acts}</section>
        </div>
        <div class="pd-col">
          <section class="ap-card">${irows([["community", "Unit", `${u.name} · ${u.community}`], ["cal", "Move-out date", `<span class="mo-lock">${icon("lock", 15, "#54504A")}${esc(st.fmt(r.date))}</span>`, true], ["truck", "Movers & packers", r.movers ? "Yes" : "No"], r.movers ? ["brief", "Movers company", r.company] : null, ["chat", "Special needs", r.notes || "—"], ["calendar", "Submitted on", st.fmt(r.submitted)]])}</section>
          <section class="ap-demo"><p class="ap-eyebrow">PROTOTYPE · PREVIEW STATUS UPDATES</p><div class="ap-chips">${st.MO_ORDER.filter((k) => !own || !k.startsWith("noc")).map((k) => `<button type="button" class="ap-chip" data-st="${k}" aria-pressed="${k === r.status}">${esc(st.MO_ST[k].pill)}</button>`).join("")}</div></section>
        </div>
      </div>`;
  }
  draw();
  c.addEventListener("click", (e) => {
    const r = st.moveout(u.id); if (!r) return;
    const k = e.target.closest("[data-st]"); if (k) { r.status = k.dataset.st; st.setMoveout(u.id, r); return; }
    if (e.target.closest("[data-new]")) { st.setMoveout(u.id, null); st.setIntent({ type: "moveout", unit: u.id }); location.hash = "/app/gpt"; }
    if (e.target.closest("[data-info]")) toast("Prototype: upload your final DEWA bill here.");
  });
  const off = st.on((w) => w === "moveout" && draw());
  return { title: r0 ? `Request #${r0.id}` : "Move-out request", cleanup: () => { off(); sh.cleanup(); } };
}
