import { describe, expect, it } from "vitest";
import { initialState, MAX_LINES, MAX_QTY, MAX_RECENT, reviveState, shopReducer, type ShopState } from "./reducer";

const line = (over: Partial<ShopState["bag"][number]> = {}) => ({
  key: "air-runner:black-ember:9",
  productId: "air-runner",
  colorwayId: "black-ember",
  size: "9",
  quantity: 1,
  ...over,
});
const withBag = (...lines: ShopState["bag"]): ShopState => ({ ...initialState, bag: lines });
const known = new Set(["air-runner", "velocity", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"]);

describe("add: quantity edge cases", () => {
  const add = (s: ShopState, quantity?: number) =>
    shopReducer(s, { type: "add", productId: "air-runner", colorwayId: "black-ember", size: "9", quantity });

  it("is a no-op for zero and negative quantities", () => {
    expect(add(initialState, 0)).toBe(initialState);
    expect(add(initialState, -3)).toBe(initialState);
  });

  it("rounds fractional quantities down", () => {
    expect(add(initialState, 2.9).bag[0].quantity).toBe(2);
  });

  it("is a no-op for a fraction below one", () => {
    expect(add(initialState, 0.4)).toBe(initialState);
  });

  it("caps the merged quantity of an existing line at the maximum", () => {
    const s = add(withBag(line({ quantity: 9 })), 5);
    expect(s.bag[0].quantity).toBe(MAX_QTY);
  });

  it("does not mutate the previous state", () => {
    const before = withBag(line());
    const snapshot = JSON.parse(JSON.stringify(before));
    add(before, 2);
    expect(before).toEqual(snapshot);
  });

  // DEFECT: clampQty(NaN) is NaN, which is neither 0 nor rejected, so a NaN line is created.
  it("ignores a NaN quantity instead of adding a corrupt line", () => {
    const s = add(initialState, Number.NaN);
    expect(s.bag.every((l) => Number.isFinite(l.quantity) && l.quantity > 0)).toBe(true);
  });
});

describe("setQuantity edge cases", () => {
  it("caps at the maximum", () => {
    const s = shopReducer(withBag(line()), { type: "setQuantity", key: line().key, quantity: 99 });
    expect(s.bag[0].quantity).toBe(MAX_QTY);
  });

  it("removes the line for a negative quantity", () => {
    expect(shopReducer(withBag(line()), { type: "setQuantity", key: line().key, quantity: -1 }).bag).toEqual([]);
  });

  it("leaves other lines untouched and ignores an unknown key", () => {
    const other = line({ key: "velocity:crimson:9", productId: "velocity", colorwayId: "crimson" });
    const s = shopReducer(withBag(line(), other), { type: "setQuantity", key: "missing", quantity: 5 });
    expect(s.bag).toEqual([line(), other]);
  });

  // DEFECT: clampQty(NaN) is NaN, so setQuantity(key, NaN) stores NaN on the line.
  it("ignores a NaN quantity instead of storing it", () => {
    const s = shopReducer(withBag(line()), { type: "setQuantity", key: line().key, quantity: Number.NaN });
    expect(Number.isFinite(s.bag[0]?.quantity ?? 1)).toBe(true);
  });
});

describe("changeSize edge cases", () => {
  it("is a no-op for an unknown key or an unchanged size", () => {
    const s = withBag(line());
    expect(shopReducer(s, { type: "changeSize", key: "missing", size: "10" })).toBe(s);
    expect(shopReducer(s, { type: "changeSize", key: line().key, size: "9" })).toBe(s);
  });

  it("caps the merged quantity when combining into an existing size", () => {
    const s = shopReducer(withBag(line({ quantity: 8 }), line({ key: "air-runner:black-ember:10", size: "10", quantity: 8 })), {
      type: "changeSize",
      key: line().key,
      size: "10",
    });
    expect(s.bag).toHaveLength(1);
    expect(s.bag[0].quantity).toBe(MAX_QTY);
  });

  it("keeps line order when changing size in place", () => {
    const a = line({ key: "velocity:crimson:9", productId: "velocity", colorwayId: "crimson" });
    const s = shopReducer(withBag(a, line()), { type: "changeSize", key: a.key, size: "11" });
    expect(s.bag.map((l) => l.key)).toEqual(["velocity:crimson:11", line().key]);
  });
});

describe("other actions", () => {
  it("puts a newly favourited product at the front", () => {
    let s = shopReducer(initialState, { type: "toggleFavorite", productId: "a" });
    s = shopReducer(s, { type: "toggleFavorite", productId: "b" });
    expect(s.favorites).toEqual(["b", "a"]);
  });

  it("removing an unknown key leaves the bag as it was", () => {
    expect(shopReducer(withBag(line()), { type: "remove", key: "missing" }).bag).toEqual([line()]);
  });

  it("clearBag keeps favourites and recent", () => {
    const s = shopReducer({ bag: [line()], favorites: ["velocity"], recent: ["air-runner"] }, { type: "clearBag" });
    expect(s).toEqual({ bag: [], favorites: ["velocity"], recent: ["air-runner"] });
  });

  it("replace swaps in the given state wholesale", () => {
    const next: ShopState = { bag: [line({ quantity: 4 })], favorites: ["velocity"], recent: [] };
    expect(shopReducer(withBag(line()), { type: "replace", state: next })).toBe(next);
  });
});

describe("reviveState edge cases", () => {
  it("recomputes the key from the line fields instead of trusting the saved key", () => {
    const s = reviveState({ bag: [{ key: "tampered", productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 1 }] }, known);
    expect(s.bag[0].key).toBe("air-runner:black-ember:9");
  });

  it("clamps oversized quantities and floors fractional ones", () => {
    const s = reviveState(
      {
        bag: [
          { productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 500 },
          { productId: "velocity", colorwayId: "crimson", size: "9", quantity: 2.7 },
        ],
      },
      known,
    );
    expect(s.bag.map((l) => l.quantity)).toEqual([MAX_QTY, 2]);
  });

  it.each([
    ["a string", "3"],
    ["Infinity", Infinity],
    ["NaN", NaN],
    ["zero", 0],
    ["null", null],
  ])("drops a line whose quantity is %s", (_n, quantity) => {
    const s = reviveState({ bag: [{ productId: "air-runner", colorwayId: "black-ember", size: "9", quantity }] }, known);
    expect(s.bag).toEqual([]);
  });

  it("drops null and non-object entries inside the bag", () => {
    const s = reviveState({ bag: [null, 5, "x", { productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 1 }] }, known);
    expect(s.bag).toHaveLength(1);
  });

  it("ignores non-array bag, favourites and recent", () => {
    expect(reviveState({ bag: "x", favorites: 1, recent: {} }, known)).toEqual(initialState);
  });

  it("caps recently viewed at the maximum", () => {
    const recent = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"];
    expect(reviveState({ recent }, known).recent).toEqual(recent.slice(0, MAX_RECENT));
  });

  it("drops a line whose quantity is a fraction below one rather than keeping a zero-quantity line", () => {
    const s = reviveState({ bag: [{ productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 0.5 }] }, known);
    expect(s.bag.every((l) => l.quantity > 0)).toBe(true);
  });

  it("merges duplicate saved lines into one, summing and capping quantity", () => {
    const dup = { productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 4 };
    expect(reviveState({ bag: [dup, dup] }, known).bag).toEqual([{ key: "air-runner:black-ember:9", ...dup, quantity: 8 }]);
    expect(reviveState({ bag: [dup, dup, dup] }, known).bag[0].quantity).toBe(MAX_QTY);
  });

  it("caps the number of distinct saved lines", () => {
    const many = Array.from({ length: MAX_LINES + 20 }, (_, i) => ({ productId: "air-runner", colorwayId: "black-ember", size: `s${i}`, quantity: 1 }));
    expect(reviveState({ bag: many }, known).bag).toHaveLength(MAX_LINES);
  });

  it("drops lines the optional validator rejects", () => {
    const bag = [
      { productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 1 },
      { productId: "air-runner", colorwayId: "retired", size: "9", quantity: 1 },
    ];
    const s = reviveState({ bag }, known, (_p, c) => c !== "retired");
    expect(s.bag.map((l) => l.colorwayId)).toEqual(["black-ember"]);
  });

  it("strips unexpected extra fields from saved lines", () => {
    const s = reviveState({ bag: [{ productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 1, evil: "x", extra: { a: 1 } }] }, known);
    expect(Object.keys(s.bag[0]).sort()).toEqual(["colorwayId", "key", "productId", "quantity", "size"]);
  });

  // DEFECT: recently viewed is not de-duplicated on revive although the reducer guarantees uniqueness.
  it("de-duplicates saved recently viewed ids", () => {
    const s = reviveState({ recent: ["velocity", "velocity"] }, known);
    expect(s.recent).toEqual(["velocity"]);
  });
});
