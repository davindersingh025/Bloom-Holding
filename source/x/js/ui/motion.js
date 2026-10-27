/* Motion utilities: scroll reveals, word-split headings, magnetic CTAs,
   3D tilt, scroll parallax, press ripples, image fade-in, scroll-reactive
   marquee, cursor-follow previews and count-ups. All respect reduced motion. */

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let observer;
const pending = new Set();

/* Safety net for the observer: it can miss elements whose own clip-path
   hides them (e.g. .reveal--clip starts fully clipped) or run late in
   throttled/background tabs. On scroll/resize, reveal anything pending
   that has entered the viewport. */
let sweepQueued = false;
function sweep() {
  sweepQueued = false;
  for (const el of pending) {
    if (!el.isConnected) { pending.delete(el); continue; }
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) { el.classList.add("is-in"); pending.delete(el); observer?.unobserve(el); }
  }
}
const queueSweep = () => { if (!sweepQueued && pending.size) { sweepQueued = true; requestAnimationFrame(sweep); } };
addEventListener("scroll", queueSweep, { passive: true });
addEventListener("resize", queueSweep, { passive: true });

/* Elements with .reveal / .line-mask fade and rise into view once. */
export function observeReveals(root = document) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          pending.delete(e.target);
          observer.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  const els = root.querySelectorAll(".reveal:not(.is-in), [data-reveal]:not(.is-in)");
  els.forEach((el) => { observer.observe(el); pending.add(el); });
  /* Don't depend on the observer for what's already on screen
     (background tabs, reduced motion, slow first paint). */
  setTimeout(() => {
    els.forEach((el) => {
      if (reducedMotion() || el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in");
    });
  }, 30);
}

/* Buttons marked [data-magnetic] lean slightly toward the pointer. */
export function magnetize(root = document) {
  if (!finePointer() || reducedMotion()) return;
  root.querySelectorAll("[data-magnetic]:not([data-magnetized])").forEach((el) => {
    el.dataset.magnetized = "";
    const strength = 0.22;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* A floating image that follows the pointer over rows marked [data-preview]. */
export function cursorPreview(container) {
  if (!finePointer() || !container) return;
  const float = document.createElement("div");
  float.className = "cursor-preview";
  float.setAttribute("aria-hidden", "true");
  float.innerHTML = '<img alt="" />';
  document.body.appendChild(float);
  const imgEl = float.firstElementChild;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = false;

  const loop = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    float.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    if (active || Math.abs(tx - x) > 0.5) raf = requestAnimationFrame(loop);
  };

  container.addEventListener("pointermove", (e) => {
    const row = e.target.closest("[data-preview]");
    tx = e.clientX + 140; ty = e.clientY;
    if (row) {
      if (imgEl.getAttribute("src") !== row.dataset.preview) imgEl.src = row.dataset.preview;
      if (!active) { x = tx; y = ty; active = true; float.classList.add("is-on"); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    } else if (active) {
      active = false; float.classList.remove("is-on");
    }
  });
  container.addEventListener("pointerleave", () => { active = false; float.classList.remove("is-on"); });

  return () => float.remove();
}

/* Count up numbers marked [data-count] when they enter view. Markup holds the
   real figure, so it is correct even if the observer never fires; it only
   drops to 0 at the moment the count-up starts. */
export function countUp(root = document) {
  const els = root.querySelectorAll("[data-count]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const end = Number(e.target.dataset.count);
      const fmt = (n) => n.toLocaleString("en-US");
      if (reducedMotion() || document.hidden) { e.target.textContent = fmt(end); return; }
      const delay = Number(e.target.dataset.countDelay || 0);
      const dur = 1600;
      e.target.textContent = fmt(0);
      setTimeout(() => {
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          e.target.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 4))));
          if (p < 1) requestAnimationFrame(step);
          else e.target.closest(".stat")?.classList.add("is-done");
        };
        requestAnimationFrame(step);
      }, delay);
    });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

/* Section headings rise in word by word. Text nodes are wrapped, so inline
   markup (e.g. the italic serif accent) is preserved. */
