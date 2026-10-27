/* Owner portal — Sign in (original: login modal on /welcome). Register opens
   the Bloom GPT registration chat (js/pages/register.js).
   Focused split-screen: an immersive brand panel (left) and a single-task
   form (right). Fields and actions mirror the original: Email ID*,
   Password*, Forgot Password, Sign In, OR, Login with Emirates ID. No backend is connected in this prototype,
   so submissions demonstrate states only. */

import { LOGO } from "bloom:/js/ui/logo.js";
import { PORTAL, PORTAL_VIDEO, CONTACT } from "bloom:/js/data.js";
import { icon, esc, pad } from "bloom:/js/ui/dom.js";
import { t, getLang, setLang } from "bloom:/js/i18n.js";
import { authReturnRoute, openAuth } from "bloom:/js/ui/auth.js";
import { reducedMotion } from "bloom:/js/ui/motion.js";
import { toast } from "bloom:/js/ui/toast.js";
import { themeToggle } from "bloom:/js/ui/theme.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---- Field markup -------------------------------------------------------- */
const PW_TOGGLE = `<button type="button" class="lf__toggle" data-toggle-pw aria-label="Show password" aria-pressed="false">${icon("eye", 18)}</button>`;

function field({ id, label, type = "text", autocomplete, placeholder = "", leading, trailing = "", hint = "" }) {
  return `
    <div class="lf" data-field="${id}">
      <label class="lf__label" for="${id}">${label}</label>
      <div class="lf__control">
        ${leading ? `<span class="lf__lead" aria-hidden="true">${icon(leading, 18)}</span>` : ""}
        <input class="lf__input" id="${id}" name="${id}" type="${type}" autocomplete="${autocomplete}"
               placeholder="${placeholder}" required aria-describedby="${id}-err ${hint ? `${id}-hint` : ""}" spellcheck="false" />
        ${trailing}
      </div>
      ${hint ? `<p class="lf__hint" id="${id}-hint">${hint}</p>` : ""}
      <p class="lf__error" id="${id}-err" aria-live="polite"></p>
    </div>`;
}

const capsHint = `<p class="lf__caps" data-caps hidden>${icon("alert", 14)} Caps Lock is on</p>`;

/* ---- Views ---------------------------------------------------------------- */
const VIEWS = {
  signin: () => `
    <header class="login__head">
      <h1 class="login__title">Login</h1>
      <p class="login__sub">Please enter your email and password</p>
    </header>
    <form class="login__form" novalidate data-form="signin">
      ${field({ id: "li-email", label: "Email ID", type: "email", autocomplete: "email", placeholder: "name@example.com", leading: "mail" })}
      ${field({ id: "li-password", label: "Password", type: "password", autocomplete: "current-password", placeholder: "Enter your password", leading: "shield", trailing: PW_TOGGLE })}
      ${capsHint}
      <div class="login__row">
        <button type="button" class="login__link" data-view="forgot">Forgot password?</button>
      </div>
      <button type="submit" class="login__primary" data-submit>
        <span class="btn__label">Login</span><span class="spinner" aria-hidden="true"></span>
      </button>
      <div class="login__divider"><span>or</span></div>
      <button type="button" class="login__alt" data-emirates>
        <span class="login__alt-icon login__uaepass" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 11v3a6 6 0 0 1-1 3.4"/><path d="M8.6 7.6A4.5 4.5 0 0 1 16.5 11v2.5a10 10 0 0 1-.6 3.4"/><path d="M7.5 11a4.5 4.5 0 0 1 .3-1.6M7.5 14v-3M5 9.2a7.5 7.5 0 0 1 14 1.8v2"/><path d="M6.2 18a10 10 0 0 0 1.3-4M9.5 20a9 9 0 0 0 1.3-3"/></svg></span><span class="btn__label">Continue with UAE PASS</span><span class="spinner" aria-hidden="true"></span>
      </button>
    </form>`,

  forgot: () => `
    <button type="button" class="login__back" data-view="signin">${icon("chevronLeft", 16, "icon--dir")} Back to login</button>
    <header class="login__head">
      <span class="login__badge">${icon("shield", 22)}</span>
      <h1 class="login__title">Reset your password</h1>
      <p class="login__sub">Enter the email linked to your Bloom account. We'll send you a secure reset link.</p>
    </header>
    <form class="login__form" novalidate data-form="forgot">
      ${field({ id: "fp-email", label: "Email ID", type: "email", autocomplete: "email", placeholder: "name@example.com", leading: "mail" })}
      <button type="submit" class="login__primary" data-submit>
        <span class="btn__label">Send reset link</span><span class="spinner" aria-hidden="true"></span>
      </button>
    </form>`,

  sent: (email) => `
    <div class="login__done">
      <span class="login__done-icon" data-tone="mail">${icon("mail", 28)}</span>
      <h1 class="login__title">Check your inbox</h1>
      <p class="login__sub">If an account exists for <strong>${email}</strong>, a password reset link is on its way. It expires in 30 minutes.</p>
      <button type="button" class="login__primary" data-view="signin"><span class="btn__label">Back to login</span></button>
      <button type="button" class="login__link login__resend" data-resend>Didn't get it? Resend</button>
    </div>`,

  success: (email) => `
    <div class="login__done">
      <span class="login__done-icon">${icon("check", 28)}</span>
      <h1 class="login__title">You're all set</h1>
      <p class="login__sub">Signed in as <strong>${email}</strong>.</p>
      <p class="login__proto">${icon("info", 14)} Prototype: authentication runs on Bloom's servers, which this preview doesn't connect to.</p>
      <a class="login__primary" href="#/portal"><span class="btn__label">Continue to the owner portal</span></a>
    </div>`,
};

