/* Signed-in web — small UI helpers in the Bloom mobile style:
   duotone line icons (1.6 stroke, 16% fill), 40×40 icon tiles with 12px
   radius, status pills, key/value rows, document rows. Buttons never carry
   icons (brand rule). The Bloom GPT mark is the Siri orb, as in the app. */

export const esc = (s = "") => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const orb = (cls = "") => `<span class="siri ${cls}" aria-hidden="true"><i></i><i></i><i></i><i></i><em></em><u></u><b></b></span>`;

const P = {
  home: '<path d="M5 9.6 12 3l7 6.6V19a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19Z" fill="F" fill-opacity=".16"/><path d="M9.5 20.6V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6.6M3 11l9-8 9 8"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5" fill="F" fill-opacity=".16"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
  community: '<path d="M3 21h18"/><path d="M5 21V10l5-3v14" fill="F" fill-opacity=".16"/><path d="M10 21V4l9 4v13"/><path d="M13 10h3M13 13h3M13 16h3"/>',
  requests: '<circle cx="12" cy="12.5" r="8.5" fill="F" fill-opacity=".16"/><path d="M12 8v4.5l3 2M9.5 2.5h5M12 2.5V4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="F" fill-opacity=".16"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="m9 14.5 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4" fill="F" fill-opacity=".16"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="F" fill-opacity=".16"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  key: '<circle cx="8" cy="15" r="4" fill="F" fill-opacity=".16"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" fill="F" fill-opacity=".1"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  exit: '<path d="M13 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h7" fill="F" fill-opacity=".16"/><path d="M10 12h.01M15 12h6M18 9l3 3-3 3"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
  pass: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>', bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>', bug: '<rect x="8" y="7" width="8" height="12" rx="4"/><path d="M12 7V5M9.5 4.5 11 6M14.5 4.5 13 6M4 11h4M16 11h4M4 16h4M16 16h4"/>',
  broom: '<path d="M14 4 9 14M6 14h8l2 7H4l2-7Z"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>', coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  warn: '<path d="M10.3 4.3 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  statement: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>', fine: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-3-5.2"/>',
  stamp: '<path d="M9 3h6v6l-1 3h4a2 2 0 0 1 2 2v3H4v-3a2 2 0 0 1 2-2h4L9 9Z"/><path d="M4 21h16"/>',
  chev: '<path d="m9 6 6 6-6 6"/>', chevL: '<path d="m15 6-6 6 6 6"/>', chevD: '<path d="m6 9 6 6 6-6"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', arrowUR: '<path d="M7 17 17 7M8 7h9v9"/>',
  check: '<path d="m5 12 5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>', camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
  feedback: '<path d="M4 5h16v11H8l-4 4Z"/><path d="M8 9h8M8 12h5"/>', logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2" fill="F" fill-opacity=".1"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16a3 3 0 0 1 5 0M14 10h4M14 13h4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  track: '<path d="M3 12h4l3-8 4 16 3-8h4"/>', truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z"/>', instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16M8 7.8v.01M11.5 16v-5.5M11.5 13a2.5 2.5 0 0 1 5 0v3"/>', ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  send: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
export function icon(name, size = 20, color = "currentColor", cls = "") {
  return `<svg class="ai ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${(P[name] || "").replace(/="F"/g, `="${color}"`)}</svg>`;
}
export const unitIcon = (u) => (u.icon === "building" ? "building" : "home");
export const pill = (label, tone = "blue", extra = "") => `<span class="ap-pill" data-tone="${tone}" ${extra}>${esc(label)}</span>`;
export const rows = (list) => `<dl class="ap-rows">${list.filter(Boolean).map((r) => `<div class="ap-row"><dt>${esc(r[0])}</dt><dd>${r[2] ? r[1] : esc(r[1])}</dd></div>`).join("")}</dl>`;
export const tile = (name, color = "#922A22", bg) => `<span class="ap-tile" style="${bg ? `background:${bg};` : ""}">${icon(name, 20, color)}</span>`;
export const eyebrow = (t, right = "") => `<div class="ap-eb"><p class="ap-eyebrow">${esc(t)}</p>${right}</div>`;
export const docRows = (list) => list.map((d) => `<button type="button" class="ap-doc" data-doc="${esc(d[0])}"><span class="ap-tile">${icon("doc", 18, "#922A22")}</span><span class="ap-doc-t"><b>${esc(d[0])}</b><small>${esc(d[1])}</small></span>${icon("chev", 16, "#8A847A")}</button>`).join("");
export const hint = (text) => `<div class="ap-hint">${icon("info", 16, "#1A1A1A")}<span>${esc(text)}</span></div>`;
export const btn = (label, { kind = "primary", attrs = "", href } = {}) =>
  href ? `<a class="ap-btn ap-btn--${kind}" href="${href}" ${attrs}>${esc(label)}</a>` : `<button type="button" class="ap-btn ap-btn--${kind}" ${attrs}>${esc(label)}</button>`;
export const segmented = (opts, cur, attr = "data-seg") =>
  `<div class="ap-seg" role="tablist">${opts.map(([k, l, n]) => `<button type="button" role="tab" ${attr}="${k}" aria-selected="${k === cur}" class="${k === cur ? "is-on" : ""}">${esc(l)}${n != null ? ` <em>${n}</em>` : ""}</button>`).join("")}</div>`;
export const avatar = (name, cls = "") => `<span class="ap-av ${cls}">${esc(String(name).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase())}</span>`;
export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));
