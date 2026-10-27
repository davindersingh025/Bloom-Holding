/* Register — conversational onboarding with Bloom GPT.
   A scripted assistant walks the visitor through registration by role:
     tenant    → Emirates ID (front/back) → tenancy contract → email → phone OTP
     owner     → Emirates ID (front/back) → title deed / SPA  → email → phone OTP
     agent     → Emirates ID (front/back) → holiday home permit → email → phone OTP
     searching → name → email → phone OTP
   PROTOTYPE: there is no OCR or backend. Uploaded files are previewed from
   memory only (object URLs) and never leave the browser; "extracted" details
   are demo data. Sample documents are generic illustrations marked SAMPLE. */

import { LOGO } from "bloom:/js/ui/logo.js";
import { icon, esc, siri } from "bloom:/js/ui/dom.js";
import { getLang, setLang } from "bloom:/js/i18n.js";
import { authReturnRoute } from "bloom:/js/ui/auth.js";
import { reducedMotion } from "bloom:/js/ui/motion.js";
import { toast } from "bloom:/js/ui/toast.js";
import { themeToggle } from "bloom:/js/ui/theme.js";

/* Pace of the streamed reply: delay per token (words and the spaces
   between them), matched by the .rg__w delay in css/register.css */
const WORD_MS = 36;

/* A smooth repeating wave across a 2400-wide viewBox (two identical halves,
   so translating by -50% loops seamlessly) — the Siri waveform in the background */
function wavePath(amp, period, width = 2400, y = 100) {
  let d = `M0 ${y} Q ${period / 4} ${y - amp} ${period / 2} ${y}`;
  for (let x = period; x <= width; x += period / 2) d += ` T ${x} ${y}`;
  return d;
}

