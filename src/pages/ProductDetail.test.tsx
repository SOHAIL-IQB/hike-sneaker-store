import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gaParams, renderApp, setupUiEnv, teardownUiEnv } from "@/test/renderApp";

vi.mock("lenis", () => ({ default: class { raf() {} stop() {} start() {} scrollTo() {} destroy() {} } }));

let env: ReturnType<typeof setupUiEnv>;
beforeEach(() => {
  env = setupUiEnv();
});
afterEach(teardownUiEnv);

/** Colourway swaps run through AnimatePresence, which settles on a microtask. */
const clickAsync = (el: Element) => act(async () => void fireEvent.click(el));
const addButtons = () => screen.getAllByRole("button", { name: "Add to bag" });
const clickAdd = () => fireEvent.click(addButtons()[0]);
const size = (s: string) => screen.getByRole("radio", { name: new RegExp(`^US ${s}(,|$)`) });
const events = (name: string) => gaParams(env.gtag, name);
const savedBag = () => JSON.parse(window.localStorage.getItem("hike:shop:v2") ?? "{}").bag;

describe("ProductDetail", () => {
  it("shows the product and fires a single view_product event", () => {
    renderApp("/products/velocity");
    expect(screen.getByRole("heading", { level: 1, name: "Velocity" })).toBeInTheDocument();
    expect(events("view_product")).toEqual([{ item_id: "velocity", item_name: "Hike Velocity", price: 140 }]);
    expect(document.title).toContain("Hike Velocity");
  });

  it("renders the not-found page for an unknown product id", () => {
    renderApp("/products/does-not-exist");
    expect(screen.queryByRole("button", { name: "Add to bag" })).not.toBeInTheDocument();
  });

  describe("size is required", () => {
    it("shows an alert and adds nothing when no size is chosen", () => {
      renderApp("/products/velocity");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      clickAdd();
      expect(screen.getByRole("alert")).toHaveTextContent("Pick a size to add this pair to your bag.");
      expect(savedBag()).toEqual([]);
      expect(events("add_to_cart")).toHaveLength(0);
      expect(screen.getByTestId("bag-open")).toHaveTextContent("false");
    });

    it("scrolls the size grid into view when validation fails", () => {
      renderApp("/products/velocity");
      clickAdd();
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it("also validates from the mobile sticky bar button", () => {
      renderApp("/products/velocity");
      fireEvent.click(addButtons()[1]);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("clears the error once a size is picked", () => {
      renderApp("/products/velocity");
      clickAdd();
      fireEvent.click(size("9"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("marks the chosen size as pressed and shows it in the sticky bar", () => {
      renderApp("/products/velocity");
      expect(screen.getByText("No size selected")).toBeInTheDocument();
      fireEvent.click(size("9"));
      expect(size("9")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByText("Size 9")).toBeInTheDocument();
    });
  });

  describe("sold-out sizes", () => {
    it("disables sizes sold out in the selected colourway", () => {
      renderApp("/products/velocity");
      expect(screen.getByRole("radio", { name: "US 8, sold out" })).toBeDisabled();
      expect(screen.getByRole("radio", { name: "US 8.5, sold out" })).toBeDisabled();
      expect(size("9")).toBeEnabled();
    });

    it("enables those sizes in a colourway that still has stock", () => {
      renderApp("/products/velocity?color=volt");
      expect(size("8")).toBeEnabled();
    });

    it("clears a selected size when switching to a colourway where it is sold out", async () => {
      renderApp("/products/velocity?color=volt");
      fireEvent.click(size("8"));
      expect(size("8")).toHaveAttribute("aria-checked", "true");
      await clickAsync(screen.getAllByRole("button", { name: "Crimson / Black" })[0]);
      expect(screen.getByRole("radio", { name: "US 8, sold out" })).toHaveAttribute("aria-checked", "false");
      expect(screen.getByText("No size selected")).toBeInTheDocument();
    });

    it("keeps a selected size when it is in stock in the new colourway", async () => {
      renderApp("/products/velocity");
      fireEvent.click(size("9"));
      await clickAsync(screen.getAllByRole("button", { name: "Volt / Black" })[0]);
      expect(size("9")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("add to bag", () => {
    it("adds the pair, fires add_to_cart with the exact params and opens the bag", () => {
      renderApp("/products/velocity");
      fireEvent.click(size("9"));
      clickAdd();

      expect(savedBag()).toEqual([{ key: "velocity:crimson:9", productId: "velocity", colorwayId: "crimson", size: "9", quantity: 1 }]);
      expect(events("add_to_cart")).toEqual([{ item_id: "velocity", item_name: "Hike Velocity", price: 140, size: "9" }]);
      expect(screen.getByTestId("bag-open")).toHaveTextContent("true");
    });

    it("shows the just-added confirmation in the bag drawer", () => {
      renderApp("/products/velocity");
      fireEvent.click(size("10"));
      clickAdd();
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByRole("status")).toHaveTextContent("Hike Velocity added — size 10");
      expect(within(dialog).getByText("Subtotal")).toBeInTheDocument();
    });

    it("uses the colourway from the URL", () => {
      renderApp("/products/velocity?color=volt");
      fireEvent.click(size("9"));
      clickAdd();
      expect(savedBag()[0]).toMatchObject({ colorwayId: "volt", key: "velocity:volt:9" });
    });

    it("uses the colourway picked on the page", async () => {
      renderApp("/products/velocity");
      await clickAsync(screen.getAllByRole("button", { name: "Volt / Black" })[0]);
      fireEvent.click(size("9"));
      clickAdd();
      expect(savedBag()[0].colorwayId).toBe("volt");
    });

    it("falls back to the first colourway for an unknown ?color value", () => {
      renderApp("/products/velocity?color=nonsense");
      fireEvent.click(size("9"));
      clickAdd();
      expect(savedBag()[0].colorwayId).toBe("crimson");
    });

    it("works from the mobile sticky bar button too", () => {
      renderApp("/products/velocity");
      fireEvent.click(size("9"));
      fireEvent.click(addButtons()[1]);
      expect(events("add_to_cart")).toHaveLength(1);
      expect(savedBag()).toHaveLength(1);
    });

    it("merges repeated adds of the same pair into one line with a higher quantity", () => {
      renderApp("/products/velocity");
      fireEvent.click(size("9"));
      const [add] = addButtons();
      fireEvent.click(add);
      fireEvent.click(add); // the open drawer hides the page from queries, so reuse the element
      expect(savedBag()).toHaveLength(1);
      expect(savedBag()[0].quantity).toBe(2);
      expect(events("add_to_cart")).toHaveLength(2);
    });

    it("keeps the chosen size selected after adding so another pair can be added", () => {
      renderApp("/products/velocity");
      const nine = size("9");
      fireEvent.click(nine);
      clickAdd();
      expect(nine).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("favourites", () => {
    it("toggles favourite state from the buy box", async () => {
      renderApp("/products/velocity");
      const [btn] = screen.getAllByRole("button", { name: "Add Hike Velocity to favourites" });
      await clickAsync(btn);
      expect(JSON.parse(window.localStorage.getItem("hike:shop:v2")!).favorites).toEqual(["velocity"]);
      expect(screen.getAllByRole("button", { name: "Remove Hike Velocity from favourites" }).length).toBeGreaterThan(0);
    });
  });

  it("records the product as recently viewed", () => {
    renderApp("/products/velocity");
    expect(JSON.parse(window.localStorage.getItem("hike:shop:v2")!).recent).toEqual(["velocity"]);
  });
});
