/* Move-out request details — progress (request → owner NOC → BCM approval;
   owners living in the unit skip the NOC), status note, details, and a
   prototype strip to preview status updates. */

import * as st from "bloom:/js/app/store.js";
import { esc, pill, rows, eyebrow, btn, tile } from "bloom:/js/app/ui.js";
import { timeline } from "bloom:/js/app/pages/requests.js";
import { toast } from "bloom:/js/app/shell.js";

export function page({ shell, b }) {
  const u = st.unit(b);
  const sh = shell({ active: "properties", title: "Move-out request", back: `#/app/property/${u.id}` });
  const c = sh.content;
  function draw() {
    const r = st.moveout(u.id);
    if (!r) { c.innerHTML = `<div class="ap-empty">${tile("exit")}<b>No move-out request for ${esc(u.name)}</b><span>Start one with Bloom GPT from Property details.</span>${btn("Go to property details", { href: `#/app/property/${u.id}` })}</div>`; return; }
    const s = st.MO_ST[r.status], own = !r.noc;
    const steps = own
      ? [["Request submitted", st.fmt(r.submitted), "d"], ["BCM approval", r.status === "submitted" ? "Waiting for BCM review" : s.sub[2], r.status === "submitted" ? "c" : s.steps[2]]]
      : [["Request submitted", st.fmt(r.submitted), "d"], ["Owner NOC", s.sub[1], s.steps[1]], ["BCM approval", s.sub[2], s.steps[2]]];
    const note = own && r.status === "submitted" ? { t: "Move-out request submitted", p: "BCM will review your request and confirm your date." } : s.note;
    const closed = ["nocRejected", "bcmRejected"].includes(r.status);
    c.innerHTML = `
      <div class="rq-grid">
        <div class="pd-col">
          <section class="ap-card ap-sum">${tile("exit")}<span class="ap-sum-t"><b class="ap-h2">Move-out request</b><small>Ref #${esc(r.id)} · ${esc(u.name)}</small></span>${pill(s.pill, s.tone)}</section>
          <section class="ap-card">${eyebrow("PROGRESS")}${timeline(steps)}
            <div class="ap-note"><b>${esc(note.t)}</b><p>${esc(note.p)}</p>${closed ? `<div class="ap-btns">${btn("Contact support", { kind: "ghost", href: "#/app/contact" })}${btn("New request", { attrs: "data-new" })}</div>` : r.status === "needInfo" ? btn("Provide information", { attrs: "data-info" }) : ""}</div>
          </section>
        </div>
        <div class="pd-col">
          <section class="ap-card">${eyebrow("DETAILS")}${rows([["Unit", `${u.name} · ${u.community}`], ["Move-out date", st.fmt(r.date)], own ? null : ["Owner NOC", r.noc], ["Movers & packers", r.movers ? `Yes · ${r.company}` : "No"], ["Special needs", r.notes || "—"], ["Submitted", st.fmt(r.submitted)]])}</section>
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
  return { title: "Move-out request", cleanup: () => { off(); sh.cleanup(); } };
}
