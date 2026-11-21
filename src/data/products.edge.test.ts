import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_FROM,
  SHIPPING_FEE,
  filterProducts,
  formatPrice,
  getColorway,
  getProduct,
  isOnSale,
  matchesQuery,
  products,
  relatedProducts,
  shippingFor,
  sortProducts,
  type Product,
} from "./products";

const make = (over: Partial<Product>): Product => ({ ...products[0], ...over });

describe("catalogue data sanity", () => {
  it("gives every product a positive price, at least one colourway and at least one size", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThan(0);
      expect(p.colorways.length).toBeGreaterThan(0);
      expect(p.sizes.length).toBeGreaterThan(0);
    }
  });

  it("uses valid ISO release dates", () => {
    for (const p of products) expect(Number.isNaN(Date.parse(p.released))).toBe(false);
  });

  // DEFECT (data): tempo-elite and rim-runner both have rank 2, so their relative
  // order in "Featured" depends on array order rather than an explicit rank.
  it("gives every product a unique featured rank", () => {
    expect(new Set(products.map((p) => p.rank)).size).toBe(products.length);
  });

  it("gives every colourway an image and a pair of hex swatches", () => {
    for (const p of products)
      for (const c of p.colorways) {
        expect(c.image).toBeTruthy();
        expect(c.swatch).toHaveLength(2);
        for (const s of c.swatch) expect(s).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
  });

  it("never sells out every size of a colourway", () => {
    for (const p of products) for (const c of p.colorways) expect((c.soldOut ?? []).length).toBeLessThan(p.sizes.length);
  });

  it("gives kids products kids sizes only and adult products adult sizes only", () => {
    for (const p of products) {
      const kidsSizes = p.sizes.every((s) => s.endsWith("Y"));
      const adultSizes = p.sizes.every((s) => !s.endsWith("Y"));
      expect(p.gender === "kids" ? kidsSizes : adultSizes).toBe(true);
    }
  });
});

describe("getProduct / getColorway", () => {
  it("returns undefined for a missing or unknown id", () => {
    expect(getProduct(undefined)).toBeUndefined();
    expect(getProduct("")).toBeUndefined();
    expect(getProduct("nope")).toBeUndefined();
  });

  it("falls back to the first colourway for null, undefined and empty ids", () => {
    const p = getProduct("air-runner")!;
    expect(getColorway(p, null).id).toBe(p.colorways[0].id);
    expect(getColorway(p, undefined).id).toBe(p.colorways[0].id);
    expect(getColorway(p, "").id).toBe(p.colorways[0].id);
  });

  it("returns the requested colourway when it exists", () => {
    const p = getProduct("air-runner")!;
    expect(getColorway(p, "cloud-grey").id).toBe("cloud-grey");
  });
});

describe("isOnSale", () => {
  it("is false without a compare-at price", () => {
    expect(isOnSale(make({ price: 100, compareAt: undefined }))).toBe(false);
  });

  it("is false when compare-at equals or is below the price", () => {
    expect(isOnSale(make({ price: 100, compareAt: 100 }))).toBe(false);
    expect(isOnSale(make({ price: 100, compareAt: 80 }))).toBe(false);
  });

  it("is true when compare-at is above the price", () => {
    expect(isOnSale(make({ price: 100, compareAt: 100.01 }))).toBe(true);
  });
});

