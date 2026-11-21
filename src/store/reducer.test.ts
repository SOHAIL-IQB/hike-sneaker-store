import { describe, expect, it } from "vitest";
import { initialState, lineKey, MAX_QTY, MAX_RECENT, reviveState, shopReducer, type ShopState } from "./reducer";

const add = (s: ShopState, productId = "air-runner", colorwayId = "black-ember", size = "9", quantity?: number) =>
  shopReducer(s, { type: "add", productId, colorwayId, size, quantity });

describe("bag", () => {
  it("adds a new line", () => {
    const s = add(initialState);
    expect(s.bag).toEqual([
      { key: "air-runner:black-ember:9", productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 1 },
    ]);
  });

  it("merges the same product, colourway and size into one line", () => {
    const s = add(add(initialState), "air-runner", "black-ember", "9", 2);
    expect(s.bag).toHaveLength(1);
    expect(s.bag[0].quantity).toBe(3);
  });

  it("keeps different sizes and colourways as separate lines", () => {
    let s = add(initialState, "air-runner", "black-ember", "9");
    s = add(s, "air-runner", "black-ember", "10");
    s = add(s, "air-runner", "cloud-grey", "9");
    expect(s.bag.map((l) => l.key)).toEqual([
      "air-runner:black-ember:9",
      "air-runner:black-ember:10",
      "air-runner:cloud-grey:9",
    ]);
  });

  it("caps quantity", () => {
    const s = add(initialState, "air-runner", "black-ember", "9", 50);
    expect(s.bag[0].quantity).toBe(MAX_QTY);
  });

  it("removes a line when quantity drops to zero", () => {
    const s = add(initialState);
    const next = shopReducer(s, { type: "setQuantity", key: s.bag[0].key, quantity: 0 });
    expect(next.bag).toEqual([]);
  });

  it("changes size, merging into an existing line of that size", () => {
    let s = add(initialState, "air-runner", "black-ember", "9", 1);
    s = add(s, "air-runner", "black-ember", "10", 2);
    s = shopReducer(s, { type: "changeSize", key: lineKey("air-runner", "black-ember", "9"), size: "10" });
    expect(s.bag).toEqual([
      { key: "air-runner:black-ember:10", productId: "air-runner", colorwayId: "black-ember", size: "10", quantity: 3 },
    ]);
  });

  it("changes size in place when no line has that size yet", () => {
    let s = add(initialState, "air-runner", "black-ember", "9");
    s = shopReducer(s, { type: "changeSize", key: s.bag[0].key, size: "11" });
    expect(s.bag[0]).toMatchObject({ key: "air-runner:black-ember:11", size: "11", quantity: 1 });
  });

  it("removes and clears", () => {
    let s = add(add(initialState), "velocity", "crimson", "9");
    s = shopReducer(s, { type: "remove", key: "air-runner:black-ember:9" });
    expect(s.bag.map((l) => l.productId)).toEqual(["velocity"]);
    expect(shopReducer(s, { type: "clearBag" }).bag).toEqual([]);
  });
});

describe("favourites and recently viewed", () => {
  it("toggles a favourite on and off", () => {
    const on = shopReducer(initialState, { type: "toggleFavorite", productId: "velocity" });
    expect(on.favorites).toEqual(["velocity"]);
    expect(shopReducer(on, { type: "toggleFavorite", productId: "velocity" }).favorites).toEqual([]);
  });

  it("keeps recently viewed unique, newest first and bounded", () => {
    let s = initialState;
    for (let i = 0; i < MAX_RECENT + 3; i++) s = shopReducer(s, { type: "viewed", productId: `p${i}` });
    s = shopReducer(s, { type: "viewed", productId: "p5" });
    expect(s.recent[0]).toBe("p5");
    expect(s.recent).toHaveLength(MAX_RECENT);
    expect(new Set(s.recent).size).toBe(MAX_RECENT);
  });
});

describe("reviveState", () => {
  const known = new Set(["air-runner", "velocity"]);

  it("returns a fresh state for junk", () => {
    expect(reviveState(null, known)).toEqual(initialState);
    expect(reviveState("nope", known)).toEqual(initialState);
  });

  it("drops unknown products and malformed lines", () => {
    const s = reviveState(
      {
        bag: [
          { productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 2 },
          { productId: "deleted-shoe", colorwayId: "x", size: "9", quantity: 1 },
          { productId: "velocity", colorwayId: "crimson", size: "9", quantity: -1 },
          { productId: "velocity" },
        ],
        favorites: ["velocity", "deleted-shoe", 42],
        recent: ["air-runner"],
      },
      known,
    );
    expect(s.bag).toEqual([
      { key: "air-runner:black-ember:9", productId: "air-runner", colorwayId: "black-ember", size: "9", quantity: 2 },
    ]);
    expect(s.favorites).toEqual(["velocity"]);
    expect(s.recent).toEqual(["air-runner"]);
  });
});
