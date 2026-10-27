/* Signed-in Bloom web — shared state.
   Mirrors the mobile prototype: three demo journeys (Tenant · Holiday Home ·
   Owner + Resident), the same units and statuses, service requests, move-out
   requests, bookings and notifications. Everything lives in memory for the
   session (the journey choice is remembered in sessionStorage).
   PROTOTYPE: no backend — document details are sample data. */

const D = (y, m, d) => new Date(y, m - 1, d);
export const day0 = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const TODAY = day0(new Date());
export const addDays = (d, n) => { const x = day0(d); x.setDate(x.getDate() + n); return x; };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const fmt = (d) => `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
export const fmtS = (d) => `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
export const fmtDM = (d) => `${d.getDate()} ${MON[d.getMonth()]}`;
export const dow = (d) => DOW[d.getDay()];
export const mon = (d) => MON[d.getMonth()];
export const nights = (a, b) => Math.round((day0(b) - day0(a)) / 864e5);
export const nTxt = (n) => `${n} night${n === 1 ? "" : "s"}`;
export const gTxt = (n) => `${n} guest${n === 1 ? "" : "s"}`;
export const daysTo = (d) => Math.round((day0(d) - TODAY) / 864e5);

/* ---- events ---------------------------------------------------------------- */
const subs = new Set();
export const on = (fn) => { subs.add(fn); return () => subs.delete(fn); };
export const emit = (what) => subs.forEach((fn) => { try { fn(what); } catch (e) { console.error(e); } });

/* ---- journeys ---------------------------------------------------------------- */
export const JOURNEYS = {
  tenant: { id: "tenant", label: "Tenant", user: { name: "Sarah Tan", email: "sarah.tan@example.com", phone: "+971 50 123 4567", role: "Tenant" } },
  holiday: { id: "holiday", label: "Holiday Home", user: { name: "Layla Haddad", email: "layla.haddad@example.com", phone: "+971 55 214 8890", role: "Holiday home agent" } },
  owner: { id: "owner", label: "Owner + Resident", user: { name: "Omar Al Suwaidi", email: "omar.alsuwaidi@example.com", phone: "+971 52 377 6041", role: "Owner + Resident" } },
};
export const JOURNEY_ORDER = ["tenant", "holiday", "owner"];
let journeyId = "tenant";
try { journeyId = sessionStorage.getItem("bloom-journey") || "tenant"; } catch (e) {}
if (!JOURNEYS[journeyId]) journeyId = "tenant";
export const journey = () => JOURNEYS[journeyId];
export const isTenant = () => journeyId === "tenant";
export const isAgent = () => journeyId === "holiday";
export const isOwner = () => journeyId === "owner";
export const srRole = () => (journeyId === "holiday" ? "agent" : journeyId);
export function setJourney(id) {
  if (!JOURNEYS[id] || id === journeyId) return false;
  journeyId = id;
  try { sessionStorage.setItem("bloom-journey", id); } catch (e) {}
  reset();
  emit("journey");
  return true;
}
/* signed-in flag (prototype: set by Login / UAE PASS / Register) */
export const signIn = (id) => { if (id) setJourney(id); try { sessionStorage.setItem("bloom-signed-in", "1"); } catch (e) {} };
export const signOut = () => { try { sessionStorage.removeItem("bloom-signed-in"); } catch (e) {} };

