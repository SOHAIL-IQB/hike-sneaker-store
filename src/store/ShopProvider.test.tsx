import { act, render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installMemoryStorage, type MemoryStorage } from "@/test/memoryStorage";
import { ShopProvider, useShop, useShopActions } from "./ShopProvider";

const KEY = "hike:shop:v2";
const wrapper = ({ children }: { children: ReactNode }) => <ShopProvider>{children}</ShopProvider>;
const mount = () => renderHook(() => useShop(), { wrapper });
let store: MemoryStorage;
const saved = () => JSON.parse(store.getItem(KEY) ?? "null");

/** Simulates another tab writing to localStorage: the value lands in storage, then the event fires. */
const otherTabWrites = (value: unknown) => {
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  store.setItem(KEY, raw);
  act(() => void window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: raw })));
};
const fire = (target: EventTarget, type: string) => act(() => void target.dispatchEvent(new Event(type)));

beforeEach(() => {
  store = installMemoryStorage();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ShopProvider: initial state and hydration", () => {
  it("starts empty when nothing is saved", () => {
    const { result } = mount();
    expect(result.current.bag).toEqual([]);
    expect(result.current.bagCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.favorites).toEqual([]);
    expect(result.current.recent).toEqual([]);
  });

  it("restores a saved bag, favourites and recently viewed", () => {
    store.setItem(
      KEY,
      JSON.stringify({
        bag: [{ productId: "velocity", colorwayId: "crimson", size: "9", quantity: 2 }],
        favorites: ["air-runner"],
        recent: ["velocity"],
      }),
    );
    const { result } = mount();
    expect(result.current.bag).toHaveLength(1);
    expect(result.current.bag[0]).toMatchObject({ key: "velocity:crimson:9", quantity: 2 });
    expect(result.current.favorites).toEqual(["air-runner"]);
    expect(result.current.recent).toEqual(["velocity"]);
  });

  it("drops saved products that no longer exist in the catalogue", () => {
    store.setItem(
      KEY,
      JSON.stringify({ bag: [{ productId: "discontinued", colorwayId: "x", size: "9", quantity: 1 }], favorites: ["discontinued"], recent: [] }),
    );
    const { result } = mount();
    expect(result.current.bag).toEqual([]);
    expect(result.current.favorites).toEqual([]);
  });

  it("drops saved lines for unknown colourways, sizes the product does not come in, and sold-out pairs", () => {
    store.setItem(
      KEY,
      JSON.stringify({
        bag: [
          { productId: "velocity", colorwayId: "crimson", size: "9", quantity: 1 }, // valid
          { productId: "velocity", colorwayId: "retired", size: "9", quantity: 1 }, // unknown colourway
          { productId: "velocity", colorwayId: "crimson", size: "99", quantity: 1 }, // size not offered
          { productId: "velocity", colorwayId: "crimson", size: "8", quantity: 1 }, // sold out in crimson
        ],
        favorites: [],
        recent: [],
      }),
    );
    const { result } = mount();
    expect(result.current.bag.map((l) => l.key)).toEqual(["velocity:crimson:9"]);
  });

  it.each([
    ["truncated JSON", '{"bag": [{"productId"'],
    ["plain text", "hello"],
    ["JSON null", "null"],
    ["a JSON number", "42"],
    ["a JSON string", '"bag"'],
    ["a JSON array", "[]"],
    ["an empty object", "{}"],
  ])("starts fresh instead of crashing when the saved value is %s", (_name, raw) => {
    store.setItem(KEY, raw);
    const { result } = mount();
    expect(result.current.bag).toEqual([]);
    expect(result.current.favorites).toEqual([]);
  });

  it("replaces corrupted saved JSON with valid state on the first write", () => {
    store.setItem(KEY, "{not json");
    mount();
    expect(saved()).toEqual({ bag: [], favorites: [], recent: [] });
  });

  it("starts fresh when reading storage throws", () => {
    vi.spyOn(store, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const { result } = mount();
    expect(result.current.bag).toEqual([]);
  });

  it("keeps working in memory when writing storage throws", () => {
    vi.spyOn(store, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9"));
    expect(result.current.bagCount).toBe(1);
  });
});

describe("ShopProvider: persistence", () => {
  it("writes the initial state under the v2 key on mount", () => {
    mount();
    expect(store.getItem(KEY)).not.toBeNull();
  });

  it("saves every change to the bag", () => {
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9", 2));
    expect(saved().bag).toEqual([{ key: "velocity:crimson:9", productId: "velocity", colorwayId: "crimson", size: "9", quantity: 2 }]);
    act(() => result.current.setQuantity("velocity:crimson:9", 5));
    expect(saved().bag[0].quantity).toBe(5);
    act(() => result.current.clearBag());
    expect(saved().bag).toEqual([]);
  });

  it("saves favourites and recently viewed", () => {
    const { result } = mount();
    act(() => {
      result.current.toggleFavorite("velocity");
      result.current.recordView("air-runner");
    });
    expect(saved().favorites).toEqual(["velocity"]);
    expect(saved().recent).toEqual(["air-runner"]);
  });

  it("restores what a previous visit saved", () => {
    const first = mount();
    act(() => first.result.current.addToBag("air-runner", "black-ember", "10", 3));
    first.unmount();
    const second = mount();
    expect(second.result.current.bagCount).toBe(3);
    expect(second.result.current.bag[0].size).toBe("10");
  });

  it("does not touch other localStorage keys", () => {
    store.setItem("unrelated", "keep me");
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9"));
    expect(store.getItem("unrelated")).toBe("keep me");
  });
});

describe("ShopProvider: cross-tab sync", () => {
  const bagOf = (...lines: object[]) => ({ bag: lines, favorites: [], recent: [] });
  const velocityVolt = { productId: "velocity", colorwayId: "volt", size: "10", quantity: 4 };

  it("adopts a bag written by another tab", () => {
    const { result } = mount();
    otherTabWrites({ ...bagOf(velocityVolt), favorites: ["air-runner"] });
    expect(result.current.bagCount).toBe(4);
    expect(result.current.bag[0].key).toBe("velocity:volt:10");
    expect(result.current.favorites).toEqual(["air-runner"]);
  });

  it("revives the incoming state, dropping unknown products", () => {
    const { result } = mount();
    otherTabWrites(bagOf({ productId: "ghost", colorwayId: "x", size: "9", quantity: 1 }));
    expect(result.current.bag).toEqual([]);
  });

  it("ignores events for other keys", () => {
    const { result } = mount();
    store.setItem("something-else", JSON.stringify(bagOf(velocityVolt)));
    act(() => void window.dispatchEvent(new StorageEvent("storage", { key: "something-else", newValue: "x" })));
    expect(result.current.bagCount).toBe(0);
  });

  it("empties the bag when another tab clears all storage", () => {
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9"));
    store.clear();
    act(() => void window.dispatchEvent(new StorageEvent("storage", { key: null })));
    expect(result.current.bagCount).toBe(0);
  });

  it("empties the bag when another tab removes the key", () => {
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9"));
    store.removeItem(KEY);
    act(() => void window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: null })));
    expect(result.current.bagCount).toBe(0);
  });

  it("ignores a malformed value written by another tab instead of wiping the bag", () => {
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9"));
    otherTabWrites("{broken");
    expect(result.current.bagCount).toBe(1);
  });

  it("does not echo a synced state back as a different value", () => {
    const { result } = mount();
    const incoming = { bag: [{ key: "velocity:volt:10", ...velocityVolt }], favorites: [], recent: [] };
    otherTabWrites(incoming);
    expect(result.current.bagCount).toBe(4);
    expect(saved()).toEqual(incoming);
  });

  it("catches up when a sleeping tab becomes visible again", () => {
    const { result } = mount();
    store.setItem(KEY, JSON.stringify(bagOf(velocityVolt))); // written while this tab was asleep, no event delivered
    expect(result.current.bagCount).toBe(0);
    fire(document, "visibilitychange");
    expect(result.current.bagCount).toBe(4);
  });

  it("catches up on pageshow (back/forward cache restore)", () => {
    const { result } = mount();
    store.setItem(KEY, JSON.stringify(bagOf(velocityVolt)));
    fire(window, "pageshow");
    expect(result.current.bagCount).toBe(4);
  });

  it("keeps in-memory state on visibility change when storage is unreadable", () => {
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9"));
    store.setItem(KEY, "{broken");
    fire(document, "visibilitychange");
    expect(result.current.bagCount).toBe(1);
  });

  it("does not react to visibility changes while the tab is hidden", () => {
    const { result } = mount();
    store.setItem(KEY, JSON.stringify(bagOf(velocityVolt)));
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    fire(document, "visibilitychange");
    spy.mockRestore();
    expect(result.current.bagCount).toBe(0);
  });

  it("removes its storage, pageshow and visibility listeners when unmounted", () => {
    const removeWindow = vi.spyOn(window, "removeEventListener");
    const removeDoc = vi.spyOn(document, "removeEventListener");
    mount().unmount();
    expect(removeWindow).toHaveBeenCalledWith("storage", expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith("pageshow", expect.any(Function));
    expect(removeDoc).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });
});

