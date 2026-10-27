/* Bloom Holding content — taken from app.bloomholding.com (September 2026).
   Images are Bloom's own assets served from their Contentful CDN. */

const CF = "https://images.ctfassets.net/pln0jx42xwdu/";
export const img = (path, w = 1400) => `${CF}${path}?w=${w}&q=78&fm=webp`;
/* Lighter variant for decorative, heavily-overlaid imagery: lower quality
   WebP, sized by the caller (use with srcset) — a fraction of the bytes */
export const imgLite = (path, w = 720) => `${CF}${path}?w=${w}&q=62&fm=webp`;

export const CONTACT = {
  tollFree: "800 Bloom (25666)",
  tollFreeHref: "tel:80025666",
  international: "+971 2 696 9500",
  internationalHref: "tel:+97126969500",
  email: "customerservice@bloomholding.com",
  corporateSite: "https://www.bloomholding.com",
};

export const PORTAL_VIDEO =
  "https://app.bloomholding.com/assets/assets/video/intro-landscape.1c6677e8d76ec820f53eff2a0e4a2b53.mp4";

/* ---- Divisions (universal → universal-space) ---------------------------- */
export const DIVISIONS = [
  {
    id: "properties",
    task: "Find Your Perfect Home",
    icon: "home",
    name: "Bloom Properties",
    short: "Properties",
    route: "#/properties",
    image: "3TwFiMlzVC0Laffg5L7Mce/9975a86f51867ff4048884dd8ce4e1d3/Bloom_Properties_.png",
    headline: ["Curated", "communities"],
    serifWord: "communities",
    lede: "Premium communities in prime locations across Abu Dhabi and Dubai.",
  },
  {
    id: "education",
    task: "Find a school or nursery",
    icon: "school",
    name: "Bloom Education",
    short: "Education",
    route: "#/space/education",
    image: "49IRA5Kv2xI7jDVlOcRMYI/52d23062b6bc515bf5557927449dbfbb/Bloom_Education__.png",
    headline: ["Education", "For Life"],
    serifWord: "Life",
    description:
      "We are a leading education provider, shaping future generations through world-class schools, nurseries, and education partnerships across the UAE.",
    layout: "gallery",
    offerings: [
      { name: "Brighton Colleges", sub: "Abu Dhabi, Al Ain, Dubai", image: "buAsset5eb4b6bd8f31f3b711193142/1a4a1ac72b38631a51b1871a2bb51f36/space-education-tile.jpg" },
      { name: "Charter Schools", sub: "Emirates Schools Establishment", image: "buAsset6b70fa5dce5535ee328c51fa/745717f1d99b51a88812d4c98d21d8ce/Travel.jpeg" },
      { name: "Bloom World Academy", sub: "", image: "buAsset76fcb5112c323c8aebfa6234/e476655ac7018536fbf7000aaf1516c0/hub-hero.jpg" },
      { name: "Bloom Nurseries", sub: "", image: "buAssetd2d4011d38ff8505f9a210a5/2a51937846d1243033766dbc5034f89b/space-landscape-tile.jpg" },
    ],
  },
  {
    id: "retail",
    task: "Shop, Dine & Essentials",
    icon: "bag",
    name: "Bloom Retail",
    short: "Retail",
    route: "#/space/retail",
    image: "7aZ2eyQGV38I2Q7VrGL5Oe/b40215790e15c1b022e142290d5ff4af/Retail.png",
    headline: ["Destinations that Enrich", "Everyday Living"],
    serifWord: "Everyday",
    description:
      "Vibrant retail destinations that bring communities together — curated shopping, dining, and everyday conveniences.",
    layout: "gallery",
    offerings: [
      { name: "Neighbourhood Retail", sub: "", image: "buAsset4b6ac5b77b1b08660dbaf300/88d6292b0b999e95d56e375f41bad348/Health___Beauty.jpg" },
      { name: "Dining Destinations", sub: "", image: "Zd4GYlYbtrcCvrLOnjNZW/7a27f2bc773e00ee9c86c86247ee9436/Restaurants.jpg" },
      { name: "Convenience", sub: "", image: "buAsset0bdecac33c79f597d083e365/3a73e61098d24ec08f9f73953fa719ea/Supermarket.jpeg" },
      { name: "Coming Soon", sub: "", image: "5wxew9hSKQk9A7WTO0fzn1/fbe7eb746aa3255ab9d4c80083ed115b/Cafe.jpg", comingSoon: true },
    ],
  },
  {
    id: "hospitality",
    task: "Book a hotel stay",
    icon: "bed",
    name: "Bloom Hospitality",
    short: "Hospitality",
    route: "#/space/hospitality",
    image: "4Q2WxQUKezID4m2iLLon9H/c780e3f034aecee6744f00a5649e4590/The_Abu_Dhabi_EDITION.png",
    headline: ["Ultimate Relaxation", "Destinations"],
    serifWord: "Relaxation",
    description:
      "We own and operate internationally recognized five-star hotels and luxury hotel apartments in association with leading brands including Marriott Hotel Downtown Abu Dhabi, The Abu Dhabi EDITION, and Bloom Arjaan by Rotana. Thoughtfully embedded within our communities, these hotels attract visitors who play a vital role in driving long-term economic value.",
    layout: "gallery",
    offerings: [
      { name: "Marriott Hotel Downtown Abu Dhabi", sub: "", image: "buAsset9185f25a0e0222f2d5cac8c8/35bae409e4e5f9a7fb8232df25ff65aa/space-hospitality-tile.jpg" },
      { name: "The Abu Dhabi EDITION", sub: "", image: "4Q2WxQUKezID4m2iLLon9H/c780e3f034aecee6744f00a5649e4590/The_Abu_Dhabi_EDITION.png" },
    ],
  },
  {
    id: "landscape",
    task: "Landscaping services",
    icon: "leaf",
    name: "Bloom Landscape",
    short: "Landscape",
    route: "#/space/landscape",
    image: "2bXcvmDUaQJ1jLLIR5ejrO/2454e513f07871eca4a7453cac626cab/Bloom_Landscape.png",
    headline: ["Nurturing", "Nature"],
    serifWord: "Nature",
    description:
      "Bloom Landscape provides end-to-end landscaping services, from design and construction to maintenance, for both local and international clients.",
    layout: "index",
    offerings: [
      { name: "Landscape Design" },
      { name: "Hardscape Construction" },
      { name: "Nursery" },
      { name: "Softscape Installation" },
      { name: "Irrigation System" },
      { name: "Operations & Maintenance" },
    ],
  },
  {
    id: "facilities",
    task: "Home & building services",
    icon: "wrench",
    name: "Bloom Facilities Management",
    short: "Facilities Management",
    route: "#/space/facilities",
    image: "28Ik1kLfkdRZjhv8zk0rns/477fc6e0f90e93aed895dbd4fd4f604f/Bloom_Facilities_Management.png",
    headline: ["Pioneering", "Customer Delight"],
    serifWord: "Delight",
    /* Verbatim from the source page. The source reuses the Bloom Properties
       paragraph here — flagged for Bloom's content team (see DESIGN.md). */
    description:
      "Bloom properties is the developer of choice for curated premium communities in prime locations, with a proven track record of on-time delivery and a commitment to creating long-term value for end-users and investors.",
    layout: "index",
    offerings: [
      { name: "Sustainability Services" },
      { name: "Bloom Home Service" },
      { name: "Residential Services" },
      { name: "Corporate Services" },
    ],
  },
];