/* ---- units ---------------------------------------------------------------------- */
const OMAR = "Omar Al Suwaidi";
const IMG = "https://images.ctfassets.net/pln0jx42xwdu/";
const COMM_IMG = {
  "Bloom Gardens": "oNa2RvwMVoCS0SG6SMZwa/36a6c6c16373c69111a4b879c098ff19/Bloom_Gardens_Hero_Image.jpg",
  "Bloom Towers": "2MrwOrFfHmrGZiPjsYCtVd/392163f6f08c2ae47d63592157492a68/Park_Views_hi-res-6.jpg",
  "Bloom Living": "1uqU1ghxiJqGANvRUmwRdK/0040fd801874a30b55c941ed2e56b5fa/Hero_Image.jpg",
  "Bloom Marina": "2JCR76zsBua3VemMpnzXze/c86fbb3d283269c32cf493ce3068ad86/3BR_TH_Back_View_25MB_Hero_Image.jpg",
};
export const unitImg = (u, w = 480) => `${IMG}${COMM_IMG[u.community] || COMM_IMG["Bloom Gardens"]}?w=${w}&q=72&fm=webp`;
function baseUnits() {
  return [
    { id: "v138", type: "4-Bedroom Villa", name: "Villa 138", community: "Bloom Gardens", code: "BG-P2-T-138", icon: "home", address: "Villa 138, Royal Palm Avenue",
      contract: { no: "TC-2025-01138", ejari: "0012025-048120", start: D(2025, 10, 11), end: D(2026, 10, 10), status: "Expiring soon", tone: "amber" } },
    { id: "a1204", type: "2-Bedroom Apartment", name: "Apt 1204", community: "Bloom Towers", code: "BT-A-1204", icon: "building", address: "Apt 1204, Tower A, Bloom Towers",
      contract: { no: "TC-2026-02204", ejari: "0012026-031877", start: D(2026, 3, 1), end: D(2027, 2, 28), status: "Active", tone: "green" } },
    { id: "a305", type: "Studio Apartment", name: "Apt 305", community: "Bloom Living", code: "BL-C-305", icon: "building", address: "Apt 305, Building C, Bloom Living",
      contract: { no: "TC-2026-00305", ejari: "0012026-052463", start: D(2026, 6, 15), end: D(2027, 6, 14), status: "Active", tone: "green" } },
  ];
}
function unitsFor(id) {
  const [v138, a1204, a305] = baseUnits();
  if (id === "tenant") { v138.ownerName = OMAR; return [v138]; }
  if (id === "holiday") {
    v138.ownerName = OMAR; a1204.ownerName = "Fatima Al Suwaidi"; a305.ownerName = "Khalid Rahman";
    [v138, a1204, a305].forEach((u, i) => { u.permit = { no: "HH-" + (20431 + i * 517), until: D(2027, 3 + i, 31) }; u.agreement = D(2025, 4 + i * 2, 1); });
    return [v138, a1204, a305];
  }
  v138.own = { status: "resident", moveIn: D(2024, 3, 12), owners: [[OMAR, 100, true]], spa: D(2022, 6, 14) };
  a1204.own = { status: "rented", owners: [[OMAR, 60, true], ["Fatima Al Suwaidi", 40, false]], spa: D(2021, 9, 2),
    tenancy: { tenant: "Rahul Verma", no: "TC-2025-11204", start: D(2025, 11, 29), end: D(2026, 11, 28), status: "Expiring soon", tone: "amber" } };
  a305.own = { status: "holiday", owners: [[OMAR, 100, true]], spa: D(2023, 1, 19), agent: "Layla Haddad", company: "Haven Holiday Homes LLC", hhContract: D(2025, 4, 1) };
  const v22 = { id: "v22", type: "3-Bedroom Villa", name: "Villa 22", community: "Bloom Gardens", code: "BG-P1-V-022", icon: "home", address: "Villa 22, Palm Grove Street",
    own: { status: "vacant", owners: [[OMAR, 100, true]], spa: D(2022, 2, 8), handover: D(2024, 11, 20) } };
  const o1810 = { id: "o1810", type: "1-Bedroom Apartment", name: "Apt 1810", community: "Bloom Marina", code: "BM-B-1810", icon: "building", address: "Apt 1810, Tower B, Bloom Marina",
    own: { status: "pending", owners: [[OMAR, 100, true]], spa: D(2024, 5, 30), paidPct: 70, outstanding: "AED 289,500", next: D(2026, 11, 15) } };
  return [v138, a1204, a305, v22, o1810];
}
export const S = { units: [], requests: [], moveouts: {}, bookings: [], notifs: [], bookingSeq: 2047, lastUnit: null, lastCommunity: null };
export const units = () => S.units;
export const unit = (id) => S.units.find((u) => u.id === id) || S.units[0];

export const ST_LABEL = { pending: "Payment pending", vacant: "Vacant", resident: "Resident", rented: "Rented", holiday: "Holiday home", guest: "Guest checked in", noguest: "No guest" };
export const ST_TONE = { pending: "amber", vacant: "grey", resident: "green", rented: "blue", holiday: "teal", guest: "green", noguest: "grey" };
export function unitStatus(u) {
  if (isOwner()) return u.own ? u.own.status : null;
  if (isAgent()) return S.bookings.some((b) => b.unit === u.id && b.status === "Checked in") ? "guest" : "noguest";
  return null;
}
export const canMoveOut = (u) => isTenant() || isAgent() || (isOwner() && u.own && u.own.status === "resident");