describe("ShopProvider: bagCount and subtotal", () => {
  it("sums quantities across lines for bagCount", () => {
    const { result } = mount();
    act(() => {
      result.current.addToBag("velocity", "crimson", "9", 2);
      result.current.addToBag("air-runner", "black-ember", "9", 3);
    });
    expect(result.current.bag).toHaveLength(2);
    expect(result.current.bagCount).toBe(5);
  });

  it("computes line totals and subtotal from price x quantity", () => {
    const { result } = mount();
    act(() => {
      result.current.addToBag("velocity", "crimson", "9", 2); // 140 x 2
      result.current.addToBag("fastbreak-low", "mint", "7", 3); // 92 x 3
    });
    expect(result.current.bag.map((l) => l.lineTotal)).toEqual([280, 276]);
    expect(result.current.subtotal).toBe(556);
  });

  it("updates subtotal when quantities change or lines are removed", () => {
    const { result } = mount();
    act(() => {
      result.current.addToBag("velocity", "crimson", "9", 1);
      result.current.addToBag("fastbreak-low", "mint", "7", 1);
    });
    expect(result.current.subtotal).toBe(232);
    act(() => result.current.setQuantity("velocity:crimson:9", 3));
    expect(result.current.subtotal).toBe(420 + 92);
    act(() => result.current.removeLine("fastbreak-low:mint:7"));
    expect(result.current.subtotal).toBe(420);
    expect(result.current.bagCount).toBe(3);
  });

  it("merges repeated adds of the same pair and caps at ten", () => {
    const { result } = mount();
    act(() => {
      result.current.addToBag("velocity", "crimson", "9", 8);
      result.current.addToBag("velocity", "crimson", "9", 8);
    });
    expect(result.current.bag).toHaveLength(1);
    expect(result.current.bagCount).toBe(10);
    expect(result.current.subtotal).toBe(1400);
  });

  it("excludes lines whose product is not in the catalogue from count and subtotal", () => {
    const { result } = mount();
    act(() => {
      result.current.addToBag("ghost-shoe", "x", "9", 5);
      result.current.addToBag("velocity", "crimson", "9", 1);
    });
    expect(result.current.bagCount).toBe(1);
    expect(result.current.subtotal).toBe(140);
  });

  it("falls back to the first colourway for a line with an unknown colourway id", () => {
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "retired-colour", "9"));
    expect(result.current.bag[0].colorway.id).toBe("crimson");
  });

  it("moves a line to a new size and keeps subtotal unchanged", () => {
    const { result } = mount();
    act(() => result.current.addToBag("velocity", "crimson", "9", 2));
    act(() => result.current.changeSize("velocity:crimson:9", "10"));
    expect(result.current.bag[0].size).toBe("10");
    expect(result.current.subtotal).toBe(280);
  });
});

