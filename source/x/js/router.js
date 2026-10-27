/* Hash router with a short cross-fade between views.
   Routes mirror the original app:
     #/                 → /universal
     #/space/:id        → /universal-space?id=:id
     #/properties       → /guest
     #/project/:id      → /guest-details?id=:id
     #/portal           → /welcome   (?login=1 opens sign in) */

const routes = [];
export const route = (pattern, load) => {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "/?$");
  routes.push({ re, keys, load });
};

let cleanup = null;
let first = true;

export function parse() {
  const raw = location.hash.slice(1) || "/";
  const [path, qs = ""] = raw.split("?");
  return { path: path || "/", query: new URLSearchParams(qs) };
}

export async function navigate(onRendered) {
  const { path, query } = parse();

  /* In-page anchors like #divisions: let the page handle scroll */
  if (!path.startsWith("/")) return;

  const match = routes.map((r) => ({ r, m: r.re.exec(path) })).find((x) => x.m) || { r: routes[0], m: [] };
  const params = Object.fromEntries(match.r.keys.map((k, i) => [k, decodeURIComponent(match.m[i + 1])]));
  const view = document.getElementById("view");

  if (!first) {
    document.body.classList.add("is-routing");
    view.classList.remove("is-entering");
    view.classList.add("is-leaving");
    await new Promise((r) => setTimeout(r, 200));
  }

  cleanup?.();
  cleanup = null;
  const mod = await match.r.load();
  const meta = mod.render(view, { ...params, query });
  if (!meta) return;
  cleanup = meta.cleanup || null;
  document.title = `${meta.title} · Bloom Holding`;

  window.scrollTo({ top: 0, behavior: "instant" });
  view.classList.remove("is-leaving");
  if (!first) {
    void view.offsetWidth;
    view.classList.add("is-entering");
    view.addEventListener("animationend", () => view.classList.remove("is-entering"), { once: true });
  }
  document.body.classList.remove("is-routing");
  view.focus({ preventScroll: true });
  first = false;
  onRendered?.(meta, view);
}
