import { route, navigate } from "bloom:/js/router.js";
import { mountNav, setNavRoute } from "bloom:/js/ui/nav.js";
import { observeReveals, magnetize, countUp, splitWords, tilt, parallax, ripples, imageFade, marqueeVelocity } from "bloom:/js/ui/motion.js";
import { renderFooter } from "bloom:/js/pages/footer.js";
import { applyLang, onLangChange, t } from "bloom:/js/i18n.js";
import { closeAllOverlays } from "bloom:/js/ui/overlay.js";
import { initTheme } from "bloom:/js/ui/theme.js";

route("/", () => import("bloom:/js/pages/universal.js"));
route("/space/:id", () => import("bloom:/js/pages/space.js"));
route("/properties", () => import("bloom:/js/pages/properties.js"));
route("/project/:id", () => import("bloom:/js/pages/project.js"));
route("/portal", () => import("bloom:/js/pages/universal.js"));   /* owner portal page retired */
route("/login", () => import("bloom:/js/pages/login.js"));
route("/register", () => import("bloom:/js/pages/register.js"));
route("/gpt", () => import("bloom:/js/pages/gpt.js"));
route("/app", () => import("bloom:/js/pages/app.js"));
route("/app/:a", () => import("bloom:/js/pages/app.js"));
route("/app/:a/:b", () => import("bloom:/js/pages/app.js"));

applyLang();
initTheme();
ripples();
const nav = mountNav();
const footer = document.getElementById("site-footer-root");
renderFooter(footer);

const signedIn = () => { try { return sessionStorage.getItem("bloom-signed-in") === "1"; } catch (e) { return false; } };
let wasSignedIn = signedIn();
const afterRender = (meta, view) => {
  /* Login ⇄ My Bloom in the public nav once the visitor signs in or logs out */
  if (signedIn() !== wasSignedIn) { wasSignedIn = signedIn(); nav.redraw(); }
  setNavRoute(meta.key);
  document.body.classList.toggle("in-app", meta.key === "app");
  /* The login page is a focused, chrome-free experience */
  document.body.classList.toggle("is-focus", ["login", "register", "gpt", "app"].includes(meta.key));
  /* Division wayfinding colour for the whole page (see tokens.css) */
  document.documentElement.dataset.division = meta.key === "universal" ? "" : meta.key;
  splitWords(view);
  observeReveals(view);
  magnetize(view);
  magnetize(document.getElementById("site-nav"));
  tilt(view);
  parallax(view);
  imageFade(view);
  countUp(view);
  marqueeVelocity(view);
  observeReveals(footer);
  parallax(footer);
};

addEventListener("hashchange", () => { closeAllOverlays(); navigate(afterRender); });

onLangChange(() => {
  document.querySelector(".skip-link").textContent = t("skip");
  nav.redraw();
  renderFooter(footer);
  navigate(afterRender);
});

const skip = document.querySelector(".skip-link");
skip.textContent = t("skip");
skip.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("view").focus(); });
navigate(afterRender);