/* ---- Validation ----------------------------------------------------------- */
const RULES = {
  email: (v) => (!v ? "Enter your email ID" : !EMAIL_RE.test(v) ? "Enter a valid email, like name@example.com" : ""),
  "li-password": (v) => (!v ? "Enter your password" : ""),
};

function setState(form, id, msg) {
  const wrap = form.querySelector(`[data-field="${id}"]`);
  if (!wrap) return;
  const input = wrap.querySelector("input");
  wrap.classList.toggle("has-error", Boolean(msg));
  wrap.classList.toggle("is-valid", !msg && input.type !== "checkbox" && Boolean(input.value));
  wrap.querySelector(".lf__error").textContent = msg || "";
  input.setAttribute("aria-invalid", msg ? "true" : "false");
}

function validate(form, input) {
  const rule = input.type === "email" ? RULES.email : RULES[input.id];
  if (!rule) return true;
  const msg = rule(input.type === "checkbox" ? "" : input.value.trim(), form);
  setState(form, input.id, msg);
  return !msg;
}

/* ---- Brand panel ------------------------------------------------------------ */
function brandPanel() {
  const [pay, build] = PORTAL.notifications;
  return `
    <aside class="login__brand" aria-hidden="true">
      <video class="login__video" src="${PORTAL_VIDEO}" muted loop playsinline ${reducedMotion() ? "" : "autoplay"}></video>
      <div class="login__wash"></div>
      <div class="login__lattice"></div>

      <div class="login__notifs">
        <div class="notif login__notif login__notif--a"><span class="notif__icon notif__icon--ok">${icon(pay.icon, 16)}</span><span><strong>${pay.title}</strong><span>${pay.body}</span></span></div>
        <div class="notif login__notif login__notif--b"><span class="notif__icon">${icon(build.icon, 16)}</span><span><strong>${build.title}</strong><span>${build.body}</span><span class="progress"><span style="--p:${build.progress}%"></span></span></span></div>
      </div>

      <div class="login__brand-foot">
        <p class="login__kicker">${t("portalEyebrow")}</p>
        <p class="login__brand-title">${t("portalTitleA")} <span class="t-serif">${t("portalTitleB")}</span></p>
        <ul class="login__features" data-features>
          ${PORTAL.features.map((f, i) => `
            <li class="login__feature ${i ? "" : "is-on"}" data-feature>
              <span class="login__feature-icon">${icon(f.icon, 18)}</span>
              <span><strong>${esc(f.title)}</strong><span>${esc(f.body)}</span></span>
            </li>`).join("")}
        </ul>
        <div class="login__dots">${PORTAL.features.map((_, i) => `<span class="${i ? "" : "is-on"}" data-dot style="--i:${i}"></span>`).join("")}<span class="login__count">${pad(1)} / ${pad(PORTAL.features.length)}</span></div>
      </div>
    </aside>`;
}