export function splitWords(root = document) {
  if (reducedMotion()) return;
  const targets = root.querySelectorAll(".section-head .t-h2:not([data-split]), .cta-band .t-h1:not([data-split]), .portal-teaser .t-h1:not([data-split]), .page-split:not([data-split])");
  targets.forEach((el) => {
    el.dataset.split = "";
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "w";
            w.innerHTML = `<span style="--wi:${i++}"></span>`;
            w.firstChild.textContent = part;
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add("split");
    if (!el.closest(".reveal, [data-reveal]")) el.setAttribute("data-reveal", "");
  });
}

/* Cards marked [data-tilt] tilt gently toward the pointer with a soft sheen. */
export function tilt(root = document) {
  if (!finePointer() || reducedMotion()) return;
  root.querySelectorAll("[data-tilt]:not([data-tilted])").forEach((el) => {
    el.dataset.tilted = "";
    const max = Number(el.dataset.tilt) || 5;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${((0.5 - py) * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * max).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      el.classList.add("is-tilting");
    });
    el.addEventListener("pointerleave", () => {
      el.classList.remove("is-tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}

/* Elements marked [data-speed] drift relative to the viewport centre as the
   page scrolls (uses the independent `translate` property). */
const parallaxEls = new Set();
let parallaxRaf = 0;
function parallaxFrame() {
  parallaxRaf = 0;
  const vh = innerHeight;
  parallaxEls.forEach((el) => {
    if (!el.isConnected) { parallaxEls.delete(el); return; }
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.speed);
    el.style.translate = `0 ${offset.toFixed(1)}px`;
  });
}
export function parallax(root = document) {
  if (reducedMotion()) return;
  root.querySelectorAll("[data-speed]").forEach((el) => parallaxEls.add(el));
  if (!parallax.bound) {
    parallax.bound = true;
    const schedule = () => { if (!parallaxRaf) parallaxRaf = requestAnimationFrame(parallaxFrame); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
  }
  parallaxFrame();
}

/* Press feedback: a ripple from the pointer on buttons, tiles and chips. */
export function ripples() {
  if (ripples.bound || reducedMotion()) return;
  ripples.bound = true;
  document.addEventListener("pointerdown", (e) => {
    const host = e.target.closest(".btn, .qs, .chip, .nav__register, .store-btn, .footer__social-btn, .seg__btn, .login__primary, .login__alt");
    if (!host || host.disabled) return;
    const r = host.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement("span");
    dot.className = "ripple";
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    host.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove(), { once: true });
  });
}

/* Images fade and settle in once decoded instead of popping. */
export function imageFade(root = document) {
  root.querySelectorAll("img:not([data-faded])").forEach((im) => {
    im.dataset.faded = "";
    if (im.complete && im.naturalWidth) return;
    im.classList.add("img-pending");
    const done = () => im.classList.remove("img-pending");
    im.addEventListener("load", done, { once: true });
    im.addEventListener("error", done, { once: true });
  });
}

/* The division marquee speeds up with scroll velocity and reverses when
   scrolling back up, then eases back to its idle drift. */
export function marqueeVelocity(root = document) {
  const track = root.querySelector(".marquee__track");
  if (!track || reducedMotion() || !track.getAnimations) return;
  const anim = track.getAnimations()[0];
  if (!anim) return;
  let last = scrollY, rate = 1, target = 1, raf = 0;
  const tick = () => {
    rate += (target - rate) * 0.08;
    target += (1 * Math.sign(target || 1) - target) * 0.04;
    anim.playbackRate = rate;
    raf = Math.abs(target - rate) > 0.01 || Math.abs(Math.abs(target) - 1) > 0.01 ? requestAnimationFrame(tick) : 0;
  };
  const onScroll = () => {
    if (!track.isConnected) { removeEventListener("scroll", onScroll); return; }
    const v = scrollY - last; last = scrollY;
    target = Math.max(-6, Math.min(6, (v >= 0 ? 1 : -1) * (1 + Math.abs(v) * 0.08)));
    if (!raf) raf = requestAnimationFrame(tick);
  };
  addEventListener("scroll", onScroll, { passive: true });
}
