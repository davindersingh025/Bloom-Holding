/* Bloom GPT — ask anything about Bloom in one conversation.
   Landing: greeting + date, heading, a large ask bar with a rotating
   typewriter placeholder, and "Try asking" chips. Asking anything turns the
   page into a conversation: the hero folds away, the ask bar docks at the
   bottom and Bloom GPT streams its answer with cards and links built from
   the site's own content (communities, divisions, owner portal, contact).
   PROTOTYPE: answers come from simple intent matching over local data —
   there is no model or backend, and nothing typed leaves the browser. */

import { icon, esc, arrow } from "bloom:/js/ui/dom.js";
import { getLang, setLang } from "bloom:/js/i18n.js";
import { themeToggle } from "bloom:/js/ui/theme.js";
import { reducedMotion } from "bloom:/js/ui/motion.js";
import { DIVISIONS, PROJECTS, CONTACT, imgLite } from "bloom:/js/data.js";

const COPY = {
  en: {
    back: "Back to home",
    morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening",
    eyebrow: "Bloom GPT",
    titleA: "Everything Bloom,", titleB: "in one conversation.",
    sub: "Ask Bloom GPT to find a home, explain your payments or help you get something done.",
    ph: ["What needs my attention?", "Find a 3-bedroom villa in Abu Dhabi", "Which Bloom schools are near me?", "Book a stay at a Bloom hotel", "How do I track my payments?"],
    label: "Ask Bloom GPT",
    send: "Send", tryAsking: "Try asking", thinking: "Thinking",
    newChat: "New chat", proto: "Prototype · answers come from Bloom's public information",
  },
  ar: {
    back: "العودة للرئيسية",
    morning: "صباح الخير", afternoon: "مساء الخير", evening: "مساء الخير",
    eyebrow: "Bloom GPT",
    titleA: "كل ما يخص بلوم،", titleB: "في محادثة واحدة.",
    sub: "اسأل Bloom GPT ليجد لك منزلاً أو يشرح دفعاتك أو يساعدك في إنجاز ما تحتاجه.",
    ph: ["ما الذي يحتاج انتباهي؟", "ابحث عن فيلا بثلاث غرف في أبوظبي", "ما مدارس بلوم القريبة مني؟", "احجز إقامة في فندق بلوم", "كيف أتابع دفعاتي؟"],
    label: "اسأل Bloom GPT",
    send: "إرسال", tryAsking: "جرّب أن تسأل", thinking: "يفكّر",
    newChat: "محادثة جديدة", proto: "نموذج أولي · الإجابات من معلومات بلوم العامة",
  },
};

/* "Try asking" chips: [intent, icon, EN, AR] */
const CHIPS = [
  ["attention", "bell", "What needs my attention?", "ما الذي يحتاج انتباهي؟"],
  ["home", "home", "Find a home", "ابحث عن منزل"],
  ["payments", "wallet", "Show my payments", "اعرض دفعاتي"],
  ["progress", "building", "Construction progress", "تقدّم البناء"],
  ["education", "school", "Find a school", "ابحث عن مدرسة"],
  ["hospitality", "bed", "Book a hotel stay", "احجز إقامة فندقية"],
  ["retail", "bag", "Shop & dine", "تسوّق وتناول الطعام"],
  ["landscape", "leaf", "Landscaping services", "خدمات تنسيق الحدائق"],
  ["facilities", "wrench", "Maintenance request", "طلب صيانة"],
  ["communities", "pin", "Explore communities", "استكشف المجتمعات"],
  ["portal", "key", "Take me to the owner portal", "خذني إلى بوابة الملاك"],
  ["help", "headset", "Help", "المساعدة"],
];

