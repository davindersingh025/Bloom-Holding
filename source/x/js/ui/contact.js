/* Contact drawer — backs the original "Contact sales" CTA and the header
   phone icon. Direct lines first (fastest path), form second. */

import { LOGO } from "bloom:/js/ui/logo.js";
import { openOverlay } from "bloom:/js/ui/overlay.js";
import { html, icon, esc } from "bloom:/js/ui/dom.js";
import { toast } from "bloom:/js/ui/toast.js";
import { CONTACT, DIVISIONS } from "bloom:/js/data.js";

export function openContact({ topic = "Sales", context = "" } = {}) {
  const topics = ["Sales", "Leasing", "Owner support", ...DIVISIONS.filter((d) => d.id !== "properties").map((d) => d.name)];
  const content = html(`
    <div class="drawer-content">
      <p class="eyebrow"><span>Contact us</span></p>
      <h2 class="t-h2 drawer-content__title">Talk to <span class="t-serif">Bloom</span></h2>
      ${context ? `<p class="t-body">About <strong>${esc(context)}</strong></p>` : ""}

      <ul class="contact-lines">
        <li><a class="contact-line" href="${CONTACT.tollFreeHref}">${icon("phone")}<span><span class="t-meta">Toll free</span><span class="contact-line__value">${CONTACT.tollFree}</span></span>${icon("arrowUpRight", 16)}</a></li>
        <li><a class="contact-line" href="${CONTACT.internationalHref}">${icon("globe")}<span><span class="t-meta">Outside UAE</span><span class="contact-line__value">${CONTACT.international}</span></span>${icon("arrowUpRight", 16)}</a></li>
        <li><a class="contact-line" href="mailto:${CONTACT.email}">${icon("mail")}<span><span class="t-meta">Email</span><span class="contact-line__value">${CONTACT.email}</span></span>${icon("arrowUpRight", 16)}</a></li>
      </ul>

      <form class="contact-form" novalidate>
        <p class="t-meta">Or send a request</p>
        <div class="form-grid">
          <div class="field"><label class="field__label" for="c-name">Full name <span class="field__req" aria-hidden="true">*</span></label>
            <input class="input" id="c-name" autocomplete="name" required aria-describedby="c-name-err" /><p class="field__error" id="c-name-err"></p></div>
          <div class="field"><label class="field__label" for="c-email">Email <span class="field__req" aria-hidden="true">*</span></label>
            <input class="input" id="c-email" type="email" autocomplete="email" required aria-describedby="c-email-err" /><p class="field__error" id="c-email-err"></p></div>
          <div class="field"><label class="field__label" for="c-phone">Phone</label>
            <input class="input" id="c-phone" type="tel" autocomplete="tel" placeholder="+971" /></div>
          <div class="field"><label class="field__label" for="c-topic">Topic</label>
            <div class="select"><select class="input" id="c-topic">${topics.map((x) => `<option ${x === topic ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>${icon("chevronDown", 16)}</div></div>
          <div class="field field--full"><label class="field__label" for="c-msg">Message</label>
            <textarea class="input" id="c-msg" rows="4" maxlength="600" placeholder="How can we help?"></textarea>
            <p class="field__hint"><span data-count-chars>0</span>/600</p></div>
        </div>
        <button class="btn btn--primary btn--lg btn--block" type="submit"><span class="btn__label">Send request</span><span class="spinner" aria-hidden="true"></span></button>
      </form>
    </div>`);

  const overlay = openOverlay({ kind: "drawer", label: "Contact Bloom", content });
  const form = content.querySelector("form");
  const msg = form.querySelector("#c-msg");
  msg.addEventListener("input", () => { form.querySelector("[data-count-chars]").textContent = msg.value.length; });

  const check = (id, test, text) => {
    const input = form.querySelector(`#${id}`);
    const bad = !test(input.value.trim());
    input.closest(".field").classList.toggle("has-error", bad);
    input.setAttribute("aria-invalid", String(bad));
    form.querySelector(`#${id}-err`).textContent = bad ? text : "";
    return !bad;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = [
      check("c-name", (v) => v.length > 1, "Enter your name"),
      check("c-email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Enter a valid email"),
    ].every(Boolean);
    if (!ok) { form.querySelector(".has-error input")?.focus(); return; }
    const btn = form.querySelector("[type=submit]");
    btn.classList.add("is-loading"); btn.disabled = true;
    setTimeout(() => {
      overlay.close();
      toast({ title: "Request received", body: `Our ${form.querySelector("#c-topic").value.toLowerCase()} team will be in touch.` });
    }, 1000);
  });

  return overlay;
}

/* "Download the app" / "Get the app" */
export function openAppSheet() {
  const content = html(`
    <div class="app-sheet">
      <span class="wordmark wordmark--lg wordmark--logo">${LOGO}</span>
      <h2 class="t-h3">Manage your Bloom properties on the go</h2>
      <p class="t-body">Available for iPhone and Android.</p>
      <div class="app-sheet__stores">
        <a class="store-btn" href="https://apps.apple.com/ae/search?term=bloom%20holding" target="_blank" rel="noopener">${icon("apple", 22)}<span><small>Download on the</small>App Store</span></a>
        <a class="store-btn" href="https://play.google.com/store/search?q=bloom%20holding&c=apps" target="_blank" rel="noopener">${icon("play", 20)}<span><small>Get it on</small>Google Play</span></a>
      </div>
    </div>`);
  return openOverlay({ kind: "modal", label: "Download the Bloom app", content, className: "overlay--compact" });
}
