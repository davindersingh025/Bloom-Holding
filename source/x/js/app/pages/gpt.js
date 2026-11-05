/* Bloom GPT (signed in) — the assistant from the mobile app, laid out for the
   web. Quick-option tiles + free text, and guided flows:
   service request · track requests · move-out · tenancy renewal (upload from
   the dashboard card, or term-based from Property details) · guest check-in
   and check-out (holiday home agents) · my bookings.
   Buttons carry text only (brand rule). PROTOTYPE: no OCR or backend. */

import * as st from "bloom:/js/app/store.js";
import { icon, esc, pill, reduced, orb } from "bloom:/js/app/ui.js";

function Stale() {}

const MENU = () => [
  ...(st.isAgent() ? [
    { k: "checkin", t: "Guest check-in", s: "Guests, dates & IDs", ic: "key", c: "#2F6F73", go: { flow: "checkin" } },
    { k: "bookings", t: "My bookings", s: "Status of every stay", ic: "calendar", c: "#922A22", go: { flow: "bookings" } },
  ] : []),
  { k: "repair", t: "Home repair", s: "Plumbing, AC, electrical", ic: "wrench", c: "#922A22", go: { flow: "sr", scope: "unit", cat: "maintenance" } },
  { k: "common", t: "Common area issue", s: "Leaks, cleaning, waste", ic: "community", c: "#2F6F73", go: { flow: "sr", scope: "common" } },
  ...(st.moveInUnits().length ? [{ k: "movein", t: "Request move-in", s: "Date, documents & access", ic: "enter", c: "#2E7D5B", go: { flow: "movein" } }] : []),
  { k: "moveout", t: "Request move-out", s: "Date, owner NOC & review", ic: "truck", c: "#8F5A1C", go: { flow: "moveout" } },
  { k: "access", t: "Access card or visitor pass", s: "Cards & guest passes", ic: "pass", c: "#34506B", go: { flow: "sr", scope: "common", cat: "access" } },
  { k: "pay", t: "Payments & receipts", s: "Receipts, payment issues", ic: "receipt", c: "#5B6B3A", go: { flow: "sr", scope: "unit", cat: "payments" } },
  { k: "track", t: "Track my requests", s: "See status & updates", ic: "track", c: "#64748B", go: { flow: "track" } },
];
const MO_TERMS = [
  "The move-out date can’t be changed after you submit the request.",
  "All dues (DEWA, gas and chilled water) must be cleared before the move-out date.",
  "Moves take place between 8 am and 6 pm, using the service lift only.",
  "Access cards and parking tags are returned to security on the move-out day.",
  "Management isn’t liable for any loss of or damage to goods, or for any injury, accident or loss suffered by residents anywhere in the building, its common areas or shared facilities.",
  "Personal belongings must not be placed or stored in any part of the building, its common areas or shared facilities.",
  "All waste from the move-out, including cartons, boxes, plastic sheets and protection, is the resident’s responsibility and must be taken off the premises.",
];
const pTxt = (n) => `${n} ${n === 1 ? "person" : "people"}`;
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

function understand(v) {
  const s = v.toLowerCase();
  if (st.isAgent()) {
    if (/check[\s-]?out/.test(s)) return { flow: "bookings" };
    if (/check[\s-]?in|guest|arriv/.test(s)) return { flow: "checkin" };
    if (/booking|reservation|stay/.test(s)) return { flow: "bookings" };
  }
  if (/move[\s-]?out|moving out|vacat/.test(s)) return { flow: "moveout" };
  if (/move[\s-]?in|moving in|access card for my new/.test(s)) return { flow: "movein" };
  if (/track|status|my request|update on/.test(s)) return { flow: "track" };
  if (/renew|tenancy|contract|lease/.test(s) && st.isTenant()) return { flow: "renewp" };
  if (/leak|drip|water/.test(s)) return { flow: "sr", scope: "unit", cat: "maintenance", sub: "Plumbing" };
  if (/\bac\b|air ?con|cool|hvac|thermostat/.test(s)) return { flow: "sr", scope: "unit", cat: "maintenance", sub: "AC / HVAC" };
  if (/electric|power|socket|light|breaker/.test(s)) return { flow: "sr", scope: "unit", cat: "maintenance", sub: "Electrical" };
  if (/pest|insect|cockroach|rat\b|ants?\b/.test(s)) return { flow: "sr", scope: "unit", cat: "maintenance", sub: "Pest Control" };
  if (/plumb|tap|pipe|toilet|drain/.test(s)) return { flow: "sr", scope: "unit", cat: "maintenance", sub: "Plumbing" };
  if (/access|card|visitor|gate|pass/.test(s)) return { flow: "sr", scope: "common", cat: "access" };
  if (/clean|waste|bin|garbage|trash/.test(s)) return { flow: "sr", scope: "common", cat: "maintenance" };
  if (/pay|receipt|invoice|charge|fine|statement/.test(s)) return { flow: "sr", scope: "unit", cat: "payments" };
  if (/repair|fix|broken|maint/.test(s)) return { flow: "sr", scope: "unit", cat: "maintenance" };
  return null;
}

