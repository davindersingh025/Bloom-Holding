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

/* Prototype sign-in: remember the demo journey and open the signed-in web (#/app) */
const demoJourney = () => { try { return sessionStorage.getItem("bloom-journey") || "tenant"; } catch (e) { return "tenant"; } };
function enterApp() {
  try { sessionStorage.setItem("bloom-signed-in", "1"); } catch (e) {}
  location.hash = `/app?journey=${demoJourney()}`;
}

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
        <span class="login__alt-icon login__uaepass" aria-hidden="true"><svg class="uae-logo" width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7.48245 0.0934958C9.45381 -0.174511 11.5008 0.137795 13.2935 0.977254C13.5844 1.12455 13.9177 1.23419 14.1342 1.48447C14.298 1.68714 14.1835 1.97287 14.0174 2.13899C13.7986 2.32615 13.5157 2.17443 13.2946 2.07697C11.8421 1.35269 10.2156 0.899731 8.5718 0.966179C7.24992 1.01602 5.9521 1.39477 4.79402 2.0072C4.60845 2.09912 4.42174 2.20433 4.21326 2.23866C3.76997 2.21208 3.56493 1.55978 3.97959 1.34383C5.03572 0.692635 6.24419 0.274013 7.48245 0.0934958Z" fill="white"/><path d="M8.36353 2.24576C8.57086 2.15716 8.80912 2.20257 9.0302 2.19149C10.8515 2.20478 12.6888 2.72972 14.1505 3.79732C14.9088 4.34662 15.5754 5.01553 16.1276 5.75975C16.3463 6.03219 16.1447 6.48292 15.7919 6.51726C15.4689 6.58038 15.2937 6.27472 15.1241 6.07095C13.6178 4.17939 11.1459 3.04092 8.67281 3.1716C8.12756 3.27681 7.86639 2.46836 8.36353 2.24576Z" fill="white"/><path d="M6.44243 2.50954C6.82616 2.30355 7.29237 2.69891 7.14575 3.09428C7.03349 3.44313 6.59936 3.4387 6.30612 3.55609C4.72765 4.03452 3.45617 5.17189 2.54552 6.47648C2.38859 6.69133 2.22479 6.95491 1.92811 6.99478C1.5501 6.97817 1.23968 6.54293 1.47679 6.21623C2.14002 5.35683 2.84564 4.50187 3.754 3.87061C4.57759 3.29916 5.47565 2.81298 6.44243 2.50954Z" fill="white"/><path d="M2.42742 2.58353C2.73784 2.33103 3.26132 2.60679 3.2178 2.9944C3.23612 3.33329 2.81115 3.60129 2.50302 3.4241C2.17427 3.27791 2.13303 2.78509 2.42742 2.58353Z" fill="white"/><path d="M8.05392 4.29756C9.86262 4.01627 11.7824 4.47697 13.2315 5.56672C14.6771 6.62989 15.6037 8.3232 15.6713 10.0819C15.6988 10.9723 15.6553 11.9191 15.1868 12.711C14.8168 13.3577 14.0138 13.7132 13.2647 13.6246C12.8202 13.5538 12.724 12.9048 13.1226 12.7099C13.4262 12.6002 13.7813 12.6722 14.0654 12.4984C14.5843 12.216 14.7584 11.6035 14.8008 11.0675C14.8878 9.72304 14.5339 8.31988 13.6645 7.25118C12.9508 6.36299 11.9084 5.74945 10.7893 5.46816C9.2223 5.06947 7.46858 5.16914 6.05506 5.98091C4.4617 6.8691 3.43192 8.54248 3.20855 10.2901C3.04933 11.3676 3.20855 12.4629 3.50752 13.5039C3.58541 13.7232 3.58198 14.0012 3.36777 14.1485C3.10317 14.37 2.64956 14.2127 2.5877 13.8816C2.04933 12.0664 1.97488 10.0608 2.72058 8.28777C3.58771 6.15368 5.74693 4.66524 8.05392 4.29756Z" fill="white"/><path d="M9.29368 6.46825C9.56401 6.2689 9.99586 6.44942 10.0508 6.76837C10.162 7.13162 9.73812 7.50816 9.37615 7.33871C9.01189 7.2025 8.96607 6.66648 9.29368 6.46825Z" fill="white"/><path d="M11.1298 7.12248C11.3039 7.00176 11.5525 7.01395 11.7163 7.14684C12.7724 7.93093 13.454 9.1425 13.6453 10.4094C13.6797 10.7018 13.7255 11.0119 13.6201 11.2954C13.4105 11.6675 12.7163 11.5368 12.7312 11.0839C12.635 9.88893 12.0497 8.7427 11.1195 7.94975C10.8297 7.75816 10.832 7.3041 11.1298 7.12248Z" fill="white"/><path d="M16.5155 7.24895C16.8213 7.03743 17.2829 7.29104 17.2726 7.64875C17.3184 8.02861 16.8156 8.31544 16.5006 8.07844C16.2039 7.89571 16.2142 7.42061 16.5155 7.24895Z" fill="white"/><path d="M0.693303 7.7801C0.924689 7.6461 1.24657 7.75906 1.35997 7.98941C1.49055 8.20537 1.35195 8.43904 1.29468 8.65278C1.09307 9.22424 1.02091 9.8267 0.972798 10.4258C0.951034 10.7082 0.609683 10.912 0.33706 10.8068C0.125147 10.7393 -0.0214741 10.5244 0.00258087 10.3084C0.0300723 9.6052 0.167529 8.90639 0.386315 8.23527C0.447025 8.06361 0.508881 7.86427 0.693303 7.7801Z" fill="white"/><path d="M8.16189 8.60576C8.43566 8.53709 8.73463 8.43742 9.01412 8.5238C9.3738 8.65338 9.42306 9.18275 9.10118 9.37877C8.81939 9.50613 8.48491 9.47512 8.21114 9.62795C7.65788 9.89485 7.35089 10.4995 7.34975 11.0832C7.36578 12.4974 7.86636 13.9437 8.90759 14.9626C9.59488 15.6404 10.4505 16.1664 11.391 16.4488C11.6625 16.5164 11.9271 16.7611 11.8228 17.0546C11.7827 17.337 11.4643 17.4666 11.202 17.3902C9.83657 17.1399 8.68193 16.2561 7.84345 15.2173C6.84459 13.9581 6.19969 12.3556 6.38182 10.7509C6.47689 9.78189 7.19511 8.89481 8.16189 8.60576Z" fill="white"/><path d="M17.3166 8.79977C17.6465 8.65247 18.0451 8.95703 17.9959 9.29813C17.9924 9.64033 17.556 9.87622 17.2547 9.69017C16.8985 9.50633 16.9352 8.93156 17.3166 8.79977Z" fill="white"/><path d="M10.3244 9.22544C10.6531 9.02499 11.0013 9.3085 11.1136 9.60641C11.2751 9.92979 11.3942 10.2742 11.4515 10.6297C11.4836 11.0959 10.7848 11.3396 10.5145 10.9453C10.3519 10.6009 10.274 10.2233 10.1239 9.8733C10.0071 9.64627 10.0895 9.34615 10.3244 9.22544Z" fill="white"/><path d="M8.72198 10.6749C8.98659 10.5055 9.41499 10.6395 9.42416 10.974C9.48945 11.624 9.58109 12.2885 9.919 12.8666C10.5078 13.9652 11.7598 14.6873 13.0393 14.6629C13.3142 14.6829 13.6636 14.5677 13.8686 14.808C14.124 15.0649 13.9774 15.5533 13.6097 15.6198C11.8858 15.8845 10.0828 14.9941 9.18475 13.5654C8.74947 12.8866 8.50663 12.0925 8.49174 11.294C8.4906 11.0758 8.51121 10.8056 8.72198 10.6749Z" fill="white"/><path d="M11.4541 11.9847C11.8333 11.8153 12.2617 12.2549 12.0979 12.6171C12.0097 12.9283 11.5709 13.0579 11.3178 12.8474C11.0131 12.6271 11.0887 12.0977 11.4541 11.9847Z" fill="white"/><path d="M15.0278 14.0044C15.3715 13.753 15.8915 14.1206 15.7839 14.5105C15.7403 14.846 15.2924 15.0409 15.0118 14.8294C14.7231 14.6456 14.73 14.176 15.0278 14.0044Z" fill="white"/><path d="M3.45274 15.104C3.76316 14.9035 4.21448 15.1571 4.20417 15.5126C4.24082 15.8836 3.76774 16.1693 3.44586 15.9512C3.13086 15.7729 3.14002 15.2789 3.45274 15.104Z" fill="white"/><path d="M7.47667 6.60633C7.68057 6.53988 7.94403 6.47676 8.11585 6.64288C8.40795 6.86437 8.31631 7.38266 7.94861 7.47348C6.84895 7.80572 5.91424 8.6186 5.49385 9.65961C5.1651 10.426 5.17999 11.2798 5.27965 12.0905C5.39305 13.0429 5.73669 13.9566 6.21436 14.7927C6.44918 15.1172 6.09981 15.6045 5.70577 15.5137C5.31172 15.4295 5.23039 14.9799 5.06086 14.6842C4.43429 13.1614 3.95548 11.4559 4.41138 9.82684C4.80199 8.3528 5.96923 7.08032 7.47667 6.60633Z" fill="#1EAB75"/><path d="M6.55352 16.0955C6.77345 15.9171 7.09533 16.0013 7.26257 16.2051C7.62912 16.5573 8.01629 16.8884 8.43782 17.1774C8.825 17.4167 8.55695 18.0723 8.10335 17.9936C7.47219 17.7666 6.92236 17.3413 6.49854 16.8408C6.29922 16.6326 6.30953 16.266 6.55352 16.0955Z" fill="#E82026"/></svg></span><span class="btn__label">Continue with UAE PASS</span><span class="spinner" aria-hidden="true"></span>
      </button>
      <div class="login__demo" role="group" aria-label="Demo journey">
        <span class="login__demo-l">Prototype · sign in as</span>
        <div class="login__demo-seg">${[["tenant", "Tenant"], ["holiday", "Holiday Home"], ["owner", "Owner + Resident"]].map(([k, l]) => `<button type="button" data-journey="${k}" aria-pressed="${k === demoJourney()}">${l}</button>`).join("")}</div>
      </div>
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
      <a class="login__primary" href="#/app"><span class="btn__label">Go to dashboard</span></a>
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
    stage.querySelectorAll("[data-journey]").forEach((b) => b.addEventListener("click", () => {
      try { sessionStorage.setItem("bloom-journey", b.dataset.journey); } catch (e) {}
      stage.querySelectorAll("[data-journey]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }));
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
        enterApp();
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
      setTimeout(() => (name === "signin" ? enterApp() : show("sent", email)), 900);
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