export const divisionById = (id) => DIVISIONS.find((d) => d.id === id);

/* ---- Projects (guest listing) ------------------------------------------ */
const G = {
  parkView: [
    "2MrwOrFfHmrGZiPjsYCtVd/392163f6f08c2ae47d63592157492a68/Park_Views_hi-res-6.jpg",
    "4FRZ3NVBmJpbfnjWeGV6G3/96bb7738f896db37217395b28ef9d988/Park_Views_hi-res.jpg",
    "5DuVv8grAGDf98a27UBSzt/bdfffb268ebf6620c3264f616e85ae85/Park_Views_hi-res-4.jpg",
    "66MEOGqBwZGw5r94469Llz/740a99e05fde2682018710e387aae68b/Park_Views_hi-res-2.jpg",
    "4kffKaYPLqz5JXnSxKRGZm/ef19d988056691010c17125aa1923739/Hero_Image.jpg",
    "6HYUvRVw1QdSaYzdIcBJLm/f5ca0a7206155b476d3ee82a0f87100a/0055.jpg",
  ],
  gardens: [
    "oNa2RvwMVoCS0SG6SMZwa/36a6c6c16373c69111a4b879c098ff19/Bloom_Gardens_Hero_Image.jpg",
    "3JJcPJHpzTXIk9AzeII9nq/db7779c4ec02d784ac267a413de3121c/Bloom_Gardens_Bloom_Gardens_hi-res-2.jpg",
    "Wu0GjLry2tNQarRLMnkQa/419a5179c27051d566f7106a85f90491/Bloom_Gardens_hi-res-3.jpg",
    "465qDeKTqCAee6QknRxSHd/b24084d406edc6e9d92eaa1c31c9f5b7/Bloom_Gardens_hi-res-40.jpg",
    "24JVYjcHqe8jeZC2qEtZw2/b81287835a1f1ce014ffddf0056c2551/Bloom_Gardens_hi-res-7.jpg",
  ],
  casares: [
    "2JCR76zsBua3VemMpnzXze/c86fbb3d283269c32cf493ce3068ad86/3BR_TH_Back_View_25MB_Hero_Image.jpg",
    "lfxtZOLYWsOF0wp63veAE/9d5090eed5af42d8a7070e564f68c6bd/General_Street_View_25_MB.jpg",
    "3jMKOJnXTAQVxScN4hZ471/e934fa1e4835b7cfc38986b901a72dff/General_Exterior_View_25MB.jpg",
    "6LKZEoB0N4vyz0U5rDsoyK/e226fa2224bf707532e07084232a08d3/General_Community_View_25MB.jpg",
    "1HkvUxCGtBWLdUg3ETdwnp/3acd0a1c62905fa958da72b48c373527/2BR_TH_Front_View_25MB.jpg",
  ],
  soho: [
    "1uqU1ghxiJqGANvRUmwRdK/0040fd801874a30b55c941ed2e56b5fa/Hero_Image.jpg",
    "6cKNRYYlb66RKpYS4lkpxi/05f60dc83eaac65bc5c60177c9502633/Soho_Sqaure_hi-res-2.jpg",
    "2oA4eUxmC1ZmRA2jq4VoQW/d98b847bb9e790d68a4cd1856bf4bee5/Soho_Sqaure_hi-res.jpg",
    "3sfKsj4WnxXJfbd4D1vqUk/596425d26c1b4c8eaa04b8602295f5a4/Soho_Sqaure_hi-res-7.jpg",
    "7f9nlYGukALpNtJKoRbA3J/1d310c94d594d5f7fa3633bda1a54042/Soho_Sqaure_hi-res-8.jpg",
  ],
  alDhay: [
    "3i2JUd4bnKs2PEf5XiWC5F/a64749473dc728d4ad3d74325d7cf506/Hero_Image.jpg",
    "25O14R536fSrKUvRVzPu13/94c4ec68dda0fedec0edd81c96fc4168/ANR04890.jpg",
    "2Q4brlWxZGaGmWnRWuOFQ/7c417f0e3c080aa6da934057aa1e54d1/DSC_7933-NEF_DxO_DeepPRIME-Edit.jpg",
    "5lV7ijhKksRk0bakviNaO5/e60aee6dbc20cc9f0c536b78a2101e57/DSC_8390-NEF_DxO_DeepPRIME-Edit.jpg",
    "7AVLVscFGAVppjJat0Ddo1/9491a1f0cac451e9b06f7b705bc135f9/DSC_8438-NEF_DxO_DeepPRIME-Edit.jpg",
  ],
  heights: [
    "6H4IWGW7R2kQCwH8eNIofZ/bae6effcac8b7de34449fe5a25f8ae5a/Bloom_Heights_Hero_Image.jpg",
    "W5Aj9lTWunwmoQgEFuDJM/d16acd5d9127961f001bd857ca3a9c89/Hero_Image.jpg",
    "6aJ5Vytk4PddlytzGe3kud/8a55f417597681344a5a9fc0945a4599/DJI_0093-Enhanced-Edit_-_Copy.jpg",
    "7wEwpz9tVxbKhOQ74vCgLc/d088b8a3cca6e8057da5995a17d16da0/DJI_0099-Enhanced-Edit.jpg",
    "5MXRxtl4pDaqrdwlKdnuXh/327acafe3ac13db2c11738c995da3642/DSCF4254-Enhanced-Edit.jpg",
  ],
  towers: [
    "6ZFP9ibGHSfoA0WJOHoV4Y/f5648ea1d5a652e7ed881b16a0ca0d43/Bloom_Towers_Hero_Images.jpg",
    "5oyMM6hCIYTMJOjnv18Yjs/38446d9e36ea81eb2ad06fad22b9cf5b/DJI_0112-Enhanced-Edit.jpg",
    "56mdBAfQsft7QGx6SWR8tp/1b7569e2b1fe9e5aa31cdbdc5dcdbeef/DJI_0983-Edit.jpg",
    "1i1ck7tmX6YGoEFqx9Xt0R/8a4b3cf510e67e9b1010bf94d356eab7/Hero_Images.jpg",
    "4v58z5fIODSBSQbQBUIQ2S/04daec1125a5e1c0fe63cd18c2745ab8/DJI_0011-Enhanced-Edit-Edit.jpg",
  ],
  toledo: [
    "Eg7rV51ZWTh0tayHIoHy8/b7c734b12d0ca531c71beacfb75e40b2/Hero_Image.jpg",
    "48dm10qNhFod9PwYVZkXIl/77cfaebf019bff59b840d1c7d9265c00/V04_Front-rev.jpg",
    "6Tjg2XQ9MR40c4rt9MyUC3/84724ccc33c7bce38ffe341054a33378/TH_02_FRONT.jpg",
    "1adWNuv2O07MSDUcXrDopV/25007e637284136d64e0b11650124635/TH_03_FRONT.jpg",
    "7rNpu9AmWTmc5HKl6yQFkD/28d7fd01758de49206ac8f85bf5f2665/V03_Front-rev.jpg",
  ],
  granada: [
    "5eX8ZmHpV4VdyT1TzZ67b6/6a7a9d3f35541abc8ebc05360d938cf2/241022_RR7237_Bloom_Granada_2_Hero_shot-Warm_Final5mb.jpg",
    "4nNNaafNGiOJhHvsmbWen3/14d51287aed6b3929914a9affce4abb8/241022_RR7237_Bloom_Granada_2_02.Street2_Final5mb.jpg",
    "4OYjP4Tqw2DNgIQvvk33Dd/5e74aa38a957b8d392cda756ae1ba6b9/241022_RR7237_Bloom_Granada_2_04.Terrace-Warm_Final5mb.jpg",
    "23LaorqPlgr4Og8jp4tKi0/87bf60cc3575ad114c5b4eb2831be3b5/241022_RR7237_Bloom_Granada_2_07.Courtyardt-Warm_Final2_Final_5mb.jpg",
    "7sASWuf8GrOeLKPgnLkneQ/7892792cc67383102d09ebddfcf30b0b/Hero_Image_Bloom_Granada_2_Ext-01.Street1_5mb.jpg",
  ],
  olvera: [
    "bY1xpBw0QsAmB81H9Eoza/3896ef2ded31e8675111324d503ea629/Olvera_3BR_TH_Front_25MB_Hero_Image.jpg",
    "3X4VygLfF3LzDg5KFStxv4/73dae2a108cd4fcdc40385dab79289f0/Olvera_General_Ext_View_25MB.jpg",
    "2f180P4dTj9jF8hPCZhKpW/b4c1873fc1bf65d808887cf4623210c9/Olvera_General_Comm_View_25MB.jpg",
    "1HXkUZlsdxIAKOQkKm00PO/929cdbc77e8679df3827e8cef3abace5/Olvera_3BR_TH_Front_25MB.jpg",
    "ZE5KUMye0khIJQbq9cejE/b839176e9bc02733c6fda4c999c1cb4e/Olvera_2BR_TH_Back_25MB.jpg",
  ],
  carmona: [
    "1vYJ6wlChuFDvGS9Yuxik4/0c71c27c76164d7fd96011ff1cedd151/Carmona_3BR_TH_Front_25MB_Hero_Image.jpg",
    "21mGkN5ZPOn2K19nnA1f76/894e06f95c14ceefcfb0cb7e75feb46f/Community_Centre_View_25MB.jpg",
    "1bK7JY7dRkoK9FpGyLTA0f/799eeeeb7eb3d3585c6e87d74cb8613e/Carmona_General_Ext_View_25MB.jpg",
    "RqLyxgq0AvXJbrK6KNDcP/98f7270e2dd3edb2c78f776e94c5e7fb/Carmona_General_Street_View_25MB.jpg",
    "66QWvEjWEWmjcr1suUBavJ/23fbf261947edd1011308ede21526988/Carmona_2BR_TH_Front_25MB.jpg",
  ],
};