describe("ShopProvider: addToBag result", () => {
  it("returns true when the pair was added", () => {
    const { result } = mount();
    let added = false;
    act(() => {
      added = result.current.addToBag("velocity", "crimson", "9");
    });
    expect(added).toBe(true);
  });

  it("returns false and changes nothing when the line is already at the per-size limit", () => {
    const { result } = mount();
    act(() => void result.current.addToBag("velocity", "crimson", "9", 10));
    let added = true;
    act(() => {
      added = result.current.addToBag("velocity", "crimson", "9");
    });
    expect(added).toBe(false);
    expect(result.current.bagCount).toBe(10);
  });

  it("still returns true when an add only partly fits and clamps to the limit", () => {
    const { result } = mount();
    act(() => void result.current.addToBag("velocity", "crimson", "9", 9));
    let added = false;
    act(() => {
      added = result.current.addToBag("velocity", "crimson", "9", 5);
    });
    expect(added).toBe(true);
    expect(result.current.bagCount).toBe(10);
  });

  it("allows another size of the same shoe when one size is at the limit", () => {
    const { result } = mount();
    act(() => void result.current.addToBag("velocity", "crimson", "9", 10));
    let added = false;
    act(() => {
      added = result.current.addToBag("velocity", "crimson", "10");
    });
    expect(added).toBe(true);
    expect(result.current.bagCount).toBe(11);
  });
});

describe("ShopProvider: favourites and history", () => {
  it("reports favourites through isFavorite and toggles them off again", () => {
    const { result } = mount();
    expect(result.current.isFavorite("velocity")).toBe(false);
    act(() => result.current.toggleFavorite("velocity"));
    expect(result.current.isFavorite("velocity")).toBe(true);
    act(() => result.current.toggleFavorite("velocity"));
    expect(result.current.isFavorite("velocity")).toBe(false);
  });

  it("records views newest first without duplicates", () => {
    const { result } = mount();
    act(() => {
      result.current.recordView("velocity");
      result.current.recordView("air-runner");
      result.current.recordView("velocity");
    });
    expect(result.current.recent).toEqual(["velocity", "air-runner"]);
  });

  it("keeps favourites when the bag is cleared", () => {
    const { result } = mount();
    act(() => {
      result.current.toggleFavorite("velocity");
      result.current.addToBag("velocity", "crimson", "9");
      result.current.clearBag();
    });
    expect(result.current.bag).toEqual([]);
    expect(result.current.favorites).toEqual(["velocity"]);
  });
});

describe("useShopActions", () => {
  it("exposes stable action functions that survive state changes", () => {
    const { result } = renderHook(() => ({ actions: useShopActions(), shop: useShop() }), { wrapper });
    const first = result.current.actions;
    act(() => void first.addToBag("velocity", "crimson", "9"));
    expect(result.current.actions).toBe(first);
    expect(result.current.shop.bagCount).toBe(1);
  });

  it("throws a helpful error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useShopActions())).toThrow(/ShopProvider/);
  });
});

describe("useShop", () => {
  it("throws a helpful error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ShopProvider/);
  });
});

function Probe() {
  useShop();
  return null;
}