/* ---- Copy (EN / AR) -------------------------------------------------------- */
const COPY = {
  en: {
    greet: "Hey there 👋 Great to see you! I'm Bloom GPT, here to help with anything property-related. What brings you by today?",
    owner: "I own a property", agent: "I'm a holiday home agent", tenant: "I'm a tenant", searching: "Searching for a property",
    setup: "Perfect, let's get you set up! 📋 I'll just need a couple of documents to start your registration — first up, could you upload the front of your Emirates ID?",
    idBack: "Upload the back side of your Emirates ID.",
    frontAgain: "No problem — let's try again. Upload the front of your Emirates ID.",
    thinking: "Thinking", scanning: "Scanning your uploads",
    scanSteps: ["Detecting document", "Reading details", "Checking validity"],
    idFound: "Great! We've scanned your Emirates ID and pulled your details. Take a quick look and confirm everything's correct:",
    reupload: "Re-upload", confirm: "Confirm & Continue", confirmed: "Details Confirmed",
    docTenant: "To continue, please upload your tenancy contract or written approval from the owner.",
    docOwner: "To continue, please upload your title deed or Sale & Purchase Agreement (SPA).",
    docAgent: "To continue, please upload your holiday home permit or trade licence.",
    docFound: "Got it — here's what I found on your document. All good?",
    askEmail: "Just a couple more details, {name} — please share your email.",
    emailBad: "Hmm, that doesn't look like an email address. Could you check it? (e.g. name@example.com)",
    emailOk: "Your email is confirmed ✓\nNext, please verify your phone number to continue.",
    another: "Use another number",
    askPhone: "Sure — type the mobile number you'd like to use (e.g. +971 50 123 4567).",
    phoneBad: "That number looks a little short. Try the format +971 50 123 4567.",
    otpSent: "We've sent a 4-digit code to {phone}. Please enter it below.",
    noCode: "Didn't receive the code?", resend: "Resend", resendIn: "Resend in {s}s",
    otpWrong: "That code doesn't match — give it another try.",
    otpOk: "OTP verified successfully.",
    demoHint: "Demo code {code} · tap to fill",
    askName: "Lovely! Let's create your account so we can save homes you like. What's your full name?",
    nameBad: "Could you share your full name? First and last is perfect.",
    doneMsg: "You are successfully registered. Your credentials will be sent to your registered email ID.",
    explore: "Explore properties",
    fallback: "I'm here to get you registered — pick an option above, or attach a document with the 📎 button.",
    upload: "Upload photo", sample: "Use a sample",
    restart: "Start over", signIn: "Already registered? Login",
    proto: "Prototype · documents stay on your device",
    placeholder: "Write your message here…", send: "Send", listening: "Listening…", newMsg: "New message",
    steps: ["Role", "Identity", "Documents", "Contact", "Verify"],
    profile: "Your profile", building: "Building as we chat…",
    fields: { name: "Full legal name", eid: "Emirates ID", nationality: "Nationality", property: "Property", email: "Email", phone: "Phone", status: "Status" },
    verified: "Verified", pending: "Pending",
    back: "Back", attach: "Attach a document", mic: "Voice input", dropHere: "Drop your document here",
    voiceUnsupported: "Voice input isn't supported in this browser.",
    roleLabel: { owner: "Property owner", agent: "Holiday home agent", tenant: "Tenant", searching: "Home seeker" },
    needsTitle: "Here's what you'll need — about 2 minutes:",
    needs: {
      tenant: ["Emirates ID (front & back)", "Tenancy contract or owner's approval", "Email & mobile number"],
      owner: ["Emirates ID (front & back)", "Title deed or SPA", "Email & mobile number"],
      agent: ["Emirates ID (front & back)", "Holiday home permit or trade licence", "Email & mobile number"],
      searching: ["Your full name", "Email & mobile number"],
    },
    stepOf: "Step {n} of {total}",
    buddyName: "Bloom GPT", buddySub: "Your registration companion",
    mood: { idle: "Waiting for you", thinking: "Thinking", speaking: "Talking", typing: "Reading along", listening: "Listening", done: "You're all set" },
    now: "Right now", boop: "Hi! 👋",
    hints: ["Tell us who you are", "Upload your Emirates ID", "Upload your property document", "Share your contact details", "Verify your phone", "All done"],
    ph: { role: "Or type, e.g. “I'm a tenant”…", upload: "Tap 📎 to attach, or use a sample…", name: "Type your full name…", email: "Type your email, e.g. name@example.com…", phone: "Type your mobile, e.g. +971 50 123 4567…", otp: "Enter the 4-digit code above…", done: "You're all set ✨", wait: "Bloom GPT is typing…" },
  },
  ar: {
    greet: "أهلاً وسهلاً 👋 سعيد برؤيتك! أنا Bloom GPT، هنا لمساعدتك في كل ما يتعلق بالعقارات. ما الذي يأتي بك اليوم؟",
    owner: "أملك عقاراً", agent: "أنا وكيل بيوت عطلات", tenant: "أنا مستأجر", searching: "أبحث عن عقار",
    setup: "رائع، لنبدأ! 📋 سأحتاج بعض المستندات لبدء تسجيلك — أولاً، هل يمكنك تحميل الوجه الأمامي لبطاقة الهوية الإماراتية؟",
    idBack: "حمّل الوجه الخلفي لبطاقة الهوية الإماراتية.",
    frontAgain: "لا مشكلة — لنحاول مجدداً. حمّل الوجه الأمامي لبطاقة الهوية الإماراتية.",
    thinking: "أفكر", scanning: "أفحص المستندات",
    scanSteps: ["التعرّف على المستند", "قراءة البيانات", "التحقق من الصلاحية"],
    idFound: "ممتاز! فحصنا بطاقة هويتك واستخرجنا بياناتك. ألقِ نظرة سريعة وأكّد أن كل شيء صحيح:",
    reupload: "إعادة التحميل", confirm: "تأكيد ومتابعة", confirmed: "تم تأكيد البيانات",
    docTenant: "للمتابعة، يرجى تحميل عقد الإيجار أو موافقة خطية من المالك.",
    docOwner: "للمتابعة، يرجى تحميل سند الملكية أو اتفاقية البيع والشراء.",
    docAgent: "للمتابعة، يرجى تحميل تصريح بيوت العطلات أو الرخصة التجارية.",
    docFound: "تم — إليك ما وجدته في مستندك. هل كل شيء صحيح؟",
    askEmail: "بقيت تفاصيل قليلة يا {name} — يرجى مشاركة بريدك الإلكتروني.",
    emailBad: "يبدو أن هذا ليس بريداً إلكترونياً صحيحاً. هل يمكنك التحقق؟ (مثال: name@example.com)",
    emailOk: "تم تأكيد بريدك الإلكتروني ✓\nالتالي، يرجى التحقق من رقم هاتفك للمتابعة.",
    another: "استخدام رقم آخر",
    askPhone: "بالتأكيد — اكتب رقم الجوال الذي تريد استخدامه (مثال: 4567 123 50 971+).",
    phoneBad: "يبدو الرقم قصيراً. جرّب الصيغة 4567 123 50 971+.",
    otpSent: "أرسلنا رمزاً من 4 أرقام إلى {phone}. يرجى إدخاله أدناه.",
    noCode: "لم يصلك الرمز؟", resend: "إعادة الإرسال", resendIn: "إعادة الإرسال خلال {s} ث",
    otpWrong: "الرمز غير مطابق — حاول مرة أخرى.",
    otpOk: "تم التحقق من الرمز بنجاح.",
    demoHint: "الرمز التجريبي {code} · اضغط للتعبئة",
    askName: "رائع! لننشئ حسابك لنحفظ المنازل التي تعجبك. ما اسمك الكامل؟",
    nameBad: "هل يمكنك مشاركة اسمك الكامل؟ الاسم الأول والأخير يكفي.",
    doneMsg: "تم تسجيلك بنجاح. سيتم إرسال بيانات الدخول إلى بريدك الإلكتروني المسجّل.",
    explore: "استكشف العقارات",
    fallback: "أنا هنا لمساعدتك في التسجيل — اختر خياراً أعلاه أو أرفق مستنداً بزر 📎.",
    upload: "تحميل صورة", sample: "استخدام نموذج",
    restart: "البدء من جديد", signIn: "لديك حساب؟ سجّل الدخول",
    proto: "نموذج أولي · تبقى المستندات على جهازك",
    placeholder: "اكتب رسالتك هنا…", send: "إرسال", listening: "أستمع…", newMsg: "رسالة جديدة",
    steps: ["الدور", "الهوية", "المستندات", "التواصل", "التحقق"],
    profile: "ملفك الشخصي", building: "يُبنى أثناء المحادثة…",
    fields: { name: "الاسم القانوني", eid: "الهوية الإماراتية", nationality: "الجنسية", property: "العقار", email: "البريد الإلكتروني", phone: "الهاتف", status: "الحالة" },
    verified: "موثّق", pending: "قيد الانتظار",
    back: "رجوع", attach: "إرفاق مستند", mic: "إدخال صوتي", dropHere: "أفلت المستند هنا",
    voiceUnsupported: "الإدخال الصوتي غير مدعوم في هذا المتصفح.",
    roleLabel: { owner: "مالك عقار", agent: "وكيل بيوت عطلات", tenant: "مستأجر", searching: "باحث عن منزل" },
    needsTitle: "إليك ما ستحتاجه — حوالي دقيقتين:",
    needs: {
      tenant: ["الهوية الإماراتية (الوجهان)", "عقد الإيجار أو موافقة المالك", "البريد الإلكتروني ورقم الجوال"],
      owner: ["الهوية الإماراتية (الوجهان)", "سند الملكية أو اتفاقية البيع والشراء", "البريد الإلكتروني ورقم الجوال"],
      agent: ["الهوية الإماراتية (الوجهان)", "تصريح بيوت العطلات أو الرخصة التجارية", "البريد الإلكتروني ورقم الجوال"],
      searching: ["اسمك الكامل", "البريد الإلكتروني ورقم الجوال"],
    },
    stepOf: "الخطوة {n} من {total}",
    buddyName: "Bloom GPT", buddySub: "رفيقك في التسجيل",
    mood: { idle: "بانتظارك", thinking: "يفكّر", speaking: "يتحدث", typing: "يقرأ معك", listening: "يستمع", done: "كل شيء جاهز" },
    now: "الآن", boop: "مرحباً! 👋",
    hints: ["عرّفنا بنفسك", "حمّل بطاقة الهوية الإماراتية", "حمّل مستند العقار", "شارك بيانات التواصل", "تحقق من رقم هاتفك", "تم كل شيء"],
    ph: { role: "أو اكتب، مثلاً «أنا مستأجر»…", upload: "اضغط 📎 للإرفاق أو استخدم نموذجاً…", name: "اكتب اسمك الكامل…", email: "اكتب بريدك الإلكتروني…", phone: "اكتب رقم جوالك…", otp: "أدخل الرمز المكوّن من 4 أرقام أعلاه…", done: "تم كل شيء ✨", wait: "Bloom GPT يكتب…" },
  },
};

