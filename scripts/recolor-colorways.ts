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
 * Every image (the two source renders included) is trimmed to the alpha bounding
 * box, given ~3% transparent padding on every side and capped at 800px on the
 * longest side. The source renders are only rewritten when they are not already
 * in that trimmed form, so re-running the script is stable.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { products, type Category } from "../src/data/products";

const DIR = path.resolve(__dirname, "../src/assets/products");
const MAX_SIDE = 800;
const PAD = 0.03;
const ALPHA_THRESHOLD = 10;
const WEBP = { quality: 82, alphaQuality: 90 } as const;
const FORCE = process.argv.includes("--force");
const SOURCES = { A: "air-runner--black-ember", B: "flex-motion--ember" } as const;
const SOURCE_KEYS = new Set<string>(Object.values(SOURCES));

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
  // Near-black pixels have noisy hue and saturation: anything very dark is upper,
  // and dark reddish pixels are shadows on the black upper, not ember trim.
  A: (h: number, s: number, l: number): Region =>
    l < 0.2 ? "upper" : isEmber(h, s) ? (l < 0.26 ? "upper" : "trim") : s < 0.3 && l < 0.33 ? "upper" : null,
  B: (h: number, s: number, l: number): Region => (isEmber(h, s) ? "upper" : s < 0.3 && l < 0.6 ? "trim" : null),
};

/** Mean lightness of each region in the source, so shading can be re-centred. */
const SOURCE_MEAN = { A: { upper: 0.1, trim: 0.5 }, B: { upper: 0.52, trim: 0.33 } };

function shade(target: HSL, l: number, mean: number, contrast: number): [number, number, number] {
  const light = target[2] > 0.7;
  // Light targets: soften contrast and floor the lightness so dark mesh holes
  // read as soft fabric shadow instead of mottled grey or brown noise.
  const k = light ? Math.min(contrast, 0.6) : contrast;
  // Keep the source's shading: offset from the region mean, scaled.
  let tl = clamp01(target[2] + (l - mean) * k);
  if (light) tl = Math.max(tl, 0.55 + 0.4 * (target[2] - 0.7));
  // Near-neutral targets keep a whisper of cool tint so whites don't look dead.
  const neutral = target[1] < 0.08;
  let ts = neutral ? 0.04 : target[1];
  // Shadowed areas of light targets lose saturation so no brown cast appears.
  if (light) ts *= clamp01((tl - 0.5) / 0.4);
  return hslToRgb(neutral ? 215 : target[0], ts, tl);
}

/** Trim to the alpha bounding box, pad ~3% each side, cap the longest side. */
async function trimAndCap(input: sharp.Sharp | Buffer | string): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error("image is fully transparent");
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const scale = Math.min(1, MAX_SIDE / (Math.max(w, h) * (1 + 2 * PAD)));
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));
  const pad = Math.round(Math.max(tw, th) * PAD);
  const out = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: x0, top: y0, width: w, height: h })
    .resize(tw, th, { fit: "fill", kernel: "lanczos3" })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp(WEBP)
    .toBuffer();
  return { data: out, width: tw + 2 * pad, height: th + 2 * pad };
}

/** Trim the two source renders in place (only when they are not already trimmed) and return them as buffers. */
async function prepareBase(key: string): Promise<Buffer> {
  const file = path.join(DIR, `${key}.webp`);
  const trimmed = await trimAndCap(file);
  const current = await sharp(file).metadata();
  const same = Math.abs((current.width ?? 0) - trimmed.width) <= 1 && Math.abs((current.height ?? 0) - trimmed.height) <= 1;
  if (!same) await writeFile(file, trimmed.data);
  return same ? readFile(file) : trimmed.data;
}

async function recolour(baseBuf: Buffer, base: "A" | "B", upper: HSL, trim: HSL, flip: boolean, out: string) {
  const { data, info } = await sharp(baseBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

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
  const final = await trimAndCap(await img.png().toBuffer());
  await writeFile(out, final.data);
}

const BASE_FOR: Record<Category, "A" | "B"> = { running: "A", training: "A", lifestyle: "B", basketball: "B" };

async function main() {
  const bases = { A: await prepareBase(SOURCES.A), B: await prepareBase(SOURCES.B) };
  let made = 0;
  for (const [pi, product] of products.entries()) {
    for (const [ci, c] of product.colorways.entries()) {
      const key = `${product.id}--${c.id}`;
      if (SOURCE_KEYS.has(key)) continue;
      const out = path.join(DIR, `${key}.webp`);
      if (existsSync(out) && !FORCE) continue;
      const base = BASE_FOR[product.category];
      await recolour(bases[base], base, hexToHsl(c.swatch[0]), hexToHsl(c.swatch[1]), (pi + ci) % 2 === 1, out);
      made++;
    }
  }
  console.log(`${made} image(s) generated in src/assets/products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
