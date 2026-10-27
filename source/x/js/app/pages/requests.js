/* Requests — My requests (Active / History) · New request (My unit or Common
   areas → place → category → issue type, optional description and photos)
   · Request details (progress, details, attachments). */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, rows, eyebrow, btn, segmented, tile, wait } from "bloom:/js/app/ui.js";
import { toast } from "bloom:/js/app/shell.js";

const CAT_ICON = { maintenance: "wrench", payments: "card", documents: "doc", access: "pass" };

export function page(ctx) {
  if (ctx.b === "new") return newRequest(ctx);
  if (ctx.b) return detail(ctx);
  return list(ctx);
}

/* ---------------- list ---------------- */
function list({ shell }) {
  const sh = shell({ active: "requests" });
  const c = sh.content;
  let tab = "active";
  function draw() {
    const a = st.activeRequests(), p = st.pastRequests(), L = tab === "active" ? a : p;
    c.innerHTML = `
      <div class="ap-head"><h1 class="ap-h1">My <i>requests</i></h1>${btn("New request", { href: "#/app/requests/new" })}</div>
      ${segmented([["active", "Active", a.length], ["history", "History", p.length]], tab)}
      <div class="rq-list">${L.length ? L.map((r, i) => `
        <a class="ap-card rq-card" href="#/app/requests/${r.id}" style="--i:${i}">
          <div class="rq-top">${r.status === "Rejected" ? tile(CAT_ICON[r.categoryId] || "wrench", "#54504A", "rgba(28,28,26,.06)") : tile(CAT_ICON[r.categoryId] || "wrench")}
            <span class="rq-t"><b>${esc(r.title)}</b><small>Ref #${r.id} · ${esc(r.category)}</small></span>${pill(r.status, st.REQ_STATUS[r.status])}</div>
          <span class="db-bar ${r.status === "Rejected" ? "is-grey" : ""}"><i style="width:${r.progress}%"></i></span>
          <div class="rq-meta"><span>${icon("pin", 14, "#8A847A")} ${esc(r.location)}</span><span>Submitted ${st.fmt(r.submitted)}</span></div>
        </a>`).join("") : `<div class="ap-empty">${tile("requests")}<b>${tab === "active" ? "No active requests" : "No past requests"}</b><span>Raise a request and it will show up here.</span></div>`}</div>`;
  }
  draw();
  c.addEventListener("click", (e) => { const s = e.target.closest("[data-seg]"); if (s) { tab = s.dataset.seg; draw(); } });
  const off = st.on((w) => w === "requests" && draw());
  return { title: "My requests", cleanup: () => { off(); sh.cleanup(); } };
}

export function timeline(steps) {
  const OK = '<svg class="i-ok" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';
  const X = '<svg class="i-x" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  return `<ol class="ap-tl">${steps.map((s) => `<li class="ap-step" data-s="${s[2]}"><div class="ap-rail"><span class="ap-tdot">${OK}${X}</span><span class="ap-line"></span></div><div class="ap-st"><p class="ap-st-t">${esc(s[0])}</p>${s[1] ? `<p class="ap-st-s">${esc(s[1])}</p>` : ""}</div></li>`).join("")}</ol>`;
}

/* ---------------- detail ---------------- */
function detail({ shell, b }) {
  const sh = shell({ active: "requests", title: "Request details", back: "#/app/requests" });
  const c = sh.content;
  const r = st.request(b);
  if (!r) { c.innerHTML = `<div class="ap-empty">${tile("requests")}<b>Request not found</b>${btn("Back to My requests", { href: "#/app/requests" })}</div>`; return { title: "Request", cleanup: sh.cleanup }; }
  const rej = r.status === "Rejected";
  const steps = [
    ["Submitted", `${st.fmt(r.submitted)} · received by the ${r.team}`, "d"],
    ["In progress", r.status === "In Progress" ? "A technician is assigned" : r.status === "Submitted" ? "Waiting to be assigned" : rej ? "" : "Work carried out", r.status === "In Progress" ? "c" : r.status === "Completed" ? "d" : ""],
    [rej ? "Rejected" : "Completed", rej ? "This request couldn’t be completed. Contact support for details." : r.status === "Completed" ? "Closed" : "", rej ? "x" : r.status === "Completed" ? "d" : ""],
  ];
  c.innerHTML = `
    <div class="rq-grid">
      <div class="pd-col">
        <section class="ap-card ap-sum">${tile(CAT_ICON[r.categoryId] || "wrench")}<span class="ap-sum-t"><b class="ap-h2">${esc(r.title)}</b><small>Ref #${r.id} · ${esc(r.category)}</small></span>${pill(r.status, st.REQ_STATUS[r.status])}</section>
        <section class="ap-card">${eyebrow("PROGRESS")}${timeline(steps)}</section>
      </div>
      <div class="pd-col">
        <section class="ap-card">${eyebrow("DETAILS")}${rows([["Issue type", r.subcategory], ["Location", r.location], r.preferred ? ["Preferred date", r.preferred] : null, ["Assigned to", r.team], ["Submitted", st.fmt(r.submitted)], r.via ? ["Raised via", r.via] : null])}</section>
        <section class="ap-card">${eyebrow("ISSUE")}<p class="ap-p">${esc(r.description || "No description added.")}</p>
          ${r.attachments.length ? `<p class="ap-eyebrow" style="margin-top:16px">ATTACHMENTS · ${r.attachments.length}</p><div class="rq-atts">${r.attachments.map((a) => `<button type="button" class="rq-att" data-att="${esc(a)}">${icon("camera", 18, "#922A22")}<span>${esc(a)}</span></button>`).join("")}</div>` : ""}</section>
        <div class="ap-btns">${btn("Contact support", { kind: "ghost", href: "#/app/contact" })}${btn("Ask Bloom GPT", { href: "#/app/gpt" })}</div>
      </div>
    </div>`;
  c.addEventListener("click", (e) => { const a = e.target.closest("[data-att]"); if (a) toast(`Prototype: ${a.dataset.att} opens here.`); });
  return { title: `Request ${r.id}`, cleanup: sh.cleanup };
}

