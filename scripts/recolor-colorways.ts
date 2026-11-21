/**
 * Generates a product image for every colourway that doesn't have one yet by
 * two-tone recolouring the two original logo-free Hike renders:
 *
 *   A — Air Runner (black mesh upper, ember trims)       → running & training
 *   B — Flex Motion (ember knit upper, graphite panels)  → lifestyle & basketball
 *
 * Each pixel is classed as upper, trim or sole. The upper takes the
 * colourway's first swatch, trims take the second, and the sole stays as is.
 * Shading is kept by moving each pixel's lightness relative to its region.
 *
 *   npm run images:recolor            only fills in missing images
 *   npm run images:recolor -- --force regenerates every recoloured image
 *
 * The two source renders are never modified.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { products, type Category } from "../src/data/products";

const DIR = path.resolve(__dirname, "../src/assets/products");
const SIZE = 900;
const FORCE = process.argv.includes("--force");
const SOURCES = new Set(["air-runner--black-ember", "flex-motion--ember"]);

type HSL = [number, number, number];

function hexToHsl(hex: string): HSL {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgbToHsl((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

function rgbToHsl(r8: number, g8: number, b8: number): HSL {
  const r = r8 / 255, g = g8 / 255, b = b8 / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const isEmber = (h: number, s: number) => s > 0.35 && (h < 40 || h > 340);

type Region = "upper" | "trim" | null;

/** Which region a source pixel belongs to, per base render. */
const classify = {
  A: (h: number, s: number, l: number): Region => (isEmber(h, s) ? "trim" : s < 0.3 && l < 0.33 ? "upper" : null),
  B: (h: number, s: number, l: number): Region => (isEmber(h, s) ? "upper" : s < 0.3 && l < 0.6 ? "trim" : null),
};

/** Mean lightness of each region in the source, so shading can be re-centred. */
const SOURCE_MEAN = { A: { upper: 0.1, trim: 0.5 }, B: { upper: 0.52, trim: 0.33 } };

function shade(target: HSL, l: number, mean: number, contrast: number): [number, number, number] {
  // Keep the source's shading: offset from the region mean, scaled.
  const tl = clamp01(target[2] + (l - mean) * contrast);
  // Near-neutral targets keep a whisper of cool tint so whites don't look dead.
  const ts = target[1] < 0.08 ? 0.04 : target[1];
  return hslToRgb(target[1] < 0.08 ? 215 : target[0], ts, tl);
}

async function recolour(base: "A" | "B", upper: HSL, trim: HSL, flip: boolean, out: string) {
  const src = path.join(DIR, base === "A" ? "air-runner--black-ember.webp" : "flex-motion--ember.webp");
  const { data, info } = await sharp(src)
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Darker targets need more contrast stretch to keep fabric texture readable.
  const upperContrast = base === "A" ? (upper[2] > 0.4 ? 2.2 : 1.4) : 0.9;
  const trimContrast = 0.8;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const region = classify[base](h, s, l);
    if (!region) continue;
    const [r, g, b] =
      region === "upper"
        ? shade(upper, l, SOURCE_MEAN[base].upper, upperContrast)
        : shade(trim, l, SOURCE_MEAN[base].trim, trimContrast);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  let img = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  if (flip) img = img.flop();
  await img.webp({ quality: 84, alphaQuality: 92 }).toFile(out);
}

const BASE_FOR: Record<Category, "A" | "B"> = { running: "A", training: "A", lifestyle: "B", basketball: "B" };

async function main() {
  let made = 0;
  for (const [pi, product] of products.entries()) {
    for (const [ci, c] of product.colorways.entries()) {
      const key = `${product.id}--${c.id}`;
      if (SOURCES.has(key)) continue;
      const out = path.join(DIR, `${key}.webp`);
      if (existsSync(out) && !FORCE) continue;
      await recolour(BASE_FOR[product.category], hexToHsl(c.swatch[0]), hexToHsl(c.swatch[1]), (pi + ci) % 2 === 1, out);
      made++;
    }
  }
  console.log(`${made} image(s) generated in src/assets/products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