/* ---- service requests ---------------------------------------------------------- */
const OWN = ["owner"], TEN = ["tenant", "agent"];
const SC = { n: "Service Charge", i: "coins", roles: OWN };
export const SCOPES = {
  unit: { key: "unit", title: "My unit", team: "CRM Team", cats: [
    { id: "maintenance", name: "Maintenance", tag: "Repairs & fixes", icon: "wrench", color: "#922A22", subs: [{ n: "Plumbing", i: "drop" }, { n: "Electrical", i: "bolt" }, { n: "AC / HVAC", i: "snow" }, { n: "Pest Control", i: "bug" }] },
    { id: "payments", name: "Payments & Finance", tag: "Report a concern", icon: "card", color: "#8F5A1C", subs: [{ n: "Payment Issue", i: "warn" }, SC, { n: "Payment Receipt", i: "receipt" }, { n: "Statement of Account", i: "statement" }] },
    { id: "documents", name: "Property & Documents", tag: "Contracts & tenancy", icon: "doc", color: "#2F6F73", subs: [{ n: "Property Documents", i: "doc" }, { n: "Update Property Documents", i: "refresh" }, { n: "Tenancy Renewal", i: "refresh", roles: TEN }, { n: "Tenant / Occupant Update", i: "people", roles: TEN }, { n: "NOC / Clearance", i: "stamp", roles: TEN }] } ] },
  common: { key: "common", title: "Common areas", team: "Community Team", cats: [
    { id: "access", name: "Access & Visitors", tag: "Cards & visitor passes", icon: "pass", color: "#64748B", subs: [{ n: "Access Card", i: "card" }, { n: "Visitor Access", i: "pass" }] },
    { id: "maintenance", name: "Cleaning & Maintenance", tag: "Repairs & cleaning", icon: "wrench", color: "#922A22", subs: [{ n: "Water Leakage", i: "drop" }, { n: "Electrical", i: "bolt" }, { n: "AC / HVAC", i: "snow" }, { n: "Pest Control", i: "bug" }, { n: "Cleaning", i: "broom" }, { n: "Waste Management", i: "trash" }] },
    { id: "payments", name: "Payments & Finance", tag: "Report a concern", icon: "card", color: "#8F5A1C", subs: [{ n: "Payment Issue", i: "warn" }, SC, { n: "Community Fines", i: "fine" }, { n: "Payment Receipt", i: "receipt" }] } ] },
};
export const SUB_HINT = {
  Plumbing: "Pipes, taps, pressure", "Water Leakage": "Leaks, drips, seepage", Electrical: "Wiring, breakers, power", "AC / HVAC": "Cooling, thermostat, airflow", "Pest Control": "Insects, rodents, treatment",
  "Payment Issue": "Failed or incorrect payments", "Service Charge": "Charges & invoices", "Payment Receipt": "Download or resend", "Statement of Account": "Your account history", "Community Fines": "Dispute or pay a fine",
  "Property Documents": "Request a document", "Update Property Documents": "Replace or renew records", "Tenancy Renewal": "Extend your lease", "Tenant / Occupant Update": "Change occupant details", "NOC / Clearance": "Request an NOC",
  "Access Card": "New, lost or faulty cards", "Visitor Access": "Guest & visitor passes", Cleaning: "Common area cleaning", "Waste Management": "Bins & collection",
};
const allowed = (x) => !x.roles || x.roles.includes(srRole());
export const subsFor = (c) => c.subs.filter(allowed);
export const catsFor = (scope) => SCOPES[scope].cats.filter((c) => allowed(c) && subsFor(c).length);
const building = (u) => { const a = (u.address || "").split(","); a.shift(); return a.join(",").trim() || u.community; };
export function places(scope) {
  if (scope === "unit") return S.units.map((u) => ({ id: u.id, name: u.name, meta: building(u), icon: u.icon === "building" ? "building" : "home", u }));
  const seen = new Map();
  S.units.forEach((u) => { if (!seen.has(u.community)) seen.set(u.community, { id: u.community, name: u.community, units: [u.name], icon: "community" }); else seen.get(u.community).units.push(u.name); });
  return [...seen.values()].map((c) => ({ ...c, meta: "Your units: " + c.units.join(", ") }));
}
export const REQ_STATUS = { Submitted: "blue", "In Progress": "amber", Completed: "green", Rejected: "grey" };
function seedRequests() {
  const u = S.units[0];
  const loc = `${u.name} · ${u.community}`;
  return [
    { id: "SR-9042", scope: "unit", categoryId: "maintenance", category: "Maintenance", subcategory: "AC / HVAC", title: "AC Filter Check", description: "AC in the master bedroom isn’t cooling and the filter needs checking.", location: loc, preferred: "3 Aug", attachments: ["IMG_2471.jpg", "IMG_2472.jpg"], status: "In Progress", submitted: addDays(TODAY, -6), team: "CRM Team", progress: 60 },
    { id: "SR-9038", scope: "unit", categoryId: "maintenance", category: "Maintenance", subcategory: "Plumbing", title: "Kitchen tap leaking", description: "The kitchen mixer tap drips constantly.", location: loc, attachments: [], status: "Submitted", submitted: addDays(TODAY, -2), team: "CRM Team", progress: 8 },
    { id: "SR-9021", scope: "common", categoryId: "maintenance", category: "Cleaning & Waste", subcategory: "Cleaning", title: "Deep cleaning", description: "Lobby and lift area need a deep clean.", location: `Common areas · ${u.community}`, attachments: [], status: "Submitted", submitted: addDays(TODAY, -1), team: "Community Team", progress: 8 },
    { id: "SR-8977", scope: "unit", categoryId: "maintenance", category: "Maintenance", subcategory: "Electrical", title: "Living room sockets", description: "Two sockets stopped working.", location: loc, attachments: [], status: "Completed", submitted: addDays(TODAY, -34), team: "CRM Team", progress: 100 },
    { id: "SR-8941", scope: "common", categoryId: "access", category: "Access & Visitors", subcategory: "Access Card", title: "Extra access card", description: "Request for a second access card.", location: `Common areas · ${u.community}`, attachments: [], status: "Rejected", submitted: addDays(TODAY, -51), team: "Community Team", progress: 100 },
    { id: "SR-8902", scope: "unit", categoryId: "payments", category: "Payments & Finance", subcategory: "Payment Receipt", title: "Payment receipt", description: "Need the receipt for cheque 2.", location: loc, attachments: [], status: "Rejected", submitted: addDays(TODAY, -77), team: "CRM Team", progress: 100 },
  ];
}
let reqSeq = 9043;
export const requests = () => S.requests;
export const activeRequests = () => S.requests.filter((r) => r.status === "Submitted" || r.status === "In Progress");
export const pastRequests = () => S.requests.filter((r) => r.status === "Completed" || r.status === "Rejected");
export const request = (id) => S.requests.find((r) => r.id === id);
export function addRequest(rec) {
  const r = { status: "Submitted", submitted: TODAY, attachments: [], progress: 8, ...rec, id: "SR-" + reqSeq++ };
  S.requests.unshift(r);
  emit("requests");
  return r;
}