describe("formatPrice", () => {
  it("formats zero without cents", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  it("shows two decimals for any fractional amount", () => {
    expect(formatPrice(0.5)).toBe("$0.50");
    expect(formatPrice(99.99)).toBe("$99.99");
  });

  it("adds thousands separators", () => {
    expect(formatPrice(1200)).toBe("$1,200");
  });
});

describe("matchesQuery", () => {
  const velocity = getProduct("velocity")!;

  it("matches everything for an empty or whitespace-only query", () => {
    expect(matchesQuery(velocity, "")).toBe(true);
    expect(matchesQuery(velocity, "   ")).toBe(true);
  });

  it("requires every term to match, in any order", () => {
    expect(matchesQuery(velocity, "running velocity")).toBe(true);
    expect(matchesQuery(velocity, "velocity basketball")).toBe(false);
  });

  it("matches on category, gender and colourway names", () => {
    expect(matchesQuery(velocity, "running")).toBe(true);
    expect(matchesQuery(velocity, "crimson")).toBe(true);
    expect(matchesQuery(velocity, "volt")).toBe(true);
  });

  it("ignores accents in the query and extra whitespace between terms", () => {
    expect(matchesQuery(velocity, "véloçity")).toBe(true);
    expect(matchesQuery(velocity, "  velocity    running ")).toBe(true);
  });

  it("treats regex metacharacters as plain text", () => {
    expect(matchesQuery(velocity, "(velocity")).toBe(false);
    expect(matchesQuery(velocity, ".*")).toBe(false);
  });

  it("does not match on fields outside name, tagline, category, gender and colourways", () => {
    expect(matchesQuery(velocity, "rocker")).toBe(false); // only in features
  });

  // DEFECT: the haystack is searched by substring, so "men" is found inside "women".
  it("searching 'men' does not return women-only styles", () => {
    const womenOnly = products.filter((p) => p.gender === "women");
    expect(womenOnly.length).toBeGreaterThan(0);
    const hits = filterProducts(products, { query: "men" });
    expect(hits.some((p) => p.gender === "women")).toBe(false);
  });
});

describe("filterProducts", () => {
  it("returns every product, in order, for an empty filter object", () => {
    expect(filterProducts(products, {})).toEqual(products);
  });

  it("ignores null category, empty arrays, null maxPrice and blank query", () => {
    expect(filterProducts(products, { category: null, genders: [], sizes: [], maxPrice: null, sale: false, query: "" })).toEqual(
      products,
    );
  });

  it("does not mutate the input list", () => {
    const copy = [...products];
    filterProducts(products, { category: "running" });
    expect(products).toEqual(copy);
  });

  it("returns an empty array for an empty list or an impossible combination", () => {
    expect(filterProducts([], { category: "running" })).toEqual([]);
    expect(filterProducts(products, { category: "basketball", genders: ["kids"], sale: true })).toEqual([]);
  });

  it("treats maxPrice as inclusive", () => {
    const p = make({ price: 100 });
    expect(filterProducts([p], { maxPrice: 100 })).toHaveLength(1);
    expect(filterProducts([p], { maxPrice: 99.99 })).toHaveLength(0);
  });

  it("treats maxPrice 0 as a real limit, not as 'no limit'", () => {
    expect(filterProducts(products, { maxPrice: 0 })).toEqual([]);
  });

  it("selecting only Unisex returns unisex styles only", () => {
    const list = filterProducts(products, { genders: ["unisex"] });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.gender === "unisex")).toBe(true);
  });

  it("includes unisex styles for Women too", () => {
    const list = filterProducts(products, { genders: ["women"] });
    expect(list.some((p) => p.gender === "unisex")).toBe(true);
    expect(list.some((p) => p.gender === "men")).toBe(false);
  });

  it("selecting Kids together with Men shows kids and unisex but not women", () => {
    const list = filterProducts(products, { genders: ["kids", "men"] });
    expect(list.some((p) => p.gender === "kids")).toBe(true);
    expect(list.some((p) => p.gender === "unisex")).toBe(true);
    expect(list.some((p) => p.gender === "women")).toBe(false);
  });

  it("matches a product when any one of several selected sizes is offered", () => {
    const list = filterProducts(products, { sizes: ["4Y", "9"] });
    expect(list.some((p) => p.gender === "kids")).toBe(true);
    expect(list.some((p) => p.gender !== "kids")).toBe(true);
  });

  it("returns nothing for a size no product offers", () => {
    expect(filterProducts(products, { sizes: ["99"] })).toEqual([]);
  });

  it("combines category, price and sale with AND semantics", () => {
    const list = filterProducts(products, { category: "basketball", sale: true, maxPrice: 100 });
    expect(list.map((p) => p.id)).toEqual(["fastbreak-low"]);
  });

  it("combines query with the other filters", () => {
    const list = filterProducts(products, { category: "running", query: "crimson" });
    expect(list.map((p) => p.id)).toEqual(["velocity"]);
  });
});

describe("sortProducts", () => {
  it("does not mutate the input", () => {
    const copy = [...products];
    sortProducts(products, "price-desc");
    expect(products).toEqual(copy);
  });

  it("sorts price descending", () => {
    const prices = sortProducts(products, "price-desc").map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it("sorts newest first so the latest release leads", () => {
    const list = sortProducts(products, "newest");
    const dates = list.map((p) => p.released);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("sorts featured by ascending rank", () => {
    const ranks = sortProducts(products, "featured").map((p) => p.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(sortProducts(products, "featured")[0].id).toBe("air-runner");
  });

  it("falls back to featured order for an unknown key", () => {
    expect(sortProducts(products, "bogus" as never).map((p) => p.id)).toEqual(sortProducts(products, "featured").map((p) => p.id));
  });

  it("handles an empty and a single-item list", () => {
    expect(sortProducts([], "newest")).toEqual([]);
    expect(sortProducts([products[0]], "price-asc")).toEqual([products[0]]);
  });

  it("keeps equal prices in their original relative order", () => {
    const a = make({ id: "a", price: 50 });
    const b = make({ id: "b", price: 50 });
    const c = make({ id: "c", price: 10 });
    expect(sortProducts([a, b, c], "price-asc").map((p) => p.id)).toEqual(["c", "a", "b"]);
  });
});

describe("relatedProducts", () => {
  it("defaults to four results", () => {
    expect(relatedProducts(products[0])).toHaveLength(4);
  });

  it("honours a custom count, including zero", () => {
    expect(relatedProducts(products[0], 2)).toHaveLength(2);
    expect(relatedProducts(products[0], 0)).toEqual([]);
  });

  it("returns at most every other product when count exceeds the catalogue", () => {
    expect(relatedProducts(products[0], 999)).toHaveLength(products.length - 1);
  });

  it("lists same-category products before others, each group in featured order", () => {
    const p = getProduct("rim-runner")!;
    const rel = relatedProducts(p, 999);
    const firstOther = rel.findIndex((r) => r.category !== p.category);
    const sameCount = products.filter((x) => x.category === p.category && x.id !== p.id).length;
    expect(firstOther).toBe(sameCount);
    const same = rel.slice(0, sameCount).map((r) => r.rank);
    expect(same).toEqual([...same].sort((a, b) => a - b));
  });
});

describe("shippingFor", () => {
  it("is free for an empty bag", () => {
    expect(shippingFor(0)).toBe(0);
  });

  it("charges the flat fee just under the threshold", () => {
    expect(shippingFor(FREE_SHIPPING_FROM - 0.01)).toBe(SHIPPING_FEE);
    expect(shippingFor(1)).toBe(SHIPPING_FEE);
  });

  it("is free exactly at and above the threshold", () => {
    expect(shippingFor(FREE_SHIPPING_FROM)).toBe(0);
    expect(shippingFor(FREE_SHIPPING_FROM + 1)).toBe(0);
    expect(shippingFor(10_000)).toBe(0);
  });

  it("uses the documented demo rules ($100 threshold, $8 fee)", () => {
    expect(FREE_SHIPPING_FROM).toBe(100);
    expect(SHIPPING_FEE).toBe(8);
  });
});
