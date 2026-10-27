/* Toasts: polite live region, auto-dismiss, optional progress. */

import { html, icon, esc } from "bloom:/js/ui/dom.js";

const ICONS = { success: "check", info: "info", error: "alert", progress: "download" };

function region() {
  let r = document.getElementById("toasts");
  if (!r) {
    r = html('<div id="toasts" class="toasts" role="status" aria-live="polite"></div>');
    document.body.appendChild(r);
  }
  return r;
}

/**
 * toast({ title, body, tone: "success"|"info"|"error"|"progress", duration })
 * Returns { update(pct), dismiss() }.
 */
export function toast({ title, body = "", tone = "success", duration = 4200 }) {
  const el = html(`
    <div class="toast toast--${tone}">
      <span class="toast__icon">${icon(ICONS[tone] || "info", 18)}</span>
      <div class="toast__text">
        <p class="toast__title">${esc(title)}</p>
        ${body ? `<p class="toast__body">${esc(body)}</p>` : ""}
        ${tone === "progress" ? '<div class="toast__bar"><span></span></div>' : ""}
      </div>
    </div>`);
  region().appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-in"));

  let timer;
  const dismiss = () => {
    clearTimeout(timer);
    el.classList.remove("is-in");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 500);
  };
  if (duration) timer = setTimeout(dismiss, duration);

  return {
    update(pct) { const bar = el.querySelector(".toast__bar span"); if (bar) bar.style.transform = `scaleX(${pct / 100})`; },
    dismiss,
    el,
  };
}
