/* Interface strings. Content names (projects, brands) stay as Bloom publishes them. */

const STRINGS = {
  en: {
    skip: "Skip to content",
    experience: "Experience",
    properties: "Properties",
    portal: "Your property",
    destinations: "Destinations",
    search: "Search",
    searchPlaceholder: "Search divisions, projects, services…",
    signIn: "Login",
    register: "Register",
    takeBloom: "Take Bloom with you",
    statProperties: "Registered properties",
    statHospitals: "Hospitals registered",
    statEducation: "Education institutes",
    statSupport: "User support",
    followUs: "Follow us",
    backToTop: "Back to top",
    rights: "All rights reserved.",
    helpSupport: "Help & Support",
    menu: "Menu",
    close: "Close",
    home: "Home",
    theBloomExperience: "The Bloom Experience",
    heroA: "More Than a",
    heroPlace: "Place",
    heroB: "to Live.",
    heroLede: "Six divisions shaping how people live, learn, stay and work across the UAE — one place to explore them all.",
    getStarted: "Explore",
    exploreDivisions: "Explore divisions",
    divisions: "Divisions",
    divisionsTitle: "One ecosystem, six ways to live well",
    divisionsAside: "Each Bloom division is built around the same idea: places and services that make everyday life better.",
    featured: "Featured communities",
    featuredTitle: "Places to call home",
    viewAllProjects: "View all projects",
    portalEyebrow: "Your property",
    portalTitleA: "Your Property,",
    portalTitleB: "Simplified",
    portalLede: "Manage your Bloom properties, track payments, and stay updated on property progress with our intelligent platform.",
    downloadApp: "Download the app",
    login: "Login",
    discoverMore: "Discover more",
    offerings: "What we offer",
    otherDivisions: "More from Bloom",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    projectDetails: "Project Details",
    exploreProperties: "Explore Properties",
    contactUs: "Contact us",
    ourProjects: "Our projects",
    contactSales: "Contact sales",
    communities: "Communities",
    propertiesAssets: "Properties & assets",
    across: "Across",
    whatBrings: "What brings you to Bloom?",
    quickStart: "Quick start",
    quickStartAside: "Tell us what you need and we'll take you straight there.",
    manageProperty: "Manage my property",
    browseAll: "Browse the full portfolio",
  },
  ar: {
    skip: "انتقل إلى المحتوى",
    experience: "التجربة",
    properties: "العقارات",
    portal: "عقارك",
    destinations: "الوجهات",
    search: "بحث",
    searchPlaceholder: "ابحث في القطاعات والمشاريع والخدمات…",
    signIn: "تسجيل الدخول",
    register: "إنشاء حساب",
    takeBloom: "خذ بلوم معك",
    statProperties: "عقار مسجل",
    statHospitals: "مستشفى مسجل",
    statEducation: "مؤسسة تعليمية",
    statSupport: "دعم المستخدمين",
    followUs: "تابعنا",
    backToTop: "العودة للأعلى",
    rights: "جميع الحقوق محفوظة.",
    helpSupport: "المساعدة والدعم",
    menu: "القائمة",
    close: "إغلاق",
    home: "الرئيسية",
    theBloomExperience: "تجربة بلوم",
    heroA: "أكثر من مجرد",
    heroPlace: "مكان",
    heroB: "للعيش.",
    heroLede: "ستة قطاعات تصنع طريقة العيش والتعلم والإقامة والعمل في الإمارات — استكشفها جميعاً في مكان واحد.",
    getStarted: "استكشف",
    exploreDivisions: "استكشف القطاعات",
    divisions: "القطاعات",
    divisionsTitle: "منظومة واحدة، ستة أساليب لحياة أفضل",
    divisionsAside: "يقوم كل قطاع من قطاعات بلوم على فكرة واحدة: أماكن وخدمات تجعل الحياة اليومية أفضل.",
    featured: "مجتمعات مميزة",
    featuredTitle: "أماكن تستحق أن تكون وطناً",
    viewAllProjects: "عرض جميع المشاريع",
    portalEyebrow: "عقارك",
    portalTitleA: "عقارك،",
    portalTitleB: "بكل بساطة",
    portalLede: "أدر عقارات بلوم الخاصة بك، وتابع الدفعات، وابقَ على اطلاع بتقدم مشروعك عبر منصتنا الذكية.",
    downloadApp: "حمّل التطبيق",
    login: "تسجيل الدخول",
    discoverMore: "اكتشف المزيد",
    offerings: "ما نقدمه",
    otherDivisions: "المزيد من بلوم",
    goodMorning: "صباح الخير",
    goodAfternoon: "مساء الخير",
    goodEvening: "مساء الخير",
    projectDetails: "تفاصيل المشروع",
    exploreProperties: "استكشف العقارات",
    contactUs: "تواصل معنا",
    ourProjects: "مشاريعنا",
    contactSales: "تواصل مع المبيعات",
    communities: "المجتمعات",
    propertiesAssets: "العقارات والأصول",
    across: "في",
    whatBrings: "ما الذي يأتي بك إلى بلوم؟",
    quickStart: "ابدأ بسرعة",
    quickStartAside: "أخبرنا بما تحتاجه وسنأخذك إليه مباشرة.",
    manageProperty: "إدارة عقاري",
    browseAll: "تصفح المحفظة كاملة",
  },
};

const KEY = "bloom.lang";
let lang = "en";
try { lang = localStorage.getItem(KEY) === "ar" ? "ar" : "en"; } catch { /* storage unavailable */ }

const listeners = new Set();

export const getLang = () => lang;
export const t = (key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;

export function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function setLang(next) {
  if (next === lang) return;
  lang = next;
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  applyLang();
  listeners.forEach((fn) => fn(lang));
}

export const onLangChange = (fn) => listeners.add(fn);
