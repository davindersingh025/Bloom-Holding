/* Move-in request details — progress (request → documents → BCM approval),
   status note, details, and a prototype strip to preview status updates. */

import * as st from "bloom:/js/app/store.js";
import { esc, pill, rows, eyebrow, btn, tile } from "bloom:/js/app/ui.js";
import { timeline } from "bloom:/js/app/pages/requests.js";
import { toast } from "bloom:/js/app/shell.js";

export function page({ shell, b }) {
  const u = st.unit(b);
  const sh = shell({ active: "properties", title: "Move-in request", back: `#/app/property/${u.id}` });
  const c = sh.content;
  function draw() {
    const r = st.movein(u.id);
    if (!r) { c.innerHTML = `<div class="ap-empty">${tile("enter", "#2E7D5B", "rgba(46,125,91,.1)")}<b>No move-in request for ${esc(u.name)}</b><span>Start one with Bloom GPT from Property details.</span>${btn("Go to property details", { href: `#/app/property/${u.id}` })}</div>`; return; }
    const s = st.MI_ST[r.status];
    const steps = [["Request submitted", st.fmt(r.submitted), "d"], ["Documents", s.sub[1], s.steps[1]], ["BCM approval", s.sub[2], s.steps[2]]];
    const closed = ["docsRejected", "bcmRejected"].includes(r.status), ok = r.status === "bcmApproved";
    c.innerHTML = `
      <div class="rq-grid">
        <div class="pd-col">
          <section class="ap-card ap-sum">${tile("enter", "#2E7D5B", "rgba(46,125,91,.1)")}<span class="ap-sum-t"><b class="ap-h2">Move-in request</b><small>Ref #${esc(r.id)} · ${esc(u.name)}</small></span>${pill(s.pill, s.tone)}</section>
          <section class="ap-card">${eyebrow("PROGRESS")}${timeline(steps)}
            <div class="ap-note"><b>${esc(s.note.t)}</b><p>${esc(s.note.p)}</p>${closed ? `<div class="ap-btns">${btn("Contact support", { kind: "ghost", href: "#/app/contact" })}${btn("New request", { attrs: "data-new" })}</div>` : r.status === "needInfo" ? btn("Provide information", { attrs: "data-info" }) : ok ? btn("Get directions to the community office", { kind: "ghost", attrs: "data-dir" }) : ""}</div>
          </section>
          ${ok ? `<section class="ap-card">${eyebrow("MOVE-IN DAY")}${rows([["Arrive", `${st.fmtS(r.date)} · 8 am – 6 pm`], ["Service lift", r.notes ? "Booked" : "Available on request"], ["Access cards", `${r.people} ready to collect`], ["Bring", "Emirates ID"]])}</section>` : ""}
        </div>
        <div class="pd-col">
          <section class="ap-card">${eyebrow("DETAILS")}${rows([["Unit", `${u.name} · ${u.community}`], ["Move-in date", st.fmt(r.date)], [r.deedLabel || "Ejari certificate", r.deed], ["Emirates ID", r.eid], ["People moving in", String(r.people)], ["Movers & packers", r.movers ? `Yes · ${r.company}` : "No"], ["DEWA", r.dewa], ["Special needs", r.notes || "—"], ["Submitted", st.fmt(r.submitted)]])}</section>
          <section class="ap-demo"><p class="ap-eyebrow">PROTOTYPE · PREVIEW STATUS UPDATES</p><div class="ap-chips">${st.MI_ORDER.map((k) => `<button type="button" class="ap-chip" data-st="${k}" aria-pressed="${k === r.status}">${esc(st.MI_ST[k].pill)}</button>`).join("")}</div></section>
        </div>
      </div>`;
  }
  draw();
  c.addEventListener("click", (e) => {
    const r = st.movein(u.id); if (!r) return;
    const k = e.target.closest("[data-st]"); if (k) { r.status = k.dataset.st; st.setMovein(u.id, r); return; }
    if (e.target.closest("[data-new]")) { st.setMovein(u.id, null); st.setIntent({ type: "movein", unit: u.id }); location.hash = "/app/gpt"; }
    if (e.target.closest("[data-info]")) toast("Prototype: share your DEWA premise number and occupant names here.");
    if (e.target.closest("[data-dir]")) toast("Prototype: directions to the community office open in Maps.");
  });
  const off = st.on((w) => w === "movein" && draw());
  return { title: "Move-in request", cleanup: () => { off(); sh.cleanup(); } };
}
