/**
 * Hike catalogue — static demo data. Prices, specs and stock are illustrative;
 * there is no backend. Product ids for the four original shoes are kept
 * stable because GA4 reports from the first version key on them.
 */
import { productImage } from "./images";

export type Category = "running" | "lifestyle" | "training" | "basketball";
export type Gender = "men" | "women" | "unisex" | "kids";
export type Badge = "new" | "bestseller" | "sale";

export interface Colorway {
  id: string;
  name: string;
  /** Swatch colours, upper first then sole. */
  swatch: [string, string];
  image: string;
  /** Sizes out of stock in this colourway. */
  soldOut?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  gender: Gender;
  price: number;
  /** Original price when the product is on sale. */
  compareAt?: number;
  badges: Badge[];
  tagline: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  colorways: Colorway[];
  sizes: string[];
  /** Lower ranks first in "Featured" sort. */
  rank: number;
  /** ISO date, used for "Newest" sort. */
  released: string;
}

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "running", label: "Running", blurb: "Road, trail and race day." },
  { id: "lifestyle", label: "Lifestyle", blurb: "Everyday pairs with sport in their DNA." },
  { id: "training", label: "Training", blurb: "Stable platforms for lifting and HIIT." },
  { id: "basketball", label: "Basketball", blurb: "Grip, lockdown and bounce for the court." },
];

export const GENDERS: { id: Gender; label: string }[] = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "unisex", label: "Unisex" },
  { id: "kids", label: "Kids" },
];

const ADULT_SIZES = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"];
const KIDS_SIZES = ["3.5Y", "4Y", "4.5Y", "5Y", "5.5Y", "6Y", "6.5Y", "7Y"];

type ColorwayInput = Omit<Colorway, "image">;
const cw = (productId: string, list: ColorwayInput[]): Colorway[] =>
  list.map((c) => ({ ...c, image: productImage(productId, c.id) }));

const runSpecs = (weight: string, drop: string, stack: string) => [
  { label: "Weight (US M9)", value: weight },
  { label: "Heel-to-toe drop", value: drop },
  { label: "Heel stack", value: stack },
];