/* ---------------- new request ---------------- */
function newRequest({ shell, query }) {
  const sh = shell({ active: "requests", title: "New request", back: "#/app/requests" });
  const c = sh.content;
  let scope = query.get("scope") === "common" ? "common" : "unit";
  let placeId = scope === "unit" ? st.S.lastUnit : st.S.lastCommunity;
  let catId = null, sub = null, desc = "", photos = [], tried = false;

  const place = () => st.places(scope).find((p) => p.id === placeId) || st.places(scope)[0];
  function draw() {
    const pl = st.places(scope), cats = st.catsFor(scope), cat = cats.find((x) => x.id === catId);
    const p = place(); placeId = p.id;
    c.innerHTML = `
      <div class="nr">
        <div class="nr-main">
          <section class="ap-card">
            <p class="nr-q">Do you need help with your unit or the common areas?</p>
            ${segmented([["unit", "My unit"], ["common", "Common areas"]], scope, "data-scope")}
            ${pl.length > 1 ? `<p class="nr-lab">${scope === "unit" ? "Which property?" : "Which community?"}</p><div class="nr-places" role="radiogroup">${pl.map((x) => `<button type="button" class="nr-place" role="radio" aria-checked="${x.id === p.id}" data-place="${esc(x.id)}">${icon(x.icon, 20, "#922A22")}<span class="nr-pt"><b>${esc(x.name)}</b><small>${esc(x.meta)}</small></span><span class="nr-radio">${icon("check", 12, "#fff")}</span></button>`).join("")}</div>` : `<div class="nr-one">${icon(p.icon, 20, "#922A22")}<span class="nr-pt"><b>${esc(p.name)}</b><small>${esc(p.meta)}</small></span></div>`}
          </section>
          <section class="ap-card">
            <p class="nr-lab nr-lab--top">What is it about?</p>
            <div class="nr-cats">${cats.map((x) => `<button type="button" class="nr-cat" aria-pressed="${x.id === catId}" data-cat="${x.id}"><span class="ap-tile" style="background:${x.color}14">${icon(x.icon, 20, x.color)}</span><b>${esc(x.name)}</b><small>${esc(x.tag)}</small></button>`).join("")}</div>
          </section>
          ${cat ? `
          <section class="ap-card" id="nr-issue">
            <p class="nr-lab nr-lab--top">Issue type <span class="ap-req">*</span></p>
            <div class="nr-subs" role="radiogroup" aria-label="Issue type">${st.subsFor(cat).map((s) => `<button type="button" class="nr-sub" role="radio" aria-checked="${sub === s.n}" data-sub="${esc(s.n)}"><span class="ap-tile">${icon(s.i, 18, "#922A22")}</span><b>${esc(s.n)}</b><small>${esc(st.SUB_HINT[s.n] || "")}</small><span class="nr-radio">${icon("check", 12, "#fff")}</span></button>`).join("")}</div>
            ${tried && !sub ? '<p class="ap-err">Pick the issue type to continue.</p>' : ""}
            <label class="nr-lab" for="nr-desc">Description <span class="ap-opt">(optional)</span></label>
            <div class="nr-ta"><textarea id="nr-desc" maxlength="500" rows="4" placeholder="Tell us a bit more so the team can come prepared">${esc(desc)}</textarea><span class="nr-count">${desc.length}/500</span></div>
            <p class="nr-lab">Photos <span class="ap-opt">(optional · up to 5, JPG or PNG)</span></p>
            <div class="nr-photos">${photos.map((ph, i) => `<span class="nr-ph"><img src="${ph}" alt="Photo ${i + 1}"><button type="button" class="nr-rm" data-rm="${i}" aria-label="Remove photo ${i + 1}">${icon("x", 12, "#fff")}</button></span>`).join("")}${photos.length < 5 ? `<label class="nr-add">${icon("camera", 20, "#3A3833")}<span>Add photo</span><input type="file" accept="image/png,image/jpeg" multiple data-photos></label>` : ""}</div>
          </section>` : ""}
        </div>
        <aside class="nr-side">
          <section class="ap-card nr-sum">
            ${eyebrow("SUMMARY")}
            ${rows([["Area", scope === "unit" ? "My unit" : "Common areas"], ["Location", p.name], ["Category", cat ? cat.name : "—"], ["Issue type", sub || "—"], ["Photos", photos.length ? String(photos.length) : "—"]])}
            <p class="nr-team">Goes to the ${esc(st.SCOPES[scope].team)}</p>
            <button type="button" class="ap-btn ap-btn--primary" data-submit ${sub ? "" : 'aria-disabled="true"'}>Submit request</button>
          </section>
        </aside>
      </div>
      <div class="ap-modal" data-modal hidden></div>`;
    const ta = c.querySelector("#nr-desc");
    if (ta) ta.addEventListener("input", () => { desc = ta.value; c.querySelector(".nr-count").textContent = `${desc.length}/500`; });
  }
  draw();

  c.addEventListener("click", async (e) => {
    const s = e.target.closest("[data-scope]"); if (s) { if (s.dataset.scope !== scope) { scope = s.dataset.scope; placeId = scope === "unit" ? st.S.lastUnit : st.S.lastCommunity; catId = null; sub = null; tried = false; draw(); } return; }
    const pl = e.target.closest("[data-place]"); if (pl) { placeId = pl.dataset.place; draw(); return; }
    const ct = e.target.closest("[data-cat]"); if (ct) { if (catId !== ct.dataset.cat) { catId = ct.dataset.cat; sub = null; tried = false; draw(); c.querySelector("#nr-issue")?.scrollIntoView({ behavior: "smooth", block: "start" }); } return; }
    const sb = e.target.closest("[data-sub]"); if (sb) { sub = sb.dataset.sub; draw(); return; }
    const rm = e.target.closest("[data-rm]"); if (rm) { photos.splice(+rm.dataset.rm, 1); draw(); return; }
    if (e.target.closest("[data-submit]")) {
      if (!sub) { tried = true; if (!catId) { toast("Pick what the request is about first."); return; } draw(); c.querySelector("#nr-issue")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      const be = e.target.closest("[data-submit]"); be.classList.add("is-loading"); be.textContent = "Submitting…";
      await wait(700);
      const cat = st.catsFor(scope).find((x) => x.id === catId), p = place();
      if (scope === "unit") st.S.lastUnit = p.id; else st.S.lastCommunity = p.id;
      const rec = st.addRequest({ scope, categoryId: cat.id, category: cat.name, subcategory: sub, title: sub, description: desc, location: scope === "unit" ? `${p.name} · ${p.u.community}` : `Common areas · ${p.name}`, attachments: photos.map((_, i) => `IMG_${2480 + i}.jpg`), team: st.SCOPES[scope].team });
      const m = c.querySelector("[data-modal]");
      m.innerHTML = `<div class="ap-modal-card" role="dialog" aria-modal="true" aria-labelledby="nr-ok"><span class="ap-ok">${icon("check", 28, "#2E7D5B")}</span><h2 id="nr-ok" class="ap-h2">Request submitted</h2><p class="ap-muted">Your request <b>${rec.id}</b> was sent to the ${esc(rec.team)}. You can track its status in My requests.</p><div class="ap-btns">${btn("Back to home", { kind: "ghost", href: "#/app" })}${btn("Track request", { href: `#/app/requests/${rec.id}` })}</div></div>`;
      m.hidden = false; m.querySelector("a:last-child").focus();
    }
  });
  c.addEventListener("change", (e) => {
    const inp = e.target.closest("[data-photos]"); if (!inp) return;
    [...inp.files].slice(0, 5 - photos.length).forEach((f) => { if (/image\/(png|jpe?g)/.test(f.type) && f.size <= 5 * 1024 * 1024) photos.push(URL.createObjectURL(f)); else toast(`${f.name}: use JPG or PNG up to 5 MB.`); });
    draw();
  });
  return { title: "New request", cleanup: sh.cleanup };
}
