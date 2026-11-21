import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gaItems, trackAddToCart, trackBeginCheckout, trackEvent } from "./analytics";

const line = (id: string, name: string, price: number, quantity: number) => ({ product: { id, name, price }, quantity });

let info: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  info = vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  delete window.gtag;
  vi.restoreAllMocks();
});

describe("trackEvent", () => {
  it("calls window.gtag with 'event', the exact name and the exact params", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    trackEvent("add_to_cart", { item_id: "velocity", item_name: "Hike Velocity", price: 140, size: "9" });
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "add_to_cart", { item_id: "velocity", item_name: "Hike Velocity", price: 140, size: "9" });
  });

  it("passes undefined params through when none are given", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    trackEvent("page_ping");
    expect(gtag).toHaveBeenCalledWith("event", "page_ping", undefined);
  });

  it("does nothing and does not throw when gtag is not loaded", () => {
    expect(window.gtag).toBeUndefined();
    expect(() => trackEvent("view_product", { item_id: "x" })).not.toThrow();
  });

  it("ignores a gtag that is not a function", () => {
    (window as unknown as { gtag: unknown }).gtag = "blocked-by-extension";
    expect(() => trackEvent("view_product")).not.toThrow();
  });

  it("logs to the console in development builds", () => {
    trackEvent("view_product", { item_id: "x" });
    expect(info).toHaveBeenCalledWith("[GA4] view_product", { item_id: "x" });
  });
});

describe("gaItems", () => {
  it("maps lines to the exact GA4 item shape the first version sent", () => {
    expect(gaItems([line("velocity", "Hike Velocity", 140, 2)])).toEqual([
      { item_id: "velocity", item_name: "Hike Velocity", price: 140, quantity: 2 },
    ]);
  });

  it("returns an empty array for an empty bag", () => {
    expect(gaItems([])).toEqual([]);
  });

  it("keeps one entry per line, in order, with no extra keys", () => {
    const items = gaItems([line("a", "A", 10, 1), line("b", "B", 20, 3)]);
    expect(items.map((i) => i.item_id)).toEqual(["a", "b"]);
    for (const i of items) expect(Object.keys(i).sort()).toEqual(["item_id", "item_name", "price", "quantity"]);
  });
});

describe("trackBeginCheckout", () => {
  it("sends begin_checkout with the value and mapped items", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    trackBeginCheckout([line("a", "A", 60, 2)], 120);
    expect(gtag).toHaveBeenCalledWith("event", "begin_checkout", {
      value: 120,
      currency: "USD",
      items: [{ item_id: "a", item_name: "A", price: 60, quantity: 2 }],
    });
  });
});

describe("trackAddToCart", () => {
  it("sends add_to_cart with the v1 parameters plus currency", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    trackAddToCart({ id: "velocity", name: "Hike Velocity", price: 140 }, "9");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "add_to_cart", {
      item_id: "velocity",
      item_name: "Hike Velocity",
      price: 140,
      size: "9",
      currency: "USD",
    });
  });

  it("does not throw when gtag is not loaded", () => {
    expect(() => trackAddToCart({ id: "a", name: "A", price: 1 }, "9")).not.toThrow();
  });
});