export function page({ shell }) {
  const sh = shell({ active: "gpt", title: "Bloom GPT", flush: true });
  const c = sh.content;
  const first = st.journey().user.name.split(" ")[0];
  c.innerHTML = `
    <div class="gx">
      <div class="gx-scroll" data-scroll>
        <div class="gx-col">
          <div class="gx-hero">${orb("gx-orb")}<h2 class="gx-h">Bloom GPT</h2><p data-sub>Your Bloom assistant · requests, move-in, move-out &amp; more</p><div class="gx-steps" data-steps hidden><i></i><i></i><i></i><i></i><i></i></div></div>
          <div class="gx-log" data-log role="log" aria-live="polite"></div>
        </div>
      </div>
      <div class="gx-dock" data-dock></div>
    </div>`;
  const stepsEl = c.querySelector("[data-steps]"), subEl = c.querySelector("[data-sub]");
  const setSteps = (n, sub) => { if (sub) subEl.textContent = sub; stepsEl.hidden = n < 0; stepsEl.querySelectorAll("i").forEach((x, i) => x.classList.toggle("is-on", i < n)); };
  const log = c.querySelector("[data-log]"), dock = c.querySelector("[data-dock]"), scroller = c.querySelector("[data-scroll]");
  let run = 0, dead = false;

  const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));
  const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  const words = (t) => t.split(/(\s+)/).map((w, i) => (/^\s+$/.test(w) ? w : `<span class="w" style="--wi:${i}">${esc(w)}</span>`)).join("");

  function start(intent) {
    const me_run = ++run;
    log.innerHTML = ""; dock.innerHTML = ""; dock.onclick = null; scroller.scrollTop = 0;
    const alive = () => { if (dead || me_run !== run) throw new Stale(); };
    const toEnd = () => requestAnimationFrame(() => scroller.scrollTo({ top: scroller.scrollHeight, behavior: reduced() ? "auto" : "smooth" }));
    const say = (text, extra) => {
      alive();
      const row = html(`<div class="gx-msg gx-msg--bot">${orb("gx-av is-thinking")}<div class="gx-body"><span class="gx-typing" aria-label="Thinking"><i></i><i></i><i></i></span></div></div>`);
      log.appendChild(row); toEnd();
      return wait(600).then(() => {
        alive();
        row.querySelector(".gx-body").innerHTML = `<p class="gx-text"><span class="sr-only">${esc(text)}</span><span aria-hidden="true">${words(text)}</span></p>`;
        row.firstElementChild.classList.remove("is-thinking"); row.firstElementChild.classList.add("is-speaking");
        return wait(Math.min(1500, text.split(/\s+/).length * 24 + 200));
      }).then(() => { alive(); row.firstElementChild.classList.remove("is-speaking"); if (extra) row.querySelector(".gx-body").insertAdjacentHTML("beforeend", extra); toEnd(); return row; });
    };
    const me = (t) => { alive(); log.appendChild(html(`<div class="gx-msg gx-msg--me">${esc(t)}</div>`)); toEnd(); };
    const choose = (opts, row) => { alive(); return new Promise((res) => {
      dock.innerHTML = `<div class="gx-choices ${row ? "gx-choices--row" : ""}">${opts.map((o) => `<button type="button" class="ap-btn ap-btn--${o[2] === "primary" ? "primary" : "ghost"} gx-choice" data-c="${esc(o[0])}"><span>${esc(o[1])}</span>${o[3] ? `<small>${esc(o[3])}</small>` : ""}</button>`).join("")}</div>`;
      dock.onclick = (e) => { const b = e.target.closest("[data-c]"); if (!b) return; dock.innerHTML = ""; dock.onclick = null; me(b.querySelector("span").textContent.trim()); res(b.dataset.c); };
    }); };
    const askText = (o) => { alive(); return new Promise((res) => {
      dock.innerHTML = `${o.skip ? `<div class="gx-skip"><button type="button" class="ap-chip" data-skip>${esc(o.skip)}</button></div>` : ""}<div class="gx-ask"><label class="sr-only" for="gx-in">${esc(o.ph)}</label><input class="gx-input" id="gx-in" type="text" autocomplete="off" maxlength="${o.max || 200}" placeholder="${esc(o.ph)}" enterkeyhint="send"><button type="button" class="gx-send" aria-label="Send">${icon("send", 20, "#fff")}</button></div>`;
      const i = dock.querySelector("input"); let done = false;
      if (o.focus !== false) setTimeout(() => i.focus({ preventScroll: true }), 40);
      const send = () => { if (done) return; const v = i.value.trim(); if (!v) { i.classList.remove("is-empty"); void i.offsetWidth; i.classList.add("is-empty"); i.focus(); return; } done = true; dock.innerHTML = ""; me(v); res(v); };
      dock.querySelector(".gx-send").addEventListener("click", send);
      i.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); send(); } });
      dock.querySelector("[data-skip]")?.addEventListener("click", () => { if (done) return; done = true; dock.innerHTML = ""; me(o.skip); res(""); });
      if (o.onReady) o.onReady((v) => { if (done) return; done = true; dock.innerHTML = ""; res(v); });
    }); };
    const askLoop = (o, ok, retry) => askText(o).then((v) => (ok(v) ? v : say(retry).then(() => askLoop(o, ok, retry))));
    const progress = (items) => { alive();
      const row = html(`<div class="gx-msg gx-msg--bot">${orb("gx-av is-thinking")}<div class="gx-body"><ul class="gx-scan">${items.map((x) => `<li>${icon("clock", 14)} ${esc(x)}</li>`).join("")}</ul></div></div>`);
      log.appendChild(row); toEnd();
      let p = Promise.resolve();
      row.querySelectorAll("li").forEach((li) => { p = p.then(() => wait(450)).then(() => { alive(); li.classList.add("is-done"); li.innerHTML = `${icon("check", 14)} ${esc(li.textContent.trim())}`; }); });
      return p.then(() => row.firstElementChild.classList.remove("is-thinking"));
    };
    const card = (rws) => `<div class="gx-card"><dl>${rws.map((r) => `<dt>${esc(r[0])}</dt><dd>${r[2] ? r[1] : esc(r[1])}</dd>`).join("")}</dl></div>`;
    const done = () => `<div class="gx-done">${icon("check", 26, "#2E7D5B")}</div>`;
    const uploadDoc = (label, sample) => { alive(); return new Promise((res) => {
      dock.innerHTML = `<p class="gx-cap">${esc(label)}</p><div class="gx-upload"><label>${icon("camera", 22, "#922A22")}<span>Take photo / upload</span><input type="file" accept="image/*,application/pdf"></label><button type="button" data-sample>${icon("file", 22, "#922A22")}<span>Use sample</span></button></div>`;
      dock.querySelector("input").onchange = (e) => { const f = e.target.files[0]; if (!f) return; dock.innerHTML = ""; me("📎 " + f.name); res(f.name); };
      dock.querySelector("[data-sample]").onclick = () => { dock.innerHTML = ""; me("📎 " + sample); res(sample); };
    }); };
    const pickDay = (from, count, caption, sub) => { alive(); return new Promise((res) => {
      let h = `<p class="gx-cap">${esc(caption)}</p><div class="gx-days" role="listbox" aria-label="${esc(caption)}">`;
      for (let i = 0; i < count; i++) { const d = st.addDays(from, i), today = +d === +st.TODAY;
        h += `<button type="button" class="gx-day ${today ? "is-today" : ""}" data-d="${+d}" role="option"><small>${today ? "Today" : st.dow(d)}</small><b>${d.getDate()}</b><em>${sub ? esc(sub(d)) : st.mon(d)}</em></button>`; }
      dock.innerHTML = h + "</div>";
      dock.onclick = (e) => { const b = e.target.closest("[data-d]"); if (!b) return; dock.innerHTML = ""; dock.onclick = null; res(new Date(+b.dataset.d)); };
    }); };
    const pickCount = (lead, cap = "Number of people staying", fmtN = st.gTxt) => { alive(); return new Promise((res) => {
      let n = 2;
      dock.innerHTML = `<p class="gx-cap">${esc(cap)}</p><div class="gx-step"><button type="button" data-m aria-label="Fewer">−</button><output aria-live="polite"></output><button type="button" data-p aria-label="More">+</button></div><button type="button" class="ap-btn ap-btn--primary gx-wide" data-ok>Continue</button>`;
      const out = dock.querySelector("output"), m = dock.querySelector("[data-m]"), p = dock.querySelector("[data-p]");
      const draw = () => { out.innerHTML = `${fmtN(n)}<small>including ${esc(lead.split(" ")[0])}</small>`; m.disabled = n <= 1; p.disabled = n >= 10; };
      m.onclick = () => { if (n > 1) { n--; draw(); } }; p.onclick = () => { if (n < 10) { n++; draw(); } };
      dock.querySelector("[data-ok]").onclick = () => { dock.innerHTML = ""; res(n); };
      draw();
    }); };
    const go = (hash) => { location.hash = hash; throw new Stale(); };

    /* ---------- menu ---------- */
    function menu(text) {
      alive();
      const items = MENU();
      const tiles = `<div class="gx-opts" data-opts>${items.map((m, i) => `<button type="button" class="gx-opt" data-m="${m.k}" style="--i:${i}"><span class="gx-ic" style="background:${hexA(m.c, 0.1)}">${icon(m.ic, 20, m.c)}</span><span><b>${esc(m.t)}</b><small>${esc(m.s)}</small></span></button>`).join("")}</div>`;
      return say(text, tiles).then((row) => {
        const box = row.querySelector("[data-opts]");
        return askText({ ph: "Type your request, e.g. AC not cooling", focus: false, onReady: (pick) => {
          box.onclick = (e) => { const b = e.target.closest("[data-m]"); if (!b || box.classList.contains("is-used")) return; box.classList.add("is-used"); b.classList.add("is-on"); const m = items.find((x) => x.k === b.dataset.m); me(m.t); pick({ go: m.go }); };
        } }).then((v) => {
          box.classList.add("is-used");
          if (v && v.go) return v.go;
          return understand(v) || say("I’m not sure I got that. You can pick one of these to get started:").then(() => ({ flow: "again" }));
        });
      }).then(route);
    }
    function route(g) {
      if (g.flow === "again") return menu("Here’s what I can help with:");
      if (g.flow === "track") return track();
      if (g.flow === "moveout") return moveout(g.unit);
      if (g.flow === "movein") return movein(g.unit);
      if (g.flow === "checkin") return st.isAgent() ? checkin(g) : menu("Here’s what I can help with:");
      if (g.flow === "bookings") return say("Opening your bookings…").then(() => wait(300)).then(() => go("/app/bookings"));
      if (g.flow === "renewp") return renewProperty(st.units()[0].id);
      return raise(g);
    }
    const more = () => choose([["more", "Something else"], ["home", "Back to dashboard"]], true).then((v) => (v === "home" ? go("/app") : menu("Sure — what else can I help you with?")));

    /* ---------- track ---------- */
    function track() {
      const l = st.activeRequests();
      const head = l.length ? `You have ${l.length} active request${l.length > 1 ? "s" : ""}. The latest:` : "You don’t have any active requests right now.";
      const extra = l.length ? card([["Request ID", l[0].id], ["Issue", `${l[0].category} · ${l[0].subcategory}`], ["Status", pill(l[0].status, st.REQ_STATUS[l[0].status]), true]]) : "";
      return say(head, extra).then(() => choose([["open", "Open My requests", "primary"], ["more", "Something else"]], true))
        .then((v) => (v === "open" ? go("/app/requests") : menu("Sure — what else can I help you with?")));
    }

    /* ---------- raise a service request ---------- */
    function raise(g) {
      let scope = g.scope, place, cat, sub, desc = "", photo = "";
      let p = Promise.resolve();
      if (!scope) p = p.then(() => say("Is this about your unit or the common areas?")).then(() => choose([["unit", "In Unit"], ["common", "Common areas"]], true)).then((v) => { scope = v; });
      return p.then(() => {
        const l = st.places(scope);
        if (l.length <= 1) { place = l[0]; return; }
        return say(scope === "unit" ? "Which property is this for?" : "Which community is this for?")
          .then(() => choose(l.map((x) => [x.id, x.name, "", scope === "unit" ? x.meta : ""])))
          .then((id) => { place = l.find((x) => x.id === id); });
      }).then(() => {
        const cats = st.catsFor(scope);
        cat = cats.find((x) => x.id === g.cat);
        if (cat) return;
        return say("What is it about?").then(() => choose(cats.map((x) => [x.id, x.name, "", x.tag]))).then((id) => { cat = cats.find((x) => x.id === id); });
      }).then(() => {
        const subs = st.subsFor(cat);
        sub = subs.find((s) => s.n === g.sub);
        if (sub) return say(`Got it — ${sub.n.toLowerCase()} ${scope === "unit" ? `in ${place.name}` : "in the common areas"}.`);
        return say("Which of these best describes it?").then(() => choose(subs.map((s) => [s.n, s.n, "", st.SUB_HINT[s.n] || ""]))).then((n) => { sub = subs.find((s) => s.n === n); });
      }).then(() => say("Tell me a bit more so the team can come prepared. This is optional."))
        .then(() => askText({ ph: "Describe the issue (optional)", skip: "Skip", max: 500 }))
        .then((v) => { desc = v; return say("Would you like to add a photo? It helps the team understand the issue."); })
        .then(() => choose([["add", "Add a photo"], ["no", "No photo"]], true))
        .then((v) => { if (v === "add") { photo = `IMG_${2400 + Math.floor(Math.random() * 500)}.jpg`; return say("Photo attached.", `<span class="gx-file">${icon("file", 14)}${esc(photo)} · 1.8 MB</span>`); } })
        .then(() => say("Here’s your request. Shall I submit it?", card([["Area", scope === "unit" ? "In Unit" : "Common areas"], ["Location", scope === "unit" ? `${place.name} · ${place.u.community}` : place.name], ["Category", cat.name], ["Issue", sub.n], ["Description", desc || "—"], ["Photo", photo || "—"]])))
        .then(() => choose([["edit", "Edit"], ["ok", "Submit request", "primary"]], true))
        .then((v) => {
          if (v === "edit") return say("No problem, let’s go through it again.").then(() => raise({ flow: "sr", scope: g.scope, cat: g.cat }));
          return progress(["Creating your request", "Generating request ID", `Assigning to ${st.SCOPES[scope].team}`]).then(() => {
            const rec = st.addRequest({ scope, categoryId: cat.id, category: cat.name, subcategory: sub.n, title: sub.n, description: desc, location: scope === "unit" ? `${place.name} · ${place.u.community}` : `Common areas · ${place.name}`, attachments: photo ? [photo] : [], team: st.SCOPES[scope].team, via: "Bloom GPT" });
            return say("Done! Your request has been submitted. You can track its status anytime in My requests.", done() + card([["Request ID", rec.id], ["Issue", `${rec.category} · ${rec.subcategory}`], ["Status", pill("Submitted", "blue"), true]])).then(() => rec);
          }).then((rec) => choose([["track", "Track request", "primary"], ["more", "Something else"]], true).then((v2) => (v2 === "track" ? go(`/app/requests/${rec.id}`) : menu("Sure — what else can I help you with?"))));
        });
    }

    /* ---------- move-out ---------- */
    function moveout(unitId) {
      const us = st.units().filter(st.canMoveOut);
      if (!us.length) return say("Move-out isn’t available for your properties here. Contact the community team if you need help.").then(more);
      let u = unitId ? st.unit(unitId) : null, date, noc = "", movers = false, company = "", notes = "";
      const OWNER = st.isOwner();
      let p = Promise.resolve();
      if (!u) p = us.length > 1
        ? say("Happy to help with your move-out. Which property are you moving out of?").then(() => choose(us.map((x) => [x.id, x.name, "", x.community]))).then((id) => { u = st.unit(id); })
        : Promise.resolve().then(() => { u = us[0]; });
      return p.then(() => {
        const r = st.moveout(u.id);
        if (r && !["nocRejected", "bcmRejected"].includes(r.status)) {
          return say("You already have an active move-out request. Here’s where it stands:", card([["Request ID", r.id], ["Unit", `${u.name} · ${u.community}`], ["Move-out date", st.fmt(r.date)], ["Status", pill(st.MO_ST[r.status].pill, st.MO_ST[r.status].tone), true]]))
            .then(() => choose([["track", "Track request", "primary"], ["more", "Something else"]], true)).then((v) => (v === "track" ? go(`/app/moveout/${u.id}`) : menu("Sure — what else can I help you with?")));
        }
        setSteps(0, "Move out in a few quick steps");
        const unitCard = `<div class="gx-card gx-unit"><div class="gx-unit-h"><span class="ap-tile">${icon(u.icon === "building" ? "apt" : "house", 20, "#922A22")}</span><span><b>${esc(u.type)} · ${esc(u.name)}</b><small>${esc(u.community)} · ${esc(u.code)}</small></span></div><dl>${[["Unit type", u.type], ["Unit", u.name], ["Community", u.community]].concat(u.contract ? [["Contract ends", st.fmt(u.contract.end)]] : []).map((x) => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join("")}</dl></div>`;
        return say("Hi there 👋 I’m Bloom GPT. I’ll help you raise a move-out request for this property in a few quick steps.", unitCard)
          .then(() => choose([["yes", "Continue", "primary"]], true))
          .then(() => { setSteps(1); return say("When would you like to move out? Pick a date at least 3 days from today. Please note the date can’t be changed once you submit."); })
          .then(() => pickDay(st.addDays(st.TODAY, 3), 14, "Move-out date"))
          .then((d) => {
            date = d; me(st.fmtS(d)); setSteps(2);
            if (OWNER) return say(`Got it — ${st.fmtS(d)}. As the owner, you don’t need a NOC. Will you be using movers & packers?`);
            return say(`Got it — ${st.fmtS(d)}. Next, please upload the No Objection Certificate (NOC) issued by the unit owner. BCM needs it to approve your move-out.`)
              .then(() => uploadDoc("Owner’s NOC · PDF or photo", "Owner-NOC.pdf")).then((f) => { noc = f; setSteps(3); return say("Thanks, the owner’s NOC is attached. Will you be using movers & packers?"); });
          })
          .then(() => choose([["yes", "Yes"], ["no", "No"]], true))
          .then((v) => { movers = v === "yes"; if (!movers) return; return say("Great. What’s the name of the moving company?").then(() => askLoop({ ph: "e.g. Emirates Movers LLC" }, (x) => x.length >= 2, "Could you share the full company name?")).then((x) => { company = x; }); })
          .then(() => say("Any special needs for your move? For example a service lift booking or parking for the moving truck."))
          .then(() => askText({ ph: "Type your special needs", skip: "No special needs", max: 300 }))
          .then((v) => { notes = v; setSteps(4); return say("Here’s a summary of your move-out request. Does everything look right?", card([["Unit", `${u.name} · ${u.community}`], ["Move-out date", st.fmt(date)], ...(OWNER ? [] : [["Owner NOC", "📎 " + noc]]), ["Movers & packers", movers ? "Yes" : "No"], ...(movers ? [["Company", company]] : []), ["Special needs", notes || "—"]])); })
          .then(() => choose([["edit", "Edit"], ["ok", "Looks Good", "primary"]], true))
          .then((v) => {
            if (v === "edit") return say("No problem, let’s start again.").then(() => moveout(u.id)).then(() => { throw new Stale(); });
            setSteps(5);
            return say("Before I submit, please read and accept the move-out terms & conditions:", `<div class="gx-card gx-terms-c"><ol class="gx-terms">${MO_TERMS.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>`)
              .then(() => choose([["ok", "Accepted T&C · Submit request", "primary"]]));
          })
          .then(() => progress(OWNER ? ["Creating your request", "Generating request ID"] : ["Creating your request", "Generating request ID", "Attaching the owner’s NOC"]))
          .then(() => {
            const rec = { id: "MO-" + (24800 + Math.floor(Math.random() * 190)), date, movers, company, notes, noc: OWNER ? "" : noc, submitted: st.TODAY, status: "submitted" };
            st.setMoveout(u.id, rec); if (!OWNER) st.noteOwnerNoc(u.id, rec);
            return say(OWNER ? "Your move-out request has been submitted. BCM will review it and confirm your date. You’ll get updates in the app and by email." : "Your move-out request has been submitted with the owner’s NOC. BCM will verify the NOC and review your request. You’ll get updates in the app and by email.",
              card([["Request ID", rec.id], ["Unit", `${u.name} · ${u.community}`], ["Move-out date", st.fmt(date)], ["Status", pill("Submitted", "blue"), true]]));
          })
          .then(() => choose([["prop", "Back to property"], ["track", "Track request", "primary"]], true))
          .then((v) => go(v === "track" ? `/app/moveout/${u.id}` : `/app/property/${u.id}`));
      });
    }

    /* ---------- move-in ---------- */
    function movein(unitId) {
      const us = st.moveInUnits();
      if (!us.length) return say("You don’t have a property waiting for move-in right now. Contact the community team if you need help.").then(more);
      const OWNER = st.isOwner();
      let u = unitId ? st.unit(unitId) : null, date, deed = "", eid = "", people = 2, movers = false, company = "", dewa = "", notes = "";
      let p = Promise.resolve();
      if (!u || !st.canMoveIn(u)) p = us.length > 1
        ? say("Welcome home! Which property are you moving in to?").then(() => choose(us.map((x) => [x.id, x.name, "", x.community]))).then((id) => { u = st.unit(id); })
        : Promise.resolve().then(() => { u = us[0]; });
      return p.then(() => {
        const r = st.movein(u.id);
        if (r && !["docsRejected", "bcmRejected"].includes(r.status)) {
          return say("You already have an active move-in request. Here’s where it stands:", card([["Request ID", r.id], ["Unit", `${u.name} · ${u.community}`], ["Move-in date", st.fmt(r.date)], ["Status", pill(st.MI_ST[r.status].pill, st.MI_ST[r.status].tone), true]]))
            .then(() => choose([["track", "Track request", "primary"], ["more", "Something else"]], true)).then((v) => (v === "track" ? go(`/app/movein/${u.id}`) : menu("Sure — what else can I help you with?")));
        }
        const from = OWNER || !u.contract ? st.addDays(st.TODAY, 3) : (u.contract.start > st.addDays(st.TODAY, 3) ? u.contract.start : st.addDays(st.TODAY, 3));
        const docName = OWNER ? "Title deed" : "Ejari certificate";
        return say(`Hi ${first} 👋 Let’s get you moving in to ${u.name}. It takes a few quick steps.`, card([["Unit type", u.type], ["Unit", u.name], ["Community", u.community]].concat(!OWNER && u.contract ? [["Tenancy starts", st.fmt(u.contract.start)], ["Ejari no.", u.contract.ejari]] : [])))
          .then(() => choose([["yes", "Continue", "primary"], ["no", "Not now"]], true))
          .then((v) => { if (v === "no") go(`/app/property/${u.id}`); })
          .then(() => say(OWNER ? "When would you like to move in? Pick a date at least 3 days from today." : `When would you like to move in? Pick a date on or after your tenancy starts (${st.fmtS(u.contract.start)}).`))
          .then(() => pickDay(from, 14, "Move-in date"))
          .then((d) => { date = d; me(st.fmtS(d)); return say(OWNER ? `Got it — ${st.fmtS(d)}. Please upload your title deed so BCM can confirm ownership.` : `Got it — ${st.fmtS(d)}. Please upload your Ejari certificate for ${u.name}. BCM needs it to approve your move-in.`); })
          .then(() => uploadDoc(`${docName} · PDF or photo`, OWNER ? "Title-Deed-Villa22.pdf" : "Ejari-Apt1204.pdf"))
          .then((f) => { deed = f; return say(`Thanks, your ${docName.toLowerCase()} is attached. Now your Emirates ID, front and back.`); })
          .then(() => uploadDoc("Emirates ID · front & back", "Emirates-ID.pdf"))
          .then((f) => { eid = f; return progress(["Reading your documents", "Matching names and unit"]); })
          .then(() => say("Both documents look good. How many people are moving in? I’ll request an access card for each adult."))
          .then(() => pickCount(st.journey().user.name, "Number of people moving in", pTxt))
          .then((n) => { people = n; me(pTxt(n)); return say("Will you be using movers & packers?"); })
          .then(() => choose([["yes", "Yes"], ["no", "No"]], true))
          .then((v) => { movers = v === "yes"; if (!movers) return; return say("Great. What’s the name of the moving company?").then(() => askLoop({ ph: "e.g. Emirates Movers LLC" }, (x) => x.length >= 2, "Could you share the full company name?")).then((x) => { company = x; }); })
          .then(() => say("Is your DEWA (electricity & water) account already active for this unit?"))
          .then(() => choose([["done", "Already active"], ["help", "Help me activate"]], true))
          .then((v) => { dewa = v === "done" ? "Already active" : "Activation requested"; if (v === "help") return say("No problem — I’ll add a DEWA activation request so it’s ready before you arrive."); })
          .then(() => say("Any special needs for your move-in? For example a service lift booking or parking for the moving truck."))
          .then(() => askText({ ph: "Type your special needs", skip: "No special needs", max: 300 }))
          .then((v) => { notes = v; return say("Here’s a summary of your move-in request. Does everything look right?", card([["Unit", `${u.name} · ${u.community}`], ["Move-in date", st.fmt(date)], [docName, "📎 " + deed], ["Emirates ID", "📎 " + eid], ["People moving in", String(people)], ["Movers & packers", movers ? `Yes · ${company}` : "No"], ["DEWA", dewa], ["Special needs", notes || "—"]])); })
          .then(() => choose([["edit", "Edit"], ["ok", "Looks good", "primary"]], true))
          .then((v) => {
            if (v === "edit") return say("No problem, let’s start again.").then(() => movein(u.id)).then(() => { throw new Stale(); });
            return say("Before I submit, please confirm the terms:", `<ol class="gx-terms"><li>Moves happen between 8 am and 6 pm, using the service lift only.</li><li>The moving company is responsible for any damage to common areas.</li><li>Access cards are collected from the community office with your Emirates ID.</li></ol>`)
              .then(() => choose([["ok", "I agree, submit", "primary"]]));
          })
          .then(() => progress(["Creating your request", `Attaching your ${docName.toLowerCase()} and Emirates ID`, "Generating request ID"]))
          .then(() => {
            const rec = { id: "MI-" + (31400 + Math.floor(Math.random() * 190)), date, deed, deedLabel: docName, eid, people, movers, company, dewa, notes, submitted: st.TODAY, status: "submitted" };
            st.setMovein(u.id, rec);
            return say("Your move-in request has been submitted. BCM will verify your documents and confirm your slot. You’ll get updates in the app and by email.",
              done() + card([["Request ID", rec.id], ["Unit", `${u.name} · ${u.community}`], ["Move-in date", st.fmt(date)], ["Status", pill("Submitted", "blue"), true]]));
          })
          .then(() => choose([["track", "Track request", "primary"], ["prop", "Property details"]], true))
          .then((v) => go(v === "track" ? `/app/movein/${u.id}` : `/app/property/${u.id}`));
      });
    }

    /* ---------- tenancy renewal: dashboard card (upload → review → submit) ---------- */
    function renewUpload(unitId) {
      const u = st.unit(unitId), k = u.contract, full = st.journey().user.name;
      const getContract = () => uploadDoc("Latest tenancy contract", `Tenancy_Contract_${first}.pdf`)
        .then(() => progress(["Detecting document", "Reading contract details", "Checking tenancy dates"]))
        .then(() => say("Here are the details I extracted from your contract. Please review them and confirm they’re correct:", card([["Tenant name", full], ["Unit", `${u.name} · ${u.community}`], ["Contract no.", k.no], ["Ejari no.", k.ejari], ["Start date", st.fmt(k.start)], ["Expiry date", st.fmt(k.end)]])))
        .then(() => choose([["redo", "Re-upload"], ["ok", "Confirm", "primary"]], true))
        .then((v) => { if (v === "redo") return say("No problem — please upload your latest tenancy contract again.").then(getContract); });
      return say("Want to renew your tenancy? Please upload your latest tenancy contract.")
        .then(getContract)
        .then(() => progress(["Creating your renewal request", "Generating request ID", "Sending to the leasing team"]))
        .then(() => {
          const rec = st.addRequest({ scope: "unit", categoryId: "documents", category: "Property & Documents", subcategory: "Tenancy Renewal", title: "Tenancy renewal", description: `Renew ${k.no} (expires ${st.fmt(k.end)}) · latest contract uploaded via Bloom GPT`, location: `${u.name} · ${u.community}`, attachments: ["Tenancy_Contract.pdf"], team: "Leasing Team", via: "Bloom GPT" });
          return say("Your tenancy renewal request has been submitted successfully. You will be notified once your tenancy contract has been renewed.", done() + card([["Request ID", rec.id], ["Request", "Tenancy renewal"], ["Status", pill("Submitted", "blue"), true]])).then(() => rec);
        })
        .then((rec) => choose([["track", "Track request", "primary"], ["home", "Back to dashboard"]], true).then((v) => go(v === "track" ? `/app/requests/${rec.id}` : "/app")));
    }

    /* ---------- tenancy renewal: Property details (term-based) ---------- */
    function renewProperty(unitId) {
      const u = st.unit(unitId), k = u.contract;
      const startD = st.addDays(k.end, 1);
      let years = 1, end, occ = "", eid = "";
      return say(`Hi ${first}! Let’s renew your tenancy contract for ${u.name}. Here are your current contract details:`, card([["Unit", `${u.name} · ${u.community}`], ["Contract no.", k.no], ["Ejari no.", k.ejari], ["Ends on", st.fmt(k.end)], ["Status", pill(k.status, k.tone), true]]))
        .then(() => say("How long would you like to renew for?"))
        .then(() => choose([["1", "1 year"], ["2", "2 years"]], true))
        .then((v) => { years = +v; end = new Date(startD.getFullYear() + years, startD.getMonth(), startD.getDate() - 1); return say(`Your renewed contract would run from ${st.fmt(startD)} to ${st.fmt(end)}. Will the same people continue to live in the unit?`); })
        .then(() => choose([["same", "Yes, no changes"], ["change", "Update occupants"]], true))
        .then((v) => { if (v === "change") return say("Please tell me what has changed, for example a new occupant or someone moving out.").then(() => askText({ ph: "Describe the occupant changes", max: 300 })).then((x) => { occ = x; }); })
        .then(() => say("Is your Emirates ID still valid, or would you like to upload an updated copy?"))
        .then(() => choose([["ok", "Still valid"], ["up", "Upload updated ID"]], true))
        .then((v) => { if (v === "up") { eid = `Emirates_ID_${first}.pdf`; return say("Thanks, your Emirates ID is attached.", `<span class="gx-file">${icon("file", 14)}${esc(eid)} · 640 KB</span>`); } })
        .then(() => say("Here’s a summary of your renewal request. Shall I submit it?", card([["Unit", `${u.name} · ${u.community}`], ["Current contract", k.no], ["Renewal term", `${years} year${years > 1 ? "s" : ""}`], ["New start date", st.fmt(startD)], ["New end date", st.fmt(end)], ["Occupants", occ || "No changes"], ["Emirates ID", eid || "Still valid"]])))
        .then(() => choose([["edit", "Edit"], ["ok", "Submit renewal", "primary"]], true))
        .then((v) => {
          if (v === "edit") return say("No problem, let’s go through it again.").then(() => renewProperty(u.id)).then(() => { throw new Stale(); });
          return progress(["Creating your renewal request", "Generating request ID", "Sending to the leasing team"]).then(() => {
            const rec = st.addRequest({ scope: "unit", categoryId: "documents", category: "Property & Documents", subcategory: "Tenancy Renewal", title: "Tenancy renewal", description: `Renew ${k.no} for ${years} year${years > 1 ? "s" : ""} · ${st.fmt(startD)} to ${st.fmt(end)}${occ ? " · Occupants: " + occ : ""}`, location: `${u.name} · ${u.community}`, attachments: eid ? [eid] : [], team: "Leasing Team", via: "Bloom GPT" });
            return say("Your renewal request has been submitted. The leasing team will share the renewed contract for e-signature, and you’ll get updates in the app and by email.", done() + card([["Request ID", rec.id], ["Request", `Tenancy renewal · ${years} year${years > 1 ? "s" : ""}`], ["Status", pill("Submitted", "blue"), true]])).then(() => rec);
          }).then((rec) => choose([["track", "Track request", "primary"], ["more", "Something else"]], true).then((v2) => (v2 === "track" ? go(`/app/requests/${rec.id}`) : menu("Sure — what else can I help you with?"))));
        });
    }

    /* ---------- guest check-in / check-out (holiday home agent) — the dedicated screens handle these ---------- */
    function checkin(g = {}) {
      return say("Opening a new check-in…").then(() => wait(300)).then(() => go(`/app/bookings/new${g.unit ? `?unit=${g.unit}` : ""}`));
    }
    function checkout(id) {
      return say("Opening the booking…").then(() => wait(300)).then(() => go(id ? `/app/bookings/${id}` : "/app/bookings"));
    }

    wait(300).then(() => {
      const i = intent;
      if (i && i.type === "renew") return i.src === "dashboard" ? renewUpload(i.unit) : renewProperty(i.unit);
      if (i && i.type === "moveout") return moveout(i.unit);
      if (i && i.type === "movein") return movein(i.unit);
      if (i && i.type === "checkin" && st.isAgent()) return checkin(i);
      if (i && i.type === "checkout" && st.isAgent()) return checkout(i.id);
      let q = null; try { q = sessionStorage.getItem("bloom-gpt-q"); sessionStorage.removeItem("bloom-gpt-q"); } catch (x) {}
      if (q) { me(q); return say(`Thanks ${first} — I’ve noted “${q}”. In the full app I’ll take care of it right away. Meanwhile, here’s what I can help with:`).then(() => menu("")); }
      return menu(`Hi ${first}! I’m Bloom GPT. How can I help you today?`);
    }).catch((e) => { if (!(e instanceof Stale)) console.error(e); });
  }

  start(st.takeIntent());
  return { title: "Bloom GPT", cleanup: () => { dead = true; run++; sh.cleanup(); } };
}