export const products: Product[] = [
  // ——— Running ———
  {
    id: "air-runner",
    name: "Hike Air Runner",
    category: "running",
    gender: "unisex",
    price: 120,
    badges: ["bestseller"],
    tagline: "Daily road trainer",
    description:
      "Lightweight and breathable, the Air Runner is built for the miles you log every week. A responsive foam midsole and seamless engineered mesh keep it light from the first kilometre to the last.",
    features: ["Engineered mesh upper", "Responsive full-length foam", "Rubber in high-wear zones", "Padded heel collar"],
    specs: runSpecs("268 g", "10 mm", "36 mm"),
    colorways: cw("air-runner", [
      { id: "black-ember", name: "Black / Ember", swatch: ["#111111", "#FF5A1F"], soldOut: ["13"] },
      { id: "cloud-grey", name: "Cloud Grey / White", swatch: ["#D9DCDF", "#FFFFFF"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 1,
    released: "2026-02-10",
  },
  {
    id: "velocity",
    name: "Hike Velocity",
    category: "running",
    gender: "men",
    price: 140,
    badges: [],
    tagline: "Tempo and speed work",
    description:
      "Built for the fast lane. The Velocity pairs a low-slung, aerodynamic silhouette with an energy-return sole that pushes you forward on intervals, tempo runs and race day.",
    features: ["Energy-return midsole", "Rocker geometry", "Lightweight knit upper", "Reflective heel details"],
    specs: runSpecs("232 g", "8 mm", "34 mm"),
    colorways: cw("velocity", [
      { id: "crimson", name: "Crimson / Black", swatch: ["#B3121F", "#111111"], soldOut: ["8", "8.5"] },
      { id: "volt", name: "Volt / Black", swatch: ["#D7F23A", "#111111"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 5,
    released: "2025-11-04",
  },
  {
    id: "tempo-elite",
    name: "Hike Tempo Elite",
    category: "running",
    gender: "unisex",
    price: 210,
    badges: ["new"],
    tagline: "Carbon-plated racer",
    description:
      "Our fastest shoe. A full-length carbon plate sandwiched in high-rebound foam turns every stride into propulsion, with a featherweight upper that disappears on race day.",
    features: ["Full-length carbon plate", "High-rebound race foam", "Monofilament upper", "Race-day outsole"],
    specs: runSpecs("198 g", "8 mm", "39 mm"),
    colorways: cw("tempo-elite", [
      { id: "white-ember", name: "White / Ember", swatch: ["#F4F4F4", "#FF5A1F"] },
      { id: "electric-blue", name: "Electric Blue", swatch: ["#2F5BEA", "#F4F4F4"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 2,
    released: "2026-11-01",
  },
  {
    id: "glide-max",
    name: "Hike Glide Max",
    category: "running",
    gender: "women",
    price: 160,
    badges: ["new"],
    tagline: "Max-cushion comfort",
    description:
      "Our softest ride. A tall, wide stack of plush foam soaks up long runs and recovery days, while a gentle rocker keeps the ride rolling instead of sinking.",
    features: ["Max-stack plush foam", "Wide, stable base", "Gentle rocker", "Plush tongue and collar"],
    specs: runSpecs("281 g", "6 mm", "42 mm"),
    colorways: cw("glide-max", [
      { id: "lilac", name: "Lilac / Sail", swatch: ["#B9A7E8", "#F3F0E8"] },
      { id: "black", name: "Triple Black", swatch: ["#151515", "#151515"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 7,
    released: "2026-10-12",
  },
  {
    id: "pacer-2",
    name: "Hike Pacer 2",
    category: "running",
    gender: "women",
    price: 88,
    compareAt: 110,
    badges: ["sale"],
    tagline: "Everyday neutral runner",
    description:
      "The dependable one. Balanced cushioning, a breathable upper and a durable outsole make the Pacer 2 an easy pick for easy miles, the gym and everything in between.",
    features: ["Balanced foam midsole", "Breathable mesh", "Durable rubber outsole", "Pull tab at heel"],
    specs: runSpecs("254 g", "10 mm", "33 mm"),
    colorways: cw("pacer-2", [{ id: "sky", name: "Sky Blue / White", swatch: ["#8EC5F0", "#FFFFFF"] }]),
    sizes: ADULT_SIZES,
    rank: 10,
    released: "2025-03-18",
  },
  {
    id: "trailhead",
    name: "Hike Trailhead",
    category: "running",
    gender: "unisex",
    price: 150,
    badges: [],
    tagline: "Trail running",
    description:
      "Made for the path the brand is named after. Deep multi-directional lugs, a protective rock plate and a water-resistant upper keep you moving on mud, scree and roots.",
    features: ["5 mm multi-directional lugs", "Rock plate", "Water-resistant upper", "Toe bumper"],
    specs: runSpecs("298 g", "6 mm", "32 mm"),
    colorways: cw("trailhead", [
      { id: "moss", name: "Moss / Ember", swatch: ["#4F6B3A", "#FF5A1F"] },
      { id: "stone", name: "Stone / Black", swatch: ["#A39A8C", "#111111"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 6,
    released: "2026-06-02",
  },

  // ——— Lifestyle ———
  {
    id: "street-pro",
    name: "Hike Street Pro",
    category: "lifestyle",
    gender: "unisex",
    price: 110,
    badges: ["bestseller"],
    tagline: "Chunky everyday sneaker",
    description:
      "From the track to the street. The Street Pro combines chunky, sculpted styling with all-day comfort and a grippy, durable outsole.",
    features: ["Sculpted chunky midsole", "Leather and mesh upper", "Cushioned sockliner", "Durable rubber outsole"],
    specs: [
      { label: "Upper", value: "Leather / mesh" },
      { label: "Midsole", value: "EVA foam" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("street-pro", [
      { id: "white-navy", name: "White / Navy", swatch: ["#F4F4F4", "#1F3A6B"] },
      { id: "sand", name: "Sand / Gum", swatch: ["#D8C7A8", "#A86E3A"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 4,
    released: "2025-09-20",
  },
  {
    id: "flex-motion",
    name: "Hike Flex Motion",
    category: "lifestyle",
    gender: "women",
    price: 130,
    badges: [],
    tagline: "Knit sock-fit sneaker",
    description:
      "Adaptive flexibility meets bold design. The Flex Motion's knit upper moves with your foot for a sock-like fit, made for long days on your feet and light training.",
    features: ["Stretch knit upper", "Sock-like collar", "Flexible foam sole", "Pull loop at heel"],
    specs: [
      { label: "Upper", value: "Stretch knit" },
      { label: "Midsole", value: "Flex foam" },
      { label: "Fit", value: "Snug — size up for wide feet" },
    ],
    colorways: cw("flex-motion", [
      { id: "ember", name: "Ember / Graphite", swatch: ["#FF5A1F", "#4A4F57"] },
      { id: "graphite", name: "Graphite / White", swatch: ["#4A4F57", "#FFFFFF"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 8,
    released: "2026-04-15",
  },
  {
    id: "court-classic",
    name: "Hike Court Classic",
    category: "lifestyle",
    gender: "unisex",
    price: 72,
    compareAt: 90,
    badges: ["sale"],
    tagline: "Leather low-top",
    description:
      "A clean leather low-top that goes with everything. Perforated toe box, a cupsole built to last and the kind of shape that never goes out of rotation.",
    features: ["Full-grain leather upper", "Perforated toe box", "Stitched cupsole", "Padded collar"],
    specs: [
      { label: "Upper", value: "Leather" },
      { label: "Sole", value: "Rubber cupsole" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("court-classic", [
      { id: "white", name: "Triple White", swatch: ["#FFFFFF", "#FFFFFF"] },
      { id: "forest", name: "White / Forest", swatch: ["#FFFFFF", "#1F5B3A"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 9,
    released: "2024-08-01",
  },
  {
    id: "retro-86",
    name: "Hike Retro 86",
    category: "lifestyle",
    gender: "men",
    price: 100,
    badges: [],
    tagline: "Suede retro runner",
    description:
      "A throwback to the jogging boom: suede overlays, a nylon base and a wedge midsole, tuned with modern foam for all-day wear.",
    features: ["Suede and nylon upper", "Wedge midsole", "Modern comfort foam", "Retro tread"],
    specs: [
      { label: "Upper", value: "Suede / nylon" },
      { label: "Midsole", value: "EVA wedge" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("retro-86", [
      { id: "navy-gum", name: "Navy / Gum", swatch: ["#1F2B4D", "#A86E3A"] },
      { id: "grey", name: "Grey / Ember", swatch: ["#8C9096", "#FF5A1F"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 11,
    released: "2026-09-05",
  },
  {
    id: "slip-easy",
    name: "Hike Slip Easy",
    category: "lifestyle",
    gender: "women",
    price: 85,
    badges: [],
    tagline: "Laceless slip-on",
    description:
      "Step in and go. A stretch knit upper, a heel you can push down with your other foot and a soft foam sole make this the easiest pair you own.",
    features: ["Laceless knit upper", "Step-in heel", "Soft foam sole", "Machine-washable"],
    specs: [
      { label: "Upper", value: "Stretch knit" },
      { label: "Midsole", value: "Soft foam" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("slip-easy", [{ id: "oat", name: "Oat / White", swatch: ["#E2D6C1", "#FFFFFF"] }]),
    sizes: ADULT_SIZES,
    rank: 15,
    released: "2026-05-22",
  },

  // ——— Training ———
  {
    id: "lift-trainer",
    name: "Hike Lift Trainer",
    category: "training",
    gender: "unisex",
    price: 120,
    badges: [],
    tagline: "Flat, stable lifting shoe",
    description:
      "A low, firm platform for squats and deadlifts, with a wide forefoot and a midfoot strap that locks you in when the bar gets heavy.",
    features: ["Firm, flat platform", "Midfoot lockdown strap", "Wide forefoot", "Grippy rubber outsole"],
    specs: [
      { label: "Heel-to-toe drop", value: "4 mm" },
      { label: "Platform", value: "Firm TPU" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("lift-trainer", [
      { id: "black-white", name: "Black / White", swatch: ["#111111", "#FFFFFF"] },
      { id: "red", name: "Signal Red", swatch: ["#D62828", "#111111"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 12,
    released: "2025-12-01",
  },
  {
    id: "circuit-tr",
    name: "Hike Circuit TR",
    category: "training",
    gender: "women",
    price: 80,
    compareAt: 100,
    badges: ["sale"],
    tagline: "HIIT and class training",
    description:
      "Quick lateral moves, box jumps and burpees: the Circuit TR has a flexible forefoot, a stable heel and side walls that hold you in place.",
    features: ["Flexible forefoot grooves", "Stable heel counter", "Lateral support walls", "Breathable mesh"],
    specs: [
      { label: "Heel-to-toe drop", value: "6 mm" },
      { label: "Midsole", value: "Dual-density foam" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("circuit-tr", [{ id: "teal", name: "Teal / Black", swatch: ["#1A8C8C", "#111111"] }]),
    sizes: ADULT_SIZES,
    rank: 14,
    released: "2025-01-14",
  },
  {
    id: "agility-knit",
    name: "Hike Agility Knit",
    category: "training",
    gender: "men",
    price: 95,
    badges: [],
    tagline: "Light all-round trainer",
    description:
      "One shoe for the treadmill, the weights and the stretch mat. A light knit upper and a low, stable sole keep it versatile.",
    features: ["Light knit upper", "Low stable sole", "Rubber wrap at toe", "Cushioned insole"],
    specs: [
      { label: "Heel-to-toe drop", value: "6 mm" },
      { label: "Midsole", value: "EVA foam" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("agility-knit", [
      { id: "slate", name: "Slate / Ember", swatch: ["#3D4652", "#FF5A1F"] },
      { id: "white", name: "White / Grey", swatch: ["#F4F4F4", "#9BA0A6"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 16,
    released: "2026-07-08",
  },

  // ——— Basketball ———
  {
    id: "rim-runner",
    name: "Hike Rim Runner",
    category: "basketball",
    gender: "men",
    price: 140,
    badges: ["new"],
    tagline: "High-top performance",
    description:
      "Lockdown for big cuts and bounce for big leaps. A high collar, a responsive forefoot pod and a herringbone outsole made for indoor courts.",
    features: ["High-top padded collar", "Responsive forefoot pod", "Herringbone traction", "Internal heel counter"],
    specs: [
      { label: "Cut", value: "High" },
      { label: "Cushioning", value: "Forefoot pod + foam" },
      { label: "Surface", value: "Indoor court" },
    ],
    colorways: cw("rim-runner", [
      { id: "black-ember", name: "Black / Ember", swatch: ["#111111", "#FF5A1F"] },
      { id: "white-royal", name: "White / Royal", swatch: ["#F4F4F4", "#2B4DB8"] },
    ]),
    sizes: ADULT_SIZES,
    rank: 3,
    released: "2026-10-28",
  },
  {
    id: "court-vision-mid",
    name: "Hike Court Vision Mid",
    category: "basketball",
    gender: "unisex",
    price: 125,
    badges: [],
    tagline: "Mid-top all-court",
    description:
      "A mid-top for guards and wings who want ankle support without the weight. Durable rubber handles indoor and outdoor courts.",
    features: ["Mid-top collar", "Full-length foam", "Durable outdoor rubber", "Synthetic leather upper"],
    specs: [
      { label: "Cut", value: "Mid" },
      { label: "Cushioning", value: "Full-length foam" },
      { label: "Surface", value: "Indoor / outdoor" },
    ],
    colorways: cw("court-vision-mid", [{ id: "white-red", name: "White / Red", swatch: ["#F4F4F4", "#C8102E"] }]),
    sizes: ADULT_SIZES,
    rank: 13,
    released: "2025-10-10",
  },
  {
    id: "fastbreak-low",
    name: "Hike Fastbreak Low",
    category: "basketball",
    gender: "women",
    price: 92,
    compareAt: 115,
    badges: ["sale"],
    tagline: "Low-top for quick guards",
    description:
      "Low to the ground and quick off the mark. A lightweight upper and a court-feel midsole for players who live on change of pace.",
    features: ["Low-top lightweight upper", "Court-feel midsole", "Multi-directional traction", "Padded tongue"],
    specs: [
      { label: "Cut", value: "Low" },
      { label: "Cushioning", value: "Low-profile foam" },
      { label: "Surface", value: "Indoor court" },
    ],
    colorways: cw("fastbreak-low", [{ id: "mint", name: "Mint / White", swatch: ["#9FE2C8", "#FFFFFF"] }]),
    sizes: ADULT_SIZES,
    rank: 17,
    released: "2025-02-01",
  },
  {
    id: "hoop-lite-kids",
    name: "Hike Hoop Lite",
    category: "basketball",
    gender: "kids",
    price: 75,
    badges: [],
    tagline: "Big kids' court shoe",
    description:
      "Everything the grown-up pairs have, sized for the next generation: grippy rubber, a supportive collar and a hook-and-loop strap for fast lacing.",
    features: ["Hook-and-loop strap", "Supportive collar", "Grippy rubber outsole", "Lightweight foam"],
    specs: [
      { label: "Cut", value: "Mid" },
      { label: "Closure", value: "Laces + strap" },
      { label: "Fit", value: "True to size" },
    ],
    colorways: cw("hoop-lite-kids", [{ id: "ember", name: "Ember / Black", swatch: ["#FF5A1F", "#111111"] }]),
    sizes: KIDS_SIZES,
    rank: 18,
    released: "2026-08-19",
  },
];

// ——— Queries ———

export const getProduct = (id: string | undefined) => products.find((p) => p.id === id);

export const getColorway = (product: Product, colorwayId?: string | null) =>
  product.colorways.find((c) => c.id === colorwayId) ?? product.colorways[0];

export const isOnSale = (p: Product) => p.compareAt !== undefined && p.compareAt > p.price;

export const formatPrice = (n: number) => {
  const digits = n % 1 ? 2 : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
};

/** Readable, unique style code: product initials, catalogue position and colourway position (e.g. HK-AR-001-02). */
export const styleCode = (product: Product, colorway: Colorway) => {
  const words = product.id.split("-");
  const initials = words.length > 1 ? words.map((w) => w[0]).join("") : product.id.slice(0, 2);
  const productIndex = String(products.findIndex((p) => p.id === product.id) + 1).padStart(3, "0");
  const colorIndex = String(Math.max(0, product.colorways.findIndex((c) => c.id === colorway.id)) + 1).padStart(2, "0");
  return `HK-${initials.toUpperCase()}-${productIndex}-${colorIndex}`;
};

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductFilters {
  category?: Category | null;
  genders?: Gender[];
  sizes?: string[];
  maxPrice?: number | null;
  sale?: boolean;
  query?: string;
}

const normalise = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const matchesQuery = (p: Product, query: string) => {
  const q = normalise(query.trim());
  if (!q) return true;
  const words = normalise([p.name, p.tagline, p.category, p.gender, ...p.colorways.map((c) => c.name)].join(" "))
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  // Each term must start a word, so "men" finds Men but not Women.
  return q.split(/\s+/).every((term) => words.some((w) => w.startsWith(term)));
};

export const filterProducts = (list: Product[], f: ProductFilters) =>
  list.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.genders?.length) {
      // Unisex styles count for Men and Women, never for Kids.
      const adultPick = f.genders.some((g) => g === "men" || g === "women");
      if (!f.genders.includes(p.gender) && !(p.gender === "unisex" && adultPick)) return false;
    }
    if (f.sizes?.length && !f.sizes.some((s) => p.sizes.includes(s))) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.sale && !isOnSale(p)) return false;
    if (f.query && !matchesQuery(p, f.query)) return false;
    return true;
  });

export const sortProducts = (list: Product[], key: SortKey) => {
  const out = [...list];
  switch (key) {
    case "newest":
      return out.sort((a, b) => b.released.localeCompare(a.released));
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    default:
      return out.sort((a, b) => a.rank - b.rank);
  }
};

/** Same category first, then anything else, never the product itself. */
export const relatedProducts = (product: Product, count = 4) =>
  sortProducts(
    products.filter((p) => p.id !== product.id),
    "featured",
  )
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, count);

// ——— Shipping (demo rules) ———
export const FREE_SHIPPING_FROM = 100;
export const SHIPPING_FEE = 8;
export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE);
