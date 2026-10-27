/* Signed-in Bloom web — one route family (#/app/…) dispatched to the page
   modules in js/app/pages. ?journey=tenant|holiday|owner picks the demo
   journey (same as the mobile prototype). */

import * as st from "bloom:/js/app/store.js";
import { shell } from "bloom:/js/app/shell.js";

const PAGES = {
  "": () => import("bloom:/js/app/pages/dashboard.js"),
  property: () => import("bloom:/js/app/pages/property.js"),
  requests: () => import("bloom:/js/app/pages/requests.js"),
  moveout: () => import("bloom:/js/app/pages/moveout.js"),
  gpt: () => import("bloom:/js/app/pages/gpt.js"),
  bookings: () => import("bloom:/js/app/pages/bookings.js"),
  profile: () => import("bloom:/js/app/pages/account.js"),
  contact: () => import("bloom:/js/app/pages/account.js"),
  notifications: () => import("bloom:/js/app/pages/account.js"),
};

export function render(view, { a = "", b = "", query }) {
  const j = query && query.get("journey");
  if (j) st.setJourney(j);
  const key = PAGES[a] ? a : "";
  let cleanup = null, dead = false;
  view.innerHTML = '<div class="ap-loading" aria-hidden="true"></div>';
  PAGES[key]().then((mod) => {
    if (dead) return;
    const meta = mod.page({ view, shell: (opts) => shell(view, opts), a: key, b, query });
    cleanup = meta && meta.cleanup;
    if (meta && meta.title) document.title = `${meta.title} · Bloom Holding`;
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  return { title: "My Bloom", key: "app", cleanup: () => { dead = true; cleanup?.(); } };
}