const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* collection: "Bloom Living" for projects branded or phased under Bloom Living */
const P = (name, extra = {}) => ({ id: slug(name), name, images: [], collection: "Bloom Communities", ...extra });

export const PROJECTS = [
  P("Bloom Arjaan", { amenities: ["Gym", "Swimming Pool", "Restaurant", "Built-in Wardrobes"] }),
  P("Park View by Bloom Living", { images: G.parkView, collection: "Bloom Living" }),
  P("Bloom Gardens", {
    images: G.gardens,
    description:
      "Bloom Gardens is a luxury, gated residential community in Abu Dhabi developed by Bloom Holding that features Mediterranean-inspired villas and townhouses",
    documents: [{ name: "Brochure", size: "PDF" }],
  }),
  P("Casares", { images: G.casares, map: true, collection: "Bloom Living" }),
  P("Soho Square By Bloom Living", { images: G.soho, collection: "Bloom Living" }),
  P("Al Dhay", { images: G.alDhay }),
  P("Bloom Heights", { images: G.heights }),
  P("Bloom Towers", { images: G.towers }),
  P("Cordoba", { map: true, collection: "Bloom Living" }),
  P("Toledo", { images: G.toledo, map: true, collection: "Bloom Living" }),
  P("Granada", { images: G.granada, collection: "Bloom Living" }),
  P("Seville", { images: G.granada, collection: "Bloom Living" }),
  P("Olvera", { images: G.olvera, collection: "Bloom Living" }),
  P("Mabel Marbella Residences", { collection: "Bloom Living" }),
  P("Green Hills"),
  P("Al Ghadeer"),
  P("Mushrif Garden"),
  P("Sadiyat"),
  P("Almeria", { collection: "Bloom Living" }),
  P("Carmona", { images: G.carmona, collection: "Bloom Living" }),
];

