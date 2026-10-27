/* Owner portal — "Your Property, Simplified" (original: /welcome, ?login=1). */

import { PORTAL, PORTAL_VIDEO } from "bloom:/js/data.js";
import { eyebrow, icon, esc, arrow, pad } from "bloom:/js/ui/dom.js";
import { t } from "bloom:/js/i18n.js";
import { openAuth } from "bloom:/js/ui/auth.js";
import { openAppSheet } from "bloom:/js/ui/contact.js";
import { reducedMotion } from "bloom:/js/ui/motion.js";
import { testimonialsSection, ctaBand, wireSharedSections } from "bloom:/js/pages/shared-sections.js";

const PHONE_SCREEN = "https://app.bloomholding.com/assets/assets/images/web-home-mobile.0e0a6d6810282343f50c0ed71a709ded.png";

export function render(view, { query }) {
  view.innerHTML = `
    <section class="vhero on-dark" data-section="${t("portal")}">
      <video class="vhero__video" src="${PORTAL_VIDEO}" muted loop playsinline ${reducedMotion() ? "" : "autoplay"} aria-hidden="true"></video>
      <div class="vhero__shade" aria-hidden="true"></div>
      <div class="container vhero__inner" data-reveal>
        ${eyebrow(null, t("portalEyebrow"))}
        <h1 class="t-display">
          <span class="line-mask" style="--i:0"><span>${t("portalTitleA")}</span></span>
          <span class="line-mask" style="--i:1"><span class="t-serif">${t("portalTitleB")}</span></span>
        </h1>
        <div class="vhero__row">
          <p class="t-body-lg">${t("portalLede")}</p>
          <div class="cluster">
            <button class="btn btn--light btn--lg" data-app data-magnetic>${t("downloadApp")} ${icon("download", 18)}</button>
            <button class="btn btn--ghost-light btn--lg" data-signin>${t("login")}</button>
          </div>
        </div>
      </div>
      <button class="icon-btn icon-btn--glass vhero__pause" data-pause aria-label="Pause background video" aria-pressed="false">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
      </button>
    </section>

    <section class="section" data-section="Features">
      <div class="container">
        <div class="section-head">
          <div class="reveal">${eyebrow(1, "Features")}<h2 class="t-h2">Everything you need to manage your real estate <span class="t-serif">portfolio</span></h2></div>
          <p class="t-body-lg section-head__aside reveal" style="--i:1">From properties tracking to payment management, our platform provides all the tools you need in one beautiful, easy-to-use interface.</p>
        </div>
        <ol class="features">
          ${PORTAL.features.map((f, i) => `
            <li class="features__item reveal" style="--i:${i}">
              <span class="features__num t-meta">${pad(i + 1)}</span>
              <span class="features__icon">${icon(f.icon, 24)}</span>
              <h3 class="t-h3">${esc(f.title)}</h3>
              <p class="t-body">${esc(f.body)}</p>
            </li>`).join("")}
        </ol>
      </div>
    </section>

    <section class="section mobile-xp" data-section="Mobile Experience">
      <div class="container mobile-xp__grid">
        <div class="mobile-xp__copy">
          <div class="reveal">${eyebrow(2, "Mobile Experience")}</div>
          <h2 class="t-h2 reveal" style="--i:1">Manage your Bloom properties <span class="t-serif">on the go</span></h2>
          <p class="t-body-lg reveal" style="--i:2">Our mobile-first design ensures you access your property information, track payments, and receive updates wherever you are.</p>
          <ul class="checklist">
            ${PORTAL.mobile.map((m, i) => `<li class="reveal" style="--i:${i + 3}"><span class="checklist__tick">${icon("check", 14)}</span>${esc(m)}</li>`).join("")}
          </ul>
          <button class="btn btn--primary btn--lg reveal" style="--i:7" data-app>Get the app ${arrow()}</button>
        </div>
        <div class="phone-stage reveal" style="--i:2">
          <div class="phone" aria-hidden="true" data-speed="-0.04"><img src="${PHONE_SCREEN}" alt="" loading="lazy" /></div>
          ${PORTAL.notifications.map((n, i) => `
            <div class="notif notif--float notif--${i ? "b" : "a"}" role="img" aria-label="${esc(n.title)}: ${esc(n.body)}">
              <span class="notif__icon ${i ? "" : "notif__icon--ok"}">${icon(n.icon, 16)}</span>
              <span><strong>${esc(n.title)}</strong><span>${esc(n.body)}</span>
              ${n.progress ? `<span class="progress"><span style="--p:${n.progress}%"></span></span>` : ""}</span>
            </div>`).join("")}
        </div>
      </div>
    </section>

    ${testimonialsSection(3)}
    ${ctaBand()}`;

  view.querySelectorAll("[data-app]").forEach((b) => b.addEventListener("click", openAppSheet));
  view.querySelector("[data-signin]").addEventListener("click", () => openAuth());
  const disposeShared = wireSharedSections(view);

  /* Background video pause (WCAG 2.2.2) */
  const video = view.querySelector("video");
  const pauseBtn = view.querySelector("[data-pause]");
  pauseBtn.addEventListener("click", () => {
    const paused = !video.paused;
    paused ? video.pause() : video.play();
    pauseBtn.setAttribute("aria-pressed", String(paused));
    pauseBtn.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
    pauseBtn.innerHTML = paused ? icon("play", 16) : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  });


  /* Original deep link /welcome?login=1 → the dedicated login page */
  if (query.get("login") === "1") { openAuth(); return { title: "Sign in", key: "portal", cleanup: disposeShared }; }

  return { title: "Your Property, Simplified", key: "portal", cleanup: disposeShared };
}