/* ---- Page ------------------------------------------------------------------- */
export function render(view, { query }) {
  const back = authReturnRoute();
  /* Registration now happens in the Bloom GPT chat */
  if (query.get("mode") === "register") { location.replace("#/register"); return { title: "Register", key: "login" }; }
  let mode = "signin";

  view.innerHTML = `
    <section class="login" data-section="Sign in">
      ${brandPanel()}
      <div class="login__panel">
        <div class="login__top">
          <a class="login__home" href="${back}">${icon("chevronLeft", 16, "icon--dir")} Back to Bloom</a>
          <a class="login__wordmark wordmark wordmark--logo" href="#/" aria-label="Bloom — ${t("home")}">${LOGO}</a>
          <div class="login__top-end">${themeToggle()}
          <div class="seg login__lang" role="group" aria-label="Language">
            <button class="seg__btn" data-lang="en" aria-pressed="${getLang() === "en"}">EN</button>
            <button class="seg__btn" data-lang="ar" aria-pressed="${getLang() === "ar"}" lang="ar">عربي</button>
          </div>
          </div>
        </div>

        <div class="login__center">
          <div class="login__switch" role="tablist" aria-label="Account">
            <button role="tab" class="login__switch-btn" data-mode="signin" aria-selected="${mode === "signin"}">${t("signIn")}</button>
            <button role="tab" class="login__switch-btn" data-mode="register" aria-selected="${mode === "register"}">${t("register")}</button>
            <span class="login__switch-ink" aria-hidden="true"></span>
          </div>
          <div class="login__stage" data-stage></div>
          <p class="login__secure">${icon("shield", 14)} Your data is protected with enterprise-grade security and encryption.</p>
        </div>

        <footer class="login__foot">
          <span>Need help? <a href="${CONTACT.tollFreeHref}">${CONTACT.tollFree}</a></span>
          <span class="login__legal"><a href="https://bloomholding.com/privacy-policy" target="_blank" rel="noopener">Privacy</a><a href="https://bloomholding.com/terms-of-use" target="_blank" rel="noopener">Terms</a><span>© ${new Date().getFullYear()} Bloom Holding</span></span>
        </footer>
      </div>
    </section>`;

  const stage = view.querySelector("[data-stage]");
  const switchEl = view.querySelector(".login__switch");

  const setMode = (m) => {
    mode = m;
    switchEl.dataset.mode = m;
    switchEl.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
    history.replaceState(null, "", m === "register" ? "#/login?mode=register" : "#/login");
  };

  const show = (name, arg) => {
    const auth = name === "signin" || name === "register";
    switchEl.hidden = !auth;
    if (auth) setMode(name);
    stage.classList.remove("is-swapping"); void stage.offsetWidth; stage.classList.add("is-swapping");
    stage.innerHTML = VIEWS[name](arg);
    document.title = `${auth ? (name === "signin" ? "Login" : "Register") : "Account"} · Bloom Holding`;
    wire(name);
    /* Focus the first field (after the router's own focus pass); on touch
       devices don't pop the keyboard open uninvited. */
    const first = stage.querySelector("input");
    setTimeout(() => {
      if (first && !matchMedia("(hover: none)").matches) first.focus({ preventScroll: true });
      else { const h = stage.querySelector("h1"); h?.setAttribute("tabindex", "-1"); h?.focus({ preventScroll: true }); }
    }, 80);
  };

  function wire(name) {
    stage.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));
    stage.querySelector("[data-resend]")?.addEventListener("click", () => toast({ title: "Reset link sent again", body: "Check your spam folder too." }));
    const form = stage.querySelector("form");
    if (!form) return;

    form.querySelectorAll("input").forEach((input) => {
      input.addEventListener("blur", () => { if (input.value) validate(form, input); });
      input.addEventListener(input.type === "checkbox" ? "change" : "input", () => {
        if (input.closest(".has-error, .is-valid")) validate(form, input);
      });
      /* Caps Lock warning on password fields */
      if (input.type === "password") {
        const caps = form.querySelector("[data-caps]");
        const check = (e) => { if (caps && e.getModifierState) caps.hidden = !e.getModifierState("CapsLock"); };
        input.addEventListener("keydown", check);
        input.addEventListener("keyup", check);
        input.addEventListener("blur", () => { if (caps) caps.hidden = true; });
      }
    });

    form.querySelectorAll("[data-toggle-pw]").forEach((btn) => btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const showPw = input.type === "password";
      input.type = showPw ? "text" : "password";
      btn.setAttribute("aria-pressed", String(showPw));
      btn.setAttribute("aria-label", showPw ? "Hide password" : "Show password");
      btn.innerHTML = icon(showPw ? "eyeOff" : "eye", 18);
      input.focus();
    }));

    form.querySelector("[data-emirates]")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      btn.classList.add("is-loading"); btn.disabled = true;
      setTimeout(() => {
        btn.classList.remove("is-loading"); btn.disabled = false;
        toast({ tone: "info", title: "UAE PASS", body: "In production this hands off to UAE PASS. Not connected in this prototype." });
      }, 900);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("[data-submit]");
      const ok = [...form.querySelectorAll("input")].map((i) => validate(form, i)).every(Boolean);
      if (!ok) {
        form.classList.remove("is-shaking"); void form.offsetWidth; form.classList.add("is-shaking");
        form.querySelector(".has-error input")?.focus();
        return;
      }
      const email = form.querySelector('input[type="email"]').value.trim().replace(/[<>&"']/g, "");
      btn.classList.add("is-loading"); btn.disabled = true;
      setTimeout(() => show(name === "signin" ? "success" : "sent", email), 1100);
    });
  }

  switchEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (!b || b.dataset.mode === mode) return;
    if (b.dataset.mode === "register") openAuth("register"); else show("signin");
  });
  switchEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      openAuth("register");
    }
  });
  view.querySelectorAll(".login__lang [data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* Brand panel: rotate the three promises */
  const feats = [...view.querySelectorAll("[data-feature]")];
  const dots = [...view.querySelectorAll("[data-dot]")];
  const count = view.querySelector(".login__count");
  let fi = 0, rot = 0;
  if (!reducedMotion()) {
    rot = setInterval(() => {
      fi = (fi + 1) % feats.length;
      feats.forEach((f, j) => f.classList.toggle("is-on", j === fi));
      dots.forEach((d, j) => d.classList.toggle("is-on", j === fi));
      count.textContent = `${pad(fi + 1)} / ${pad(feats.length)}`;
    }, 4200);
  }

  show(mode);
  return { title: "Login", key: "login", cleanup: () => clearInterval(rot) };
}