/* ---- Explore Properties (full portfolio list from project details) ------ */
const EXPLORE_NAMES = [
  "Bloom Arjaan", "Park View by Bloom Living", "Bloom Gardens", "Casares", "Al Dhay", "Soho Square By Bloom Living",
  "Bloom Heights", "Bloom Towers", "Cordoba", "Toledo", "Granada", "Seville", "Olvera",
  "Mabel Marbella Residences", "Green Hills", "Al Ghadeer", "Mushrif Garden", "Sadiyat", "Almeria",
  "Carmona", "FH-1", "Al Mankhool", "Al Heel Tower", "Al Reem", "Citi Bank", "O General",
  "Al Riffa Building", "Al Waha", "Ganadah towers", "Bloom Central", "Bloom Marina", "ADNEC Land",
  "Al Mowgee Land Al Ain", "Al Nahyan", "Bloom Garden Retail B", "Bloom Gardens Phase1 Leasing",
  "Brighton College Dubai", "Musaffah Lands 1 & 2", "Musaffah Lands 118", "Brighton College Abu Dhabi",
  "Brighton College Al Ain", "Awaida", "Bloom Garden Retail", "Dwight School Dubai", "SOHO SQUARE LEASING",
  "Bloom Office", "Bloom Garden Nursery", "Bloom World Academy", "Retail B", "Shams Meera", "Ansam",
  "Horizon Tower", "Kids Island", "Burooj View", "Mamsha Saadiyat", "Pixel Tower", "Reflection Tower",
  "Oia Residence West", "Shawamkh", "Sigma Tower",
];

