import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gaParams, renderApp, savedState, seedBag, setupUiEnv, teardownUiEnv } from "@/test/renderApp";

vi.mock("lenis", () => ({ default: class { raf() {} stop() {} start() {} scrollTo() {} destroy() {} } }));

let env: ReturnType<typeof setupUiEnv>;
beforeEach(() => {
  env = setupUiEnv();
});
afterEach(() => {
  vi.useRealTimers();
  teardownUiEnv();
});

const VELOCITY = { productId: "velocity", colorwayId: "crimson", size: "9", quantity: 1 }; // $140
const FASTBREAK = { productId: "fastbreak-low", colorwayId: "mint", size: "7", quantity: 1 }; // $92

const VALID = {
  Email: "sam@example.com",
  "First name": "Sam",
  "Last name": "Rivera",
  "Street address": "12 Market Street",
  "Town / city": "Leeds",
  Postcode: "LS1 4AB",
};

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const fillDelivery = (over: Partial<typeof VALID> = {}) => {
  for (const [label, value] of Object.entries({ ...VALID, ...over })) type(label, value);
};
const submit = () => act(async () => void fireEvent.click(screen.getByRole("button", { name: /^(Continue to|Place order)/ })));
const gotoReview = async () => {
  fillDelivery();
  await submit(); // delivery -> payment
  await submit(); // payment -> review
};
const purchases = () => gaParams(env.gtag, "purchase");

