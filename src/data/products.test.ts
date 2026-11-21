import { describe, expect, it } from "vitest";
import { filterProducts, formatPrice, getColorway, getProduct, isOnSale, matchesQuery, products, relatedProducts, sortProducts } from "./products";

describe("catalogue integrity", () => {
  it("has unique product ids and unique colourway ids per product", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    for (const p of products) expect(new Set(p.colorways.map((c) => c.id)).size).toBe(p.colorways.length);
  });

  it("keeps the four original ids that GA4 reports key on", () => {
    for (const id of ["air-runner", "velocity", "street-pro", "flex-motion"]) expect(getProduct(id)).toBeDefined();
  });

  it("only lists sold-out sizes the product actually comes in", () => {
    for (const p of products) for (const c of p.colorways) for (const s of c.soldOut ?? []) expect(p.sizes).toContain(s);
  });

  it("marks sale items with a higher compare-at price", () => {
    for (const p of products) expect(isOnSale(p)).toBe(p.badges.includes("sale"));
  });
});

describe("queries", () => {
  it("filters by category", () => {
    const list = filterProducts(products, { category: "basketball" });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.category === "basketball")).toBe(true);
  });

  it("includes unisex styles for men and women but not kids", () => {
    const men = filterProducts(products, { genders: ["men"] });
    expect(men.some((p) => p.gender === "unisex")).toBe(true);
    expect(men.some((p) => p.gender === "women")).toBe(false);
    const kids = filterProducts(products, { genders: ["kids"] });
    expect(kids.every((p) => p.gender === "kids")).toBe(true);
  });

  it("filters by size, price and sale", () => {
    expect(filterProducts(products, { sizes: ["4Y"] }).every((p) => p.gender === "kids")).toBe(true);
    expect(filterProducts(products, { maxPrice: 100 }).every((p) => p.price <= 100)).toBe(true);
    expect(filterProducts(products, { sale: true }).every(isOnSale)).toBe(true);
  });

  it("searches name, tagline and colourway, accent- and case-insensitive", () => {
    const air = getProduct("air-runner")!;
    expect(matchesQuery(air, "AIR runner")).toBe(true);
    expect(matchesQuery(air, "ember")).toBe(true);
    expect(matchesQuery(air, "basketball")).toBe(false);
  });

  it("sorts by price and recency", () => {
    const asc = sortProducts(products, "price-asc").map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const newest = sortProducts(products, "newest");
    expect(newest[0].released >= newest[newest.length - 1].released).toBe(true);
  });

  it("returns related products from the same category first, never itself", () => {
    const p = getProduct("velocity")!;
    const rel = relatedProducts(p, 4);
    expect(rel).toHaveLength(4);
    expect(rel.some((r) => r.id === p.id)).toBe(false);
    expect(rel[0].category).toBe(p.category);
  });

  it("falls back to the first colourway for unknown ids", () => {
    const p = getProduct("air-runner")!;
    expect(getColorway(p, "nope").id).toBe(p.colorways[0].id);
  });

  it("formats prices without needless cents", () => {
    expect(formatPrice(120)).toBe("$120");
    expect(formatPrice(87.5)).toBe("$87.50");
  });
});