/* Grouping is a presentation aid derived from each asset's name. */
function categorize(name) {
  const n = name.toLowerCase();
  if (/college|school|academy|nursery|kids island/.test(n)) return "Education";
  if (/land/.test(n) && !/island/.test(n)) return "Land";
  if (/leasing/.test(n)) return "Leasing";
  if (/retail/.test(n)) return "Retail";
  if (/tower|burooj|building|office|bank|o general|fh-1/.test(n)) return "Towers & Buildings";
  return "Communities";
}

export const EXPLORE = EXPLORE_NAMES.map((name) => {
  const known = PROJECTS.find((p) => p.name === name);
  return { id: known ? known.id : slug(name), name, category: categorize(name), images: known ? known.images : [] };
});

export const EXPLORE_CATEGORIES = ["All", "Communities", "Towers & Buildings", "Education", "Retail", "Leasing", "Land"];

export const projectById = (id) =>
  PROJECTS.find((p) => p.id === id) || (() => {
    const e = EXPLORE.find((x) => x.id === id);
    return e ? P(e.name, { images: e.images, category: e.category }) : null;
  })();

/* ---- Portal (welcome) ---------------------------------------------------- */
export const PORTAL = {
  features: [
    { icon: "building", title: "Property management", body: "Track your properties, monitor construction progress, and manage all aspects of your real estate portfolio." },
    { icon: "wallet", title: "Payment Tracking", body: "Stay on top of all payments, fees, and financial obligations with real-time alerts and notifications." },
    { icon: "shield", title: "Secure Platform", body: "Your data is protected with enterprise-grade security and encryption technologies." },
  ],
  mobile: [
    "Real-time construction progress updates",
    "Instant payment alerts and notifications",
    "Secure document access",
    "Quick customer support",
  ],
  notifications: [
    { icon: "check", title: "Payment Confirmed", body: "Your payment of AED 110,000 has been received" },
    { icon: "bell", title: "Construction Update", body: "Your property A1-401 Bloom Central is now 75% complete", progress: 75 },
  ],
  /* photo: PLACEHOLDER portraits from Unsplash (free under the Unsplash
     License; credits below). They are not the people quoted. Replace with
     real customer photos, used with their consent, before launch.
     - 86 media         https://unsplash.com/photos/SasKN0DlRWI
     - Megan Bucknall   https://unsplash.com/photos/ydGsJIFNTfA
     - Gregory Gill     https://unsplash.com/photos/4Bf5LNEPqZ0 */
  testimonials: [
    { quote: "Bloom has transformed how I manage my real estate investments. The payment tracking feature alone has saved me countless hours.", name: "Ahmed Al-Mansouri", role: "Property Investor", rating: 5, photo: "https://images.unsplash.com/photo-1719561940606-ec38a36e5f18", focus: "faces" },
    { quote: "The construction progress updates give me peace of mind. I always know exactly how my new home is progressing.", name: "Sarah Johnson", role: "First-time Buyer", rating: 4.5, photo: "https://images.unsplash.com/photo-1594756154841-ac5d160dbf46", focus: "faces" },
    { quote: "My clients love the transparency and real-time updates. It's made my job so much easier.", name: "Mohammed Hassan", role: "Real Estate Agent", rating: 5, photo: "https://images.unsplash.com/photo-1580411402629-e0cdf76f3d3b", focus: "faces" },
  ],
};

export const FOOTER_PROJECTS = [
  "Property - Leasing", "Property - Sales", "Aldhay", "Bloom Arjaan by Rotana", "Soho Square",
  "Bloom Central", "Bloom Gardens", "Bloom Heights", "Bloom Living Abu Dhabi", "Rochester, USA",
];

/* Footer label → in-app destination where one exists */
export const FOOTER_LINKS = {
  "Property - Leasing": "#/properties?tab=explore&cat=Leasing",
  "Property - Sales": "#/properties",
  "Aldhay": "#/project/al-dhay",
  "Bloom Arjaan by Rotana": "#/project/bloom-arjaan",
  "Soho Square": "#/project/soho-square-by-bloom-living",
  "Bloom Central": "#/project/bloom-central",
  "Bloom Gardens": "#/project/bloom-gardens",
  "Bloom Heights": "#/project/bloom-heights",
  "Bloom Living Abu Dhabi": "#/properties?collection=Bloom%20Living",
  "Rochester, USA": CONTACT.corporateSite,
};