describe("Checkout: empty bag", () => {
  it("explains the bag is empty and links back to the shop", () => {
    renderApp("/checkout");
    expect(screen.getByText(/nothing to check out yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop sneakers" })).toHaveAttribute("href", "/products");
    expect(screen.queryByRole("button", { name: /Continue/ })).not.toBeInTheDocument();
  });
});

describe("Checkout: delivery validation", () => {
  beforeEach(() => seedBag(env.storage, [VELOCITY]));

  it("shows every required-field message when submitted empty and stays on the delivery step", async () => {
    renderApp("/checkout");
    await submit();
    expect(screen.getByText("Enter an email like name@example.com.")).toBeInTheDocument();
    expect(screen.getByText("Enter your first name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your last name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a street address.")).toBeInTheDocument();
    expect(screen.getByText("Enter a town or city.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid postcode.")).toBeInTheDocument();
    expect(screen.getByText("Where should we send it?")).toBeInTheDocument();
    expect(screen.queryByText("How would you like to pay?")).not.toBeInTheDocument();
  });

  it("moves focus to the first invalid field", async () => {
    renderApp("/checkout");
    await submit();
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });

  it("focuses the first field that is invalid, not always the email", async () => {
    renderApp("/checkout");
    fillDelivery({ "Last name": "" });
    await submit();
    expect(screen.getByLabelText("Last name")).toHaveFocus();
    expect(screen.getByText("Enter your last name.")).toBeInTheDocument();
    expect(screen.queryByText("Enter your first name.")).not.toBeInTheDocument();
  });

  it("marks invalid fields with aria-invalid and links the message with aria-describedby", async () => {
    renderApp("/checkout");
    await submit();
    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-describedby", "f-email-err");
    expect(document.getElementById("f-email-err")).toHaveTextContent("Enter an email like name@example.com.");
  });

  it("clears a field's message as soon as the user edits it, leaving others in place", async () => {
    renderApp("/checkout");
    await submit();
    type("Email", "s");
    expect(screen.queryByText("Enter an email like name@example.com.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("Enter your first name.")).toBeInTheDocument();
  });

  it.each(["name", "name@", "name@example", "@example.com", "na me@example.com", "name@exa mple.com"])(
    "rejects the email %j",
    async (email) => {
      renderApp("/checkout");
      fillDelivery({ Email: email });
      await submit();
      expect(screen.getByText("Enter an email like name@example.com.")).toBeInTheDocument();
    },
  );

  it.each(["", "  ", "ab", "!!!", "SW1A 1AA!!", "12345678901"])("rejects the postcode %j", async (postcode) => {
    renderApp("/checkout");
    fillDelivery({ Postcode: postcode });
    await submit();
    expect(screen.getByText("Enter a valid postcode.")).toBeInTheDocument();
  });

  it.each(["LS1", "10001", "SW1A 1AA", "K1A-0B1", "1234567890"])("accepts the postcode %j", async (postcode) => {
    renderApp("/checkout");
    fillDelivery({ Postcode: postcode });
    await submit();
    expect(screen.queryByText("Enter a valid postcode.")).not.toBeInTheDocument();
    expect(screen.getByText("How would you like to pay?")).toBeInTheDocument();
  });

  it("rejects whitespace-only names and a street address shorter than four characters", async () => {
    renderApp("/checkout");
    fillDelivery({ "First name": "   ", "Last name": "\t", "Street address": "abc", "Town / city": " " });
    await submit();
    expect(screen.getByText("Enter your first name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your last name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a street address.")).toBeInTheDocument();
    expect(screen.getByText("Enter a town or city.")).toBeInTheDocument();
  });

  it("accepts a four-character street address", async () => {
    renderApp("/checkout");
    fillDelivery({ "Street address": "1 Ab" });
    await submit();
    expect(screen.getByText("How would you like to pay?")).toBeInTheDocument();
  });

  it("does not track anything or touch the bag while validation fails", async () => {
    renderApp("/checkout");
    await submit();
    expect(purchases()).toHaveLength(0);
    expect(savedState()!.bag).toHaveLength(1);
  });
});

describe("Checkout: steps", () => {
  beforeEach(() => seedBag(env.storage, [VELOCITY]));

  it("labels the continue button for each step", async () => {
    renderApp("/checkout");
    expect(screen.getByRole("button", { name: "Continue to payment" })).toBeInTheDocument();
    fillDelivery();
    await submit();
    expect(screen.getByRole("button", { name: "Continue to review" })).toBeInTheDocument();
    await submit();
    expect(screen.getByRole("button", { name: "Place order · $140" })).toBeInTheDocument();
  });

  it("disables later steps in the progress list until they are reached", async () => {
    renderApp("/checkout");
    const steps = within(screen.getByRole("list", { name: "Checkout steps" }));
    expect(steps.getByRole("button", { name: /Delivery/ })).toBeEnabled();
    expect(steps.getByRole("button", { name: /Payment/ })).toBeDisabled();
    expect(steps.getByRole("button", { name: /Review/ })).toBeDisabled();
    fillDelivery();
    await submit();
    expect(steps.getByRole("button", { name: /Payment/ })).toBeEnabled();
    expect(steps.getByRole("button", { name: /Review/ })).toBeDisabled();
  });

  it("goes back with the Back button and keeps what was typed", async () => {
    renderApp("/checkout");
    fillDelivery();
    await submit();
    await act(async () => void fireEvent.click(screen.getByRole("button", { name: "Back" })));
    expect(screen.getByLabelText("Email")).toHaveValue("sam@example.com");
    expect(screen.getByLabelText("Postcode")).toHaveValue("LS1 4AB");
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("defaults to card payment and lets the shopper pick another method", async () => {
    renderApp("/checkout");
    fillDelivery();
    await submit();
    expect(screen.getByRole("radio", { name: /Card/ })).toBeChecked();
    await act(async () => void fireEvent.click(screen.getByRole("radio", { name: /Pay on delivery/ })));
    expect(screen.getByRole("radio", { name: /Pay on delivery/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Card/ })).not.toBeChecked();
  });

  it("shows the default payment method on the review step", async () => {
    renderApp("/checkout");
    await gotoReview();
    expect(screen.getByText(/Card \(demo\)/)).toBeInTheDocument();
  });

  // SUSPECTED DEFECT: after choosing a non-default method, the step content never swaps to Review.
  // The step switch is AnimatePresence mode="wait" and the selected-radio dot is a motion element with
  // a layoutId inside the exiting subtree; in jsdom the exit never completes (minimal repro: a layoutId
  // element toggled inside a mode="wait" child). Not confirmed in a real browser - verify manually.
  it("advances to the review step after choosing a non-default payment method", async () => {
    renderApp("/checkout");
    fillDelivery();
    await submit();
    await act(async () => void fireEvent.click(screen.getByRole("radio", { name: /Pay on delivery/ })));
    await submit();
    expect(await screen.findByText(/Pay on delivery \(demo\)/, {}, { timeout: 1500 })).toBeInTheDocument();
  });

  it("shows the entered address and email on the review step", async () => {
    renderApp("/checkout");
    await gotoReview();
    const review = screen.getByText("Check everything looks right").parentElement!;
    expect(within(review).getByText(/Sam Rivera/)).toBeInTheDocument();
    expect(within(review).getByText(/12 Market Street/)).toBeInTheDocument();
    expect(within(review).getByText(/Leeds LS1 4AB, United States/)).toBeInTheDocument();
    expect(within(review).getByText(/sam@example.com/)).toBeInTheDocument();
  });

  it("summarises the bag alongside the form", () => {
    renderApp("/checkout");
    const aside = within(screen.getByRole("heading", { name: "In your bag" }).parentElement!);
    expect(aside.getByText("Hike Velocity")).toBeInTheDocument();
    expect(aside.getByText("Crimson / Black · 9")).toBeInTheDocument();
    expect(aside.getByRole("link", { name: "Edit bag" })).toHaveAttribute("href", "/cart");
  });
});

describe("Checkout: placing the order", () => {
  const place = async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    await act(async () => void fireEvent.click(screen.getByRole("button", { name: /^Place order/ })));
  };
  const finish = () => act(async () => void vi.advanceTimersByTime(900));

  it("shows a pending state and does not complete until the simulated delay passes", async () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/checkout");
    await gotoReview();
    await place();
    expect(screen.getByRole("button", { name: /Placing order/ })).toBeDisabled();
    expect(purchases()).toHaveLength(0);
    expect(savedState()!.bag).toHaveLength(1);
    await act(async () => void vi.advanceTimersByTime(899));
    expect(screen.queryByText("Order placed")).not.toBeInTheDocument();
  });

  it("fires purchase once with transaction id, value, shipping and exact items, then clears the bag", async () => {
    seedBag(env.storage, [{ ...VELOCITY, quantity: 2 }, FASTBREAK]);
    renderApp("/checkout");
    await gotoReview();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"], now: 1_700_000_000_000 });
    await act(async () => void fireEvent.click(screen.getByRole("button", { name: /^Place order/ })));
    await finish();

    expect(purchases()).toEqual([
      {
        transaction_id: "TXN-1700000000900",
        value: 372,
        shipping: 0,
        items: [
          { item_id: "velocity", item_name: "Hike Velocity", price: 140, quantity: 2 },
          { item_id: "fastbreak-low", item_name: "Hike Fastbreak Low", price: 92, quantity: 1 },
        ],
      },
    ]);
    expect(savedState()!.bag).toEqual([]);
  });

  it("reports the flat delivery fee in the purchase event for a small order", async () => {
    seedBag(env.storage, [FASTBREAK]);
    renderApp("/checkout");
    await gotoReview();
    await place();
    await finish();
    expect(purchases()[0]).toMatchObject({ value: 92, shipping: 8 });
  });

  it("shows a confirmation with the order id, email, lines and total including delivery", async () => {
    seedBag(env.storage, [FASTBREAK]);
    renderApp("/checkout");
    await gotoReview();
    await place();
    await finish();

    expect(screen.getByRole("heading", { name: "Order placed" })).toBeInTheDocument();
    const id = (purchases()[0] as { transaction_id: string }).transaction_id;
    expect(id).toMatch(/^TXN-\d+$/);
    expect(screen.getByText(id)).toBeInTheDocument();
    expect(screen.getByText(/no email goes to sam@example.com/)).toBeInTheDocument();
    expect(screen.getByText("Hike Fastbreak Low")).toBeInTheDocument();
    expect(screen.getByText("Size 7 · Qty 1")).toBeInTheDocument();
    expect(screen.getByText("Total $100")).toBeInTheDocument(); // $92 + $8
    expect(screen.getByRole("link", { name: "Keep shopping" })).toHaveAttribute("href", "/products");
  });

  it("empties the bag so a return to /checkout would find it empty", async () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/checkout");
    await gotoReview();
    await place();
    await finish();
    expect(savedState()!.bag).toEqual([]);
  });

  it("ignores a second click while the order is being placed so only one purchase is tracked", async () => {
    seedBag(env.storage, [VELOCITY]);
    renderApp("/checkout");
    await gotoReview();
    await place();
    const pending = screen.getByRole("button", { name: /Placing order/ });
    fireEvent.click(pending);
    fireEvent.click(pending);
    await finish();
    expect(purchases()).toHaveLength(1);
  });
});
