import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_QTY } from "@/store/reducer";
import { gaParams, renderApp, savedState, seedBag, setupUiEnv, teardownUiEnv } from "@/test/renderApp";

vi.mock("lenis", () => ({ default: class { raf() {} stop() {} start() {} scrollTo() {} destroy() {} } }));

let env: ReturnType<typeof setupUiEnv>;
beforeEach(() => {
  env = setupUiEnv();
});
afterEach(teardownUiEnv);

const VELOCITY = { productId: "velocity", colorwayId: "crimson", size: "9", quantity: 1 }; // $140
const FASTBREAK = { productId: "fastbreak-low", colorwayId: "mint", size: "7", quantity: 1 }; // $92

const click = (el: Element) => act(async () => void fireEvent.click(el));
const lineFor = (name: string) => screen.getAllByRole("listitem").find((li) => within(li).queryByRole("link", { name }))!;
const stepperIn = (li: HTMLElement) => within(li).getByRole("group", { name: /^Quantity for/ });
const summary = () => screen.getByRole("heading", { name: "Summary" }).parentElement!;

describe("Cart: empty", () => {
  it("shows an empty message with a link to the shop and a zero count", () => {
    renderApp("/cart");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Bag\s*0/);
    expect(screen.getByText(/nothing in your bag yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop sneakers" })).toHaveAttribute("href", "/products");
    expect(screen.queryByRole("button", { name: "Checkout" })).not.toBeInTheDocument();
  });
});

describe("Cart: lines and totals", () => {
  it("lists each line with name, colourway, size and line total", () => {
    seedBag(env.storage, [{ ...VELOCITY, quantity: 2 }]);
    renderApp("/cart");
    const li = lineFor("Hike Velocity");
    expect(within(li).getByText("Crimson / Black")).toBeInTheDocument();
    expect(within(li).getByRole("combobox")).toHaveValue("9");
    expect(within(li).getByText("$280")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Bag\s*2/);
  });

  it("charges the delivery fee below $100 and shows the free-delivery hint", () => {
    seedBag(env.storage, [FASTBREAK]);
    renderApp("/cart");
    const s = within(summary());
    expect(s.getAllByText("$92").length).toBeGreaterThan(0);
    expect(s.getByText("$8")).toBeInTheDocument();
    expect(s.getByText("$100")).toBeInTheDocument();
    expect(s.getByText(/Free delivery from \$100/)).toBeInTheDocument();
  });

  it("shows free delivery from $100 and no fee", () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/cart");
    const s = within(summary());
    expect(s.getByText("Free")).toBeInTheDocument();
    expect(s.queryByText(/Free delivery from/)).not.toBeInTheDocument();
    expect(s.getAllByText("$140")).toHaveLength(2); // subtotal and total
  });

  it("suggests only products that are not already in the bag", () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/cart");
    const rail = screen.getByRole("region", { name: "Complete the rotation" });
    expect(within(rail).queryByText("Hike Velocity")).not.toBeInTheDocument();
    expect(within(rail).getByText("Hike Air Runner")).toBeInTheDocument();
  });
});

