/* Modal and drawer primitives: focus trap, Esc to close, scrim click,
   scroll lock, background inert, focus restore. */

import { html, icon } from "bloom:/js/ui/dom.js";
import { t } from "bloom:/js/i18n.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const stack = [];

function setBackgroundInert(on) {
  for (const id of ["site-nav", "view", "site-footer-root"]) {
    const el = document.getElementById(id);
    if (el) el.inert = on;
  }
  document.body.classList.toggle("is-locked", on);
}

/**
 * @param {object} o
 * @param {"modal"|"drawer"|"sheet"} o.kind
 * @param {string} o.label        accessible name
 * @param {string|Node} o.content
 * @param {string} [o.className]
 * @param {() => void} [o.onClose]
 */
export function openOverlay({ kind = "modal", label, content, className = "", onClose, closeButton = true }) {
  const returnFocus = document.activeElement;
  const root = html(`
    <div class="overlay overlay--${kind} ${className}" role="dialog" aria-modal="true" aria-label="${label}">
      <div class="overlay__scrim" data-close></div>
      <div class="overlay__panel" tabindex="-1">
        ${closeButton ? `<button class="icon-btn overlay__close" data-close aria-label="${t("close")}">${icon("close")}</button>` : ""}
        <div class="overlay__body"></div>
      </div>
    </div>`);
  const body = root.querySelector(".overlay__body");
  if (typeof content === "string") body.innerHTML = content;
  else body.appendChild(content);

  document.getElementById("overlays").appendChild(root);
  if (stack.length === 0) setBackgroundInert(true);
  stack.push(root);

  requestAnimationFrame(() => {
    root.classList.add("is-open");
    const first = body.querySelector("[autofocus]") || body.querySelector(FOCUSABLE) || root.querySelector(".overlay__panel");
    first.focus({ preventScroll: true });
  });

  const onKey = (e) => {
    if (stack[stack.length - 1] !== root) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") {
      const items = [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener("keydown", onKey);

  root.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey);
    root.classList.remove("is-open");
    root.classList.add("is-closing");
    stack.splice(stack.indexOf(root), 1);
    if (stack.length === 0) setBackgroundInert(false);
    const done = () => root.remove();
    root.querySelector(".overlay__panel").addEventListener("transitionend", done, { once: true });
    setTimeout(done, 600);
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    onClose?.();
  }

  return { root, body, close };
}

export const closeAllOverlays = () => {
  [...stack].reverse().forEach((el) => el.querySelector("[data-close]")?.click());
};
