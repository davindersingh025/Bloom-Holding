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
    { k: "bookings", t: "My bookings", s: "Ongoing & past stays", ic: "calendar", c: "#922A22", go: { flow: "bookings" } },
  ] : []),
  { k: "repair", t: "Home repair", s: "Plumbing, AC, electrical", ic: "wrench", c: "#922A22", go: { flow: "sr", scope: "unit", cat: "maintenance" } },
  { k: "common", t: "Common area issue", s: "Leaks, cleaning, waste", ic: "community", c: "#2F6F73", go: { flow: "sr", scope: "common" } },
  { k: "moveout", t: "Request move-out", s: "Date, owner NOC & review", ic: "truck", c: "#8F5A1C", go: { flow: "moveout" } },
  { k: "access", t: "Access card or visitor pass", s: "Cards & guest passes", ic: "pass", c: "#34506B", go: { flow: "sr", scope: "common", cat: "access" } },
  { k: "pay", t: "Payments & receipts", s: "Receipts, payment issues", ic: "receipt", c: "#5B6B3A", go: { flow: "sr", scope: "unit", cat: "payments" } },
  { k: "track", t: "Track my requests", s: "See status & updates", ic: "track", c: "#64748B", go: { flow: "track" } },
];
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

function understand(v) {
  const s = v.toLowerCase();
  if (st.isAgent()) {
    if (/check[\s-]?out/.test(s)) return { flow: "bookings" };
    if (/check[\s-]?in|guest|arriv/.test(s)) return { flow: "checkin" };
    if (/booking|reservation|stay/.test(s)) return { flow: "bookings" };
  }
  if (/move[\s-]?out|moving out|vacat/.test(s)) return { flow: "moveout" };
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
          <div class="gx-hero">${orb("gx-orb")}<h2 class="gx-h">Bloom GPT</h2><p>Your Bloom assistant · requests, move-out &amp; more</p></div>
          <div class="gx-log" data-log role="log" aria-live="polite"></div>
        </div>
      </div>
      <div class="gx-dock" data-dock></div>
    </div>`;
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
    const pickCount = (lead) => { alive(); return new Promise((res) => {
      let n = 2;
      dock.innerHTML = `<p class="gx-cap">Number of people staying</p><div class="gx-step"><button type="button" data-m aria-label="Fewer">−</button><output aria-live="polite"></output><button type="button" data-p aria-label="More">+</button></div><button type="button" class="ap-btn ap-btn--primary gx-wide" data-ok>Continue</button>`;
      const out = dock.querySelector("output"), m = dock.querySelector("[data-m]"), p = dock.querySelector("[data-p]");
      const draw = () => { out.innerHTML = `${st.gTxt(n)}<small>including ${esc(lead.split(" ")[0])}</small>`; m.disabled = n <= 1; p.disabled = n >= 10; };
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
      if (!scope) p = p.then(() => say("Is this about your unit or the common areas?")).then(() => choose([["unit", "My unit"], ["common", "Common areas"]], true)).then((v) => { scope = v; });
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
        .then(() => say("Here’s your request. Shall I submit it?", card([["Area", scope === "unit" ? "My unit" : "Common areas"], ["Location", scope === "unit" ? `${place.name} · ${place.u.community}` : place.name], ["Category", cat.name], ["Issue", sub.n], ["Description", desc || "—"], ["Photo", photo || "—"]])))
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
        return say(`Hi ${first} 👋 I’ll help you raise a move-out request for ${u.name} in a few quick steps.`, card([["Unit type", u.type], ["Unit", u.name], ["Community", u.community]].concat(st.isTenant() && u.contract ? [["Contract ends", st.fmt(u.contract.end)]] : [])))
          .then(() => choose([["yes", "Continue", "primary"], ["no", "Not now"]], true))
          .then((v) => { if (v === "no") go(`/app/property/${u.id}`); })
          .then(() => say("When would you like to move out? Pick a date at least 3 days from today. Please note the date can’t be changed once you submit."))
          .then(() => pickDay(st.addDays(st.TODAY, 3), 14, "Move-out date"))
          .then((d) => {
            date = d; me(st.fmtS(d));
            if (OWNER) return say(`Got it — ${st.fmtS(d)}. As the owner, you don’t need a NOC. Will you be using movers & packers?`);
            return say(`Got it — ${st.fmtS(d)}. Next, please upload the No Objection Certificate (NOC) issued by the unit owner. BCM needs it to approve your move-out.`)
              .then(() => uploadDoc("Owner’s NOC · PDF or photo", "Owner-NOC.pdf")).then((f) => { noc = f; return say("Thanks, the owner’s NOC is attached. Will you be using movers & packers?"); });
          })
          .then(() => choose([["yes", "Yes"], ["no", "No"]], true))
          .then((v) => { movers = v === "yes"; if (!movers) return; return say("Great. What’s the name of the moving company?").then(() => askLoop({ ph: "e.g. Emirates Movers LLC" }, (x) => x.length >= 2, "Could you share the full company name?")).then((x) => { company = x; }); })
          .then(() => say("Any special needs for your move? For example a service lift booking or parking for the moving truck."))
          .then(() => askText({ ph: "Type your special needs", skip: "No special needs", max: 300 }))
          .then((v) => { notes = v; return say("Here’s a summary of your move-out request. Does everything look right?", card([["Unit", `${u.name} · ${u.community}`], ["Move-out date", st.fmt(date)], ...(OWNER ? [] : [["Owner NOC", "📎 " + noc]]), ["Movers & packers", movers ? `Yes · ${company}` : "No"], ["Special needs", notes || "—"]])); })
          .then(() => choose([["edit", "Edit"], ["ok", "Looks good", "primary"]], true))
          .then((v) => {
            if (v === "edit") return say("No problem, let’s start again.").then(() => moveout(u.id)).then(() => { throw new Stale(); });
            return say("Before I submit, please confirm the terms:", `<ol class="gx-terms"><li>The move-out date can’t be changed after you submit.</li><li>All dues (DEWA, gas, chilled water) must be cleared before the move-out date.</li><li>Access cards are returned to security on the day.</li></ol>`)
              .then(() => choose([["ok", "I agree, submit", "primary"]]));
          })
          .then(() => progress(OWNER ? ["Creating your request", "Generating request ID"] : ["Creating your request", "Attaching the owner’s NOC", "Generating request ID"]))
          .then(() => {
            const rec = { id: "MO-" + (24800 + Math.floor(Math.random() * 190)), date, movers, company, notes, noc: OWNER ? "" : noc, submitted: st.TODAY, status: "submitted" };
            st.setMoveout(u.id, rec);
            return say(OWNER ? "Your move-out request has been submitted. BCM will review it and confirm your date. You’ll get updates in the app and by email." : "Your move-out request has been submitted with the owner’s NOC. BCM will verify the NOC and review your request. You’ll get updates in the app and by email.",
              done() + card([["Request ID", rec.id], ["Unit", `${u.name} · ${u.community}`], ["Move-out date", st.fmt(date)], ["Status", pill("Submitted", "blue"), true]]));
          })
          .then(() => choose([["track", "Track request", "primary"], ["prop", "Property details"]], true))
          .then((v) => go(v === "track" ? `/app/moveout/${u.id}` : `/app/property/${u.id}`));
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

    /* ---------- guest check-in (holiday home agent) ---------- */
    function checkin(g = {}) {
      let u = g.unit ? st.unit(g.unit) : null, lead = g.guest || "", cin, cout, n, docs = [];
      let p = Promise.resolve();
      if (!u) p = p.then(() => say("Let’s check in your guest. Which property are they staying at?")).then(() => choose(st.units().map((x) => [x.id, x.name, "", x.community]))).then((id) => { u = st.unit(id); });
      p = p.then(() => {
        if (lead) return say(`Checking in ${lead} again at ${u.name}.`);
        return say("What’s the main guest’s full name, as shown on their ID?")
          .then(() => askLoop({ ph: "Guest full name", max: 60 }, (v) => v.trim().split(/\s+/).length >= 2, "Please enter their first and last name."))
          .then((v) => { lead = v.trim().replace(/\b\w/g, (ch) => ch.toUpperCase()); });
      });
      p = p.then(() => progress(["Checking past bookings"])).then(() => {
        const pastB = st.byGuest(lead).filter((b) => b.status === "Checked out");
        if (!pastB.length) return say(`No past bookings found for ${lead}. This will be their first stay with you.`);
        return say(`Welcome back! ${lead} has ${pastB.length} past booking${pastB.length > 1 ? "s" : ""} with you:`, card(pastB.slice(0, 3).map((b) => [st.unit(b.unit).name, `${st.fmtDM(b.checkIn)} – ${st.fmt(b.checkOut)} · ${st.nTxt(st.nights(b.checkIn, b.checkOut))}`])));
      });
      const clash = () => {
        const hit = st.ongoing().find((b) => b.unit === u.id && b.checkIn < cout && b.checkOut > cin);
        if (!hit) return;
        return say(`Heads up: ${u.name} already has ${hit.guests[0].name} (${hit.id}) from ${st.fmtS(hit.checkIn)} to ${st.fmtS(hit.checkOut)}. Would you like to pick other dates?`)
          .then(() => choose([["go", "Continue anyway"], ["re", "Pick other dates", "primary"]], true))
          .then((v) => (v === "go" ? null : dates()));
      };
      const dates = () => say(`When is ${lead.split(" ")[0]} checking in?`)
        .then(() => pickDay(st.TODAY, 21, "Check-in date"))
        .then((d) => { cin = d; me(st.fmtS(d)); return say("And the check-out date?"); })
        .then(() => pickDay(st.addDays(cin, 1), 30, "Check-out date", (d) => st.nTxt(st.nights(cin, d))))
        .then((d) => { cout = d; me(`${st.fmtS(d)} · ${st.nTxt(st.nights(cin, d))}`); return clash(); });
      return p.then(dates)
        .then(() => say(`How many people are staying, including ${lead.split(" ")[0]}?`))
        .then(() => pickCount(lead)).then((v) => { n = v; me(st.gTxt(v)); })
        .then(() => say(n > 1 ? `Please upload the Emirates ID or passport for each of the ${n} guests. I’ll read the details and check they’re valid for the whole stay.` : `Please upload ${lead.split(" ")[0]}’s Emirates ID or passport. I’ll read the details and check it’s valid for the whole stay.`))
        .then(() => {
          const prev = st.byGuest(lead)[0];
          const guests = st.party(lead, prev ? prev.guests[0].nat : "United Kingdom", n, st.S.bookingSeq % 5);
          let q = Promise.resolve();
          guests.forEach((gu, i) => {
            q = q.then(() => uploadDoc(`Guest ${i + 1} of ${n} · Emirates ID or passport`, `${gu.type === "Passport" ? "Passport_" : "Emirates_ID_"}${gu.name.split(" ")[0]}.jpg`))
              .then(() => progress(["Reading document", `Checking validity until ${st.fmtS(cout)}`]))
              .then(() => { docs.push(gu); return say(`${i === 0 ? "Main guest" : `Guest ${i + 1}`} verified ✓`, card([["Name", gu.name], ["Document", gu.type], ["Number", gu.no], ["Nationality", gu.nat], ["Expiry", st.fmt(gu.exp)], ["Status", pill("Valid for stay", "green"), true]])); });
          });
          return q;
        })
        .then(() => say("Here’s the check-in summary. Shall I submit it?", card([["Property", `${u.name} · ${u.community}`], ["Main guest", lead], ["Check-in", st.fmtS(cin)], ["Check-out", `${st.fmtS(cout)} · ${st.nTxt(st.nights(cin, cout))}`], ["Guests", st.gTxt(n)], ["Documents", `${docs.length} of ${n} verified`], ["Approval", "Not required"]])))
        .then(() => choose([["edit", "Start over"], ["ok", "Submit check-in", "primary"]], true))
        .then((v) => {
          if (v === "edit") return say("No problem, let’s go through it again.").then(() => checkin({ unit: u.id })).then(() => { throw new Stale(); });
          return progress(["Submitting to Bloom", "Generating booking ID", `Informing ${u.community} security`]);
        })
        .then(() => {
          const b = st.addBooking({ unit: u.id, guests: docs, checkIn: cin, checkOut: cout, status: +cin === +st.TODAY ? "Checked in" : "Upcoming", phone: `+971 50 ${200 + Math.floor(Math.random() * 700)} ${1000 + Math.floor(Math.random() * 8999)}`, via: "Bloom GPT" });
          return say(`Check-in submitted successfully! No approval is needed. ${u.community} security has been informed and will expect ${lead.split(" ")[0]}${n > 1 ? `’s party of ${n}` : ""} on ${st.fmtS(cin)}.`,
            done() + card([["Booking ID", b.id], ["Property", `${u.name} · ${u.community}`], ["Main guest", lead], ["Stay", `${st.fmtS(cin)} → ${st.fmtS(cout)}`], ["Status", pill(b.status, st.BK_TONE[b.status]), true]])).then(() => b);
        })
        .then((b) => choose([["view", "View booking", "primary"], ["home", "Back to dashboard"]], true).then((v) => go(v === "view" ? `/app/bookings/${b.id}` : "/app")));
    }

    /* ---------- guest check-out ---------- */
    function checkout(id) {
      const b = st.booking(id); if (!b) return menu(`Hi ${first}! How can I help you today?`);
      const u = st.unit(b.unit), lead = b.guests[0].name;
      return say(`Ready to check out ${lead}${b.guests.length > 1 ? "’s party" : ""} from ${u.name}?`, card([["Booking ID", b.id], ["Property", `${u.name} · ${u.community}`], ["Main guest", lead], ["Stay", `${st.fmtS(b.checkIn)} → ${st.fmtS(b.checkOut)}`], ["Status", pill(b.status, st.BK_TONE[b.status]), true]]))
        .then(() => choose([["no", "Not now"], ["ok", "Confirm check-out", "primary"]], true))
        .then((v) => { if (v === "no") go(`/app/bookings/${b.id}`); return progress(["Updating booking", `Informing ${u.community} security`, "Ending guest access"]); })
        .then(() => {
          b.status = "Checked out"; b.checkedOutAt = st.TODAY; if (b.checkOut > st.TODAY) b.checkOut = st.TODAY; st.bookingsChanged();
          return say(`${lead} has been checked out. ${u.community} security has been informed and guest access has ended.`, done() + card([["Booking ID", b.id], ["Property", `${u.name} · ${u.community}`], ["Stay", `${st.fmtS(b.checkIn)} → ${st.fmtS(b.checkOut)}`], ["Status", pill("Checked out", "grey"), true]]));
        })
        .then(() => choose([["view", "View booking", "primary"], ["list", "My bookings"]], true))
        .then((v) => go(v === "view" ? `/app/bookings/${b.id}` : "/app/bookings"));
    }

    wait(300).then(() => {
      const i = intent;
      if (i && i.type === "renew") return i.src === "dashboard" ? renewUpload(i.unit) : renewProperty(i.unit);
      if (i && i.type === "moveout") return moveout(i.unit);
      if (i && i.type === "checkin" && st.isAgent()) return checkin(i);
      if (i && i.type === "checkout" && st.isAgent()) return checkout(i.id);
      return menu(`Hi ${first}! I’m Bloom GPT. How can I help you today?`);
    }).catch((e) => { if (!(e instanceof Stale)) console.error(e); });
  }

  start(st.takeIntent());
  return { title: "Bloom GPT", cleanup: () => { dead = true; run++; sh.cleanup(); } };
}