describe("Cart: quantity stepper", () => {
  it("increases the quantity and updates line total, subtotal and persisted state", async () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/cart");
    const li = lineFor("Hike Velocity");
    await click(within(stepperIn(li)).getByRole("button", { name: "Increase quantity" }));
    expect(within(stepperIn(li)).getByText("2")).toBeInTheDocument();
    expect(within(li).getByText("$280")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Bag\s*2/);
    expect(savedState()!.bag[0].quantity).toBe(2);
  });

  it("decreases the quantity", async () => {
    seedBag(env.storage, [{ ...VELOCITY, quantity: 3 }]);
    renderApp("/cart");
    const li = lineFor("Hike Velocity");
    await click(within(stepperIn(li)).getByRole("button", { name: "Decrease quantity" }));
    expect(within(stepperIn(li)).getByText("2")).toBeInTheDocument();
    expect(within(li).getByText("$280")).toBeInTheDocument();
  });

  it("keeps the minus button labelled 'Decrease quantity' and removes the line at quantity one", async () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/cart");
    const li = lineFor("Hike Velocity");
    expect(within(stepperIn(li)).getByRole("button", { name: "Decrease quantity" })).toBeInTheDocument();
    expect(within(stepperIn(li)).queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();
    await click(within(stepperIn(li)).getByRole("button", { name: "Decrease quantity" }));
    expect(savedState()!.bag).toEqual([]);
    expect(screen.getByText(/nothing in your bag yet/i)).toBeInTheDocument();
  });

  it("disables the plus button at the maximum quantity", () => {
    seedBag(env.storage, [{ ...VELOCITY, quantity: MAX_QTY }]);
    renderApp("/cart");
    expect(within(stepperIn(lineFor("Hike Velocity"))).getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });

  it("clamps to the maximum when a saved quantity is too high", () => {
    seedBag(env.storage, [{ ...VELOCITY, quantity: 500 }]);
    renderApp("/cart");
    expect(within(stepperIn(lineFor("Hike Velocity"))).getByText(String(MAX_QTY))).toBeInTheDocument();
  });

  it("changes only the line whose stepper was used", async () => {
    seedBag(env.storage, [VELOCITY, FASTBREAK]);
    renderApp("/cart");
    await click(within(stepperIn(lineFor("Hike Velocity"))).getByRole("button", { name: "Increase quantity" }));
    expect(within(stepperIn(lineFor("Hike Fastbreak Low"))).getByText("1")).toBeInTheDocument();
    expect(savedState()!.bag.map((l) => l.quantity)).toEqual([2, 1]);
  });

  it("moving above $100 flips delivery from the fee to free", async () => {
    seedBag(env.storage, [FASTBREAK]);
    renderApp("/cart");
    expect(within(summary()).getByText("$8")).toBeInTheDocument();
    await click(within(stepperIn(lineFor("Hike Fastbreak Low"))).getByRole("button", { name: "Increase quantity" }));
    expect(within(summary()).getByText("Free")).toBeInTheDocument();
  });
});

describe("Cart: remove and size", () => {
  it("removes a line with the Remove button and keeps the others", async () => {
    seedBag(env.storage, [VELOCITY, FASTBREAK]);
    renderApp("/cart");
    await click(within(lineFor("Hike Velocity")).getByRole("button", { name: /^Remove Hike Velocity, size/ }));
    expect(savedState()!.bag.map((l) => l.productId)).toEqual(["fastbreak-low"]);
  });

  it("changes the size of a line", async () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/cart");
    const select = within(lineFor("Hike Velocity")).getByRole("combobox");
    await act(async () => void fireEvent.change(select, { target: { value: "10" } }));
    expect(savedState()!.bag[0]).toMatchObject({ key: "velocity:crimson:10", size: "10" });
  });

  it("merges into an existing line when the new size is already in the bag", async () => {
    seedBag(env.storage, [VELOCITY, { ...VELOCITY, size: "10", quantity: 2 }]);
    renderApp("/cart");
    const nineSelect = screen.getAllByRole("combobox").find((c) => (c as HTMLSelectElement).value === "9")!;
    await act(async () => void fireEvent.change(nineSelect, { target: { value: "10" } }));
    expect(savedState()!.bag).toHaveLength(1);
    expect(savedState()!.bag[0]).toMatchObject({ size: "10", quantity: 3 });
  });

  it("disables sizes that are sold out in the line's colourway", () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/cart");
    const select = within(lineFor("Hike Velocity")).getByRole("combobox");
    expect(within(select).getByRole("option", { name: "Size 8 — sold out" })).toBeDisabled();
    expect(within(select).getByRole("option", { name: "Size 9" })).toBeEnabled();
  });
});

describe("Cart: checkout", () => {
  it("fires begin_checkout with the subtotal and exact items, then goes to /checkout", async () => {
    seedBag(env.storage, [{ ...VELOCITY, quantity: 2 }, FASTBREAK]);
    renderApp("/cart");
    await click(within(summary()).getByRole("button", { name: "Checkout" }));
    expect(gaParams(env.gtag, "begin_checkout")).toEqual([
      {
        value: 372,
        items: [
          { item_id: "velocity", item_name: "Hike Velocity", price: 140, quantity: 2 },
          { item_id: "fastbreak-low", item_name: "Hike Fastbreak Low", price: 92, quantity: 1 },
        ],
      },
    ]);
    expect(screen.getByTestId("pathname")).toHaveTextContent("/checkout");
  });
});