/* ---- move-out ------------------------------------------------------------------ */
export const MO_ST = {
  submitted: { pill: "Submitted", tone: "blue", steps: ["d", "c", ""], sub: ["", "NOC uploaded · being verified", ""],
    note: { t: "Move-out request submitted", p: "You uploaded the owner’s No Objection Certificate (NOC). BCM will verify it and then review your request." } },
  nocApproved: { pill: "NOC Approved", tone: "green", steps: ["d", "d", "c"], sub: ["", "NOC verified", "Waiting for BCM approval"],
    note: { t: "NOC verified", p: "BCM verified the owner’s NOC and is now reviewing your request and checking for outstanding dues (gas clearance, chilled water)." } },
  nocRejected: { pill: "NOC Rejected", tone: "red", steps: ["d", "x", ""], sub: ["", "NOC not accepted", ""],
    note: { t: "The NOC couldn’t be verified", p: "The NOC you uploaded couldn’t be verified. Submit a new move-out request with a valid NOC from the owner, or contact support." } },
  needInfo: { pill: "Need info", tone: "amber", steps: ["d", "d", "c"], sub: ["", "NOC verified", "BCM needs more information"],
    note: { t: "BCM needs more information", p: "Please share your final DEWA bill and confirm your forwarding address so BCM can complete the review." } },
  bcmApproved: { pill: "Approved", tone: "green", steps: ["d", "d", "d"], sub: ["", "NOC verified", "Approved by BCM"],
    note: { t: "Move-out approved", p: "BCM approved your move-out. Security has your date; return access cards on the day." } },
  bcmRejected: { pill: "Rejected", tone: "red", steps: ["d", "d", "x"], sub: ["", "NOC verified", "Rejected by BCM"],
    note: { t: "Move-out rejected", p: "BCM couldn’t approve this request because of outstanding dues. Clear them and submit a new request." } },
};
export const MO_ORDER = ["submitted", "nocApproved", "nocRejected", "needInfo", "bcmApproved", "bcmRejected"];
export const moveout = (unitId) => S.moveouts[unitId] || null;
export function setMoveout(unitId, rec) { if (rec) S.moveouts[unitId] = rec; else delete S.moveouts[unitId]; emit("moveout"); }