/* Keyword → intent (first match wins; order matters) */
const INTENTS = [
  ["attention", /attention|today|what'?s new|news|update|انتباه|جديد/],
  ["payments", /pay|payment|invoice|due|fee|دفع|دفعات/],
  ["progress", /progress|construction|handover|build|بناء|تسليم/],
  ["portal", /portal|owner|document|profile|account|بوابة|مالك|حساب/],
  ["register", /register|sign ?up|join|create|تسجيل/],
  ["education", /school|nurser|education|college|academy|مدرس|تعليم|حضان/],
  ["hospitality", /hotel|stay|hospitality|room|resort|فندق|إقامة/],
  ["retail", /shop|dine|dining|retail|restaurant|mall|supermarket|تسوق|مطعم/],
  ["landscape", /landscap|garden|irrigation|hardscape|حديقة|حدائق/],
  ["facilities", /mainten|repair|facilit|fix|leak|ac\b|صيانة|إصلاح/],
  ["communities", /communit|project|mejs|مجتمع|مشروع/],
  ["home", /home|villa|apartment|townhouse|buy|rent|property|propert|bedroom|منزل|فيلا|شقة|عقار/],
  ["help", /help|contact|support|call|email|phone|مساعدة|تواصل|دعم/],
];

export function render(view) {
  const L = () => COPY[getLang()] || COPY.en;
  const ar = () => getLang() === "ar";
  const RM = reducedMotion();
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? L().morning : hour < 18 ? L().afternoon : L().evening;
  const dateStr = now.toLocaleDateString(ar() ? "ar-AE" : "en-GB", { weekday: "long", day: "numeric", month: "long" });

  view.innerHTML = `
    <section class="gpt" data-state="home">
      <div class="gpt__bg" aria-hidden="true"><span></span><span></span><span></span></div>

      <header class="gpt__top">
        <a class="gpt__back" href="#/" aria-label="${L().back}">${icon("chevronLeft", 18, "icon--dir")} <span class="gpt__back-label">${L().back}</span></a>
        <div class="gpt__top-end">
          <button class="gpt__new" type="button" data-new hidden aria-label="${L().newChat}">${icon("return", 15)} <span class="gpt__new-label">${L().newChat}</span></button>
          ${themeToggle()}
          <div class="seg" role="group" aria-label="Language">
            <button class="seg__btn" data-lang="en" aria-pressed="${!ar()}">EN</button>
            <button class="seg__btn" data-lang="ar" aria-pressed="${ar()}" lang="ar">عربي</button>
          </div>
        </div>
      </header>

      <div class="gpt__hero" data-hero>
        <p class="gpt__greet"><span class="gpt-ball" aria-hidden="true"></span>${esc(greet)}<span class="gpt__dot" aria-hidden="true"></span>${esc(dateStr)}</p>
        <p class="gpt__eyebrow">${icon("sparkle", 16)} ${L().eyebrow}</p>
        <h1 class="gpt__title"><span class="gpt__title-a">${L().titleA}</span> <span class="gpt__title-b">${L().titleB}</span></h1>
        <p class="gpt__sub">${L().sub}</p>
      </div>

      <div class="gpt__log" data-log role="log" aria-live="polite" aria-relevant="additions"></div>

      <form class="gpt__ask" data-ask autocomplete="off">
        <span class="gpt-ball gpt-ball--lg" aria-hidden="true" data-ball></span>
        <label class="sr-only" for="gpt-input">${L().label}</label>
        <input id="gpt-input" class="gpt__input" data-input type="text" enterkeyhint="send" />
        <span class="gpt__ph" data-ph aria-hidden="true"></span>
        <kbd class="gpt__kbd" aria-hidden="true">Enter ↵</kbd>
        <button class="gpt__send" type="submit" aria-label="${L().send}">${icon("arrowDown", 20, "gpt__send-ic")}</button>
      </form>

      <div class="gpt__try" data-try>
        <p class="gpt__try-label">${L().tryAsking}</p>
        <ul class="gpt__chips">${CHIPS.map(([id, ic, en, a], i) => `<li style="--i:${i}"><button class="gpt__chip" type="button" data-chip="${id}">${icon(ic, 18)}<span>${esc(ar() ? a : en)}</span></button></li>`).join("")}</ul>
        <p class="gpt__proto">${icon("shield", 13)} ${L().proto}</p>
      </div>
    </section>`;

  const section = view.querySelector(".gpt");
  const log = view.querySelector("[data-log]");
  const form = view.querySelector("[data-ask]");
  const input = view.querySelector("[data-input]");
  const phEl = view.querySelector("[data-ph]");
  const ball = view.querySelector("[data-ball]");
  let busy = false, alive = true;
  const timers = new Set();
  const wait = (ms) => new Promise((res) => { const id = setTimeout(() => { timers.delete(id); res(); }, RM ? 0 : ms); timers.add(id); });
  const toBottom = () => requestAnimationFrame(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: RM ? "auto" : "smooth" }));

  /* ---- Rotating typewriter placeholder --------------------------------------- */
  let phRun = 0;
  async function placeholderLoop(run) {
    const list = L().ph;
    if (RM) { phEl.textContent = list[0]; return; }
    for (let n = 0; alive && run === phRun; n = (n + 1) % list.length) {
      const text = list[n];
      for (let i = 1; i <= text.length && run === phRun; i++) { phEl.textContent = text.slice(0, i); await wait(42); }
      await wait(1800);
      for (let i = text.length; i >= 0 && run === phRun; i--) { phEl.textContent = text.slice(0, i); await wait(18); }
      await wait(300);
    }
  }
  const syncPh = () => section.classList.toggle("has-text", Boolean(input.value));
  input.addEventListener("input", syncPh);
  placeholderLoop(++phRun);

  /* ---- Conversation ---------------------------------------------------------------- */
  function enterChat() {
    if (section.dataset.state === "chat") return;
    section.dataset.state = "chat";
    view.querySelector("[data-new]").hidden = false;
  }
  function userMsg(text) {
    const row = document.createElement("div");
    row.className = "gpt__row gpt__row--user";
    row.innerHTML = `<div class="gpt__bubble gpt__bubble--user">${esc(text)}</div>`;
    log.appendChild(row);
    toBottom();
  }
  async function botMsg({ text, html = "" }) {
    const row = document.createElement("div");
    row.className = "gpt__row gpt__row--bot is-thinking";
    row.innerHTML = `<span class="gpt-ball" aria-hidden="true"></span><div class="gpt__bubble"><span class="gpt__thinking">${L().thinking}<i></i><i></i><i></i></span></div>`;
    log.appendChild(row);
    ball.classList.add("is-thinking");
    toBottom();
    await wait(900);
    const bubble = row.querySelector(".gpt__bubble");
    const words = text.split(/(\s+)/);
    bubble.innerHTML = `<p class="gpt__text"><span class="sr-only">${esc(text)}</span><span aria-hidden="true">${words.map((w, i) => (/^\s+$/.test(w) ? " " : `<span class="gpt__w" style="--wi:${i}">${esc(w)}</span>`)).join("")}</span></p>`;
    row.classList.replace("is-thinking", "is-speaking");
    ball.classList.replace("is-thinking", "is-speaking");
    await wait(Math.min(3000, words.length * 30 + 300));
    if (html) {
      const extra = document.createElement("div");
      extra.className = "gpt__extra";
      extra.innerHTML = html;
      bubble.appendChild(extra);
    }
    row.classList.remove("is-speaking");
    ball.classList.remove("is-speaking");
    toBottom();
  }

  /* Answer builders — all content comes from data.js */
  const card = (href, image, title, sub, i) => `
    <a class="gpt-card" href="${href}" style="--i:${i}">
      <span class="gpt-card__img">${image ? `<img src="${imgLite(image, 360)}" alt="" loading="lazy" />` : ""}</span>
      <span class="gpt-card__body"><strong>${esc(title)}</strong>${sub ? `<span>${esc(sub)}</span>` : ""}</span>
      ${icon("arrowUpRight", 16)}
    </a>`;
  const actions = (list) => `<div class="gpt__actions">${list.map(([href, label, primary], i) => `<a class="gpt__action ${primary ? "is-primary" : ""}" href="${href}" style="--i:${i}">${esc(label)}${primary ? arrow(15) : ""}</a>`).join("")}</div>`;
  const follow = (ids) => `<div class="gpt__follow">${ids.map((id, i) => { const c = CHIPS.find((x) => x[0] === id); return `<button class="gpt__chip gpt__chip--sm" type="button" data-chip="${id}" style="--i:${i}">${icon(c[1], 15)}<span>${esc(ar() ? c[3] : c[2])}</span></button>`; }).join("")}</div>`;
  const division = (id) => DIVISIONS.find((d) => d.id === id);

  function answer(intent, raw) {
    const A = ar();
    switch (intent) {
      case "attention": return {
        text: A ? "إليك أبرز ما يحدث في بلوم الآن:" : "Here's what's worth your attention at Bloom right now:",
        html: `<ul class="gpt__list">
          <li style="--i:0">${icon("building", 16)}<span><strong>${PROJECTS.length} ${A ? "مجتمعاً" : "communities"}</strong> ${A ? "متاحة للاستفسار في أبوظبي ودبي والعين" : "open for enquiries across Abu Dhabi, Dubai and Al Ain"}</span></li>
          <li style="--i:1">${icon("wallet", 16)}<span><strong>${A ? "دفعاتك وتقدّم البناء" : "Your payments & construction progress"}</strong> ${A ? "— سجّل الدخول إلى بوابة الملاك لرؤيتها" : "— sign in to the owner portal to see them live"}</span></li>
          <li style="--i:2">${icon("school", 16)}<span><strong>${A ? "التسجيل المدرسي" : "School admissions"}</strong> ${A ? "مفتوح في مدارس برايتون كوليدج بلوم" : "are open at Brighton College Bloom schools"}</span></li>
        </ul>${actions([["#/login", A ? "تسجيل الدخول" : "Sign in", true], ["#/properties", A ? "استكشف العقارات" : "Explore properties"]])}${follow(["payments", "home", "help"])}`,
      };
      case "home": case "communities": {
        const list = PROJECTS.filter((p) => p.images?.length).slice(0, 4);
        return {
          text: A ? `لدى بلوم ${PROJECTS.length} مجتمعاً. إليك بعض أبرزها:` : `Bloom has ${PROJECTS.length} communities. Here are a few to start with:`,
          html: `<div class="gpt__cards">${list.map((p, i) => card(`#/project/${p.id}`, p.images[0], p.name, p.collection, i)).join("")}</div>${actions([["#/properties", A ? `عرض كل ${PROJECTS.length} مجتمعاً` : `View all ${PROJECTS.length} communities`, true]])}${follow(["education", "payments", "help"])}`,
        };
      }
      case "education": case "hospitality": case "retail": {
        const d = division(intent);
        const lead = { education: A ? "هذه مدارس وحضانات بلوم:" : "Here are Bloom's schools and nurseries:", hospitality: A ? "يمكنك الإقامة في فنادق بلوم هذه:" : "You can stay at these Bloom hotels:", retail: A ? "وجهات بلوم للتسوق وتناول الطعام:" : "Bloom's places to shop and dine:" }[intent];
        return {
          text: lead,
          html: `<div class="gpt__cards">${(d.offerings || []).slice(0, 4).map((o, i) => card(d.route, o.image, o.name, o.sub, i)).join("")}</div>${actions([[d.route, A ? `استكشف ${d.name}` : `Explore ${d.name}`, true]])}${follow(["home", "hospitality", "help"].filter((x) => x !== intent))}`,
        };
      }
      case "landscape": case "facilities": {
        const d = division(intent);
        return {
          text: intent === "landscape" ? (A ? "تقدم بلوم لاندسكيب هذه الخدمات:" : "Bloom Landscape can help with:") : (A ? "لطلبات الصيانة، تقدم بلوم لإدارة المرافق:" : "For maintenance, Bloom Facilities Management offers:"),
          html: `<ul class="gpt__list gpt__list--tags">${(d.offerings || []).map((o, i) => `<li style="--i:${i}">${icon("check", 14)}<span>${esc(o.name)}</span></li>`).join("")}</ul>${actions([[d.route, A ? "عرض الخدمات" : "View services", true], [CONTACT.tollFreeHref, `${A ? "اتصل" : "Call"} ${CONTACT.tollFree}`]])}${follow(["help", "home"])}`,
        };
      }
      case "payments": case "progress": case "portal": return {
        text: intent === "payments" ? (A ? "دفعاتك وفواتيرك وتنبيهاتها موجودة في بوابة الملاك. سجّل الدخول لرؤيتها — أو أنشئ حساباً إن كنت جديداً." : "Your payments, invoices and due-date alerts live in the owner portal. Sign in to see them — or register if you're new.")
          : intent === "progress" ? (A ? "يمكنك متابعة تقدّم البناء لكل وحدة مع تحديثات مباشرة داخل بوابة الملاك." : "You can follow construction progress for each of your units, with live updates, inside the owner portal.")
          : (A ? "بوابة الملاك تجمع عقاراتك ودفعاتك ومستنداتك في مكان واحد." : "The owner portal brings your properties, payments and documents together in one place."),
        html: `<ul class="gpt__list">
          <li style="--i:0">${icon("building", 16)}<span>${A ? "إدارة العقارات ومتابعة البناء" : "Property management & construction tracking"}</span></li>
          <li style="--i:1">${icon("wallet", 16)}<span>${A ? "متابعة الدفعات مع تنبيهات فورية" : "Payment tracking with real-time alerts"}</span></li>
          <li style="--i:2">${icon("shield", 16)}<span>${A ? "منصة آمنة ومشفّرة" : "Secure, encrypted platform"}</span></li>
        </ul>${actions([["#/login", A ? "تسجيل الدخول" : "Sign in", true], ["#/register", A ? "التسجيل" : "Register"], ["#/portal", A ? "كيف تعمل البوابة" : "How the portal works"]])}`,
      };
      case "register": return {
        text: A ? "يمكنك التسجيل خلال دقيقتين مع Bloom GPT — فقط الهوية ومستند العقار والبريد والهاتف." : "You can register in about two minutes with Bloom GPT — just your Emirates ID, a property document, email and phone.",
        html: actions([["#/register", A ? "ابدأ التسجيل" : "Start registration", true]]),
      };
      case "help": return {
        text: A ? "يسعدنا مساعدتك. تواصل مع فريق بلوم مباشرة:" : "Happy to help. You can reach the Bloom team directly:",
        html: `<ul class="gpt__list">
          <li style="--i:0">${icon("phone", 16)}<span><a href="${CONTACT.tollFreeHref}">${CONTACT.tollFree}</a> ${A ? "(مجاني)" : "(toll free)"}</span></li>
          <li style="--i:1">${icon("globe", 16)}<span><a href="${CONTACT.internationalHref}">${CONTACT.international}</a> ${A ? "(من خارج الإمارات)" : "(outside UAE)"}</span></li>
          <li style="--i:2">${icon("mail", 16)}<span><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></span></li>
        </ul>${follow(["attention", "home", "portal"])}`,
      };
      default: {
        /* A community mentioned by name? */
        const hit = PROJECTS.find((p) => raw.toLowerCase().includes(p.name.toLowerCase().replace(/^bloom\s+/, "")));
        if (hit) return {
          text: A ? `إليك ${hit.name}:` : `Here's ${hit.name}:`,
          html: `<div class="gpt__cards">${card(`#/project/${hit.id}`, hit.images?.[0], hit.name, hit.collection, 0)}</div>`,
        };
        return {
          text: A ? "لست متأكداً من ذلك بعد — لكن يمكنني المساعدة في المنازل والمدارس والفنادق والصيانة وبوابة الملاك. جرّب أحد هذه:" : "I'm not sure about that one yet — but I can help with homes, schools, hotels, maintenance and the owner portal. Try one of these:",
          html: follow(["home", "education", "hospitality", "portal", "help"]),
        };
      }
    }
  }

  async function ask(text, intent) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    enterChat();
    userMsg(text);
    input.value = ""; syncPh();
    const id = intent || (INTENTS.find(([, re]) => re.test(text.toLowerCase())) || [])[0];
    try { await botMsg(answer(id, text)); } finally { busy = false; }
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
  view.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-chip]");
    if (!chip) return;
    const c = CHIPS.find((x) => x[0] === chip.dataset.chip);
    ask(ar() ? c[3] : c[2], c[0]);
  });
  view.querySelector("[data-new]").addEventListener("click", () => {
    log.innerHTML = ""; section.dataset.state = "home"; view.querySelector("[data-new]").hidden = true;
    scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); input.focus({ preventScroll: true });
  });
  view.querySelectorAll(".seg [data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  /* "/" focuses the ask bar */
  const onKey = (e) => { if (e.key === "/" && document.activeElement !== input) { e.preventDefault(); input.focus(); } };
  document.addEventListener("keydown", onKey);
  requestAnimationFrame(() => input.focus({ preventScroll: true }));

  return {
    title: "Bloom GPT",
    key: "gpt",
    cleanup: () => { alive = false; phRun++; timers.forEach(clearTimeout); document.removeEventListener("keydown", onKey); },
  };
}