/* ---- Demo data ("extracted" from documents) ------------------------------------ */
const DEMO = {
  id: { name: "Tariq Al-Mansoor", eid: "784-1988-1234567-1", expiry: "14 May 2027", nationality: "United Arab Emirates", dob: "14 May 1988" },
  tenant: { phone: "+971 52 555 4944", unit: "Park View (AB-0021)", owner: "Ahmed Ali", issue: "14 Dec 2025", expiry: "13 Nov 2026" },
  owner: { phone: "+971 52 555 4944", unit: "Bloom Gardens · Villa G-14", deed: "TD-2025-004821", issue: "02 Mar 2025" },
  agent: { phone: "+971 52 555 4944", company: "Al Mansoor Holiday Homes LLC", permit: "HH-7741-2026", expiry: "30 Jun 2026" },
};
const OTP_CODE = "5652";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---- Sample documents: generic illustrations clearly marked SAMPLE -------------- */
function sampleDoc(kind) {
  const W = 640, H = kind.startsWith("id") ? 400 : 820;
  const mark = `<text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-weight="700" font-size="${kind.startsWith("id") ? 92 : 120}" fill="#922A22" opacity=".13" transform="rotate(-18 ${W / 2} ${H / 2})">SAMPLE</text>`;
  let body = "";
  if (kind === "idFront") {
    body = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E7F1EE"/><stop offset=".6" stop-color="#D6E7E6"/><stop offset="1" stop-color="#F3E7D6"/></linearGradient></defs>
      <rect width="${W}" height="${H}" rx="28" fill="url(#g)"/>
      <text x="36" y="58" font-family="Arial" font-weight="700" font-size="26" fill="#2F6F73">IDENTITY CARD</text>
      <text x="36" y="86" font-family="Arial" font-size="16" fill="#5A6B6A">Sample document · not a real ID</text>
      <rect x="36" y="128" width="82" height="62" rx="10" fill="#D9B98A"/><path d="M36 159h82M77 128v62" stroke="#B7863F" stroke-width="3"/>
      <text x="36" y="250" font-family="Arial" font-size="15" fill="#5A6B6A">ID Number</text><text x="36" y="276" font-family="Arial" font-weight="700" font-size="22" fill="#1C1C19">784-1988-1234567-1</text>
      <text x="36" y="318" font-family="Arial" font-size="15" fill="#5A6B6A">Name</text><text x="36" y="344" font-family="Arial" font-weight="700" font-size="22" fill="#1C1C19">Tariq Al-Mansoor</text>
      <rect x="452" y="120" width="150" height="190" rx="16" fill="#fff" opacity=".85"/><circle cx="527" cy="190" r="36" fill="#C9D6D4"/><path d="M470 300c10-44 104-44 114 0" fill="#C9D6D4"/>`;
  } else if (kind === "idBack") {
    body = `<rect width="${W}" height="${H}" rx="28" fill="#EEF3F1"/>
      <rect x="0" y="0" width="${W}" height="180" rx="28" fill="#D6E7E6"/>
      <text x="36" y="58" font-family="Arial" font-size="16" fill="#5A6B6A">Card Number · Expiry · Date of Birth</text>
      <text x="36" y="92" font-family="Arial" font-weight="700" font-size="20" fill="#1C1C19">0000000000 · 14/05/2027 · 14/05/1988</text>
      <path d="M470 150c40-70 90-70 130-40" stroke="#2F6F73" stroke-width="10" fill="none" opacity=".35"/>
      <text x="36" y="262" font-family="Courier New, monospace" font-weight="700" font-size="22" fill="#1C1C19">SAMPLE&lt;&lt;DOCUMENT&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="36" y="298" font-family="Courier New, monospace" font-weight="700" font-size="22" fill="#1C1C19">0000000000000000&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;0</text>
      <text x="36" y="334" font-family="Courier New, monospace" font-weight="700" font-size="22" fill="#1C1C19">NAME&lt;&lt;SURNAME&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>`;
  } else {
    const title = { tenant: "TENANCY CONTRACT", owner: "TITLE DEED", agent: "HOLIDAY HOME PERMIT" }[kind];
    const rows = Array.from({ length: 11 }, (_, i) => `<rect x="48" y="${250 + i * 44}" width="${200 + (i * 37) % 180}" height="12" rx="6" fill="#D9D2C3"/><rect x="${W - 248}" y="${250 + i * 44}" width="200" height="12" rx="6" fill="#E6DFCE"/>`).join("");
    body = `<rect width="${W}" height="${H}" rx="18" fill="#FFFFFF"/><rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="12" fill="none" stroke="#E6DFCE" stroke-width="2"/>
      <circle cx="${W / 2}" cy="92" r="30" fill="#F4DCD6"/><text x="${W / 2}" y="100" text-anchor="middle" font-family="Georgia" font-size="24" fill="#922A22">B</text>
      <text x="${W / 2}" y="168" text-anchor="middle" font-family="Arial" font-weight="700" font-size="30" fill="#1C1C19">${title}</text>
      <text x="${W / 2}" y="198" text-anchor="middle" font-family="Arial" font-size="16" fill="#6B665C">Sample document · for demonstration only</text>
      <rect x="48" y="220" width="${W - 96}" height="10" rx="5" fill="#922A22" opacity=".8"/>${rows}
      <path d="M400 ${H - 110}c30-40 60 20 90-10s50 10 70-8" stroke="#2F6F73" stroke-width="4" fill="none"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${body}${mark}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* ---- Page -------------------------------------------------------------------------- */
export function render(view) {
  const L = () => COPY[getLang()] || COPY.en;
  const fill = (s, vars = {}) => s.replace(/\{(\w+)\}/g, (_, k) => esc(vars[k] ?? ""));
  const RM = reducedMotion();
  const back = authReturnRoute();
  const objectUrls = [];

  view.innerHTML = `
    <section class="rg" data-section="Register">
      <div class="rg__mesh" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="rg__light" aria-hidden="true"></div>
      <div class="rg__grain" aria-hidden="true"></div>
      <div class="rg__aura" aria-hidden="true"></div>
      <svg class="rg__waves" viewBox="0 0 2400 200" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="rg-wave" x1="0" x2="1"><stop offset="0" stop-color="#F0643F" /><stop offset="0.33" stop-color="#D63C6B" /><stop offset="0.66" stop-color="#F2A93B" /><stop offset="1" stop-color="#1FB5BD" /></linearGradient></defs>
        ${[[34, 400, 1.6], [22, 300, 1.1], [48, 600, 2.2]].map(([amp, per, w], i) => `<path class="rg__wv rg__wv--${i + 1}" d="${wavePath(amp, per)}" stroke-width="${w}" />`).join("")}
      </svg>

      <header class="rg__head">
        <a class="rg__iconbtn" href="${back}" aria-label="${L().back}">${icon("chevronLeft", 22, "icon--dir")}</a>
        <a class="rg__wordmark wordmark wordmark--logo" href="#/" aria-label="Bloom">${LOGO}</a>
        <div class="rg__head-end">${themeToggle()}
        <div class="seg rg__lang" role="group" aria-label="Language">
          <button class="seg__btn" data-lang="en" aria-pressed="${getLang() === "en"}">EN</button>
          <button class="seg__btn" data-lang="ar" aria-pressed="${getLang() === "ar"}" lang="ar">عربي</button>
        </div>
        </div>
      </header>

      <div class="rg__body">
        <aside class="rg__buddy" aria-label="${L().buddyName}">
          <button class="rg__bigorb" type="button" data-orb aria-label="${L().buddyName}">
            <span class="rg__halo" aria-hidden="true"><i></i><i></i><i></i></span>
            ${siri("rg__siri")}
          </button>
          <div class="rg__buddy-text">
            <p class="rg__buddy-name">${L().buddyName}</p>
            <p class="rg__buddy-sub">${L().buddySub}</p>
            <p class="rg__mood" data-mood-label aria-live="polite"><span class="rg__mood-dot" aria-hidden="true"></span><span data-mood-text>${L().mood.idle}</span></p>
          </div>
          <div class="rg__now">
            <p class="rg__now-label">${L().now}</p>
            <p class="rg__caption" data-caption aria-live="polite"></p>
          </div>
          <div class="rg__buddy-actions">
            <button class="rg__restart" data-restart>${icon("return", 14)} ${L().restart}</button>
            <a class="rg__signin" href="#/login">${L().signIn}</a>
          </div>
          <p class="rg__proto">${icon("shield", 13)} ${L().proto}</p>
        </aside>
        <div class="rg__chat">
          <div class="rg__log" data-log role="log" aria-live="polite" aria-relevant="additions"></div>
          <button type="button" class="rg__jump" data-jump hidden>${icon("arrowDown", 14)} ${L().newMsg}</button>
          <form class="rg__composer" data-composer autocomplete="off">
            <div class="rg__tools">
              <button type="button" class="rg__tool" data-attach aria-label="${L().attach}" title="${L().attach}">${icon("paperclip", 18)}</button>
              <button type="button" class="rg__tool" data-mic aria-label="${L().mic}" title="${L().mic}" aria-pressed="false">${icon("mic", 18)}<span class="rg__wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>
            </div>
            <label class="sr-only" for="rg-input">${L().placeholder}</label>
            <textarea id="rg-input" class="rg__input" rows="1" placeholder="${L().placeholder}" data-input></textarea>
            <span class="rg__listening" data-listening hidden>${L().listening}</span>
            <button type="submit" class="rg__send" aria-label="${L().send}" title="${L().send}">${icon("arrowDown", 19, "rg__send-ic")}</button>
            <input type="file" accept="image/*,application/pdf" hidden data-file />
          </form>
        </div>
        <aside class="rg__profile" data-profile aria-label="${L().profile}"></aside>
      </div>


      <div class="rg__drop" data-drop hidden><span>${icon("paperclip", 28)}<strong>${L().dropHere}</strong></span></div>
    </section>`;

  const log = view.querySelector("[data-log]");
  const input = view.querySelector("[data-input]");
  const fileInput = view.querySelector("[data-file]");
  const profileEl = view.querySelector("[data-profile]");
  const jumpBtn = view.querySelector("[data-jump]");
  const section = view.querySelector(".rg");
  let session = { dead: false };
  let waiter = null;           /* { type: "choice"|"text"|"upload", resolve, options } */
  let speaking = 0;            /* >0 while Bloom GPT is typing/streaming */
  let queued = null;           /* text sent mid-message, applied to the next question */
  let lastPick = null;         /* rect of the chip just tapped; the reply bubble flies from it */
  const profile = {};
  let role = null;

  /* ---- Utilities ------------------------------------------------------------------ */
  const sleep = (ms) => new Promise((res, rej) => {
    const s = session;
    setTimeout(() => (s.dead ? rej(new Error("dead")) : res()), RM ? Math.min(ms, 120) : ms);
  });
  /* Keep the newest message in view. Scrolling to the very bottom of the
     page is what makes it fully visible: there the sticky composer rests in
     its own spot below the log instead of covering the last message. If the
     visitor has scrolled up to reread, don't yank them down — show a
     "New message" pill instead. */
  let following = true;
  const atBottom = () => document.documentElement.scrollHeight - (scrollY + innerHeight) < 140;
  const toBottom = (smooth = !RM) => scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  const scrollDown = () => requestAnimationFrame(() => {
    if (following) toBottom();
    else jumpBtn.hidden = false;
  });

  function addRow(side, node) {
    const row = document.createElement("div");
    row.className = `rg__row rg__row--${side}`;
    if (side === "bot") row.innerHTML = `<span class="rg__orb" aria-hidden="true">${siri()}</span>`;
    row.appendChild(node);
    log.appendChild(row);
    scrollDown();
    return row;
  }

  /* Bot message: typing indicator, then words stream in */
  async function bot(text, opts = {}) {
    speaking++;
    try { return await botInner(text, opts); } finally { speaking--; }
  }
  async function botInner(text, { status = L().thinking, delay = 700 } = {}) {
    const typing = addRow("bot", Object.assign(document.createElement("div"), { className: "rg__status", innerHTML: `<span>${esc(status)}</span><span class="rg__dots"><i></i><i></i><i></i></span>` }));
    typing.classList.add("is-thinking");
    mood("thinking");
    await sleep(Math.max(900, delay * 1.6));   /* a visible "thinking" beat */
    typing.remove();
    const bubble = document.createElement("div");
    bubble.className = "rg__bubble";
    const words = text.split(/(\s+)/);
    bubble.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">${words.map((w, i) => (/^\s+$/.test(w) ? (w.includes("\n") ? "<br>" : " ") : `<span class="rg__w" style="--wi:${i}">${esc(w)}</span>`)).join("")}</span>`;
    const row = addRow("bot", bubble);
    row.classList.add("is-speaking");
    mood("speaking");
    await sleep(Math.min(7000, words.length * WORD_MS + 450));   /* let the words stream in fully */
    row.classList.remove("is-speaking");
    if (speaking <= 1) mood("idle", true);
    return row;
  }

  function user(content) {
    const b = document.createElement("div");
    b.className = "rg__bubble rg__bubble--user";
    if (typeof content === "string") b.textContent = content;
    else b.appendChild(content);
    addRow("user", b);
    /* If this reply came from a tapped chip, fly it from the chip to here */
    if (lastPick && performance.now() - lastPick.at < 800 && !RM) {
      const from = lastPick.rect, to = b.getBoundingClientRect();
      b.style.animation = "none";
      b.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, borderRadius: "999px", opacity: 0.9 },
        { transform: "none", opacity: 1 },
      ], { duration: 620, easing: "cubic-bezier(.34,1.3,.64,1)" });
    }
    lastPick = null;
    return b;
  }

  /* Choice chips; also resolvable by typing a matching word */
  function choose(options, { after } = {}) {
    const wrap = document.createElement("div");
    wrap.className = "rg__chips";
    wrap.innerHTML = options.map((o, i) => `<button class="rg__chip" style="--i:${i}" data-v="${o.value}">${esc(o.label)}</button>`).join("");
    (after || log.lastElementChild).appendChild(wrap);
    scrollDown();
    return new Promise((resolve) => {
      const pick = (o, btn) => {
        waiter = null;
        if (btn) { lastPick = { rect: btn.getBoundingClientRect(), at: performance.now() }; btn.classList.add("is-burst"); following = true; }
        wrap.querySelectorAll(".rg__chip").forEach((c) => { c.disabled = true; c.classList.toggle("is-picked", c === btn); });
        wrap.classList.add("is-done");
        resolve(o);
      };
      wrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".rg__chip");
        if (!btn || btn.disabled) return;
        pick(options.find((o) => o.value === btn.dataset.v), btn);
      });
      waiter = { type: "choice", options, pick: (o) => pick(o, wrap.querySelector(`[data-v="${o.value}"]`)) };
      if (queued) { const q = queued; queued = null; setTimeout(() => handleText(q, false), 0); }
    });
  }

  function askText(validate, ph) {
    if (ph) setPh(ph);
    input.focus({ preventScroll: true });
    return new Promise((resolve) => {
      waiter = { type: "text", validate, resolve };
      if (queued) { const q = queued; queued = null; setTimeout(() => handleText(q, false), 0); }
    });
  }

  /* Upload: inline actions (upload / sample) + composer paperclip + drag & drop */
  function askUpload(kind, row) {
    setPh("upload");
    const actions = document.createElement("div");
    actions.className = "rg__chips rg__chips--upload";
    actions.innerHTML = `<button class="rg__chip rg__chip--solid" data-up>${L().upload}</button><button class="rg__chip" data-sample>${L().sample}</button>`;
    row.appendChild(actions);
    scrollDown();
    view.querySelector("[data-attach]").classList.add("is-hinting");
    return new Promise((resolve) => {
      const done = (src, name, isPdf) => {
        waiter = null;
        actions.querySelectorAll("button").forEach((b) => (b.disabled = true));
        actions.classList.add("is-done");
        view.querySelector("[data-attach]").classList.remove("is-hinting");
        resolve({ src, name, isPdf });
      };
      actions.querySelector("[data-up]").addEventListener("click", () => fileInput.click());
      actions.querySelector("[data-sample]").addEventListener("click", () => done(sampleDoc(kind), "sample", false));
      waiter = { type: "upload", file: (f) => {
        const url = URL.createObjectURL(f);
        objectUrls.push(url);
        done(url, f.name, f.type === "application/pdf");
      } };
    });
  }

  function docBubble({ src, name, isPdf }, kind) {
    const fig = document.createElement("figure");
    fig.className = `rg__doc ${kind.startsWith("id") ? "rg__doc--card" : "rg__doc--page"}`;
    fig.innerHTML = isPdf
      ? `<div class="rg__pdf">${icon("file", 28)}<span>${esc(name)}</span></div><span class="rg__laser" aria-hidden="true"></span>`
      : `<img src="${src}" alt="Uploaded document" /><span class="rg__laser" aria-hidden="true"></span>`;
    user(fig);
    return fig;
  }

  async function scan(figs) {
    figs.forEach((f) => f.classList.add("is-scanning"));
    const box = document.createElement("div");
    box.className = "rg__scan";
    box.innerHTML = `<div class="rg__status"><span>${L().scanning}</span><span class="rg__dots"><i></i><i></i><i></i></span></div>
      <ul class="rg__scan-steps">${L().scanSteps.map((s, i) => `<li data-s="${i}"><span class="rg__tick">${icon("check", 12)}</span>${esc(s)}</li>`).join("")}</ul>`;
    const row = addRow("bot", box);
    row.classList.add("is-thinking");
    for (let i = 0; i < 3; i++) { await sleep(850); box.querySelector(`[data-s="${i}"]`).classList.add("is-done"); scrollDown(); }
    await sleep(350);
    figs.forEach((f) => { f.classList.remove("is-scanning"); f.classList.add("is-scanned"); });
    row.remove();
  }

  /* Extracted-details card; values type themselves in */
  async function detailsCard(intro, fields) {
    const row = await bot(intro);
    const card = document.createElement("div");
    card.className = "rg__card";
    card.innerHTML = `<div class="rg__fields">${fields.map((f, i) => `<div class="rg__field ${f.half ? "is-half" : ""}" style="--i:${i}"><span>${esc(f.label)}</span><strong data-type="${esc(f.value)}"></strong></div>`).join("")}</div>
      <div class="rg__card-actions"><button class="rg__btn rg__btn--ghost" data-re>${icon("return", 16)}${L().reupload}</button><button class="rg__btn" data-ok>${L().confirm}${icon("arrow", 16, "icon--dir")}</button></div>`;
    row.querySelector(".rg__bubble").appendChild(card);
    scrollDown();
    for (const el of card.querySelectorAll("[data-type]")) await typeInto(el, el.dataset.type);
    card.classList.add("is-ready");
    return new Promise((resolve) => {
      card.querySelector("[data-ok]").addEventListener("click", () => { card.classList.add("is-locked"); resolve(true); }, { once: true });
      card.querySelector("[data-re]").addEventListener("click", () => { card.classList.add("is-locked"); resolve(false); }, { once: true });
    });
  }

  async function typeInto(el, text) {
    if (RM) { el.textContent = text; return; }
    el.classList.add("is-typing");
    for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(32); }
    el.textContent = text;
    el.classList.remove("is-typing");
  }

  function confirmedChip() {
    user(Object.assign(document.createElement("span"), { className: "rg__confirmed", innerHTML: `${icon("check", 16)} ${esc(L().confirmed)}` }));
  }

  /* OTP: 4 boxes, auto-advance, paste, demo hint, resend countdown */
  async function otp(phone) {
    setPh("otp");
    const row = await bot(fill(L().otpSent, { phone }));
    const box = document.createElement("div");
    box.className = "rg__otp";
    box.innerHTML = `<div class="rg__otp-boxes" role="group" aria-label="One-time code">${[0, 1, 2, 3].map((i) => `<input inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" data-d="${i}" style="--i:${i}" />`).join("")}</div>
      <button class="rg__hint" data-hint>${icon("sparkle", 14)} ${fill(L().demoHint, { code: OTP_CODE })}</button>
      <p class="rg__resend">${L().noCode} <button data-resend disabled>${fill(L().resendIn, { s: 30 })}</button></p>`;
    row.querySelector(".rg__bubble").appendChild(box);
    scrollDown();
    const inputs = [...box.querySelectorAll("input")];
    setTimeout(() => inputs[0].focus({ preventScroll: true }), 200);

    /* resend countdown */
    let secs = 30, timer;
    const resendBtn = box.querySelector("[data-resend]");
    const tick = () => { secs--; if (secs <= 0) { clearInterval(timer); resendBtn.disabled = false; resendBtn.textContent = L().resend; } else resendBtn.textContent = fill(L().resendIn, { s: secs }); };
    timer = setInterval(tick, 1000);
    resendBtn.addEventListener("click", () => { toast({ title: L().resend, body: phone }); secs = 30; resendBtn.disabled = true; resendBtn.textContent = fill(L().resendIn, { s: 30 }); timer = setInterval(tick, 1000); });

    return new Promise((resolve) => {
      const check = async () => {
        const code = inputs.map((i) => i.value).join("");
        if (code.length < 4) return;
        if (code === OTP_CODE) {
          clearInterval(timer);
          inputs.forEach((i) => (i.disabled = true));
          box.classList.add("is-ok");
          resolve();
        } else {
          box.classList.remove("is-bad"); void box.offsetWidth; box.classList.add("is-bad");
          await bot(L().otpWrong, { delay: 400 });
          inputs.forEach((i) => (i.value = ""));
          inputs[0].focus();
        }
      };
      inputs.forEach((inp, i) => {
        inp.addEventListener("input", () => {
          inp.value = inp.value.replace(/\D/g, "").slice(-1);
          inp.classList.toggle("is-filled", Boolean(inp.value));
          if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
          check();
        });
        inp.addEventListener("keydown", (e) => { if (e.key === "Backspace" && !inp.value && inputs[i - 1]) inputs[i - 1].focus(); });
        inp.addEventListener("paste", (e) => {
          const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 4);
          if (!digits) return;
          e.preventDefault();
          digits.split("").forEach((d, j) => { inputs[j].value = d; inputs[j].classList.add("is-filled"); });
          check();
        });
      });
      box.querySelector("[data-hint]").addEventListener("click", async () => {
        for (let j = 0; j < 4; j++) { inputs[j].value = OTP_CODE[j]; inputs[j].classList.add("is-filled"); await new Promise((r) => setTimeout(r, RM ? 0 : 110)); }
        check();
      });
    });
  }

  /* Composer placeholder always says what Bloom GPT expects next */
  const setPh = (key) => { input.placeholder = L().ph[key] || L().placeholder; };

  /* ---- Progress + live profile ---------------------------------------------------- */
  /* What Bloom GPT is working on (shown under the companion orb) */
  function setStep(n) {
    const cap = view.querySelector("[data-caption]");
    cap.innerHTML = n >= 5 ? `${icon("check", 14)} ${esc(L().hints[5])}` : esc(L().hints[role === "searching" && n === 0 ? 0 : n]);
    cap.classList.remove("is-swap"); void cap.offsetWidth; cap.classList.add("is-swap");
  }

  /* Companion mood: drives the big orb (and its label) — idle, thinking,
     speaking, typing (visitor is writing), listening (mic on), done */
  let moodNow = "";
  function mood(m, force) {
    if (m === "idle" && speaking && !force) return;
    if (moodNow === "done" && m !== "done" && m !== "reset") return;
    if (m === "reset") m = "idle";
    if (m === moodNow) return;
    moodNow = m;
    section.dataset.mood = m;
    const label = view.querySelector("[data-mood-text]");
    if (label) label.textContent = L().mood[m];
  }

  function renderProfile(changed) {
    const F = L().fields;
    const rows = [
      ["name", F.name], role !== "searching" && ["eid", F.eid], role !== "searching" && ["nationality", F.nationality],
      role && role !== "searching" && ["property", F.property], ["email", F.email], ["phone", F.phone],
    ].filter(Boolean);
    const initials = (profile.name || "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
    profileEl.innerHTML = `
      <div class="rg__pcard ${profile.verified ? "is-verified" : ""}">
        <div class="rg__pcard-top">
          <span class="rg__pavatar">${initials ? esc(initials) : icon("id", 22)}</span>
          <div><p class="rg__pname">${profile.name ? esc(profile.name) : L().profile}</p><p class="rg__prole">${role ? esc(L().roleLabel[role]) : L().building}</p></div>
        </div>
        <dl class="rg__plist">${rows.map(([k, label]) => `<div class="${profile[k] ? "is-filled" : ""} ${k === changed ? "is-new" : ""}"><dt>${esc(label)}</dt><dd>${profile[k] ? esc(profile[k]) : "—"}</dd></div>`).join("")}
          <div class="rg__pstatus"><dt>${F.status}</dt><dd>${profile.verified ? `${icon("check", 14)} ${L().verified}` : L().pending}</dd></div></dl>
        <div class="rg__pmeter"><span style="--p:${Math.round((rows.filter(([k]) => profile[k]).length + (profile.verified ? 1 : 0)) / (rows.length + 1) * 100)}%"></span></div>
      </div>`;
  }
  const setProfile = (k, v) => { profile[k] = v; renderProfile(k); };

  /* ---- Celebration ------------------------------------------------------------------ */
  function confetti() {
    if (RM) return;
    const colors = ["#922A22", "#D9B98A", "#2F6F73", "#F8F5EB", "#A94442", "#B7863F"];
    const layer = document.createElement("div");
    layer.className = "rg__confetti";
    view.querySelector(".rg").appendChild(layer);
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.style.background = colors[i % colors.length];
      p.style.left = `${50 + (Math.random() - 0.5) * 30}%`;
      p.style.width = `${6 + Math.random() * 6}px`; p.style.height = `${8 + Math.random() * 10}px`;
      layer.appendChild(p);
      const dx = (Math.random() - 0.5) * 900, dy = -(300 + Math.random() * 400);
      p.animate([
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy}px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${dy + 900}px) rotate(${Math.random() * 900}deg)`, opacity: 0 },
      ], { duration: 2200 + Math.random() * 900, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" });
    }
    setTimeout(() => layer.remove(), 3400);
  }

  async function finish() {
    setPh("done");
    setStep(5);
    profile.verified = true; renderProfile("status");
    confetti();
    mood("done");
    const row = await bot(`✓ ${L().doneMsg}`, { delay: 500 });
    const cta = document.createElement("div");
    cta.className = "rg__done";
    cta.innerHTML = `<a class="rg__btn" href="#/properties">${L().explore}</a>`;
    row.querySelector(".rg__bubble").appendChild(cta);
    row.classList.add("is-celebrate");
    scrollDown();
  }

  /* ---- Flows -------------------------------------------------------------------------- */
  async function uploadStep(prompt, kind, existingRow) {
    const row = existingRow || await bot(prompt);
    const file = await askUpload(kind, row);
    return docBubble(file, kind);
  }

  async function identity() {
    setStep(1);
    let ok = false, attempt = 0;
    while (!ok) {
      const front = await uploadStep(attempt++ ? L().frontAgain : L().setup, "idFront");
      const backRow = await bot(L().idBack, { delay: 900 });
      const backDoc = await uploadStep(null, "idBack", backRow);
      await scan([front, backDoc]);
      const D = DEMO.id;
      ok = await detailsCard(L().idFound, [
        { label: getLang() === "ar" ? "الاسم القانوني الكامل" : "Full Legal Name", value: D.name },
        { label: getLang() === "ar" ? "رقم الهوية الإماراتية" : "Emirates ID Number", value: D.eid },
        { label: getLang() === "ar" ? "تاريخ الانتهاء" : "Expiry Date", value: D.expiry },
        { label: getLang() === "ar" ? "الجنسية" : "Nationality", value: D.nationality, half: true },
        { label: getLang() === "ar" ? "تاريخ الميلاد" : "Date of Birth", value: D.dob, half: true },
      ]);
      if (!ok) user(L().reupload);
    }
    confirmedChip();
    setProfile("name", DEMO.id.name); setProfile("eid", DEMO.id.eid); setProfile("nationality", DEMO.id.nationality);
  }

  async function propertyDoc() {
    setStep(2);
    const prompt = { tenant: L().docTenant, owner: L().docOwner, agent: L().docAgent }[role];
    const ar = getLang() === "ar";
    const fields = {
      tenant: [
        { label: ar ? "رقم الهاتف" : "Phone Number", value: DEMO.tenant.phone, half: true }, { label: ar ? "تفاصيل الوحدة" : "Unit Details", value: DEMO.tenant.unit, half: true },
        { label: ar ? "اسم المالك" : "Owner Name", value: DEMO.tenant.owner },
        { label: ar ? "تاريخ الإصدار" : "Issue Date", value: DEMO.tenant.issue, half: true }, { label: ar ? "تاريخ الانتهاء" : "Expiry Date", value: DEMO.tenant.expiry, half: true },
      ],
      owner: [
        { label: ar ? "العقار" : "Property", value: DEMO.owner.unit },
        { label: ar ? "رقم سند الملكية" : "Title Deed No.", value: DEMO.owner.deed, half: true }, { label: ar ? "تاريخ الإصدار" : "Issue Date", value: DEMO.owner.issue, half: true },
        { label: ar ? "رقم الهاتف" : "Phone Number", value: DEMO.owner.phone },
      ],
      agent: [
        { label: ar ? "الشركة" : "Company", value: DEMO.agent.company },
        { label: ar ? "رقم التصريح" : "Permit No.", value: DEMO.agent.permit, half: true }, { label: ar ? "تاريخ الانتهاء" : "Expiry Date", value: DEMO.agent.expiry, half: true },
        { label: ar ? "رقم الهاتف" : "Phone Number", value: DEMO.agent.phone },
      ],
    }[role];
    let ok = false;
    while (!ok) {
      const doc = await uploadStep(prompt, role);
      await scan([doc]);
      ok = await detailsCard(L().docFound, fields);
      if (!ok) user(L().reupload);
    }
    confirmedChip();
    setProfile("property", { tenant: DEMO.tenant.unit, owner: DEMO.owner.unit, agent: DEMO.agent.company }[role]);
  }

  async function contact() {
    setStep(3);
    if (role === "searching") {
      setPh("name");
      await bot(L().askName);
      const name = await askText((v) => (v.trim().split(/\s+/).length >= 2 && v.trim().length > 3 ? "" : L().nameBad), "name");
      setProfile("name", name.trim());
    }
    const first = (profile.name || "").split(" ")[0];
    setPh("email");
    await bot(fill(L().askEmail, { name: first }));
    const email = await askText((v) => (EMAIL_RE.test(v.trim()) ? "" : L().emailBad), "email");
    setProfile("email", email.trim());

    setStep(4);
    const row = await bot(L().emailOk);
    const known = role === "searching" ? null : DEMO[role].phone;
    let phone = known;
    const opts = [known && { value: "known", label: known, icon: "phone" }, { value: "other", label: L().another, icon: "sparkle" }].filter(Boolean);
    setPh("phone");
    const pick = await choose(opts, { after: row });
    if (pick.value === "known") user(known);
    else {
      await bot(L().askPhone, { delay: 400 });
      phone = await askText((v) => (v.replace(/\D/g, "").length >= 9 ? "" : L().phoneBad), "phone");
    }
    setProfile("phone", phone);
    await otp(phone);
    await bot(`✓ ${L().otpOk}`, { delay: 350 });
  }

  async function run() {
    setStep(0); renderProfile(); setPh("role");
    const row = await bot(L().greet, { delay: 900 });
    const choice = await choose([
      { value: "owner", label: L().owner, icon: "key", keys: ["own", "owner", "landlord", "bought", "مالك", "أملك"] },
      { value: "agent", label: L().agent, icon: "home", keys: ["agent", "holiday", "broker", "وكيل"] },
      { value: "tenant", label: L().tenant, icon: "building", keys: ["tenant", "rent", "renting", "lease", "مستأجر"] },
      { value: "searching", label: L().searching, icon: "search", keys: ["search", "searching", "looking", "find", "buy", "أبحث"] },
    ], { after: row });
    role = choice.value;
    user(choice.label);
    renderProfile("role");
    setPh("wait");
    const needsRow = await bot(L().needsTitle, { delay: 600 });
    const list = document.createElement("ul");
    list.className = "rg__needs";
    list.innerHTML = L().needs[role].map((n, i) => `<li style="--i:${i}"><span class="rg__needs-icon">${icon((role === "searching" ? ["id", "mail"] : ["id", "file", "mail"])[i] || "check", 16)}</span>${esc(n)}</li>`).join("");
    needsRow.querySelector(".rg__bubble").appendChild(list);
    scrollDown();
    await sleep(2000);
    if (role !== "searching") { await identity(); await propertyDoc(); }
    await contact();
    await finish();
  }

  const start = () => {
    session.dead = true;
    session = { dead: false };
    waiter = null; role = null; queued = null; lastPick = null;
    Object.keys(profile).forEach((k) => delete profile[k]);
    log.innerHTML = "";
    mood("reset");
    run().catch((e) => { if (e.message !== "dead") console.error(e); });
  };

  /* ---- Composer ---------------------------------------------------------------------- */
  const composer = view.querySelector("[data-composer]");
  const autosize = () => { input.style.height = "auto"; input.style.height = `${Math.min(140, input.scrollHeight)}px`; };
  input.addEventListener("input", () => {
    autosize(); composer.classList.toggle("has-text", Boolean(input.value.trim()));
    if (!speaking) mood(input.value.trim() ? "typing" : "idle");
  });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); composer.requestSubmit(); } });
  composer.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = ""; autosize(); composer.classList.remove("has-text"); mood("idle");
    composer.classList.remove("is-sent"); void composer.offsetWidth; composer.classList.add("is-sent");
    handleText(text, true);
  });

  /* Route a user message to whatever Bloom GPT is currently asking for.
     Messages sent while it is still typing are queued for the next question. */
  async function handleText(text, echo) {
    if (echo) user(text);
    const w = waiter;
    if (!w && speaking) { queued = text; return; }
    if (w?.type === "text") {
      const err = w.validate(text);
      if (err) { await bot(err, { delay: 450 }); return; }
      waiter = null;
      w.resolve(text);
    } else if (w?.type === "choice") {
      /* Score each option: explicit keywords beat incidental word overlap */
      const t = text.toLowerCase();
      const words = t.split(/\s+/).filter((x) => x.length > 2);
      const score = (o) => (o.keys || []).filter((k) => t.includes(k)).length * 3
        + (o.label.toLowerCase() === t ? 5 : 0)
        + words.filter((x) => o.label.toLowerCase().includes(x)).length;
      const ranked = w.options.map((o) => [o, score(o)]).sort((a, b) => b[1] - a[1]);
      const hit = ranked[0][1] > 0 && ranked[0][1] > (ranked[1]?.[1] ?? -1) ? ranked[0][0] : null;
      if (hit) w.pick(hit); else await bot(L().fallback, { delay: 450 });
    } else {
      await bot(L().fallback, { delay: 450 });
    }
  }

  /* Attachments: paperclip, file picker, drag & drop */
  const takeFile = (f) => {
    if (!f) return;
    if (waiter?.type === "upload") waiter.file(f);
    else bot(L().fallback, { delay: 400 });
  };
  view.querySelector("[data-attach]").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => { takeFile(fileInput.files[0]); fileInput.value = ""; });
  const drop = view.querySelector("[data-drop]");
  let dragDepth = 0;
  section.addEventListener("dragenter", (e) => { if (e.dataTransfer?.types?.includes("Files")) { dragDepth++; drop.hidden = false; } });
  section.addEventListener("dragleave", () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) drop.hidden = true; });
  section.addEventListener("dragover", (e) => e.preventDefault());
  section.addEventListener("drop", (e) => { e.preventDefault(); dragDepth = 0; drop.hidden = true; takeFile(e.dataTransfer.files[0]); });

  /* Voice input (Web Speech API where available) */
  const micBtn = view.querySelector("[data-mic]");
  const listening = view.querySelector("[data-listening]");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  micBtn.addEventListener("click", () => {
    if (!SR) { toast({ tone: "info", title: L().voiceUnsupported }); return; }
    if (rec) { rec.stop(); return; }
    rec = new SR();
    rec.lang = getLang() === "ar" ? "ar-AE" : "en-US";
    rec.interimResults = true;
    rec.onresult = (ev) => { input.value = [...ev.results].map((r) => r[0].transcript).join(""); autosize(); composer.classList.toggle("has-text", Boolean(input.value.trim())); };
    rec.onend = () => { rec = null; micBtn.setAttribute("aria-pressed", "false"); composer.classList.remove("is-listening"); listening.hidden = true; mood("idle"); };
    micBtn.setAttribute("aria-pressed", "true"); composer.classList.add("is-listening"); listening.hidden = false; mood("listening");
    rec.start();
  });

  view.querySelector("[data-restart]").addEventListener("click", start);
  view.querySelectorAll(".rg__lang [data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* ---- Playground: the canvas light follows the pointer, the big orb
     leans toward it and says hi when poked. Idle (no rAF) once settled. */
  const play = (() => {
    const light = view.querySelector(".rg__light");
    const orbBtn = view.querySelector("[data-orb]");
    const orb = { x: 0, y: 0 };
    let tx = innerWidth / 2, ty = innerHeight / 3, raf = 0, alive = true;
    const tick = () => {
      raf = 0;
      if (!alive) return;
      let moving = false;
      const r = orbBtn.getBoundingClientRect();
      if (r.width) {
        const dx = tx - (r.left + r.width / 2), dy = ty - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        const pull = Math.min(14, d / 30);
        const ox = (dx / d) * pull, oy = (dy / d) * pull;
        orb.x += (ox - orb.x) * 0.1; orb.y += (oy - orb.y) * 0.1;
        if (Math.abs(ox - orb.x) > 0.2 || Math.abs(oy - orb.y) > 0.2) moving = true;
        orbBtn.style.setProperty("--ox", `${orb.x.toFixed(1)}px`);
        orbBtn.style.setProperty("--oy", `${orb.y.toFixed(1)}px`);
      }
      if (moving) raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      light.style.setProperty("--lx", `${tx}px`); light.style.setProperty("--ly", `${ty}px`);
      section.classList.add("is-lit");
      if (!RM && !raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => section.classList.remove("is-lit");
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    /* Poke the orb */
    orbBtn.addEventListener("click", () => {
      orbBtn.classList.remove("is-boop"); void orbBtn.offsetWidth; orbBtn.classList.add("is-boop");
      const tip = document.createElement("span");
      tip.className = "rg__boop"; tip.textContent = L().boop; tip.setAttribute("aria-hidden", "true");
      orbBtn.appendChild(tip);
      setTimeout(() => { tip.remove(); orbBtn.classList.remove("is-boop"); }, 1400);
      input.focus({ preventScroll: true });
    });
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); };
  })();

  /* Follow the conversation: new content (bubbles, chips, cards, OTP) grows
     the log; while following, stay pinned to the bottom as it grows. */
  /* Only a visitor's own gesture (wheel, touch, keys) can stop following —
     our smooth scrolls to the bottom fire scroll events too and must not. */
  const onScroll = () => { if (atBottom()) { following = true; jumpBtn.hidden = true; } };
  const onGesture = () => requestAnimationFrame(() => { following = atBottom(); if (following) jumpBtn.hidden = true; });
  const onKey = (e) => { if (["PageUp", "PageDown", "ArrowUp", "ArrowDown", "Home", "End", " "].includes(e.key) && e.target === document.body) onGesture(); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("wheel", onGesture, { passive: true });
  addEventListener("touchmove", onGesture, { passive: true });
  addEventListener("keydown", onKey);
  const growth = new ResizeObserver(() => { if (following) toBottom(); else if (log.childElementCount) jumpBtn.hidden = false; });
  growth.observe(log);
  jumpBtn.addEventListener("click", () => { following = true; jumpBtn.hidden = true; toBottom(); });
  /* Sending always brings you back to the latest message */
  composer.addEventListener("submit", () => { following = true; jumpBtn.hidden = true; }, true);

  start();

  return {
    title: "Register",
    key: "register",
    cleanup: () => { session.dead = true; play(); growth.disconnect(); removeEventListener("scroll", onScroll); removeEventListener("wheel", onGesture); removeEventListener("touchmove", onGesture); removeEventListener("keydown", onKey); rec?.stop(); objectUrls.forEach((u) => URL.revokeObjectURL(u)); },
  };
}