/* ---- bookings (holiday home agent) ------------------------------------------------ */
const NAMES = [["Sara Khan", "Pakistan"], ["Daniel Moore", "United Kingdom"], ["Lina Haddad", "Lebanon"], ["Arjun Mehta", "India"], ["Mia Schneider", "Germany"], ["Omar Farouk", "Egypt"], ["Chloe Martin", "France"], ["Yusuf Ali", "UAE"], ["Hana Sato", "Japan"]];
export function docFor(name, nat, i) {
  const eid = nat === "UAE" || i % 3 === 0;
  return { name, nat, type: eid ? "Emirates ID" : "Passport", no: eid ? `784-••••-•••${(4210 + i * 37) % 10000}-${(i % 9) + 1}` : `${nat[0].toUpperCase()}••••${String(5821 + i * 913).slice(-4)}`, exp: addDays(TODAY, 400 + i * 97) };
}
export function party(lead, nat, n, seed = 0) { const g = [docFor(lead, nat || "United Kingdom", seed)]; for (let i = 1; i < n; i++) { const x = NAMES[(i + seed) % NAMES.length]; g.push(docFor(x[0], x[1], i + seed)); } return g; }
function mk(id, unitId, lead, nat, inO, outO, n, status, phone) {
  const cin = addDays(TODAY, inO), cout = addDays(TODAY, outO);
  return { id, unit: unitId, guests: party(lead, nat, n, id.charCodeAt(5) % 5), checkIn: cin, checkOut: cout, status, phone: phone || `+971 50 ${300 + (id.charCodeAt(4) % 600)} ${1000 + ((id.charCodeAt(5) * 7) % 9000)}`,
    submitted: addDays(cin, inO > 0 ? -inO : -2), checkedOutAt: status === "Checked out" ? cout : null };
}
export const BK_TONE = { "Checked in": "green", Upcoming: "blue", "Checked out": "grey", Cancelled: "red" };
export const bookings = () => S.bookings;
export const booking = (id) => S.bookings.find((b) => b.id === id);
export const ongoing = () => S.bookings.filter((b) => b.status === "Checked in" || b.status === "Upcoming").sort((a, b) => a.checkIn - b.checkIn);
export const past = () => S.bookings.filter((b) => b.status === "Checked out" || b.status === "Cancelled").sort((a, b) => b.checkOut - a.checkOut);
export const byGuest = (name) => { const k = String(name).trim().toLowerCase(); return S.bookings.filter((b) => b.guests[0].name.toLowerCase() === k).sort((a, b) => b.checkIn - a.checkIn); };
export function addBooking(b) { const rec = { id: "BK-" + S.bookingSeq++, submitted: TODAY, ...b }; S.bookings.unshift(rec); emit("bookings"); return rec; }
export const bookingsChanged = () => emit("bookings");

/* ---- notifications ------------------------------------------------------------------ */
function seedNotifs() {
  const u = S.units[0];
  const base = [
    { id: 2, g: "Today", t: "9:05 am", cat: "request", ic: "wrench", unread: true, title: "AC Filter Check is in progress", body: "A technician is assigned to SR-9042. Expected visit: 3 Aug, 10 am – 12 pm.", go: "#/app/requests/SR-9042" },
    { id: 5, g: "Yesterday", t: "11:15 am", cat: "request", ic: "wrench", title: "Kitchen tap leaking — submitted", body: "SR-9038 was received by the Unit Maintenance team.", go: "#/app/requests/SR-9038" },
    { id: 6, g: "Earlier", t: "Mon", cat: "community", ic: "megaphone", title: "Pool maintenance on 25 Oct", body: `The ${u.community} pool will be closed from 7 am to 1 pm.` },
    { id: 7, g: "Earlier", t: "Sun", cat: "request", ic: "pass", title: "Gate pass approved", body: "Your visitor pass for 22 Oct is ready. Share it with your guest at the gate." },
    { id: 8, g: "Earlier", t: "12 Oct", cat: "account", ic: "user", title: "Welcome to Bloom", body: "Your account is verified. You can now raise requests and manage your properties.", go: "#/app/profile" },
  ];
  if (isTenant()) base.unshift(
    { id: 1, g: "Today", t: "10:24 am", cat: "tenancy", ic: "exit", unread: true, title: "Move-out made simple", body: "You can now raise a move-out request with Bloom GPT from Property details.", go: "#/app/property/v138" },
    { id: 3, g: "Today", t: "8:00 am", cat: "payment", ic: "card", unread: true, title: "Rent cheque due in 5 days", body: "Cheque 3 of 4 · AED 71,250 for Villa 138 will be presented on 28 Oct." },
    { id: 4, g: "Yesterday", t: "6:40 pm", cat: "tenancy", ic: "doc", title: "Tenancy contract expiring soon", body: "Renew Villa 138 before 10 Oct 2026 to keep your access active.", go: "#/app/property/v138" });
  if (isAgent()) base.unshift(
    { id: 11, g: "Today", t: "10:02 am", cat: "booking", ic: "key", unread: true, title: "Guest checked in · BK-2041", body: "Ahmed Khan’s party of 3 checked in to Villa 138. Security has the guest list.", go: "#/app/bookings/BK-2041" },
    { id: 12, g: "Today", t: "8:40 am", cat: "booking", ic: "calendar", unread: true, title: "Upcoming arrival in 3 days", body: "Elena Petrova (BK-2046) arrives at Apt 1204.", go: "#/app/bookings/BK-2046" });
  if (isOwner()) base.unshift(
    { id: 21, g: "Today", t: "9:30 am", cat: "payment", ic: "card", unread: true, title: "Instalment 8 due on 15 Nov", body: "AED 96,500 for Apt 1810 · Bloom Marina.", go: "#/app/property/o1810" },
    { id: 22, g: "Yesterday", t: "4:10 pm", cat: "tenancy", ic: "doc", title: "Tenancy for Apt 1204 expiring soon", body: "Rahul Verma’s contract ends on 28 Nov 2026.", go: "#/app/property/a1204" });
  return base;
}
export const notifs = () => S.notifs;
export const unreadCount = () => S.notifs.filter((n) => n.unread).length;
export function markAllRead() { S.notifs.forEach((n) => (n.unread = false)); emit("notifs"); }
export function markRead(id) { const n = S.notifs.find((x) => x.id === id); if (n && n.unread) { n.unread = false; emit("notifs"); } }

/* ---- reset per journey --------------------------------------------------------------- */
export function reset() {
  S.units = unitsFor(journeyId);
  reqSeq = 9043;
  S.requests = seedRequests();
  S.moveouts = {};
  S.bookingSeq = 2047;
  S.bookings = isAgent() ? [
    mk("BK-2041", "v138", "Ahmed Khan", "Pakistan", -2, 2, 3, "Checked in", "+971 50 412 7781"),
    mk("BK-2046", "a1204", "Elena Petrova", "Russia", 3, 7, 2, "Upcoming", "+971 55 903 1146"),
    mk("BK-2038", "a305", "James Walker", "United Kingdom", -11, -8, 1, "Checked out"),
    mk("BK-2029", "v138", "Priya Nair", "India", -25, -20, 4, "Checked out"),
    mk("BK-2023", "a305", "Tom Becker", "Germany", -40, -38, 1, "Cancelled"),
    mk("BK-2017", "a1204", "Ahmed Khan", "Pakistan", -62, -58, 2, "Checked out"),
  ] : [];
  S.notifs = seedNotifs();
  S.lastUnit = S.units[0].id;
  S.lastCommunity = S.units[0].community;
}
reset();

/* ---- one-shot intent handed to Bloom GPT ----------------------------------------------- */
let intent = null;
export const setIntent = (x) => { intent = x; };
export const takeIntent = () => { const x = intent; intent = null; return x; };
